// Cluster D — Cross-Engine Hooks per ADR 026 §9.8.4 verbatim.
//
// D1 Hook upstream consume frozen Constraint Object — Periodization §9.1
//    (read-only `phase` + `volume_per_muscle Floor/Ceiling` + `intensity_pct_1rm
//    Floor/Ceiling` + `deload_window` primary signal). Anti-cascade preserve.
// D2 Hook upstream consume — Goal Adaptation §9.2 phase context (CUT preserve
//    60% Marius retention / BULK Marius 45% classical light coupling)
// D3 Hook upstream consume — Energy Adjustment §9.3 readiness state (DOWN
//    sustained 3+ consecutive → AA Detection trigger candidate)
// D4 Hook upstream consume — Bayesian §9.4 σ + Pain-Aware §9.4.6 reference-only
//    metadata (NU duplicate Convergence Guard logic — pattern §9.4-§9.7 precedent)
// D5 Hook upstream consume — Specialization §9.6 active state (Specialization
//    suspended Q12=A non-negotiable când Engine Deload REACTIVE triggered)
// D6 Hook downstream signal — Warm-up §9.7 light coupling (DELOAD_LIGHTER state
//    signal next-session lookahead)
// D7 forwardConstraintObject — Engine Deload TERMINAL pipeline §42.10 8th FINAL
//    NU forward Constraint Object downstream V1 (Deload terminal, no engine 9th
//    consumes). V1.5+ candidate post-deload telemetry.
//
// Pain-Aware §9.4.6 reference Cluster E1 Clean Signal rule preserved:
//   Engine Deload NU proactive Pain-Aware trigger (consistent §9.5+§9.6+§9.7
//   precedent — user-triggered Pain Button only Invariant 5 Medical Safety per
//   ADR_PAIN_DISCOMFORT_BUTTON_v1).
//
// Pure functions — no side effects.

import {
  PERIODIZATION_PHASE,
  DELOAD_WINDOW_TRIGGER,
  GOAL_PHASE,
  ENERGY_DIRECTION,
  DELOAD_STATE,
  SCHEMA_CONSTANTS,
} from './constants.js';

/**
 * Hook D1 — Consume frozen Periodization Constraint Object read-only.
 *
 * Defensive defaults preserve total function semantics. Returns metadata-only
 * signal cu phase + deload_window trigger source — actual deload state
 * resolution applied via `triggerHierarchy.detectLinearTrigger()` +
 * `detectEarlySafetyTrigger()`.
 *
 * @param {Object|null|undefined} constraint
 * @returns {import('./types.js').FrozenConstraintConsume}
 */
export function consumeFrozenConstraint(constraint) {
  if (!constraint || typeof constraint !== 'object') {
    return {
      frozen:                true,
      phase:                 null,
      deloadWindowTrigger:   null,
      rationale:             'no_periodization_constraint_passed_defensive_defaults_d1',
    };
  }

  const phase = typeof constraint.phase === 'string' ? constraint.phase : null;
  const deloadWindow = constraint.deload_window;
  const trigger = (deloadWindow && typeof deloadWindow === 'object'
    && typeof deloadWindow.trigger === 'string')
    ? deloadWindow.trigger
    : null;

  let rationale;
  if (phase === PERIODIZATION_PHASE.DELOAD && trigger === DELOAD_WINDOW_TRIGGER.CALENDAR) {
    rationale = 'periodization_deload_window_calendar_scheduled_linear_d1_45_volume_12_5_intensity';
  } else if (trigger === DELOAD_WINDOW_TRIGGER.EARLY_SAFETY) {
    rationale = 'periodization_deload_window_early_safety_invariant_5_escalate_reactive_aa_d1';
  } else if (trigger === DELOAD_WINDOW_TRIGGER.EXTENSION_MARIUS) {
    rationale = 'periodization_deload_window_extension_marius_5_1_dual_signal_anti_abuse_d1';
  } else {
    rationale = `periodization_phase_${phase ?? 'null'}_window_${trigger ?? 'null'}_d1_consumed_read_only`;
  }

  // Anti-cascade: NU mutate input — read-only consume only
  return {
    frozen:                true,
    phase,
    deloadWindowTrigger:   trigger,
    rationale,
  };
}

/**
 * Hook D2 — Consume Goal Adaptation phase context light coupling.
 *
 * @param {string|null|undefined} goalPhase
 * @returns {import('./types.js').GoalPhaseConsume}
 */
