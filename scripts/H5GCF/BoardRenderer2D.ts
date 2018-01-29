namespace JewelWarrior
{
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

	class BoardRenderer2D extends BoardRenderer<CanvasRenderingContext2D> implements IBoardRenderer
	{
		//private canvas: HTMLCanvasElement;
		//private context: CanvasRenderingContext2D;
		//private numCols: number;
		//private numRows: number;
		//private jewelSize: number;
		private jewelSprite: HTMLImageElement;
		//private board: IBoard;
		//private cursor: Cursor = null;
		//private paused: boolean = false;
		//private animations: AnimationRec[] = [];
		//private previousCycle: number;


		public constructor(config: GameConfig)
		{
			super(config);
			//this.numCols = config.numCols;
			//this.numRows = config.numRows;
		}

		//public getContext() { return this.context; }
		//public getNumRows() { return this.numRows; }
		//public getNumCols() { return this.numCols; }
		//public getJewelSize() { return this.jewelSize; }
		//public getBoard() { return this.board; }

		protected createBackground(): HTMLCanvasElement
		{
			let background = document.createElement("canvas"),
				bgCtx = background.getContext("2d"),
				jewelSize = this.jewelSize;
			Dom.addClass(background, "background");
			background.width = this.numCols * jewelSize;
			background.height = this.numRows * jewelSize;
			bgCtx.fillStyle = "rgba(225,235,255,0.15)";
			for (let x = 0; x < this.numCols; x++) {
				for (let y = 0; y < this.numRows; y++) {
					if ((x + y) % 2) {
						bgCtx.fillRect(
							x * jewelSize, y * jewelSize,
							jewelSize, jewelSize
						);
					}
				}
			}
			return background;
		}

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

		public initContext(callback: Callback)
		{
			this.context = this.canvas.getContext("2d");
			this.jewelSize = this.canvas.width / this.numCols;

			this.jewelSprite = new Image();
			this.jewelSprite.addEventListener("load", () =>
			{
				//console.log(`'${this.jewelSprite.src}' loaded`);
				if (callback) {
					callback();
				}
			}, false);
			this.jewelSprite.src = "images/jewels" + this.jewelSize + ".png";
		}

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

		protected render(time: number, prevTime: number)
		{
			if (this.animations.length > 0) {
				this.renderAnimations(time, prevTime);
			} else {
				// show cursor only if not animating
				this.renderCursor(time);
			}
		}

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

		public clearCanvas()
		{
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		public redrawBoard(callback?: Callback)
		{
			this.clearCanvas();

			for (let col = 0; col < this.numCols; col++) {
				for (let row = 0; row < this.numRows; row++) {
					this.renderJewel(col, row);
				}
			}
			//this.renderCursor(Date.now());

			if (callback) {
				callback();
			}
		}

		public clearJewel(col: number, row: number)
		{
			let jewelSize = this.jewelSize;
			this.context.clearRect(col * jewelSize, row * jewelSize, jewelSize, jewelSize);
		}

		public renderJewel(col: number, row: number, type?: JewelType)
		{
			if (typeof type == 'undefined') {
				type = this.board.getJewelAt(col, row);
			}

			let jewelSize = this.jewelSize;
			this.context.drawImage(this.jewelSprite,
				type * jewelSize, 0, jewelSize, jewelSize,
				col * jewelSize, row * jewelSize,
				jewelSize, jewelSize
			);
		}

		public renderTransformed(arg: {
			col: number,
			row: number,
			type?: JewelType,
			scale?: number,
			rotate?: number,
			globalAlpha?: number
		})
		{
			let ctx = this.context;
			let jewelSize = this.jewelSize;
			let x = arg.col, y = arg.row;
			let type = (typeof arg.type !== 'undefined') ? arg.type : this.board.getJewelAt(x, y);

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
			ctx.drawImage(this.jewelSprite,
				type * jewelSize, 0, jewelSize, jewelSize,
				x * jewelSize, y * jewelSize,
				jewelSize, jewelSize
			);
			ctx.restore();

		}

		private clearCursor()
		{
			if (this.cursor) {
				var col = this.cursor.col,
					row = this.cursor.row;
				this.clearJewel(col, row);
				this.renderJewel(col, row);
			}
		}

		private renderCursor(time: number)
		{
			if (!this.cursor) {
				return;
			}

			let col = this.cursor.col,
				row = this.cursor.row,
				ctx = this.context,
				t1 = (Math.sin(time / 200) + 1) / 2,
				t2 = (Math.sin(time / 400) + 1) / 2,
				jewelSize = this.jewelSize;
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
			ctx.strokeRect(
				(col + 0.05) * jewelSize, (row + 0.05) * jewelSize,
				0.9 * jewelSize, 0.9 * jewelSize
			);
			ctx.restore();
		}

		public setCursor(col: number, row: number, selected: boolean)
		{
			this.clearCursor();
			super.setCursor(col, row, selected);
		}

		public unsetCursor()
		{
			this.clearCursor();
			super.unsetCursor();
		}

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

		public moveJewels(moved: MoveEventItem[], callback?: Callback)
		{
			let count = moved.length,
				oldCursor = this.cursor;
			this.cursor = null;

			for (let e of moved) {
				let x = e.fromX, y = e.fromY,
					dx = e.toX - e.fromX,
					dy = e.toY - e.fromY,
					dist = Math.abs(dx) + Math.abs(dy);

				this.addAnimation(200 * dist, new MoveAnimation(e),
					/*callback*/ () => {
						if (--count == 0) {
							this.cursor = oldCursor;
							if (callback) {
								callback();
							}
						}
				});
			}
		}

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

		public removeJewels(removed: RemoveEventItem[], callback?: Callback)
		{
			let count = removed.length,
				oldCursor = this.cursor;
			this.cursor = null;

			for (let e of removed) {
				this.addAnimation(400, new RemoveAnimation(e),
				/*callback*/() => {
					if (--count == 0) {
						this.cursor = oldCursor;
						if (callback) {
							callback();
						}
					}
				});
			}
		}

		public refill(layout: JewelLayout, callback?: Callback)
		{
			this.addAnimation(1000, new RefillAnimation(layout, this.numCols, this.numRows), callback);
		}

		public levelUpAnimation(callback?: Callback)
		{
			this.addAnimation(1000, new LevelUpAnimation(), callback);

		}

		public gameOverAnimation(callback?: Callback)
		{
			this.addAnimation(1000, new GameOverAnimation(), () => {
				this.explode(callback);
			});
		}

		public explode(callback: Callback)
		{
			this.addAnimation(2000, new ExplodeAnimation(this.board), callback);
		}

	};


	abstract class Animation implements IAnimation
	{
		public before(renderer: BoardRenderer2D, pos: number) { }
		public abstract render(renderer: BoardRenderer2D, pos: number, delta: number);
		public done(renderer: BoardRenderer2D) {}
	};

	class MoveAnimation extends Animation
	{
		private type: JewelType;
		private x: number;
		private y: number;
		private dx: number;
		private dy: number;

		constructor(move: MoveEventItem)
		{
			super();
			this.type = move.type;
			this.x = move.fromX;
			this.y = move.fromY;
			this.dx = move.toX - move.fromX;
			this.dy = move.toY - move.fromY;
		}

		public before(renderer: BoardRenderer2D, pos: number)
		{
			pos = Math.sin(pos * Math.PI / 2);
			renderer.clearJewel(this.x + this.dx * pos, this.y + this.dy * pos);
		}

		public render(renderer: BoardRenderer2D, pos: number, delta: number)
		{
			pos = Math.sin(pos * Math.PI / 2);
			renderer.renderJewel(this.x + this.dx * pos, this.y + this.dy * pos, this.type);
		}
	};

	class RemoveAnimation extends Animation
	{
		private type: JewelType;
		private x: number;
		private y: number;

		constructor(remove: RemoveEventItem)
		{
			super();
			this.type = remove.type;
			this.x = remove.x;
			this.y = remove.y;
		}

		public before(renderer: BoardRenderer2D, pos: number)
		{
			renderer.clearJewel(this.x, this.y);
		}

		public render(renderer: BoardRenderer2D, pos: number, delta: number)
		{
			renderer.renderTransformed({
				col: this.x,
				row: this.y,
				type: this.type,
				scale: 1 - pos,
				rotate: pos * Math.PI * 2,
				globalAlpha: 1 - pos
			});
		}
	};

	class RefillAnimation extends Animation
	{
		private lastIndex = 0;

		constructor(private layout: JewelLayout, private numCols, private numRows)
		{
			super();
		}

		public render(renderer: BoardRenderer2D, pos: number, delta: number)
		{
			let currIndex = Math.floor(pos * this.numCols * this.numRows);
			for (let i = this.lastIndex; i < currIndex; i++) {
				let col = i % this.numCols;
				let row = Math.floor(i / this.numCols);
				renderer.clearJewel(col, row);
				renderer.renderJewel(this.layout[col][row], col, row);
			}
			this.lastIndex = currIndex;
			renderer.setCssTransforms("rotateX(" + (360 * pos) + "deg)");
		}

		public done(renderer: BoardRenderer2D)
		{
			renderer.clearCssTransforms();
		}
	};

	class LevelUpAnimation extends Animation
	{
		public constructor()
		{
			super();
		}

		public before(renderer: BoardRenderer2D, pos: number)
		{
			let numRows = renderer.getNumRows();
			let numCols = renderer.getNumCols();
			let max = Math.floor(pos * numRows * 2);
			for (let y = 0, x = max; y < numRows; y++ , x--) {
				if (x >= 0 && x < numCols) { // boundary check
					renderer.clearJewel(x, y);
					renderer.renderJewel(x, y);
				}
			}
		}

		public render(renderer: BoardRenderer2D, pos: number, delta: number)
		{
			let board = renderer.getBoard();
			let numRows = renderer.getNumRows();
			let numCols = renderer.getNumCols();
			let max = Math.floor(pos * numRows * 2);
			let ctx = renderer.getContext();
			ctx.save(); // remember to save state
			ctx.globalCompositeOperation = "lighter";
			for (let y = 0, x = max; y < numRows; y++ , x--) {
				if (x >= 0 && x < numCols) { // boundary check
					renderer.renderTransformed({
						col: x,
						row: y,
						scale: 1.1
					});
				}
			}
			ctx.restore();
		}

		public done(renderer: BoardRenderer2D)
		{
			super.done(renderer);
		}
	}

	class GameOverAnimation extends Animation
	{
		public constructor() {
			super();
		}

		public render(renderer: BoardRenderer2D, pos: number, delta: number)
		{
			renderer.setCanvasPos(
				0.2 * pos * (Math.random() - 0.5) + "em",
				0.2 * pos * (Math.random() - 0.5) + "em"
			);
		}

		public done(renderer: BoardRenderer2D)
		{
			renderer.setCanvasPos("0", "0");
		}
	}

	type ExplodePiece = {
		type: JewelType,
		pos: { x: number, y: number },
		vel: { x: number, y: number },
		rot: number
	};

	class ExplodeAnimation extends Animation
	{
		private pieces: ExplodePiece[];

		public constructor(board: IBoard)
		{
			super();

			let numCols = board.numCols;
			let numRows = board.numRows;
			let pieces = [];
			for (let x = 0; x < numCols; x++) {
				for (let y = 0; y < numRows; y++) {
					let piece = {
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
					}
					pieces.push(piece);
				}
			}
			this.pieces = pieces;
		}

		public before(renderer: BoardRenderer2D, pos: number)
		{
			renderer.clearCanvas();
		}

		public render(renderer: BoardRenderer2D, pos: number, delta: number)
		{
//			renderer.explodePieces(this.pieces, pos, delta);
			let ctx = renderer.getContext();
			let numCols = renderer.getNumCols();
			//let numRows = renderer.getNumRows();
			let jewelSize = renderer.getJewelSize();

			for (let i = 0, count = this.pieces.length; i < count; i++) {
				let piece = this.pieces[i];

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
				renderer.renderJewel(
					piece.pos.x - 0.5,
					piece.pos.y - 0.5,
					piece.type,
				);
				ctx.restore();
			}
		}
	}

	if (JewelWarrior.factory) {
		JewelWarrior.factory.createRenderer = (config: GameConfig) => {
			return new BoardRenderer2D(config);
		};
	}
};
