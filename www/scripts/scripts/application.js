define(["require", "exports"], function (require, exports) {
    // For an introduction to the Blank template, see the following documentation:
    // http://go.microsoft.com/fwlink/?LinkID=397705
    // To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
    // and then run "window.location.reload()" in the JavaScript Console.
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //var initTime : number;
    var types = {
        book: {
            collapsable: true,
            startOpen: true,
        },
        samples: {
            collapsable: true,
            startOpen: true,
            listTag: 'ol'
        }
    };
    function initialize() {
        //initTime = Date.now();
        document.addEventListener('deviceready', onDeviceReady, false);
        console.log("initialized");
    }
    exports.initialize = initialize;
    function onDeviceReady() {
        //let delay : number = Date.now() - initTime;
        //console.log("deviceready: ", delay);
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        var cordovaElement = document.querySelector('.cordova');
        var contentElement = document.querySelector('.content');
        var arg = {
            toc: 'TOC.json',
            types: types,
            renderer: TOC.createHtmlRenderer({
                //headerTag: 'header',
                indentSize: 2,
                stateStore: sessionStorage
            }),
            initHook: function (ctoc) {
                //console.log("Before hook: ", logContent(ctoc.root));
                ctoc.removeClasses("bonus");
                //console.log("After hook: ", logContent(ctoc.root));
            }
        };
        TOC.setAsHtml(contentElement, arg, function (html, err) {
            if (err) {
                alert("Can not load '" + arg.toc + "': " + err.toString());
            }
            else {
                cordovaElement.setAttribute('style', 'display:none;');
                contentElement.setAttribute('style', 'display:block;');
            }
        }, sessionStorage);
        //contentElement = document.getElementById('jQM');
        //cordovaElement.setAttribute('style', 'display:none;');
        //contentElement.setAttribute('style', 'display:block;');
    }
    function logContent(entry) {
        if (!entry || !entry.content) {
            return "null";
        }
        var s = "[";
        for (var i = 0; i < entry.content.length; i++) {
            if (i > 0)
                s += ' ';
            var child = entry.content[i];
            if (child) {
                s += child.gid ? child.gid : i.toString();
            }
            else if (typeof child === 'undefined') {
                s += 'undefined';
            }
            else {
                s += 'null';
            }
        }
        s += "]";
        return s;
    }
    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }
    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
});
//# sourceMappingURL=application.js.map