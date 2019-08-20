import { XMLPosition } from './XMLPosition';

export class SlowLocator {
  source: string;

  constructor(source: string) {
    this.source = source;
    if (source == null) {
      throw new Error('source is required');
    }
  }

  /**
   * From a source index, return line and column numbers, 0-based.
   */
  position(index: number): XMLPosition {
    const source = this.source;
    var line = 0;
    var col = 0;
    for (var i = 0; i < index; i++) {
      if (i == source.length) {
        return {
          line: line + 1,
          column: 0
        };
      }
      var ch = source[i];
      if (ch == '\n') {
        line += 1;
        col = 0;
      } else {
        col += 1;
      }
    }
    return {
      line: line,
      column: col
    };
  }
}
