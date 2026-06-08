// ══ BUILD F6c #21 — strength/bodyweight + cut/bulk recovery nudge tests ══════
// relativeStrength (mu/bw narration) + bodyweightTrendRecoveryFactor + its effect
// on learnRecovery (a cut slows recovery, a surplus speeds it, within the existing
// [0.5x, 2x] clamp). Real EXERCISE_MUSCLES names + rating literals.

import { describe, it, expect } from 'vitest';
import { relativeStrength } from '../dp/ceiling.js';
import {
  learnRecovery,
  bodyweightTrendRecoveryFactor,
  BW_RECOVERY_CUT_FACTOR,
  BW_RECOVERY_SURPLUS_FACTOR,
  MUSCLE_HEADS,
  RECOVERY_CLAMP_LO,
  RECOVERY_CLAMP_HI,
} from '../muscleMap.js';

const MS_DAY = 86400000;
const T0 = Date.UTC(2026, 0, 1);
const day = (n) => T0 + n * MS_DAY;
const legCurl = (n, w, reps = 10, rpe = 7.5) => ({ ex: 'Leg Curl', w, reps, rpe, ts: day(n) });

describe('relativeStrength — mu/bw (narration only)', () => {
  it('is the strength-to-bodyweight ratio', () => {
    expect(relativeStrength(150, 75)).toBeCloseTo(2.0, 6);
    expect(relativeStrength(90, 90)).toBeCloseTo(1.0, 6);
  });
  it('returns 0 on an unusable input', () => {
    expect(relativeStrength(0, 80)).toBe(0);
    expect(relativeStrength(100, 0)).toBe(0);
    expect(relativeStrength(NaN, 80)).toBe(0);
  });
});

describe('bodyweightTrendRecoveryFactor — phase + confirming bodyweight move', () => {
  const falling = { '2026-01-01': 90, '2026-02-01': 86 }; // ~-4.4%
  const rising = { '2026-01-01': 80, '2026-02-01': 84 };  // +5%
  const flat = { '2026-01-01': 80, '2026-02-01': 80 };

  it('a CUT with a falling bodyweight → longer recovery (> 1)', () => {
    expect(bodyweightTrendRecoveryFactor(falling, 'CUT')).toBe(BW_RECOVERY_CUT_FACTOR);
    expect(BW_RECOVERY_CUT_FACTOR).toBeGreaterThan(1);
  });
  it('a BULK with a rising bodyweight → shorter recovery (< 1)', () => {
    expect(bodyweightTrendRecoveryFactor(rising, 'BULK')).toBe(BW_RECOVERY_SURPLUS_FACTOR);
    expect(BW_RECOVERY_SURPLUS_FACTOR).toBeLessThan(1);
  });
  it('phase + series disagree, or a flat series → no nudge (1)', () => {
    expect(bodyweightTrendRecoveryFactor(rising, 'CUT')).toBe(1);   // CUT but gaining
    expect(bodyweightTrendRecoveryFactor(falling, 'BULK')).toBe(1); // BULK but losing
    expect(bodyweightTrendRecoveryFactor(flat, 'CUT')).toBe(1);     // no real move
  });
  it('a non-cut/bulk phase or missing series → no nudge (1)', () => {
    expect(bodyweightTrendRecoveryFactor(falling, 'MAINTENANCE')).toBe(1);
    expect(bodyweightTrendRecoveryFactor(falling, null)).toBe(1);
    expect(bodyweightTrendRecoveryFactor(null, 'CUT')).toBe(1);
    expect(bodyweightTrendRecoveryFactor({ '2026-01-01': 90 }, 'CUT')).toBe(1); // single point
  });
});

describe('learnRecovery — bwTrendFactor nudge (REUSES the [0.5x, 2x] clamp)', () => {
  // A consistent fast recoverer (24h gaps, rising e1RM) — without a nudge the learned
  // value sits below the global; the clamp floor is 0.5x.
  const logs = [];
  for (let i = 0; i <= 8; i++) logs.push(legCurl(i, 40 + i));

  it('factor 1 (default / flag OFF) is byte-identical to no factor', () => {
    const a = learnRecovery(logs);
    const b = learnRecovery(logs, undefined, 1);
    expect(b.hamstring.hours).toBe(a.hamstring.hours);
  });

  it('a cut factor (>1) raises the learned recovery vs the un-nudged value', () => {
    const base = learnRecovery(logs).hamstring.hours;
    const cut = learnRecovery(logs, undefined, BW_RECOVERY_CUT_FACTOR).hamstring.hours;
    expect(cut).toBeGreaterThanOrEqual(base);
  });

  it('the nudge never escapes the existing [0.5x, 2x] clamp', () => {
    const g = MUSCLE_HEADS.hamstring.recoveryHours;
    const huge = learnRecovery(logs, undefined, 100).hamstring.hours;   // absurd up-nudge
    const tiny = learnRecovery(logs, undefined, 0.001).hamstring.hours; // absurd down-nudge
    expect(huge).toBeLessThanOrEqual(Math.round(g * RECOVERY_CLAMP_HI));
    expect(tiny).toBeGreaterThanOrEqual(Math.round(g * RECOVERY_CLAMP_LO));
  });
});
