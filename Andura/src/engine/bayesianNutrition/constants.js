// Engine Bayesian Nutrition Inference V1 constants per ADR 026 §9.4 Cluster A-E
// verbatim + ADR 022 SPEC READY V1 complementary detail.
//
// Pipeline §42.10 position 4th canonical: Periodization → Goal Adaptation →
// Energy → Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.4
// (Cluster A-E verbatim aggregation chat strategic 2026-05-05 birou after).
// Complementary: 03-decisions/_FROZEN/022-bayesian-nutrition-inference.md SPEC READY V1.
//
// ZERO fabrication beyond §9.4 spec. ZERO Date.now / Math.random — all values
// static per ADR 018 §2 deterministic contract.
//
// Constraint: <50ms median per ADR 026 Q8.1 budget — Gaussian Conjugate Prior
// Normal-Normal closed-form ONLY (NU MCMC NU JAX A1 LOCKED V1).

/**
 * Calibration tier ids per ADR 009 + Cluster A2 Strong Prior dynamic slope.
 * Cross-ref §9.3 Energy Adjustment Cluster 4 Q13=B tier-aware (T0/T1/T2 same).
 *
 * @type {Readonly<{T0: 'T0', T1: 'T1', T2: 'T2'}>}
 */
export const CALIBRATION_TIERS = Object.freeze({
  T0: 'T0',
  T1: 'T1',
  T2: 'T2',
});

/**
 * Strong Prior dynamic slope tier-based per Cluster A2 verbatim:
 *   T0 cold start = 70% prior / 30% input (low confidence anti-overshoot)
 *   T1 established = 80% input / 20% prior (per §3.5.1 PRODUCT_STRATEGY -50% calibration time)
 *   T2 high confidence = 90% input / 10% prior (Convergence Guard satisfied)
 *
 * Note: T0 favors prior (uncertainty high, lean on demographic baseline).
 * T1+ favors input (data accumulated, posterior dominates).
 *
 * @type {Readonly<Object<string, {prior: number, input: number}>>}
 */
export const STRONG_PRIOR_SLOPE = Object.freeze({
  T0: Object.freeze({ prior: 0.70, input: 0.30 }),
  T1: Object.freeze({ prior: 0.20, input: 0.80 }),
  T2: Object.freeze({ prior: 0.10, input: 0.90 }),
});

/**
 * Hall 2008 metabolic adaptation literature defaults per Cluster B2 Caveat 1.
 *
 * Forbes equation: ~22 kcal/kg LBM lost per metabolic adaptation rate.
 * Reference: Hall 2008 NIH metabolic adaptation literature canonical.
 *
 * @type {Readonly<{
 *   metabolicAdaptationKcalPerKgLbm: number,
 *   r2ValidationGate: number,
 *   ewmaAlphaDefault: number,
 *   ewmaFallbackFlag: string,
 * }>}
 */
export const KALMAN_DEFAULTS = Object.freeze({
  metabolicAdaptationKcalPerKgLbm: 22,
  r2ValidationGate:                0.85,  // R²>0.85 simulator gate Cluster B2 Caveat 2
  ewmaAlphaDefault:                0.30,  // EWMA fallback alpha smoothing factor V1
  ewmaFallbackFlag:                'bayesian_kalman_v1', // feature flag rollout per ADR 018 Cluster B2 Caveat 3
});

/**
 * Volume metric weighted compound:isolation 3:2:1 per Cluster B3 verbatim.
 *
 * Reflects metabolic disruption magnitude per movement category:
 * - Lower body compound (squat, deadlift, hip thrust) × 3
 * - Upper body compound (bench, OHP, row) × 2
 * - Isolation (curl, lateral raise, leg ext) × 1
 *
 * @type {Readonly<{LOWER_COMPOUND: number, UPPER_COMPOUND: number, ISOLATION: number}>}
 */
export const VOLUME_METRIC_WEIGHTS = Object.freeze({
  LOWER_COMPOUND: 3,
  UPPER_COMPOUND: 2,
  ISOLATION:      1,
});

/**
 * Movement category enum per Cluster B3 weighted volume metric.
 *
 * @type {Readonly<{LOWER_COMPOUND: 'lower_compound', UPPER_COMPOUND: 'upper_compound', ISOLATION: 'isolation'}>}
 */
