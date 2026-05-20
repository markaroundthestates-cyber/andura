// Engine Bayesian Nutrition Inference V1 — public API per ADR 026 §9.4 + ADR 018 §2.
//
// Pipeline §42.10 position 4th canonical:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6)
//   → Warm-up (§9.7) → Deload (§9.8).
//
// Pure function `evaluate(ctx) → BayesianNutritionResult` total + deterministic
// + async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
// <50ms median per ADR 026 Q8.1 budget — Gaussian Conjugate Prior Normal-Normal
// closed-form ONLY (NU MCMC NU JAX A1 LOCKED V1).
//
// Output blueprint per Cluster D verbatim:
//   - nutrition_inference_metadata (Cluster D1)
//   - likelihood_probabilities {deficit/surplus/maintenance} (Cluster D2)
//   - profile_typing state (Cluster D3)
//   - ui_tier (Cluster D4: Tier 1+2 only NU blocking modal)
//   - passive_mode_active (Cluster E2 tripwire)
// Hard rule §3.5.1 D5: NEVER specific kcal output.
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.4
// (commit 685fdd4 LANDED 2026-05-06 afternoon chat-5 acasa, 32-35 decisions
// Cluster A-E verbatim).

import {
  resolveTier,
  strongPriorSlope,
  initPriorFromDemographic,
  conjugateUpdate,
  decayPosteriorToPrior,
  evaluatePhaseReset,
  detectSpecialPriors,
} from './priorPosterior.js';
import { runKalmanWithFallback } from './kalmanFilter.js';
import {
  computeWeightedVolume,
  computeIsolationDegradation,
} from './volumeLandmarks.js';
import {
  computeMoodScore,
  resolveProfileTypingThreshold,
  evaluateProfileTypingFlip,
  evaluateAntiSpam,
} from './profileTyping.js';
import {
  emitGoalAdaptationDisagreement,
  applyEnergyVarianceModifier,
  applySigmaModifier,
  emitPassiveModeSignal,
  forwardConstraintObject,
} from './crossEngineHooks.js';
import {
  SCHEMA_CONSTANTS,
  UI_TIER,
  CALIBRATION_TIERS as _CALIBRATION_TIERS,
} from './constants.js';
import { filterKcalFloorObservations } from './observationFilter.js';

export const ENGINE_ID = 'bayesianNutrition';

/**
 * Compute confidence level based on ctx data completeness.
 *
 * @param {Object} input
 * @param {boolean} input.hasObservations
 * @param {boolean} input.hasPriorSource
 * @param {boolean} input.hasPeriodizationConstraint
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({ hasObservations, hasPriorSource, hasPeriodizationConstraint }) {
  let score = 0;
  if (hasObservations) score += 1;
  if (hasPriorSource) score += 1;
  if (hasPeriodizationConstraint) score += 1;
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

/**
 * Normal CDF approximation (Abramowitz & Stegun 26.2.17) for likelihood
 * probability computation. Used to derive {deficit/surplus/maintenance}
 * probabilities from posterior Gaussian.
 *
 * @param {number} x
 * @returns {number}
 */
function normalCdf(x) {
  if (!Number.isFinite(x)) return 0.5;
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * absX);
  const d = 0.3989422804014327 * Math.exp(-absX * absX / 2);
  const p = d * t * (
    0.31938153 + t * (
      -0.356563782 + t * (
        1.781477937 + t * (
          -1.821255978 + t * 1.330274429
        )
      )
    )
  );
  return x > 0 ? 1 - p : p;
}

/**
 * Compute likelihood probabilities {deficit/surplus/maintenance} per Cluster
 * D2 verbatim. NU absolute kcal output — hard rule §3.5.1 D5 preserved.
 *
 * Heuristic mapping: posterior mu sign relative to maintenance baseline (0)
 * yields deficit (negative kcal delta) vs surplus (positive) vs maintenance
 * (within ±sigma band).
 *
 * @param {Object} input
 * @param {{mu: number, sigma: number}} input.posterior
 * @returns {import('./types.js').LikelihoodProbabilities}
 */
