namespace TOC
{
	const kNoTitle = '---';
	const kNoIcon = null; //'mini icon';
	const kDefaultDivider = '<div class="ui divider"></div>\n';

	export interface SemanticTypeSpec extends TypeSpec
	{
		icon?: string;
	};

	/*
	export enum SemanticRenderingMode
	{
		Disabled,
		Default,
		Collapsable,
		Accordion
	};
	*/

	export interface SemanticRendererArg extends RendererArg
	{
		//mode?: SemanticRenderingMode,
		ignoreIcons?: boolean;
	};

	export class SemanticRenderer extends HtmlRenderer
	{
		protected contentRenderer: HtmlRenderer;
		protected ignoreIcons: boolean;

		constructor(arg?: SemanticRendererArg, contentRenderer?: HtmlRenderer)
		{
			//console.log("SemanticRenderer.constructor() arg=", arg);
			super(arg, {
				'defaultDivider': kDefaultDivider,
				'defaultListMode': null
			});

			if (!arg) arg = {};

			if (contentRenderer) {
				this.contentRenderer = contentRenderer;
			} else {
				this.contentRenderer = this;
			}

			this.ignoreIcons = !!arg.ignoreIcons;
		}

		public icon(html: HtmlWriter, icon: string): void
		public icon(html: HtmlWriter, attr?: TagAttr): void
		public icon(html: HtmlWriter, arg?: any): void
		{
			//console.log('SemanticRenderer.icon() arg=', arg);
			let param: Sandbox.TagArg = { close: true };
			if (typeof arg === 'string') {
				param.class = arg ? arg : 'icon';
			} else {
				param.attr = arg ? arg : {};
				param.class = 'icon'
			}
			html.tag('i', param);
		}

		protected startList(html: HtmlWriter, mode: ListMode, ui = true)
		{
			let _ui = ui ? 'ui ' : '';
			let type = mode == kOrderedList ? 'ordered ' : mode == kUnorderedList ? ' bulleted ' : '';

			html.div({'class': `${_ui}${type}list`});
		}

		protected startContent(html: HtmlWriter, param: ContentParam): Listed
		{
			if (param.starter) {
				html.put(param.starter);
			}
			this.startList(html, param.listMode);
			return null;
		}

		protected closeContent(html: HtmlWriter, param: ContentParam)
		{
			html.enddiv();

			if (param.finisher) {
				html.put(param.finisher);
			}
		}

		protected entryImage(html: HtmlWriter, param: EntryParam)
		{
			let entry = param.entry;
			let type = param.typeSpec;
			if (entry.imageUri) {
				let imagePlace = this.getImagePlace(entry, type, kImageLeft);
				//console.log("imagePlace=", imagePlace, "typeSpec=", typeSpec, " isListed=", isListed);
				switch (imagePlace) {
					case kImageNone:
						break;
					case kImageAside:
						html.tag('aside');
						html.img(entry.imageUri);
						html.endtag('aside');
						break;
					case kImageRight:
						html.img(entry.imageUri, { class: 'ui right floated image' });
						break;
					default:
						html.img(entry.imageUri, { class: 'ui image' });
						break;
				}
			}
		}

		protected startEntry(html: HtmlWriter, param: EntryParam): void
		{
			let entry = param.entry;
			let type = param.typeSpec as SemanticTypeSpec;
			let attr = param.attr;

			//console.log("indentedEntry(): attr=", attr);
			html.div({ attr: attr, class: 'item' });
			this.entryImage(html, param);

			html.div({ class: 'content' });
			if (entry.title) {
				let _class = Sandbox.HtmlWriter.mergeClasses('header', this.titleClass(type));
				html.div({ 'class': _class });
				this.entryTitle(html, param);
				html.enddiv();
			} else {
				html.div({ 'class': 'header' });
				html.put(kNoTitle);
				html.enddiv();
			}

			if (entry.description) {
				let _class = Sandbox.HtmlWriter.mergeClasses('description', this.descriptionClass(type));
				html.div({ 'class': _class });
				html.put(entry.description);
				html.enddiv();
			}
		}

		protected closeEntry(html: HtmlWriter, param: EntryParam)
		{
			html.enddiv(); // for content
			html.enddiv(); // for item
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

			if (this.contentRenderer === this) {
				this.writeContent(html, contentParam);
			} else {
				contentParam.topLevelOnThis = true;
				this.contentRenderer.writeContent(html, contentParam);
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
		}

		protected startAccordionClass(param: Param): string
		{
			if (param.shared['ui accordion']) {
				return 'accordion';
			} else {
				param.shared['ui accordion'] = param.gid;
				return 'ui accordion';
			}
		}

		protected closeAccordionClass(param: Param)
		{
			if (param.shared['ui accordion'] === param.gid) {
				param.shared['ui accordion'] = null;
			}
		}
	};

