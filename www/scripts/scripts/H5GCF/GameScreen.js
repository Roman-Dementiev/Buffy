var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JewelWarrior;
(function (JewelWarrior) {
    var GameScreen = (function (_super) {
        __extends(GameScreen, _super);
        function GameScreen() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //constructor() { super(); }
        GameScreen.prototype.setup = function () {
            var _this = this;
            this.overlayEl = Dom.$("#game-screen .pause-overlay")[0];
            this.scoreEl = Dom.$("#game-screen .score span")[0];
            this.levelEl = Dom.$("#game-screen .level span")[0];
            this.progressEl = Dom.$("#game-screen .time .indicator")[0];
            this.announceEl = Dom.$("#game-screen .announcement")[0];
            Dom.bind("footer button.exit", "click", function () { return _this.exitGame(); });
            Dom.bind("footer button.pause", "click", function () { return _this.pauseGame(); });
            Dom.bind(".pause-overlay", "click", function () { return _this.resumeGame(); });
        };
        GameScreen.prototype.run = function () {
            this.startGame();
        };
        GameScreen.prototype.updateGameInfo = function (state) {
            this.scoreEl.innerHTML = state.score;
            this.levelEl.innerHTML = state.level;
        };
        GameScreen.prototype.startGame = function () {
            var activeGame = JewelWarrior.Storage.loadGameData();
            if (activeGame) {
                if (!window.confirm("Do you want to continue your previous game?"))
                    activeGame = null;
            }
            JewelWarrior.Game.start(this, activeGame);
            this.overlayEl.style.display = "none";
        };
        GameScreen.prototype.pauseGame = function () {
            if (JewelWarrior.Game.isPaused())
                return; // do nothing if already paused
            this.overlayEl.style.display = "block";
            JewelWarrior.Game.pause();
        };
        GameScreen.prototype.resumeGame = function () {
            this.overlayEl.style.display = "none";
            JewelWarrior.Game.resume();
        };
        GameScreen.prototype.exitGame = function () {
            this.pauseGame();
            var confirmed = window.confirm("Do you want to return to the main menu?");
            if (confirmed) {
                JewelWarrior.Game.saveGameData();
                JewelWarrior.showScreen("main-menu");
            }
            else {
                this.resumeGame();
            }
        };
        GameScreen.prototype.updateProgress = function (percent) {
            this.progressEl.style.width = percent + "%";
        };
        GameScreen.prototype.announce = function (str) {
            var element = this.announceEl;
            element.innerHTML = str;
            Dom.removeClass(element, "zoomfade");
            setTimeout(function () {
                Dom.addClass(element, "zoomfade");
            }, 1);
        };
        return GameScreen;
    }(JewelWarrior.Screen));
    GameScreen.boardElement = Dom.$("#game-screen .game-board")[0];
    JewelWarrior.GameScreen = GameScreen;
    ;
    JewelWarrior.addScreenFactory(JewelWarrior.idGameScreen, function () { return new GameScreen(); });
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=GameScreen.js.map