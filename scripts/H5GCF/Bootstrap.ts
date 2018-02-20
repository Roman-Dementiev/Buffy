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

	async function bootstrap()
	{
		//await Dwarf.Loader.importAsync("Dwarf/Dwarf.js");

		let params = Dwarf.documentParams({
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


		await Dwarf.Loader.importAll(
			"Dom.js",
			"JewelWarrior.js",
			"Screens.js",
			"SplashScreen.js"
		);

		showSplashScreen();
		//if (params.loader_delay && params.loader_delay > 0) {
		//	Loader.executeDelay = params.loader_delay;
		//}

		let scripts = [
			"Board.js",
			"BoardRendererBase.js"
		];

		if (useWebGL) {
			scripts.push("WebGL.js", "BoardRendererGL.js");
		} else {
			scripts.push("BoardRenderer2D.js");
		}

		if (useWorkers) {
			scripts.push("BoardCaller.js");
		} else {
			scripts.push("LayoutGenerator.js");
			scripts.push("BoardService.js");
		}

		scripts.push(
			"MainMenu.js",
			"GameScreen.js",
			"HighScoresScreen.js",
			"Input.js",
			"Sounds.js",
			"Storage.js",
			"Game.js");

		await Dwarf.Loader.importAll(...scripts);

		Game.initialize()
	}

	export function init()
	{
		window.addEventListener("load", async () =>
		{
			Dwarf.init({
				pathes: { scripts: '../../scripts/H5GCF/', dwarf: '../../scripts/Dwarf/', '@': 'dwarf'},
				loader: '../Dwarf/Dwolf.js',
				bootstrap: bootstrap,
				beforeBoot: ['@Dwarf.js', '@Dwag.js']
			});
		});
	}
};
