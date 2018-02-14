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
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //constructor() { }
        MainMenu.prototype.setup = function () {
            Dom.bind("#main-menu ul.menu", "click", function (e) {
                if (e.target.nodeName.toLowerCase() === "button") {
                    var action = e.target.getAttribute("name");
                    JewelWarrior.showScreen(action);
                }
            });
        };
        MainMenu.prototype.run = function () {
        };
        return MainMenu;
    }(JewelWarrior.Screen));
    JewelWarrior.MainMenu = MainMenu;
    ;
    JewelWarrior.addScreenFactory(JewelWarrior.idMainMenu, function () { return new MainMenu(); });
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=MainMenu.js.map