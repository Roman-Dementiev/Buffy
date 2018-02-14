var BubbleShoot;
(function (BubbleShoot) {
    ;
    var Bubble = (function () {
        function Bubble(current, sprite, row, col, type) {
            this._sprite = sprite;
            this._row = row;
            this._col = col;
            this._type = type;
            this.state = current ? 1 /* CURRENT */ : 2 /* ON_BOARD */;
        }
        Object.defineProperty(Bubble, "spriteSheet", {
            get: function () { return Bubble._spriteSheet; },
            enumerable: true,
            configurable: true
        });
        Bubble.loadSpreadSheet = function (callback) {
            Bubble._spriteSheet = BubbleShoot.Factory.createSpriteSheet({
                source: BubbleShoot.BUBBLE_SPRITE_SHEET,
                numTypes: BubbleShoot.NUM_BUBBLE_TYPES,
                numVariants: BubbleShoot.NUM_POP_PHASES,
                spriteWidth: BubbleShoot.SPRITE_IMAGE_DIM,
                spriteHeight: BubbleShoot.SPRITE_IMAGE_DIM
            });
            Bubble._spriteSheet.load(callback);
            return Bubble._spriteSheet;
        };
        Object.defineProperty(Bubble.prototype, "sprite", {
            get: function () { return this._sprite; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bubble.prototype, "type", {
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bubble.prototype, "row", {
            get: function () { return this._row; },
            set: function (value) { this._row = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bubble.prototype, "col", {
            get: function () { return this._col; },
            set: function (value) { this._col = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bubble.prototype, "state", {
            get: function () { return this._state; },
            set: function (state) {
                this._state = state;
                this._stateStart = Date.now();
            },
            enumerable: true,
            configurable: true
        });
        Bubble.prototype.getTimeInState = function () {
            return Date.now() - this._stateStart;
        };
        Bubble.prototype.getCoords = function () {
            var coords = {
                x: this.col * BubbleShoot.BUBBLE_DIMS / 2 + BubbleShoot.BUBBLE_HALF,
                y: this.row * BubbleShoot.ROW_HEIGHT + BubbleShoot.BUBBLE_HALF
            };
            return coords;
        };
        Bubble.prototype.animatePop = function (duration) {
            if (!BubbleShoot.GameRenderer.exists) {
                var top_1 = this.type * this.sprite.height;
                var phaseDuration = duration / BubbleShoot.NUM_POP_PHASES;
                var type_1 = this.type;
                var sprite_1 = this.sprite;
                var spriteSheet_1 = Bubble.spriteSheet;
                sprite_1.setProperty('transform', "rotate(" + Math.random() * 360 + "deg)");
                var _loop_1 = function (phase) {
                    setTimeout(function () {
                        spriteSheet_1.setSpriteImage(sprite_1, type_1, phase);
                    }, phase * phaseDuration);
                };
                for (var phase = 1; phase < BubbleShoot.NUM_POP_PHASES; phase++) {
                    _loop_1(phase);
                }
                setTimeout(function () {
                    sprite_1.remove();
                }, duration);
            }
        };
        return Bubble;
    }());
    BubbleShoot.Bubble = Bubble;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=Bubble.js.map