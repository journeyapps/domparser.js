import { XMLError, errorFromParser } from './XMLError';

import * as sax from 'sax';
import * as native from './xmldom';
import { XMLElement } from './XMLElement';
import { XMLDocument } from './XMLDocument';

function getMatch(re: RegExp, pos: number, str: string) {
  var match = re.exec(str);
  if (match) {
    return match[pos];
  } else {
    return null;
  }
}

function errorFromMessage(message: string) {
  var msg = message.split('\n')[0];
  var line = parseInt(getMatch(/Line: (\d+)/, 1, message), 10);
  var column = parseInt(getMatch(/Column: (\d+)/, 1, message), 10);
  return new XMLError(msg, { line: line, column: column });
}

export interface DOMParserOptions {
  implementation: DOMImplementation;
}

export class DOMParser implements globalThis.DOMParser {
  private options: DOMParserOptions;

  constructor(options?: Partial<DOMParserOptions>) {
    this.options = (options || {}) as DOMParserOptions;
    if (!this.options.implementation) {
      this.options.implementation = native.implementation;
    }
  }

  parseFromString(source: string): XMLDocument {
    function getPosition(index: number) {
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

    const parser = sax.parser(true, { xmlns: true });
    let errors: XMLError[] = [];
    let doc = this.options.implementation.createDocument(
      null,
      null,
      null
    ) as XMLDocument;
    let current: Node = doc;

    // Events we ignore:
    //   Not present in the documents we're interested in:
    //    'sgmldeclaration', 'doctype', 'script'
    //   Already included in the data of other events:
    //    'attribute', 'opencdata', 'closecdata', 'opennamespace', 'closenamespace'
    //   What does it do?
    //    'ready'

    function addUnlessDuplicate(error: XMLError) {
      // Heuristics to filter out duplicates.
      // Would be better to improve the behavior in the SAX parser.
      const previous = errors[errors.length - 1];

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
      var element = doc.createElementNS(node.uri, node.name) as XMLElement;
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
      let currentElement = current as XMLElement;
      currentElement.closeStart = getPosition(parser.startTagPosition - 1);
      currentElement.closeEnd = { line: parser.line, column: parser.column };

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

    try {
      parser.write(source).close();
    } catch (err) {
      addUnlessDuplicate(errorFromMessage(err.message));
    }

    doc.errors = errors;
    return doc;
  }
}
