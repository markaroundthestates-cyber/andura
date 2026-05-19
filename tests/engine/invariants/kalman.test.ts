// Track 7 §7.1 — Property-based invariants for Bayesian Nutrition Kalman 1D
// (Cluster B2 per ADR 018). Math closed-form verifiable; fast-check 1000 runs
// per property surfaces counterexamples deterministic via shrinking.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  kalmanUpdate1D,
  ewmaUpdate,
  evaluateR2Gate,
} from '../../../src/engine/bayesianNutrition/kalmanFilter.js';

const finiteWeight = fc.double({
  min: 30,
  max: 200,
  noNaN: true,
  noDefaultInfinity: true,
});
const finiteSigma = fc.double({
  min: Math.fround(0.01),
  max: 10,
  noNaN: true,
  noDefaultInfinity: true,
});
const finiteNoise = fc.double({
  min: Math.fround(0.001),
  max: 5,
  noNaN: true,
  noDefaultInfinity: true,
});

describe('kalmanUpdate1D — Bayesian posterior invariants', () => {
  it('returns finite mu + sigma for any valid input', () => {
    fc.assert(
      fc.property(
        finiteWeight,
        finiteSigma,
        finiteWeight,
        finiteNoise,
        finiteNoise,
        (mu, sigma, obs, Q, R) => {
          const result = kalmanUpdate1D({
            previousState: { mu, sigma },
            observation: obs,
            processNoise: Q,
            measurementNoise: R,
          });
          return (
            Number.isFinite(result.mu) &&
            Number.isFinite(result.sigma) &&
            result.sigma >= 0
          );
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('posterior mu lies between prior mu and observation (convex combination)', () => {
    fc.assert(
      fc.property(
        finiteWeight,
        finiteSigma,
        finiteWeight,
        finiteNoise,
        finiteNoise,
        (mu, sigma, obs, Q, R) => {
          const result = kalmanUpdate1D({
            previousState: { mu, sigma },
            observation: obs,
            processNoise: Q,
            measurementNoise: R,
          });
          const lo = Math.min(mu, obs);
          const hi = Math.max(mu, obs);
          const eps = 1e-9;
          return result.mu >= lo - eps && result.mu <= hi + eps;
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('posterior sigma <= sqrt(sigma² + Q²) — variance never explodes', () => {
    fc.assert(
      fc.property(
        finiteWeight,
        finiteSigma,
        finiteWeight,
        finiteNoise,
        finiteNoise,
        (mu, sigma, obs, Q, R) => {
          const result = kalmanUpdate1D({
            previousState: { mu, sigma },
            observation: obs,
            processNoise: Q,
            measurementNoise: R,
          });
          const predictedSigmaSq = sigma * sigma + Q * Q;
          const eps = 1e-6;
          return result.sigma * result.sigma <= predictedSigmaSq + eps;
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('large measurement noise R → posterior mu stays near prior mu', () => {
    fc.assert(
      fc.property(
        finiteWeight,
        finiteSigma,
        finiteWeight,
        (mu, sigma, obs) => {
          const result = kalmanUpdate1D({
            previousState: { mu, sigma },
            observation: obs,
            processNoise: 0.01,
            measurementNoise: 1000,
          });
          return Math.abs(result.mu - mu) < Math.abs(obs - mu) * 0.01 + 0.5;
        },
      ),
      { numRuns: 500 },
    );
  });

  it('handles invalid inputs (NaN, negative sigma) gracefully', () => {
    const r1 = kalmanUpdate1D({
      previousState: { mu: NaN, sigma: 1 },
      observation: 80,
      processNoise: 0.1,
      measurementNoise: 1,
    });
    expect(Number.isFinite(r1.mu)).toBe(true);
    expect(Number.isFinite(r1.sigma)).toBe(true);

    const r2 = kalmanUpdate1D({
      previousState: { mu: 80, sigma: -1 },
      observation: 82,
      processNoise: 0.1,
      measurementNoise: 1,
    });
    expect(r2.sigma).toBeGreaterThanOrEqual(0);
  });
});

describe('ewmaUpdate — EWMA fallback invariants (Cluster B2 Caveat 3)', () => {
  it('result always between min(prev, obs) and max(prev, obs)', () => {
    fc.assert(
      fc.property(
        finiteWeight,
        finiteWeight,
        fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
        (prev, obs, alpha) => {
          const result = ewmaUpdate({
            previousMu: prev,
            observation: obs,
            alpha,
          });
          const lo = Math.min(prev, obs);
          const hi = Math.max(prev, obs);
          const eps = 1e-9;
          return result >= lo - eps && result <= hi + eps;
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('alpha=0 → result equals prev (no update)', () => {
    fc.assert(
      fc.property(finiteWeight, finiteWeight, (prev, obs) => {
        const result = ewmaUpdate({
          previousMu: prev,
          observation: obs,
          alpha: 0,
        });
        return Math.abs(result - prev) < 1e-9;
      }),
      { numRuns: 200 },
    );
  });

  it('alpha=1 → result equals obs (full replace)', () => {
    fc.assert(
      fc.property(finiteWeight, finiteWeight, (prev, obs) => {
        const result = ewmaUpdate({
          previousMu: prev,
          observation: obs,
          alpha: 1,
        });
        return Math.abs(result - obs) < 1e-9;
      }),
      { numRuns: 200 },
    );
  });

  it('invalid alpha falls back to default (0.30 per KALMAN_DEFAULTS)', () => {
    const r1 = ewmaUpdate({ previousMu: 80, observation: 82, alpha: NaN });
    expect(Number.isFinite(r1)).toBe(true);
    expect(r1).toBeGreaterThan(80);
    expect(r1).toBeLessThan(82);
  });
});

describe('evaluateR2Gate — Kalman validation gate (Cluster B2 Caveat 2)', () => {
  it('R² strict-above 0.85 returns passed=true', () => {
    for (const r2 of [0.851, 0.9, 0.95, 0.999, 1.0]) {
      const result = evaluateR2Gate(r2);
      expect(result.passed, `r2=${r2}`).toBe(true);
      expect(result.ewmaFallbackRecommended, `r2=${r2}`).toBe(false);
    }
  });

  it('R² at boundary 0.85 returns passed=false (strict > gate)', () => {
    const result = evaluateR2Gate(0.85);
    expect(result.passed).toBe(false);
    expect(result.ewmaFallbackRecommended).toBe(true);
  });

  it('R² below 0.85 returns passed=false + fallback recommended', () => {
    for (const r2 of [0, 0.1, 0.5, 0.7, 0.849]) {
      const result = evaluateR2Gate(r2);
      expect(result.passed, `r2=${r2}`).toBe(false);
      expect(result.ewmaFallbackRecommended, `r2=${r2}`).toBe(true);
    }
  });

  it('R² non-finite (NaN/Infinity) returns passed=false', () => {
    for (const r2 of [NaN, Infinity, -Infinity]) {
      const result = evaluateR2Gate(r2);
      expect(result.passed, `r2=${r2}`).toBe(false);
      expect(result.ewmaFallbackRecommended, `r2=${r2}`).toBe(true);
    }
  });
});
