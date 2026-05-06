// Cluster B2 — Kalman 1D peak craft cu 3 caveats per ADR 026 §9.4.2 verbatim.
//
// Caveat 1: defaults Hall 2008 literature (NIH metabolic adaptation rate
//           ~22 kcal/kg LBM lost per Forbes equation)
// Caveat 2: R²>0.85 validation gate pre-Beta simulator — fail = revert EWMA
//           fallback feature flag
// Caveat 3: EWMA fallback feature flag (`bayesian_kalman_v1` rollout per ADR
//           018 featureFlags pattern)
//
// Constraint A1: NU MCMC NU JAX — closed-form local-first JS tractable <50ms.
//
// Pure functions — no side effects.

import { KALMAN_DEFAULTS } from './constants.js';

/**
 * Compute R² (coefficient of determination) for Kalman validation gate.
 *
 * R² = 1 - SS_res/SS_tot, where:
 *   SS_res = Σ (y - ŷ)²
 *   SS_tot = Σ (y - ȳ)²
 *
 * Returns 0 când insufficient data sau SS_tot=0 (defensive total function).
 *
 * @param {ReadonlyArray<number>} observed
 * @param {ReadonlyArray<number>} predicted
 * @returns {number}
 */
export function computeR2(observed, predicted) {
  if (!Array.isArray(observed) || !Array.isArray(predicted)) return 0;
  if (observed.length !== predicted.length || observed.length === 0) return 0;

  const yMean = observed.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0) / observed.length;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < observed.length; i += 1) {
    const y = Number.isFinite(observed[i]) ? observed[i] : 0;
    const yhat = Number.isFinite(predicted[i]) ? predicted[i] : 0;
    ssRes += (y - yhat) ** 2;
    ssTot += (y - yMean) ** 2;
  }
  if (ssTot === 0) return 0;
  return 1 - (ssRes / ssTot);
}

/**
 * Kalman 1D filter step per Cluster B2 (closed-form, NU MCMC).
 *
 * Standard Kalman 1D update:
 *   prediction:  mu_pred = mu_prev (1D constant model V1)
 *                sigma_pred² = sigma_prev² + processNoise²
 *   update:      kalmanGain = sigma_pred² / (sigma_pred² + measurementNoise²)
 *                mu_new = mu_pred + kalmanGain × (observation - mu_pred)
 *                sigma_new² = (1 - kalmanGain) × sigma_pred²
 *
 * @param {Object} input
 * @param {{mu: number, sigma: number}} input.previousState
 * @param {number} input.observation
 * @param {number} [input.processNoise]      - Default Hall 2008 ~22 kcal/kg LBM
 * @param {number} [input.measurementNoise]  - Default 1.0 kg natural noise
 * @returns {{mu: number, sigma: number}}
 */
export function kalmanUpdate1D({ previousState, observation, processNoise, measurementNoise }) {
  const muPrev = Number.isFinite(previousState?.mu) ? previousState.mu : 0;
  const sigmaPrev = Number.isFinite(previousState?.sigma) && previousState.sigma > 0
    ? previousState.sigma : 1.0;
  const obs = Number.isFinite(observation) ? observation : muPrev;
  const Q = Number.isFinite(processNoise) && processNoise > 0
    ? processNoise : KALMAN_DEFAULTS.metabolicAdaptationKcalPerKgLbm * 0.01; // scaled
  const R = Number.isFinite(measurementNoise) && measurementNoise > 0
    ? measurementNoise : 1.0;

  // Prediction
  const muPred = muPrev;
  const sigmaPredSq = sigmaPrev * sigmaPrev + Q * Q;

  // Update
  const kalmanGain = sigmaPredSq / (sigmaPredSq + R * R);
  const muNew = muPred + kalmanGain * (obs - muPred);
  const sigmaNewSq = (1 - kalmanGain) * sigmaPredSq;
  const sigmaNew = Math.sqrt(Math.max(0, sigmaNewSq));

  return { mu: muNew, sigma: sigmaNew };
}

