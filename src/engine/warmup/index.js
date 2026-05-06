// Engine Warm-up V1 — public API per ADR 026 §9.7 + ADR 018 §2.
//
// Pipeline §42.10 position 7th canonical:
//   Periodization (§9.1) → Goal Adaptation (§9.2) → Energy Adjustment (§9.3)
//   → Bayesian Nutrition (§9.4) → Tempo (§9.5) → Specialization (§9.6)
//   → Warm-up (§9.7) → Deload (§9.8).
//
// **Engine numbering clarification:** Source 1 + Source 2 reference "Engine #8"
// = chat strategic spec session ordering legacy (META §36.100 amendment 7→8
// prescriptive engines 2026-04-30 evening) NU pipeline §42.10 canonical
// position 7th. Penultimate prescriptive engine pre-Deload (§9.8 batch 8 final).
//
// Pure function `evaluate(ctx) → WarmupResult` total + deterministic +
// async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Output blueprint per Cluster A1 verbatim emit (lives în WarmupResult.meta):
//   1. warmup_state         — ACTIVE / SKIPPED / DELOAD_LIGHTER / INJURY_DISABLED
//   2. duration_min         — 5-10 adaptive (5-7 cu Energy DOWN auto-shorten D3)
//   3. routine_type         — 'hybrid' V1 LOCKED Q65.2 Option C
//   4. general_sets         — count 1-2 + RO native exercise labels
//   5. specific_sets        — count 2-3 + target muscle groups + RO labels
//   6. skip_available       — boolean V1 always true (§65.3 Source 1 Option A)
//   7. cooldown_state       — { offered, durationMin, content, stretches }
//   8. ui_label             — RO native "Încălzire ~X min"
//   9. signals              — human-readable IDs
//
// Wire-up Faza 3 STRANGLER post engines V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.7
// (commit c15ad0f LANDED 2026-05-06 evening chat-5 acasă, 21 decisions
// Cluster A-E verbatim aggregation 2-way parity Sources 1+2 + reconciled
// override Source 1 §65.4 supersedes Source 2 §45.6 Q-Cooldown defer per
// Daniel's later decision authority pattern).
//
// Source 4 NU disponibil: ADR Warm-up file ABSENT — recommend NEW ADR
// `031-engine-warmup-mobility.md` SPEC REFERENCE direct (reverse pattern vs
// ADR 027/028/029 stub flip — NU intermediate STUB stage). Separate task
// post-CC low priority.

import {
  computeDuration,
} from './durationCalculator.js';
import {
  composeRoutine,
} from './routineComposer.js';
import {
  computeSkipDecision,
} from './skipManager.js';
import {
  composeCooldown,
} from './cooldownEmitter.js';
import {
  consumeFrozenConstraint,
  consumeGoalPhase,
  consumeEnergyReadiness,
  consumeSpecializationWeakGroup,
  forwardConstraintObject,
  getConvergenceGuardReference,
  detectInjuryDisabled,
} from './crossEngineHooks.js';
import {
  CALIBRATION_TIERS,
  WARMUP_STATE,
  buildUiLabel,
  SCHEMA_CONSTANTS,
} from './constants.js';

export const ENGINE_ID = 'warmup';

/**
 * Compute confidence level per ctx data completeness signals.
 *
 * @param {Object} input
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasTierResolved
 * @param {boolean} input.hasPersonaResolved
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({
  hasPeriodizationConstraint,
  hasTierResolved,
  hasPersonaResolved,
}) {
  let score = 0;
  if (hasPeriodizationConstraint) score += 1;
  if (hasTierResolved) score += 1;
  if (hasPersonaResolved) score += 1;
  if (score >= 3) return 'high';
  if (score >= SCHEMA_CONSTANTS.confidenceMediumFloor) return 'medium';
  return 'low';
}

/**
 * Resolve calibration tier from ctx — defensive normalization per ADR 009 +
 * §9.7.5 Cluster E1 verbatim.
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
 * Build empty/insufficient blueprint per Cluster A1 9-field emit verbatim.
 * Used pentru insufficient ctx fallback (tier 'none' total function semantics).
 *
 * @param {string} state
 * @returns {import('./types.js').WarmupBlueprint}
 */
