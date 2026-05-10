// Engine Bayesian Nutrition Inference V1 types per ADR 026 §9.4 + ADR 018 §2
// Standardized Dimension Contract.
//
// BayesianNutritionResult extends DimensionResult per ADR 018 §2 — adds 6
// blueprint fields in `meta` per §9.4.4 Cluster D verbatim.
//
// Pipeline §42.10 position 4th canonical.
//
// Per ADR 005 Vanilla JS: types pinned via JSDoc typedefs (NU TypeScript).

/**
 * Calibration tier per Cluster A2 + ADR 009.
 *
 * @typedef {'T0'|'T1'|'T2'} CalibrationTier
 */

/**
 * Movement category per Cluster B3 weighted volume metric.
 *
 * @typedef {'lower_compound'|'upper_compound'|'isolation'} MovementCategory
 */

/**
 * UI tier per Cluster D4 — Tier 1 silent / Tier 2 banner / NU Tier 3 modal.
 *
 * @typedef {'TIER_1_SILENT'|'TIER_2_BANNER'} UiTier
 */

/**
 * Gaussian distribution parameters per Cluster A1 Normal-Normal closed-form.
 *
 * @typedef {Object} Gaussian
 * @property {number} mu      - Mean estimate
 * @property {number} sigma   - Standard deviation
 */

/**
 * Prior distribution per Cluster A1 + Cluster D1 schema.
 *
 * @typedef {Object} Prior
 * @property {number} mu
 * @property {number} sigma
 * @property {'demographic_prior'|'posterior_n_minus_1'} source
 */

/**
 * Posterior distribution per Cluster A3 (decay natural posterior=prior_next)
 * + Cluster D1 schema.
 *
 * @typedef {Object} Posterior
 * @property {number} mu
 * @property {number} sigma
 * @property {number} observations_count    - N rolling window count
 * @property {number} ci_lower              - Confidence interval lower bound
 * @property {number} ci_upper              - Confidence interval upper bound
 */

/**
 * Observation per Cluster D1 schema (rolling window N=20).
 *
 * @typedef {Object} Observation
 * @property {number} weightDelta            - Delta kg week-over-week
 * @property {number} adherenceRate          - 0-1 normalized
 * @property {number} [reportedEnergyMood]   - 0-1 normalized aggregate
 * @property {number} [timestampMs]          - When observation captured (caller-provided, NU Date.now)
 */

/**
 * Confidence interval per Cluster D1 schema.
 *
 * @typedef {Object} ConfidenceInterval
 * @property {number} lower
 * @property {number} upper
 * @property {number} level                  - 0.95 default per Cluster D1
 */

/**
 * Likelihood probabilities per Cluster D2 verbatim:
 *   {deficit_likelihood, surplus_likelihood, maintenance_likelihood} sum = 1.0
 *
 * NU absolute kcal output — hard rule preserved §3.5.1 NEVER specific kcal.
 *
 * @typedef {Object} LikelihoodProbabilities
 * @property {number} deficit_likelihood
 * @property {number} surplus_likelihood
 * @property {number} maintenance_likelihood
 */

/**
 * Kalman 1D state per Cluster B2 (Hall 2008 defaults + R²>0.85 + EWMA fallback).
 *
 * @typedef {Object} KalmanState
 * @property {number} mu                     - State estimate
 * @property {number} sigma                  - State uncertainty
 * @property {number} r2                     - R² goodness-of-fit (validation gate)
 * @property {boolean} ewmaFallbackActive    - True daca R²<0.85 → revert EWMA
 */

/**
 * Profile Typing state per Cluster D3 (Adaptive 0.55-0.85 + 15% Hamming + 2 sesiuni).
 *
 * @typedef {Object} ProfileTypingState
 * @property {number} threshold                                  - Current threshold value 0.55-0.85
 * @property {boolean} flapSuppressed                            - True daca Hamming hysteresis 15% prevents flip
 * @property {number} consecutiveSessionsAlignedCurrent          - Counter toward 2-sesiuni qualifier
 */

/**
 * nutrition_inference_metadata schema per Cluster D1 verbatim.
 *
 * @typedef {Object} NutritionInferenceMetadata
 * @property {Prior} prior
 * @property {Posterior} posterior
 * @property {Array<Observation>} observations               - N=20 rolling window
 * @property {ConfidenceInterval} confidence_interval
 */

/**
 * Bayesian Nutrition-specific blueprint emit (lives in DimensionResult.meta per
 * §9.4.4 Cluster D + ADR 018 §2).
 *
 * @typedef {Object} BayesianNutritionBlueprint
 * @property {NutritionInferenceMetadata} nutrition_inference_metadata  - Cluster D1
 * @property {LikelihoodProbabilities} likelihood_probabilities         - Cluster D2 (NU specific kcal D5)
 * @property {ProfileTypingState} profile_typing                        - Cluster D3
 * @property {UiTier} ui_tier                                           - Cluster D4 Tier 1+2 only NU blocking modal
 * @property {boolean} passive_mode_active                              - Cluster E2 tripwire
 * @property {string[]} signals                                         - Mirror DimensionResult.signals
 */

/**
 * BayesianNutritionResult — extends DimensionResult per ADR 018 §2.
 *
 * @typedef {Object} BayesianNutritionResult
 * @property {string}                       id              - Always 'bayesianNutrition'
 * @property {'none'|'LOW'|'MED'|'HIGH'}    tier            - V1 default 'MED' when computed; 'none' when insufficient ctx
 * @property {'low'|'medium'|'high'}        confidence      - Based on ctx data completeness
 * @property {string[]}                     signals         - Human-readable signal IDs
 * @property {Array<Object>}                recommendations - V1 empty (orchestrator-level concern)
 * @property {Object}                       trace           - Free-form debug info (cluster computations transparency)
 * @property {BayesianNutritionBlueprint}   meta            - Bayesian-specific blueprint
 */

/**
 * Cross-engine #2 Goal Adaptation Disagreement flag CDL per Cluster C2 verbatim.
 *
 * @typedef {Object} DisagreementFlagSignal
 * @property {boolean} flagged
 * @property {string} engine2Phase                          - From Engine #2 Goal Adaptation
 * @property {string} engine3InferredPhase                  - From Engine #3 Bayesian inference
 * @property {string} reason
 */

/**
 * Cross-engine #5 Energy Adjustment σ variance modifier per Cluster C3 verbatim.
 *
 * @typedef {Object} EnergyVarianceSignal
 * @property {string} readinessDirection                    - 'UP' | 'DOWN' | 'NONE'
 * @property {number} sigmaModifierApplied                  - 1.0 neutral / >1.0 amplified
 * @property {string} rationale
 */

/**
 * Edge case Passive Mode tripwire per Cluster E2 verbatim.
 *
 * @typedef {Object} PassiveModeSignal
 * @property {boolean} active
 * @property {string[]} conditions                          - 'pregnant' | 'post_bariatric' | 'kidney_disease'
 * @property {boolean} medicalReferralRequired
 */

export {};
