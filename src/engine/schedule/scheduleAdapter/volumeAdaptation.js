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
 * EMPHASIS de-emphasis — the REST-DOWN half of the specialization engine's
 * zero-sum trade (F emphasis-specialization). The engine already computes
 * `volume_modifier.otherGroupsReductionPct` (−0.25): every muscle group that is
 * NOT part of the user-picked emphasis relaxes toward its Israetel MEV by that
 * magnitude, redirecting recovery bandwidth to the emphasized target (which
 * rides applyWeaknessAmplification toward MRV separately). Modeled byte-for-byte
 * on applyFocusBias's de-emphasize branch: lerp current→MEV by |reductionPct|,
 * HARD-clamped to [MEV, MRV] — so a relaxed group is MAINTAINED at MEV, NEVER
 * below, never zero.
 *
 * The budget is EN-keyed (chest/back/...) but the emphasis groups arrive Big-11
 * RO — each protected RO group is bridged to EN (BIG11_RO_TO_EN_MAP). Any EN
 * group NOT in the protected set (the emphasized groups: target + its preset
 * siblings) is relaxed. Returns a NEW map. Empty protected set OR
 * reductionPct >= 0 → the map is returned unchanged (no-op, graceful per ADR
 * 025). Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {Set<string>|Array<string>} protectedGroupsRO - emphasized Big-11 RO groups to KEEP
 * @param {number} reductionPct - the engine's otherGroupsReductionPct (e.g. -0.25)
 * @returns {Object<string, number>|null} de-emphasized EN-keyed budget (null passes through)
 */
export function applyEmphasisDeEmphasis(volumeMapEN, protectedGroupsRO, reductionPct) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const magnitude = typeof reductionPct === 'number' && Number.isFinite(reductionPct)
    ? Math.abs(reductionPct)
    : 0;
  const protectedRO = protectedGroupsRO instanceof Set
    ? protectedGroupsRO
    : new Set(Array.isArray(protectedGroupsRO) ? protectedGroupsRO : []);
  if (magnitude <= 0 || protectedRO.size === 0) return { ...volumeMapEN };
  // EN keys the emphasis protects (target + preset siblings) — bridged from RO.
  const protectedEN = new Set();
  for (const ro of protectedRO) protectedEN.add(BIG11_RO_TO_EN_MAP[ro] ?? ro);
  const out = { ...volumeMapEN };
  for (const enKey of Object.keys(out)) {
    if (protectedEN.has(enKey)) continue; // emphasized → untouched (rides UP elsewhere)
    const current = out[enKey];
    const lm = ISRAETEL_BASELINES[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) continue;
    if (!lm) continue;
    // Lerp toward MEV by the engine's reduction magnitude (same shape as
    // applyFocusBias de-emph branch: current + (MEV - current) * magnitude).
    const biased = current + (lm.MEV - current) * magnitude;
    // HARD clamp to [MEV, MRV] — MAINTENANCE at MEV, never below, never zero.
    out[enKey] = Math.min(lm.MRV, Math.max(lm.MEV, biased));
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
  // Valid Big-6 clusters always resolve; an unknown cluster falls back to the
  // balanced full-body weight map (was a reference to an undefined FALLBACK_CLUSTER
  // identifier — latent, never reached for valid clusters). The trailing `|| {}`
  // keeps Object.keys() below safe (no-op redistribution) for any truly-unknown id.
  const weights =
    CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster] || CLUSTER_BIG6_TO_BIG11_WEIGHT.full || {};
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

