namespace BubbleShoot
{
	const FIRE_DISTANCE = 1000; // pixels
	const FIRE_DURATION = 750; // ms
	const POP_GROUP_LENGTH = 3;

	const kFastPopDuration = 200;
	const kFastPopInterval = 60;
	const kSlowPopDuration = 1000;
	const kSlowPopInterval = 300;

	const keyHighScore = "BS_high_score";

	export class Game
	{
		private static _instance: Game;
		public static get instance(): Game
		{
			if (!Game._instance) {
				Game._instance = new Game();
			}
			return Game._instance;
		}

		bubbleGenerator: BubbleGenerator;
		curBubble: Bubble;
		board: Board;
		bubbles: Bubble[];
		numBubbles: number;
		level: number = 0;
		score: number = 0;
		static highScore: number = 0;

		public static init(): void
		{
			Game.bindStartButton();

			if (window.localStorage && localStorage.getItem(keyHighScore)) {
				Game.highScore = parseInt(localStorage.getItem(keyHighScore));
			}
			UI.drawHighScore(Game.highScore);
		}

		private static bindStartButton()
		{
			UI.startButton.bind('click', () =>
			{
				UI.startButton.unbind('click');
				UI.newGameDialog.fadeOut(300);

				Game.instance.startGame();
			});
		}

		public startGame(): void
		{
			this.numBubbles = MAX_BUBBLES - this.level * 5;

			this.bubbleGenerator = BubbleGenerator.random; //BubbleGenerator.sameColor(0);
			this.board = new Board({
				generator: this.bubbleGenerator
			}, UI.boardElement);

			this.bubbles = this.board.getBubbles();
			this.curBubble = this.getNextBubble();

			if (GameRenderer.exists) {
				GameRenderer.instance.start(this);
			}

			UI.gameArea.bind('click', (e) => this.onClickGameArea(e));
			UI.drawScore(this.score);
			UI.drawLevel(this.level);
		}

		public endGame(hasWon: boolean)
		{
			//$("#board .bubble").remove();
			this.board.clear();
			for (let bubble of this.bubbles) {
				bubble.sprite.remove();
			}

			if (hasWon && this.score > Game.highScore) {
				Game.highScore = this.score;
				$("#new_high_score").show();
				UI.drawHighScore(Game.highScore);
				if (window.localStorage) {
					localStorage.setItem(keyHighScore, Game.highScore.toString());
				}
			} else {
				$("#new_high_score").hide();
			};
			if (hasWon) {
				this.level++;
			} else {
				this.score = 0;
				this.level = 0;
			};

			Game.bindStartButton();

			UI.gameArea.unbind("click");
			//UI.gameArea.unbind("mousemove");
			UI.endGame(hasWon, this.score);
		};

		public getBubbles(): Bubble[] { return this.bubbles; }

		public getNextBubble(): Bubble
		{
			let bubble = this.bubbleGenerator.createCurrentBubble();
			this.bubbles.push(bubble);

			bubble.sprite.appendTo(UI.boardElement);
			bubble.sprite.setPosition(
				(UI.boardElement.width() - BUBBLE_DIMS) / 2,
				CURRENT_BUBBLE_TOP
			);

			UI.drawBubblesRemaining(this.numBubbles);
			this.numBubbles--;

			return bubble;
		}

		public onClickGameArea(event: any): void
		{
			let angle = UI.getBubbleAngle(this.curBubble, event);
			let coords: Coords;
			let fireDistance = FIRE_DISTANCE;
			let fireDuration = FIRE_DURATION;
			let collision = CollisionDetector.findIntersection(this.curBubble, this.board, angle);
			if (collision) {
				coords = collision.coords;
				fireDuration = Math.round(fireDistance * collision.distToCollision / fireDuration);
				this.board.addBubble(this.curBubble, coords);
				let group = this.board.getGroup(this.curBubble);
				if (group.length >= POP_GROUP_LENGTH) {
					let delay = this.popBubbles(this.board, group, fireDuration);
					let cleared = group.length;

					var topRowBubbles = this.board.getTopRowBubbles();
					if (topRowBubbles.length <= 5) {
						delay = this.popBubbles(this.board, topRowBubbles, delay);
						cleared += topRowBubbles.length;
					};

					let orphans = this.board.findOrphans();
					if (orphans && orphans.length > 0) {
						this.dropBubbles(orphans, delay);
						cleared += orphans.length;
					}

					let points = cleared * POINTS_PER_BUBBLE;
					this.score += points;
					setTimeout(() => {
						UI.drawScore(this.score);
					}, delay);
				}
			} else {
				var distX = Math.sin(angle) * fireDistance;
				var distY = Math.cos(angle) * fireDistance;
				let bubbleCoords = UI.getBubbleCoords(this.curBubble);
				coords = {
					x: bubbleCoords.x + distX,
					y: bubbleCoords.y - distY
				};
			};
			UI.fireBubble(this.curBubble, coords, fireDuration);
			if (this.numBubbles == 0 || this.board.numRows > MAX_ROWS) {
				this.endGame(false);
			} else if (this.board.isEmpty()) {
				this.endGame(true);
			} else {
				this.curBubble = this.getNextBubble();
			}
		}

		private popBubbles(board: Board, bubbles: Bubble[], delay: number, popDuration: number = kFastPopDuration, popInterval: number = kFastPopInterval) : number
		{
			for (let bubble of bubbles) {
				setTimeout(() => {
					bubble.state = BubbleState.POPPING;
					bubble.animatePop(popDuration);
					setTimeout(() => {
						bubble.state = BubbleState.POPPED;
					}, popDuration);
					Sounds.playRandomVolume("pop.mp3", 0.5, 1);
				}, delay);
				delay += popInterval;

			}
			delay += popDuration;

			board.deleteBubbles(bubbles);
			return delay;
		}

		private dropBubbles(bubbles : Bubble[], delay: number)
		{
			for (let bubble of bubbles)
			{
				this.board.deleteBubbleAt(bubble.row, bubble.col);
				setTimeout(function () {
					bubble.state = BubbleState.FALLING;
					bubble.sprite.kaboom({
						callback: function () {
							bubble.sprite.remove();
							bubble.state = BubbleState.FALLEN;
						}
					});
				}, delay);
			}
		}
	};
};

