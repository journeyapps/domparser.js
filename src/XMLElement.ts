import { XMLAttributePosition } from './XMLAttributePosition';
import { XMLDocument } from './XMLDocument';
import { XMLAttribute } from './XMLAttribute';
import { XMLNode } from './XMLNode';
import { IterableNodeList } from './IterableNodeList';

export interface XMLElement extends XMLNode {
  // Specializing the standard properties
  getAttributeNode(name: string): XMLAttribute | null;
  getAttributeNodeNS(
    namespaceURI: string,
    localName: string
  ): XMLAttribute | null;
  /**
   * Sets the value of element's first attribute whose qualified name is qualifiedName to value.
   */
  setAttribute(qualifiedName: string, value: string): void;
  /**
   * Sets the value of element's attribute whose namespace is namespace and local name is localName to value.
   */
  setAttributeNS(
    namespace: string | null,
    qualifiedName: string,
    value: string
  ): void;
  setAttributeNode(attr: Attr): Attr | null;
  setAttributeNodeNS(attr: Attr): Attr | null;

  /**
   * Returns element's first attribute whose qualified name is qualifiedName, and null if there is no such attribute otherwise.
   */
  getAttribute(qualifiedName: string): string | null;
  /**
   * Returns element's attribute whose namespace is namespace and local name is localName, and null if there is no such attribute otherwise.
   */
  getAttributeNS(namespace: string | null, localName: string): string | null;

  /**
   * Returns true if element has an attribute whose qualified name is qualifiedName, and false otherwise.
   */
  hasAttribute(qualifiedName: string): boolean;
  /**
   * Returns true if element has an attribute whose namespace is namespace and local name is localName.
   */
  hasAttributeNS(namespace: string | null, localName: string): boolean;
  /**
   * Returns true if element has attributes, and false otherwise.
   */
  hasAttributes(): boolean;
  /**
   * Removes element's first attribute whose qualified name is qualifiedName.
   */
  removeAttribute(qualifiedName: string): void;
  /**
   * Removes element's attribute whose namespace is namespace and local name is localName.
   */
  removeAttributeNS(namespace: string | null, localName: string): void;
  removeAttributeNode(attr: XMLAttribute): Attr;

  ownerDocument: XMLDocument;

  readonly tagName: string;
  readonly localName: string;
  readonly prefix: string;
  readonly attributes: NamedNodeMap;

  /**
   * Returns the children.
   */
  readonly children: IterableNodeList<XMLElement>;

  // Extensions

  openStart?: number;
  openEnd?: number;
  closeStart?: number;
  closeEnd?: number;
  nameStart?: number;
  nameEnd?: number;
  attributePositions?: { [key: string]: XMLAttributePosition };
}

interface NamedNodeMap<T = XMLAttribute> {
  readonly length: number;
  getNamedItem(qualifiedName: string): T | null;
  getNamedItemNS(namespace: string | null, localName: string): T | null;
  item(index: number): T | null;
  removeNamedItem(qualifiedName: string): T;
  removeNamedItemNS(namespace: string | null, localName: string): T;
  setNamedItem(attr: T): T | null;
  setNamedItemNS(attr: T): T | null;
  [index: number]: T;
}
