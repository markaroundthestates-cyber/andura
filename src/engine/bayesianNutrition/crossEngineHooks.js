// Cluster C — Cross-Engine Integration per ADR 026 §9.4.3 verbatim.
//
// C2 Cross-engine #2 (Goal Adaptation) — Engine #2 phase output (CUT/BULK/
//    MAINTAIN/RECOMP) = Engine #3 prior conditioning input. Disagreement flag
//    CDL cand Engine #2 phase ≠ Engine #3 inferred phase (Invariant 5 Medical
//    Safety protect — disagreement = Tier 1 silent flag, NU autonomous override)
//
// C3 Cross-engine #5 (Energy Adjustment) — Engine #5 readiness output =
//    pre-processing modulator Engine #3 variance σ. NU linear discount —
//    readiness scazut creste σ observatii recent semnaland zgomot inflamatie/
//    stres/cortisol. Neutral fallback T0 cold start (sigma_modifier = 1.0).
//
// E2 Edge cases Passive Mode tripwire (pregnant/post-bariatric/kidney) +
//    Special priors (>75 + ED history) + disclaimer onboarding.
//
// **Convergence Guard reference §9.4.6 — ADR 009 §AMENDMENT 2026-05-05 birou
//   after canonical SSOT. NU duplicate logic in Bayesian module — reference
//   ONLY (rule = behavioral validation cross-cutting all tier transitions
//   T0→T1→T2, NU Engine #3 specific).**
//
// Pure functions — no side effects.

import {
  ENERGY_VARIANCE_MODIFIER,
  CALIBRATION_TIERS,
} from './constants.js';

/**
 * Hook Engine #2 Goal Adaptation Disagreement flag CDL per Cluster C2 verbatim.
 *
 * Engine #2 phase output = Engine #3 prior conditioning input. Disagreement
 * flag CDL cand Engine #2 phase ≠ Engine #3 inferred phase. Disagreement =
 * Tier 1 silent flag, NU autonomous override (Invariant 5 Medical Safety).
 *
 * @param {Object} input
 * @param {string} [input.engine2Phase]                  - From Engine #2 Goal Adaptation
 * @param {string} [input.engine3InferredPhase]          - From this engine's Bayesian inference
 * @returns {import('./types.js').DisagreementFlagSignal}
 */
export function emitGoalAdaptationDisagreement({ engine2Phase, engine3InferredPhase }) {
  const e2 = typeof engine2Phase === 'string' ? engine2Phase.toUpperCase() : null;
  const e3 = typeof engine3InferredPhase === 'string' ? engine3InferredPhase.toUpperCase() : null;

  if (!e2 || !e3) {
    return {
      flagged:               false,
      engine2Phase:          e2 ?? '',
      engine3InferredPhase:  e3 ?? '',
      reason:                'insufficient_signal_no_disagreement_evaluation',
    };
  }

  const flagged = e2 !== e3;
  return {
    flagged,
    engine2Phase:          e2,
    engine3InferredPhase:  e3,
    reason: flagged
      ? `engine2_${e2.toLowerCase()}_vs_engine3_inferred_${e3.toLowerCase()}_tier_1_silent_flag_invariant_5_protect`
      : 'phases_aligned_no_disagreement',
  };
}

/**
 * Hook Engine #5 Energy Adjustment σ variance modifier per Cluster C3 verbatim.
 *
 * NU linear discount — readiness scazut (DOWN) creste σ observatii recent
 * (zgomot inflamatie/stres/cortisol). Neutral fallback T0 cold start
 * (sigma_modifier = 1.0 default until 14 zile observations).
 *
 * V1 conservative pick: readiness DOWN → σ × 1.30 amplify variance dampening.
 *
 * @param {Object} input
 * @param {string} [input.energyDirection]              - 'UP' | 'DOWN' | 'NONE'
 * @param {import('./types.js').CalibrationTier} input.tier
 * @returns {import('./types.js').EnergyVarianceSignal}
 */
