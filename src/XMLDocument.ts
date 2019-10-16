import { XMLError } from './XMLError';
import { XMLElement } from './XMLElement';
import { XMLLocator } from './XMLLocator';
import { XMLNode, XMLCharacterNode } from './XMLNode';
import { IterableNodeList } from './IterableNodeList';

/**
 * A Document extended with:
 * 1. Parse errors.
 * 2. Positional info.
 */
export interface XMLDocument extends XMLNode {
  documentElement: XMLElement;

  errors?: XMLError[];
  xmlVersion?: string;
  locator?: XMLLocator;

  readonly parentNode: XMLNode | null;

  getElementsByTagName(qualifiedName: string): IterableNodeList<XMLElement>;

  /**
   * Returns a CDATASection node whose data is data.
   */
  createCDATASection(data: string): XMLCharacterNode;
  /**
   * Creates a comment object with the specified data.
   * @param data Sets the comment object's data.
   */
  createComment(data: string): XMLCharacterNode;

  /**
   * Creates a text string from the specified value.
   * @param data String that specifies the nodeValue property of the text node.
   */
  createTextNode(data: string): XMLCharacterNode;

  /**
   * Returns a ProcessingInstruction node whose target is target and data is data.
   * If target does not match the Name production an
   * "InvalidCharacterError" DOMException will be thrown.
   * If data contains "?>" an
   * "InvalidCharacterError" DOMException will be thrown.
   */
  createProcessingInstruction(
    target: string,
    data: string
  ): XMLNode & ProcessingInstruction;
  /**
   * Creates an instance of the element for the specified tag.
   * @param tagName The name of an element.
   */
  createElement(tagName: string): XMLElement;

  createElementNS(
    namespaceURI: string | null,
    qualifiedName: string,
    options?: ElementCreationOptions
  ): XMLElement;
  createElementNS(
    namespace: string | null,
    qualifiedName: string,
    options?: ElementCreationOptions
  ): XMLElement;
}
