namespace Loader
{
	type Callback = () => void;

	enum State {
		Pending,
		Loaded,
		Executed,
	};

	type QueueEntry = {
		state: State,
		source?: string,
		callback?: Callback
	};

	type Queue = {
		entries: QueueEntry[],
		scripts: object,
		nextIndex: number
		numQueued: number,
		numLoaded: number,
		numExecuted: number
	};

	var scriptDir = "";
	var queue: Queue = {
		entries: [],
		scripts: {},
		nextIndex: 0,
		numQueued: 0,
		numLoaded: 0,
		numExecuted: 0
	};
	var executeRunning = false;


	export var executeDelay = -1;

	export function scriptDirectory(dir: string) {
		scriptDir = dir ? dir : "";
	}

	export function getLoadProgress()
	{
		if (queue.numQueued >= 0) {
			return queue.numExecuted / queue.numQueued;
		} else {
			return 0;
		}
	}

	function onLoad(queueEntry: QueueEntry, success: boolean)
	{
		console.debug(`Script loaded: "${queueEntry.source}"`);
		queueEntry.state = State.Loaded;
		queue.scripts[queueEntry.source] = State.Loaded;
		queue.numLoaded++;
		if (!executeRunning) {
			executeScriptQueue();
		}
	}

	function onExecute(queueEntry: QueueEntry)
	{
		console.debug(`Script executed: "${queueEntry.source}"`);
		queueEntry.state = State.Executed;
		queue.scripts[queueEntry.source] = State.Executed;
		queue.numExecuted++;

		if (queueEntry.callback) {
			queueEntry.callback();
		}

		// try to execute more scripts
		executeScriptQueue();
	}

	export function load(source: string, callback?: () => void)
	{
		if (source) {
			if (scriptDir) {
				source = scriptDir + source;
			}

			if (typeof queue.scripts[source] != 'undefined') {
				console.debug(`Script '${source}' is already queued`);
				return;
			}

			let queueEntry = {
				state: State.Pending,
				source: source,
				callback: callback
			}
			queue.entries.push(queueEntry);
			queue.scripts[source] = State.Pending;
			queue.numQueued++;

			let image = new Image();
			image.onload = () => onLoad(queueEntry, true);
			image.onerror = () => onLoad(queueEntry, false);
			image.src = source;
		}
		else if (callback) {
			let queueEntry = {
				state: State.Pending,
				source: null,
				callback: callback
			}
			queue.entries.push(queueEntry);
			if (!executeRunning) {
				executeScriptQueue();
			}
		}
	}

	export function executeScriptQueue(checkDelay = true)
	{
		if (checkDelay && Loader.executeDelay >= 0) {
			setTimeout(() => executeScriptQueue(false), Loader.executeDelay);
			return;
		}

		let nextEntry: QueueEntry = queue.entries[queue.nextIndex];

		if (nextEntry && nextEntry.state == State.Loaded) {
			executeRunning = true;
//			queue.entries.shift();
			queue.nextIndex++;
			if (nextEntry.source) {
				let first = document.getElementsByTagName("script")[0];
				let script = document.createElement("script");
				script.onload = function () {
					onExecute(nextEntry);
				};
				script.src = nextEntry.source;
				first.parentNode.insertBefore(script, first);
			}
			else {
				if (nextEntry.callback) {
					nextEntry.callback();
				}
				executeScriptQueue();
			}
		} else {
			executeRunning = false;
		}
	}

	export function scripts() { return queue.scripts; }
	export function logScripts(groupTitle = "Loader scripts:")
	{
		if (groupTitle) {
			console.group(groupTitle);
		}

		for (let script in queue.scripts) {
			if (queue.scripts.hasOwnProperty(script)) {
				let state = queue.scripts[script];
				console.log(script, " : ", State[state])
			}
		}

		if (groupTitle) {
			console.groupEnd();
		}
	}
};;
