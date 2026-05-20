// Engine Tempo V1 — public API per ADR 026 §9.5 + ADR 018 §2.
//
// Pipeline §42.10 position 5th canonical:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6)
//   → Warm-up (§9.7) → Deload (§9.8).
//
// Pure function `evaluate(ctx) → TempoResult` total + deterministic +
// async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Output blueprint per Cluster A1 verbatim:
//   1. tempo_prescription   — pre-set intro + reactive expanded + timing (Q1=C+Q6=D+Q8=D)
//   2. form_cue             — cue text RO native cu persona-aware tone (Q2=C+Q3+Q18=D)
//   3. mind_muscle_active   — boolean tier-aware (T0 OFF / T1+ Q5=C)
//   4. cue_delivery_timing  — pre-set / post-set / mid-rest ONLY (NU intra-set Q8=D)
//   5. signals              — human-readable signal IDs
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.5
// (commit a9b7cbd LANDED 2026-05-06 afternoon chat-6 acasa, 28-30 decisions
// Cluster A-E verbatim).
//
// Source 3 NU disponibil: ADR 028 = STUB legacy precedent §9.3 Energy ADR 027
// stub pattern. 2-way parity only Source 1 ↔ Source 2.

import {
  composeTempoPrescription,
} from './tempoPrescription.js';
import {
  resolvePersona,
  composeFormCue,
} from './formCues.js';
import {
  composeMindMuscleState,
} from './mindMuscle.js';
import {
  detectHighIntensityAmplification,
  detectDeloadMindMuscleUnlock,
  detectEnergyDownSlowEccentric,
  emitFormBreakdownAutoBump,
  detectRirMismatchSilentTelemetry,
  getConvergenceGuardReference,
  forwardConstraintObject,
} from './crossEngineHooks.js';
import {
  CALIBRATION_TIERS,
  MOVEMENT_CATEGORY,
  SCHEMA_CONSTANTS,
} from './constants.js';

export const ENGINE_ID = 'tempo';

/**
 * Compute confidence level per ctx data completeness signals.
 *
 * @param {Object} input
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasMovementContext
 * @param {boolean} input.hasTierResolved
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({
  hasPeriodizationConstraint,
  hasMovementContext,
  hasTierResolved,
}) {
  let score = 0;
  if (hasPeriodizationConstraint) score += 1;
  if (hasMovementContext) score += 1;
  if (hasTierResolved) score += 1;
  if (score >= 3) return 'high';
  if (score >= SCHEMA_CONSTANTS.confidenceMediumFloor) return 'medium';
  return 'low';
}

/**
 * Resolve calibration tier from ctx — defensive normalization per ADR 009 +
 * §9.5.3 Cluster C5 verbatim.
 *
 * @param {Object} [ctx]
 * @returns {string|null} 'T0' | 'T1' | 'T2' or null daca unresolvable
 */
function resolveTier(ctx) {
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const declared = typeof safeCtx.profileTier === 'string' ? safeCtx.profileTier : null;
  if (declared === CALIBRATION_TIERS.T0
    || declared === CALIBRATION_TIERS.T1
    || declared === CALIBRATION_TIERS.T2) {
    return declared;
  }
  return null;
}

/**
 * Resolve movement category from ctx fallback chain.
 *
 * @param {Object} [meta]
 * @returns {string} 'compound' | 'isolation'
 */
function resolveMovementCategory(meta) {
  const declared = typeof meta?.movementCategory === 'string'
    ? meta.movementCategory.toLowerCase()
    : null;
  if (declared === MOVEMENT_CATEGORY.ISOLATION) return MOVEMENT_CATEGORY.ISOLATION;
  return MOVEMENT_CATEGORY.COMPOUND; // safe default
}

