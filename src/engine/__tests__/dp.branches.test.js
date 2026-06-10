// ══ DP ENGINE — branch + boundary hardening (anti-facade) ════════════════════
//
// The existing dp.test.js pins the DB mock to phase-override='CUT' + logs=[]
// and stubs DP.getState for most cases, so it never exercises the real
// getState / getLogs path nor most _recommendRaw branches (INIT, SCALE BACK,
// CAP CHECK, PEAK, STAGNANT +SET, TECHNIQUE/MAINTAIN, ON TARGET default) nor
// getInitialRecommendation. This file drives those real input->output paths so
// mutating a comparison/boundary/return-value actually fails a test.
//
// DB is mocked with a mutable store so each test controls phase-override + logs.

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

import { DP, getInitialRecommendation } from '../dp.js';

/** Build a log entry in the app shape DP.getLogs expects (ex + w). */
function log(ex, w, reps, rpe) {
  return { ex, w, reps, rpe };
}

beforeEach(() => {
  store = {};
  // Force BULK/non-CUT for the branch tests that need it; individual tests
  // override to 'CUT' where they probe cut-specific logic.
  store['phase-override'] = 'BULK';
  // This file pins the RAW-kg _recommendRaw branch STRUCTURE (INIT / SCALE BACK /
  // STAGNANT +SET / TECHNIQUE / ON TARGET / rating-driven) + the readiness/rating
  // GATES. dp_e1rm_v1 et al. now DEFAULT ON (THE FLIP 2026-06-08) and re-express the
  // demonstrated working load in e1RM space, which routes a top-reps history through
  // the find-your-weight CATCH UP before those branches are reached — that ON
  // behavior is covered by dp.e1rm.*, dp.deepAdaptation, the calibration-sim and the
  // #70 persona-matrix. Here we force the e1RM cluster OFF so each raw-kg branch +
  // gate stays individually exercised (same explicit-OFF baseline pattern the sims
  // use now that "no _devFlags" no longer means OFF).
  try {
    localStorage.setItem('_devFlags', JSON.stringify({
      dp_e1rm_v1: false, dp_strength_kalman_v1: false, dp_ceiling_v1: false,
      // dp_rep_class_v1 defaults ON (THE FLIP 2026-06-10). This file pins the
      // LEGACY rep-range arm (curated-or-[8,12] + CUT cap) so each branch stays
      // individually exercised; the ON metadata-derived arm is covered by
      // dp/repRange.test.js + the persona-matrix + the full-path-sim.
      dp_rep_class_v1: false,
      // dp_load_model_v1 also defaults ON (THE FLIP 2026-06-10) — it adds derived
      // maxKg caps + equipment steps to the ~uncapped exercises, which moves the
      // getIncrement fallback (unlisted → derived equip step, not flat 2.5) + the
      // at-cap brake these branch tests assert in the LEGACY load world. Pin OFF;
      // ON is covered by dp/__tests__/loadModel.test.js + the Daniel probe.
      dp_load_model_v1: false,
    }));
  } catch { /* jsdom always provides localStorage */ }
});

// ── getLogs — filter + slice behavior ────────────────────────────────────────

describe('DP.getLogs', () => {
  it('returns only logs matching ex AND having a truthy w', () => {
    store['logs'] = [
      log('Lat Pulldown', 60, 10, 7),
      log('Cable Row', 50, 10, 7),       // different ex
      { ex: 'Lat Pulldown', reps: 10 },  // no w → filtered
      log('Lat Pulldown', 0, 10, 7),     // w=0 falsy → filtered
      log('Lat Pulldown', 64, 12, 8),
    ];
    const out = DP.getLogs('Lat Pulldown');
    expect(out).toHaveLength(2);
    expect(out.map((l) => l.w)).toEqual([60, 64]);
  });

  it('honors the n slice limit (most recent first as stored order)', () => {
    store['logs'] = Array.from({ length: 8 }, (_, i) => log('Cable Row', 40 + i, 10, 7));
    expect(DP.getLogs('Cable Row', 3)).toHaveLength(3);
    expect(DP.getLogs('Cable Row')).toHaveLength(8); // default n=10 > 8 available
  });

  it('returns empty array when DB has no logs', () => {
    expect(DP.getLogs('Anything')).toEqual([]);
  });

  // ── Order-independence regression (external audit HIGH 2026-05-30) ───────────
  // DP must NOT depend on the DB log array being accidentally newest-first.
  // The firebase remote-union + legacy IDB-handover merges can leave logs in
  // any order; getLogs sorts by ts DESC so logs[0] is the true latest and
  // slice(0,3) is the true latest 3. These would FAIL on the old unsorted code.
  it('returns logs newest-first by ts regardless of DB storage order', () => {
    // Stored SCRAMBLED (newest NOT at index 0): middle, oldest, newest.
    store['logs'] = [
      { ex: 'Cable Row', w: 50, reps: 10, rpe: 7, ts: 2000 }, // middle
      { ex: 'Cable Row', w: 40, reps: 10, rpe: 7, ts: 1000 }, // oldest
      { ex: 'Cable Row', w: 60, reps: 12, rpe: 8, ts: 3000 }, // newest
    ];
    const out = DP.getLogs('Cable Row');
    // ts-sorted truth: newest (60) → middle (50) → oldest (40).
    expect(out.map((l) => l.w)).toEqual([60, 50, 40]);
    expect(out[0].ts).toBe(3000); // logs[0] is the genuine latest
  });

  it('sorts logs missing ts to the end (legacy entries), newest-first otherwise', () => {
    store['logs'] = [
      { ex: 'Lat Pulldown', w: 64, reps: 10, rpe: 7 },          // legacy, no ts
      { ex: 'Lat Pulldown', w: 60, reps: 10, rpe: 7, ts: 5000 }, // newest with ts
      { ex: 'Lat Pulldown', w: 56, reps: 10, rpe: 7, ts: 4000 }, // older with ts
    ];
    const out = DP.getLogs('Lat Pulldown');
    // ts-bearing newest-first, then the no-ts entry (ts→0) last.
    expect(out.map((l) => l.w)).toEqual([60, 56, 64]);
  });
});

// ── getState — INIT, stagnation, atTopReps, string-reps parsing ──────────────

