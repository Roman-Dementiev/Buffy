namespace JewelWarrior
{
	function hasWebWorkers() {
		return ("Worker" in window);
	}

	function hasWebGL()
	{
		var canvas = document.createElement("canvas"),
			gl = canvas.getContext("webgl") ||
				canvas.getContext("experimental-webgl");
		return !!gl;
	}

	export function bootstrap()
	{
		let params = Sandbox.documentParams({
			loader_delay: 'number',
			//use_workers: 'boolean',
			//webgl: 'boolean'
		});

		let useWorkers = false;
		if (hasWebWorkers()) {
			useWorkers = params.use_workers;
		}
		useWorkers = false;

		let useWebGL = false;
		if (hasWebGL()) {
			useWebGL = params.webgl;
		}
		//useWebGL = false;

		window.addEventListener("load", () =>
		{
			Loader.scriptDirectory("../../scripts/H5GCF/")
			Loader.load("Dom.js");
			Loader.load("JewelWarrior.js");
			Loader.load("Screens.js");
			Loader.load("SplashScreen.js", () =>
			{
				showSplashScreen();
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
			} else {
				Loader.load("BoardRenderer2D.js");
			}

			if (useWorkers) {
				Loader.load("BoardCaller.js");
			} else {
				Loader.load("LayoutGenerator.js");
				Loader.load("BoardService.js");
			}

			Loader.load("MainMenu.js");
			Loader.load("GameScreen.js");
			Loader.load("HighScoresScreen.js");
			Loader.load("Input.js");
			Loader.load("Sounds.js");
			Loader.load("Storage.js")
			Loader.load("Game.js", () =>
			{
				Loader.logScripts();
				Game.initialize()
			});
		});
	}

};
