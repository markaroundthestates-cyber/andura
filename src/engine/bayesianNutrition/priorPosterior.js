// Cluster A — Prior Form + Slope Tier-Based + Decay + Validation + Phase Reset
// per ADR 026 §9.4.1 verbatim.
//
// A1 Gaussian Conjugate Prior local-first JS tractable (NU Hierarchical Bayesian)
//    - Conjugate pair Normal-Normal closed-form posterior update
//    - No MCMC, no JAX, runs device-side <50ms median per ADR 026 Q8.1 budget
// A2 Strong Prior dynamic slope tier-based:
//    - T0 = 70/30 (prior dominated, anti-overshoot)
//    - T1 = 80/20 (input dominated, calibration -50% per §3.5.1)
//    - T2 = 90/10 (input strong, inference erodeaza prior)
// A3 Bayesian decay natural posterior(week N) = prior(week N+1)
//    NU explicit decay rule — math-native, self-balancing per Conjugate update
// A5 Phase reset Hibrid: Layer 1+2 RESET / preserve Layer 4 Goal Shift §36.35
// E2 Special priors edge cases: >75 + ED history + disclaimer onboarding
//
// Pure functions — no side effects, no Date.now / Math.random.

import {
  CALIBRATION_TIERS,
  STRONG_PRIOR_SLOPE,
  PHASE_RESET_LAYERS,
  EDGE_CASES,
} from './constants.js';

/**
 * Resolve calibration tier from ctx — defensive 'T0' default cold start.
 *
 * @param {{profileTier?: string}} [ctx]
 * @returns {import('./types.js').CalibrationTier}
 */
export function resolveTier(ctx) {
  if (!ctx || typeof ctx.profileTier !== 'string') return CALIBRATION_TIERS.T0;
  const t = ctx.profileTier.toUpperCase();
  if (t === CALIBRATION_TIERS.T0 || t === '0') return CALIBRATION_TIERS.T0;
  if (t === CALIBRATION_TIERS.T1 || t === '1') return CALIBRATION_TIERS.T1;
  if (t === CALIBRATION_TIERS.T2 || t === '2') return CALIBRATION_TIERS.T2;
  return CALIBRATION_TIERS.T0;
}

/**
 * Strong Prior dynamic slope tier-based per Cluster A2 verbatim.
 *
 * Returns {prior, input} blend ratios (sum = 1.0) per tier.
 *
 * @param {import('./types.js').CalibrationTier} tier
 * @returns {{prior: number, input: number}}
 */
export function strongPriorSlope(tier) {
  return STRONG_PRIOR_SLOPE[tier] ?? STRONG_PRIOR_SLOPE.T0;
}

/**
 * Initialize Gaussian prior from demographic baseline per Cluster A1 + ADR 017
 * T0 prior reference. Defensive when source missing/invalid.
 *
 * @param {Object} input
 * @param {number} [input.demographicMu]
 * @param {number} [input.demographicSigma]
 * @returns {import('./types.js').Prior}
 */
export function initPriorFromDemographic({ demographicMu, demographicSigma }) {
  const mu = Number.isFinite(demographicMu) ? demographicMu : 0;
  const sigma = Number.isFinite(demographicSigma) && demographicSigma > 0 ? demographicSigma : 1.0;
  return {
    mu,
    sigma,
    source: 'demographic_prior',
  };
}

/**
 * Conjugate Normal-Normal posterior update per Cluster A1 closed-form (NU MCMC).
 *
 * Closed-form formulas:
 *   posterior_precision = prior_precision + N × likelihood_precision
 *   posterior_mu = (prior_precision × prior_mu + N × likelihood_precision × sample_mean)
 *                  / posterior_precision
 *   posterior_sigma = sqrt(1 / posterior_precision)
 *
 * Where precision = 1/sigma².
 *
 * Per Cluster A2 Strong Prior tier slope: blend ratio applied as effective N
 * weighting (input weight × N → effective likelihood contribution).
 *
 * @param {Object} input
 * @param {import('./types.js').Prior} input.prior
 * @param {number} input.sampleMean
 * @param {number} input.sampleVariance
 * @param {number} input.observationsCount  - N samples
 * @param {{prior: number, input: number}} input.slope - From strongPriorSlope()
 * @returns {{mu: number, sigma: number}}
 */
