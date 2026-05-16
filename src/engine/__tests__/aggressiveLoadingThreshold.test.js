import { describe, it, expect } from 'vitest';
import {
  AGGRESSIVE_LOADING_THRESHOLDS,
  getThresholdForTierAndCategory,
  categorizeExercise,
  evaluateAggressiveLoading,
} from '../aggressiveLoadingThreshold.js';

describe('AGGRESSIVE_LOADING_THRESHOLDS — matrix per spec', () => {
  it('T0 compound = 0.50 / isolation = 1.00', () => {
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T0.compound).toBe(0.50);
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T0.isolation).toBe(1.00);
  });
  it('T1 compound = 0.30 / isolation = 0.75', () => {
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T1.compound).toBe(0.30);
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T1.isolation).toBe(0.75);
  });
  it('T2 compound = 0.20 / isolation = 0.50', () => {
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T2.compound).toBe(0.20);
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T2.isolation).toBe(0.50);
  });
  it('T3 collapses to T2 thresholds (alias)', () => {
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T3.compound).toBe(AGGRESSIVE_LOADING_THRESHOLDS.T2.compound);
    expect(AGGRESSIVE_LOADING_THRESHOLDS.T3.isolation).toBe(AGGRESSIVE_LOADING_THRESHOLDS.T2.isolation);
  });

  it('AGGRESSIVE_LOADING_THRESHOLDS is frozen (immutable invariant)', () => {
    expect(Object.isFrozen(AGGRESSIVE_LOADING_THRESHOLDS)).toBe(true);
    expect(Object.isFrozen(AGGRESSIVE_LOADING_THRESHOLDS.T0)).toBe(true);
    expect(Object.isFrozen(AGGRESSIVE_LOADING_THRESHOLDS.T2)).toBe(true);
  });
});

describe('getThresholdForTierAndCategory()', () => {
  it('returns exact value for known (tier, category)', () => {
    expect(getThresholdForTierAndCategory('T0', 'compound')).toBe(0.50);
    expect(getThresholdForTierAndCategory('T0', 'isolation')).toBe(1.00);
    expect(getThresholdForTierAndCategory('T1', 'compound')).toBe(0.30);
    expect(getThresholdForTierAndCategory('T2', 'isolation')).toBe(0.50);
    expect(getThresholdForTierAndCategory('T3', 'compound')).toBe(0.20);
  });

  it('unknown tier falls back to T2 conservative', () => {
    expect(getThresholdForTierAndCategory('UNKNOWN', 'compound')).toBe(0.20);
    expect(getThresholdForTierAndCategory('', 'isolation')).toBe(0.50);
    expect(getThresholdForTierAndCategory(null, 'compound')).toBe(0.20);
    expect(getThresholdForTierAndCategory(undefined, 'isolation')).toBe(0.50);
  });

  it('unknown category falls back to compound conservative', () => {
    expect(getThresholdForTierAndCategory('T0', 'unknown')).toBe(0.50);
    expect(getThresholdForTierAndCategory('T2', '')).toBe(0.20);
    expect(getThresholdForTierAndCategory('T2', null)).toBe(0.20);
  });
});

describe('categorizeExercise()', () => {
  it('tier 1 → compound', () => {
    expect(categorizeExercise({ tier: 1, force_demand: 'high' })).toBe('compound');
  });
  it('tier 2 → isolation', () => {
    expect(categorizeExercise({ tier: 2, force_demand: 'medium' })).toBe('isolation');
  });
  it('tier 3 → isolation', () => {
    expect(categorizeExercise({ tier: 3, force_demand: 'low' })).toBe('isolation');
  });
  it('explicit category="compound" wins', () => {
    expect(categorizeExercise({ tier: 3, category: 'compound' })).toBe('compound');
  });
  it('explicit category="isolation" wins', () => {
    expect(categorizeExercise({ tier: 1, category: 'isolation' })).toBe('isolation');
  });
  it('null/undefined → isolation conservative fallback', () => {
    expect(categorizeExercise(null)).toBe('isolation');
    expect(categorizeExercise(undefined)).toBe('isolation');
  });
  it('missing tier → isolation conservative fallback', () => {
    expect(categorizeExercise({ force_demand: 'high' })).toBe('isolation');
  });
});

describe('evaluateAggressiveLoading()', () => {
  it('T0 compound +60% over baseline → aggressive (threshold 0.50)', () => {
    const r = evaluateAggressiveLoading(100, 160, 'T0', 'compound');
    expect(r.isAggressive).toBe(true);
    expect(r.deviationPct).toBeCloseTo(0.60, 5);
    expect(r.threshold).toBe(0.50);
  });

  it('T0 compound +40% over baseline → not aggressive (under 0.50)', () => {
    const r = evaluateAggressiveLoading(100, 140, 'T0', 'compound');
    expect(r.isAggressive).toBe(false);
    expect(r.deviationPct).toBeCloseTo(0.40, 5);
  });

  it('T2 compound +20% boundary → aggressive (>= threshold)', () => {
    const r = evaluateAggressiveLoading(100, 120, 'T2', 'compound');
    expect(r.isAggressive).toBe(true);
    expect(r.deviationPct).toBeCloseTo(0.20, 5);
  });

  it('T2 compound +19% under threshold → not aggressive', () => {
    const r = evaluateAggressiveLoading(100, 119, 'T2', 'compound');
    expect(r.isAggressive).toBe(false);
  });

  it('T1 isolation +80% over baseline → aggressive (>0.75)', () => {
    const r = evaluateAggressiveLoading(10, 18, 'T1', 'isolation');
    expect(r.isAggressive).toBe(true);
    expect(r.threshold).toBe(0.75);
  });

  it('T1 isolation +70% under threshold → not aggressive', () => {
    const r = evaluateAggressiveLoading(10, 17, 'T1', 'isolation');
    expect(r.isAggressive).toBe(false);
  });

  it('actualKg <= recommendedKg → never aggressive', () => {
    expect(evaluateAggressiveLoading(100, 100, 'T0', 'compound').isAggressive).toBe(false);
    expect(evaluateAggressiveLoading(100, 80, 'T0', 'isolation').isAggressive).toBe(false);
  });

  it('recommendedKg <= 0 → not aggressive (no baseline)', () => {
    const r = evaluateAggressiveLoading(0, 100, 'T2', 'compound');
    expect(r.isAggressive).toBe(false);
    expect(r.deviationPct).toBe(0);
  });

  it('actualKg <= 0 → not aggressive', () => {
    const r = evaluateAggressiveLoading(100, 0, 'T2', 'compound');
    expect(r.isAggressive).toBe(false);
  });

  it('NaN/non-finite inputs handled safely', () => {
    expect(evaluateAggressiveLoading(NaN, 100, 'T0', 'compound').isAggressive).toBe(false);
    expect(evaluateAggressiveLoading(100, NaN, 'T0', 'compound').isAggressive).toBe(false);
    expect(evaluateAggressiveLoading(Infinity, 100, 'T0', 'compound').isAggressive).toBe(false);
  });

  it('pure function — same input → same output (no Date.now/Math.random)', () => {
    const r1 = evaluateAggressiveLoading(50, 70, 'T1', 'compound');
    const r2 = evaluateAggressiveLoading(50, 70, 'T1', 'compound');
    expect(r1).toEqual(r2);
  });
});
