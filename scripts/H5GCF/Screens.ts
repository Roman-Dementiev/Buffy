namespace JewelWarrior
{
	export const idSplashScreen = "splash-screen";
	export const idMainMenu = "main-menu";
	export const idGameScreen = "game-screen";
	export const idHighScores = "high-scores";

	var $ = Dom.$;
	var screens = {};
	var factories = {};

	export abstract class Screen
	{
		public setup(): void { }
		public abstract run(): void;
	}

	export function addScreenFactory(screenId: string, factory: () => Screen)
	{
		factories[screenId] = factory;
	}

	function createScreen(screenId: string): Screen
	{
		/*
		switch (screenId) {
			case idSplashScreen:
				return new SplashScreen();
		}
		return null;
		*/
		let factory = factories[screenId];
		if (factory) {
			return factory();
		} else {
			return null;
		}
	}

	function getScreen(screenId: string): Screen
	{
		let screen: Screen = screens[screenId];
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

	export function showScreen(screenId: string)
	{
		let screen = getScreen(screenId);
		if (!screen) {
			alert(`Module '${screenId}' is not implemented yet.`);
			return;
		}

		let screenElement = $("#" + screenId)[0];
		let activeElement = $("#game .screen.active")[0];
		if (activeElement) {
			Dom.removeClass(activeElement, "active");
		}
		Dom.addClass(screenElement, "active");

		screen.run();
	}

	export function showSplashScreen()
	{
		showScreen(idSplashScreen);
	}
}
