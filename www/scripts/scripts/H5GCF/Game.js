var JewelWarrior;
(function (JewelWarrior) {
    var Game;
    (function (Game) {
        var config;
        var service;
        var renderer;
        var cursor;
        var paused = false;
        var pauseStart;
        var state;
        var screen;
        function initialize(cfg) {
            config = Sandbox.mergeDefaults(cfg, JewelWarrior.kDefaultGameConfig);
            service = JewelWarrior.factory.createService(config);
            renderer = JewelWarrior.factory.createRenderer(config);
            JewelWarrior.Input.initialize(config);
            JewelWarrior.Input.bind(JewelWarrior.ActionSelectJewel, selectJewel);
            JewelWarrior.Input.bind(JewelWarrior.ActionMoveUp, moveUp);
            JewelWarrior.Input.bind(JewelWarrior.ActionMoveDown, moveDown);
            JewelWarrior.Input.bind(JewelWarrior.ActionMoveLeft, moveLeft);
            JewelWarrior.Input.bind(JewelWarrior.ActionMoveRight, moveRight);
            JewelWarrior.Sounds.initialize();
        }
        Game.initialize = initialize;
        function start(gameScreen, activeGame) {
            if (activeGame === void 0) { activeGame = null; }
            paused = false;
            screen = gameScreen;
            var startJewels = null;
            if (activeGame) {
                state = {
                    level: activeGame.level,
                    score: activeGame.score,
                    timer: 0,
                    startTime: Date.now() - activeGame.time,
                    endTime: activeGame.endTime
                };
                startJewels = activeGame.jewels;
            }
            else {
                state = {
                    level: 0,
                    score: 0,
                    timer: 0,
                    startTime: 0,
                    endTime: 0 // time to game over
                };
            }
            screen.updateGameInfo(state);
            service.initialize(startJewels, function () {
                renderer.initialize(JewelWarrior.GameScreen.boardElement, function () {
                    cursor = { col: 0, row: 0, selected: false };
                    renderer.start(service.board);
                    renderer.redrawBoard(function () {
                        if (activeGame) {
                            setLevelTimer(true);
                        }
                        else {
                            advanceLevel();
                        }
                    });
                });
            });
        }
        Game.start = start;
        function advanceLevel() {
            JewelWarrior.Sounds.play("levelup");
            state.level++;
            screen.announce("Level " + state.level);
            screen.updateGameInfo(state);
            state.startTime = Date.now();
            state.endTime = config.baseLevelTimer * Math.pow(state.level, -0.05 * state.level);
            setLevelTimer(true);
            renderer.levelUpAnimation();
        }
        function setLevelTimer(reset) {
            //		let percent = Game.updateTimer(reset, () => this.setLevelTimer(false));
            if (state.timer) {
                clearTimeout(state.timer);
                state.timer = 0;
            }
            if (reset) {
                state.startTime = Date.now();
                state.endTime = config.baseLevelTimer * Math.pow(state.level, -0.05 * state.level);
            }
            var delta = state.startTime + state.endTime - Date.now();
            var percent = (delta / state.endTime) * 100;
            if (delta > 0) {
                state.timer = setTimeout(function () { return setLevelTimer(false); }, 30);
                screen.updateProgress(percent);
            }
            else {
                gameOver();
            }
        }
        function gameOver() {
            JewelWarrior.Sounds.play("gameover");
            JewelWarrior.Storage.clearGameData();
            JewelWarrior.Storage.saveLastScore(state.score);
            renderer.gameOverAnimation(function () {
                screen.announce("Game over");
                setTimeout(function () {
                    JewelWarrior.showScreen(JewelWarrior.idHighScores);
                }, 2500);
            });
        }
        function isPaused() {
            return paused;
        }
        Game.isPaused = isPaused;
        function pause() {
            paused = true;
            pauseStart = Date.now();
            clearTimeout(state.timer);
            renderer.pause();
        }
        Game.pause = pause;
        function resume() {
            paused = false;
            var pauseTime = Date.now() - pauseStart;
            state.startTime += pauseTime;
            renderer.resume(pauseTime);
            setLevelTimer(false);
        }
        Game.resume = resume;
        function updateTimer(reset, callback) {
            if (state.timer) {
                clearTimeout(state.timer);
                state.timer = 0;
            }
            if (reset) {
                state.startTime = Date.now();
                state.endTime = config.baseLevelTimer * Math.pow(state.level, -0.05 * state.level);
            }
            var delta = state.startTime + state.endTime - Date.now();
            var percent = (delta / state.endTime) * 100;
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
        Game.updateTimer = updateTimer;
        function setCursor(col, row, select) {
            cursor.col = col;
            cursor.row = row;
            cursor.selected = select;
            renderer.setCursor(col, row, select);
        }
        function selectJewel(col, row) {
            if (paused) {
                return;
            }
            //if (arguments.length === 0) {
            //	selectJewel(cursor.row, cursor.col);
            //	return;
            //}
            if (cursor.selected) {
                var dx = Math.abs(col - cursor.col), dy = Math.abs(row - cursor.row), dist = dx + dy;
                if (dist === 0) {
                    // deselected the selected jewel
                    setCursor(col, row, false);
                }
                else if (dist == 1) {
                    // selected an adjacent jewel
                    service.swap(cursor.col, cursor.row, col, row, playBoardEvents);
                    setCursor(col, row, false);
                }
                else {
                    // selected a different jewel
                    setCursor(col, row, true);
                }
            }
            else {
                setCursor(col, row, true);
            }
        }
        Game.selectJewel = selectJewel;
        function playBoardEvents(events) {
            //console.log("playBoardEvents: ", events);
            if (events && events.length > 0) {
                var boardEvent = events.shift(), next = function () {
                    playBoardEvents(events);
                };
                switch (boardEvent.type) {
                    case JewelWarrior.BoardEventType.Move:
                        renderer.moveJewels(boardEvent.data, next);
                        break;
                    case JewelWarrior.BoardEventType.Remove:
                        JewelWarrior.Sounds.play("match");
                        renderer.removeJewels(boardEvent.data, next);
                        break;
                    case JewelWarrior.BoardEventType.Refill:
                        screen.announce("No moves!");
                        renderer.redrawBoard(next);
                        break;
                    case JewelWarrior.BoardEventType.Score:
                        addScore(boardEvent.data);
                        next();
                        break;
                    case JewelWarrior.BoardEventType.BadSwap:
                        JewelWarrior.Sounds.play("badswap");
                        next();
                        break;
                    default:
                        next();
                        break;
                }
            }
            else {
                renderer.redrawBoard(); // good to go again
            }
        }
        function addScore(points) {
            state.score += points;
            var nextLevelAt = Math.pow(config.baseLevelScore, Math.pow(config.baseLevelExp, state.level - 1));
            state.score += points;
            if (state.score >= nextLevelAt) {
                advanceLevel();
            }
            screen.updateGameInfo(state);
        }
        function moveCursor(dx, dy) {
            if (paused) {
                return;
            }
            var col = cursor.col + dx;
            var row = cursor.row + dy;
            if (cursor.selected) {
                if (col >= 0 && col < config.numCols &&
                    row >= 0 && row < config.numRows) {
                    selectJewel(col, row);
                }
            }
            else {
                col = (col + config.numCols) % config.numCols;
                row = (row + config.numRows) % config.numRows;
                setCursor(col, row, false);
            }
        }
        function moveUp() {
            moveCursor(0, -1);
        }
        Game.moveUp = moveUp;
        function moveDown() {
            moveCursor(0, 1);
        }
        Game.moveDown = moveDown;
        function moveLeft() {
            moveCursor(-1, 0);
        }
        Game.moveLeft = moveLeft;
        function moveRight() {
            moveCursor(1, 0);
        }
        Game.moveRight = moveRight;
        function saveGameData() {
            JewelWarrior.Storage.saveGameData(state, service.board.getLayout());
        }
        Game.saveGameData = saveGameData;
    })(Game = JewelWarrior.Game || (JewelWarrior.Game = {}));
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=Game.js.map