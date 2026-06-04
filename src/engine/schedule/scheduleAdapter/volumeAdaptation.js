// ── Volume adaptation stages (M1 recovery / M2 weakness / redistribution) ──
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { getLaggingMuscles } from '../../muscleRecovery.js';
import {
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  BIG11_RO_TO_EN_MAP,
  ISRAETEL_BASELINES,
} from '../../periodization/constants.js';
import {
  toCanonicalRO,
  applyRecoveryStateRedistribution,
} from '../../periodization/volumeLandmarks.js';
import { toCanonicalEN } from './recoveryLogs.js';

// ── M2: weakness AMPLIFIES real volume toward MRV (D-weakness-amplify 2026-06-02) ──
// A lagging/weak group should get genuinely MORE volume (extra sets + likely an
// extra exercise) on its FRESH training days — not just front-of-session
// reordering (M0 positioning) — pushed UP toward its Israetel MRV ceiling.
//
// AMPLIFY_TOWARD_MRV = the fraction of the gap (current → MRV) we close. 0.50
// rationale: half-way to the absolute recoverable max is a decisive, felt bump
// (e.g. chest 14→18/wk under marius/hipertrofie) WITHOUT pinning the group at
// MRV (which Israetel reserves as a short overreach ceiling, not a steady-state
// target). It is a single tunable constant, NOT a per-group multiplier zoo.
// MRV is the HARD cap — the amplified value is clamped to it and NEVER exceeds.
const AMPLIFY_TOWARD_MRV = 0.50;

/**
 * Resolve the lagging Big-11 RO groups for the plan from the SAME persisted
 * sessions M1 flattens (userState.recentSessions → recovery LogEntry rows). The
 * recovery engine's getLaggingMuscles is pure: the adapter builds the { logs,
 * now } profile (reusing flattenSessionsToRecoveryLogs) and reads the result.
 * Returns most-lagging-first RO group ids (matching the weakGroups vocabulary).
 * Empty when there is no lagging signal (graceful degradation, ADR 025). Pure.
 *
 * @param {Array} recoveryLogs - flattened recovery LogEntry rows ({ex, ts, w})
 * @param {number} now - reference timestamp threaded for determinism
 * @returns {string[]} Big-11 RO group ids, most-lagging first
 */
export function laggingGroupsFromLogs(recoveryLogs, now) {
  const lagging = getLaggingMuscles({ logs: recoveryLogs, now });
  return lagging.map((l) => l.group);
}

/**
 * Amplify a weak group's weekly volume toward its Israetel MRV ceiling. The
 * budget is EN-keyed (chest/back/...) but weak groups arrive Big-11 RO
 * (specialization target / lagging) — the same vocabulary buildSession's
 * weakGroups uses — so each RO group is bridged to EN (BIG11_RO_TO_EN_MAP) to
 * look up its budget entry + MRV (ISRAETEL_BASELINES, EN-keyed).
 *
 * For each weak group: target = current + (MRV - current) × AMPLIFY_TOWARD_MRV,
 * clamped to MRV (HARD cap — never exceeds, never lowers a group already above
 * MRV). The larger entry flows through buildSession (which exempts weak groups
 * from the per-group slot cap) → more sets + possibly an extra exercise on the
 * weak group. Returns a NEW map. No weak groups → the map is returned unchanged
 * (graceful degradation, ADR 025). Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {string[]} weakGroupsRO - Big-11 RO weak/lagging group ids
 * @returns {Object<string, number>|null} amplified EN-keyed budget (null passes through)
 */
export function applyWeaknessAmplification(volumeMapEN, weakGroupsRO) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  if (!Array.isArray(weakGroupsRO) || weakGroupsRO.length === 0) return { ...volumeMapEN };
  const out = { ...volumeMapEN };
  for (const roGroup of weakGroupsRO) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
    if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) continue;
    if (typeof mrv !== 'number' || !Number.isFinite(mrv)) continue;
    if (current >= mrv) continue; // already at/above ceiling — never lower it
    const amplified = current + (mrv - current) * AMPLIFY_TOWARD_MRV;
    out[enKey] = Math.min(mrv, amplified); // HARD MRV cap — never exceed
  }
  return out;
}

/**
 * Apply muscle-recovery redistribution to the EN-keyed periodization volume
 * budget. The budget is EN-keyed (chest/back/...) but the recovery math is
 * RO-keyed (getRecoveryByGroup returns RO), so: EN→RO (toCanonicalRO) → cut tired
 * groups (applyRecoveryStateRedistribution: partial ×0.80, fatigued ×0.60) → RO→EN
 * (toCanonicalEN) so setsForGroup still resolves the budget. No logs / empty
 * recovery → applyRecoveryStateRedistribution returns the map unchanged → identical
 * to the pre-M1 chassis budget (graceful degradation, ADR 025). Pure.
 *
 * aerobicSessions (optional) are threaded into the RO stage so recent aerobic
 * CLASSES fold into the recovery state (eases fresh groups recovered→partial,
 * never deepens) — a hard spin class makes tomorrow's leg budget lighter. Absent
 * → byte-identical resistance-only path.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN keyed budget
 * @param {Array<{ex: string, ts: number, w: number}>} logs - recovery LogEntry[]
 * @param {number} now - reference timestamp threaded into recovery (determinism)
 * @param {Array<{type?: string, ts?: number, date?: string}>} [aerobicSessions] - aerobicStore sessions
 * @returns {Object<string, number>|null} adjusted EN-keyed budget (null passes through)
 */
