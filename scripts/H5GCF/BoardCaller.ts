namespace JewelWarrior
{
	export class WorkerCaller
	{
		private worker: Worker;
		private messageCount: number = 0;
		//private callbacks: Map<number, Callback>;
		private callbacks: Callback[];

		public constructor(script: string)
		{
			this.messageCount = 0;
			//this.callbacks = new Map<number, Callback>();
			this.callbacks = [];

			this.worker = new Worker(script);
			this.worker.addEventListener("message", (e) => { this.messageHandler(e); });
		}

		public post(command: string, data: any, callback: Callback): void
		{
			console.debug("Caller posting request: command=", command, " data=", data);

			let id = this.messageCount++;
			if (callback) {
				this.enqueCallback(id, callback);
			}
			this.worker.postMessage({
				id: id,
				command: command,
				data: data
			});
		}

		private messageHandler(event): void
		{
			let message = event.data;
			console.debug("Caller received reply: data=", message);

			this.handleMessage(message);

			let callback = this.dequeueCallback(message.id);
			if (callback) {
				callback(message.data);
			}
		}

		protected enqueCallback(id: number, callback: Callback)
		{
			//this.callbacks.set(id, callback);
			this.callbacks[id] = callback;
		}

		protected dequeueCallback(id: number): Callback
		{
			//let callback = this.callbacks.get(id);
			//if (callback) {
			//	this.callbacks.delete(id);
			//}
			//return callback;
			let callback: Callback = this.callbacks[id];
			if (callback) {
				delete this.callbacks[id];
			}
			return callback;
		}

		protected handleMessage(message: any): void {}
	};

	export class BoardCaller extends WorkerCaller implements IBoardSecvice
	{

		private jewels: IBoard;
		public get board(): IBoard { return this.jewels; }

		public constructor(config: GameConfig)
		{
			super("../../scripts/H5GCF/BoardWorker.js");

			this.jewels = factory.createBoard(config);

			config.generator = null; // can not pass generator to worker;
			this.postCreate(config, null);
		}

		public initialize(startJewels: JewelLayout, callback: Callback): void
		{
			this.postInitialize(startJewels, callback);
		}

		public swap(col1: number, row1: number, col2: number, row2: number, callback?: Callback)
		{
			let args: SwapArgs = {
				x1: col1,
				y1: row1,
				x2: col2,
				y2: row2
			};
			this.postSwap(args, callback);
		}

		private postCreate(config: GameConfig, callback: Callback) {
			this.post(cmdCreate, config, callback);
		}
		private postInitialize(startJewels: JewelLayout, callback: Callback) {
			this.post(cmdInitialize, startJewels, callback);
		}
		private postSwap(args: SwapArgs, callback: Callback) {
			this.post(cmdSwap, args, callback);
		}

		protected handleMessage(message: any): void
		{
			if (message.jewels) {
				this.jewels.setLayout(message.jewels);
			}
		}
	};

	if (JewelWarrior.factory) {
		JewelWarrior.factory.createService = (config: GameConfig) => {
			return new BoardCaller(config);
		};
	}
};
