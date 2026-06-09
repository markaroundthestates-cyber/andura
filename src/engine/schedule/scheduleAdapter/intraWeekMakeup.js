// ── Intra-week deficit RECOVERY — makeup spread into today's budget (Phase 2) ──
// Wires the Phase-1 measurement layer (intraWeekVolume) into the daily plan: when
// earlier sessions THIS microcycle were skipped / ended early, the volume they
// owed is MADE UP on a later day — bounded by a per-session cap and (downstream)
// by recovery + MRV so the body still governs. Pure + deterministic: every input
// (now, weekContext, split) is threaded in; no clock/store access here.
//
// LOCKED design (DESIGN intra-week-adaptive):
//   - WEEKLY TARGET = the periodization weekly budget (PRE-adaptation base).
//   - PER-GROUP proration to-date AVOIDS false deficits for groups whose sessions
//     are still upcoming (a Thursday must NOT register Saturday's leg day as a
//     deficit). targetToDate = expectedPerSession × sessionsElapsed.
//   - deficit = recover-only (Phase-1 deficitByGroup): never negative, an over-done
//     group is never cut to chase the week.
//   - makeup = min(deficit / remainingDays, 0.30 × base) — the ≤+30%/session cap.
//   - The makeup is added to the budget BEFORE the recovery cut + MEV/MRV clamp
//     (caller ordering), so a FATIGUED group's makeup is trimmed by recovery and a
//     non-recovered group is never loaded to chase the week. (body > calendar.)
//   - COLD-START NO-OP: no history this week / no elapsed sessions → makeup all 0
//     → the plan is byte-identical to before.

import { deficitByGroup } from '../intraWeekVolume.js';
import { BIG11_RO_TO_EN_MAP, ISRAETEL_BASELINES } from '../../periodization/constants.js';
import { weeklySessionsPerGroup } from './weeklySessions.js';
import { clusterForDay } from './frequencySplit.js';

/**
 * LOCKED per-session makeup cap: a group's budget may grow by at most this
 * FRACTION of its weekly base in a single session while catching up a deficit.
 * 0.30 keeps the made-up day a real (not heroic) session — the rest of any
 * remaining deficit is spread over the group's future training days this week.
 *
 * @type {number}
 */
export const MAKEUP_PER_SESSION_CAP_FRACTION = 0.30;

/**
 * Count, per Big-11 RO group, how many of THIS week's scheduled training days
 * train that group, split into PAST+TODAY (`elapsed`) vs TODAY+FUTURE
 * (`remaining`). A day "trains" a group when the day's cluster's weight map
 * (CLUSTER_BIG6_TO_BIG11_WEIGHT, via weeklySessionsPerGroup of a one-cluster
 * split) includes that group. The day→cluster mapping is the SAME
 * frequency/focus-aware `clusterForDay` the plan uses, so proration agrees with
 * the actual week the user trains. TODAY counts in BOTH (its target is due now
 * AND it is a remaining opportunity to make up). Pure.
 *
 * @param {ReadonlyArray<boolean>} activeWeek - length-7 active flags (Monday=0)
 * @param {number} todayIdx - 0..6 (Monday=0), today's weekday index
 * @param {string} [focusPreset='balanced'] - focus preset id (split reshape)
 * @param {boolean} [rebalance=false] - W-Split flag (dp_split_rebalance_v1)
 * @returns {{ elapsed: Record<string, number>, remaining: Record<string, number> }}
 *   per-RO-group session counts (PAST+TODAY / TODAY+FUTURE)
 */
