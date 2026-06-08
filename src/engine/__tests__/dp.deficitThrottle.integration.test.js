// ══ BUILD F6c #37 — deficit-aware throttle INTEGRATION test (F6c spec §3) ════
// The dp.js climb is phase-blind today. #37 threads the resolved energy phase
// (resolveActivePhase token) read-only into getSmartRecommendation opts; behind
// dp_deficit_throttle_v1 a CUT (a) damps the pure-easy-run NEW-max climb step and
// (b) reframes a stagnation HOLD as success (no +SET escalation). OFF / non-CUT →
// byte-identical. Uses the REAL rating literals (usor 6.5 / potrivit 7.5 / greu 8.5)
// + the _devFlags dev override (same pattern as the e1rm/ceiling integration tests).

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import { deficitClimbFactor, DEFICIT_CLIMB_FACTOR } from '../dp/ceiling.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const EX = 'Leg Extension'; // machine → e1RM-eligible; REP_RANGES [10,15] → floor 10
const DAY = 86400000;
const BASE = 1_717_000_000_000;

const ON = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_deficit_throttle_v1: true }));
// dp_deficit_throttle_v1 ON, e1RM cluster OFF: the stagnation-reframe block pins the
// deficit throttle's effect on the RAW stagnation branch (56×12 same-weight run).
// dp_e1rm_v1 now DEFAULTS ON (THE FLIP 2026-06-08) and would route that top-reps
// history through the find-your-weight CATCH UP before the stagnation reframe is
// reached, masking the branch under test — so force the e1RM cluster OFF here (the
// throttle on the e1RM find-your-weight climb is covered by the easy-run block).
const ON_STAG = () => localStorage.setItem('_devFlags', JSON.stringify({
  dp_deficit_throttle_v1: true,
  dp_e1rm_v1: false, dp_strength_kalman_v1: false, dp_ceiling_v1: false,
}));

// A coach-follower easy-run history: the SAME light load taken to target reps and
// rated `usor` across sessions (consecutiveEasyHit run, no heavier logged set) →
// the pure easy-run NEW-max climb (the branch #37 throttles).
function seedEasyRun(kg = 30) {
  const logs = [];
  for (let i = 0; i < 4; i++) {
    logs.push({ ex: EX, w: kg, reps: 15, rpe: RPE.usor, ts: BASE + i * DAY });
  }
  localStorage.setItem('logs', JSON.stringify(logs));
}

// A stagnation history reaching the +SET branch: same weight 3 sessions, lastReps ==
// rMax (skips CONSOLIDATE) but NOT atTopReps (reps [12,11,12]), RPE 8 (skips usor/
// greu) — mirrors dp.branches.test.js STAGNANT +SET. Cable Row (rMax 12), extraSets 0.
const SEX = 'Cable Row';
function seedStagnant() {
  localStorage.setItem('logs', JSON.stringify([
    { ex: SEX, w: 56, reps: 12, rpe: 8, ts: BASE + 2 * DAY },
    { ex: SEX, w: 56, reps: 11, rpe: 8, ts: BASE + 1 * DAY },
    { ex: SEX, w: 56, reps: 12, rpe: 8, ts: BASE + 0 * DAY },
  ]));
}

const smart = (energyPhase) =>
  DP.getSmartRecommendation(EX, null, null, BASE + 10 * DAY, null, [], { energyPhase });
const smartStag = (energyPhase) =>
  DP.getSmartRecommendation(SEX, null, null, BASE + 10 * DAY, null, [], { energyPhase });

describe('deficitClimbFactor — pure throttle factor', () => {
  it('CUT throttles, every other phase is full (1.0)', () => {
    expect(deficitClimbFactor('CUT')).toBe(DEFICIT_CLIMB_FACTOR);
    expect(deficitClimbFactor('CUT')).toBeLessThan(1);
    for (const p of ['BULK', 'STRENGTH', 'MAINTENANCE', null, undefined, 'AUTO']) {
      expect(deficitClimbFactor(p)).toBe(1);
    }
  });
});

describe('dp_deficit_throttle_v1 OFF — byte-identical regardless of energyPhase', () => {
  beforeEach(() => { localStorage.clear(); seedEasyRun(); });

  it('a CUT phase token with the flag OFF gives the SAME climb as no phase', () => {
    const noPhase = smart(null);
    const cutOff = smart('CUT'); // flag OFF → energyPhase ignored
    expect(cutOff.kg).toBe(noPhase.kg);
    expect(cutOff.status).toBe(noPhase.status);
  });
});

describe('dp_deficit_throttle_v1 ON — CUT damps the NEW-max easy-run climb', () => {
  beforeEach(() => { localStorage.clear(); seedEasyRun(); ON(); });

  it('a CUT climb is <= a BULK climb on the same easy-run history', () => {
    const bulk = smart('BULK');
    const cut = smart('CUT');
    // The easy-run NEW-max climb branch is genuinely live (BULK climbs above the
    // 30kg logged load), so the throttle has something to damp.
    expect(bulk.kg).toBeGreaterThan(30);
    // CUT damps the new-max step → never above BULK.
    expect(cut.kg).toBeLessThanOrEqual(bulk.kg);
    // The PR-floor / capacity is never cratered — a cut still moves forward.
    expect(cut.kg).toBeGreaterThan(0);
  });

  it('BULK is byte-identical to the no-phase climb (only CUT throttles)', () => {
    const bulk = smart('BULK');
    // Re-seed clean + run with the flag still on but BULK → no throttle.
    localStorage.removeItem('_devFlags');
    const off = smart('BULK');
    expect(bulk.kg).toBe(off.kg);
  });
});

describe('dp_deficit_throttle_v1 ON — CUT reframes a stagnation hold as success', () => {
  beforeEach(() => { localStorage.clear(); seedStagnant(); ON_STAG(); });

  it('a CUT stagnation HOLDS as MAINTAIN (no +SET escalation)', () => {
    const cut = smartStag('CUT');
    expect(cut.status).toBe('MAINTAIN');
    expect(cut.kg).toBeGreaterThan(0);
    // The +SET side effect must NOT have been written (the hold is not an escalation).
    expect(localStorage.getItem(`ex-extra-sets-${SEX}`)).toBeNull();
  });

  it('a BULK stagnation still escalates (+SET) — the reframe is CUT-only', () => {
    const bulk = smartStag('BULK');
    expect(bulk.status).toBe('STAGNANT +SET');
  });
});
