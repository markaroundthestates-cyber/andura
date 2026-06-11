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

// ── ID-MIGRATION Phase 2b: rename-safe matching (real alias Chest Fly→Cable Fly) ──
// A lift logged under a historical alias AND its current name is ONE movement; its
// progression must NOT split across the rename (the stranding bug getLogs fixed).
describe('weeklyProgression — canonical identity match (Phase 2b)', () => {
  it('folds rows logged under a historical alias into the current-name progression', () => {
    // Chest Fly (alias) → Cable Fly (canonical, id cable-fly) per exercises.json.
    const logs = [
      makeLog('Chest Fly', 20, 10, 4),  // logged before the rename
      makeLog('Chest Fly', 22, 10, 3),
      makeLog('Cable Fly', 24, 10, 2),  // logged after the rename
      makeLog('Cable Fly', 26, 10, 0),
    ];
    // Querying the CANONICAL name sees the whole history (4 weeks → progressing).
    const canon = weeklyProgression('Cable Fly', logs);
    expect(canon.length).toBeGreaterThanOrEqual(3);
    // Querying the ALIAS resolves to the same canonical set (symmetry).
    const alias = weeklyProgression('Chest Fly', logs);
    expect(alias.length).toBe(canon.length);
  });

  it('a flat lift renamed mid-history still reads as stagnant (no false reset)', () => {
    const logs = [
      makeLog('Chest Fly', 20, 10, 4),
      makeLog('Chest Fly', 20, 10, 3),
      makeLog('Cable Fly', 20, 10, 2),
      makeLog('Cable Fly', 20, 10, 1),
      makeLog('Cable Fly', 20, 10, 0),
    ];
    const { stagnationWeeks } = detectStagnation('Cable Fly', logs);
    expect(stagnationWeeks).toBeGreaterThan(0);
  });

  it('an off-library name still matches itself only (back-compat, no false merge)', () => {
    const logs = [makeLog('My Custom Lift', 50, 8, 2), makeLog('My Custom Lift', 55, 8, 0)];
    expect(weeklyProgression('My Custom Lift', logs).length).toBeGreaterThanOrEqual(1);
    expect(weeklyProgression('Cable Fly', logs)).toHaveLength(0);
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
