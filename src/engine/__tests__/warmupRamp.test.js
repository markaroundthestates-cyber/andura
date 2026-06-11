// Tests for the WARM-UP RAMP module (src/engine/warmupRamp.js) — the per-set
// ascending primer (50/70/90% of the working load) for the day's opening compound.
// Pure + deterministic + zero-throw; weights snapped to the real equipment ladder.

import { describe, it, expect } from 'vitest';
import {
  warmupRampFor,
  NO_RAMP_KG,
  MIN_RAMP_KG,
  HEAVY_KG,
} from '../warmupRamp.js';
import { roundToEquipmentWeight } from '../../config/weights.js';

describe('warmupRampFor — full 3-step ramp for a heavy compound', () => {
  it('100kg barbell bench → [50×10, 70×6, 90×3] snapped to the bar ladder', () => {
    const ramp = warmupRampFor(100, { exerciseName: 'Flat Barbell Bench' });
    expect(ramp).toEqual([
      { kg: 50, reps: 10, pct: 50 },
      { kg: 70, reps: 6, pct: 70 },
      { kg: 90, reps: 3, pct: 90 },
    ]);
  });

  it('every primer is a REAL rung on the exercise equipment ladder', () => {
    const name = 'Barbell Back Squat (High Bar)';
    const ramp = warmupRampFor(140, { exerciseName: name });
    expect(ramp.length).toBe(3); // heavy → full ramp
    for (const step of ramp) {
      // The snapped primer must equal what the equipment rounder returns for itself
      // (idempotent on a real rung) — i.e. it is an actual loadable weight.
      expect(roundToEquipmentWeight(step.kg, name)).toBe(step.kg);
      expect(step.kg).toBeLessThan(140); // a primer is always below the working set
    }
  });

  it('percentages ascend 50 → 70 → 90 and weights are non-decreasing', () => {
    const ramp = warmupRampFor(120, { exerciseName: 'Flat Barbell Bench' });
    expect(ramp.map((s) => s.pct)).toEqual([50, 70, 90]);
    for (let i = 1; i < ramp.length; i++) {
      expect(ramp[i].kg).toBeGreaterThanOrEqual(ramp[i - 1].kg);
    }
  });
});

describe('warmupRampFor — load-gated depth (coach judgement)', () => {
  it('a moderate load (≥40, <60) drops the 90% step → 2 primer sets', () => {
    const ramp = warmupRampFor(45, { exerciseName: 'Flat Barbell Bench' });
    expect(ramp.map((s) => s.pct)).toEqual([50, 70]);
  });

  it('a light load (≥25, <40) gives a SINGLE 50% primer set', () => {
    const ramp = warmupRampFor(30, { exerciseName: 'Flat Barbell Bench' });
    expect(ramp.map((s) => s.pct)).toEqual([50]);
    expect(ramp[0].reps).toBe(10);
  });

  it('a tiny isolation load (<25) gets NO ramp — the working set is the primer', () => {
    expect(warmupRampFor(12, { exerciseName: 'DB Lateral Raise' })).toEqual([]);
    expect(warmupRampFor(20, { exerciseName: 'Flat DB Press' })).toEqual([]);
  });

  it('threshold constants are ordered and exposed for the composer gate', () => {
    expect(NO_RAMP_KG).toBeLessThan(MIN_RAMP_KG);
    expect(MIN_RAMP_KG).toBeLessThan(HEAVY_KG);
  });

  it('boundaries: at MIN_RAMP_KG → 2 steps, at HEAVY_KG → 3 steps', () => {
    expect(warmupRampFor(MIN_RAMP_KG, { exerciseName: 'Flat Barbell Bench' }).length).toBe(2);
    expect(warmupRampFor(HEAVY_KG, { exerciseName: 'Flat Barbell Bench' }).length).toBe(3);
    // Just below the no-ramp floor → empty.
    expect(warmupRampFor(NO_RAMP_KG - 1, { exerciseName: 'Flat Barbell Bench' })).toEqual([]);
  });
});

describe('warmupRampFor — snapping & dedup on coarse stacks', () => {
  it('snaps primers to the machine stack and dedups colliding %-steps', () => {
    // Leg Press on leg_press_plates [20,30,40,...]; a coarse 10kg stack low down.
    const ramp = warmupRampFor(100, { exerciseName: 'Leg Press' });
    // 50→50, 70→70, 90→90 all exist on a 10-step stack → 3 distinct rungs.
    expect(ramp.map((s) => s.kg)).toEqual([50, 70, 90]);
    // No two steps share a physical weight.
    const kgs = ramp.map((s) => s.kg);
    expect(new Set(kgs).size).toBe(kgs.length);
  });

  it('never emits a primer at or above the working load (coarse snap-up guard)', () => {
    // A small load on a coarse stack could snap a high % up to the working weight.
    const ramp = warmupRampFor(40, { exerciseName: 'Leg Press' });
    for (const step of ramp) expect(step.kg).toBeLessThan(40);
  });
});

describe('warmupRampFor — determinism & defensive guards', () => {
  it('is deterministic: same input → identical output across calls', () => {
    const a = warmupRampFor(100, { exerciseName: 'Flat Barbell Bench' });
    const b = warmupRampFor(100, { exerciseName: 'Flat Barbell Bench' });
    expect(a).toEqual(b);
  });

  it('returns [] for invalid working loads, never throws', () => {
    expect(warmupRampFor(0, { exerciseName: 'Flat Barbell Bench' })).toEqual([]);
    expect(warmupRampFor(-50, { exerciseName: 'Flat Barbell Bench' })).toEqual([]);
    expect(warmupRampFor(NaN, { exerciseName: 'Flat Barbell Bench' })).toEqual([]);
    expect(warmupRampFor(undefined)).toEqual([]);
    expect(warmupRampFor('100')).toEqual([]); // not a number → []
  });

  it('without a name, still ramps (generic 0.5kg rounding) and never throws', () => {
    const ramp = warmupRampFor(100);
    expect(ramp.map((s) => s.pct)).toEqual([50, 70, 90]);
    expect(ramp).toEqual([
      { kg: 50, reps: 10, pct: 50 },
      { kg: 70, reps: 6, pct: 70 },
      { kg: 90, reps: 3, pct: 90 },
    ]);
  });
});
