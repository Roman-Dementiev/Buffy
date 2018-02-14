namespace TOC
{
	export const kHeaderClass = 'toc-header';
	export const kTitleClass = 'toc-title';
	export const kDescriptionClass = 'toc-description';
	export const kContentClass = 'toc-content';

	export const kListItem = 'li';
	export const kTableRow = 'tr';
	//export type Listed = null | TOC.kListItem | TOC.kTableRow;
	export type Listed = null | 'li' | 'tr';

	export type HtmlWriter = Sandbox.HtmlWriter;
	export type TagAttr = Sandbox.TagAttr;

	export type RendererArg = {
		//disableDetails?: boolean,
		collapsable?: boolean,
		headerClass?: string,
		//headerTag?: HeaderTag,
		contentClass?: string,
		indentSize?: Sandbox.IndentType,
		divider?: boolean | string;
		dividerAtStart?: boolean | string;
		dividerAtEnd?: boolean | string;
		imagePlace?: ImagePlacement;
		stateStore?: TStore,
		defaultType?: string,
		types?: any
	};

	export interface Param
	{
		gid: string;
		shared: object;
		topLevelGlobal: boolean;
		topLevelOnThis: boolean;
	};

	export interface ContentParam extends Param
	{
		class: string;
		content: Normalized[];
		listMode: ListMode;
		divider ?: string;
		starter ?: string;
		finisher ?: string;
	};

	export interface EntryParam extends Param
	{
		entry: Normalized;
		typeSpec?: TypeSpec;
		isListed?: Listed;
		collapsable?: boolean;
		attr?: object;
	};

	export class HtmlRenderer
	{
		//protected headerTag: HeaderTag;
		protected headerClass: string;
		protected contentClass: string;
		protected indentSize: Sandbox.IndentType;
		protected stateStore: StateStore;
		protected defaultType: string;
		protected divider: string|boolean;
		protected starter: string|boolean;
		protected finisher: string|boolean;
		protected imagePlace: ImagePlacement;
		protected types: any;
		protected defaults: object;

		static readonly Defaults = {
			defaultDivider: null,
			defaultListMode: 'ul'
		};

		constructor(arg?: RendererArg, defaults?: object)
		{
			//console.log("HtmlRenderer.constructor() arg=", arg, "defaults=", defaults);
			if (!arg) arg = {};

			if (defaults) {
				this.defaults = Sandbox.mergeDefaults(defaults, HtmlRenderer.Defaults);
			} else {
				this.defaults = HtmlRenderer.Defaults;
			}

			//this.headerTag = arg.headerTag ? arg.headerTag : 'div';
			this.headerClass = Sandbox.getDefaulted(arg.headerClass, kHeaderClass);
			this.contentClass = Sandbox.getDefaulted(arg.contentClass, kContentClass);
			this.indentSize = Sandbox.getDefaulted(arg.indentSize, Sandbox.IndentedText.indentDefault);
			this.stateStore = arg.stateStore ? CToc.getStateStore(arg.stateStore) : null;
			this.divider = arg.divider;
			this.starter = arg.dividerAtStart;
			this.finisher = arg.dividerAtEnd;
			this.imagePlace = arg.imagePlace;
			this.defaultType = arg.defaultType;
			this.types = arg.types;

			//console.log("HtmlRenderer.constructor() this=", this)
		}

		public get defaultDivider(): string {
			return this.defaults['defaultDivider'];
		}
		public get defaultListMode(): ListMode {
			return this.defaults['defaultListMode'];
		}

		protected getDivider(divider: string | boolean): string
		{
			if (typeof divider === 'string') {
				return divider;
			}
			if (divider) {
				return (typeof this.divider == 'string') ? this.divider : this.defaultDivider;
			} else {
				return null;
			}
		}

		protected getListMode(entry: Normalized, typeSpec: TypeSpec): ListMode
		{
			let listMode: ListMode;
			if (typeof entry.listTag !== 'undefined') {
				listMode = entry.listTag;
			} else if (typeSpec && typeof typeSpec.listTag !== 'undefined') {
				listMode = typeSpec.listTag;
			} else {
				listMode = this.defaultListMode;
			}

			//console.log("getListMode() entry=", entry, "typeSpec=", typeSpec, "listMode=", listMode);
			return listMode;
		}

		protected getImagePlace(entry: Entry, type: TypeSpec, defaultPlace: ImagePlacement): ImagePlacement
		{
			let imagePlace: ImagePlacement = null;
			if (type && type.imagePlace) {
				imagePlace = type.imagePlace;
			} else if (this.imagePlace) {
				imagePlace = this.imagePlace;
			} else {
				imagePlace = defaultPlace ? defaultPlace : null;
			}

			//console.log("getImagePlace() imagePlace=", imagePlace, "type=", type);
			return imagePlace;
		}

		public tocHtml(toc: Normalized, contentOnly = false, initialIndent?: number): string
		{
			let indentSize = Sandbox.IndentedText.getIndentSize(this.indentSize);
			let html = new Sandbox.HtmlWriter(indentSize, initialIndent);
			html.start();

			if (toc.title && !contentOnly) {
				this.writeTocHeader(html, toc.title);
			}

			let rootType = toc.type ? toc.type : 'root';
			let rootSpec = this.getTypeSpec(rootType);

			if (toc.content) {
				this.writeTocContent(html, {
					gid: '@',
					shared: {},
					class: this.contentClass,
					content: toc.content,
					topLevelGlobal: true,
					topLevelOnThis: true,
					listMode: this.getListMode(toc, rootSpec),
					divider: this.getDivider(this.divider),
					starter: this.getDivider(this.starter),
					finisher: this.getDivider(this.finisher)
				});
			}

			return html.close();
		}

		public headerHtml(title: string, initialIndent?: number): string
		{
			let indentSize = Sandbox.IndentedText.getIndentSize(this.indentSize);
			let html = new Sandbox.HtmlWriter(indentSize, initialIndent);
			html.start();
			this.writeTocHeader(html, title);
			return html.close();
		}

		protected writeTocHeader(html: HtmlWriter, title: string): void
		{
			html.div({ class: this.headerClass });
			html.put(title);
			html.enddiv();
		}

		public writeTocContent(html: HtmlWriter, param: ContentParam): void
		{
			this.writeContent(html, param);
		}

		protected startContent(html: HtmlWriter, param: ContentParam): Listed
		{
			if (param.starter) {
				html.put(param.starter);
			}

			let arg = { 'class': param.class };
			let listed: Listed = null;
			if (param.listMode) {
				html.tag(param.listMode, arg);
				listed = (param.listMode === kTable) ? kTableRow : kListItem;
			} else {
				html.div(arg);
			}
			return listed;
		}

		protected closeContent(html: HtmlWriter, param: ContentParam)
		{
			if (param.listMode) {
				html.endtag(param.listMode);
			} else {
				html.enddiv();
			}
			if (param.finisher) {
				html.put(param.finisher);
			}
		}

		public writeContent(html: HtmlWriter, param: ContentParam): void
		{
			let content = param.content;
			if (!content) return;

			let isListed = this.startContent(html, param);

			for (let i = 0; i < content.length; i++) {
				if (i > 0 && param.divider) {
					html.put(param.divider);
				}

				this.writeEntry(html, {
					gid: content[i].gid,
					shared: param.shared,
					entry: content[i],
					//types: param.types,
					topLevelGlobal: param.topLevelGlobal,
					topLevelOnThis: param.topLevelOnThis,
					isListed: isListed
				});
			}

			this.closeContent(html, param);
		}

		public writeEntry(html: HtmlWriter, param: EntryParam): void
		{
			let entry = param.entry;
			//let types = param.types;
			let type = entry.type ? entry.type : (this.defaultType ? this.defaultType : null);
			if (typeof param.typeSpec === 'undefined') {
				param.typeSpec = this.getTypeSpec(type);
			}

			let hasChildren = entry.content && entry.content.length > 0;;
			let collapsable = param.typeSpec.collapsable;
			if (typeof collapsable === 'undefined') {
				param.collapsable = collapsable = hasChildren;
			}

			if (!param.attr) {
				param.attr = {};
			}
			if (entry.gid) {
				param.attr['id'] = entry.gid;
			}
			if (type) {
				param.attr['class'] = type;
			}

			this.startEntry(html, param);

			if (entry.content && entry.content.length > 0) {
				this.entryContent(html, param);
			}

			this.closeEntry(html, param);
		}

		protected startEntry(html: HtmlWriter, param: EntryParam): void
		{
			if (param.isListed) {
				html.tag(param.isListed);
			}
			this.imageAtStart(html, param);

			html.div(param.attr);
			this.entryTitle(html, param);
		}

		protected closeEntry(html: HtmlWriter, param: EntryParam)
		{
			html.endtag();
			this.imageAtClose(html, param);

			if (param.isListed) {
				html.endtag(param.isListed);
			}
		}

		protected titleClass(type: TypeSpec): string
		{
			if (type.titleClass) {
				return type.titleClass;
			} else if (typeof type.titleClass === 'undefined') {
				return kTitleClass;
			} else {
				return null;
			}
		}

		protected descriptionClass(type: TypeSpec): string
		{
			if (type.descriptionClass) {
				return type.descriptionClass;
			} else if (typeof type.descriptionClass === 'undefined') {
				return kDescriptionClass;
			} else {
				return null;
			}
		}

		protected entryTitle(html: HtmlWriter, param: EntryParam)
		{
			let type = param.typeSpec;
			let entry = param.entry;
			let title = entry.title;
			if (entry.linkUri) {
				title = `<a href="${entry.linkUri}">${title}</a>`;
			}
			html.span(title, { class: this.titleClass(type) });

			if (entry.description) {
				let _break = type.descriptionBreak ? '<br/>' : '&nbsp;';
				html.put(_break);
				html.span(entry.description, { class: this.descriptionClass(type) });
			}
		}

		protected entryContent(html: HtmlWriter, param: EntryParam)
		{
			let contentParam: ContentParam = {
				gid: '@' + param.gid,
				shared: param.shared,
				class: Sandbox.getDefaulted(param.typeSpec.contentClass, kContentClass),
				content: param.entry.content,
				topLevelGlobal: false,
				topLevelOnThis: false,
				listMode: this.getListMode(param.entry, param.typeSpec)
			};

			this.writeContent(html, contentParam);
		}

		protected imageAtStart(html: HtmlWriter, param: EntryParam)
		{
			let entry = param.entry;
			if (entry.imageUri) {
				let imagePlace: ImagePlacement;
				if (param.isListed === kTableRow) {
					imagePlace = this.getImagePlace(entry, param.typeSpec, kImageLeft);
				} else {
					imagePlace = this.getImagePlace(entry, param.typeSpec, kImageAside);
					if (imagePlace && imagePlace !== kImageNone) {
						imagePlace = kImageAside;
					}
				}

				switch (imagePlace)
				{
					case kImageLeft:
						html.tag('td')
						html.img(entry.imageUri);
						html.endtag('td')
						html.tag('td')
						break;

					case kImageRight:
						html.tag('td')
						break;

					case kImageAside:
						html.tag('aside');
						html.img(entry.imageUri);
						html.endtag('aside');
						break;
				}
			}
		}

		protected imageAtClose(html: HtmlWriter, param: EntryParam)
		{
			let entry = param.entry;
			if (entry.imageUri && param.isListed == kTableRow) {
				let imagePlace = this.getImagePlace(entry, param.typeSpec, kImageLeft);
				switch (imagePlace) {
					case kImageLeft:
						html.endtag('td')
						break;

					case kImageRight:
						html.endtag('td')
						html.tag('td')
						html.img(entry.imageUri);
						html.endtag('td')
						break;
				}
			}
		}

		protected getTypeSpec(type: string): TypeSpec
		{
			let types = this.types;
			if (types) {
				if (type && types[type]) {
					return types[type];
				}
				if (types["default"]) {
					return types["default"];
				}
			}
			return {};
		}
	};


	export class DetailsHtmlRenderer extends HtmlRenderer
	{
		constructor(arg?: RendererArg, defaults?: object)
		{
			super(arg, defaults);
		}

		protected startEntry(html: HtmlWriter, param: EntryParam): void
		{
			if (param.isListed) {
				html.tag(param.isListed);
			}
			this.imageAtStart(html, param);

			let entry = param.entry;
			//let title = this.entryTitle(entry, param.typeSpec);
			let attr = param.attr;
			if (param.collapsable) {
				let open = param.typeSpec && param.typeSpec.startOpen;
				if (this.stateStore) {
					let key = this.stateStore.prefix + entry.gid + '.isOpen';
					let isOpen = this.stateStore.storage.getItem(key);
					if (typeof isOpen === 'string') {
						open = (isOpen === 'true');
					}
					//console.log(key, '=', isOpen, "; open=", open);
				}
				if (open) {
					attr['open'] = null;
				}
				html.tag('details', { attr: attr });
				html.tag('summary');
				this.entryTitle(html, param);
				html.endtag('summary');
			} else {
				html.div({ attr: attr });
				this.entryTitle(html, param);
			}
		}
	};


	var detailsSupported: boolean;

	export function createHtmlRenderer(arg?: RendererArg, defaults?: object): HtmlRenderer
	{
		let useDetails = !arg || arg.collapsable || typeof arg.collapsable === 'undefined';
		if (useDetails) {
			if (typeof detailsSupported === 'undefined') {
				let test = document.createElement('details');
				if (test) {
					test.remove();
					detailsSupported = true;
				} else {
					detailsSupported = false;
				}
				//console.log("detailsSupported=", detailsSupported);
			}
			useDetails = detailsSupported;
		}
		//console.log("useDetails=", useDetails, "arg=", arg);

		if (useDetails) {
			return new DetailsHtmlRenderer(arg, defaults);
		} else {
			return new HtmlRenderer(arg, defaults);
		}
	}
}
