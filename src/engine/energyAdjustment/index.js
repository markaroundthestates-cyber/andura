// Engine Energy Adjustment V1 — public API per ADR 026 §9.3 + ADR 018 §2.
//
// Pipeline §42.10 position 3rd canonical:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian (§9.4) → Tempo (§9.5) → Specialization (§9.6) → Warm-up (§9.7)
//   → Deload (§9.8).
//
// Legacy "Engine #5" naming in [[027-engine-energy-adjustment|ADR 027]] =
// chat strategic spec session ordering NU pipeline canonical position.
// §9.3 SSOT canonical clarifies position 3rd.
//
// Pure function `evaluate(ctx) → EnergyAdjustmentResult` total + deterministic
// + async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.3
// (commit 2f9aa79 LANDED 2026-05-06 afternoon chat-4 acasa, 26-28 decisions
// Cluster 1-5 verbatim).

import {
  resolveEmojiState,
  resolveDrillDownCause,
  aggregateEmojiInputs,
  requiresDrillDown,
} from './emojiAggregation.js';
import {
  resolveCalibrationTier,
  computeAdjustmentDirection,
} from './bidirectionalAdjustment.js';
import { applyYoyoSuppression } from './yoyoAntiFlap.js';
import {
  readPeriodizationCorridor,
  applyIntensityAdjustmentInterior,
  applyVolumeAdjustmentInterior,
  emitDeloadTrigger,
  emitBayesianVarianceModifier,
  forwardConstraintObject,
} from './crossEngineHooks.js';
import { evaluateMedicalReferralBanner } from './medicalReferral.js';
import { ADJUSTMENT_DIRECTION } from './constants.js';

export const ENGINE_ID = 'energyAdjustment';

