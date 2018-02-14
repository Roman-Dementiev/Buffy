var BubbleShoot;
(function (BubbleShoot) {
    var UI = (function () {
        function UI() {
        }
        UI.init = function () {
            UI.newGameDialog = $('.dialog');
            UI.startButton = $('.but_start_game');
            UI.gameArea = $('#game');
            UI.boardElement = $('#board');
            UI.bubblesRemaining = $("#bubbles_remaining");
        };
        UI.getMouseCoords = function (event) {
            var coords = { x: event.pageX, y: event.pageY };
            return coords;
        };
        UI.getBubbleCoords = function (bubble) {
            var coords = {
                x: bubble.sprite.left + BubbleShoot.BUBBLE_HALF,
                y: bubble.sprite.top + BubbleShoot.BUBBLE_HALF
            };
            return coords;
        };
        UI.getBubbleAngle = function (bubble, event) {
            var mouseCoords = UI.getMouseCoords(event);
            var bubbleCoords = UI.getBubbleCoords(bubble);
            var gamePosition = UI.gameArea.position();
            var angle = Math.atan((mouseCoords.x - bubbleCoords.x - BubbleShoot.BOARD_LEFT)
                / (bubbleCoords.y + gamePosition.top - mouseCoords.y));
            if (mouseCoords.y > bubbleCoords.y + gamePosition.top) {
                angle += Math.PI;
            }
            return angle;
        };
        UI.fireBubble = function (bubble, coords, duration, easing) {
            if (easing === void 0) { easing = "linear"; }
            bubble.state = 3 /* FIRING */;
            bubble.sprite.moveTo(coords.x - BubbleShoot.BUBBLE_HALF, coords.y - BubbleShoot.BUBBLE_HALF, duration, easing, 
            /*complete*/ function () {
                if (bubble.row) {
                    bubble.sprite.setPosition(bubble.getCoords().x - BubbleShoot.BUBBLE_HALF, bubble.getCoords().y - BubbleShoot.BUBBLE_HALF);
                    bubble.state = 2 /* ON_BOARD */;
                }
                else {
                    bubble.state = 7 /* FIRED */;
                }
            });
        };
        //public static layoutBoard(board: Board, ui: UIElement = UI.boardElement): void
        //{
        //	for (var i = 0; i < board.numRows; i++) {
        //		let row = board.getRow(i);
        //		for (let j = 0; j < row.length; j++) {
        //			var bubble = row[j];
        //			if (bubble) {
        //				bubble.sprite.appendTo(ui);
        //				var left = j * UI.BUBBLE_DIMS / 2;
        //				var top = i * UI.ROW_HEIGHT;
        //				bubble.sprite.setPosition(left, top);
        //			};
        //		};
        //	};
        //}
        UI.drawBubblesRemaining = function (numBubbles, ui) {
            if (ui === void 0) { ui = UI.bubblesRemaining; }
            ui.text(numBubbles);
        };
        UI.drawScore = function (score) {
            $("#score").text(score);
        };
        UI.drawHighScore = function (highScore) {
            $("#high_score").text(highScore);
        };
        UI.drawLevel = function (level) {
            $("#level").text(level + 1);
        };
        UI.endGame = function (hasWon, score) {
            UI.drawBubblesRemaining(0);
            if (hasWon) {
                $(".level_complete").show();
                $(".level_failed").hide();
            }
            else {
                $(".level_complete").hide();
                $(".level_failed").show();
            }
            ;
            $("#end_game").fadeIn(500);
            $("#final_score_value").text(score);
        };
        return UI;
    }());
    BubbleShoot.UI = UI;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=UI.js.map