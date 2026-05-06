import { describe, it, expect } from 'vitest';
import {
  computeR2,
  kalmanUpdate1D,
  ewmaUpdate,
  evaluateR2Gate,
  isKalmanFeatureFlagEnabled,
  runKalmanWithFallback,
} from '../kalmanFilter.js';
import { KALMAN_DEFAULTS } from '../constants.js';

describe('computeR2 — coefficient of determination', () => {
  it('perfect fit → R²=1.0', () => {
    expect(computeR2([1, 2, 3], [1, 2, 3])).toBeCloseTo(1.0, 5);
  });
  it('mean prediction → R²=0', () => {
    expect(computeR2([1, 2, 3], [2, 2, 2])).toBeCloseTo(0, 5);
  });
  it('insufficient data → 0 defensive', () => {
    expect(computeR2([], [])).toBe(0);
    expect(computeR2(null, null)).toBe(0);
  });
  it('mismatched lengths → 0 defensive', () => {
    expect(computeR2([1, 2], [1, 2, 3])).toBe(0);
  });
});

describe('kalmanUpdate1D — Cluster B2 closed-form NU MCMC', () => {
  it('first observation → smoothed estimate between prior and observation', () => {
    const r = kalmanUpdate1D({
      previousState: { mu: 80, sigma: 2.0 },
      observation: 82,
    });
    expect(r.mu).toBeGreaterThan(80);
    expect(r.mu).toBeLessThan(82);
  });
  it('reduces sigma post-update (more confident)', () => {
    const r = kalmanUpdate1D({
      previousState: { mu: 80, sigma: 2.0 },
      observation: 81,
    });
    expect(r.sigma).toBeLessThan(2.0);
  });
  it('defensive null state → defaults applied', () => {
    const r = kalmanUpdate1D({
      previousState: null,
      observation: 5,
    });
    expect(Number.isFinite(r.mu)).toBe(true);
    expect(Number.isFinite(r.sigma)).toBe(true);
  });
});

describe('ewmaUpdate — Cluster B2 fallback', () => {
  it('alpha=0.3 default smoothing', () => {
    const r = ewmaUpdate({ previousMu: 80, observation: 82 });
    expect(r).toBeCloseTo(80 * 0.7 + 82 * 0.3, 5);
  });
  it('alpha=1.0 → fully tracks observation', () => {
    const r = ewmaUpdate({ previousMu: 80, observation: 82, alpha: 1.0 });
    expect(r).toBe(82);
  });
  it('alpha=0 → fully holds previous', () => {
    const r = ewmaUpdate({ previousMu: 80, observation: 82, alpha: 0 });
    expect(r).toBe(80);
  });
  it('invalid alpha out-of-range → defensive default', () => {
    const r = ewmaUpdate({ previousMu: 80, observation: 82, alpha: 1.5 });
    expect(r).toBeCloseTo(80 * 0.7 + 82 * 0.3, 5);
  });
});

describe('evaluateR2Gate — Cluster B2 Caveat 2 R²>0.85 gate', () => {
  it('R²=0.90 > 0.85 → passed, NU EWMA fallback recommended', () => {
    const r = evaluateR2Gate(0.90);
    expect(r.passed).toBe(true);
    expect(r.ewmaFallbackRecommended).toBe(false);
  });
  it('R²=0.80 < 0.85 → failed, EWMA fallback recommended', () => {
    const r = evaluateR2Gate(0.80);
    expect(r.passed).toBe(false);
    expect(r.ewmaFallbackRecommended).toBe(true);
  });
  it('R²=0.85 boundary edge → strict > comparison fails', () => {
    expect(evaluateR2Gate(KALMAN_DEFAULTS.r2ValidationGate).passed).toBe(false);
  });
  it('invalid R² → defensive failed', () => {
    expect(evaluateR2Gate('foo').passed).toBe(false);
    expect(evaluateR2Gate(NaN).passed).toBe(false);
  });
});

describe('isKalmanFeatureFlagEnabled — Cluster B2 Caveat 3 feature flag', () => {
  it('flag true → enabled', () => {
    expect(isKalmanFeatureFlagEnabled({ bayesian_kalman_v1: true })).toBe(true);
  });
  it('flag false → disabled (EWMA fallback)', () => {
    expect(isKalmanFeatureFlagEnabled({ bayesian_kalman_v1: false })).toBe(false);
  });
  it('flag missing → disabled defensive', () => {
    expect(isKalmanFeatureFlagEnabled({})).toBe(false);
    expect(isKalmanFeatureFlagEnabled(null)).toBe(false);
  });
});

describe('runKalmanWithFallback — full chain integration', () => {
  it('feature flag disabled → EWMA fallback active', () => {
    const r = runKalmanWithFallback({
      previousState: { mu: 80, sigma: 2.0 },
      observation: 82,
      flags: { bayesian_kalman_v1: false },
    });
    expect(r.ewmaFallbackActive).toBe(true);
  });
  it('feature flag enabled + R²>0.85 → Kalman state OK', () => {
    const r = runKalmanWithFallback({
      previousState: { mu: 80, sigma: 2.0 },
      observation: 82,
      recentObserved: [80, 81, 82, 83],
      recentPredicted: [80.1, 81.0, 82.1, 83.0], // very tight fit
      flags: { bayesian_kalman_v1: true },
    });
    expect(r.ewmaFallbackActive).toBe(false);
    expect(r.r2).toBeGreaterThan(KALMAN_DEFAULTS.r2ValidationGate);
  });
  it('feature flag enabled + R²<0.85 → EWMA fallback activated', () => {
    const r = runKalmanWithFallback({
      previousState: { mu: 80, sigma: 2.0 },
      observation: 82,
      recentObserved: [80, 90, 70, 100], // poor fit
      recentPredicted: [80, 80, 80, 80],
      flags: { bayesian_kalman_v1: true },
    });
    expect(r.ewmaFallbackActive).toBe(true);
  });
  it('returns valid KalmanState shape', () => {
    const r = runKalmanWithFallback({
      previousState: { mu: 80, sigma: 2.0 },
      observation: 82,
      flags: {},
    });
    expect(r).toHaveProperty('mu');
    expect(r).toHaveProperty('sigma');
    expect(r).toHaveProperty('r2');
    expect(r).toHaveProperty('ewmaFallbackActive');
  });
});
