var Dom;
(function (Dom) {
    function $(path, parent) {
        parent = parent || document;
        return parent.querySelectorAll(path);
    }
    Dom.$ = $;
    function hasClass(el, className) {
        var regExp = new RegExp("(^|\\s)" + className + "(\\s|$)");
        return regExp.test(el.className);
    }
    Dom.hasClass = hasClass;
    function addClass(el, className) {
        if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }
    Dom.addClass = addClass;
    function removeClass(el, className) {
        var regExp = new RegExp("(^|\\s)" + className + "(\\s|$)");
        el.className = el.className.replace(regExp, " ");
    }
    Dom.removeClass = removeClass;
    function bind(element, event, handler) {
        if (typeof element == "string") {
            element = $(element)[0];
        }
        element.addEventListener(event, handler, false);
    }
    Dom.bind = bind;
    function transform(element /*: HTMLElement*/, value) {
        if ("transform" in element.style) {
            element.style.transform = value;
        }
        else if ("webkitTransform" in element.style) {
            element.style.webkitTransform = value;
        }
        else if ("mozTransform" in element.style) {
            element.style.mozTransform = value;
        }
        else if ("msTransform" in element.style) {
            element.style.msTransform = value;
        }
    }
    Dom.transform = transform;
})(Dom || (Dom = {}));
//# sourceMappingURL=Dom.js.map