namespace JewelWarrior.Game
{
	var config: GameConfig;
	var service: IBoardSecvice;
	var renderer: IBoardRenderer;
	var cursor: Cursor;
	var paused: boolean = false;
	var pauseStart: number;

	var state: GameState;
	var screen: IGameScreen;


	export function initialize(cfg?: GameConfig)
	{
		config = Sandbox.mergeDefaults(cfg, kDefaultGameConfig);
		service = factory.createService(config);
		renderer = factory.createRenderer(config);

		Input.initialize(config);
		Input.bind(ActionSelectJewel, selectJewel);
		Input.bind(ActionMoveUp, moveUp);
		Input.bind(ActionMoveDown, moveDown);
		Input.bind(ActionMoveLeft, moveLeft);
		Input.bind(ActionMoveRight, moveRight);
		Sounds.initialize();
	}

	export function start(gameScreen: IGameScreen, activeGame: GameData = null): void
	{
		paused = false;
		screen = gameScreen;

		let startJewels: JewelLayout = null;
		if (activeGame) {
			state = {
				level: activeGame.level,
				score: activeGame.score,
				timer: 0,
				startTime: Date.now() - activeGame.time,
				endTime: activeGame.endTime
			}
			startJewels = activeGame.jewels;
		} else {
			state = {
				level: 0,
				score: 0,
				timer: 0, // setTimeout reference
				startTime: 0, // time at start of level
				endTime: 0 // time to game over
			};
		}

		screen.updateGameInfo(state);
		service.initialize(startJewels, () => {
			renderer.initialize(GameScreen.boardElement, () =>
			{
				cursor = { col: 0, row: 0, selected: false };
				renderer.start(service.board);
				renderer.redrawBoard(() =>
				{
					if (activeGame) {
						setLevelTimer(true);
					} else {
						advanceLevel();
					}
				});
			});
		});
	}

	function advanceLevel()
	{
		Sounds.play("levelup");
		state.level++;
		screen.announce("Level " + state.level);
		screen.updateGameInfo(state);
		state.startTime = Date.now();
		state.endTime = config.baseLevelTimer * Math.pow(state.level, -0.05 * state.level);
		setLevelTimer(true);
		renderer.levelUpAnimation();
	}

	function setLevelTimer(reset: boolean)
	{
//		let percent = Game.updateTimer(reset, () => this.setLevelTimer(false));

		if (state.timer) {
			clearTimeout(state.timer);
			state.timer = 0;
		}

		if (reset) {
			state.startTime = Date.now();
			state.endTime = config.baseLevelTimer * Math.pow(state.level, -0.05 * state.level);
		}
		let delta = state.startTime + state.endTime - Date.now();
		let percent = (delta / state.endTime) * 100;
		if (delta > 0) {
			state.timer = setTimeout(() => setLevelTimer(false), 30);
			screen.updateProgress(percent);
		} else {
			gameOver();
		}
	}

	function gameOver()
	{
		Sounds.play("gameover");
		Storage.clearGameData();
		Storage.saveLastScore(state.score);
		renderer.gameOverAnimation(() => {
			screen.announce("Game over")
			setTimeout(() => {
				showScreen(idHighScores);
			}, 2500);
		});
	}

	export function isPaused(): boolean
	{
		return paused;
	}

	export function pause()
	{
		paused = true;
		pauseStart = Date.now();
		clearTimeout(state.timer);
		renderer.pause();
	}

	export function resume()
	{
		paused = false;
		let pauseTime = Date.now() - pauseStart;
		state.startTime += pauseTime;
		renderer.resume(pauseTime);
		setLevelTimer(false);
	}

	export function updateTimer(reset: boolean, callback: Callback): number
	{
		if (state.timer) {
			clearTimeout(state.timer);
			state.timer = 0;
		}

		if (reset) {
			state.startTime = Date.now();
			state.endTime = config.baseLevelTimer * Math.pow(state.level, -0.05 * state.level);
		}
		let delta = state.startTime + state.endTime - Date.now();
		let percent = (delta / state.endTime) * 100;
		if (delta > 0) {
			state.timer = setTimeout(callback, 30);
		}

		return percent;
		//let progress = $("#game-screen .time .indicator")[0];
		//if (delta < 0) {
		//	gameOver();
		//} else {
		//	progress.style.width = percent + "%";
		//	gameState.timer = setTimeout(setLevelTimer, 30);
		//}
	}

	function setCursor(col: number, row: number, select: boolean): void
	{
		cursor.col = col;
		cursor.row = row;
		cursor.selected = select;

		renderer.setCursor(col, row, select);
	}

	export function selectJewel(col: number, row: number)
	{
		if (paused) {
			return;
		}
		//if (arguments.length === 0) {
		//	selectJewel(cursor.row, cursor.col);
		//	return;
		//}

		if (cursor.selected) {
			var dx = Math.abs(col - cursor.col),
				dy = Math.abs(row - cursor.row),
				dist = dx + dy;
			if (dist === 0) {
				// deselected the selected jewel
				setCursor(col, row, false);
			} else if (dist == 1) {
				// selected an adjacent jewel
				service.swap(cursor.col, cursor.row, col, row, playBoardEvents);
				setCursor(col, row, false);
			} else {
				// selected a different jewel
				setCursor(col, row, true);
			}
		} else {
			setCursor(col, row, true);
		}
	}

	function playBoardEvents(events: BoardEvent[])
	{
		//console.log("playBoardEvents: ", events);

		if (events && events.length > 0)
		{
			var boardEvent = events.shift(),
				next = function () {
					playBoardEvents(events);
				};

			switch (boardEvent.type)
			{
				case BoardEventType.Move:
					renderer.moveJewels(boardEvent.data, next);
					break;
				case BoardEventType.Remove:
					Sounds.play("match");
					renderer.removeJewels(boardEvent.data, next);
					break;
				case BoardEventType.Refill:
					screen.announce("No moves!");
					renderer.redrawBoard(next);
					break;
				case BoardEventType.Score:
					addScore(boardEvent.data);
					next();
					break;
				case BoardEventType.BadSwap:
					Sounds.play("badswap");
					next();
					break;
				default:
					next();
					break;
			}
		} else {
			renderer.redrawBoard(); // good to go again
		}
	}

	function addScore(points: number)
	{
		state.score += points;

		var nextLevelAt = Math.pow(
				config.baseLevelScore,
				Math.pow(config.baseLevelExp, state.level - 1)
			);
		state.score += points;
		if (state.score >= nextLevelAt) {
			advanceLevel();
		}
		screen.updateGameInfo(state);
	}

	function moveCursor(dx, dy)
	{
		if (paused) {
			return;
		}
		let col = cursor.col + dx;
		let row = cursor.row + dy;
		if (cursor.selected) {
			if (col >= 0 && col < config.numCols &&
				row >= 0 && row < config.numRows)
			{
				selectJewel(col, row);
			}
		} else {
			col = (col + config.numCols) % config.numCols;
			row = (row + config.numRows) % config.numRows;
			setCursor(col, row, false);
		}
	}

	export function moveUp() {
		moveCursor(0, -1);
	}
	export function moveDown() {
		moveCursor(0, 1);
	}
	export function moveLeft() {
		moveCursor(-1, 0);
	}
	export function moveRight() {
		moveCursor(1, 0);
	}


	export function saveGameData()
	{
		Storage.saveGameData(state, service.board.getLayout());
	}
};
