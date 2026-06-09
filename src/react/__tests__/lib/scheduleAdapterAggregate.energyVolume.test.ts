// #76 — energy → VOLUME / RIR modulation at the compose seam (Path A: sets + RIR
// display band, NOT weight). scaleSetsByEnergy scales the session set counts by the
// magnitude-derived volumeFactor; shiftRirBand folds the RIR shift into the display
// band. These tests assert the wire MOVES the plan AND — the CRITICAL INVARIANT —
// that the prescribed kg is NEVER changed by this modulation (KEEP-LOAD: heavy load
// preserves muscle in a deficit; only sets/RIR move). Mirrors the readinessVolume
// test (the sibling Path-A set scaler) so the two are comparable.

import { describe, it, expect } from 'vitest';
import { scaleSetsByEnergy, shiftRirBand } from '../../lib/scheduleAdapterAggregate';
import { phaseRirShift } from '../../../engine/periodization/mesocycle.js';
import type { PlannedExercise } from '../../lib/engineWrappers';

const MIN_SETS_PER_EX = 2; // mirror of the compose-module floor

function ex(name: string, sets: number, kg = 40): PlannedExercise {
  return { id: name, name, engineName: name, sets, targetReps: 8, targetKg: kg, restSec: 90 };
}

// A 4-exercise session, 4 working sets each (so a cut is visible above the floor).
const session = (): PlannedExercise[] => [
  ex('Squat', 4, 100),
  ex('Bench Press', 4, 60),
  ex('Row', 4, 50),
  ex('Curl', 4, 15),
];

describe('scaleSetsByEnergy — magnitude-derived volume modulation on SETS', () => {
  it('factor 1.0 → byte-identical sets (the OFF / no-magnitude common case)', () => {
    const out = scaleSetsByEnergy(session(), 1.0);
    expect(out.map((e) => e.sets)).toEqual([4, 4, 4, 4]);
  });

  it('deficit factor (0.70, deep cut) → FEWER sets than the unscaled session', () => {
    const cut = scaleSetsByEnergy(session(), 0.7); // 4 * 0.7 = 2.8 → round 3
    expect(cut.map((e) => e.sets)).toEqual([3, 3, 3, 3]);
    const cutTotal = cut.reduce((s, e) => s + e.sets, 0);
    const baseTotal = session().reduce((s, e) => s + e.sets, 0);
    expect(cutTotal).toBeLessThan(baseTotal);
  });

  it('mild deficit (0.85) cuts LESS than a deep deficit (0.70) — magnitude scales', () => {
    const mild = scaleSetsByEnergy([ex('Squat', 10)], 0.85); // 8.5 → 9 (wait: round 8.5 → 9)
    const deep = scaleSetsByEnergy([ex('Squat', 10)], 0.7);  // 7
    expect(deep[0]!.sets).toBeLessThan(mild[0]!.sets);
  });

  it('surplus factor (1.10) → MORE sets tolerance', () => {
    const surplus = scaleSetsByEnergy([ex('Squat', 10)], 1.1); // 11
    expect(surplus[0]!.sets).toBe(11);
  });

  it('MEV floor conserved: never below MIN_SETS_PER_EX even at the deepest cut', () => {
    const out = scaleSetsByEnergy([ex('Squat', 2)], 0.7);
    expect(out[0]!.sets).toBeGreaterThanOrEqual(MIN_SETS_PER_EX);
  });

  // ── THE CRITICAL INVARIANT — KEEP LOAD ────────────────────────────────────
  it('KEEP-LOAD: the prescribed kg + reps are NEVER changed by the volume cut', () => {
    const base = session();
    const cut = scaleSetsByEnergy(base, 0.7);
    // Every prescribed load + rep target is byte-identical to the input — only sets
    // moved. This is the muscle-preservation guarantee: a deficit cuts VOLUME, never
    // the heavy load that holds onto muscle.
    cut.forEach((e, i) => {
      expect(e.targetKg).toBe(base[i]!.targetKg);
      expect(e.targetReps).toBe(base[i]!.targetReps);
    });
    // And the loads are genuinely the originals (not coincidentally equal to a constant).
    expect(cut.map((e) => e.targetKg)).toEqual([100, 60, 50, 15]);
  });

  it('does NOT mutate the input array', () => {
    const input = session();
    scaleSetsByEnergy(input, 0.7);
    expect(input.map((e) => e.sets)).toEqual([4, 4, 4, 4]);
  });
});

