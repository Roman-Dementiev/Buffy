var TOC;
(function (TOC) {
    //export type HeaderTag = 'div' | 'header';
    TOC.kOrderedList = 'ol';
    TOC.kUnorderedList = 'ul';
    TOC.kTable = 'table';
    TOC.kImageNone = 'none';
    TOC.kImageLeft = 'left';
    TOC.kImageRight = 'right';
    TOC.kImageAside = 'aside';
    ;
    var Scope;
    (function (Scope) {
        Scope[Scope["Local"] = 0] = "Local";
        Scope[Scope["Global"] = 1] = "Global";
        Scope[Scope["TOC"] = 2] = "TOC";
    })(Scope = TOC.Scope || (TOC.Scope = {}));
    ;
    ;
    //function isToc(arg: Entry | ToHtmlArg | ToJsonArg): arg is Entry { return typeof (arg as any).title !== 'undefined'; }
    function isArg(arg) { return typeof arg.toc !== 'undefined'; }
    var defaultEntryType = null; //'toc_entry';
    var CToc = (function () {
        function CToc() {
            this.stateStorage = null;
            this.autSaveTimeoutId = null;
        }
        Object.defineProperty(CToc.prototype, "inited", {
            get: function () { return typeof this._root !== 'undefined'; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CToc.prototype, "valid", {
            get: function () { return !!this._root; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CToc.prototype, "error", {
            get: function () { return this._err; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CToc.prototype, "root", {
            get: function () { return this._root; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CToc.prototype, "title", {
            get: function () { return this._root ? this._root.title : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CToc.prototype, "content", {
            get: function () { return this._root ? this._root.content : null; },
            enumerable: true,
            configurable: true
        });
        CToc.prototype.init = function (arg, onInited) {
            var _this = this;
            if (!onInited)
                onInited = function (ctoc, err) { };
            if (!arg) {
                onInited(null, null);
                return;
            }
            var toc;
            var rootId;
            var rootUri;
            var scope;
            var initHook;
            if (typeof arg === 'string') {
                toc = { json: arg };
            }
            else if (isArg(arg)) {
                if (typeof arg.toc === 'string') {
                    toc = { json: arg.toc };
                }
                else {
                    toc = arg.toc;
                }
                rootId = arg.rootId;
                rootUri = arg.rootUri;
                scope = arg.idScope;
                initHook = arg.initHook;
            }
            else {
                toc = arg;
            }
            if (!rootId) {
                rootId = toc.id ? toc.id : "TOC";
            }
            if (!rootUri) {
                if (toc.link) {
                    rootUri = makeHomeUri(null, toc.link, null);
                }
                else {
                    rootUri = "";
                }
            }
            if (typeof scope === 'undefined') {
                scope = Scope.Local;
            }
            var normalizeArg = {
                parent: null,
                rootId: rootId,
                rootUri: rootUri,
                homeUri: rootUri,
                scope: scope
            };
            CToc.normalizeEntry(toc, normalizeArg, function (root, err) {
                if (err) {
                    _this._err = err;
                    _this._root = null;
                }
                else {
                    _this._root = root;
                    if (initHook) {
                        initHook(_this);
                    }
                }
                onInited(_this, err);
            });
        };
        CToc.isValidId = function (id) {
            if (id) {
                var code = id.charCodeAt(0);
                return !(code > 47 && code < 58); // not '0'...'9'
            }
            else {
                return false;
            }
        };
        CToc.isValidMetaKey = function (key) {
            return key && key !== 'id' && key !== 'type' && key !== 'link' && key !== 'content';
        };
        CToc.prototype.getMeta = function (key) {
            return CToc.isValidMetaKey(key) ? this.root[key] : null;
        };
        CToc.prototype.addMeta = function (key, meta) {
            if (CToc.isValidMetaKey(key)) {
                this.root[key] = meta;
            }
        };
        CToc.prototype.getEntry = function (gid) {
            return CToc.findEntry(this._root, gid);
        };
        CToc.findEntry = function (parent, gid) {
            var entry = null;
            if (parent && parent.content) {
                for (var i = 0, count = parent.content.length; i < count; i++) {
                    var entry_1 = parent.content[i];
                    if (entry_1.gid === gid)
                        break;
                    entry_1 = CToc.findEntry(entry_1, gid);
                    if (entry_1 !== null)
                        break;
                }
            }
            return entry;
        };
        CToc.normalizeEntry = function (entry, arg, callback, index) {
            var error = null;
            var needLoad = false;
            var waitChildren = 0;
            var homeUri, jsonUri;
            if (!index)
                index = 0;
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
            }
            else {
                onLoaded(entry, null);
            }
            function onLoaded(json, err) {
                if (err) {
                    callback(null, err);
                    return;
                }
                mergeJson(entry, json);
                var normalized = {
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
                var entryId = entry.id;
                var entryScope = arg.scope;
                if (!parent) {
                    entryScope = Scope.Global;
                }
                else if (!normalized.id) {
                    entryId = index.toString();
                    entryScope = Scope.Local;
                }
                else if (normalized.id.charAt(0) === '#') {
                    entryId = normalized.id.substr(1);
                    entryScope = Scope.Global;
                }
                if (entryScope === Scope.TOC && !arg.rootId) {
                    entryScope = Scope.Global;
                }
                if (entryScope === Scope.TOC) {
                    normalized.gid = arg.rootId + '.' + entryId;
                }
                else if (entryScope === Scope.Local && arg.parent && arg.parent.gid) {
                    normalized.gid = arg.parent.gid + '.' + entryId;
                }
                else {
                    normalized.gid = entryId;
                }
                // TODO
                if (entry.home) {
                    normalized.homeUri = makeHomeUri(entry.home, arg.rootUri, arg.homeUri);
                    normalized.linkUri = makeLinkUri(entry.link, arg.rootUri, normalized.homeUri);
                    normalized.imageUri = makeLinkUri(entry.image, arg.rootUri, normalized.homeUri);
                }
                else {
                    normalized.homeUri = arg.homeUri;
                    normalized.linkUri = makeLinkUri(entry.link, arg.rootUri, arg.homeUri);
                    normalized.imageUri = makeLinkUri(entry.image, arg.rootUri, arg.homeUri);
                }
                if (entry.listTag) {
                    normalized.listTag = entry.listTag;
                }
                if (entry.content) {
                    var contentArg = {
                        parent: normalized,
                        rootId: arg.rootId,
                        rootUri: arg.rootUri,
                        homeUri: normalized.homeUri,
                        scope: arg.scope,
                    };
                    CToc.normalizeContent(normalized, entry.content, contentArg, callback);
                }
                else {
                    callback(normalized);
                }
            }
        };
        CToc.normalizeContent = function (normalized, content, arg, callback) {
            var error = null;
            var waitChildren = 1;
            normalized.content = [];
            var _loop_1 = function (i, count) {
                waitChildren++;
                normalized.content.push(null);
                CToc.normalizeEntry(content[i], arg, function (entry, err) { return onChildLoaded(entry, i, err); }, i + 1);
            };
            for (var i = 0, count = content.length; i < count; i++) {
                _loop_1(i, count);
            }
            onChildLoaded(null, -1);
            function onChildLoaded(child, index, err) {
                if (error)
                    return;
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
        };
        CToc.denormalize = function (normalized) {
            var entry = {
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
                for (var _i = 0, _a = normalized.content; _i < _a.length; _i++) {
                    var n = _a[_i];
                    entry.content.push(CToc.denormalize(n));
                }
            }
            return entry;
        };
        CToc.prototype.simplify = function () {
            return CToc.denormalize(this._root);
        };
        CToc.prototype.toHtml = function (renderer, contentOnly) {
            if (contentOnly === void 0) { contentOnly = false; }
            if (!renderer) {
                renderer = TOC.createHtmlRenderer();
            }
            return renderer.tocHtml(this._root, contentOnly);
        };
        CToc.prototype.toJson = function (indentSize) {
            var json = JSON.stringify(this.root, null, indentSize);
            return json;
        };
        CToc.prototype.renameEntry = function (gid, title) {
            TOC.forEachEntry(this.root, function (entry) { entry.title = title; }, function (entry) { return (entry.gid === gid); });
        };
        CToc.prototype.removeTypes = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i] = arguments[_i];
            }
            if (!this.root)
                return;
            var _loop_2 = function (type) {
                removeChildren(this_1.root, function (entry) { return (entry.type === type); });
            };
            var this_1 = this;
            for (var _a = 0, types_1 = types; _a < types_1.length; _a++) {
                var type = types_1[_a];
                _loop_2(type);
            }
        };
        CToc.prototype.removeClasses = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i] = arguments[_i];
            }
            if (!this.root)
                return;
            var _loop_3 = function (cls) {
                removeChildren(this_2.root, function (entry) { return hasClass(entry, cls); });
            };
            var this_2 = this;
            for (var _a = 0, classes_1 = classes; _a < classes_1.length; _a++) {
                var cls = classes_1[_a];
                _loop_3(cls);
            }
        };
        CToc.forEachElement = function (entry, callback) {
            if (entry.gid) {
                var element = document.getElementById(entry.gid);
                if (element) {
                    callback(element, entry);
                }
            }
            if (entry.content) {
                for (var _i = 0, _a = entry.content; _i < _a.length; _i++) {
                    var child = _a[_i];
                    CToc.forEachElement(child, callback);
                }
            }
        };
        CToc.getStateStore = function (store) {
            if (!store) {
                return {
                    autoSave: true,
                    storage: sessionStorage,
                    prefix: ""
                };
            }
            if (typeof store === 'string') {
                return {
                    autoSave: true,
                    storage: sessionStorage,
                    prefix: store
                };
            }
            if (typeof store.length !== 'undefined') {
                return {
                    autoSave: true,
                    storage: store,
                    prefix: ""
                };
            }
            var ss = store;
            return {
                autoSave: ss.autoSave,
                storage: ss.storage ? ss.storage : sessionStorage,
                prefix: ss.prefix ? ss.prefix : ""
            };
        };
        CToc.prototype.saveState = function (arg) {
            //console.log("CToc.saveState");
            var ss = (typeof arg !== 'undefined') ? CToc.getStateStore(arg) : this.stateStorage;
            if (!ss)
                return;
            CToc.forEachElement(this._root, function (el, entry) {
                if (el.tagName.toLowerCase() === 'details') {
                    var open_1 = el.getAttribute('open');
                    var isOpen = typeof el.getAttribute('open') === 'string';
                    var key = ss.prefix + entry.gid + '.isOpen';
                    ss.storage.setItem(key, isOpen.toString());
                    //console.log(key, '<-', isOpen);
                }
            });
        };
        CToc.prototype.loadState = function (arg) {
            var _this = this;
            //console.log("CToc.loadState");
            var isListening = !!this.autoSaveListener;
            var ss = (typeof arg !== 'undefined') ? CToc.getStateStore(arg) : this.stateStorage;
            if (arg) {
                ss = CToc.getStateStore(arg);
                this.stateStorage = ss;
            }
            else if (typeof arg === 'undefined') {
                ss = this.stateStorage;
            }
            else {
                ss = this.stateStorage;
                this.stateStorage = null;
            }
            if (!ss)
                return;
            var startListening = !isListening && ss.autoSave;
            var stopListening = isListening && (!this.stateStorage || !!this.stateStorage.autoSave);
            if (startListening) {
                this.autoSaveListener = function (ev) {
                    _this.scheduleAutoSave();
                };
            }
            CToc.forEachElement(this._root, function (el, entry) {
                if (el.tagName.toLowerCase() === 'details') {
                    var key = ss.prefix + entry.gid + '.isOpen';
                    var isOpen = ss.storage.getItem(key);
                    //console.log(key, '->', isOpen);
                    if (typeof isOpen == 'string') {
                        if (isOpen == 'true') {
                            el.setAttribute("open", "");
                        }
                        else {
                            el.removeAttribute("open");
                        }
                    }
                    if (startListening) {
                        //console.log("addEventListener on 'click' for ", entry.gid);
                        el.addEventListener('click', _this.autoSaveListener);
                    }
                    else if (stopListening) {
                        //console.log("removeEventListener on 'click' for ", entry.gid);
                        el.removeEventListener('click', _this.autoSaveListener);
                    }
                }
            });
            if (stopListening) {
                this.autoSaveListener = null;
            }
        };
        CToc.prototype.scheduleAutoSave = function () {
            var _this = this;
            //console.log("scheduleAutoSave");
            if (this.stateStorage && !this.autSaveTimeoutId) {
                this.autSaveTimeoutId = setTimeout(function () { return _this.doAutoSave(); }, 1000);
            }
        };
        CToc.prototype.doAutoSave = function () {
            //console.log("doAutoSave");
            this.autSaveTimeoutId = null;
            if (this.stateStorage) {
                this.saveState();
            }
        };
        return CToc;
    }());
    TOC.CToc = CToc;
    ;
    function doForEachEntry(entry, fn, condition) {
        if (condition(entry)) {
            fn(entry);
        }
        if (entry.content) {
            for (var _i = 0, _a = entry.content; _i < _a.length; _i++) {
                var child = _a[_i];
                doForEachEntry(child, fn, condition);
            }
        }
    }
    function forEachEntry(entry, fn, condition) {
        if (!entry || !fn)
            return;
        if (!condition)
            condition = function (e) { return true; };
        doForEachEntry(entry, fn, condition);
    }
    TOC.forEachEntry = forEachEntry;
    function forTypes(entry, type, fn, condition) {
        forEachEntry(entry, fn, typeCondition);
        function typeCondition(entry) {
            if (entry.type !== type) {
                return false;
            }
            if (condition) {
                return condition(entry);
            }
            else {
                return true;
            }
        }
    }
    TOC.forTypes = forTypes;
    function forClass(entry, _class, fn, condition) {
        forEachEntry(entry, fn, classCondition);
        function classCondition(entry) {
            if (!hasClass(entry, _class)) {
                return false;
            }
            if (condition) {
                return condition(entry);
            }
            else {
                return true;
            }
        }
    }
    TOC.forClass = forClass;
    function removeChildren(entry, condition) {
        if (!entry || !entry.content || !condition)
            return;
        var newContent = [];
        for (var i = 0, count = entry.content.length; i < count; i++) {
            var child = entry.content[i];
            if (condition(child)) {
                delete entry.content[i];
            }
            else {
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
    function getClasses(entry) {
        var classes = [];
        if (entry && entry.type) {
            var split = entry.type.split(' ');
            for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
                var cls = split_1[_i];
                if (cls) {
                    classes.push(cls);
                }
            }
        }
        return classes;
    }
    TOC.getClasses = getClasses;
    function hasClass(entry, _class) {
        var classes = getClasses(entry);
        for (var _i = 0, classes_2 = classes; _i < classes_2.length; _i++) {
            var cls = classes_2[_i];
            if (cls === _class)
                return true;
        }
        return false;
    }
    TOC.hasClass = hasClass;
    function makeLinkUri(link, rootUri, homeUri) {
        if (!link)
            return null;
        if (link.indexOf('://') > 0) {
            return link;
        }
        if (link.charAt(0) !== '/') {
            return homeUri + link;
        }
        else {
            return rootUri + link;
        }
    }
    function makeHomeUri(home, rootUri, homeUri) {
        var uri;
        if (home) {
            uri = makeLinkUri(home, rootUri, homeUri);
        }
        else {
            uri = homeUri ? homeUri : rootUri;
        }
        if (uri) {
            if (uri.charAt(uri.length - 1) !== '/')
                uri += '/';
        }
        return uri;
    }
    function loadJson(url, callback) {
        console.log("Requesting '" + url + "'...");
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var json = null;
                if (xhr.status == 200) {
                    if (xhr.responseText) {
                        try {
                            json = JSON.parse(xhr.responseText);
                        }
                        catch (err) {
                            console.error("Can not parse '" + url + "':", err);
                            callback(null, err);
                        }
                    }
                }
                else {
                    if (callback) {
                        var status_1 = xhr.statusText ? xhr.statusText : (xhr.status ? xhr.status.toString() : 'unknown');
                        var msg = "Can not load '" + url + "'. HTTP status: " + status_1;
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
    function mergeJson(toc, json) {
        if (json.toString() == '[object Object]') {
            if (json.title && !toc.title) {
                toc.title = json.title;
            }
            Sandbox.mergeIn(toc, json);
        }
        else {
            toc.content = json;
        }
    }
    function toNormaliedJson(arg, callback) {
        var ctoc = new CToc();
        var indent;
        if (isArg(arg)) {
            indent = arg.indent;
            ctoc.init(arg, onInited);
        }
        else {
            ctoc.init(arg, onInited);
        }
        function onInited(ctoc, err) {
            if (callback) {
                if (err) {
                    callback(null, err);
                }
                else {
                    var json = ctoc.toJson(indent);
                    callback(json);
                }
            }
        }
    }
    TOC.toNormaliedJson = toNormaliedJson;
    function toHtml(arg, callback) {
        //console.log("toHtml() aeg=", arg);
        var ctoc = new CToc();
        var renderer;
        var contentOnly;
        if (isArg(arg)) {
            renderer = arg.renderer;
            contentOnly = arg.contentOnly;
        }
        ctoc.init(arg, onInited);
        function onInited(ctoc, err) {
            if (callback) {
                if (err) {
                    callback(null, err);
                }
                else {
                    var html = ctoc.toHtml(renderer, contentOnly);
                    callback(html);
                }
            }
        }
    }
    TOC.toHtml = toHtml;
    function setAsHtml(el, arg, callback, store) {
        var element;
        if (typeof el === 'string') {
            element = document.getElementById(el);
            if (!element) {
                console.warn("Element '" + element + "' not found");
            }
        }
        else {
            element = el;
        }
        if (element) {
            var ctoc = new CToc();
            var renderer_1;
            var typeSpecs_1;
            if (isArg(arg)) {
                renderer_1 = arg.renderer;
                typeSpecs_1 = arg.types;
            }
            if (store && !renderer_1) {
                console.log("setAsHtml() creating renderer");
                renderer_1 = TOC.createHtmlRenderer({ stateStore: store });
            }
            ctoc.init(arg, onInited);
            function onInited(ctoc, err) {
                if (err) {
                    if (callback) {
                        callback(null, err);
                    }
                    return;
                }
                var html = ctoc.toHtml(renderer_1, typeSpecs_1);
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
    TOC.setAsHtml = setAsHtml;
})(TOC || (TOC = {}));
//# sourceMappingURL=TOC.js.map