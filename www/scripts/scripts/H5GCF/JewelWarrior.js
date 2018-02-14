var JewelWarrior;
(function (JewelWarrior) {
    JewelWarrior.kNoJewel = -1;
    JewelWarrior.kDefaultGameConfig = {
        numRows: 8,
        numCols: 8,
        numJewelTypes: 7,
        chainLength: 3,
        baseScore: 100,
        baseLevelTimer: 60000,
        baseLevelScore: 1500,
        baseLevelExp: 1.05,
    };
    var BoardEventType;
    (function (BoardEventType) {
        BoardEventType[BoardEventType["Move"] = 0] = "Move";
        BoardEventType[BoardEventType["Remove"] = 1] = "Remove";
        BoardEventType[BoardEventType["Refill"] = 2] = "Refill";
        BoardEventType[BoardEventType["Score"] = 3] = "Score";
        BoardEventType[BoardEventType["BadSwap"] = 4] = "BadSwap";
    })(BoardEventType = JewelWarrior.BoardEventType || (JewelWarrior.BoardEventType = {}));
    ;
    ;
    ;
    ;
    ;
    JewelWarrior.cmdCreate = "create"; // data: GameConfig
    JewelWarrior.cmdInitialize = "initialize"; // data: JewelLayout|null
    JewelWarrior.cmdSwap = "swap"; // data: SwapArgs
    JewelWarrior.factory = {
        createBoard: null,
        createService: null,
        createRenderer: null
    };
    // Game Actions
    JewelWarrior.ActionSelectJewel = "selectJewel";
    JewelWarrior.ActionMoveUp = "moveUp";
    JewelWarrior.ActionMoveDown = "moveDown";
    JewelWarrior.ActionMoveLeft = "moveLeft";
    JewelWarrior.ActionMoveRight = "moveRight";
    JewelWarrior.kMaxHighScores = 10;
    //Uyility
    function isValidLayout(layout, numCols, numRows) {
        if (!layout)
            return false;
        if (!Sandbox.checkArrayLength(layout, numCols))
            return false;
        for (var col = 0; col < numCols; col++) {
            if (!Sandbox.checkArrayLength(layout[col], numRows))
                return false;
        }
        return true;
    }
    JewelWarrior.isValidLayout = isValidLayout;
    function checkLayout(layout, numCols, numRows) {
        if (!isValidLayout(layout, numCols, numRows)) {
            throw new Error("Invalid board layout");
        }
    }
    JewelWarrior.checkLayout = checkLayout;
    function layoutToString(layout, numCols, numRows, multiline) {
        if (multiline === void 0) { multiline = true; }
        var str = "";
        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
                var val = null;
                if (layout[col] && typeof layout[col][row] === 'number') {
                    str += layout[col][row] + " ";
                }
                else {
                    str += "# ";
                }
            }
            if (multiline)
                str += "\r\n";
        }
        return str;
    }
    JewelWarrior.layoutToString = layoutToString;
    function printLayout(layout, numCols, numRows, prefix, suffix) {
        if (prefix) {
            console.log(prefix);
        }
        console.log(layoutToString(layout, numCols, numRows));
        if (suffix) {
            console.log(suffix);
        }
    }
    JewelWarrior.printLayout = printLayout;
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=JewelWarrior.js.map