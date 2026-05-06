// Cluster D — Cross-Engine Integration per ADR 026 §9.5.4 verbatim.
//
// D11 Periodization high intensity → form-conservative amplification (Q11=B)
// D12 Deload week → mind-muscle unlock (Q12=D, handled în mindMuscle.isMindMuscleActive())
// D13 Energy DOWN → slow eccentric universal NU ROM partial (Q13=B Gemini self-flagged ROM partial REJECT)
// D14 RIR Matrix form breakdown user toggle → +1 auto-bump next set (Q14=B)
// B4 RIR mismatch silent telemetry V1 only (Q4=A NU active trigger V1)
//
// Anti-cascade safeguards:
//   - NU mutate Constraint Object frozen upstream (Periodization §9.1 Cluster 5
//     + Goal Adaptation §9.2 + Energy §9.3 + Bayesian §9.4 hooks)
//   - Tempo emite signals downstream, orchestrator layer applies (NU Tempo
//     direct mutation per ADR 030 D2 thin scope)
//
// Pure functions — no side effects.

import {
  HIGH_INTENSITY_PHASES,
  ENERGY_DIRECTION,
  FORM_CONSERVATIVE_AMPLIFICATION,
  RIR_AUTO_BUMP,
  MESOCYCLE_PHASE,
} from './constants.js';

/**
 * Read Periodization Constraint Object from ctx (Hook 1 consume frozen read-only).
 * Defensive defaults preserve total function semantics.
 *
 * @param {Object|null|undefined} constraint
 * @returns {{phase: string|null, deloadWindow: Object|null}}
 */
export function readPeriodizationCorridor(constraint) {
  if (!constraint || typeof constraint !== 'object') {
    return { phase: null, deloadWindow: null };
  }
  return {
    phase:        typeof constraint.phase === 'string' ? constraint.phase : null,
    deloadWindow: constraint.deload_window || null,
  };
}

/**
 * Cluster D11 Q11=B Periodization high intensity → form-conservative amplification.
 *
 * Periodization phase = PEAK or LOAD+ (high_intensity == true) → Tempo emite
 * form-conservative amplification (slower eccentric, controlled concentric,
 * safety emphasis).
 *
 * Anti-cascade preserve §1.10 Pipeline Order: Tempo NU override Periodization
 * phase, only modulates form cue style intensity-aware.
 *
 * @param {string|null|undefined} periodizationPhase
 * @returns {import('./types.js').FormConservativeSignal}
 */
export function evaluateFormConservativeAmplification(periodizationPhase) {
  const phase = typeof periodizationPhase === 'string' ? periodizationPhase : null;
  const isHigh = HIGH_INTENSITY_PHASES.includes(phase);
  return {
    amplified:           isHigh,
    amplificationFactor: isHigh ? FORM_CONSERVATIVE_AMPLIFICATION : 1.0,
    reason: isHigh
      ? `periodization_phase_${phase}_high_intensity_form_conservative_amplification`
      : 'periodization_phase_normal_no_amplification',
  };
}

/**
 * Cluster D12 Q12=D Deload week → mind-muscle unlock.
 *
 * Periodization phase = DELOAD (W4) → mind-muscle override tier-aware default.
 * Recovery week, lower load = bandwidth for technique focus.
 *
 * @param {string|null|undefined} periodizationPhase
 * @returns {boolean}
 */
export function isDeloadWeekUnlock(periodizationPhase) {
  return periodizationPhase === MESOCYCLE_PHASE.DELOAD;
}

/**
 * Cluster D13 Q13=B Energy DOWN → slow eccentric universal NU ROM partial.
 *
 * Energy DOWN signal (per §9.3 Engine Energy Adjustment) → Tempo emite slow
 * eccentric universal cue.
 *
 * NU ROM partial cue (Q13=B Daniel push-back Gemini self-flagged: ROM partial
 * = injury risk amplification, REJECT corect).
 *
 * Slow eccentric universal = compatible cu MRV invariant 1 immutable §9.3
 * (NU sub-Floor sub-MEV).
 *
 * @param {string|null|undefined} energyDirection
 * @returns {import('./types.js').SlowEccentricSignal}
 */
export function evaluateSlowEccentricSignal(energyDirection) {
  const dir = typeof energyDirection === 'string' ? energyDirection : ENERGY_DIRECTION.NONE;
  if (dir === ENERGY_DIRECTION.DOWN) {
    return {
      active: true,
      reason: 'energy_down_slow_eccentric_universal_q13b_rom_partial_rejected',
    };
  }
  return {
    active: false,
    reason: 'energy_baseline_or_up_no_slow_eccentric_override',
  };
}

/**
 * Cluster D14 Q14=B RIR Matrix form breakdown user toggle → +1 auto-bump next set.
 *
 * User toggles "form breakdown" mid-set → Tempo signals downstream (orchestrator-
 * level) auto-bump RIR target +1 next set.
 *
 * Anti-cascade: Tempo emite signal, orchestrator layer applies (NU Tempo direct
 * mutation per ADR 030 D2 thin scope).
 *
 * @param {Object} input
 * @param {boolean} [input.formBreakdownReported]
 * @returns {import('./types.js').RirAutoBumpSignal}
 */
export function evaluateRirAutoBumpSignal({ formBreakdownReported }) {
  return {
    bump_next_set:  formBreakdownReported === true,
    bump_amount:    formBreakdownReported === true ? RIR_AUTO_BUMP : 0,
    trigger_source: 'user_toggle_form_breakdown',
  };
}

/**
 * Cluster B4 Q4=A RIR mismatch silent telemetry V1 only verbatim.
 *
 * Q4=A V1: RIR mismatch (user report form breakdown vs RIR Matrix expected) =
 * silent telemetry only CDL audit trail.
 *
 * NU active trigger V1 — engine NU adjusts session current. V1.5+ candidate:
 * trigger Energy DOWN sau Tempo conservative escalation.
 *
 * Returns silent telemetry payload (orchestrator layer logs CDL — engine doesn't
 * write side effects per ADR 018 §2 contract).
 *
 * @param {Object} input
 * @param {number} [input.rirActual]
 * @param {number} [input.rirExpected]
 * @returns {{
 *   mismatchDetected: boolean,
 *   telemetryOnly: boolean,
 *   activeTrigger: boolean,
 *   delta: number|null,
 * }}
 */
export function evaluateRirMismatchTelemetry({ rirActual, rirExpected }) {
  const actual = Number(rirActual);
  const expected = Number(rirExpected);
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
    return {
      mismatchDetected: false,
      telemetryOnly:    true,
      activeTrigger:    false,
      delta:            null,
    };
  }
  const delta = actual - expected;
  // Mismatch threshold: |delta| > 1 RIR (Q4=A V1 conservative — finer thresholds
  // deferred V1.5+ candidate per active trigger Hook §9.3 escalation)
  const mismatch = Math.abs(delta) > 1;
  return {
    mismatchDetected: mismatch,
    telemetryOnly:    true,  // V1 LOCKED Q4=A — NU active trigger
    activeTrigger:    false, // V1.5+ candidate
    delta,
  };
}

/**
 * Forward Constraint Object pass-through immutable Hook (light coupling §1.10).
 *
 * Engine Tempo NU mutate upstream Constraint Object frozen — propagates
 * downstream Specialization/Warm-up/Deload.
 *
 * @param {Object|null|undefined} constraint
 * @returns {Object|null}
 */
export function forwardConstraintObject(constraint) {
  if (!constraint || typeof constraint !== 'object') return null;
  return Object.isFrozen(constraint) ? constraint : Object.freeze({ ...constraint });
}
