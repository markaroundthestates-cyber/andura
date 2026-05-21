// Cluster C Mind-Muscle Connection + Adaptive Frequency per ADR 026 §9.5.3
// verbatim.
//
// C5 Mind-muscle tier-aware T0 OFF / T1+ profile-typing (Q5=C):
//    - T0 cold start: mind-muscle cues OFF (calibration window noise high,
//      anti-overfit early signals).
//    - T1+ established: profile-typing-aware activation.
//    - Cross-ref: ADR 009 §AMENDMENT 2026-05-05 birou after Convergence Guard
//      "T2 Unlock" — tier transitions cross-cutting NU Tempo specific.
//      Reference shared utility `src/coach/orchestrator/utilities/convergenceGuard.js`
//      via crossEngineHooks (NU duplicate logic in Tempo).
//
// C7 Adaptive frequency reduces post-acquisition (Q7=D + Q9=D):
//    - Q7=D adaptive frequency: cue surface frequency reduces post-acquisition
//    - Q9=D dual signal: explicit "stiu" user toggle + implicit N=10 sessions
//      consecutive cu form breakdown < threshold
//    - Acquired = engine reduces cue surface (anti-paternalism)
//
// C15 Tier-aware depth (Q15=B):
//    - T0 minimal (cue text-only basic)
//    - T1+ richer (cue + rationale + suggested fix)
//    - T2+ adaptive (persona-aware tone + ML cue selection v1.5+ deferred)
//
// C17 Suppression hard T0/T1 + soft auto-retire T2+ (Q17=C):
//    - T0/T1 hard suppression = user toggle "stiu" Q9 explicit → cue NU surface
//      for movement (binary on/off)
//    - T2+ soft auto-retire = N=10 sessions implicit (Q9 dual signal) → cue
//      auto-retire pentru movement (user can re-activate manual via Settings UI)
//
// Pure functions — no side effects.

import {
  MIND_MUSCLE_ACTIVATION_BY_TIER,
  SUPPRESSION_MODE,
  SUPPRESSION_MODE_BY_TIER,
  FREQUENCY_THRESHOLDS,
} from './constants.js';

/**
 * Resolve mind-muscle activation per Cluster C5 Q5=C verbatim tier-aware:
 *   T0 OFF (calibration noise) / T1+ profile-typing-aware activation.
 *
 * Cross-ref ADR 009 §AMENDMENT Convergence Guard "T2 Unlock" — tier transitions
 * cross-cutting NU Tempo specific. Tempo references shared utility ONLY (NU
 * duplicate logic) via `crossEngineHooks.getConvergenceGuardReference()`.
 *
 * @param {string} [tier]                          - 'T0' | 'T1' | 'T2'
 * @returns {boolean}
 */
export function resolveMindMuscleByTier(tier) {
  if (typeof tier !== 'string') return MIND_MUSCLE_ACTIVATION_BY_TIER.T0 ?? false;
  const map = /** @type {Record<string, boolean>} */ (MIND_MUSCLE_ACTIVATION_BY_TIER);
  return map[tier] ?? MIND_MUSCLE_ACTIVATION_BY_TIER.T0 ?? false;
}

/**
 * Detect implicit acquisition per Cluster C7 Q7=D + Q9=D verbatim — N=10
 * sessions consecutive cu form breakdown rate < threshold (default 20%).
 *
 * @param {Object} input
 * @param {Array<{formBreakdown?: boolean}>} [input.recentSessionsForMovement]
 *   Recent sessions for the SPECIFIC movement (caller filters; may be empty)
 * @returns {{
 *   acquiredImplicit: boolean,
 *   sessionsCount: number,
 *   formBreakdownRate: number,
 *   rationale: string,
 * }}
 */
export function detectImplicitAcquisition({ recentSessionsForMovement }) {
  const sessions = Array.isArray(recentSessionsForMovement) ? recentSessionsForMovement : [];
  const N = FREQUENCY_THRESHOLDS.acquisitionSessionsImplicitDefault;

  if (sessions.length < N) {
    return {
      acquiredImplicit:   false,
      sessionsCount:      sessions.length,
      formBreakdownRate:  0,
      rationale:          `insufficient_sessions_${sessions.length}_below_implicit_threshold_${N}`,
    };
  }

  const window = sessions.slice(0, N);
  const breakdownCount = window.filter((s) => s && s.formBreakdown === true).length;
  const rate = breakdownCount / window.length;
  const acquired = rate < FREQUENCY_THRESHOLDS.formBreakdownRateThreshold;

  return {
    acquiredImplicit:   acquired,
    sessionsCount:      window.length,
    formBreakdownRate:  rate,
    rationale: acquired
      ? `implicit_acquisition_n_${N}_form_breakdown_rate_${rate.toFixed(2)}_below_threshold`
      : `not_acquired_form_breakdown_rate_${rate.toFixed(2)}_above_threshold`,
  };
}

/**
 * Detect explicit acquisition per Cluster C7 Q9=D verbatim — user toggle
 * "stiu" Q9 explicit binary on/off.
 *
 * @param {Object} input
 * @param {string} [input.movementId]
 * @param {ReadonlyArray<string>|Array<string>} [input.userKnowToggleMovements]
 *   List of movementIds user has explicitly toggled "stiu"
 * @returns {boolean}
 */
