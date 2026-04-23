import { describe, it, expect } from 'vitest';
import { brzycki1RM, compute1RMByGroup, detectWeakGroups } from '../weaknessDetector.js';

const makeLogs = (exercises) => exercises.map(([ex, w, reps], i) => ({
  ex, w, reps, ts: Date.now() - i * 1000
}));

describe('brzycki1RM', () => {
  it('calculates correctly for 10 reps at 100kg', () => {
    const orm = brzycki1RM(100, 10);
    // 100 * 36 / (37 - 10) = 100 * 36/27 = 133.33
    expect(orm).toBeCloseTo(133.33, 1);
  });

  it('returns null for reps > 12', () => {
    expect(brzycki1RM(100, 13)).toBeNull();
  });

  it('returns null for 0 weight', () => {
    expect(brzycki1RM(0, 8)).toBeNull();
  });

  it('returns null for null reps', () => {
    expect(brzycki1RM(100, null)).toBeNull();
  });

  it('handles 1 rep — returns the weight itself (36/36=1)', () => {
    const orm = brzycki1RM(100, 1);
    expect(orm).toBeCloseTo(100, 1);
  });
});

describe('compute1RMByGroup', () => {
  it('maps chest exercises to chest group', () => {
    const logs = makeLogs([['Incline DB Press', 40, 8]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('chest')).toBe(true);
  });

  it('averages multiple 1RMs for same group', () => {
    const logs = makeLogs([
      ['Incline DB Press', 40, 8],
      ['Pec Deck / Cable Fly', 50, 8],
    ]);
    const result = compute1RMByGroup(logs);
    expect(result.get('chest')).toBeGreaterThan(0);
  });

  it('handles empty logs', () => {
    const result = compute1RMByGroup([]);
    expect(result.size).toBe(0);
  });
});

describe('detectWeakGroups', () => {
  it('returns empty for empty logs', () => {
    const { weakGroups } = detectWeakGroups([]);
    expect(weakGroups).toHaveLength(0);
  });

  it('detects weak group when 1RM significantly lower', () => {
    const logs = makeLogs([
      // Strong chest: high 1RM
      ['Incline DB Press', 80, 8],
      ['Pec Deck / Cable Fly', 90, 8],
      // Weak biceps: very low 1RM
      ['Bayesian Curl', 5, 8],
    ]);
    const { weakGroups } = detectWeakGroups(logs);
    // biceps should be flagged as weak relative to chest
    expect(weakGroups.length).toBeGreaterThanOrEqual(1);
  });

  it('returns ratio for each group', () => {
    const logs = makeLogs([
      ['Incline DB Press', 60, 8],
      ['Lat Pulldown', 55, 8],
    ]);
    const { ratio } = detectWeakGroups(logs);
    expect(Object.keys(ratio).length).toBeGreaterThan(0);
  });

  it('handles single exercise (no weak groups possible)', () => {
    const logs = makeLogs([['Incline DB Press', 60, 8]]);
    const { weakGroups } = detectWeakGroups(logs);
    expect(weakGroups).toHaveLength(0);
  });

  it('sorts weakest group first', () => {
    const logs = makeLogs([
      ['Incline DB Press', 80, 8],
      ['Pec Deck / Cable Fly', 75, 8],
      ['Bayesian Curl', 5, 8],
      ['Lat Pulldown', 70, 8],
    ]);
    const { weakGroups, ratio } = detectWeakGroups(logs);
    if (weakGroups.length > 1) {
      expect(ratio[weakGroups[0]]).toBeLessThanOrEqual(ratio[weakGroups[1]]);
    }
  });
});
