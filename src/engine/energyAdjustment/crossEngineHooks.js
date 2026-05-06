// Cluster 4 sub-section — Cross-Engine Hooks per ADR 026 §9.3.4 verbatim.
//
// Hook 1 (consume) ← Engine #1 Periodization Constraint Object frozen
//                    (volume_per_muscle Floor/Ceiling + intensity_pct_1rm
//                    + phase + deload_window) — read-only redistribuie
//                    INTERIOR coridorului.
// Hook 2 → Engine Deload Protocol soft override sub-Floor max 2 consecutive
//          → 3rd session escalation trigger Q9 anti-drift.
// Hook 3 ↔ Engine #3 Bayesian Nutrition σ variance modifier Q12=C bidirectional.
// Hook 4 (forward) → downstream engines (Bayesian/Tempo/Specialization/Deload)
//          Constraint Object pass-through immutable preserved per §1.10
//          Pipeline Order LOCKED V1.
//
// Anti-cascade safeguards:
//   - NU mutate Periodization output (immutable_snapshot frozen pass-through)
//   - MRV invariant 1 immutable Q8=A — Hard cap NU peste regardless adjustment
//   - Hard cap intensity 90% 1RM Layer C sanity bound preserved
//
// Pure functions — no side effects.

import {
  SUB_FLOOR_MAX_CONSECUTIVE,
  BAYESIAN_VARIANCE_MODIFIER,
  HARD_CAP_INTENSITY_PCT_1RM,
} from './constants.js';

/**
 * Read Periodization Constraint Object from ctx (Hook 1 consume frozen
 * read-only). Defensive defaults preserve total function semantics.
 *
 * @param {Object|null|undefined} constraint - Periodization Constraint Object
 * @returns {{
 *   intensityCorridor: {floor: number, ceiling: number},
 *   volumeCorridor: Object<string, {floor: number, ceiling: number}>,
 *   phase: string|null,
 *   deloadWindow: Object|null,
 * }}
 */
export function readPeriodizationCorridor(constraint) {
  if (!constraint || typeof constraint !== 'object') {
    return {
      intensityCorridor: { floor: 0.70, ceiling: 0.85 }, // hipertrofie defensive default
      volumeCorridor:    {},
      phase:             null,
      deloadWindow:      null,
    };
  }
  const i = constraint.intensity_pct_1rm;
  const intensityCorridor = (i && typeof i === 'object')
    ? {
        floor:   Number.isFinite(i.floor)   ? i.floor   : 0.70,
        ceiling: Number.isFinite(i.ceiling) ? i.ceiling : 0.85,
      }
    : { floor: 0.70, ceiling: 0.85 };
  const v = constraint.volume_per_muscle;
  const volumeCorridor = (v && typeof v === 'object') ? v : {};
  return {
    intensityCorridor,
    volumeCorridor,
    phase:        typeof constraint.phase === 'string' ? constraint.phase : null,
    deloadWindow: constraint.deload_window || null,
  };
}

/**
 * Apply adjustment magnitude to intensity corridor INTERIOR (NU peste Ceiling
 * NU sub Floor — anti-cascade safeguard preserve Periodization Hook 1 frozen
 * input). Hard cap 90% 1RM Layer C sanity bound enforced.
 *
 * @param {Object} input
 * @param {{floor: number, ceiling: number}} input.intensityCorridor
 * @param {number} input.adjustmentMagnitudePct  - Float în [-0.15, +0.15]
 * @returns {{floor: number, ceiling: number}}
 */
export function applyIntensityAdjustmentInterior({ intensityCorridor, adjustmentMagnitudePct }) {
  if (!intensityCorridor || typeof intensityCorridor !== 'object') {
    return { floor: 0.70, ceiling: 0.85 };
  }
  const range = intensityCorridor.ceiling - intensityCorridor.floor;
  if (!Number.isFinite(range) || range <= 0) {
    return { floor: intensityCorridor.floor, ceiling: intensityCorridor.ceiling };
  }
  const mag = Number.isFinite(adjustmentMagnitudePct) ? adjustmentMagnitudePct : 0;
  const shift = (mag * range);

  // Result floor/ceiling clamped INTERIOR Periodization corridor (anti-cascade)
  const newFloor = Math.max(intensityCorridor.floor, intensityCorridor.floor + Math.max(0, shift));
  const newCeilingRaw = Math.min(intensityCorridor.ceiling, intensityCorridor.ceiling + Math.min(0, shift));
  const newCeiling = Math.min(newCeilingRaw, HARD_CAP_INTENSITY_PCT_1RM); // Hard cap Layer C

  // Defensive symmetry: floor NU exceed ceiling
  return {
    floor:   Math.min(newFloor, newCeiling),
    ceiling: Math.max(newFloor, newCeiling),
  };
}

/**
 * Apply adjustment magnitude to volume corridor INTERIOR (NU peste MRV
 * Ceiling NU sub MEV Floor — MRV invariant 1 immutable Q8=A preserved).
 *
 * @param {Object} input
 * @param {Object<string, {floor: number, ceiling: number}>} input.volumeCorridor
 * @param {number} input.adjustmentMagnitudePct
 * @returns {Object<string, {floor: number, ceiling: number}>}
 */