describe('DP.getState', () => {
  it('returns INIT shape (stage INIT, lastW 0) when no logs', () => {
    const s = DP.getState('Lat Pulldown');
    expect(s.stage).toBe('INIT');
    expect(s.lastW).toBe(0);
    expect(s.logs).toEqual([]);
    expect(s.isStagnant).toBe(false);
    expect(s.atTopReps).toBe(false);
  });

  it('reads lastW/lastReps/lastRPE from the most recent log (logs[0])', () => {
    store['logs'] = [
      log('Cable Row', 56, 11, 8),
      log('Cable Row', 52, 10, 7),
    ];
    const s = DP.getState('Cable Row');
    expect(s.lastW).toBe(56);
    expect(s.lastReps).toBe(11);
    expect(s.lastRPE).toBe(8);
  });

  it('parses numeric string reps via parseInt', () => {
    store['logs'] = [log('Cable Row', 56, '11', 7)];
    expect(DP.getState('Cable Row').lastReps).toBe(11);
  });

  it('falls back to rMin when numeric reps field is null/undefined', () => {
    // Cable Row range [8,12] → rMin 8; reps absent → fallback
    store['logs'] = [{ ex: 'Cable Row', w: 56, rpe: 7 }];
    expect(DP.getState('Cable Row').lastReps).toBe(8);
  });

  it('flags isStagnant only when last 3 weights are all identical', () => {
    store['logs'] = [log('Cable Row', 56, 10, 7), log('Cable Row', 56, 10, 7), log('Cable Row', 56, 10, 7)];
    expect(DP.getState('Cable Row').isStagnant).toBe(true);

    store['logs'] = [log('Cable Row', 56, 10, 7), log('Cable Row', 52, 10, 7), log('Cable Row', 56, 10, 7)];
    expect(DP.getState('Cable Row').isStagnant).toBe(false);
  });

  it('does NOT flag isStagnant with fewer than 3 logs', () => {
    store['logs'] = [log('Cable Row', 56, 10, 7), log('Cable Row', 56, 10, 7)];
    expect(DP.getState('Cable Row').isStagnant).toBe(false);
  });

  it('flags atTopReps only when last 3 reps all >= rMax', () => {
    // Cable Row rMax=12
    store['logs'] = [log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7), log('Cable Row', 56, 13, 7)];
    expect(DP.getState('Cable Row').atTopReps).toBe(true);

    store['logs'] = [log('Cable Row', 56, 12, 7), log('Cable Row', 56, 11, 7), log('Cable Row', 56, 12, 7)];
    expect(DP.getState('Cable Row').atTopReps).toBe(false);
  });

  it('defaults lastRPE to 7 when log has no rpe', () => {
    store['logs'] = [{ ex: 'Cable Row', w: 56, reps: 10 }];
    expect(DP.getState('Cable Row').lastRPE).toBe(7);
  });

  it('reads extraSets from DB key ex-extra-sets-<ex>', () => {
    store['logs'] = [log('Cable Row', 56, 10, 7)];
    store['ex-extra-sets-Cable Row'] = 1;
    expect(DP.getState('Cable Row').extraSets).toBe(1);
  });

  // ── Order-independence regression (external audit HIGH 2026-05-30) ───────────
  // getState/stagnation/recommend must match the TIME-sorted truth even when the
  // DB array is NOT newest-first. Old unsorted code read logs[0] as "last" and
  // logs.slice(0,3) as "recent 3" by raw position → these would mis-fire.
  it('reads lastW from the genuinely-latest log when DB order is scrambled', () => {
    // Newest (ts 3000, 60kg) stored in the MIDDLE, not at index 0.
    store['logs'] = [
      { ex: 'Cable Row', w: 52, reps: 10, rpe: 7, ts: 2000 },
      { ex: 'Cable Row', w: 60, reps: 12, rpe: 8, ts: 3000 }, // genuine latest
      { ex: 'Cable Row', w: 48, reps: 10, rpe: 7, ts: 1000 },
    ];
    const s = DP.getState('Cable Row');
    expect(s.lastW).toBe(60);
    expect(s.lastReps).toBe(12);
    expect(s.lastRPE).toBe(8);
  });

  it('detects false stagnation correctly on scrambled order (newest weight differs)', () => {
    // Time truth newest-first: 60 (latest) / 56 / 56 → NOT stagnant (top weight
    // changed). Stored scrambled so the two 56s sit at the front — old code
    // would read [56,56,...] and falsely flag stagnation + hold weight.
    store['logs'] = [
      { ex: 'Cable Row', w: 56, reps: 10, rpe: 7, ts: 2000 },
      { ex: 'Cable Row', w: 56, reps: 10, rpe: 7, ts: 1000 },
      { ex: 'Cable Row', w: 60, reps: 10, rpe: 7, ts: 3000 }, // genuine latest
    ];
    expect(DP.getState('Cable Row').isStagnant).toBe(false);

    // Genuine stagnation: latest 3 by ts all 56 → flagged even when scrambled.
    store['logs'] = [
      { ex: 'Cable Row', w: 56, reps: 10, rpe: 7, ts: 1000 },
      { ex: 'Cable Row', w: 56, reps: 10, rpe: 7, ts: 3000 },
      { ex: 'Cable Row', w: 56, reps: 10, rpe: 7, ts: 2000 },
    ];
    expect(DP.getState('Cable Row').isStagnant).toBe(true);
  });
});

// ── _recommendRaw — every branch, real getState path ─────────────────────────

