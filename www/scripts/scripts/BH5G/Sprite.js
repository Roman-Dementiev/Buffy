var BubbleShoot;
(function (BubbleShoot) {
    ;
    var DomSprite = (function () {
        function DomSprite(selector, tag) {
            if (tag === void 0) { tag = 'div'; }
            this.updateFrame = null;
            if (selector) {
                this.el = $(selector);
            }
            else {
                this.el = $(document.createElement(tag));
            }
        }
        DomSprite.prototype.addClass = function (className) {
            this.el.addClass(className);
        };
        Object.defineProperty(DomSprite.prototype, "$", {
            get: function () { return this.el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomSprite.prototype, "left", {
            get: function () { return this.el.position().left; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomSprite.prototype, "top", {
            get: function () { return this.el.position().top; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomSprite.prototype, "width", {
            get: function () { return this.el.width(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomSprite.prototype, "height", {
            get: function () { return this.el.height(); },
            enumerable: true,
            configurable: true
        });
        //		public get position(): JQueryCoordinates { return this.el.position(); }
        DomSprite.prototype.setPosition = function (left, top) {
            this.el.css({
                left: left,
                top: top
            });
        };
        DomSprite.prototype.getProperty = function (propertyName) {
            return this.el.css(propertyName);
        };
        DomSprite.prototype.setProperty = function (propertyName, value) {
            this.el.css(propertyName, value);
        };
        DomSprite.prototype.css = function (properties) {
            this.el.css(properties);
        };
        DomSprite.prototype.appendTo = function (ui) {
            this.el.appendTo(ui);
        };
        DomSprite.prototype.remove = function () {
            this.el.remove();
        };
        //public animate(properties: Object, options: JQueryAnimationOptions)
        //{
        //	this.el.animate(properties, options);
        //}
        DomSprite.prototype.moveTo = function (left, top, duration, easing, complete) {
            this.el.animate({
                left: left,
                top: top
            }, duration, easing, complete);
        };
        DomSprite.prototype.kaboom = function (opt) {
            BubbleShoot.kaboom(this, opt);
        };
        return DomSprite;
    }());
    BubbleShoot.DomSprite = DomSprite;
    ;
    var CanvasSprite = (function () {
        function CanvasSprite() {
            this.left = 0;
            this.top = 0;
            this.width = BubbleShoot.BUBBLE_DIMS;
            this.height = BubbleShoot.BUBBLE_DIMS;
            this._updateFrame = null;
        }
        Object.defineProperty(CanvasSprite.prototype, "updateFrame", {
            get: function () { return this._updateFrame; },
            enumerable: true,
            configurable: true
        });
        CanvasSprite.prototype.setPosition = function (left, top) {
            this.left = left;
            this.top = top;
        };
        CanvasSprite.prototype.appendTo = function (ui) { };
        CanvasSprite.prototype.remove = function (delay) { };
        CanvasSprite.prototype.moveTo = function (left, top, duration, easing, complete) {
            var animationStart = Date.now();
            var startLeft = this.left;
            var startTop = this.top;
            var that = this;
            this._updateFrame = function () {
                var elapsed = Date.now() - animationStart;
                var proportion = elapsed / duration;
                if (proportion > 1)
                    proportion = 1;
                that.setPosition(startLeft + (left - startLeft) * proportion, startTop + (top - startTop) * proportion);
            };
            setTimeout(function () {
                that._updateFrame = null;
                if (complete) {
                    complete();
                }
            }, duration);
        };
        CanvasSprite.prototype.kaboom = function (opt) {
            BubbleShoot.kaboom(this, opt);
        };
        return CanvasSprite;
    }());
    BubbleShoot.CanvasSprite = CanvasSprite;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=Sprite.js.map