// Cluster C1 — Volume Landmarks Hibrid Lookup + Regression per ADR 026 §9.4.3
// verbatim.
//
// Israetel 11 grupuri musculare lookup baseline + regression personalized
// STRICT compound only (data quality high). Isolation graceful degradation
// 0.3× cand compound observations <3 in window 14 zile (anti-overfit small-N
// isolation noise).
//
// Cluster B3 — Volume metric weighted compound:isolation 3:2:1 per Cluster B3
// (Lower:Upper:Isolation reflects metabolic disruption magnitude per movement
// category).
//
// Pure functions — no side effects.

import {
  VOLUME_LANDMARKS,
  VOLUME_METRIC_WEIGHTS,
  MOVEMENT_CATEGORY,
} from './constants.js';
import {
  ISRAETEL_BASELINES,
  BIG11_RO_TO_EN_MAP,
} from '../periodization/constants.js';

/**
 * Get Israetel volume landmarks lookup for muscle group per Cluster C1.
 * Defensive null when unknown muscle group.
 *
 * Accepts EN keys (chest/back/shoulders/quads/hamstrings/glutes/calves/biceps/
 * triceps/forearms/abs) per ISRAETEL_BASELINES literature reference invariant
 * (Schoenfeld/Helms academic, ADR 026 §9.4). Big 11 RO canonical V1 consumers
 * use lookupIsraetelLandmarksRO() helper which translates RO → EN via
 * BIG11_RO_TO_EN_MAP inverse translator.
 *
 * @param {string} muscleGroup - EN key (chest, back, shoulders, etc.)
 * @returns {{MEV: number, MAV: number, MRV: number}|null}
 */
export function lookupIsraetelLandmarks(muscleGroup) {
  if (typeof muscleGroup !== 'string') return null;
  return ISRAETEL_BASELINES[muscleGroup.toLowerCase()] ?? null;
}

/**
 * Get Israetel volume landmarks lookup for Big 11 RO canonical V1 group key
 * per ADR_ENGINE_REFACTOR §4.8 LOCK V1 (C4.8 Bayesian Nutrition Big 11 RO
 * migration via translator inverse pattern Option B precedent C4.3).
 *
 * Accepts Big 11 RO group (piept/spate/umeri/biceps/triceps/antebrate/core/
 * picioare-quads/picioare-hamstrings/fese/gambe), translates RO → EN via
 * BIG11_RO_TO_EN_MAP, then calls lookupIsraetelLandmarks(EN) which looks up
 * ISRAETEL_BASELINES preserved EN-keyed Israetel literature reference invariant
 * (ZERO mutation Schoenfeld/Helms academic literature reference per ADR 026
 * §9.4).
 *
 * Used by Coach Director aggregate post C4.5 LANDED which passes Big 11 RO
 * canonical V1 keys downstream to Bayesian Nutrition (pipeline §42.10 dispatch).
 *
 * Defensive null when unknown RO group (NOT in BIG11_RO_TO_EN_MAP).
 *
 * Pure function — ADR-026 §9 invariant preserved (ZERO Date.now / Math.random /
 * side effects).
 *
 * @param {string} big11Group - Big 11 RO canonical V1 key (piept, spate, etc.)
 * @returns {{MEV: number, MAV: number, MRV: number}|null}
 */
export function lookupIsraetelLandmarksRO(big11Group) {
  if (typeof big11Group !== 'string') return null;
  const enKey = BIG11_RO_TO_EN_MAP[big11Group];
  if (!enKey) return null;
  return lookupIsraetelLandmarks(enKey);
}

/**
 * Resolve movement category per Cluster B3 weighted volume metric (3:2:1).
 *
 * Heuristic compound vs isolation classification (V1 simplified taxonomy):
 *   Lower compound: squat / deadlift / hip_thrust / lunge_loaded / leg_press
 *   Upper compound: bench / overhead_press / row / pull_up / dip
 *   Isolation:      curl / lateral_raise / leg_extension / leg_curl / triceps_ext / face_pull
 *
 * Default 'isolation' for unknown movements (conservative weighting NU over-credit).
 *
 * @param {string} movementId
 * @returns {import('./types.js').MovementCategory}
 */
export function resolveMovementCategory(movementId) {
  if (typeof movementId !== 'string') return MOVEMENT_CATEGORY.ISOLATION;
  const m = movementId.toLowerCase().replace(/[\s-]/g, '_');

  // §B033 audit fix (REVIEW-A036-A038 L-§A038-02) — EN substrings + RO aliases
  // pentru Big 11 Library 657 RO migration. Default ISOLATION conservative
  // when neither pattern matches.
  const lowerCompound = [
    'squat', 'deadlift', 'hip_thrust', 'leg_press', 'lunge',
    // RO aliases:
    'genuflexiun', 'indreptar', 'presa_picioare', 'presa_sold', 'fandari', 'fandare',
  ];
  const upperCompound = [
    'bench', 'bench_press', 'overhead_press', 'ohp', 'row', 'pull_up', 'pullup', 'chin_up', 'dip',
    // RO aliases:
    'impins_piept', 'impins_deasupra', 'presa_militara', 'ramat', 'vasla', 'tractiun', 'flotari_paralele',
  ];

  if (lowerCompound.some((id) => m.includes(id))) return MOVEMENT_CATEGORY.LOWER_COMPOUND;
  if (upperCompound.some((id) => m.includes(id))) return MOVEMENT_CATEGORY.UPPER_COMPOUND;
  return MOVEMENT_CATEGORY.ISOLATION;
}