function computeLikelihoodProbabilities({ posterior }) {
  const mu = Number.isFinite(posterior?.mu) ? posterior.mu : 0;
  const sigma = Number.isFinite(posterior?.sigma) && posterior.sigma > 0 ? posterior.sigma : 1.0;

  // Maintenance band ±sigma around 0 (V1 conservative)
  // Deficit = P(X < -sigma): sigma below baseline = clear deficit signal
  // Surplus = P(X > sigma):  sigma above baseline = clear surplus signal
  // Maintenance = P(-sigma < X < sigma)
  const z_lower = -sigma; // boundary maintenance/deficit
  const z_upper = sigma;  // boundary maintenance/surplus

  // Standardize using posterior distribution (mu, sigma)
  const standardized_lower = (z_lower - mu) / sigma;
  const standardized_upper = (z_upper - mu) / sigma;

  const p_deficit = normalCdf(standardized_lower);
  const p_surplus = 1 - normalCdf(standardized_upper);
  const p_maintenance = Math.max(0, 1 - p_deficit - p_surplus);

  // Normalize defensive (should sum to ~1.0 already)
  const total = p_deficit + p_surplus + p_maintenance;
  if (total <= 0 || !Number.isFinite(total)) {
    return {
      deficit_likelihood:     0.33,
      surplus_likelihood:     0.33,
      maintenance_likelihood: 0.34,
    };
  }
  return {
    deficit_likelihood:     p_deficit / total,
    surplus_likelihood:     p_surplus / total,
    maintenance_likelihood: p_maintenance / total,
  };
}

/**
 * Compute confidence interval per Cluster D1 (level 0.95 default).
 *
 * @param {{mu: number, sigma: number}} posterior
 * @returns {import('./types.js').ConfidenceInterval}
 */
function computeConfidenceInterval(posterior) {
  const mu = Number.isFinite(posterior?.mu) ? posterior.mu : 0;
  const sigma = Number.isFinite(posterior?.sigma) && posterior.sigma > 0 ? posterior.sigma : 1.0;
  const z = 1.96; // 95% CI standard z-score
  return {
    lower: mu - z * sigma,
    upper: mu + z * sigma,
    level: SCHEMA_CONSTANTS.confidenceIntervalLevel,
  };
}

/**
 * Resolve UI tier per Cluster D4 verbatim:
 *   Tier 1 silent (CDL log only) cand disagreement signal active
 *   Tier 2 banner (informational) cand stable inference + signal user
 *   NU blocking modal (Maria 65 autonomy preserve)
 *
 * @param {Object} input
 * @param {boolean} input.disagreementFlagged
 * @param {boolean} input.passiveModeActive
 * @returns {import('./types.js').UiTier}
 */
function resolveUiTier({ disagreementFlagged, passiveModeActive }) {
  if (passiveModeActive === true) return UI_TIER.TIER_2_BANNER; // surface medical referral
  if (disagreementFlagged === true) return UI_TIER.TIER_1_SILENT; // CDL log only
  return UI_TIER.TIER_1_SILENT;
}

