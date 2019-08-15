const sax = require('sax');

// While this does not test any of our own code, it describes how we expect the SAX parser to behave.
describe('sax', function() {
  function saxErrors(source) {
    var parser = sax.parser(true);
    var errors = [];
    var end;
    parser.onerror = function(e) {
      errors.push(e.message);
    };
    parser.onend = function() {
      end = true;
    };
    parser.write(source).close();
    expect(end).toBe(true);
    return errors;
  }

  it('should parse the sample document', function() {
    var parser = sax.parser(true);
    var end = false;
    var errors = [];

    parser.onerror = function(e) {
      errors.push(e.message);
    };
    parser.ontext = function(t) {
      // got some text.  t is the string of text.
    };
    parser.onopentag = function(node) {
      // opened a tag.  node has "name" and "attributes"
    };
    parser.onattribute = function(attr) {
      // an attribute.  attr has "name" and "value"
    };
    parser.onend = function() {
      end = true;
    };

    parser.write('<xml>Hello, <who name="world">world</who>!</xml>').close();
    expect(end).toBe(true);
    expect(errors).toEqual([]);
  });

  it('should report an error when there is no closing tag', function() {
    var errors = saxErrors('<xml>');
    expect(errors).toEqual(['Unclosed root tag\nLine: 0\nColumn: 5\nChar: ']);
  });

  it('should report an error when there is an unclosed comment', function() {
    var errors = saxErrors('<xml><!--');
    expect(errors[1]).toEqual('Unexpected end\nLine: 0\nColumn: 9\nChar: ');
  });

  it('should report an error when there is an unquoted attribute', function() {
    // This one throws an exception where the others use the callback to report the error
    expect(function() {
      var errors = saxErrors('<xml attr=test></xml>');
    }).toThrow(
      new Error('Unquoted attribute value\nLine: 0\nColumn: 11\nChar: t')
    );
  });
});
