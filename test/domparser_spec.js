describe('DOMParser', function() {
    var DOMParser = domparser.DOMParser;

    function testReadWrite(source) {
        var doc = new DOMParser().parseFromString(source);
        var serialized = new XMLSerializer().serializeToString(doc);
        expect(serialized).toEqual(source);
        testSameDOM(source);
    }

    function testSameDOM(source) {
        var ours = new DOMParser().parseFromString(source);
        var browser = new window.DOMParser().parseFromString(source, 'text/xml');

        // We only test from the room element down, not the document itself. The built-in DOMParser tends to interpret
        // the processing instructions, while we just include it in the DOM.
        // For now it's good enough if the processing instructions are just included in the output XML again (tested
        // elsewhere).
        expect(ours.documentElement).toEqualNode(browser.documentElement);
        expect(ours.xmlVersion).toEqual(browser.xmlVersion);
    }

    it('should parse the sample document', function() {
        testReadWrite('<xml>Hello, <who name="world">world</who>!<br/></xml>');
    });

    it('should preserve the xml processing instructions', function() {
        testReadWrite('<?xml version="1.0"?><xml>Hello<test>me</test></xml>');
        testReadWrite('<?xml version="1.0" encoding="UTF-8"?><xml>Hello<test>me</test></xml>');
    });

    it('should preserve namespaces', function() {
        testReadWrite('<?xml version="1.0"?><schema xmlns="http://www.w3.org/2001/XMLSchema" xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="unqualified"><simpleType name="name"/></schema>');
        testReadWrite('<?xml version="1.0"?><schema xmlns="http://www.w3.org/2001/XMLSchema" elementFormDefault="unqualified"><simpleType name="name"/></schema>');
        testReadWrite('<?xml version="1.0"?><xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="unqualified"><simpleType name="name"/></xs:schema>');
        testReadWrite('<?xml version="1.0"?><xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:example="http://example.org" elementFormDefault="unqualified"><xs:simpleType example:name="name"/></xs:schema>');
    });

    it('should preserve newlines in the document', function() {
        testReadWrite('<xml>Hel\nlo, \n<who name="world">world\n</who>\n!<br/></xml>');
    });

    it('should preserve entities', function() {
        testReadWrite('<xml>Hello, &lt;yes&gt;</xml>');
    });

    it('should preserve CDATA', function() {
        testReadWrite('<xml> <![CDATA[ SOME \n<DATA>\n]]> !</xml>');
    });

    it('should preserve comments', function() {
        testReadWrite('<xml><!-- a comment --></xml>');
    });


    it('should record line and column of elements', function() {
        var doc = new DOMParser().parseFromString('<?xml version="1.0"?>\n<test>\n<me><b /></me></test>');

        var elm = doc.getElementsByTagName('b')[0];
        expect('line ' + elm.line).toBe('line 3');
        expect('column ' + elm.column).toBe('column 9');

        var elm2 = doc.getElementsByTagName('me')[0];
        expect('line ' + elm2.line).toBe('line 3');
        expect('column ' + elm2.column).toBe('column 4');
    });

});
