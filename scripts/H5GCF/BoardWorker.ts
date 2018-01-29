importScripts("../Sandbox.js");
importScripts("JewelWarrior.js");
importScripts("Board.js");
importScripts("LayoutGenerator.js");
importScripts("BoardService.js");


namespace JewelWarrior
{
	var service: BoardService;

	function messageHandler(event)
	{
		if (!event || !event.data)
			return;

		let message = event.data;
		console.debug("BoardWorker received message: ", message);

		try {
			switch (message.command) {
				case cmdCreate:
					let config: GameConfig = message.data;
					service = new BoardService(config);
					//callback();
					break;

				case cmdInitialize:
					let startLayout: JewelLayout = message.data;
					service.initialize(startLayout, callback);
					break;

				case cmdSwap:
					let args: SwapArgs = message.data;
					service.swap(args.x1, args.y1, args.x2, args.y2, callback);
					break;
			}
		}
		catch (err) {
			console.error("BoardWorker error: ", err);
		}

		function callback(data?: any)
		{
			let reply = {
				id: message.id,
				data: data,
				jewels: service.getLayout()
			};
			console.debug("BoardWorker posting reply: ", reply);
			self.postMessage(reply, undefined);
		}
	}

	addEventListener("message", messageHandler, false);
}




