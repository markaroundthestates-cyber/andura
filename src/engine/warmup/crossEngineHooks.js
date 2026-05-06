// Cluster D — Cross-Engine Hooks per ADR 026 §9.7.4 verbatim.
//
// D1 Hook upstream consume frozen Constraint Object — Periodization §9.1
//    (read-only, anti-cascade safeguard preserve §1.10 Pipeline Order LOCKED V1)
// D2 Hook upstream consume — Goal Adaptation §9.2 phase context (light coupling
//    — CUT/BULK adaptive duration)
// D3 Hook upstream consume — Energy Adjustment §9.3 readiness state (Energy
//    DOWN auto-shorten upper bound 5-10 → 5-7 min anti-cascade)
// D4 Hook upstream consume — Specialization §9.6 weak group focus (PARALLEL
//    modifier precedent Q11=B — Warm-up serves Specialization NU compete;
//    weak group prioritized în specific muscle exercises)
// D5 Hook downstream forward — Deload §9.8 (light coupling Cooldown post-session
//    compatible cu deload week §65.6 trigger §36.82 readiness 🔴 3x consecutive)
//
// Pain-Aware integration cross-cutting Convergence Guard "T2 Unlock" reference
// §9.4.6 (Warm-up NU proactive Pain-Aware trigger Clean Signal rule preserved
// consistent §9.5+§9.6 precedent — engine references metadata only; orchestrator
// layer evaluates actual T2 unlock per ADR 009 §AMENDMENT 2026-05-05 birou after).
//
// Anti-cascade safeguards:
//   - NU mutate Periodization Constraint Object frozen upstream
//   - Forward Constraint Object pass-through immutable to Deload §9.8 downstream
//   - Convergence Guard reference-only metadata (NU duplicate eval logic — owner
//     ADR 009 amendment)
//
// Pure functions — no side effects.

