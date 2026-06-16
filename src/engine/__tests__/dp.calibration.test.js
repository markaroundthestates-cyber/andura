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
import { resolveRealStack } from '../dp/realMachineStacks.js';

beforeEach(() => {
  store = {};
  store['phase-override'] = 'BULK'; // masa-like → reps autoregulation
});

/** The equipment list a given exercise snaps onto (mirrors weights.js getList).
 *  dp_real_ladder_snap_v1: recs on his measured machines now snap to the REAL
 *  stack, so the gate must check those rungs (Cable Row → 6..90, not bailib). */
function equipListFor(ex) {
  const real = resolveRealStack(ex);
  if (real) return real;
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

// ── SAFETY CAP RE-ENFORCE — learned calibration must not defeat the cap ───────
// _recommendRaw's CAP branch returns kg=maxKg, then recommend()'s LEARNED
// calibration multiplied result.kg by a per-exercise factor (CAL_MAX 1.5) AFTER
// that — so an at-cap lift could be silently inflated ABOVE maxKg by calibration
// alone (no proven strength behind it). The safety cap must beat the learned
// multiplier; the demonstrated PR-floor (real strength) is separately allowed
// above a defensive cap and is covered by dp.synergistPreFatigue (real 54 kg
// Cable Curl > 35 kg sanity cap).
describe('safety cap survives calibration (learned multiplier cannot defeat it)', () => {
  it('an at-cap lift with a strong up-calibration stays at maxKg (not inflated)', () => {
    // Cable Curl cap = MAX_KG 35 (no bodyweight in store → ceiling 0 → flat cap).
    // A persistent up-calibration (factor maxed at CAL_MAX 1.5) WOULD lift the
    // capped 35 to ~52 if the clamp were defeated. The user logged AT the cap (35)
    // hitting target reps — demonstrated == cap, so the PR-floor cannot lift it
    // higher: the prescribed kg must equal the cap, NOT the calibration-inflated 52.
    store['dp-cal-factors'] = { 'Cable Curl': { kgFactor: 1.5, n: 12 } };
    store['logs'] = [
      { ex: 'Cable Curl', w: 35, reps: 12, rpe: 7 },
      { ex: 'Cable Curl', w: 35, reps: 12, rpe: 7 },
      { ex: 'Cable Curl', w: 35, reps: 12, rpe: 7 },
    ];
    const rec = DP.recommend('Cable Curl');
    expect(rec.kg).toBeLessThanOrEqual(35); // calibration did NOT inflate past the cap
    expect(['CAP', 'CAP REPS', 'PEAK']).toContain(rec.status);
  });

  it('control: WITHOUT calibration the same at-cap lift prescribes the identical kg', () => {
    // Proves the cap value itself is unchanged by the fix — only the calibration
    // INFLATION is removed (the with-cal case above lands on the SAME kg as this).
    store['logs'] = [
      { ex: 'Cable Curl', w: 35, reps: 12, rpe: 7 },
      { ex: 'Cable Curl', w: 35, reps: 12, rpe: 7 },
      { ex: 'Cable Curl', w: 35, reps: 12, rpe: 7 },
    ];
    const rec = DP.recommend('Cable Curl');
    expect(rec.kg).toBeLessThanOrEqual(35);
  });
});

// ── PR-FLOOR vs the CAP note — ego-load capped, demonstrated load gets honest note ─
// _recommendRaw's CAP-over branch (lastW > maxKg) returns kg=maxKg with a "Revenim
// la {maxKg} kg" note. The PR-floor below it then floors result.kg to the
// DEMONSTRATED working load. Two cases must behave differently (dp_cap_after_calib_v1):
//  (1) a true EGO-load (an over-cap set that did NOT genuinely complete target reps —
//      failed/short) → _demoWorkingW excludes it → the floor cannot lift → stays AT the
//      safety cap (the brake holds). The Y Raise 25×4-greu vs 18 case.
//  (2) a GENUINELY-demonstrated over-cap load (completed at target reps, repeatedly) →
//      the floor LEGITIMATELY lifts above the defensive cap (design: demonstrated
//      strength beats a population ceiling — the real 54 kg Cable Curl, covered in
//      dp.synergistPreFatigue). But the leftover CAP status + "Revenim la {cap}" note
//      then CONTRADICT the higher prescribed kg. The fix re-tags it to an honest
//      "proven load" note so the message matches the kg (no more "Revenim la 18" on a
//      prescribed 25).
describe('PR-floor + the CAP note (over-cap ego vs demonstrated)', () => {
  it('an over-cap EGO set (failed/short of target) stays AT the safety cap', () => {
    // DB Lateral Raise cap = MAX_KG 18. A single ego set 25 kg × 4 reps rated greu
    // (8.5) — short of the rep target AND hard → _demoWorkingW excludes it (not a
    // genuine demonstration), so the PR-floor cannot lift above the cap. Capped at 18.
    store['logs'] = [
      { ex: 'DB Lateral Raise', w: 25, reps: 4, rpe: 8.5 },
    ];
    const rec = DP.recommend('DB Lateral Raise');
    expect(rec.kg).toBeLessThanOrEqual(18); // brake holds on the ego-load
  });

  it('a GENUINELY-demonstrated over-cap load keeps its kg but drops the stale CAP note', () => {
    // DB Lateral Raise cap 18. The user GENUINELY owned 25 kg × 12 (target reps,
    // potrivit, three sessions) — demonstrated strength the PR-floor is allowed to
    // honor above the defensive cap. The prescribed kg must be the proven 25, NOT 18,
    // and the note must NOT still say "Revenim la 18 kg" (that lied about the kg).
    store['logs'] = [
      { ex: 'DB Lateral Raise', w: 25, reps: 12, rpe: 7 },
      { ex: 'DB Lateral Raise', w: 25, reps: 12, rpe: 7 },
      { ex: 'DB Lateral Raise', w: 25, reps: 12, rpe: 7 },
    ];
    const rec = DP.recommend('DB Lateral Raise');
    expect(rec.kg).toBe(25); // demonstrated strength honored above the cap (design)
    expect(rec.progressionNote).not.toMatch(/Revenim la/); // stale contradicting note gone
  });
});
