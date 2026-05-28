// Cluster 3 — Volume Landmarks Israetel × Persona × Goal Modifiers per
// ADR 026 §9.4 verbatim.
//
// Israetel 11 grupuri musculare baseline MEV/MAV/MRV ×
//   persona modifiers (Maria 0.50 / Gigica 0.70 / Marius 1.00 + 10-15% bonus
//   recovery green) × goal modifiers (Hipertrofie 1.00 / Forta 0.70 /
//   Recompozitie 0.85 / Sanatate 0.50). §obiectiv-drop-longevitate 2026-05-28:
//   'longevitate' goal modifier dropped (semantic dup of sanatate).
// Maria 65 Dual-Layer functional → Israetel 6 movement patterns mapping per
//   §45.3 Q19 LOCKED.
//
// Pure functions only — no side effects, no state reads.

import {
  ISRAETEL_BASELINES,
  PERSONA_MODIFIERS,
  RECOVERY_GREEN_BONUS,
  GOAL_MODIFIERS,
  MARIA_FUNCTIONAL_MAPPING,
  PERSONA_AGE_BOUNDARIES,
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  BIG11_EN_TO_RO_MAP,
} from './constants.js';
import { getRecoveryByGroup } from '../muscleRecovery.js';

/**
 * Resolve persona id from user object. Priority:
 *  1. explicit user.persona ('maria'/'gigica'/'marius') — case-insensitive
 *  2. fallback user.age boundary (≥55 → maria; ≥30 → gigica; else marius)
 *  3. default 'gigica' when both missing (most common intermediate case)
 *
 * @param {{persona?: string, age?: number}} [user]
 * @returns {'maria'|'gigica'|'marius'}
 */
export function resolvePersonaId(user) {
  if (user && typeof user.persona === 'string') {
    const p = user.persona.toLowerCase();
    if (p === 'maria' || p === 'gigica' || p === 'marius') return p;
  }
  const age = user && Number(user.age);
  if (Number.isFinite(age)) {
    if (age >= PERSONA_AGE_BOUNDARIES.mariaMinAge) return 'maria';
    if (age >= PERSONA_AGE_BOUNDARIES.gigicaMinAge) return 'gigica';
    return 'marius';
  }
  return 'gigica';
}

/**
 * Resolve goal id from user object — case + diacritic insensitive normalization
 * (Forta → forta, Recompozitie → recompozitie, Sanatate → sanatate).
 * §obiectiv-drop-longevitate 2026-05-28: 'longevitate' branch dropped (UI Goal
 * dropped — semantic dup of mentenanta; persisted users migrated → mentenanta).
 *
 * @param {{goal?: string}} [user]
 * @returns {'hipertrofie'|'forta'|'recompozitie'|'slabire'|'sanatate'}
 */
export function resolveGoalId(user) {
  if (!user || typeof user.goal !== 'string') return 'hipertrofie';
  const g = user.goal
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (g.startsWith('hipertrofie') || g.startsWith('hypertrophy')) return 'hipertrofie';
  if (g.startsWith('forta') || g.startsWith('strength')) return 'forta';
  if (g.startsWith('recompozit') || g.startsWith('recomp')) return 'recompozitie';
  if (g.startsWith('slabire') || g.startsWith('weight') || g.startsWith('fat-loss') || g.startsWith('fat loss')) return 'slabire';
  if (g.startsWith('sanatate') || g.startsWith('sanatate') || g.startsWith('health')) return 'sanatate';
  return 'hipertrofie';
}

/**
 * Recovery green bonus multiplier per §9.4 ("+10-15% daca recovery green").
 * V1 conservative pick LOW (1.10) default green; HIGH (1.15) reserved future
 * Vitality Layer maturity calibration (signal strength gradient).
 *
 * @param {{recoveryGreen?: boolean, recoveryStrength?: 'low'|'high'}} [ctx]
 * @returns {number}
 */
export function recoveryGreenMultiplier(ctx) {
  if (!ctx || ctx.recoveryGreen !== true) return 1.0;
  return ctx.recoveryStrength === 'high' ? RECOVERY_GREEN_BONUS.HIGH : RECOVERY_GREEN_BONUS.LOW;
}

/**
 * Compute volume target (sets/week) for a muscle group, given persona + goal +
 * recovery + block scaling + phase. MRV cap absolut enforced (§9.5 Cluster 4
 * Hard limit invariant safety preservation + §9.6 Anti-cascade hard cap).
 *
 * Formula:
 *   target = MAV_baseline × persona × recovery × goal × blockScaling × phaseVolMul
 *   capped at MRV_baseline (NU multiplied — Israetel MRV is the absolute ceiling)
 *
 * @param {Object} input
 * @param {string} input.muscleGroup
 * @param {'maria'|'gigica'|'marius'} input.personaId
 * @param {'hipertrofie'|'forta'|'recompozitie'|'slabire'|'longevitate'|'sanatate'} input.goalId
 * @param {number} input.blockScaling     - 1.00 / 1.10 / 1.15 per macrocycle
 * @param {number} input.phaseVolumeMul   - 0.55 (DELOAD) sau 1.00 (LOAD/LOAD+/PEAK)
 * @param {boolean} [input.recoveryGreen]
 * @param {'low'|'high'} [input.recoveryStrength]
 * @returns {import('./types.js').MuscleVolumeTarget}
 */
