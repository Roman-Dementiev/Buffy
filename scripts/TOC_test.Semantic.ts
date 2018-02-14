namespace TOC_test
{
	const kDefaultTitle = 'TOC Semantic';

	var previewMode: BenchShowMode = null; //'HTML';

	//type $Type = JQuery;
	var $title,
		$content,
		$sidebar,
		$bench,
		//$chooseJson,

		$semanticDefault,
		$semanticCollapsable,
		$semanticAccordion,
		$semanticDisabled,

		$sublevelsHtml,
		$sublevelsSemantic,
		$sublevelsShared,
		$collapsable,
		/*
		$imagesDefault,
		$imagesLeft,
		$imagesRight,
		$imagesAside,
		$imagesNone,
		*/
		$dividers,
		$ignoreIcons,
		$imagesDropdown,
		$indentDropdown,

		$uniformStyles,
		$asideDropdown,
		_;

	var tocTypes = {
		'root': {
			listTag: 'table'
		},
		'book': {
			collapsable: false,
			startOpen: true,
			descriptionBreak: true,
			descriptionClass: 'description',
			icon: 'book icon',
			listTag: 'ul'
		},
		"bonus book": {
			collapsable: true,
			startOpen: false,
			descriptionBreak: false,
			descriptionClass: 'description',
			icon: 'book icon',
			listTag: 'ol',
		},
		'chapter': {
			icon: 'bookmark icon'
		},
		'samples': {
			collapsable: true,
			startOpen: true,
			listTag: 'ol',
			icon: 'bookmark icon'
		},
		'example': {
			icon: 'codepen icon'
		}
	};

	var uniformCSS = {};
	var asideCSS = {};

	var renderingArg: TOC.SemanticRendererArg = {
		//mode: TOC.SemanticRenderingMode.Default,
		collapsable: true,
		//headerTag: 'header',
		indentSize: indentHTML,
		stateStore: sessionStorage,
		divider: true,
		//dividerAtStart: true,
		//dividerAtEnd: true,
		ignoreIcons: false,
		types: tocTypes
	};

	var HTMLRendererDefaults = {
		defaultDivider: '<div style="clear:both"></div>',
		//defaultListMode: 'ul'
	};

	enum SemanticMode
	{
		Disabled,
		Default,
		Collapsable,
		Accordion
	};
	var semantic = SemanticMode.Default;

	enum SublevelsMode
	{
		Html,
		Semantic,
		Shared
	};
	var sublevels = SublevelsMode.Html;

	interface IDropdown {
		dropdown(behavior: string, ...args: any[]);
	}

	interface ICheckbox {
		checkbox(behavior: string, ...args: any[]);
	}

	function bindDropdown(selector: string, action?: string, handler?: (value, text, selectedItem) => void): IDropdown
	{
		let found = $(selector) as any;
		if (found && found.length > 0 && found.dropdown) {
			if (!action && !handler) {
				found.dropdown();
			} else {
				let arg = {
					'action': action ? action : 'activate'
				}
				if (handler) {
					arg['onChange'] = handler;
				}

				found.dropdown(arg);
			};
		} else {
			console.warn(`dropdown '${selector}' not found`);
			return {
				dropdown: () => { }
			}
		}

		return found as IDropdown;
	}

	function bindCheckbox(selector: string, handler?: (target: Element)=>void): ICheckbox
	{
		let found = $(selector) as any;
		if (found && found.length > 0 && found.checkbox) {
			console.debug(`checkbox '${selector}' found`, found);
			found.checkbox();
			if (handler) {
				found.bind('changed', (ev) => handler(ev.target));
			}
		} else {
			console.warn(`checkbox '${selector}' not found`);
			return {
				checkbox: () => { }
			}
		}
		return found as ICheckbox;
	}

	function isChecked($ui): boolean
	{
		if (!$ui) {
			console.error("isChecked() no UI: $ui", $ui);
			return;
		}
		return !!$ui.checkbox('is checked');
	}

	function setChecked($ui, checked: boolean = true)
	{
		if (!$ui) {
			console.error("setChecked() no UI: $ui", $ui);
			return;
		}
		if (isChecked($ui) !== checked) {
			if (checked) {
				$ui.checkbox('check');
			} else {
				$ui.checkbox('uncheck');
			}
		}
	}

	function checkboxEnabled($ui, enabled: boolean)
	{
		if (!$ui) {
			console.error("checkboxEnabled() no UI: $ui", $ui);
			return;
		}
		if (enabled) {
			$ui.checkbox('set enabled');
		} else {
			$ui.checkbox('set disabled');
		}
	}

	function bindRadio(selector: string, handler?: (target: Element) => void): ICheckbox
	{
		return bindCheckbox(selector, handler);
	}


	function bindButton(selector: string, handler?: (target: Element) => void): any
	{
		let found = $(selector);
		if (found && found.length > 0) {
			console.debug(`button '${selector}' found`, found);
			if (handler) {
				console.debug(`binding button '${selector}'`);
				found.bind('click', (ev) =>
				{
					console.debug(`button handler for '${selector}'`);
					ev.preventDefault();
					handler(ev.target);
				});
			}
			return found;
		} else {
			console.warn(`button '${selector}' not found`);
			return null;
		}
	}

	class TestSamantic extends BaseTest
	{
		showMode: BenchShowMode = null;

		constructor(json: string, defaultTOC?: TOC.Entry)
		{
			super();

			$title = $('#TOC_title');
			$content = $('#TOC_content');
			$sidebar = $('#Sidebar');
			$bench = $('#bench-segment');

			//($('.ui.accordion') as any).accordion();
			//($('.ui.radio.checkbox') as any).checkbox();
			//($('.ui.dropdown') as any).dropdown();
			//($('.ui.sidebar') as any).sidebar('toggle');

			$('#sidedbarIcon').bind('click', (ev) =>
			{
				$sidebar.sidebar('toggle');
			});

			$('#sidedbarClose').bind('click', (ev) =>
			{
				$sidebar.sidebar('hide');
			});

			$('.regenerate').bind('change', (ev) =>
			{
				//console.log(".regenerate 'change': ev=", ev);
				this.regenerateRequest();
			});

			$semanticDefault = bindRadio('#semanticDefault');
			$semanticCollapsable = bindRadio('#semanticCollapsable');
			$semanticAccordion = bindRadio('#semanticAccordion');
			$semanticDisabled = bindRadio('#semanticDisabled');

			$sublevelsHtml = bindRadio('#sublevelsHtml')
			$sublevelsSemantic = bindRadio('#sublevelsSemantic')
			$sublevelsShared = bindRadio('#sublevelsShared')
			$collapsable = bindCheckbox('#collapsable');

			//$imagesDefault = bindRadio('#imagesDefault');
			//$imagesLeft = bindRadio('#imagesLeft');
			//$imagesRight = bindRadio('#imagesRight');
			//$imagesAside = bindRadio('#imagesAside');
			//$imagesNone = bindRadio('#imagesNone');

			$dividers = bindCheckbox('#dividers');
			$ignoreIcons = bindCheckbox('#ignoreIcons');
			$imagesDropdown = this.bindDropdown('#imagesDropdown');
			$indentDropdown = this.bindDropdown('#indentDropdown');

			$uniformStyles = bindCheckbox('#uniformStyles');
			$asideDropdown = this.bindDropdown('#asideDropdown');

			bindButton('#btnJSON', (ev) => this.openBench('JSON'));
			bindButton('#btnCTOC', (ev) => this.openBench('CTOC'));
			bindButton('#btnHTML', (ev) => this.openBench('HTML'));
			$('#bench-close').bind('click', (ev) => this.closeBench());

			bindButton('#btnRestore', (ev) => {
				this.restoreHTML();
			});

			let $uniform = $('uniform');
			uniformCSS = $uniform.css([
				'font-family',
				'font-size',
				'font-weight',
				'font-stretch',
				'font-style',
				'padding',
				'margin',
				'text-align',
				'overflow'
			]);
			console.log("uniformCSS=", uniformCSS);

			let $aside = $('aside');
			asideCSS = $aside.css(['float', 'clear']);

			this.benchUpdate();

			this.bindChooseJSON('chooseJSON', true);
			this.init(json, defaultTOC);
		}

		protected bindDropdown(id: string): IDropdown
		{
			return bindDropdown(id, null, (value, text, selectedItem) =>
			{
				console.log(id +" 'onChange' value=", value, " text=", text, " selectedItem=", selectedItem);
				this.regenerateRequest();
			});
		}

		protected benchShow(mode: BenchShowMode)
		{
			//console.trace(`benchShow(${mode})`);
			let text: string;

			switch (mode) {
				case 'JSON':
					text = this.tocSource;
					break;
				case 'CTOC':
					text = this.tocNormal;
					break;
				case 'HTML':
					text = this.tocHtml;
					break;
				default:
					mode = null;
					text = "";
					break;
			}

			$('#bench-mode').text(mode ? mode : "");
			$('#bench-textarea').val(text);
			this.showMode = mode;
		}

		protected openBench(mode?: BenchShowMode)
		{
			//console.trace(`openBench(${mode})`);
			if (mode) {
				this.benchShow(mode);
			}
			$bench.css('display', 'block');
		}

		protected closeBench()
		{
			$bench.css('display', 'none');
		}

		protected benchUpdate()
		{
			let semanticEnabled = true;
			let collapsableEnabled = true;
			let accordion = false;
			switch (semantic)
			{
				case SemanticMode.Default:
					setChecked($semanticDefault);
					break;

				case SemanticMode.Collapsable:
					setChecked($semanticCollapsable);
					break;

				case SemanticMode.Accordion:
					setChecked($semanticAccordion);
					if (sublevels === SublevelsMode.Shared) {
						sublevels = SublevelsMode.Semantic;
					}
					if (sublevels === SublevelsMode.Semantic) {
						renderingArg.collapsable = false;
						collapsableEnabled = false;
					}
					accordion = true;
					break;

				case SemanticMode.Disabled:
					setChecked($semanticDisabled);
					semanticEnabled = false;
					break;
			}

			switch (sublevels)
			{
				case SublevelsMode.Html:
					setChecked($sublevelsHtml);
					break;
				case SublevelsMode.Semantic:
					setChecked($sublevelsSemantic);
					break;
				case SublevelsMode.Shared:
					setChecked($sublevelsShared);
					renderingArg.collapsable = semantic === SemanticMode.Collapsable;
					collapsableEnabled = false;
					break;
			}

			//switch (renderingArg.imagePlace)
			//{
			//	case TOC.kImageLeft:
			//		setChecked($imagesLeft);
			//		break;
			//	case TOC.kImageRight:
			//		setChecked($imagesRight);
			//		break;
			//	case TOC.kImageAside:
			//		setChecked($imagesAside);
			//		break;
			//	case TOC.kImageNone:
			//		setChecked($imagesNone);
			//		break;
			//	default:
			//		setChecked($imagesDefault);
			//		break;
			//}

			if (!semanticEnabled) {
				setChecked($sublevelsHtml);
			}
			checkboxEnabled($sublevelsHtml, semanticEnabled);
			checkboxEnabled($sublevelsSemantic, semanticEnabled);
			checkboxEnabled($sublevelsShared, semanticEnabled && !accordion);
			checkboxEnabled($collapsable, collapsableEnabled);

			setChecked($collapsable, renderingArg.collapsable);
			setChecked($dividers, !!renderingArg.divider);
			setChecked($ignoreIcons, !!renderingArg.ignoreIcons);
		}


		protected renderHTML(updateArg?: boolean): string
		{
			if (updateArg) {
				let accordion = false;
				let collapsable = isChecked($collapsable);

				if (isChecked($semanticDefault)) {
					semantic = SemanticMode.Default;
				} else if (isChecked($semanticCollapsable)) {
					semantic = SemanticMode.Collapsable;
				} else if (isChecked($semanticAccordion)) {
					semantic = SemanticMode.Accordion;
					accordion = true;
				} else {
					semantic = SemanticMode.Disabled;
				}

				if (isChecked($sublevelsHtml)) {
					sublevels = SublevelsMode.Html;
				} else if (isChecked($sublevelsSemantic)) {
					sublevels = SublevelsMode.Semantic;
				} else {
					if (accordion) {
						sublevels = SublevelsMode.Semantic;
						collapsable = false;
					} else {
						sublevels = SublevelsMode.Shared;
					}
				}

				//if (isChecked($imagesDefault)) {
				//	renderingArg.imagePlace = null;
				//} else if (isChecked($imagesLeft)) {
				//	renderingArg.imagePlace = TOC.kImageLeft;
				//} else if (isChecked($imagesRight)) {
				//	renderingArg.imagePlace = TOC.kImageRight;
				//} else if (isChecked($imagesAside)) {
				//	renderingArg.imagePlace = TOC.kImageAside;
				//} else if (isChecked($imagesNone)) {
				//	renderingArg.imagePlace = TOC.kImageNone;
				//}

				renderingArg.collapsable = collapsable;
				renderingArg.divider = isChecked($dividers);
				renderingArg.ignoreIcons = isChecked($ignoreIcons);

				let images = $imagesDropdown.dropdown('get value');
				switch (images)
				{
					case 'left':
					case 'right':
					case 'aside':
					case 'none':
						renderingArg.imagePlace = images;
						break;
					default:
						renderingArg.imagePlace = null;
						break;
				}

				let indent = $indentDropdown.dropdown('get value');
				renderingArg.indentSize = Sandbox.IndentedText.getIndentSize(indent);

				this.benchUpdate();
			}

			let contentRenderer: TOC.HtmlRenderer;
			switch (sublevels)
			{
				case SublevelsMode.Html:
					contentRenderer = TOC.createHtmlRenderer(renderingArg, HTMLRendererDefaults);
					break;
				case SublevelsMode.Semantic:
					if (renderingArg.collapsable) {
						contentRenderer = new TOC.SemanticCollapsable(renderingArg);
					} else {
						contentRenderer = new TOC.SemanticRenderer(renderingArg);
					}
					break;
				case SublevelsMode.Shared:
					contentRenderer = null;
					break;
			}

			let renderer: TOC.HtmlRenderer;
			switch (semantic)
			{
				case SemanticMode.Default:
					renderer = new TOC.SemanticRenderer(renderingArg, contentRenderer);
					break;

				case SemanticMode.Collapsable:
					renderer = new TOC.SemanticCollapsable(renderingArg, contentRenderer);
					break;

				case SemanticMode.Accordion:
					renderer = new TOC.SemanticAccordion(renderingArg, contentRenderer);
					break;

				default:
					renderer = contentRenderer ? contentRenderer : TOC.createHtmlRenderer(renderingArg, HTMLRendererDefaults);
					break;
			}

			let html = this.tocObject.toHtml(renderer, true);
			return html;
		}


		private regenerateRequested: number = null;
		protected regenerateRequest()
		{
			if (this.regenerateRequested === null) {
				this.regenerateRequested = setTimeout(() => this.regenerate(), 1);
			}
		}

		protected regenerate()
		{
			this.regenerateRequested = null;
			//console.log("Regenerating HTML");

			if (this.tocObject) {
				this.tocHtml = this.renderHTML(true);
			} else {
				this.tocHtml = "";
			}
			this.injectHTML(false);
			this.applyStyles();
			if (this.showMode === 'HTML') {
				this.benchShow('HTML');
			}
			this.benchUpdate();

		}

		protected injectHTML(replaceOriginal: boolean)
		{
			if (previewMode) {
				this.openBench(previewMode);
				return;
			}

			//console.log("TestSamantic.injetHTML()", this.tocObject);
			if (this.tocObject) {
				$title.text(this.tocObject.title);
				$content.html(this.tocHtml);
				//this.tocObject.loadState("TOC_test");
			} else {
				$title.html(kDefaultTitle);
				$content.html(this.tocHtml);
			}

			($('.ui.accordion') as any).accordion();
			//($('.ui.dropdown') as any).dropdown();
		}

		protected applyStyles()
		{
			if (isChecked($uniformStyles)) {
				$('.toc-title').css(uniformCSS);
			}

			let aside_float = $asideDropdown.dropdown('get value');
			if (aside_float) {
				$('aside').css({ float: aside_float });
			}
		}

		protected restoreHTML()
		{
			if (typeof this.originalHtml === 'undefined')
				return;

			$content.html(this.originalHtml);
		}

		protected tryUseSource(source: string, sourceMode: SourceMode, showMode: BenchShowMode, inject: boolean): boolean
		{
			if (previewMode) {
				showMode = 'HTML';
			}
			return super.tryUseSource(source, sourceMode, showMode, inject);
		}
	};

	export function initSemantic(json: string, defaultToc?: TOC.Entry)
	{
		test = new TestSamantic(json, defaultToc);

		//let $aside = $('aside');
		//console.log('aside=', $aside, " css.float=", $aside.css('float'), "css.clear=", $aside.css('clear'));
	}
};

