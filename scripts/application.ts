// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
"use strict";

//var initTime : number;

var types = {
	'root': {
		listTag: 'table'
	},
	'book': {
		collapsable: true,
		startOpen: true,
		descriptionBreak: true,
		descriptionClass: 'description',
		listTag: 'ul'
	},
	'samples': {
		collapsable: true,
		startOpen: true,
		listTag: 'ol'
	}
};

var scripts = [
	'Dwarf/Dwarf.js',
	'Dwarf/IndentedText.js',
	'Dwarf/HtmlWriter.js',
	'TOC.js',
	'TOC.Rendering.js',
	'TOC.Semantic.js'
];


var bootstraping: Promise<any>;

export function initialize()
{
	//initTime = Date.now();
	document.addEventListener('deviceready', onDeviceReady, false);
	console.log("initialized");

	bootstraping = Dwarf.boot(...scripts);
}

async function onDeviceReady()
{
	document.addEventListener('pause', onPause, false);
	document.addEventListener('resume', onResume, false);

	// TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
	//var parentElement = document.getElementById('deviceready');
	//var listeningElement = parentElement.querySelector('.listening');
	//var receivedElement = parentElement.querySelector('.received');
	//listeningElement.setAttribute('style', 'display:none;');
	//receivedElement.setAttribute('style', 'display:block;');

	bootstraping
		.then(() =>
		{
			console.debug("bootstarp finished.");
			showContent();
		})
		.catch((err) =>
		{
			console.error("bootstrap error:", err);
			showError();
		})

	//let cordovaElement = document.querySelector('.cordova');
	//let contentElement = document.querySelector('.content');

}

function showContent()
{
	//var parentElement = document.getElementById('deviceready');
	//var receivedElement = parentElement.querySelector('.received');
	//receivedElement.setAttribute('style', 'display:none;');

	var startupElement = document.getElementById('startup');
	var contentElement = document.getElementById('content');
	//startupElement.setAttribute('style', 'display:none;');
	//contentElement.setAttribute('style', 'display:block;');

	let arg: TOC.ToHtmlArg = {
		toc: 'TOC.json',
		types: types,
		renderer: createRenderer(),
		initHook: (ctoc: TOC.CToc) =>
		{
			//console.log("Before hook: ", logContent(ctoc.root));
			ctoc.removeClasses("bonus")
			//console.log("After hook: ", logContent(ctoc.root));
		}
	};

	TOC.setAsHtml(contentElement, arg, (html: string, err: any) =>
	{
		if (err) {
			alert(`Can not load '${arg.toc}': ` + err.toString());
		} else {
			startupElement.setAttribute('style', 'display:none;');
			contentElement.setAttribute('style', 'display:block;');
		}
	}, sessionStorage);
}

function showError()
{
	var parentElement = document.getElementById('deviceready');
	var receivedElement = parentElement.querySelector('.received');
	var errorElement = parentElement.querySelector('.error');
	receivedElement.setAttribute('style', 'display:none;');
	errorElement.setAttribute('style', 'display:block;');
}

function createRenderer(): TOC.HtmlRenderer
{
	let arg: TOC.SemanticRendererArg = {
		//headerTag: 'header',
		indentSize: 2,
		imagePlace: TOC.kImageLeft,
		ignoreIcons: true,
		divider: true,
		stateStore: sessionStorage,
		types: types
	};

	let contentRenderer = TOC.createHtmlRenderer(arg);
	return contentRenderer;

	//return new TOC.SemanticRenderer(arg, contentRenderer);
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
