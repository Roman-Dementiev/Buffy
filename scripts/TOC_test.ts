namespace TOC_test
{
	var alertUsingDefault = false;
	export var test: BaseTest;

	export const storageKey = 'TOC_test';
	export const indentJSON = 2;
	export const indentHTML = 2;

	export type SourceMode = 'JSON' | 'CTOC';
	export type BenchShowMode = 'JSON' | 'CTOC' | 'HTML';

	export var tocTypes = {
		'root': {
			listTag: 'table'
		},
		'book': {
			collapsable: false,
			startOpen: true,
			descriptionBreak: true,
			descriptionClass: 'description',
			//imagePlace: 'left',
			listTag: 'ul'
		},
		"bonus book": {
			collapsable: true,
			startOpen: false,
			listTag: 'ol',
			descriptionBreak: false,
			descriptionClass: 'description'
		},
		'samples': {
			collapsable: true,
			startOpen: true,
			listTag: 'ol'
		}
	};

	var rendererArg: TOC.RendererArg = {
		//headerTag: 'header',
		//collapsable: false,
		indentSize: indentHTML,
		stateStore: sessionStorage,
		divider: true,
		types: tocTypes
	};


	export abstract class BaseTest
	{
		originalHtml: string;
		defaultTOC: TOC.Entry = null;
		tocObject: TOC.CToc = null;
		tocSource: string = "";
		tocNormal: string = "";
		tocHtml: string = "";

		protected constructor() { }

		protected init(json: string, defaultTOC?: TOC.Entry)
		{
			this.defaultTOC = defaultTOC;

			let sessionJson = sessionStorage.getItem(storageKey+'.json');
			if (typeof sessionJson == 'string') {
				if (this.tryUseSource(sessionJson, 'JSON', 'HTML', true))
					return;
			}

			if (json) {
				this.useJson(json, true, (err) =>
				{
					//console.log(err);
					let showAlert = true;
					let msg = err.toString();
					if (defaultTOC) {
						msg += "\nUsing default TOC";
						showAlert = alertUsingDefault;
					}
					if (showAlert) {
						alert(msg);
					}
					setTimeout(() => this.useDefault(), 0);
				});
			} else {
				this.useDefault();
			}

		}

		protected useDefault()
		{
			if (this.defaultTOC) {
				this.useTOC(this.defaultTOC, null, 'CTOC', true);
			}
			this.benchShow('HTML');
	}

		protected useJson(json: string, inject = false, onError?: (err) => void)
		{
			let toc: TOC.Entry = { title: "", json: json };
			this.useTOC(toc, null, "CTOC", inject, onError);
		}

		protected useTOC(toc: TOC.Entry, source?: string, sourceMode?: SourceMode, inject = false, onError?: (err) => void)
		{
			//console.log("useTOC: ", toc, "source: ", wrap("source:", source), " sourceMode: ", sourceMode);

			this.tocObject = null;
			this.tocSource = source ? source : "";
			this.tocNormal = this.tocHtml = "";
			this.benchUpdate();
			if (!toc) return;

			let ctoc = new TOC.CToc();
			ctoc.init(toc, (ctoc, err) =>
			{
				if (err) {
					if (onError) {
						onError(err);
					} else {
						alert("Error: " + err.toString());
					}
					return;
				}
				this.onInited(ctoc, sourceMode, inject, onError);
			});
		}


		private onInited(ctoc: TOC.CToc, sourceMode: SourceMode, inject: boolean, onError: (err) => void)
		{
			this.tocObject = ctoc;
			this.tocNormal = ctoc.toJson(indentJSON);
			if (sourceMode === 'CTOC') {
				let toc = ctoc.simplify();
				this.tocSource = toc ? JSON.stringify(toc, null, indentJSON) : "";
			}
			this.tocHtml = this.renderHTML();

			if (inject) {
				this.injectHTML(true);
				if (this.tocObject) {
					//console.log("Loading state");
					this.tocObject.loadState(storageKey);
				}
			}

			this.benchUpdate();
		}

		protected tryUseSource(source: string, sourceMode: SourceMode, showMode: BenchShowMode, inject: boolean) : boolean
		{
			//console.log("tryUseSource(): ", source);

			let toc = null;
			let ret = true;
			try {
				toc = JSON.parse(source);
			} catch (err) {
				let msg = "Can not parse " + sourceMode;
				console.error(msg + ": ", err);
				alert(msg + "\n" + err.toString());
				ret = false;
			}

			this.useTOC(toc, source, sourceMode, inject);
			if (showMode) {
				this.benchShow(showMode);
			}
			return ret;
		}

		protected useSource(json: File | string, sourceMode: SourceMode, showMode: BenchShowMode, inject = false): boolean
		{
			this.useTOC(null);

			if (!json) return false;

			if (typeof json === 'string') {
				this.tryUseSource(json, sourceMode, showMode, inject);
			} else {
				let reader = new FileReader();
				reader.onloadend = (e) => {
					if (this.tryUseSource(reader.result, sourceMode, showMode, inject))
						sessionStorage.setItem(storageKey + '.json', reader.result);
				};
				reader.readAsText(json);
			}
		}

		protected bindChooseJSON(elementId = 'chooseJSON', inject = false)
		{
			let element = document.getElementById(elementId) as HTMLInputElement;
			if (element) {
				//console.log('binding chooseJSON');
				element.addEventListener('click', (e) =>
				{
					//console.log('chooseJSON click');
					element.value = ""; // force change event
				});
				element.addEventListener('change', (e) =>
				{
					//console.log('chooseJSON change: files=', element.files, " value=", element.value);
					if (element.files && element.files.length > 0) {
						this.useSource(element.files[0], 'JSON', 'JSON', inject);
					} else {
						this.useSource(null, null, null);
					}
				});
			} else {
				console.error(`Element with id='${elementId}' not found`)
			}
		}

		protected abstract benchShow(mode: BenchShowMode);
		protected abstract benchUpdate();
		protected abstract renderHTML(): string;
		protected abstract injectHTML(replaceOriginal: boolean);
	};

	export class Test extends BaseTest
	{
		TOC_element: HTMLElement;
		TOC_BenchElement: HTMLElement;
		TOC_BenchTextarea: HTMLInputElement;

		showTestBenchButton: HTMLButtonElement;
		hideTestBenchButton: HTMLButtonElement;
		showJSONButton: HTMLButtonElement;
		showCTOCButton: HTMLButtonElement;
		showHTMLButton: HTMLButtonElement;
		generateHTMLButton: HTMLButtonElement;
		injectHTMLButton: HTMLButtonElement;
		restoreHTMLButton: HTMLButtonElement;
		currentMode: BenchShowMode = null;


		constructor(json: string, defaultToc ?: TOC.Entry)
		{
			super();

			this.TOC_element = document.getElementById('TOC');
			this.TOC_BenchElement = document.getElementById('TestBench');
			this.TOC_BenchTextarea = document.getElementById('TestBench_textarea') as HTMLInputElement;

			this.showTestBenchButton = bindButton('showTestBench', () => this.showTestBench(true));
			this.hideTestBenchButton = bindButton('hideTestBench', () => this.showTestBench(false));
			this.showJSONButton = bindButton('showJSON', () => this.benchShow('JSON'));
			this.showCTOCButton = bindButton('showCTOC', () => this.benchShow('CTOC'));
			this.showHTMLButton = bindButton('showHTML', () => this.benchShow('HTML'));
			this.generateHTMLButton = bindButton('generateHTML', () => this.generateHTML());
			this.injectHTMLButton = bindButton('injectHTML', () => this.injectHTML());
			this.restoreHTMLButton = bindButton('restoreHTML', () => this.restoreHTML());

			this.bindChooseJSON();
			this.init(json, defaultToc);

			TestBench.aliases('all');
			//TestBench.show();
			this.benchUpdate();
		}

		protected benchUpdate()
		{
			this.showJSONButton.disabled = this.currentMode === 'JSON';
			this.showCTOCButton.disabled = this.currentMode === 'CTOC';
			this.showHTMLButton.disabled = this.currentMode === 'HTML';
			this.generateHTMLButton.disabled = this.currentMode === 'HTML';
			this.injectHTMLButton.disabled = !this.tocHtml || this.currentMode !== 'HTML';
			this.restoreHTMLButton.disabled = !this.originalHtml || this.currentMode !== 'HTML';
		}

		private showTestBench(show: boolean)
		{
			if (this.TOC_BenchElement) {
				this.TOC_BenchElement.setAttribute('style', displayMode(show));
			}
			if (this.showTestBenchButton) {
				this.showTestBenchButton.setAttribute('style', displayMode(!show));
			}
		}

		private generateHTML()
		{
			if ((this.currentMode === 'JSON'|| this.currentMode === 'CTOC') && this.TOC_BenchTextarea) {
				this.useSource(this.TOC_BenchTextarea.value, this.currentMode, 'HTML');
			}
		}

		protected renderHTML(): string
		{
			let renderer = TOC.createHtmlRenderer(rendererArg);
			return this.tocObject.toHtml(renderer);
		}

		protected injectHTML(replaceOriginal = false)
		{
			if (!this.TOC_element)
				return;

			if (replaceOriginal || typeof this.originalHtml === 'undefined') {
				this.originalHtml = this.TOC_element.innerHTML;
			}

			this.benchShow('HTML');
			let html = this.TOC_BenchTextarea.value;
			this.TOC_element.innerHTML = html;
		}

		private restoreHTML()
		{
			if (!this.TOC_element || typeof this.originalHtml === 'undefined')
				return;

			this.TOC_element.innerHTML = this.originalHtml;
		}

		protected benchShow(mode: BenchShowMode)
		{
			if (!this.TOC_BenchTextarea/* || currentMode == mode*/)
				return;

			switch (mode) {
				case 'JSON':
					//console.log("showMode('JSON'): ", wrap("text", tocSource));
					this.TOC_BenchTextarea.value = this.tocSource;
					break;
				case 'CTOC':
					//console.log("showMode('CTOC'): ", wrap("text", tocNormal));
					this.TOC_BenchTextarea.value = this.tocNormal;
					break;
				case 'HTML':
					//console.log("showMode('HTML'): ", wrap("text", tocHtml));
					this.TOC_BenchTextarea.value = this.tocHtml;
					break;
				default:
					//console.log("showMode(null)");
					this.TOC_BenchTextarea.value = "";
					break;
			}
			this.currentMode = mode;

			this.benchUpdate();
		}

	};

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


	export function init(json: string, defaultToc?: TOC.Entry)
	{
		console.log("TOC_test.init()");
		test = new Test(json, defaultToc);
	}
};

