(function(domparser) {

    function DOMParser() {
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
                current.appendChild(doc.createTextNode(t));
            }
        };

        parser.onopentag = function (node) {
            var element = doc.createElementNS(node.uri, node.name);
            element.line = parser.line + 1;
            element.column = parser.column;
            // We have: parser.line, parser.column, parser.position, parser.startTagPosition
            for(var key in node.attributes) {
                var attr = node.attributes[key];
                element.setAttributeNS(attr.uri, attr.name, attr.value);
            }
            current.appendChild(element);
            current = element;
        };

        parser.onclosetag = function() {
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

        this.parseFromString = function(source) {
            parser.write(source).close();
            if(!end) {
                throw new Error('Failed to finish parsing');
            }
            return doc;
        };
    }

    domparser.DOMParser = DOMParser;
})(domparser = {});
