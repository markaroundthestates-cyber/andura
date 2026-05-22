// ══ RIR MATRIX ADAPTIVE — 4-tier intensity scoring ════════════════════════════
// LOCKED V1 per ADR_RIR_MATRIX_ADAPTIVE_v1 + §36.58 wording (4 intensity labels).
// Cross-ref: §36.16-§36.26 SUFLET ANDURA + §36.28-§36.35 SELF-CORRECTION.
//
// Single source of truth for RIR semantic. RIR↔RPE conceptual identity
// (RIR + RPE ≈ 10) is NOT encoded as a runtime lookup table — RIR_MATRIX
// boundaries below ARE the authoritative semantic. Consumers using "RPE"
// strings (e.g., src/engine/dp.js "RPE 10") apply the conceptual identity
// directly (RPE 10 == RIR 0 == LIMIT).
//
// Citation: Helms, E. R., Cronin, J., Storey, A., & Zourdos, M. C. (2016).
// "Application of the Repetitions in Reserve-Based Rating of Perceived
// Exertion Scale for Resistance Training." Strength & Conditioning Journal
// 38(4): 42-49.
//
// Cross-ref: ADR-ENGINE-MATH-LOCKED-VALUES §2.

/**
 * @typedef {Object} IntensityVerdict
 * @property {'LIMIT'|'HEAVY'|'CHALLENGING'|'COMFORTABLE'} key
 * @property {string} label
 * @property {number} rirMin
 * @property {number} rirMax
 */

/** @type {Record<string, IntensityVerdict>} */
export const RIR_MATRIX = {
  LIMIT:       { key: 'LIMIT',       label: '🔴 La limita',   rirMin: 0, rirMax: 1 },
  HEAVY:       { key: 'HEAVY',       label: '🟠 Greu',         rirMin: 1, rirMax: 2 },
  CHALLENGING: { key: 'CHALLENGING', label: '🟡 Provocator',   rirMin: 2, rirMax: 3 },
  COMFORTABLE: { key: 'COMFORTABLE', label: '🟢 Confortabil',  rirMin: 3, rirMax: Infinity },
};

/**
 * Map a numeric RIR value (reps in reserve) to a 4-tier intensity verdict.
 * @param {number} rir reps in rezerva (0 = la limita, 3+ = confortabil)
 * @returns {IntensityVerdict}
 */
export function rirToIntensity(rir) {
  if (rir <= 1) return RIR_MATRIX.LIMIT;
  if (rir <= 2) return RIR_MATRIX.HEAVY;
  if (rir <= 3) return RIR_MATRIX.CHALLENGING;
  return RIR_MATRIX.COMFORTABLE;
}

/**
 * Profile-aware + exercise-category-aware RIR target (per ADR EXT-1).
 * Strength compound → tighter target (RIR 1-2). Hipertrofie isolation → wider (RIR 2-3).
 * @param {{ profile: string, exerciseCategory: 'compound'|'isolation' }} ctx
 * @returns {{ targetRirMin: number, targetRirMax: number }}
 */
export function getTargetRirRange(ctx) {
  const isStrength = ctx.profile === 'STRENGTH' || ctx.profile === 'Forta';
  if (isStrength && ctx.exerciseCategory === 'compound') return { targetRirMin: 1, targetRirMax: 2 };
  if (isStrength) return { targetRirMin: 1, targetRirMax: 3 };
  // Hipertrofie default
  return { targetRirMin: 2, targetRirMax: 3 };
}
