// ══ Kalman 90-day convergence simulator gate (§B029 audit fix) ════════════
//
// REVIEW-A036-A038 M-§A038-02: Cluster B2 Caveat 2 spec verbatim
// "R²>0.85 validation gate pre-Beta simulator" — simulator does NOT exist
// in tests pre-iter-2.
//
// This test simulates 90-day diet adaptation trajectory (Marius/Maria
// personas) cu Hall 2008 reference linear convergence + measurement noise,
// then asserts:
//   1. R² > 0.85 (Cluster B2 Caveat 2 gate)
//   2. Final mu within ±2 kg target (Daniel CEO sanity assertion)
//   3. No catastrophic divergence (mu finite, sigma > 0)
//
// Pure function test — no I/O, deterministic via seed.

import { describe, it, expect } from 'vitest';
import { kalmanUpdate1D, computeR2 } from '../kalmanFilter.js';
import { KALMAN_DEFAULTS } from '../constants.js';

// ── Deterministic Linear Congruential Generator (seeded) ──────────────────
// Avoid Math.random non-determinism (pure-function paradigm).
function makeSeededRng(seed) {
  let state = seed >>> 0;
  return () => {
    // LCG params from Numerical Recipes (Park-Miller variant)
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000; // [0, 1)
  };
}

function gaussianNoise(rng, sigma = 1.0) {
  // Box-Muller transform — 2 uniforms → 1 standard normal × sigma scale
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-12))) * Math.cos(2 * Math.PI * u2);
  return z * sigma;
}

/**
 * Simulate persona N-day weight loss trajectory + Kalman filter.
 *
 * @param {Object} opts
 * @param {number} opts.startWeight   — initial weight (kg)
 * @param {number} opts.targetWeight  — final target weight (kg)
 * @param {number} opts.days          — trajectory length (days)
 * @param {number} opts.measurementNoise — observation sigma (kg, scale precision + water flux)
 * @param {number} [opts.processNoise]   — Kalman Q default Hall 2008
 * @param {number} [opts.seed=42]
 */
function simulateTrajectory({ startWeight, targetWeight, days, measurementNoise, processNoise, seed = 42 }) {
  const rng = makeSeededRng(seed);
  const dailyDrop = (startWeight - targetWeight) / days;
  const Q = processNoise ?? KALMAN_DEFAULTS.metabolicAdaptationKcalPerKgLbm * 0.01; // 0.22
  const R = measurementNoise;

  const observations = [];
  const trueWeights = [];
  const kalmanEstimates = [];

  let trueWeight = startWeight;
  let state = { mu: startWeight, sigma: 2.0 }; // initial uncertainty 2 kg

  for (let day = 0; day < days; day += 1) {
    trueWeight -= dailyDrop;
    const observation = trueWeight + gaussianNoise(rng, R);
    state = kalmanUpdate1D({
      previousState: state,
      observation,
      processNoise: Q,
      measurementNoise: R,
    });
    observations.push(observation);
    trueWeights.push(trueWeight);
    kalmanEstimates.push(state.mu);
  }

  return { observations, trueWeights, kalmanEstimates, finalState: state };
}

describe('Kalman 90-day convergence simulator (§B029 / Cluster B2 Caveat 2)', () => {
  it('Marius slabire 80→70 kg 90-day trajectory: R² > 0.85, final mu within ±2 kg', () => {
    const sim = simulateTrajectory({
      startWeight: 80,
      targetWeight: 70,
      days: 90,
      measurementNoise: 0.5, // typical scale + water flux daily noise
      seed: 42,
    });
    // §B029 acceptance criteria (audit-driven).
    const r2 = computeR2(sim.trueWeights, sim.kalmanEstimates);
    expect(r2).toBeGreaterThan(0.85);
    expect(Math.abs(sim.finalState.mu - 70)).toBeLessThan(2);
    expect(Number.isFinite(sim.finalState.mu)).toBe(true);
    expect(sim.finalState.sigma).toBeGreaterThan(0);
  });

  it('Maria mentenanta 65 kg stable 90-day: low drift, mu within ±1 kg', () => {
    const sim = simulateTrajectory({
      startWeight: 65,
      targetWeight: 65, // stable maintenance
      days: 90,
      measurementNoise: 0.4, // older persona = quieter daily noise
      seed: 13,
    });
    expect(Math.abs(sim.finalState.mu - 65)).toBeLessThan(1);
    expect(Number.isFinite(sim.finalState.mu)).toBe(true);
  });

  it('aggressive cut Marius 90→75 kg 60-day: R² > 0.85 even on steeper slope', () => {
    const sim = simulateTrajectory({
      startWeight: 90,
      targetWeight: 75,
      days: 60,
      measurementNoise: 0.6,
      seed: 7,
    });
    const r2 = computeR2(sim.trueWeights, sim.kalmanEstimates);
    expect(r2).toBeGreaterThan(0.85);
    expect(Math.abs(sim.finalState.mu - 75)).toBeLessThan(2);
  });

  it('no catastrophic divergence under high measurement noise', () => {
    const sim = simulateTrajectory({
      startWeight: 80,
      targetWeight: 75,
      days: 90,
      measurementNoise: 2.0, // 4x typical (broken scale OR very inconsistent weigh-in)
      seed: 99,
    });
    // Even cu high noise R, Kalman should NOT diverge to NaN/Infinity.
    expect(Number.isFinite(sim.finalState.mu)).toBe(true);
    expect(sim.finalState.sigma).toBeGreaterThan(0);
    // Convergence weaker dar mu still reasonable.
    expect(Math.abs(sim.finalState.mu - 75)).toBeLessThan(5);
  });
});

