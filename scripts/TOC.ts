namespace TOC
{
	//export type HeaderTag = 'div' | 'header';
	export const kOrderedList = 'ol';
	export const kUnorderedList = 'ul';
	export const kTable = 'table';
	//export type ListMode = null | TOC.kUnorderedList | TOC.kOrderedList | TOC.kTable;
	export type ListMode = null | 'ul' | 'ol' | 'table'

	export const kImageNone = 'none';
	export const kImageLeft = 'left';
	export const kImageRight = 'right';
	export const kImageAside = 'aside';
	export type ImagePlacement = 'none' | 'left' | 'right' | 'aside';

	export type Entry = {
		id?: string,
		title?: string,
		image?: string,
		description?: string,
		json?: string,
		type?: string,
		home?: string,
		link?: string,
		listTag?: ListMode,
		content?: Entry[]
	};

	export interface Normalized
	{
		id: string,
		gid: string,
		title: string,
		image: string,
		description?: string,
		json?: string,
		type: string,
		home: string,
		link: string,
		homeUri: string,
		linkUri: string,
		imageUri: string,
		listTag?: ListMode,
		content: Normalized[]
	};

	export enum Scope {
		Local,
		Global,
		TOC
	}

	export type InitHook = (ctoc: CToc) => void;

	export type Arg = {
		toc: string|Entry,
		idScope?: Scope,
		rootUri?: string,
		rootId?: string,
		initHook?: InitHook,
	};

	export interface ToJsonArg extends Arg {
		indent?: number
	};

	export interface ToHtmlArg extends Arg {
		renderer?: HtmlRenderer,
		types?: object,
		contentOnly?: boolean
	};

	function isArg(arg: string|Entry|ToHtmlArg|ToJsonArg): arg is Arg { return typeof (arg as any).toc !== 'undefined'; }

	type Normalization = {
		parent: Normalized,
		rootId: string,
		rootUri: string,
		homeUri: string,
		scope: Scope,
	};

	export type TypeSpec = {
		collapsable?: boolean,
		titleClass?: string,
		contentClass?: string,
		descriptionClass?: string,
		descriptionBreak?: boolean,
		startOpen?: boolean,
		listTag?: ListMode,
		imagePlace?: ImagePlacement
	};

	var defaultEntryType = null;//'toc_entry';

	type EventHandler = (event: Event, element: HTMLElement, entry: Entry) => void;

	export type StateStore = {
		autoSave: boolean,
		storage?: Storage,
		prefix?: string,
	};
	export type TStore = string | Storage | StateStore;

	export class CToc
	{
		private _root: Normalized;
		private _err: any;

		public get inited(): boolean { return typeof this._root !== 'undefined'; }
		public get valid(): boolean { return !!this._root; }
		public get error(): any { return this._err; }

		public get root(): Entry { return this._root; }
		public get title(): string { return this._root ? this._root.title : null; }
		public get content(): Entry[] { return this._root ? this._root.content : null; }

		public init(arg: string|Entry|Arg, onInited: (ctoc: CToc, err?: any) => void)
		{
			if (!onInited) onInited = (ctoc, err) => { };
			if (!arg) {
				onInited(null, null);
				return;
			}

			let toc: Entry;
			let rootId: string;
			let rootUri: string;
			let scope: Scope;
			let initHook: InitHook;

			if (typeof arg === 'string') {
				toc = { json: arg };
			}
			else if (isArg(arg)) {
				if (typeof arg.toc === 'string') {
					toc = { json: arg.toc };
				} else {
					toc = arg.toc;
				}
				rootId = arg.rootId;
				rootUri = arg.rootUri;
				scope = arg.idScope;
				initHook = arg.initHook;
			} else {
				toc = arg;
			}

			if (!rootId) {
				rootId = toc.id ? toc.id : "TOC";
			}
			if (!rootUri) {
				if (toc.link) {
					rootUri = makeHomeUri(null, toc.link, null);
				} else {
					rootUri = "";
				}
			}
			if (typeof scope === 'undefined') {
				scope = Scope.Local;
			}

			let normalizeArg: Normalization = {
				parent: null,
				rootId: rootId,
				rootUri: rootUri,
				homeUri: rootUri,
				scope: scope
			};

			CToc.normalizeEntry(toc, normalizeArg,
				(root: Normalized, err?: any) =>
				{
					if (err) {
						this._err = err;
						this._root = null;
					} else {
						this._root = root;

						if (initHook) {
							initHook(this);
						}
					}
					onInited(this, err);
				});
		}

		public static isValidId(id: string): boolean
		{
			if (id) {
				let code = id.charCodeAt(0);
				return !(code > 47 && code < 58); // not '0'...'9'
			} else {
				return false;
			}
		}
		public static isValidMetaKey(key: string): boolean
		{
			return key && key !== 'id' && key !== 'type' && key !== 'link' && key !== 'content';
		}
		public getMeta(key: string): any
		{
			return CToc.isValidMetaKey(key) ? this.root[key] : null;
		}
		public addMeta(key: string, meta: any): void
		{
			if (CToc.isValidMetaKey(key)) {
				this.root[key] = meta;
			}
		}

		public getEntry(gid: string): Entry
		{
			return CToc.findEntry(this._root, gid);
		}

		private static findEntry(parent: Normalized, gid: string): Normalized
		{
			let entry: Normalized = null;
			if (parent && parent.content) {
				for (let i = 0, count = parent.content.length; i < count; i++) {
					let entry = parent.content[i] as Normalized;
					if (entry.gid === gid)
						break;

					entry = CToc.findEntry(entry, gid);
					if (entry !== null)
						break;
				}
			}
			return entry;
		}

		private static normalizeEntry(entry: Entry, arg: Normalization, callback: (norm: Normalized, err?: any)=>void, index?: number)
		{
			let error = null;
			let needLoad = false;
			let waitChildren = 0;
			let homeUri: string,
				jsonUri: string;

			if (!index) index = 0;

			if (entry.json) {
				needLoad = true;
				homeUri = makeHomeUri(entry.home, arg.rootUri, arg.homeUri);
				jsonUri = makeLinkUri(entry.json, arg.rootUri, homeUri);

				//if (arg.loadHook) {
				//	// ??? TODO
				//}
			}

			if (needLoad) {
				loadJson(jsonUri, onLoaded);
			} else {
				onLoaded(entry, null);
			}

			function onLoaded(json: any, err: any)
			{
				if (err) {
					callback(null, err);
					return;
				}

				mergeJson(entry, json);

				let normalized: Normalized = {
					id: entry.id,
					gid: null,
					title: entry.title ? entry.title : "",
					image: entry.image ? entry.image : null,
					type: entry.type ? entry.type : null,
					home: entry.home ? entry.home : null,
					link: entry.link ? entry.link : null,
					json: entry.json,
					homeUri: null,
					linkUri: null,
					imageUri: null,
					content: null
				};
				Sandbox.mergeIn(normalized, entry);

				if (normalized.id && !CToc.isValidId(normalized.id)) {
					console.error("Invalid TOC Entry id: ", entry.id);
					normalized.id = null;
				}

				let entryId = entry.id;
				let entryScope = arg.scope;
				if (!parent) {
					entryScope = Scope.Global;
				} else if (!normalized.id) {
					entryId = index.toString();
					entryScope = Scope.Local;
				} else if (normalized.id.charAt(0) === '#') {
					entryId = normalized.id.substr(1);
					entryScope = Scope.Global;
				}

				if (entryScope === Scope.TOC && !arg.rootId) {
					entryScope = Scope.Global;
				}
				if (entryScope === Scope.TOC) {
					normalized.gid = arg.rootId + '.' + entryId;
				} else if (entryScope === Scope.Local && arg.parent && arg.parent.gid) {
					normalized.gid = arg.parent.gid + '.' + entryId;
				} else {
					normalized.gid = entryId;
				}

				// TODO
				if (entry.home) {
					normalized.homeUri = makeHomeUri(entry.home, arg.rootUri, arg.homeUri);
					normalized.linkUri = makeLinkUri(entry.link, arg.rootUri, normalized.homeUri);
					normalized.imageUri = makeLinkUri(entry.image, arg.rootUri, normalized.homeUri);
				} else {
					normalized.homeUri = arg.homeUri;
					normalized.linkUri = makeLinkUri(entry.link, arg.rootUri, arg.homeUri);
					normalized.imageUri = makeLinkUri(entry.image, arg.rootUri, arg.homeUri);
				}

				if (entry.listTag) {
					normalized.listTag = entry.listTag;
				}

				if (entry.content) {
					let contentArg: Normalization = {
						parent: normalized,
						rootId: arg.rootId,
						rootUri: arg.rootUri,
						homeUri: normalized.homeUri,
						scope: arg.scope,
						//loadHook: arg.loadHook
					};
					CToc.normalizeContent(normalized, entry.content, contentArg, callback);
				}
				else {
					callback(normalized);
				}
			}
			
		}

		private static normalizeContent(normalized: Normalized, content: Entry[], arg: Normalization, callback: (norm: Normalized, err?: any) => void)
		{
			let error = null;
			let waitChildren = 1;

			normalized.content = [];

			for (let i = 0, count = content.length; i < count; i++) {
				waitChildren++;
				normalized.content.push(null);
				CToc.normalizeEntry(content[i], arg, (entry, err) => onChildLoaded(entry, i, err), i+1);
			}
			onChildLoaded(null, -1);

			function onChildLoaded(child: Normalized, index: number, err?: any)
			{
				if (error) return;

				if (err) {
					error = err;
					callback(null, err);
					return;
				}

				if (child) {
					normalized.content[index] = child;
				}

				waitChildren--;
				if (waitChildren == 0) {
					callback(normalized);
				}
			}
		}

		private static denormalize(normalized: Normalized): Entry
		{
			let entry: Entry = {
				title: normalized.title
			};

			if (!parseInt(normalized.id)) {
				entry.id = normalized.id;
			}
			if (normalized.type) {
				entry.type = normalized.type;
			}
			if (normalized.home) {
				entry.link = normalized.home;
			}
			if (normalized.link) {
				entry.link = normalized.link;
			}
			if (normalized.image) {
				entry.image = normalized.image;
			}
			if (normalized.json) {
				entry.json = normalized.json;
			}
			if (normalized.listTag) {
				entry.listTag = normalized.listTag;
			}

			if (normalized.content) {
				entry.content = [];
				for (let n of normalized.content) {
					entry.content.push(CToc.denormalize(n));
				}
			}
			return entry;
		}

		public simplify(): Entry
		{
			return CToc.denormalize(this._root);
		}

		public toHtml(renderer?: HtmlRenderer, contentOnly = false): string
		{
			if (!renderer) {
				renderer = createHtmlRenderer();
			}

			return renderer.tocHtml(this._root, contentOnly);
		}

		public toJson(indentSize?: number): string
		{
			let json = JSON.stringify(this.root, null, indentSize);
			return json;
		}

		public renameEntry(gid: string, title: string)
		{
			TOC.forEachEntry(
				this.root,
				(entry: Entry) => { entry.title = title; },
				(entry: Entry) => ((entry as any).gid === gid),
			)
		}

		public removeTypes(...types: string[])
		{
			if (!this.root)
				return;

			for (let type of types) {
				removeChildren(this.root, (entry: Entry) => (entry.type === type));
			}
		}

		public removeClasses(...classes: string[])
		{
			if (!this.root)
				return;

			for (let cls of classes) {
				removeChildren(this.root, (entry: Entry) => hasClass(entry, cls));
			}
		}

		private static forEachElement(entry: Normalized, callback: (el: HTMLElement, en: Normalized) => void, )
		{
			if (entry.gid) {
				let element = document.getElementById(entry.gid);
				if (element) {
					callback(element, entry);
				}
			}
			if (entry.content) {
				for (let child of entry.content) {
					CToc.forEachElement(child, callback);
				}
			}
		}

		public static getStateStore(store: TStore): StateStore
		{
			if (!store) {
				return {
					autoSave: true,
					storage: sessionStorage,
					prefix: ""
				}
			}
			if (typeof store === 'string') {
				return {
					autoSave: true,
					storage: sessionStorage,
					prefix: store
				}
			}
			if (typeof (store as any).length !== 'undefined') {
				return {
					autoSave: true,
					storage: store as Storage,
					prefix: ""
				}
			}

			let ss = store as StateStore;
			return {
				autoSave: ss.autoSave,
				storage: ss.storage ? ss.storage : sessionStorage,
				prefix: ss.prefix ? ss.prefix : ""
			}
		}

		public saveState(arg?: TStore)
		{
			//console.log("CToc.saveState");
			let ss = (typeof arg !== 'undefined') ? CToc.getStateStore(arg) : this.stateStorage;
			if (!ss) return;

			CToc.forEachElement(this._root, (el: HTMLElement, entry: Normalized) =>
			{
				if (el.tagName.toLowerCase() === 'details') {
					let open = el.getAttribute('open');
					let isOpen: boolean = typeof el.getAttribute('open') === 'string';
					let key = ss.prefix + entry.gid + '.isOpen';
					ss.storage.setItem(key, isOpen.toString());
					//console.log(key, '<-', isOpen);
				}
			});
		}

		public loadState(arg?: TStore)
		{
			//console.log("CToc.loadState");
			let isListening = !!this.autoSaveListener;

			let ss = (typeof arg !== 'undefined') ? CToc.getStateStore(arg) : this.stateStorage;
			if (arg) {
				ss = CToc.getStateStore(arg);
				this.stateStorage = ss;
			} else if (typeof arg === 'undefined') {
				ss = this.stateStorage;
			} else { // null
				ss = this.stateStorage;
				this.stateStorage = null;
			}
			if (!ss) return;

			let startListening = !isListening && ss.autoSave;
			let stopListening = isListening && (!this.stateStorage || !!this.stateStorage.autoSave);

			if (startListening) {
				this.autoSaveListener = (ev) => {
					this.scheduleAutoSave();
				}
			}

			CToc.forEachElement(this._root, (el: HTMLElement, entry: Normalized) =>
			{
				if (el.tagName.toLowerCase() === 'details') {
					let key = ss.prefix + entry.gid + '.isOpen';
					let isOpen = ss.storage.getItem(key);
					//console.log(key, '->', isOpen);
					if (typeof isOpen == 'string') {
						if (isOpen == 'true') {
							el.setAttribute("open", "");
						} else {
							el.removeAttribute("open");
						}
					}

					if (startListening) {
						//console.log("addEventListener on 'click' for ", entry.gid);
						el.addEventListener('click', this.autoSaveListener);
					} else if (stopListening) {
						//console.log("removeEventListener on 'click' for ", entry.gid);
						el.removeEventListener('click', this.autoSaveListener);
					}
				}
			});

			if (stopListening) {
				this.autoSaveListener = null;
			}
		}

		private stateStorage: StateStore = null;
		private autSaveTimeoutId: number = null;
		private autoSaveListener: (ev) => void;

		private scheduleAutoSave()
		{
			//console.log("scheduleAutoSave");
			if (this.stateStorage && !this.autSaveTimeoutId) {
				this.autSaveTimeoutId = setTimeout(() => this.doAutoSave(), 1000);
			}
		}

		private doAutoSave()
		{
			//console.log("doAutoSave");
			this.autSaveTimeoutId = null;
			if (this.stateStorage) {
				this.saveState();
			}
		}
	};

	function doForEachEntry(entry: Entry, fn: (entry: Entry) => void, condition: (entry: Entry) => boolean)
	{
		if (condition(entry)) {
			fn(entry);
		}

		if (entry.content) {
			for (let child of entry.content) {
				doForEachEntry(child, fn, condition);
			}
		}
	}

	export function forEachEntry(entry: Entry, fn: (entry: Entry) => void, condition?: (entry: Entry) => boolean)
	{
		if (!entry || !fn)
			return;

		if (!condition)
			condition = (e) => true;

		doForEachEntry(entry, fn, condition);
	}

	export function forTypes(entry: Entry, type: string, fn: (entry: Entry) => void, condition?: (entry: Entry) => boolean)
	{
		forEachEntry(entry, fn, typeCondition);

		function typeCondition(entry: Entry): boolean
		{
			if (entry.type !== type) {
				return false;
			}
			if (condition) {
				return condition(entry);
			} else {
				return true
			}
		} 
	}

	export function forClass(entry: Entry, _class: string, fn: (entry: Entry) => void, condition?: (entry: Entry) => boolean)
	{
		forEachEntry(entry, fn, classCondition);

		function classCondition(entry: Entry): boolean
		{
			if (!hasClass(entry, _class)) {
				return false;
			}
			if (condition) {
				return condition(entry);
			} else {
				return true
			}
		} 
	}

	function removeChildren(entry: Entry, condition: (entry: Entry) => boolean)
	{
		if (!entry || !entry.content || !condition)
			return;

		let newContent = [];
		for (let i = 0, count = entry.content.length; i < count; i++) {
			let child = entry.content[i];
			if (condition(child)) {
				delete entry.content[i];
			} else {
				newContent.push(child);
				removeChildren(child, condition);
			}
		}

		delete entry.content;
		entry.content = newContent;
	}


	//function indentString(indentStr: string, indentSize: number): string
	//{
	//	let str = indentStr;
	//	for (let i = 0; i < indentSize; i++) {
	//		str += ' ';
	//	}
	//	return str;
	//}

	//function getTypeSpec(styles: Styles, type: string): TypeSpec
	//{
	//	if (styles.typeSpecs) {
	//		if (type && styles.typeSpecs[type]) {
	//			return styles.typeSpecs[type];
	//		}
	//		if (styles.typeSpecs["default"]) {
	//			return styles.typeSpecs["default"];
	//		}
	//	}
	//	return {};
	//}

	export function getClasses(entry: Entry): string[]
	{
		let classes = [];
		if (entry && entry.type) {
			let split = entry.type.split(' ');
			for (let cls of split) {
				if (cls) {
					classes.push(cls);
				}
			}
		}
		return classes;
	}

	export function hasClass(entry: Entry, _class: string)
	{
		let classes = getClasses(entry);
		for (let cls of classes) {
			if (cls === _class)
				return true;
		}
		return false;
	}

	function makeLinkUri(link: string, rootUri: string, homeUri: string): string
	{
		if (!link) return null;

		if (link.indexOf('://') > 0) {
			return link;
		}
		if (link.charAt(0) !== '/') {
			return homeUri + link;
		} else {
			return rootUri + link;
		}
	}

	function makeHomeUri(home: string, rootUri: string, homeUri: string): string
	{
		let uri: string;
		if (home) {
			uri = makeLinkUri(home, rootUri, homeUri);
		} else {
			uri = homeUri ? homeUri : rootUri;
		}

		if (uri) {
			if (uri.charAt(uri.length - 1) !== '/')
				uri += '/';
		}
		return uri;
	}

	function loadJson(url: string, callback: (json: any, err?: any) => void)
	{
		console.log("Requesting '" + url + "'...");
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = () =>
		{
			if (xhr.readyState == 4) {
				let json = null;
				if (xhr.status == 200) {
					if (xhr.responseText) {
						try {
							json = JSON.parse(xhr.responseText);
						} catch (err) {
							console.error("Can not parse '" + url + "':", err);
							callback(null, err);
						}
					}
				} else {
					if (callback) {
						let status = xhr.statusText ? xhr.statusText : (xhr.status ? xhr.status.toString() : 'unknown');
						let msg = "Can not load '" + url + "'. HTTP status: " + status;
						console.error(msg, xhr);
						callback(null, new Error(msg));
						return null;
					}
				}

				console.log("Received '" + url + "' toc=%o", json);
				callback(json);
			}
		};
		xhr.send(null);
	}

	function mergeJson(toc: Entry, json: any)
	{
		if (json.toString() == '[object Object]') {

			if (json.title && !toc.title) {
				toc.title = json.title;
			}
			Sandbox.mergeIn(toc, json);
		} else {
			toc.content = json;
		}
	}

	export function toNormaliedJson(arg: string|Entry|ToJsonArg, callback: (json: string, err?: any) => void): void
	{
		let ctoc = new CToc();
		let indent: number;

		if (isArg(arg)) {
			indent = arg.indent;
			ctoc.init(arg, onInited);
		} else {
			ctoc.init(arg, onInited);
		}

		function onInited(ctoc: CToc, err: any)
		{
			if (callback) {
				if (err) {
					callback(null, err);
				} else {
					let json = ctoc.toJson(indent);
					callback(json);
				}
			}
		}
	}

	export function toHtml(arg: string|Entry|ToHtmlArg, callback: (html: string, err?: any) => void): void
	{
		//console.log("toHtml() aeg=", arg);
		let ctoc: CToc = new CToc();
		let renderer: HtmlRenderer;
		let contentOnly;

		if (isArg(arg)) {
			renderer = arg.renderer;
			contentOnly = arg.contentOnly;
		}

		ctoc.init(arg, onInited);

		function onInited(ctoc: CToc, err: any)
		{
			if (callback) {
				if (err) {
					callback(null, err);
				} else {
					let html = ctoc.toHtml(renderer, contentOnly);
					callback(html);
				}
			}
		}
	}

	export function setAsHtml(el: Element|string, arg: string|Entry|ToHtmlArg, callback: (html: string, err?: any) => void, store?: TStore): void
	{
		let element: Element;
		if (typeof el === 'string') {
			element = document.getElementById(el);
			if (!element) {
				console.warn("Element '" + element + "' not found");
			}
		} else {
			element = el;
		}
		
		if (element) {
			let ctoc = new CToc();
			let renderer: HtmlRenderer;
			let contentOnly = false;

			if (isArg(arg)) {
				renderer = arg.renderer;
				contentOnly = arg.contentOnly;
			}
	
			if (store && !renderer) {
				console.log("setAsHtml() creating renderer");
				renderer = createHtmlRenderer({ stateStore: store });
			}

			ctoc.init(arg, onInited);

			function onInited(ctoc: CToc, err: any)
			{
				if (err) {
					if (callback) {
						callback(null, err);
					}
					return;
				}

				let html = ctoc.toHtml(renderer, contentOnly);
				element.innerHTML = html;

				if (store) {
					ctoc.loadState(store);
				}

				if (callback) {
					callback(html);
				}
			}
		}
	}
}
