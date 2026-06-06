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
    // the last set was usor-at-reps → catch up toward the proven 200, not +1 rep.
    store['logs'] = [
      { ex: EX, w: 150, reps: 12, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 200, reps: 10, rpe: 7.5, ts: NOW - 3 * DAY },
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBeGreaterThan(150);
    expect(rec.kg).toBeLessThanOrEqual(200); // never overshoot the demonstrated load
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
    expect(rec.kg).toBe(150);          // held — no new-max climb in a deficit
    expect(rec.status).toBe('MAINTAIN');
  });

  it('STRENGTH: an easy set pushes the WEIGHT up aggressively even below top reps', () => {
    store['phase-override'] = 'STRENGTH';
    // A single easy set below top reps (not a sustained-usor run) → the STRENGTH
    // EASY branch drives the WEIGHT up rather than only adding a rep.
    store['logs'] = [
      { ex: EX, w: 150, reps: 9, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 150, reps: 9, rpe: 8.5, ts: NOW - 3 * DAY }, // prior hard → run length 1
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBeGreaterThan(150); // chase strength — drive load up
    expect(rec.status).toBe('INCREASE');
  });

  it('AUTO/MAINTENANCE-style: a single easy set below top reps fills reps (normal double progression)', () => {
    store['phase-override'] = 'MAINTENANCE';
    // Single easy set below top reps (no sustained-usor run) → standard double
    // progression: hold the weight, raise the rep target.
    store['logs'] = [
      { ex: EX, w: 150, reps: 9, rpe: 6.5, ts: NOW - DAY },
      { ex: EX, w: 150, reps: 9, rpe: 8.5, ts: NOW - 3 * DAY }, // prior hard → run length 1
    ];
    const rec = DP.recommend(EX, NOW);
    expect(rec.kg).toBe(150);
    expect(rec.repsTarget).toBeGreaterThan(9);
  });
});
