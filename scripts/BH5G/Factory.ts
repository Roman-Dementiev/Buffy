namespace BubbleShoot
{
	export interface IFactory
	{
		createRenderer(): FrameRenderer<Game>;

		createSprite(): Sprite;
		createSpriteSheet(config: SpriteSheetConfig): SpriteSheet;

		createOnBoardBubble(row: number, col: number, type: number) : Bubble
		createCurrentBubble(type: number): Bubble;
	};

	abstract class BaseFactory implements IFactory
	{
		public createRenderer(): FrameRenderer<Game> { return null; }

		public abstract createSprite(): Sprite;
		public abstract createSpriteSheet(config: SpriteSheetConfig): SpriteSheet;

		public createCurrentBubble(type: number): Bubble {
			return this.createBubble(true, undefined, undefined, type);
		}

		public createOnBoardBubble(row: number, col: number, type: number): Bubble {
			return this.createBubble(false, row, col, type);
		}

		protected createBubbleSprite(current: boolean, type: number): Sprite {
			return this.createSprite();
		}

		protected createBubble(current: boolean, row: number, col: number, type: number): Bubble
		{
			let sprite = this.createBubbleSprite(current, type);
			let bubble = new Bubble(current, sprite, row, col, type);
			return bubble;
		}
	};

	class DomFactory extends BaseFactory
	{
		//public createRenderer(): FrameRenderer {
		//	return null;
		//}

		public createSprite(...classes: string[]): DomSprite
		{
			let sprite = new DomSprite();
			if (classes) {
				for (let className of classes) {
					sprite.addClass(className);
				}
			}
			return sprite;
		}

		protected createBubbleSprite(current: boolean, type: number): Sprite
		{
//			let sprite = this.createSprite('bubble');
			let sprite = this.createSprite();
			sprite.css({
				position: 'absolute',
				width: `${SPRITE_IMAGE_DIM}px`,
				height: `${SPRITE_IMAGE_DIM}px`,
				'background-image': `url(${BUBBLE_SPRITE_SHEET})`
			});

			(Bubble.spriteSheet as DomSpriteSheet).setSpriteImage(sprite, type);
			return sprite;
		}

		public createSpriteSheet(config: SpriteSheetConfig): SpriteSheet
		{
			return new DomSpriteSheet(config);
		}
	};

	export class CanvasFactory extends BaseFactory
	{
		public createRenderer(): FrameRenderer<Game> {
			return new FrameRenderer<Game>(new GameRenderer());
		}

		public createSprite(): Sprite {
			return new CanvasSprite();
		}

		public createSpriteSheet(config: SpriteSheetConfig): SpriteSheet {
			return new CanvasSpriteSheet(config);
		}
	};

	export class Factory
	{
		private static _instance: IFactory = null;
		public static get instance(): IFactory
		{
			if (!Factory._instance) {
				Factory.init();
			}
			return Factory._instance;
		}

		public static init(useCanvas: boolean = true)
		{
			if (useCanvas) {
				let canvas = document.createElement('canvas');
				if (!canvas) {
					useCanvas = false;
				}
			}

			if (useCanvas) {
				Factory._instance = new CanvasFactory();
			} else {
				Factory._instance = new DomFactory();
			}
		}

		public static createRenderer(): FrameRenderer<Game> {
			return Factory.instance.createRenderer();
		}

		public static createSprite(): Sprite {
			return Factory.instance.createSprite();
		}

		public static createSpriteSheet(config: SpriteSheetConfig): SpriteSheet {
			return Factory.instance.createSpriteSheet(config);
		}

		public static createCurrentBubble(type: number): Bubble {
			return Factory.instance.createCurrentBubble(type);
		}

		public static createOnBoardBubble(row: number, col: number, type: number): Bubble {
			return Factory.instance.createOnBoardBubble(row, col, type);
		}
	}
}
