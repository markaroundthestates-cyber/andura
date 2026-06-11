// ══ DP ENGINE — Bug 4 adaptive calibration + Bug B snapping gate ═════════════
//
// Two new behaviors, engine side:
//  (A) Per-exercise intra-session calibration on a FIRST-EVER session. The old
//      checkInSessionAdjust bailed whenever there was no prior DP history, so a
//      brand-new user's first session never adapted. Now a logged kg/reps + a
//      rating calibrate the NEXT set even with zero history.
//  (A2) Per-session BUCKETED bias. What we learn on a compound/large-muscle lift
//      transfers to other compound/large-muscle lifts, NOT to a biceps curl.
//      The bias shifts the STARTING recommendation of subsequent exercises.
//  (B) Snapping gate. Every weight the engine returns to be displayed exists in
//      the exercise's real equipment stack (his machines have 27/32, never 26).
//
// DB is mocked with a mutable store so session-bias persists across calls within
// a test (mirrors dp.branches.test.js).

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

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK'; // masa-like → reps autoregulation
});

/** The equipment list a given exercise snaps onto (mirrors weights.js getList). */
function equipListFor(ex) {
  const type = EXERCISE_EQUIPMENT_MAP[ex] || 'bailib_stack';
  return EQUIPMENT_WEIGHTS[type] || EQUIPMENT_WEIGHTS['bailib_stack'];
}

// ── (A) Intra-session calibration on a first-ever (no-history) session ────────

describe('checkInSessionAdjust — first-ever session calibrates intra-session', () => {
  it('a hard (greu) set eases the NEXT set even with ZERO prior history', () => {
    // No logs at all → dpState.lastW is 0. Old gate returned {adjust:false}.
    // STICKY (gym-log arc 2026-06-11): the user moved 56 kg TODAY and rated it greu,
    // so even cold-start the next set eases the WEIGHT one step off the just-logged
    // load (weight-first, not a rep trim — holding kg reads as "coach did nothing").
    store['logs'] = [];
    const r = DP.checkInSessionAdjust('Cable Row', [10], [10], {
      recKg: 56, recReps: 10, loggedKg: 56, setIdx: 1,
    });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newKg).toBeLessThan(56); // eased off the just-logged load
  });

  it('beating the target on a first session nudges the next set up (small step)', () => {
    store['logs'] = [];
    // usor + at/over target → nudge reps up one (masa), weight held.
    const r = DP.checkInSessionAdjust('Cable Row', [6.5], [12], {
      recKg: 56, recReps: 11, loggedKg: 56, setIdx: 0,
    });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newReps).toBeGreaterThan(11);
  });

  it('still returns no-adjust when there is genuinely nothing to calibrate (no logged load, no history)', () => {
    store['logs'] = [];
    // No loggedKg in ctx AND no history → loggedKg falls back to 0 → bail.
    const r = DP.checkInSessionAdjust('Cable Row', [10], [10], { recKg: 56, recReps: 10 });
    expect(r.adjust).toBe(false);
  });
});

// ── (A2) Per-session BUCKETED bias does NOT leak across buckets ───────────────

