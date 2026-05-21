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
 * Returns 0 cand insufficient data sau SS_tot=0 (defensive total function).
 *
 * §B030 audit fix (REVIEW-A036-A038 M-§A038-03) — filter invalid pairs
 * (missed weigh-ins, scale glitches NaN). Substituting 0 distorts SS_tot /
 * yMean. Excluding bad indices preserves statistical validity. Return 0 dacă
 * valid pairs < 2 (insufficient data for R² computation).
 *
 * @param {ReadonlyArray<number>} observed
 * @param {ReadonlyArray<number>} predicted
 * @returns {number}
 */
export function computeR2(observed, predicted) {
  if (!Array.isArray(observed) || !Array.isArray(predicted)) return 0;
  if (observed.length !== predicted.length || observed.length === 0) return 0;

  // §B030 — filter valid pairs first; NU substitute 0 for NaN.
  const valid = [];
  for (let i = 0; i < observed.length; i += 1) {
    if (Number.isFinite(observed[i]) && Number.isFinite(predicted[i])) {
      valid.push([observed[i], predicted[i]]);
    }
  }
  if (valid.length < 2) return 0;

  const yMean = valid.reduce((s, [y]) => s + y, 0) / valid.length;
  let ssRes = 0;
  let ssTot = 0;
  for (const [y, yhat] of valid) {
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
 * Validate a persisted KalmanState shape (loaded from IndexedDB sau localStorage).
 *
 * §B028 audit fix (REVIEW-A036-A038 M-§A038-01) — defensive validation for
 * corrupt persisted state (mu="NaN" string, sigma negative, NaN/Infinity).
 * Without explicit validate, `kalmanUpdate1D` defaults mu→0 silent → catastrophic
 * recommendations (e.g., target 0 kg → engine cere user pierde 80 kg overnight).
 * Caller should prompt re-calibration UI dacă valid=false.
 *
 * @param {unknown} state
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateKalmanState(state) {
  if (state === null || state === undefined) {
    return { valid: false, reason: 'state_null_or_undefined' };
  }
  if (typeof state !== 'object') {
    return { valid: false, reason: 'state_not_object' };
  }
  const s = /** @type {Record<string, unknown>} */ (state);
  if (!Number.isFinite(s.mu)) {
    return { valid: false, reason: 'mu_not_finite' };
  }
  if (!Number.isFinite(s.sigma)) {
    return { valid: false, reason: 'sigma_not_finite' };
  }
  if (typeof s.sigma === 'number' && s.sigma < 0) {
    return { valid: false, reason: 'sigma_negative' };
  }
  if (s.r2 !== undefined && !Number.isFinite(s.r2)) {
    return { valid: false, reason: 'r2_not_finite' };
  }
  if (s.ewmaFallbackActive !== undefined && typeof s.ewmaFallbackActive !== 'boolean') {
    return { valid: false, reason: 'ewmaFallbackActive_not_boolean' };
  }
  return { valid: true };
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