export function applyRecoveryToVolumeBudget(volumeMapEN, logs, now, aerobicSessions) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const ro = toCanonicalRO(volumeMapEN);
  const adjustedRo = applyRecoveryStateRedistribution(ro, logs, now, aerobicSessions);
  return toCanonicalEN(adjustedRo);
}

/**
 * Recovery REDISTRIBUTION — the freed volume from a recovery-cut group flows to
 * the FRESH (recovered) groups trained in TODAY's SAME session, so a fatigued
 * chest on a push day becomes "lighter chest, HEAVIER shoulders/triceps" instead
 * of a collapsed session whose freed volume simply vanished.
 *
 * The recovery cut (applyRecoveryToVolumeBudget: partial ×0.80, fatigued ×0.60)
 * lowers a group's weekly budget; the difference (`balanced - recovered`) was
 * previously DROPPED — `computeSessionExerciseCount` + `sessionSetBudget` size each
 * group INDEPENDENTLY, so cutting chest never lifted shoulders. This reallocates
 * that freed volume to the cluster's fresh groups, proportional to their cluster
 * weight (CLUSTER_BIG6_TO_BIG11_WEIGHT), each HARD-capped at its own MRV
 * (ISRAETEL_BASELINES) so no fresh group is ever pushed over its recoverable max.
 *
 * SESSION-LOCAL: this returns a NEW budget consumed by buildSession for TODAY only;
 * the persisted weekly budget (`balancedTargets`) is never mutated, so chest is
 * normal again on a fresh day (a per-day emphasis shift, not a weekly reweight).
 *
 * Only groups in TODAY's cluster participate (both the freed-from and the
 * receive-into side) — the transfer is confined to the muscles this session trains.
 * If NO fresh group is in the cluster (everything's fried), there is nothing to
 * redistribute to → the cut budget passes through unchanged and the session
 * legitimately stays lighter. Balanced / all-recovered day → no group is cut →
 * freed total is 0 → the recovered map is returned untouched (byte-identical to
 * pre-feature). Pure + deterministic (state in, no globals).
 *
 * @param {Object<string, number>|null|undefined} balancedTargetsEN - pre-recovery-cut EN budget
 * @param {Object<string, number>|null|undefined} recoveredTargetsEN - post-recovery-cut EN budget
 * @param {string} cluster - today's Big-6 cluster id (push|pull|legs|upper|lower|full)
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryStateRO - RO recovery state (merged)
 * @returns {Object<string, number>|null} session-local EN budget (null/recovered passes through)
 */
export function redistributeRecoveredVolumeToFreshSessionGroups(
  balancedTargetsEN, recoveredTargetsEN, cluster, recoveryStateRO,
) {
  if (!recoveredTargetsEN || typeof recoveredTargetsEN !== 'object') {
    return recoveredTargetsEN ?? null;
  }
  if (!balancedTargetsEN || typeof balancedTargetsEN !== 'object') {
    return { ...recoveredTargetsEN };
  }
  const weights =
    CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster] || CLUSTER_BIG6_TO_BIG11_WEIGHT[FALLBACK_CLUSTER];
  const state = recoveryStateRO && typeof recoveryStateRO === 'object' ? recoveryStateRO : {};

  // Sum the weekly volume the cut groups (in today's cluster) gave up, and tally
  // the FRESH (recovered) cluster groups + their cluster weight so the transfer
  // is proportional. A group is "fresh" when its state is absent or 'recovered'.
  let freed = 0;
  let freshWeightTotal = 0;
  const freshGroupsRO = [];
  for (const roGroup of Object.keys(weights)) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const w = typeof weights[roGroup] === 'number' ? weights[roGroup] : 0;
    const groupState = state[roGroup] ?? 'recovered';
    if (groupState === 'partial' || groupState === 'fatigued') {
      const balanced = balancedTargetsEN[enKey];
      const recovered = recoveredTargetsEN[enKey];
      if (typeof balanced === 'number' && typeof recovered === 'number' && balanced > recovered) {
        freed += balanced - recovered;
      }
    } else if (w > 0) {
      freshGroupsRO.push(roGroup);
      freshWeightTotal += w;
    }
  }

  // Nothing freed (no cut group in the cluster) OR nowhere to send it (all
  // fried) → pass the recovered budget through unchanged (session stays light).
  if (freed <= 0 || freshWeightTotal <= 0 || freshGroupsRO.length === 0) {
    return { ...recoveredTargetsEN };
  }

  const out = { ...recoveredTargetsEN };
  for (const roGroup of freshGroupsRO) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current)) continue;
    const share = freed * (weights[roGroup] / freshWeightTotal);
    const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
    const bumped = current + share;
    out[enKey] = typeof mrv === 'number' && Number.isFinite(mrv)
      ? Math.min(mrv, bumped) // HARD MRV cap — a fresh group never exceeds its max
      : bumped;
  }
  return out;
}
