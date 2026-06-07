// ══ DP ENGINE — F2 #2 Goal Adaptation rep + RIR modifier consumption ═════════
//
// goalAdaptation/index.js computes rep_range_modifier [min,max] (the intended
// per-(template,phase,mode) rep band) and rir_target_modifier [min,max] (the
// intended RIR band). Only rest_time_modifier was read in the workout pipeline;
// these two were DROPPED. getSmartRecommendation now accepts an opts arg
// { repRangeModifier, rirTargetModifier }:
//   - repRangeModifier INTERSECTS the DP phase-aware rep range (never widens
//     past it) + clamps the prescribed repsTarget into the narrowed band.
//   - rirTargetModifier shifts the displayed intensity LABEL only (no load).
//
// REAL values: a real library exercise (Cable Curl, REP_RANGES [10,12]) + a real
// stable working history so DP runs its history branch (not cold-start INIT).

import { describe, it, expect, beforeEach, vi } from 'vitest';

/** @type {Record<string, any>} */
let store = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn((key) => (key in store ? store[key] : null)),
    set: vi.fn((key, val) => { store[key] = val; }),
  },
  tod: () => new Date().toISOString().slice(0, 10),
  cleanEx: (/** @type {string} */ s) => s.replace(/ pump$/, '').trim(),
}));

import { DP } from '../dp.js';

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK'; // masa-like → no CUT rep cap interference
});

/** Seed a real, stable working history so DP runs its history branch. */
function seedHistory(ex, w, reps, rpe) {
  const ts = Date.now() - 24 * 3600 * 1000;
  store['logs'] = [
    { ex, w, kg: w, reps: String(reps), ts, rpe, session: ts },
    { ex, w, kg: w, reps: String(reps), ts: ts - 1, rpe, session: ts - 1 },
    { ex, w, kg: w, reps: String(reps), ts: ts - 2, rpe, session: ts - 2 },
  ];
}

const EX = 'Cable Curl'; // REP_RANGES [10,12]

describe('F2 #2 — rep_range_modifier narrows the prescribed reps', () => {
  it('no opts → byte-identical to the no-arg call (default phase band)', () => {
    seedHistory(EX, 20, 10, 8);
    const baseline = DP.getSmartRecommendation(EX, null, null, undefined, null, []);
    seedHistory(EX, 20, 10, 8);
    const withEmpty = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {});
    expect(withEmpty.repsTarget).toBe(baseline.repsTarget);
    expect(withEmpty.repsRange).toBe(baseline.repsRange);
    expect(withEmpty.kg).toBe(baseline.kg);
  });

  it('a higher-rep modifier intersected with [10,12] raises the repsTarget floor', () => {
    // Stable at the bottom of the band → repsTarget low (10). A modifier band
    // [11,15] intersects [10,12] → [11,12], clamping the target UP to >= 11.
    seedHistory(EX, 20, 10, 9); // hard reps → no climb, stays low in band
    const rec = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {
      repRangeModifier: [11, 15],
    });
    expect(rec.repsTarget).toBeGreaterThanOrEqual(11);
    expect(rec.repsTarget).toBeLessThanOrEqual(12); // never widened past phase ceiling
  });

  it('never widens past the phase-aware band (empty intersection → phase band)', () => {
    // A forta band [3,8] does NOT overlap the Cable Curl phase band [10,12]:
    // empty intersection → fall back to the phase band, repsTarget unchanged.
    seedHistory(EX, 20, 10, 8);
    const baseline = DP.getSmartRecommendation(EX, null, null, undefined, null, []);
    seedHistory(EX, 20, 10, 8);
    const rec = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {
      repRangeModifier: [3, 8],
    });
    expect(rec.repsTarget).toBe(baseline.repsTarget);
  });

  it('the corridor never lowers kg (reps band only — load path untouched)', () => {
    seedHistory(EX, 20, 10, 8);
    const baseline = DP.getSmartRecommendation(EX, null, null, undefined, null, []);
    seedHistory(EX, 20, 10, 8);
    const rec = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {
      repRangeModifier: [11, 12],
    });
    expect(rec.kg).toBe(baseline.kg);
  });
});

describe('F2 #2 — rir_target_modifier shifts the intensity label only', () => {
  it('a low RIR floor (1) labels "La limita" without changing load/reps', () => {
    seedHistory(EX, 20, 10, 8);
    const baseline = DP.getSmartRecommendation(EX, null, null, undefined, null, []);
    seedHistory(EX, 20, 10, 8);
    const rec = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {
      rirTargetModifier: [1, 2],
    });
    // getIntensityLabel(1) = '🔴 La limita'
    expect(rec.intensityLabel).toBe(DP.getIntensityLabel(1));
    // load + reps unchanged (label-only override)
    expect(rec.kg).toBe(baseline.kg);
    expect(rec.repsTarget).toBe(baseline.repsTarget);
  });

  it('absent rir modifier → label from DP rir (byte-identical)', () => {
    seedHistory(EX, 20, 10, 8);
    const baseline = DP.getSmartRecommendation(EX, null, null, undefined, null, []);
    seedHistory(EX, 20, 10, 8);
    const rec = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {});
    expect(rec.intensityLabel).toBe(baseline.intensityLabel);
  });
});

describe('F2 #2 — two goals with different rep modifiers diverge', () => {
  it('a high-rep goal targets more reps than a moderate-rep goal (same history)', () => {
    seedHistory(EX, 20, 10, 9);
    const hi = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {
      repRangeModifier: [12, 15], // intersect [10,12] → [12,12]
    });
    seedHistory(EX, 20, 10, 9);
    const lo = DP.getSmartRecommendation(EX, null, null, undefined, null, [], {
      repRangeModifier: [10, 11], // intersect [10,12] → [10,11]
    });
    expect(hi.repsTarget).toBeGreaterThanOrEqual(lo.repsTarget);
    expect(hi.repsTarget).toBe(12);
  });
});