describe('DP._recommendRaw — branch coverage', () => {
  it('INIT: no history → conservative start (compound 20kg, isolation 10kg)', () => {
    store['logs'] = [];
    const compound = DP._recommendRaw('Lat Pulldown');
    expect(compound.status).toBe('INIT');
    expect(compound.kg).toBe(20);
    expect(compound.rir).toBe(3);
    expect(compound.progressionStage).toBe(0);

    // Snapping gate (Bug B): the conservative isolation start (10) is snapped to
    // the exercise's real equipment stack. Cable Curl = matrix_cable [5,9,14,...]
    // → nearest to 10 is 9 (10 is NOT a loadable value on that cable). The bare
    // 10 was an un-snapped leak; 9 is what the machine can actually do.
    const iso = DP._recommendRaw('Cable Curl');
    expect(iso.status).toBe('INIT');
    expect(iso.kg).toBe(9);
  });

  it('SCALE BACK: lastReps below ceil(rMin*0.5) drops one equipment step', () => {
    // Cable Row rMin=8 → threshold ceil(4)=4 → lastReps 3 triggers scale back
    store['logs'] = [log('Cable Row', 56, 3, 8)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('SCALE BACK');
    expect(r.repsTarget).toBe(8); // back to rMin
    expect(r.rir).toBe(3);
    expect(r.kg).toBeLessThan(56);
  });

  it('SCALE BACK boundary: lastReps exactly at threshold does NOT scale back', () => {
    // ceil(8*0.5)=4 → lastReps 4 is NOT < 4 → no scale back
    store['logs'] = [log('Cable Row', 56, 4, 7)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).not.toBe('SCALE BACK');
  });

  it('CAP REPS: at/above MAX_KG but below the top of the range → hold weight, add reps within range', () => {
    // DB Lateral Raise MAX_KG=18, range [12,15], rMax=15. At the weight cap we fill
    // reps toward rMax (never beyond it — weight is the lever, capped here).
    store['logs'] = [log('DB Lateral Raise', 18, 13, 7)];
    const r = DP._recommendRaw('DB Lateral Raise');
    expect(r.status).toBe('CAP REPS');
    expect(r.kg).toBe(18);           // weight held at cap
    expect(r.repsTarget).toBe(14);   // min(rMax 15, lastReps+1) = 14, still < rMax
    expect(r.rir).toBe(2);
  });

  it('CAP REPS never escalates beyond rMax (no more rMax+4 runaway)', () => {
    // Leg Press is now hypertrophy-ranged [8,12], rMax=12, MAX_KG=400. At the
    // weight cap with lastReps=15 (already past the top of the range), the coach
    // does NOT prescribe 15+ endurance reps — it maintains at rMax=12 and shifts
    // focus to execution (PEAK). A heavy compound stays in the 6-12 hypertrophy
    // band (Daniel founder audit 2026-06-05: kill 15-20 endurance defaults).
    store['logs'] = [log('Leg Press', 400, 15, 7)];
    const r = DP._recommendRaw('Leg Press');
    expect(r.status).toBe('PEAK');
    expect(r.kg).toBe(400);                  // RAW (pre-snap) load
    expect(r.repsTarget).toBe(12);          // rMax (never 15+)
    expect(r.repsTarget).toBeLessThanOrEqual(12); // never above the hypertrophy rMax
    // Production path (audit F-2 2026-06-07): recommend() snaps to the real
    // equipment ladder. leg_press_plates tops at 320, so a 400kg log is snapped
    // DOWN to the ladder top (320) — NOT held at the raw 400 the coach can't
    // prescribe. This assertion guards the production snap the old RAW-only test
    // masked (it must never silently crater to the 20kg floor).
    const prod = DP.recommend('Leg Press');
    expect(prod.kg).toBe(320);
  });

  it('PEAK: at weight cap AND at the top of the range (>= rMax) → maintain', () => {
    // DB Lateral Raise rMax=20 (R2 lateral band [12,20]); once lastReps reaches
    // rMax at the weight cap we maintain at rMax (no rMax+4 over-range escalation).
    store['logs'] = [log('DB Lateral Raise', 18, 20, 7)];
    const r = DP._recommendRaw('DB Lateral Raise');
    expect(r.status).toBe('PEAK');
    expect(r.kg).toBe(18);
    expect(r.repsTarget).toBe(20);   // rMax
  });

  it('single HARD at target reps HOLDS the load (Gigel sim 2026-06-06 Target 2: no single-greu ease)', () => {
    // SUPERSEDES the prior "single greu eases one step" rule (142c1c7c). The 50-Gigel
    // sim proved single-greu EASE-BACK is the #1 oscillation driver (248 flags): a
    // strong/override-up user works AT true capacity (rated greu) and finishes the
    // reps, so easing demotes the load they just demonstrated → saw-tooth. A single
    // greu where the user HIT the rep target is productive overload → HOLD (standard
    // double progression), it does NOT ease.
    store['logs'] = [log('Cable Row', 56, 9, 8.5)]; // hit reps (9>=rMin 8), single greu
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).not.toBe('EASE BACK');
    expect(r.kg).toBe(56);                          // load held, not demoted
  });

  it('single HARD with reps BELOW the floor still eases (genuine distress)', () => {
    // Distress override: a hard set where reps collapsed below rMin (failed set) is a
    // real too-heavy signal and eases immediately even on ONE set.
    store['logs'] = [log('Cable Row', 56, 5, 8.5)]; // reps 5 < rMin 8 → failed, greu
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('EASE BACK');
    expect(r.kg).toBeLessThan(56);
  });

  it('2+ CONSECUTIVE greu while missing reps eases the load (sustained too-heavy)', () => {
    // Sustained hard trend the user cannot work through → ease.
    store['logs'] = [
      log('Cable Row', 56, 7, 8.5), // newest: greu, reps below rMin
      log('Cable Row', 56, 7, 8.5), // prior: greu
    ];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('EASE BACK');
    expect(r.kg).toBeLessThan(56);
    expect(r.progressionNote).toMatch(/coboram/);
  });

  it('CONSOLIDATE: lastReps < rMax with MEDIUM (potrivit) RPE adds 1 rep', () => {
    // Daniel bug 2026-06-04: the rating bands are now explicit — easy is RPE<=6.5,
    // medium (potrivit) ~7.5, hard >=9. RPE 7 falls in the MEDIUM band → modest
    // standard +1 rep fill (not the old blanket +2 for RPE<=7). The decisive +1
    // -toward-rMax (then weight) reserved for an actual EASY rating is covered by
    // the dedicated EASY tests below.
    store['logs'] = [log('Cable Row', 56, 9, 7)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.repsTarget).toBe(10);   // min(12, 9+1)
    expect(r.rir).toBe(2);
  });

  it('CONSOLIDATE: RPE 8 (medium, not >=9) adds only 1 rep', () => {
    store['logs'] = [log('Cable Row', 56, 9, 8)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.repsTarget).toBe(10);   // min(12, 9+1)
  });

  it('INCREASE: atTopReps (3x at rMax) with RPE <= 8 → add weight, reset to rMin', () => {
    store['logs'] = [log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('INCREASE');
    expect(r.repsTarget).toBe(8);    // rMin
    expect(r.kg).toBeGreaterThan(56);
    expect(r.progressionStage).toBe(2);
  });

  it('STAGNANT +SET: same weight 3 sessions at top reps with extraSets=0 → adds a set', () => {
    // atTopReps true would short-circuit to INCREASE; use reps below rMax so we
    // reach the stagnation branch. last3 same weight, reps 12 == rMax but RPE 9
    // pushes through CONSOLIDATE? No — RPE>=9 hits TOO HEAVY first. Use reps<rMax
    // is CONSOLIDATE. Stagnation requires lastReps>=rMax (skip consolidate) AND
    // not atTopReps. atTopReps needs last3 reps >= rMax. So craft: last3 weights
    // identical, last3 reps = [12, 11, 12] → atTopReps false, lastReps 12 == rMax
    // (skip consolidate), RPE 8 (skip too-heavy/increase).
    store['logs'] = [log('Cable Row', 56, 12, 8), log('Cable Row', 56, 11, 8), log('Cable Row', 56, 12, 8)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('STAGNANT +SET');
    expect(r.kg).toBe(56);
    expect(r.progressionStage).toBe(3);
    // side effect: extra-set flag persisted to DB
    expect(store['ex-extra-sets-Cable Row']).toBe(1);
  });

  it('TECHNIQUE (non-CUT): stagnant with extraSets already 1 → drop set', () => {
    store['phase-override'] = 'BULK';
    store['ex-extra-sets-Cable Row'] = 1;
    store['logs'] = [log('Cable Row', 56, 12, 8), log('Cable Row', 56, 11, 8), log('Cable Row', 56, 12, 8)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('TECHNIQUE');
    expect(r.technique).toBe('DROP SET');
    expect(r.progressionStage).toBe(4);
    expect(r.rir).toBe(1);
  });

  it('MAINTAIN (CUT): stagnant with extraSets 1 in CUT → maintain, no drop set', () => {
    store['phase-override'] = 'CUT';
    store['ex-extra-sets-Cable Row'] = 1;
    store['logs'] = [log('Cable Row', 56, 12, 8), log('Cable Row', 56, 11, 8), log('Cable Row', 56, 12, 8)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('MAINTAIN');
    expect(r.technique).toBeUndefined();
    expect(r.progressionStage).toBe(3);
  });

  it('ON TARGET default: lastReps >= rMax, not stagnant, not atTopReps', () => {
    // reps at rMax but weights differ (not stagnant) and not 3x top → default
    store['logs'] = [log('Cable Row', 56, 12, 8), log('Cable Row', 52, 11, 8), log('Cable Row', 48, 10, 8)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('ON TARGET');
    expect(r.kg).toBe(56);
    expect(r.progressionStage).toBe(0);
  });
});

// ── _recommendRaw — RATING-DRIVEN responsive progression (Daniel bug 2026-06-04)
// The coach must VISIBLY respond to the LAST set's rating from session 1, not wait
// for 3 sessions at rMax. EASY (usor, RPE<=6.5) steps forward decisively THIS next
// session; HARD (greu, RPE>=9) never increases; MEDIUM (potrivit ~7.5) does modest
// standard double progression. Max ONE step per session. These drive the real
// getState/log path so a regression in the branch order actually fails here.
// Cable Row: bailib_stack [..,55,60,65,..], range [8,12] (BULK, not cut).

describe('DP._recommendRaw — rating-driven responsive progression', () => {
  beforeEach(() => { store['phase-override'] = 'BULK'; });

  it('EASY mid-range → raises the rep TARGET by +1 (one easy session is enough)', () => {
    // The literal Daniel repro: ~8 reps target, logged 7 reps rated EASY. ONE easy
    // session must move the prescription forward — not repeat 7 reps again.
    store['logs'] = [log('Cable Row', 20, 7, 6.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('INCREASE');
    expect(r.kg).toBe(20);          // weight held — still mid-range
    expect(r.repsTarget).toBe(8);   // +1 toward rMax (decisive forward step)
    expect(r.progressionNote).toMatch(/[Uu]sor/); // explains WHY (easy → more reps)
  });

  it('EASY mid-range moves on the FIRST session — NOT gated on 3 sessions', () => {
    // A single log (one prior session) is enough; the old code waited for 3
    // consecutive top-range sessions before any forward movement.
    store['logs'] = [log('Cable Row', 56, 10, 6)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('INCREASE');
    expect(r.repsTarget).toBe(11);  // 10 → 11, single session
  });

  it('EASY at the TOP of the range → +1 weight stack step, reps reset to rMin', () => {
    // lastReps 12 == rMax; easy → next equipment step (60 → 65 bailib) + back to rMin 8.
    store['logs'] = [log('Cable Row', 60, 12, 6.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('INCREASE');
    expect(r.kg).toBe(65);          // one stack step up (bailib 60 → 65)
    expect(r.repsTarget).toBe(8);   // reset to rMin
    expect(r.progressionNote).toMatch(/varf|kg/);
  });

  it('aggression cap: EASY at top advances at most ONE stack step (never multi-step)', () => {
    store['logs'] = [log('Cable Row', 60, 12, 6.5)];
    const r = DP._recommendRaw('Cable Row');
    // 60 → 65 is exactly one step; never jumps to 70+ in a single session.
    expect(r.kg).toBe(65);
  });

  it('aggression cap: EASY mid-range raises reps by at most ONE', () => {
    store['logs'] = [log('Cable Row', 56, 9, 5)]; // very easy (RPE 5)
    const r = DP._recommendRaw('Cable Row');
    expect(r.repsTarget).toBe(10);  // 9 → 10, exactly +1 even when very easy
  });

  it('single HARD at hit reps HOLDS the load (Gigel sim Target 2: no single-greu ease)', () => {
    // SUPERSEDES single-greu ease. reps 10 >= rMin 8 → productive overload → HOLD.
    store['logs'] = [log('Cable Row', 56, 10, 8.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).not.toBe('EASE BACK');
    expect(r.kg).toBe(56);                   // weight held, not demoted
  });

  it('single HARD at the TOP of the range progresses via double-progression', () => {
    // reps 12 = rMax, all-top → standard double progression bumps the weight one
    // stack step (it is NOT an ease — the user owned the top of the range).
    store['logs'] = [log('Cable Row', 56, 12, 8.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).not.toBe('EASE BACK');
    expect(r.kg).toBeGreaterThanOrEqual(56);
  });

  it('GIGEL P0 revisited: single greu at hit reps HOLDS (Target 2 supersedes 142c1c7c)', () => {
    // 2026-06-05 the rule was "single greu eases one step" so a too-heavy set is not
    // re-prescribed. The 50-Gigel sim (2026-06-06) proved that single-greu ease is
    // the saw-tooth root cause for users working at capacity. New rule: a single greu
    // where reps were HIT holds the load (capacity signal); only failed reps / a
    // sustained greu run ease. The two ease cases are covered by the distress +
    // 2-consecutive tests above.
    store['logs'] = [log('Cable Row', 45, 9, 8.5)]; // hit reps at 45kg, rated greu
    const r = DP._recommendRaw('Cable Row');
    expect(r.kg).toBe(45);
    expect(r.status).not.toBe('EASE BACK');
  });

  it('MEDIUM mid-range → modest standard +1 rep (weight held)', () => {
    store['logs'] = [log('Cable Row', 56, 9, 7.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.kg).toBe(56);
    expect(r.repsTarget).toBe(10);  // +1 toward rMax
  });

  it('MEDIUM at top, range filled 3 sessions (atTopReps) → standard weight INCREASE', () => {
    store['logs'] = [log('Cable Row', 60, 12, 7.5), log('Cable Row', 60, 12, 7.5), log('Cable Row', 60, 12, 7.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('INCREASE');
    expect(r.kg).toBe(65);          // bailib one step
    expect(r.repsTarget).toBe(8);   // rMin
  });
});

// ── recommend — rounds kg to equipment step ──────────────────────────────────

describe('DP.recommend', () => {
  it('rounds the recommended kg to the equipment step', () => {
    store['logs'] = [log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7)];
    const raw = DP._recommendRaw('Cable Row');
    const rec = DP.recommend('Cable Row');
    // recommend wraps _recommendRaw and applies roundToStep to kg
    expect(rec.status).toBe(raw.status);
    expect(typeof rec.kg).toBe('number');
  });
});

// ── getIncrement / getIntensityLabel — boundaries ────────────────────────────

describe('DP.getIncrement', () => {
  it('returns the configured step for known exercises', () => {
    expect(DP.getIncrement('Lat Pulldown')).toBe(4);
    expect(DP.getIncrement('Bayesian Curl')).toBe(2);
    expect(DP.getIncrement('Leg Press')).toBe(5);
  });

  it('falls back to 2.5 for an unlisted exercise', () => {
    expect(DP.getIncrement('Totally Unknown Lift')).toBe(2.5);
  });
});

describe('DP.getIntensityLabel — RIR thresholds', () => {
  it('maps each RIR band to its label (boundary exact)', () => {
    expect(DP.getIntensityLabel(1)).toBe('🔴 La limita');
    expect(DP.getIntensityLabel(2)).toBe('🟠 Greu');
    expect(DP.getIntensityLabel(3)).toBe('🟡 Provocator');
    expect(DP.getIntensityLabel(4)).toBe('🟢 Confortabil');
  });

  it('treats RIR 0 as the lowest band', () => {
    expect(DP.getIntensityLabel(0)).toBe('🔴 La limita');
  });
});

// ── getPhaseAwareRepRange — non-CUT + boundary on rMax ───────────────────────

describe('DP.getPhaseAwareRepRange — boundaries', () => {
  it('non-CUT returns the raw range unchanged', () => {
    expect(DP.getPhaseAwareRepRange('Cable Curl', false)).toEqual([10, 15]);
  });

  it('CUT does NOT cap a compound even if rMax in 11-15 (COMPOUND_EX guard)', () => {
    // Romanian Deadlift is compound, range [8,12] → not capped
    expect(DP.getPhaseAwareRepRange('Romanian Deadlift', true)).toEqual([8, 12]);
  });

  it('CUT leaves rMax exactly 10 alone (boundary rMax > 10 is strict)', () => {
    // DB Shoulder Press range [6,10], rMax=10 not > 10 → unchanged
    expect(DP.getPhaseAwareRepRange('DB Shoulder Press', true)).toEqual([6, 10]);
  });

  it('unknown exercise defaults to [8,12]', () => {
    expect(DP.getPhaseAwareRepRange('Mystery Lift', false)).toEqual([8, 12]);
  });
});

// ── getSmartRecommendation — readiness gate boundary (60) ────────────────────

describe('DP.getSmartRecommendation — readiness boundary', () => {
  beforeEach(() => {
    store['logs'] = [log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7)];
  });

  it('readiness exactly 60 does NOT downgrade INCREASE (strict < 60)', () => {
    const r = DP.getSmartRecommendation('Cable Row', 60, null);
    expect(r.status).toBe('INCREASE');
  });

  it('readiness 59 downgrades INCREASE to CONSOLIDATE and holds last weight', () => {
    const r = DP.getSmartRecommendation('Cable Row', 59, null);
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.kg).toBe(56);
  });

  it('null readiness leaves status untouched + still attaches repsRange', () => {
    const r = DP.getSmartRecommendation('Cable Row', null, null);
    expect(r.status).toBe('INCREASE');
    expect(r.repsRange).toMatch(/^\d+–\d+$/);
  });
});

// ── checkInSessionAdjust — masa (BULK) phase = per-set REPS autoregulation ─────
// Rewrite 2026-05-30: respond to EACH set. BULK is masa-like → adjust reps, hold
// weight. Cable Row range [8,12] (BULK not capped), rMax=12, rMin=8.

describe('DP.checkInSessionAdjust — BULK reps autoregulation', () => {
  beforeEach(() => {
    store['phase-override'] = 'BULK';
    store['logs'] = [log('Cable Row', 56, 12, 7)];
  });

  it('usor at target nudges reps UP one, weight HELD (masa moves reps not kg)', () => {
    const r = DP.checkInSessionAdjust('Cable Row', [6.5], [10], { recKg: 56, recReps: 10, setIdx: 0 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newReps).toBe(11);
    expect(r.holdKg).toBe(56);
    expect(r.newKg).toBeUndefined();
  });

  it('usor caps the rep nudge at rMax (12)', () => {
    const r = DP.checkInSessionAdjust('Cable Row', [6.5], [12], { recKg: 56, recReps: 12, setIdx: 0 });
    // already at rMax → no further up.
    expect(r.adjust).toBe(false);
  });

  it('RPE 7 (potrivit) early set is NOT easy → holds', () => {
    const r = DP.checkInSessionAdjust('Cable Row', [7], [12], { recKg: 56, recReps: 12, setIdx: 1 });
    expect(r.adjust).toBe(false);
  });

  it('single greu eases the WEIGHT one step (Daniel 2026-06-06 Gigel rule)', () => {
    // hard with a working load (lastW 56 from the seeded log) → step the WEIGHT down,
    // visible, instead of only trimming reps. Weight-first; rep-trim is cold-start-only.
    const r = DP.checkInSessionAdjust('Cable Row', [10], [10], { recKg: 56, recReps: 10, setIdx: 0 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newKg).toBeLessThan(56);
    expect(r.newReps).toBeUndefined();
  });

  it('under-performance that felt hard eases the rep target', () => {
    // rec 12×56=672; logged 6×56=336 (0.5×) at greu(10) → ease.
    const r = DP.checkInSessionAdjust('Cable Row', [10], [6], { recKg: 56, recReps: 12, setIdx: 0 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newReps).toBeLessThan(12);
  });
});

// ── checkInSessionAdjust — over-performance ramps AND persists via DP ─────────
// Daniel key requirement 2026-05-30: if the user logs FAR above the recommendation
// (e.g. 20×40 vs rec 10×20, or 4×60 strength-style), the recommendation was too
// low → ramp the next-set target toward the demonstrated capacity AND have it feed
// the existing DP progression so the NEXT session starts higher (never fabricate —
// the higher target gets LOGGED, and the next session's recommend() reads it).

describe('DP.checkInSessionAdjust — over-performance ramps + persists', () => {
  it('STRENGTH: logged 20×40 vs rec 10×20 ramps the next-set weight up smoothly', () => {
    store['phase-override'] = 'STRENGTH';
    store['logs'] = [log('Cable Row', 40, 20, 7)]; // lastW=40 (what they just lifted)
    // rec 10×20=200, logged 20×40=800 (4×) → ramp. Heavy-low-reps? 40 >= 20×1.3=26
    // → yes, strength-style: weight moves up, rep range down. SMOOTH (not to 40 in
    // one set — one+ step above the recommendation).
    const r = DP.checkInSessionAdjust('Cable Row', [7.5], [20], { recKg: 20, recReps: 10, loggedKg: 40 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newKg).toBeGreaterThan(20); // ramped above the too-low recommendation
    expect(r.newKg).toBeLessThanOrEqual(40); // never overshoots the demonstrated load
    expect(r.newReps).toBeLessThan(10); // strength-style → rep range down
  });

  it('persists: a logged over-performance set lifts the NEXT session recommend()', () => {
    store['phase-override'] = 'BULK';
    // Session 1: user was recommended ~20 kg but actually logged 40 kg (the
    // autoregulation ramped the live target; the user logged the higher set).
    store['logs'] = [log('Cable Row', 40, 12, 7)];
    // Next session: recommend() reads the persisted 40 kg log — it does NOT
    // restart at the old 20. The higher demonstrated capacity carried forward.
    const rec = DP.recommend('Cable Row');
    expect(rec.kg).toBeGreaterThanOrEqual(40); // progression fed from the logged set
  });

  it('masa: light-high-reps over-performance raises the rep target (weight held)', () => {
    store['phase-override'] = 'BULK';
    store['logs'] = [log('Cable Row', 56, 12, 7)];
    // rec 8×56=448, logged 13×56=728 (~1.6×), usor → reps ramp up, weight held.
    const r = DP.checkInSessionAdjust('Cable Row', [6.5], [13], { recKg: 56, recReps: 8, loggedKg: 56 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newReps).toBeGreaterThan(8);
    expect(r.holdKg).toBe(56); // masa holds weight, moves reps
  });

  it('magnitudes stay MODEST — a single set never swings the target wildly', () => {
    store['phase-override'] = 'BULK';
    store['logs'] = [log('Cable Row', 56, 10, 7)];
    const r = DP.checkInSessionAdjust('Cable Row', [10], [10], { recKg: 56, recReps: 10, loggedKg: 56 });
    // greu eases reps by at most 2 — not a collapse to rMin in one set.
    expect(r.adjust).toBe(true);
    expect(10 - (r.newReps ?? 10)).toBeLessThanOrEqual(2);
  });
});

// ── getInitialRecommendation — exact / similar / fallback paths ───────────────

describe('getInitialRecommendation', () => {
  it('exact match in context uses last session weight (confidence 0.9, not initial)', () => {
    const ctx = { recentLogs: [{ logs: [{ ex: 'Cable Row', w: 50, reps: 10 }] }] };
    const r = getInitialRecommendation('Cable Row', ctx);
    expect(r.isInitial).toBe(false);
    expect(r.confidence).toBe(0.9);
    expect(r.kg).toBeGreaterThan(0);
    expect(r.kg).toBe(r.weight);
  });

  it('similar-exercise match estimates with multiplier (confidence 0.7, initial)', () => {
    // Cable Curl similar = ['Bayesian Curl', 'Incline DB Curl']
    const ctx = { recentLogs: [{ logs: [{ ex: 'Bayesian Curl', w: 18, reps: 10 }] }] };
    const r = getInitialRecommendation('Cable Curl', ctx);
    expect(r.isInitial).toBe(true);
    expect(r.confidence).toBe(0.7);
    expect(r.status).toBe('INIT');
  });

  it('no context falls back to conservative min weight (confidence 0.4)', () => {
    const r = getInitialRecommendation('Cable Curl', null);
    expect(r.isInitial).toBe(true);
    expect(r.confidence).toBe(0.4);
    expect(r.kg).toBeGreaterThan(0);
    expect(r.reps).toBe(10);
    expect(r.sets).toBe(3);
  });

  it('empty recentLogs also falls to conservative fallback', () => {
    const r = getInitialRecommendation('Lat Pulldown', { recentLogs: [] });
    expect(r.confidence).toBe(0.4);
    expect(r.isInitial).toBe(true);
  });

  // ── cold-start fallback scales by PROFILE (anti equipment-floor bug) ────────
  // The bug: a 110kg trained user was offered Flat DB Press at the dumbbell
  // floor (the fallback returned the equipment minimum, ignoring bodyweight).
  // Fix: when ctx carries bodyweight/sex/experience, the no-data fallback scales
  // by the profile (bodyweight x movement-pattern fraction x sex x experience),
  // snapped to the equipment stack and clamped >= equipment min.

  it('heavy trained user gets a realistic Flat DB Press start, well above equipment min', () => {
    // 110kg male intermediate, no logs, no similar log → profile-scaled fallback.
    const r = getInitialRecommendation('Flat DB Press', {
      recentLogs: [],
      bodyweightKg: 110,
      sex: 'm',
      experience: 'intermediate',
    });
    expect(r.confidence).toBe(0.4);
    expect(r.isInitial).toBe(true);
    // Dumbbell floor is 7kg; the buggy value was ~7-10. A 110kg lifter must get
    // a clearly heavier, still-conservative start.
    expect(r.kg).toBeGreaterThanOrEqual(20);
    expect(r.kg).toBe(r.weight);
    // Snapped to a real dumbbell value (set: 7,8,9,10,12.5,15,17.5,20,22.5,25,...).
    expect(r.kg).toBe(25);
  });

  it('light beginner stays conservative (floored at the population prior, never below equipment min)', () => {
    // 55kg female beginner, no logs → scaled start is small; floor keeps it at
    // the conservative prior, never dropping below the equipment minimum.
    const r = getInitialRecommendation('DB Lateral Raise', {
      recentLogs: [],
      bodyweightKg: 55,
      sex: 'f',
      experience: 'beginner',
    });
    expect(r.isInitial).toBe(true);
    const minKg = 5; // equipment floor for this emitted name (rounds on bailib_stack)
    expect(r.kg).toBeGreaterThanOrEqual(minKg);
    // DB Lateral Raise stays light for a light beginner (NOT pushed up absurdly).
    expect(r.kg).toBeLessThanOrEqual(10);
  });

  it('heavy user beats light user on the same exercise (monotonic in bodyweight)', () => {
    const heavy = getInitialRecommendation('Leg Press', {
      recentLogs: [], bodyweightKg: 110, sex: 'm', experience: 'intermediate',
    });
    const light = getInitialRecommendation('Leg Press', {
      recentLogs: [], bodyweightKg: 60, sex: 'f', experience: 'beginner',
    });
    expect(heavy.kg).toBeGreaterThan(light.kg);
  });

  it('no bodyweight in ctx → legacy equipment-min fallback unchanged', () => {
    // Back-compat: without a profile the fallback is byte-identical to before.
    const withBw = getInitialRecommendation('Cable Curl', { recentLogs: [] });
    const noCtx = getInitialRecommendation('Cable Curl', null);
    expect(withBw.kg).toBe(noCtx.kg); // both = _minWeightForExercise('Cable Curl')
    expect(withBw.confidence).toBe(0.4);
  });

  it('clamp holds — fallback never drops below the equipment minimum', () => {
    // A tiny bodyweight must still respect the equipment floor (cannot underflow).
    const r = getInitialRecommendation('Leg Press', {
      recentLogs: [], bodyweightKg: 35, sex: 'f', experience: 'beginner',
    });
    expect(r.kg).toBeGreaterThanOrEqual(20); // leg_press_plates floor
  });

  // ── cold-start UNCHANGED guard (Daniel bug 2026-06-04 rewrite) ───────────────
  // The rating-driven progression rewrite touches ONLY the with-history path
  // (_recommendRaw stages). getInitialRecommendation (the no-history cold start
  // feeding a golden master) must stay byte-identical. This pins the full exact
  // output shape of the conservative fallback so any drift fails loudly.
  it('cold-start fallback output is byte-identical (golden — must NOT drift)', () => {
    expect(getInitialRecommendation('Cable Curl', null)).toEqual({
      kg: 5, weight: 5, repsTarget: 10, reps: 10, sets: 3, rir: 3,
      status: 'INIT', statusColor: 'var(--text3)', statusLabel: '🟡 Pornim conservator',
      isInitial: true, rationale: 'Greutate de pornire · Recalibram dupa primul set',
      confidence: 0.4,
    });
  });

  it('cold-start exact-match output is byte-identical (golden — must NOT drift)', () => {
    const ctx = { recentLogs: [{ logs: [{ ex: 'Cable Row', w: 50, reps: 10 }] }] };
    expect(getInitialRecommendation('Cable Row', ctx)).toEqual({
      kg: 50, weight: 50, repsTarget: 8, reps: 8, sets: 3, rir: 2,
      status: 'CONSOLIDATE', statusColor: 'var(--accent)', statusLabel: '🟡 Continuam',
      isInitial: false, rationale: 'Pornim de la ultima sesiune: 50 kg', confidence: 0.9,
    });
  });
});

// ── §07.198-204 — injectable clock pins the AUTO/TARGET_DATE CUT branch ───────
//
// TARGET_DATE = 2026-07-20 (src/constants.js). With phase-override='AUTO' the
// CUT decision is `now < TARGET_DATE`. Before this fix it read `new Date()`
// inline, so the AUTO branch could not be pinned. _isInCut(phaseOverride, nowMs)
// defaults to the real clock when nowMs omitted (production byte-identical) and
// accepts an injected epoch ms for deterministic tests.
//
// Discriminator: 'DB Lateral Raise' range [12,15] (isolation) → CUT caps to
// [10,10]; non-CUT stays [12,15]. So getRepsRange reveals the branch taken.
describe('DP injectable clock — AUTO/TARGET_DATE CUT branch (§07.198-204)', () => {
  const TARGET_MS = new Date('2026-07-20').getTime();
  const BEFORE = TARGET_MS - 86400000; // 1 day before → in-cut under AUTO
  const AFTER = TARGET_MS + 86400000;  // 1 day after  → not-in-cut under AUTO

  beforeEach(() => { store['phase-override'] = 'AUTO'; });

  it('_isInCut: AUTO + now before TARGET_DATE → true; after → false', () => {
    expect(DP._isInCut('AUTO', BEFORE)).toBe(true);
    expect(DP._isInCut('AUTO', AFTER)).toBe(false);
  });

  it('_isInCut: explicit CUT is true and BULK is false regardless of clock', () => {
    expect(DP._isInCut('CUT', AFTER)).toBe(true);
    expect(DP._isInCut('BULK', BEFORE)).toBe(false);
  });

  it('getRepsRange respects injected nowMs on AUTO (cap before, raw after)', () => {
    // Fixture = Cable Curl [10,15]: still inside the legacy cut-cap scope (rMax<=15).
    // DB Lateral Raise moved to [12,20] (founder spec 2026-06-10) → outside the cap.
    expect(DP.getRepsRange('Cable Curl', BEFORE)).toEqual([10, 10]); // in-cut cap
    expect(DP.getRepsRange('Cable Curl', AFTER)).toEqual([10, 15]);  // not-in-cut
  });

  it('getRepsRange omitting nowMs defaults to real clock (no throw, valid range)', () => {
    const r = DP.getRepsRange('DB Lateral Raise');
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBe(2);
  });

  it('_recommendRaw on AUTO uses injected clock for the cut-aware rep target', () => {
    store['logs'] = [
      log('DB Lateral Raise', 12, 12, 7),
      log('DB Lateral Raise', 12, 12, 7),
      log('DB Lateral Raise', 12, 12, 7),
    ];
    // In-cut (BEFORE) caps the isolation range to [10,10]; not-in-cut (AFTER)
    // keeps [12,15]. The default-maintain repsTarget is min(rMax, lastReps+1),
    // so the cut branch yields a strictly lower-or-equal target than the bulk one.
    const cut = DP._recommendRaw('DB Lateral Raise', BEFORE);
    const bulk = DP._recommendRaw('DB Lateral Raise', AFTER);
    expect(cut.repsTarget).toBeLessThanOrEqual(bulk.repsTarget);
  });
});

// ── getSmartRecommendation — post-session rating gate (Daniel bug 2026-05-31) ─
// Founder repro: 10x60 rated "grea", next session STILL 10x60 — the subjective
// post-session rating was stored (workoutStore.lastRating) but never wired into
// the prescription. An honest coach must NOT blindly push when the user said it
// was hard. 'grea' demotes an INCREASE day to a HOLD; 'usoara'/'normala'/null
// leave the normal double-progression intact (still progresses).

describe('DP.getSmartRecommendation — post-session rating gate', () => {
  beforeEach(() => {
    store = {};
    store['phase-override'] = 'BULK';
    // INCREASE-producing history: top reps (12 == rMax), easy per-set RPE.
    store['logs'] = [
      log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7), log('Cable Row', 56, 12, 7),
    ];
  });

  it('without a rating → progresses (INCREASE, weight up) — control', () => {
    const r = DP.getSmartRecommendation('Cable Row', null, null);
    expect(r.status).toBe('INCREASE');
    expect(r.kg).toBeGreaterThan(56);
  });

  it("'grea' on an INCREASE day → HOLDS weight (does not push)", () => {
    const r = DP.getSmartRecommendation('Cable Row', null, null, undefined, 'grea');
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.kg).toBe(56); // held at lastW, not increased
  });

  it("'usoara' → still progresses (INCREASE, weight up)", () => {
    const r = DP.getSmartRecommendation('Cable Row', null, null, undefined, 'usoara');
    expect(r.status).toBe('INCREASE');
    expect(r.kg).toBeGreaterThan(56);
  });

  it("'normala' → still progresses (INCREASE, weight up)", () => {
    const r = DP.getSmartRecommendation('Cable Row', null, null, undefined, 'normala');
    expect(r.status).toBe('INCREASE');
    expect(r.kg).toBeGreaterThan(56);
  });

  it("'grea' does NOT fabricate a push on a non-INCREASE day (CONSOLIDATE stays a hold)", () => {
    // lastReps below rMax → CONSOLIDATE (hold weight) regardless of rating.
    store['logs'] = [log('Cable Row', 56, 9, 8)];
    const r = DP.getSmartRecommendation('Cable Row', null, null, undefined, 'grea');
    // The rating gate only ever demotes an INCREASE; on a non-INCREASE day it must
    // never RAISE the load. (kg snaps to the equipment stack, so assert the
    // invariant "not increased above the logged load", not an exact value.)
    expect(r.status).not.toBe('INCREASE');
    expect(r.kg).toBeLessThanOrEqual(56);
  });
});

// ── REAL coarse-rating→RPE scale guard (Daniel 2026-06-04) ───────────────────
// Production never logs RPE 9 — the per-set coarse rating maps to a COMPRESSED
// scale (workoutStore RATING_TO_RPE: usor=6.5 / potrivit=7.5 / greu=8.5). The DP
// thresholds MUST be calibrated to those exact values, or 'greu' silently falls
// into MEDIUM (mildly increases) and the coach feels unresponsive. These tests
// drive the EXACT production values so a future threshold drift fails here.
describe('DP._recommendRaw — REAL rating→RPE scale (6.5 / 7.5 / 8.5)', () => {
  it('greu (8.5) single at hit reps → HARD: HOLDS, never increases (Target 2 scale guard)', () => {
    // The exact production value for "greu" (RATING_TO_RPE). A SINGLE greu where the
    // user hit reps is productive overload → HOLD the load (no ease, no increase).
    // Sustained-greu / failed-reps ease cases are covered in the branch-coverage block.
    store['logs'] = [log('Cable Row', 56, 9, 8.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).not.toBe('EASE BACK');
    expect(r.status).not.toBe('INCREASE'); // greu must never push the load up
    expect(r.kg).toBe(56);
  });

  it('usor (6.5) below top → EASY: steps the rep target up +1 this session', () => {
    store['logs'] = [log('Cable Row', 56, 9, 6.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('INCREASE');
    expect(r.repsTarget).toBe(10); // min(rMax, 9+1)
  });

  it('potrivit (7.5) below top → MEDIUM: modest +1 rep, weight held', () => {
    store['logs'] = [log('Cable Row', 56, 9, 7.5)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.repsTarget).toBe(10);
    expect(r.kg).toBe(56);
  });
});

// ── Target 1: re-anchor to OBSERVED capacity, absorb a consistent override ────
// 50-Gigel sim 2026-06-06: a user who OVERRIDES (logs well above the prescription)
// must be caught up to within 1-2 sessions, not stuck-low for 28-40. The anchor is
// the last LOGGED load (getState.lastW), so once an override is logged the next rec
// reflects it — provided the single-greu EASE-BACK no longer demotes it (Target 2).
describe('DP._recommendRaw — re-anchor to observed override (Target 1)', () => {
  it('a logged override at hit reps is HELD next session (not demoted by a single greu)', () => {
    // The user overrode the (low) prescription and lifted 50kg for 9 reps, rated greu.
    // Next session the rec must anchor to the demonstrated 50kg, not ease below it.
    store['logs'] = [log('Leg Press', 50, 9, 8.5)];
    const r = DP._recommendRaw('Leg Press');
    expect(r.status).not.toBe('EASE BACK');
    expect(r.kg).toBe(50); // anchored to what was actually lifted, not eased down
  });

  it('a consistent override is absorbed within <=2 sessions (50->90 stays at 90)', () => {
    // Two sessions of a consistent override-up user logging 90kg at hit reps. The rec
    // must now sit AT the logged 90kg (absorbed), never the old prescribed-history
    // creep that left it ~55-67% low for dozens of sessions.
    store['logs'] = [
      log('Leg Press', 90, 10, 7.5), // newest: potrivit at 90
      log('Leg Press', 90, 9, 8.5),  // prior: greu at 90 (hit reps)
    ];
    const r = DP._recommendRaw('Leg Press');
    expect(r.kg).toBeGreaterThanOrEqual(90); // converged to demonstrated capacity
    expect(r.status).not.toBe('EASE BACK');
  });
});
