namespace JewelWarrior
{
	export interface IJewelGenerator
	{
		getNextJewel(): JewelType;
	};

	export class NoJewelGenerator implements IJewelGenerator
	{
		public static readonly instance = new NoJewelGenerator();
		private constructor() { }

		public getNextJewel(): JewelType {
			return kNoJewel;
		}
	}

	export class RandomJewelGenerator implements IJewelGenerator
	{
		constructor(protected numJewelTypes: number) { }

		public getNextJewel(): JewelType {
			return Math.floor(Math.random() * this.numJewelTypes);
		}
	}

	export interface ILayoutGenerator extends IJewelGenerator
	{
		generateLayout(config: GameConfig, dontCheckChains?: boolean): JewelLayout;
		generateJewel(col: number, row: number): JewelType;
	};

	export class LayoutGenerator implements ILayoutGenerator
	{
		protected jewelGenerator: IJewelGenerator;
		protected startLayout: JewelLayout;

		public constructor(jewelGenerator: IJewelGenerator, startLayout?: JewelLayout)
		{
			this.jewelGenerator = jewelGenerator ? jewelGenerator : NoJewelGenerator.instance;
			this.startLayout = startLayout;
		}

		public static configure(config: GameConfig, setInConfig = false): ILayoutGenerator
		{
			let generator: ILayoutGenerator;
			let startLayout: JewelLayout;

			if (config.generator) {
				return config.generator;
			}

			if (typeof config.layout === 'string') {
				switch (config.layout)
				{
					// TODO
				}
			} else {
				startLayout = config.layout;
			}

			if (!generator) {
				generator = new RandomLayoutGenerator(config.numJewelTypes, startLayout);
			}
			if (setInConfig) {
				config.generator = generator;
			}

			return generator;
		}


		public generateJewel(col: number, row: number): JewelType {
			return this.getNextJewel();
		}

		public getNextJewel(): JewelType {
			return this.jewelGenerator.getNextJewel();
		}

		public generateLayout(config: GameConfig, dontCheckChains?: boolean): JewelLayout
		{
			let layout: JewelLayout;
			if (this.startLayout) {
				layout = this.startLayout;
				this.startLayout = null;
			} else {
				let checkLength = dontCheckChains ? 0 : config.chainLength;
				layout = LayoutGenerator.createLayout(config.numCols, config.numRows, checkLength, this);
			}
			return layout;
		}

		private static makesChain(jewels: JewelLayout, jewel: JewelType, col: number, row: number, chainLength: number)
		{
			let rowLen = 1;
			for (let i = 1; i < chainLength && i <= col; i++) {
				if (jewels[col-i][row] != jewel)
					break;
				rowLen++;
			}
			if (rowLen >= chainLength)
				return true;

			let colLen = 1;
			for (let j = 1; j < chainLength && j <= row; j++) {
				if (jewels[col][row-j] != jewel)
					break;
				colLen++;
			}
			return colLen >= chainLength;
		}

		public static createLayout(numCols: number, numRows: number, chainLength: number, generator: ILayoutGenerator): JewelLayout
		{
			let jewels: JewelLayout = [];
			for (let col = 0; col < numCols; col++) {
				let column = [];
				jewels.push(column);
				for (let row = 0; row < numRows; row++) {
					let jewel = generator.generateJewel(col, row);

					if (chainLength > 1) {
						while (LayoutGenerator.makesChain(jewels, jewel, col, row, chainLength)) {
							jewel = generator.generateJewel(col, row);
						}
					}
					column.push(jewel);
				}
			}
			return jewels;
		}
	};

	export class RandomLayoutGenerator extends LayoutGenerator
	{
		constructor(protected numJewelTypes: number, startLayout?: JewelLayout) {
			super(new RandomJewelGenerator(numJewelTypes), startLayout);
		}
	};
}
