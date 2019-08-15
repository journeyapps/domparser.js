const sax = require('sax');
const native = require('./lib/xmldom');

function XMLError(message, position) {
  if (typeof message == 'string') {
    this.message = message;
    this.line = position.line;
    this.column = position.column;
  } else {
    this.message = message.message;
    this.line = message.line;
    this.column = message.column;
  }
}

function errorFromParser(error, parser) {
  // The message is on the first line
  // We could parse the position from the message, but it's easier to get it from the parser
  return new XMLError(error.message.split('\n')[0], parser);
}

function getMatch(re, pos, str) {
  var match = re.exec(str);
  if (match) {
    return match[pos];
  } else {
    return null;
  }
}

function errorFromMessage(message) {
  var msg = message.split('\n')[0];
  var line = parseInt(getMatch(/Line: (\d+)/, 1, message), 10);
  var column = parseInt(getMatch(/Column: (\d+)/, 1, message), 10);
  return new XMLError(msg, { line: line, column: column });
}

function DOMParser(options) {
  options = options || {};
  if (!options.implementation) {
    options.implementation = native.implementation;
  }
  this.parseFromString = function(source) {
    function getPosition(index) {
      // Very inefficient, but can be optimized later.

      var line = 0;
      var col = 0;
      for (var i = 0; i < index; i++) {
        var ch = source[i];
        if (ch == '\n') {
          line += 1;
          col = 0;
        } else {
          col += 1;
        }
      }
      return {
        line: line,
        column: col
      };
    }

    var parser = sax.parser(true, { xmlns: true });
    var errors = [];
    var doc = options.implementation.createDocument(null, null, null);
    var current = doc;

    // Events we ignore:
    //   Not present in the documents we're interested in:
    //    'sgmldeclaration', 'doctype', 'script'
    //   Already included in the data of other events:
    //    'attribute', 'opencdata', 'closecdata', 'opennamespace', 'closenamespace'
    //   What does it do?
    //    'ready'

    function addUnlessDuplicate(error) {
      // Heuristics to filter out duplicates.
      // Would be better to improve the behavior in the SAX parser.
      var previous = errors[errors.length - 1];

      if (
        previous &&
        previous.line == error.line &&
        previous.column == error.column
      ) {
        // We expect the last message to be more informative - drop the previous message
        errors.pop();
        errors.push(error);
      } else if (
        previous &&
        previous.message == error.message &&
        previous.line == error.line
      ) {
        // Ignore, even if the columns are different
        // Typically the first error will have the most accurate column
      } else {
        errors.push(error);
      }
    }
    parser.onerror = function(e) {
      var error = errorFromParser(e, parser);
      addUnlessDuplicate(error);
    };

    parser.ontext = function(t) {
      if (current && current != doc) {
        var node = doc.createTextNode(t);
        current.appendChild(node);
      }
    };

    parser.onopentag = function(node) {
      var element = doc.createElementNS(node.uri, node.name);
      element.openStart = getPosition(parser.startTagPosition - 1);
      element.openEnd = { line: parser.line, column: parser.column };

      // We have: parser.line, parser.column, parser.position, parser.startTagPosition
      for (var key in node.attributes) {
        var attr = node.attributes[key];
        element.setAttributeNS(attr.uri, attr.name, attr.value);
      }
      current.appendChild(element);
      current = element;
    };

    parser.onclosetag = function() {
      current.closeStart = getPosition(parser.startTagPosition - 1);
      current.closeEnd = { line: parser.line, column: parser.column };

      current = current.parentNode;
    };

    parser.onprocessinginstruction = function(instruction) {
      var node = doc.createProcessingInstruction(
        instruction.name,
        instruction.body
      );
      doc.appendChild(node);
    };

    parser.onattribute = function(attr) {
      // We handle attributes inside onopentag
    };

    parser.oncdata = function(cdata) {
      current.appendChild(doc.createCDATASection(cdata));
    };

    parser.oncomment = function(comment) {
      current.appendChild(doc.createComment(comment));
    };

    parser.onend = function() {
      end = true;
    };

    try {
      parser.write(source).close();
    } catch (err) {
      addUnlessDuplicate(errorFromMessage(err.message));
    }

    doc.errors = errors;
    return doc;
  };
}

function XMLSerializer() {}

function nativeSerializeToString(node) {
  return new native.XMLSerializer().serializeToString(node);
}

XMLSerializer.prototype.serializeToString = function(node) {
  // Whitespace characters between processing instructions are lost, and browsers serialize them differently.
  // We write these individually, and include newline characters in between them.
  // Note that our DOMParser is the only one that saves the processing instructions in the DOM, browsers don't do this.
  if (
    node.nodeType == node.DOCUMENT_NODE &&
    node.firstChild &&
    node.firstChild.nodeType == node.PROCESSING_INSTRUCTION_NODE
  ) {
    var children = node.childNodes;
    var result = '';
    for (var i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType == child.TEXT_NODE) {
        continue;
      }
      const part = nativeSerializeToString(children[i]);
      result += part;
      if (i != children.length - 1) {
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

exports.DOMParser = DOMParser;
exports.XMLSerializer = XMLSerializer;
exports.XMLError = XMLError;
