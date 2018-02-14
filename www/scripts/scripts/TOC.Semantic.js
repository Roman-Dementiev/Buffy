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
    var kNoTitle = '---';
    var kNoIcon = null; //'mini icon';
    var kDefaultDivider = '<div class="ui divider"></div>\n';
    ;
    ;
    var SemanticRenderer = (function (_super) {
        __extends(SemanticRenderer, _super);
        function SemanticRenderer(arg, contentRenderer) {
            var _this = 
            //console.log("SemanticRenderer.constructor() arg=", arg);
            _super.call(this, arg, {
                'defaultDivider': kDefaultDivider,
                'defaultListMode': null
            }) || this;
            if (!arg)
                arg = {};
            if (contentRenderer) {
                _this.contentRenderer = contentRenderer;
            }
            else {
                _this.contentRenderer = _this;
            }
            _this.ignoreIcons = !!arg.ignoreIcons;
            return _this;
        }
        SemanticRenderer.prototype.icon = function (html, arg) {
            //console.log('SemanticRenderer.icon() arg=', arg);
            var param = { close: true };
            if (typeof arg === 'string') {
                param.class = arg ? arg : 'icon';
            }
            else {
                param.attr = arg ? arg : {};
                param.class = 'icon';
            }
            html.tag('i', param);
        };
        SemanticRenderer.prototype.startList = function (html, mode, ui) {
            if (ui === void 0) { ui = true; }
            var _ui = ui ? 'ui ' : '';
            var type = mode == TOC.kOrderedList ? 'ordered ' : mode == TOC.kUnorderedList ? ' bulleted ' : '';
            html.div({ 'class': "" + _ui + type + "list" });
        };
        SemanticRenderer.prototype.startContent = function (html, param) {
            if (param.starter) {
                html.put(param.starter);
            }
            this.startList(html, param.listMode);
            return null;
        };
        SemanticRenderer.prototype.closeContent = function (html, param) {
            html.enddiv();
            if (param.finisher) {
                html.put(param.finisher);
            }
        };
        SemanticRenderer.prototype.startEntry = function (html, param) {
            var entry = param.entry;
            var type = param.typeSpec;
            var attr = param.attr;
            //console.log("indentedEntry(): attr=", attr);
            html.div({ attr: attr, class: 'item' });
            var imagePlace = null;
            if (entry.imageUri) {
                imagePlace = this.getImagePlace(entry, type, TOC.kImageLeft);
                //console.log("imagePlace=", imagePlace, "typeSpec=", typeSpec, " isListed=", isListed);
            }
            if (imagePlace) {
                if (imagePlace === TOC.kImageRight) {
                    html.img(entry.imageUri, { class: 'ui right floated image' });
                }
                else {
                    html.img(entry.imageUri, { class: 'ui image' });
                }
            }
            else {
                var _icon = (type.icon && !this.ignoreIcons) ? type.icon : kNoIcon;
                if (_icon && !this.ignoreIcons) {
                    this.icon(html, _icon);
                }
            }
            html.div({ class: 'content' });
            if (entry.title) {
                var _class = Sandbox.HtmlWriter.mergeClasses('header', this.titleClass(type));
                html.div({ 'class': _class });
                this.entryTitle(html, param);
                html.enddiv();
            }
            else {
                html.div({ 'class': 'header' });
                html.put(kNoTitle);
                html.enddiv();
            }
            if (entry.description) {
                var _class = Sandbox.HtmlWriter.mergeClasses('description', this.descriptionClass(type));
                html.div({ 'class': _class });
                html.put(entry.description);
                html.enddiv();
            }
        };
        SemanticRenderer.prototype.closeEntry = function (html, param) {
            html.enddiv(); // for content
            html.enddiv(); // for item
        };
        SemanticRenderer.prototype.entryContent = function (html, param) {
            var contentParam = {
                gid: '@' + param.gid,
                shared: param.shared,
                class: Sandbox.getDefaulted(param.typeSpec.contentClass, TOC.kContentClass),
                content: param.entry.content,
                topLevelGlobal: false,
                topLevelOnThis: false,
                listMode: this.getListMode(param.entry, param.typeSpec)
            };
            if (this.contentRenderer === this) {
                this.writeContent(html, contentParam);
            }
            else {
                contentParam.topLevelOnThis = true;
                this.contentRenderer.writeContent(html, contentParam);
            }
        };
        SemanticRenderer.prototype.entryTitle = function (html, param) {
            var type = param.typeSpec;
            var entry = param.entry;
            var title = entry.title;
            if (entry.linkUri) {
                title = "<a href=\"" + entry.linkUri + "\">" + title + "</a>";
            }
            html.span(title, { class: this.titleClass(type) });
        };
        SemanticRenderer.prototype.startAccordionClass = function (param) {
            if (param.shared['ui accordion']) {
                return 'accordion';
            }
            else {
                param.shared['ui accordion'] = param.gid;
                return 'ui accordion';
            }
        };
        SemanticRenderer.prototype.closeAccordionClass = function (param) {
            if (param.shared['ui accordion'] === param.gid) {
                param.shared['ui accordion'] = null;
            }
        };
        return SemanticRenderer;
    }(TOC.HtmlRenderer));
    TOC.SemanticRenderer = SemanticRenderer;
    ;
    var SemanticCollapsable = (function (_super) {
        __extends(SemanticCollapsable, _super);
        function SemanticCollapsable(arg, contentRenderer) {
            return _super.call(this, arg, contentRenderer) || this;
        }
        SemanticCollapsable.prototype.startEntry = function (html, param) {
            var entry = param.entry;
            var type = param.typeSpec;
            var attr = param.attr;
            //console.log("indentedEntry(): attr=", attr);
            html.div({ attr: attr, class: 'item' });
            if (entry.imageUri) {
                var imagePlace = this.getImagePlace(entry, type, TOC.kImageLeft);
                //console.log("imagePlace=", imagePlace, "typeSpec=", typeSpec, " isListed=", isListed);
                switch (imagePlace) {
                    case TOC.kImageNone:
                        break;
                    case TOC.kImageAside:
                        html.tag('aside');
                        html.img(entry.imageUri);
                        html.endtag('aside');
                        break;
                    case TOC.kImageRight:
                        html.img(entry.imageUri, { class: 'ui right floated image' });
                        break;
                    default:
                        html.img(entry.imageUri, { class: 'ui image' });
                        break;
                }
            }
            html.div({ class: 'content' }); // item content
            var _class = this.startAccordionClass(param);
            html.div({ 'class': _class });
            html.div({ attr: attr, class: 'title' });
            this.icon(html, 'dropdown icon');
            var icon = (type.icon && !this.ignoreIcons) ? type.icon : kNoIcon;
            if (icon && !this.ignoreIcons) {
                this.icon(html, icon);
            }
            this.entryTitle(html, param);
            html.enddiv();
            var contentClass = Sandbox.getDefaulted(param.typeSpec.contentClass, TOC.kContentClass);
            html.div({ 'class': 'content ' + contentClass }); // accordion content
        };
        SemanticCollapsable.prototype.closeEntry = function (html, param) {
            html.enddiv(); // for accordion content
            html.enddiv(); // for accordion
            html.enddiv(); // for item content
            html.enddiv(); // for item
            this.closeAccordionClass(param);
        };
        SemanticCollapsable.prototype.startContent = function (html, param) {
            if (param.starter) {
                html.put(param.starter);
            }
            if (param.topLevelGlobal) {
                this.startList(html, param.listMode);
            }
            return null;
        };
        SemanticCollapsable.prototype.closeContent = function (html, param) {
            if (param.topLevelGlobal) {
                html.enddiv();
            }
            if (param.finisher) {
                html.put(param.finisher);
            }
        };
        return SemanticCollapsable;
    }(SemanticRenderer));
    TOC.SemanticCollapsable = SemanticCollapsable;
    ;
    var SemanticAccordion = (function (_super) {
        __extends(SemanticAccordion, _super);
        function SemanticAccordion(arg, contentRenderer) {
            return _super.call(this, arg, contentRenderer) || this;
        }
        SemanticAccordion.prototype.startContent = function (html, param) {
            if (param.starter) {
                html.put(param.starter);
            }
            var _class = this.startAccordionClass(param);
            html.div({ 'class': _class });
            return null;
        };
        SemanticAccordion.prototype.closeContent = function (html, param) {
            this.closeAccordionClass(param);
        };
        SemanticAccordion.prototype.startEntry = function (html, param) {
            var entry = param.entry;
            var type = param.typeSpec;
            var attr = param.attr;
            var icon = (type.icon && !this.ignoreIcons) ? type.icon : kNoIcon;
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
            if (entry.imageUri) {
                var imagePlace = this.getImagePlace(entry, type, TOC.kImageLeft);
                //console.log("imagePlace=", imagePlace, "typeSpec=", typeSpec, " isListed=", isListed);
                switch (imagePlace) {
                    case TOC.kImageNone:
                        break;
                    case TOC.kImageAside:
                        html.tag('aside');
                        html.img(entry.imageUri);
                        html.endtag('aside');
                        break;
                    case TOC.kImageRight:
                        html.img(entry.imageUri, { class: 'ui right floated image' });
                        break;
                    default:
                        html.img(entry.imageUri, { class: 'ui image' });
                        break;
                }
            }
            html.div({ class: 'content' });
        };
        SemanticAccordion.prototype.closeEntry = function (html, param) {
            html.enddiv(); // item content
            html.enddiv(); // item
            html.enddiv(); // list
            html.enddiv(); // content
        };
        return SemanticAccordion;
    }(SemanticRenderer));
    TOC.SemanticAccordion = SemanticAccordion;
    ;
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
})(TOC || (TOC = {}));
//# sourceMappingURL=TOC.Semantic.js.map