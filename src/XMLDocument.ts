import { XMLError } from './XMLError';
import { XMLElement } from './XMLElement';
import { XMLLocator } from './XMLLocator';
import { XMLNode, XMLCharacterNode } from './XMLNode';
import { IterableNodeList } from './IterableNodeList';
import { DOMImplementation } from './DOMImplementation';

/**
 * A Document extended with:
 * 1. Parse errors.
 * 2. Positional info.
 */
export interface XMLDocument extends XMLNode {
  documentElement: XMLElement;

  implementation: DOMImplementation;

  errors?: XMLError[];
  xmlVersion?: string;
  locator?: XMLLocator;

  readonly parentNode: XMLNode | null;

  getElementsByTagName(qualifiedName: string): IterableNodeList<XMLElement>;
  /**
   * Returns a reference to the first object with the specified value of the ID or NAME attribute.
   * @param elementId String that specifies the ID value. Case-insensitive.
   */
  getElementById(elementId: string): XMLElement | null;

  /**
   * Gets a collection of objects based on the value of the NAME or ID attribute.
   * @param elementName Gets a collection of objects based on the value of the NAME or ID attribute.
   */
  getElementsByName(elementName: string): IterableNodeList<XMLElement>;
  /**
   * Retrieves a collection of objects based on the specified element name.
   * @param name Specifies the name of an element.
   */
  getElementsByTagName(qualifiedName: string): IterableNodeList<XMLElement>;

  getElementsByTagNameNS(namespaceURI: string, localName: string): IterableNodeList<XMLElement>;

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
