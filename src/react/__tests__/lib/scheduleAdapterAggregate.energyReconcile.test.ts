// F2 #4 — Energy Adjustment RECONCILE (in-session ±% weight scale factor).
//
// The Energy Adjustment engine computes adjustment_direction + a tier-gated
// asymmetric adjustment_magnitude_pct (|pct| <= 0.15) that was DROPPED. Workout's
// in-session ±% scale used FLAT hardcoded constants (x0.8 / x1.15). resolveIntensityFactors
// RECONCILES: it supplies the engine magnitude for the SAME single scale (NOT a
// third multiplier, NOT a new trigger — the caller's intensityMod 3-state still
// gates whether any scale happens). These tests prove: (a) absent engine output
// -> the legacy constants (byte-identical), (b) the engine magnitude replaces the
// constant, (c) the reconciled DOWN cut is SMALLER than the old flat 20% (swing
// shrinks, never additive), (d) UP is never a bigger push than the old 1.15.

import { describe, it, expect } from 'vitest';
import { resolveIntensityFactors } from '../../lib/scheduleAdapterAggregate';

describe('resolveIntensityFactors — energy reconcile (not a third multiplier)', () => {
  it('null engine output -> legacy flat constants (byte-identical fallback)', () => {
    expect(resolveIntensityFactors(null)).toEqual({ minus: 0.8, plus: 1.15 });
  });

  it('NONE direction -> legacy constants (no engine adjustment)', () => {
    expect(resolveIntensityFactors({ direction: 'NONE', magnitudePct: 0 })).toEqual({
      minus: 0.8,
      plus: 1.15,
    });
  });

  it('DOWN with magnitude -> minus factor = 1 - |pct| (replaces 0.8)', () => {
    // engine emits -0.15 (T1+ ceiling) -> 1 - 0.15 = 0.85 (vs legacy 0.8)
    const f = resolveIntensityFactors({ direction: 'DOWN', magnitudePct: -0.15 });
    expect(f.minus).toBeCloseTo(0.85, 5);
    // UP branch untouched -> legacy constant (no UP signal present)
    expect(f.plus).toBe(1.15);
  });

  it('the reconciled DOWN cut is SMALLER than the old flat 20% (swing shrinks)', () => {
    const f = resolveIntensityFactors({ direction: 'DOWN', magnitudePct: -0.15 });
    // 0.85 > 0.80 -> a lighter cut: the net swing is smaller, never additive.
    expect(f.minus).toBeGreaterThan(0.8);
  });

  it('UP with magnitude -> plus factor = 1 + |pct|, never above the old 1.15', () => {
    // T0 cold-start ceiling 0.10 -> 1.10 (smaller push than legacy 1.15)
    const f = resolveIntensityFactors({ direction: 'UP', magnitudePct: 0.1 });
    expect(f.plus).toBeCloseTo(1.1, 5);
    expect(f.plus).toBeLessThanOrEqual(1.15);
    // DOWN branch untouched -> legacy constant
    expect(f.minus).toBe(0.8);
  });

  it('full T1+ UP ceiling (0.15) -> exactly the old 1.15 (reconciles to parity)', () => {
    const f = resolveIntensityFactors({ direction: 'UP', magnitudePct: 0.15 });
    expect(f.plus).toBeCloseTo(1.15, 5);
  });

  it('zero magnitude with a direction -> legacy constant (no real adjustment)', () => {
    expect(resolveIntensityFactors({ direction: 'DOWN', magnitudePct: 0 }).minus).toBe(0.8);
  });

  it('non-finite magnitude is guarded -> legacy constant', () => {
    expect(resolveIntensityFactors({ direction: 'DOWN', magnitudePct: NaN }).minus).toBe(0.8);
  });
});

// Live 07-15 root-cause ("recomanda 6kg desi are istoric"): during an ACTIVE deload
// with no energy adjustment, the minus scale fell back to the flat legacy x0.8 even
// though the deload engine prescribed intensity_pct_decrement 12.5 — every deload
// set-1 ran 7.5pp lighter than the engine intended. The deload's own decrement now
// feeds the fallback; the energy DOWN signal (fresher, per-session) still outranks.
describe('resolveIntensityFactors — active-deload decrement feeds the minus fallback', () => {
  it('deload pct 12.5 + no energy signal → minus = 0.875 (engine magnitude, not 0.8)', () => {
    expect(resolveIntensityFactors(null, 12.5).minus).toBeCloseTo(0.875, 5);
  });

  it('energy DOWN still outranks the deload decrement (fresher signal wins)', () => {
    const f = resolveIntensityFactors({ direction: 'DOWN', magnitudePct: -0.15 }, 12.5);
    expect(f.minus).toBeCloseTo(0.85, 5);
  });

  it('null/absent/degenerate decrement → legacy 0.8 (byte-identical fallback)', () => {
    expect(resolveIntensityFactors(null, null).minus).toBe(0.8);
    expect(resolveIntensityFactors(null, 0).minus).toBe(0.8);
    expect(resolveIntensityFactors(null, 100).minus).toBe(0.8);
    expect(resolveIntensityFactors(null, NaN).minus).toBe(0.8);
  });

  it('plus branch untouched by the deload decrement', () => {
    expect(resolveIntensityFactors(null, 12.5).plus).toBe(1.15);
  });
});