export function detectExplicitAcquisition({ movementId, userKnowToggleMovements }) {
  if (typeof movementId !== 'string' || movementId.length === 0) return false;
  const list = Array.isArray(userKnowToggleMovements) ? userKnowToggleMovements : [];
  return list.includes(movementId);
}

/**
 * Resolve suppression mode per Cluster C17 Q17=C verbatim tier-aware:
 *   T0/T1 = HARD suppression (user toggle binary)
 *   T2+   = SOFT_AUTO_RETIRE (N=10 implicit + user re-activate)
 *
 * @param {string} [tier]
 * @returns {string} SUPPRESSION_MODE value
 */
export function resolveSuppressionMode(tier) {
  if (typeof tier !== 'string') return SUPPRESSION_MODE.HARD;
  return SUPPRESSION_MODE_BY_TIER[tier] ?? SUPPRESSION_MODE.HARD;
}

/**
 * Determine if cue should be suppressed for movement per Cluster C17 verbatim:
 *   T0/T1 hard: explicit user toggle "stiu" → suppress (binary on/off)
 *   T2+ soft: implicit N=10 acquisition → auto-retire (user can re-activate)
 *
 * Pure logic: caller supplies acquisition signals; this function applies
 * suppression rule per tier. No mutations, no side effects.
 *
 * @param {Object} input
 * @param {string} input.tier
 * @param {boolean} input.acquiredExplicit
 * @param {boolean} input.acquiredImplicit
 * @returns {{suppressed: boolean, mode: string, rationale: string}}
 */
export function evaluateSuppression({ tier, acquiredExplicit, acquiredImplicit }) {
  const mode = resolveSuppressionMode(tier);

  if (mode === SUPPRESSION_MODE.HARD) {
    // T0/T1: only explicit user toggle suppresses (binary on/off)
    return {
      suppressed: acquiredExplicit === true,
      mode,
      rationale: acquiredExplicit === true
        ? `hard_suppression_explicit_user_toggle_stiu_q9_tier_${tier}`
        : `no_suppression_explicit_toggle_off_tier_${tier}`,
    };
  }

  // T2+ soft: explicit OR implicit triggers auto-retire
  const suppressed = acquiredExplicit === true || acquiredImplicit === true;
  return {
    suppressed,
    mode,
    rationale: suppressed
      ? (acquiredExplicit === true
          ? `soft_auto_retire_explicit_user_toggle_stiu_t2_plus`
          : `soft_auto_retire_implicit_n_10_form_breakdown_below_threshold_t2_plus`)
      : `no_suppression_neither_explicit_nor_implicit_acquired_t2_plus`,
  };
}

/**
 * Compose mind-muscle state emit per Cluster A1 verbatim — bundles active +
 * suppressionMode + acquisition signals + suppressedForMovement + rationale.
 *
 * V1 simplification: caller supplies movement-scoped acquisition signals; full
 * per-movement state map deferred orchestrator layer (ADR 030 D2 thin scope).
 *
 * @param {Object} input
 * @param {string} input.tier
 * @param {string} [input.movementId]
 * @param {ReadonlyArray<string>|Array<string>} [input.userKnowToggleMovements]
 * @param {Array<{formBreakdown?: boolean}>} [input.recentSessionsForMovement]
 * @param {boolean} [input.deloadOverrideActive]   - Cluster D12 Q12=D unlock
 * @returns {import('./types.js').MindMuscleState}
 */
export function composeMindMuscleState({
  tier,
  movementId,
  userKnowToggleMovements,
  recentSessionsForMovement,
  deloadOverrideActive,
}) {
  // Cluster D12 Q12=D — Deload phase overrides tier-aware default (mind-muscle
  // unlock during recovery week, lower load = bandwidth for technique focus).
  const tierActive = resolveMindMuscleByTier(tier);
  const active = deloadOverrideActive === true ? true : tierActive;

  const explicit = detectExplicitAcquisition({ movementId, userKnowToggleMovements });
  const implicitResult = detectImplicitAcquisition({ recentSessionsForMovement });
  const suppression = evaluateSuppression({
    tier,
    acquiredExplicit: explicit,
    acquiredImplicit: implicitResult.acquiredImplicit,
  });

  // If suppressed for movement, mind-muscle effectively inactive for THIS movement
  // (per-movement granularity — cue NU surface). Active flag describes tier-level
  // capability; suppressedForMovement scopes per-movement application.
  const rationale = deloadOverrideActive === true
    ? `deload_override_unlock_q12_d_overrides_tier_${tier}_default`
    : (active
        ? `tier_${tier}_active_${tierActive}_profile_typing_aware`
        : `tier_${tier}_off_calibration_window_noise_anti_overfit`);

  return {
    active,
    suppressionMode:        /** @type {import('./types.js').SuppressionMode} */ (suppression.mode),
    acquiredExplicit:       explicit,
    acquiredImplicit:       implicitResult.acquiredImplicit,
    suppressedForMovement:  suppression.suppressed,
    rationale: suppression.suppressed
      ? `${rationale}_but_suppressed_for_movement_${suppression.rationale}`
      : rationale,
  };
}
