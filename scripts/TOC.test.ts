namespace TOC_test
{
	var tocStyles: TOC.Styles = {
		//titleClass: 'TOC_header',
		titleTag: 'header',
		typeSpecs: {
			book: {
				collapsable: false,
			},
			"bonus book": {
				collapsable: true,
				startOpen: false,
				listTag: 'ol'
			},
			samples: {
				collapsable: true,
				startOpen: true,
				listTag: 'ol'
			}
		}
	};

	type Mode = 'JSON' | 'TOC' | 'HTML';

	var TOC_element: HTMLElement = null;
	var TOC_textarea: HTMLInputElement = null;
	var originalHtml: string;

	var testBenchElement: HTMLElement,
		showTestBenchButton: HTMLButtonElement,
		hideTestBenchButton: HTMLButtonElement,
		showJSONButton: HTMLButtonElement,
		showTOCButton: HTMLButtonElement,
		showHTMLButton: HTMLButtonElement,
		generateHTMLButton: HTMLButtonElement,
		injectHTMLButton: HTMLButtonElement,
		restoreHTMLButton: HTMLButtonElement;

	var currentMode: Mode = null;
	var tocObject: TOC.CToc = null;
	var tocSource: string = "";
	var tocNormal: string = "";
	var tocHtml: string = "";

	const indentJSON = 2;
	const indentHTML = 2;

	function useJson(json: string, inject = false, onError?: (err) => void)
	{
		let toc: TOC.Entry = { title: "", json: json };
		useTOC(toc, null, "TOC", inject, onError);
	}

	function useTOC(toc: TOC.Entry, source?: string, sourceMode?: Mode, inject = false, onError?: (err) => void)
	{
		//console.log("useTOC: ", toc, "source: ", wrap("source:", source), " sourceMode: ", sourceMode);

		tocObject = null;
		tocSource = source ? source : "";
		tocNormal = tocHtml = "";
		updateButtons();

		if (toc) {
			TOC.toHtml({
				toc: toc,
				styles: tocStyles,
				indent: indentHTML,
				//idScope: TOC.Scope.Local,
				initHook: (ctoc: TOC.CToc): void =>
				{
					TOC.forClass(ctoc.root, 'bonus', (entry: TOC.Entry) => {
						entry.title = "Bonus: " + entry.title;
					});

					tocObject = ctoc;
					tocNormal = ctoc.toJson(indentJSON);
					if (sourceMode === 'TOC') {
						toc = ctoc.simplify();
						tocSource = toc ? JSON.stringify(toc, null, indentJSON) : "";
					}
				}
			}, callback);
		}

		function callback(html: string, err: any)
		{
			if (err) {
				if (onError) {
					onError(err);
				} else {
					alert("Error: " + err.toString());
				}

				tocObject = null;
				tocSource = tocNormal = tocHtml = "";
			} else {
				tocHtml = html;

				if (inject) {
					injectHTML(true);
					if (tocObject) {
						//console.log("Loading state");
						tocObject.loadState("TOC_test");
					}
				}
			}
			updateButtons();
		}
	}

	function tryParse(source: string, alertMode: Mode): TOC.Entry | null
	{
		let toc = null;
		try {
			toc = JSON.parse(source);
		} catch (err) {
			console.error("Can not parse TOC: ", err);
			if (alertMode) {
				alert("Can not parse " + alertMode + "\n" + err.toString());
			}
		}
		return toc;
	}

	function tryUseSource(source: string, sourceMode: Mode, switchoMode: Mode)
	{
		let toc = tryParse(source, sourceMode);
		if (toc) {
			useTOC(toc, source, sourceMode);

			if (switchoMode) {
				showMode(switchoMode);
			}
		}
	}

	function useSource(json: File | string, sourceMode: Mode, switchMode: Mode)
	{
		useTOC(null);

		if (json) {
			if (typeof json === 'string') {
				tryUseSource(json, sourceMode, switchMode);
			} else {
				let reader = new FileReader();
				reader.onloadend = (e) => {
					tryUseSource(reader.result, sourceMode, switchMode);
				};
				reader.readAsText(json);
			}
		}
	}

	function generateHTML()
	{
		if (currentMode !== 'HTML') {
			useSource(TOC_textarea.value, currentMode, 'HTML');
		}
	}

	function injectHTML(replaceOriginal = false)
	{
		if (!TOC_element)
			return;

		if (replaceOriginal || typeof originalHtml === 'undefined') {
			originalHtml = TOC_element.innerHTML;
		}

		showMode('HTML');
		let html = TOC_textarea.value;
		TOC_element.innerHTML = html;
	}

	function restoreHTML()
	{
		if (!TOC_element || typeof originalHtml === 'undefined')
			return;

		TOC_element.innerHTML = originalHtml;
	}

	function wrap(name: string, value: any, always: boolean = false)
	{
		if (value || always) {
			let wrapper = {};
			wrapper[name] = value;
			return wrapper;
		} else {
			return value;
		}
	}

	function showMode(mode: Mode)
	{
		if (!TOC_textarea/* || currentMode == mode*/)
			return;

		switch (mode) {
			case 'JSON':
				//console.log("showMode('JSON'): ", wrap("text", tocSource));
				TOC_textarea.value = tocSource;
				break;
			case 'TOC':
				//console.log("showMode('TOC'): ", wrap("text", tocNormal));
				TOC_textarea.value = tocNormal;
				break;
			case 'HTML':
				//console.log("showMode('HTML'): ", wrap("text", tocHtml));
				TOC_textarea.value = tocHtml;
				break;
			default:
				//console.log("showMode(null)");
				TOC_textarea.value = "";
				break;
		}
		currentMode = mode;

		updateButtons();
	}

	function bindButton(id: string, handler: () => void): HTMLButtonElement|null
	{
		let el = document.getElementById(id);
		if (el) {
			el.addEventListener('click', (e) =>
			{
				handler();
				e.preventDefault();
			});
			return el as HTMLButtonElement;
		} else {
			console.warn("Element '" + id + "' not found");
			return null;
		}
	}

	function displayMode(show: boolean) {
		return show ? 'display:block;' : 'display:none;';
	}

	function showTestBench(show: boolean)
	{
		if (testBenchElement) {
			testBenchElement.setAttribute('style', displayMode(show));
		}
		if (showTestBenchButton) {
			showTestBenchButton.setAttribute('style', displayMode(!show));
		}
	}

	export function initialize(json: string, defaultToc?: TOC.Entry)
	{
		testBenchElement = document.getElementById('TestBench');
		TOC_element = document.getElementById('TOC');
		TOC_textarea = document.getElementById('TOC_textarea') as HTMLInputElement;

		showTestBenchButton = bindButton('showTestBench', () => showTestBench(true));
		hideTestBenchButton = bindButton('hideTestBench', () => showTestBench(false));
		showJSONButton = bindButton('showJSON', () => showMode('JSON'));
		showTOCButton = bindButton('showTOC', () => showMode('TOC'));
		showHTMLButton = bindButton('showHTML', () => showMode('HTML'));
		generateHTMLButton = bindButton('generateHTML', () => generateHTML());
		injectHTMLButton = bindButton('injectHTML', () => injectHTML());
		restoreHTMLButton = bindButton('restoreHTML', () => restoreHTML());

		let chooseJSON = document.getElementById('chooseJSON') as HTMLInputElement;
		if (chooseJSON) {
			chooseJSON.addEventListener('click', (e) =>
			{
				chooseJSON.value = ""; // force change event
			});
			chooseJSON.addEventListener('change', (e) =>
			{
				//console.log('chooseJSON change: files=', chooseJSON.files, " value=", chooseJSON.value);
				if (chooseJSON.files && chooseJSON.files.length > 0) {
					useSource(chooseJSON.files[0], 'JSON', 'JSON');
				} else {
					useSource(null, null, null);
				}
			});
		}

		TestBench.aliases('all');
		//TestBench.show();
		updateButtons();

		//json = null;
		if (json) {
			useJson(json, true, (err) =>
			{
				let msg = err.toString();
				if (defaultToc) {
					msg += "\nUsing default TOC";
				}
				alert(msg);
				setTimeout(useDefault, 0);
			});
		} else {
			useDefault();
		}

		function useDefault()
		{
			if (defaultToc) {
				useTOC(defaultToc, null, 'TOC', true);
			}
			showMode('HTML');
		}
	}


	function updateButtons()
	{
		showJSONButton.disabled = currentMode === 'JSON';
		showTOCButton.disabled = currentMode === 'TOC';
		showHTMLButton.disabled = currentMode === 'HTML';
		generateHTMLButton.disabled = currentMode === 'HTML';
		injectHTMLButton.disabled = !tocHtml || currentMode !== 'HTML';
		restoreHTMLButton.disabled = !originalHtml || currentMode !== 'HTML';
	}
};

