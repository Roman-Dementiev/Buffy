namespace BubbleShoot
{
	export type Coords = { x: number, y: number };

	export type UIElement = JQuery;

	export class UI
	{
		public static newGameDialog: UIElement;
		public static startButton: UIElement;
		public static gameArea: UIElement;
		public static boardElement: UIElement;
		public static bubblesRemaining: UIElement;

		public static init()
		{
			UI.newGameDialog = $('.dialog');
			UI.startButton = $('.but_start_game');
			UI.gameArea = $('#game');
			UI.boardElement = $('#board');
			UI.bubblesRemaining = $("#bubbles_remaining");
		}

		public static getMouseCoords(event: any): Coords
		{
			let coords = { x: event.pageX, y: event.pageY };
			return coords;
		}

		public static getBubbleCoords(bubble: Bubble) : Coords
		{
			let coords = {
				x: bubble.sprite.left + BUBBLE_HALF,
				y: bubble.sprite.top + BUBBLE_HALF
			};
			return coords;
		}

		public static getBubbleAngle(bubble: Bubble, event: any) : number
		{
			let mouseCoords = UI.getMouseCoords(event);
			let bubbleCoords = UI.getBubbleCoords(bubble);
			let gamePosition = UI.gameArea.position();
			let angle = Math.atan((mouseCoords.x - bubbleCoords.x - BOARD_LEFT)
				/ (bubbleCoords.y + gamePosition.top - mouseCoords.y));
			if (mouseCoords.y > bubbleCoords.y + gamePosition.top) {
				angle += Math.PI;
			}
			return angle;
		}

		public static fireBubble(bubble: Bubble, coords: Coords, duration: number, easing: string = "linear"): void
		{
			bubble.state = BubbleState.FIRING;

			bubble.sprite.moveTo(coords.x - BUBBLE_HALF, coords.y - BUBBLE_HALF, duration, easing,
				/*complete*/() => {
					if (bubble.row) {
						bubble.sprite.setPosition(
							bubble.getCoords().x - BUBBLE_HALF,
							bubble.getCoords().y - BUBBLE_HALF
						);
						bubble.state = BubbleState.ON_BOARD;
					} else {
						bubble.state = BubbleState.FIRED;
					}
				});
		}

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

		public static drawBubblesRemaining(numBubbles: number, ui = UI.bubblesRemaining): void
		{
			ui.text(numBubbles);
		}

		public static drawScore(score: number)
		{
			$("#score").text(score);
		}

		public static drawHighScore(highScore: number)
		{
			$("#high_score").text(highScore);
		}

		public static drawLevel(level: number)
		{
			$("#level").text(level + 1);
		}

		public static endGame(hasWon: boolean, score: number)
		{
			UI.drawBubblesRemaining(0);
			if (hasWon) {
				$(".level_complete").show();
				$(".level_failed").hide();
			} else {
				$(".level_complete").hide();
				$(".level_failed").show();
			};
			$("#end_game").fadeIn(500);
			$("#final_score_value").text(score);
		}
	};
};
