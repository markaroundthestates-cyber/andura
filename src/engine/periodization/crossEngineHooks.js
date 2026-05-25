// Cluster 5 — Cross-Engine Hooks per ADR 026 §9.6 verbatim.
//
// Hook 1 → Engine #2 Goal Adaptation (kcal/macro modulate, NU override phase)
// Hook 2 → Engine #4 Deload Protocol (Periodization signal-only)
// Hook 3 → Engine #5 Energy Adjustment (session-level only, NU touch mesocycle)
// Hook 4 → Engine #6 Tempo + #7 Specialization (light coupling)
//
// Pipeline §42.10 sequential extension. Anti-cascade safeguards:
//   - Immutable snapshot at session start
//   - Hard cap MRV / 90% 1RM Layer C sanity bound
//
// Pure functions — no side effects.

import { HARD_CAP_INTENSITY_PCT_1RM, ISRAETEL_BASELINES } from './constants.js';

/**
 * Build immutable Constraint Object emitted to downstream pipeline engines
 * per §1.10 Pipeline Order Constraint Object Floor/Ceiling Range.
 *
 * Object.freeze applied recursively (shallow + intensity_pct_1rm + each muscle
 * corridor). Anti-cascade safeguard `immutable_snapshot: true` flag preserved.
 *
 * @param {Object} input
 * @param {import('./types.js').MesocyclePhase} input.phase
 * @param {Object<string, number>} input.volumeMap   - muscle → sets/week
 * @param {{floor: number, ceiling: number}} input.intensityCorridor
 * @param {import('./types.js').DeloadWindow} input.deloadWindow
 * @returns {import('./types.js').ConstraintObject}
 */
export function emitConstraintObject({ phase, volumeMap, intensityCorridor, deloadWindow }) {
  // Volume corridor per muscle: ceiling = min(target × 1.0, MRV), floor = MEV
  // clamped NU peste ceiling. The orchestrated volume target serves as ceiling
  // (engine downstream may reduce within corridor); MEV serves as floor (Goal
  // Adaptation NU below) EXCEPT sub-MEV target where floor = ceiling.
  /** @type {Object<string, {floor: number, ceiling: number}>} */
  const volumePerMuscle = {};
  for (const [muscle, sets] of Object.entries(volumeMap || {})) {
    const baseline = ISRAETEL_BASELINES[muscle];
    const floorRaw = baseline ? baseline.MEV : 0;
    const ceiling = Math.min(Number(sets) || 0, baseline ? baseline.MRV : Number(sets) || 0);
    // E-01: floor NU peste ceiling (paritate enforceHardCapIntensity:72).
    // Sub-MEV target (sanatate/longevitate varstnic) ramane ceiling real, NU
    // suprascris la MEV — pastreaza tinta mica = safety Maria 65.
    const floor = Math.min(floorRaw, ceiling);
    volumePerMuscle[muscle] = Object.freeze({ floor, ceiling });
  }

  const cappedIntensity = enforceHardCapIntensity(intensityCorridor);

  /** @type {import('./types.js').ConstraintObject} */
  const constraintObject = {
    intensity_pct_1rm:   cappedIntensity,
    volume_per_muscle:   Object.freeze(volumePerMuscle),
    phase,
    deload_window:       deloadWindow ? Object.freeze({ ...deloadWindow }) : null,
    immutable_snapshot:  true,
  };

  return Object.freeze(constraintObject);
}

/**
 * Hard cap intensity ceiling at 90% 1RM Layer C sanity bound per §9.6
 * Anti-cascade safeguards. Floor unchanged; ceiling clamped.
 *
 * @param {{floor?: number, ceiling?: number}} [corridor]
 * @returns {Readonly<{floor: number, ceiling: number}>}
 */
export function enforceHardCapIntensity(corridor) {
  const c = corridor && typeof corridor === 'object' ? corridor : {};
  const floorRaw = Number(c.floor);
  const ceilingRaw = Number(c.ceiling);
  const floor = Number.isFinite(floorRaw) ? Math.max(0, floorRaw) : 0;
  const ceilingCandidate = Number.isFinite(ceilingRaw) ? ceilingRaw : HARD_CAP_INTENSITY_PCT_1RM;
  const ceiling = Math.min(ceilingCandidate, HARD_CAP_INTENSITY_PCT_1RM);
  // Floor must NU exceed ceiling (defensive symmetry preserve)
  const safeFloor = Math.min(floor, ceiling);
  return Object.freeze({ floor: safeFloor, ceiling });
}

/**
 * Compute baseline intensity corridor per goal id. Mapped per Forta 0.70 goal
 * modifier emphasis high intensity vs Sanatate 0.50 emphasis low intensity:
 *
 * - Forta:        floor 0.78, ceiling 0.90 (capped Layer C)
 * - Hipertrofie:  floor 0.70, ceiling 0.85
 * - Recompozitie: floor 0.65, ceiling 0.80
 * - Longevitate:  floor 0.55, ceiling 0.75
 * - Sanatate:     floor 0.50, ceiling 0.70
 *
 * Ranges derive Israetel/Helms canonical hypertrophy/strength bands; Bugatti
 * craft V1 conservative — NU literature exhaustive enumeration, scope V1 spec.
 * Reconsideration trigger §9.7 Cluster 5 sub-trigger 7 (cross-hook ceiling
 * rule post-Beta).
 *
 * @param {string} goalId
 * @returns {{floor: number, ceiling: number}}
 */
export function intensityCorridorForGoal(goalId) {
  switch (goalId) {
    case 'forta':        return { floor: 0.78, ceiling: 0.90 };
    case 'hipertrofie':  return { floor: 0.70, ceiling: 0.85 };
    case 'recompozitie': return { floor: 0.65, ceiling: 0.80 };
    case 'longevitate':  return { floor: 0.55, ceiling: 0.75 };
    case 'sanatate':     return { floor: 0.50, ceiling: 0.70 };
    default:             return { floor: 0.70, ceiling: 0.85 }; // hipertrofie default
  }
}
