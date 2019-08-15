import { XMLError } from './XMLError';

export interface XMLDocument extends Document {
  errors: XMLError[];
}
