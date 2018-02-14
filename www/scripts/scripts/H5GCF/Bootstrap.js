var JewelWarrior;
(function (JewelWarrior) {
    function hasWebWorkers() {
        return ("Worker" in window);
    }
    function hasWebGL() {
        var canvas = document.createElement("canvas"), gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
        return !!gl;
    }
    function bootstrap() {
        var params = Sandbox.documentParams({
            loader_delay: 'number',
        });
        var useWorkers = false;
        if (hasWebWorkers()) {
            useWorkers = params.use_workers;
        }
        useWorkers = false;
        var useWebGL = false;
        if (hasWebGL()) {
            useWebGL = params.webgl;
        }
        //useWebGL = false;
        window.addEventListener("load", function () {
            Loader.scriptDirectory("../../scripts/H5GCF/");
            Loader.load("Dom.js");
            Loader.load("JewelWarrior.js");
            Loader.load("Screens.js");
            Loader.load("SplashScreen.js", function () {
                JewelWarrior.showSplashScreen();
                if (params.loader_delay && params.loader_delay > 0) {
                    Loader.executeDelay = params.loader_delay;
                }
            });
            Loader.load("Board.js");
            Loader.load("BoardRendererBase.js");
            if (useWebGL) {
                Loader.load("WebGL.js");
                //Loader.load("Board.GL.js");
                Loader.load("BoardRendererGL.js");
            }
            else {
                Loader.load("BoardRenderer2D.js");
            }
            if (useWorkers) {
                Loader.load("BoardCaller.js");
            }
            else {
                Loader.load("LayoutGenerator.js");
                Loader.load("BoardService.js");
            }
            Loader.load("MainMenu.js");
            Loader.load("GameScreen.js");
            Loader.load("HighScoresScreen.js");
            Loader.load("Input.js");
            Loader.load("Sounds.js");
            Loader.load("Storage.js");
            Loader.load("Game.js", function () {
                Loader.logScripts();
                JewelWarrior.Game.initialize();
            });
        });
    }
    JewelWarrior.bootstrap = bootstrap;
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=Bootstrap.js.map