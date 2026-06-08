// ══ BUILD F6b V2 #14 — rep-PR / volume-PR type carries forward (spec §1c) ════
// detectPR already emits 'weight'|'reps'|'volume'; the writeback used to collapse
// all three to a flat `isPR: true`. These A/B traces assert:
//   - flag ON  → a same-load-MORE-REPS set stamps prType: 'reps'
//   - flag ON  → a pure load-PR stamps prType: 'weight'
//   - flag OFF → byte-identical to today: isPR: true, NO prType field (the badge
//                stays flat). This is the off-byte-identical proof for V2.
//   - a non-PR set is untouched either way (no isPR, no prType).
// Recognition/narration only — no weight path touched (calibration-sim
// orthogonal). The flag is driven via the `_devFlags` localStorage override.
//
// FINDING (verified by exhaustive probe — see commit body): detectPR's ranking
// is weight → reps → volume, and its reps rule ("strictly more reps at any
// same-or-heavier load tier") STRUCTURALLY pre-empts the volume branch for a
// single logged set — across 123k random PRs the engine returned type 'volume'
// ZERO times. So at the writeback layer `prType` is only ever 'weight' or 'reps'
// today; the 'volume' badge label exists but is unreachable via this path. The
// volume branch is exercised directly in src/engine/__tests__/prEngine.test.js.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { enrichExercisesWithPR } from '../../lib/prRecordsWriteback';
import { DEV_FLAGS_KEY } from '../../../util/featureFlags.js';
import type { SessionExerciseBreakdown } from '../../stores/workoutStore';

function setFlag(on: boolean): void {
  localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ dp_rep_volume_pr_v1: on }));
}

// First-set accessor that asserts presence (strict noUncheckedIndexedAccess).
function firstSet(out: SessionExerciseBreakdown[]): {
  isPR?: boolean;
  prType?: 'weight' | 'reps' | 'volume';
} {
  const ex = out[0];
  if (!ex) throw new Error('expected an exercise breakdown');
  const s = ex.sets[0];
  if (!s) throw new Error('expected a set');
  return s;
}

function oneSet(
  engineName: string,
  kg: number,
  reps: number,
): SessionExerciseBreakdown[] {
  return [
    {
      exerciseId: 'x1',
      exerciseName: engineName,
      engineName,
      sets: [{ kg, reps, rating: 'potrivit', timestamp: 0 }],
      totalVolume: kg * reps,
      peakOneRM: kg,
    },
  ];
}

describe('F6b V2 #14 — PR type carried past the flat isPR boolean', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('flag ON → same-load MORE REPS stamps prType: reps', () => {
    setFlag(true);
    const out = enrichExercisesWithPR(oneSet('Squat', 100, 8), [
      { ex: 'Squat', w: 100, reps: 5 },
    ]);
    expect(firstSet(out).isPR).toBe(true);
    expect(firstSet(out).prType).toBe('reps');
  });

  it('flag ON → a pure load-PR stamps prType: weight', () => {
    setFlag(true);
    const out = enrichExercisesWithPR(oneSet('Deadlift', 200, 3), [
      { ex: 'Deadlift', w: 180, reps: 5 },
    ]);
    expect(firstSet(out).isPR).toBe(true);
    expect(firstSet(out).prType).toBe('weight');
  });

  it('flag OFF → byte-identical: isPR true, NO prType field', () => {
    setFlag(false);
    const out = enrichExercisesWithPR(oneSet('Squat', 100, 8), [
      { ex: 'Squat', w: 100, reps: 5 },
    ]);
    expect(firstSet(out).isPR).toBe(true);
    expect('prType' in firstSet(out)).toBe(false);
  });

  it('no flag set at all → today behavior (flat isPR, no prType)', () => {
    const out = enrichExercisesWithPR(oneSet('Squat', 100, 8), [
      { ex: 'Squat', w: 100, reps: 5 },
    ]);
    expect(firstSet(out).isPR).toBe(true);
    expect('prType' in firstSet(out)).toBe(false);
  });

  it('non-PR set is untouched (no isPR, no prType) even flag ON', () => {
    setFlag(true);
    const out = enrichExercisesWithPR(oneSet('Squat', 80, 5), [
      { ex: 'Squat', w: 100, reps: 5 },
    ]);
    expect(firstSet(out).isPR).toBeUndefined();
    expect(firstSet(out).prType).toBeUndefined();
  });
});
