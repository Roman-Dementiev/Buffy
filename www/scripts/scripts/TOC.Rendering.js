var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TOC;
(function (TOC) {
    TOC.kHeaderClass = 'toc-header';
    TOC.kTitleClass = 'toc-title';
    TOC.kDescriptionClass = 'toc-description';
    TOC.kContentClass = 'toc-content';
    TOC.kListItem = 'li';
    TOC.kTableRow = 'tr';
    ;
    ;
    ;
    var HtmlRenderer = (function () {
        function HtmlRenderer(arg, defaults) {
            //console.log("HtmlRenderer.constructor() arg=", arg, "defaults=", defaults);
            if (!arg)
                arg = {};
            if (defaults) {
                this.defaults = Sandbox.mergeDefaults(defaults, HtmlRenderer.Defaults);
            }
            else {
                this.defaults = HtmlRenderer.Defaults;
            }
            //this.headerTag = arg.headerTag ? arg.headerTag : 'div';
            this.headerClass = Sandbox.getDefaulted(arg.headerClass, TOC.kHeaderClass);
            this.contentClass = Sandbox.getDefaulted(arg.contentClass, TOC.kContentClass);
            this.indentSize = Sandbox.getDefaulted(arg.indentSize, Sandbox.IndentedText.indentDefault);
            this.stateStore = arg.stateStore ? TOC.CToc.getStateStore(arg.stateStore) : null;
            this.divider = arg.divider;
            this.starter = arg.dividerAtStart;
            this.finisher = arg.dividerAtEnd;
            this.imagePlace = arg.imagePlace;
            this.defaultType = arg.defaultType;
            this.types = arg.types;
            //console.log("HtmlRenderer.constructor() this=", this)
        }
        Object.defineProperty(HtmlRenderer.prototype, "defaultDivider", {
            get: function () {
                return this.defaults['defaultDivider'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HtmlRenderer.prototype, "defaultListMode", {
            get: function () {
                return this.defaults['defaultListMode'];
            },
            enumerable: true,
            configurable: true
        });
        HtmlRenderer.prototype.getDivider = function (divider) {
            if (typeof divider === 'string') {
                return divider;
            }
            if (divider) {
                return (typeof this.divider == 'string') ? this.divider : this.defaultDivider;
            }
            else {
                return null;
            }
        };
        HtmlRenderer.prototype.getListMode = function (entry, typeSpec) {
            var listMode;
            if (typeof entry.listTag !== 'undefined') {
                listMode = entry.listTag;
            }
            else if (typeSpec && typeof typeSpec.listTag !== 'undefined') {
                listMode = typeSpec.listTag;
            }
            else {
                listMode = this.defaultListMode;
            }
            //console.log("getListMode() entry=", entry, "typeSpec=", typeSpec, "listMode=", listMode);
            return listMode;
        };
        HtmlRenderer.prototype.getImagePlace = function (entry, type, defaultPlace) {
            var imagePlace = null;
            if (type && type.imagePlace) {
                imagePlace = type.imagePlace;
            }
            else if (this.imagePlace) {
                imagePlace = this.imagePlace;
            }
            else {
                imagePlace = defaultPlace ? defaultPlace : null;
            }
            //console.log("getImagePlace() imagePlace=", imagePlace, "type=", type);
            return imagePlace;
        };
        HtmlRenderer.prototype.tocHtml = function (toc, contentOnly, initialIndent) {
            if (contentOnly === void 0) { contentOnly = false; }
            var indentSize = Sandbox.IndentedText.getIndentSize(this.indentSize);
            var html = new Sandbox.HtmlWriter(indentSize, initialIndent);
            html.start();
            if (toc.title && !contentOnly) {
                this.writeTocHeader(html, toc.title);
            }
            var rootType = toc.type ? toc.type : 'root';
            var rootSpec = this.getTypeSpec(rootType);
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
        };
        HtmlRenderer.prototype.headerHtml = function (title, initialIndent) {
            var indentSize = Sandbox.IndentedText.getIndentSize(this.indentSize);
            var html = new Sandbox.HtmlWriter(indentSize, initialIndent);
            html.start();
            this.writeTocHeader(html, title);
            return html.close();
        };
        HtmlRenderer.prototype.writeTocHeader = function (html, title) {
            html.div({ class: this.headerClass });
            html.put(title);
            html.enddiv();
        };
        HtmlRenderer.prototype.writeTocContent = function (html, param) {
            this.writeContent(html, param);
        };
        HtmlRenderer.prototype.startContent = function (html, param) {
            if (param.starter) {
                html.put(param.starter);
            }
            var arg = { 'class': param.class };
            var listed = null;
            if (param.listMode) {
                html.tag(param.listMode, arg);
                listed = (param.listMode === TOC.kTable) ? TOC.kTableRow : TOC.kListItem;
            }
            else {
                html.div(arg);
            }
            return listed;
        };
        HtmlRenderer.prototype.closeContent = function (html, param) {
            if (param.listMode) {
                html.endtag(param.listMode);
            }
            else {
                html.enddiv();
            }
            if (param.finisher) {
                html.put(param.finisher);
            }
        };
        HtmlRenderer.prototype.writeContent = function (html, param) {
            var content = param.content;
            if (!content)
                return;
            var isListed = this.startContent(html, param);
            for (var i = 0; i < content.length; i++) {
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
        };
        HtmlRenderer.prototype.writeEntry = function (html, param) {
            var entry = param.entry;
            //let types = param.types;
            var type = entry.type ? entry.type : (this.defaultType ? this.defaultType : null);
            if (typeof param.typeSpec === 'undefined') {
                param.typeSpec = this.getTypeSpec(type);
            }
            var hasChildren = entry.content && entry.content.length > 0;
            ;
            var collapsable = param.typeSpec.collapsable;
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
        };
        HtmlRenderer.prototype.startEntry = function (html, param) {
            if (param.isListed) {
                html.tag(param.isListed);
            }
            this.imageAtStart(html, param);
            html.div(param.attr);
            this.entryTitle(html, param);
        };
        HtmlRenderer.prototype.closeEntry = function (html, param) {
            html.endtag();
            this.imageAtClose(html, param);
            if (param.isListed) {
                html.endtag(param.isListed);
            }
        };
        HtmlRenderer.prototype.titleClass = function (type) {
            if (type.titleClass) {
                return type.titleClass;
            }
            else if (typeof type.titleClass === 'undefined') {
                return TOC.kTitleClass;
            }
            else {
                return null;
            }
        };
        HtmlRenderer.prototype.descriptionClass = function (type) {
            if (type.descriptionClass) {
                return type.descriptionClass;
            }
            else if (typeof type.descriptionClass === 'undefined') {
                return TOC.kDescriptionClass;
            }
            else {
                return null;
            }
        };
        HtmlRenderer.prototype.entryTitle = function (html, param) {
            var type = param.typeSpec;
            var entry = param.entry;
            var title = entry.title;
            if (entry.linkUri) {
                title = "<a href=\"" + entry.linkUri + "\">" + title + "</a>";
            }
            html.span(title, { class: this.titleClass(type) });
            if (entry.description) {
                var _break = type.descriptionBreak ? '<br/>' : '&nbsp;';
                html.put(_break);
                html.span(entry.description, { class: this.descriptionClass(type) });
            }
        };
        HtmlRenderer.prototype.entryContent = function (html, param) {
            var contentParam = {
                gid: '@' + param.gid,
                shared: param.shared,
                class: Sandbox.getDefaulted(param.typeSpec.contentClass, TOC.kContentClass),
                content: param.entry.content,
                topLevelGlobal: false,
                topLevelOnThis: false,
                listMode: this.getListMode(param.entry, param.typeSpec)
            };
            this.writeContent(html, contentParam);
        };
        HtmlRenderer.prototype.imageAtStart = function (html, param) {
            var entry = param.entry;
            if (entry.imageUri) {
                var imagePlace = void 0;
                if (param.isListed === TOC.kTableRow) {
                    imagePlace = this.getImagePlace(entry, param.typeSpec, TOC.kImageLeft);
                }
                else {
                    imagePlace = this.getImagePlace(entry, param.typeSpec, TOC.kImageAside);
                    if (imagePlace && imagePlace !== TOC.kImageNone) {
                        imagePlace = TOC.kImageAside;
                    }
                }
                switch (imagePlace) {
                    case TOC.kImageLeft:
                        html.tag('td');
                        html.img(entry.imageUri);
                        html.endtag('td');
                        html.tag('td');
                        break;
                    case TOC.kImageRight:
                        html.tag('td');
                        break;
                    case TOC.kImageAside:
                        html.tag('aside');
                        html.img(entry.imageUri);
                        html.endtag('aside');
                        break;
                }
            }
        };
        HtmlRenderer.prototype.imageAtClose = function (html, param) {
            var entry = param.entry;
            if (entry.imageUri && param.isListed == TOC.kTableRow) {
                var imagePlace = this.getImagePlace(entry, param.typeSpec, TOC.kImageLeft);
                switch (imagePlace) {
                    case TOC.kImageLeft:
                        html.endtag('td');
                        break;
                    case TOC.kImageRight:
                        html.endtag('td');
                        html.tag('td');
                        html.img(entry.imageUri);
                        html.endtag('td');
                        break;
                }
            }
        };
        HtmlRenderer.prototype.getTypeSpec = function (type) {
            var types = this.types;
            if (types) {
                if (type && types[type]) {
                    return types[type];
                }
                if (types["default"]) {
                    return types["default"];
                }
            }
            return {};
        };
        return HtmlRenderer;
    }());
    HtmlRenderer.Defaults = {
        defaultDivider: null,
        defaultListMode: 'ul'
    };
    TOC.HtmlRenderer = HtmlRenderer;
    ;
    var DetailsHtmlRenderer = (function (_super) {
        __extends(DetailsHtmlRenderer, _super);
        function DetailsHtmlRenderer(arg, defaults) {
            return _super.call(this, arg, defaults) || this;
        }
        DetailsHtmlRenderer.prototype.startEntry = function (html, param) {
            if (param.isListed) {
                html.tag(param.isListed);
            }
            this.imageAtStart(html, param);
            var entry = param.entry;
            //let title = this.entryTitle(entry, param.typeSpec);
            var attr = param.attr;
            if (param.collapsable) {
                var open_1 = param.typeSpec && param.typeSpec.startOpen;
                if (this.stateStore) {
                    var key = this.stateStore.prefix + entry.gid + '.isOpen';
                    var isOpen = this.stateStore.storage.getItem(key);
                    if (typeof isOpen === 'string') {
                        open_1 = (isOpen === 'true');
                    }
                    //console.log(key, '=', isOpen, "; open=", open);
                }
                if (open_1) {
                    attr['open'] = null;
                }
                html.tag('details', { attr: attr });
                this.entryTitle(html, param);
            }
            else {
                html.div({ attr: attr });
                this.entryTitle(html, param);
            }
        };
        return DetailsHtmlRenderer;
    }(HtmlRenderer));
    TOC.DetailsHtmlRenderer = DetailsHtmlRenderer;
    ;
    var detailsSupported;
    function createHtmlRenderer(arg, defaults) {
        var useDetails = !arg || arg.collapsable || typeof arg.collapsable === 'undefined';
        if (useDetails) {
            if (typeof detailsSupported === 'undefined') {
                var test = document.createElement('details');
                if (test) {
                    test.remove();
                    detailsSupported = true;
                }
                else {
                    detailsSupported = false;
                }
                //console.log("detailsSupported=", detailsSupported);
            }
            useDetails = detailsSupported;
        }
        //console.log("useDetails=", useDetails, "arg=", arg);
        if (useDetails) {
            return new DetailsHtmlRenderer(arg, defaults);
        }
        else {
            return new HtmlRenderer(arg, defaults);
        }
    }
    TOC.createHtmlRenderer = createHtmlRenderer;
})(TOC || (TOC = {}));
//# sourceMappingURL=TOC.Rendering.js.map