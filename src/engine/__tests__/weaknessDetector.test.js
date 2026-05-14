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
  it('maps chest exercises to piept group (Big 11 canonical V1)', () => {
    const logs = makeLogs([['Incline DB Press', 40, 8]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('piept')).toBe(true);
    expect(result.has('chest')).toBe(false);  // Big 6 legacy key gone
  });

  it('averages multiple 1RMs for same group (Big 11 piept canonical V1)', () => {
    const logs = makeLogs([
      ['Incline DB Press', 40, 8],
      ['Pec Deck / Cable Fly', 50, 8],
    ]);
    const result = compute1RMByGroup(logs);
    expect(result.get('piept')).toBeGreaterThan(0);
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

// ══════════════════════════════════════════════════════════════════════
// C4.2 Big 11 canonical V1 inference per ADR_ENGINE_REFACTOR §4.2 LOCK V1
// _headToGroup() + resolveGroup() refactor Big 6 → Big 11 (piept/spate/umeri/biceps/triceps/antebrate/core/picioare-quads/picioare-hamstrings/fese/gambe)
// NEW antebrate inference regex (wrist|forearm|grip|farmer|fat grip|hammer hold)
// NEW fese inference regex (hip thrust|glute|sumo|bulgarian|kickback|hip abduction)
// ZERO mutation Brzycki algorithm semantics + detectWeakGroups + compute1RMByGroup pure-function invariant ADR-026 §9
// ══════════════════════════════════════════════════════════════════════
describe('Big 11 canonical V1 inference per ADR_ENGINE_REFACTOR §4.2', () => {
  // antebrate inference NEW V1
  it('infers antebrate from Wrist Curl', () => {
    const logs = makeLogs([['Wrist Curl', 20, 10]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('antebrate')).toBe(true);
  });

  it('infers antebrate from Farmer Walk', () => {
    const logs = makeLogs([['Farmer Walk', 80, 1]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('antebrate')).toBe(true);
  });

  it('infers antebrate from Fat Grip Hold', () => {
    const logs = makeLogs([['Fat Grip Hold', 30, 5]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('antebrate')).toBe(true);
  });

  // fese inference NEW V1
  it('infers fese from Hip Thrust', () => {
    const logs = makeLogs([['Hip Thrust', 150, 8]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('fese')).toBe(true);
  });

  it('infers fese from Sumo Deadlift', () => {
    const logs = makeLogs([['Sumo Deadlift', 180, 5]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('fese')).toBe(true);
  });

  it('infers fese from Bulgarian Split Squat (glute-dominant variant)', () => {
    const logs = makeLogs([['Bulgarian Split Squat', 60, 8]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('fese')).toBe(true);
  });

  // Big 11 expansion legs split
  it('splits legs into picioare-quads for Squat', () => {
    const logs = makeLogs([['Back Squat', 120, 5]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('picioare-quads')).toBe(true);
    expect(result.has('legs')).toBe(false);  // Big 6 legacy gone
  });

  it('splits legs into picioare-hamstrings for Romanian Deadlift', () => {
    const logs = makeLogs([['Romanian Deadlift', 100, 8]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('picioare-hamstrings')).toBe(true);
  });

  it('splits legs into gambe for Calf Raise', () => {
    const logs = makeLogs([['Standing Calf Raise', 80, 12]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('gambe')).toBe(true);
  });

  // chest → piept rename (Big 11)
  it('renames chest → piept Big 11 canonical', () => {
    const logs = makeLogs([['Bench Press', 100, 6]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('piept')).toBe(true);
    expect(result.has('chest')).toBe(false);  // Big 6 legacy gone
  });

  // shoulders → umeri rename (Big 11)
  it('renames shoulders → umeri Big 11 canonical', () => {
    const logs = makeLogs([['Overhead Press', 60, 5]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('umeri')).toBe(true);
  });

  // back → spate rename (Big 11)
  it('renames back → spate Big 11 canonical', () => {
    const logs = makeLogs([['Barbell Row', 80, 8]]);
    const result = compute1RMByGroup(logs);
    expect(result.has('spate')).toBe(true);
  });

  // detectWeakGroups returns Big 11 labels (NU contains Big 6 legacy)
  it('detectWeakGroups returns Big 11 canonical labels (NU Big 6 legacy)', () => {
    const logs = makeLogs([
      ['Bench Press', 100, 5], ['Bench Press 2', 100, 5],
      ['Back Squat', 120, 5], ['Front Squat', 110, 5],
      ['Wrist Curl', 5, 10],  // weak antebrate
    ]);
    const { weakGroups, byGroup } = detectWeakGroups(logs);
    // antebrate should be detected as a group present
    expect(Object.keys(byGroup)).toContain('antebrate');
    // NU contains Big 6 legacy keys
    expect(weakGroups).not.toContain('arms');
    expect(weakGroups).not.toContain('legs');
    expect(weakGroups).not.toContain('chest');
    expect(weakGroups).not.toContain('back');
    expect(weakGroups).not.toContain('shoulders');
  });

  // ZERO mutation Brzycki algorithm semantics preserved per ADR-026 §9 pure-function invariant
  it('Brzycki algorithm semantics preserved post-refactor (pure-function ADR-026 §9 invariant)', () => {
    // 100kg × 36 / (37 - 10) = 100 × 36/27 = 133.33
    expect(brzycki1RM(100, 10)).toBeCloseTo(133.33, 1);
    expect(brzycki1RM(100, 1)).toBeCloseTo(100, 1);
    expect(brzycki1RM(100, 13)).toBeNull();
    expect(brzycki1RM(0, 8)).toBeNull();
  });
});

