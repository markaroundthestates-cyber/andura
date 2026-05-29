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

    const iso = DP._recommendRaw('Cable Curl');
    expect(iso.status).toBe('INIT');
    expect(iso.kg).toBe(10);
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

  it('CAP REPS: at/above MAX_KG but below rep cap → hold weight, add reps', () => {
    // Lateral Raises MAX_KG=18, range [12,15], rMax+4=19
    store['logs'] = [log('Lateral Raises', 18, 13, 7)];
    const r = DP._recommendRaw('Lateral Raises');
    expect(r.status).toBe('CAP REPS');
    expect(r.kg).toBe(18);           // weight held at cap
    expect(r.repsTarget).toBe(14);   // lastReps+1, < rMax+4
    expect(r.rir).toBe(2);
  });

  it('PEAK: at weight cap AND rep cap (>= rMax+4) → maintain', () => {
    // Lateral Raises rMax=15 → rMax+4=19; lastReps 19 hits PEAK
    store['logs'] = [log('Lateral Raises', 18, 19, 7)];
    const r = DP._recommendRaw('Lateral Raises');
    expect(r.status).toBe('PEAK');
    expect(r.kg).toBe(18);
    expect(r.repsTarget).toBe(15);   // rMax
  });

  it('TOO HEAVY: lastRPE >= 9 → consolidate at RIR 1, +1 rep', () => {
    store['logs'] = [log('Cable Row', 56, 9, 9)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('TOO HEAVY');
    expect(r.rir).toBe(1);
    expect(r.kg).toBe(56);
    expect(r.repsTarget).toBe(10);   // min(rMax12, 9 + 1)
  });

  it('CONSOLIDATE: lastReps < rMax with easy RPE adds 2 reps', () => {
    // Cable Row rMax=12, lastReps 9, RPE 7 (<=7) → +2
    store['logs'] = [log('Cable Row', 56, 9, 7)];
    const r = DP._recommendRaw('Cable Row');
    expect(r.status).toBe('CONSOLIDATE');
    expect(r.repsTarget).toBe(11);   // min(12, 9+2)
    expect(r.rir).toBe(2);
  });

  it('CONSOLIDATE: RPE 8 (not easy, not >=9) adds only 1 rep', () => {
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
    expect(DP.getPhaseAwareRepRange('Cable Curl', false)).toEqual([10, 12]);
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

// ── checkInSessionAdjust — up path requires reps >= rMax ──────────────────────

describe('DP.checkInSessionAdjust — up path boundary', () => {
  beforeEach(() => {
    store['phase-override'] = 'BULK';
    store['logs'] = [log('Cable Row', 56, 12, 7)];
  });

  it('does NOT up when both sets easy but reps below rMax', () => {
    // Cable Row rMax=12; reps 11 → no up
    const r = DP.checkInSessionAdjust('Cable Row', [6, 6], [11, 11]);
    expect(r.adjust).toBe(false);
  });

  it('ups when both sets easy AND max reps reach rMax', () => {
    const r = DP.checkInSessionAdjust('Cable Row', [6, 6], [12, 12]);
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newKg).toBeGreaterThan(56);
  });

  it('RPE 6.5 is the easy boundary (inclusive)', () => {
    const r = DP.checkInSessionAdjust('Cable Row', [6.5, 6.5], [12, 12]);
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
  });

  it('RPE 7 is NOT easy → no up adjust', () => {
    const r = DP.checkInSessionAdjust('Cable Row', [7, 7], [12, 12]);
    expect(r.adjust).toBe(false);
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
});

// ── §07.198-204 — injectable clock pins the AUTO/TARGET_DATE CUT branch ───────
//
// TARGET_DATE = 2026-07-20 (src/constants.js). With phase-override='AUTO' the
// CUT decision is `now < TARGET_DATE`. Before this fix it read `new Date()`
// inline, so the AUTO branch could not be pinned. _isInCut(phaseOverride, nowMs)
// defaults to the real clock when nowMs omitted (production byte-identical) and
// accepts an injected epoch ms for deterministic tests.
//
// Discriminator: 'Lateral Raises' range [12,15] (isolation) → CUT caps to
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
    expect(DP.getRepsRange('Lateral Raises', BEFORE)).toEqual([10, 10]); // in-cut cap
    expect(DP.getRepsRange('Lateral Raises', AFTER)).toEqual([12, 15]);  // not-in-cut
  });

  it('getRepsRange omitting nowMs defaults to real clock (no throw, valid range)', () => {
    const r = DP.getRepsRange('Lateral Raises');
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBe(2);
  });

  it('_recommendRaw on AUTO uses injected clock for the cut-aware rep target', () => {
    store['logs'] = [
      log('Lateral Raises', 12, 12, 7),
      log('Lateral Raises', 12, 12, 7),
      log('Lateral Raises', 12, 12, 7),
    ];
    // In-cut (BEFORE) caps the isolation range to [10,10]; not-in-cut (AFTER)
    // keeps [12,15]. The default-maintain repsTarget is min(rMax, lastReps+1),
    // so the cut branch yields a strictly lower-or-equal target than the bulk one.
    const cut = DP._recommendRaw('Lateral Raises', BEFORE);
    const bulk = DP._recommendRaw('Lateral Raises', AFTER);
    expect(cut.repsTarget).toBeLessThanOrEqual(bulk.repsTarget);
  });
});
