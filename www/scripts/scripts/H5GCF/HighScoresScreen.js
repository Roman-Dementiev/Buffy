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
    var HighScoresScreen = (function (_super) {
        __extends(HighScoresScreen, _super);
        function HighScoresScreen() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HighScoresScreen.prototype.setup = function () {
            this.listEl = Dom.$("#high-scores ol.score-list")[0];
            Dom.bind("#high-scores button.back", "click", function () {
                JewelWarrior.showScreen(JewelWarrior.idMainMenu);
            });
        };
        HighScoresScreen.prototype.run = function () {
            var higScores = JewelWarrior.Storage.getHighScores();
            var lastScore = JewelWarrior.Storage.getLastScore();
            if (lastScore !== null) {
                JewelWarrior.Storage.clearLastScore();
                higScores = this.checkScores(higScores, lastScore);
            }
            this.populateList(higScores);
        };
        HighScoresScreen.prototype.checkScores = function (scores, lastScore) {
            for (var i = 0; i < scores.length; i++) {
                if (lastScore > scores[i].score) {
                    scores = this.addScore(scores, lastScore, i);
                    return;
                }
            }
            if (scores.length < JewelWarrior.kMaxHighScores) {
                scores = this.addScore(scores, lastScore, scores.length);
            }
            return scores;
        };
        HighScoresScreen.prototype.addScore = function (scores, score, position) {
            var name = prompt("Please enter your name:");
            var entry = {
                name: name,
                score: score
            };
            scores = scores.splice(position, 0, entry);
            if (scores.length > JewelWarrior.kMaxHighScores) {
                scores = scores.slice(0, JewelWarrior.kMaxHighScores);
            }
            JewelWarrior.Storage.saveHighScores(scores);
            return scores;
        };
        HighScoresScreen.prototype.populateList = function (scores) {
            // make sure the list is full
            for (var i = scores.length; i < JewelWarrior.kMaxHighScores; i++) {
                scores.push({
                    name: "---",
                    score: 0
                });
            }
            this.listEl.innerHTML = "";
            for (var i = 0; i < scores.length; i++) {
                var itemEl = document.createElement("li");
                var nameEl = document.createElement("span");
                var scoreEl = document.createElement("span");
                nameEl.innerHTML = scores[i].name;
                scoreEl.innerHTML = scores[i].score.toString();
                itemEl.appendChild(nameEl);
                itemEl.appendChild(scoreEl);
                this.listEl.appendChild(itemEl);
            }
        };
        return HighScoresScreen;
    }(JewelWarrior.Screen));
    JewelWarrior.HighScoresScreen = HighScoresScreen;
    ;
    JewelWarrior.addScreenFactory(JewelWarrior.idHighScores, function () { return new HighScoresScreen(); });
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=HighScoresScreen.js.map