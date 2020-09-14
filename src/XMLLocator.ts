import { XMLPosition } from './XMLPosition';

export class XMLLocator {
  private cumulative: number[];

  constructor(source: string) {
    if (source == null) {
      throw new Error('source is required');
    }

    const lines = source.split('\n').map((line) => line.length + 1);
    this.cumulative = cumulative(lines);
  }

  /**
   * From a source index, return line and column numbers, 0-based.
   *
   * Search for a position using a binary search.
   *
   * Performance is O(log(L)), where L is the number of lines in the source.
   */
  position(index: number): XMLPosition {
    if (index >= this.cumulative[this.cumulative.length - 1]) {
      return { line: this.cumulative.length - 1, column: 0 };
    }
    const line = bisectRight(this.cumulative, index) - 1;
    if (line < 0) {
      return { line: 0, column: 0 };
    }
    return { line: line, column: index - this.cumulative[line] };
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