export function conjugateUpdate({ prior, sampleMean, sampleVariance, observationsCount, slope }) {
  const priorMu = Number.isFinite(prior?.mu) ? prior.mu : 0;
  const priorSigma = Number.isFinite(prior?.sigma) && prior.sigma > 0 ? prior.sigma : 1.0;
  const xbar = Number.isFinite(sampleMean) ? sampleMean : priorMu;
  const sampleVar = Number.isFinite(sampleVariance) && sampleVariance > 0 ? sampleVariance : 1.0;
  const n = Number.isFinite(observationsCount) && observationsCount > 0 ? observationsCount : 0;
  const slopePrior = Number.isFinite(slope?.prior) ? slope.prior : 0.5;
  const slopeInput = Number.isFinite(slope?.input) ? slope.input : 0.5;

  if (n === 0) {
    return { mu: priorMu, sigma: priorSigma };
  }

  const priorPrecision = 1 / (priorSigma * priorSigma);
  const likelihoodPrecision = 1 / sampleVar;

  // Strong Prior tier slope blend: weight prior_precision and likelihood_precision
  const weightedPriorPrec = priorPrecision * slopePrior * 2; // ×2 normalization slope sums to 1
  const weightedLikelihoodPrec = n * likelihoodPrecision * slopeInput * 2;

  const posteriorPrecision = weightedPriorPrec + weightedLikelihoodPrec;
  if (posteriorPrecision <= 0 || !Number.isFinite(posteriorPrecision)) {
    return { mu: priorMu, sigma: priorSigma };
  }
  const posteriorMu = (
    weightedPriorPrec * priorMu + weightedLikelihoodPrec * xbar
  ) / posteriorPrecision;
  const posteriorSigma = Math.sqrt(1 / posteriorPrecision);

  return {
    mu:    posteriorMu,
    sigma: posteriorSigma,
  };
}

/**
 * Bayesian decay natural per Cluster A3 verbatim:
 *   posterior(week N) = prior(week N+1)
 *   NU explicit decay rule — math-native, self-balancing per Conjugate update
 *
 * Reset prior source to 'posterior_n_minus_1' for next cycle.
 *
 * @param {{mu: number, sigma: number}} posterior
 * @returns {import('./types.js').Prior}
 */
export function decayPosteriorToPrior(posterior) {
  const mu = Number.isFinite(posterior?.mu) ? posterior.mu : 0;
  const sigma = Number.isFinite(posterior?.sigma) && posterior.sigma > 0 ? posterior.sigma : 1.0;
  return {
    mu,
    sigma,
    source: 'posterior_n_minus_1',
  };
}

/**
 * Phase reset Hibrid per Cluster A5 verbatim:
 *   CUT → BULK transition = Layer 1 (kcal_baseline) + Layer 2 (macro_split) RESET
 *   Preserve Layer 4 (Goal Shift Event Handler §36.35 streak preservation)
 *
 * Returns { resetLayers, preserveLayers } as immutable slice — caller decides
 * whether to apply Layer 1+2 reset based on phase transition signal.
 *
 * @param {Object} input
 * @param {string} [input.previousPhase]
 * @param {string} [input.currentPhase]
 * @returns {{
 *   shouldReset: boolean,
 *   resetLayers: ReadonlyArray<number>,
 *   preserveLayers: ReadonlyArray<number>,
 * }}
 */
export function evaluatePhaseReset({ previousPhase, currentPhase }) {
  const prev = typeof previousPhase === 'string' ? previousPhase.toUpperCase() : null;
  const curr = typeof currentPhase === 'string' ? currentPhase.toUpperCase() : null;
  const transitions = [
    ['CUT', 'BULK'],
    ['BULK', 'CUT'],
  ];
  const isTransition = transitions.some(([a, b]) => prev === a && curr === b);
  return {
    shouldReset:    isTransition,
    resetLayers:    PHASE_RESET_LAYERS.resetLayers,
    preserveLayers: PHASE_RESET_LAYERS.preserveLayers,
  };
}

/**
 * Detect special priors / Passive Mode tripwire conditions per Cluster E2 verbatim.
 *
 * Returns { activeFlags, passiveMode } — caller decides UI surface.
 *
 * @param {{age?: number, medicalConditions?: string[], edHistory?: boolean}} [user]
 * @returns {{
 *   passiveMode: boolean,
 *   passiveModeConditions: string[],
 *   specialPriors: boolean,
 *   specialPriorsReasons: string[],
 *   disclaimerCopy: string|null,
 * }}
 */
export function detectSpecialPriors(user) {
  const passiveModeConditions = [];
  const specialPriorsReasons = [];

  if (user) {
    const conditions = Array.isArray(user.medicalConditions) ? user.medicalConditions : [];
    const normalizedConditions = conditions
      .filter((c) => typeof c === 'string')
      .map((c) => c.toLowerCase().replace(/[\s-]/g, '_'));
    for (const passive of EDGE_CASES.passiveModeConditions) {
      if (normalizedConditions.includes(passive)) {
        passiveModeConditions.push(passive);
      }
    }

    const age = Number(user.age);
    if (Number.isFinite(age) && age >= EDGE_CASES.specialPriorsAgeThreshold) {
      specialPriorsReasons.push('age_75_plus');
    }
    if (user.edHistory === true) {
      specialPriorsReasons.push('ed_history');
    }
  }

  const passiveMode = passiveModeConditions.length > 0;
  const specialPriors = specialPriorsReasons.length > 0;

  return {
    passiveMode,
    passiveModeConditions,
    specialPriors,
    specialPriorsReasons,
    disclaimerCopy: (passiveMode || specialPriors) ? EDGE_CASES.disclaimerCopy : null,
  };
}
