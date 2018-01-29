namespace Dom
{
	export function $(path: string, parent?: NodeSelector)
	{
		parent = parent || document;
		return parent.querySelectorAll(path);
	}

	export function hasClass(el: Element, className: string)
	{
		let regExp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		return regExp.test(el.className);
	}

	export function addClass(el: Element, className: string)
	{
		if (!hasClass(el, className)) {
			el.className += " " + className;
		}
	}

	export function removeClass(el: Element, className: string)
	{
		let regExp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		el.className = el.className.replace(regExp, " ");
	}

	export function bind(element: string|Element|Document, event: string, handler)
	{
		if (typeof element == "string") {
			element = $(element)[0];
		}
		element.addEventListener(event, handler, false);
	}

	export function transform(element/*: HTMLElement*/, value: string)
	{
		if ("transform" in element.style) {
			element.style.transform = value;
		} else if ("webkitTransform" in element.style) {
			element.style.webkitTransform = value;
		} else if ("mozTransform" in element.style) {
			element.style.mozTransform = value;
		} else if ("msTransform" in element.style) {
			element.style.msTransform = value;
		}
	}
}
