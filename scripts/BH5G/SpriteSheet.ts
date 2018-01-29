namespace BubbleShoot
{
	type Callback = () => void;

	export interface SpriteSheetConfig {
		source: string;
		numTypes?: number;
		numVariants?: number;
		spriteWidth?: number;
		spriteHeight?: number;
	};

	export interface SpriteSheet extends SpriteSheetConfig
	{
		load(callback?: Callback);
		//drawSprite(context: any, sprite: Sprite, type: number, variant?: number);
	};

	export class BaseSpriteSheet
	{
		config: SpriteSheetConfig;

		public get source(): string { return this.config.source; }
		public get numTypes(): number { return this.config.numTypes; }
		public get numVariants(): number { return this.config.numVariants; }

		public get spriteWidth(): number { return this.config.spriteWidth; }
		public get spriteHeight(): number { return this.config.spriteHeight; }

		protected constructor(config: SpriteSheetConfig)
		{
			this.config = Sandbox.copy(config);
		}

		protected setup(sheetWidth: number = 0, sheetHeight: number = 0)
		{
			let config = this.config;
			if (!config.numTypes) {
				config.numTypes = 1;
			}
			if (!config.numVariants) {
				config.numVariants = 1;
			}

			if (!config.spriteWidth && sheetWidth > 0) {
				config.spriteWidth = sheetWidth / config.numVariants;
			}
			if (!config.spriteHeight && sheetHeight > 0) {
				config.spriteHeight = sheetHeight / config.numTypes;
			}
		}

		protected getImageCoord(type: number, variant: number)
		{
			return {
				y: type * this.spriteHeight,
				x: variant * this.spriteWidth
			}
		}
	}

	export class DomSpriteSheet extends BaseSpriteSheet implements SpriteSheet
	{
		public constructor(config: SpriteSheetConfig) {
			super(config);
		}

		public load(callback?: Callback)
		{
			this.setup();
			if (callback) {
				callback();
			}
		}

		public drawSprite(context: any, sprite: Sprite, type: number, variant?: number) {
			this.setSpriteImage(sprite as DomSprite, type, variant);
		}

		public setSpriteImage(sprite: DomSprite, type: number, variant?: number)
		{
			if (!variant) variant = 0;

			let imagePos = this.getImageCoord(type, variant);
			sprite.setProperty('background-position', `-${imagePos.x}px -${imagePos.y}px`);
		}
	}

	export class CanvasSpriteSheet extends BaseSpriteSheet implements SpriteSheet
	{
		private _image: HTMLImageElement;
		public get image(): HTMLImageElement { return this._image; }

		public constructor(config: SpriteSheetConfig) {
			super(config);
		}

		load(callback?: Callback)
		{
			this._image = new Image();
			this._image.onload = () => {
				//console.log("CanvasSpriteSheet loaded: source=", this.source, "width=", this._image.width, "height=", this._image.height);
				this.setup(this._image.width, this._image.height);
				if (callback) {
					callback();
				}
			}
			this._image.src = this.source;
		}

		//public drawSprite(context: any, sprite: Sprite, type: number, variant?: number) {
		//	this.renderSprite(context, sprite, type, variant);
		//}

		public renderSprite(context: CanvasRenderingContext2D, sprite: Sprite, type: number, variant?: number)
		{
			if (!type) type = 0;
			if (!variant) variant = 0;

			let offset = {
				x: sprite.left + sprite.width / 2,
				y: sprite.top + sprite.height / 2
			}
			let imagePos = this.getImageCoord(type, variant);

			context.translate(offset.x, offset.y);
			context.drawImage(this._image, imagePos.x, imagePos.y, this.spriteWidth, this.spriteHeight,
				-sprite.width / 2, -sprite.height / 2, this.spriteWidth, this.spriteHeight);
			context.translate(-offset.x, -offset.y);
		}
	}
}
