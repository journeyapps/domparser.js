import { XMLPosition } from './XMLPosition';

export class XMLError implements XMLPosition {
  message: string;
  line: number;
  column: number;
  stack?: string;

  constructor(message: string | XMLError, position?: XMLPosition) {
    if (typeof message == 'string') {
      this.message = message;
      this.line = position.line;
      this.column = position.column;
    } else {
      this.message = message.message;
      this.line = message.line;
      this.column = message.column;
    }
  }
}

export function errorFromParser(error: any, parser: XMLPosition) {
  // The message is on the first line
  // We could parse the position from the message, but it's easier to get it from the parser
  if (typeof error.message != 'string') {
    throw error;
  }
  return new XMLError(error.message.split('\n')[0], parser);
}
