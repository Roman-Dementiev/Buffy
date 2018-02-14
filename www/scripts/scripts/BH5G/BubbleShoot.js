var BubbleShoot;
(function (BubbleShoot) {
    BubbleShoot.POP_SOUND = "pop.mp3";
    BubbleShoot.BUBBLE_SPRITE_SHEET = "bubble_sprite_sheet.png";
    BubbleShoot.SPRITE_IMAGE_DIM = 50;
    BubbleShoot.NUM_BUBBLE_TYPES = 4;
    BubbleShoot.NUM_POP_PHASES = 4;
    BubbleShoot.BUBBLE_DIMS = 44;
    BubbleShoot.BUBBLE_HALF = BubbleShoot.BUBBLE_DIMS / 2;
    BubbleShoot.ROW_HEIGHT = 40;
    BubbleShoot.BOARD_LEFT = 120;
    BubbleShoot.CURRENT_BUBBLE_TOP = 470;
    BubbleShoot.MAX_BUBBLES = 70;
    BubbleShoot.POINTS_PER_BUBBLE = 50;
    BubbleShoot.MAX_ROWS = 11;
    function bootstrap(useCanvas) {
        if (typeof useCanvas === 'undefined') {
            var doc = $(document)[0];
            var url = doc.location;
            var args = url.search;
            if (args === '?nocanvas') {
                useCanvas = false;
            }
            else {
                useCanvas = true;
            }
        }
        $(document).ready(function () {
            BubbleShoot.UI.init();
            BubbleShoot.Factory.init(useCanvas);
            BubbleShoot.Bubble.loadSpreadSheet(function () {
                BubbleShoot.Game.init();
            });
        });
    }
    BubbleShoot.bootstrap = bootstrap;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=BubbleShoot.js.map