function buildInsufficientBlueprint(state = WARMUP_STATE.ACTIVE) {
  const duration = SCHEMA_CONSTANTS.durationMinDefault;
  return {
    warmup_state:           state,
    duration_min:           duration,
    routine_type:           'hybrid',
    general_sets:           0,
    general_sets_list:      Object.freeze([]),
    specific_sets:          0,
    specific_sets_list:     Object.freeze([]),
    target_muscle_groups:   Object.freeze([]),
    skip_available:         true,
    cooldown_state: {
      offered:     false,
      durationMin: 0,
      content:     'text-only',
      stretches:   Object.freeze([]),
      rationale:   'insufficient_ctx_fallback_no_cooldown_emit',
    },
    ui_label:               buildUiLabel(duration),
    signals:                [],
  };
}

/**
 * Evaluate Engine Warm-up per ADR 026 §9.7 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid WarmupResult
 * cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 9 fields (Cluster A1 verbatim emit):
 *   1. warmup_state (ACTIVE / SKIPPED / DELOAD_LIGHTER / INJURY_DISABLED)
 *   2. duration_min (5-10 adaptive Cluster B1+D3)
 *   3. routine_type ('hybrid' V1 Cluster B2)
 *   4. general_sets count + 5. general_sets_list (Cluster B2)
 *   6. specific_sets count + 7. specific_sets_list + 8. target_muscle_groups (Cluster B2+D4)
 *   9. skip_available + cooldown_state + ui_label + signals
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').WarmupResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics per ADR 018 §2.
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};

  // Cluster A — Tier resolution per ADR 009 + §9.7.5 verbatim.
  const tier = resolveTier(safeCtx);
  trace.tier = tier;

  // Persona resolution per Cluster B3 §45.6.3 verbatim
  const persona = typeof meta.persona === 'string' ? meta.persona.toLowerCase() : null;
  trace.persona = persona;

  // Goal phase resolution per Cluster D2 cross-ref §9.2 Hook
  const goalPhase = typeof meta.goalPhase === 'string' ? meta.goalPhase.toUpperCase() : null;
  trace.goalPhase = goalPhase;

  // Hook D1 — Periodization Constraint Object frozen consumed read-only
  const periodizationConstraint = meta.periodizationConstraint || null;
  const periodizationFrozen = consumeFrozenConstraint(periodizationConstraint);
  trace.periodizationFrozen = periodizationFrozen;

  // Hook D2 — Goal Adaptation phase context light coupling
  const goalPhaseSignal = consumeGoalPhase(goalPhase);
  trace.goalPhaseSignal = goalPhaseSignal;

  // Hook D3 — Energy Adjustment readiness state
  const energyDirection = typeof meta.energyDirection === 'string' ? meta.energyDirection : null;
  const energySignal = consumeEnergyReadiness(energyDirection);
  trace.energySignal = energySignal;
  if (energySignal.autoShortenApplied) {
    signals.push('warmup_energy_down_auto_shorten_d3_anti_cascade');
  }

  // Hook D4 — Specialization weak group prioritize signal
  const weakGroupSignal = consumeSpecializationWeakGroup(meta.specializationWeakGroup);
  trace.weakGroupSignal = weakGroupSignal;
  if (weakGroupSignal.prioritized) {
    signals.push(`warmup_specialization_weak_group_${weakGroupSignal.weakGroup}_prioritized_d4_q11_b_parallel_modifier`);
  }

  // Pain-Aware §9.4.6 reference — injury detection (NU proactive trigger Clean Signal rule)
  const injuryDisabled = detectInjuryDisabled({
    painButtonActive:    meta.painButtonActive,
    painAffectedGroups:  meta.painAffectedGroups,
  });
  trace.injuryDisabled = injuryDisabled;
  if (injuryDisabled.disabled) {
    signals.push('warmup_injury_disabled_pain_aware_reference_94_6_clean_signal_rule');
  }

  // Convergence Guard reference (NU duplicate logic — pattern §9.4+§9.5+§9.6 precedent)
  const convergenceGuardRef = getConvergenceGuardReference();
  trace.convergenceGuardRef = convergenceGuardRef;

  // Hook forward Constraint Object frozen pass-through anti-cascade §1.10
  const forwardedConstraint = forwardConstraintObject(periodizationConstraint);
  trace.forwardedConstraint = forwardedConstraint !== null;

  // Cluster E1 — Skip decision (T0 default ramp-up integrated / T1+ opt-in)
  const skipDecision = computeSkipDecision({
    tier:           tier ?? CALIBRATION_TIERS.T0,
    userOptedSkip:  meta.userOptedSkip,
  });
  trace.skipDecision = skipDecision;

  // ── Determine warmup_state per Cluster A1 priority order ─────────────────

  let warmupState;

  // 1. Pain-Aware injury reference takes priority (Clean Signal rule §9.4.6)
  if (injuryDisabled.disabled) {
    warmupState = WARMUP_STATE.INJURY_DISABLED;
  }
  // 2. User opted skip (in-session toggle B4 Q65.3)
  else if (skipDecision.userOptedSkip) {
    warmupState = WARMUP_STATE.SKIPPED;
    signals.push('warmup_skipped_user_toggle_b4_q65_3_buton_vizibil_session_1');
  }
  // 3. Periodization DELOAD week → lighter routine (D1)
  else if (periodizationFrozen.phase === 'DELOAD') {
    warmupState = WARMUP_STATE.DELOAD_LIGHTER;
    signals.push('warmup_deload_lighter_d1_periodization_recovery_week');
  }
  // 4. Default ACTIVE
  else {
    warmupState = WARMUP_STATE.ACTIVE;
  }

  // ── Cluster B1+B2+B3 — Duration adaptive computation ─────────────────────

  const durationDecision = computeDuration({
    persona,
    goalPhase,
    periodizationPhase: periodizationFrozen.phase,
    energyDirection,
  });
  trace.durationDecision = durationDecision;

  // ── Cluster B2 — Routine composition Hybrid 1-2 general + 2-3 specific ──

  const routineDecision = composeRoutine({
    targetMuscleGroups:  meta.targetMuscleGroups,
    weakGroup:           weakGroupSignal.weakGroup,
    generalSetsCount:    meta.generalSetsCount,
    specificSetsCount:   meta.specificSetsCount,
  });
  trace.routineDecision = routineDecision;

  // ── Cluster C — Cooldown state emit ──────────────────────────────────────

  const cooldownState = composeCooldown({
    suppressForInjuryDisabled: warmupState === WARMUP_STATE.INJURY_DISABLED,
  });
  trace.cooldownState = cooldownState;

  // ── Cluster A1 — Build blueprint 9-field emit ────────────────────────────

  /** @type {import('./types.js').WarmupBlueprint} */
  const blueprint = {
    warmup_state:           warmupState,
    duration_min:           durationDecision.durationMin,
    routine_type:           routineDecision.routineType,
    general_sets:           routineDecision.generalSetsCount,
    general_sets_list:      routineDecision.generalSets,
    specific_sets:          routineDecision.specificSetsCount,
    specific_sets_list:     routineDecision.specificSets,
    target_muscle_groups:   routineDecision.targetMuscleGroups,
    skip_available:         skipDecision.skipAvailable,
    cooldown_state:         cooldownState,
    ui_label:               buildUiLabel(durationDecision.durationMin),
    signals:                signals.slice(),
  };

  // Tier semantic per ADR 018 §2 enum:
  //   'HIGH' = ACTIVE full routine
  //   'MED'  = SKIPPED user opt-out OR DELOAD_LIGHTER
  //   'LOW'  = INJURY_DISABLED
  //   'none' = insufficient ctx default fallback
  let tierResult;
  if (tier === null && persona === null && goalPhase === null) {
    tierResult = 'none';
  } else if (warmupState === WARMUP_STATE.INJURY_DISABLED) {
    tierResult = 'LOW';
  } else if (warmupState === WARMUP_STATE.SKIPPED || warmupState === WARMUP_STATE.DELOAD_LIGHTER) {
    tierResult = 'MED';
  } else {
    tierResult = 'HIGH';
  }

  return {
    id:               ENGINE_ID,
    tier:             tierResult,
    confidence:       computeConfidence({
      hasPeriodizationConstraint: periodizationConstraint !== null,
      hasTierResolved:            tier !== null,
      hasPersonaResolved:         persona !== null,
    }),
    signals,
    recommendations:  [], // V1 empty — orchestrator-level concern per ADR 030 D2 thin scope
    trace,
    meta:             tierResult === 'none'
                        ? buildInsufficientBlueprint(warmupState)
                        : blueprint,
  };
}
