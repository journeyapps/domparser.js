import { XMLLocator } from '../src/XMLLocator';

const sampleDoc = `
Line 1

^ Blank line above
 `;

// While this does not test any of our own code, it describes how we expect the SAX parser to behave.
describe('PositionTracker', function() {
  it('should calculate the same positions as the naive implementation', function() {
    const tracker = new XMLLocator(sampleDoc);
    for (let i = 0; i <= sampleDoc.length + 5; i++) {
      const p1 = tracker.position(i);
      const p2 = tracker.getPositionSlow(i);

      expect(p1).toEqual(p2);
    }
  });

  it('should report the correct locations', function() {
    var locator = new XMLLocator('test\n1\n23');
    expect(locator.position(0)).toEqual({ line: 0, column: 0 });
    expect(locator.position(1)).toEqual({ line: 0, column: 1 });
    expect(locator.position(2)).toEqual({ line: 0, column: 2 });
    expect(locator.position(3)).toEqual({ line: 0, column: 3 });
    expect(locator.position(4)).toEqual({ line: 0, column: 4 });
    expect(locator.position(5)).toEqual({ line: 1, column: 0 });
    expect(locator.position(6)).toEqual({ line: 1, column: 1 });
    expect(locator.position(7)).toEqual({ line: 2, column: 0 });
    expect(locator.position(8)).toEqual({ line: 2, column: 1 });
    expect(locator.position(9)).toEqual({ line: 2, column: 2 });
  });

  it('should handle a single line', function() {
    var locator = new XMLLocator('test');
    expect(locator.position(0)).toEqual({ line: 0, column: 0 });
    expect(locator.position(4)).toEqual({ line: 0, column: 4 });
  });

  it('should handle an empty string', function() {
    var locator = new XMLLocator('');
    expect(locator.position(0)).toEqual({ line: 0, column: 0 });
  });

  it('should gracefully handle out-of-bound positions', function() {
    var locator = new XMLLocator('test\nmore');
    expect(locator.position(-1)).toEqual({ line: 0, column: 0 });
    expect(locator.position(50)).toEqual({ line: 2, column: 0 });
  });

  it('should handle consecutive newlines', function() {
    var locator = new XMLLocator('\n\n\n\n');
    expect(locator.position(0)).toEqual({ line: 0, column: 0 });
    expect(locator.position(1)).toEqual({ line: 1, column: 0 });
    expect(locator.position(2)).toEqual({ line: 2, column: 0 });
    expect(locator.position(3)).toEqual({ line: 3, column: 0 });
    expect(locator.position(4)).toEqual({ line: 4, column: 0 });
  });
});
