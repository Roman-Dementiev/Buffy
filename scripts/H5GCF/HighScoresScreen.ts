namespace JewelWarrior
{
	export class HighScoresScreen extends Screen
	{
		private listEl: any;

		public setup(): void
		{
			this.listEl = Dom.$("#high-scores ol.score-list")[0];

			Dom.bind("#high-scores button.back", "click", () => {
				showScreen(idMainMenu);
			});
		}

		public run(): void
		{
			let higScores = Storage.getHighScores();
			let lastScore = Storage.getLastScore();
			if (lastScore !== null) {
				Storage.clearLastScore();
				higScores = this. checkScores(higScores, lastScore);
			}

			this.populateList(higScores);
		}

		private checkScores(scores: HighScore[], lastScore: number): HighScore[]
		{
			for (let i = 0; i < scores.length; i++) {
				if (lastScore > scores[i].score) {
					scores = this.addScore(scores, lastScore, i);
					return;
				}
			}
			if (scores.length < kMaxHighScores) {
				scores = this.addScore(scores, lastScore, scores.length);
			}
			return scores;
		}

		private addScore(scores: HighScore[], score: number, position: number): HighScore[]
		{
			let name = prompt("Please enter your name:");
			let entry: HighScore = {
				name: name,
				score: score
			};
			scores = scores.splice(position, 0, entry);
			if (scores.length > kMaxHighScores) {
				scores = scores.slice(0, kMaxHighScores);
			}
			Storage.saveHighScores(scores);
			return scores;
		}

		private populateList(scores: HighScore[])
		{
			// make sure the list is full
			for (let i = scores.length; i < kMaxHighScores; i++) {
				scores.push({
					name: "---",
					score: 0
				});
			}
			this.listEl.innerHTML = "";

			for (let i = 0; i < scores.length; i++) {
				let itemEl = document.createElement("li");
				let nameEl = document.createElement("span");
				let scoreEl = document.createElement("span");
				nameEl.innerHTML = scores[i].name;
				scoreEl.innerHTML = scores[i].score.toString();

				itemEl.appendChild(nameEl);
				itemEl.appendChild(scoreEl);
				this.listEl.appendChild(itemEl);
			}
		}

	};

	addScreenFactory(idHighScores, () => new HighScoresScreen());
}
