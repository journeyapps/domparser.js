import { XMLPosition } from './XMLPosition';
import { XMLLocator } from './XMLLocator';
import { SAXParser } from './sax';

export class XMLError implements XMLPosition {
  message: string;
  stack?: string;

  startOffset: number;
  endOffset?: number;

  private locator?: XMLLocator;

  constructor(message: string | XMLError, position: { start: number, end: number}, locator?: XMLLocator) {
    if (typeof message == 'string') {
      this.message = message;
      this.startOffset = position.start;
      this.endOffset = position.end;
    } else {
      this.message = message.message;
      this.startOffset = message.startOffset;
      this.endOffset = message.endOffset;
    }
    this.locator = locator;
  }

  get line() {
    if (this.startOffset == null) {
      return null;
    }
    return this.locator?.position(this.startOffset).line;
  }

  get column() {
    if (this.startOffset == null) {
      return null;
    }
    return this.locator?.position(this.startOffset).column;
  }

  get startPosition() {
    return this.locator?.position(this.startOffset);
  }

  get endPosition() {
    return this.locator?.position(this.endOffset);
  }
}

export function errorFromParser(error: any, parser: SAXParser, locator: XMLLocator) {
  // The message is on the first line
  // We could parse the position from the message, but it's easier to get it from the parser
  if (typeof error.message != 'string') {
    throw error;
  }
  const message = error.message.split('\n')[0];
  if (message == 'Attribute without value') {
    return new XMLError(message, { start: parser.startAttributePosition - 1, end: parser.startAttributePosition + (parser.attribName?.length ?? 1) - 1 }, locator)
  } else if (message == 'Unexpected close tag' || /^Unmatched closing tag/.test(message)) {
    return new XMLError(message, { start: parser.startTagPosition - 1, end: parser.position }, locator)
  }
  return new XMLError(message, { start: parser.position - 1, end: parser.position}, locator);
}