describe('shiftRirBand — energy RIR shift folded into the display band (NOT the kg)', () => {
  it('shift 0 → the base band unchanged (byte-identical)', () => {
    expect(shiftRirBand([1, 2], 0)).toEqual([1, 2]);
    expect(shiftRirBand(null, 0)).toBeNull();
  });

  it('positive shift (deficit, further from failure) raises the band', () => {
    expect(shiftRirBand([1, 2], 2)).toEqual([3, 4]);
  });

  it('negative shift (surplus, closer to failure) lowers the band, floored at 0', () => {
    expect(shiftRirBand([1, 2], -1)).toEqual([0, 1]);
    expect(shiftRirBand([0, 1], -2)).toEqual([0, 0]); // never negative
  });

  it('no base band + a shift → seeds from a sane default RIR band', () => {
    expect(shiftRirBand(null, 2)).toEqual([3, 4]); // default [1,2] + 2
  });
});

// W-Meso — the intra-block RIR ramp wiring (dp_meso_rir_v1). The compose seam folds
// phaseRirShift(mesocyclePhase) through the SAME shiftRirBand channel as #76. These
// assert the COMPOSED transformation: across a 4-week block the rir DISPLAY band
// steps DOWN W0(LOAD)→PEAK (accumulation→intensification), DELOAD is unaffected, and
// — KEEP-LOAD — the band is the display channel only (it never feeds the kg).
describe('W-Meso intra-block RIR ramp — phaseRirShift folded via shiftRirBand', () => {
  // The exact composition compose.ts performs: shiftRirBand(base, phaseRirShift(p)).
  const banded = (phase: string, base: readonly [number, number] | null = [1, 2]) =>
    shiftRirBand(base, phaseRirShift(phase as 'LOAD' | 'LOAD+' | 'PEAK' | 'DELOAD'));

  it('steps DOWN across the accumulation block W0→PEAK (more reserve early → less at PEAK)', () => {
    expect(banded('LOAD')).toEqual([1, 2]);   // shift 0  → unchanged (early week)
    expect(banded('LOAD+')).toEqual([0, 1]);  // shift -1 → one step closer to failure
    expect(banded('PEAK')).toEqual([0, 0]);   // shift -2 → floored, closest to failure
  });

  it('floor of the band is monotonically non-increasing LOAD ≥ LOAD+ ≥ PEAK', () => {
    const lo = (b: readonly [number, number] | null) => (b ? b[0] : NaN);
    expect(lo(banded('LOAD', [2, 3]))).toBeGreaterThanOrEqual(lo(banded('LOAD+', [2, 3])));
    expect(lo(banded('LOAD+', [2, 3]))).toBeGreaterThanOrEqual(lo(banded('PEAK', [2, 3])));
  });

  it('DELOAD leaves the band unchanged (deload machinery owns the recovery cut)', () => {
    expect(banded('DELOAD', [1, 2])).toEqual([1, 2]);
    expect(banded('DELOAD', null)).toBeNull(); // shift 0 + no base → still null
  });

  it('flag-OFF equivalence: shift 0 (LOAD/DELOAD) passes the base through byte-identical', () => {
    // OFF path mirrors a 0 shift — the band is never touched.
    expect(banded('LOAD', [2, 3])).toEqual([2, 3]);
    expect(banded('LOAD', null)).toBeNull();
  });
});
