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
var Sandbox;
(function (Sandbox) {
    var TagClosing;
    (function (TagClosing) {
        TagClosing[TagClosing["Open"] = 0] = "Open";
        TagClosing[TagClosing["Closed"] = 1] = "Closed";
        TagClosing[TagClosing["TagClosing"] = 2] = "TagClosing";
        TagClosing[TagClosing["SelfClosed"] = 3] = "SelfClosed";
    })(TagClosing = Sandbox.TagClosing || (Sandbox.TagClosing = {}));
    ;
    ;
    var HtmlWriter = (function () {
        function HtmlWriter(arg, initialIndent) {
            switch (typeof arg) {
                case 'undefined':
                    this.writer = new TagWriter(0);
                    break;
                case 'number':
                    this.writer = new TagWriter(arg, initialIndent);
                    break;
                case 'boolean':
                    if (arg) {
                        this.writer = new TagWriter();
                    }
                    else {
                        this.writer = null;
                    }
                    break;
                default:
                    if (!arg) {
                        throw new Error("HtmlWriter constructor(" + arg + "): tagWriter is required.");
                    }
                    this.writer = arg;
                    break;
            }
            if (!HtmlWriter.defaultClosings) {
                HtmlWriter.defaultTagsClosings();
            }
            this.tagsClosings = HtmlWriter.defaultClosings;
            //console.log("HtmlWriter.contructor(), arg=", arg, "writer=", this.writer, "tagsClosings=", tagsClosings);
        }
        Object.defineProperty(HtmlWriter.prototype, "tagWriter", {
            get: function () {
                return this.writer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HtmlWriter.prototype, "text", {
            get: function () {
                return this.writer.text;
            },
            enumerable: true,
            configurable: true
        });
        HtmlWriter.prototype.start = function () {
            this.writer.start();
        };
        HtmlWriter.prototype.close = function () {
            return this.writer.close();
        };
        HtmlWriter.prototype.writeTag = function (tag, value, arg) {
            if (typeof value === 'string') {
                this.tag(tag, arg);
                this.put(value);
                this.endtag(tag);
            }
            else {
                if (!arg)
                    arg = {};
                arg.close = true;
                this.tag(tag, arg);
            }
        };
        HtmlWriter.prototype.isSelClosed = function (tag) {
            return this.tagsClosings[tag] === TagClosing.SelfClosed;
        };
        HtmlWriter.prototype.requiresTagcClosing = function (tag) {
            return this.tagsClosings[tag] === TagClosing.TagClosing;
        };
        /*
        public tag(tag: string, attr?: TagAttr, close?: boolean|TagClosing)
        {
            let debug = false;
            debug = tag === 'i';

            let closing: TagClosing;
            if (typeof close === 'number') {
                closing = close;
            } else if (typeof close === 'boolean') {
                closing = close ? TagClosing.Closed : TagClosing.Open;
;			} else if (this.isSelClosed(tag)) {
                closing = TagClosing.SelfClosed;
            } else {
                closing = TagClosing.Open;
            }

            if (closing === TagClosing.Closed && this.requiresTagcClosing(tag)) {
                closing = TagClosing.TagClosing;
            }

            switch (closing)
            {
                case TagClosing.SelfClosed:
                    let text = this.writer.formatTag(tag, attr);
                    this.writer.write(text);
                    if (debug) {
                        console.log("HtmlWriter.tag(",tag, ", attr=",attr,", close=", close, ") => write(", text, ")");
                    }
                    break;

                case TagClosing.TagClosing:
                    this.writer.startTag(tag, attr);
                    this.writer.closeTag(tag);
                    if (debug) {
                        console.log("HtmlWriter.tag(", tag, ", attr=", attr, ", close=", close, ") => startTag(",tag,"), closeTag(",tag,")");
                    }
                    break;

                case TagClosing.Closed:
                    this.writer.startTag(tag, attr, true);
                    if (debug) {
                        console.log("HtmlWriter.tag(", tag, ", attr=", attr, ", close=", close, ") => startTag(", tag, ", true)");
                    }
                    break;

                default:
                    this.writer.startTag(tag, attr);
                    if (debug) {
                        console.log("HtmlWriter.tag(", tag, ", ", attr, ", =", close, ") => startTag(", tag, ")");
                    }
                    break;
            }
        }
        */
        HtmlWriter.splitClasses = function (classes) {
            var result = [];
            if (classes) {
                var split = classes.split(' ');
                for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
                    var cls = split_1[_i];
                    if (cls) {
                        result.push(cls);
                    }
                }
            }
            return result;
        };
        //private static debugMerge = false;
        HtmlWriter.mergeClasses = function (classes1, classes2) {
            if (classes1 && classes2) {
                //if (HtmlWriter.debugMerge) {
                //	console.log("mergeClasses(): classes1=", classes1);
                //	console.log("mergeClasses(): classes2=", classes2);
                //}
                var split1 = HtmlWriter.splitClasses(classes1);
                var split2 = HtmlWriter.splitClasses(classes2);
                var merged = classes1;
                //if (HtmlWriter.debugMerge) {
                //	console.log("mergeClasses(): split1=", split1);
                //	console.log("mergeClasses(): split2=", split2);
                //}
                for (var _i = 0, split2_1 = split2; _i < split2_1.length; _i++) {
                    var cls = split2_1[_i];
                    var found = split1.indexOf(cls);
                    //if (HtmlWriter.debugMerge) {
                    //	console.log("mergeClasses(): cls=", cls, "found=", found);
                    //}
                    if (found < 0) {
                        if (merged)
                            merged += ' ';
                        merged += cls;
                    }
                }
                //if (HtmlWriter.debugMerge) {
                //	console.log("mergeClasses(): merged=", merged);
                //}
                return merged;
            }
            else if (classes1) {
                return classes1;
            }
            else {
                return classes2;
            }
        };
        HtmlWriter.mergeStyles = function (style1, style2) {
            if (!style2) {
                return style1;
            }
            var properties = Object.getOwnPropertyNames(style2);
            if (properties.length === 0)
                return style1;
            var merged;
            if (style1) {
                merged = style1.toString();
                if (merged.length > 0 && merged.charAt(merged.length - 1) !== ';')
                    merged += ';';
            }
            else {
                merged = '';
            }
            for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                var prop = properties_1[_i];
                var value = style2[prop];
                if (value) {
                    merged += prop + ':' + value.toString() + ';';
                }
            }
            return merged;
        };
        HtmlWriter.getAttr = function (arg) {
            if (!arg.class && !arg.style)
                return arg.attr;
            var _attr = Sandbox.copy(arg.attr);
            if (arg.class) {
                _attr.class = HtmlWriter.mergeClasses(_attr.class, arg.class);
            }
            if (arg.style) {
                _attr.style = HtmlWriter.mergeStyles(_attr.style, arg.style);
            }
            return _attr;
        };
        HtmlWriter.prototype.tag = function (tag, arg) {
            //let debug = false;
            //HtmlWriter.debugMerge = arg && arg.attr && arg.attr['class'] && typeof arg.class == 'string';
            if (!arg)
                arg = {};
            var closing;
            if (typeof arg.close === 'number') {
                closing = arg.close;
            }
            else if (typeof arg.close === 'boolean') {
                closing = arg.close ? TagClosing.Closed : TagClosing.Open;
            }
            else if (this.isSelClosed(tag)) {
                closing = TagClosing.SelfClosed;
            }
            else {
                closing = TagClosing.Open;
            }
            if (closing === TagClosing.Closed && this.requiresTagcClosing(tag)) {
                closing = TagClosing.TagClosing;
            }
            var attr = HtmlWriter.getAttr(arg);
            //if (debug2) {
            //	console.log("HtmlWriter.tag(", tag, ", arg=", arg, ") => attr=", attr);
            //}
            switch (closing) {
                case TagClosing.SelfClosed:
                    var text = this.writer.formatTag(tag, attr);
                    this.writer.write(text);
                    //if (debug) {
                    //	console.log("HtmlWriter.tag(", tag, ", arg=", arg, ") => write(", text, ")");
                    //}
                    break;
                case TagClosing.TagClosing:
                    this.writer.startTag(tag, attr);
                    this.writer.closeTag(tag);
                    //if (debug) {
                    //	console.log("HtmlWriter.tag(", tag, ", arg=", arg, ") => startTag(", tag, "), closeTag(", tag, ")");
                    //}
                    break;
                case TagClosing.Closed:
                    this.writer.startTag(tag, attr, true);
                    //if (debug) {
                    //	console.log("HtmlWriter.tag(", tag, ", arg=", arg, ") => startTag(", tag, ", true)");
                    //}
                    break;
                default:
                    this.writer.startTag(tag, attr);
                    //if (debug) {
                    //	console.log("HtmlWriter.tag(", tag, ", arg=", arg, ") => startTag(", tag, ")");
                    //}
                    break;
            }
        };
        HtmlWriter.prototype.endtag = function (tag) {
            this.writer.closeTag(tag);
        };
        HtmlWriter.prototype.put = function (text) {
            this.writer.write(text);
        };
        HtmlWriter.prototype.img = function (src, attr) {
            var _attr;
            if (typeof src === 'string') {
                _attr = attr ? attr : {};
                _attr['src'] = src;
            }
            else {
                _attr = src;
            }
            this.writer.writeTag('img', null, _attr);
        };
        HtmlWriter.prototype.span = function (value, arg) { this.writeTag('span', value, arg); };
        HtmlWriter.prototype.div = function (arg) { this.tag('div', arg); };
        HtmlWriter.prototype.enddiv = function () { this.endtag('div'); };
        //public listItem(attr?: TagAttr): void { this.tag('li', attr); }
        //public endListItem(): void { this.end('li'); }
        HtmlWriter.prototype.details = function (summary, arg) {
            this.tag('details', arg);
            if (typeof summary === 'string') {
                this.writeTag('summary', summary);
            }
        };
        HtmlWriter.prototype.setClosings = function (selfClosed, tagClosing) {
            this.tagsClosings = HtmlWriter.makeTagsClosings(selfClosed, tagClosing);
        };
        HtmlWriter.defaultTagsClosings = function (selfClosed, tagClosing) {
            if (typeof tagClosing === 'undefined') {
                tagClosing = HtmlWriter.defaultTagClosing;
            }
            if (typeof selfClosed === 'undefined') {
                selfClosed = HtmlWriter.defaultSelfClosed;
            }
            HtmlWriter.defaultClosings = HtmlWriter.makeTagsClosings(selfClosed, tagClosing);
            //console.log("HtmlWriter.defaultTagsClosings():", HtmlWriter.defaultClosings);
        };
        HtmlWriter.makeTagsClosings = function (selfClosed, tagClosing) {
            var closings = {};
            if (tagClosing) {
                var tags = HtmlWriter.getTags(tagClosing);
                for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                    var tag = tags_1[_i];
                    closings[tag] = TagClosing.TagClosing;
                }
            }
            if (selfClosed) {
                var tags = HtmlWriter.getTags(selfClosed);
                for (var _a = 0, tags_2 = tags; _a < tags_2.length; _a++) {
                    var tag = tags_2[_a];
                    if (closings[tag]) {
                        console.warn("HtmlWriter.makeTagsClosings(): tag '", tag, "' present in both selfClosed and tagClosing");
                    }
                    closings[tag] = TagClosing.SelfClosed;
                }
            }
            return closings;
        };
        HtmlWriter.getTags = function (tagList) {
            if (typeof tagList === 'string') {
                var tags = [];
                var split = tagList.split(',');
                for (var _i = 0, split_2 = split; _i < split_2.length; _i++) {
                    var str = split_2[_i];
                    var subsplit = str.split(' ');
                    for (var _a = 0, subsplit_1 = subsplit; _a < subsplit_1.length; _a++) {
                        var tag = subsplit_1[_a];
                        if (tag.length > 0) {
                            tags.push(tag);
                        }
                    }
                }
                return tags;
            }
            else {
                return tagList;
            }
        };
        return HtmlWriter;
    }());
    HtmlWriter.defaultSelfClosed = null; //"i,b,u,s";
    HtmlWriter.defaultTagClosing = "div";
    Sandbox.HtmlWriter = HtmlWriter;
    ;
    var TagWriter = (function (_super) {
        __extends(TagWriter, _super);
        function TagWriter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TagWriter.prototype.writeTag = function (tag, value, attr) {
            var text;
            if (typeof value === 'string') {
                text = this.formatTag(tag, attr);
                text += value;
                text += this.getCloser(tag);
            }
            else {
                text = this.formatTag(tag, attr, true);
            }
            this.write(text);
            this.endLine();
        };
        TagWriter.prototype.startTag = function (tag, attr, closed) {
            if (!tag) {
                console.error("IndentedTags.startLevel() no tag: ", tag);
                return;
            }
            var text;
            if (typeof attr === 'undefined' && tag.charAt(0) === '<') {
                text = tag;
                var end = text.indexOf('>');
                if (end < 0) {
                    console.warn("IndentedTags.startLevel() unclosed tag :", tag);
                    end = text.length;
                }
                var tagEnd = text.indexOf(' ');
                if (tagEnd > 0 && tagEnd < end) {
                    tag = text.substring(1, tagEnd);
                }
                else {
                    tag = text.substring(1, end);
                }
            }
            else {
                text = this.formatTag(tag, attr, closed);
            }
            this.write(text, !this.atStart);
            if (!closed) {
                this.newLevel(tag);
            }
        };
        TagWriter.prototype.closeTag = function (tag) {
            var startTag = this.endLevel();
            if (tag && tag !== startTag) {
                console.warn("IndentedTags() closing wrong tag: tag=", tag, 'startTag=', closed);
            }
            var closer = this.getCloser(startTag);
            this.write(closer, true);
        };
        TagWriter.prototype.getCloser = function (tag, eol) {
            if (eol === void 0) { eol = true; }
            return '</' + tag + '>' + (eol ? '\n' : '');
        };
        TagWriter.prototype.formatTag = function (tag, attr, closed) {
            var _text;
            var _attr;
            if (typeof attr === 'string') {
                _attr = attr;
            }
            else if (attr) {
                _attr = "";
                var properties = Object.getOwnPropertyNames(attr);
                for (var _i = 0, properties_2 = properties; _i < properties_2.length; _i++) {
                    var prop = properties_2[_i];
                    var value = attr[prop];
                    if (_attr)
                        _attr += ' ';
                    if (value !== null && value !== 'undefined') {
                        _attr += prop + "=\"" + value.toString() + "\"";
                    }
                    else {
                        _attr += "" + prop;
                    }
                }
            }
            else {
                _attr = "";
            }
            var text = '<' + tag;
            if (_attr.length > 0) {
                text += ' ' + _attr;
            }
            if (closed) {
                text += ' />';
            }
            else {
                text += '>';
            }
            return text;
        };
        return TagWriter;
    }(Sandbox.IndentedText));
    Sandbox.TagWriter = TagWriter;
    ;
})(Sandbox || (Sandbox = {}));
//# sourceMappingURL=HtmlWriter.js.map