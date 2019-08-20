import { XMLElement } from './XMLElement';

export interface XMLAttribute extends Attr {
  readonly ownerElement: XMLElement | null;
}
