'use strict';

var modella = require('modella');
var validators = require('modella-validators');
var filter = require('modella-filter');
var provable = require('provably-fair-npm');
var HTTPError = require('httperror-npm');
var async = require('async');

module.exports = function(modelStore, GameLogic, PlayerInterface, logger) {

    var Game = modella('hilo')
            .attr('_id')
            .attr('server_seed', {required: true, format: /[a-f0-9]{32}/}) // server_seed is always 16 bytes of hex
            .attr('seed_hash', {required: true, format: /[a-f0-9]+/}) // seed_hash is a hex encoded sha256
            .attr('init_time', {required: true, type: 'number'}) // init_time is the unix timestamp of the game init
            .attr('final_array')
            .attr('status')
            .attr('next_action')
            .attr('player_id')
            .attr('player_alias')
            .attr('payout_multiplier')
            .attr('result')
            .attr('dealer_stack')
            .attr('player_stack')
            .attr('wager', {type: 'number'})
            .attr('client_seed')
            .attr('winnings', {type: 'number'})
            .attr('current_payout', {type: 'number'})
            .attr('ip', {format: /([0-9]{1,3}\.){3}[0-9]{1,3}/, filtered: true})
            .attr('lock')
            .attr('startedAt') // startedAt is the Date object of when the first game action was taken
            .attr('createdAt'); // createdAt is the Date object of when the game was actually played

    Game.use(validators);
    Game.use(modelStore);
    Game.use(filter);

    /**
     * play
     *
     * The play function takes a client seed and a wager, along with
     * any other game params the user must specify
     *
     * The client seed is used to make a second shuffle after the
     * server seed has been used
     *
     * The player interface is used to debit and credit the user's
     * account based on the wager and resulting payout
     */

    Game.prototype.play = function(params, cb) {
        // don't let a game be played twice!
        if (this.has('client_seed')) {
            logger.warn('someone tried to play a game twice! - %s', this.player_id());
            return cb(new HTTPError(400, "this game has already been played"));
        }
        var self = this;
        // get params from object
        var client_seed = params.client_seed.toString();
        var wager = 0;
        var bet = params.bet;
        var player_id = params.player_id;
        var ip = params.ip;
        // check stuff
        if (isNaN(wager)) return cb(new HTTPError(400, "Invalid wager"));

        // debit the player for the wager they made, even if it was 0
        // (the player server will allow this, and it is used to track
        // "free games" if they are allowed)
        // in this case, wager 0 just to signofy the start of the game and get
        // the needed player data
        var debitPlayer = function(done) {
            PlayerInterface.debit(player_id, 0, {
                type: "hilo:wager",
                refId: "wager:" + self.primary() + ':init',
            }, function(err, player) {
                if (err) return done(new HTTPError(500, "error debiting the player: " + err.message));
                return done(undefined, player);
            });
        };
        var playGame = function(player, done) {

            var mixseed = client_seed + self.server_seed();
            var cards = GameLogic.getShuffledCards(mixseed);
            var finalArray = cards.slice();
            var result;
            try{
                result = GameLogic.getResult(cards, bet, wager);
            }catch(e){
                return done(e);
            }

            var winnings = 0;
            var status = 'began';

            logger.debug('##### playing game %s for %s (%s) #####', self.primary(), player.alias, player_id);
            logger.debug('result');

            logger.debug('wager %d winnings %d player profit %d',
                         wager.toBitcoin(),
                         winnings.toBitcoin(),
                         (winnings - wager).toBitcoin());
            // assign the new values to the self
            self.set({
                player_id: player._id,
                player_alias: player.alias,
                wager: wager,
                client_seed: client_seed,
                winnings: winnings,
                status: status,
                final_array: finalArray,
                dealer_stack: result.remainingCards,
                player_stack: result.previousCards,
                payout_multiplier: 0,
                result: result,
                ip: ip,
                lock: false,
                startedAt: new Date(),
                createdAt: status === "finished" ? new Date() : undefined,
            });
            logger.debug('##### done playing game %s for %s (%s) #####', self.primary(), player.alias, player_id);
            // save the game data
            self.save(function(err) {
                if (err) return done(new HTTPError(500, "error saving game data after spin!: " + err.message));
                return done(undefined, self);
            });
        };
        var waterfall = [playGame];
        // ignore debit for testing/simulation
        if (PlayerInterface !== null) {
            waterfall.unshift(debitPlayer.bind(this));
        } else {
            waterfall.unshift(function(done) {
                done(undefined, {alias: "simulation", _id: "simulation"});
            });
        }
        async.waterfall(waterfall, function(err) {
            if (err) return cb(err);
            return cb(undefined, self);
        });
    };

    Game.prototype.nextAction = function(params, cb) {
        var self = this;
        var bet = params.bet;
        var wager = parseInt(params.wager,10);
        var remainingCards = self.dealer_stack();
        var previousCards = self.player_stack();
        var result = self.result();
        var payout = 0;
        var status;
        var gameOdds;

        //if player wants to finish the game and get the payout so far
        if(bet[0] === 'finish'){
            status = 'finished';
            // payout = self.winnings();
        }else{
            try{
                result = GameLogic.getResult(remainingCards, bet, wager, previousCards);
                gameOdds = result.payoutGameOdds[bet[0]];
            }catch(e){
                return cb(e);
            }
            remainingCards = result.remainingCards;
            previousCards = result.previousCards;
            payout = result.payout;
            logger.debug('##### current payout %s total payouts %s #####', payout, payout + self.winnings());
            status = result.finished?'finished':'gaming';
        }
        var doNextAction = function(){
            var done = arguments[arguments.length - 1];

            self.set({
                winnings: payout + self.winnings(),
                status: status,
                dealer_stack: remainingCards,
                player_stack: previousCards,
                result: result,
                lock: false,
                createdAt: new Date()
            });
            // add to the wager only if we are finishing
            if (bet[0] !== "finish") self.wager(self.wager() + wager);
            self.save(function(err){
                if (err) return done(new HTTPError(500, "error saving game data after spin!: " + err.message));
                self.set({
                    current_payout: payout
                });
                // if(self.status() !== 'finished'){
                //     return done(undefined, self);
                // }
                // credit the user their winnings, if any
                if (self.current_payout() > 0 && PlayerInterface !== null) {
                    logger.debug('##### winning %s #####', self.current_payout());
                    PlayerInterface.credit(self.player_id(), self.current_payout(), {
                        type: "hilo:winnings",
                        refId: "winnings:" + self.primary() + ':stage_' + self.player_stack().length
                    }, function(err) {
                        if (err) return done(new HTTPError(500, "error crediting player!: " + err.message));
                        return done(undefined, self);
                    });
                }else{
                    return done(undefined, self);
                }
            });
        };
        var debitPlayer = function(done) {
            logger.debug('stage_'+self.player_stack().length);
            logger.debug('##### next wager %s total wager %s #####', wager, self.wager() + wager);

            PlayerInterface.debit(self.player_id(), wager, {
                type: "hilo:wager",
                refId: "wager:" + self.primary() + ':stage_' + self.player_stack().length,
                meta: {
                    houseEdge: 0.0165,
                    currentGameOdds: gameOdds
                }
            }, function(err, player) {
                console.log(wager, err);
                if (err) return done(new HTTPError(500, "error debiting the player: " + err.message));
                return done(undefined, player);
            });
        };
        var waterfall = [doNextAction];
        if(bet[0] !== 'finish'){
            waterfall.unshift(debitPlayer);
        }
        async.waterfall(waterfall, function(err){
            if(err) return cb(err);
            return cb(undefined, self);
        });
    };

    /**
     * init
     *
     * the init function is used to generate a new game for the player
     * to play
     *
     * The provably fair library is used to generate the server's
     * seed, and hash it to be presented to the player
     *
     * In using this template, there maye be additional data that has
     * to be set up for your game, be sure to include the extra data
     * in any hash you send back to the player (see the circle-node
     * project as an example)
     *
     * In this case we simply generate a server seed to flip a coin
     */
    Game.init = function(cb) {
        logger.debug('Game.init');

        var server_seed = provable.getRandomSeed();
        var createTime = new Date().getTime();

        var newGame = new Game({
            server_seed: server_seed,
            // hash using the provable library's hashing function
            seed_hash: provable.sha256sum(server_seed),
            init_time: createTime,
            lock: false
        });
        newGame.save(function(err) {
            if (err) {
                return cb(new HTTPError(500, err.message || err));
            }
            // only return a hash of the server seed and any other init info
            cb(undefined, {
                nextGameId: newGame.primary(),
                sha256: newGame.seed_hash()
            });
        });
    };

    Game.checkLock = function(gameId, cb) {
        Game.find(gameId, function(err, gameData) {
            if (err) return cb(new HTTPError(500, err.message));
            if (!gameData) return cb(new HTTPError(404, 'game not found'));
            if (gameData.lock()) return cb(new HTTPError(423, 'game is already in progress'));
            if (gameData.status() === 'finished') return cb(new HTTPError(423, 'game has already been played'));
            gameData.lock(true);
            gameData.save(function(err) {
                if (err) return cb(new HTTPError(500, err.message));
                cb(undefined, gameData);
            });
        });
    };

    return Game;
};
