import { XMLError, errorFromParser } from './XMLError';

import * as sax from './sax';
import * as native from './xmldom';
import { XMLElement } from './XMLElement';
import { XMLDocument } from './XMLDocument';
import { XMLLocator } from './XMLLocator';
import { XMLAttributePosition } from './XMLAttributePosition';
import { XMLNode } from './XMLNode';
import { DOMImplementation } from './DOMImplementation';

function getMatch(re: RegExp, pos: number, str: string) {
  var match = re.exec(str);
  if (match) {
    return match[pos];
  } else {
    return null;
  }
}

function errorFromMessage(message: string) {
  if (typeof message != 'string') {
    throw message;
  }
  var msg = message.split('\n')[0];
  var line = parseInt(getMatch(/Line: (\d+)/, 1, message), 10);
  var column = parseInt(getMatch(/Column: (\d+)/, 1, message), 10);
  return new XMLError(msg, { line: line, column: column });
}

export interface DOMParserOptions {
  implementation: DOMImplementation;
}

export class DOMParser {
  private options?: DOMParserOptions;

  constructor(options?: Partial<DOMParserOptions>) {
    this.options = (options || {}) as DOMParserOptions;
    if (!this.options.implementation) {
      this.options.implementation = (native.implementation as unknown) as DOMImplementation;
    }
  }

  parseFromString(
    source: string,
    _type?: 'text/html' | 'text/xml' | 'application/xml'
  ): XMLDocument {
    const locator = new XMLLocator(source);

    const parser = sax.parser(true, { xmlns: true, attributePosition: true });
    let errors: XMLError[] = [];
    let doc = this.options.implementation.createDocument(null, null, null);
    doc.locator = locator;
    let current: XMLNode = doc;

    // Events we ignore:
    //   Not present in the documents we're interested in:
    //    'sgmldeclaration', 'doctype', 'script'
    //   Already included in the data of other events:
    //    'attribute', 'opencdata', 'closecdata', 'opennamespace', 'closenamespace'
    //   We're working with strings, not streams:
    //    'ready', 'end

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

    parser.onopentag = function(node: sax.QualifiedTag) {
      var element = doc.createElementNS(node.uri, node.name) as XMLElement;
      element.openStart = parser.startTagPosition - 1;
      element.nameStart = element.openStart + 1;
      element.nameEnd = element.nameStart + node.name.length;
      element.openEnd = parser.position;
      element.attributePositions = {};

      // We have: parser.line, parser.column, parser.position, parser.startTagPosition
      for (var key in node.attributes) {
        var attr = node.attributes[key] as sax.Attribute;
        // Attribute nodes seem to be deprecated in general.
        // doc.createAttributeNS does not work for some cases in PhantomJS, e.g.
        //   `xmlns="http://www.w3.org/2001/XMLSchema"`:
        //   {name: 'xmlns', value: 'http://www.w3.org/2001/XMLSchema', prefix: 'xmlns', local: '', uri: 'http://www.w3.org/2000/xmlns/'
        // Also, it was removed in Chrome 34.
        // Custom attributes on nodes also disappear sometimes in Chrome.
        // The solution is to store the attribute positions on the element node.
        var position: XMLAttributePosition = {
          start: (attr as any).start - 1,
          end: (attr as any).end,
          nameEnd: 0,
          valueStart: 0
        };
        position.nameEnd =
          position.start + (attr.name == null ? 0 : attr.name.length);
        position.valueStart = position.nameEnd + 1; // NOT always correct
        // This does not take the URI into account
        element.attributePositions[attr.name] = position;
        element.setAttributeNS(attr.uri, attr.name || '.', attr.value);
      }
      current.appendChild(element);
      current = element;
    };

    parser.onclosetag = function() {
      let currentElement = current as XMLElement;
      currentElement.closeStart = parser.startTagPosition - 1;
      currentElement.closeEnd = parser.position;

      current = current.parentNode;
    };

    parser.onprocessinginstruction = function(instruction) {
      var node = doc.createProcessingInstruction(
        instruction.name,
        instruction.body
      );
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
    } catch (err) {
      addUnlessDuplicate(errorFromMessage(err.message));
    }

    doc.errors = errors;
    return doc;
  }
}
