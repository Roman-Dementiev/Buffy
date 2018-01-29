namespace JewelWarrior
{
	export class Board implements IBoard
	{
		constructor(
			public readonly numCols: number,
			public readonly numRows: number,
			private jewels: JewelLayout = null)
		{
			if (jewels) {
				checkLayout(jewels, numCols, numRows);
			}
		}

		public getLayout(): JewelLayout
		{
			let jewels = this.jewels;
			let layout = [];
			for (let col = 0; col < this.numCols; col++) {
				let column = [];
				layout.push(column);
				for (let row = 0; row < this.numRows; row++) {
					let jewel = jewels[col][row];
					column.push(jewel);
				}
			}
			return layout;
		}

		public setLayout(layout: JewelLayout)
		{
			checkLayout(layout, this.numCols, this.numRows);
			this.jewels = layout;
		}

		public getJewelAt(col: number, row: number): JewelType
		{
			if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
				return this.jewels[col][row];
			} else {
				return kNoJewel;
			}
		}

		public putJewelAt(col: number, row: number, jewel: JewelType): void
		{
			if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
				this.jewels[col][row] = jewel;
			}
		}

		public toString() {
			return layoutToString(this.jewels, this.numCols, this.numRows);
		}

		public print(): void {
			printLayout(this.jewels, this.numCols, this.numRows);
		}
	};

	if (JewelWarrior.factory) {
		JewelWarrior.factory.createBoard = (config: GameConfig) => {
			return new Board(config.numCols, config.numRows);
		};
	}
};
