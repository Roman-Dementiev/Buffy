var JewelWarrior;
(function (JewelWarrior) {
    JewelWarrior.idSplashScreen = "splash-screen";
    JewelWarrior.idMainMenu = "main-menu";
    JewelWarrior.idGameScreen = "game-screen";
    JewelWarrior.idHighScores = "high-scores";
    var $ = Dom.$;
    var screens = {};
    var factories = {};
    var Screen = (function () {
        function Screen() {
        }
        Screen.prototype.setup = function () { };
        return Screen;
    }());
    JewelWarrior.Screen = Screen;
    function addScreenFactory(screenId, factory) {
        factories[screenId] = factory;
    }
    JewelWarrior.addScreenFactory = addScreenFactory;
    function createScreen(screenId) {
        /*
        switch (screenId) {
            case idSplashScreen:
                return new SplashScreen();
        }
        return null;
        */
        var factory = factories[screenId];
        if (factory) {
            return factory();
        }
        else {
            return null;
        }
    }
    function getScreen(screenId) {
        var screen = screens[screenId];
        if (!screen) {
            screen = createScreen(screenId);
            if (screen) {
                screen.setup();
                if (true) {
                    screens[screenId] = screen;
                }
            }
        }
        return screen;
    }
    function showScreen(screenId) {
        var screen = getScreen(screenId);
        if (!screen) {
            alert("Module '" + screenId + "' is not implemented yet.");
            return;
        }
        var screenElement = $("#" + screenId)[0];
        var activeElement = $("#game .screen.active")[0];
        if (activeElement) {
            Dom.removeClass(activeElement, "active");
        }
        Dom.addClass(screenElement, "active");
        screen.run();
    }
    JewelWarrior.showScreen = showScreen;
    function showSplashScreen() {
        showScreen(JewelWarrior.idSplashScreen);
    }
    JewelWarrior.showSplashScreen = showSplashScreen;
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=Screens.js.map