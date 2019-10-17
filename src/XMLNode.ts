import { XMLElement } from './XMLElement';
import { XMLDocument } from './XMLDocument';
import { IterableNodeList } from './IterableNodeList';

export const ELEMENT_NODE = 1;
export const ATTRIBUTE_NODE = 2;
export const TEXT_NODE = 3;
export const CDATA_SECTION_NODE = 4;
export const ENTITY_REFERENCE_NODE = 5;
export const ENTITY_NODE = 6;
export const PROCESSING_INSTRUCTION_NODE = 7;
export const COMMENT_NODE = 8;
export const DOCUMENT_NODE = 9;
export const DOCUMENT_TYPE_NODE = 10;
export const DOCUMENT_FRAGMENT_NODE = 11;
export const NOTATION_NODE = 12;

export interface XMLNodeLike {
  readonly nodeType: number;

  readonly nodeName: string;

  nodeValue: string | null;
}

export interface XMLNode extends XMLNodeLike {
  /**
   * Returns the children.
   */
  readonly childNodes: IterableNodeList<XMLNode>;

  /**
   * Returns the first child.
   */
  readonly firstChild: XMLNode | null;

  /**
   * Returns the last child.
   */
  readonly lastChild: XMLNode | null;

  /**
   * Returns the next sibling.
   */
  readonly nextSibling: XMLNode | null;

  /**
   * Returns the node document.
   * Returns null for documents.
   */
  readonly ownerDocument: XMLDocument | null;

  /**
   * Returns the parent element.
   */
  readonly parentElement: XMLElement | null;

  /**
   * Returns the parent.
   */
  readonly parentNode: XMLNode | null;

  /**
   * Returns the previous sibling.
   */
  readonly previousSibling: XMLNode | null;

  readonly namespaceURI: string;

  textContent: string;

  /**
   * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
   */
  cloneNode(deep?: boolean): XMLNode;

  isEqualNode(other: XMLNode | any): boolean;

  hasChildNodes(): boolean;

  appendChild<T extends XMLNode>(newChild: T): T;
  insertBefore<T extends XMLNode>(newChild: T, refChild: XMLNode | null): T;
}

export interface XMLCharacterNode extends XMLNode {
  data: string;
  readonly length: number;
}
