//namespace JewelWarrior
//{
//	export type JewelGL = {
//		x: number,
//		y: number,
//		type: JewelType,
//		random: number,
//		scale: number
//	};
//	export class BoardGL implements IBoard
//	{
//		public jewels: JewelGL[];
//		public constructor(
//			public readonly numCols: number,
//			public readonly numRows: number,
//			jewels: JewelLayout = null)
//		{
//			if (jewels) {
//				this.setLayout(jewels);
//			} else {
//				let count = numRows * numCols;
//				this.jewels = new Array<JewelGL>(count);
//				for (let i = 0; i < count; i++) {
//					this.jewels[i] = null;
//				}
//			}
//		}
//		public getLayout(): JewelLayout
//		{
//			let layout = [];
//			let jewels = this.jewels;
//			let index = 0;
//			for (let col = 0; col < this.numCols; col++) {
//				let column = [];
//				layout.push(column);
//				for (let row = 0; row < this.numRows; row++) {
//					let jewel = jewels[index++];
//					column.push(jewel.type);
//				}
//			}
//			return layout;
//		}
//		public setLayout(layout: JewelLayout)
//		{
//			checkLayout(layout, this.numCols, this.numRows);
//			let jewels = [];
//			let index = 0;
//			for (let col = 0; col < this.numCols; col++) {
//				let column = layout[col];
//				for (let row = 0; row < this.numRows; row++) {
//					let jewel = this.createJewel(col, row, column[row]);
//					jewels.push(jewel);
//				}
//			}
//			this.jewels = jewels;
//		}
//		private createJewel(x: number, y: number, type: JewelType): JewelGL
//		{
//			if (type < 0)
//				return null;
//			return {
//				x: x,
//				y: y,
//				type: type,
//				random: Math.random() * 2 - 1,
//				scale: 1
//			};
//		}
//		public getJewel(col: number, row: number, createType: JewelType = kNoJewel): JewelGL
//		{
//			let jewel: JewelGL = getJewelAt(col, row);
//			if (!jewel && createType >= 0) {
//				jewel = this.createJewel(col, row, createType);
//				this.jewels[index] = jewel;
//			}
//			if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
//				let index = col * this.numCols + row;
//				jewel = this.jewels[index];
//			}
//			return jewel;
//		}
//		public getJewelAt(col: number, row: number): JewelType
//		{
//			if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
//				let index = col * this.numCols + row;
//				let jewel = this.jewels[index];
//				return jewel ? jewel.type : kNoJewel;
//			} else {
//				return kNoJewel;
//			}
//		}
//		public putJewelAt(col: number, row: number, type: JewelType): void
//		{
//			if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
//				let index = col * this.numCols + row;
//				let jewel = this.jewels[index];
//				if (jewel) {
//					jewel.type = type;
//				} else {
//					this.jewels[index] = this.createJewel(col, row, type);
//				}
//			}
//		}
//		public forEachJewel(fn: (j: JewelGL) => void): void
//		{
//			for (let jewel of this.jewels) {
//				if (jewel) {
//					fn(jewel);
//				}
//			}
//		}
//		public toString()
//		{
//			let layout = this.getLayout();
//			return layoutToString(layout, this.numCols, this.numRows);
//		}
//		public print(): void
//		{
//			let layout = this.getLayout();
//			printLayout(layout, this.numCols, this.numRows);
//		}
//	};
//	if (JewelWarrior.factory) {
//		JewelWarrior.factory.createBoard = (config: GameConfig) =>
//		{
//			return new BoardGL(config.numCols, config.numRows);
//		};
//	}
//};
//# sourceMappingURL=Board.GL.js.map