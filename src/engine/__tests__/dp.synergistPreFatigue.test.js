// ══ DP ENGINE — INTRA-SESSION SYNERGIST PRE-FATIGUE discount ═════════════════
//
// The gap (founder, experienced lifter): a small muscle worked LATER in the
// session as an isolation is already PRE-FATIGUED if an earlier compound used it
// as a SYNERGIST (rows/pulldowns load the biceps; presses load the triceps; rows
// load the rear delts). The engine used to prescribe the isolation as if the
// muscle were fresh → the starting estimate ran too high. The new model shaves a
// MODEST, capped amount off the prescribed load when the isolation's target
// muscle accumulated genuine synergist set-volume earlier THIS session.
//
// REAL values + REAL session sequences only: actual library exercises (Cable Row
// / Lat Pulldown list biceps as muscle_target_secondary), actual rep ranges and
// equipment steps. We log a real working weight first (so DP runs its history
// branch, NOT cold-start INIT), then prescribe the isolation with vs. without the
// earlier compounds and assert the discount fires ONLY when prior synergist work
// exists.
//
// Distinct from _recordSessionBias (load-deviation bucket EMA — never crosses a
// compound onto a curl) and muscleRecovery (across-session hours): no double-count.

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

/** Seed a real, stable working history so DP runs its history branch (not INIT). */
function seedHistory(ex, w, reps, rpe) {
  const ts = Date.now() - 24 * 3600 * 1000;
  store['logs'] = [
    { ex, w, kg: w, reps: String(reps), ts, rpe, session: ts },
    { ex, w, kg: w, reps: String(reps), ts: ts - 1, rpe, session: ts - 1 },
    { ex, w, kg: w, reps: String(reps), ts: ts - 2, rpe, session: ts - 2 },
  ];
}

const BACK_COMPOUNDS = [
  { name: 'Cable Row', sets: 3 },     // spate · secondary ["biceps"] · high force
  { name: 'Lat Pulldown', sets: 4 },  // spate · secondary ["biceps"] · high force
];

describe('accumulateSynergistLoad — reads muscle_target_secondary × sets × force', () => {
  it('back compounds accumulate biceps synergist load (high-force weighted 1.0)', () => {
    const load = DP.accumulateSynergistLoad(BACK_COMPOUNDS);
    // Cable Row 3 sets × 1.0 + Lat Pulldown 4 sets × 1.0 = 7 weighted biceps sets.
    expect(load.biceps).toBeCloseTo(7, 5);
  });

  it('an exercise with no secondary muscles contributes nothing', () => {
    // Cable Curl primary=biceps, secondary=[] → no synergist contribution.
    const load = DP.accumulateSynergistLoad([{ name: 'Cable Curl', sets: 3 }]);
    expect(Object.keys(load)).toHaveLength(0);
  });

  it('empty / non-array prior list → empty load', () => {
    expect(DP.accumulateSynergistLoad([])).toEqual({});
    // @ts-expect-error intentional bad input
    expect(DP.accumulateSynergistLoad(null)).toEqual({});
  });
});

describe('synergistDiscountFraction — only small-muscle isolations with prior load', () => {
  it('Cable Curl (biceps iso) after back work → positive, capped discount', () => {
    const load = DP.accumulateSynergistLoad(BACK_COMPOUNDS);
    const f = DP.synergistDiscountFraction('Cable Curl', load);
    // 7 weighted sets × 0.012 = 0.084 (under the 0.12 cap).
    expect(f).toBeCloseTo(0.084, 5);
    expect(f).toBeLessThanOrEqual(DP.SYNERGIST_DISCOUNT_CAP);
  });

  it('no prior synergist load → zero discount (isolation came first)', () => {
    expect(DP.synergistDiscountFraction('Cable Curl', {})).toBe(0);
  });

  it('a big compound is NEVER discounted, even with prior synergist load', () => {
    const load = DP.accumulateSynergistLoad([{ name: 'Cable Row', sets: 3 }]);
    // Lat Pulldown is a compound (spate) — excluded from the small-muscle model.
    expect(DP.synergistDiscountFraction('Lat Pulldown', load)).toBe(0);
  });

  it('the discount is capped — huge prior volume never exceeds the cap', () => {
    const huge = { biceps: 1000 };
    expect(DP.synergistDiscountFraction('Cable Curl', huge)).toBe(DP.SYNERGIST_DISCOUNT_CAP);
  });
});

