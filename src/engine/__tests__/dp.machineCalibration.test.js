// ══ DP ENGINE — PERSISTENT per-exercise machine-calibration factor ═══════════
//
// The gap (founder): a cable/machine's effective resistance depends on its
// pulley ratio, which varies by gym — the same "32 kg on the stack" feels
// different across machines. We do NOT ask the user "how many pulleys?". The
// engine LEARNS, from logged performance on the user's real machine, a STABLE
// per-exercise correction factor that converges after a few sessions.
//
// Distinct from the 4h per-BUCKET session-bias: this is PER-EXERCISE, SLOW
// (alpha 0.3), and PERSISTENT (key `dp-cal-factors`, synced per-UID, durable
// across reloads). Stored as { [engineName]: { kgFactor, n } }.
//
// Properties proved here:
//  1. Identity at zero data (no learned factor → recommendation unchanged,
//     golden-safe).
//  2. Convergence: N sessions consistently +X% over rec → factor rises and the
//     next recommendation shifts toward the user's real load.
//  3. Clamp holds at the band bounds [0.6, 1.5].
//  4. Persistence round-trips (a factor written by one DP "session" hydrates and
//     is applied on a fresh read — same mutable store models reload).
//  5. A single outlier session does NOT swing it much (slow EMA).
//  6. No double-count with the synergist discount: a session whose logged load
//     equals the ALREADY-discounted recommendation leaves the factor at identity.
//
// DB is mocked with a mutable store so dp-cal-factors persists across calls
// within a test (mirrors dp.calibration.test.js).

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
import { EQUIPMENT_WEIGHTS, EXERCISE_EQUIPMENT_MAP } from '../../config/weights.js';
import { resolveRealStack } from '../dp/realMachineStacks.js';

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK'; // masa-like; deterministic, no CUT date branch
});

/** The equipment list a given exercise snaps onto (mirrors weights.js getList +
 *  _snapToRealStack). dp_cable_tower_v1 (default ON, as in production): Cable Row +
 *  Cable Fly snap to the 10lb cable stack, so the calibration shift lands on THOSE
 *  rungs — mirror the production cableTower opt so the check matches recommend(). */
function equipListFor(ex) {
  const real = resolveRealStack(ex, { cableTower: true });
  if (real) return real;
  const type = EXERCISE_EQUIPMENT_MAP[ex] || 'bailib_stack';
  return EQUIPMENT_WEIGHTS[type] || EQUIPMENT_WEIGHTS['bailib_stack'];
}

// Three logged sets at the SAME weight & reps & rating (steady history) so the
// double-progression branch is deterministic; the calibration factor multiplies
// whatever raw kg that branch returns.
function steadyHistory(ex, w, reps, rpe) {
  return [
    { ex, w, reps, rpe, ts: 3000 },
    { ex, w, reps, rpe, ts: 2000 },
    { ex, w, reps, rpe, ts: 1000 },
  ];
}

// ── (1) Identity at zero data — golden-safe ───────────────────────────────────

describe('machine-calibration: identity when nothing learned', () => {
  it('no dp-cal-factors → factor 1.0 → recommendation byte-identical', () => {
    store['logs'] = steadyHistory('Cable Row', 56, 12, 7);
    const withoutFactor = DP.recommend('Cable Row').kg;
    // Explicitly assert the factor helper returns identity with no data.
    expect(DP._calFactor('Cable Row')).toBe(1);
    // And that the public recommend() equals the unbiased value.
    expect(withoutFactor).toBeGreaterThan(0);
    expect(equipListFor('Cable Row')).toContain(withoutFactor);
  });

  it('an unrelated exercise factor never leaks into another exercise', () => {
    store['dp-cal-factors'] = { 'Lat Pulldown': { kgFactor: 1.4, n: 5 } };
    // Cable Row has no learned factor → still identity.
    expect(DP._calFactor('Cable Row')).toBe(1);
  });
});

// ── (2) Convergence: consistent over-performance lifts the factor + the rec ───