export const MOVEMENT_CATEGORY = Object.freeze({
  LOWER_COMPOUND: 'lower_compound',
  UPPER_COMPOUND: 'upper_compound',
  ISOLATION:      'isolation',
});

/**
 * Profile Typing thresholds per Cluster D3 verbatim:
 *   Adaptive 0.55-0.85 T1+ cu 0.70 default T0
 *   Hamming hysteresis 15% (anti-flap profile change)
 *   2 sesiuni consecutive 14 zile window (qualifier explicit)
 *
 * @type {Readonly<{
 *   t0Default: number,
 *   t1PlusMin: number,
 *   t1PlusMax: number,
 *   hammingHysteresisPct: number,
 *   minConsecutiveSessions: number,
 *   windowDays: number,
 * }>}
 */
export const PROFILE_TYPING = Object.freeze({
  t0Default:              0.70,
  t1PlusMin:              0.55,
  t1PlusMax:              0.85,
  hammingHysteresisPct:   0.15,
  minConsecutiveSessions: 2,
  windowDays:             14,
});

/**
 * Schema constants per Cluster D1 nutrition_inference_metadata verbatim.
 *
 * @type {Readonly<{
 *   observationsRollingN: number,
 *   confidenceIntervalLevel: number,
 *   priorSourceDemographic: string,
 *   priorSourcePosteriorPrev: string,
 * }>}
 */
export const SCHEMA_CONSTANTS = Object.freeze({
  observationsRollingN:     20,
  confidenceIntervalLevel:  0.95,
  priorSourceDemographic:   'demographic_prior',
  priorSourcePosteriorPrev: 'posterior_n_minus_1',
});

/**
 * Anti-spam aliniat Engine #2 per Cluster D6 + ADR 024 §2.8 Q8 LOCKED precedent.
 *
 * @type {Readonly<{
 *   cooldownDays: number,
 *   maxPromptsPerYear: number,
 * }>}
 */
export const ANTI_SPAM = Object.freeze({
  cooldownDays:      28,
  maxPromptsPerYear: 4,
});

/**
 * Volume landmarks Hibrid lookup + regression per Cluster C1 verbatim.
 *
 * Israetel base lookup + regression personalized STRICT compound only.
 * Isolation graceful degradation 0.3× cand compound observations <3 in
 * window 14 zile (anti-overfit small-N isolation noise).
 *
 * @type {Readonly<{
 *   compoundMinObservations: number,
 *   isolationGracefulDegradationFactor: number,
 *   regressionWindowDays: number,
 * }>}
 */
export const VOLUME_LANDMARKS = Object.freeze({
  compoundMinObservations:            3,
  isolationGracefulDegradationFactor: 0.30,
  regressionWindowDays:               14,
});

/**
 * Phase reset Hibrid per Cluster A5 verbatim:
 *   CUT → BULK transition = Layer 1 (kcal_baseline) + Layer 2 (macro_split) RESET
 *   Preserve Layer 4 (Goal Shift Event Handler §36.35 streak preservation)
 *
 * @type {Readonly<{
 *   resetLayers: ReadonlyArray<number>,
 *   preserveLayers: ReadonlyArray<number>,
 * }>}
 */
export const PHASE_RESET_LAYERS = Object.freeze({
  resetLayers:    Object.freeze([1, 2]),
  preserveLayers: Object.freeze([4]),
});

/**
 * Special priors edge cases per Cluster E2 verbatim:
 *   - Pregnant + post-bariatric + kidney disease = Passive Mode tripwire
 *     (engine NU output adjustment, deferral medical care)
 *   - >75 ani + ED history (eating disorder) = Special priors set + disclaimer
 *
 * @type {Readonly<{
 *   passiveModeConditions: ReadonlyArray<string>,
 *   specialPriorsAgeThreshold: number,
 *   specialPriorsConditions: ReadonlyArray<string>,
 *   disclaimerCopy: string,
 * }>}
 */
