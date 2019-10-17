import { XMLNode } from './XMLNode';

export interface IterableNodeList<T extends XMLNode = XMLNode> {
  readonly length: number;
  item(index: number): T;
  [index: number]: T;

  forEach?: any;
}
