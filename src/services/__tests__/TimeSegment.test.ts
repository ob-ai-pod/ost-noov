import { TimeSegmentImpl } from '../TimeSegment';

describe('TimeSegment', () => {
  const now = new Date('2025-04-24T12:00:00');
  const start = new Date('2025-04-24T10:00:00');
  const end = new Date('2025-04-24T14:00:00');
  const segment = new TimeSegmentImpl('Dhuhr', start, end);

  test('calculates duration correctly', () => {
    expect(segment.getDuration()).toBe(240); // 4 hours = 240 minutes
  });

  test('calculates progress correctly', () => {
    // At start
    expect(segment.getProgress(start)).toBe(0);
    
    // At midpoint
    expect(segment.getProgress(now)).toBe(50);
    
    // At end
    expect(segment.getProgress(end)).toBe(100);
    
    // Before start
    expect(segment.getProgress(new Date('2025-04-24T09:00:00'))).toBe(0);
    
    // After end
    expect(segment.getProgress(new Date('2025-04-24T15:00:00'))).toBe(100);
  });

  test('checks if time is within segment', () => {
    // At start
    expect(segment.contains(start)).toBe(true);
    
    // At middle
    expect(segment.contains(now)).toBe(true);
    
    // At end
    expect(segment.contains(end)).toBe(true);
    
    // Before start
    expect(segment.contains(new Date('2025-04-24T09:00:00'))).toBe(false);
    
    // After end
    expect(segment.contains(new Date('2025-04-24T15:00:00'))).toBe(false);
  });
});
