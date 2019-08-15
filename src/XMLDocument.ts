import { XMLError } from './XMLError';
import { XMLElement } from './XMLElement';
import { XMLLocator } from './XMLLocator';

export interface XMLDocument extends Document {
  errors: XMLError[];
  xmlVersion: string;
  locator: XMLLocator;

  getElementsByTagName(qualifiedName: string): HTMLCollectionOf<XMLElement>;
}
