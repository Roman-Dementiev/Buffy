var Loader;
(function (Loader) {
    var State;
    (function (State) {
        State[State["Pending"] = 0] = "Pending";
        State[State["Loaded"] = 1] = "Loaded";
        State[State["Executed"] = 2] = "Executed";
    })(State || (State = {}));
    ;
    var scriptDir = "";
    var queue = {
        entries: [],
        scripts: {},
        nextIndex: 0,
        numQueued: 0,
        numLoaded: 0,
        numExecuted: 0
    };
    var executeRunning = false;
    Loader.executeDelay = -1;
    function scriptDirectory(dir) {
        scriptDir = dir ? dir : "";
    }
    Loader.scriptDirectory = scriptDirectory;
    function getLoadProgress() {
        if (queue.numQueued >= 0) {
            return queue.numExecuted / queue.numQueued;
        }
        else {
            return 0;
        }
    }
    Loader.getLoadProgress = getLoadProgress;
    function onLoad(queueEntry, success) {
        console.debug("Script loaded: \"" + queueEntry.source + "\"");
        queueEntry.state = State.Loaded;
        queue.scripts[queueEntry.source] = State.Loaded;
        queue.numLoaded++;
        if (!executeRunning) {
            executeScriptQueue();
        }
    }
    function onExecute(queueEntry) {
        console.debug("Script executed: \"" + queueEntry.source + "\"");
        queueEntry.state = State.Executed;
        queue.scripts[queueEntry.source] = State.Executed;
        queue.numExecuted++;
        if (queueEntry.callback) {
            queueEntry.callback();
        }
        // try to execute more scripts
        executeScriptQueue();
    }
    function load(source, callback) {
        if (source) {
            if (scriptDir) {
                source = scriptDir + source;
            }
            if (typeof queue.scripts[source] != 'undefined') {
                console.debug("Script '" + source + "' is already queued");
                return;
            }
            var queueEntry_1 = {
                state: State.Pending,
                source: source,
                callback: callback
            };
            queue.entries.push(queueEntry_1);
            queue.scripts[source] = State.Pending;
            queue.numQueued++;
            var image = new Image();
            image.onload = function () { return onLoad(queueEntry_1, true); };
            image.onerror = function () { return onLoad(queueEntry_1, false); };
            image.src = source;
        }
        else if (callback) {
            var queueEntry = {
                state: State.Pending,
                source: null,
                callback: callback
            };
            queue.entries.push(queueEntry);
            if (!executeRunning) {
                executeScriptQueue();
            }
        }
    }
    Loader.load = load;
    function executeScriptQueue(checkDelay) {
        if (checkDelay === void 0) { checkDelay = true; }
        if (checkDelay && Loader.executeDelay >= 0) {
            setTimeout(function () { return executeScriptQueue(false); }, Loader.executeDelay);
            return;
        }
        var nextEntry = queue.entries[queue.nextIndex];
        if (nextEntry && nextEntry.state == State.Loaded) {
            executeRunning = true;
            //			queue.entries.shift();
            queue.nextIndex++;
            if (nextEntry.source) {
                var first = document.getElementsByTagName("script")[0];
                var script = document.createElement("script");
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
        }
        else {
            executeRunning = false;
        }
    }
    Loader.executeScriptQueue = executeScriptQueue;
    function scripts() { return queue.scripts; }
    Loader.scripts = scripts;
    function logScripts(groupTitle) {
        if (groupTitle === void 0) { groupTitle = "Loader scripts:"; }
        if (groupTitle) {
            console.group(groupTitle);
        }
        for (var script in queue.scripts) {
            if (queue.scripts.hasOwnProperty(script)) {
                var state = queue.scripts[script];
                console.log(script, " : ", State[state]);
            }
        }
        if (groupTitle) {
            console.groupEnd();
        }
    }
    Loader.logScripts = logScripts;
})(Loader || (Loader = {}));
;
;
//# sourceMappingURL=Loader.js.map