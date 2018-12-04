'use strict';
/* global BaseGameController */

var Card = function(rank,suit,flipped,dealt,hover) {
    this.rank = rank;
    this.suit = suit;
    this.flipped = flipped;
    this.dealt = dealt;
    this.hover = hover;
};
var Stack = function() {

    // Create an empty array of cards.

    this.cards = [];

    this.deal      = function() {
        if (this.cards.length > 0) {
            return this.cards.shift();
        }
        else { return null; }
    };
    this.draw      = function(n) {
        var card;

        if (n >= 0 && n < this.cards.length) {
            card = this.cards[n];
            this.cards.splice(n, 1);
        }
        else { card = null; }

        return card;
    };
    this.addCard   = function(card) {
        this.cards.push(card);
    };

    this.combine   = function(stack) {
        this.cards = this.cards.concat(stack.cards);
        stack.cards = [];
    };
    this.cardCount = function() {
        return this.cards.length;
    };
    this.winLoseTie = null;
    this.rank = null;
};

var GameController = function($rootScope, $scope, $filter, LowLagSounds, $cookies, $location, BCPlayer, VisibilityFactory, Game) {
    var gameController = this;
    gameController.gameName = 'oasis';
    gameController.Game = Game;
    $scope.timer = 2000;
    $scope.gameTime = 2000;

    $scope.playerWinLoseTie = false;
    $scope.holds = [];
    $scope.drawable = false;


    // this.isExceedMaxWager = function(wager){
    //     var isExceedPlayerBalance = GameController.super_.prototype.isExceedMaxWager.call(this, wager);
    //     var isExceedGameMaxWagerLimit = wager > 1000000? true : false;
    //     var exceedMaxWager = isExceedPlayerBalance || isExceedGameMaxWagerLimit;
    //     $scope.maxBetErr = exceedMaxWager;
    //     return exceedMaxWager;
    // };

    this.getNewGameParams = function(){
        var gameParams = GameController.super_.prototype.getNewGameParams.call(this);
        return gameParams;
    };

    this.newGame_OnSuccess = function(response){
        $scope.currentGame = response;
        $scope.dealCards(response);
        GameController.super_.prototype.newGame_OnSuccess.call(gameController, response);
    };

    this.autospin = function(){
        setTimeout(function(){
            GameController.super_.prototype.autospin.call(gameController);
        }, 4000);
    };

    this.processWin = function(callback){
        var self = this;
        var $scope = this.$scope;
        this.$scope.lastResult = this.$scope.lastResultTmp;
        this.$scope.lastResultTmp = {};
        var multiplier = this.getResultMultiplier();
        if (multiplier < 1) {
            $scope.resultMultiplier = null;
            $scope.resultProfit = null;
            if(callback){
                callback();
            }
        } else {
            $scope.resultMultiplier = multiplier;
            $scope.resultProfit = self.getResultProfit();
            $scope.animateMessage();
            if (!$scope.lastResult.is_push) {
                this.playWinSounds(multiplier);
            }
            if(callback){
                callback();
            }
        }
    };

    GameController.super_.apply(this, arguments);

    gameController.finishGameDelay = 2000;

    $scope.play = function() {
        $scope.gOptions = false;
        $scope.playerWinLoseTie = false;
        $scope.playercards = null;
        $scope.holds = [true, true, true, true, true];
        $scope.drawable = false;
        gameController.startGame(Game);
    };

    $scope.flipCard = function(index) {
        if ($scope.drawable) {
            $scope.holds[index] = !$scope.holds[index];
        }
    };

    $scope.animateDeal = function(animateCardCount) {
        animateCardCount = animateCardCount||0;
        $scope.dealingCard = true;

        var playerHand = Array.prototype.slice.call(document.querySelectorAll('#player-cards .livecard'));
        var dealerHand = Array.prototype.slice.call(document.querySelectorAll('#dealer-cards .livecard'));
        var elem = playerHand.concat(dealerHand);

        if(animateCardCount === elem.length) {
            $scope.$apply(function(){
                $scope.holds = [true, true, true, true, true];
                $scope.dealingCard = false;
                if($scope.lastResultTmp.status !== 'finished' && $scope.autospin){
                    setTimeout(function(){
                        $scope.nextAction('raise');
                    }, $scope.timer);
                }
                if($scope.lastResultTmp.status === 'finished'){
                    gameController.finishGame(true);
                }
            });
            return;
        }

        if ($(elem[animateCardCount]).hasClass('dealt')) {
            var hover = $(elem[animateCardCount]).children('.hover');
            if (hover.length === 1) {
                setTimeout(function() {
                    hover.removeClass('hover');
                    animateCardCount++;
                    $scope.$apply(function () {
                        $scope.animateCardCount = animateCardCount;
                    });
                    $scope.animateDeal(animateCardCount);
                }, 220);
            } else {
                animateCardCount++;
                $scope.animateCardCount = animateCardCount;
                $scope.animateDeal(animateCardCount);
            }
        } else {
            $(elem[animateCardCount]).animate({
                top:'0px',left:'0px',opacity:1
            }, 220, function() {
                $scope.playSound('dealCard');
                elem[animateCardCount].setAttribute('dealt',true);
                animateCardCount++;
                $scope.$apply(function () {
                    $scope.animateCardCount = animateCardCount;
                });
                $scope.animateDeal(animateCardCount);
            });
        }
    };
    $scope.dealCards = function(data) {
        var i;
        $scope.playercards = new Stack();
        $scope.playercards.rank = data.player_hand.rnk;
        $scope.playercards.subRank = data.player_hand.sub_rnk;
        $scope.animateCardCount = 0;

        if(data.status === 'began'){
            for(i=0;i<5;i++) {
                $scope.playercards.addCard(new Card(data.player_hand.initCards[i].rank, data.player_hand.initCards[i].suit, ""));
            }

            $scope.dealercards = new Stack();
            for(i=0;i<1;i++) {
                $scope.dealercards.addCard(new Card(data.dealer_hand.initCards[i].rank, data.dealer_hand.initCards[i].suit, "", false, false));
            }
            for(i=0;i<4;i++) {
                $scope.dealercards.addCard(new Card("", "", "flipped", false, true));
            }
            $scope.drawable = true;
        }else if(data.status === 'drawn'){
            for(i=0;i<5;i++) {
                $scope.playercards.addCard(new Card(data.player_hand.finalCards[i].rank, data.player_hand.finalCards[i].suit, "", true));
            }
            $scope.drawable = false;
        }else{
            $scope.drawable = false;
            $scope.dealercards = new Stack();
            $scope.dealercards.rank = data.dealer_hand.rnk;
            $scope.dealercards.subRank = data.dealer_hand.sub_rnk;
            $scope.dealercards.isQualified = data.dealer_hand.qualified;
            for(i=0;i<5;i++){
                $scope.dealercards.addCard(new Card(data.dealer_hand.initCards[i].rank, data.dealer_hand.initCards[i].suit, "", true, i !== 0));
            }
            for(i=0;i<5;i++) {
                $scope.playercards.addCard(new Card(data.player_hand.finalCards[i].rank, data.player_hand.finalCards[i].suit, "", true));
            }
        }

        $scope.dealingCard = true;
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.animateDeal($scope.animateCardCount);
            });
        },100);
    };

    $scope.nextAction = function(action){
        $scope.raiseError = null;
        $scope.dealingCard = true;
        var game = angular.extend($scope.currentGame,{action: action, holds: JSON.stringify($scope.holds)});

        Game.nextAction(game, function(data) {
            $scope.lastResultTmp = data;
            if(data.code === 400){
                $scope.raiseError = true;
                return;
            }
            // if(data.code){
            //     return;
            // }
            $scope.dealCards(data);
            if (data.status === 'finished')
            {
                if (data.is_win) {
                    $scope.playerWinLoseTie = 3;
                } else if (data.is_push) {
                    $scope.playerWinLoseTie = 1;
                } else {
                    if (data.is_fold) {
                        $scope.playerWinLoseTie = -1;
                    }
                    else {
                        $scope.playerWinLoseTie = 0;
                    }
                }
            }
        },
        function() {
            $scope.clearError();
            $scope.serverErr = true;

            if(!$scope.gameRetry){
                $scope.gameRetry = true;
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.nextAction();
                    });
                }, 2000);
            }
        });
    };
};

angular.inherits(GameController, BaseGameController);
Application.Controllers.controller('GameController', ['$rootScope', '$scope', '$filter', 'LowLagSounds', '$cookies', '$location', 'BCPlayer', 'VisibilityFactory', 'Game', GameController]);
