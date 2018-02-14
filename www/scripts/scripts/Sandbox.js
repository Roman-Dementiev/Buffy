var Sandbox;
(function (Sandbox) {
    function getDefaulted(value, defaultValue) {
        return (typeof value !== 'undefined') ? value : defaultValue;
    }
    Sandbox.getDefaulted = getDefaulted;
    function checkArrayLength(array, length, allowNullForEmpty) {
        if (allowNullForEmpty === void 0) { allowNullForEmpty = false; }
        if (array) {
            return array.length == length;
        }
        else {
            return allowNullForEmpty && length == 0;
        }
    }
    Sandbox.checkArrayLength = checkArrayLength;
    function copy(source) {
        var result = {};
        if (source) {
            var properties = Object.getOwnPropertyNames(source);
            for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                var propertyName = properties_1[_i];
                result[propertyName] = source[propertyName];
            }
        }
        return result;
    }
    Sandbox.copy = copy;
    function override(source, overriding, properties) {
        if (!properties) {
            properties = Object.getOwnPropertyNames(source);
        }
        for (var _i = 0, properties_2 = properties; _i < properties_2.length; _i++) {
            var propertyName = properties_2[_i];
            if (overriding.hasOwnProperty(propertyName)) {
                source[propertyName] = overriding[propertyName];
            }
        }
        return source;
    }
    Sandbox.override = override;
    function overrideOrAdd(source, overriding, properties) {
        return override(source, overriding, Object.getOwnPropertyNames(overriding));
    }
    Sandbox.overrideOrAdd = overrideOrAdd;
    function mergeIn(source, merging, properties) {
        if (!properties) {
            properties = Object.getOwnPropertyNames(merging);
        }
        for (var _i = 0, properties_3 = properties; _i < properties_3.length; _i++) {
            var propertyName = properties_3[_i];
            if (!source.hasOwnProperty(propertyName)) {
                source[propertyName] = merging[propertyName];
            }
        }
        return source;
    }
    Sandbox.mergeIn = mergeIn;
    function mergeDefaults(source) {
        var defaults = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            defaults[_i - 1] = arguments[_i];
        }
        if (!source)
            source = {};
        var result = {};
        mergeIn(result, source);
        for (var _a = 0, defaults_1 = defaults; _a < defaults_1.length; _a++) {
            var defs = defaults_1[_a];
            mergeIn(result, defs);
        }
        return result;
    }
    Sandbox.mergeDefaults = mergeDefaults;
    function parseBoolean(str) {
        switch (str.toLowerCase()) {
            case 'true': return true;
            case 'false': return false;
        }
        return undefined;
    }
    Sandbox.parseBoolean = parseBoolean;
    function parseParams(params, paramStr, conv) {
        params = params || {};
        if (!paramStr) {
            return params;
        }
        var split = paramStr.split(';');
        for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
            var param = split_1[_i];
            var name_1 = void 0, valStr = void 0, value = void 0;
            var eq = param.indexOf('=');
            if (eq > 0) {
                name_1 = param.substr(0, eq);
                name_1 = name_1.trim();
                valStr = param.substr(eq + 1).trim();
                value = valStr;
            }
            else {
                name_1 = param.trim();
                valStr = null;
                value = true;
            }
            if (valStr && conv && conv[name_1]) {
                var parse = void 0;
                var check = null;
                if (typeof conv[name_1] === 'function') {
                    parse = conv[name_1];
                }
                else if (typeof conv[name_1] === 'string') {
                    var type = conv[name_1].toLowerCase();
                    switch (conv[name_1].toLowerCase()) {
                        //case 'string':
                        //	parse = unquote; ???
                        //	break;
                        //case 'number':
                        case 'float':
                            parse = parseFloat;
                            break;
                        case 'int':
                            parse = parseInt;
                            break;
                        case 'bool':
                            //case 'boolean':
                            parse = parseBoolean;
                            break;
                        case 'any':
                        case 'eval':
                            parse = eval;
                            break;
                        default:
                            parse = eval;
                            check = type;
                            break;
                    }
                }
                else {
                    parse = eval;
                }
                value = parse(valStr);
                if (check) {
                    if (typeof value != check) {
                        value = undefined;
                    }
                }
            }
            params[name_1] = value;
        }
        return params;
    }
    Sandbox.parseParams = parseParams;
    function documentParamString(removeQuestion) {
        if (removeQuestion === void 0) { removeQuestion = true; }
        if (document && document.location && document.location.search) {
            var paramStr = document.location.search;
            if (removeQuestion && paramStr.length > 0 && paramStr.charAt(0) === '?') {
                paramStr = paramStr.substr(1);
            }
            return paramStr;
        }
        else {
            return "";
        }
    }
    Sandbox.documentParamString = documentParamString;
    function documentParams(conv) {
        var paramStr = documentParamString();
        return parseParams({}, paramStr, conv);
    }
    Sandbox.documentParams = documentParams;
})(Sandbox || (Sandbox = {}));
//# sourceMappingURL=Sandbox.js.map