	export class SemanticCollapsable extends SemanticRenderer
	{
		constructor(arg?: SemanticRendererArg, contentRenderer?: HtmlRenderer)
		{
			super(arg, contentRenderer);
		}

		protected startEntry(html: HtmlWriter, param: EntryParam): void
		{
			let entry = param.entry;
			let type = param.typeSpec as SemanticTypeSpec;
			let attr = param.attr;

			//console.log("indentedEntry(): attr=", attr);
			html.div({ attr: attr, class: 'item' });
			this.entryImage(html, param);

			html.div({ class: 'content' }); // item content

			let _class = this.startAccordionClass(param);
			html.div({ 'class': _class });
			html.div({ attr: attr, class: 'title'});
			this.icon(html, 'dropdown icon');
			let icon = (type.icon && !this.ignoreIcons) ? type.icon : kNoIcon;
			if (icon && !this.ignoreIcons) {
				this.icon(html, icon);
			}
			this.entryTitle(html, param);
			html.enddiv();

			let contentClass = Sandbox.getDefaulted(param.typeSpec.contentClass, kContentClass);
			html.div({ 'class': 'content ' + contentClass }); // accordion content
		}

		protected closeEntry(html: HtmlWriter, param: EntryParam)
		{
			html.enddiv(); // for accordion content
			html.enddiv(); // for accordion
			html.enddiv(); // for item content
			html.enddiv(); // for item

			this.closeAccordionClass(param);
		}

		protected startContent(html: HtmlWriter, param: ContentParam): Listed
		{
			if (param.starter) {
				html.put(param.starter);
			}
			if (param.topLevelGlobal) {
				this.startList(html, param.listMode);
			}

			return null;
		}

		protected closeContent(html: HtmlWriter, param: ContentParam)
		{
			if (param.topLevelGlobal) {
				html.enddiv();
			}
			if (param.finisher) {
				html.put(param.finisher);
			}
		}
	};

	export class SemanticAccordion extends SemanticRenderer
	{
		constructor(arg?: SemanticRendererArg, contentRenderer?: HtmlRenderer)
		{
			super(arg, contentRenderer);
		}

		protected startContent(html: HtmlWriter, param: ContentParam): Listed
		{
			if (param.starter) {
				html.put(param.starter);
			}

			let _class = this.startAccordionClass(param);
			html.div({ 'class': _class });
			return null;
		}

		protected closeContent(html: HtmlWriter, param: ContentParam)
		{
			this.closeAccordionClass(param);
		}

		protected startEntry(html: HtmlWriter, param: EntryParam): void
		{
			let entry = param.entry;
			let type = param.typeSpec as SemanticTypeSpec;
			let attr = param.attr;
			let icon = (type.icon && !this.ignoreIcons) ? type.icon : kNoIcon;
			html.div({ attr: attr, class: 'title' });
			this.icon(html, 'dropdown icon');
			if (icon && !this.ignoreIcons) {
				this.icon(html, icon);
			}
			//html.put(title);
			this.entryTitle(html, param);
			html.enddiv();

			html.div({ class: 'content' });
			html.div({ class: 'ui list' });
			html.div({ class: 'item' });
			this.entryImage(html, param);

			html.div({ class: 'content' });
		}

		protected closeEntry(html: HtmlWriter, param: EntryParam)
		{
			html.enddiv(); // item content
			html.enddiv(); // item
			html.enddiv(); // list
			html.enddiv(); // content
		}
	};

	/*
	export function createSemanticRenderer(arg: SemanticRendererArg, contentRenderer?: HtmlRenderer): HtmlRenderer
	{
		if (!arg) arg = {};
		let mode = (typeof arg.mode !== 'undefined') ? arg.mode : SemanticRenderingMode.Default;

		switch (mode)
		{
			case SemanticRenderingMode.Default:
				return new  SemanticRenderer(arg, contentRenderer);

			case SemanticRenderingMode.Collapsable:
				return new SemanticCollapsable(arg, contentRenderer);

			case SemanticRenderingMode.Accordion:
				return new SemanticAccordion(arg, contentRenderer);

			default:
				return contentRenderer ? contentRenderer : createHtmlRenderer(arg);
		}
	}
	*/
}
