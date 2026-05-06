// Cluster 5 sub-section — Cross-Engine Hooks per ADR 026 §9.2 Cluster 5 +
// §1.10 Pipeline Order LOCKED V1.
//
// Hook 1 (consume) ← Engine #1 Periodization Constraint Object frozen
//                    (volume_per_muscle Floor/Ceiling + intensity_pct_1rm).
//                    Goal Adaptation redistribuie volume INTERIOR coridorului
//                    NU peste Ceiling NU sub Floor per §1.10 Pipeline Order.
//
// Pipeline §42.10 sequential. Anti-cascade safeguards preserved:
//   - NU mutate Periodization output (immutable_snapshot frozen pass-through)
//   - Hard cap 90% 1RM Layer C sanity bound respected (Periodization owns)
//
// Pure functions — no side effects.

import { PUSHBACK_RISK_THRESHOLDS } from './constants.js';

/**
 * Read intensity corridor from Periodization Constraint Object Hook 1
 * (volume_per_muscle + intensity_pct_1rm). Defensive defaults when constraint
 * missing (engine pure total function semantics per ADR 018 §2).
 *
 * @param {import('../periodization/types.js').ConstraintObject|null|undefined} constraint
 * @returns {{floor: number, ceiling: number}}
 */
export function readIntensityCorridor(constraint) {
  if (!constraint || typeof constraint !== 'object') {
    return { floor: 0.70, ceiling: 0.85 }; // hipertrofie defensive default
  }
  const c = constraint.intensity_pct_1rm;
  if (!c || typeof c !== 'object') {
    return { floor: 0.70, ceiling: 0.85 };
  }
  const floor = Number.isFinite(c.floor) ? c.floor : 0.70;
  const ceiling = Number.isFinite(c.ceiling) ? c.ceiling : 0.85;
  return { floor, ceiling };
}

/**
 * Read volume corridor per muscle from Periodization Constraint Object.
 * Defensive empty map when constraint missing.
 *
 * @param {import('../periodization/types.js').ConstraintObject|null|undefined} constraint
 * @returns {Object<string, {floor: number, ceiling: number}>}
 */
export function readVolumeCorridor(constraint) {
  if (!constraint || typeof constraint !== 'object') return {};
  const v = constraint.volume_per_muscle;
  if (!v || typeof v !== 'object') return {};
  return v;
}

/**
 * Apply Tier 3 conservative modifiers to Periodization corridor (volume cap
 * MEV-50% + intensity cap 75% 1RM Layer C sanity bound) verbatim §9.2.5.
 *
 * Anti-cascade preserve: result NU exceeds Periodization Ceiling, NU sub Floor
 * (consume read-only Hook 1 frozen).
 *
 * @param {Object} input
 * @param {{floor: number, ceiling: number}} input.intensityCorridor
 * @param {Object<string, {floor: number, ceiling: number}>} input.volumeCorridor
 * @param {boolean} input.applyTier3
 * @returns {{
 *   intensityCorridor: {floor: number, ceiling: number},
 *   volumeCorridor: Object<string, {floor: number, ceiling: number}>,
 * }}
 */
export function applyTier3Conservative({ intensityCorridor, volumeCorridor, applyTier3 }) {
  if (applyTier3 !== true) {
    return { intensityCorridor, volumeCorridor };
  }

  const intensityCap = PUSHBACK_RISK_THRESHOLDS.tier3MaxConservativeIntensityCap;
  const volMul = PUSHBACK_RISK_THRESHOLDS.tier3MaxConservativeVolMul;

  // Intensity cap clamp ceiling NU below floor
  const newCeiling = Math.min(intensityCorridor.ceiling, intensityCap);
  const newFloor = Math.min(intensityCorridor.floor, newCeiling);
  const adjustedIntensity = { floor: newFloor, ceiling: newCeiling };

  // Volume cap MEV-50% — apply multiplier to ceiling, preserve floor (MEV)
  /** @type {Object<string, {floor: number, ceiling: number}>} */
  const adjustedVolume = {};
  for (const [muscle, corridor] of Object.entries(volumeCorridor || {})) {
    const ceiling = (Number(corridor.ceiling) || 0) * volMul;
    const floor = Number(corridor.floor) || 0;
    adjustedVolume[muscle] = { floor, ceiling: Math.max(floor, ceiling) };
  }

  return { intensityCorridor: adjustedIntensity, volumeCorridor: adjustedVolume };
}

/**
 * Redistribute volume + intensity within Periodization corridor per Mode/Phase
 * multipliers (computeModePhaseMultipliers output) — anti-cascade safeguard:
 * result clamped Floor/Ceiling, NU peste Ceiling NU sub Floor.
 *
 * @param {Object} input
 * @param {{floor: number, ceiling: number}} input.intensityCorridor
 * @param {number} input.intensityMul    - From computeModePhaseMultipliers
 * @returns {{floor: number, ceiling: number}}
 */
export function redistributeIntensity({ intensityCorridor, intensityMul }) {
  if (!intensityCorridor || typeof intensityCorridor !== 'object') {
    return { floor: 0.70, ceiling: 0.85 };
  }
  const mul = Number.isFinite(intensityMul) && intensityMul > 0 ? intensityMul : 1.0;
  const range = intensityCorridor.ceiling - intensityCorridor.floor;
  const midPoint = intensityCorridor.floor + range / 2;
  const shift = (mul - 1) * range / 2;

  const newFloor = Math.max(intensityCorridor.floor, midPoint - range / 2 + shift);
  const newCeiling = Math.min(intensityCorridor.ceiling, midPoint + range / 2 + shift);

  return {
    floor:   Math.min(newFloor, newCeiling),
    ceiling: Math.max(newFloor, newCeiling),
  };
}
