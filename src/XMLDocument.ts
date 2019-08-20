import { XMLError } from './XMLError';
import { XMLElement } from './XMLElement';
import { XMLLocator } from './XMLLocator';
import { XMLNode } from './XMLNode';

/**
 * A Document extended with:
 * 1. Parse errors.
 * 2. Positional info.
 */
export type XMLDocument = XMLNode & XMLDocumentInternal;

// We cannot extend both XMLNode and Document, so we use intersection types
interface XMLDocumentInternal extends Document {
  documentElement: XMLElement & HTMLElement;

  errors: XMLError[];
  xmlVersion: string;
  locator: XMLLocator;

  readonly parentNode: XMLNode & ParentNode | null;

  getElementsByTagName(qualifiedName: string): HTMLCollectionOf<XMLElement>;

  // Our versions of createElement and others

  /**
   * Returns a CDATASection node whose data is data.
   */
  createCDATASection(data: string): XMLNode & CDATASection;
  /**
   * Creates a comment object with the specified data.
   * @param data Sets the comment object's data.
   */
  createComment(data: string): XMLNode & Comment;

  /**
   * Creates a text string from the specified value.
   * @param data String that specifies the nodeValue property of the text node.
   */
  createTextNode(data: string): XMLNode & Text;

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

  // Overloads for interface compatibility.

  /**
   * Creates an instance of the element for the specified tag.
   * @param tagName The name of an element.
   */
  createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions
  ): HTMLElementTagNameMap[K];
  /** @deprecated */
  createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(
    tagName: K,
    options?: ElementCreationOptions
  ): HTMLElementDeprecatedTagNameMap[K];
  createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;

  createElementNS(
    namespaceURI: 'http://www.w3.org/1999/xhtml',
    qualifiedName: string
  ): HTMLElement;
  createElementNS<K extends keyof SVGElementTagNameMap>(
    namespaceURI: 'http://www.w3.org/2000/svg',
    qualifiedName: K
  ): SVGElementTagNameMap[K];
  createElementNS(
    namespaceURI: 'http://www.w3.org/2000/svg',
    qualifiedName: string
  ): SVGElement;
}
