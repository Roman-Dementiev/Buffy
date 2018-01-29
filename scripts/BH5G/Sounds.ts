namespace BubbleShoot
{
	const MAX_SOUNDS = 10;

	export class Sounds
	{
		private static sounds: HTMLAudioElement[];
		private static curIndex = 0;

		public static play(url: string, volume: number)
		{
			if (!Sounds.sounds) {
				let sounds = [];
				for (let i = 0; i < MAX_SOUNDS; i++) {
					sounds.push(new Audio());
				}
				Sounds.sounds = sounds;
			}

			let sound = Sounds.sounds[this.curIndex++];
			if (Sounds.curIndex == Sounds.sounds.length)
				Sounds.curIndex = 0;

			sound.src = url;
			sound.volume = volume;
			sound.play();
		}

		public static playRandomVolume(url: string, minVolume: number = 0, maxVolume: number = 1)
		{
			let volume = minVolume + Math.random() * (maxVolume - minVolume);
			this.play(url, volume);
		}
	};
};

