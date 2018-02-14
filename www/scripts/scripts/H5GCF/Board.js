var JewelWarrior;
(function (JewelWarrior) {
    var Board = (function () {
        function Board(numCols, numRows, jewels) {
            if (jewels === void 0) { jewels = null; }
            this.numCols = numCols;
            this.numRows = numRows;
            this.jewels = jewels;
            if (jewels) {
                JewelWarrior.checkLayout(jewels, numCols, numRows);
            }
        }
        Board.prototype.getLayout = function () {
            var jewels = this.jewels;
            var layout = [];
            for (var col = 0; col < this.numCols; col++) {
                var column = [];
                layout.push(column);
                for (var row = 0; row < this.numRows; row++) {
                    var jewel = jewels[col][row];
                    column.push(jewel);
                }
            }
            return layout;
        };
        Board.prototype.setLayout = function (layout) {
            JewelWarrior.checkLayout(layout, this.numCols, this.numRows);
            this.jewels = layout;
        };
        Board.prototype.getJewelAt = function (col, row) {
            if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
                return this.jewels[col][row];
            }
            else {
                return JewelWarrior.kNoJewel;
            }
        };
        Board.prototype.putJewelAt = function (col, row, jewel) {
            if (col >= 0 && col < this.numCols && row >= 0 && row < this.numRows) {
                this.jewels[col][row] = jewel;
            }
        };
        Board.prototype.toString = function () {
            return JewelWarrior.layoutToString(this.jewels, this.numCols, this.numRows);
        };
        Board.prototype.print = function () {
            JewelWarrior.printLayout(this.jewels, this.numCols, this.numRows);
        };
        return Board;
    }());
    JewelWarrior.Board = Board;
    ;
    if (JewelWarrior.factory) {
        JewelWarrior.factory.createBoard = function (config) {
            return new Board(config.numCols, config.numRows);
        };
    }
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=Board.js.map