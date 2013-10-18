(function(domparser) {

    function XMLError(message, position) {
        this.message = message;
        this.line = position.line;
        this.column = position.column;
    }

    function errorFromParser(error, parser) {
        // The message is on the first line
        // We could parse the position from the message, but it's easier to get it from the parser
        return new XMLError(error.message.split('\n')[0], parser);
    }

    function getMatch(re, pos, str) {
        var match = re.exec(str);
        if(match) {
            return match[pos];
        } else {
            return null;
        }
    }

    function errorFromMessage(message) {
        var msg = message.split('\n')[0];
        var line = parseInt(getMatch(/Line: (\d+)/, 1, message), 10);
        var column = parseInt(getMatch(/Column: (\d+)/, 1, message), 10);
        return new XMLError(msg, {line: line, column: column});
    }



    function Locator(source) {
        var linePositions = [-1];

        for(var i = 0; i < source.length; i++) {
            if(source[i] == '\n') {
                linePositions.push(i);
            }
        }

        linePositions.push(source.length);

        function bisectLeft(array, searchElement) {
            var low = 0;
            var high = array.length;

            while (high > low) {
                var guess = (low + high) / 2 | 0;

                if(searchElement > array[guess]) {
                    low = guess + 1;
                } else {
                    high = guess;
                }
            }

            return low;
        }

        this.position = function(index) {
            if(index > source.length) {
                return {line: linePositions.length - 1, column: 0};
            } else if(index < 0) {
                return {line: 0, column: 0};
            }

            var line = bisectLeft(linePositions, index) - 1;
            var col = index - linePositions[line] - 1;

            return {
                line: line,
                column: col
            };
        };
    }

    function DOMParser(options) {
        options = options || {};
        var trackPosition = options.position !== false;

        this.parseFromString = function(source) {
            var parser = sax.parser(true, {xmlns: true, position: trackPosition});
            var errors = [];
            var doc = document.implementation.createDocument(null, null, null);
            var current = doc;

            if(trackPosition) {
                doc.locator = new Locator(source);
            }

            // Events we ignore:
            //   Not present in the documents we're interested in:
            //    'sgmldeclaration', 'doctype', 'script'
            //   Already included in the data of other events:
            //    'attribute', 'opencdata', 'closecdata', 'opennamespace', 'closenamespace'
            //   We're working with strings, not streams:
            //    'ready', 'end'

            function addUnlessDuplicate(error) {
                // Heuristics to filter out duplicates.
                // Would be better to improve the behavior in the SAX parser.
                var previous = errors[errors.length - 1];

                if(previous && previous.line == error.line && previous.column == error.column) {
                    // We expect the last message to be more informative - drop the previous message
                    errors.pop();
                    errors.push(error);
                } else if(previous && previous.message == error.message && previous.line == error.line) {
                    // Ignore, even if the columns are different
                    // Typically the first error will have the most accurate column
                } else {
                    errors.push(error);
                }
            }
            parser.onerror = function (e) {
                var error = errorFromParser(e, parser);
                addUnlessDuplicate(error);
            };

            parser.ontext = function (t) {
                if(current && current != doc) {
                    var node = doc.createTextNode(t);
                    current.appendChild(node);
                }
            };

            parser.onopentag = function (node) {
                var element = doc.createElementNS(node.uri, node.name);
                if(trackPosition) {
                    element.openStart = parser.startTagPosition - 1;
                    element.nameStart = element.openStart + 1;
                    element.nameEnd = element.nameStart + node.name.length;
                    element.openEnd = parser.position;
                    element.attributePositions = {};
                }

                try {
                for(var key in node.attributes) {
                    var attr = node.attributes[key];
                    if(attr.local === '') {
                        // This happens for the attribute `xmlns="http://www.w3.org/2001/XMLSchema"`:
                        // {name: 'xmlns', value: 'http://www.w3.org/2001/XMLSchema', prefix: 'xmlns', local: '', uri: 'http://www.w3.org/2000/xmlns/'
                        // While doc.createAttributeNS works for this case in Firefox and Chrome, it fails in PhantomJS.
                        // It's ok to simply not record positioning info in this case.
                        element.setAttributeNS(attr.uri, attr.name, attr.value);
                    } else {
                        var attribute = doc.createAttributeNS(attr.uri, attr.name);
                        attribute.value = attr.value;
                        if(trackPosition) {
                            var position = {
                                start: attr.start - 1,
                                end: attr.end
                            };
                            position.nameEnd = position.start + (attr.name == null ? 0 : attr.name.length);
                            position.valueStart = position.nameEnd + 1; // NOT always correct
                            element.attributePositions[attr.name] = position;
                        }
                        element.setAttributeNodeNS(attribute);
                    }
                }
                current.appendChild(element);
                current = element;
                } catch(err) {
                    console.error(err);
                }
            };

            parser.onclosetag = function() {
                if(trackPosition) {
                    current.closeStart = parser.startTagPosition - 1;
                    current.closeEnd = parser.position;
                }

                current = current.parentNode;
            };

            parser.onprocessinginstruction = function(instruction) {
                var node = doc.createProcessingInstruction(instruction.name, instruction.body);
                doc.appendChild(node);
            };

            parser.oncdata = function(cdata) {
                current.appendChild(doc.createCDATASection(cdata));
            };

            parser.oncomment = function(comment) {
                current.appendChild(doc.createComment(comment));
            };

            try {
                parser.write(source).close();
            } catch(err) {
                addUnlessDuplicate(errorFromMessage(err.message));
            }

            doc.errors = errors;
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
    domparser.Locator = Locator;
})(domparser = {});