export function consumeGoalPhase(goalPhase) {
  const phase = typeof goalPhase === 'string' ? goalPhase.toUpperCase() : null;

  let depthAdjustmentRationale;
  if (phase === GOAL_PHASE.CUT) {
    depthAdjustmentRationale = 'cut_preserve_60_marius_retention_anti_aggressive_deficit_d2';
  } else if (phase === GOAL_PHASE.BULK) {
    depthAdjustmentRationale = 'bulk_marius_45_classical_recovery_week_d2_9_1_cluster_2_1';
  } else if (phase === GOAL_PHASE.MAINTAIN) {
    depthAdjustmentRationale = 'maintain_baseline_d2';
  } else if (phase === GOAL_PHASE.RECOMP) {
    depthAdjustmentRationale = 'recomp_baseline_d2_sub_phase_maintain_treatment';
  } else {
    depthAdjustmentRationale = 'goal_phase_unresolved_d2_baseline_default';
  }

  return {
    goalPhase: phase,
    depthAdjustmentRationale,
  };
}

/**
 * Hook D3 — Consume Energy Adjustment readiness state.
 *
 * Energy DOWN sustained 3+ consecutive → AA Detection trigger candidate signal
 * (Source 2 cross-ref + B13 verbatim Source 1).
 *
 * Anti-cascade: Energy NU mutate Periodization phase consistent §9.5 Tempo D13
 * Q13=B precedent. AA Detection emits signal here, downstream
 * `triggerHierarchy.detectAATrigger()` applies signal to state resolution.
 *
 * @param {Object} input
 * @param {string|null} [input.energyDirection]
 * @param {ReadonlyArray<{energyDirection?: string}>} [input.recentSessionsForEnergy]
 * @returns {import('./types.js').EnergyReadinessConsume}
 */
export function consumeEnergyReadiness({ energyDirection, recentSessionsForEnergy }) {
  const dir = typeof energyDirection === 'string' ? energyDirection : ENERGY_DIRECTION.NONE;

  // Sustained 3+ consecutive check via trailing sessions
  let sustainedThresholdMet = false;
  if (Array.isArray(recentSessionsForEnergy)) {
    const trailing = recentSessionsForEnergy.slice(0, SCHEMA_CONSTANTS.energyDownConsecutiveThreshold);
    if (trailing.length >= SCHEMA_CONSTANTS.energyDownConsecutiveThreshold) {
      sustainedThresholdMet = trailing.every((s) => s && s.energyDirection === ENERGY_DIRECTION.DOWN);
    }
  }
  // OR if current energyDirection itself = DOWN cu fallback flag
  if (!sustainedThresholdMet && dir === ENERGY_DIRECTION.DOWN) {
    // Single-session DOWN does NOT satisfy 3+ threshold alone — sustainedThresholdMet stays false
    // Caller may pass aggregated flag separately if persisted history available
  }

  return {
    energyDirection:        dir,
    sustainedThresholdMet,
    rationale: sustainedThresholdMet
      ? 'energy_down_sustained_3_consecutive_aa_detection_candidate_b13_36_82_3'
      : `energy_${dir.toLowerCase()}_no_sustained_3_consecutive_threshold_d3`,
  };
}

/**
 * Hook D4 — Consume Bayesian σ + Pain-Aware §9.4.6 reference-only metadata.
 *
 * NU duplicate Convergence Guard logic — owner ADR 009 §AMENDMENT 2026-05-05
 * birou after canonical SSOT (consistent §9.4+§9.5+§9.6+§9.7 precedent
 * reference-only pattern). Engine Deload references metadata only;
 * orchestrator layer evaluates actual T2 unlock via `src/coach/orchestrator/
 * utilities/convergenceGuard.js` (Phase 1-2 foundation commit `5a16550`).
 *
 * @param {Object} input
 * @param {boolean} [input.sigmaHighFlag]                  - σ variance high flag (informational)
 * @param {boolean} [input.painAwareSessionsCountFlag]     - Pain-Aware sessions ≥2 last 10 flag (informational)
 * @returns {import('./types.js').BayesianPainAwareReference}
 */
export function consumeBayesianPainAware({ sigmaHighFlag, painAwareSessionsCountFlag }) {
  const sigma = sigmaHighFlag === true;
  const painCount = painAwareSessionsCountFlag === true;

  const safetyOverrideCandidate = sigma && painCount;

  return {
    sigmaHighFlag:                sigma,
    painAwareSessionsCountFlag:   painCount,
    convergenceGuardOwnerSpec:    'ADR 009 §AMENDMENT 2026-05-05 birou after',
    rationale: safetyOverrideCandidate
      ? 'sigma_high_plus_pain_aware_2_plus_safety_override_candidate_d4_convergence_guard_t2_unlock_reference'
      : `bayesian_d4_reference_only_sigma_${sigma}_pain_${painCount}_no_override_candidate`,
  };
}

/**
 * Hook D5 — Consume Specialization active state.
 *
 * Specialization ACTIVE state + Engine Deload REACTIVE triggered → Specialization
 * suspended (Cluster D2 DeloadPreservedSignal §9.6 verbatim Q12=A non-negotiable).
 * Specialization mesocycle progress freeze, resume post-deload completion.
 *
 * @param {Object} input
 * @param {boolean} [input.specializationActive]
 * @param {string} input.deloadState
 * @returns {import('./types.js').SpecializationSuspendSignal}
 */
