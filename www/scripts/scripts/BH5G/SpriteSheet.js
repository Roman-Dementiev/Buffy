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
    ;
    var BaseSpriteSheet = (function () {
        function BaseSpriteSheet(config) {
            this.config = Sandbox.copy(config);
        }
        Object.defineProperty(BaseSpriteSheet.prototype, "source", {
            get: function () { return this.config.source; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseSpriteSheet.prototype, "numTypes", {
            get: function () { return this.config.numTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseSpriteSheet.prototype, "numVariants", {
            get: function () { return this.config.numVariants; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseSpriteSheet.prototype, "spriteWidth", {
            get: function () { return this.config.spriteWidth; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseSpriteSheet.prototype, "spriteHeight", {
            get: function () { return this.config.spriteHeight; },
            enumerable: true,
            configurable: true
        });
        BaseSpriteSheet.prototype.setup = function (sheetWidth, sheetHeight) {
            if (sheetWidth === void 0) { sheetWidth = 0; }
            if (sheetHeight === void 0) { sheetHeight = 0; }
            var config = this.config;
            if (!config.numTypes) {
                config.numTypes = 1;
            }
            if (!config.numVariants) {
                config.numVariants = 1;
            }
            if (!config.spriteWidth && sheetWidth > 0) {
                config.spriteWidth = sheetWidth / config.numVariants;
            }
            if (!config.spriteHeight && sheetHeight > 0) {
                config.spriteHeight = sheetHeight / config.numTypes;
            }
        };
        BaseSpriteSheet.prototype.getImageCoord = function (type, variant) {
            return {
                y: type * this.spriteHeight,
                x: variant * this.spriteWidth
            };
        };
        return BaseSpriteSheet;
    }());
    BubbleShoot.BaseSpriteSheet = BaseSpriteSheet;
    var DomSpriteSheet = (function (_super) {
        __extends(DomSpriteSheet, _super);
        function DomSpriteSheet(config) {
            return _super.call(this, config) || this;
        }
        DomSpriteSheet.prototype.load = function (callback) {
            this.setup();
            if (callback) {
                callback();
            }
        };
        DomSpriteSheet.prototype.drawSprite = function (context, sprite, type, variant) {
            this.setSpriteImage(sprite, type, variant);
        };
        DomSpriteSheet.prototype.setSpriteImage = function (sprite, type, variant) {
            if (!variant)
                variant = 0;
            var imagePos = this.getImageCoord(type, variant);
            sprite.setProperty('background-position', "-" + imagePos.x + "px -" + imagePos.y + "px");
        };
        return DomSpriteSheet;
    }(BaseSpriteSheet));
    BubbleShoot.DomSpriteSheet = DomSpriteSheet;
    var CanvasSpriteSheet = (function (_super) {
        __extends(CanvasSpriteSheet, _super);
        function CanvasSpriteSheet(config) {
            return _super.call(this, config) || this;
        }
        Object.defineProperty(CanvasSpriteSheet.prototype, "image", {
            get: function () { return this._image; },
            enumerable: true,
            configurable: true
        });
        CanvasSpriteSheet.prototype.load = function (callback) {
            var _this = this;
            this._image = new Image();
            this._image.onload = function () {
                //console.log("CanvasSpriteSheet loaded: source=", this.source, "width=", this._image.width, "height=", this._image.height);
                _this.setup(_this._image.width, _this._image.height);
                if (callback) {
                    callback();
                }
            };
            this._image.src = this.source;
        };
        //public drawSprite(context: any, sprite: Sprite, type: number, variant?: number) {
        //	this.renderSprite(context, sprite, type, variant);
        //}
        CanvasSpriteSheet.prototype.renderSprite = function (context, sprite, type, variant) {
            if (!type)
                type = 0;
            if (!variant)
                variant = 0;
            var offset = {
                x: sprite.left + sprite.width / 2,
                y: sprite.top + sprite.height / 2
            };
            var imagePos = this.getImageCoord(type, variant);
            context.translate(offset.x, offset.y);
            context.drawImage(this._image, imagePos.x, imagePos.y, this.spriteWidth, this.spriteHeight, -sprite.width / 2, -sprite.height / 2, this.spriteWidth, this.spriteHeight);
            context.translate(-offset.x, -offset.y);
        };
        return CanvasSpriteSheet;
    }(BaseSpriteSheet));
    BubbleShoot.CanvasSpriteSheet = CanvasSpriteSheet;
})(BubbleShoot || (BubbleShoot = {}));
//# sourceMappingURL=SpriteSheet.js.map