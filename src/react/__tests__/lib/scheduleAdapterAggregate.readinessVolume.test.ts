// F2 #1 — readiness volumeMultiplier consumption (Path A: sets, not weight).
//
// readiness.js getReadinessVerdict() emits a GRADED per-band multiplier
// (PR_DAY 1.1 / NORMAL 1.0 / MODERATE 0.85 / LIGHT 0.7) that was COMPUTED but
// DROPPED — the only live readiness effect was the binary dp.js < 60 weight
// HOLD cliff, so MODERATE vs LIGHT produced ZERO plan difference. This wire
// scales SETS by the verdict, floored at the trim floor, leaving the weight to
// the cliff. These tests assert the value now MOVES the plan (the provable
// dropped -> applied for a non-pipeline engine, per F2 spec §2 Test).

import { describe, it, expect } from 'vitest';
import { scaleSetsByReadiness } from '../../lib/scheduleAdapterAggregate';
import type { PlannedExercise } from '../../lib/engineWrappers';

const MIN_SETS_PER_EX = 2; // mirror of the compose-module floor

function ex(name: string, sets: number): PlannedExercise {
  return { id: name, name, engineName: name, sets, targetReps: 8, targetKg: 40, restSec: 90 };
}

// A 4-exercise session, 3 working sets each (the spec's 4x3 fixture).
const session = (): PlannedExercise[] => [
  ex('Squat', 3),
  ex('Bench Press', 3),
  ex('Row', 3),
  ex('Curl', 3),
];

describe('scaleSetsByReadiness — graded readiness ramp on SETS', () => {
  it('NORMAL (score in [60,85)) -> multiplier 1.0 -> byte-identical sets', () => {
    const out = scaleSetsByReadiness(session(), 70);
    expect(out.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });

  it('null score (no energy-check today) -> 1.0 -> unchanged', () => {
    const out = scaleSetsByReadiness(session(), null);
    expect(out.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });

  it('LIGHT (score in [40,55)) -> 0.7 -> fewer sets than NORMAL, floored at 2', () => {
    // 3 * 0.7 = 2.1 -> round 2 (== floor)
    const light = scaleSetsByReadiness(session(), 45);
    expect(light.map((e) => e.sets)).toEqual([2, 2, 2, 2]);
    const normal = scaleSetsByReadiness(session(), 70);
    const lightTotal = light.reduce((s, e) => s + e.sets, 0);
    const normalTotal = normal.reduce((s, e) => s + e.sets, 0);
    expect(lightTotal).toBeLessThan(normalTotal);
  });

  it('MODERATE (score in [55,70)) -> 0.85 -> between LIGHT and NORMAL', () => {
    // 4 sets * 0.85 = 3.4 -> round 3 (vs 4 normal, vs 3 light)
    const mod = scaleSetsByReadiness([ex('Squat', 4)], 60);
    expect(mod[0]!.sets).toBe(3);
  });

  it('PR day (high score, history) -> 1.1 -> MORE sets', () => {
    // 4 * 1.1 = 4.4 -> round 4 (no change on small counts); 10 * 1.1 = 11 -> +1
    const pr = scaleSetsByReadiness([ex('Squat', 10)], 95);
    expect(pr[0]!.sets).toBe(11);
  });

  it('floor: never below MIN_SETS_PER_EX even at the lightest band', () => {
    const out = scaleSetsByReadiness([ex('Squat', 2)], 45);
    expect(out[0]!.sets).toBeGreaterThanOrEqual(MIN_SETS_PER_EX);
  });

  it('REST band (score < 40) -> verdict 0 -> no-op (rest day is filtered upstream)', () => {
    const out = scaleSetsByReadiness(session(), 20);
    expect(out.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });

  it('does NOT mutate the input array', () => {
    const input = session();
    scaleSetsByReadiness(input, 45);
    expect(input.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
  });
});
