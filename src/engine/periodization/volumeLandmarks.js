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
  EXPERIENCE_MODIFIERS,
  MARIA_FUNCTIONAL_MAPPING,
  PERSONA_AGE_BOUNDARIES,
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  BIG11_EN_TO_RO_MAP,
} from './constants.js';
import { getRecoveryByGroup, mergeAerobicRecovery } from '../muscleRecovery.js';

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
 * Audit fix 2026-06-07 (HIGH-1): the onboarding Goal vocab is
 * `auto/forta/masa/slabire/mentenanta` (onboardingStore.ts:19) and the raw
 * string is threaded straight to the engine — but this chain only knew the
 * canonical EN vocab, so `masa`/`mentenanta`/`auto` all fell through to the
 * hipertrofie default (modifier 1.0). A user who picked Mentenanta trained at
 * FULL hypertrophy volume. Map the onboarding vocab explicitly: `masa`→hipertrofie
 * (mass = full hypertrophy dose, the prior fall-through was coincidentally
 * correct), `mentenanta`→sanatate (the 0.50 MAINTENANCE modifier that exists for
 * exactly this case but was never reached), `auto`→hipertrofie (sensible default
 * dose; nutrition auto-detect is handled separately by goalPhaseForGoal).
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
  // Onboarding vocab: masa = mass-gain (full hypertrophy dose). auto = no explicit
  // goal → sensible default dose (full hypertrophy); nutrition phase auto-detects
  // separately (goalPhaseForGoal returns undefined for 'auto').
  if (g.startsWith('masa') || g.startsWith('auto')) return 'hipertrofie';
  if (g.startsWith('forta') || g.startsWith('strength')) return 'forta';
  if (g.startsWith('recompozit') || g.startsWith('recomp')) return 'recompozitie';
  if (g.startsWith('slabire') || g.startsWith('weight') || g.startsWith('fat-loss') || g.startsWith('fat loss')) return 'slabire';
  // Onboarding vocab: mentenanta = maintenance → the sanatate (0.50) modifier
  // (longevitate was merged into mentenanta; both = MAINTAIN phase).
  if (g.startsWith('mentenanta') || g.startsWith('sanatate') || g.startsWith('health')) return 'sanatate';
  return 'hipertrofie';
}

/**
 * Resolve experience id from user object — case + diacritic insensitive, accepts
 * BOTH the RO onboarding vocab (incepator/intermediar/avansat) and the EN bucket
 * (beginner/intermediate/advanced) the schedule adapter normalizes to.
 *
 * Audit fix 2026-06-07 (HIGH/MED schedule): volume keyed only on age (persona) +
 * goal, so a 25yo beginner got the same full dose as a 25yo advanced lifter.
 * This resolves the onboarding `experience` field into the EXPERIENCE_MODIFIERS
 * scalar so a novice starts at a lower (near-MEV) weekly volume.
 *
 * Defaults to 'avansat' (1.00 = full dose) when missing/unknown so the legacy
 * call path (no experience threaded) stays byte-identical to today.
 *
 * @param {{experience?: string}} [user]
 * @returns {'incepator'|'intermediar'|'avansat'}
 */
