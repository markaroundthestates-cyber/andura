// ══ DP ENGINE — RETURN-AFTER-GAP DELOAD + RAMP (detraining) ══════════════════
//
// Daniel decision #3 (APPROVED). Real failure in the founder's data: 3 months
// off legs → the engine (reading only the pre-gap lastW) let him chase a 230 PR
// + full v-taper volume on the first session back → "barely walk", DOMS / injury
// risk. After a training GAP for an exercise the COMEBACK must be DELOADED then
// RAMPED, fully automatic from the timestamped logs — no user input.
//
// Properties proved here (REAL production values — Leg Press, 5kg plate stack,
// pre-gap working load 200 kg, the founder's actual scenario):
//   1. ~3-month gap  → comeback ~60% (deep deload) + fewer sets + NO PR.
//   2. ~3-week gap   → comeback ~70% (mild deload).
//   3. ~5-day gap    → NO deload (normal missed-session / rest week).
//   4. Deeper-gap start is monotonic (3mo start < 3wk start).
//   5. The ramp restores toward full over ~3-4 comeback sessions.
//   6. No qualifying history (cold start / single log) → no deload (golden-safe).
//   7. The comeback caps PR — never prescribes at/above the pre-gap working load.
//
// DB is mocked with a mutable store (mirrors dp.machineCalibration.test.js).

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

const EX = 'Leg Press';
const DAY = 24 * 3600 * 1000;
const WEEK = 7 * DAY;
// A fixed "now" so the gap arithmetic is deterministic.
const NOW = new Date(2026, 5, 1, 12, 0, 0).getTime();

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK'; // masa-like; deterministic, avoids the CUT date branch
  // This file pins the RETURN-AFTER-GAP deload depth/ramp on RAW pre-gap loads. With
  // dp_e1rm_v1 now DEFAULT ON (THE FLIP 2026-06-08) the held/comeback load is re-
  // expressed in e1RM space, shifting the exact kg under assertion (e.g. a no-deload
  // hold climbs a notch via the find-your-weight catch-up). Force the e1RM cluster
  // OFF so the deload DEPTH + ramp logic stays isolated on the raw pre-gap load (the
  // e1RM-ON load path is covered by dp.e1rm.* + the calibration-sim).
  try {
    localStorage.setItem('_devFlags', JSON.stringify({
      dp_e1rm_v1: false, dp_strength_kalman_v1: false, dp_ceiling_v1: false,
    }));
  } catch { /* jsdom always provides localStorage */ }
});

/**
 * Seed the logs DB with a single steady pre-gap working session at `preGapW`,
 * logged `gapMs` before `at` (default NOW). Reps at target, rating potrivit so the
 * normal pipeline would HOLD at the pre-gap load if there were no gap.
 * @param {number} preGapW
 * @param {number} gapMs
 * @param {number} [at]
 */
function seedPreGap(preGapW, gapMs, at = NOW) {
  store['logs'] = [
    { ex: EX, w: preGapW, reps: 10, rpe: 7.5, ts: at - gapMs },
    { ex: EX, w: preGapW, reps: 10, rpe: 7.5, ts: at - gapMs - 2 * DAY },
    { ex: EX, w: preGapW, reps: 10, rpe: 7.5, ts: at - gapMs - 4 * DAY },
  ];
}

describe('DP return-after-gap deload — depth scales with gap', () => {
  it('3-month gap → deep deload ~60% of pre-gap load, fewer sets, NO PR', () => {
    seedPreGap(200, 13 * WEEK); // ~3 months
    const rec = DP.getSmartRecommendation(EX, null, null, NOW);
    expect(rec.status).toBe('RETURN DELOAD');
    // 200 × 0.60 = 120 → snaps to 120 on the leg_press_plates stack.
    expect(rec.kg).toBe(120);
    expect(rec.kg / 200).toBeCloseTo(0.6, 2);
    // NO PR — strictly below the pre-gap working load.
    expect(rec.kg).toBeLessThan(200);
    // Fewer sets on the comeback.
    expect(rec.setsAdjust).toBe(-1);
    expect(rec.returnDeload.session).toBe(0);
  });

  it('3-week gap → mild deload ~70% of pre-gap load', () => {
    seedPreGap(200, 3 * WEEK + DAY); // just over the 3-week trigger
    const rec = DP.getSmartRecommendation(EX, null, null, NOW);
    expect(rec.status).toBe('RETURN DELOAD');
    // 200 × 0.70 = 140 → snaps to 140.
    expect(rec.kg).toBe(140);
    expect(rec.kg / 200).toBeCloseTo(0.7, 2);
    expect(rec.setsAdjust).toBe(-1);
  });

  it('5-day gap → NO deload (a missed session / rest week is normal)', () => {
    seedPreGap(200, 5 * DAY);
    const rec = DP.getSmartRecommendation(EX, null, null, NOW);
    expect(rec.status).not.toBe('RETURN DELOAD');
    expect(rec.setsAdjust).toBeUndefined();
    expect(rec.returnDeload).toBeUndefined();
    // Normal double-progression holds the pre-gap load (no detraining cut).
    expect(rec.kg).toBe(200);
  });

  it('deeper gap starts lower than a milder gap (monotonic depth)', () => {
    seedPreGap(200, 13 * WEEK);
    const deep = DP.getSmartRecommendation(EX, null, null, NOW).kg;
    seedPreGap(200, 3 * WEEK + DAY);
    const mild = DP.getSmartRecommendation(EX, null, null, NOW).kg;
    expect(deep).toBeLessThan(mild);
  });
});

