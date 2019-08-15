import { XMLPosition } from './XMLPosition';

export class XMLLocator {
  source: string;
  cumulative: number[];

  constructor(source: string) {
    this.source = source;

    const lines = this.source.split('\n').map(line => line.length + 1);
    this.cumulative = cumulative(lines);
  }

  /**
   * From a source index, return line and column numbers, 0-based.
   */
  position(index: number): XMLPosition {
    return this.getPositionBisect(index);
  }

  /**
   * Search for a position using a binary search.
   *
   * Performance is O(log(L)), where L is the number of lines in the source.
   */
  getPositionBisect(index: number) {
    if (index >= this.cumulative[this.cumulative.length - 1]) {
      return { line: this.cumulative.length - 1, column: 0 };
    }
    const line = bisectRight(this.cumulative, index) - 1;
    if (line < 0) {
      return { line: 0, column: 0 };
    }
    return { line: line, column: index - this.cumulative[line] };
  }

  /**
   * Naive implementation to use as a reference.
   *
   * Performance is O(N), where N is the number of characters in the source.
   */
  getPositionSlow(index: number): XMLPosition {
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

function cumulative(numbers: number[]) {
  let sum = 0;
  let result = [0];
  for (let n of numbers) {
    sum += n;
    result.push(sum);
  }
  return result;
}

/**
 * Binary search, based on Python's bisect.bisect_right.
 *
 * Returns an index i such that ar[:i] <= val and ar[i:] > val
 *
 * @param ar - sorted array
 * @param val - value to search for in ar
 */
function bisectRight<T>(ar: T[], val: T): number {
  let a = 0;
  let b = ar.length - 1;
  while (b > a) {
    const guess = (a + b) >> 1;

    if (val >= ar[guess]) {
      a = guess + 1;
    } else {
      b = guess;
    }
  }

  return a;
}
