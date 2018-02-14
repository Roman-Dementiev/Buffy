var BubbleShoot;
(function (BubbleShoot) {
    var MAX_SOUNDS = 10;
    var Sounds = (function () {
        function Sounds() {
        }
        Sounds.play = function (url, volume) {
            if (!Sounds.sounds) {
                var sounds = [];
                for (var i = 0; i < MAX_SOUNDS; i++) {
                    sounds.push(new Audio());
                }
                Sounds.sounds = sounds;
            }
            var sound = Sounds.sounds[this.curIndex++];
            if (Sounds.curIndex == Sounds.sounds.length)
                Sounds.curIndex = 0;
            sound.src = url;
            sound.volume = volume;
            sound.play();
        };
        Sounds.playRandomVolume = function (url, minVolume, maxVolume) {
            if (minVolume === void 0) { minVolume = 0; }
            if (maxVolume === void 0) { maxVolume = 1; }
            var volume = minVolume + Math.random() * (maxVolume - minVolume);
            this.play(url, volume);
        };
        return Sounds;
    }());
    Sounds.curIndex = 0;
    BubbleShoot.Sounds = Sounds;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=Sounds.js.map