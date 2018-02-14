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
var TOC_test;
(function (TOC_test) {
    var kDefaultTitle = 'TOC Semantic';
    var previewMode = null; //'HTML';
    //type $Type = JQuery;
    var $title, $content, $sidebar, $bench, 
    //$chooseJson,
    $semanticDefault, $semanticCollapsable, $semanticAccordion, $semanticDisabled, $sublevelsHtml, $sublevelsSemantic, $sublevelsShared, $collapsable, 
    /*
    $imagesDefault,
    $imagesLeft,
    $imagesRight,
    $imagesAside,
    $imagesNone,
    */
    $dividers, $ignoreIcons, $imagesDropdown, $indentDropdown, $uniformStyles, _;
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
    var renderingArg = {
        //mode: TOC.SemanticRenderingMode.Default,
        //disableSemantic: false,
        //accordion: true,
        collapsable: true,
        //headerTag: 'header',
        indentSize: TOC_test.indentHTML,
        stateStore: sessionStorage,
        //allLevels: false,
        divider: true,
        //dividerAtStart: true,
        //dividerAtEnd: true,
        ignoreIcons: false,
        types: tocTypes
    };
    var HTMLRendererDefaults = {
        defaultDivider: '<div style="clear:both"></div>',
    };
    var SemanticMode;
    (function (SemanticMode) {
        SemanticMode[SemanticMode["Disabled"] = 0] = "Disabled";
        SemanticMode[SemanticMode["Default"] = 1] = "Default";
        SemanticMode[SemanticMode["Collapsable"] = 2] = "Collapsable";
        SemanticMode[SemanticMode["Accordion"] = 3] = "Accordion";
    })(SemanticMode || (SemanticMode = {}));
    ;
    var semantic = SemanticMode.Default;
    var SublevelsMode;
    (function (SublevelsMode) {
        SublevelsMode[SublevelsMode["Html"] = 0] = "Html";
        SublevelsMode[SublevelsMode["Semantic"] = 1] = "Semantic";
        SublevelsMode[SublevelsMode["Shared"] = 2] = "Shared";
    })(SublevelsMode || (SublevelsMode = {}));
    ;
    var sublevels = SublevelsMode.Html;
    function bindDropdown(selector, action, handler) {
        var found = $(selector);
        if (found && found.length > 0 && found.dropdown) {
            if (!action && !handler) {
                found.dropdown();
            }
            else {
                var arg = {
                    'action': action ? action : 'activate'
                };
                if (handler) {
                    arg['onChange'] = handler;
                }
                found.dropdown(arg);
            }
            ;
        }
        else {
            console.warn("dropdown '" + selector + "' not found");
            return {
                dropdown: function () { }
            };
        }
        return found;
    }
    function bindCheckbox(selector, handler) {
        var found = $(selector);
        if (found && found.length > 0 && found.checkbox) {
            console.debug("checkbox '" + selector + "' found", found);
            found.checkbox();
            if (handler) {
                found.bind('changed', function (ev) { return handler(ev.target); });
            }
        }
        else {
            console.warn("checkbox '" + selector + "' not found");
            return {
                checkbox: function () { }
            };
        }
        return found;
    }
    function isChecked($ui) {
        if (!$ui) {
            console.error("isChecked() no UI: $ui", $ui);
            return;
        }
        return !!$ui.checkbox('is checked');
    }
    function setChecked($ui, checked) {
        if (checked === void 0) { checked = true; }
        if (!$ui) {
            console.error("setChecked() no UI: $ui", $ui);
            return;
        }
        if (isChecked($ui) !== checked) {
            if (checked) {
                $ui.checkbox('check');
            }
            else {
                $ui.checkbox('uncheck');
            }
        }
    }
    function checkboxEnabled($ui, enabled) {
        if (!$ui) {
            console.error("checkboxEnabled() no UI: $ui", $ui);
            return;
        }
        if (enabled) {
            $ui.checkbox('set enabled');
        }
        else {
            $ui.checkbox('set disabled');
        }
    }
    function bindRadio(selector, handler) {
        return bindCheckbox(selector, handler);
    }
    function bindButton(selector, handler) {
        var found = $(selector);
        if (found && found.length > 0) {
            console.debug("button '" + selector + "' found", found);
            if (handler) {
                console.debug("binding button '" + selector + "'");
                found.bind('click', function (ev) {
                    console.debug("button handler for '" + selector + "'");
                    ev.preventDefault();
                    handler(ev.target);
                });
            }
            return found;
        }
        else {
            console.warn("button '" + selector + "' not found");
            return null;
        }
    }
    var TestSamantic = (function (_super) {
        __extends(TestSamantic, _super);
        function TestSamantic(json, defaultTOC) {
            var _this = _super.call(this) || this;
            _this.showMode = null;
            _this.regenerateRequested = null;
            $title = $('#TOC_title');
            $content = $('#TOC_content');
            $sidebar = $('#Sidebar');
            $bench = $('#bench-segment');
            //($('.ui.accordion') as any).accordion();
            //($('.ui.radio.checkbox') as any).checkbox();
            //($('.ui.dropdown') as any).dropdown();
            //($('.ui.sidebar') as any).sidebar('toggle');
            $('#sidedbarIcon').bind('click', function (ev) {
                $sidebar.sidebar('toggle');
            });
            $('#sidedbarClose').bind('click', function (ev) {
                $sidebar.sidebar('hide');
            });
            $('.regenerate').bind('change', function (ev) {
                //console.log(".regenerate 'change': ev=", ev);
                _this.regenerateRequest();
            });
            $semanticDefault = bindRadio('#semanticDefault');
            $semanticCollapsable = bindRadio('#semanticCollapsable');
            $semanticAccordion = bindRadio('#semanticAccordion');
            $semanticDisabled = bindRadio('#semanticDisabled');
            $sublevelsHtml = bindRadio('#sublevelsHtml');
            $sublevelsSemantic = bindRadio('#sublevelsSemantic');
            $sublevelsShared = bindRadio('#sublevelsShared');
            $collapsable = bindCheckbox('#collapsable');
            //$imagesDefault = bindRadio('#imagesDefault');
            //$imagesLeft = bindRadio('#imagesLeft');
            //$imagesRight = bindRadio('#imagesRight');
            //$imagesAside = bindRadio('#imagesAside');
            //$imagesNone = bindRadio('#imagesNone');
            $dividers = bindCheckbox('#dividers');
            $ignoreIcons = bindCheckbox('#ignoreIcons');
            $imagesDropdown = _this.bindDropdown('#imagesDropdown');
            $indentDropdown = _this.bindDropdown('#indentDropdown');
            $uniformStyles = bindCheckbox('#uniformStyles');
            bindButton('#btnJSON', function (ev) { return _this.openBench('JSON'); });
            bindButton('#btnCTOC', function (ev) { return _this.openBench('CTOC'); });
            bindButton('#btnHTML', function (ev) { return _this.openBench('HTML'); });
            $('#bench-close').bind('click', function (ev) { return _this.closeBench(); });
            bindButton('#btnRestore', function (ev) {
                _this.restoreHTML();
            });
            var $uniform = $('uniform');
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
            var $aside = $('aside');
            asideCSS = $aside.css(['float', 'clear']);
            _this.benchUpdate();
            _this.bindChooseJSON('chooseJSON', true);
            _this.init(json, defaultTOC);
            return _this;
        }
        TestSamantic.prototype.bindDropdown = function (id) {
            var _this = this;
            return bindDropdown(id, null, function (value, text, selectedItem) {
                console.log(id + " 'onChange' value=", value, " text=", text, " selectedItem=", selectedItem);
                _this.regenerateRequest();
            });
        };
        TestSamantic.prototype.benchShow = function (mode) {
            //console.trace(`benchShow(${mode})`);
            var text;
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
        };
        TestSamantic.prototype.openBench = function (mode) {
            //console.trace(`openBench(${mode})`);
            if (mode) {
                this.benchShow(mode);
            }
            $bench.css('display', 'block');
        };
        TestSamantic.prototype.closeBench = function () {
            $bench.css('display', 'none');
        };
        TestSamantic.prototype.benchUpdate = function () {
            var semanticEnabled = true;
            var collapsableEnabled = true;
            var accordion = false;
            switch (semantic) {
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
            switch (sublevels) {
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
        };
        TestSamantic.prototype.renderHTML = function (updateArg) {
            if (updateArg) {
                var accordion = false;
                var collapsable = isChecked($collapsable);
                if (isChecked($semanticDefault)) {
                    semantic = SemanticMode.Default;
                }
                else if (isChecked($semanticCollapsable)) {
                    semantic = SemanticMode.Collapsable;
                }
                else if (isChecked($semanticAccordion)) {
                    semantic = SemanticMode.Accordion;
                    accordion = true;
                }
                else {
                    semantic = SemanticMode.Disabled;
                }
                if (isChecked($sublevelsHtml)) {
                    sublevels = SublevelsMode.Html;
                }
                else if (isChecked($sublevelsSemantic)) {
                    sublevels = SublevelsMode.Semantic;
                }
                else {
                    if (accordion) {
                        sublevels = SublevelsMode.Semantic;
                        collapsable = false;
                    }
                    else {
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
                var images = $imagesDropdown.dropdown('get value');
                switch (images) {
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
                var indent = $indentDropdown.dropdown('get value');
                renderingArg.indentSize = Sandbox.IndentedText.getIndentSize(indent);
                this.benchUpdate();
            }
            var contentRenderer;
            switch (sublevels) {
                case SublevelsMode.Html:
                    contentRenderer = TOC.createHtmlRenderer(renderingArg, HTMLRendererDefaults);
                    break;
                case SublevelsMode.Semantic:
                    if (renderingArg.collapsable) {
                        contentRenderer = new TOC.SemanticCollapsable(renderingArg);
                    }
                    else {
                        contentRenderer = new TOC.SemanticRenderer(renderingArg);
                    }
                    break;
                case SublevelsMode.Shared:
                    contentRenderer = null;
                    break;
            }
            var renderer;
            switch (semantic) {
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
            var html = this.tocObject.toHtml(renderer, true);
            return html;
        };
        TestSamantic.prototype.regenerateRequest = function () {
            var _this = this;
            if (this.regenerateRequested === null) {
                this.regenerateRequested = setTimeout(function () { return _this.regenerate(); }, 1);
            }
        };
        TestSamantic.prototype.regenerate = function () {
            this.regenerateRequested = null;
            //console.log("Regenerating HTML");
            if (this.tocObject) {
                this.tocHtml = this.renderHTML(true);
            }
            else {
                this.tocHtml = "";
            }
            this.injectHTML(false);
            this.applyStyles();
            if (this.showMode === 'HTML') {
                this.benchShow('HTML');
            }
            this.benchUpdate();
        };
        TestSamantic.prototype.injectHTML = function (replaceOriginal) {
            if (previewMode) {
                this.openBench(previewMode);
                return;
            }
            //console.log("TestSamantic.injetHTML()", this.tocObject);
            if (this.tocObject) {
                $title.text(this.tocObject.title);
                $content.html(this.tocHtml);
                //this.tocObject.loadState("TOC_test");
            }
            else {
                $title.html(kDefaultTitle);
                $content.html(this.tocHtml);
            }
            $('.ui.accordion').accordion();
            //($('.ui.dropdown') as any).dropdown();
        };
        TestSamantic.prototype.applyStyles = function () {
            if (isChecked($uniformStyles)) {
                $('.toc-title').css(uniformCSS);
            }
        };
        TestSamantic.prototype.restoreHTML = function () {
            if (typeof this.originalHtml === 'undefined')
                return;
            $content.html(this.originalHtml);
        };
        TestSamantic.prototype.tryUseSource = function (source, sourceMode, showMode, inject) {
            if (previewMode) {
                showMode = 'HTML';
            }
            return _super.prototype.tryUseSource.call(this, source, sourceMode, showMode, inject);
        };
        return TestSamantic;
    }(TOC_test.BaseTest));
    ;
    function initSemantic(json, defaultToc) {
        TOC_test.test = new TestSamantic(json, defaultToc);
        //let $aside = $('aside');
        //console.log('aside=', $aside, " css.float=", $aside.css('float'), "css.clear=", $aside.css('clear'));
    }
    TOC_test.initSemantic = initSemantic;
})(TOC_test || (TOC_test = {}));
;
//# sourceMappingURL=TOC_test.Semantic.js.map