export function weekSessionSpreadByGroup(activeWeek, todayIdx, focusPreset = 'balanced', rebalance = false) {
  /** @type {Record<string, number>} */
  const elapsed = {};
  /** @type {Record<string, number>} */
  const remaining = {};
  const week = Array.isArray(activeWeek) ? activeWeek : [];
  for (let day = 0; day < 7; day++) {
    if (!week[day]) continue; // rest day → trains nothing
    const cluster = clusterForDay(week, day, focusPreset, rebalance);
    // Per-group membership of a SINGLE training day = the cluster's weight-map keys.
    const groupsThisDay = weeklySessionsPerGroup([cluster]);
    for (const roGroup of Object.keys(groupsThisDay)) {
      if (day <= todayIdx) elapsed[roGroup] = (elapsed[roGroup] || 0) + 1;
      if (day >= todayIdx) remaining[roGroup] = (remaining[roGroup] || 0) + 1;
    }
  }
  return { elapsed, remaining };
}

/**
 * Compute the per-group makeup to ADD to today's session budget to recover an
 * intra-week deficit, plus the deficit still outstanding after today.
 *
 * Algorithm (all per Big-11 EN group key, the budget's vocabulary):
 *   weeklyTarget[g]      = baseTargetsEN[g]               (PRE-adaptation base)
 *   weeklySessions[g]    = weeklySessionsPerGroup(split)  (RO→EN bridged)
 *   sessionsElapsed[g]   = spread.elapsed                 (PAST+TODAY days, RO→EN)
 *   expectedPerSession   = weeklyTarget / max(1, weeklySessions)
 *   targetToDate[g]      = expectedPerSession × sessionsElapsed
 *   deficit[g]           = max(0, targetToDate − volumeDone)   (Phase-1, EN)
 *   remainingDays[g]     = spread.remaining (TODAY+FUTURE days, RO→EN), ≥1
 *   makeup[g]            = min(deficit / remainingDays, CAP × weeklyTarget)
 *   behind[g]            = max(0, deficit − makeup)            (still owed after today)
 *
 * A group whose elapsed-day count is 0 (all its sessions still upcoming) →
 * targetToDate 0 → deficit 0 → makeup 0: NO false deficit. No `volumeDone` (cold
 * start) → deficit 0 everywhere → makeup all 0 → caller adds nothing → the plan
 * is byte-identical to pre-feature. Pure + deterministic (state in, no globals).
 *
 * NOTE: this returns the makeup BEFORE recovery + MEV/MRV clamping — the caller
 * adds it to the budget ahead of the recovery stage so the body still governs
 * (a fatigued group's makeup is then trimmed by recovery; MRV is never exceeded).
 *
 * @param {Object<string, number>|null|undefined} baseTargetsEN - PRE-adaptation weekly budget (EN-keyed)
 * @param {Record<string, number>|null|undefined} volumeDone - done volume this week per EN group (Phase-1 output)
 * @param {string[]} split - this week's ordered Big-6 cluster ids (for weeklySessions)
 * @param {{ elapsed: Record<string, number>, remaining: Record<string, number> }} spread - weekSessionSpreadByGroup output (RO-keyed)
 * @returns {{ added: Record<string, number>, behind: Record<string, number> }}
 *   EN-keyed makeup to add this session + deficit still outstanding after today
 *   (only groups with a positive value are present)
 */