/**
 * EWMA fallback per Cluster B2 Caveat 3 — exponentially weighted moving average
 * cand R²<0.85 validation gate fails sau feature flag `bayesian_kalman_v1`
 * disabled.
 *
 * @param {Object} input
 * @param {number} input.previousMu
 * @param {number} input.observation
 * @param {number} [input.alpha]         - Smoothing factor 0-1 (default 0.30)
 * @returns {number}
 */
export function ewmaUpdate({ previousMu, observation, alpha }) {
  const prev = Number.isFinite(previousMu) ? previousMu : 0;
  const obs = Number.isFinite(observation) ? observation : prev;
  const a = Number.isFinite(alpha) && alpha >= 0 && alpha <= 1
    ? alpha : KALMAN_DEFAULTS.ewmaAlphaDefault;
  return a * obs + (1 - a) * prev;
}

/**
 * Evaluate R²>0.85 validation gate per Cluster B2 Caveat 2.
 *
 * Fail (R² <= 0.85) → revert EWMA fallback recommended.
 * Pass (R² > 0.85)  → Kalman 1D OK to proceed.
 *
 * @param {number} r2
 * @returns {{passed: boolean, ewmaFallbackRecommended: boolean}}
 */
export function evaluateR2Gate(r2) {
  const passed = Number.isFinite(r2) && r2 > KALMAN_DEFAULTS.r2ValidationGate;
  return {
    passed,
    ewmaFallbackRecommended: !passed,
  };
}

/**
 * Check feature flag `bayesian_kalman_v1` per Cluster B2 Caveat 3.
 *
 * Caller passes flags from ctx; defensive default = false (EWMA fallback).
 *
 * @param {{[key: string]: boolean}} [flags]
 * @returns {boolean}
 */
export function isKalmanFeatureFlagEnabled(flags) {
  if (!flags || typeof flags !== 'object') return false;
  return flags[KALMAN_DEFAULTS.ewmaFallbackFlag] === true;
}

/**
 * Run full Kalman 1D filter cu fallback chain:
 *   1. Feature flag check → if disabled, EWMA fallback
 *   2. Kalman update → compute R²
 *   3. R²>0.85 gate check → if fails, EWMA fallback applied
 *
 * @param {Object} input
 * @param {{mu: number, sigma: number}} input.previousState
 * @param {number} input.observation
 * @param {ReadonlyArray<number>} [input.recentObserved]
 * @param {ReadonlyArray<number>} [input.recentPredicted]
 * @param {{[key: string]: boolean}} [input.flags]
 * @returns {import('./types.js').KalmanState}
 */
export function runKalmanWithFallback({
  previousState,
  observation,
  recentObserved,
  recentPredicted,
  flags,
}) {
  const flagEnabled = isKalmanFeatureFlagEnabled(flags);

  if (!flagEnabled) {
    // Feature flag disabled — EWMA fallback active
    const ewmaMu = ewmaUpdate({
      previousMu: previousState?.mu,
      observation,
    });
    return {
      mu:                ewmaMu,
      sigma:             previousState?.sigma ?? 1.0,
      r2:                0,
      ewmaFallbackActive: true,
    };
  }

  // Run Kalman update
  const kalmanState = kalmanUpdate1D({ previousState, observation });
  const r2 = computeR2(recentObserved, recentPredicted);
  const gate = evaluateR2Gate(r2);

  if (gate.ewmaFallbackRecommended) {
    const ewmaMu = ewmaUpdate({
      previousMu: previousState?.mu,
      observation,
    });
    return {
      mu:                ewmaMu,
      sigma:             previousState?.sigma ?? 1.0,
      r2,
      ewmaFallbackActive: true,
    };
  }

  return {
    mu:                kalmanState.mu,
    sigma:             kalmanState.sigma,
    r2,
    ewmaFallbackActive: false,
  };
}
