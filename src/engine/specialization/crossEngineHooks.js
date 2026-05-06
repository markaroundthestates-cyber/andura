// Cluster D Cross-Engine Integration per ADR 026 §9.6.4 verbatim.
//
// D1 PARALLEL modifier Engine #1 Periodization NU REPLACE (Q11=B):
//    Layer extra volume/frequency on accumulation phases preserving Periodization
//    skeleton Engine #1 (mesocycle phases + Volume Landmarks + Linear Block +
//    cross-engine hooks). Periodization NU overridden — phase + intensity
//    corridor + volume target preserved canonical. Light coupling additive.
//
// D2 Engine #4 Deload standard week 4 preserved non-negotiable (Q12=A):
//    Standard deload week 4 preserved despite specialization activation.
//    Specialization layered OFF during deload (volume/frequency modifier
//    suspended). Engine #4 owns deload structure Hook 2 §9.1 cross-ref.
//
// D3 Cut DISABLE Q5+Q13 dual safety gate (Q5=D + Q13=A):
//    Engine #2 Goal Adaptation phase = CUT → specialization GATE_BLOCKED entire
//    engine output. Deficit nutritional + extra volume = recovery risk universal
//    anti-pattern. Q13=A consistency redundant safety gate (defense-in-depth
//    Layer 5 Medical Safety §42.9 invariant 5 cross-cut).
//
// D4 Injury weak group → auto-disable Safety Override (Q14=A):
//    PainButton signal injury detected weak group muscle/joint → specialization
//    auto-disabled. Q14=A auto-disable vs Q14 alternative top-2 fallback rejected
//    V1 — strict safety first. V1.5 candidate alternative top-2 fallback (§9.6.6
//    Reconsideration Trigger 4).
//
// D5 Light coupling Engine #5 Energy + Engine #6 Tempo cross-engine context
//    (engines #5+#6 consistent Q18=C silent telemetry pattern):
//    Engine #5 Energy DOWN signal recurrent → specialization volume modifier
//    conservative scaling (anti-cascade compounding).
//    Engine #6 Tempo prescription preserved Engine #6 owns NU mutated by
//    specialization extra volume.
//
// Convergence Guard reference §9.6 cross-ref ADR 009 §AMENDMENT canonical SSOT.
// **NU duplicate logic în Specialization module** — reference ONLY (rule =
// behavioral validation cross-cutting all tier transitions T0→T1→T2, NU
// Specialization specific). Pattern from §9.4 Bayesian commit `8615ec1` + §9.5
// Tempo commit `d82d118` precedent.
//
// Pure functions — no side effects.

import {
  ELIGIBLE_PERIODIZATION_PHASES,
  ELIGIBLE_GOAL_PHASES,
  GOAL_PHASE,
  PERIODIZATION_PHASE,
} from './constants.js';

/**
 * Hook D1 — PARALLEL modifier Engine #1 Periodization signal per Cluster D
 * verbatim Q11=B (NU REPLACE).
 *
 * Anti-cascade preserve §1.10 Pipeline Order: Specialization (6th) NU overrides
 * Periodization (1st). Light coupling additive only — modifier applied IF phase
 * eligible (ACCUMULATION/LOAD).
 *
 * @param {Object} input
 * @param {string} [input.periodizationPhase]
 * @param {boolean} [input.specializationActive]
 * @returns {import('./types.js').ParallelModifierSignal}
 */
export function emitParallelModifier({ periodizationPhase, specializationActive }) {
  const phase = typeof periodizationPhase === 'string' ? periodizationPhase.toUpperCase() : null;
  const eligible = phase !== null && ELIGIBLE_PERIODIZATION_PHASES.includes(phase);
  const applied = specializationActive === true && eligible;

  return {
    applied,
    mode:           'parallel', // V1 invariant — NU REPLACE Engine #1 skeleton
    eligiblePhase:  eligible ? phase : null,
    rationale: applied
      ? `parallel_modifier_applied_phase_${phase}_q11_b_nu_replace_anti_cascade_§1_10`
      : (!eligible
          ? `phase_${phase ?? 'unknown'}_not_eligible_accumulation_or_load_modifier_suspended`
          : 'specialization_not_active_no_parallel_modifier_emit'),
  };
}