/**
 * Compute confidence level based on ctx data completeness.
 *
 * @param {Object} input
 * @param {boolean} input.hasEmoji
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasRecentSessions
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({ hasEmoji, hasPeriodizationConstraint, hasRecentSessions }) {
  let score = 0;
  if (hasEmoji) score += 1;
  if (hasPeriodizationConstraint) score += 1;
  if (hasRecentSessions) score += 1;
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

/**
 * Evaluate Energy Adjustment Engine per ADR 026 §9.3 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid
 * EnergyAdjustmentResult cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 6 fields verbatim §9.3.1 Cluster 1:
 *   1. energy_state              - emoji 🟢🟡🔴 holistic
 *   2. adjustment_direction      - UP / DOWN / NONE
 *   3. adjustment_magnitude_pct  - Float in [-0.15, +0.15] tier-aware
 *   4. volume_intensity_scope    - {volume: bool, intensity: bool} selective
 *   5. forward_constraint_object - Periodization corridor pass-through frozen
 *   6. signals                   - mirror DimensionResult.signals
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').EnergyAdjustmentResult>}
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

  // Periodization Constraint Object Hook 1 (consumed read-only frozen)
  const periodizationConstraint = meta.periodizationConstraint || null;
  const corridorRead = readPeriodizationCorridor(periodizationConstraint);
  trace.periodizationCorridorRead = corridorRead;

  // Cluster 2 — Input Strategy & Aggregation
  // Engine reads emoji + drill-down from user-level ctx (manual input only V1)
  const emoji = resolveEmojiState(user) ?? resolveEmojiState(meta);
  const drillDownCause = resolveDrillDownCause(user) ?? resolveDrillDownCause(meta);
  const aggregationSignal = aggregateEmojiInputs({ emoji, drillDownCause });
  trace.emoji = emoji;
  trace.aggregationSignal = aggregationSignal;
  if (emoji) signals.push(`energy_emoji_${emoji}`);
  if (requiresDrillDown(emoji)) {
    signals.push('drill_down_required_red_distressed');
    if (drillDownCause) signals.push(`drill_down_cause_${drillDownCause}`);
  }

  // Cluster 3 — Adjustment Dimensions & Bidirectional ±15% asymmetric
  const tier = resolveCalibrationTier(safeCtx);
  trace.tier = tier;
  const stagnationDetected = meta.stagnationDetected === true;
  const adjustmentDecision = computeAdjustmentDirection({
    aggregationSignal,
    recentSessions,
    periodizationPhase: corridorRead.phase,
    tier,
    stagnationDetected,
  });
  trace.adjustmentDecision = adjustmentDecision;
  for (const reason of adjustmentDecision.gatingReasons) signals.push(reason);

  // Cluster 4 — Yo-yo anti-flap 3-session window V1 only Q14=D
  const recentDirections = Array.isArray(meta.recentAdjustmentDirections)
    ? meta.recentAdjustmentDirections
    : [];
  const yoyoState = applyYoyoSuppression({
    incomingDirection: adjustmentDecision.direction,
    recentDirections,
  });
  trace.yoyoState = yoyoState;
  if (yoyoState.suppressed) signals.push('yoyo_3_session_anti_flap_suppressed');

  // Effective direction post-yoyo suppression
  const effectiveDirection = yoyoState.suppressed
    ? (yoyoState.heldDirection ?? ADJUSTMENT_DIRECTION.NONE)
    : adjustmentDecision.direction;
  // Effective magnitude — when suppressed, hold preceding direction at NONE-magnitude
  // (the held direction is informational; the engine doesn't re-apply prior magnitude)
  const effectiveMagnitudePct = yoyoState.suppressed
    ? 0
    : adjustmentDecision.magnitudePct;

  // Cluster 4 — Bayesian σ variance modifier Hook 3
  const bayesianSigma = Number(meta.bayesianSigma);
  const bayesianSignal = emitBayesianVarianceModifier({
    adjustmentMagnitudePct: effectiveMagnitudePct,
    bayesianSigma,
  });
  trace.bayesianSignal = bayesianSignal;
  if (bayesianSignal.dampeningApplied) signals.push('bayesian_sigma_dampening_applied');

  const finalMagnitudePct = bayesianSignal.adjustmentMagnitudePostDampening;

  // Cluster 4 — Apply adjustment INTERIOR Periodization corridor (anti-cascade)
  const adjustedIntensityCorridor = applyIntensityAdjustmentInterior({
    intensityCorridor:      corridorRead.intensityCorridor,
    adjustmentMagnitudePct: finalMagnitudePct,
  });
  const adjustedVolumeCorridor = applyVolumeAdjustmentInterior({
    volumeCorridor:         corridorRead.volumeCorridor,
    adjustmentMagnitudePct: finalMagnitudePct,
  });
  trace.adjustedIntensityCorridor = adjustedIntensityCorridor;
  trace.adjustedVolumeCorridor = adjustedVolumeCorridor;

  // Cluster 4 — Soft override sub-Floor Hook 2 cross-engine Engine Deload trigger
  const currentSessionSubFloor = meta.currentSessionSubFloor === true;
  const deloadTriggerSignal = emitDeloadTrigger({
    recentSessions,
    currentSessionSubFloor,
  });
  trace.deloadTriggerSignal = deloadTriggerSignal;
  if (deloadTriggerSignal.escalationTriggered) {
    signals.push('deload_escalation_triggered_sub_floor_3rd_session');
  }

  // Cluster 5 — Medical referral banner per safety/compliance trigger
  const compositeLowSignals = meta.compositeLowSignals === true;
  const referralBanner = evaluateMedicalReferralBanner({
    deloadEscalationTriggered: deloadTriggerSignal.escalationTriggered,
    compositeLowSignals,
  });
  trace.referralBanner = referralBanner;
  if (referralBanner.shouldSurface) signals.push('medical_referral_banner_surfaced');

  // Hook 4 — Forward Constraint Object pass-through immutable downstream
  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);

  // Selective scope per Q33 §45.5 reuse — V1 always volume + intensity both
  // (Q33 LOCKED — Goal Adaptation owns rep range + rest time scope §9.2.4)
  const volumeIntensityScope = Object.freeze({ volume: true, intensity: true });

  /** @type {import('./types.js').EnergyAdjustmentBlueprint} */
  const blueprint = {
    energy_state:              emoji,
    adjustment_direction:      effectiveDirection,
    adjustment_magnitude_pct:  finalMagnitudePct,
    volume_intensity_scope:    volumeIntensityScope,
    forward_constraint_object: forwardedConstraint,
    signals:                   signals.slice(),
  };

  const confidence = computeConfidence({
    hasEmoji:                    emoji !== null,
    hasPeriodizationConstraint:  periodizationConstraint !== null,
    hasRecentSessions:           recentSessions.length > 0,
  });

  // Tier semantic per ADR 018 §2 enum: 'none' / 'LOW' / 'MED' / 'HIGH'
  // V1 default 'MED' when emoji present; 'none' when ctx empty (no signal)
  const tierResult = emoji === null ? 'none' : 'MED';

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
