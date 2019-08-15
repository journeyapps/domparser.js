import { XMLPosition } from './XMLPosition';
import { XMLAttributePosition } from './XMLAttributePosition';

export interface XMLElement extends Element {
  openStart?: number;
  openEnd?: number;
  closeStart?: number;
  closeEnd?: number;
  nameStart?: number;
  nameEnd?: number;
  attributePositions?: { [key: string]: XMLAttributePosition };
}