// ══ BUILD F6a #30 — weekly volume distribution by recovery (F6a spec §4) ══════
// The intra-day redistribution above moves a fatigued group's freed volume to the
// fresh groups TODAY's cluster trains. #30 lifts that SAME mechanism to a WEEK-
// ahead allocation: a group whose recovery window has NOT elapsed (still partial/
// fatigued) hands its excess weekly budget to the groups that ARE fresh — so the
// week's set targets flow to the days a group is freshest, instead of wherever the
// positional split lands them. It RE-SKINS the existing redistribution kernel; no
// new redistribution math, no net volume (the freed total is conserved, MRV-capped,
// never below MEV, never zeroes a trained group).
//
// NO-OP PASS-THROUGH CONTRACT (mirrors applyEmphasisDeEmphasis): the caller gates
// this behind dp_weekly_recovery_alloc_v1 (default OFF) AND it self-no-ops when no
// group is partial/fatigued (all-recovered / no history) → returns a clone → the
// positional split + the EXISTING intra-day M1 path run exactly as today. Pure.
//
// @param {Object<string, number>|null|undefined} weeklyTargetsEN - Big-11 EN weekly budget
// @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryStateRO - RO recovery state
// @returns {Object<string, number>|null} re-allocated EN budget (null/empty passes through)
export function allocateWeeklyVolumeByRecovery(weeklyTargetsEN, recoveryStateRO) {
  if (!weeklyTargetsEN || typeof weeklyTargetsEN !== 'object') return weeklyTargetsEN ?? null;
  const state = recoveryStateRO && typeof recoveryStateRO === 'object' ? recoveryStateRO : {};

  // Freed = the share of a not-yet-recovered group's weekly budget we defer to a
  // fresher day (partial → 20%, fatigued → 40% — the SAME 0.80/0.60 recovery cut
  // factors the intra-day path uses). Trim never takes a group below its MEV.
  let freed = 0;
  let freshWeightTotal = 0;
  const freshGroupsRO = [];
  const out = { ...weeklyTargetsEN };
  const TRIM = { partial: 0.20, fatigued: 0.40 };
  // Walk every RO group that maps into the budget.
  for (const [roGroup, enKey] of Object.entries(BIG11_RO_TO_EN_MAP)) {
    const current = out[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) continue;
    const groupState = state[roGroup] ?? 'recovered';
    const lm = ISRAETEL_BASELINES[enKey];
    if (groupState === 'partial' || groupState === 'fatigued') {
      const mev = lm && typeof lm.MEV === 'number' ? lm.MEV : 0;
      const want = current * TRIM[groupState];
      // never below MEV — the deferred amount is bounded by the room above MEV.
      const give = Math.max(0, Math.min(want, current - mev));
      if (give > 0) {
        out[enKey] = current - give;
        freed += give;
      }
    } else {
      // weight a fresh group by its room-to-MRV so the deferred volume lands where
      // there is the most recoverable headroom (proportional, MRV-capped below).
      const room = lm && typeof lm.MRV === 'number' ? Math.max(0, lm.MRV - current) : 1;
      freshGroupsRO.push(roGroup);
      freshWeightTotal += room > 0 ? room : 0;
    }
  }

  // Nothing deferred OR nowhere fresh to send it → conserve by returning the clone
  // (the trims, if any, are reverted so total weekly volume is preserved exactly).
  if (freed <= 0 || freshWeightTotal <= 0 || freshGroupsRO.length === 0) {
    return { ...weeklyTargetsEN };
  }

  // Distribute the freed volume to fresh groups proportional to their room-to-MRV,
  // each HARD-capped at MRV (a fresh group never exceeds its recoverable max).
  let placed = 0;
  for (const roGroup of freshGroupsRO) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current)) continue;
    const lm = ISRAETEL_BASELINES[enKey];
    const mrv = lm && typeof lm.MRV === 'number' ? lm.MRV : Infinity;
    const room = Math.max(0, mrv - current);
    const share = freed * (room / freshWeightTotal);
    const add = Math.min(room, share);
    out[enKey] = current + add;
    placed += add;
  }
  // Conservation: any remainder that could not be placed (everyone at MRV) is
  // returned to the trimmed groups so the week's total is never reduced.
  if (placed < freed - 1e-9) {
    const remainder = freed - placed;
    // hand it back to the first trimmed group with headroom (simple, deterministic).
    for (const [roGroup, enKey] of Object.entries(BIG11_RO_TO_EN_MAP)) {
      const groupState = state[roGroup] ?? 'recovered';
      const isTrimmed = groupState === 'partial' || groupState === 'fatigued';
      if (isTrimmed && typeof out[enKey] === 'number') {
        out[enKey] += remainder;
        break;
      }
    }
  }
  return out;
}
