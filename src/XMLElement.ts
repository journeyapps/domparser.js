import { XMLAttributePosition } from './XMLAttributePosition';
import { XMLDocument } from './XMLDocument';
import { XMLAttribute } from './XMLAttribute';
import { XMLNode } from './XMLNode';
import { IterableNodeList } from './IterableNodeList';

// We cannot extend from both XMLNode and Element (type conflicts), so we & the types instead.
export type XMLElement = XMLElementInternal & Element;

interface XMLElementInternal extends XMLNode {
  // Specializing the standard properties
  getAttributeNode(name: string): XMLAttribute | null;
  getAttributeNodeNS(
    namespaceURI: string,
    localName: string
  ): XMLAttribute | null;

  ownerDocument: XMLDocument;

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