export function resolveExperienceId(user) {
  if (!user || typeof user.experience !== 'string') return 'avansat';
  const e = user.experience
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (e.startsWith('incepator') || e.startsWith('beginner') || e.startsWith('novice')) return 'incepator';
  if (e.startsWith('intermediar') || e.startsWith('intermediate')) return 'intermediar';
  if (e.startsWith('avansat') || e.startsWith('advanced')) return 'avansat';
  return 'avansat';
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
 *   target = MAV_baseline × persona × recovery × goal × experience × blockScaling × phaseVolMul
 *   capped at MRV_baseline (NU multiplied — Israetel MRV is the absolute ceiling)
 *
 * §experience-volume 2026-06-07 (audit HIGH/MED): the experience modifier
 * (EXPERIENCE_MODIFIERS) composes multiplicatively so a beginner starts at a
 * LOWER weekly dose than an advanced lifter of the same age+goal. It is floored
 * at the per-group MEV so the beginner cut never sinks below the minimum
 * effective volume. `experienceId` is OPTIONAL: omitted → 'avansat' (1.00 = full
 * dose) AND the MEV floor is NOT applied, so the legacy call path stays byte-
 * identical to today (the floor only engages once experience is threaded).
 *
 * @param {Object} input
 * @param {string} input.muscleGroup
 * @param {'maria'|'gigica'|'marius'} input.personaId
 * @param {'hipertrofie'|'forta'|'recompozitie'|'slabire'|'longevitate'|'sanatate'} input.goalId
 * @param {number} input.blockScaling     - 1.00 / 1.10 / 1.15 per macrocycle
 * @param {number} input.phaseVolumeMul   - 0.55 (DELOAD) sau 1.00 (LOAD/LOAD+/PEAK)
 * @param {'incepator'|'intermediar'|'avansat'} [input.experienceId] - omitted → avansat (full dose, MEV floor off)
 * @param {boolean} [input.recoveryGreen]
 * @param {'low'|'high'} [input.recoveryStrength]
 * @param {Record<string, {mev:number, mav:number}>} [input.learned] - F6b V1 #10: per-user
 *   LEARNED landmarks keyed on ISRAETEL EN muscle (dp_learned_volume_v1). When present,
 *   `learned[muscleGroup].mav ?? baseline.MAV` drives the target and `.mev ?? baseline.MEV`
 *   the floor. Omitted / muscle absent → the `?? baseline` fallback = BYTE-IDENTICAL to today.
 * @returns {import('./types.js').MuscleVolumeTarget}
 */
export function computeMuscleVolumeTarget({
  muscleGroup,
  personaId,
  goalId,
  blockScaling,
  phaseVolumeMul,
  experienceId,
  recoveryGreen,
  recoveryStrength,
  learned,
}) {
  const baseline = ISRAETEL_BASELINES[muscleGroup];
  if (!baseline) {
    return { sets: 0, mev: 0, mav: 0, mrv: 0 };
  }

  // F6b V1 #10 — the LEARNED productive band overrides the static Israetel MAV/MEV
  // for this muscle when present (dp_learned_volume_v1 ON + enough history). The
  // `?? baseline` fallback guarantees byte-identical for any muscle with no learned
  // data, even when the flag is ON (spec §3c off-byte-identical proof).
  const learnedMu = learned && typeof learned === 'object' ? learned[muscleGroup] : undefined;
  const mavDriver = learnedMu && Number.isFinite(learnedMu.mav) && learnedMu.mav > 0 ? learnedMu.mav : baseline.MAV;
  const mevFloorVal = learnedMu && Number.isFinite(learnedMu.mev) && learnedMu.mev > 0 ? learnedMu.mev : baseline.MEV;

  const persona = PERSONA_MODIFIERS[personaId] ?? PERSONA_MODIFIERS.gigica;
  const goal = GOAL_MODIFIERS[goalId] ?? GOAL_MODIFIERS.hipertrofie;
  const recovery = recoveryGreenMultiplier({ recoveryGreen, recoveryStrength });
  const block = Number.isFinite(blockScaling) ? blockScaling : 1.0;
  const phase = Number.isFinite(phaseVolumeMul) ? phaseVolumeMul : 1.0;
  // §experience-volume — the modifier defaults to 1.0 (avansat / full dose) when
  // experience is absent OR explicitly avansat, so the legacy + advanced path is
  // byte-identical to today. A value <1.0 means a genuine experience CUT.
  const experience = typeof experienceId === 'string' ? (EXPERIENCE_MODIFIERS[experienceId] ?? 1.0) : 1.0;
  const experienceCuts = experience < 1.0;

  const raw = mavDriver * persona * recovery * goal * experience * block * phase;
  // MRV is the ABSOLUTE Israetel ceiling — never learned (the learned band only
  // moves the MAV target + MEV floor; the recoverable cap stays the literature hard cap).
  const cappedAtMrv = Math.min(raw, baseline.MRV);
  // MEV floor — a beginner/intermediate cut never drops below the minimum
  // effective dose for a worked group. Engaged ONLY when the experience modifier
  // actually cuts (<1.0), so the advanced/legacy result (incl. the deliberate
  // Maria-sanatate sub-MEV maintenance dose) is unchanged. A group with MEV 0
  // (abs/forearms) has no floor either way. Uses the learned MEV when present.
  const floored = experienceCuts ? Math.max(cappedAtMrv, mevFloorVal) : cappedAtMrv;
  const sets = Math.max(0, Math.round(floored));

  return {
    sets,
    mev: mevFloorVal,
    mav: mavDriver,
    mrv: baseline.MRV,
  };
}

/**
 * Compute full volume map across all 11 Israetel muscle groups.
 *
 * @param {Object} input - same shape as computeMuscleVolumeTarget without
 *   muscleGroup (incl. the optional §experience-volume `experienceId` + the F6b V1
 *   optional `learned` per-muscle landmark override — both spread through unchanged).
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
 * `now` is an injectable reference timestamp (default Date.now) threaded into
 * getRecoveryByGroup so the redistribution is DETERMINISTIC under a fixed clock
 * (the daily-plan adapter passes the same `now` it plans for). Omitting it
 * preserves the prior Date.now() default — backward compatible.
 *
 * `aerobicSessions` (optional) folds recent aerobic CLASSES into the recovery
 * STATE before redistributing: mergeAerobicRecovery only RAISES a `recovered`
 * group to `partial` (eases — never deepens an already-stressed group, never
 * reaches `fatigued`). So a leg group fresh from weights but hit by spinning
 * reads `partial` → the ×0.80 cut lands, while a group the user lifted heavy
 * stays at its (deeper) resistance state. Absent/empty → byte-identical to the
 * resistance-only path (graceful degradation, ADR 025).
 *
 * @param {Object<string, number>} volumeMap - Big 11 RO keyed → sets/week
 * @param {Array} logs - session logs for Recovery state input
 * @param {number} [now] - reference timestamp (default Date.now); inject for determinism
 * @param {Array<{type?: string, ts?: number, date?: string}>} [aerobicSessions] - aerobicStore sessions (eases fresh groups)
 * @returns {Object<string, number>} adjusted volumeMap (RO keyed)
 */
export function applyRecoveryStateRedistribution(volumeMap, logs, now = Date.now(), aerobicSessions) {
  const safeMap = volumeMap && typeof volumeMap === 'object' ? volumeMap : {};
  const hasAerobic = Array.isArray(aerobicSessions) && aerobicSessions.length > 0;
  // No resistance logs AND no aerobic → nothing to redistribute (unchanged map).
  if ((!Array.isArray(logs) || logs.length === 0) && !hasAerobic) return { ...safeMap };
  // Resistance recovery state (RO keyed). Empty/no logs → {} (all recovered).
  let recoveryState =
    Array.isArray(logs) && logs.length > 0 ? getRecoveryByGroup(logs, undefined, now) : {};
  // Fold aerobic in (eases recovered→partial only) when present — same RO key-space.
  if (hasAerobic) recoveryState = mergeAerobicRecovery(recoveryState, aerobicSessions, now);
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
