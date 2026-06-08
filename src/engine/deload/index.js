// Engine Deload V1 — public API per ADR 026 §9.8 + ADR 018 §2.
//
// Pipeline §42.10 position 8th canonical FINAL prescriptive engine:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6)
//   → Warm-up (§9.7) → **Deload (§9.8)** ← TERMINAL.
//
// **Engine numbering clarification:** Source 1 references "Engine #4 Deload
// Protocol" = chat strategic spec session ordering legacy 2026-05-05 birou
// after (3-engine cluster #3+#4+#5 spec session — Bayesian + Deload + Energy
// grouped) NU pipeline §42.10 canonical position. Pipeline order canonical =
// sequential gate flow upstream → midstream → **Deload terminal final**.
//
// Pure function `evaluate(ctx) → DeloadResult` total + deterministic +
// async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Output blueprint per Cluster A1+C1 verbatim emit (lives in DeloadResult.meta):
//   1. deload_state         — IDLE / SCHEDULED_LINEAR / REACTIVE_COMPOSITE / REACTIVE_AA / EXTENSION_FLAGGED / RESOLVING
//   2. depth_pct            — Final_Depth formula MAX(45/60/30) + Behavioral_Modifiers
//   3. duration_weeks       — 1 scheduled / 1-2 reactive adaptive
//   4. intensity_modifier   — { rir_increment: 1, intensity_pct_decrement: 12.5 } obligatoriu
//   5. partial_scope        — null full-body / muscle group list per-muscle MRV
//   6. notification_tier    — silent T0 / banner_detailed T1+
//   7. wording              — RO native per trigger source
//   8. ui_label             — RO native "Saptamana de recuperare X sapt"
//   9. signals              — human-readable IDs + trigger source attribution
//
// **Pipeline §42.10 CLOSURE FINAL 8/8 V1 prescriptive engines complete** post
// Engine Deload V1 LANDED.
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task (featureFlag
// `<engine>_via_orchestrator` rollout 0% default OFF + Golden-master parity tests).
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.8
// (commit d7594e7 LANDED 2026-05-06 evening chat-8 acasa, 32 decisions
// Cluster A-E 4-way parity check ✅).

import {
  detectCompositeTrigger,
  detectAATrigger,
  detectLinearTrigger,
  detectEarlySafetyTrigger,
  resolveTriggerHierarchy,
  isCompositeHardDisabled,
  isEnergyDownSustained,
} from './triggerHierarchy.js';
import {
  computeFinalDepth,
  applyGoalPhaseModulation,
  resolveIntensityModifier,
} from './depthCalculator.js';
import {
  computeDuration,
  evaluateExtension,
  applyHardResetLinear,
} from './durationManager.js';
import {
  resolvePartialScope,
} from './partialScopeResolver.js';
import {
  consumeFrozenConstraint,
  consumeGoalPhase,
  consumeEnergyReadiness,
  consumeBayesianPainAware,
  consumeSpecializationActive,
  forwardWarmupLighterSignal,
  forwardConstraintObject,
  getConvergenceGuardReference,
} from './crossEngineHooks.js';
import {
  CALIBRATION_TIERS,
  DELOAD_STATE,
  TRIGGER_SOURCE,
  NOTIFICATION_TIER,
  WORDING_RO,
  buildUiLabel,
  SCHEMA_CONSTANTS,
} from './constants.js';

export const ENGINE_ID = 'deload';

/**
 * Compute confidence level per ctx data completeness signals.
 *
 * @param {Object} input
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasTierResolved
 * @param {boolean} input.hasTriggerSignal
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({
  hasPeriodizationConstraint,
  hasTierResolved,
  hasTriggerSignal,
}) {
  let score = 0;
  if (hasPeriodizationConstraint) score += 1;
  if (hasTierResolved) score += 1;
  if (hasTriggerSignal) score += 1;
  if (score >= 3) return 'high';
  if (score >= SCHEMA_CONSTANTS.confidenceMediumFloor) return 'medium';
  return 'low';
}

/**
 * Resolve calibration tier from ctx — defensive normalization per ADR 009 +
 * §9.8.3 Cluster C2 verbatim.
 *
 * @param {Object} [ctx]
 * @returns {string|null}
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
 * Resolve notification tier per Cluster C2 verbatim.
 *
 * T0 cold start: silent (CDL log only, NU UI banner anti-friction)
 * T1+ established: banner_detailed (UX explainer per trigger source)
 *
 * @param {string|null} tier
 * @returns {import('./types.js').NotificationTier}
 */
function resolveNotificationTier(tier) {
  if (tier === CALIBRATION_TIERS.T1 || tier === CALIBRATION_TIERS.T2) {
    return NOTIFICATION_TIER.BANNER_DETAILED;
  }
  return NOTIFICATION_TIER.SILENT;
}

/**
 * Resolve wording per trigger source per Cluster C5 verbatim.
 *
 * @param {string} primaryTriggerSource
 * @param {string} deloadState
 * @returns {string}
 */
function resolveWording(primaryTriggerSource, deloadState) {
  if (deloadState === DELOAD_STATE.IDLE) return WORDING_RO.idle;
  if (deloadState === DELOAD_STATE.RESOLVING) return WORDING_RO.resolving;
  if (deloadState === DELOAD_STATE.EXTENSION_FLAGGED) return WORDING_RO.extension;

  switch (primaryTriggerSource) {
    case TRIGGER_SOURCE.LINEAR:    return WORDING_RO.linear;
    case TRIGGER_SOURCE.COMPOSITE: return WORDING_RO.composite;
    case TRIGGER_SOURCE.AA:        return WORDING_RO.aa;
    case TRIGGER_SOURCE.ENERGY:    return WORDING_RO.energy;
    default:                       return WORDING_RO.idle;
  }
}

/**
 * Build empty/idle blueprint per Cluster A1+C1 9-field emit verbatim.
 * Used pentru insufficient ctx fallback OR IDLE state.
 *
 * @param {string} state
 * @returns {import('./types.js').DeloadBlueprint}
 */
function buildIdleBlueprint(state = DELOAD_STATE.IDLE) {
  return {
    deload_state:         state,
    depth_pct:            0,
    duration_weeks:       0,
    intensity_modifier:   Object.freeze({
      rir_increment:           0,
      intensity_pct_decrement: 0,
    }),
    partial_scope:        null,
    notification_tier:    NOTIFICATION_TIER.SILENT,
    wording:              WORDING_RO.idle,
    ui_label:             '',
    signals:              [],
  };
}

/**
 * Evaluate Engine Deload Protocol per ADR 026 §9.8 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid DeloadResult
 * cu tier 'none', confidence 'low', signals empty, IDLE state baseline.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 9 fields (Cluster A1+C1 verbatim emit):
 *   1. deload_state     2. depth_pct          3. duration_weeks
 *   4. intensity_modifier  5. partial_scope   6. notification_tier
 *   7. wording          8. ui_label           9. signals
 *
 * Tier semantic:
 *   'HIGH' = REACTIVE_COMPOSITE | REACTIVE_AA | EXTENSION_FLAGGED (active reactive)
 *   'MED'  = SCHEDULED_LINEAR | RESOLVING (scheduled OR transition)
 *   'LOW'  = IDLE (no deload active)
 *   'none' = insufficient ctx default fallback
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').DeloadResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics per ADR 018 §2.
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};
  const recentSessionsForEnergy = Array.isArray(meta.recentSessionsForEnergy)
    ? meta.recentSessionsForEnergy
    : [];

  // Cluster A — Tier resolution per ADR 009 + §9.8.3 verbatim
  const tier = resolveTier(safeCtx);
  trace.tier = tier;

  // Hook D1 — Periodization Constraint Object frozen consumed read-only
  const periodizationConstraint = meta.periodizationConstraint || null;
  const periodizationFrozen = consumeFrozenConstraint(periodizationConstraint);
  trace.periodizationFrozen = periodizationFrozen;

  // Hook D2 — Goal Adaptation phase context light coupling
  const goalPhase = typeof meta.goalPhase === 'string' ? meta.goalPhase.toUpperCase() : null;
  const goalPhaseSignal = consumeGoalPhase(goalPhase);
  trace.goalPhaseSignal = goalPhaseSignal;

  // Hook D3 — Energy Adjustment readiness state
  const energyDirection = typeof meta.energyDirection === 'string' ? meta.energyDirection : null;
  const energySignal = consumeEnergyReadiness({
    energyDirection,
    recentSessionsForEnergy,
  });
  trace.energySignal = energySignal;

  // Energy DOWN sustained 3+ consecutive cu fallback to recentSessionsForEnergy check
  const energyDownSustained = energySignal.sustainedThresholdMet
    || isEnergyDownSustained(recentSessionsForEnergy);

  // F6a #32 dip-classifier suppression (LIFE_DIP): when the builder's
  // classifyPerformanceDip resolves the dip cause as a LIFESTYLE patch (low
  // accumulated volume + bad sleep / missed days / under-eating, NOT training
  // fatigue), it sets meta.suppressReactiveDeload so a full REACTIVE deload does
  // NOT fire — hold steady, no panic (spec §5b). It NEVER suppresses a SCHEDULED
  // (calendar) deload nor a composite 3/3 — only the reactive AA cause the
  // life-dip would otherwise over-trigger. Inert by default (undefined → false),
  // and the ACWR-HIGH-forces-FATIGUE guard upstream means a truly fatigued user
  // is never suppressed here. Default-OFF flag → builder never sets it.
  const suppressReactiveDeload = meta.suppressReactiveDeload === true;
  if (suppressReactiveDeload) {
    signals.push('deload_reactive_suppressed_life_dip_f6a_32_lifestyle_not_training_fatigue');
  }

  // Hook D4 — Bayesian σ + Pain-Aware reference-only
  const bayesianPainAwareRef = consumeBayesianPainAware({
    sigmaHighFlag:                meta.sigmaHighFlag,
    painAwareSessionsCountFlag:   meta.painAwareSessionsCountFlag,
  });
  trace.bayesianPainAwareRef = bayesianPainAwareRef;

  // Convergence Guard reference (NU duplicate logic — pattern §9.4-§9.7 precedent)
  const convergenceGuardRef = getConvergenceGuardReference();
  trace.convergenceGuardRef = convergenceGuardRef;

  // ── Trigger detection per Cluster B1+B2+B3+B13 ──────────────────────────

  const composite = detectCompositeTrigger({
    performanceDropPct:  meta.performanceDropPct,
    restTimeMultiplier:  meta.restTimeMultiplier,
    rirMismatch:         meta.rirMismatch,
  });
  trace.compositeTrigger = composite;

  const aa = detectAATrigger({
    // F6a #32 LIFE_DIP suppression zeroes the REACTIVE-AA candidates (energy-down
    // sustained + the #26 drift candidate aaMarkerDirectActive) — a lifestyle dip
    // is not training fatigue, so do not deload. Composite + Linear are untouched.
    aaDetectionActive:    suppressReactiveDeload ? false : meta.aaDetectionActive,
    energyDownSustained:  suppressReactiveDeload ? false : energyDownSustained,
    aaMarkerDirectActive: suppressReactiveDeload ? false : meta.aaMarkerDirectActive,
  });
  trace.aaTrigger = aa;

  const linear = detectLinearTrigger({
    periodizationPhase:    periodizationFrozen.phase,
    deloadWindowTrigger:   periodizationFrozen.deloadWindowTrigger,
  });
  trace.linearTrigger = linear;

  const earlySafety = detectEarlySafetyTrigger(periodizationFrozen.deloadWindowTrigger);
  trace.earlySafetyTrigger = earlySafety;

  // Cluster B2 — Resolve trigger hierarchy (Composite > AA > Linear priority)
  const triggerDecision = resolveTriggerHierarchy({
    composite,
    aa,
    linear,
    earlySafety,
    extensionEvaluating: meta.extensionEvaluating,
  });
  trace.triggerDecision = triggerDecision;

  if (triggerDecision.primarySource !== TRIGGER_SOURCE.NONE) {
    signals.push(`deload_trigger_${triggerDecision.primarySource}_${triggerDecision.resolvedState.toLowerCase()}`);
  }
  if (triggerDecision.sourcesActive.length >= 2) {
    signals.push('deload_multi_signal_consolidation_escalates_severity_additive_b2');
  }

  // Cluster B3 — Composite hard-disabled check
  const compositeHardDisabled = isCompositeHardDisabled(triggerDecision.resolvedState);
  trace.compositeHardDisabled = compositeHardDisabled;
  if (compositeHardDisabled && composite.triggered) {
    signals.push('composite_signal_36_41_hard_disabled_engine_deload_active_b3_anti_math_collision');
  }

  // ── Idle state early return ──────────────────────────────────────────────

  if (triggerDecision.resolvedState === DELOAD_STATE.IDLE) {
    const idleBlueprint = buildIdleBlueprint();
    return {
      id:               ENGINE_ID,
      tier:             (tier === null && goalPhase === null && periodizationConstraint === null)
                          ? 'none'
                          : 'LOW',
      confidence:       computeConfidence({
        hasPeriodizationConstraint: periodizationConstraint !== null,
        hasTierResolved:            tier !== null,
        hasTriggerSignal:           false,
      }),
      signals,
      recommendations:  [],
      trace,
      meta:             idleBlueprint,
    };
  }

  // ── Cluster B5 — Final_Depth computation ─────────────────────────────────

  const depthDecision = computeFinalDepth({
    deloadState:                   triggerDecision.resolvedState,
    sourcesActive:                 triggerDecision.sourcesActive,
    behavioralModifiersInputPct:   meta.behavioralModifiersInputPct,
  });
  trace.depthDecision = depthDecision;

  // Cluster D2 — Goal phase modulation light coupling
  const goalPhaseAdjusted = applyGoalPhaseModulation({
    baseDepthPct:  depthDecision.finalDepthPct,
    goalPhase,
    deloadState:   triggerDecision.resolvedState,
  });
  trace.goalPhaseAdjusted = goalPhaseAdjusted;
  const finalDepthPct = goalPhaseAdjusted.adjustedDepthPct;

  if (depthDecision.extensionDepthClamped) {
    signals.push('deload_extension_depth_60_atrophy_literature_limit_b9_schoenfeld_helms');
  }

  // ── Cluster B4 — Intensity modifier obligatoriu ──────────────────────────

  const intensityModifier = resolveIntensityModifier(triggerDecision.resolvedState);
  trace.intensityModifier = intensityModifier;
  signals.push('deload_aa_driven_volume_cut_30_rir_up_intensity_down_b4_obligatoriu');

  // ── Cluster B6+B7+B8 — Duration + Hard Reset + Extension ─────────────────

  const durationDecision = computeDuration({
    deloadState:        triggerDecision.resolvedState,
    flaggedStillActive: meta.flaggedStillActive,
  });
  trace.durationDecision = durationDecision;

  if (durationDecision.hardResetLinearApplied) {
    signals.push('deload_hard_reset_linear_block_week_1_new_post_deload_b7_anti_back_to_back_week_5');
  }

  // Optionally evaluate extension explicitly when at end-of-Week-1 boundary
  if (typeof meta.weekActiveCount === 'number' && meta.weekActiveCount === 1) {
    const extEval = evaluateExtension({
      weekActiveCount:        meta.weekActiveCount,
      flaggedStillActive:     meta.flaggedStillActive,
      cooldownStateActive:    meta.cooldownStateActive,
      resolvingStateActive:   meta.resolvingStateActive,
    });
    trace.extensionEvaluation = extEval;
    if (extEval.extensionGranted) {
      signals.push('deload_extension_week_2_granted_flagged_state_still_active_b8');
    }
  }

  // Apply Hard Reset Linear Block counter signal (informational — orchestrator applies)
  const hardResetLinear = applyHardResetLinear({
    reactiveTriggered:  triggerDecision.resolvedState === DELOAD_STATE.REACTIVE_COMPOSITE
                          || triggerDecision.resolvedState === DELOAD_STATE.REACTIVE_AA,
    currentMesoWeek:    meta.currentMesoWeek,
  });
  trace.hardResetLinear = hardResetLinear;

  // ── Cluster B10 — Partial scope resolution ───────────────────────────────

  const partialScopeDecision = resolvePartialScope({
    primaryTriggerSource:   triggerDecision.primarySource,
    affectedMuscleGroups:   meta.affectedMuscleGroupsMrvExceeded,
    mrvExceededAlone:       meta.mrvExceededAlone,
  });
  trace.partialScopeDecision = partialScopeDecision;

  if (partialScopeDecision.perMuscleMrvAlone) {
    signals.push('deload_partial_scope_per_muscle_mrv_alone_b10_9_1_cluster_3_israetel');
  } else if (partialScopeDecision.fullBodySystemic) {
    signals.push('deload_full_body_sistemic_cross_muscular_signal_b10');
  }

  // ── Hook D5 — Specialization suspended ──────────────────────────────────

  const specializationSuspend = consumeSpecializationActive({
    specializationActive: meta.specializationActive,
    deloadState:          triggerDecision.resolvedState,
  });
  trace.specializationSuspend = specializationSuspend;
  if (specializationSuspend.suspended) {
    signals.push('specialization_suspended_q12_a_non_negotiable_d5_freeze_resume_post_deload');
  }

  // ── Hook D6 — Warm-up DELOAD_LIGHTER signal forward ─────────────────────

  const warmupLighterSignal = forwardWarmupLighterSignal(triggerDecision.resolvedState);
  trace.warmupLighterSignal = warmupLighterSignal;
  if (warmupLighterSignal.emit) {
    signals.push('warmup_deload_lighter_state_signal_d6_next_session_lookahead_light_coupling');
  }

  // ── Hook D7 — Forward Constraint Object pass-through (terminal V1) ──────

  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);
  trace.forwardedConstraint = forwardedConstraint; // null V1 (terminal)

  // ── Cluster C2 — Notification tier resolve ──────────────────────────────

  const notificationTier = resolveNotificationTier(tier);
  trace.notificationTier = notificationTier;

  // ── Cluster C5 — Wording RO native specific per trigger source ──────────

  const wording = resolveWording(triggerDecision.primarySource, triggerDecision.resolvedState);
  trace.wording = wording;

  // ── Cluster A1+C1 — Build blueprint 9-field emit ────────────────────────

  /** @type {import('./types.js').DeloadBlueprint} */
  const blueprint = {
    deload_state:        triggerDecision.resolvedState,
    depth_pct:           finalDepthPct,
    duration_weeks:      durationDecision.durationWeeks,
    intensity_modifier:  intensityModifier,
    partial_scope:       partialScopeDecision.affectedMuscleGroups,
    notification_tier:   notificationTier,
    wording,
    ui_label:            buildUiLabel(durationDecision.durationWeeks, triggerDecision.resolvedState),
    signals:             signals.slice(),
  };

  // Tier semantic per blueprint state mapping
  let tierResult;
  if (triggerDecision.resolvedState === DELOAD_STATE.REACTIVE_COMPOSITE
      || triggerDecision.resolvedState === DELOAD_STATE.REACTIVE_AA
      || triggerDecision.resolvedState === DELOAD_STATE.EXTENSION_FLAGGED) {
    tierResult = 'HIGH';
  } else if (triggerDecision.resolvedState === DELOAD_STATE.SCHEDULED_LINEAR
             || triggerDecision.resolvedState === DELOAD_STATE.RESOLVING) {
    tierResult = 'MED';
  } else {
    tierResult = 'LOW';
  }

  return {
    id:               ENGINE_ID,
    tier:             tierResult,
    confidence:       computeConfidence({
      hasPeriodizationConstraint: periodizationConstraint !== null,
      hasTierResolved:            tier !== null,
      hasTriggerSignal:           true,
    }),
    signals,
    recommendations:  [], // V1 empty — orchestrator-level concern per ADR 030 D2 thin scope
    trace,
    meta:             blueprint,
  };
}
