namespace JewelWarrior.Sounds
{
	var sounds,
		activeSounds: HTMLAudioElement[];

	type AudioFormat = {
		extension: string,
		mimeType: string
	};

	const knownFormats: AudioFormat[] = [
		{ extension: "ogg", mimeType: "audio/ogg; codecs='vorbis'" },
		{ extension: "mp3", mimeType: "audio/mpeg" }
	];
	var format: AudioFormat = null;

	export function initialize(): boolean
	{
		format = formatTest();
		if (!format) {
			return false;
		}

		sounds = {};
		activeSounds = [];
		return true;
	}

	function formatTest(formats: AudioFormat[] = knownFormats): AudioFormat
	{
		var audio = new Audio();
		for (let format of formats) {
			if (audio.canPlayType(format.mimeType) == "probably") {
				return format;
			}
		}
		for (let format of formats) {
			if (audio.canPlayType(format.mimeType) == "maybe") {
				return format;
			}
		}
		return null;
	}

	function createAudio(name: string): HTMLAudioElement
	{
		let el = new Audio("sounds/" + name + "." + format.extension);
		Dom.bind(el, "ended", cleanActive);
		sounds[name] = sounds[name] || [];

		sounds[name].push(el);
		return el;
	}

	function getAudioElement(name: string): HTMLAudioElement
	{
		if (sounds[name]) {
			for (let sound of sounds[name]) {
				if (sound.ended) {
					return sound;
				}
			}
		}
		return createAudio(name);
	}

	export function play(name)
	{
		var audio = getAudioElement(name);
		audio.play();
		activeSounds.push(audio);
	}

	function stop()
	{
		for (let i = activeSounds.length - 1; i >= 0; i--) {
		//	activeSounds[i].stop();
			let sound: any = activeSounds[i];
			if (sound.stop) {
				sound.stop();
			} else {
				activeSounds[i].pause();
			}
		}
		activeSounds.length = 0;
	}

	function cleanActive()
	{
		for (var i = 0; i < activeSounds.length; i++) {
			if (activeSounds[i].ended) {
				activeSounds.splice(i, 1);
			}
		}
	}
};