export function computeMuscleVolumeTarget({
  muscleGroup,
  personaId,
  goalId,
  blockScaling,
  phaseVolumeMul,
  recoveryGreen,
  recoveryStrength,
}) {
  const baseline = ISRAETEL_BASELINES[muscleGroup];
  if (!baseline) {
    return { sets: 0, mev: 0, mav: 0, mrv: 0 };
  }

  const persona = PERSONA_MODIFIERS[personaId] ?? PERSONA_MODIFIERS.gigica;
  const goal = GOAL_MODIFIERS[goalId] ?? GOAL_MODIFIERS.hipertrofie;
  const recovery = recoveryGreenMultiplier({ recoveryGreen, recoveryStrength });
  const block = Number.isFinite(blockScaling) ? blockScaling : 1.0;
  const phase = Number.isFinite(phaseVolumeMul) ? phaseVolumeMul : 1.0;

  const raw = baseline.MAV * persona * recovery * goal * block * phase;
  const cappedAtMrv = Math.min(raw, baseline.MRV);
  const sets = Math.max(0, Math.round(cappedAtMrv));

  return {
    sets,
    mev: baseline.MEV,
    mav: baseline.MAV,
    mrv: baseline.MRV,
  };
}

/**
 * Compute full volume map across all 11 Israetel muscle groups.
 *
 * @param {Object} input - same shape as computeMuscleVolumeTarget without muscleGroup
 * @returns {Object<string, number>}  - muscleGroup → sets/week
 */
export function computeVolumeMap(input) {
  const muscleGroups = Object.keys(ISRAETEL_BASELINES);
  const result = {};
  for (const mg of muscleGroups) {
    const target = computeMuscleVolumeTarget({ ...input, muscleGroup: mg });
    result[mg] = target.sets;
  }
  return result;
}

/**
 * Maria 65 Dual-Layer functional → Israetel mapping per §9.4 + §45.3 Q19.
 * Input movement pattern → array of Israetel muscle groups it targets.
 *
 * @param {string} pattern - 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'rotate'
 * @returns {ReadonlyArray<string>}
 */
export function mariaFunctionalToIsraetel(pattern) {
  if (typeof pattern !== 'string') return [];
  const key = pattern.toLowerCase();
  return MARIA_FUNCTIONAL_MAPPING[key] ?? [];
}

// ══ ADR_ENGINE_REFACTOR §4.3 LOCK V1 helpers — Hybrid template Decision §3.3
// + translator EN→RO + Muscle Recovery state consume layer. Pure additive.

/**
 * Resolve weight allocation for a Big 11 RO group within a Big 6 cluster
 * per ADR_ENGINE_REFACTOR §4.3 Decision §3.3 Hybrid. Returns 0 dacă cluster
 * unknown OR group absent în cluster weight map.
 *
 * @param {string} cluster - 'push'|'pull'|'legs'|'upper'|'lower'|'full'
 * @param {string} big11Group - Big 11 RO canonical V1 (piept/spate/umeri/etc.)
 * @returns {number} weight 0.0-1.0
 */
export function clusterWeightForGroup(cluster, big11Group) {
  const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
  if (!weights) return 0;
  return weights[big11Group] ?? 0;
}

/**
 * Translate a volume map keyed Big 11 EN (ISRAETEL_BASELINES literature
 * reference) → Big 11 RO canonical V1 keys per ADR_ENGINE_REFACTOR §4.1.
 *
 * Keys absent în BIG11_EN_TO_RO_MAP pass through unchanged (defensive: already
 * RO or unknown group → preserved). Used by downstream consumers (C4.4
 * Specialization + C4.5 Coach Director phases ulterioare cap-coadă ADR §4)
 * to migrate to canonical V1 keys without breaking Periodization internal
 * literature reference.
 *
 * @param {Object<string, number>} volumeMap - Big 11 EN keys → sets/week
 * @returns {Object<string, number>} - Big 11 RO keys → sets/week
 */
export function toCanonicalRO(volumeMap) {
  if (!volumeMap || typeof volumeMap !== 'object') return {};
  const result = {};
  for (const [key, value] of Object.entries(volumeMap)) {
    const roKey = BIG11_EN_TO_RO_MAP[key] ?? key;
    result[roKey] = value;
  }
  return result;
}

/**
 * Phase calibration: redistribute volume per Big 11 group based on Muscle
 * Recovery state per ADR_ENGINE_REFACTOR §4.3 acceptance criteria. Recovered
 * groups → normal weight; partial → −20%; fatigued → −40%.
 *
 * Input volumeMap MUST be keyed cu Big 11 RO canonical V1 keys (translate via
 * toCanonicalRO() upstream dacă origin is ISRAETEL_BASELINES EN). Muscle
 * Recovery state per getRecoveryByGroup() returns RO keys per ADR_ENGINE_REFACTOR
 * §4.1 LOCK V1 muscleRecovery.js post-C4.1 migration.
 *
 * Pure modifier layer applied post-volumeMap compute. NU mutate algorithm
 * phase cycle semantics (LOAD/LOAD+/PEAK/DELOAD untouched).
 *
 * @param {Object<string, number>} volumeMap - Big 11 RO keyed → sets/week
 * @param {Array} logs - session logs for Recovery state input
 * @returns {Object<string, number>} adjusted volumeMap (RO keyed)
 */
export function applyRecoveryStateRedistribution(volumeMap, logs) {
  const safeMap = volumeMap && typeof volumeMap === 'object' ? volumeMap : {};
  if (!Array.isArray(logs) || logs.length === 0) return { ...safeMap };
  const recoveryState = getRecoveryByGroup(logs);
  const adjusted = {};
  for (const [group, sets] of Object.entries(safeMap)) {
    const state = recoveryState[group];
    let multiplier = 1.0;
    if (state === 'partial') multiplier = 0.80;
    else if (state === 'fatigued') multiplier = 0.60;
    adjusted[group] = Math.max(0, (Number(sets) || 0) * multiplier);
  }
  return adjusted;
}
