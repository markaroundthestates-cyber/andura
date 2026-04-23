import { describe, it, expect } from 'vitest';
import { weeklyProgression, detectStagnation, detectGlobalStagnation } from '../stagnationDetector.js';

// Helper: create log with specific week offset (weeks ago)
function makeLog(ex, w, reps, weeksAgo) {
  const ts = Date.now() - weeksAgo * 7 * 24 * 3600 * 1000;
  return { ex, w, reps, ts };
}

describe('weeklyProgression', () => {
  it('returns empty for no matching logs', () => {
    const result = weeklyProgression('Bench Press', []);
    expect(result).toHaveLength(0);
  });

  it('groups logs by week and calculates avg1RM', () => {
    const logs = [
      makeLog('Lat Pulldown', 60, 8, 4),
      makeLog('Lat Pulldown', 65, 8, 2),
      makeLog('Lat Pulldown', 65, 8, 0),
    ];
    const result = weeklyProgression('Lat Pulldown', logs);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].avg1RM).toBeGreaterThan(0);
  });

  it('is case-insensitive for exercise name matching', () => {
    const logs = [makeLog('lat pulldown', 60, 8, 2), makeLog('lat pulldown', 65, 8, 0)];
    const result = weeklyProgression('Lat Pulldown', logs);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('ignores logs without ts', () => {
    const logs = [{ ex: 'Lat Pulldown', w: 60, reps: 8 }]; // no ts
    const result = weeklyProgression('Lat Pulldown', logs);
    expect(result).toHaveLength(0);
  });
});

describe('detectStagnation', () => {
  it('returns 0 stagnation weeks for insufficient data', () => {
    const logs = [makeLog('Bench', 100, 8, 0)];
    const { stagnationWeeks } = detectStagnation('Bench', logs);
    expect(stagnationWeeks).toBe(0);
  });

  it('detects 0 stagnation when clearly progressing', () => {
    const logs = [
      makeLog('Cable Row', 50, 8, 3),
      makeLog('Cable Row', 60, 8, 2),
      makeLog('Cable Row', 70, 8, 1),
      makeLog('Cable Row', 80, 8, 0),
    ];
    const { stagnationWeeks } = detectStagnation('Cable Row', logs);
    expect(stagnationWeeks).toBe(0);
  });

  it('detects stagnation when 1RM stays flat', () => {
    const logs = [
      makeLog('Cable Row', 60, 8, 4),
      makeLog('Cable Row', 60, 8, 3),
      makeLog('Cable Row', 60, 8, 2),
      makeLog('Cable Row', 60, 8, 1),
      makeLog('Cable Row', 60, 8, 0),
    ];
    const { stagnationWeeks } = detectStagnation('Cable Row', logs);
    expect(stagnationWeeks).toBeGreaterThan(0);
  });

  it('returns progression array with week labels', () => {
    const logs = [makeLog('Bench', 80, 8, 2), makeLog('Bench', 82, 8, 0)];
    const { progression } = detectStagnation('Bench', logs);
    expect(Array.isArray(progression)).toBe(true);
  });
});

describe('detectGlobalStagnation', () => {
  it('returns 0 for empty logs', () => {
    const { maxStagnationWeeks } = detectGlobalStagnation([]);
    expect(maxStagnationWeeks).toBe(0);
  });

  it('finds max stagnation across all exercises', () => {
    const logs = [
      makeLog('Bench', 100, 8, 4),
      makeLog('Bench', 100, 8, 3),
      makeLog('Bench', 100, 8, 2),
      makeLog('Bench', 100, 8, 1),
      makeLog('Bench', 100, 8, 0),
      makeLog('Cable Row', 60, 8, 1),
      makeLog('Cable Row', 70, 8, 0),
    ];
    const { maxStagnationWeeks, byExercise } = detectGlobalStagnation(logs);
    expect(maxStagnationWeeks).toBeGreaterThan(0);
    expect(byExercise['Bench']).toBeGreaterThanOrEqual(byExercise['Cable Row']);
  });
});