describe('DP return-after-gap ramp — restores toward full over ~3-4 sessions', () => {
  // Build a history: a steady pre-gap session, a 3-month gap, then `n` comeback
  // sessions each ~2 days apart. The most recent comeback log carries `lastW`,
  // and the helper counts comeback logs after the gap boundary as the ramp index.
  /** @param {number[]} comebackWeights ordered oldest→newest comeback loads */
  function seedRamp(comebackWeights) {
    const gapEnd = NOW - 1 * DAY; // first comeback session a day before now
    const logs = [];
    // Comeback sessions (oldest first here; getLogs sorts DESC anyway).
    comebackWeights.forEach((w, i) => {
      logs.push({ ex: EX, w, reps: 10, rpe: 6.5, ts: gapEnd + i * 2 * DAY });
    });
    // Pre-gap working session 3 months before the first comeback log.
    const preGapTs = gapEnd - 13 * WEEK;
    logs.push({ ex: EX, w: 200, reps: 10, rpe: 7.5, ts: preGapTs });
    logs.push({ ex: EX, w: 200, reps: 10, rpe: 7.5, ts: preGapTs - 2 * DAY });
    store['logs'] = logs;
  }

  it('session 1 (one comeback logged) ramps above the deep start', () => {
    // First comeback was 120 (60%); session 1 should aim ~73% → 146 → snaps 140/150.
    seedRamp([120]);
    const rec = DP.getSmartRecommendation(EX, null, null, NOW + 1 * DAY);
    expect(rec.status).toBe('RETURN DELOAD');
    expect(rec.returnDeload.session).toBe(1);
    // 200 × (0.60 + 0.13) = 146 → still below pre-gap (no PR), above the 120 start.
    expect(rec.kg).toBeGreaterThan(120);
    expect(rec.kg).toBeLessThan(200);
  });

  it('ramp climbs each session and EXITS to full (no deload) by ~session 4', () => {
    // session 3: 0.60 + 3×0.13 = 0.99 → still a deload (just under full).
    seedRamp([120, 140, 160, 170]); // 4 comeback logs → session index 4
    const recExited = DP.getSmartRecommendation(EX, null, null, NOW + 4 * DAY);
    // multiplier 0.60 + 4×0.13 = 1.12 ≥ 1 → window complete → NO deload status.
    expect(recExited.status).not.toBe('RETURN DELOAD');
    expect(recExited.returnDeload).toBeUndefined();
  });
});

describe('DP return-after-gap — golden-safe no-ops', () => {
  it('no logs (cold start) → no deload', () => {
    store['logs'] = [];
    const rec = DP.getSmartRecommendation(EX, null, null, NOW);
    expect(rec.status).not.toBe('RETURN DELOAD');
    expect(rec.returnDeload).toBeUndefined();
  });

  it('a single 3-month-old log → deload (one logged session then a long break)', () => {
    store['logs'] = [{ ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - 13 * WEEK }];
    // The commonest comeback: one historical session, then 3 months off. The
    // gap-from-now path anchors the pre-gap load on that single log → deep deload.
    const rec = DP.getSmartRecommendation(EX, null, null, NOW);
    expect(rec.status).toBe('RETURN DELOAD');
    expect(rec.kg).toBe(120); // 200 × 0.60 deep deload
    expect(rec.returnDeload.session).toBe(0);
  });

  it('_returnDeload helper returns null when every gap is < 3 weeks', () => {
    store['logs'] = [
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - 2 * DAY },
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - 4 * DAY },
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - 6 * DAY },
    ];
    expect(DP._returnDeload(EX, NOW)).toBeNull();
  });
});