export function computeIntraWeekMakeup(baseTargetsEN, volumeDone, split, spread) {
  /** @type {{ added: Record<string, number>, behind: Record<string, number> }} */
  const empty = { added: {}, behind: {} };
  if (!baseTargetsEN || typeof baseTargetsEN !== 'object') return empty;
  const elapsedRO = spread && spread.elapsed ? spread.elapsed : {};
  const remainingRO = spread && spread.remaining ? spread.remaining : {};
  const weeklySessionsRO = weeklySessionsPerGroup(Array.isArray(split) ? split : []);

  // Bridge the RO-keyed session counts to EN so they align with the EN budget.
  /** @type {Record<string, number>} */
  const weeklySessionsEN = {};
  /** @type {Record<string, number>} */
  const elapsedEN = {};
  /** @type {Record<string, number>} */
  const remainingEN = {};
  const accumulate = (src, dst) => {
    for (const roGroup of Object.keys(src)) {
      const enKey = BIG11_RO_TO_EN_MAP[roGroup];
      if (!enKey) continue; // non-Big-11 (e.g. core→abs is mapped; 'unknown' skipped)
      dst[enKey] = (dst[enKey] || 0) + src[roGroup];
    }
  };
  accumulate(weeklySessionsRO, weeklySessionsEN);
  accumulate(elapsedRO, elapsedEN);
  accumulate(remainingRO, remainingEN);

  // Build targetToDate per EN group, then the recover-only deficit (Phase-1 fn).
  /** @type {Record<string, number>} */
  const targetToDate = {};
  for (const enKey of Object.keys(baseTargetsEN)) {
    const weeklyTarget = baseTargetsEN[enKey];
    if (typeof weeklyTarget !== 'number' || !Number.isFinite(weeklyTarget)) continue;
    const sessionsElapsed = elapsedEN[enKey] || 0;
    if (sessionsElapsed <= 0) {
      targetToDate[enKey] = 0; // all sessions upcoming → no to-date target → no false deficit
      continue;
    }
    const weeklySessions = Math.max(1, weeklySessionsEN[enKey] || 0);
    const expectedPerSession = weeklyTarget / weeklySessions;
    targetToDate[enKey] = expectedPerSession * sessionsElapsed;
  }

  const deficit = deficitByGroup(targetToDate, volumeDone);

  /** @type {Record<string, number>} */
  const added = {};
  /** @type {Record<string, number>} */
  const behind = {};
  for (const enKey of Object.keys(deficit)) {
    const def = deficit[enKey];
    if (typeof def !== 'number' || def <= 0) continue;
    const weeklyTarget = baseTargetsEN[enKey];
    if (typeof weeklyTarget !== 'number' || !Number.isFinite(weeklyTarget)) continue;
    const remainingDays = Math.max(1, remainingEN[enKey] || 0);
    const cap = MAKEUP_PER_SESSION_CAP_FRACTION * weeklyTarget;
    const makeup = Math.min(def / remainingDays, cap);
    if (makeup > 0) {
      added[enKey] = makeup;
      const rest = def - makeup;
      if (rest > 0) behind[enKey] = rest;
    } else if (def > 0) {
      behind[enKey] = def;
    }
  }
  return { added, behind };
}

/**
 * Add the per-group makeup to an EN-keyed volume budget, returning a NEW map.
 * Only groups present in BOTH the budget and `added` are bumped; the rest pass
 * through untouched. The bumped value is HARD-capped at the group's Israetel MRV
 * (ISRAETEL_BASELINES) — makeup never pushes a group over its recoverable max,
 * even when the base budget already sat near MRV after M2/M3 amplification (the
 * recovery cut then runs on this budget downstream). A group above MRV before the
 * bump is left untouched (never lowered). Empty `added` → a shallow clone,
 * byte-identical values (no clamp applied — pre-feature behavior). Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - EN-keyed budget
 * @param {Record<string, number>|null|undefined} added - EN-keyed makeup (computeIntraWeekMakeup.added)
 * @returns {Object<string, number>|null} bumped + MRV-capped EN budget (null passes through)
 */
export function applyMakeupToVolumeBudget(volumeMapEN, added) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const out = { ...volumeMapEN };
  if (!added || typeof added !== 'object') return out;
  for (const enKey of Object.keys(added)) {
    const bump = added[enKey];
    const current = out[enKey];
    if (
      typeof current === 'number' && Number.isFinite(current) &&
      typeof bump === 'number' && Number.isFinite(bump) && bump > 0
    ) {
      const bumped = current + bump;
      const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
      // HARD MRV cap — never exceed; never LOWER a group already above MRV.
      out[enKey] = typeof mrv === 'number' && Number.isFinite(mrv)
        ? Math.max(current, Math.min(mrv, bumped))
        : bumped;
    }
  }
  return out;
}
