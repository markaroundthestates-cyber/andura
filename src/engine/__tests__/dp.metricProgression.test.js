// ══ DP ENGINE — carry/time metric progression (C16-METRIC-KG-SPIRAL) ═════════
//
// A TIME/CARRY metric exercise (Farmer's Walk, Plank, Pallof, …) is prescribed in
// SECONDS, not reps: the durable `logs` row carries reps:0 (no rep axis). dp's
// reps-based SCALE BACK gate (lastReps < ceil(rMin*0.5)) used to read that reps:0
// as a FAILED short rep set and drop the load one step EVERY session — a weight
// death-spiral (24→22.5→20→17.5→15kg) despite easy successful holds. The fix makes
// the reps-shortfall scale-back metric-aware (skipped for non-reps metrics), while
// the RPE/rating-driven ease for a genuinely-hard hold still fires.
//
// These tests use REAL production-shaped inputs: real metric exercises from the
// library (Farmer's Walk DB = carry, Plank = time), real reps:0 metric log rows,
// and the real getState → _recommendRaw path (no DP method stubs).

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

/** App-shape log entry DP.getLogs expects (ex + truthy w). reps:0 = a completed
 *  metric (time/carry) set — the durable row a SetLogInput seconds tile writes. */
function log(ex, w, reps, rpe) {
  return { ex, w, reps, rpe };
}

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK';
  // Pin the e1RM/load clusters OFF so the classic raw-kg branches (SCALE BACK,
  // INCREASE, EASE BACK) are individually exercised — same explicit-OFF baseline
  // the dp.branches suite uses (registry defaults are now ON post 2026-06-08 flip).
  try {
    localStorage.setItem('_devFlags', JSON.stringify({
      dp_e1rm_v1: false, dp_strength_kalman_v1: false, dp_ceiling_v1: false,
      dp_rep_class_v1: false, dp_load_model_v1: false, dp_base_lookback_v1: false,
    }));
  } catch { /* jsdom always provides localStorage */ }
});

const CARRY = "Farmer's Walk DB"; // metric_type: carry (library)
const TIME = 'Plank';             // metric_type: time  (library)
const REPS = 'Cable Row';         // metric_type: reps  (default — the control)

describe('DP carry/time metric progression — no weight death-spiral', () => {
  it('a carry set logged reps:0 at EASY RPE HOLDS-or-INCREASES the load (no scale-back)', () => {
    // Easy successful 24 kg carry, no rep axis (reps:0). The old gate read reps:0
    // as ≤50%-of-min → SCALE BACK to 22.5; the fix must NOT scale back.
    store['logs'] = [log(CARRY, 24, 0, 6.5)];
    const rec = DP.recommend(CARRY);
    expect(rec.status).not.toBe('SCALE BACK');
    expect(rec.kg).toBeGreaterThanOrEqual(24); // held at 24 or progressed up
  });

  it('a time set logged reps:0 at EASY RPE does not death-spiral over 3 sessions', () => {
    // Three consecutive easy holds at 12 kg with reps:0 (a weighted plank). Each
    // session must HOLD-or-INCREASE — never the 12→10→8 scale-back cascade.
    let kg = 12;
    for (let s = 0; s < 3; s++) {
      store['logs'] = [log(TIME, kg, 0, 6.5)];
      const rec = DP.recommend(TIME);
      expect(rec.status, `session ${s}`).not.toBe('SCALE BACK');
      expect(rec.kg, `session ${s} must not drop below ${kg}`).toBeGreaterThanOrEqual(kg);
      kg = rec.kg; // carry the rec forward — proves no monotone decay
    }
    expect(kg).toBeGreaterThanOrEqual(12);
  });

  it('a genuinely-HARD metric hold (high RPE) still EASES per RPE', () => {
    // reps:0 + a hard rating (rpe 9) is real distress on the hold → the RPE-driven
    // ease must still lighten the load one step (the safety path stays alive).
    store['logs'] = [log(CARRY, 24, 0, 9)];
    const rec = DP.recommend(CARRY);
    expect(rec.kg).toBeLessThan(24); // eased one equipment step down
    expect(rec.status).toBe('EASE BACK');
  });

  it('a REPS exercise with low reps STILL scales back (control — unchanged)', () => {
    // A normal weight×reps lift that actually fell short (3 reps vs an 8-min range)
    // must still scale back — the fix is scoped to non-reps metrics only.
    store['logs'] = [log(REPS, 50, 3, 7)];
    const rec = DP.recommend(REPS);
    expect(rec.status).toBe('SCALE BACK');
    expect(rec.kg).toBeLessThan(50);
  });
});