describe('getSmartRecommendation — biceps curl after back compounds is discounted', () => {
  it('Cable Curl after Cable Row + Lat Pulldown starts LOWER than fresh', () => {
    // REAL on-grid working weight: 54 kg × 11 @ potrivit (rpe 7.5). Cable Curl
    // runs the matrix_cable stack [..,50,54,59,..]; medium rating fills reps to
    // 12 and holds the load. 54 is the user's genuine working weight.
    seedHistory('Cable Curl', 54, 11, 7.5);

    const fresh = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, []);
    const afterBack = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, BACK_COMPOUNDS);

    // Fresh (curl first) → no discount, full working weight.
    expect(fresh.synergistDiscount).toBeUndefined();
    expect(fresh.kg).toBe(54);

    // After back work → 8.4% haircut → 54 × 0.916 = 49.5 → snaps DOWN one real
    // equipment step to 50. The biceps were pre-fatigued by 7 weighted synergist
    // sets (Cable Row 3 + Lat Pulldown 4, both high-force).
    expect(afterBack.synergistDiscount).toBeCloseTo(0.084, 5);
    expect(afterBack.kg).toBe(50);
    expect(afterBack.kg).toBeLessThan(fresh.kg);
    expect(afterBack.synergistKgBefore).toBe(54);
    expect(afterBack.synergistPreFatigue.biceps).toBeCloseTo(7, 5);
  });

  it('biceps curl done FIRST (no prior exercises) is unchanged — no discount', () => {
    seedHistory('Cable Curl', 54, 11, 7.5);
    const first = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, []);
    expect(first.synergistDiscount).toBeUndefined();
    expect(first.kg).toBe(54);
  });

  it('a triceps isolation after a press is discounted (press lists triceps secondary)', () => {
    // DB Shoulder Press primary=umeri, secondary=["triceps"], high force.
    seedHistory('Pushdown', 54, 11, 7.5); // triceps iso, matrix_cable [..,50,54,..]
    const press = [{ name: 'DB Shoulder Press', sets: 4 }]; // 4 × 1.0 = 4 triceps sets
    const fresh = DP.getSmartRecommendation('Pushdown', null, null, undefined, null, []);
    const afterPress = DP.getSmartRecommendation('Pushdown', null, null, undefined, null, press);
    // 4 × 0.012 = 0.048 → 54 × 0.952 = 51.4 → snaps down one step to 50.
    expect(afterPress.synergistDiscount).toBeCloseTo(0.048, 5);
    expect(afterPress.kg).toBe(50);
    expect(afterPress.kg).toBeLessThan(fresh.kg);
  });

  it('a coarse-grid light weight is honestly UNCHANGED when the haircut cannot move a step', () => {
    // 23 kg Cable Curl: 8.4% = 21.1, but the next stack step down is 18 (22% jump)
    // — too coarse. The model rounds back to 23 and, since it did not actually move
    // the load, reports NO discount (we never claim a discount we did not apply).
    seedHistory('Cable Curl', 23, 11, 7.5);
    const afterBack = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, BACK_COMPOUNDS);
    expect(afterBack.synergistDiscount).toBeUndefined();
    expect(afterBack.kg).toBe(23);
  });

  it('a different muscle isolation is NOT discounted by unrelated synergist load', () => {
    // Pushdown (triceps) after BACK compounds (which only load biceps) → no triceps
    // synergist load accumulated → no discount.
    seedHistory('Pushdown', 54, 11, 7.5);
    const afterBack = DP.getSmartRecommendation('Pushdown', null, null, undefined, null, BACK_COMPOUNDS);
    expect(afterBack.synergistDiscount).toBeUndefined();
    expect(afterBack.kg).toBe(54);
  });

  it('a big compound after other compounds is never discounted (model targets isolations)', () => {
    seedHistory('Lat Pulldown', 60, 10, 7.5);
    const afterRow = DP.getSmartRecommendation('Lat Pulldown', null, null, undefined, null, [
      { name: 'Cable Row', sets: 3 },
    ]);
    expect(afterRow.synergistDiscount).toBeUndefined();
    expect(afterRow.kg).toBe(60);
  });

  it('no double-count with _recordSessionBias: discount is a separate, additive layer', () => {
    // The synergist discount is computed from the PLAN (secondary tags × sets), not
    // from any logged-load deviation. With NO session-bias stored, the discount
    // still fires purely from prior synergist exercises → proves independence.
    seedHistory('Cable Curl', 54, 11, 7.5);
    expect(store['session-bias']).toBeUndefined();
    const afterBack = DP.getSmartRecommendation('Cable Curl', null, null, undefined, null, BACK_COMPOUNDS);
    expect(afterBack.synergistDiscount).toBeGreaterThan(0);
  });
});
