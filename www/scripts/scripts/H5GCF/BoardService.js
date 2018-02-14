var JewelWarrior;
(function (JewelWarrior) {
    //	const kMinChainLength = 3;
    var BoardService = (function () {
        function BoardService(config) {
            this.config = Sandbox.mergeDefaults(config, JewelWarrior.kDefaultGameConfig);
            this.generator = JewelWarrior.LayoutGenerator.configure(this.config);
        }
        Object.defineProperty(BoardService.prototype, "board", {
            get: function () { return this._board; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoardService.prototype, "numRows", {
            get: function () { return this.config.numRows; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoardService.prototype, "numCols", {
            get: function () { return this.config.numCols; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoardService.prototype, "numJewelTypes", {
            get: function () { return this.config.numJewelTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BoardService.prototype, "baseScore", {
            get: function () { return this.config.baseScore; },
            enumerable: true,
            configurable: true
        });
        BoardService.prototype.initialize = function (startJewels, callback) {
            this._board = JewelWarrior.factory.createBoard(this.config);
            if (startJewels) {
                this._board.setLayout(startJewels);
            }
            else {
                this.fillBoard();
            }
            if (callback) {
                callback();
            }
        };
        BoardService.prototype.getLayout = function () {
            return this._board.getLayout();
        };
        BoardService.prototype.fillBoard = function () {
            do {
                this._board.setLayout(this.generator.generateLayout(this.config));
            } while (!this.hasMoves());
        };
        // returns true if at least one match can be made
        BoardService.prototype.hasMoves = function () {
            for (var col = 0; col < this.numCols; col++) {
                for (var row = 0; row < this.numRows; row++) {
                    if (this.canJewelMove(col, row)) {
                        return true;
                    }
                }
            }
            return false;
        };
        // returns true if (x,y) is a valid position and if
        // the jewel at (x,y) can be swapped with a neighbor
        BoardService.prototype.canJewelMove = function (col, row) {
            return (col > 0 && this.canSwap(col, row, col - 1, row)) ||
                (col < this.numCols - 1 && this.canSwap(col, row, col + 1, row)) ||
                (row > 0 && this.canSwap(col, row, col, row - 1)) ||
                (row < this.numRows - 1 && this.canSwap(col, row, col, row + 1));
        };
        // returns true if (x1,y1) is adjacent to (x2,y2)
        BoardService.isAdjacent = function (col1, row1, col2, row2) {
            var dx = Math.abs(col1 - col2), dy = Math.abs(row1 - row2);
            return (dx + dy === 1);
        };
        // returns true if (x1,y1) can be swapped with (x2,y2)
        // to form a new match
        BoardService.prototype.canSwap = function (col1, row1, col2, row2) {
            var type1 = this._board.getJewelAt(col1, row1), type2 = this._board.getJewelAt(col2, row2);
            if (!BoardService.isAdjacent(col1, row1, col2, row2)) {
                return false;
            }
            // temporarily swap jewels
            this._board.putJewelAt(col1, row1, type2);
            this._board.putJewelAt(col2, row2, type1);
            var result = this.checkChain(col2, row2) > 2 || this.checkChain(col1, row1) > 2;
            // swap back
            this._board.putJewelAt(col1, row1, type1);
            this._board.putJewelAt(col2, row2, type2);
            return result;
        };
        // returns the number jewels in the longest chain
        // that includes (x,y)
        BoardService.prototype.checkChain = function (col, row) {
            var type = this._board.getJewelAt(col, row), left = 0, right = 0, down = 0, up = 0;
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
        };
        // returns a two-dimensional map of chain-lengths
        BoardService.prototype.getChains = function () {
            var chains = [];
            for (var col = 0; col < this.numCols; col++) {
                chains[col] = [];
                for (var row = 0; row < this.numRows; row++) {
                    chains[col][row] = this.checkChain(col, row);
                }
            }
            return chains;
        };
        BoardService.prototype.check = function (events) {
            var chains = this.getChains(), hadChains = false, score = 0, removed = [], moved = [], gaps = [];
            for (var col = 0; col < this.numCols; col++) {
                gaps[col] = 0;
                for (var row = this.numRows - 1; row >= 0; row--) {
                    var jewel = this._board.getJewelAt(col, row);
                    var chainLen = chains[col][row];
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
                    }
                    else if (gaps[col] > 0) {
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
            for (var col = 0; col < this.numRows; col++) {
                for (var row = 0; row < gaps[col]; row++) {
                    var jewel = this.generator.getNextJewel();
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
                    type: JewelWarrior.BoardEventType.Remove,
                    data: removed
                });
                events.push({
                    type: JewelWarrior.BoardEventType.Score,
                    data: score
                });
                events.push({
                    type: JewelWarrior.BoardEventType.Move,
                    data: moved
                });
                // refill if no more moves
                if (!this.hasMoves()) {
                    this.fillBoard();
                    events.push({
                        type: JewelWarrior.BoardEventType.Refill,
                        data: this.getLayout()
                    });
                }
                //console.log("events so far: %o", events)
                return this.check(events);
            }
            else {
                return events;
            }
        };
        // if possible, swaps (x1,y1) and (x2,y2) and
        // calls the callback function with list of board events
        BoardService.prototype.swap = function (col1, row1, col2, row2, callback) {
            var events = [];
            if (BoardService.isAdjacent(col1, row1, col2, row2)) {
                var jewel1 = this._board.getJewelAt(col1, row1);
                var jewel2 = this._board.getJewelAt(col2, row2);
                var swap1 = {
                    type: JewelWarrior.BoardEventType.Move,
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
                }
                else {
                    var swap2 = {
                        type: JewelWarrior.BoardEventType.Move,
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
                    events.push(swap2, { type: JewelWarrior.BoardEventType.BadSwap, data: null });
                }
                if (callback) {
                    callback(events);
                }
            }
        };
        return BoardService;
    }());
    JewelWarrior.BoardService = BoardService;
    ;
    if (JewelWarrior.factory) {
        JewelWarrior.factory.createService = function (config) {
            return new BoardService(config);
        };
    }
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=BoardService.js.map