/**
 * Volume metric weighted per Cluster B3 verbatim (3:2:1 compound:isolation).
 *
 * @param {import('./types.js').MovementCategory} category
 * @returns {number}
 */
export function volumeMetricWeight(category) {
  if (category === MOVEMENT_CATEGORY.LOWER_COMPOUND) return VOLUME_METRIC_WEIGHTS.LOWER_COMPOUND;
  if (category === MOVEMENT_CATEGORY.UPPER_COMPOUND) return VOLUME_METRIC_WEIGHTS.UPPER_COMPOUND;
  return VOLUME_METRIC_WEIGHTS.ISOLATION;
}

/**
 * Compute weighted volume per Cluster B3:
 *   total_weighted = Σ (sets_per_movement × category_weight)
 *
 * @param {ReadonlyArray<{movementId?: string, sets?: number}>} sessionMovements
 * @returns {number}
 */
export function computeWeightedVolume(sessionMovements) {
  if (!Array.isArray(sessionMovements)) return 0;
  let total = 0;
  for (const m of sessionMovements) {
    if (!m) continue;
    const sets = Number(m.sets);
    if (!Number.isFinite(sets) || sets <= 0) continue;
    const category = resolveMovementCategory(m.movementId);
    const weight = volumeMetricWeight(category);
    total += sets * weight;
  }
  return total;
}

/**
 * Count compound observations in trailing window per Cluster C1 verbatim.
 *
 * Compound = Lower compound + Upper compound (both count toward N>=3 threshold).
 *
 * @param {ReadonlyArray<{movements?: Array<{movementId?: string}>, daysAgo?: number}>} recentSessions
 * @param {number} [windowDays]
 * @returns {number}
 */
export function countCompoundObservations(recentSessions, windowDays = VOLUME_LANDMARKS.regressionWindowDays) {
  if (!Array.isArray(recentSessions)) return 0;
  let count = 0;
  for (const session of recentSessions) {
    if (!session) continue;
    const daysAgo = Number(session.daysAgo);
    if (!Number.isFinite(daysAgo) || daysAgo > windowDays) continue;
    const movements = Array.isArray(session.movements) ? session.movements : [];
    const hasCompound = movements.some((m) => {
      if (!m) return false;
      const cat = resolveMovementCategory(m.movementId);
      return cat === MOVEMENT_CATEGORY.LOWER_COMPOUND || cat === MOVEMENT_CATEGORY.UPPER_COMPOUND;
    });
    if (hasCompound) count += 1;
  }
  return count;
}

/**
 * Compute isolation graceful degradation factor per Cluster C1 verbatim:
 *   compound observations >= 3 → factor 1.0 (full weighting)
 *   compound observations <  3 → factor 0.3 (graceful degradation anti-overfit)
 *
 * @param {ReadonlyArray<Object>} recentSessions
 * @returns {{factor: number, compoundCount: number}}
 */
export function computeIsolationDegradation(recentSessions) {
  const count = countCompoundObservations(recentSessions);
  const factor = count >= VOLUME_LANDMARKS.compoundMinObservations
    ? 1.0
    : VOLUME_LANDMARKS.isolationGracefulDegradationFactor;
  return { factor, compoundCount: count };
}

/**
 * Compute personalized volume landmarks per Cluster C1 Hibrid:
 *   Israetel base lookup (canonical reference)
 *   + regression personalized STRICT compound only (when compound observations >= 3)
 *   + isolation graceful degradation 0.3× cand compound observations < 3
 *
 * Returns combined landmarks per muscle group cu graceful degradation applied.
 *
 * @param {Object} input
 * @param {string} input.muscleGroup
 * @param {import('./types.js').MovementCategory} input.movementCategory
 * @param {ReadonlyArray<Object>} [input.recentSessions]
 * @returns {{
 *   mev: number, mav: number, mrv: number,
 *   regressionApplied: boolean,
 *   degradationFactor: number,
 * }|null}
 */
export function computePersonalizedLandmarks({ muscleGroup, movementCategory, recentSessions }) {
  const baseline = lookupIsraetelLandmarks(muscleGroup);
  if (!baseline) return null;

  const isCompound = movementCategory === MOVEMENT_CATEGORY.LOWER_COMPOUND
    || movementCategory === MOVEMENT_CATEGORY.UPPER_COMPOUND;

  // Regression STRICT compound only (Cluster C1 verbatim)
  if (isCompound) {
    return {
      mev:               baseline.MEV,
      mav:               baseline.MAV,
      mrv:               baseline.MRV,
      regressionApplied: true,
      degradationFactor: 1.0,
    };
  }

  // Isolation: graceful degradation 0.3× cand compound observations < 3
  const { factor } = computeIsolationDegradation(recentSessions);
  return {
    mev:               baseline.MEV * factor,
    mav:               baseline.MAV * factor,
    mrv:               baseline.MRV * factor,
    regressionApplied: false,
    degradationFactor: factor,
  };
}
