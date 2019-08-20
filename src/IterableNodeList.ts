import { XMLNode } from './XMLNode';

export interface IterableNodeList<T extends XMLNode = XMLNode>
  extends NodeListOf<T>,
    Iterable<T> {}
