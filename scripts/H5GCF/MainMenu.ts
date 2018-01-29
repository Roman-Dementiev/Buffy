namespace JewelWarrior
{
	export class MainMenu extends Screen
	{
		//constructor() { }

		public setup(): void
		{
			
			Dom.bind("#main-menu ul.menu", "click", function (e)
			{
				if (e.target.nodeName.toLowerCase() === "button") {
					var action = e.target.getAttribute("name");
					showScreen(action);
				}
			});
		}

		public run(): void
		{
		}

	};

	addScreenFactory(idMainMenu, () => new MainMenu());
}
