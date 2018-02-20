var scripts = [
	'Dwarf/Dwarf.js',
	'Dwarf/IndentedText.js',
	'Dwarf/HtmlWriter.js',
	'TOC.js',
	'TOC.Rendering.js',
	'TOC_test.js'
];

var scriptsSemantic = [
	'TOC.Semantic.js',
	'TOC_test.Semantic.js'
];

function initTest(defaultToc: TOC.Entry)
{
	if (scripts.indexOf('TOC_test.Semantic.js') >= 0) {
		TOC_test.test = new TOC_test.TestSamantic('TOC.json', defaultToc);
	} else {
		TOC_test.test = new TOC_test.Test('TOC.json', defaultToc);
	}
}

async function bootstrap(defaultToc: TOC.Entry): Promise<void>
{
	await Dwarf.Loader.importAll(...scripts);
	initTest(defaultToc);
}


async function bootstrapTest(defaultToc: TOC.Entry, semantic: boolean)
{
	if (semantic) {
		scripts = scripts.concat(scriptsSemantic);
	}

//	await Dwarf.init('/lib/system.js', bootstrap, defaultToc);
//	await Dwarf.init(bootstrap, defaultToc);

	await Dwarf.boot(...scripts);
	initTest(defaultToc);
}
