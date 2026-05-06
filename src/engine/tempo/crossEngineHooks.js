// Cluster D Cross-Engine Integration per ADR 026 §9.5.4 verbatim.
//
// D11 Periodization high intensity → form-conservative amplification (Q11=B):
//    - Periodization phase = PEAK or LOAD+ (high_intensity == true) → Tempo emite
//      form-conservative amplification (slower eccentric, controlled concentric)
//    - Anti-cascade preserve §1.10 Pipeline Order: Tempo NU override Periodization
//      phase, only modulates form cue style intensity-aware
//
// D12 Deload week → mind-muscle unlock (Q12=D):
//    - Periodization phase = DELOAD (W4) → Tempo unlock mind-muscle cues
//    - Mind-muscle activation override tier-aware default during DELOAD week
//
// D13 Energy DOWN → slow eccentric universal NU ROM partial (Q13=B):
//    - Energy DOWN signal (per §9.3) → Tempo emite slow eccentric universal cue
//    - NU ROM partial cue (Q13=B Daniel push-back Gemini self-flagged: ROM
//      partial = injury risk amplification, REJECT corect)
//    - Slow eccentric universal compatible cu MRV invariant 1 immutable Q8=A
//
// D14 RIR Matrix form breakdown user toggle → +1 auto-bump next set (Q14=B):
//    - User toggles "form breakdown" mid-set → Tempo signals downstream
//      (orchestrator-level) auto-bump RIR target +1 next set
//    - Anti-cascade: Tempo emite signal, orchestrator layer applies (NU Tempo
//      direct mutation per ADR 030 D2 thin scope)
//
// D Q4=A V1 RIR mismatch silent telemetry only — NU active trigger V1 (engine
//   NU adjusts session current). V1.5+ candidate §9.5.6 Reconsideration Trigger 2.
//
// Convergence Guard reference §9.5 cross-ref ADR 009 §AMENDMENT canonical SSOT.
// **NU duplicate logic în Tempo module** — reference ONLY (rule = behavioral
// validation cross-cutting all tier transitions T0→T1→T2, NU Tempo specific).
// Pattern from §9.4 Bayesian crossEngineHooks.getConvergenceGuardReference()
// commit `8615ec1` finally consumed `src/coach/orchestrator/utilities/convergenceGuard.js`
// Phase 1-2 foundation commit `5a16550`.
//
// Pure functions — no side effects.

import {
  HIGH_INTENSITY_PHASES,
  DELOAD_PHASE,
  ENERGY_DIRECTION,
  RIR_MISMATCH_BEHAVIOR_V1,
} from './constants.js';

/**
 * Hook D11 — Periodization high intensity → form-conservative amplification
 * signal per Cluster D verbatim Q11=B.
 *
 * Phase = PEAK or LOAD+ → Tempo emite slower eccentric, controlled concentric,
 * safety emphasis cue style. Anti-cascade preserve §1.10 Pipeline Order:
 * Tempo NU override Periodization phase, only modulates form cue style.
 *
 * @param {Object} input
 * @param {string} [input.periodizationPhase]
 * @returns {import('./types.js').HighIntensityAmplificationSignal}
 */
export function detectHighIntensityAmplification({ periodizationPhase }) {
  const phase = typeof periodizationPhase === 'string' ? periodizationPhase.toUpperCase() : null;
  const amplified = phase === HIGH_INTENSITY_PHASES.PEAK || phase === HIGH_INTENSITY_PHASES.LOAD;
  return {
    amplified,
    phase: phase ?? '',
    rationale: amplified
      ? `high_intensity_phase_${phase}_form_conservative_amplification_q11_b_safety_emphasis`
      : `phase_${phase ?? 'unknown'}_no_amplification_default_tempo`,
  };
}

/**
 * Hook D12 — Deload week mind-muscle unlock signal per Cluster D verbatim Q12=D.
 *
 * Phase = DELOAD (W4) → Tempo unlock mind-muscle cues even on T0 tier (recovery
 * week, lower load = bandwidth for technique focus). Override tier-aware default.
 *
 * @param {Object} input
 * @param {string} [input.periodizationPhase]
 * @returns {import('./types.js').DeloadMindMuscleUnlockSignal}
 */
export function detectDeloadMindMuscleUnlock({ periodizationPhase }) {
  const phase = typeof periodizationPhase === 'string' ? periodizationPhase.toUpperCase() : null;
  const unlocked = phase === DELOAD_PHASE;
  return {
    unlocked,
    overridesTierDefault: unlocked,
    rationale: unlocked
      ? 'deload_phase_w4_mind_muscle_unlock_q12_d_recovery_week_technique_focus_override_tier_default'
      : `phase_${phase ?? 'unknown'}_no_deload_unlock_tier_default_applies`,
  };
}

/**
 * Hook D13 — Energy DOWN → slow eccentric universal signal per Cluster D
 * verbatim Q13=B (Gemini self-flagged ROM partial REJECT corect).
 *
 * Energy DOWN signal (per §9.3) → Tempo emite slow eccentric universal cue.
 * NU ROM partial — ROM partial = injury risk amplification REJECT. Slow
 * eccentric universal compatible cu MRV invariant 1 immutable Q8=A §9.3
 * (NU sub-Floor sub-MEV).
 *
 * @param {Object} input
 * @param {string} [input.energyDirection]         - 'UP' | 'DOWN' | 'NONE'
 * @returns {import('./types.js').EnergyDownSlowEccentricSignal}
 */