export function consumeSpecializationActive({ specializationActive, deloadState }) {
  const isActive = specializationActive === true;
  const isReactive = deloadState === DELOAD_STATE.REACTIVE_COMPOSITE
    || deloadState === DELOAD_STATE.REACTIVE_AA
    || deloadState === DELOAD_STATE.EXTENSION_FLAGGED;

  const suspended = isActive && isReactive;

  return {
    suspended,
    mesoProgressFreezeContext: suspended
      ? 'specialization_mesocycle_progress_freeze_resume_post_deload_completion'
      : null,
    rationale: suspended
      ? 'specialization_active_plus_reactive_deload_suspended_q12_a_non_negotiable_d5_9_6'
      : `specialization_active_${isActive}_deload_state_${deloadState}_no_suspend_d5`,
  };
}

/**
 * Hook D6 — Forward Warm-up DELOAD_LIGHTER signal next-session lookahead light coupling.
 *
 * Engine Deload active → Warm-up routine lighter (DELOAD_LIGHTER state §9.7 D1
 * Hook precedent — recovery week, NU full ramp protocol Marius 50/70/90%).
 *
 * Anti-cascade preserve — Warm-up downstream consume Engine Deload emit, Engine
 * Deload NU mutate Warm-up. Note: Warm-up §9.7 sequentially upstream (7th vs
 * 8th); D6 = retrospective light coupling — orchestrator layer manages cross-cycle
 * propagation.
 *
 * @param {string} deloadState
 * @returns {import('./types.js').WarmupLighterForwardSignal}
 */
export function forwardWarmupLighterSignal(deloadState) {
  const isActive = deloadState !== DELOAD_STATE.IDLE;

  return {
    emit:      isActive,
    rationale: isActive
      ? `engine_deload_active_${deloadState}_emit_warmup_deload_lighter_signal_next_session_lookahead_d6`
      : 'engine_deload_idle_no_warmup_lighter_signal_emit_d6',
  };
}

/**
 * Hook D7 — Forward Constraint Object pass-through.
 *
 * Engine Deload = FINAL prescriptive engine pipeline §42.10 — NU forward
 * Constraint Object downstream V1 (Deload terminal, no engine 9th consumes).
 *
 * V1.5+ post-Beta candidate forward post-deload signal recovery telemetry
 * (consistent §9.4 Bayesian forward pattern future ecosystem-wide alignment).
 *
 * @param {Object|null|undefined} _constraint
 * @returns {null}
 */
export function forwardConstraintObject(_constraint) {
  return null; // Engine Deload terminal V1 — NU forward downstream
}

/**
 * Convergence Guard reference per §9.4.6 reference-only pattern verbatim.
 *
 * NU duplicate eval logic — owner ADR 009 §AMENDMENT 2026-05-05 birou after
 * Convergence Guard "T2 Unlock" Behavioral Validation Rule. Engine Deload
 * references metadata only; orchestrator layer evaluates actual T2 unlock
 * per ADR 030 D5 cross-cutting orchestrator-level utility.
 *
 * Clean Signal rule: Engine Deload NU proactive Pain-Aware trigger preserved
 * §9.5+§9.6+§9.7 precedent.
 *
 * @returns {import('./types.js').ConvergenceGuardReference}
 */
export function getConvergenceGuardReference() {
  return Object.freeze({
    ownerSpec:                  'ADR 009 §AMENDMENT 2026-05-05 birou after',
    crossCutting:               true,
    appliesToTierTransitions:   Object.freeze(['T0->T1', 'T1->T2']),
    note: 'Convergence Guard "T2 Unlock" rule = behavioral validation cross-cutting NU Engine Deload specific. '
          + 'Engine Deload references metadata ONLY — actual T2 Unlock evaluation lives in '
          + 'src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator layer, ADR 030 D5). '
          + 'Clean Signal rule preserved: Engine Deload NU proactive Pain-Aware trigger consistent §9.5+§9.6+§9.7 precedent.',
  });
}

/**
 * Pain-Aware integration check per §9.8.5 Cluster E1 verbatim Convergence Guard
 * "T2 Unlock" Clean Signal rule.
 *
 * Engine Deload NU proactive Pain-Aware trigger — NU contribuie pain_aware:true
 * flag CDL (flag se setează STRICT user-triggered Pain Button only per
 * ADR_PAIN_DISCOMFORT_BUTTON_v1).
 *
 * Returns false always V1 — consistent §9.5+§9.6+§9.7 precedent.
 *
 * @returns {boolean}
 */
export function isPainAwareProactiveTrigger() {
  return false; // V1 LOCKED — Clean Signal rule preserved Invariant 5 Medical Safety
}