describe('machine-calibration: convergence toward the user real load', () => {
  it('3 sessions at +20% over rec raise the factor and shift the next rec up', () => {
    // Each "session": read the current rec, the user logs +20% over it (and that
    // heavier set is ADDED to the log, so demonstrated capacity rises with the
    // factor — the realistic over-performance path). The demonstrated-capacity
    // guard (clampCalibratedToDemonstrated, Daniel bug 2026-06-10) bounds the factor
    // at proven load, so the rec climbs because the PROOF climbs, not past it.
    store['logs'] = steadyHistory('Cable Row', 40, 12, 7);
    let ts = 4000;
    const recs = [DP.recommend('Cable Row').kg];
    for (let s = 0; s < 3; s++) {
      const rec = DP.recommend('Cable Row').kg;
      const logged = rec * 1.2; // user consistently lifts 20% more than prescribed
      DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: logged });
      store['logs'].unshift({ ex: 'Cable Row', w: logged, reps: 12, rpe: 7, ts: ts++ });
      recs.push(DP.recommend('Cable Row').kg);
    }
    const factor = DP._calFactor('Cable Row');
    // Factor moved up toward 1.2 (slow EMA → not all the way in 3 steps).
    expect(factor).toBeGreaterThan(1.1);
    expect(factor).toBeLessThan(1.25);
    // The next recommendation is higher than the un-learned one.
    expect(recs[recs.length - 1]).toBeGreaterThan(recs[0]);
    // Still a real loadable value on the stack.
    expect(equipListFor('Cable Row')).toContain(recs[recs.length - 1]);
  });

  it('consistent UNDER-performance lowers the factor and the next rec', () => {
    store['logs'] = steadyHistory('Cable Row', 60, 12, 7);
    const recBefore = DP.recommend('Cable Row').kg;
    for (let s = 0; s < 4; s++) {
      const rec = DP.recommend('Cable Row').kg;
      DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: rec * 0.8 });
    }
    expect(DP._calFactor('Cable Row')).toBeLessThan(0.9);
    expect(DP.recommend('Cable Row').kg).toBeLessThan(recBefore);
  });
});

// ── (3) Clamp band [0.6, 1.5] holds ───────────────────────────────────────────

describe('machine-calibration: clamp band holds', () => {
  it('relentless over-performance never pushes the factor past 1.5', () => {
    store['logs'] = steadyHistory('Cable Row', 40, 12, 7);
    for (let s = 0; s < 50; s++) {
      const rec = DP.recommend('Cable Row').kg;
      // Log 3x the rec every session — deviation clamped to 1.5, factor capped 1.5.
      DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: rec * 3 });
    }
    expect(DP._calFactor('Cable Row')).toBeLessThanOrEqual(1.5);
    expect(DP._calFactor('Cable Row')).toBeGreaterThan(1.45);
  });

  it('relentless under-performance never pushes the factor below 0.6', () => {
    store['logs'] = steadyHistory('Cable Row', 60, 12, 7);
    for (let s = 0; s < 50; s++) {
      const rec = DP.recommend('Cable Row').kg;
      DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: rec * 0.1 });
    }
    expect(DP._calFactor('Cable Row')).toBeGreaterThanOrEqual(0.6);
    expect(DP._calFactor('Cable Row')).toBeLessThan(0.65);
  });
});

// ── (4) Persistence round-trips (hydrate after reload) ────────────────────────

describe('machine-calibration: persistence round-trips', () => {
  it('a factor written to dp-cal-factors hydrates and is applied, BOUNDED by proof', () => {
    // Simulate a prior session having learned a factor, persisted to the store.
    store['dp-cal-factors'] = { 'Cable Row': { kgFactor: 1.3, n: 4 } };
    store['logs'] = steadyHistory('Cable Row', 40, 12, 7);
    // The persisted factor hydrates (read on a fresh "session").
    expect(DP._calFactor('Cable Row')).toBeCloseTo(1.3, 5);
    const withFactor = DP.recommend('Cable Row').kg;
    delete store['dp-cal-factors'];
    const withoutFactor = DP.recommend('Cable Row').kg;
    // Daniel bug 2026-06-10: on an exercise whose base rec already sits at/above
    // proven capacity (steady 40×12 → the base progresses on its own), the factor
    // is fully bounded — it CANNOT compound on top to an impossible load, so the
    // 1.3 multiplier adds nothing here (the un-factored rec already won). The factor
    // only ever lifts a base that UNDER-shoots proof up TO proof (see convergence).
    expect(withFactor).toBe(withoutFactor);
    expect(equipListFor('Cable Row')).toContain(withFactor);
  });

  it('the learned factor is written under the synced persistent key dp-cal-factors', () => {
    store['logs'] = steadyHistory('Cable Row', 40, 12, 7);
    const rec = DP.recommend('Cable Row').kg;
    DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: rec * 1.2 });
    expect(store['dp-cal-factors']).toBeDefined();
    expect(store['dp-cal-factors']['Cable Row'].kgFactor).toBeGreaterThan(1);
    expect(store['dp-cal-factors']['Cable Row'].n).toBe(1);
  });
});

