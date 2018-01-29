class TestBench
{
	private static _id; // = "TestBench";
	private static _panel: Element;
	private static _shown: boolean = false;

	public static get id(): string { return TestBench._id; }
	public static set id(newId: string)
	{
		if (newId != TestBench._id) {
			let wasShown = TestBench._shown;
			if (TestBench._panel) {
				TestBench.hide();
			}

			TestBench._id = newId;
			if (wasShown) {
				TestBench.show();
			}
		}
	}

	public static getPanel(id: string = TestBench._id): Element
	{
		let panel: Element;
		if (id) {
			panel = document.getElementById(TestBench.id);
			if (!panel) {
				console.log("TestBench '" + TestBench._id + "' not found");
			}
		} else {
			panel = document.querySelector(".testbench");
			if (!panel) {
				console.log("TestBench not found");
			}
		}
		return panel;
	}

	public static get panel(): Element
	{
		if (typeof TestBench._panel === 'undefined') {
			TestBench._panel = TestBench.getPanel();
		}
		return TestBench._panel;
	}

	public static get isShown(): boolean
	{
		//if (typeof TestBench._shown == 'undefined') {
		//	let panel = TestBench.panel;
		//	if (panel) {
		//		let style = panel.getAttribute('style');
		//		console.log('style=', style);
		//	} else {
		//		TestBench._shown = false;
		//	}
		//}
		return TestBench._shown;
	}

	public static show(): void
	{
		let panel = TestBench.panel;
		if (panel) {
			panel.setAttribute('style', 'display:block');
			TestBench._shown = true;
		}
	}

	public static hide(): void
	{
		let panel = TestBench.panel;
		if (panel) {
			panel.setAttribute('style', 'display:none');
			TestBench._shown = false;
		}
	}

	public static toggle()
	{
		if (TestBench.isShown) {
			TestBench.hide();
		} else {
			TestBench.show();
		}
	}

	public static aliases(kind = 'long')
	{
		switch (kind)
		{
			case 'short':
				TestBench.defineAliases(window, true);
				break;
			case 'long':
				TestBench.defineAliases(window, false);
				break;
			case 'all':
				TestBench.aliases('short');
				TestBench.aliases('long');
				break;
			case 'none':
				TestBench.unalias('short');
				TestBench.unalias('long');
				break;
			default:
				console.warn("TestBench.aliases() argument must be 'short', 'long', 'all' or 'none'");
				break;
		}
	}

	public static unalias(kind = 'all')
	{
		switch (kind)
		{
			case 'short':
			let d: PropertyDecorator
				TestBench.undefAliases(window, true);
				break;
			case 'long':
				TestBench.undefAliases(window, false);
				break;
			case 'all':
				TestBench.unalias('short');
				TestBench.unalias('long');
				break;
			default:
				console.warn("TestBench.unalias() argument must be 'short', 'long' or 'all'");
				break;
		}
	}

	private static defineAliases(scope: any, short: boolean): void
	{
		for (let alias of TestBench._aliases) {
			let name = short ? alias.short : alias.long;
			if (name) {
				scope[name] = alias.fn;
			}
		}
	}

	private static undefAliases(scope: any, short: boolean): void
	{
		for (let alias of TestBench._aliases) {
			let name = short ? alias.short : alias.long;
			if (name) {
				scope[name] = undefined;
			}
		}
	}

	private static _aliases = [
		{
			short: '$tb',
			long: 'testBench',
			fn: () => TestBench.toggle()
		},{
			short: '$show',
			long: 'showTestBench',
			fn: () => TestBench.show()
		}, {
			short: '$hide',
			long: 'hideTestBench',
			fn: () => TestBench.hide()
		}
	];
};


/*
function testPanel

function showTocHtml()
{
	setElementStyle('TOC_textarea', 'display:block')
	let bench = TOC.getElement(testBenchId);
	if (el) {
		el.setAttribute('style', style);
	}
}

function hideTocHtml()
{
	setElementStyle('TOC_textarea', 'display:none')
}
*/

