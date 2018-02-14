var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JewelWarrior;
(function (JewelWarrior) {
    ;
    var NoJewelGenerator = (function () {
        function NoJewelGenerator() {
        }
        NoJewelGenerator.prototype.getNextJewel = function () {
            return JewelWarrior.kNoJewel;
        };
        return NoJewelGenerator;
    }());
    NoJewelGenerator.instance = new NoJewelGenerator();
    JewelWarrior.NoJewelGenerator = NoJewelGenerator;
    var RandomJewelGenerator = (function () {
        function RandomJewelGenerator(numJewelTypes) {
            this.numJewelTypes = numJewelTypes;
        }
        RandomJewelGenerator.prototype.getNextJewel = function () {
            return Math.floor(Math.random() * this.numJewelTypes);
        };
        return RandomJewelGenerator;
    }());
    JewelWarrior.RandomJewelGenerator = RandomJewelGenerator;
    ;
    var LayoutGenerator = (function () {
        function LayoutGenerator(jewelGenerator, startLayout) {
            this.jewelGenerator = jewelGenerator ? jewelGenerator : NoJewelGenerator.instance;
            this.startLayout = startLayout;
        }
        LayoutGenerator.configure = function (config, setInConfig) {
            if (setInConfig === void 0) { setInConfig = false; }
            var generator;
            var startLayout;
            if (config.generator) {
                return config.generator;
            }
            if (typeof config.layout === 'string') {
                switch (config.layout) {
                }
            }
            else {
                startLayout = config.layout;
            }
            if (!generator) {
                generator = new RandomLayoutGenerator(config.numJewelTypes, startLayout);
            }
            if (setInConfig) {
                config.generator = generator;
            }
            return generator;
        };
        LayoutGenerator.prototype.generateJewel = function (col, row) {
            return this.getNextJewel();
        };
        LayoutGenerator.prototype.getNextJewel = function () {
            return this.jewelGenerator.getNextJewel();
        };
        LayoutGenerator.prototype.generateLayout = function (config, dontCheckChains) {
            var layout;
            if (this.startLayout) {
                layout = this.startLayout;
                this.startLayout = null;
            }
            else {
                var checkLength = dontCheckChains ? 0 : config.chainLength;
                layout = LayoutGenerator.createLayout(config.numCols, config.numRows, checkLength, this);
            }
            return layout;
        };
        LayoutGenerator.makesChain = function (jewels, jewel, col, row, chainLength) {
            var rowLen = 1;
            for (var i = 1; i < chainLength && i <= col; i++) {
                if (jewels[col - i][row] != jewel)
                    break;
                rowLen++;
            }
            if (rowLen >= chainLength)
                return true;
            var colLen = 1;
            for (var j = 1; j < chainLength && j <= row; j++) {
                if (jewels[col][row - j] != jewel)
                    break;
                colLen++;
            }
            return colLen >= chainLength;
        };
        LayoutGenerator.createLayout = function (numCols, numRows, chainLength, generator) {
            var jewels = [];
            for (var col = 0; col < numCols; col++) {
                var column = [];
                jewels.push(column);
                for (var row = 0; row < numRows; row++) {
                    var jewel = generator.generateJewel(col, row);
                    if (chainLength > 1) {
                        while (LayoutGenerator.makesChain(jewels, jewel, col, row, chainLength)) {
                            jewel = generator.generateJewel(col, row);
                        }
                    }
                    column.push(jewel);
                }
            }
            return jewels;
        };
        return LayoutGenerator;
    }());
    JewelWarrior.LayoutGenerator = LayoutGenerator;
    ;
    var RandomLayoutGenerator = (function (_super) {
        __extends(RandomLayoutGenerator, _super);
        function RandomLayoutGenerator(numJewelTypes, startLayout) {
            var _this = _super.call(this, new RandomJewelGenerator(numJewelTypes), startLayout) || this;
            _this.numJewelTypes = numJewelTypes;
            return _this;
        }
        return RandomLayoutGenerator;
    }(LayoutGenerator));
    JewelWarrior.RandomLayoutGenerator = RandomLayoutGenerator;
    ;
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=LayoutGenerator.js.map