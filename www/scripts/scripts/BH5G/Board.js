var BubbleShoot;
(function (BubbleShoot) {
    var kDefaultBoardConfig = {
        numRows: 9,
        numCols: 32,
        createLayout: true
    };
    var Board = (function () {
        function Board(config, ui) {
            if (ui === void 0) { ui = null; }
            config = Sandbox.mergeDefaults(config, kDefaultBoardConfig);
            var generator = null;
            if (config.generator !== undefined) {
                generator = config.generator;
            }
            else {
                generator = BubbleShoot.BubbleGenerator.create(config.createLayout);
            }
            this._ui = ui;
            this._rows = this.createLayout(config.numRows, config.numCols, generator);
            this._numCols = config.numCols;
        }
        Object.defineProperty(Board.prototype, "ui", {
            get: function () { return this._ui; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "numRows", {
            get: function () { return this._rows.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Board.prototype, "numCols", {
            get: function () { return this._numCols; },
            enumerable: true,
            configurable: true
        });
        Board.prototype.isEmpty = function () {
            return this.getBubbles().length == 0;
        };
        //		public getRows(): Row[] { return this._rows; }
        Board.prototype.getRow = function (rowNum) {
            if (rowNum >= 0 && rowNum < this._rows.length) {
                return this._rows[rowNum];
            }
            else {
                return null;
            }
        };
        Board.prototype.getBubbleAt = function (rowNum, colNum) {
            var row = this.getRow(rowNum);
            if (row && colNum >= 0 && colNum < row.length) {
                return row[colNum];
            }
            else {
                return null;
            }
        };
        Board.prototype.putBubbleAt = function (bubble, rowNum, colNum) {
            if (!this._rows[rowNum])
                this._rows[rowNum] = [];
            this._rows[rowNum][colNum] = bubble;
        };
        Board.prototype.deleteBubbleAt = function (rowNum, colNum) {
            var row = this.getRow(rowNum);
            if (row) {
                delete row[colNum];
            }
        };
        ;
        Board.prototype.deleteBubbles = function (bubbles) {
            for (var _i = 0, bubbles_1 = bubbles; _i < bubbles_1.length; _i++) {
                var bubble = bubbles_1[_i];
                if (typeof bubble.row !== 'undefined' && typeof bubble.col !== 'undefined') {
                    this.deleteBubbleAt(bubble.row, bubble.col);
                }
            }
        };
        Board.prototype.clear = function () {
            var rows = this._rows;
            for (var rowNum = 0; rowNum < rows.length; rowNum++) {
                var row = rows[rowNum];
                if (row) {
                    for (var colNum = 0; colNum < row.length; colNum++) {
                        delete row[colNum];
                    }
                }
            }
        };
        Board.prototype.addBubble = function (bubble, coords) {
            var rowNum = Math.floor(coords.y / BubbleShoot.ROW_HEIGHT);
            var colNum = coords.x / BubbleShoot.BUBBLE_DIMS * 2;
            if (rowNum % 2 == 1)
                colNum -= 1;
            colNum = Math.round(colNum / 2) * 2;
            if (rowNum % 2 == 0)
                colNum -= 1;
            this.putBubbleAt(bubble, rowNum, colNum);
            bubble.row = rowNum;
            bubble.col = colNum;
        };
        Board.prototype.getBubbles = function () {
            var bubbles = [];
            var rows = this._rows;
            for (var rowNum = 0; rowNum < rows.length; rowNum++) {
                var row = rows[rowNum];
                if (row) {
                    for (var colNum = 0; colNum < row.length; colNum++) {
                        var bubble = row[colNum];
                        if (bubble) {
                            bubbles.push(bubble);
                        }
                    }
                }
            }
            ;
            return bubbles;
        };
        Board.prototype.getTopRowBubbles = function () {
            var bubbles = [];
            var topRow = this.getRow(0);
            if (topRow) {
                for (var col = 0; col < topRow.length; col++) {
                    if (topRow[col])
                        bubbles.push(topRow[col]);
                }
            }
            return bubbles;
        };
        Board.prototype.getBubblesAround = function (curRow, curCol) {
            var bubbles = [];
            for (var rowNum = curRow - 1; rowNum <= curRow + 1; rowNum++) {
                for (var colNum = curCol - 2; colNum <= curCol + 2; colNum++) {
                    var bubbleAt = this.getBubbleAt(rowNum, colNum);
                    if (bubbleAt && !(colNum == curCol && rowNum == curRow))
                        bubbles.push(bubbleAt);
                }
            }
            return bubbles;
        };
        Board.prototype.getGroup = function (bubble, differentColor) {
            if (differentColor === void 0) { differentColor = false; }
            var found = new Board({
                numRows: this.numRows,
                numCols: this.numCols,
                createLayout: false
            });
            var list = [];
            this.getGroupRecursive(bubble, found, list, differentColor);
            return list;
        };
        Board.prototype.getGroupRecursive = function (bubble, found, list, differentColor) {
            var curRow = bubble.row;
            var curCol = bubble.col;
            if (found.getBubbleAt(curRow, curCol))
                return;
            found.putBubbleAt(bubble, curRow, curCol);
            list.push(bubble);
            var surrounding = this.getBubblesAround(curRow, curCol);
            for (var _i = 0, surrounding_1 = surrounding; _i < surrounding_1.length; _i++) {
                var bubbleAt = surrounding_1[_i];
                if (differentColor || bubbleAt.type == bubble.type) {
                    this.getGroupRecursive(bubbleAt, found, list, differentColor);
                }
                ;
            }
            ;
        };
        Board.prototype.findOrphans = function () {
            var rows = this._rows;
            var connected = [];
            for (var i = 0; i < rows.length; i++) {
                connected[i] = [];
            }
            ;
            for (var _i = 0, _a = rows[0]; _i < _a.length; _i++) {
                var bubble = _a[_i];
                if (bubble && !connected[0][bubble.col]) {
                    var group = this.getGroup(bubble, true);
                    for (var _b = 0, group_1 = group; _b < group_1.length; _b++) {
                        var b = group_1[_b];
                        connected[b.row][b.col] = true;
                    }
                }
                ;
            }
            ;
            var orphaned = [];
            for (var _c = 0, rows_1 = rows; _c < rows_1.length; _c++) {
                var row = rows_1[_c];
                for (var _d = 0, row_1 = row; _d < row_1.length; _d++) {
                    var bubble = row_1[_d];
                    if (bubble && !connected[bubble.row][bubble.col]) {
                        orphaned.push(bubble);
                    }
                    ;
                }
                ;
            }
            ;
            return orphaned;
        };
        ;
        Board.prototype.createLayout = function (numRows, numCols, generator) {
            var rows = new Array(numRows);
            if (generator) {
                for (var rowNum = 0; rowNum < numRows; rowNum++) {
                    var row = [];
                    var startCol = rowNum % 2 == 0 ? 1 : 0;
                    for (var colNum = startCol; colNum < numCols; colNum += 2) {
                        var bubble = generator.createOnBoardBubble(rowNum, colNum);
                        row[colNum] = bubble;
                        if (this._ui) {
                            bubble.sprite.appendTo(this._ui);
                        }
                        var left = colNum * BubbleShoot.BUBBLE_DIMS / 2;
                        var top = rowNum * BubbleShoot.ROW_HEIGHT;
                        bubble.sprite.setPosition(left, top);
                    }
                    ;
                    rows[rowNum] = row;
                }
                ;
            }
            return rows;
        };
        return Board;
    }());
    BubbleShoot.Board = Board;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=Board.js.map