/**
 * Evaluate Bayesian Nutrition Inference Engine per ADR 026 §9.4 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid
 * BayesianNutritionResult cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 5 fields (Cluster D verbatim):
 *   1. nutrition_inference_metadata (prior+posterior+observations N=20+CI 0.95)
 *   2. likelihood_probabilities {deficit/surplus/maintenance} (NU specific kcal)
 *   3. profile_typing state (Adaptive 0.55-0.85 + Hamming + 2 sesiuni)
 *   4. ui_tier (Tier 1+2 only NU blocking modal)
 *   5. passive_mode_active (Cluster E2 tripwire)
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').BayesianNutritionResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const user = safeCtx.user && typeof safeCtx.user === 'object' ? safeCtx.user : {};
  const recentSessions = Array.isArray(safeCtx.recentSessions) ? safeCtx.recentSessions : [];
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};
  const flags = safeCtx.flags && typeof safeCtx.flags === 'object' ? safeCtx.flags : {};

  // Periodization Constraint Object Hook (consumed read-only frozen)
  const periodizationConstraint = meta.periodizationConstraint || null;

  // Cluster A1+A2 — Tier resolution + Strong Prior tier slope
  const tier = resolveTier(safeCtx);
  const slope = strongPriorSlope(tier);
  trace.tier = tier;
  trace.slope = slope;

  // Cluster A1 — Initialize prior (demographic baseline ADR 017)
  const prior = initPriorFromDemographic({
    demographicMu:    meta.demographicMu,
    demographicSigma: meta.demographicSigma,
  });
  trace.prior = prior;

  // Cluster E2 — Detect special priors / Passive Mode tripwire
  const specialPriorsResult = detectSpecialPriors(user);
  trace.specialPriorsResult = specialPriorsResult;
  if (specialPriorsResult.passiveMode) {
    signals.push('passive_mode_tripwire_active');
    for (const c of specialPriorsResult.passiveModeConditions) {
      signals.push(`passive_mode_${c}`);
    }
  }
  if (specialPriorsResult.specialPriors) {
    for (const r of specialPriorsResult.specialPriorsReasons) {
      signals.push(`special_priors_${r}`);
    }
  }

  // Cluster A5 — Phase reset Hibrid (Layer 1+2 reset / preserve Layer 4)
  const phaseResetEval = evaluatePhaseReset({
    previousPhase: meta.previousPhase,
    currentPhase:  meta.currentPhase,
  });
  trace.phaseResetEval = phaseResetEval;
  if (phaseResetEval.shouldReset) signals.push('phase_reset_layer_1_and_2');

  // Cluster A1 — Conjugate Normal-Normal posterior update (closed-form)
  // LOCK 8 Kcal Floor 1200 filter per wiki/concepts/kcal-floor-1200-engine-filter
  // LOCK V1 2026-05-14 — exclude observations cu kcalDaily sub floor minim
  // pre sample mean/variance computation. Forward-compatible: observations
  // fara kcalDaily field pass-through unchanged (V1 weightDelta-only schema
  // preserved invariant). CDL log original append-only persists transparency
  // (ADR 011) — engine doar exclude din invatare. Anti-paternalism preserved.
  const rawObservations = Array.isArray(meta.observations) ? meta.observations : [];
  const kcalFloorFilterResult = filterKcalFloorObservations(rawObservations);
  trace.kcalFloorFilter = {
    excludedCount:  kcalFloorFilterResult.excludedCount,
    citationSource: kcalFloorFilterResult.citationSource,
    floorMin:       kcalFloorFilterResult.floorMin,
  };
  const observations = kcalFloorFilterResult.filtered;
  const obsCount = observations.length;
  let sampleMean = prior.mu;
  let sampleVariance = prior.sigma * prior.sigma;
  if (obsCount > 0) {
    const weightDeltas = observations
      .map((o) => Number(o?.weightDelta))
      .filter((v) => Number.isFinite(v));
    if (weightDeltas.length > 0) {
      sampleMean = weightDeltas.reduce((s, v) => s + v, 0) / weightDeltas.length;
      const variance = weightDeltas.length > 1
        ? weightDeltas.reduce((s, v) => s + (v - sampleMean) ** 2, 0) / (weightDeltas.length - 1)
        : prior.sigma * prior.sigma;
      sampleVariance = variance > 0 ? variance : prior.sigma * prior.sigma;
    }
  }

  let posterior = conjugateUpdate({
    prior,
    sampleMean,
    sampleVariance,
    observationsCount: obsCount,
    slope,
  });
  trace.posteriorRaw = { ...posterior };

  // Cluster C3 — Energy Adjustment σ variance modifier Hook
  const energyVarianceSignal = applyEnergyVarianceModifier({
    energyDirection: meta.energyDirection,
    tier,
  });
  trace.energyVarianceSignal = energyVarianceSignal;
  if (energyVarianceSignal.sigmaModifierApplied !== 1.0) {
    signals.push('energy_variance_modifier_applied');
  }
  posterior = {
    mu:    posterior.mu,
    sigma: applySigmaModifier({
      sigma:    posterior.sigma,
      modifier: energyVarianceSignal.sigmaModifierApplied,
    }),
  };

  // Cluster B2 — Kalman 1D filter cu R²>0.85 gate + EWMA fallback feature flag
  const recentObserved = Array.isArray(meta.recentObservedWeights) ? meta.recentObservedWeights : [];
  const recentPredicted = Array.isArray(meta.recentPredictedWeights) ? meta.recentPredictedWeights : [];
  const kalmanState = runKalmanWithFallback({
    previousState: { mu: posterior.mu, sigma: posterior.sigma },
    observation:   sampleMean,
    recentObserved,
    recentPredicted,
    flags,
  });
  trace.kalmanState = kalmanState;
  if (kalmanState.ewmaFallbackActive) signals.push('kalman_ewma_fallback_active');

  // Cluster D1 — Schema nutrition_inference_metadata
  const ci = computeConfidenceInterval({ mu: posterior.mu, sigma: posterior.sigma });
  const observationsForSchema = observations.slice(0, SCHEMA_CONSTANTS.observationsRollingN);
  const nutritionInferenceMetadata = {
    prior: { ...prior },
    posterior: {
      mu:                  posterior.mu,
      sigma:               posterior.sigma,
      observations_count:  observationsForSchema.length,
      ci_lower:            ci.lower,
      ci_upper:            ci.upper,
    },
    observations: observationsForSchema,
    confidence_interval: ci,
  };

  // Cluster D2 — Likelihood probabilities (NU specific kcal §3.5.1 D5)
  const likelihoodProbabilities = computeLikelihoodProbabilities({ posterior });
  trace.likelihoodProbabilities = likelihoodProbabilities;

  // Cluster B3 — Volume metric weighted compound:isolation 3:2:1
  const lastSession = recentSessions[0] || {};
  const sessionMovements = Array.isArray(lastSession.movements) ? lastSession.movements : [];
  const weightedVolume = computeWeightedVolume(sessionMovements);
  trace.weightedVolume = weightedVolume;

  // Cluster C1 — Isolation graceful degradation factor (compound observations <3)
  const isolationDegradation = computeIsolationDegradation(recentSessions);
  trace.isolationDegradation = isolationDegradation;
  if (isolationDegradation.factor < 1.0) {
    signals.push('isolation_graceful_degradation_compound_below_3');
  }

  // Cluster B4 — Mood Linear Sum Weighted normalized
  const moodScore = computeMoodScore({
    energyReadiness:  meta.energyReadiness,
    emoji:            meta.emoji,
    sleepSelfReport:  meta.sleepSelfReport,
  });
  trace.moodScore = moodScore;

  // Cluster D3 — Profile Typing thresholds Adaptive 0.55-0.85
  const profileThreshold = resolveProfileTypingThreshold({
    tier,
    adaptiveValue: meta.adaptiveProfileTypingValue,
  });
  const profileTypingState = evaluateProfileTypingFlip({
    currentThreshold:  meta.currentProfileTypingThreshold ?? profileThreshold,
    incomingThreshold: profileThreshold,
    recentSessions,
  });
  trace.profileTypingState = profileTypingState;
  if (profileTypingState.flapSuppressed) signals.push('profile_typing_flap_suppressed');

  // Cluster C2 — Engine #2 Goal Adaptation Disagreement flag CDL
  const disagreement = emitGoalAdaptationDisagreement({
    engine2Phase:         meta.engine2Phase,
    engine3InferredPhase: meta.engine3InferredPhase,
  });
  trace.disagreement = disagreement;
  if (disagreement.flagged) signals.push('engine2_engine3_disagreement_tier_1_silent_flag');

  // Cluster E2 — Passive Mode signal
  const passiveModeSignal = emitPassiveModeSignal({ specialPriorsResult });
  trace.passiveModeSignal = passiveModeSignal;

  // Cluster D6 — Anti-spam re-prompt evaluation
  const nowMs = Number(meta.nowMs);
  const antiSpam = Number.isFinite(nowMs)
    ? evaluateAntiSpam({
        nowMs,
        lastPromptMs:        meta.lastNutritionPromptMs,
        promptCountThisYear: meta.nutritionPromptCountThisYear,
      })
    : { shouldPrompt: false, blockedReasons: ['nowMs_missing_skip_evaluation'] };
  trace.antiSpam = antiSpam;
  if (!antiSpam.shouldPrompt && Number.isFinite(nowMs)) {
    signals.push('anti_spam_blocked_re_prompt');
  }

  // Cluster D4 — UI tier Tier 1+2 only NU blocking modal
  const uiTier = resolveUiTier({
    disagreementFlagged: disagreement.flagged,
    passiveModeActive:   passiveModeSignal.active,
  });

  // Hook Forward Constraint Object pass-through immutable
  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);
  trace.forwardedConstraint = forwardedConstraint !== null;

  /** @type {import('./types.js').BayesianNutritionBlueprint} */
  const blueprint = {
    nutrition_inference_metadata: nutritionInferenceMetadata,
    likelihood_probabilities:     likelihoodProbabilities,
    profile_typing:               profileTypingState,
    ui_tier:                      uiTier,
    passive_mode_active:          passiveModeSignal.active,
    signals:                      signals.slice(),
  };

  const confidence = computeConfidence({
    hasObservations:             obsCount > 0,
    hasPriorSource:              true, // demographic prior always available
    hasPeriodizationConstraint:  periodizationConstraint !== null,
  });

  // Tier semantic per ADR 018 §2 enum: 'none' / 'LOW' / 'MED' / 'HIGH'
  // V1 default 'MED' when computed; 'none' when ctx empty (no observations + no demographic prior)
  const tierResult = (obsCount === 0 && !Number.isFinite(meta.demographicMu))
    ? 'none'
    : 'MED';

  // Decay posterior to prior for next cycle (Cluster A3 reference, NU acted upon — caller persists)
  trace.nextPrior = decayPosteriorToPrior(posterior);

  return {
    id:               ENGINE_ID,
    tier:             tierResult,
    confidence,
    signals,
    recommendations:  [], // V1 empty — Stage 3 ENHANCEMENT downstream emission
    trace,
    meta:             blueprint,
  };
}
