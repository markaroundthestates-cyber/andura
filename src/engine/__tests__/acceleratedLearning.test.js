import { describe, it, expect } from 'vitest';
import {
  detectAcceleratedLearningTrigger,
  detectT0ToT1AdvanceTrigger,
} from '../acceleratedLearning.js';

function entry({ ex, dev, ts, RPE = 7, repsAchieved = 8, targetReps = 8, type = 'user_override_weight_high' }) {
  return {
    type,
    exerciseName: ex,
    recommended: 100,
    actual: 100 * (1 + dev),
    deviation_pct: dev,
    tier: 'T0',
    repsAchieved,
    targetReps,
    RPE,
    ts,
    date: '2026-05-' + String((ts % 30) + 1).padStart(2, '0'),
  };
}

describe('detectAcceleratedLearningTrigger() — engine baseline upgrade signal', () => {
  it('2 consecutive legitimate overrides same exercise → upgrade with avg deviation', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 2 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(true);
    expect(r.upgradedDeviationPct).toBeCloseTo(0.25, 5);
    expect(r.samplesUsed).toBe(2);
  });

  it('1 entry only → no upgrade', () => {
    const entries = [entry({ ex: 'Bench', dev: 0.30, ts: 1 })];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(false);
    expect(r.samplesUsed).toBe(1);
  });

  it('RPE > 8 fails criteria → no upgrade', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 2, RPE: 9 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1, RPE: 8 }),
    ];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(false);
    expect(r.samplesUsed).toBe(1);
  });

  it('repsAchieved < targetReps fails criteria → no upgrade', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 2, repsAchieved: 6, targetReps: 8 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1, repsAchieved: 7, targetReps: 8 }),
    ];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(false);
  });

  it('uses ONLY last 2 entries (sorted by ts desc)', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.10, ts: 5 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 4 }),
      entry({ ex: 'Bench', dev: 0.50, ts: 1 }),  // oldest, should be ignored
    ];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(true);
    expect(r.upgradedDeviationPct).toBeCloseTo(0.15, 5);
  });

  it('filters by exercise name — other exercises ignored', () => {
    const entries = [
      entry({ ex: 'Squat', dev: 0.40, ts: 3 }),
      entry({ ex: 'Squat', dev: 0.30, ts: 2 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(false);
    expect(r.samplesUsed).toBe(1);
  });

  it('reverted entries ignored (type=user_override_weight_high_reverted)', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 2, type: 'user_override_weight_high_reverted' }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const r = detectAcceleratedLearningTrigger(entries, 'Bench');
    expect(r.shouldUpgradeBaseline).toBe(false);
  });

  it('empty / null entries handled safely', () => {
    expect(detectAcceleratedLearningTrigger([], 'Bench').shouldUpgradeBaseline).toBe(false);
    expect(detectAcceleratedLearningTrigger(null, 'Bench').shouldUpgradeBaseline).toBe(false);
    expect(detectAcceleratedLearningTrigger(undefined, 'Bench').shouldUpgradeBaseline).toBe(false);
  });

  it('pure function — same input → same output', () => {
    const e = [
      entry({ ex: 'Bench', dev: 0.30, ts: 2 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const r1 = detectAcceleratedLearningTrigger(e, 'Bench');
    const r2 = detectAcceleratedLearningTrigger(e, 'Bench');
    expect(r1).toEqual(r2);
  });

  it('does not mutate input array', () => {
    const e = [
      entry({ ex: 'Bench', dev: 0.30, ts: 2 }),
      entry({ ex: 'Bench', dev: 0.20, ts: 1 }),
    ];
    const before = JSON.stringify(e);
    detectAcceleratedLearningTrigger(e, 'Bench');
    expect(JSON.stringify(e)).toBe(before);
  });
});

describe('detectT0ToT1AdvanceTrigger() — calibration tier advance accelerated', () => {
  it('3 distinct exercises with 2+ legitimate overrides → shouldAdvance=true', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 6 }),
      entry({ ex: 'Bench', dev: 0.25, ts: 5 }),
      entry({ ex: 'Row', dev: 0.20, ts: 4 }),
      entry({ ex: 'Row', dev: 0.30, ts: 3 }),
      entry({ ex: 'OHP', dev: 0.20, ts: 2 }),
      entry({ ex: 'OHP', dev: 0.40, ts: 1 }),
    ];
    const r = detectT0ToT1AdvanceTrigger(entries);
    expect(r.shouldAdvance).toBe(true);
    expect(r.distinctExercisesWithPattern).toBe(3);
  });

  it('2 distinct exercises only → shouldAdvance=false', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 4 }),
      entry({ ex: 'Bench', dev: 0.25, ts: 3 }),
      entry({ ex: 'Row', dev: 0.20, ts: 2 }),
      entry({ ex: 'Row', dev: 0.30, ts: 1 }),
    ];
    const r = detectT0ToT1AdvanceTrigger(entries);
    expect(r.shouldAdvance).toBe(false);
    expect(r.distinctExercisesWithPattern).toBe(2);
  });

  it('3 exercises but one with only 1 entry → only 2 qualify', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 5 }),
      entry({ ex: 'Bench', dev: 0.25, ts: 4 }),
      entry({ ex: 'Row', dev: 0.20, ts: 3 }),
      entry({ ex: 'Row', dev: 0.30, ts: 2 }),
      entry({ ex: 'OHP', dev: 0.20, ts: 1 }),  // only 1 entry — doesn't qualify
    ];
    const r = detectT0ToT1AdvanceTrigger(entries);
    expect(r.shouldAdvance).toBe(false);
    expect(r.distinctExercisesWithPattern).toBe(2);
  });

  it('entries failing pattern criteria (RPE/reps) ignored from count', () => {
    const entries = [
      entry({ ex: 'Bench', dev: 0.30, ts: 6 }),
      entry({ ex: 'Bench', dev: 0.25, ts: 5 }),
      entry({ ex: 'Row', dev: 0.20, ts: 4, RPE: 10 }),  // fails RPE criterion
      entry({ ex: 'Row', dev: 0.30, ts: 3 }),
      entry({ ex: 'OHP', dev: 0.20, ts: 2, repsAchieved: 5, targetReps: 8 }),  // fails reps
      entry({ ex: 'OHP', dev: 0.40, ts: 1 }),
    ];
    const r = detectT0ToT1AdvanceTrigger(entries);
    expect(r.shouldAdvance).toBe(false);
    expect(r.distinctExercisesWithPattern).toBe(1);  // only Bench qualifies
  });

  it('empty / null entries handled safely', () => {
    expect(detectT0ToT1AdvanceTrigger([]).shouldAdvance).toBe(false);
    expect(detectT0ToT1AdvanceTrigger(null).shouldAdvance).toBe(false);
    expect(detectT0ToT1AdvanceTrigger(undefined).shouldAdvance).toBe(false);
  });

  it('pure function — same input → same output', () => {
    const e = [
      entry({ ex: 'A', dev: 0.30, ts: 2 }),
      entry({ ex: 'A', dev: 0.20, ts: 1 }),
    ];
    const r1 = detectT0ToT1AdvanceTrigger(e);
    const r2 = detectT0ToT1AdvanceTrigger(e);
    expect(r1).toEqual(r2);
  });
});
