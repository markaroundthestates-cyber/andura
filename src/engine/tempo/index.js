// Engine Tempo V1 — public API per ADR 026 §9.5 + ADR 018 §2.
//
// Pipeline §42.10 position 5th canonical:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6)
//   → Warm-up (§9.7) → Deload (§9.8).
//
// Legacy "Engine #6" naming în [[028-engine-tempo-form-cues|ADR 028]] = chat
// strategic spec session ordering (3-engine cluster #5+#6+#7 spec session
// 2026-05-05 birou late) NU pipeline canonical position. §9.5 SSOT clarifies
// position 5th.
//
// Pure function `evaluate(ctx) → TempoResult` total + deterministic
// + async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Output blueprint per Cluster A verbatim:
//   - tempo_prescription (Cluster B Q1=C + Q2=C + Q3 + Q6=D)
//   - form_cue (Cluster B + D persona-aware tone Q18=D)
//   - mind_muscle_active (Cluster C5 tier T0 OFF / T1+ active Q5=C)
//   - cue_delivery_timing (Cluster B8 PRE_SET / POST_SET only NU INTRA_SET Q8=D)
//   - signals (cross-engine + tier + adaptive frequency emit)
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.5
// (commit a9b7cbd LANDED 2026-05-06 afternoon chat-6 acasă, 28-30 decisions
// Cluster A-E verbatim).

import {
  computeTempoPrescription,
  resolveCueDeliveryTiming,
  notationStyleForPersona,
} from './tempoPrescription.js';
import { computeFormCue } from './formCues.js';
import {
  resolveTier,
  evaluateMindMuscleSuppression,
} from './mindMuscle.js';
import {
  readPeriodizationCorridor,
  evaluateFormConservativeAmplification,
  isDeloadWeekUnlock,
  evaluateSlowEccentricSignal,
  evaluateRirAutoBumpSignal,
  evaluateRirMismatchTelemetry,
  forwardConstraintObject,
} from './crossEngineHooks.js';
import { PERSONA } from './constants.js';

export const ENGINE_ID = 'tempo';

/**
 * Compute confidence level based on ctx data completeness.
 *
 * @param {Object} input
 * @param {boolean} input.hasMovement
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasPersona
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({ hasMovement, hasPeriodizationConstraint, hasPersona }) {
  let score = 0;
  if (hasMovement) score += 1;
  if (hasPeriodizationConstraint) score += 1;
  if (hasPersona) score += 1;
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

/**
 * Resolve persona id from ctx (case-insensitive normalize).
 *
 * @param {Object} [ctx]
 * @returns {import('./types.js').Persona|null}
 */
function resolvePersona(ctx) {
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const user = safeCtx.user && typeof safeCtx.user === 'object' ? safeCtx.user : {};
  if (typeof user.persona === 'string') {
    const p = user.persona.toLowerCase();
    if (p === PERSONA.MARIA || p === PERSONA.GIGICA || p === PERSONA.MARIUS) return p;
  }
  return null;
}

