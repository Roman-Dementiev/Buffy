var BubbleShoot;
(function (BubbleShoot) {
    var FIRE_DISTANCE = 1000; // pixels
    var FIRE_DURATION = 750; // ms
    var POP_GROUP_LENGTH = 3;
    var kFastPopDuration = 200;
    var kFastPopInterval = 60;
    var kSlowPopDuration = 1000;
    var kSlowPopInterval = 300;
    var keyHighScore = "BS_high_score";
    var Game = (function () {
        function Game() {
            this.level = 0;
            this.score = 0;
        }
        Object.defineProperty(Game, "instance", {
            get: function () {
                if (!Game._instance) {
                    Game._instance = new Game();
                }
                return Game._instance;
            },
            enumerable: true,
            configurable: true
        });
        Game.init = function () {
            Game.bindStartButton();
            if (window.localStorage && localStorage.getItem(keyHighScore)) {
                Game.highScore = parseInt(localStorage.getItem(keyHighScore));
            }
            BubbleShoot.UI.drawHighScore(Game.highScore);
        };
        Game.bindStartButton = function () {
            BubbleShoot.UI.startButton.bind('click', function () {
                BubbleShoot.UI.startButton.unbind('click');
                BubbleShoot.UI.newGameDialog.fadeOut(300);
                Game.instance.startGame();
            });
        };
        Game.prototype.startGame = function () {
            var _this = this;
            this.numBubbles = BubbleShoot.MAX_BUBBLES - this.level * 5;
            this.bubbleGenerator = BubbleShoot.BubbleGenerator.random; //BubbleGenerator.sameColor(0);
            this.board = new BubbleShoot.Board({
                generator: this.bubbleGenerator
            }, BubbleShoot.UI.boardElement);
            this.bubbles = this.board.getBubbles();
            this.curBubble = this.getNextBubble();
            if (BubbleShoot.GameRenderer.exists) {
                BubbleShoot.GameRenderer.instance.start(this);
            }
            BubbleShoot.UI.gameArea.bind('click', function (e) { return _this.onClickGameArea(e); });
            BubbleShoot.UI.drawScore(this.score);
            BubbleShoot.UI.drawLevel(this.level);
        };
        Game.prototype.endGame = function (hasWon) {
            //$("#board .bubble").remove();
            this.board.clear();
            for (var _i = 0, _a = this.bubbles; _i < _a.length; _i++) {
                var bubble = _a[_i];
                bubble.sprite.remove();
            }
            if (hasWon && this.score > Game.highScore) {
                Game.highScore = this.score;
                $("#new_high_score").show();
                BubbleShoot.UI.drawHighScore(Game.highScore);
                if (window.localStorage) {
                    localStorage.setItem(keyHighScore, Game.highScore.toString());
                }
            }
            else {
                $("#new_high_score").hide();
            }
            ;
            if (hasWon) {
                this.level++;
            }
            else {
                this.score = 0;
                this.level = 0;
            }
            ;
            Game.bindStartButton();
            BubbleShoot.UI.gameArea.unbind("click");
            //UI.gameArea.unbind("mousemove");
            BubbleShoot.UI.endGame(hasWon, this.score);
        };
        ;
        Game.prototype.getBubbles = function () { return this.bubbles; };
        Game.prototype.getNextBubble = function () {
            var bubble = this.bubbleGenerator.createCurrentBubble();
            this.bubbles.push(bubble);
            bubble.sprite.appendTo(BubbleShoot.UI.boardElement);
            bubble.sprite.setPosition((BubbleShoot.UI.boardElement.width() - BubbleShoot.BUBBLE_DIMS) / 2, BubbleShoot.CURRENT_BUBBLE_TOP);
            BubbleShoot.UI.drawBubblesRemaining(this.numBubbles);
            this.numBubbles--;
            return bubble;
        };
        Game.prototype.onClickGameArea = function (event) {
            var _this = this;
            var angle = BubbleShoot.UI.getBubbleAngle(this.curBubble, event);
            var coords;
            var fireDistance = FIRE_DISTANCE;
            var fireDuration = FIRE_DURATION;
            var collision = BubbleShoot.CollisionDetector.findIntersection(this.curBubble, this.board, angle);
            if (collision) {
                coords = collision.coords;
                fireDuration = Math.round(fireDistance * collision.distToCollision / fireDuration);
                this.board.addBubble(this.curBubble, coords);
                var group = this.board.getGroup(this.curBubble);
                if (group.length >= POP_GROUP_LENGTH) {
                    var delay = this.popBubbles(this.board, group, fireDuration);
                    var cleared = group.length;
                    var topRowBubbles = this.board.getTopRowBubbles();
                    if (topRowBubbles.length <= 5) {
                        delay = this.popBubbles(this.board, topRowBubbles, delay);
                        cleared += topRowBubbles.length;
                    }
                    ;
                    var orphans = this.board.findOrphans();
                    if (orphans && orphans.length > 0) {
                        this.dropBubbles(orphans, delay);
                        cleared += orphans.length;
                    }
                    var points = cleared * BubbleShoot.POINTS_PER_BUBBLE;
                    this.score += points;
                    setTimeout(function () {
                        BubbleShoot.UI.drawScore(_this.score);
                    }, delay);
                }
            }
            else {
                var distX = Math.sin(angle) * fireDistance;
                var distY = Math.cos(angle) * fireDistance;
                var bubbleCoords = BubbleShoot.UI.getBubbleCoords(this.curBubble);
                coords = {
                    x: bubbleCoords.x + distX,
                    y: bubbleCoords.y - distY
                };
            }
            ;
            BubbleShoot.UI.fireBubble(this.curBubble, coords, fireDuration);
            if (this.numBubbles == 0 || this.board.numRows > BubbleShoot.MAX_ROWS) {
                this.endGame(false);
            }
            else if (this.board.isEmpty()) {
                this.endGame(true);
            }
            else {
                this.curBubble = this.getNextBubble();
            }
        };
        Game.prototype.popBubbles = function (board, bubbles, delay, popDuration, popInterval) {
            if (popDuration === void 0) { popDuration = kFastPopDuration; }
            if (popInterval === void 0) { popInterval = kFastPopInterval; }
            var _loop_1 = function (bubble) {
                setTimeout(function () {
                    bubble.state = 4 /* POPPING */;
                    bubble.animatePop(popDuration);
                    setTimeout(function () {
                        bubble.state = 6 /* POPPED */;
                    }, popDuration);
                    BubbleShoot.Sounds.playRandomVolume("pop.mp3", 0.5, 1);
                }, delay);
                delay += popInterval;
            };
            for (var _i = 0, bubbles_1 = bubbles; _i < bubbles_1.length; _i++) {
                var bubble = bubbles_1[_i];
                _loop_1(bubble);
            }
            delay += popDuration;
            board.deleteBubbles(bubbles);
            return delay;
        };
        Game.prototype.dropBubbles = function (bubbles, delay) {
            var _loop_2 = function (bubble) {
                this_1.board.deleteBubbleAt(bubble.row, bubble.col);
                setTimeout(function () {
                    bubble.state = 5 /* FALLING */;
                    bubble.sprite.kaboom({
                        callback: function () {
                            bubble.sprite.remove();
                            bubble.state = 8 /* FALLEN */;
                        }
                    });
                }, delay);
            };
            var this_1 = this;
            for (var _i = 0, bubbles_2 = bubbles; _i < bubbles_2.length; _i++) {
                var bubble = bubbles_2[_i];
                _loop_2(bubble);
            }
        };
        return Game;
    }());
    Game.highScore = 0;
    BubbleShoot.Game = Game;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=Game.js.map