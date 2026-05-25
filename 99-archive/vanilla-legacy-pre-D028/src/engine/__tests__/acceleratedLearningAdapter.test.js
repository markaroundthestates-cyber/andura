import { describe, it, expect, vi } from 'vitest';
import {
  applyAcceleratedLearningUpgrade,
  readAggressiveLoadingLog,
} from '../acceleratedLearningAdapter.js';

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

const FAKE_DP = {
  roundToStep: (kg /*, ex */) => Math.round(kg * 2) / 2,  // 0.5 kg step
};

describe('applyAcceleratedLearningUpgrade() — no trigger paths', () => {
  it('null recommendation → returned as-is', () => {
    expect(applyAcceleratedLearningUpgrade(null, 'Bench', [], FAKE_DP)).toBeNull();
  });

  it('undefined recommendation → returned as-is', () => {
    expect(applyAcceleratedLearningUpgrade(undefined, 'Bench', [], FAKE_DP)).toBeUndefined();
  });

  it('recommendation.kg == 0 → returned unchanged', () => {
    const rec = { kg: 0, repsTarget: 8 };
    expect(applyAcceleratedLearningUpgrade(rec, 'Bench', [], FAKE_DP)).toBe(rec);
  });

  it('recommendation.kg negative → returned unchanged', () => {
    const rec = { kg: -10, repsTarget: 8 };
    expect(applyAcceleratedLearningUpgrade(rec, 'Bench', [], FAKE_DP)).toBe(rec);
  });

  it('empty exerciseName → returned unchanged', () => {
    const rec = { kg: 100, repsTarget: 8 };
    expect(applyAcceleratedLearningUpgrade(rec, '', [], FAKE_DP)).toBe(rec);
  });

  it('non-string exerciseName → returned unchanged', () => {
    const rec = { kg: 100, repsTarget: 8 };
    expect(applyAcceleratedLearningUpgrade(rec, null, [], FAKE_DP)).toBe(rec);
    expect(applyAcceleratedLearningUpgrade(rec, undefined, [], FAKE_DP)).toBe(rec);
  });

  it('empty CDL entries → returned unchanged (no upgrade)', () => {
    const rec = { kg: 100, repsTarget: 8 };
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', [], FAKE_DP);
    expect(out.kg).toBe(100);
    expect(out._acceleratedLearningApplied).toBeUndefined();
  });

  it('1 legitimate entry only → no trigger, unchanged', () => {
    const rec = { kg: 100, repsTarget: 8 };
    const entries = [legitEntry({ ex: 'Bench', dev: 0.30, ts: 1 })];
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    expect(out.kg).toBe(100);
    expect(out._acceleratedLearningApplied).toBeUndefined();
  });
});

describe('applyAcceleratedLearningUpgrade() — upgrade applied paths', () => {
  it('2 legitimate consecutive overrides → kg upgraded by avg deviation', () => {
    const rec = { kg: 100, repsTarget: 8, status: 'NORMAL' };
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.30, ts: 2 }),
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    // avgDev = 0.25; rec.kg = 100 * 1.25 = 125; roundToStep(125) → 125
    expect(out.kg).toBe(125);
    expect(out._acceleratedLearningApplied).toBe(true);
    expect(out._originalKg).toBe(100);
    expect(out._upgradePct).toBeCloseTo(0.25, 5);
    expect(out._samplesUsed).toBe(2);
  });

  it('forensic flags preserve audit trail ADR 011 §append-only', () => {
    const rec = { kg: 80 };
    const entries = [
      legitEntry({ ex: 'Row', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Row', dev: 0.40, ts: 1 }),
    ];
    const out = applyAcceleratedLearningUpgrade(rec, 'Row', entries, FAKE_DP);
    expect(out._acceleratedLearningApplied).toBe(true);
    expect(out._originalKg).toBe(80);
    expect(out._upgradePct).toBeCloseTo(0.30, 5);
  });

  it('roundToStep applied to upgraded kg', () => {
    const rec = { kg: 100 };
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.27, ts: 2 }),
      legitEntry({ ex: 'Bench', dev: 0.23, ts: 1 }),
    ];
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    // avgDev = 0.25 → 125 → rounded to 125 (already at step)
    expect(out.kg).toBe(125);
  });

  it('missing dpEngine → upgraded kg returned unrounded (safe fallback)', () => {
    const rec = { kg: 100 };
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.30, ts: 2 }),
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, null);
    expect(out.kg).toBe(125);
    expect(out._acceleratedLearningApplied).toBe(true);
  });

  it('preserves all other recommendation fields (shape passthrough)', () => {
    const rec = {
      kg: 100,
      repsTarget: 10,
      rir: 2,
      status: 'CONSOLIDATE',
      statusColor: 'var(--accent)',
      statusLabel: 'label',
      progressionNote: 'note',
      progressionStage: 1,
    };
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    expect(out.repsTarget).toBe(10);
    expect(out.rir).toBe(2);
    expect(out.status).toBe('CONSOLIDATE');
    expect(out.statusColor).toBe('var(--accent)');
    expect(out.statusLabel).toBe('label');
    expect(out.progressionNote).toBe('note');
    expect(out.progressionStage).toBe(1);
  });

  it('does NOT mutate input recommendation (immutability invariant)', () => {
    const rec = { kg: 100, repsTarget: 8 };
    const before = JSON.stringify(rec);
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.30, ts: 2 }),
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    expect(JSON.stringify(rec)).toBe(before);
    expect(rec.kg).toBe(100);
  });

  it('idempotent — same input → same output (ADR 018 §2 determinism)', () => {
    const rec = { kg: 100 };
    const entries = [
      legitEntry({ ex: 'Bench', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Bench', dev: 0.30, ts: 1 }),
    ];
    const o1 = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    const o2 = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    expect(o1).toEqual(o2);
  });

  it('different exercise — not triggered for unrelated exercise CDL entries', () => {
    const rec = { kg: 100 };
    const entries = [
      legitEntry({ ex: 'Squat', dev: 0.50, ts: 2 }),
      legitEntry({ ex: 'Squat', dev: 0.50, ts: 1 }),
    ];
    const out = applyAcceleratedLearningUpgrade(rec, 'Bench', entries, FAKE_DP);
    expect(out.kg).toBe(100);
    expect(out._acceleratedLearningApplied).toBeUndefined();
  });
});

describe('readAggressiveLoadingLog() — I/O boundary helper', () => {
  it('null db → []', () => {
    expect(readAggressiveLoadingLog(null)).toEqual([]);
  });

  it('db without get → []', () => {
    expect(readAggressiveLoadingLog({})).toEqual([]);
  });

  it('db.get throws → [] (defensive)', () => {
    const db = { get: vi.fn(() => { throw new Error('boom'); }) };
    expect(readAggressiveLoadingLog(db)).toEqual([]);
  });

  it('db.get returns array → returned as-is', () => {
    const entries = [{ type: 'user_override_weight_high' }];
    const db = { get: vi.fn(() => entries) };
    expect(readAggressiveLoadingLog(db)).toBe(entries);
  });

  it('db.get returns non-array → []', () => {
    const db = { get: vi.fn(() => 'not an array') };
    expect(readAggressiveLoadingLog(db)).toEqual([]);
  });

  it('db.get returns null → []', () => {
    const db = { get: vi.fn(() => null) };
    expect(readAggressiveLoadingLog(db)).toEqual([]);
  });

  it('reads correct key "aggressive-loading-log"', () => {
    const db = { get: vi.fn(() => []) };
    readAggressiveLoadingLog(db);
    expect(db.get).toHaveBeenCalledWith('aggressive-loading-log');
  });
});