/**
 * Hook D2 — Engine #4 Deload preserved signal per Cluster D verbatim Q12=A
 * non-negotiable.
 *
 * Standard deload week 4 preserved despite specialization activation. During
 * DELOAD phase: specialization layered OFF (volume/frequency modifier
 * suspended), recovery integrity protected.
 *
 * @param {Object} input
 * @param {string} [input.periodizationPhase]
 * @returns {import('./types.js').DeloadPreservedSignal}
 */
export function emitDeloadPreserved({ periodizationPhase }) {
  const phase = typeof periodizationPhase === 'string' ? periodizationPhase.toUpperCase() : null;
  const suspended = phase === PERIODIZATION_PHASE.DELOAD;

  return {
    suspended,
    rationale: suspended
      ? 'deload_phase_specialization_layered_off_q12_a_non_negotiable_engine_4_owns_deload_structure'
      : `phase_${phase ?? 'unknown'}_not_deload_specialization_can_apply_if_eligible`,
  };
}

/**
 * Hook D3 — Cut DISABLE dual safety gate signal per Cluster D verbatim
 * Q5=D + Q13=A.
 *
 * Engine #2 Goal Adaptation phase = CUT → specialization GATE_BLOCKED.
 * Deficit nutritional + extra volume = recovery risk universal. Q13=A
 * redundant safety gate defense-in-depth Layer 5 Medical Safety §42.9
 * invariant 5.
 *
 * @param {Object} input
 * @param {string} [input.goalPhase]
 * @returns {import('./types.js').CutDisableSignal}
 */
export function emitCutDisable({ goalPhase }) {
  const phase = typeof goalPhase === 'string' ? goalPhase.toUpperCase() : null;
  const blocked = phase === GOAL_PHASE.CUT;

  return {
    blocked,
    phase: phase ?? '',
    rationale: blocked
      ? 'goal_phase_cut_specialization_gate_blocked_q5_d_q13_a_dual_safety_recovery_risk_universal_invariant_5'
      : `goal_phase_${phase ?? 'unknown'}_no_cut_disable_eligible_if_bulk_or_recomp`,
  };
}

/**
 * Hook D4 — Injury PainButton auto-disable signal per Cluster D verbatim
 * Q14=A Safety Override.
 *
 * PainButton signal injury weak group → specialization auto-disabled (Layer 5
 * Medical Safety §42.9 invariant 5 cross-cutting defense-in-depth).
 *
 * @param {Object} input
 * @param {boolean} [input.painButtonActive]
 * @param {ReadonlyArray<string>|Array<string>} [input.affectedGroups]
 * @param {string|null} [input.targetGroup]
 * @returns {import('./types.js').InjuryAutoDisableSignal}
 */
export function emitInjuryAutoDisable({
  painButtonActive,
  affectedGroups,
  targetGroup,
}) {
  const active = painButtonActive === true;
  const affected = Array.isArray(affectedGroups) ? affectedGroups.map((g) => String(g).toLowerCase()) : [];
  const safeTarget = typeof targetGroup === 'string' ? targetGroup.toLowerCase() : null;

  if (!active) {
    return {
      disabled:        false,
      affectedGroup:   null,
      rationale:       'pain_button_inactive_no_injury_safety_override',
    };
  }

  // Disable când injury active AND target group matches (or any group active when target null)
  if (safeTarget && affected.includes(safeTarget)) {
    return {
      disabled:        true,
      affectedGroup:   safeTarget,
      rationale:       `injury_pain_button_target_group_${safeTarget}_q14_a_safety_override_invariant_5_layer_5_medical_safety`,
    };
  }

  if (affected.length > 0) {
    return {
      disabled:        true,
      affectedGroup:   affected[0],
      rationale:       `injury_pain_button_active_groups_${affected.join('_')}_q14_a_conservative_disable_invariant_5`,
    };
  }

  return {
    disabled:        false,
    affectedGroup:   null,
    rationale:       'pain_button_active_but_no_specific_groups_no_disable',
  };
}