/**
 * Evaluate Tempo Engine per ADR 026 §9.5 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid TempoResult
 * cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 4 fields + signals (Cluster A verbatim):
 *   1. tempo_prescription (notation + display_text + reactive_expand_available)
 *   2. form_cue (text + notation_style + tone + optional rationale + suggested_fix)
 *   3. mind_muscle_active (boolean tier-aware Cluster C5)
 *   4. cue_delivery_timing (PRE_SET / POST_SET / MID_REST — NU INTRA_SET Q8=D)
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').TempoResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};
  const recentSessionsForMovement = Array.isArray(meta.recentSessionsForMovement)
    ? meta.recentSessionsForMovement : [];

  // Persona + tier resolution
  const persona = resolvePersona(safeCtx);
  const tier = resolveTier(safeCtx);
  trace.persona = persona;
  trace.tier = tier;

  // Periodization Constraint Object Hook 1 (consumed read-only frozen)
  const periodizationConstraint = meta.periodizationConstraint || null;
  const corridorRead = readPeriodizationCorridor(periodizationConstraint);
  trace.periodizationCorridorRead = corridorRead;

  // Cluster D11 — Form-conservative amplification (Periodization high intensity)
  const formConservativeSignal = evaluateFormConservativeAmplification(corridorRead.phase);
  trace.formConservativeSignal = formConservativeSignal;
  if (formConservativeSignal.amplified) {
    signals.push('tempo_form_conservative_amplification_high_intensity');
  }

  // Cluster D12 — Deload week mind-muscle unlock
  const deloadWeekUnlock = isDeloadWeekUnlock(corridorRead.phase);
  trace.deloadWeekUnlock = deloadWeekUnlock;
  if (deloadWeekUnlock) signals.push('mind_muscle_unlock_deload');

  // Cluster D13 — Energy DOWN slow eccentric universal (NU ROM partial Q13=B)
  const slowEccentricSignal = evaluateSlowEccentricSignal(meta.energyDirection);
  trace.slowEccentricSignal = slowEccentricSignal;
  if (slowEccentricSignal.active) signals.push('energy_down_slow_eccentric_universal');

  // Cluster B — Tempo prescription (Q1=C hibrid pre-set + reactive Q6=D 💡)
  const movementId = typeof meta.movementId === 'string' ? meta.movementId : '';
  const tempoPrescription = computeTempoPrescription({
    movementId,
    persona,
    periodizationPhase: corridorRead.phase,
  });
  trace.tempoPrescription = tempoPrescription;

  // Cluster D14 — RIR Matrix form breakdown user toggle → +1 auto-bump
  const rirAutoBumpSignal = evaluateRirAutoBumpSignal({
    formBreakdownReported: meta.formBreakdownReported === true,
  });
  trace.rirAutoBumpSignal = rirAutoBumpSignal;
  if (rirAutoBumpSignal.bump_next_set) signals.push('rir_auto_bump_form_breakdown_plus_1');

  // Cluster B4 — RIR mismatch silent telemetry V1 (Q4=A NU active trigger)
  const rirMismatchTelemetry = evaluateRirMismatchTelemetry({
    rirActual:   meta.rirActual,
    rirExpected: meta.rirExpected,
  });
  trace.rirMismatchTelemetry = rirMismatchTelemetry;
  if (rirMismatchTelemetry.mismatchDetected) {
    signals.push('rir_mismatch_silent_telemetry_only_v1');
  }

  // Cluster C — Mind-muscle suppression decision (tier gate + adaptive freq + suppression mode)
  const mmSuppression = evaluateMindMuscleSuppression({
    tier,
    deloadWeekUnlock,
    userToggleAcquired:        meta.userToggleAcquired === true,
    recentSessionsForMovement,
  });
  trace.mmSuppression = mmSuppression;
  if (mmSuppression.acquiredVia) {
    signals.push(`adaptive_frequency_acquired_${mmSuppression.acquiredVia}`);
  }
  if (!mmSuppression.cueShouldSurface) {
    signals.push(`cue_suppressed_${mmSuppression.suppressionMode.toLowerCase()}`);
  }

  // Form cue (Cluster B + D persona-aware tone Q18=D)
  const notationStyle = notationStyleForPersona(persona);
  const formCue = computeFormCue({
    movementId,
    persona,
    tier,
    notationStyle,
  });
  trace.formCue = formCue;

  // Cue delivery timing (Cluster B8 Q8=D — NU INTRA_SET)
  const cueDeliveryTiming = resolveCueDeliveryTiming({
    postSetContext:      meta.postSetContext === true,
    userInitiatedExpand: meta.userInitiatedExpand === true,
  });
  trace.cueDeliveryTiming = cueDeliveryTiming;

  // Hook Forward Constraint Object pass-through immutable
  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);
  trace.forwardedConstraint = forwardedConstraint !== null;

  /** @type {import('./types.js').TempoBlueprint} */
  const blueprint = {
    tempo_prescription:    tempoPrescription,
    form_cue:              formCue,
    mind_muscle_active:    mmSuppression.mindMuscleActive,
    cue_delivery_timing:   cueDeliveryTiming,
    signals:               signals.slice(),
  };

  const confidence = computeConfidence({
    hasMovement:                 movementId.length > 0,
    hasPeriodizationConstraint:  periodizationConstraint !== null,
    hasPersona:                  persona !== null,
  });

  // Tier semantic per ADR 018 §2 enum: 'none' / 'LOW' / 'MED' / 'HIGH'
  // V1 default 'MED' when computed; 'none' when ctx empty (no movement + no persona)
  const tierResult = (movementId.length === 0 && persona === null) ? 'none' : 'MED';

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
