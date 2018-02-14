var Sandbox;
(function (Sandbox) {
    var IndentedText = (function () {
        function IndentedText(indent, initialIndent) {
            this._indentSize = IndentedText.getIndentSize(indent);
            this._initialIndent = initialIndent ? initialIndent : 0;
            this.reset();
        }
        IndentedText.getIndentSize = function (indent) {
            if (typeof indent == 'number') {
                return indent;
            }
            switch (indent) {
                case '':
                    return IndentedText.indentDefault;
                case '0':
                case 'tabs':
                    return IndentedText.indentTabs;
                case 'none':
                    return IndentedText.indentNone;
                case 'noeol':
                    return IndentedText.removeEol;
                default:
                    var value = parseInt(indent);
                    if (!value) {
                        console.warn("IndentedText.getIndentSize() Invalid indent:", indent);
                        value = IndentedText.indentDefault;
                    }
                    return value;
            }
        };
        Object.defineProperty(IndentedText.prototype, "text", {
            get: function () { return this._text; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IndentedText.prototype, "indentSize", {
            get: function () { return this._indentSize; },
            set: function (size) { this._indentSize = size; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IndentedText.prototype, "initialIndent", {
            get: function () { return this._initialIndent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IndentedText.prototype, "currentLevel", {
            get: function () { return this._currentLevel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IndentedText.prototype, "indentString", {
            get: function () { return this._indentString; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IndentedText.prototype, "removeEol", {
            //protected get needIndent(): boolean { return this.atStart; }
            //protected get needEol(): boolean { return !this.atStart; }
            get: function () { return this.indentSize <= IndentedText.removeEol; },
            enumerable: true,
            configurable: true
        });
        IndentedText.makeIndentString = function (str, indentSize) {
            var indentStr = str ? str : "";
            for (var i = 0; i < indentSize; i++) {
                indentStr += ' ';
            }
            return indentStr;
        };
        IndentedText.prototype.newIndentStr = function () {
            //			if (typeof indentSize === 'undefined')
            //				indentSize = this.indentSize;
            var indentSize = this.indentSize;
            if (this.indentSize > 0) {
                return IndentedText.makeIndentString(this.indentString, indentSize);
            }
            else if (indentSize == 0) {
                return this.indentString + '\t';
            }
            else {
                return this.indentString;
            }
        };
        IndentedText.prototype.endLine = function (force) {
            if (this.removeEol)
                return;
            if (!this.atStart || force) {
                this._text += '\n';
                this.atStart = true;
            }
        };
        IndentedText.prototype.reset = function () {
            this._text = "";
            this._currentLevel = 0;
            this._indentString = IndentedText.makeIndentString("", this._initialIndent);
            this.atStart = true;
            this.prevLevels = [];
        };
        IndentedText.prototype.start = function (initialIndent) {
            if (typeof initialIndent === 'number')
                this._initialIndent = initialIndent;
            this.reset();
        };
        IndentedText.prototype.close = function (endLine) {
            if (endLine === void 0) { endLine = true; }
            if (endLine) {
                this.endLine();
            }
            var result = this._text;
            this.reset();
            return result;
        };
        IndentedText.prototype.newLevel = function (param) {
            this.prevLevels.push({
                indentStr: this._indentString,
                param: param
            });
            this.endLine();
            this._indentString = this.newIndentStr();
            this._currentLevel++;
        };
        IndentedText.prototype.endLevel = function () {
            this.endLine();
            if (this.currentLevel > 0) {
                var prevLevel = this.prevLevels.pop();
                this._indentString = prevLevel.indentStr;
                this._currentLevel--;
                return prevLevel.param;
            }
            else {
                console.error("IndentedText.endLevel() called at root level");
                return null;
            }
        };
        IndentedText.prototype.logState = function (prefix, suffix) {
            if (prefix) {
                console.log(prefix);
            }
            console.log("result={{", this.text, "}}");
            console.log("natStart=", this.atStart);
            if (suffix) {
                console.log(suffix);
            }
        };
        IndentedText.prototype.write = function (text, newLine) {
            if (!text) {
                if (typeof text === 'string') {
                    console.warn("IndentedText.write() text=''");
                }
                else {
                    console.warn("IndentedText.write() text=", text);
                }
                return;
            }
            if (newLine) {
                newLine = !this.atStart;
            }
            var lines = text.split('\n');
            //console.log("<<<<<<<<<<<<<<<<<<<<");
            //console.log("IndentedText.write(): text=", text);
            //console.log("   lines=", lines);
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length > 0) {
                    if (newLine) {
                        this.endLine(true);
                        //this.logState("newLine() ----------")
                    }
                    if (this.atStart) {
                        this._text += this.indentString;
                        this.atStart = false;
                        //this.needIndent = false;
                        //this.logState("indent -------------");
                    }
                    this._text += line;
                    //console.log("-------------------- line : ", line);
                    //this.needEol = true;
                    this.atStart = false;
                }
                else {
                    if (!this.removeEol) {
                        this._text += '\n';
                    }
                    this.atStart = true;
                    //this.needEol = false;
                    //this.needIndent = true;
                    //console.log("-------------------- eol");
                }
                newLine = true;
            }
            //this.logState("return    ----------", ">>>>>>>>>>>>>>>>>>>>");
        };
        return IndentedText;
    }());
    IndentedText.indentDefault = 2;
    IndentedText.indentTabs = 0;
    IndentedText.indentNone = -1;
    IndentedText.removeEol = -2;
    Sandbox.IndentedText = IndentedText;
    ;
})(Sandbox || (Sandbox = {}));
//# sourceMappingURL=IndentedText.js.map