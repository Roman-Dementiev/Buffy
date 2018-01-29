namespace BubbleShoot
{
	export class BubbleGenerator
	{
		private static _random: BubbleGenerator;
		public static get random(): BubbleGenerator
		{
			if (!BubbleGenerator._random) {
				BubbleGenerator._random = new BubbleGenerator();
			}
			return BubbleGenerator._random;
		}

		public createCurrentBubble(): Bubble
		{
			let type = this.getNextBubbleType();
			return Factory.createCurrentBubble(type);
		}

		public createOnBoardBubble(row: number, col: number): Bubble
		{
			let type = this.getNextBubbleType();
			return Factory.createOnBoardBubble(row, col, type);
		}

		public getNextBubbleType(): number
		{
			return Math.floor(Math.random() * NUM_BUBBLE_TYPES);
		}

		public static sameColor(type: number)
		{
			return new SameColorGanerator(type);
		}

		public static create(config: any): BubbleGenerator
		{
			if (typeof config === 'undefined')
				return BubbleGenerator.random;
			if (config === null)
				return null;

			if (typeof config === 'boolean') {
				return config ? BubbleGenerator.random : null;
			}

			if (typeof config === 'string') {
				return BubbleGenerator.createGenerator(config, {});
			}

			if (typeof config === 'object' && typeof config.generator === 'string') {
				return BubbleGenerator.createGenerator(config.generator, config);
			}

			throw "Invalit bubble generator config";
		}

		private static createGenerator(type: string, otions: any): BubbleGenerator
		{
			switch (type.toLowerCase())
			{
				case 'random':
					return BubbleGenerator.random;

				case 'same':
				case 'samecolor':
					let type: number = otions.color ? otions.color : 0;
					return new SameColorGanerator(type);

				default:
					throw "Unknown bubble generator type";
			}
		}
	};

	class SameColorGanerator extends BubbleGenerator
	{
		public constructor(private type: number) { super(); }

		public getNextBubbleType(): number
		{
			return this.type;
		}
	}
};
