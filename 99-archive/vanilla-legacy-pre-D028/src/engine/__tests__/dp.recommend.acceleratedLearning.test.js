/**
 * End-to-end integration: DP.recommend + AA.applyTo + applyAcceleratedLearningUpgrade
 * Per [[wiki/concepts/aggressive-loading-warning-tier-aware]] §Engine learning
 * accelerated T0/T1 LOCK V1 2026-05-14 consumer wiring close LOCK 9 loop.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import { AA } from '../aa.js';
import {
  applyAcceleratedLearningUpgrade,
  readAggressiveLoadingLog,
} from '../acceleratedLearningAdapter.js';
import { DB } from '../../db.js';

function legitEntry({ ex, dev, ts, RPE = 7, targetReps = 8, repsAchieved = 8 }) {
  return {
    type: 'user_override_weight_high',
    exerciseName: ex,
    recommended: 100,
    actual: 100 * (1 + dev),
    deviation_pct: dev,
    tier: 'T0',
    repsAchieved,
    targetReps,
    RPE,
    ts,
  };
}

function seedExerciseHistory(ex, weights) {
  const logs = weights.map((w, i) => ({
    date: `2026-04-${String(i + 1).padStart(2, '0')}`,
    ex,
    w,
    kg: w,
    set: 1,
    sets: 1,
    reps: '8',
    rpe: 7,
    session: i * 1000,
    ts: i * 1000,
  }));
  DB.set('logs', logs);
}

beforeEach(() => {
  localStorage.clear();
});

describe('DP.recommend pipeline — accelerated learning OFF path', () => {
  it('no CDL entries → recommendation unchanged', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded.kg).toBe(baseline.kg);
    expect(upgraded._acceleratedLearningApplied).toBeUndefined();
  });

  it('1 legitimate entry only → no upgrade', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.30, ts: 1 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded.kg).toBe(baseline.kg);
  });

  it('entries for different exercise → no upgrade applied', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Romanian Deadlift', dev: 0.30, ts: 2 }),
      legitEntry({ ex: 'Romanian Deadlift', dev: 0.40, ts: 1 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded.kg).toBe(baseline.kg);
  });
});

describe('DP.recommend pipeline — accelerated learning ON path', () => {
  it('2 legitimate consecutive overrides → baseline upgraded', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.20, ts: 1 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded._acceleratedLearningApplied).toBe(true);
    expect(upgraded._originalKg).toBe(baseline.kg);
    expect(upgraded._upgradePct).toBeCloseTo(0.20, 5);
    expect(upgraded.kg).toBeGreaterThan(baseline.kg);
  });

  it('upgraded kg respects DP.roundToStep for the exercise', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.20, ts: 1 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    const expectedRounded = DP.roundToStep(baseline.kg * 1.20, 'Flat Barbell Bench');
    expect(upgraded.kg).toBe(expectedRounded);
  });

  it('idempotent end-to-end — same CDL + history → same upgraded kg', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.20, ts: 2 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.30, ts: 1 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const r1 = applyAcceleratedLearningUpgrade(baseline, 'Flat Barbell Bench', readAggressiveLoadingLog(DB), DP);
    const r2 = applyAcceleratedLearningUpgrade(baseline, 'Flat Barbell Bench', readAggressiveLoadingLog(DB), DP);
    expect(r1.kg).toBe(r2.kg);
    expect(r1._upgradePct).toBe(r2._upgradePct);
  });

  it('reverted entries do NOT count toward upgrade', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.30, ts: 2 }),
      { ...legitEntry({ ex: 'Flat Barbell Bench', dev: 0.40, ts: 1 }), type: 'user_override_weight_high_reverted' },
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded.kg).toBe(baseline.kg);
    expect(upgraded._acceleratedLearningApplied).toBeUndefined();
  });

  it('high-RPE entries (>8) do NOT count toward upgrade — anti-paternalism preserved', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.30, ts: 2, RPE: 9 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.30, ts: 1, RPE: 10 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded.kg).toBe(baseline.kg);
  });
});

// ══ §23-H1 LOOP CLOSE TRAJECTORY ════════════════════════════════════════════
// LOCK 9 invariant: "engine I'm wrong se vindeca in 2-3 sesiuni".
// Simulates the activation trajectory: session 1 = override only (no trigger),
// session 2 = second override (trigger fires, baseline upgrades).
describe('DP.recommend pipeline — LOCK 9 loop close trajectory (§23-H1)', () => {
  it('session 1 override alone → no upgrade; session 2 override → baseline upgraded (2-session self-correct)', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);

    // Session 1: user logs one aggressive override → not enough to trigger
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.25, ts: 1 }),
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const afterSession1 = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(afterSession1._acceleratedLearningApplied).toBeUndefined();
    expect(afterSession1.kg).toBe(baseline.kg);

    // Session 2: second override at same exercise (newer ts) → engine self-corrects
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.25, ts: 2 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.25, ts: 1 }),
    ]);
    const afterSession2 = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(afterSession2._acceleratedLearningApplied).toBe(true);
    expect(afterSession2._upgradePct).toBeCloseTo(0.25, 5);
    expect(afterSession2.kg).toBeGreaterThan(baseline.kg);
  });

  it('uses ONLY the 2 newest legitimate overrides — older overrides do not poison the signal', () => {
    seedExerciseHistory('Flat Barbell Bench', [60, 60, 60]);
    DB.set('aggressive-loading-log', [
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.10, ts: 5 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.10, ts: 4 }),
      legitEntry({ ex: 'Flat Barbell Bench', dev: 0.80, ts: 1 }),  // very old, should be ignored
    ]);
    const baseline = AA.applyTo(DP.recommend('Flat Barbell Bench'), 'Flat Barbell Bench');
    const upgraded = applyAcceleratedLearningUpgrade(
      baseline,
      'Flat Barbell Bench',
      readAggressiveLoadingLog(DB),
      DP
    );
    expect(upgraded._acceleratedLearningApplied).toBe(true);
    expect(upgraded._upgradePct).toBeCloseTo(0.10, 5);  // newer pair avg, NOT polluted by 0.80
  });
});
