namespace JewelWarrior
{

	export class GameScreen extends Screen implements IGameScreen
	{
		private overlayEl: any;
		private scoreEl: any;
		private levelEl: any;
		private progressEl: any;
		private announceEl: any;

		public static readonly boardElement = Dom.$("#game-screen .game-board")[0];

		//constructor() { super(); }


		public setup(): void
		{
			this.overlayEl = Dom.$("#game-screen .pause-overlay")[0];
			this.scoreEl = Dom.$("#game-screen .score span")[0];
			this.levelEl = Dom.$("#game-screen .level span")[0];
			this.progressEl = Dom.$("#game-screen .time .indicator")[0];
			this.announceEl = Dom.$("#game-screen .announcement")[0];

			Dom.bind("footer button.exit", "click", () => this.exitGame());
			Dom.bind("footer button.pause", "click", () => this.pauseGame());
			Dom.bind(".pause-overlay", "click", () => this.resumeGame());

		}

		public run(): void
		{
			this.startGame();
		}

		public updateGameInfo(state: GameState)
		{
			this.scoreEl.innerHTML = state.score;
			this.levelEl.innerHTML = state.level;
		}

		private startGame()
		{
			let activeGame = Storage.loadGameData();
			if (activeGame) {
				if (!window.confirm("Do you want to continue your previous game?"))
					activeGame = null;
			}

			Game.start(this, activeGame);
			this.overlayEl.style.display = "none";
		}

		private pauseGame()
		{
			if (Game.isPaused())
				return; // do nothing if already paused
			

			this.overlayEl.style.display = "block";
			Game.pause();
		}

		private resumeGame()
		{
			this.overlayEl.style.display = "none";
			Game.resume();
		}

		private exitGame()
		{
			this.pauseGame();
			var confirmed = window.confirm(
				"Do you want to return to the main menu?"
			);

			if (confirmed) {
				Game.saveGameData();
				showScreen("main-menu");
			} else {
				this.resumeGame();
			}
		}

		public updateProgress(percent: number)
		{
			this.progressEl.style.width = percent + "%";
		}

		public announce(str: string)
		{
			let element = this.announceEl;
			element.innerHTML = str;
			Dom.removeClass(element, "zoomfade");
			setTimeout(() => {
				Dom.addClass(element, "zoomfade");
			}, 1);
		}
	};

	addScreenFactory(idGameScreen, () => new GameScreen());
}
