// ══ DP ENGINE — DEEP ADAPTATION (PR-floor + find-your-weight + phase push) ════
//
// Daniel decision #6 (APPROVED, phase-aware nuance). The hardened sim
// (_SIM_REVALIDATE v2) proved the core defect: a user who FOLLOWS the coach never
// converges (trusts_coach 0.6%, timid −0.701 collapse) because the engine seeds an
// under-low cold-start then climbs one small rep-ladder step per session (~30
// sessions to reach the real working weight); only override-UP users converge
// (ego_lifter 11%). Three mechanisms fix it:
//   (a) PR-FLOOR — the rec never drops below the demonstrated working capacity (the
//       heaviest load completed at target reps) → stops the timid down-ratchet.
//       EXEMPT during an active return-deload window (the comeback starts light).
//   (b) FIND-YOUR-WEIGHT catch-up — when the rec sits below demonstrated/plausible
//       capacity AND the user keeps logging usor while hitting reps, climb in BIG
//       steps (toward the demonstrated load) in ~2-3 sessions, not ~30. ALL phases.
//   (c) PHASE-AWARE push ABOVE established capacity: STRENGTH/BULK aggressive, CUT
//       restrained (no new PR while under-fuelled), AUTO normal double progression.
//
// REAL production values: Leg Press, 5 kg plate stack (reachable above true cap),
// rpe scale usor=6.5 / potrivit=7.5 / greu=8.5 (workoutStore RATING_TO_RPE).
// DB mocked with a mutable store (mirrors dp.returnDeload.test.js).

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

const EX = 'Leg Press'; // 5kg plate stack, room above true capacity
const DAY = 24 * 3600 * 1000;
// Fixed "now" 1 day after the last seeded log → no return-gap, real-clock-safe.
const NOW = new Date(2026, 5, 1, 12, 0, 0).getTime();

/**
 * Seed N recent sessions at a fixed weight/reps/rating, 2 days apart, ending 1 day
 * before NOW (so no return-gap is triggered).
 * @param {number} w @param {number} reps @param {number} rpe @param {number} n
 */
function seed(w, reps, rpe, n = 4) {
  const logs = [];
  for (let i = 0; i < n; i++) {
    logs.push({ ex: EX, w, reps, rpe, ts: NOW - DAY - i * 2 * DAY });
  }
  store['logs'] = logs; // newest-first
}

beforeEach(() => {
  store = {};
  store['phase-override'] = 'AUTO';
});

describe('DP deep adaptation — (a) PR-FLOOR', () => {
  it('a timid user rating greu cannot ratchet the rec below a proven working load', () => {
    // Proven: completed 150 kg at target reps; then rates the same load greu (but
    // still HIT the reps — not a failed set). The old EASE-BACK would step down.
    store['logs'] = [
      { ex: EX, w: 150, reps: 9, rpe: 8.5, ts: NOW - DAY },
      { ex: EX, w: 150, reps: 10, rpe: 8.5, ts: NOW - 3 * DAY },
      { ex: EX, w: 150, reps: 10, rpe: 7.5, ts: NOW - 5 * DAY },
    ];
    const rec = DP.recommend(EX, NOW);
    // PR-floor holds: never below the demonstrated 150.
    expect(rec.kg).toBeGreaterThanOrEqual(150);
  });

  it('a sustained greu-with-FAILED-reps run still floors at the proven completed load', () => {
    // Demonstrated 150 (completed at reps), then two failed/overload sets below rMin.
    // EASE-BACK fires, but the floor (the heaviest COMPLETED-at-reps load) stops it
    // from going below 150 — the user owns 150, the failed grind does not erase it.
    store['logs'] = [
      { ex: EX, w: 160, reps: 4, rpe: 8.5, ts: NOW - DAY },        // failed (below rMin)
      { ex: EX, w: 160, reps: 5, rpe: 8.5, ts: NOW - 3 * DAY },    // failed
      { ex: EX, w: 150, reps: 10, rpe: 7.5, ts: NOW - 5 * DAY },   // proven completed
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBeGreaterThanOrEqual(150);
  });

  it('a brand-new user (no logs) is unaffected by the floor (cold start byte-safe)', () => {
    const rec = DP.recommend(EX, NOW);
    expect(rec.status).toBe('INIT');
  });

  it('EXEMPTION: an active return-deload window may sit below the floor', () => {
    store['phase-override'] = 'BULK';
    // Proven 200, then a ~3-month gap → the comeback intentionally deloads below 200.
    // (RETURN DELOAD status is applied by getSmartRecommendation; the floor in
    // recommend() is skipped while a return-deload window is active.)
    const GAP = 13 * 7 * DAY;
    store['logs'] = [
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - GAP },
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - GAP - 2 * DAY },
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - GAP - 4 * DAY },
    ];
    const rec = DP.getSmartRecommendation(EX, null, null, NOW);
    expect(rec.status).toBe('RETURN DELOAD');
    expect(rec.kg).toBeLessThan(200); // floor exempted — comeback is light by design
  });
});