export function applyEnergyVarianceModifier({ energyDirection, tier }) {
  // Neutral fallback T0 cold start (sigma_modifier = 1.0 default)
  if (tier === CALIBRATION_TIERS.T0) {
    return {
      readinessDirection:    typeof energyDirection === 'string' ? energyDirection : 'NONE',
      sigmaModifierApplied:  ENERGY_VARIANCE_MODIFIER.sigmaModifierNeutralT0,
      rationale:             'neutral_fallback_t0_cold_start_14_zile_observations',
    };
  }

  // T1+ established: readiness DOWN → σ × 1.30 amplify dampening
  if (energyDirection === 'DOWN') {
    return {
      readinessDirection:    'DOWN',
      sigmaModifierApplied:  ENERGY_VARIANCE_MODIFIER.sigmaAmplifyFactorOnReadinessDown,
      rationale:             'readiness_down_sigma_amplified_inflamatie_stres_cortisol_noise',
    };
  }

  return {
    readinessDirection:    typeof energyDirection === 'string' ? energyDirection : 'NONE',
    sigmaModifierApplied:  ENERGY_VARIANCE_MODIFIER.sigmaModifierNeutralT0,
    rationale:             'no_amplification_readiness_up_or_none',
  };
}

/**
 * Apply σ variance modifier to posterior sigma (caller post-conjugate update).
 *
 * @param {Object} input
 * @param {number} input.sigma
 * @param {number} input.modifier               - 1.0 neutral / >1.0 amplified
 * @returns {number}
 */
export function applySigmaModifier({ sigma, modifier }) {
  const s = Number.isFinite(sigma) && sigma > 0 ? sigma : 1.0;
  const m = Number.isFinite(modifier) && modifier > 0 ? modifier : 1.0;
  return s * m;
}

/**
 * Detect Passive Mode tripwire per Cluster E2 verbatim.
 *
 * Pregnant + post-bariatric + kidney disease = engine NU output adjustment,
 * deferral medical care.
 *
 * @param {Object} input
 * @param {{passiveMode: boolean, passiveModeConditions: string[]}} input.specialPriorsResult
 *   From priorPosterior.detectSpecialPriors()
 * @returns {import('./types.js').PassiveModeSignal}
 */
export function emitPassiveModeSignal({ specialPriorsResult }) {
  const active = Boolean(specialPriorsResult?.passiveMode);
  const conditions = Array.isArray(specialPriorsResult?.passiveModeConditions)
    ? specialPriorsResult.passiveModeConditions
    : [];
  return {
    active,
    conditions,
    medicalReferralRequired: active,
  };
}

/**
 * Convergence Guard reference per §9.4.6 verbatim — ADR 009 §AMENDMENT 2026-05-05
 * birou after canonical SSOT.
 *
 * **NU duplicate rule logic in Bayesian module** — reference ONLY (rule =
 * behavioral validation cross-cutting all tier transitions T0→T1→T2, NU
 * Engine #3 specific).
 *
 * Returns metadata describing where Convergence Guard lives — caller (orchestrator
 * layer) calls actual T2 Unlock evaluation via `src/coach/orchestrator/utilities/
 * convergenceGuard.js` (Phase 1-2 foundation commit `5a16550` reusable).
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
    note: 'Convergence Guard "T2 Unlock" rule = behavioral validation cross-cutting NU Engine #3 specific. '
          + 'Bayesian module references ONLY — actual T2 Unlock evaluation lives in '
          + 'src/coach/orchestrator/utilities/convergenceGuard.js (orchestrator layer). '
          + 'Decoupling safety/reward via Clean Signal rule preserved Invariant 5 Medical Safety.',
  });
}

/**
 * Forward Constraint Object pass-through immutable Hook 4 per §1.10 Pipeline
 * Order LOCKED V1. Engine Bayesian Nutrition NU mutate Periodization Constraint
 * Object frozen — propagates downstream Tempo/Specialization/Warm-up/Deload.
 *
 * @param {Object|null|undefined} constraint
 * @returns {Object|null}
 */
export function forwardConstraintObject(constraint) {
  if (!constraint || typeof constraint !== 'object') return null;
  return Object.isFrozen(constraint) ? constraint : Object.freeze({ ...constraint });
}
