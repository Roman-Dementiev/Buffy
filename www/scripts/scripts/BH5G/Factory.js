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
    ;
    var BaseFactory = (function () {
        function BaseFactory() {
        }
        BaseFactory.prototype.createRenderer = function () { return null; };
        BaseFactory.prototype.createCurrentBubble = function (type) {
            return this.createBubble(true, undefined, undefined, type);
        };
        BaseFactory.prototype.createOnBoardBubble = function (row, col, type) {
            return this.createBubble(false, row, col, type);
        };
        BaseFactory.prototype.createBubbleSprite = function (current, type) {
            return this.createSprite();
        };
        BaseFactory.prototype.createBubble = function (current, row, col, type) {
            var sprite = this.createBubbleSprite(current, type);
            var bubble = new BubbleShoot.Bubble(current, sprite, row, col, type);
            return bubble;
        };
        return BaseFactory;
    }());
    ;
    var DomFactory = (function (_super) {
        __extends(DomFactory, _super);
        function DomFactory() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //public createRenderer(): FrameRenderer {
        //	return null;
        //}
        DomFactory.prototype.createSprite = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i] = arguments[_i];
            }
            var sprite = new BubbleShoot.DomSprite();
            if (classes) {
                for (var _a = 0, classes_1 = classes; _a < classes_1.length; _a++) {
                    var className = classes_1[_a];
                    sprite.addClass(className);
                }
            }
            return sprite;
        };
        DomFactory.prototype.createBubbleSprite = function (current, type) {
            //			let sprite = this.createSprite('bubble');
            var sprite = this.createSprite();
            sprite.css({
                position: 'absolute',
                width: BubbleShoot.SPRITE_IMAGE_DIM + "px",
                height: BubbleShoot.SPRITE_IMAGE_DIM + "px",
                'background-image': "url(" + BubbleShoot.BUBBLE_SPRITE_SHEET + ")"
            });
            BubbleShoot.Bubble.spriteSheet.setSpriteImage(sprite, type);
            return sprite;
        };
        DomFactory.prototype.createSpriteSheet = function (config) {
            return new BubbleShoot.DomSpriteSheet(config);
        };
        return DomFactory;
    }(BaseFactory));
    ;
    var CanvasFactory = (function (_super) {
        __extends(CanvasFactory, _super);
        function CanvasFactory() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CanvasFactory.prototype.createRenderer = function () {
            return new BubbleShoot.FrameRenderer(new BubbleShoot.GameRenderer());
        };
        CanvasFactory.prototype.createSprite = function () {
            return new BubbleShoot.CanvasSprite();
        };
        CanvasFactory.prototype.createSpriteSheet = function (config) {
            return new BubbleShoot.CanvasSpriteSheet(config);
        };
        return CanvasFactory;
    }(BaseFactory));
    BubbleShoot.CanvasFactory = CanvasFactory;
    ;
    var Factory = (function () {
        function Factory() {
        }
        Object.defineProperty(Factory, "instance", {
            get: function () {
                if (!Factory._instance) {
                    Factory.init();
                }
                return Factory._instance;
            },
            enumerable: true,
            configurable: true
        });
        Factory.init = function (useCanvas) {
            if (useCanvas === void 0) { useCanvas = true; }
            if (useCanvas) {
                var canvas = document.createElement('canvas');
                if (!canvas) {
                    useCanvas = false;
                }
            }
            if (useCanvas) {
                Factory._instance = new CanvasFactory();
            }
            else {
                Factory._instance = new DomFactory();
            }
        };
        Factory.createRenderer = function () {
            return Factory.instance.createRenderer();
        };
        Factory.createSprite = function () {
            return Factory.instance.createSprite();
        };
        Factory.createSpriteSheet = function (config) {
            return Factory.instance.createSpriteSheet(config);
        };
        Factory.createCurrentBubble = function (type) {
            return Factory.instance.createCurrentBubble(type);
        };
        Factory.createOnBoardBubble = function (row, col, type) {
            return Factory.instance.createOnBoardBubble(row, col, type);
        };
        return Factory;
    }());
    Factory._instance = null;
    BubbleShoot.Factory = Factory;
})(BubbleShoot || (BubbleShoot = {}));
//# sourceMappingURL=Factory.js.map