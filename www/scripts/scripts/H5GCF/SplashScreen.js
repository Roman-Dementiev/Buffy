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
    var SplashScreen = (function (_super) {
        __extends(SplashScreen, _super);
        function SplashScreen() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SplashScreen.prototype.setup = function () {
            var $ = Dom.$;
            var screen = $("#splash-screen")[0];
            this.progressIndicator = $("#splash-screen .indicator")[0];
            this.continueButton = $(".continue", screen)[0];
        };
        SplashScreen.prototype.run = function () {
            this.checkProgress();
        };
        SplashScreen.prototype.ready = function () {
            this.continueButton.style.display = "block";
            Dom.bind("#" + JewelWarrior.idSplashScreen, "click", function () {
                JewelWarrior.showScreen(JewelWarrior.idMainMenu);
            });
        };
        SplashScreen.prototype.checkProgress = function () {
            var _this = this;
            var percent = Loader.getLoadProgress() * 100;
            this.progressIndicator.style.width = percent + "%";
            if (percent >= 100) {
                this.ready();
            }
            else {
                setTimeout(function () { return _this.checkProgress(); }, 30);
            }
        };
        return SplashScreen;
    }(JewelWarrior.Screen));
    JewelWarrior.SplashScreen = SplashScreen;
    ;
    JewelWarrior.addScreenFactory(JewelWarrior.idSplashScreen, function () { return new SplashScreen(); });
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=SplashScreen.js.map