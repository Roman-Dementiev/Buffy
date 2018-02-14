var JewelWarrior;
(function (JewelWarrior) {
    var Sounds;
    (function (Sounds) {
        var sounds, activeSounds;
        var knownFormats = [
            { extension: "ogg", mimeType: "audio/ogg; codecs='vorbis'" },
            { extension: "mp3", mimeType: "audio/mpeg" }
        ];
        var format = null;
        function initialize() {
            format = formatTest();
            if (!format) {
                return false;
            }
            sounds = {};
            activeSounds = [];
            return true;
        }
        Sounds.initialize = initialize;
        function formatTest(formats) {
            if (formats === void 0) { formats = knownFormats; }
            var audio = new Audio();
            for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
                var format_1 = formats_1[_i];
                if (audio.canPlayType(format_1.mimeType) == "probably") {
                    return format_1;
                }
            }
            for (var _a = 0, formats_2 = formats; _a < formats_2.length; _a++) {
                var format_2 = formats_2[_a];
                if (audio.canPlayType(format_2.mimeType) == "maybe") {
                    return format_2;
                }
            }
            return null;
        }
        function createAudio(name) {
            var el = new Audio("sounds/" + name + "." + format.extension);
            Dom.bind(el, "ended", cleanActive);
            sounds[name] = sounds[name] || [];
            sounds[name].push(el);
            return el;
        }
        function getAudioElement(name) {
            if (sounds[name]) {
                for (var _i = 0, _a = sounds[name]; _i < _a.length; _i++) {
                    var sound = _a[_i];
                    if (sound.ended) {
                        return sound;
                    }
                }
            }
            return createAudio(name);
        }
        function play(name) {
            var audio = getAudioElement(name);
            audio.play();
            activeSounds.push(audio);
        }
        Sounds.play = play;
        function stop() {
            for (var i = activeSounds.length - 1; i >= 0; i--) {
                //	activeSounds[i].stop();
                var sound = activeSounds[i];
                if (sound.stop) {
                    sound.stop();
                }
                else {
                    activeSounds[i].pause();
                }
            }
            activeSounds.length = 0;
        }
        function cleanActive() {
            for (var i = 0; i < activeSounds.length; i++) {
                if (activeSounds[i].ended) {
                    activeSounds.splice(i, 1);
                }
            }
        }
    })(Sounds = JewelWarrior.Sounds || (JewelWarrior.Sounds = {}));
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=Sounds.js.map