import {
  PERIODIZATION_PHASE,
  GOAL_PHASE,
  ENERGY_DIRECTION,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Hook D1 — Consume frozen Periodization Constraint Object read-only.
 *
 * Defensive defaults preserve total function semantics. Returns metadata-only
 * signal cu phase + deload window flag — actual phase impact applied via
 * `durationCalculator.isDeloadWeek()` (NU în this hook).
 *
 * @param {Object|null|undefined} constraint
 * @returns {import('./types.js').PeriodizationFrozenSignal}
 */
export function consumeFrozenConstraint(constraint) {
  if (!constraint || typeof constraint !== 'object') {
    return {
      frozen:        true,
      phase:         null,
      deloadWindow:  null,
      rationale:     'no_periodization_constraint_passed_defensive_defaults',
    };
  }

  // Anti-cascade safeguard: NU mutate input — read-only consume only
  return {
    frozen:        true,
    phase:         typeof constraint.phase === 'string' ? constraint.phase : null,
    deloadWindow:  constraint.deload_window || null,
    rationale: constraint.phase === PERIODIZATION_PHASE.DELOAD
      ? 'periodization_deload_week_d1_lighter_routine_anti_cascade_preserved'
      : `periodization_phase_${typeof constraint.phase === 'string' ? constraint.phase.toLowerCase() : 'unknown'}_d1_consumed_read_only`,
  };
}

/**
 * Hook D2 — Consume Goal Adaptation phase context light coupling.
 *
 * @param {string|null|undefined} goalPhase
 * @returns {import('./types.js').GoalPhaseSignal}
 */
export function consumeGoalPhase(goalPhase) {
  const phase = typeof goalPhase === 'string' ? goalPhase.toUpperCase() : null;

  let adjustmentRationale;
  if (phase === GOAL_PHASE.CUT) {
    adjustmentRationale = 'cut_preserve_full_d2_maria_65_retention_crescut_anti_friction';
  } else if (phase === GOAL_PHASE.BULK) {
    adjustmentRationale = 'bulk_marius_full_ramp_50_70_90_d2_advanced_protocol';
  } else if (phase === GOAL_PHASE.MAINTAIN) {
    adjustmentRationale = 'maintain_baseline_d2_preserved';
  } else if (phase === GOAL_PHASE.RECOMP) {
    adjustmentRationale = 'recomp_baseline_d2_sub_phase_maintain_treatment';
  } else {
    adjustmentRationale = 'goal_phase_unresolved_d2_baseline_default';
  }

  return {
    goalPhase: phase,
    adjustmentRationale,
  };
}

/**
 * Hook D3 — Consume Energy Adjustment readiness state.
 *
 * Energy DOWN signal → auto-shorten upper bound 5-10 → 5-7 min applied
 * downstream în `durationCalculator.computeDuration()`. This hook returns
 * metadata-only signal pentru transparency.
 *
 * Anti-cascade preserve §1.10 Pipeline Order LOCKED V1 (consistent §9.5 Tempo
 * D13 precedent — Energy DOWN modulates duration NU mutate phase upstream).
 *
 * @param {string|null|undefined} energyDirection
 * @returns {import('./types.js').EnergyReadinessSignal}
 */
export function consumeEnergyReadiness(energyDirection) {
  const dir = typeof energyDirection === 'string' ? energyDirection : ENERGY_DIRECTION.NONE;
  const autoShortenApplied = dir === ENERGY_DIRECTION.DOWN;

  return {
    energyDirection:        dir,
    autoShortenApplied,
    rationale: autoShortenApplied
      ? `energy_down_auto_shorten_upper_bound_5_10_to_5_${SCHEMA_CONSTANTS.durationMaxEnergyDown}_d3_anti_cascade_preserve`
      : 'energy_baseline_or_up_no_auto_shorten_d3_no_modulation',
  };
}

/**
 * Hook D4 — Consume Specialization weak group prioritize signal §9.6 cross-ref.
 *
 * Specialization weak group active → Warm-up specific muscle group includes
 * weak group prioritized (PARALLEL modifier precedent §9.6 Q11=B — Warm-up
 * serves Specialization NU compete).
 *
 * Returns metadata signal; actual weak group inclusion applied downstream via
 * `routineComposer.composeRoutine()` cu weakGroup param.
 *
 * @param {string|null|undefined} weakGroup
 * @returns {import('./types.js').SpecializationWeakGroupSignal}
 */
export function consumeSpecializationWeakGroup(weakGroup) {
  const group = typeof weakGroup === 'string' && weakGroup.length > 0
    ? weakGroup.toLowerCase()
    : null;
  const prioritized = group !== null;

  return {
    weakGroup:    group,
    prioritized,
    rationale: prioritized
      ? `specialization_weak_group_${group}_prioritized_d4_q11_b_parallel_modifier_warmup_serves_nu_compete`
      : 'specialization_no_weak_group_signal_d4_baseline_target_groups_only',
  };
}

/**
 * Hook D5 — Forward Constraint Object pass-through immutable to Deload §9.8
 * downstream.
 *
 * Engine Warm-up NU mutate upstream Constraint Object frozen — propagates
 * downstream Deload (§9.8 batch 8 final pipeline §42.10 closure).
 *
 * @param {Object|null|undefined} constraint
 * @returns {Object|null}
 */
export function forwardConstraintObject(constraint) {
  if (!constraint || typeof constraint !== 'object') return null;
  return Object.isFrozen(constraint) ? constraint : Object.freeze({ ...constraint });
}

/**
 * Convergence Guard reference per §9.4.6 reference-only pattern verbatim.
 *
 * NU duplicate eval logic — owner ADR 009 §AMENDMENT 2026-05-05 birou after
 * Convergence Guard "T2 Unlock" Behavioral Validation Rule. Engine Warm-up
 * references metadata only; orchestrator layer evaluates actual T2 unlock per
 * ADR 030 D5 Convergence Guard cross-cutting orchestrator-level utility.
 *
 * Clean Signal rule: Tempo NU proactive Pain-Aware trigger preserved §9.5+§9.6
 * precedent — Warm-up similarly references but NU acts proactively (user-
 * triggered Pain Button only signal — orchestrator layer integrates Pain-Aware
 * via `src/coach/orchestrator/utilities/convergenceGuard.js` Phase 1-2
 * foundation commit `5a16550` reusable).
 *
 * @returns {import('./types.js').ConvergenceGuardReference}
 */
export function getConvergenceGuardReference() {
  return Object.freeze({
    ownerSpec:        'ADR 009 §AMENDMENT 2026-05-05 birou after',
    ruleName:         'Convergence Guard T2 Unlock Behavioral Validation',
    cleanSignalRule:  'Tempo NU proactive trigger Pain-Aware preserved §9.5+§9.6',
  });
}

/**
 * Pain-Aware integration check per §9.4.6 cross-ref Convergence Guard "T2
 * Unlock" Clean Signal rule.
 *
 * Engine Warm-up NOT proactive Pain-Aware trigger — Warm-up references metadata
 * only (engine NU contribuie pain_aware:true flag CDL — flag se setează STRICT
 * user-triggered Pain Button only).
 *
 * Returns false always V1 — Warm-up NU proactive Pain-Aware trigger consistent
 * §9.5+§9.6 precedent.
 *
 * @returns {boolean}
 */
export function isPainAwareProactiveTrigger() {
  return false; // V1 LOCKED — Clean Signal rule preserved Invariant 5 Medical Safety
}

/**
 * Detect injury-disabled state per §9.4.6 reference Pain-Aware integration.
 *
 * Engine Warm-up reads pain button state from ctx (orchestrator-level signal
 * from Pain Button user-triggered ONLY); NU proactive trigger by Warm-up
 * itself (Clean Signal rule consistent §9.5+§9.6 precedent).
 *
 * @param {Object} input
 * @param {boolean} [input.painButtonActive]                  - User-triggered Pain Button signal
 * @param {ReadonlyArray<string>} [input.painAffectedGroups]  - Affected muscle groups
 * @returns {{disabled: boolean, affectedGroups: ReadonlyArray<string>, rationale: string}}
 */
export function detectInjuryDisabled({ painButtonActive, painAffectedGroups }) {
  const active = painButtonActive === true;
  const groups = Array.isArray(painAffectedGroups)
    ? painAffectedGroups.filter((g) => typeof g === 'string')
    : [];

  return {
    disabled:       active,
    affectedGroups: Object.freeze(groups),
    rationale: active
      ? `injury_disabled_pain_button_user_triggered_groups_${groups.join('_') || 'unspecified'}_94_6_clean_signal_rule`
      : 'no_injury_disabled_pain_button_inactive',
  };
}
