'use strict';

//var HTTPError = require('httperror-npm');
var provable = require('provably-fair-npm');

module.exports = function() {
    var g_cards = {
        c2  : { rank: 2, suit: 'c'},
        c3  : { rank: 3, suit: 'c'},
        c4  : { rank: 4, suit: 'c'},
        c5  : { rank: 5, suit: 'c'},
        c6  : { rank: 6, suit: 'c'},
        c7  : { rank: 7, suit: 'c'},
        c8  : { rank: 8, suit: 'c'},
        c9  : { rank: 9, suit: 'c'},
        c10 : { rank: 10, suit: 'c'},
        c11 : { rank: 11, suit: 'c'},
        c12 : { rank: 12, suit: 'c'},
        c13 : { rank: 13, suit: 'c'},
        c14 : { rank: 14, suit: 'c'},
        d2  : { rank: 2, suit: 'd'},
        d3  : { rank: 3, suit: 'd'},
        d4  : { rank: 4, suit: 'd'},
        d5  : { rank: 5, suit: 'd'},
        d6  : { rank: 6, suit: 'd'},
        d7  : { rank: 7, suit: 'd'},
        d8  : { rank: 8, suit: 'd'},
        d9  : { rank: 9, suit: 'd'},
        d10 : { rank: 10, suit: 'd'},
        d11 : { rank: 11, suit: 'd'},
        d12 : { rank: 12, suit: 'd'},
        d13 : { rank: 13, suit: 'd'},
        d14 : { rank: 14, suit: 'd'},
        h2  : { rank: 2, suit: 'h'},
        h3  : { rank: 3, suit: 'h'},
        h4  : { rank: 4, suit: 'h'},
        h5  : { rank: 5, suit: 'h'},
        h6  : { rank: 6, suit: 'h'},
        h7  : { rank: 7, suit: 'h'},
        h8  : { rank: 8, suit: 'h'},
        h9  : { rank: 9, suit: 'h'},
        h10 : { rank: 10, suit: 'h'},
        h11 : { rank: 11, suit: 'h'},
        h12 : { rank: 12, suit: 'h'},
        h13 : { rank: 13, suit: 'h'},
        h14 : { rank: 14, suit: 'h'},
        s2  : { rank: 2, suit: 's'},
        s3  : { rank: 3, suit: 's'},
        s4  : { rank: 4, suit: 's'},
        s5  : { rank: 5, suit: 's'},
        s6  : { rank: 6, suit: 's'},
        s7  : { rank: 7, suit: 's'},
        s8  : { rank: 8, suit: 's'},
        s9  : { rank: 9, suit: 's'},
        s10 : { rank: 10, suit: 's'},
        s11 : { rank: 11, suit: 's'},
        s12 : { rank: 12, suit: 's'},
        s13 : { rank: 13, suit: 's'},
        s14 : { rank: 14, suit: 's'}
    };

    var g_rankOrder = {
        five_of_a_kind: {rank : 1},
        royal_flush: {rank : 2},
        straight_flush: {rank : 3},
        four_of_a_kind: {rank : 4},
        full_house: {rank : 5},
        flush: {rank : 6},
        straight: {rank : 7},
        three_of_a_kind: {rank : 8},
        two_pairs: {rank : 9},
        one_pair: {rank : 10},
        no_pair: {rank : 11}
    };

    /**
     * Jacks or Better Video Poker
     */
    var payout_multipliers = [
        0,
        0,
        1000,   //royal flush
        50,     //straight flush
        25,     //four of a kind
        6,      //full house
        5,      //flush
        4,      //straight
        3,      //three of a kind
        2,      //two pairs
        1,      //one pair jacks or higher
        0       //no pair
    ];
    /**
     * Sort card array by rank in asending order
     * @param cardArray
     * @returns {*}
     */
    this.sortCards = function(cardArray) {
        cardArray.sort(function(a, b) {
            return +/\d+/.exec(a)[0] - +/\d+/.exec(b)[0];
        });
        return cardArray;
    };

    this.getCardRankArray = function(cardArray) {
        var cardRankArray = [];
        for (var key in cardArray) {
            if(cardArray.hasOwnProperty(key)){
                cardRankArray[key] = g_cards[cardArray[key]].rank;
            }
        }
        return cardRankArray;
    };

    this.fiveOfAKind = function(retValue) {
        var first = 0;
        var limit = 0;
        var resOfFirst = 0;
        var restOfLimit = 0;
        retValue.pairs = [];

        if (retValue.sortCount.length === 2 && retValue.sortCount[0] < retValue.sortCount[1]) {
            first = retValue.sortCount[0] + 1;
            limit = retValue.sortCount[0] + 1 + retValue.sortCount[1];

            resOfFirst = 0;
            restOfLimit = retValue.sortCount[0];
        } else if (retValue.sortCount.length === 2 && retValue.sortCount[0] > retValue.sortCount[1]) {
            first = 0;
            limit = retValue.sortCount[0];
            resOfFirst = retValue.sortCount[0] + 1;
            restOfLimit = retValue.sortCount[0] + 1 + retValue.sortCount[1];
        } else if (retValue.sortCount.length === 1) {
            first = 0;
            limit = retValue.sortCount[0];
            resOfFirst = 0;
            restOfLimit = -1;
        }
        var key;
        for (key = first; key <= limit; ++key) {
            retValue.pairs.push(retValue.repeatArray[key]);
        }
        for (key = resOfFirst; key <= restOfLimit; ++key) {
            retValue.restOfArray.push(retValue.repeatArray[key]);
        }
        return retValue;
    };

    this.threeOfAKind = function(retValue) {
        var first = 0;
        var limit = 0;
        var resOfFirst = 0;
        var restOfLimit = 0;
        retValue.pairs = [];
        var next = 0;
        var nextLimit = 0; // alert('shiju');
        if (retValue.sortCount.length === 2 && retValue.sortCount[0] === retValue.sortCount[1]) {
            first = retValue.sortCount[0] + 1;
            limit = first + retValue.sortCount[1];
            next = 0;
            nextLimit = next + 1;
            resOfFirst = nextLimit + 1;
            restOfLimit = retValue.sortCount[0];
        }
        else if (retValue.sortCount.length === 2) {
            first = 0;
            limit = retValue.sortCount[0];
            next = limit + 1;
            nextLimit = next + retValue.sortCount[1];
            resOfFirst = 0;
            restOfLimit = -1;

        } else if (retValue.sortCount.length === 3) {
            if (retValue.sortCount[0] > retValue.sortCount[1]) {
                first = 0;
                limit = retValue.sortCount[0];
                next = limit + 1;
                nextLimit = next + retValue.sortCount[1];
                resOfFirst = nextLimit + 1;
                restOfLimit = resOfFirst + retValue.sortCount[2];
            } else if (retValue.sortCount[1] > retValue.sortCount[2]) {
                // 1, 0
                first = 0;
                limit = retValue.sortCount[0];
                next = limit + 1;
                nextLimit = next + retValue.sortCount[1];
                resOfFirst = nextLimit + 1;
                restOfLimit = resOfFirst + retValue.sortCount[2];
            } else {
                // 2,0
                first = 0;
                limit = retValue.sortCount[0];
                resOfFirst = limit + 1;
                restOfLimit = resOfFirst + retValue.sortCount[1];
                next = restOfLimit + 1;
                nextLimit = next + retValue.sortCount[2];
            }
        } else if (retValue.sortCount.length === 1) {
            first = 0;
            limit = retValue.sortCount[0];
            resOfFirst = 0;
            restOfLimit = -1;
            next = 0;
            nextLimit = -1;
        }
        var key;
        for (key = first; key <= limit; ++key) {
            retValue.pairs.push(retValue.repeatArray[key]);
        }
        for (key = next; key <= nextLimit; ++key) {
            retValue.pairs.push(retValue.repeatArray[key]);
        }
        for (key = resOfFirst; key <= restOfLimit; ++key) {
            retValue.restOfArray.push(retValue.repeatArray[key]);
        }
        return retValue;
    };

    this.onePairs = function(retValue) {
        var first = 0;
        var limit = 0;
        var resOfFirst = 0;
        var restOfLimit = 0;
        retValue.pairs = [];
        var next = 0;
        var nextLimit = 0;
        // alert(retValue.sortCount+'ss');
        if (retValue.sortCount.length === 2) {
            first = 0;
            limit = retValue.sortCount[0];
            next = limit + 1;
            nextLimit = next + retValue.sortCount[1];
            // nextLimit = -1;
            resOfFirst = 0;
            restOfLimit = -1;
            //  alert(retValue.sortCount);
        } else if (retValue.sortCount.length === 3) {
            resOfFirst = 0;
            restOfLimit = retValue.sortCount[0];
            first = restOfLimit + 1;
            limit = first + retValue.sortCount[1];

            next = limit + 1;
            nextLimit = next + retValue.sortCount[2];
        } else if (retValue.sortCount.length === 1) {
            first = 0;
            limit = retValue.sortCount[0];
            resOfFirst = 0;
            restOfLimit = -1;
            next = 0;
            nextLimit = -1;
        }
        var key;
        // alert(retValue.repeatArray);
        for (key = first; key <= limit; ++key) {
            retValue.pairs.push(retValue.repeatArray[key]);
        }
        for (key = next; key <= nextLimit; ++key) {
            retValue.pairs.push(retValue.repeatArray[key]);
        }
        for (key = resOfFirst; key <= restOfLimit; ++key) {
            retValue.restOfArray.push(retValue.repeatArray[key]);
        }
        return retValue;
    };

    this.rankForPair = function(retValue) {
        var maxRepeatCout = Math.max.apply(null, retValue.sortCount);
        if (maxRepeatCout === 4) {
            retValue = this.fiveOfAKind(retValue);
        } else if (maxRepeatCout === 3) {
            retValue = this.fiveOfAKind(retValue);
        } else if (maxRepeatCout === 2 && retValue.sortCount.length >= 2) {
            retValue = this.threeOfAKind(retValue);
        } else if (maxRepeatCout === 2 && retValue.sortCount.length === 1) {
            retValue = this.threeOfAKind(retValue);
        } else if (maxRepeatCout === 1 && retValue.sortCount.length >= 2) {
            retValue = this.onePairs(retValue);
        } else if (maxRepeatCout === 1) {
            retValue = this.onePairs(retValue);
        }
        return;
    };

    this.chekForStraightFlushSpecialCase = chekForStraightFlushSpecialCase;

    /**
     * Checks whether cardArray is straight or not
     * @param cardArray
     * @returns {boolean} | true means royal flush/straight flush/straight
     */
    var chekForStraight = function(cardArray) {
        var status = false;
        if (g_cards[cardArray[0]].rank + 1 === g_cards[cardArray[1]].rank && g_cards[cardArray[1]].rank + 1 === g_cards[cardArray[2]].rank && g_cards[cardArray[2]].rank + 1 === g_cards[cardArray[3]].rank) {
            status = true;
            if (cardArray.length === 5 && g_cards[cardArray[3]].rank + 1 !== g_cards[cardArray[4]].rank) {
                status = false;
            }
        }
        return status;
    };


    /**
     * Checks whether a straight is a straight flush or not
     * @param cardArray | a straight
     * @returns {*} | rank result
     */
    var chekForStraightFlushSpecialCase = function(cardArray) {
        var firstValue = g_cards[cardArray[0]].rank;
        var secValue = g_cards[cardArray[1]].rank;
        var thirdValue = g_cards[cardArray[2]].rank;
        var fourthValue = g_cards[cardArray[3]].rank;
        var fifthValue = g_cards[cardArray[4]].rank;

        if (fifthValue === 15) {
            cardArray.pop();
        }
        var flushStatus = checkForFlush(cardArray);
        var rank = (flushStatus === true) ? g_rankOrder.straight_flush.rank : g_rankOrder.straight.rank;
        if (fifthValue === 15) {
            cardArray[4] = 'jo15';
        }
        if (firstValue === 2 && secValue === 3 && thirdValue === 4 && fourthValue === 5 && (fifthValue === 14 || fifthValue === 15)) {
            return {
                status: true,
                rnk: rank,
                data: [firstValue, fourthValue, thirdValue, secValue, 14],
                actualArray: [cardArray[4], cardArray[0], cardArray[1], cardArray[2], cardArray[3]]
            };
        }

        if (fifthValue !== 15) {
            return {
                status: false,
                data: [],
                actualArray: []
            };
        }
        // alert(fourthValue+' ss '+fifthValue);
        if (firstValue !== 2 && firstValue !== 3) {
            return {
                status: false,
                data: [],
                actualArray: []
            };
        }
        if (firstValue === 3 && secValue === 4 && thirdValue === 5 && fourthValue === 14) {
            return {
                status: true,
                rnk: rank,
                data: [2, thirdValue, secValue, firstValue, fourthValue],
                actualArray: [cardArray[3], cardArray[4], cardArray[0], cardArray[1], cardArray[2]]
            };
        }
        if (firstValue === 2 && secValue === 3 && thirdValue === 4 && fourthValue === 14) {
            return {
                status: true,
                rnk: rank,
                data: [firstValue, 5, thirdValue, secValue, fourthValue],
                actualArray: [cardArray[3], cardArray[0], cardArray[1], cardArray[2], cardArray[4]]
            };
        }
        if (firstValue === 2 && secValue === 4 && thirdValue === 5 && fourthValue === 14) {
            return {
                status: true,
                rnk: rank,
                data: [firstValue, thirdValue, secValue, 3, fourthValue],
                actualArray: [cardArray[3], cardArray[0], cardArray[4], cardArray[1], cardArray[2]]
            };
        }
        if (firstValue === 2 && secValue === 3 && thirdValue === 5 && fourthValue === 14) {
            return {
                status: true,
                rnk: rank,
                data: [firstValue, thirdValue, 4, secValue, fourthValue],
                actualArray: [cardArray[3], cardArray[0], cardArray[1], cardArray[4], cardArray[2]]
            };
        }
        return {
            status: false,
            data: [],
            actualArray: []
        };
    };

    var chekForStraightIfJokerPresent = function(cardArray) {
        var status = true;
        var nextVal = '';
        var misFlag = false;
        var key;
        for (key in cardArray) {
            if(cardArray.hasOwnProperty(key)){
                if (cardArray.length === parseInt(key) + 1) {
                    break;
                }
                nextVal = g_cards[cardArray[parseInt(key) + 1]].rank;
                if (g_cards[cardArray[key]].rank + 1 !== nextVal && g_cards[cardArray[key]].rank + 2 !== nextVal) {
                    status = false;
                    break;
                } else if (!misFlag && g_cards[cardArray[key]].rank + 1 !== nextVal && g_cards[cardArray[key]].rank + 2 === nextVal) {
                    misFlag = true;
                } else if (misFlag && g_cards[cardArray[key]].rank + 1 !== nextVal && g_cards[cardArray[key]].rank + 2 === nextVal) {
                    status = false;
                    break;
                }
            }
        }
        return status;
    };

    /**
     * Checks whether cardArray is a flush or not
     * @param cardArray
     * @returns {boolean} | true means a flush
     */
    var checkForFlush = function(cardArray) {
        var status = false;
        if (g_cards[cardArray[0]].suit === g_cards[cardArray[1]].suit && g_cards[cardArray[1]].suit === g_cards[cardArray[2]].suit && g_cards[cardArray[2]].suit === g_cards[cardArray[3]].suit && g_cards[cardArray[3]].suit === g_cards[cardArray[cardArray.length - 1]].suit) {
            status = true;
        }
        return status;
    };

    /**
     * Checks for pair rank(three of a kind, one pair)
     * @param cardArray
     * @param cardArrayOriginal
     * @returns {Array}
     */
    var checkForPair = function(cardArray, cardArrayOriginal) {
        var sortArrayValue = [];
        var sortCount = [];
        var rank = [];
        rank.actualArray = [];
        var count = 0;
        var equalFlag = false;
        var restOfArray = [];
        var actualPairArray = [];
        var actualNonPairArray = [];
        for (var key in cardArray) {
            if (cardArray.length === parseInt(key) + 1 && equalFlag === true && count) {
                sortCount.push(count);
                sortArrayValue.push(cardArray[parseInt(key)]);
                actualPairArray.push(cardArrayOriginal[key]);
            } else if (cardArray[key] === cardArray[parseInt(key) + 1] && cardArray.length !== parseInt(key) + 1) {
                ++count;
                actualPairArray.push(cardArrayOriginal[key]);
                equalFlag = true;
            } else if (equalFlag === true) {
                sortCount.push(count);
                sortArrayValue.push(cardArray[parseInt(key)]);
                actualPairArray.push(cardArrayOriginal[key]);
                equalFlag = false;
                count = 0;
            } else {
                restOfArray.push(cardArray[key]);
                actualNonPairArray.push(cardArrayOriginal[key]);
            }
        }

        rank = rankForPair(sortCount, sortArrayValue, actualPairArray);
        cardArray = '';
        actualNonPairArray = sortArray(actualNonPairArray);
        for (var nonPairLength = actualNonPairArray.length - 1; nonPairLength >= 0; --nonPairLength) {
            rank.actualArray.push(actualNonPairArray[nonPairLength]);
        }

        actualNonPairArray = [];
        rank.restofData = restOfArray;
        actualPairArray = [];
        return rank;
    };


    /**
     * Checks and returns pair rank (three of a kind/one pair/no pair)
     * @param sortCount
     * @param sortArray
     * @param actualPairArray
     * @returns {{rnk: number, data: *, actualArray: *}}
     */
    var rankForPair = function(sortCount, sortArray, actualPairArray) {
        var maxRepeatCout = Math.max.apply(null, sortCount);
        var rank = 0;
        if (sortCount.length === 0) {
            rank = g_rankOrder.no_pair.rank;
        } else if (maxRepeatCout === 4) {
            rank = g_rankOrder.five_of_a_kind.rank;
        } else if (maxRepeatCout === 3) {
            rank = g_rankOrder.four_of_a_kind.rank;
        } else if (maxRepeatCout === 2 && sortCount.length === 2) {
            if (sortCount[0] < sortCount[1]) {
                sortArray[0] = sortArray[0] + sortArray[1];
                sortArray[1] = sortArray[0] - sortArray[1];
                sortArray[0] = sortArray[0] - sortArray[1];
                actualPairArray = actualPairArray.reverse();
            }
            // alert(sortArray);
            rank = g_rankOrder.full_house.rank;
        } else if (maxRepeatCout === 2 && sortCount.length === 1) {
            rank = g_rankOrder.three_of_a_kind.rank;
        } else if (maxRepeatCout === 1 && sortCount.length === 2) {
            rank = g_rankOrder.two_pairs.rank;
            // alert(sortArray);
            actualPairArray = reverseSortArray(actualPairArray);
            // alert(sortArray);
        } else if (maxRepeatCout === 1) {
            rank = g_rankOrder.one_pair.rank;
        }
        return {
            rnk: rank,
            data: sortArray,
            actualArray: actualPairArray
        };
    };

    var checkForJoker = function(cardArray) {
        var status = false;
        // alert(cardArray);
        if (g_cards[cardArray[cardArray.length - 1]].rank === 15) {
            status = true;
        }
        return status;
    };

    var checkForJokerReplacementValue = function(cardArray) {
        var misFlag = false;
        var jokerReArrangeValue = 0;
        var reArrangeKey = 0;
        for (var key in cardArray) {
            if (jokerReArrangeValue && cardArray.length === parseInt(key) + 1) {
                break;
            } else if (cardArray.length === parseInt(key) + 1) {
                if (g_cards[cardArray[key]].rank === '14') {
                    jokerReArrangeValue = g_cards[cardArray[0]].rank - 1;
                    reArrangeKey = -1;
                } else {
                    jokerReArrangeValue = g_cards[cardArray[key]].rank + 1;
                    reArrangeKey = parseInt(key);
                    // misFlag = true;
                }
                break;
            } else if (cardArray.length !== parseInt(key) + 1 && g_cards[cardArray[key]].rank + 1 === g_cards[cardArray[parseInt(key) + 1]].rank) {
                continue;
            } else if (g_cards[cardArray[key]].rank + 2 === g_cards[cardArray[parseInt(key) + 1]].rank && !misFlag) {
                misFlag = true;
                jokerReArrangeValue = g_cards[cardArray[key]].rank + 1;
                reArrangeKey = parseInt(key);
            } else if (g_cards[cardArray[key]].rank + 2 === g_cards[cardArray[parseInt(key) + 1]].rank && misFlag) {
                // misFlag = true;
                jokerReArrangeValue = 0;
                reArrangeKey = 0;
                break;
            }

        }
        return {
            value: jokerReArrangeValue,
            key: reArrangeKey
        };
    };


    var checkForJokerReplacementFlushValue = function(cardArray) {
        var previousSuit = g_cards[cardArray[0]].suit;
        var jokerReArrangeValue = '';
        var reArrangeKey = 0;
        var rankArray = [];
        rankArray.push(g_cards[cardArray[3]].rank);
        rankArray.push(g_cards[cardArray[2]].rank);
        rankArray.push(g_cards[cardArray[1]].rank);
        rankArray.push(g_cards[cardArray[0]].rank);
        for (var key in rankArray) {
            if (rankArray.length === parseInt(key) + 1) {
                jokerReArrangeValue = rankArray[key] - 1;
                reArrangeKey = parseInt(key);
                break;
            } else if (rankArray[key] !== 14) {
                jokerReArrangeValue = 14;
                reArrangeKey = parseInt(key);
                break;
            } else if (rankArray[key] === rankArray[parseInt(key) + 1] + 1) {
                continue;
            } else {
                jokerReArrangeValue = rankArray[key] - 1;
                reArrangeKey = parseInt(key) + 1;
                break;
            }
        }
        rankArray = '';
        return {
            value: g_cards[previousSuit + jokerReArrangeValue].rank,
            key: reArrangeKey
        };
    };

    var getCardRankArray = function(cardArray) {
        var cardRankArray = [];
        for (var key in cardArray) {
            if(cardArray.hasOwnProperty(key)){
                cardRankArray[key] = g_cards[cardArray[key]].rank;
            }
        }
        return cardRankArray;
    };

    /**
     * Checks whether the cards are Royal/Straight flush
     * If the sum of cards are 39, then it is a royal flush
     * @param cardArray | a straight
     * @returns {{rnk: number, data: Array, restofData: Array, actualArray: *}}
     */
    var getRoyalStraightFlushRank = function(isJokerPresent, cardArray) {
        var rank = 0;
        var jokerReArrangeValue = '';
        var cardRankArray = [];
        cardRankArray = getCardRankArray(cardArray);
        if (isJokerPresent) {
            jokerReArrangeValue = checkForJokerReplacementValue(cardArray);
            // cardArrayCopy[4] = jokerReArrangeValue;
            cardRankArray[4] = jokerReArrangeValue.value;
            cardRankArray = sortArray(cardRankArray);
            cardArray = replaceJoker(cardArray, jokerReArrangeValue.key);
        }
        var totalSum = cardRankArray[0] + cardRankArray[1] + cardRankArray[2] + cardRankArray[3] + cardRankArray[4];
        rank = totalSum === 60 ? g_rankOrder.royal_flush.rank : g_rankOrder.straight_flush.rank;
        return {
            rnk: rank,
            data: cardRankArray,
            restofData: [],
            actualArray: cardArray.reverse()
        };
    };

    /**
     * Returns a flush card rank
     * @param cardArray
     * @returns {{rnk: number, data: Array, restofData: Array, actualArray: *}}
     */
    var getFlushRank = function(isJokerPresent, cardArray) {
        var jokerReArrangeValue = '';
        var rank = 0;
        var cardRankArray = [];
        cardRankArray = getCardRankArray(cardArray);
        if (isJokerPresent) {
            jokerReArrangeValue = checkForJokerReplacementFlushValue(cardArray);
            cardRankArray[4] = jokerReArrangeValue.value;
            cardRankArray = sortArray(cardRankArray);
            cardArray = replaceJokerForFlush(cardArray, jokerReArrangeValue.key);
        }
        rank = g_rankOrder.flush.rank;
        return {
            rnk: rank,
            data: cardRankArray,
            restofData: [],
            actualArray: cardArray.reverse()
        };
    };

    /**
     * Returns a straight card rank
     * @param cardArray
     * @returns {{rnk: number, data: Array, restofData: Array, actualArray: *}}
     */
    var getStraightRank = function(isJokerPresent, cardArray) {
        var jokerReArrangeValue = '';
        var cardRankArray = [];
        cardRankArray = getCardRankArray(cardArray);
        if (isJokerPresent) {
            jokerReArrangeValue = checkForJokerReplacementValue(cardArray);
            cardRankArray[4] = jokerReArrangeValue.value;
            cardRankArray = sortArray(cardRankArray);
            cardArray = replaceJoker(cardArray, jokerReArrangeValue.key);
        }
        var rank = g_rankOrder.straight.rank;
        return {
            rnk: rank,
            data: cardRankArray,
            restofData: [],
            actualArray: cardArray.reverse()
        };

    };

    var replaceJoker = function(cardData, replacePosition) {
        var cardDataLength = cardData.length;
        for (var key = cardDataLength - 1; key > replacePosition; --key) {
            cardData[key + 1] = cardData[key];
        }
        cardData[replacePosition + 1] = 'jo15';
        return cardData;
    };

    var replaceJokerForFlush = function(cardData, replacePosition) {
        var positions = [3, 2, 1, 0];
        var cardDataLength = cardData.length;
        replacePosition = positions[replacePosition];
        for (var key = replacePosition + 1; key < cardDataLength; ++key) {
            cardData[key + 1] = cardData[key];
        }
        cardData[replacePosition + 1] = 'jo15';
        return cardData;
    };

    var sortArray = function(cardArray) {
        cardArray.sort(function(a, b) {
            return +/\d+/.exec(a)[0] - +/\d+/.exec(b)[0];
        });
        return cardArray;
    };

    var reverseSortArray = function(cardArray) {
        cardArray.sort(function(a, b) {
            return +/\d+/.exec(b)[0] - +/\d+/.exec(a)[0];
        });
        return cardArray;
    };

    /**
     * This function is used to find the Five card rank.
     * At the very first, we would do a Natural sorting for card array. Then check for the availability of Joker.
     * Then do a simple checking to understand it is straight , flush.
     * If both the it will be Royal/Straight flush. So call the curresponding function by passing the arguments.
     * If it is only flush then call the flush function. Else call the Straight function.
     * Otherwise do a call for checking for Pair.
     * @param cardArray The argument card array contains the sorted card values
     * @returns {Hash} This contains the rank and an array which contains card ranks of the selected cards.
     */
    var checkRankingGroups = function(cardArray) {
        var rank = [];
        cardArray = sortArray(cardArray);

        rank = chekForStraightFlushSpecialCase(cardArray);
        if (rank.status === true) {
            return rank;
        }
        rank = [];
        var isJokerPresent = checkForJoker(cardArray);


        var isStraightCards = '';
        if (isJokerPresent) {
            cardArray.pop();
            isStraightCards = chekForStraightIfJokerPresent(cardArray);
        } else {
            isStraightCards = chekForStraight(cardArray);

        }
        var isFlushedCards = checkForFlush(cardArray);
        if (isFlushedCards && isStraightCards) {
            rank = getRoyalStraightFlushRank(isJokerPresent, cardArray);
            return rank;
        }
        if (isFlushedCards && !isStraightCards) {
            rank = getFlushRank(isJokerPresent, cardArray);
            return rank;
        }
        if (isStraightCards) {
            rank = getStraightRank(isJokerPresent, cardArray);
            return rank;
        }
        var cardArrayRanks = getCardRankArray(cardArray);
        if (isJokerPresent) {
            cardArrayRanks[4] = 14;
            cardArray[4] = 'jo15';
        }
        rank = checkForPair(cardArrayRanks, cardArray);
        return rank;
    };

    var compareRank = function(playerData, dealerData) {
        var dataLength = playerData.length;
        var status = "equal";
        for (var key = dataLength - 1; key >= 0; --key) {
            if (dealerData[key] > playerData[key]) {
                status = "dealer";
                break;
            }
            if (dealerData[key] < playerData[key]) {
                status = "player";
                break;
            }
        }
        return status;
    };

    var getCardResult = function(params) {
        return checkRankingGroups(params);
    };

    this.getCardResult = getCardResult;

    var getCardResultText = function(dealerRankObj, g_playerRankObj) {
        var status = '';
        if (g_playerRankObj.rnk < dealerRankObj.rnk) {
            status = "player";
        } else if (g_playerRankObj.rnk > dealerRankObj.rnk) {
            status = "dealer";
        } else {
            status = compareRank(g_playerRankObj.data, dealerRankObj.data);
            if (status === 'equal' && (g_playerRankObj.rnk === g_rankOrder.one_pair.rank || g_playerRankObj.rnk === g_rankOrder.no_pair.rank)) {
                status = compareRank(g_playerRankObj.restofData, dealerRankObj.restofData);
            }
        }
        return status;
    };
    this.getCardResultText = getCardResultText;

    this.parseHandCards = function(cards){
        var newFormat = [];
        for(var card in cards){
            if(cards.hasOwnProperty(card)){
                var rank = cards[card].rank;
                var value = this.getValue(rank) + 2;
                newFormat.push(cards[card].suit.toLowerCase() + value);
            }
        }
        return newFormat;
    };

    this.standardizeHandCards = function(cards){
        var newFormat = [];
        for(var card in cards){
            if(cards.hasOwnProperty(card)){
                var rank = this.getRank(parseInt(cards[card].substring(1)));
                newFormat.push({rank:rank, suit: cards[card][0].toUpperCase()});
            }
        }
        return newFormat;
    };

    var ranks = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
    this.getValue = function(rank) {
        var value = ranks.indexOf(rank);
        if(value !== -1){
            return value;
        }
    };

    this.getRank = function(value) {
        var rank = ranks[value - 2];
        return rank;
    };

    /**
     * gets pay
     * @param playerHandRank
     * @param wager
     * @returns {number}
     */
    this.getPayout = function(playerHandRank, wager) {
        var payout_multiplier = payout_multipliers[playerHandRank];
        if (payout_multiplier >= 1)
            return wager * payout_multiplier;
        return 0;
    };

    /**
     * Return houseedge
     * @returns {number}
     */
    this.getHouseEdge = function(){
        return 0.0046;
    };

    /**
     * Remove canceled cards from player hand and push new cards for them
     * @param playerInitCards
     * @param holds
     * @param allCards
     * @returns {Array}
     */
    this.getPlayerFinalCards = function(playerInitCards, holds, allCards) {
        var countCanceled = 0;
        var ret = playerInitCards.slice();
        for(var index in holds) {
            if (!holds[index] && ret[index]) {
                ret[index] = allCards[ret.length + countCanceled];
                countCanceled++;
            }
        }
        return ret;
    };

    /**
     * checks wheter player hands are jacks or higher
     * @param playerHandRankObj
     * @returns {boolean}
     */
    this.isJacksOrHigher = function(playerHandRankObj) {
        var tens = this.getCardResult(['s10','h10','s14','s13','s12']);
        var result = this.getCardResultText(tens, playerHandRankObj);
        return result === 'player';
    };

    /**
     * Get game result
     * @param playerHand
     * @param wager
     * @param holds
     * @param allCards
     * @returns {{playerHand: *, payout: {total: number, pairplus: number, ante: number, play: number, ante_bonus: number}, holds: *}}
     */
    this.getResult = function(playerHand, wager, holds, allCards){
        var playerInitCards = playerHand.initCards;
        var playerFinalCards = this.getPlayerFinalCards(playerHand.initCards, holds, allCards);
        playerHand = this.getCardResult(this.parseHandCards(playerFinalCards));
        playerHand.initCards = playerInitCards;
        playerHand.finalCards = playerFinalCards;
        playerHand.holds = holds;

        var payout = 0;
        var is_win = false;
        if (this.isJacksOrHigher(playerHand)) {
            payout = this.getPayout(playerHand.rnk, wager);
            is_win = true;
        }
        playerHand.sub_rnk = this.getGameSubRank(playerHand);

        return {
            playerHand: playerHand,
            payout: payout,
            is_win: is_win
        };
    };

    this.getGameSubRank = function(handRnkObj) {
        if (handRnkObj.rnk === g_rankOrder.no_pair.rank) {
            return handRnkObj.restofData[4];
        }
        if (handRnkObj.rnk === g_rankOrder.one_pair.rank) {
            return handRnkObj.data[0];
        }
        return 0;
    };

    this.getUnshuffledCards = function(){
        var cards = [];
        for(var cardNum = 0; cardNum < 13; cardNum++){
            for(var type = 0; type < 4; type++){
                var suit = "";
                var rank = "";
                suit = this.getCardSuit(type);
                rank = this.getCardRank(cardNum);
                var card = {suit:suit,rank:rank};
                cards.push(card);
            }
        }
        //cards.push({rank:'JO'});
        return cards;
    };

    this.getCardRank = function(order) {
        var cards = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K","A","JO"];
        return cards[order];
    };

    this.getCardSuit = function(order) {
        var suits = ["C", "D", "H", "S"];
        return suits[order];
    };

    this.getShuffledCards = function(seed, cards) {
        return provable.seededShuffle(seed, cards);
    };

    this.getAutoHolds = function(playerCards, playerHand) {
        var holds = [false, false, false, false, false];
        var i, j;
        if (this.isJacksOrHigher(playerHand)) {
            holds = [true, true, true, true, true];
            for(i = 0; i < 5; i++) {
                if (playerHand.restofData.indexOf(this.getValue(playerCards[i].rank) + 2) !== -1) {
                    holds[i] = false;
                }
            }
            return holds;
        }

        //Check for flush candidate
        for (i = 0; i < 5; i++) {
            var count = 0;
            for (j = 0; j < 5; j++) {
                if (playerCards[i].suit === playerCards[j].suit) {
                    count++;
                }
            }
            if (count === 4) {
                for (j = 0; j < 5; j++) {
                    if (playerCards[i].suit === playerCards[j].suit) {
                        holds[j] = true;
                    }
                }
                return holds;
            }
        }

        //Check for straight candidate - one pair or no pair
        for (i = 4; i >= 0; i--) {
            var cardRank = this.getValue(playerCards[i].rank) + 2;
            if ((playerHand.rnk === g_rankOrder.one_pair.rank && cardRank === playerHand.data[0]) || playerHand.rnk === g_rankOrder.no_pair.rank) {
                var minWith14 = 15;
                var maxWith14 = 0;
                var minWith1 = 15;
                var maxWith1 = 0;

                for (j = 0; j < 5; j++) {
                    if (i !== j) {
                        cardRank = this.getValue(playerCards[j].rank) + 2;
                        if (cardRank < minWith14) {
                            minWith14 = cardRank;
                        }
                        if (cardRank > maxWith14) {
                            maxWith14 = cardRank;
                        }

                        if (cardRank === 14) {
                            cardRank = 1;
                        }

                        if (cardRank < minWith1) {
                            minWith1 = cardRank;
                        }
                        if (cardRank > maxWith1) {
                            maxWith1 = cardRank;
                        }
                    }
                }

                if (maxWith14 - minWith14 <= 4 || maxWith1 - minWith1 <= 4) {
                    for (j = 0; j < 5; j++) {
                        if (i !== j) {
                            holds[j] = true;
                        }
                    }
                    return holds;
                }
                if (playerHand.rnk === g_rankOrder.one_pair.rank) {
                    break;
                }
            }
        }

        return holds;
    };

    this.initHands = function(seed) {
        var unshuffledCards = this.getUnshuffledCards();
        var cards = this.getShuffledCards(seed, unshuffledCards);
        var allCards = cards.slice();
        var playerCards = [];
        for(var j=0;j<5;j++){
            playerCards.push(cards.pop());
        }

        var playerHand = this.getCardResult(this.parseHandCards(playerCards));
        var holds = this.getAutoHolds(playerCards, playerHand);
        playerHand.sub_rnk = this.getGameSubRank(playerHand);
        return {
            playerCards: playerCards,
            allCards: allCards,
            holds: holds,
            playerCardsRank: playerHand.rnk,
            playerCardsSubRank: playerHand.sub_rnk
        };
    };

    return this;
};