import { XMLDocument } from './XMLDocument';
import { XMLNodeLike } from './XMLNode';

export interface DOMImplementation {
  createDocument(
    namespaceURI: string | null,
    qualifiedName: string | null,
    type?: any
  ): XMLDocument;
}

export interface XMLDOMParser {
  parseFromString(source: string, type?: string, options?: any): XMLDocument;
}

export interface XMLSerializer {
  serializeToString(anyNode: XMLNodeLike): string;
}
