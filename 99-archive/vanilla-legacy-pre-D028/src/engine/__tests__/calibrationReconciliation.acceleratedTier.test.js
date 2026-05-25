import { describe, it, expect } from 'vitest';
import {
  computeEngineTier,
  computeEngineTierWithAccelerated,
} from '../calibrationReconciliation.js';

function legitEntry({ ex, dev, ts, RPE = 7 }) {
  return {
    type: 'user_override_weight_high',
    exerciseName: ex,
    recommended: 100,
    actual: 100 * (1 + dev),
    deviation_pct: dev,
    tier: 'T0',
    repsAchieved: 8,
    targetReps: 8,
    RPE,
    ts,
  };
}

describe('computeEngineTierWithAccelerated() — baseline pass-through', () => {
  it('sessionCount=0 + no CDL → T0 (baseline)', () => {
    expect(computeEngineTierWithAccelerated(0, [])).toBe('T0');
  });

  it('sessionCount=5 + no CDL → T1 (natural advance)', () => {
    expect(computeEngineTierWithAccelerated(5, [])).toBe('T1');
  });

  it('sessionCount=21 + no CDL → T2 (natural)', () => {
    expect(computeEngineTierWithAccelerated(21, [])).toBe('T2');
  });

  it('sessionCount=1000 + no CDL → T2 (natural ceiling)', () => {
    expect(computeEngineTierWithAccelerated(1000, [])).toBe('T2');
  });

  it('null/undefined/invalid sessionCount → T0 baseline', () => {
    expect(computeEngineTierWithAccelerated(undefined, [])).toBe('T0');
    expect(computeEngineTierWithAccelerated(null, [])).toBe('T0');
    expect(computeEngineTierWithAccelerated(NaN, [])).toBe('T0');
  });
});

describe('computeEngineTierWithAccelerated() — accelerated T0→T1 trigger', () => {
  it('sessionCount=0 + 3 distinct exercises pattern → T1 (accelerated)', () => {
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 6 }),
      legitEntry({ ex: 'Bench', dev: 0.30, ts: 5 }),
      legitEntry({ ex: 'Row', dev: 0.20, ts: 4 }),
      legitEntry({ ex: 'Row', dev: 0.30, ts: 3 }),
      legitEntry({ ex: 'OHP', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'OHP', dev: 0.40, ts: 1 }),
    ];
    expect(computeEngineTierWithAccelerated(0, entries)).toBe('T1');
  });

  it('sessionCount=0 + 2 distinct exercises only → T0 (no advance)', () => {
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.30, ts: 4 }),
      legitEntry({ ex: 'Bench', dev: 0.25, ts: 3 }),
      legitEntry({ ex: 'Row', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Row', dev: 0.30, ts: 1 }),
    ];
    expect(computeEngineTierWithAccelerated(0, entries)).toBe('T0');
  });

  it('sessionCount=4 (still T0 baseline) + accelerated trigger → T1', () => {
    const entries = [
      legitEntry({ ex: 'A', dev: 0.20, ts: 6 }),
      legitEntry({ ex: 'A', dev: 0.30, ts: 5 }),
      legitEntry({ ex: 'B', dev: 0.20, ts: 4 }),
      legitEntry({ ex: 'B', dev: 0.30, ts: 3 }),
      legitEntry({ ex: 'C', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'C', dev: 0.40, ts: 1 }),
    ];
    expect(computeEngineTierWithAccelerated(4, entries)).toBe('T1');
  });
});

describe('computeEngineTierWithAccelerated() — accelerated NOT applied above T0', () => {
  it('sessionCount=5 + pattern persists → still T1 (not bumped to T2)', () => {
    const entries = [
      legitEntry({ ex: 'A', dev: 0.30, ts: 6 }),
      legitEntry({ ex: 'A', dev: 0.40, ts: 5 }),
      legitEntry({ ex: 'B', dev: 0.30, ts: 4 }),
      legitEntry({ ex: 'B', dev: 0.40, ts: 3 }),
      legitEntry({ ex: 'C', dev: 0.30, ts: 2 }),
      legitEntry({ ex: 'C', dev: 0.40, ts: 1 }),
    ];
    expect(computeEngineTierWithAccelerated(5, entries)).toBe('T1');
  });

  it('sessionCount=21 + pattern persists → still T2 (no downgrade)', () => {
    const entries = [
      legitEntry({ ex: 'A', dev: 0.30, ts: 6 }),
      legitEntry({ ex: 'A', dev: 0.40, ts: 5 }),
      legitEntry({ ex: 'B', dev: 0.30, ts: 4 }),
      legitEntry({ ex: 'B', dev: 0.40, ts: 3 }),
      legitEntry({ ex: 'C', dev: 0.30, ts: 2 }),
      legitEntry({ ex: 'C', dev: 0.40, ts: 1 }),
    ];
    expect(computeEngineTierWithAccelerated(21, entries)).toBe('T2');
  });
});

describe('computeEngineTierWithAccelerated() — purity invariants', () => {
  it('same input → same output (ADR 018 §2 determinism)', () => {
    const entries = [
      legitEntry({ ex: 'A', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'A', dev: 0.20, ts: 1 }),
    ];
    expect(computeEngineTierWithAccelerated(0, entries)).toBe(
      computeEngineTierWithAccelerated(0, entries)
    );
  });

  it('does NOT mutate input cdlEntries', () => {
    const entries = [
      legitEntry({ ex: 'A', dev: 0.20, ts: 6 }),
      legitEntry({ ex: 'A', dev: 0.30, ts: 5 }),
      legitEntry({ ex: 'B', dev: 0.20, ts: 4 }),
      legitEntry({ ex: 'B', dev: 0.30, ts: 3 }),
      legitEntry({ ex: 'C', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'C', dev: 0.40, ts: 1 }),
    ];
    const before = JSON.stringify(entries);
    computeEngineTierWithAccelerated(0, entries);
    expect(JSON.stringify(entries)).toBe(before);
  });

  it('baseline computeEngineTier still works unchanged (no breaking change)', () => {
    expect(computeEngineTier(0)).toBe('T0');
    expect(computeEngineTier(5)).toBe('T1');
    expect(computeEngineTier(21)).toBe('T2');
  });

  it('null cdlEntries handled safely → baseline tier', () => {
    expect(computeEngineTierWithAccelerated(0, null)).toBe('T0');
    expect(computeEngineTierWithAccelerated(0, undefined)).toBe('T0');
  });
});
