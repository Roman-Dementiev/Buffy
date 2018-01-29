namespace JewelWarrior.Input
{
	var inputHandlers,
		numCols, numRows;

	const Keys = {
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

	export var Binding = {
		KEY_UP: ActionMoveUp,
		KEY_LEFT: ActionMoveLeft,
		KEY_DOWN: ActionMoveDown,
		KEY_RIGHT: ActionMoveRight,
		KEY_ENTER: ActionSelectJewel,
		KEY_SPACE: ActionSelectJewel,
		CLICK: ActionSelectJewel,
		TOUCH: ActionSelectJewel,
	};

	export function initialize(config: GameConfig): void
	{
		inputHandlers = {};
		numCols = config.numCols;
		numRows = config.numRows;

		var boardElement = GameScreen.boardElement;  //Dom.$("#game-screen .game-board")[0];

		Dom.bind(boardElement, "mousedown", (event) => {
			handleClick(event, "CLICK", event);
		});

		Dom.bind(boardElement, "touchstart", (event) => {
			handleClick(event, "TOUCH", event.targetTouches[0]);
		});

		Dom.bind(document, "keydown", (event) =>
		{
			let action = keyBinding(event.keyCode);
			if (action) {
				event.preventDefault();
				trigger(action);
			}
		});
	}


	export function keyBinding(keyCode: number): string 
	{
		var keyName = Keys[keyCode];
		if (keyName && Binding[keyName]) {
			return Binding[keyName];
		} else {
			return null;
		}
	}

	export function bind(action: string, handler): void
	{
		if (!inputHandlers[action]) {
			inputHandlers[action] = [];
		}
		inputHandlers[action].push(handler);
	}

	function trigger(action: string, ...args: any[])
	{
		var handlers = inputHandlers[action];
		if (handlers) {
			for (let i = 0; i < handlers.length; i++) {
				handlers[i](...args);
			}
		}

	}

	function handleClick(event, control, click)
	{
		// is any action bound to this input control?
		var action = Binding[control];
		if (!action) {
			return;
		}

		var boardElement = GameScreen.boardElement, //Dom.$("#game-screen .game-board")[0],
			rect = boardElement.getBoundingClientRect(),
			relX, relY,
			jewelX, jewelY;

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

}
