beforeEach(function () {
    function nodeToString(node) {
        return new XMLSerializer().serializeToString(node);
    }

    function findDifference(actual, expected) {
        if(actual.isEqualNode(expected)) {
            return null;
        }

        var properties = ['nodeType', 'nodeName', 'localName', 'namespaceURI', 'prefix', 'nodeValue'];
        for(var j = 0; j < properties.length; j++) {
            var property = properties[j];
            if(actual[property] != expected[property]) {
                return property + ' is different';
            }
        }

        if(nodeToString(actual) != nodeToString(expected)) {
            return 'string repr different';
        }

        if(actual.hasChildNodes()) {
            if(actual.childNodes.length != expected.childNodes.length) {
                return 'Different number of children';
            }

            for(var i = 0; i < actual.childNodes.length; i++) {
                var childA = actual.childNodes[i];
                var childB = expected.childNodes[i];
                var diff = findDifference(childA, childB);
                if(diff != null) {
                    return diff;
                }
            }
        }

        return 'just different: ' + nodeToString(actual);
    }

    this.addMatchers({
        toEqualNode: function (expected) {
            this.message = function () {
                var difference = findDifference(this.actual, expected);
                var extra = ' (no idea where)';
                if(difference) {
                    extra = ' (' + difference + ')';
                }
                return [
                    "Expected node " + nodeToString(this.actual) + " to equal node " + nodeToString(expected) + extra,
                    "Expected node " + nodeToString(this.actual) + " not to equal node " + nodeToString(expected)
                ];
            };
            return this.actual.isEqualNode(expected);
        }
    });
});
