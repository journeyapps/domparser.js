import { XMLPosition } from './XMLPosition';

export interface XMLElement extends Element {
  openStart?: XMLPosition;
  openEnd?: XMLPosition;
  closeStart?: XMLPosition;
  closeEnd?: XMLPosition;
}