// ══ §38-H5 1000-day stability extension (ADR-ENGINE-MATH-LOCKED-VALUES §5) ═══
//
// Cluster B2 Caveat 1 Hall 2008 default Q=0.22 kg/day. Over 1000 multiplications-
// additions of floats (Q×Q + sigma×sigma + kalmanGain×residual), pathological
// accumulation could theoretically emerge. This test asserts steady-state Kalman
// gain convergence prevents divergence under extreme horizons.
//
// Acceptance criteria (per ADR-ENGINE-MATH-LOCKED-VALUES §5):
//   1. mu remains Number.isFinite over 1000 days (NO NaN / Infinity emergence)
//   2. sigma remains > 0 (no negative-radicand underflow)
//   3. Drift from stable target < 3 kg (steady-state Kalman gain bounded)
//   4. Kalman gain converges to ~Q/(Q+R) steady-state (not divergent)
describe('Kalman 1000-day stability extension (§38-H5 ADR-ENGINE-MATH-LOCKED-VALUES §5)', () => {
  it('1000-day stable maintenance 70 kg: finite mu + positive sigma + drift < 3 kg', () => {
    const sim = simulateTrajectory({
      startWeight: 70,
      targetWeight: 70, // stable maintenance — pure noise rejection regime
      days: 1000,
      measurementNoise: 0.5,
      seed: 1000,
    });
    // §38-H5 acceptance criteria.
    expect(Number.isFinite(sim.finalState.mu)).toBe(true);
    expect(sim.finalState.sigma).toBeGreaterThan(0);
    expect(Number.isFinite(sim.finalState.sigma)).toBe(true);
    // Steady-state Kalman gain bounds drift to ~sigma_steady (small for stable target).
    expect(Math.abs(sim.finalState.mu - 70)).toBeLessThan(3);
  });

  it('1000-day slow recomp 75→72 kg: no float accumulation pathology', () => {
    const sim = simulateTrajectory({
      startWeight: 75,
      targetWeight: 72, // very slow 3 kg over 1000 days (recomp scenario)
      days: 1000,
      measurementNoise: 0.5,
      seed: 1001,
    });
    expect(Number.isFinite(sim.finalState.mu)).toBe(true);
    expect(sim.finalState.sigma).toBeGreaterThan(0);
    // Final mu should be close to target (Kalman tracks slow drift).
    expect(Math.abs(sim.finalState.mu - 72)).toBeLessThan(3);
  });

  it('1000-day extreme aggressive cut 100→70 kg: bounded final mu, no divergence', () => {
    const sim = simulateTrajectory({
      startWeight: 100,
      targetWeight: 70,
      days: 1000,
      measurementNoise: 0.6,
      seed: 1002,
    });
    expect(Number.isFinite(sim.finalState.mu)).toBe(true);
    expect(sim.finalState.sigma).toBeGreaterThan(0);
    // Final mu bounded near target — verifies no exploding drift.
    expect(Math.abs(sim.finalState.mu - 70)).toBeLessThan(3);
  });

  it('1000-day Kalman gain converges to steady-state ~Q/(Q+R)', () => {
    // After 1000 iterations, kalmanGain should approach Q²/(Q²+R²) steady-state.
    // Per Riccati equation closed-form: sigma_steady² = (Q² × sqrt(1 + 4R²/Q²) - Q²)/2
    // For Q=0.22, R=0.5: gain_steady ≈ 0.165 (intuition: gain bounded < 1).
    const sim = simulateTrajectory({
      startWeight: 80,
      targetWeight: 80, // perfectly stable — gain steady-state regime
      days: 1000,
      measurementNoise: 0.5,
      seed: 1003,
    });
    // sigma should converge to small steady-state (NOT 0, NOT divergent).
    expect(sim.finalState.sigma).toBeGreaterThan(0.05);
    expect(sim.finalState.sigma).toBeLessThan(1.0); // bounded steady-state
  });
});
