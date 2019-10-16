import { XMLNode } from './XMLNode';
import { XMLElement } from './XMLElement';
import { DOMImplementation, DOMParser as DOMParserInterface } from './DOMParser';
import { XMLSerializer as XMLSerializerInterface } from './XMLSerializer';

let ourDOMParser: typeof DOMParserInterface;
let ourXMLSerializer: typeof XMLSerializerInterface;
let implementation: DOMImplementation;

if (typeof document != 'undefined') {
  implementation = document.implementation as DOMImplementation;
  ourDOMParser = DOMParser as typeof DOMParserInterface;
  ourXMLSerializer = XMLSerializer;
} else {
  // @ts-ignore
  const xmldom = require('xmldom');
  implementation = new xmldom.DOMImplementation();

  ourDOMParser = xmldom.DOMParser;
  ourXMLSerializer = xmldom.XMLSerializer;
}

export {
  implementation,
  ourDOMParser as DOMParser,
  ourXMLSerializer as XMLSerializer
};

function same(attr1?: string, attr2?: string) {
  if (attr1 == null) {
    attr1 = '';
  }
  if (attr2 == null) {
    attr2 = '';
  }
  return attr1 == attr2;
}

function isElement(e: XMLNode): e is XMLElement {
  return e.nodeType == 1;
}

/**
 * Custom implementation of https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode
 *
 * xmldom only implements DOM level 2, which doesn't contain this function.
 */
export function isEqualNode(a: XMLNode, b: XMLNode): boolean {
  if (typeof a.isEqualNode == 'function') {
    // Use the native version when available
    return a.isEqualNode(b);
  }
  if (b.nodeType != a.nodeType) {
    return false;
  }
  if (!same(b.nodeName, a.nodeName)) {
    return false;
  }
  if (!same(b.namespaceURI, a.namespaceURI)) {
    return false;
  }
  if (!same(b.nodeValue, a.nodeValue)) {
    return false;
  }

  if (a.hasChildNodes() != b.hasChildNodes()) {
    return false;
  }

  if (a.hasChildNodes()) {
    if (a.childNodes.length != b.childNodes.length) {
      return false;
    }

    for (var i = 0; i < a.childNodes.length; i++) {
      var childA = a.childNodes[i];
      var childB = b.childNodes[i];
      if (!isEqualNode(childA, childB)) {
        return false;
      }
    }
  }

  if (isElement(a) && isElement(b)) {
    if (!same(b.localName, a.localName)) {
      return false;
    }
    if (!same(b.prefix, a.prefix)) {
      return false;
    }

    if (a.attributes.length != b.attributes.length) {
      return false;
    }

    for (let i = 0; i < a.attributes.length; i++) {
      let attrA = a.attributes.item(i);
      let attrB = b.getAttribute(attrA.name);
      if (attrA.value != attrB) {
        return false;
      }
    }
  }

  return true;
}
