var JewelWarrior;
(function (JewelWarrior) {
    var Input;
    (function (Input) {
        var inputHandlers, numCols, numRows;
        var Keys = {
            37: "KEY_LEFT",
            38: "KEY_UP",
            39: "KEY_RIGHT",
            40: "KEY_DOWN",
            13: "KEY_ENTER",
            32: "KEY_SPACE",
            65: "KEY_A",
            66: "KEY_B",
            67: "KEY_C",
            // alpha keys 68 - 87
            88: "KEY_X",
            89: "KEY_Y",
            90: "KEY_Z"
        };
        Input.Binding = {
            KEY_UP: JewelWarrior.ActionMoveUp,
            KEY_LEFT: JewelWarrior.ActionMoveLeft,
            KEY_DOWN: JewelWarrior.ActionMoveDown,
            KEY_RIGHT: JewelWarrior.ActionMoveRight,
            KEY_ENTER: JewelWarrior.ActionSelectJewel,
            KEY_SPACE: JewelWarrior.ActionSelectJewel,
            CLICK: JewelWarrior.ActionSelectJewel,
            TOUCH: JewelWarrior.ActionSelectJewel,
        };
        function initialize(config) {
            inputHandlers = {};
            numCols = config.numCols;
            numRows = config.numRows;
            var boardElement = JewelWarrior.GameScreen.boardElement; //Dom.$("#game-screen .game-board")[0];
            Dom.bind(boardElement, "mousedown", function (event) {
                handleClick(event, "CLICK", event);
            });
            Dom.bind(boardElement, "touchstart", function (event) {
                handleClick(event, "TOUCH", event.targetTouches[0]);
            });
            Dom.bind(document, "keydown", function (event) {
                var action = keyBinding(event.keyCode);
                if (action) {
                    event.preventDefault();
                    trigger(action);
                }
            });
        }
        Input.initialize = initialize;
        function keyBinding(keyCode) {
            var keyName = Keys[keyCode];
            if (keyName && Input.Binding[keyName]) {
                return Input.Binding[keyName];
            }
            else {
                return null;
            }
        }
        Input.keyBinding = keyBinding;
        function bind(action, handler) {
            if (!inputHandlers[action]) {
                inputHandlers[action] = [];
            }
            inputHandlers[action].push(handler);
        }
        Input.bind = bind;
        function trigger(action) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var handlers = inputHandlers[action];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i].apply(handlers, args);
                }
            }
        }
        function handleClick(event, control, click) {
            // is any action bound to this input control?
            var action = Input.Binding[control];
            if (!action) {
                return;
            }
            var boardElement = JewelWarrior.GameScreen.boardElement, //Dom.$("#game-screen .game-board")[0],
            rect = boardElement.getBoundingClientRect(), relX, relY, jewelX, jewelY;
            // click position relative to board
            relX = click.clientX - rect.left;
            relY = click.clientY - rect.top;
            // jewel coordinates
            jewelX = Math.floor(relX / rect.width * numCols);
            jewelY = Math.floor(relY / rect.height * numRows);
            // trigger functions bound to action
            trigger(action, jewelX, jewelY);
            // prevent default click behavior
            event.preventDefault();
        }
    })(Input = JewelWarrior.Input || (JewelWarrior.Input = {}));
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=Input.js.map