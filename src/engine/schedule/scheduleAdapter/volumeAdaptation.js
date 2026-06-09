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

// #70-D5 — BEGINNER per-group weekly volume CAP. The frequency reframe (#74) tells
// a beginner asking high frequency that it's unwise, but the COMPOSED week still
// handed a beginner advanced-peak volume (Stefan: a beginner on a 5-day split got
// back 26 sets/wk — MRV/specialization territory). The volume policy is explicit:
// "Beginner: start at MEV / low-MAV; NO specialization volume" + "high MAV/MRV
// allowed ONLY as a ramp PEAK ... NEVER the default baseline." So a beginner's
// per-group weekly is HARD-capped at its MAV (the low-MAV ceiling — no peak), no
// matter how many days they push. This is a SAFETY clamp (over-MRV on a novice =
// junk volume + injury/burnout risk), applied AFTER all amplification so an
// emphasis/imbalance bump can never lift a beginner past MAV either. Pure.
const BEGINNER_TIER = 'T0';

/**
 * Cap every group's weekly volume at its Israetel MAV when the user is a BEGINNER
 * (profileTier T0). A beginner should sit at MEV/low-MAV, never the MRV peak (spec
 * _ENGINE_volume_policy). EN-keyed budget; each entry clamped to ISRAETEL_BASELINES
 * MAV. A group already at/below MAV is unchanged. Non-beginner tier → the map is
 * returned unchanged (byte-identical). Returns a NEW map. Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {string|null|undefined} profileTier - 'T0'|'T1'|'T2'|null
 * @returns {Object<string, number>|null} capped EN-keyed budget (null passes through)
 */
export function applyBeginnerVolumeCap(volumeMapEN, profileTier) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  if (profileTier !== BEGINNER_TIER) return { ...volumeMapEN };
  const out = { ...volumeMapEN };
  for (const enKey of Object.keys(out)) {
    const current = out[enKey];
    const mav = ISRAETEL_BASELINES[enKey]?.MAV;
    if (typeof current !== 'number' || !Number.isFinite(current)) continue;
    if (typeof mav !== 'number' || !Number.isFinite(mav)) continue;
    if (current > mav) out[enKey] = mav; // beginner ceiling = MAV (no peak)
  }
  return out;
}

// ══ W-Split GAP 4 — SENIOR / COLD-START safety (oracle grid 2026-06-09) ══════
// FLAG-GATED (dp_split_rebalance_v1). Two pure pieces the per-exercise brain
// can't reach: a PER-SESSION volume ceiling (so a 68-72yo beginner is not handed
// ~20+ sets in session 1) and a per-major-muscle weekly MAINTENANCE FLOOR (so no
// major muscle collapses to ~0 — the 72yo's back, a v-taper's relaxed back).
// Mirrors the existing age/experience shape (resolveExperienceId / the beginner
// cap) — extends, does not duplicate.

// Per-session set ceilings. A novice/senior tolerates far less per-session volume
// than a trained adult. NUMBERS: a sane novice full-body session is ~12-16 working
// sets (MEV/low-MAV across the body); a senior beginner sits at the low end. These
// CAPS engage ONLY for a senior (age ≥ 60) and/or a beginner — a trained adult gets
// no cap (the existing MEV/MRV + recovery clamps already govern them).
const SENIOR_AGE = 60;
const ELDERLY_AGE = 70;

/**
 * The MAX total working sets for ONE session, by age + experience. Returns null
 * when no cap applies (a non-senior non-beginner — the common case → buildSession
 * leaves the session untouched, byte-identical). The cap is a CEILING the
 * session-builder trims down to (never below the per-exercise MEV floor). Pure.
 *
 * @param {number|null|undefined} age - chronological onboarding age
 * @param {'incepator'|'intermediar'|'avansat'|null|undefined} experienceId
 * @returns {number|null} max session sets, or null (no cap)
 */
export function seniorSessionVolumeCap(age, experienceId) {
  const a = typeof age === 'number' && Number.isFinite(age) ? age : null;
  const beginner = experienceId === 'incepator';
  const elderly = a !== null && a >= ELDERLY_AGE;
  const senior = a !== null && a >= SENIOR_AGE;
  // Pick the tightest applicable ceiling. A 70+ beginner is the most fragile.
  if (elderly && beginner) return 14;
  if (elderly) return 16;
  if (senior && beginner) return 15;
  if (senior) return 18;
  if (beginner) return 18; // a young novice — cap the high-frequency bloat too
  return null; // trained adult → no per-session cap
}

// Major muscles that must never collapse to ~0 in a week (the big movers — a
// program that zeroes one of these is broken regardless of focus). Small/isolation
// groups (biceps, triceps, calves, forearms, abs) are allowed to fall to MEV/0 by
// a focus trade. RO keys (the budget is EN-keyed; bridged per entry).
const MAJOR_MUSCLES_RO = Object.freeze(['piept', 'spate', 'umeri', 'picioare-quads', 'picioare-hamstrings', 'fese']);

/**
 * Per-major-muscle weekly MAINTENANCE FLOOR — raise any MAJOR muscle whose weekly
 * budget fell below its Israetel MEV back UP to MEV, so a de-emphasis / collapse
 * never drops a big mover to ~0 (a de-emphasized group is MAINTAINED at MEV, never
 * abandoned — the same invariant applyFocusBias's de-emphasize branch states).
 * Only RAISES (a floor); never lowers a group above MEV. Small groups untouched.
 * Returns a NEW map. Pure. (Applied AFTER all biasing; the upstream MRV clamps
 * still bound the top.)
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @returns {Object<string, number>|null} floored EN-keyed budget (null passes through)
 */
export function applyMaintenanceFloor(volumeMapEN) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const out = { ...volumeMapEN };
  for (const roGroup of MAJOR_MUSCLES_RO) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const mev = ISRAETEL_BASELINES[enKey]?.MEV;
    if (typeof mev !== 'number' || !Number.isFinite(mev) || mev <= 0) continue;
    const current = out[enKey];
    // Raise to MEV when the group exists in the budget but fell below the floor
    // (incl. 0 / absent → treat as needing the maintenance dose).
    if (typeof current !== 'number' || !Number.isFinite(current) || current < mev) {
      out[enKey] = mev;
    }
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