export function applyVolumeAdjustmentInterior({ volumeCorridor, adjustmentMagnitudePct }) {
  if (!volumeCorridor || typeof volumeCorridor !== 'object') return {};
  const mag = Number.isFinite(adjustmentMagnitudePct) ? adjustmentMagnitudePct : 0;
  /** @type {Object<string, {floor: number, ceiling: number}>} */
  const result = {};
  for (const [muscle, corridor] of Object.entries(volumeCorridor)) {
    if (!corridor || typeof corridor !== 'object') continue;
    const floor = Number(corridor.floor) || 0;
    const ceiling = Number(corridor.ceiling) || 0;
    const range = ceiling - floor;
    if (range <= 0) {
      result[muscle] = { floor, ceiling };
      continue;
    }
    const shift = mag * range;

    // INTERIOR redistribuie — NU peste Ceiling (MRV invariant Q8=A) NU sub Floor (MEV)
    const newFloor = Math.max(floor, floor + Math.max(0, shift));
    const newCeiling = Math.min(ceiling, ceiling + Math.min(0, shift));
    result[muscle] = {
      floor:   Math.min(newFloor, newCeiling),
      ceiling: Math.max(newFloor, newCeiling),
    };
  }
  return result;
}

/**
 * Detect sub-Floor sustained — count consecutive sessions where adjusted
 * corridor would drop below Periodization Floor (composite signal: DOWN -15%
 * + Periodization Floor combined drops below MEV).
 *
 * Per Cluster 4 §9.3.4 Q9 anti-drift verbatim:
 *   Soft override sub-Floor allowed max 2 sessions consecutive (NU hard reject)
 *   3rd session sub-Floor → trigger Engine Deload Protocol escalation
 *
 * Caller passes recentSessions cu metadata { adjustmentDirection, subFloor }
 * — orchestrator-level annotation per session post-evaluation.
 *
 * @param {ReadonlyArray<{subFloor?: boolean}>} [recentSessions]
 * @returns {number}
 */
export function countConsecutiveSubFloorSessions(recentSessions) {
  if (!Array.isArray(recentSessions)) return 0;
  let count = 0;
  for (const s of recentSessions) {
    if (!s || s.subFloor !== true) break;
    count += 1;
  }
  return count;
}

/**
 * Emit Deload trigger signal Hook 2 cross-engine Engine Deload Protocol per
 * Q9 anti-drift verbatim. 3rd session sub-Floor → escalationTriggered = true.
 *
 * @param {Object} input
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @param {boolean} [input.currentSessionSubFloor]
 * @returns {import('./types.js').DeloadTriggerSignal}
 */
export function emitDeloadTrigger({ recentSessions, currentSessionSubFloor }) {
  const consecutivePrior = countConsecutiveSubFloorSessions(recentSessions);
  const consecutive = currentSessionSubFloor === true
    ? consecutivePrior + 1
    : 0;

  const escalationTriggered = consecutive > SUB_FLOOR_MAX_CONSECUTIVE;
  const reason = escalationTriggered
    ? `sub_floor_sustained_${consecutive}_consecutive_escalate_deload`
    : (consecutive > 0
        ? `sub_floor_${consecutive}_consecutive_within_max_2`
        : 'no_sub_floor_sustained');

  return {
    consecutiveSubFloorSessions: consecutive,
    escalationTriggered,
    reason,
  };
}

/**
 * Emit Bayesian σ variance modifier signal Hook 3 cross-engine Engine #3
 * Bayesian Nutrition per Q12=C sophisticated verbatim.
 *
 * V1 conservative pick: σ > σ_threshold → adjustment × 0.7 dampening factor.
 *
 * @param {Object} input
 * @param {number} input.adjustmentMagnitudePct
 * @param {number} [input.bayesianSigma]
 * @returns {import('./types.js').BayesianVarianceSignal}
 */
export function emitBayesianVarianceModifier({ adjustmentMagnitudePct, bayesianSigma }) {
  const mag = Number.isFinite(adjustmentMagnitudePct) ? adjustmentMagnitudePct : 0;
  const sigma = Number.isFinite(bayesianSigma) ? bayesianSigma : 0;
  const dampeningApplied = sigma > BAYESIAN_VARIANCE_MODIFIER.sigmaThresholdHigh;
  const post = dampeningApplied
    ? mag * BAYESIAN_VARIANCE_MODIFIER.dampeningFactor
    : mag;
  return {
    sigmaObserved:                     sigma,
    dampeningApplied,
    adjustmentMagnitudePostDampening:  post,
  };
}

/**
 * Forward Constraint Object pass-through immutable Hook 4 per §1.10 Pipeline
 * Order LOCKED V1. Engine Energy Adjustment NU mutate Periodization Constraint
 * Object frozen — propagates downstream Bayesian/Tempo/Specialization/Deload.
 *
 * Returns Periodization Constraint Object reference unchanged (caller responsible
 * to NOT mutate). When constraint missing, returns null.
 *
 * @param {Object|null|undefined} constraint
 * @returns {Object|null}
 */
export function forwardConstraintObject(constraint) {
  if (!constraint || typeof constraint !== 'object') return null;
  // Object.freeze defensive — though Periodization Hook 1 already freezes
  return Object.isFrozen(constraint) ? constraint : Object.freeze({ ...constraint });
}
