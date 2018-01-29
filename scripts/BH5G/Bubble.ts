namespace BubbleShoot
{
	export const enum BubbleState {
		CURRENT = 1,
		ON_BOARD,
		FIRING,
		POPPING,
		FALLING,
		POPPED,
		FIRED,
		FALLEN
	};

	export class Bubble
	{
		private static _spriteSheet: SpriteSheet;
		public static get spriteSheet(): SpriteSheet { return Bubble._spriteSheet; }

		public static loadSpreadSheet(callback: Callback): SpriteSheet
		{
			Bubble._spriteSheet = Factory.createSpriteSheet({
				source: BUBBLE_SPRITE_SHEET,
				numTypes: NUM_BUBBLE_TYPES,
				numVariants: NUM_POP_PHASES,
				spriteWidth: SPRITE_IMAGE_DIM,
				spriteHeight: SPRITE_IMAGE_DIM
			});
			Bubble._spriteSheet.load(callback);
			return Bubble._spriteSheet;
		}

		private _sprite: Sprite;
		public get sprite(): Sprite { return this._sprite; }

		private _type: number;
		public get type(): number { return this._type; }

		public _row: number;
		public get row(): number { return this._row; }
		public set row(value: number) { this._row = value; }

		private _col: number;
		public get col(): number { return this._col; }
		public set col(value: number) { this._col = value; }

		private _stateStart: number;
		private _state: BubbleState;
		public get state(): BubbleState { return this._state; }
		public set state(state: BubbleState) {
			this._state = state;
			this._stateStart = Date.now();
		}
		public getTimeInState(): number {
			return Date.now() - this._stateStart;
		}

		public constructor(current: boolean, sprite: Sprite, row: number, col: number, type: number)
		{
			this._sprite = sprite;
			this._row = row;
			this._col = col;
			this._type = type;
			this.state = current ? BubbleState.CURRENT : BubbleState.ON_BOARD;
		}

		public getCoords(): Coords
		{
			let coords = {
				x: this.col * BUBBLE_DIMS / 2 + BUBBLE_HALF,
				y: this.row * ROW_HEIGHT + BUBBLE_HALF
			};
			return coords;
		}

		public animatePop(duration: number)
		{
			if (!GameRenderer.exists) {
				let top = this.type * this.sprite.height;
				let phaseDuration = duration / NUM_POP_PHASES;

				let type = this.type;
				let sprite = this.sprite as DomSprite;
				let spriteSheet = Bubble.spriteSheet as DomSpriteSheet;

				sprite.setProperty('transform', `rotate(${Math.random() * 360}deg)`);

				for (let phase = 1; phase < NUM_POP_PHASES; phase++) {
					setTimeout(() => {
						spriteSheet.setSpriteImage(sprite, type, phase);
					}, phase * phaseDuration);
				}

				setTimeout(() => {
					sprite.remove();
				}, duration);
			}
		}

		//public static animatePops(bubbles: Bubble[], delay: number, popDuration: number = kFastPopDuration, popInterval: number = kFastPopInterval) : number
		//{
		//	for (let bubble of bubbles) {
		//		setTimeout(() => {
		//			bubble.animatePop(popDuration);
		//		}, delay);
		//		delay += popInterval;
		//	}
		//	return delay + popDuration;
		//}
	};

};
