namespace JewelWarrior
{
	type ChainLength = number;
//	const kMinChainLength = 3;

	export class BoardService implements IBoardSecvice
	{
		private config: GameConfig;
		private _board: IBoard;
		private generator: ILayoutGenerator;

		public get board(): IBoard { return this._board; }
		public get numRows() { return this.config.numRows; }
		public get numCols() { return this.config.numCols; }
		public get numJewelTypes() { return this.config.numJewelTypes; }
		public get baseScore() { return this.config.baseScore; }

		constructor(config: GameConfig)
		{
			this.config = Dwarf.mergeDefaults(config, kDefaultGameConfig);
			this.generator = LayoutGenerator.configure(this.config);
		}

		public initialize(startJewels: JewelLayout, callback: Callback): void
		{
			this._board = factory.createBoard(this.config);

			if (startJewels) {
				this._board.setLayout(startJewels);
			} else {
				this.fillBoard();
			}

			if (callback) {
				callback();
			}
		}


		public getLayout(): JewelLayout {
			return this._board.getLayout();
		}

		private fillBoard(): void
		{
			do {
				this._board.setLayout(this.generator.generateLayout(this.config));
			}
			while (!this.hasMoves());
		}

		// returns true if at least one match can be made
		private hasMoves(): boolean
		{
			for (let col = 0; col < this.numCols; col++) {
				for (let row = 0; row < this.numRows; row++) {
					if (this.canJewelMove(col, row)) {
						return true;
					}
				}
			}
			return false;
		}

		// returns true if (x,y) is a valid position and if
		// the jewel at (x,y) can be swapped with a neighbor
		private canJewelMove(col: number, row: number): boolean
		{
			return (col > 0 && this.canSwap(col, row, col - 1, row)) ||
				(col < this.numCols - 1 && this.canSwap(col, row, col + 1, row)) ||
				(row > 0 && this.canSwap(col, row, col, row - 1)) ||
				(row < this.numRows - 1 && this.canSwap(col, row, col, row + 1));
		}

		// returns true if (x1,y1) is adjacent to (x2,y2)
		private static isAdjacent(col1: number, row1: number, col2: number, row2: number)
		{
			var dx = Math.abs(col1 - col2),
				dy = Math.abs(row1 - row2);
			return (dx + dy === 1);
		}

		// returns true if (x1,y1) can be swapped with (x2,y2)
		// to form a new match
		private canSwap(col1: number, row1: number, col2: number, row2: number): boolean
		{
			let type1 = this._board.getJewelAt(col1, row1),
				type2 = this._board.getJewelAt(col2, row2);

			if (!BoardService.isAdjacent(col1, row1, col2, row2)) {
				return false;
			}
			// temporarily swap jewels
			this._board.putJewelAt(col1, row1, type2);
			this._board.putJewelAt(col2, row2, type1);

			let result = this.checkChain(col2, row2) > 2 || this.checkChain(col1, row1) > 2;

			// swap back
			this._board.putJewelAt(col1, row1, type1);
			this._board.putJewelAt(col2, row2, type2);
			return result;
		}

		// returns the number jewels in the longest chain
		// that includes (x,y)
		private checkChain(col: number, row: number): ChainLength
		{
			let type = this._board.getJewelAt(col, row),
				left = 0, right = 0,
				down = 0, up = 0;

			// look right
			while (type === this._board.getJewelAt(col + right + 1, row)) {
				right++;
			}
			// look left
			while (type === this._board.getJewelAt(col - left - 1, row)) {
				left++;
			}
			// look up
			while (type === this._board.getJewelAt(col, row + up + 1)) {
				up++;
			}
			// look down
			while (type === this._board.getJewelAt(col, row - down - 1)) {
				down++;
			}

			return Math.max(left + 1 + right, up + 1 + down);
		}

