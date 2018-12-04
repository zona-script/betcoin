'use strict';

// Came from the comments here:  https://gist.github.com/maruf-nc/5625869
Application.Filters.filter('bonusUnlockedPercent', function() {
    return function (bonus) {
        var unlockedamount = parseInt(bonus.initialValue,10)*parseInt(bonus.rollover,10);

        var fraction = bonus.wagered/unlockedamount;
        var result = Math.round(fraction*100);
        return result;

    };
});
