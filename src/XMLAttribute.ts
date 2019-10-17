import { XMLElement } from './XMLElement';
import { XMLNode } from './XMLNode';

export interface XMLAttribute extends XMLNode {
  readonly ownerElement: XMLElement | null;
  readonly localName: string;
  readonly name: string;
  readonly namespaceURI: string | null;
  readonly prefix: string | null;
  readonly specified: boolean;
  value: string;
}
