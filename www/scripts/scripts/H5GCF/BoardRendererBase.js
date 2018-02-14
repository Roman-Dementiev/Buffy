var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JewelWarrior;
(function (JewelWarrior) {
    ;
    var BoardRendererBase = (function () {
        function BoardRendererBase(config) {
            this.cursor = null;
            this.paused = false;
            this.animations = [];
            this.numCols = config.numCols;
            this.numRows = config.numRows;
        }
        //		public getContext() { return this.context; }
        BoardRendererBase.prototype.getNumRows = function () { return this.numRows; };
        BoardRendererBase.prototype.getNumCols = function () { return this.numCols; };
        BoardRendererBase.prototype.getJewelSize = function () { return this.jewelSize; };
        BoardRendererBase.prototype.getBoard = function () { return this.board; };
        BoardRendererBase.prototype.initialize = function (boardElement, callback) {
            this.paused = false;
            if (!this.canvas) {
                var canvas = document.createElement("canvas");
                Dom.addClass(canvas, "board");
                var rect = boardElement.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                var background = this.createBackground();
                if (background) {
                    boardElement.appendChild(background);
                }
                boardElement.appendChild(canvas);
                this.canvas = canvas;
                this.initContext(callback);
            }
            else {
                if (callback) {
                    callback();
                }
            }
        };
        BoardRendererBase.prototype.createBackground = function () {
            return null;
        };
        BoardRendererBase.prototype.start = function (board) {
            var _this = this;
            this.board = board;
            this.previousCycle = Date.now();
            requestAnimationFrame(function () { return _this.renderCycle(); });
        };
        BoardRendererBase.prototype.pause = function () {
            this.paused = true;
        };
        BoardRendererBase.prototype.resume = function (pauseTime) {
            this.paused = false;
            for (var _i = 0, _a = this.animations; _i < _a.length; _i++) {
                var anim = _a[_i];
                anim.startTime += pauseTime;
            }
        };
        BoardRendererBase.prototype.renderCycle = function () {
            var _this = this;
            var now = Date.now();
            if (!this.paused) {
                this.render(now, this.previousCycle);
            }
            this.previousCycle = now;
            requestAnimationFrame(function () { return _this.renderCycle(); });
        };
        BoardRendererBase.prototype.setCursor = function (col, row, selected) {
            this.cursor = {
                row: row,
                col: col,
                selected: selected
            };
        };
        BoardRendererBase.prototype.unsetCursor = function () {
            this.cursor = null;
        };
        BoardRendererBase.prototype.addAnimation = function (runTime, animation, callback) {
            var anim = {
                animation: animation,
                runTime: runTime,
                startTime: Date.now(),
                pos: 0,
                callback: callback
            };
            this.animations.push(anim);
        };
        BoardRendererBase.prototype.renderAnimations = function (time, prevTime) {
            var anims = this.animations.slice(0); // copy list
            var count = anims.length;
            // call before() function
            for (var i = 0; i < count; i++) {
                var anim = anims[i];
                anim.animation.before(this, anim.pos);
                anim.prevPos = anim.pos;
                var animTime = (prevTime - anim.startTime);
                anim.pos = animTime / anim.runTime;
                anim.pos = Math.max(0, Math.min(1, anim.pos));
            }
            this.animations = []; // reset animation list
            for (var i = 0; i < count; i++) {
                var anim = anims[i];
                anim.animation.render(this, anim.pos, anim.pos - anim.prevPos);
                if (anim.pos >= 1) {
                    anim.animation.done(this);
                    if (anim.callback) {
                        anim.callback();
                    }
                }
                else {
                    this.animations.push(anim);
                }
            }
        };
        BoardRendererBase.prototype.setCssTransforms = function (value) {
            Dom.transform(this.canvas, value);
        };
        BoardRendererBase.prototype.clearCssTransforms = function () {
            //this.canvas.style.webkitTransform = "";
            this.setCssTransforms("");
        };
        BoardRendererBase.prototype.setCanvasPos = function (left, top) {
            this.canvas.style.left = left;
            this.canvas.style.top = top;
        };
        return BoardRendererBase;
    }());
    JewelWarrior.BoardRendererBase = BoardRendererBase;
    ;
    var BoardRenderer = (function (_super) {
        __extends(BoardRenderer, _super);
        function BoardRenderer(config) {
            return _super.call(this, config) || this;
        }
        BoardRenderer.prototype.getContext = function () { return this.context; };
        return BoardRenderer;
    }(BoardRendererBase));
    JewelWarrior.BoardRenderer = BoardRenderer;
    ;
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=BoardRendererBase.js.map