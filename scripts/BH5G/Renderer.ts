namespace BubbleShoot
{
	const kRendererFrameRate = 40;

	export interface IRenderer<Source>
	{
		render(source: Source);
	}

	export class FrameRenderer<Source>
	{
		private source: Source = null;
		private renderer: IRenderer<Source>;
		private requestAnimationID: number;

		public constructor(renderer: IRenderer<Source>)
		{
			this.renderer = renderer;
		}

		public start(source: Source)
		{
			this.source = source;

			if (!this.requestAnimationID) {
				//	this.requestAnimationID = setTimeout(() => this.renderFrame(), kRendererFrameRate);
				this.requestAnimationID = requestAnimationFrame(() => this.renderFrame());
			}
		}

		public stop()
		{
			this.source = null;
		}

		private renderFrame(): void
		{
			if (this.source != null) {
				this.renderer.render(this.source);

			//	this.requestAnimationID = setTimeout(() => this.renderFrame(), kRendererFrameRate);
				this.requestAnimationID = requestAnimationFrame(() => this.renderFrame());
			} else {
				this.requestAnimationID = undefined;
			}
		}
	};

	export class GameRenderer implements IRenderer<Game>
	{
		private static _instance: FrameRenderer<Game>;
		public static get instance(): FrameRenderer<Game>
		{
			if (typeof GameRenderer._instance === 'undefined') {
				GameRenderer._instance = Factory.createRenderer();
			}
			return GameRenderer._instance;
		}
		public static get exists(): boolean { return GameRenderer.instance != null; }

		private canvas: HTMLCanvasElement;
		private context: CanvasRenderingContext2D;

		public constructor()
		{
			let canvas = document.createElement('canvas');
			$(canvas).addClass('game_canvas');
			UI.gameArea.prepend(canvas);
			$(canvas).attr('width', $(canvas).width());
			$(canvas).attr('height', $(canvas).height());

			this.canvas = canvas;
			this.context = canvas.getContext("2d");
		}

		public render(game: Game)
		{
			let canvas = this.canvas;
			let context = this.context;

			context.clearRect(0, 0, canvas.width, canvas.height);
			context.translate(BOARD_LEFT, 0);

			let bubbles = game.getBubbles();
			for (let bubble of bubbles) {
				this.renderBubble(bubble);
			}

			context.translate(-BOARD_LEFT, 0);
		}

		private renderBubble(bubble: Bubble)
		{
			if (bubble.sprite.updateFrame) {
				bubble.sprite.updateFrame();
			}

			let phase = 0;
			switch (bubble.state)
			{
				case BubbleShoot.BubbleState.POPPING:
					var timeInState = bubble.getTimeInState();
					if (timeInState < 80) {
						phase = 1;
					} else if (timeInState < 140) {
						phase = 2;
					} else {
						phase = 3;
					};
					break;
				case BubbleShoot.BubbleState.POPPED:
					return;
				case BubbleShoot.BubbleState.FIRED:
					return;
				case BubbleShoot.BubbleState.FALLEN:
					return;
			}

			let spriteSheet = Bubble.spriteSheet as CanvasSpriteSheet;
			spriteSheet.renderSprite(this.context, bubble.sprite, bubble.type, phase);
		}
	};

	//export class BSRenderer extends FrameRenderer<Game>
	//{
	//	private static _instance: FrameRenderer<Game>;
	//	public static get instance(): FrameRenderer<Game>
	//	{
	//		if (typeof BSRenderer._instance === 'undefined') {
	//			BSRenderer._instance = Factory.createRenderer();
	//		}
	//		return BSRenderer._instance;
	//	}
	//	public static get exists(): boolean { return BSRenderer.instance != null; }

	//	public constructor()
	//	{
	//		super(new GameRenderer());
	//	}
	//};
};

