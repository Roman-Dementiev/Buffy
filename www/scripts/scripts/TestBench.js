var TestBench = (function () {
    function TestBench() {
    }
    Object.defineProperty(TestBench, "id", {
        get: function () { return TestBench._id; },
        set: function (newId) {
            if (newId != TestBench._id) {
                var wasShown = TestBench._shown;
                if (TestBench._panel) {
                    TestBench.hide();
                }
                TestBench._id = newId;
                if (wasShown) {
                    TestBench.show();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    TestBench.getPanel = function (id) {
        if (id === void 0) { id = TestBench._id; }
        var panel;
        if (id) {
            panel = document.getElementById(TestBench.id);
            if (!panel) {
                console.log("TestBench '" + TestBench._id + "' not found");
            }
        }
        else {
            panel = document.querySelector(".testbench");
            if (!panel) {
                console.log("TestBench not found");
            }
        }
        return panel;
    };
    Object.defineProperty(TestBench, "panel", {
        get: function () {
            if (typeof TestBench._panel === 'undefined') {
                TestBench._panel = TestBench.getPanel();
            }
            return TestBench._panel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestBench, "isShown", {
        get: function () {
            //if (typeof TestBench._shown == 'undefined') {
            //	let panel = TestBench.panel;
            //	if (panel) {
            //		let style = panel.getAttribute('style');
            //		console.log('style=', style);
            //	} else {
            //		TestBench._shown = false;
            //	}
            //}
            return TestBench._shown;
        },
        enumerable: true,
        configurable: true
    });
    TestBench.show = function () {
        var panel = TestBench.panel;
        if (panel) {
            panel.setAttribute('style', 'display:block');
            TestBench._shown = true;
        }
    };
    TestBench.hide = function () {
        var panel = TestBench.panel;
        if (panel) {
            panel.setAttribute('style', 'display:none');
            TestBench._shown = false;
        }
    };
    TestBench.toggle = function () {
        if (TestBench.isShown) {
            TestBench.hide();
        }
        else {
            TestBench.show();
        }
    };
    TestBench.aliases = function (kind) {
        if (kind === void 0) { kind = 'long'; }
        switch (kind) {
            case 'short':
                TestBench.defineAliases(window, true);
                break;
            case 'long':
                TestBench.defineAliases(window, false);
                break;
            case 'all':
                TestBench.aliases('short');
                TestBench.aliases('long');
                break;
            case 'none':
                TestBench.unalias('short');
                TestBench.unalias('long');
                break;
            default:
                console.warn("TestBench.aliases() argument must be 'short', 'long', 'all' or 'none'");
                break;
        }
    };
    TestBench.unalias = function (kind) {
        if (kind === void 0) { kind = 'all'; }
        switch (kind) {
            case 'short':
                var d = void 0;
                TestBench.undefAliases(window, true);
                break;
            case 'long':
                TestBench.undefAliases(window, false);
                break;
            case 'all':
                TestBench.unalias('short');
                TestBench.unalias('long');
                break;
            default:
                console.warn("TestBench.unalias() argument must be 'short', 'long' or 'all'");
                break;
        }
    };
    TestBench.defineAliases = function (scope, short) {
        for (var _i = 0, _a = TestBench._aliases; _i < _a.length; _i++) {
            var alias = _a[_i];
            var name_1 = short ? alias.short : alias.long;
            if (name_1) {
                scope[name_1] = alias.fn;
            }
        }
    };
    TestBench.undefAliases = function (scope, short) {
        for (var _i = 0, _a = TestBench._aliases; _i < _a.length; _i++) {
            var alias = _a[_i];
            var name_2 = short ? alias.short : alias.long;
            if (name_2) {
                scope[name_2] = undefined;
            }
        }
    };
    return TestBench;
}());
TestBench._shown = false;
TestBench._aliases = [
    {
        short: '$tb',
        long: 'testBench',
        fn: function () { return TestBench.toggle(); }
    }, {
        short: '$show',
        long: 'showTestBench',
        fn: function () { return TestBench.show(); }
    }, {
        short: '$hide',
        long: 'hideTestBench',
        fn: function () { return TestBench.hide(); }
    }
];
;
/*
function testPanel

function showTocHtml()
{
    setElementStyle('TOC_textarea', 'display:block')
    let bench = TOC.getElement(testBenchId);
    if (el) {
        el.setAttribute('style', style);
    }
}

function hideTocHtml()
{
    setElementStyle('TOC_textarea', 'display:none')
}
*/
//# sourceMappingURL=TestBench.js.map