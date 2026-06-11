// ══ ID-MIGRATION Phase 2 — DP read-side resolve-before-lookup ════════════════
// The name-key bug class (logs stranded on a renamed exercise → cold-start INIT
// forever) closes at the engine READ seam: DP.getLogs resolves the queried name
// AND every stored row's `l.ex` through resolveExerciseName, so a set logged
// under a HISTORICAL name (alias) is regrouped under the CURRENT canonical.
//
// Uses the two PROVEN historical renames seeded as real aliases in exercises.json
// (the 2026-06-10 data remap): "Chest Fly" → "Cable Fly" and "Overhead Triceps
// Extension" → "Cable Overhead Triceps Extension Rope". The resolver runs for
// REAL here (only db.js is mocked) so the test fails the day those aliases are
// dropped — exactly the regression we are guarding.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory DB store so the test controls the persisted `logs` array. Mirrors the
// shape DP reads: DB.get('logs') → the array; phase-override → 'AUTO' (no cut math).
let _store = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn((key) => (key in _store ? _store[key] : null)),
    set: vi.fn((key, val) => { _store[key] = val; }),
  },
  tod: () => new Date().toISOString().slice(0, 10),
  cleanEx: (s) => s.replace(/ pump$/, '').trim(),
}));

import { DP } from '../dp.js';

beforeEach(() => {
  _store = {};
});

describe('DP.getLogs — resolve-before-lookup (ID-MIGRATION Phase 2)', () => {
  it('a set logged under a HISTORICAL name is found when querying the CURRENT canonical', () => {
    // Persisted under the OLD name "Chest Fly" (pre-rename); the engine now keys on
    // the canonical "Cable Fly". Pre-fix this row orphaned → getLogs empty.
    _store.logs = [
      { ex: 'Chest Fly', w: 30, reps: 12, rpe: 7.5, ts: 2000 },
    ];
    const found = DP.getLogs('Cable Fly', 10);
    expect(found).toHaveLength(1);
    expect(found[0].w).toBe(30);
  });

  it('merges rows stored under the old AND the new name into one newest-first slice', () => {
    _store.logs = [
      { ex: 'Cable Fly', w: 32, reps: 10, rpe: 7.5, ts: 3000 },     // newer, current name
      { ex: 'Chest Fly', w: 30, reps: 12, rpe: 7.5, ts: 2000 },     // older, historical alias
    ];
    const found = DP.getLogs('Cable Fly', 10);
    expect(found.map((l) => l.w)).toEqual([32, 30]); // ts DESC, both included
  });

  it('querying by the historical alias also resolves to the same canonical history', () => {
    _store.logs = [
      { ex: 'Cable Fly', w: 32, reps: 10, rpe: 7.5, ts: 3000 },
    ];
    // The query itself is the old name → resolves to "Cable Fly" → finds the row.
    expect(DP.getLogs('Chest Fly', 10).map((l) => l.w)).toEqual([32]);
  });

  it('second proven rename: Overhead Triceps Extension → its current canonical', () => {
    _store.logs = [
      { ex: 'Overhead Triceps Extension', w: 25, reps: 12, rpe: 7.5, ts: 1000 },
    ];
    const found = DP.getLogs('Cable Overhead Triceps Extension Rope', 10);
    expect(found).toHaveLength(1);
    expect(found[0].w).toBe(25);
  });

  it('a stable id query resolves to the canonical name history (Romanian Deadlift)', () => {
    _store.logs = [
      { ex: 'Romanian Deadlift', w: 100, reps: 8, rpe: 8.5, ts: 1000 },
    ];
    // exerciseIdOf('Romanian Deadlift') === 'romanian-deadlift' (Phase 1 lint).
    expect(DP.getLogs('romanian-deadlift', 10).map((l) => l.w)).toEqual([100]);
  });

  it('does NOT cross-contaminate a DIFFERENT exercise (alias only folds its OWN history)', () => {
    _store.logs = [
      { ex: 'Cable Fly', w: 32, reps: 10, rpe: 7.5, ts: 3000 },
      { ex: 'Lat Pulldown', w: 60, reps: 10, rpe: 7.5, ts: 2500 },
    ];
    expect(DP.getLogs('Cable Fly', 10).map((l) => l.w)).toEqual([32]); // Lat Pulldown excluded
    expect(DP.getLogs('Lat Pulldown', 10).map((l) => l.w)).toEqual([60]);
  });

  it('an UNKNOWN exercise name (no metadata) still matches its own raw rows (back-compat)', () => {
    // resolveExerciseName(unknown) → null → getLogs falls back to exact `l.ex ===`.
    _store.logs = [
      { ex: 'Totally Custom Lift', w: 40, reps: 10, rpe: 7.5, ts: 1000 },
    ];
    expect(DP.getLogs('Totally Custom Lift', 10).map((l) => l.w)).toEqual([40]);
  });
});

describe('DP._loggedExerciseNames — canonical collapse (ID-MIGRATION Phase 2)', () => {
  it('a lift logged under both a historical alias and its current name is ONE source', () => {
    _store.logs = [
      { ex: 'Cable Fly', w: 32 },
      { ex: 'Chest Fly', w: 30 }, // historical alias of Cable Fly
      { ex: 'Lat Pulldown', w: 60 },
    ];
    const names = DP._loggedExerciseNames();
    expect(names).toContain('Cable Fly');
    expect(names).not.toContain('Chest Fly'); // collapsed onto the canonical
    expect(names).toContain('Lat Pulldown');
    expect(names.filter((n) => n === 'Cable Fly')).toHaveLength(1);
  });
});
