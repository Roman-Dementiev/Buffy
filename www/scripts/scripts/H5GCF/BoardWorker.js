importScripts("../Sandbox.js");
importScripts("JewelWarrior.js");
importScripts("Board.js");
importScripts("LayoutGenerator.js");
importScripts("BoardService.js");
var JewelWarrior;
(function (JewelWarrior) {
    var service;
    function messageHandler(event) {
        if (!event || !event.data)
            return;
        var message = event.data;
        console.debug("BoardWorker received message: ", message);
        try {
            switch (message.command) {
                case JewelWarrior.cmdCreate:
                    var config = message.data;
                    service = new JewelWarrior.BoardService(config);
                    //callback();
                    break;
                case JewelWarrior.cmdInitialize:
                    var startLayout = message.data;
                    service.initialize(startLayout, callback);
                    break;
                case JewelWarrior.cmdSwap:
                    var args = message.data;
                    service.swap(args.x1, args.y1, args.x2, args.y2, callback);
                    break;
            }
        }
        catch (err) {
            console.error("BoardWorker error: ", err);
        }
        function callback(data) {
            var reply = {
                id: message.id,
                data: data,
                jewels: service.getLayout()
            };
            console.debug("BoardWorker posting reply: ", reply);
            self.postMessage(reply, undefined);
        }
    }
    addEventListener("message", messageHandler, false);
})(JewelWarrior || (JewelWarrior = {}));
//# sourceMappingURL=BoardWorker.js.map