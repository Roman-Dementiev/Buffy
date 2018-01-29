// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
"use strict";

var initTime : number;

var tocStyles: TOC.Styles = {
	//titleClass: 'TOC_header',
	titleTag: 'header',
	typeSpecs: {
		book: {
			collapsable: true,
		},
		samples: {
			collapsable: true,
			startOpen: true,
			listTag: 'ol'
		}
	}
};


export function initialize(): void {
	initTime = Date.now();
	document.addEventListener('deviceready', onDeviceReady, false);
	console.log("initialized");
}

function onDeviceReady(): void
{
	let delay : number = Date.now() - initTime;
	console.log("deviceready: ", delay);

	document.addEventListener('pause', onPause, false);
	document.addEventListener('resume', onResume, false);

	// TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
	var parentElement = document.getElementById('deviceready');
	var listeningElement = parentElement.querySelector('.listening');
	var receivedElement = parentElement.querySelector('.received');
	listeningElement.setAttribute('style', 'display:none;');
	receivedElement.setAttribute('style', 'display:block;');

	let cordovaElement = document.querySelector('.cordova');
	let contentElement = document.querySelector('.content');

	let arg: TOC.ToHtmlArg = {
		toc: 'TOC.json',
		styles: tocStyles,
		indent: 2,

		initHook: (ctoc: TOC.CToc) => {
			//console.log("Before hook: ", logContent(ctoc.root));
			ctoc.removeClasses("bonus")
			//console.log("After hook: ", logContent(ctoc.root));
		}
	};

	TOC.setAsHtml(contentElement, arg, (html: string, err: any) =>
	{
		if (err) {
			alert("Can not load TOC.json\n" + err.toString());
		} else {
			cordovaElement.setAttribute('style', 'display:none;');
			contentElement.setAttribute('style', 'display:block;');
		}
	}, sessionStorage);
}

function logContent(entry: TOC.Entry) : string
{
	if (!entry || !entry.content) {
		return "null";
	}

	let s = "[";
	for (let i = 0; i < entry.content.length; i++) {
		if (i > 0) s += ' ';
		let child: any = entry.content[i];
		if (child) {
			s += child.gid ? child.gid : i.toString();
		} else if (typeof child === 'undefined') {
			s += 'undefined';
		} else {
			s += 'null';
		}
	}
	s += "]";
	return s;
}

function onPause(): void
{
	// TODO: This application has been suspended. Save application state here.
}

function onResume(): void
{
	// TODO: This application has been reactivated. Restore application state here.
}
