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
