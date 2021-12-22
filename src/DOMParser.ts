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

      if (previous && error.startOffset - previous.startOffset <= 2) {
        if (previous.message == 'Unexpected close tag') {
          // In this case, the new message is likely more informative.
          errors.pop();
          errors.push(error);
        } else {
          // Keep the previous message
        }
      } else {
        errors.push(error);
      }
    }

    parser.onerror = function (e) {
      parser.error = null; // Let the parser continue
      const error = errorFromParser(e, parser, locator);
      addUnlessDuplicate(error);
    };

    parser.ontext = function (t) {
      if (current && current != doc) {
        const node = doc.createTextNode(t);
        current.appendChild(node);
      }
    };

    let currentAttributes: Record<string, boolean> = {};

    parser.onopentagstart = function (tag) {
      currentAttributes = {};
    };

    parser.onattribute = function (attr) {
      const name = attr.name;
      if (name in currentAttributes) {
        addUnlessDuplicate(
          new XMLError(
            `Attribute '${name}' redefined.`,
            { start: attr.start - 1, end: attr.start + attr.name.length - 1 },
            locator
          )
        );
      } else {
        currentAttributes[name] = true;
      }
    };

    parser.onopentag = function (node: sax.QualifiedTag) {
      const element = doc.createElementNS(node.uri, node.name) as XMLElement;
      element.openStart = parser.startTagPosition - 1;
      element.nameStart = element.openStart + 1;
      element.nameEnd = element.nameStart + node.name.length;
      element.openEnd = parser.position;
      element.attributePositions = {};

      // We have: parser.line, parser.column, parser.position, parser.startTagPosition
      for (let key in node.attributes) {
        const attr = node.attributes[key] as sax.Attribute;
        // Attribute nodes seem to be deprecated in general.
        // doc.createAttributeNS does not work for some cases in PhantomJS, e.g.
        //   `xmlns="http://www.w3.org/2001/XMLSchema"`:
        //   {name: 'xmlns', value: 'http://www.w3.org/2001/XMLSchema', prefix: 'xmlns', local: '', uri: 'http://www.w3.org/2000/xmlns/'
        // Also, it was removed in Chrome 34.
        // Custom attributes on nodes also disappear sometimes in Chrome.
        // The solution is to store the attribute positions on the element node.
        const position: XMLAttributePosition = {
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

    parser.onclosetag = function () {
      let currentElement = current as XMLElement;
      currentElement.closeStart = parser.startTagPosition - 1;
      currentElement.closeEnd = parser.position;

      current = current.parentNode;
    };

    parser.onprocessinginstruction = function (instruction) {
      var node = doc.createProcessingInstruction(
        instruction.name,
        instruction.body
      );
      doc.appendChild(node);
    };

    parser.oncdata = function (cdata) {
      current.appendChild(doc.createCDATASection(cdata));
    };

    parser.oncomment = function (comment) {
      current.appendChild(doc.createComment(comment));
    };

    //XML needs to start with <...(root element) or <?...(prolog) but not a comment <!-...
    if (
      source != null &&
      (source.startsWith('<') !== true || source.startsWith('<!-') === true)
    ) {
      errors.push(
        new XMLError(
          'XML must start with prolong or root element.',
          { start: 0, end: 1 },
          locator
        )
      );
    }

    try {
      parser.write(source).close();
    } catch (err) {
      if (errors.length == 0) {
        errors.push(new XMLError(err.message, { start: 0, end: 5 }, locator));
      }
    }

    doc.errors = errors;
    return doc;
  }
}