export function detectEnergyDownSlowEccentric({ energyDirection }) {
  const dir = typeof energyDirection === 'string' ? energyDirection.toUpperCase() : null;
  const applied = dir === ENERGY_DIRECTION.DOWN;
  /** @type {import('./types.js').EnergyDirection} */
  const normalized = (dir === ENERGY_DIRECTION.UP || dir === ENERGY_DIRECTION.DOWN || dir === ENERGY_DIRECTION.NONE)
    ? dir
    : ENERGY_DIRECTION.NONE;
  return {
    applied,
    energyDirection: normalized,
    rationale: applied
      ? 'energy_down_slow_eccentric_universal_q13_b_compatible_mrv_invariant_1_no_rom_partial_reject_corect'
      : `energy_${normalized.toLowerCase()}_no_slow_eccentric_modulation_default_tempo`,
  };
}

/**
 * Hook D14 — RIR Matrix form breakdown user toggle → +1 auto-bump next set
 * signal per Cluster D verbatim Q14=B.
 *
 * User toggles "form breakdown" mid-set → Tempo emite signal pentru orchestrator
 * layer downstream (auto-bump RIR target +1 next set). Anti-cascade: Tempo
 * emite signal, orchestrator applies — NU Tempo direct mutation per ADR 030
 * D2 thin scope LOCKED V1.
 *
 * @param {Object} input
 * @param {boolean} [input.formBreakdownToggled]   - User toggled "form breakdown" mid-set
 * @returns {import('./types.js').FormBreakdownAutoBumpSignal}
 */
export function emitFormBreakdownAutoBump({ formBreakdownToggled }) {
  const emit = formBreakdownToggled === true;
  return {
    emit,
    rirIncrement: emit ? 1 : 0,
    rationale: emit
      ? 'form_breakdown_toggled_emit_rir_plus_1_next_set_q14_b_orchestrator_layer_applies_anti_cascade'
      : 'no_form_breakdown_signal_no_rir_bump',
  };
}

/**
 * Hook D Q4=A V1 — RIR mismatch silent telemetry signal per Cluster B4 verbatim.
 *
 * V1: silent telemetry only CDL audit trail, NU active trigger. Engine NU
 * adjusts session current. V1.5+ candidate §9.5.6 Reconsideration Trigger 2:
 * V1.5 active trigger (form breakdown → Energy DOWN escalation Hook §9.3).
 *
 * @param {Object} input
 * @param {boolean} [input.userReportedFormBreakdown]
 * @param {number} [input.rirMatrixExpected]       - Expected RIR per Matrix
 * @param {number} [input.rirActual]               - Actual RIR user reported
 * @returns {import('./types.js').RirMismatchSilentTelemetrySignal}
 */
export function detectRirMismatchSilentTelemetry({
  userReportedFormBreakdown,
  rirMatrixExpected,
  rirActual,
}) {
  const formBreakdown = userReportedFormBreakdown === true;
  const expected = Number.isFinite(rirMatrixExpected) ? rirMatrixExpected : null;
  const actual = Number.isFinite(rirActual) ? rirActual : null;
  // Mismatch = form breakdown reported AND RIR actual significantly diverges from expected.
  // V1 conservative: form_breakdown == true AND |actual - expected| >= 1 RIR.
  const divergence = (expected !== null && actual !== null) ? Math.abs(actual - expected) : 0;
  const flagged = formBreakdown && divergence >= 1;
  return {
    flagged,
    behavior: RIR_MISMATCH_BEHAVIOR_V1,
    rationale: flagged
      ? `rir_mismatch_form_breakdown_divergence_${divergence}_silent_telemetry_only_q4_a_v1_no_active_trigger`
      : 'no_rir_mismatch_signal_no_telemetry_emit',
  };
}

/**
 * Convergence Guard reference per §9.5 cross-ref verbatim — ADR 009 §AMENDMENT
 * 2026-05-05 birou after canonical SSOT.
 *
 * **NU duplicate rule logic în Tempo module** — reference ONLY (rule =
 * behavioral validation cross-cutting all tier transitions T0→T1→T2, NU
 * Tempo specific).
 *
 * Returns metadata describing where Convergence Guard lives — caller (orchestrator
 * layer) calls actual T2 Unlock evaluation via `src/coach/orchestrator/utilities/
 * convergenceGuard.js` (Phase 1-2 foundation commit `5a16550` reusable). Pattern
 * from §9.4 Bayesian commit `8615ec1` precedent.
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
    note: 'Convergence Guard "T2 Unlock" rule = behavioral validation cross-cutting NU Engine Tempo specific. '
          + 'Tempo module references ONLY — actual T2 Unlock evaluation lives in '
          + 'src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator layer Phase 1-2 foundation commit 5a16550). '
          + 'Mirrors §9.4 Bayesian Nutrition crossEngineHooks pattern commit 8615ec1 precedent.',
  });
}

/**
 * Forward Constraint Object pass-through immutable Hook 1 per §1.10 Pipeline
 * Order LOCKED V1. Engine Tempo NU mutate Periodization Constraint Object
 * frozen — propagates downstream Specialization/Warm-up/Deload.
 *
 * @param {Object|null|undefined} constraint
 * @returns {Object|null}
 */
export function forwardConstraintObject(constraint) {
  if (!constraint || typeof constraint !== 'object') return null;
  return Object.isFrozen(constraint) ? constraint : Object.freeze({ ...constraint });
}
