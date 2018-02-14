var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JewelWarrior;
(function (JewelWarrior) {
    var WorkerCaller = (function () {
        function WorkerCaller(script) {
            var _this = this;
            this.messageCount = 0;
            this.messageCount = 0;
            //this.callbacks = new Map<number, Callback>();
            this.callbacks = [];
            this.worker = new Worker(script);
            this.worker.addEventListener("message", function (e) { _this.messageHandler(e); });
        }
        WorkerCaller.prototype.post = function (command, data, callback) {
            console.debug("Caller posting request: command=", command, " data=", data);
            var id = this.messageCount++;
            if (callback) {
                this.enqueCallback(id, callback);
            }
            this.worker.postMessage({
                id: id,
                command: command,
                data: data
            });
        };
        WorkerCaller.prototype.messageHandler = function (event) {
            var message = event.data;
            console.debug("Caller received reply: data=", message);
            this.handleMessage(message);
            var callback = this.dequeueCallback(message.id);
            if (callback) {
                callback(message.data);
            }
        };
        WorkerCaller.prototype.enqueCallback = function (id, callback) {
            //this.callbacks.set(id, callback);
            this.callbacks[id] = callback;
        };
        WorkerCaller.prototype.dequeueCallback = function (id) {
            //let callback = this.callbacks.get(id);
            //if (callback) {
            //	this.callbacks.delete(id);
            //}
            //return callback;
            var callback = this.callbacks[id];
            if (callback) {
                delete this.callbacks[id];
            }
            return callback;
        };
        WorkerCaller.prototype.handleMessage = function (message) { };
        return WorkerCaller;
    }());
    JewelWarrior.WorkerCaller = WorkerCaller;
    ;
    var BoardCaller = (function (_super) {
        __extends(BoardCaller, _super);
        function BoardCaller(config) {
            var _this = _super.call(this, "../../scripts/H5GCF/BoardWorker.js") || this;
            _this.jewels = JewelWarrior.factory.createBoard(config);
            config.generator = null; // can not pass generator to worker;
            _this.postCreate(config, null);
            return _this;
        }
        Object.defineProperty(BoardCaller.prototype, "board", {
            get: function () { return this.jewels; },
            enumerable: true,
            configurable: true
        });
        BoardCaller.prototype.initialize = function (startJewels, callback) {
            this.postInitialize(startJewels, callback);
        };
        BoardCaller.prototype.swap = function (col1, row1, col2, row2, callback) {
            var args = {
                x1: col1,
                y1: row1,
                x2: col2,
                y2: row2
            };
            this.postSwap(args, callback);
        };
        BoardCaller.prototype.postCreate = function (config, callback) {
            this.post(JewelWarrior.cmdCreate, config, callback);
        };
        BoardCaller.prototype.postInitialize = function (startJewels, callback) {
            this.post(JewelWarrior.cmdInitialize, startJewels, callback);
        };
        BoardCaller.prototype.postSwap = function (args, callback) {
            this.post(JewelWarrior.cmdSwap, args, callback);
        };
        BoardCaller.prototype.handleMessage = function (message) {
            if (message.jewels) {
                this.jewels.setLayout(message.jewels);
            }
        };
        return BoardCaller;
    }(WorkerCaller));
    JewelWarrior.BoardCaller = BoardCaller;
    ;
    if (JewelWarrior.factory) {
        JewelWarrior.factory.createService = function (config) {
            return new BoardCaller(config);
        };
    }
})(JewelWarrior || (JewelWarrior = {}));
;
//# sourceMappingURL=BoardCaller.js.map