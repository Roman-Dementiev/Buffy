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
    var alertUsingDefault = false;
    TOC_test.storageKey = 'TOC_test';
    TOC_test.indentJSON = 2;
    TOC_test.indentHTML = 2;
    TOC_test.tocTypes = {
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
    var rendererArg = {
        //headerTag: 'header',
        //collapsable: false,
        indentSize: TOC_test.indentHTML,
        stateStore: sessionStorage,
        divider: true,
        types: TOC_test.tocTypes
    };
    var BaseTest = (function () {
        function BaseTest() {
            this.defaultTOC = null;
            this.tocObject = null;
            this.tocSource = "";
            this.tocNormal = "";
            this.tocHtml = "";
        }
        BaseTest.prototype.init = function (json, defaultTOC) {
            var _this = this;
            this.defaultTOC = defaultTOC;
            var sessionJson = sessionStorage.getItem(TOC_test.storageKey + '.json');
            if (typeof sessionJson == 'string') {
                if (this.tryUseSource(sessionJson, 'JSON', 'HTML', true))
                    return;
            }
            if (json) {
                this.useJson(json, true, function (err) {
                    //console.log(err);
                    var showAlert = true;
                    var msg = err.toString();
                    if (defaultTOC) {
                        msg += "\nUsing default TOC";
                        showAlert = alertUsingDefault;
                    }
                    if (showAlert) {
                        alert(msg);
                    }
                    setTimeout(function () { return _this.useDefault(); }, 0);
                });
            }
            else {
                this.useDefault();
            }
        };
        BaseTest.prototype.useDefault = function () {
            if (this.defaultTOC) {
                this.useTOC(this.defaultTOC, null, 'CTOC', true);
            }
            this.benchShow('HTML');
        };
        BaseTest.prototype.useJson = function (json, inject, onError) {
            if (inject === void 0) { inject = false; }
            var toc = { title: "", json: json };
            this.useTOC(toc, null, "CTOC", inject, onError);
        };
        BaseTest.prototype.useTOC = function (toc, source, sourceMode, inject, onError) {
            //console.log("useTOC: ", toc, "source: ", wrap("source:", source), " sourceMode: ", sourceMode);
            var _this = this;
            if (inject === void 0) { inject = false; }
            this.tocObject = null;
            this.tocSource = source ? source : "";
            this.tocNormal = this.tocHtml = "";
            this.benchUpdate();
            if (!toc)
                return;
            var ctoc = new TOC.CToc();
            ctoc.init(toc, function (ctoc, err) {
                if (err) {
                    if (onError) {
                        onError(err);
                    }
                    else {
                        alert("Error: " + err.toString());
                    }
                    return;
                }
                _this.onInited(ctoc, sourceMode, inject, onError);
            });
        };
        BaseTest.prototype.onInited = function (ctoc, sourceMode, inject, onError) {
            this.tocObject = ctoc;
            this.tocNormal = ctoc.toJson(TOC_test.indentJSON);
            if (sourceMode === 'CTOC') {
                var toc = ctoc.simplify();
                this.tocSource = toc ? JSON.stringify(toc, null, TOC_test.indentJSON) : "";
            }
            this.tocHtml = this.renderHTML();
            if (inject) {
                this.injectHTML(true);
                if (this.tocObject) {
                    //console.log("Loading state");
                    this.tocObject.loadState(TOC_test.storageKey);
                }
            }
            this.benchUpdate();
        };
        BaseTest.prototype.tryUseSource = function (source, sourceMode, showMode, inject) {
            //console.log("tryUseSource(): ", source);
            var toc = null;
            var ret = true;
            try {
                toc = JSON.parse(source);
            }
            catch (err) {
                var msg = "Can not parse " + sourceMode;
                console.error(msg + ": ", err);
                alert(msg + "\n" + err.toString());
                ret = false;
            }
            this.useTOC(toc, source, sourceMode, inject);
            if (showMode) {
                this.benchShow(showMode);
            }
            return ret;
        };
        BaseTest.prototype.useSource = function (json, sourceMode, showMode, inject) {
            var _this = this;
            if (inject === void 0) { inject = false; }
            this.useTOC(null);
            if (!json)
                return false;
            if (typeof json === 'string') {
                this.tryUseSource(json, sourceMode, showMode, inject);
            }
            else {
                var reader_1 = new FileReader();
                reader_1.onloadend = function (e) {
                    if (_this.tryUseSource(reader_1.result, sourceMode, showMode, inject))
                        sessionStorage.setItem(TOC_test.storageKey + '.json', reader_1.result);
                };
                reader_1.readAsText(json);
            }
        };
        BaseTest.prototype.bindChooseJSON = function (elementId, inject) {
            var _this = this;
            if (elementId === void 0) { elementId = 'chooseJSON'; }
            if (inject === void 0) { inject = false; }
            var element = document.getElementById(elementId);
            if (element) {
                //console.log('binding chooseJSON');
                element.addEventListener('click', function (e) {
                    //console.log('chooseJSON click');
                    element.value = ""; // force change event
                });
                element.addEventListener('change', function (e) {
                    //console.log('chooseJSON change: files=', element.files, " value=", element.value);
                    if (element.files && element.files.length > 0) {
                        _this.useSource(element.files[0], 'JSON', 'JSON', inject);
                    }
                    else {
                        _this.useSource(null, null, null);
                    }
                });
            }
            else {
                console.error("Element with id='" + elementId + "' not found");
            }
        };
        return BaseTest;
    }());
    TOC_test.BaseTest = BaseTest;
    ;
    var Test = (function (_super) {
        __extends(Test, _super);
        function Test(json, defaultToc) {
            var _this = _super.call(this) || this;
            _this.currentMode = null;
            _this.TOC_element = document.getElementById('TOC');
            _this.TOC_BenchElement = document.getElementById('TestBench');
            _this.TOC_BenchTextarea = document.getElementById('TestBench_textarea');
            _this.showTestBenchButton = bindButton('showTestBench', function () { return _this.showTestBench(true); });
            _this.hideTestBenchButton = bindButton('hideTestBench', function () { return _this.showTestBench(false); });
            _this.showJSONButton = bindButton('showJSON', function () { return _this.benchShow('JSON'); });
            _this.showCTOCButton = bindButton('showCTOC', function () { return _this.benchShow('CTOC'); });
            _this.showHTMLButton = bindButton('showHTML', function () { return _this.benchShow('HTML'); });
            _this.generateHTMLButton = bindButton('generateHTML', function () { return _this.generateHTML(); });
            _this.injectHTMLButton = bindButton('injectHTML', function () { return _this.injectHTML(); });
            _this.restoreHTMLButton = bindButton('restoreHTML', function () { return _this.restoreHTML(); });
            _this.bindChooseJSON();
            _this.init(json, defaultToc);
            TestBench.aliases('all');
            //TestBench.show();
            _this.benchUpdate();
            return _this;
        }
        Test.prototype.benchUpdate = function () {
            this.showJSONButton.disabled = this.currentMode === 'JSON';
            this.showCTOCButton.disabled = this.currentMode === 'CTOC';
            this.showHTMLButton.disabled = this.currentMode === 'HTML';
            this.generateHTMLButton.disabled = this.currentMode === 'HTML';
            this.injectHTMLButton.disabled = !this.tocHtml || this.currentMode !== 'HTML';
            this.restoreHTMLButton.disabled = !this.originalHtml || this.currentMode !== 'HTML';
        };
        Test.prototype.showTestBench = function (show) {
            if (this.TOC_BenchElement) {
                this.TOC_BenchElement.setAttribute('style', displayMode(show));
            }
            if (this.showTestBenchButton) {
                this.showTestBenchButton.setAttribute('style', displayMode(!show));
            }
        };
        Test.prototype.generateHTML = function () {
            if ((this.currentMode === 'JSON' || this.currentMode === 'CTOC') && this.TOC_BenchTextarea) {
                this.useSource(this.TOC_BenchTextarea.value, this.currentMode, 'HTML');
            }
        };
        Test.prototype.renderHTML = function () {
            var renderer = TOC.createHtmlRenderer(rendererArg);
            return this.tocObject.toHtml(renderer);
        };
        Test.prototype.injectHTML = function (replaceOriginal) {
            if (replaceOriginal === void 0) { replaceOriginal = false; }
            if (!this.TOC_element)
                return;
            if (replaceOriginal || typeof this.originalHtml === 'undefined') {
                this.originalHtml = this.TOC_element.innerHTML;
            }
            this.benchShow('HTML');
            var html = this.TOC_BenchTextarea.value;
            this.TOC_element.innerHTML = html;
        };
        Test.prototype.restoreHTML = function () {
            if (!this.TOC_element || typeof this.originalHtml === 'undefined')
                return;
            this.TOC_element.innerHTML = this.originalHtml;
        };
        Test.prototype.benchShow = function (mode) {
            if (!this.TOC_BenchTextarea /* || currentMode == mode*/)
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
        };
        return Test;
    }(BaseTest));
    TOC_test.Test = Test;
    ;
    function wrap(name, value, always) {
        if (always === void 0) { always = false; }
        if (value || always) {
            var wrapper = {};
            wrapper[name] = value;
            return wrapper;
        }
        else {
            return value;
        }
    }
    function bindButton(id, handler) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', function (e) {
                handler();
                e.preventDefault();
            });
            return el;
        }
        else {
            console.warn("Element '" + id + "' not found");
            return null;
        }
    }
    function displayMode(show) {
        return show ? 'display:block;' : 'display:none;';
    }
    function init(json, defaultToc) {
        console.log("TOC_test.init()");
        TOC_test.test = new Test(json, defaultToc);
    }
    TOC_test.init = init;
})(TOC_test || (TOC_test = {}));
;
//# sourceMappingURL=TOC_test.js.map