export const EDGE_CASES = Object.freeze({
  passiveModeConditions: Object.freeze(['pregnant', 'post_bariatric', 'kidney_disease']),
  specialPriorsAgeThreshold: 75,
  specialPriorsConditions: Object.freeze(['ed_history']),
  disclaimerCopy: 'Andura NU inlocuieste sfat medical',
});

/**
 * UI tier per Cluster D4 verbatim:
 *   Tier 1 silent (CDL log only) + Tier 2 banner discret (informational)
 *   NU blocking modal — Maria 65 autonomy preserve invariant
 *   Tier 3 reserved for explicit Engine #2 Goal Shift trigger (NU Engine #3)
 *
 * @type {Readonly<{TIER_1_SILENT: 'TIER_1_SILENT', TIER_2_BANNER: 'TIER_2_BANNER'}>}
 */
export const UI_TIER = Object.freeze({
  TIER_1_SILENT: 'TIER_1_SILENT',
  TIER_2_BANNER: 'TIER_2_BANNER',
});

/**
 * Hard rule preserved §3.5.1 per Cluster D5 verbatim:
 *   NEVER specific kcal output in UI — output {deficit/surplus/maintenance}_likelihood
 *   probabilities only.
 *
 *   Bugatti differential vs MFP/Lose-It (specific kcal pseudo-precision Maria 65 confusion).
 *
 * @type {boolean}
 */
export const NEVER_SPECIFIC_KCAL_UI = true;

/**
 * Cross-engine #5 Energy Adjustment σ variance modifier per Cluster C3 verbatim.
 *
 * NU linear discount — readiness scazut creste σ observatii recent (zgomot
 * inflamatie/stres/cortisol). Neutral fallback T0 cold start (sigma_modifier
 * = 1.0 default until 14 zile observations).
 *
 * V1 conservative pick: readiness DOWN → σ × 1.30 (amplify variance dampening).
 *
 * @type {Readonly<{
 *   sigmaAmplifyFactorOnReadinessDown: number,
 *   sigmaModifierNeutralT0: number,
 * }>}
 */
export const ENERGY_VARIANCE_MODIFIER = Object.freeze({
  sigmaAmplifyFactorOnReadinessDown: 1.30,
  sigmaModifierNeutralT0:            1.00,
});

/**
 * Engine performance budget per A1 LOCKED V1 (ADR 026 Q8.1 budget compliant).
 *
 * @type {Readonly<{maxLatencyMs: number}>}
 */
export const PERFORMANCE_BUDGET = Object.freeze({
  maxLatencyMs: 50, // <50ms median Gaussian Conjugate Prior closed-form local-first JS tractable
});

/**
 * Kcal floor minim per LOCK 8 LOCK V1 2026-05-14 Daniel CEO directive verbatim
 * chat birou 2026-05-14:
 *   "Daca user vrea sa puna sub 1200 kcal logate, mesaj ca minimul recomandat
 *    de institutil bla bla bla este de 1200 si ca andura nu o sa includa
 *    loguri mai mici pentru calculul obiectivelor si preconizari viitoare"
 *
 * WHO/ESPEN/INS Romania scientific anchored reference universal applicable
 * (1200 kcal/zi minim survival baseline female lower bound conservative).
 *
 * Observations cu kcalDaily sub acest prag sunt filtered din sample mean +
 * variance computation Cluster A1 Conjugate Normal-Normal pre-update, NU
 * blocate la log (user autonomy preserved invariant per F2 Sufletul Andura
 * "AI-ul informeaza NU impune" cross-13 LOCKs catalysator).
 *
 * Anti-paternalism preserved invariant ABSOLUTE: CDL append-only persists
 * log original transparency NU mutate; engine exclude din invatare + UI
 * informeaza scientific anchored citation source citable.
 *
 * @type {number}
 */
export const KCAL_FLOOR_DAILY_MIN = 1200;

/**
 * Citation source kcal floor — WHO scientific anchored universal applicable.
 * Romanian-first no-diacritics rule LOCK V1 PERMANENT 2026-05-10 strict.
 *
 * Forward-going UI trigger consumer wording reference (getKcalFloorInformative-
 * Message in observationFilter.js).
 *
 * @type {string}
 */
export const KCAL_FLOOR_CITATION_SOURCE = 'WHO (Organizatia Mondiala a Sanatatii)';
