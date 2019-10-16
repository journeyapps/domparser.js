import { XMLElement } from './XMLElement';
import { XMLDocument } from './XMLDocument';
import { IterableNodeList } from './IterableNodeList';

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

  readonly textContent: string;

  /**
   * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
   */
  cloneNode(deep?: boolean): XMLNode;

  isEqualNode(other: XMLNode | any): boolean;

  hasChildNodes(): boolean;

  appendChild<Q extends any>(newChild: Q): Q;
}

export interface XMLCharacterNode extends XMLNode {
  data: string;
  readonly length: number;
}
