namespace JewelWarrior.Storage
{
	const keyActiveGameData = "activeGameData";
	const keyLastScore = "lastScore";
	const keyHighScores = "scores";

	export function set(key: string, value: any): void
	{
		value = JSON.stringify(value);
		localStorage.setItem(key, value);
	}

	export function get(key): any
	{
		try {
			let value = localStorage.getItem(key);
			return JSON.parse(value);
		} catch (err) {
			return null;
		}
	}

	export function loadGameData(): GameData {
		return Storage.get(keyActiveGameData);
	}

	export function saveGameData(state: GameState, layout: JewelLayout)
	{
		let gameData: GameData = {
			level: state.level,
			score: state.score,
			time: Date.now() - state.startTime,
			endTime: state.endTime,
			jewels: layout
		};

		Storage.set(keyActiveGameData, gameData);
	}

	export function clearGameData()
	{
		Storage.set(keyActiveGameData, null);
	}

	export function getLastScore(): number|null
	{
		return Storage.get(keyLastScore);
	}

	export function saveLastScore(score: number)
	{
		Storage.set(keyLastScore, score);
	}

	export function clearLastScore()
	{
		Storage.set(keyLastScore, null);
	}

	export function getHighScores(): HighScore[]
	{
		return Storage.get(keyHighScores) || [];
	}

	export function saveHighScores(scores: HighScore[])
	{
		return Storage.set(keyHighScores, scores);
	}
}
