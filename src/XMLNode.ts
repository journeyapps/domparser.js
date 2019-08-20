import { XMLElement } from './XMLElement';
import { XMLDocument } from './XMLDocument';
import { IterableNodeList } from './IterableNodeList';

export interface XMLNode extends Node {
  /**
   * Returns the children.
   */
  readonly childNodes: IterableNodeList<XMLNode & ChildNode>;

  /**
   * Returns the first child.
   */
  readonly firstChild: XMLNode & ChildNode | null;

  /**
   * Returns the last child.
   */
  readonly lastChild: XMLNode & ChildNode | null;

  /**
   * Returns the next sibling.
   */
  readonly nextSibling: XMLNode & ChildNode | null;

  /**
   * Returns the node document.
   * Returns null for documents.
   */
  readonly ownerDocument: XMLDocument | null;

  /**
   * Returns the parent element.
   */
  readonly parentElement: XMLElement & HTMLElement | null;

  /**
   * Returns the parent.
   */
  readonly parentNode: XMLNode & ParentNode | null;

  /**
   * Returns the previous sibling.
   */
  readonly previousSibling: XMLNode | null;

  /**
   * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
   */
  cloneNode(deep?: boolean): XMLNode;
}
