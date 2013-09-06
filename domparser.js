(function(domparser) {


    function DOMParser() {
        this.parseFromString = function(source) {
            function getPosition(index) {
                // Very inefficient, but can be optimized later.

                var line = 0;
                var col = 0;
                for(var i = 0; i < index; i++) {
                    var ch = source[i];
                    if(ch == '\n') {
                        line += 1;
                        col = 0;
                    } else {
                        col += 1;
                    }
                }
                return {
                    line: line,
                    column: col
                }
            }

            var parser = sax.parser(true, {xmlns: true});
            var errors = [];
            var end = false;
            var doc = document.implementation.createDocument(null, null, null);
            var implementation = document.implementation;
            var current = doc;

            // Events we ignore:
            //   Not present in the documents we're interested in:
            //    'sgmldeclaration', 'doctype', 'script'
            //   Already included in the data of other events:
            //    'attribute', 'opencdata', 'closecdata', 'opennamespace', 'closenamespace'
            //   What does it do?
            //    'ready'

            parser.onerror = function (e) {
                errors.push(e.message);
            };
            parser.ontext = function (t) {
                if(current && current != doc) {
                    var node = doc.createTextNode(t);
                    current.appendChild(node);
                }
            };

            parser.onopentag = function (node) {
                var element = doc.createElementNS(node.uri, node.name);
                element.openStart = getPosition(parser.startTagPosition - 1);
                element.openEnd = {line: parser.line, column: parser.column};

                // We have: parser.line, parser.column, parser.position, parser.startTagPosition
                for(var key in node.attributes) {
                    var attr = node.attributes[key];
                    element.setAttributeNS(attr.uri, attr.name, attr.value);
                }
                current.appendChild(element);
                current = element;
            };

            parser.onclosetag = function() {
                current.closeStart = getPosition(parser.startTagPosition - 1);
                current.closeEnd = {line: parser.line, column: parser.column};

                current = current.parentNode;
            };

            parser.onprocessinginstruction = function(instruction) {
                var node = doc.createProcessingInstruction(instruction.name, instruction.body);
                doc.appendChild(node);
            };

            parser.onattribute = function (attr) {
                // We handle attributes inside onopentag
            };

            parser.oncdata = function(cdata) {
                current.appendChild(doc.createCDATASection(cdata));
            };

            parser.oncomment = function(comment) {
                current.appendChild(doc.createComment(comment));
            };

            parser.onend = function () {
                end = true;
            };

            parser.write(source).close();
            if(!end) {
                throw new Error('Failed to finish parsing');
            }
            return doc;
        };
    }

    function XMLSerializer() {

    }

    function nativeSerializeToString(node) {
        return new window.XMLSerializer().serializeToString(node);
    }

    XMLSerializer.prototype.serializeToString = function(node) {
        // Whitespace characters between processing instructions are lost, and browsers serialize them differently.
        // We write these individually, and include newline characters in between them.
        // Note that our DOMParser is the only one that saves the processing instructions in the DOM, browsers don't do this.
        if(node.nodeType == node.DOCUMENT_NODE && node.firstChild && node.firstChild.nodeType == node.PROCESSING_INSTRUCTION_NODE) {
            var children = node.childNodes;
            var result = '';
            for(var i = 0; i < children.length; i++) {
                result += nativeSerializeToString(children[i]);
                if(i != children.length - 1) {
                    result += '\n';
                }
            }
            return result;
        } else {
            return nativeSerializeToString(node);
        }
        // TODO: if it is a document without any processing instructions, generate one ourselves
        // Something like this: <?xml version="1.0" encoding="UTF-8"?>
    };

    domparser.DOMParser = DOMParser;
    domparser.XMLSerializer = XMLSerializer;
})(domparser = {});
