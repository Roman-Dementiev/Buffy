namespace JewelWarrior
{
	export class SplashScreen extends Screen
	{
		private progressIndicator;
		private continueButton;

		public setup(): void
		{
			let $ = Dom.$;
			let screen = $("#splash-screen")[0];
			this.progressIndicator = $("#splash-screen .indicator")[0];
			this.continueButton = $(".continue", screen)[0];
		}

		public run(): void
		{
			this.checkProgress();
		}

		private ready()
		{
			this.continueButton.style.display = "block";

			Dom.bind("#" + idSplashScreen, "click", () =>
			{
				showScreen(idMainMenu);
			});
		}

		private checkProgress()
		{
			let percent = Loader.getLoadProgress() * 100;

			this.progressIndicator.style.width = percent + "%";
			if (percent >= 100) {
				this.ready();
			} else {
				setTimeout(() => this.checkProgress(), 30);
			}
		}

	};

	addScreenFactory(idSplashScreen, () => new SplashScreen());
}