describe('per-session bucketed bias', () => {
  it('a heavier-than-estimated compound/large set lifts the START of OTHER compound/large lifts', () => {
    store['logs'] = [];
    // User logged FAR above the recommendation on a compound/large lift.
    // Cable Row rec 40 kg, actually lifted 60 kg, felt easy → bucket bias up.
    DP.checkInSessionAdjust('Cable Row', [6.5], [12], {
      recKg: 40, recReps: 10, loggedKg: 60, setIdx: 0,
    });
    // Lat Pulldown is the SAME bucket (compound/large/high). Its first-session
    // starting estimate must be lifted above the bare conservative 20 kg floor.
    const latStart = DP._recommendRaw('Lat Pulldown');
    expect(latStart.status).toBe('INIT');
    expect(latStart.kg).toBeGreaterThan(20);
  });

  it('does NOT leak onto a biceps curl (different bucket)', () => {
    store['logs'] = [];
    // Same heavy compound/large over-performance as above.
    DP.checkInSessionAdjust('Cable Row', [6.5], [12], {
      recKg: 40, recReps: 10, loggedKg: 60, setIdx: 0,
    });
    // Cable Curl = isolation/small/medium bucket → unbiased. Its INIT start is the
    // conservative beginner cold-start (FIX B 2026-06-11: suggestStartWeight beginner,
    // base 10 × 0.7 = 7, snapped to matrix_cable → 5), unchanged by the compound bias.
    const curlStart = DP._recommendRaw('Cable Curl');
    expect(curlStart.status).toBe('INIT');
    expect(curlStart.kg).toBe(5);
  });

  it('a hard/under-performed compound/large set eases the START of other compound/large lifts', () => {
    store['logs'] = [];
    // Rec 40, only managed 28 kg, felt hard → bucket bias down. The DOWN clamp is
    // deliberately gentler than the UP one (dev floored at 0.7 vs ceiled at 1.4 — a
    // bad set should never crater the next lift), so two under-performed sets are
    // what move the EMA enough to visibly drop the Lat Pulldown start (base 30×0.7=21)
    // past the 20 rung to 15. (One mild set holds at 20 by design.)
    for (let i = 0; i < 2; i++) {
      DP.checkInSessionAdjust('Cable Row', [10], [6], {
        recKg: 40, recReps: 10, loggedKg: 28, setIdx: i,
      });
    }
    const latStart = DP._recommendRaw('Lat Pulldown');
    expect(latStart.status).toBe('INIT');
    // Eased below the bare 20 kg floor (snapped to the bailib stack: 15).
    expect(latStart.kg).toBeLessThan(20);
  });

  it('bias self-expires by wall clock (no stale carry-over into a later session)', () => {
    store['logs'] = [];
    const t0 = 1_000_000_000_000;
    // Record a strong up-bias at t0.
    DP.checkInSessionAdjust('Cable Row', [6.5], [12], {
      recKg: 40, recReps: 10, loggedKg: 60, setIdx: 0, nowMs: t0,
    });
    // Same session (1h later) → bias still applies, start lifted above 20.
    expect(DP._recommendRaw('Lat Pulldown', t0 + 3600_000).kg).toBeGreaterThan(20);
    // Next day (>4h TTL later) → bias expired, start back to the clean floor (20).
    expect(DP._recommendRaw('Lat Pulldown', t0 + 24 * 3600_000).kg).toBe(20);
  });

  it('bias is bounded — a single extreme set never produces a wild start', () => {
    store['logs'] = [];
    // Absurd over-log (rec 20, logged 200) — clamped, EMA, then clamp again.
    DP.checkInSessionAdjust('Cable Row', [6.5], [12], {
      recKg: 20, recReps: 10, loggedKg: 200, setIdx: 0,
    });
    const latStart = DP._recommendRaw('Lat Pulldown');
    // factor capped at 1.25 → 20 * 1.25 = 25, snapped to the bailib stack (25).
    expect(latStart.kg).toBeLessThanOrEqual(25);
  });
});

// ── (B) Snapping gate — every returned weight exists in the equipment list ────

describe('snapping gate — recommend() output is always loadable', () => {
  const histories = {
    // INCREASE path: 3x at top reps, easy → adds weight.
    'Cable Row':   [{ ex: 'Cable Row', w: 50, reps: 12, rpe: 7 }, { ex: 'Cable Row', w: 50, reps: 12, rpe: 7 }, { ex: 'Cable Row', w: 50, reps: 12, rpe: 7 }],
    'Lat Pulldown':[{ ex: 'Lat Pulldown', w: 45, reps: 12, rpe: 7 }, { ex: 'Lat Pulldown', w: 45, reps: 12, rpe: 7 }, { ex: 'Lat Pulldown', w: 45, reps: 12, rpe: 7 }],
    'Cable Curl':  [{ ex: 'Cable Curl', w: 18, reps: 12, rpe: 7 }, { ex: 'Cable Curl', w: 18, reps: 12, rpe: 7 }, { ex: 'Cable Curl', w: 18, reps: 12, rpe: 7 }],
    'Pec Deck / Cable Fly': [{ ex: 'Pec Deck / Cable Fly', w: 27, reps: 15, rpe: 7 }, { ex: 'Pec Deck / Cable Fly', w: 27, reps: 15, rpe: 7 }, { ex: 'Pec Deck / Cable Fly', w: 27, reps: 15, rpe: 7 }],
    'Lateral Raises': [{ ex: 'Lateral Raises', w: 12, reps: 15, rpe: 7 }, { ex: 'Lateral Raises', w: 12, reps: 15, rpe: 7 }, { ex: 'Lateral Raises', w: 12, reps: 15, rpe: 7 }],
  };

  for (const ex of Object.keys(histories)) {
    it(`${ex}: recommend().kg is a real value on its equipment stack`, () => {
      store['logs'] = histories[ex];
      const rec = DP.recommend(ex);
      expect(equipListFor(ex)).toContain(rec.kg);
    });
  }

  it('INIT start is snapped too (Cable Curl 10 → matrix_cable 9, not a bare 10)', () => {
    store['logs'] = [];
    const rec = DP.recommend('Cable Curl');
    expect(equipListFor('Cable Curl')).toContain(rec.kg);
  });
});
