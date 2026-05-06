// Engine Specialization V1 — public API per ADR 026 §9.6 + ADR 018 §2.
//
// Pipeline §42.10 position 6th canonical:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6)
//   → Warm-up (§9.7) → Deload (§9.8).
//
// Pure function `evaluate(ctx) → SpecializationResult` total + deterministic +
// async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// **§36.84 Gap #1 critical scope:** Engine #7 Specialization V1 = wiring
// detector → session builder action layer. ZERO new code engine logic
// detection — reuse `src/engine/weaknessDetector.js` orfan via import (NU
// reimplement 1RM ratio<0.8 logic).
//
// Output blueprint per Cluster A1 verbatim 6-field emit:
//   1. activation_state         — INELIGIBLE_* / PROPOSAL_PENDING / ACTIVE / COMPLETED_EXIT
//   2. target_muscle_group      — Top-1 weak group from weaknessDetector + reconciliation
//   3. mesocycle_progress       — Fixed 4-week exit Q9=A
//   4. volume_modifier          — Hibrid V+F target +30%/+1session, other -25% (Q7=C+Q8=B)
//   5. cooldown_state           — N=12 weeks Q10=B + Q16=A hard reject anti-nagging
//   6. signals                  — human-readable IDs
// + ui_label "Bloc focus [Grupă]" Q17=C RO native
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.6
// (commit 92a69fd LANDED 2026-05-06 afternoon chat-6 acasă, 28 decisions
// Cluster A-E verbatim).
//
// Source 3 NU disponibil: ADR 029 = STUB legacy precedent §9.3 Energy ADR 027
// + §9.5 Tempo ADR 028 stub pattern. 2-way parity only Source 1 ↔ Source 2.

import {
  evaluateEligibility,
} from './activationGating.js';
import {
  buildWeaknessSignal,
  evaluateProposal,
} from './weaknessConsumer.js';
import {
  evaluateCooldown,
} from './cooldownManager.js';
import {
  computeVolumeModifier,
  computeMesocycleProgress,
  buildUiLabel,
} from './applicationStrategy.js';
import {
  emitParallelModifier,
  emitDeloadPreserved,
  emitCutDisable,
  emitInjuryAutoDisable,
  emitLightCoupling,
  getConvergenceGuardReference,
  forwardConstraintObject,
} from './crossEngineHooks.js';
import {
  CALIBRATION_TIERS,
  ACTIVATION_STATE,
  SCHEMA_CONSTANTS,
} from './constants.js';

export const ENGINE_ID = 'specialization';

/**
 * Compute confidence level per ctx data completeness signals.
 *
 * @param {Object} input
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasTierResolved
 * @param {boolean} input.hasWeaknessSignal
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({
  hasPeriodizationConstraint,
  hasTierResolved,
  hasWeaknessSignal,
}) {
  let score = 0;
  if (hasPeriodizationConstraint) score += 1;
  if (hasTierResolved) score += 1;
  if (hasWeaknessSignal) score += 1;
  if (score >= 3) return 'high';
  if (score >= SCHEMA_CONSTANTS.confidenceMediumFloor) return 'medium';
  return 'low';
}

/**
 * Resolve calibration tier from ctx — defensive normalization per ADR 009 +
 * §9.6.1 Cluster A verbatim.
 *
 * @param {Object} [ctx]
 * @returns {string|null} 'T0' | 'T1' | 'T2' or null dacă unresolvable
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
 * Build empty/ineligible blueprint with given activation_state per Cluster A1
 * 6-field emit verbatim. Used pentru early-return paths (gating fails,
 * cooldown blocks, no lagging).
 *
 * @param {string} activationState
 * @param {string|null} [targetGroup]
 * @returns {import('./types.js').SpecializationBlueprint}
 */
