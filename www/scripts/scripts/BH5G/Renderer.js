var BubbleShoot;
(function (BubbleShoot) {
    var kRendererFrameRate = 40;
    var FrameRenderer = (function () {
        function FrameRenderer(renderer) {
            this.source = null;
            this.renderer = renderer;
        }
        FrameRenderer.prototype.start = function (source) {
            var _this = this;
            this.source = source;
            if (!this.requestAnimationID) {
                //	this.requestAnimationID = setTimeout(() => this.renderFrame(), kRendererFrameRate);
                this.requestAnimationID = requestAnimationFrame(function () { return _this.renderFrame(); });
            }
        };
        FrameRenderer.prototype.stop = function () {
            this.source = null;
        };
        FrameRenderer.prototype.renderFrame = function () {
            var _this = this;
            if (this.source != null) {
                this.renderer.render(this.source);
                //	this.requestAnimationID = setTimeout(() => this.renderFrame(), kRendererFrameRate);
                this.requestAnimationID = requestAnimationFrame(function () { return _this.renderFrame(); });
            }
            else {
                this.requestAnimationID = undefined;
            }
        };
        return FrameRenderer;
    }());
    BubbleShoot.FrameRenderer = FrameRenderer;
    ;
    var GameRenderer = (function () {
        function GameRenderer() {
            var canvas = document.createElement('canvas');
            $(canvas).addClass('game_canvas');
            BubbleShoot.UI.gameArea.prepend(canvas);
            $(canvas).attr('width', $(canvas).width());
            $(canvas).attr('height', $(canvas).height());
            this.canvas = canvas;
            this.context = canvas.getContext("2d");
        }
        Object.defineProperty(GameRenderer, "instance", {
            get: function () {
                if (typeof GameRenderer._instance === 'undefined') {
                    GameRenderer._instance = BubbleShoot.Factory.createRenderer();
                }
                return GameRenderer._instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameRenderer, "exists", {
            get: function () { return GameRenderer.instance != null; },
            enumerable: true,
            configurable: true
        });
        GameRenderer.prototype.render = function (game) {
            var canvas = this.canvas;
            var context = this.context;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.translate(BubbleShoot.BOARD_LEFT, 0);
            var bubbles = game.getBubbles();
            for (var _i = 0, bubbles_1 = bubbles; _i < bubbles_1.length; _i++) {
                var bubble = bubbles_1[_i];
                this.renderBubble(bubble);
            }
            context.translate(-BubbleShoot.BOARD_LEFT, 0);
        };
        GameRenderer.prototype.renderBubble = function (bubble) {
            if (bubble.sprite.updateFrame) {
                bubble.sprite.updateFrame();
            }
            var phase = 0;
            switch (bubble.state) {
                case 4 /* POPPING */:
                    var timeInState = bubble.getTimeInState();
                    if (timeInState < 80) {
                        phase = 1;
                    }
                    else if (timeInState < 140) {
                        phase = 2;
                    }
                    else {
                        phase = 3;
                    }
                    ;
                    break;
                case 6 /* POPPED */:
                    return;
                case 7 /* FIRED */:
                    return;
                case 8 /* FALLEN */:
                    return;
            }
            var spriteSheet = BubbleShoot.Bubble.spriteSheet;
            spriteSheet.renderSprite(this.context, bubble.sprite, bubble.type, phase);
        };
        return GameRenderer;
    }());
    BubbleShoot.GameRenderer = GameRenderer;
    ;
    //export class BSRenderer extends FrameRenderer<Game>
    //{
    //	private static _instance: FrameRenderer<Game>;
    //	public static get instance(): FrameRenderer<Game>
    //	{
    //		if (typeof BSRenderer._instance === 'undefined') {
    //			BSRenderer._instance = Factory.createRenderer();
    //		}
    //		return BSRenderer._instance;
    //	}
    //	public static get exists(): boolean { return BSRenderer.instance != null; }
    //	public constructor()
    //	{
    //		super(new GameRenderer());
    //	}
    //};
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=Renderer.js.map