import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DB so tests don't touch localStorage
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn((key) => {
      if (key === 'phase-override') return 'CUT';
      if (key === 'logs') return [];
      return null;
    }),
    set: vi.fn(),
  },
  tod: () => new Date().toISOString().slice(0, 10),
  cleanEx: (s) => s.replace(/ pump$/, '').trim(),
}));

import { DP } from '../dp.js';

// dp_rep_class_v1 defaults ON (THE FLIP 2026-06-10) — the metadata-derived rep
// resolver that un-caps isolations in CUT. This file pins the LEGACY rep-range
// arm (curated-or-[8,12] + the CUT isolation cap) so the cut-cap mechanic + the
// progression branches that read the capped range stay individually exercised.
// The ON arm is covered by dp/repRange.test.js (unit) + persona-matrix + fp-sim.
beforeEach(() => {
  try {
    localStorage.setItem('_devFlags', JSON.stringify({ dp_rep_class_v1: false }));
  } catch { /* jsdom always provides localStorage */ }
});

// ── getPhaseAwareRepRange ─────────────────────────────────────────────────────

describe('DP.getPhaseAwareRepRange', () => {
  it('returns capped [rMin, 10] for isolation exercise with rMax=12 in CUT', () => {
    expect(DP.getPhaseAwareRepRange('Cable Curl', true)).toEqual([10, 10]);
    // Real emitted CORE_AUTO names (legacy 'Preacher Curl'/'Overhead Triceps'/'Pushdown' were dead).
    expect(DP.getPhaseAwareRepRange('EZ-bar Preacher Curl', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Cable Overhead Triceps Extension Rope', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Cable Triceps Pushdown Straight Bar', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Incline DB Curl', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Bayesian Curl', true)).toEqual([10, 10]);
  });

  it('returns original [10, 15] for isolation in NON-CUT (founder spec 2026-06-10)', () => {
    expect(DP.getPhaseAwareRepRange('Cable Curl', false)).toEqual([10, 15]);
    // Real emitted CORE_AUTO triceps name (legacy 'Overhead Triceps' was dead).
    expect(DP.getPhaseAwareRepRange('Cable Overhead Triceps Extension Rope', false)).toEqual([10, 15]);
  });

  it('returns original range for compound with [8, 12] in CUT (Lat Pulldown)', () => {
    expect(DP.getPhaseAwareRepRange('Lat Pulldown', true)).toEqual([8, 12]);
    expect(DP.getPhaseAwareRepRange('Flat DB Press', true)).toEqual([8, 12]);
    expect(DP.getPhaseAwareRepRange('Chest-Supported Row', true)).toEqual([10, 12]);
  });

  it('12-20 laterals are OUTSIDE the legacy cut-cap scope (founder spec 2026-06-10 moved them up)', () => {
    // The legacy cap only bites rMax in (10,15]; lateral/rear-delt are now [12,20]
    // per the founder revision, so even the legacy arm leaves them uncapped — the
    // cap mechanic itself stays covered by the curls/triceps assertions above.
    expect(DP.getPhaseAwareRepRange('DB Lateral Raise', true)).toEqual([12, 20]);
    expect(DP.getPhaseAwareRepRange('DB Rear Delt Fly', true)).toEqual([12, 20]);
  });

  it('15-20 leg-machine isolations are outside the cut-cap scope too (Leg Curl)', () => {
    // Founder spec 2026-06-10 (semantic rewrite of #20): single-joint leg machines
    // are back to [15,20]; rMax 20 > 15 → the legacy cap never applied to this band.
    expect(DP.getPhaseAwareRepRange('Leg Curl', true)).toEqual([15, 20]);
  });
});

// ── _recommendRaw in CUT phase ────────────────────────────────────────────────