		// returns a two-dimensional map of chain-lengths
		private getChains(): ChainLength[][]
		{
			let chains: ChainLength[][] = [];
			for (let col = 0; col < this.numCols; col++) {
				chains[col] = [];
				for (let row = 0; row < this.numRows; row++) {
					chains[col][row] = this.checkChain(col, row);
				}
			}
			return chains;
		}

		private check(events?: BoardEvent[]): BoardEvent[]
		{
			let chains = this.getChains(),
				hadChains = false,
				score = 0,
				removed: RemoveEventItem[] = [],
				moved: MoveEventItem[] = [],
				gaps: number[] = [];

			for (let col = 0; col < this.numCols; col++) {
				gaps[col] = 0;
				for (let row = this.numRows - 1; row >= 0; row--) {
					let jewel = this._board.getJewelAt(col, row);
					let chainLen = chains[col][row];
					if (chainLen >= this.config.chainLength) {
						hadChains = true;
						gaps[col]++;
						removed.push({
							x: col,
							y: row,
							type: jewel
						});

						// add points to score
						score += this.baseScore * Math.pow(2, (chainLen - 3));

					} else if (gaps[col] > 0) {
						moved.push({
							toX: col,
							toY: row + gaps[col],
							fromX: col,
							fromY: row,
							type: jewel
						});
						this._board.putJewelAt(col, row + gaps[col], jewel);
					}
				}
			}

			// fill from top
			for (let col = 0; col < this.numRows; col++) {
				for (let row = 0; row < gaps[col]; row++) {
					let jewel = this.generator.getNextJewel();
					this._board.putJewelAt(col, row, jewel);
					moved.push({
						toX: col,
						toY: row,
						fromX: col,
						fromY: row - gaps[col],
						type: jewel
					});
				}
			}

			//console.log("check pass: hadChains=", hadChains, ", removed=", removed, ", moved=", removed, ", score=", score);

			events = events || [];
			if (hadChains) {
				events.push({
					type: BoardEventType.Remove,
					data: removed
				});
				events.push({
					type: BoardEventType.Score,
					data: score
				});
				events.push({
					type: BoardEventType.Move,
					data: moved
				});

				// refill if no more moves
				if (!this.hasMoves()) {
					this.fillBoard();
					events.push({
						type: BoardEventType.Refill,
						data: this.getLayout()
					});
				}

				//console.log("events so far: %o", events)
				return this.check(events);
			} else {
				return events;
			}
		}
		

		// if possible, swaps (x1,y1) and (x2,y2) and
		// calls the callback function with list of board events
		public swap(col1: number, row1: number, col2: number, row2: number, callback?: Callback): void
		{
			let events: BoardEvent[] = [];

			if (BoardService.isAdjacent(col1, row1, col2, row2)) {
				let jewel1 = this._board.getJewelAt(col1, row1);
				let jewel2 = this._board.getJewelAt(col2, row2);

				let swap1 = {
					type: BoardEventType.Move,
					data: [{
						type: jewel1,
						fromX: col1, fromY: row1,
						toX: col2, toY: row2
					}, {
						type: jewel2,
						fromX: col2, fromY: row2,
						toX: col1, toY: row1
					}]
				};
				events.push(swap1);

				if (this.canSwap(col1, row1, col2, row2)) {
					// swap the jewels
					this._board.putJewelAt(col1, row1, jewel2);
					this._board.putJewelAt(col2, row2, jewel1);

					// check the board and get list of events
					events = events.concat(this.check());
					//console.log("events final: {", events, "}");
				} else {
					let swap2 = {
						type: BoardEventType.Move,
						data: [{
							type: jewel2,
							fromX: col1, fromY: row1,
							toX: col2, toY: row2
						}, {
							type: jewel1,
							fromX: col2, fromY: row2,
							toX: col1, toY: row1
						}]
					};

					events.push(swap2, { type: BoardEventType.BadSwap, data: null });
				}
				if (callback) {
					callback(events);
				}
			}
		}
	};

	if (JewelWarrior.factory) {
		JewelWarrior.factory.createService = (config: GameConfig) => {
			return new BoardService(config);
		};
	}
};