/**
 * Evaluate Engine Tempo per ADR 026 §9.5 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid TempoResult
 * cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 5 fields (Cluster A1 verbatim emit):
 *   1. tempo_prescription (notation + preSet + reactiveExpanded + timing + rationale)
 *   2. form_cue (cueText + category + movementId + persona + depth)
 *   3. mind_muscle_active (boolean tier-aware T0 OFF / T1+ + Deload override Q12=D)
 *   4. cue_delivery_timing (PRE_SET / POST_SET / MID_REST — NU INTRA_SET Q8=D)
 *   5. signals (human-readable IDs)
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').TempoResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics per ADR 018 §2.
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};
  const recentSessions = Array.isArray(safeCtx.recentSessions) ? safeCtx.recentSessions : [];

  // Cluster C5 — Tier resolution per ADR 009 + §9.5.3 verbatim.
  const tier = resolveTier(safeCtx);
  trace.tier = tier;

  // Cluster A1 — Periodization Constraint Object Hook (consumed read-only frozen,
  // anti-cascade safeguard per §1.10 Pipeline Order LOCKED V1).
  const periodizationConstraint = meta.periodizationConstraint || null;
  trace.hasPeriodizationConstraint = periodizationConstraint !== null;

  // Cluster D11 — Periodization high intensity → form-conservative amplification
  const highIntensityAmp = detectHighIntensityAmplification({
    periodizationPhase: meta.periodizationPhase,
  });
  trace.highIntensityAmplification = highIntensityAmp;
  if (highIntensityAmp.amplified) signals.push('tempo_form_conservative_amplification_high_intensity');

  // Cluster D12 — Deload week mind-muscle unlock
  const deloadUnlock = detectDeloadMindMuscleUnlock({
    periodizationPhase: meta.periodizationPhase,
  });
  trace.deloadUnlock = deloadUnlock;
  if (deloadUnlock.unlocked) signals.push('mind_muscle_unlock_deload_q12_d');

  // Cluster D13 — Energy DOWN → slow eccentric universal Q13=B
  const energyDown = detectEnergyDownSlowEccentric({
    energyDirection: meta.energyDirection,
  });
  trace.energyDown = energyDown;
  if (energyDown.applied) signals.push('energy_down_slow_eccentric_universal_q13_b');

  // Cluster D14 — RIR Matrix form breakdown user toggle → +1 auto-bump signal
  const formBreakdownAutoBump = emitFormBreakdownAutoBump({
    formBreakdownToggled: meta.formBreakdownToggled,
  });
  trace.formBreakdownAutoBump = formBreakdownAutoBump;
  if (formBreakdownAutoBump.emit) signals.push('rir_auto_bump_plus_1_form_breakdown_q14_b');

  // Cluster B4 + D Q4=A — RIR mismatch silent telemetry only V1
  const rirMismatchTelemetry = detectRirMismatchSilentTelemetry({
    userReportedFormBreakdown: meta.userReportedFormBreakdown,
    rirMatrixExpected:         meta.rirMatrixExpected,
    rirActual:                 meta.rirActual,
  });
  trace.rirMismatchTelemetry = rirMismatchTelemetry;
  if (rirMismatchTelemetry.flagged) signals.push('rir_mismatch_silent_telemetry_q4_a_v1_no_active_trigger');

  // Cluster B2 + B3 + D18 — Persona resolution + form cue composition
  const persona = resolvePersona(safeCtx);
  trace.persona = persona;
  const movementCategory = resolveMovementCategory(meta);
  trace.movementCategory = movementCategory;
  const movementId = typeof meta.movementId === 'string' ? meta.movementId : '';
  trace.movementId = movementId;

  const formCue = composeFormCue({
    movementId,
    movementCategory,
    persona,
    tier: tier ?? CALIBRATION_TIERS.T0,
  });
  trace.formCue = formCue;

  // Cluster B1 + B6 + B8 — Tempo prescription (notation + preSet + reactive + timing)
  const tempoPrescription = composeTempoPrescription({
    periodizationPhase:        meta.periodizationPhase,
    energyDirection:            meta.energyDirection,
    cueText:                    formCue.cueText,
    persona,
    userInitiatedTapToExpand:   meta.userInitiatedTapToExpand,
    postSetFeedbackContext:     meta.postSetFeedbackContext,
  });
  trace.tempoPrescription = tempoPrescription;

  // Cluster C5 + C7 + C15 + C17 — Mind-muscle state (active + suppression +
  // acquisition + deload override Q12=D)
  const mindMuscleState = composeMindMuscleState({
    tier:                       tier ?? CALIBRATION_TIERS.T0,
    movementId,
    userKnowToggleMovements:    meta.userKnowToggleMovements,
    recentSessionsForMovement:  recentSessions,
    deloadOverrideActive:       deloadUnlock.unlocked,
  });
  trace.mindMuscleState = mindMuscleState;
  if (mindMuscleState.suppressedForMovement) signals.push('mind_muscle_suppressed_for_movement');
  if (mindMuscleState.acquiredImplicit) signals.push('mind_muscle_acquired_implicit_n_10_q9_d');
  if (mindMuscleState.acquiredExplicit) signals.push('mind_muscle_acquired_explicit_user_toggle_stiu_q9');

  // Cluster A1 — Hook reference Convergence Guard cross-cutting (NU duplicate
  // logic in Tempo, ADR 009 §AMENDMENT canonical SSOT — pattern §9.4 Bayesian).
  const convergenceGuardRef = getConvergenceGuardReference();
  trace.convergenceGuardRef = convergenceGuardRef;

  // Hook Forward Constraint Object pass-through immutable per §1.10 anti-cascade
  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);
  trace.forwardedConstraint = forwardedConstraint !== null;

  /** @type {import('./types.js').TempoBlueprint} */
  const blueprint = {
    tempo_prescription:    tempoPrescription,
    form_cue:              formCue,
    mind_muscle_active:    mindMuscleState.active && !mindMuscleState.suppressedForMovement,
    cue_delivery_timing:   tempoPrescription.timing,
    signals:               signals.slice(),
    mind_muscle_state:     mindMuscleState,
  };

  const confidence = computeConfidence({
    hasPeriodizationConstraint: periodizationConstraint !== null,
    hasMovementContext:         movementId.length > 0,
    hasTierResolved:            tier !== null,
  });

  // Tier semantic per ADR 018 §2 enum: 'none' / 'LOW' / 'MED' / 'HIGH'.
  // V1 default 'MED' when computed; 'none' when ctx empty (no tier + no
  // periodization constraint + no movement context).
  const tierResult = (tier === null && periodizationConstraint === null && movementId.length === 0)
    ? 'none'
    : 'MED';

  return {
    id:               ENGINE_ID,
    tier:             tierResult,
    confidence,
    signals,
    recommendations:  [], // V1 empty — orchestrator-level concern per ADR 030 D2 thin scope
    trace,
    meta:             blueprint,
  };
}
