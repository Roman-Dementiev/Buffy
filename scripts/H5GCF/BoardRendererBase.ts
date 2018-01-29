namespace JewelWarrior
{
	export interface IAnimation
	{
		before(renderer: BoardRendererBase, pos: number);
		render(renderer: BoardRendererBase, pos: number, delta: number);
		done(renderer: BoardRendererBase);
	};

	type AnimationRec = {
		animation: IAnimation,
		runTime: number,
		startTime: number,
		pos: number,
		prevPos?: number
		callback: Callback;
	};


	export abstract class BoardRendererBase
	{
		protected canvas: HTMLCanvasElement;
		protected numCols: number;
		protected numRows: number;
		protected jewelSize: number;
		protected board: IBoard;
		protected cursor: Cursor = null;
		protected paused: boolean = false;
		protected animations: AnimationRec[] = [];
		private previousCycle: number;

		public constructor(config: GameConfig)
		{
			this.numCols = config.numCols;
			this.numRows = config.numRows;
		}

//		public getContext() { return this.context; }
		public getNumRows() { return this.numRows; }
		public getNumCols() { return this.numCols; }
		public getJewelSize() { return this.jewelSize; }
		public getBoard() { return this.board; }

		public initialize(boardElement: Element, callback: Callback)
		{
			this.paused = false;
			if (!this.canvas) {
				let canvas = document.createElement("canvas");
				Dom.addClass(canvas, "board");

				let rect = boardElement.getBoundingClientRect();
				canvas.width = rect.width;
				canvas.height = rect.height;

				let background = this.createBackground();
				if (background) {
					boardElement.appendChild(background);
				}
				boardElement.appendChild(canvas);

				this.canvas = canvas;
				this.initContext(callback);
			} else {
				if (callback) {
					callback();
				}
			}
		}

		protected createBackground(): HTMLCanvasElement {
			return null;
		}

		protected abstract initContext(callback: Callback);

		public start(board: IBoard)
		{
			this.board = board;
			this.previousCycle = Date.now();
			requestAnimationFrame(() => this.renderCycle());
		}

		public pause()
		{
			this.paused = true;
		}

		public resume(pauseTime: number)
		{
			this.paused = false;
			for (let anim of this.animations) {
				anim.startTime += pauseTime;
			}
		}

		protected renderCycle()
		{
			var now = Date.now();
			if (!this.paused) {
				this.render(now, this.previousCycle);
			}
			this.previousCycle = now;
			requestAnimationFrame(() => this.renderCycle());
		}

		protected abstract render(time: number, prevTime: number);

		public setCursor(col: number, row: number, selected: boolean)
		{
			this.cursor = {
				row: row,
				col: col,
				selected: selected
			};
		}

		public unsetCursor()
		{
			this.cursor = null;
		}

		protected addAnimation(runTime: number, animation: IAnimation, callback: Callback)
		{
			var anim = {
				animation: animation,
				runTime: runTime,
				startTime: Date.now(),
				pos: 0,
				callback: callback
			};
			this.animations.push(anim);
		}

		protected renderAnimations(time: number, prevTime: number)
		{
			let anims = this.animations.slice(0); // copy list
			let count = anims.length;

			// call before() function
			for (let i = 0; i < count; i++) {
				let anim = anims[i];
				anim.animation.before(this, anim.pos);
				anim.prevPos = anim.pos;
				let animTime = (prevTime - anim.startTime);
				anim.pos = animTime / anim.runTime;
				anim.pos = Math.max(0, Math.min(1, anim.pos));
			}

			this.animations = []; // reset animation list

			for (let i = 0; i < count; i++) {
				let anim = anims[i];
				anim.animation.render(this, anim.pos, anim.pos - anim.prevPos);
				if (anim.pos >= 1) {
					anim.animation.done(this);
					if (anim.callback) {
						anim.callback();
					}
				} else {
					this.animations.push(anim);
				}
			}
		}

		public setCssTransforms(value: string)
		{
			Dom.transform(this.canvas, value);
		}

		public clearCssTransforms()
		{
			//this.canvas.style.webkitTransform = "";
			this.setCssTransforms("");
		}

		public setCanvasPos(left: string, top: string)
		{
			this.canvas.style.left = left;
			this.canvas.style.top = top;
		}

	};

	export abstract class BoardRenderer<Context> extends BoardRendererBase
	{
		constructor(config: GameConfig) {
			super(config);
		}

		protected context: Context;
		public getContext(): Context { return this.context; }
	};

};
