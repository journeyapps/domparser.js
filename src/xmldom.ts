let ourDOMParser: typeof DOMParser;
let ourXMLSerializer: typeof XMLSerializer;
let implementation: DOMImplementation;

if (typeof window != 'undefined') {
  (implementation = document.implementation),
    (ourDOMParser = DOMParser),
    (XMLSerializer = XMLSerializer);
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

function isElement(e: Node): e is Element {
  return e.nodeType == 1;
}

export function isEqualNode(a: Node, b: Node) {
  // https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode
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
      return 'Different number of children';
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