describe('DP._recommendRaw — CUT phase progression', () => {
  it('in CUT: Cable Curl at 10 reps × 3 sessions triggers INCREASE weight (not CONSOLIDATE reps)', () => {
    // Mock 3 sessions all at reps=10, RPE≤8 → atTopReps should be true with rMax=10
    vi.mocked(DP.getLogs) || (DP.getLogs = vi.fn());
    const origGetState = DP.getState.bind(DP);
    DP.getState = vi.fn(() => ({
      lastW: 30, lastReps: 10, lastRPE: 7,
      isStagnant: false,
      atTopReps: true, // 3×10 at rMax=10 → at top
      range: [10, 10],
      rMin: 10, rMax: 10,
      currentSets: 3, extraSets: 0,
      logs: [
        { w: 30, reps: '10', rpe: 7 },
        { w: 30, reps: '10', rpe: 7 },
        { w: 30, reps: '10', rpe: 7 },
      ]
    }));

    const result = DP._recommendRaw('Cable Curl');
    DP.getState = origGetState;

    expect(result.status).toBe('INCREASE');
    expect(result.repsTarget).toBe(10); // returns to rMin after weight bump
  });

  it('in CUT: Cable Curl at 8 reps consolidates up to 10 (capped by rMax=10)', () => {
    const origGetState = DP.getState.bind(DP);
    DP.getState = vi.fn(() => ({
      lastW: 30, lastReps: 8, lastRPE: 7,
      isStagnant: false,
      atTopReps: false,
      range: [10, 10],
      rMin: 10, rMax: 10,
      currentSets: 3, extraSets: 0,
      logs: [{ w: 30, reps: '8', rpe: 7 }]
    }));

    const result = DP._recommendRaw('Cable Curl');
    DP.getState = origGetState;

    expect(result.status).toBe('CONSOLIDATE');
    expect(result.repsTarget).toBeLessThanOrEqual(10); // capped at rMax=10
  });

  it('in CUT: Lat Pulldown (compound) keeps [8, 12] range unaffected', () => {
    const origGetState = DP.getState.bind(DP);
    DP.getState = vi.fn(() => ({
      lastW: 64, lastReps: 12, lastRPE: 7,
      isStagnant: false,
      atTopReps: true,
      range: [8, 12],
      rMin: 8, rMax: 12,
      currentSets: 4, extraSets: 0,
      logs: [
        { w: 64, reps: '12', rpe: 7 },
        { w: 64, reps: '12', rpe: 7 },
        { w: 64, reps: '12', rpe: 7 },
      ]
    }));

    const result = DP._recommendRaw('Lat Pulldown');
    DP.getState = origGetState;

    expect(result.status).toBe('INCREASE');
    expect(result.repsTarget).toBe(8); // returns to rMin=8
  });
});

// ── checkInSessionAdjust — responsive per-set autoregulation ─────────────────
// Daniel rewrite 2026-05-30: react to EACH set (not 2-consecutive). The DB mock
// in this file returns phase-override='CUT' → REPS autoregulation (masa-like, not
// STRENGTH). Lat Pulldown CUT range caps to [8,10] (rMax 12>10, isolation).

