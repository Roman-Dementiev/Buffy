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
    //interface IAnimation {
    //	before(renderer: BoardRenderer2D, pos: number);
    //	render(renderer: BoardRenderer2D, pos: number, delta: number);
    //	done(renderer: BoardRenderer2D);
    //};
    //type AnimationRec = {
    //	animation: IAnimation,
    //	runTime: number,
    //	startTime: number,
    //	pos: number,
    //	prevPos?: number
    //};
    var BoardRenderer2D = (function (_super) {
        __extends(BoardRenderer2D, _super);
        //private board: IBoard;
        //private cursor: Cursor = null;
        //private paused: boolean = false;
        //private animations: AnimationRec[] = [];
        //private previousCycle: number;
        function BoardRenderer2D(config) {
            return _super.call(this, config) || this;
            //this.numCols = config.numCols;
            //this.numRows = config.numRows;
        }
        //public getContext() { return this.context; }
        //public getNumRows() { return this.numRows; }
        //public getNumCols() { return this.numCols; }
        //public getJewelSize() { return this.jewelSize; }
        //public getBoard() { return this.board; }
        BoardRenderer2D.prototype.createBackground = function () {
            var background = document.createElement("canvas"), bgCtx = background.getContext("2d"), jewelSize = this.jewelSize;
            Dom.addClass(background, "background");
            background.width = this.numCols * jewelSize;
            background.height = this.numRows * jewelSize;
            bgCtx.fillStyle = "rgba(225,235,255,0.15)";
            for (var x = 0; x < this.numCols; x++) {
                for (var y = 0; y < this.numRows; y++) {
                    if ((x + y) % 2) {
                        bgCtx.fillRect(x * jewelSize, y * jewelSize, jewelSize, jewelSize);
                    }
                }
            }
            return background;
        };
        //public initialize(boardElement: Element, callback: Callback)
        //{
        //	this.paused = false;
        //	if (!this.canvas) {
        //		let canvas = document.createElement("canvas");
        //		Dom.addClass(canvas, "board");
        //		var rect = boardElement.getBoundingClientRect();
        //		canvas.width = rect.width;
        //		canvas.height = rect.height;
        //		boardElement.appendChild(this.createBackground());
        //		boardElement.appendChild(canvas);
        //		this.canvas = canvas;
        //		this.context = canvas.getContext("2d");
        //		this.jewelSize = rect.width / this.numCols;
        //		this.jewelSprite = new Image();
        //		this.jewelSprite.addEventListener("load", () =>
        //		{
        //			//console.log(`'${this.jewelSprite.src}' loaded`);
        //			if (callback) {
        //				callback();
        //			}
        //		}, false);
        //		this.jewelSprite.src = "images/jewels" + this.jewelSize + ".png";
        //	} else {
        //		if (callback) {
        //			callback();
        //		}
        //	}
        //}
        BoardRenderer2D.prototype.initContext = function (callback) {
            this.context = this.canvas.getContext("2d");
            this.jewelSize = this.canvas.width / this.numCols;
            this.jewelSprite = new Image();
            this.jewelSprite.addEventListener("load", function () {
                //console.log(`'${this.jewelSprite.src}' loaded`);
                if (callback) {
                    callback();
                }
            }, false);
            this.jewelSprite.src = "images/jewels" + this.jewelSize + ".png";
        };
        //public start(board: IBoard)
        //{
        //	this.board = board;
        //	this.previousCycle = Date.now();
        //	requestAnimationFrame(() => this.renderCycle());
        //}
        //public pause()
        //{
        //	this.paused = true;
        //}
        //public resume(pauseTime: number)
        //{
        //	this.paused = false;
        //	for (let anim of this.animations) {
        //		anim.startTime += pauseTime;
        //	}
        //}
        //protected renderCycle()
        //{
        //	if (!this.board)
        //		return;
        //	var time = Date.now();
        //	if (!this.paused) {
        //		if (this.animations.length > 0) {
        //			this.renderAnimations(time, prevTime);
        //		} else {
        //			// show cursor only if not animating
        //			this.renderCursor(time);
        //		}
        //	}
        //	this.previousCycle = time;
        //	requestAnimationFrame(() => this.renderCycle());
        //}
        BoardRenderer2D.prototype.render = function (time, prevTime) {
            if (this.animations.length > 0) {
                this.renderAnimations(time, prevTime);
            }
            else {
                // show cursor only if not animating
                this.renderCursor(time);
            }
        };
        //public addAnimation(runTime: number, animation: IAnimation)
        //{
        //	var anim = {
        //		animation: animation,
        //		runTime: runTime,
        //		startTime: Date.now(),
        //		pos: 0
        //	};
        //	this.animations.push(anim);
        //}
        //private renderAnimations(time: number, prevTime: number)
        //{
        //	let anims = this.animations.slice(0); // copy list
        //	let count = anims.length;
        //	// call before() function
        //	for (let i = 0; i < count; i++) {
        //		let anim = anims[i];
        //		anim.animation.before(this, anim.pos);
        //		anim.prevPos = anim.pos;
        //		let animTime = (prevTime - anim.startTime);
        //		anim.pos = animTime / anim.runTime;
        //		anim.pos = Math.max(0, Math.min(1, anim.pos));
        //	}
        //	this.animations = []; // reset animation list
        //	for (let i = 0; i < count; i++) {
        //		let anim = anims[i];
        //		anim.animation.render(this, anim.pos, anim.pos - anim.prevPos);
        //		if (anim.pos == 1) {
        //			anim.animation.done(this);
        //		} else {
        //			this.animations.push(anim);
        //		}
        //	}
        //}
        BoardRenderer2D.prototype.clearCanvas = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        BoardRenderer2D.prototype.redrawBoard = function (callback) {
            this.clearCanvas();
            for (var col = 0; col < this.numCols; col++) {
                for (var row = 0; row < this.numRows; row++) {
                    this.renderJewel(col, row);
                }
            }
            //this.renderCursor(Date.now());
            if (callback) {
                callback();
            }
        };
        BoardRenderer2D.prototype.clearJewel = function (col, row) {
            var jewelSize = this.jewelSize;
            this.context.clearRect(col * jewelSize, row * jewelSize, jewelSize, jewelSize);
        };
        BoardRenderer2D.prototype.renderJewel = function (col, row, type) {
            if (typeof type == 'undefined') {
                type = this.board.getJewelAt(col, row);
            }
            var jewelSize = this.jewelSize;
            this.context.drawImage(this.jewelSprite, type * jewelSize, 0, jewelSize, jewelSize, col * jewelSize, row * jewelSize, jewelSize, jewelSize);
        };
        BoardRenderer2D.prototype.renderTransformed = function (arg) {
            var ctx = this.context;
            var jewelSize = this.jewelSize;
            var x = arg.col, y = arg.row;
            var type = (typeof arg.type !== 'undefined') ? arg.type : this.board.getJewelAt(x, y);
            ctx.save();
            if (typeof arg.globalAlpha !== 'undefined')
                ctx.globalAlpha = arg.globalAlpha;
            if (arg.scale && arg.scale > 0) {
                ctx.beginPath();
                ctx.translate((x + 0.5) * jewelSize, (y + 0.5) * jewelSize);
                ctx.scale(arg.scale, arg.scale);
                if (arg.rotate) {
                    ctx.rotate(arg.rotate);
                }
                ctx.translate(-(x + 0.5) * jewelSize, -(y + 0.5) * jewelSize);
            }
            ctx.drawImage(this.jewelSprite, type * jewelSize, 0, jewelSize, jewelSize, x * jewelSize, y * jewelSize, jewelSize, jewelSize);
            ctx.restore();
        };
        BoardRenderer2D.prototype.clearCursor = function () {
            if (this.cursor) {
                var col = this.cursor.col, row = this.cursor.row;
                this.clearJewel(col, row);
                this.renderJewel(col, row);
            }
        };
        BoardRenderer2D.prototype.renderCursor = function (time) {
            if (!this.cursor) {
                return;
            }
            var col = this.cursor.col, row = this.cursor.row, ctx = this.context, t1 = (Math.sin(time / 200) + 1) / 2, t2 = (Math.sin(time / 400) + 1) / 2, jewelSize = this.jewelSize;
            this.clearCursor();
            if (this.cursor.selected) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = 0.8 * t1;
                //this.renderJewel(col, row);
                this.renderTransformed({
                    col: col,
                    row: row,
                    scale: 1.1
                });
                ctx.restore();
            }
            ctx.save();
            ctx.lineWidth = 0.05 * jewelSize;
            //			ctx.strokeStyle = "rgba(250,250,150,0.8)";
            ctx.strokeStyle = "rgba(250,250,150," + (0.5 + 0.5 * t2) + ")";
            ctx.strokeRect((col + 0.05) * jewelSize, (row + 0.05) * jewelSize, 0.9 * jewelSize, 0.9 * jewelSize);
            ctx.restore();
        };
        BoardRenderer2D.prototype.setCursor = function (col, row, selected) {
            this.clearCursor();
            _super.prototype.setCursor.call(this, col, row, selected);
        };
        BoardRenderer2D.prototype.unsetCursor = function () {
            this.clearCursor();
            _super.prototype.unsetCursor.call(this);
        };
        //public moveJewels(moved: MoveEventItem[], callback?: Callback)
        //{
        //	var count = moved.length,
        //		mover: MoveEventItem, i;
        //	for (i = 0; i < count; i++) {
        //		mover = moved[i];
        //		this.clearJewel(mover.fromX, mover.fromY);
        //	}
        //	for (i = 0; i < count; i++) {
        //		mover = moved[i];
        //		this.renderJewel(mover.toX, mover.toY, mover.type);
        //	}
        //	if (callback) {
        //		callback();
        //	}
        //}
        BoardRenderer2D.prototype.moveJewels = function (moved, callback) {
            var _this = this;
            var count = moved.length, oldCursor = this.cursor;
            this.cursor = null;
            for (var _i = 0, moved_1 = moved; _i < moved_1.length; _i++) {
                var e = moved_1[_i];
                var x = e.fromX, y = e.fromY, dx = e.toX - e.fromX, dy = e.toY - e.fromY, dist = Math.abs(dx) + Math.abs(dy);
                this.addAnimation(200 * dist, new MoveAnimation(e), 
                /*callback*/ function () {
                    if (--count == 0) {
                        _this.cursor = oldCursor;
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
        };
        //public removeJewels(removed: RemoveEventItem[], callback?: Callback)
        //{
        //	var count = removed.length;
        //	for (let i = 0; i < count; i++) {
        //		this.clearJewel(removed[i].x, removed[i].y);
        //	}
        //	if (callback) {
        //		callback();
        //	}
        //}
        BoardRenderer2D.prototype.removeJewels = function (removed, callback) {
            var _this = this;
            var count = removed.length, oldCursor = this.cursor;
            this.cursor = null;
            for (var _i = 0, removed_1 = removed; _i < removed_1.length; _i++) {
                var e = removed_1[_i];
                this.addAnimation(400, new RemoveAnimation(e), 
                /*callback*/ function () {
                    if (--count == 0) {
                        _this.cursor = oldCursor;
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
        };
        BoardRenderer2D.prototype.refill = function (layout, callback) {
            this.addAnimation(1000, new RefillAnimation(layout, this.numCols, this.numRows), callback);
        };
        BoardRenderer2D.prototype.levelUpAnimation = function (callback) {
            this.addAnimation(1000, new LevelUpAnimation(), callback);
        };
        BoardRenderer2D.prototype.gameOverAnimation = function (callback) {
            var _this = this;
            this.addAnimation(1000, new GameOverAnimation(), function () {
                _this.explode(callback);
            });
        };
        BoardRenderer2D.prototype.explode = function (callback) {
            this.addAnimation(2000, new ExplodeAnimation(this.board), callback);
        };
        return BoardRenderer2D;
    }(JewelWarrior.BoardRenderer));
    ;
    var Animation = (function () {
        function Animation() {
        }
        Animation.prototype.before = function (renderer, pos) { };
        Animation.prototype.done = function (renderer) { };
        return Animation;
    }());
    ;
    var MoveAnimation = (function (_super) {
        __extends(MoveAnimation, _super);
        function MoveAnimation(move) {
            var _this = _super.call(this) || this;
            _this.type = move.type;
            _this.x = move.fromX;
            _this.y = move.fromY;
            _this.dx = move.toX - move.fromX;
            _this.dy = move.toY - move.fromY;
            return _this;
        }
        MoveAnimation.prototype.before = function (renderer, pos) {
            pos = Math.sin(pos * Math.PI / 2);
            renderer.clearJewel(this.x + this.dx * pos, this.y + this.dy * pos);
        };
        MoveAnimation.prototype.render = function (renderer, pos, delta) {
            pos = Math.sin(pos * Math.PI / 2);
            renderer.renderJewel(this.x + this.dx * pos, this.y + this.dy * pos, this.type);
        };
        return MoveAnimation;
    }(Animation));
    ;
    var RemoveAnimation = (function (_super) {
        __extends(RemoveAnimation, _super);
        function RemoveAnimation(remove) {
            var _this = _super.call(this) || this;
            _this.type = remove.type;
            _this.x = remove.x;
            _this.y = remove.y;
            return _this;
        }
        RemoveAnimation.prototype.before = function (renderer, pos) {
            renderer.clearJewel(this.x, this.y);
        };
        RemoveAnimation.prototype.render = function (renderer, pos, delta) {
            renderer.renderTransformed({
                col: this.x,
                row: this.y,
                type: this.type,
                scale: 1 - pos,
                rotate: pos * Math.PI * 2,
                globalAlpha: 1 - pos
            });
        };
        return RemoveAnimation;
    }(Animation));
    ;
    var RefillAnimation = (function (_super) {
        __extends(RefillAnimation, _super);
        function RefillAnimation(layout, numCols, numRows) {
            var _this = _super.call(this) || this;
            _this.layout = layout;
            _this.numCols = numCols;
            _this.numRows = numRows;
            _this.lastIndex = 0;
            return _this;
        }
        RefillAnimation.prototype.render = function (renderer, pos, delta) {
            var currIndex = Math.floor(pos * this.numCols * this.numRows);
            for (var i = this.lastIndex; i < currIndex; i++) {
                var col = i % this.numCols;
                var row = Math.floor(i / this.numCols);
                renderer.clearJewel(col, row);
                renderer.renderJewel(this.layout[col][row], col, row);
            }
            this.lastIndex = currIndex;
            renderer.setCssTransforms("rotateX(" + (360 * pos) + "deg)");
        };
        RefillAnimation.prototype.done = function (renderer) {
            renderer.clearCssTransforms();
        };
        return RefillAnimation;
    }(Animation));
    ;
    var LevelUpAnimation = (function (_super) {
        __extends(LevelUpAnimation, _super);
        function LevelUpAnimation() {
            return _super.call(this) || this;
        }
        LevelUpAnimation.prototype.before = function (renderer, pos) {
            var numRows = renderer.getNumRows();
            var numCols = renderer.getNumCols();
            var max = Math.floor(pos * numRows * 2);
            for (var y = 0, x = max; y < numRows; y++, x--) {
                if (x >= 0 && x < numCols) {
                    renderer.clearJewel(x, y);
                    renderer.renderJewel(x, y);
                }
            }
        };
        LevelUpAnimation.prototype.render = function (renderer, pos, delta) {
            var board = renderer.getBoard();
            var numRows = renderer.getNumRows();
            var numCols = renderer.getNumCols();
            var max = Math.floor(pos * numRows * 2);
            var ctx = renderer.getContext();
            ctx.save(); // remember to save state
            ctx.globalCompositeOperation = "lighter";
            for (var y = 0, x = max; y < numRows; y++, x--) {
                if (x >= 0 && x < numCols) {
                    renderer.renderTransformed({
                        col: x,
                        row: y,
                        scale: 1.1
                    });
                }
            }
            ctx.restore();
        };
        LevelUpAnimation.prototype.done = function (renderer) {
            _super.prototype.done.call(this, renderer);
        };
        return LevelUpAnimation;
    }(Animation));
    var GameOverAnimation = (function (_super) {
        __extends(GameOverAnimation, _super);
        function GameOverAnimation() {
            return _super.call(this) || this;
        }
        GameOverAnimation.prototype.render = function (renderer, pos, delta) {
            renderer.setCanvasPos(0.2 * pos * (Math.random() - 0.5) + "em", 0.2 * pos * (Math.random() - 0.5) + "em");
        };
        GameOverAnimation.prototype.done = function (renderer) {
            renderer.setCanvasPos("0", "0");
        };
        return GameOverAnimation;
    }(Animation));
    var ExplodeAnimation = (function (_super) {
        __extends(ExplodeAnimation, _super);
        function ExplodeAnimation(board) {
            var _this = _super.call(this) || this;
            var numCols = board.numCols;
            var numRows = board.numRows;
            var pieces = [];
            for (var x = 0; x < numCols; x++) {
                for (var y = 0; y < numRows; y++) {
                    var piece = {
                        type: board.getJewelAt(x, y),
                        pos: {
                            x: x + 0.5,
                            y: y + 0.5
                        },
                        vel: {
                            x: (Math.random() - 0.5) * 20,
                            y: -Math.random() * 10
                        },
                        rot: (Math.random() - 0.5) * 3
                    };
                    pieces.push(piece);
                }
            }
            _this.pieces = pieces;
            return _this;
        }
        ExplodeAnimation.prototype.before = function (renderer, pos) {
            renderer.clearCanvas();
        };
        ExplodeAnimation.prototype.render = function (renderer, pos, delta) {
            //			renderer.explodePieces(this.pieces, pos, delta);
            var ctx = renderer.getContext();
            var numCols = renderer.getNumCols();
            //let numRows = renderer.getNumRows();
            var jewelSize = renderer.getJewelSize();
            for (var i = 0, count = this.pieces.length; i < count; i++) {
                var piece = this.pieces[i];
                piece.vel.y += 50 * delta;
                piece.pos.y += piece.vel.y * delta;
                piece.pos.x += piece.vel.x * delta;
                if (piece.pos.x < 0 || piece.pos.x > numCols) {
                    piece.pos.x = Math.max(0, piece.pos.x);
                    piece.pos.x = Math.min(numCols, piece.pos.x);
                    piece.vel.x *= -1;
                }
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.translate(piece.pos.x * jewelSize, piece.pos.y * jewelSize);
                ctx.rotate(piece.rot * pos * Math.PI * 4);
                ctx.translate(-piece.pos.x * jewelSize, -piece.pos.y * jewelSize);
                renderer.renderJewel(piece.pos.x - 0.5, piece.pos.y - 0.5, piece.type);
                ctx.restore();
            }
        };
        return ExplodeAnimation;
    }(Animation));
    if (JewelWarrior.factory) {
        JewelWarrior.factory.createRenderer = function (config) {
            return new BoardRenderer2D(config);
        };
    }
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=BoardRenderer2D.js.map