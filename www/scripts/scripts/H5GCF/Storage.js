var JewelWarrior;
(function (JewelWarrior) {
    var Storage;
    (function (Storage) {
        var keyActiveGameData = "activeGameData";
        var keyLastScore = "lastScore";
        var keyHighScores = "scores";
        function set(key, value) {
            value = JSON.stringify(value);
            localStorage.setItem(key, value);
        }
        Storage.set = set;
        function get(key) {
            try {
                var value = localStorage.getItem(key);
                return JSON.parse(value);
            }
            catch (err) {
                return null;
            }
        }
        Storage.get = get;
        function loadGameData() {
            return Storage.get(keyActiveGameData);
        }
        Storage.loadGameData = loadGameData;
        function saveGameData(state, layout) {
            var gameData = {
                level: state.level,
                score: state.score,
                time: Date.now() - state.startTime,
                endTime: state.endTime,
                jewels: layout
            };
            Storage.set(keyActiveGameData, gameData);
        }
        Storage.saveGameData = saveGameData;
        function clearGameData() {
            Storage.set(keyActiveGameData, null);
        }
        Storage.clearGameData = clearGameData;
        function getLastScore() {
            return Storage.get(keyLastScore);
        }
        Storage.getLastScore = getLastScore;
        function saveLastScore(score) {
            Storage.set(keyLastScore, score);
        }
        Storage.saveLastScore = saveLastScore;
        function clearLastScore() {
            Storage.set(keyLastScore, null);
        }
        Storage.clearLastScore = clearLastScore;
        function getHighScores() {
            return Storage.get(keyHighScores) || [];
        }
        Storage.getHighScores = getHighScores;
        function saveHighScores(scores) {
            return Storage.set(keyHighScores, scores);
        }
        Storage.saveHighScores = saveHighScores;
    })(Storage = JewelWarrior.Storage || (JewelWarrior.Storage = {}));
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=Storage.js.map