describe('DP.checkInSessionAdjust — per-set reps autoregulation (CUT/masa phase)', () => {
  beforeEach(() => {
    DP.getState = vi.fn(() => ({ lastW: 60 }));
  });

  afterEach(() => {
    DP.getState = DP.getState.mockRestore?.() || DP.getState;
  });

  it('single greu eases the NEXT set WEIGHT one step (Daniel 2026-06-06 Gigel rule)', () => {
    // Daniel decision 2026-06-06: a hard set must VISIBLY ease the WEIGHT when there
    // is a working load to drop from (lastW 60) — holding the load and only trimming
    // reps reads as "the coach did nothing". Lat Pulldown stack 60 -> 55. Weight-first.
    const r = DP.checkInSessionAdjust('Lat Pulldown', [10], [8], { recKg: 60, recReps: 10 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newKg).toBe(55);
    expect(r.newReps).toBeUndefined(); // weight-first now, not the rep target
  });

  it('cold-start greu (no working load) trims reps, not weight', () => {
    // Fallback: with no prior history (lastW 0) there is no reliable load to step
    // down from, so a hard set trims the rep target (−2 hypertrophy, floored) and
    // keeps the conservative starting load. loggedKg present so the early gate passes.
    DP.getState = vi.fn(() => ({ lastW: 0 }));
    const r = DP.checkInSessionAdjust('Lat Pulldown', [10], [10], { recKg: 60, recReps: 10, loggedKg: 60 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newReps).toBe(8);
    expect(r.newKg).toBeUndefined();
  });

  it('greu at the rep floor (rMin) eases the WEIGHT instead of echoing the set', () => {
    // Lat Pulldown [8,12]; recReps already at the floor (8) -> reps cannot drop, so a
    // hard set must ease the WEIGHT one stack step (60 -> 55), NOT return {adjust:false}
    // and echo the same load. Regression for the "coach just repeats last set" bug.
    const r = DP.checkInSessionAdjust('Lat Pulldown', [10], [8], { recKg: 60, recReps: 8 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newKg).toBe(55);
    expect(r.newReps).toBeUndefined();
  });

  it('single greu adjustment is MODEST (≤2 reps, never a big jump)', () => {
    const r = DP.checkInSessionAdjust('Lat Pulldown', [10], [9], { recKg: 60, recReps: 10 });
    expect(r.adjust).toBe(true);
    expect(10 - (r.newReps ?? 10)).toBeLessThanOrEqual(2);
  });

  it('potrivit holds (no adjust) on an early set', () => {
    const r = DP.checkInSessionAdjust('Lat Pulldown', [7.5], [10], { recKg: 60, recReps: 10, setIdx: 1 });
    expect(r.adjust).toBe(false);
  });

  it('potrivit applies a small late-set taper (−1 rep) on later sets', () => {
    const r = DP.checkInSessionAdjust('Lat Pulldown', [7.5], [10], { recKg: 60, recReps: 10, setIdx: 3 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(r.newReps).toBe(9);
  });

  it('usor at target nudges reps UP one (capped at rMax)', () => {
    // CUT range capped [8,10]; rec 9 → up to 10 (rMax).
    const r = DP.checkInSessionAdjust('Lat Pulldown', [6.5], [9], { recKg: 60, recReps: 9, setIdx: 0 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newReps).toBe(10);
  });

  it('usor on a LATE set holds (fatigue — no late up-nudge)', () => {
    const r = DP.checkInSessionAdjust('Lat Pulldown', [6.5], [9], { recKg: 60, recReps: 9, setIdx: 3 });
    expect(r.adjust).toBe(false);
  });

  it('over-performance (logged volume ≫ rec) ramps the target up', () => {
    // rec 10×60 = 600; logged 12×60 well over but capped — use a clearer case:
    // rec 8×60=480; logged 12×60=720 (1.5×), usor → reps ramp up.
    const r = DP.checkInSessionAdjust('Lat Pulldown', [6.5], [12], { recKg: 60, recReps: 8 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newReps).toBeGreaterThan(8);
  });

  it('returns no adjust with no rated set', () => {
    expect(DP.checkInSessionAdjust('Lat Pulldown', [], []).adjust).toBe(false);
  });

  it('returns no adjust when no history (lastW = 0 / falsy)', () => {
    DP.getState = vi.fn(() => ({ lastW: 0 }));
    const r = DP.checkInSessionAdjust('Lat Pulldown', [10], [8], { recKg: 60, recReps: 10 });
    expect(r.adjust).toBe(false);
  });
});

// ── checkInSessionAdjust — STRENGTH phase moves WEIGHT ───────────────────────
describe('DP.checkInSessionAdjust — STRENGTH phase weight autoregulation', () => {
  afterEach(() => {
    DP.getState = DP.getState.mockRestore?.() || DP.getState;
  });

  it('single greu drops one weight step in STRENGTH', async () => {
    const { DB } = await import('../../db.js');
    DB.get.mockImplementation((k) => (k === 'phase-override' ? 'STRENGTH' : k === 'logs' ? [] : null));
    DP.getState = vi.fn(() => ({ lastW: 60 }));
    const r = DP.checkInSessionAdjust('Lat Pulldown', [10], [8], { recKg: 60, recReps: 8 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    expect(typeof r.newKg).toBe('number');
    expect(r.newKg).toBeLessThan(60);
    expect(r.newReps).toBeUndefined();
    DB.get.mockImplementation((k) => (k === 'phase-override' ? 'CUT' : k === 'logs' ? [] : null));
  });

  it('heavy-low-reps over-performance (4×60 vs rec 10×20) moves weight toward demonstrated load', async () => {
    const { DB } = await import('../../db.js');
    DB.get.mockImplementation((k) => (k === 'phase-override' ? 'STRENGTH' : k === 'logs' ? [] : null));
    // Logged 4 reps @ 60kg = 240 vol vs rec 10×20=200 → 1.2×... bump rec so it
    // crosses the 1.5× deviation gate: rec 10×20=200, logged 4×80=320 (1.6×).
    DP.getState = vi.fn(() => ({ lastW: 80 }));
    const r = DP.checkInSessionAdjust('Lat Pulldown', [7.5], [4], { recKg: 20, recReps: 10 });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('up');
    expect(r.newKg).toBeGreaterThan(20); // ramped toward the demonstrated weight
    expect(r.newReps).toBeLessThan(10); // strength-style → rep range down
    DB.get.mockImplementation((k) => (k === 'phase-override' ? 'CUT' : k === 'logs' ? [] : null));
  });
});

// ── getRepsRange (phase-aware passthrough) ───────────────────────────────────

describe('DP.getRepsRange', () => {
  it('returns phase-aware range (CUT caps Cable Curl isolation to [10,10])', () => {
    // DB mock pins phase-override to CUT.
    expect(DP.getRepsRange('Cable Curl')).toEqual([10, 10]);
  });

  it('returns full [8,12] for a compound in CUT', () => {
    expect(DP.getRepsRange('Lat Pulldown')).toEqual([8, 12]);
  });
});

// ── getSmartRecommendation — readiness gating + rep range string ─────────────

describe('DP.getSmartRecommendation', () => {
  afterEach(() => {
    DP.getState = DP.getState.mockRestore?.() || DP.getState;
  });

  it('low readiness (<60) downgrades INCREASE → CONSOLIDATE, holds last weight', () => {
    DP.getState = vi.fn(() => ({
      lastW: 30, lastReps: 10, lastRPE: 7,
      isStagnant: false, atTopReps: true,
      range: [10, 10], rMin: 10, rMax: 10,
      currentSets: 3, extraSets: 0,
      logs: [
        { w: 30, reps: '10', rpe: 7 },
        { w: 30, reps: '10', rpe: 7 },
        { w: 30, reps: '10', rpe: 7 },
      ],
    }));
    const result = DP.getSmartRecommendation('Cable Curl', 50, null);
    // Base recommend() would INCREASE; readiness 50 holds it at CONSOLIDATE.
    expect(result.status).toBe('CONSOLIDATE');
    expect(result.kg).toBe(30); // held at last weight
    expect(typeof result.repsRange).toBe('string');
    expect(result.repsRange).toMatch(/^\d+–\d+$/);
  });

  it('high readiness leaves INCREASE intact + attaches intensity label + rep range', () => {
    DP.getState = vi.fn(() => ({
      lastW: 30, lastReps: 10, lastRPE: 7,
      isStagnant: false, atTopReps: true,
      range: [10, 10], rMin: 10, rMax: 10,
      currentSets: 3, extraSets: 0,
      logs: [
        { w: 30, reps: '10', rpe: 7 },
        { w: 30, reps: '10', rpe: 7 },
        { w: 30, reps: '10', rpe: 7 },
      ],
    }));
    const result = DP.getSmartRecommendation('Cable Curl', 90, null);
    expect(result.status).toBe('INCREASE');
    expect(typeof result.intensityLabel).toBe('string');
    expect(result.repsRange).toMatch(/^\d+–\d+$/);
  });
});
