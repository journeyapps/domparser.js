import { PositionTracker } from '../src/PositionTracker';

const sampleDoc = `
Line 1

^ Blank line above
 `;

// While this does not test any of our own code, it describes how we expect the SAX parser to behave.
describe('PositionTracker', function() {
  it('should calculate the correct positions', function() {
    const tracker = new PositionTracker(sampleDoc);
    for (let i = 0; i <= sampleDoc.length + 5; i++) {
      const p1 = tracker.getPosition(i);
      const p2 = tracker.getPositionSlow(i);

      expect(p1).toEqual(p2);
    }
  });
});
