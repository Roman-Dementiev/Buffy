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
var BubbleShoot;
(function (BubbleShoot) {
    var BubbleGenerator = (function () {
        function BubbleGenerator() {
        }
        Object.defineProperty(BubbleGenerator, "random", {
            get: function () {
                if (!BubbleGenerator._random) {
                    BubbleGenerator._random = new BubbleGenerator();
                }
                return BubbleGenerator._random;
            },
            enumerable: true,
            configurable: true
        });
        BubbleGenerator.prototype.createCurrentBubble = function () {
            var type = this.getNextBubbleType();
            return BubbleShoot.Factory.createCurrentBubble(type);
        };
        BubbleGenerator.prototype.createOnBoardBubble = function (row, col) {
            var type = this.getNextBubbleType();
            return BubbleShoot.Factory.createOnBoardBubble(row, col, type);
        };
        BubbleGenerator.prototype.getNextBubbleType = function () {
            return Math.floor(Math.random() * BubbleShoot.NUM_BUBBLE_TYPES);
        };
        BubbleGenerator.sameColor = function (type) {
            return new SameColorGanerator(type);
        };
        BubbleGenerator.create = function (config) {
            if (typeof config === 'undefined')
                return BubbleGenerator.random;
            if (config === null)
                return null;
            if (typeof config === 'boolean') {
                return config ? BubbleGenerator.random : null;
            }
            if (typeof config === 'string') {
                return BubbleGenerator.createGenerator(config, {});
            }
            if (typeof config === 'object' && typeof config.generator === 'string') {
                return BubbleGenerator.createGenerator(config.generator, config);
            }
            throw "Invalit bubble generator config";
        };
        BubbleGenerator.createGenerator = function (type, otions) {
            switch (type.toLowerCase()) {
                case 'random':
                    return BubbleGenerator.random;
                case 'same':
                case 'samecolor':
                    var type_1 = otions.color ? otions.color : 0;
                    return new SameColorGanerator(type_1);
                default:
                    throw "Unknown bubble generator type";
            }
        };
        return BubbleGenerator;
    }());
    BubbleShoot.BubbleGenerator = BubbleGenerator;
    ;
    var SameColorGanerator = (function (_super) {
        __extends(SameColorGanerator, _super);
        function SameColorGanerator(type) {
            var _this = _super.call(this) || this;
            _this.type = type;
            return _this;
        }
        SameColorGanerator.prototype.getNextBubbleType = function () {
            return this.type;
        };
        return SameColorGanerator;
    }(BubbleGenerator));
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=BubbleGenerators.js.map