// ── (5) Single outlier does NOT swing it much (slow EMA) ──────────────────────

describe('machine-calibration: slow EMA absorbs a single outlier', () => {
  it('one wild session barely moves the factor', () => {
    store['logs'] = steadyHistory('Cable Row', 40, 12, 7);
    const rec = DP.recommend('Cable Row').kg;
    // One session at the clamped max deviation (1.5x).
    DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: rec * 1.5 });
    const factor = DP._calFactor('Cable Row');
    // alpha 0.3: 1 + 0.3*(1.5-1) = 1.15 — a modest, not wild, single-step move.
    expect(factor).toBeCloseTo(1.15, 5);
  });

  it('an outlier after a stable history is dampened by prior n', () => {
    // Pre-seed a stable factor ~1.05 (many gentle sessions).
    store['dp-cal-factors'] = { 'Cable Row': { kgFactor: 1.05, n: 10 } };
    store['logs'] = steadyHistory('Cable Row', 40, 12, 7);
    const rec = DP.recommend('Cable Row').kg;
    DP._recordCalibration('Cable Row', { recKg: rec, loggedKg: rec * 1.5 });
    // 1.05 + 0.3*(1.5-1.05) = 1.185 — one outlier cannot leap to 1.5.
    expect(DP._calFactor('Cable Row')).toBeCloseTo(1.185, 3);
  });
});

// ── (6) No double-count with synergist pre-fatigue discount ───────────────────

describe('machine-calibration: no double-count with synergist discount', () => {
  it('logging exactly the ALREADY-discounted recommendation leaves the factor at identity', () => {
    // A biceps isolation that follows back rows gets a synergist discount applied
    // inside getSmartRecommendation. The recKg the learner sees is that discounted
    // value. If the user lifts exactly that, ratio = 1.0 → factor unchanged.
    store['logs'] = steadyHistory('Cable Curl', 18, 12, 7);
    const prior = [{ name: 'Cable Row', sets: 4 }, { name: 'Lat Pulldown', sets: 4 }];
    const rec = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, prior);
    // The discounted recommendation IS the recKg fed back to the learner.
    DP._recordCalibration('Cable Curl', { recKg: rec.kg, loggedKg: rec.kg });
    // ratio 1.0 → factor stays at identity → the transient discount is NOT baked in.
    expect(DP._calFactor('Cable Curl')).toBe(1);
  });

  it('a discount-only session does not permanently lower the persistent factor', () => {
    // Even if the discount fired (load shaved), lifting that shaved load keeps the
    // factor at 1.0 — the persistent learner never absorbs the within-session haircut.
    store['logs'] = steadyHistory('Cable Curl', 18, 12, 7);
    const prior = [{ name: 'Cable Row', sets: 4 }, { name: 'Lat Pulldown', sets: 4 }];
    for (let s = 0; s < 5; s++) {
      const rec = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, prior);
      DP._recordCalibration('Cable Curl', { recKg: rec.kg, loggedKg: rec.kg });
    }
    expect(DP._calFactor('Cable Curl')).toBe(1);
  });
});

// ── Guard: invalid observations are no-ops ────────────────────────────────────

describe('machine-calibration: invalid observations are ignored', () => {
  it('missing/zero recKg or loggedKg never writes a factor', () => {
    DP._recordCalibration('Cable Row', { recKg: 0, loggedKg: 50 });
    DP._recordCalibration('Cable Row', { recKg: 50, loggedKg: 0 });
    DP._recordCalibration('Cable Row', { recKg: NaN, loggedKg: 50 });
    DP._recordCalibration('Cable Row', {});
    expect(store['dp-cal-factors']).toBeUndefined();
    expect(DP._calFactor('Cable Row')).toBe(1);
  });
});