/**
 * Hook D5 — Light coupling Engine #5 Energy + Engine #6 Tempo signal per
 * Cluster D verbatim — silent telemetry pattern Q18=C consistent #5+#6.
 *
 * Engine #5 Energy DOWN recurrent → conservative volume modifier scaling.
 * Engine #6 Tempo prescription owned by Engine #6 (NU mutated by specialization
 * extra volume). Light coupling pattern: specialization reads signals upstream,
 * modulates own output, NU mutates upstream engines (anti-cascade preserve §1.10).
 *
 * @param {Object} input
 * @param {string} [input.energyDirection]               - 'UP' | 'DOWN' | 'NONE'
 * @param {boolean} [input.energyDownRecurrent]          - True dacă DOWN signal sustained recent
 * @returns {import('./types.js').LightCouplingSignal}
 */
export function emitLightCoupling({ energyDirection, energyDownRecurrent }) {
  const direction = typeof energyDirection === 'string' ? energyDirection.toUpperCase() : null;
  const recurrent = energyDownRecurrent === true;
  const conservativeScaling = direction === 'DOWN' && recurrent;

  return {
    energyConservativeScaling:  conservativeScaling,
    tempoPreserved:             true, // V1 invariant — Specialization NU mutates Engine #6 Tempo prescription
    rationale: conservativeScaling
      ? 'energy_down_recurrent_conservative_volume_modifier_scaling_anti_cascade_compounding_q18_c'
      : (direction === 'DOWN'
          ? 'energy_down_isolated_no_conservative_scaling_default_modifier_d5_light_coupling'
          : `energy_${direction ?? 'unknown'}_no_modulation_tempo_preserved_engine_6_owns`),
  };
}

/**
 * Convergence Guard reference per §9.6 cross-ref verbatim — ADR 009 §AMENDMENT
 * 2026-05-05 birou after canonical SSOT.
 *
 * **NU duplicate rule logic în Specialization module** — reference ONLY (rule
 * = behavioral validation cross-cutting all tier transitions T0→T1→T2, NU
 * Specialization specific).
 *
 * Returns metadata describing where Convergence Guard lives — caller (orchestrator
 * layer) calls actual T2 Unlock evaluation via `src/coach/orchestrator/utilities/
 * convergenceGuard.js` (Phase 1-2 foundation commit `5a16550` reusable). Pattern
 * from §9.4 Bayesian commit `8615ec1` + §9.5 Tempo commit `d82d118` precedent.
 *
 * @returns {{
 *   ownerSpec: string,
 *   crossCutting: boolean,
 *   appliesToTierTransitions: ReadonlyArray<string>,
 *   note: string,
 * }}
 */
export function getConvergenceGuardReference() {
  return Object.freeze({
    ownerSpec:                  'ADR 009 §AMENDMENT 2026-05-05 birou after',
    crossCutting:               true,
    appliesToTierTransitions:   Object.freeze(['T0->T1', 'T1->T2']),
    note: 'Convergence Guard "T2 Unlock" rule = behavioral validation cross-cutting NU Engine Specialization specific. '
          + 'Specialization module references ONLY — actual T2 Unlock evaluation lives in '
          + 'src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator layer Phase 1-2 foundation commit 5a16550). '
          + 'Mirrors §9.4 Bayesian Nutrition commit 8615ec1 + §9.5 Tempo commit d82d118 crossEngineHooks pattern precedent.',
  });
}

/**
 * Forward Constraint Object pass-through immutable Hook 1 per §1.10 Pipeline
 * Order LOCKED V1. Engine Specialization NU mutate Periodization Constraint
 * Object frozen — propagates downstream Warm-up/Deload.
 *
 * @param {Object|null|undefined} constraint
 * @returns {Object|null}
 */
export function forwardConstraintObject(constraint) {
  if (!constraint || typeof constraint !== 'object') return null;
  return Object.isFrozen(constraint) ? constraint : Object.freeze({ ...constraint });
}
