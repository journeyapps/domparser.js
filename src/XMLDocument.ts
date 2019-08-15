import { XMLError } from './XMLError';
import { XMLElement } from './XMLElement';

export interface XMLDocument extends Document {
  errors: XMLError[];
  xmlVersion: string;

  getElementsByTagName(qualifiedName: string): HTMLCollectionOf<XMLElement>;
}
