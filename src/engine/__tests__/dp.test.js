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

// ── getPhaseAwareRepRange ─────────────────────────────────────────────────────

describe('DP.getPhaseAwareRepRange', () => {
  it('returns capped [rMin, 10] for isolation exercise with rMax=12 in CUT', () => {
    expect(DP.getPhaseAwareRepRange('Cable Curl', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Preacher Curl', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Overhead Triceps', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Pushdown', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Incline DB Curl', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Bayesian Curl', true)).toEqual([10, 10]);
  });

  it('returns original [10, 12] for isolation in NON-CUT', () => {
    expect(DP.getPhaseAwareRepRange('Cable Curl', false)).toEqual([10, 12]);
    expect(DP.getPhaseAwareRepRange('Overhead Triceps', false)).toEqual([10, 12]);
  });

  it('returns original range for compound with [8, 12] in CUT (Lat Pulldown)', () => {
    expect(DP.getPhaseAwareRepRange('Lat Pulldown', true)).toEqual([8, 12]);
    expect(DP.getPhaseAwareRepRange('Flat DB Press', true)).toEqual([8, 12]);
    expect(DP.getPhaseAwareRepRange('Chest-Supported Row', true)).toEqual([10, 12]);
  });

  it('caps 12-15 isolation range to [10,10] in CUT (Lateral Raises, Rear Delt Fly)', () => {
    expect(DP.getPhaseAwareRepRange('Lateral Raises', true)).toEqual([10, 10]);
    expect(DP.getPhaseAwareRepRange('Rear Delt Fly', true)).toEqual([10, 10]);
  });

  it('leaves 15-20 leg ranges unchanged in CUT (Leg Curl)', () => {
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

// ── checkInSessionAdjust — RPE 4-tap thresholds (TASK #AA-FIX) ───────────────

describe('DP.checkInSessionAdjust — RPE 4-tap thresholds', () => {
  beforeEach(() => {
    DP.getState = vi.fn(() => ({ lastW: 60 }));
  });

  afterEach(() => {
    DP.getState = DP.getState.mockRestore?.() || DP.getState;
  });

  it('drops weight on 2× Very Hard (RPE 10)', () => {
    const result = DP.checkInSessionAdjust('Lat Pulldown', [10, 10], [8, 8]);
    expect(result.adjust).toBe(true);
    expect(result.dir).toBe('down');
  });

  it('does NOT drop weight on 2× Hard (RPE 9)', () => {
    const result = DP.checkInSessionAdjust('Lat Pulldown', [9, 9], [8, 8]);
    expect(result.adjust).toBe(false);
  });

  it('drops weight on mixed [10, 10] regardless of reps', () => {
    const result = DP.checkInSessionAdjust('Lat Pulldown', [10, 10], [5, 5]);
    expect(result.adjust).toBe(true);
    expect(result.dir).toBe('down');
  });

  it('ups weight on 2× Easy (RPE 6.5) with max reps', () => {
    // Lat Pulldown CUT range = [8, 12], rMax=12
    const result = DP.checkInSessionAdjust('Lat Pulldown', [6.5, 6.5], [12, 12]);
    expect(result.adjust).toBe(true);
    expect(result.dir).toBe('up');
  });

  it('does NOT up weight on 2× Easy (RPE 6.5) with sub-max reps', () => {
    const result = DP.checkInSessionAdjust('Lat Pulldown', [6.5, 6.5], [8, 8]);
    expect(result.adjust).toBe(false);
  });

  it('returns no adjust on mixed Hard/Very Hard (9, 10)', () => {
    const result = DP.checkInSessionAdjust('Lat Pulldown', [9, 10], [8, 8]);
    expect(result.adjust).toBe(false);
  });

  it('returns no adjust with fewer than 2 RPE readings', () => {
    const result = DP.checkInSessionAdjust('Lat Pulldown', [10], [8]);
    expect(result.adjust).toBe(false);
  });

  it('returns no adjust when no history (lastW = 0 / falsy)', () => {
    DP.getState = vi.fn(() => ({ lastW: 0 }));
    const result = DP.checkInSessionAdjust('Lat Pulldown', [10, 10], [8, 8]);
    expect(result.adjust).toBe(false);
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
