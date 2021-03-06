'use strict';
/* global BaseGameController */

var Card = function(rank,suit,flipped, lose,currentGame,warCard) {
    this.rank = rank;
    this.suit = suit;
    this.flipped = flipped;
    this.lose = lose;
    this.invisible = true;
    this.currentGame = currentGame;
    this.warCard = warCard;

    this.names = function() {
      var rank, suit;

      switch (this.rank) {
        case "A" :
          rank = "Ace";
          break;
        case "2" :
          rank = "Two";
          break;
        case "3" :
          rank = "Three";
          break;
        case "4" :
          rank = "Four";
          break;
        case "5" :
          rank = "Five";
          break;
        case "6" :
          rank = "Six";
          break;
        case "7" :
          rank = "Seven";
          break;
        case "8" :
          rank = "Eight";
          break;
        case "9" :
          rank = "Nine";
          break;
        case "T" :
          rank = "Ten";
          break;
        case "J" :
          rank = "Jack";
          break;
        case "Q" :
          rank = "Queen";
          break;
        case "K" :
          rank = "King";
          break;
        default :
          rank = null;
          break;
      }

      switch (this.suit) {
        case "C" :
          suit = "Clubs";
          break;
        case "D" :
          suit = "Diamonds";
          break;
        case "H" :
          suit = "Hearts";
          break;
        case "S" :
          suit = "Spades";
          break;
        default :
          suit = null;
          break;
      }

      if (rank === null || suit === null) {
          return {rank:"error",suit:"error", flipped:"flipped", lose:"", currentGame:currentGame,warCard:warCard};
        }
        return {rank:rank, suit:suit, flipped:flipped, lose:lose, invisible: true,currentGame:currentGame,warCard:warCard};
    };
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
    gameController.gameName = '3card';
    gameController.Game = Game;
    $scope.timer = 2000;
    $scope.gameTime = 2000;

    $scope.playerWinLoseTie = false;

    this.isExceedMaxWager = function() {
        if ($scope.totalbet !== 0 && $scope.totalbet > gameController.getBalance()) {
            $scope.maxBetErr = true;
            return true;
        }
        return false;
    };

    this.getNewGameParams = function(){
        var gameParams = GameController.super_.prototype.getNewGameParams.call(this);
        //this needs to get the multiple bets, once the game board has been setup

        var betsWager = {};
        for(var i in $scope.bets) {
            betsWager[i] = $scope.bets[i] * gameController.getWager();
        }

        gameParams.bets = JSON.stringify(betsWager);
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
        gameController.startGame(Game);
    };

    $scope.animateDeal = function(animateCardCount) {
        animateCardCount = animateCardCount||0;
        $scope.dealingCard = true;
        var playerHand = Array.prototype.slice.call(document.querySelectorAll('#player-cards .livecard'));
        var dealerHand = Array.prototype.slice.call(document.querySelectorAll('#dealer-cards .livecard'));
        var elem = playerHand.concat(dealerHand);

        $(elem[animateCardCount]).animate({
           top:'0px',left:'0px',opacity:1
        }, 200, function() {
            $scope.playSound('dealCard');
            elem[animateCardCount].setAttribute('dealt',true);
            animateCardCount++;
            $scope.$apply(function () {
                $scope.animateCardCount = animateCardCount;
            });
            if(animateCardCount < elem.length) {
                $scope.animateDeal(animateCardCount);
            }
            if(animateCardCount === elem.length) {
                $scope.$apply(function(){
                    $scope.dealingCard = false;
                    if($scope.lastResultTmp.status !== 'finished' && $scope.autospin){
                        setTimeout(function(){
                            $scope.nextAction(1);
                        }, $scope.timer);
                    }
                    if($scope.lastResultTmp.status === 'finished'){
                        gameController.finishGame(true);
                    }
                });
            }
        });
    };
    $scope.dealCards = function(data) {
        $scope.animateCardCount = 0;
        var i;
        var dcount = 1;
        for(var d in data.dealer_stack) {
            if(data.dealer_stack.hasOwnProperty(d)) {

                var dcard = new Card(data.dealer_stack[d].rank, data.dealer_stack[d].suit, "", "","livecard");
                $scope.dealercards.addCard(dcard);

                dcount++;
            }
        }
        if(data.status !== 'finished'){
            $scope.playercards = new Stack();
            $scope.dealercards = new Stack();
            if(!$scope.bets.ante) {  //skip raise & fold buttons
                $scope.nextAction(2);
                return;
            }
            $scope.playercards.rank = data.player_hand.rnk;
            $scope.playercards.subRank = data.player_hand.sub_rnk;
            for(i=0;i<3;i++) {
                $scope.dealercards.addCard(new Card("", "", "flipped", "", "livecard"));
                $scope.playercards.addCard(new Card(data.player_hand.initCards[i].rank, data.player_hand.initCards[i].suit, "", "","livecard"));
            }
        }else{
            $scope.dealercards = new Stack();
            if($scope.bets.ante) {
                $scope.animateCardCount = 3;  //skip player cards
            } else {
                $scope.playercards = new Stack();
                for(i=0;i<3;i++){
                    $scope.playercards.addCard(new Card(data.player_hand.initCards[i].rank, data.player_hand.initCards[i].suit, "", "","livecard"));
                }
            }
            $scope.dealercards.rank = data.dealer_hand.rnk;
            $scope.dealercards.subRank = data.dealer_hand.sub_rnk;
            $scope.playercards.rank = data.player_hand.rnk;
            $scope.playercards.subRank = data.player_hand.sub_rnk;
            $scope.dealercards.isQualified = data.dealer_hand.qualified;
            for(i=0;i<3;i++){
                $scope.dealercards.addCard(new Card(data.dealer_hand.initCards[i].rank, data.dealer_hand.initCards[i].suit, "", "","livecard"));
                //$scope.playercards.addCard(new Card(data.player_hand.initCards[i].rank, data.player_hand.initCards[i].suit, "", "","livecard"));
            }

            if (data.is_win) {
                $scope.playerWinLoseTie = 3;
            } else if (data.is_push) {
                $scope.playerWinLoseTie = 1;
            } else if (data.is_win === false && data.is_push === false) {
                if (data.is_fold) {
                    $scope.playerWinLoseTie = -1;
                }
                else if (data.is_fold === false){
                    $scope.playerWinLoseTie = 0;
                }
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
        var game = angular.extend($scope.currentGame,{action: action});

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
        },
        function() {
            $scope.clearError();
            $scope.serverErr = true;

            if(!$scope.gameRetry){
                $scope.gameRetry = true;
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.nextAction(action);
                    });
                }, 2000);
            }
        });
    };

    $scope.bets = {};

    $scope.$watch('btcWager', function() {
        if(!$scope.player) { return; }
        if($scope.getTotalBet() > gameController.getBalance()) {
            var numtokens = 0;
            for(var i in $scope.bets) {
                if($scope.bets.hasOwnProperty(i)) {
                    numtokens += $scope.bets[i];
                }
            }
            var newvalue = Math.floor(gameController.getBalance() / numtokens);
            $scope.btcWager = newvalue;
        }
        $scope.calculateTotalBet();
    });

    $scope.$watch('bets', function(){
        $scope.calculateTotalBet();
    }, true);

    $scope.getTotalBet = function() {
        var totalbet = 0;
        for(var i in $scope.bets) {
            if($scope.bets.hasOwnProperty(i)) {
                totalbet += $scope.btcWager * $scope.bets[i];
            }
        }
        return totalbet;
    };
    $scope.clearBets = function() {
        if(gameController.isGameInProgress()) { return false; }
        $scope.bets = {};
        $scope.calculateTotalBet();
        var elem = document.querySelectorAll( '.chips' );
        for(var x=0;x< elem.length;x++) {
            elem[x].style.display="none"; //chips element
            elem[x].innerHTML="0";
        }
    };
    $scope.calculateTotalBet = function() {
        $scope.totalbet = $scope.getTotalBet();
    };
};

angular.inherits(GameController, BaseGameController);
Application.Controllers.controller('GameController', ['$rootScope', '$scope', '$filter', 'LowLagSounds', '$cookies', '$location', 'BCPlayer', 'VisibilityFactory', 'Game', GameController]);
