var BubbleShoot;
(function (BubbleShoot) {
    BubbleShoot.kaboomDefaults = {
        gravity: 1.3,
        maxY: 800
    };
    ;
    function kaboom(elm, opt) {
        if (!opt)
            opt = {};
        var options = {
            gravity: opt.gravity ? opt.gravity : BubbleShoot.kaboomDefaults.gravity,
            maxY: opt.maxY ? opt.maxY : BubbleShoot.kaboomDefaults.maxY
        };
        var toMove = [{
                elm: elm,
                dx: Math.round(Math.random() * 10) - 5,
                dy: Math.round(Math.random() * 5) + 5,
                x: elm.left,
                y: elm.top
            }];
        //	setTimeout(() => moveAll(toMove, options), 40);
        var prevTime = Date.now();
        requestAnimationFrame(function () { return moveAll(toMove, prevTime, options); });
    }
    BubbleShoot.kaboom = kaboom;
    function moveAll(toMove, prevTime, options) {
        var newTime = Date.now();
        var elapsed = newTime - prevTime;
        var frameProportion = elapsed / 25;
        var stillToMove = [];
        for (var _i = 0, toMove_1 = toMove; _i < toMove_1.length; _i++) {
            var move = toMove_1[_i];
            move.x += move.dx * frameProportion;
            move.y -= move.dy * frameProportion;
            move.dy -= options.gravity * frameProportion;
            if (move.y < options.maxY) {
                move.elm.setPosition(Math.round(move.x), Math.round(move.y));
                stillToMove.push(move);
            }
            else if (options.callback) {
                options.callback();
            }
        }
        ;
        if (stillToMove.length > 0) {
            //setTimeout(() => moveAll(stillToMove, options), 40);
            requestAnimationFrame(function () { return moveAll(stillToMove, newTime, options); });
        }
    }
    ;
})(BubbleShoot || (BubbleShoot = {}));
//# sourceMappingURL=kaboom.js.map