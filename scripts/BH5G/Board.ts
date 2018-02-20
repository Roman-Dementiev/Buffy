namespace BubbleShoot
{
	export type Row = Bubble[];

	export type BoardConfig = {
		numRows?: number,
		numCols?: number,
		generator?: BubbleGenerator
		createLayout?: any
	};

	const kDefaultBoardConfig = {
		numRows: 9,
		numCols: 32,
		createLayout: true
	};

	export class Board
	{
		private _ui: UIElement
		public get ui(): UIElement { return this._ui; }

		private _rows: Row[];
		public get numRows(): number { return this._rows.length; }
		private _numCols;
		private get numCols(): number { return this._numCols; }

		public constructor(config?: BoardConfig, ui: UIElement = null)
		{
			config = Dwarf.mergeDefaults(config, kDefaultBoardConfig);

			let generator: BubbleGenerator = null;
			if (config.generator !== undefined) {
				generator = config.generator;
			} else {
				generator = BubbleGenerator.create(config.createLayout);
			}

			this._ui = ui;
			this._rows = this.createLayout(config.numRows, config.numCols, generator);
			this._numCols = config.numCols;
		}

		public isEmpty(): boolean
		{
			return this.getBubbles().length == 0;
		}

//		public getRows(): Row[] { return this._rows; }
		public getRow(rowNum: number): Row
		{
			if (rowNum >= 0 && rowNum < this._rows.length) {
				return this._rows[rowNum];
			} else {
				return null;
			}
		}

		public getBubbleAt(rowNum: number, colNum: number): Bubble
		{
			let row = this.getRow(rowNum);
			if (row && colNum >= 0 && colNum < row.length) {
				return row[colNum];
			} else {
				return null;
			}
		}

		private putBubbleAt(bubble: Bubble, rowNum: number, colNum: number): void
		{
			if (!this._rows[rowNum])
				this._rows[rowNum] = [];
			this._rows[rowNum][colNum] = bubble;
		}

		public deleteBubbleAt(rowNum: number, colNum: number)
		{
			let row = this.getRow(rowNum);
			if (row) {
				delete row[colNum];
			}
		};

		public deleteBubbles(bubbles: Bubble[])
		{
			for (let bubble of bubbles) {
				if (typeof bubble.row !== 'undefined' && typeof bubble.col !== 'undefined') {
					this.deleteBubbleAt(bubble.row, bubble.col);
				}
			}
		}

		public clear()
		{
			let rows = this._rows;
			for (var rowNum = 0; rowNum < rows.length; rowNum++) {
				let row = rows[rowNum];
				if (row) {
					for (var colNum = 0; colNum < row.length; colNum++) {
						delete row[colNum];
					}
				}
			}
		}

		public addBubble(bubble: Bubble, coords: Coords)
		{
			var rowNum = Math.floor(coords.y / ROW_HEIGHT);
			var colNum = coords.x /BUBBLE_DIMS * 2;
			if (rowNum % 2 == 1)
				colNum -= 1;
			colNum = Math.round(colNum / 2) * 2;
			if (rowNum % 2 == 0)
				colNum -= 1;
			this.putBubbleAt(bubble, rowNum, colNum);
			bubble.row = rowNum;
			bubble.col = colNum;
		}

		public getBubbles(): Bubble[]
		{
			let bubbles: Bubble[] = [];
			let rows = this._rows;
			for (var rowNum = 0; rowNum < rows.length; rowNum++) {
				let row = rows[rowNum];
				if (row) {
					for (var colNum = 0; colNum < row.length; colNum++) {
						var bubble = row[colNum];
						if (bubble) {
							bubbles.push(bubble);
						}
					}
				}
			};
			return bubbles;
		}

		public getTopRowBubbles(): Bubble[]
		{
			let bubbles = [];
			let topRow = this.getRow(0);
			if (topRow) {
				for (let col = 0; col < topRow.length; col++) {
					if (topRow[col])
						bubbles.push(topRow[col]);
				}
			}
			return bubbles;
		}

		public getBubblesAround(curRow: number, curCol: number): Bubble[]
		{
			var bubbles: Bubble[] = [];
			for (let rowNum = curRow - 1; rowNum <= curRow + 1; rowNum++) {
				for (let colNum = curCol - 2; colNum <= curCol + 2; colNum++) {
					let bubbleAt = this.getBubbleAt(rowNum, colNum);
					if (bubbleAt && !(colNum == curCol && rowNum == curRow))
						bubbles.push(bubbleAt);
				}
			}
			return bubbles;
		}

		public getGroup(bubble: Bubble, differentColor: boolean = false): Bubble[]
		{
			let found = new Board({
				numRows: this.numRows,
				numCols: this.numCols,
				createLayout: false
			});
			let list: Bubble[] = [];
			this.getGroupRecursive(bubble, found, list, differentColor);
			return list;
		}

		private getGroupRecursive(bubble: Bubble, found: Board, list: Bubble[], differentColor: boolean): void
		{
			let curRow = bubble.row;
			let curCol = bubble.col;
			if (found.getBubbleAt(curRow, curCol))
				return;

			found.putBubbleAt(bubble, curRow, curCol);
			list.push(bubble);

			let surrounding = this.getBubblesAround(curRow, curCol);
			for (let bubbleAt of surrounding) {
				if (differentColor || bubbleAt.type == bubble.type) {
					this.getGroupRecursive(bubbleAt, found, list, differentColor);
				};
			};
		}

		public findOrphans(): Bubble[]
		{
			let rows = this._rows;
			let connected: boolean[][] = [];
			for (let i = 0; i < rows.length; i++) {
				connected[i] = [];
			};
			for (let bubble of rows[0]) {
				if (bubble && !connected[0][bubble.col]) {
					let group = this.getGroup(bubble, true);
					for (let b of group) {
						connected[b.row][b.col] = true;
					}
				};
			};

			let orphaned: Bubble[] = [];
			for (let row of rows) {
				for (let bubble of row) {
					if (bubble && !connected[bubble.row][bubble.col]) {
						orphaned.push(bubble);
					};
				};
			};
			return orphaned;
		};

		private createLayout(numRows: number, numCols: number, generator: BubbleGenerator): Row[]
		{
			let rows: Row[] = new Array<Row>(numRows);
			if (generator) {
				for (let rowNum = 0; rowNum < numRows; rowNum++) {
					let row: Row = [];
					var startCol = rowNum % 2 == 0 ? 1 : 0;
					for (var colNum = startCol; colNum < numCols; colNum += 2) {
						var bubble = generator.createOnBoardBubble(rowNum, colNum);
						row[colNum] = bubble;
						if (this._ui) {
							bubble.sprite.appendTo(this._ui);
						}
						var left = colNum * BUBBLE_DIMS / 2;
						var top = rowNum * ROW_HEIGHT;
						bubble.sprite.setPosition(left, top);
					};
					rows[rowNum] = row;
				};
			}
			return rows;
		}
	};
};