describe('DP deep adaptation — (b) FIND-YOUR-WEIGHT fast climb', () => {
  it('an under-seeded follower (rec 40, true ~90) reaches working weight in <=3 sessions, not 30', () => {
    // The user keeps logging usor and HITTING reps at the under-seeded load. The
    // rec must climb in BIG steps (not +1 rep). Drive a few sessions and assert the
    // rec roughly trebles toward the real working weight inside 3 sessions.
    let w = 40;
    const reps = 10;
    let sessions = 0;
    for (let i = 0; i < 3; i++) {
      seed(w, reps, 6.5, 4); // a run of usor-at-target at the current load
      const rec = DP.recommend(EX, NOW);
      w = rec.kg;
      sessions++;
      if (w >= 80) break;
    }
    expect(sessions).toBeLessThanOrEqual(3);
    expect(w).toBeGreaterThanOrEqual(80); // reached ~working weight fast
  });

  it('climbs straight toward a heavier DEMONSTRATED load (override-up / re-seed)', () => {
    // The user once completed 200 at target reps; the rec is currently low (150) and
    // the last set was usor-at-reps → catch up toward the proven load, not +1 rep.
    // dp_e1rm_v1 ON (THE FLIP 2026-06-08): the "demonstrated load" is now the e1RM of
    // the proven set, not its raw kg. 200×10 @ potrivit (RIR 1) is an e1RM of 273; the
    // equivalent load at the 8-rep floor is ≈210kg, which on Leg Press's coarse stack
    // (200/220) snaps to the nearest rung 220. The catch-up (rir 3, deliberately
    // conservative) climbs toward that e1RM-credited 8-rep capacity, bounded by the
    // exercise MAX_KG. It still cannot exceed the e1RM ceiling (dp_ceiling_v1).
    store['logs'] = [
      { ex: EX, w: 150, reps: 12, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - 3 * DAY },
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBeGreaterThan(150);
    // Climbs to the e1RM-credited 8-rep equivalent of the proven 200×10 (≈210 → snaps
    // to the 220 rung), never an unbounded jump (well under 2× the proven load).
    expect(rec.kg).toBeLessThanOrEqual(220);
    expect(rec.kg).toBeLessThan(200 * 2);
  });

  it('a hard-but-hit set HOLDS — the climb does not fight the ease-back', () => {
    // Single greu at target reps (working intensity) → no climb, no ease (hold path).
    seed(150, 10, 8.5, 1);
    store['logs'] = [{ ex: EX, w: 150, reps: 10, rpe: 8.5, ts: NOW - DAY }];
    const rec = DP.recommend(EX, NOW);
    expect(rec.status).not.toBe('CATCH UP');
    expect(rec.kg).toBeGreaterThanOrEqual(150); // floor + hold, never eased below proven
  });
});

describe('DP deep adaptation — (c) PHASE-AWARE push above established capacity', () => {
  it('CUT: at the established working weight (potrivit), an easy set does NOT chase a new PR', () => {
    store['phase-override'] = 'CUT';
    // Established working weight = where it feels potrivit (true capacity). One easy
    // set there, at top reps, must NOT push a new max in a deficit → hold/maintain.
    // (A sustained-usor run would mean BELOW true capacity and SHOULD climb even in a
    // cut — that is the find-your-weight catch-up; this scenario is at-capacity.)
    store['logs'] = [
      { ex: EX, w: 150, reps: 12, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 150, reps: 12, rpe: 7.5, ts: NOW - 3 * DAY }, // potrivit breaks the usor run
    ];
    const rec = DP.recommend(EX, NOW);
    // dp_e1rm_v1 ON (THE FLIP 2026-06-08): the status stays MAINTAIN (no new-max
    // CHASE in a deficit — the CUT restraint references the proven load and the
    // sustained-usor climb is suppressed). The PR-FLOOR re-expresses the held 150×12
    // working load at the 8-rep floor (e1RM equivalent ≈160): this is NOT a new max —
    // it is the SAME demonstrated capacity at a heavier-but-lower-rep prescription,
    // so a deficit user is held at their real working level (160@8 ≡ 150@12), labeled
    // MAINTAIN. The coach is not pushing past what the user already did.
    expect(rec.status).toBe('MAINTAIN');
    expect(rec.kg).toBe(160); // e1RM 8-rep equivalent of the proven 150×12 (held, not chased)
  });

  it('STRENGTH: an easy set pushes the WEIGHT up aggressively even below top reps', () => {
    store['phase-override'] = 'STRENGTH';
    // An easy set below top reps → drive the WEIGHT up (chase strength). dp_e1rm_v1
    // ON (THE FLIP 2026-06-08): 150×9 @ usor (RIR 3) credits an e1RM whose 8-rep
    // equivalent is ≈160, so the climb routes through the find-your-weight CATCH UP to
    // that demonstrated capacity (rather than the +1-step INCREASE). Either way the
    // WEIGHT goes up — the strength intent is met (the e1RM path just reaches the real
    // working load in one move instead of laddering).
    store['logs'] = [
      { ex: EX, w: 150, reps: 9, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 150, reps: 9, rpe: 8.5, ts: NOW - 3 * DAY }, // prior hard → run length 1
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBeGreaterThan(150); // chase strength — drive load up
    expect(rec.status).toBe('CATCH UP'); // e1RM find-your-weight climb to the credited load
  });

  it('AUTO/MAINTENANCE-style: an easy set below top reps catches up to the e1RM working load', () => {
    store['phase-override'] = 'MAINTENANCE';
    // Single easy set below top reps. dp_e1rm_v1 ON (THE FLIP 2026-06-08): 150×9 @
    // usor credits a higher demonstrated working load (8-rep equivalent ≈160), so the
    // coach climbs the WEIGHT toward that credited load (CATCH UP) instead of only
    // adding a rep at 150. The user demonstrated capacity above their logged 150×9 —
    // the find-your-weight catch-up surfaces it. (The pure raw +1-rep double-
    // progression is covered by the e1RM-OFF dp.branches CONSOLIDATE tests.)
    store['logs'] = [
      { ex: EX, w: 150, reps: 9, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 150, reps: 9, rpe: 8.5, ts: NOW - 3 * DAY }, // prior hard → run length 1
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBe(160);            // e1RM-credited 8-rep working load
    expect(rec.status).toBe('CATCH UP');
  });
});

// ══ #79 — REALISTIC-1RM CAP on the demonstrated working load (no "5×1RM") ═════
// Daniel: "daca face 10x200 nu poate sa ii recomande peste 1rm… sa nu ne trezim cu
// 5xrm." Epley over-estimates the 1RM at high reps: a 200×10 set credits an e1RM
// (≈280) that, back-solved to a heavier-but-lower-rep prescription, exceeds what the
// user actually lifted — an unsafe over-extrapolation across rep schemes. The cap
// (_ceilingCappedWorkingKg) bounds the demonstrated working load at the realistic
// ceiling, FLOORED at the heaviest RAW load actually lifted at >= the target reps —
// so a working set of N reps is always physically achievable, while a genuinely
// PROVEN heavy set is never demoted (anti-crater). Flags ON via _devFlags.
describe('DP #79 — working load capped below the realistic 1RM (no 5×1RM)', () => {
  beforeEach(() => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_e1rm_v1: true, dp_ceiling_v1: true }));
    store['weights'] = { '2026-01-01': 100 }; // bodyweight → finite ceiling
  });

  it('a 200×10 high-rep set never back-solves a working load HEAVIER than the lifted load', () => {
    const ex = 'Barbell Back Squat (High Bar)';
    // ONE high-rep, easy (usor) set: Epley credits e1RM ≈ 200×1.4 = 280, which at the
    // 5-rep target would back-solve to ≈233 (200×(1.4/1.2)) — HEAVIER than the 200 the
    // user actually moved. That is the "5×1RM" over-extrapolation the cap forbids.
    store['logs'] = [{ ex, w: 200, reps: 10, rpe: 6.5, ts: NOW - DAY }];
    const demoKg = DP._demonstratedWorkingW_e1rm(ex, 5);
    // The cap holds the working load to the load actually lifted (200) — never the
    // inflated 233. A 200×5 prescription is achievable (they did 200×10).
    expect(demoKg).toBeLessThanOrEqual(200 + 1e-6);
    expect(demoKg).toBeGreaterThan(0);
    // And its implied 1RM (Epley at the 5-rep target) is below the raw set's own e1RM
    // (the inflated 280) — i.e. the prescription does not chase the over-estimate.
    const impliedE1RM = demoKg * (1 + Math.min(DP.E1RM_R_CAP, 5 + DP.RATING_TO_RIR.potrivit) / 30);
    expect(impliedE1RM).toBeLessThan(280);
  });

  it('a GENUINELY heavy proven set (140×8 at-target) is NOT cratered by the cap', () => {
    const ex = 'Barbell Back Squat (High Bar)';
    // 140×8 greu HIT the target → demonstrated capacity. The realistic-ceiling ESTIMATE
    // at this LOW training age sits BELOW 140's implied 1RM, so an unfloored ceiling
    // clamp WOULD demote the proven load. The crater-safe floor (max(ceiling, raw
    // demonstrated)) stops that: the cap leaves the e1RM working load UNCHANGED vs the
    // same computation with the cap OFF (the ceiling never bites a proven set).
    store['logs'] = [{ ex, w: 140, reps: 8, rpe: 8.5, ts: NOW - DAY }];
    const capped = DP._demonstratedWorkingW_e1rm(ex, 8);
    localStorage.setItem('_devFlags', JSON.stringify({ dp_e1rm_v1: true, dp_ceiling_v1: false }));
    const uncapped = DP._demonstratedWorkingW_e1rm(ex, 8);
    expect(capped).toBeCloseTo(uncapped, 6); // proven load untouched by the cap (floor protects it)
  });

  it('OFF (dp_ceiling_v1) → byte-identical (no cap, the e1RM extrapolation stands)', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_e1rm_v1: true, dp_ceiling_v1: false }));
    const ex = 'Barbell Back Squat (High Bar)';
    store['logs'] = [{ ex, w: 200, reps: 10, rpe: 6.5, ts: NOW - DAY }];
    const demoKg = DP._demonstratedWorkingW_e1rm(ex, 5);
    // No cap → the full cross-rep e1RM back-solve (≈233, heavier than the 200 lifted).
    expect(demoKg).toBeGreaterThan(200);
  });
});