function buildIneligibleBlueprint(activationState, targetGroup = null) {
  return {
    activation_state:    activationState,
    target_muscle_group: targetGroup,
    mesocycle_progress: {
      currentWeek: 0,
      totalWeeks:  4,
      exiting:     false,
      rationale:   'specialization_not_active_no_mesocycle_progress',
    },
    volume_modifier: {
      targetGroup:                targetGroup,
      volumeIncreasePct:          0,
      frequencyIncreaseSessions:  0,
      otherGroupsReductionPct:    0,
      mode:                       'hybrid',
      mrvCapRespected:            true,
      rationale:                  `ineligible_${activationState}_no_modifier_emit`,
    },
    ui_label:           buildUiLabel(targetGroup),
    cooldown_state: {
      blocked:         false,
      group:           targetGroup,
      weeksRemaining:  null,
      reason:          'no_cooldown',
      rationale:       'no_cooldown_evaluation_ineligible_path',
    },
    signals: [],
  };
}

/**
 * Evaluate Engine Specialization per ADR 026 §9.6 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid
 * SpecializationResult cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 6 fields (Cluster A1 verbatim emit):
 *   1. activation_state (INELIGIBLE_* / PROPOSAL_PENDING / ACTIVE / COMPLETED_EXIT)
 *   2. target_muscle_group (top-1 weak group post-reconciliation)
 *   3. mesocycle_progress (fixed 4 weeks exit Q9=A)
 *   4. volume_modifier (hybrid V+F target + other -25% Q7=C+Q8=B+Q11=B)
 *   5. cooldown_state (N=12 weeks Q10=B + Q16=A)
 *   6. signals (human-readable IDs)
 * + ui_label "Bloc focus [Grupă]" Q17=C RO native
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').SpecializationResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics per ADR 018 §2.
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};

  // Cluster A — Tier resolution per ADR 009 + §9.6.1 verbatim.
  const tier = resolveTier(safeCtx);
  trace.tier = tier;

  // Hook 1 — Periodization Constraint Object frozen consumed read-only
  const periodizationConstraint = meta.periodizationConstraint || null;
  trace.hasPeriodizationConstraint = periodizationConstraint !== null;

  // Persona resolution per Cluster A Q12 §45.3 LOCKED gate
  const persona = typeof meta.persona === 'string' ? meta.persona.toLowerCase() : null;
  trace.persona = persona;

  // Goal phase resolution per Cluster A Q5+Q13 dual safety gate
  const goalPhase = typeof meta.goalPhase === 'string' ? meta.goalPhase.toUpperCase() : null;
  trace.goalPhase = goalPhase;

  // Cluster B — Build weakness signal (consume weaknessDetector + consensus +
  // reconciliation + Top-1 discipline) — done first to know candidateTargetGroup
  // pentru injury check Q14=A
  const weaknessSignal = buildWeaknessSignal({
    lifetimeLogs:      Array.isArray(meta.lifetimeLogs) ? meta.lifetimeLogs : [],
    recentLogs:        Array.isArray(meta.recentLogs) ? meta.recentLogs : [],
    userOverrideGroup: meta.userOverrideWeakGroup,
  });
  trace.weaknessSignal = weaknessSignal;

  // Cluster A — Activation gating (persona + tier + phase + injury safety)
  const eligibility = evaluateEligibility({
    persona,
    tier,
    goalPhase,
    painButtonActive:       meta.painButtonActive,
    painAffectedGroups:     meta.painAffectedGroups,
    candidateTargetGroup:   weaknessSignal.targetGroup,
  });
  trace.eligibility = eligibility;

  // Cross-engine hooks emit (always emit per ADR 018 §2 deterministic — caller
  // /orchestrator consumes per ADR 030 D2 thin scope)
  const parallelModifier = emitParallelModifier({
    periodizationPhase:    meta.periodizationPhase,
    specializationActive:  false, // determined post-eligibility + proposal
  });
  const deloadPreserved = emitDeloadPreserved({
    periodizationPhase: meta.periodizationPhase,
  });
  const cutDisable = emitCutDisable({ goalPhase });
  const injuryAutoDisable = emitInjuryAutoDisable({
    painButtonActive:    meta.painButtonActive,
    affectedGroups:      meta.painAffectedGroups,
    targetGroup:         weaknessSignal.targetGroup,
  });
  const lightCoupling = emitLightCoupling({
    energyDirection:        meta.energyDirection,
    energyDownRecurrent:    meta.energyDownRecurrent,
  });
  trace.crossEngineHooks = {
    parallelModifier,
    deloadPreserved,
    cutDisable,
    injuryAutoDisable,
    lightCoupling,
  };

  if (cutDisable.blocked) signals.push('specialization_cut_disable_q5_d_q13_a_dual_safety_gate');
  if (injuryAutoDisable.disabled) signals.push('specialization_injury_pain_button_auto_disable_q14_a_invariant_5');
  if (deloadPreserved.suspended) signals.push('specialization_deload_phase_suspended_q12_a_engine_4_owns');
  if (lightCoupling.energyConservativeScaling) signals.push('specialization_energy_down_recurrent_conservative_scaling_q18_c');

  // Convergence Guard reference (NU duplicate logic — pattern §9.4+§9.5 precedent)
  const convergenceGuardRef = getConvergenceGuardReference();
  trace.convergenceGuardRef = convergenceGuardRef;

  // Forward Constraint Object frozen pass-through anti-cascade §1.10
  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);
  trace.forwardedConstraint = forwardedConstraint !== null;

  // ── Early-return ineligible paths ────────────────────────────────────────

  // Gate failure → ineligible blueprint cu reason
  if (!eligibility.eligible) {
    signals.push(`specialization_${eligibility.state}`);

    return {
      id:               ENGINE_ID,
      tier:             persona === null && tier === null && goalPhase === null
                          ? 'none'
                          : 'LOW',
      confidence:       computeConfidence({
        hasPeriodizationConstraint: periodizationConstraint !== null,
        hasTierResolved:            tier !== null,
        hasWeaknessSignal:          weaknessSignal.targetGroup !== null,
      }),
      signals,
      recommendations:  [],
      trace,
      meta:             buildIneligibleBlueprint(eligibility.state, weaknessSignal.targetGroup),
    };
  }

  // Eligible gating passed → check weakness signal exists (Cluster B)
  if (!weaknessSignal.targetGroup) {
    signals.push('specialization_no_lagging_group_detected_weakness_detector_empty');

    return {
      id:               ENGINE_ID,
      tier:             'LOW',
      confidence:       computeConfidence({
        hasPeriodizationConstraint: periodizationConstraint !== null,
        hasTierResolved:            tier !== null,
        hasWeaknessSignal:          false,
      }),
      signals,
      recommendations:  [],
      trace,
      meta:             buildIneligibleBlueprint(ACTIVATION_STATE.INELIGIBLE_NO_LAGGING),
    };
  }

  // Cluster B5+B6 — Cooldown check
  const cooldown = evaluateCooldown({
    targetGroup:  weaknessSignal.targetGroup,
    history:      meta.cooldownHistory,
    nowMs:        meta.nowMs,
  });
  trace.cooldown = cooldown;

  if (cooldown.blocked) {
    signals.push(`specialization_cooldown_active_${cooldown.reason ?? 'unknown'}_q10_b_q16_a`);

    return {
      id:               ENGINE_ID,
      tier:             'LOW',
      confidence:       computeConfidence({
        hasPeriodizationConstraint: periodizationConstraint !== null,
        hasTierResolved:            true,
        hasWeaknessSignal:          true,
      }),
      signals,
      recommendations:  [],
      trace,
      meta: {
        ...buildIneligibleBlueprint(ACTIVATION_STATE.INELIGIBLE_COOLDOWN, weaknessSignal.targetGroup),
        cooldown_state: cooldown,
      },
    };
  }

  // ── Eligible + has target + no cooldown — proposal evaluation ────────────

  const proposal = evaluateProposal({
    userAccepted:   meta.userProposalAccepted,
    targetGroup:    weaknessSignal.targetGroup,
  });
  trace.proposal = proposal;

  let activationState;
  let specializationActive = false;

  if (proposal.userRejected) {
    activationState = ACTIVATION_STATE.INELIGIBLE_COOLDOWN; // Q16=A hard reject → cooldown
    signals.push('specialization_proposal_rejected_q16_a_hard_reject_12_weeks_cooldown');
  } else if (proposal.activationApproved) {
    activationState = ACTIVATION_STATE.ACTIVE;
    specializationActive = true;
    signals.push(`specialization_active_target_${weaknessSignal.targetGroup}_q15_b_user_accepted`);
  } else {
    activationState = ACTIVATION_STATE.PROPOSAL_PENDING;
    signals.push(`specialization_proposal_pending_target_${weaknessSignal.targetGroup}_q15_b_anti_paternalism`);
  }

  // Cluster A1 mesocycle progress (4-week fixed Q9=A)
  const mesocycleProgress = computeMesocycleProgress({
    weeksElapsed:           meta.specializationWeeksElapsed,
    specializationActive,
  });
  trace.mesocycleProgress = mesocycleProgress;

  // Check exit condition
  if (specializationActive && mesocycleProgress.exiting) {
    activationState = ACTIVATION_STATE.COMPLETED_EXIT;
    signals.push('specialization_completed_exit_4_week_q9_a_entering_cooldown_q10_b');
  }

  // Cluster C — Volume modifier compose (active eligible phase only)
  const volumeModifier = computeVolumeModifier({
    targetGroup:           weaknessSignal.targetGroup,
    periodizationPhase:    meta.periodizationPhase,
    specializationActive:  specializationActive && !mesocycleProgress.exiting,
  });
  trace.volumeModifier = volumeModifier;

  // Re-emit parallel modifier signal cu real specializationActive
  const parallelModifierFinal = emitParallelModifier({
    periodizationPhase:    meta.periodizationPhase,
    specializationActive:  specializationActive && !mesocycleProgress.exiting,
  });
  trace.crossEngineHooks.parallelModifier = parallelModifierFinal;
  if (parallelModifierFinal.applied) {
    signals.push(`specialization_parallel_modifier_engine_1_periodization_q11_b_phase_${parallelModifierFinal.eligiblePhase}`);
  }

  /** @type {import('./types.js').SpecializationBlueprint} */
  const blueprint = {
    activation_state:    activationState,
    target_muscle_group: weaknessSignal.targetGroup,
    mesocycle_progress:  mesocycleProgress,
    volume_modifier:     volumeModifier,
    ui_label:            buildUiLabel(weaknessSignal.targetGroup),
    cooldown_state:      cooldown,
    signals:             signals.slice(),
  };

  // Tier semantic: 'HIGH' active, 'MED' eligible/pending/exit, 'LOW' fallback
  let tierResult;
  if (activationState === ACTIVATION_STATE.ACTIVE) {
    tierResult = 'HIGH';
  } else if (activationState === ACTIVATION_STATE.PROPOSAL_PENDING
             || activationState === ACTIVATION_STATE.COMPLETED_EXIT) {
    tierResult = 'MED';
  } else {
    tierResult = 'LOW';
  }

  return {
    id:               ENGINE_ID,
    tier:             tierResult,
    confidence:       computeConfidence({
      hasPeriodizationConstraint: periodizationConstraint !== null,
      hasTierResolved:            true,
      hasWeaknessSignal:          true,
    }),
    signals,
    recommendations:  [], // V1 empty — orchestrator-level concern per ADR 030 D2 thin scope
    trace,
    meta:             blueprint,
  };
}
