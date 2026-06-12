// ══ CROSS-DAY WEEK LEDGER (focus-contracts arc, 2026-06-12, dp_week_ledger_v1) ══
// The focus-contracts layer (focusVolumeContracts.js + the focusPolicy resolver)
// shapes a day's BUDGET and SLOTS, but composes PER DAY with no view of what the
// week's EARLIER days already delivered. Four founder contracts are unreachable
// without that view (the `// GAP:` notes in focusSignature.gate.test.js):
//
//   1. ARMS  biceps ≥ 0.85×triceps      — bi:tri parity must count the WEEK (triceps
//                                          owns a tier-1 Close-Grip compound the day
//                                          resolver protects, so per-day parity loses).
//   2. CHEST close-grip ≤ 4 SETS/week    — a tier-1 triceps compound carries ~4 sets/
//                                          exposure; 2 push days deliver ~8 with no
//                                          cross-day SET ledger to cap the total.
//   3. SHOULDERS lateral ≥6 AND rear ≥6  — the per-exercise isolation dose caps a
//      sets/week @4d+                      lateral at ~2-3 sets, so two shoulder days
//                                          land ~4 unless a SECOND slot is added on a
//                                          later day (a week-level isolation quota).
//   4. LOWER back ≤0.65×max-lower @4d+    — the lower split's upper/pull days carry an
//                                          MEV-floored back minimum that the per-day
//                                          budget cap can't push toward the week cap.
//
// MECHANISM — extend the ESTABLISHED cross-day pattern (weekClustersFor / clusterForDay
// in lumbarDedup.js + weekSessionSpreadByGroup in intraWeekMakeup.js): the week's
// day→cluster sequence is DETERMINISTIC and pure (clusterForDay), so when composing day
// N we re-derive days 0..N-1 the SAME way and PROJECT their per-group SET allocation +
// per-sub-bucket SLOT count. The projection reuses the composer's own division math
// (expectedPerSession = weeklyBudget / weeklySessions — the SAME formula the intra-week
// makeup uses) rather than building each prior session (which would be circular +
// expensive). The estimate tracks the real distributor monotonically: a group trained
// on a cluster day gets ≈ its weekly budget ÷ its weekly session count, clamped to the
// realistic per-day set band, exactly as distributeGroupSets spreads the budget.
//
// HONESTY / GRANULARITY: the ledger knows a prior day's CLUSTER + its budget-derived
// group allocation, NOT the exact exercises picked there (knowing that = building the
// session = circular, the same caveat lumbarDedup documents). So the sub-bucket SET
// estimates (close-grip, lateral, rear, direct-arm) are the EXPECTED dose a qualifying
// day delivers — tuned to the resolver's per-session injection/cap behaviour — not a
// literal count. That is sufficient for the four contracts: each needs to know whether
// the week's earlier days have ALREADY met (cap-tighten) or still OWE (inject) a quota,
// which the deterministic day-sequence + dose model answers exactly.
//
// COST: O(activeDays) — for day N we walk at most 7 weekdays, each a clusterForDay()
// call (itself O(7) array work) + a small weight-map lookup. No session build, no store
// access, no logs read. ≈ the cost of weekSessionSpreadByGroup, which already runs on
// every makeup-enabled compose. Pure + deterministic (no Math.random / Date.now).
//
// FLAG: read by the call site under dp_week_ledger_v1 (default ON, pinned OFF in fp
// cohorts). OFF → the ledger is never built → null threaded → byte-identical.

import { clusterForDay } from './frequencySplit.js';
import {
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  BIG11_RO_TO_EN_MAP,
} from '../../periodization/constants.js';

/**
 * Realistic per-day SET ceiling for a single group on one cluster day — the
 * composer never piles a whole week's budget onto one session (distributeGroupSets
 * bands each exercise 2-5 sets and a group gets ~1-2 slots/day). A group's per-day
 * delivered sets therefore saturate around this value regardless of a huge weekly
 * budget. Used to clamp the projection so a low-frequency week (budget ÷ 1 session)
 * does not over-estimate a single day's delivery.
 * @type {number}
 */
const PER_DAY_GROUP_SET_CEIL = 10;

/**
 * EN groups whose cluster weight is so small (<0.12) that the group is a thin
 * RIDE-ALONG on that cluster (e.g. biceps 0.10 on a full day) — its per-day
 * delivery is ~1 slot at the isolation floor, not the budget-divided share. We
 * floor such a day's contribution at the isolation minimum so the projection is
 * not zero, but do not let the budget share inflate it. (Mirrors how a 0.10-weight
 * group lands ~2-3 sets on a busy day.)
 * @type {number}
 */
const THIN_WEIGHT = 0.12;
/** Isolation set floor for a thin ride-along group's single daily exposure. */
const THIN_DAY_SETS = 2;

/**
 * Project the SETS a single cluster day delivers for one EN group, given the
 * group's weekly budget and how many of the week's days train it. Mirrors the
 * intra-week makeup's expectedPerSession = weeklyBudget / weeklySessions, clamped
 * to the realistic per-day band. A thin ride-along group floors at the isolation
 * minimum (it still gets one accessory slot) but never takes the full divided
 * share (its cluster weight is tiny).
 *
 * @param {string} cluster - the day's cluster id
 * @param {string} enGroup - Big-11 EN group key
 * @param {number} weeklyBudget - the group's weekly set budget (volumeTargetsEN)
 * @param {number} weeklySessions - how many of the week's days train the group
 * @returns {number} projected sets this group gets on this one cluster day
 */
function projectDaySetsForGroup(cluster, enGroup, weeklyBudget, weeklySessions) {
  const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
  if (!weights) return 0;
  const roKey = BIG11_EN_TO_RO(enGroup);
  const w = weights[roKey];
  if (typeof w !== 'number' || w <= 0) return 0; // cluster does not train this group
  const sessions = Math.max(1, weeklySessions);
  const share = weeklyBudget / sessions;
  if (w < THIN_WEIGHT) return Math.min(share, THIN_DAY_SETS);
  return Math.min(PER_DAY_GROUP_SET_CEIL, Math.max(THIN_DAY_SETS, share));
}

/** EN→RO key (local inverse of BIG11_RO_TO_EN_MAP — small, avoids importing both). */
function BIG11_EN_TO_RO(enKey) {
  // Built once from the canonical RO→EN map (single SSOT) so it never drifts.
  return EN_TO_RO[enKey] || enKey;
}
const EN_TO_RO = (() => {
  /** @type {Record<string, string>} */
  const out = {};
  for (const [ro, en] of Object.entries(BIG11_RO_TO_EN_MAP)) out[en] = ro;
  return out;
})();

// ── Sub-bucket per-day DOSE model (tuned to the resolver's per-session behaviour) ──
// Each qualifying cluster day delivers a characteristic SET dose for a sub-bucket the
// resolver injects/caps. These are the EXPECTED doses the focus-contracts resolver +
// distributor produce on a qualifying day (NOT a literal per-day count — the ledger
// cannot see the exact pick). They let the cross-day quota math reason about whether a
// sub-bucket is on track. Conservative (slightly under the real dose) so the ledger
// never over-counts a prior day and wrongly suppresses a still-needed slot.

/** A close-grip bench exposure (tier-1 triceps compound) carries ~4 sets. */
const CLOSE_GRIP_SETS_PER_EXPOSURE = 4;
/** A lateral-raise isolation exposure carries ~2.5 sets (the per-exercise iso band). */
const LATERAL_SETS_PER_EXPOSURE = 2.5;
/** A rear-delt isolation exposure carries ~2 sets (rear-delt iso cap is 3). */
const REAR_SETS_PER_EXPOSURE = 2;
/** Direct-arm dose on a SHARED day (one curl/extension slot among many groups) ≈ 4 sets. */
const DIRECT_ARM_SHARED_SETS = 4;
/** Direct-arm dose on a DEDICATED arm/pull/push day (2 stacked iso slots) ≈ 7 sets. */
const DIRECT_ARM_DEDICATED_SETS = 7;
/** Triceps dose on an ARMS focus's dedicated push/arms day: the protected Close-Grip
 *  COMPOUND (~4) + the long-head extensions (~4) ≈ 8 sets — the structural over-delivery
 *  that makes biceps:triceps parity a WEEK contract, not a per-day one. */
const TRICEPS_ARMS_DEDICATED_SETS = 8;

/** Clusters that anchor a chest press / close-grip bench (push side). */
const PRESS_CLUSTERS = new Set(['push', 'upper', 'chest', 'full', 'fullbody']);
/** Clusters that carry a lateral-raise slot (shoulders are pushed/overhead). */
const LATERAL_CLUSTERS = new Set(['push', 'upper', 'shoulders', 'full', 'fullbody']);
/** Clusters that carry a rear-delt slot (rear delt rides the pull/upper days). */
const REAR_CLUSTERS = new Set(['pull', 'upper', 'shoulders', 'full', 'fullbody']);
/** Clusters that carry a direct biceps slot. */
const BICEPS_CLUSTERS = new Set(['pull', 'upper', 'arms', 'full', 'fullbody']);
/** Clusters that carry a direct triceps slot. */
const TRICEPS_CLUSTERS = new Set(['push', 'upper', 'arms', 'full', 'fullbody']);

/**
 * Build the cross-day week ledger for the day being composed (dayIdx). Re-derives
 * the week's PRIOR active days (0..dayIdx-1) the SAME deterministic way the plan
 * does (clusterForDay) and projects what they delivered — per-group SETS and
 * per-sub-bucket SET totals — plus the FULL-week projection (all active days) so a
 * contract can compare today's incremental need against the week target.
 *
 * @param {Object} input
 * @param {ReadonlyArray<boolean>} input.activeWeek - length-7 active flags (Monday=0)
 * @param {number} input.dayIdx - 0..6, the weekday being composed
 * @param {string} [input.focusPreset='balanced'] - focus preset id (split reshape)
 * @param {boolean} [input.splitRebalance=false] - W-Split flag (dp_split_rebalance_v1)
 * @param {Record<string, number>|null|undefined} input.volumeTargetsEN - the day's
 *        EN-keyed weekly budget (the contracted/floored map — the stable weekly SSOT)
 * @returns {WeekLedger} the projected ledger (always a well-formed object)
 *
 * @typedef {Object} WeekLedger
 * @property {Record<string, number>} priorSetsByGroup   - EN group → sets delivered on days < dayIdx
 * @property {Record<string, number>} weekSetsByGroup    - EN group → sets projected across ALL active days
 * @property {Record<string, number>} priorSlotDays      - sub-bucket → count of qualifying days < dayIdx
 * @property {Record<string, number>} weekSlotDays       - sub-bucket → count of qualifying active days (whole week)
 * @property {Record<string, number>} priorSubSets       - sub-bucket → projected SETS delivered on days < dayIdx
 * @property {Record<string, number>} weekSubSets        - sub-bucket → projected SETS across ALL active days
 * @property {number} priorActiveDays                    - count of active days strictly before dayIdx
 * @property {number} totalActiveDays                    - count of active days in the week
 */
export function computeWeekLedger({
  activeWeek,
  dayIdx,
  focusPreset = 'balanced',
  splitRebalance = false,
  volumeTargetsEN,
}) {
  /** @type {WeekLedger} */
  const ledger = {
    priorSetsByGroup: {},
    weekSetsByGroup: {},
    priorSlotDays: {},
    weekSlotDays: {},
    priorSubSets: {},
    weekSubSets: {},
    priorActiveDays: 0,
    totalActiveDays: 0,
  };
  if (!Array.isArray(activeWeek)) return ledger;
  const budget = volumeTargetsEN && typeof volumeTargetsEN === 'object' ? volumeTargetsEN : {};

  // The week's per-group session FREQUENCY — derived from the FULL active-day
  // cluster list (the divisor the composer uses), so the per-day share matches the
  // real distribution. Built once, then reused for every day's projection.
  const activeClusters = [];
  for (let i = 0; i < 7; i++) {
    if (activeWeek[i]) {
      activeClusters.push({ day: i, cluster: clusterForDay(activeWeek, i, focusPreset, splitRebalance) });
    }
  }
  ledger.totalActiveDays = activeClusters.length;

  /** EN group → number of active days that train it (the weekly session count). */
  const weeklySessionsEN = {};
  for (const { cluster } of activeClusters) {
    const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
    if (!weights) continue;
    for (const roKey of Object.keys(weights)) {
      const enKey = BIG11_RO_TO_EN_MAP[roKey];
      if (!enKey) continue;
      weeklySessionsEN[enKey] = (weeklySessionsEN[enKey] || 0) + 1;
    }
  }

  // Walk every active day; accumulate per-group sets + per-sub-bucket exposures into
  // the PRIOR bucket (day < dayIdx) and/or the WHOLE-week bucket (all active days). The
  // per-exposure DOSE is what the day's distributor actually lands for that sub-bucket
  // (tuned to the ground-truth composer output, focus-aware where the delivery differs):
  // a triceps exposure on an ARMS focus carries the protected Close-Grip COMPOUND (~4)
  // PLUS its extensions (~4) ≈ 8 sets — the very asymmetry that makes the bi:tri parity
  // a WEEK problem; a biceps exposure is pure isolation (~4 on a shared day, ~7 on the
  // dedicated pull/arms day). Lateral/rear are isolation-band (2-3) capped by the
  // per-exercise junk-volume ceiling.
  const subOf = (cluster) => {
    /** @type {Record<string, number>} */
    const exposures = {};
    if (PRESS_CLUSTERS.has(cluster)) exposures.close_grip = CLOSE_GRIP_SETS_PER_EXPOSURE;
    if (LATERAL_CLUSTERS.has(cluster)) exposures.lateral = LATERAL_SETS_PER_EXPOSURE;
    if (REAR_CLUSTERS.has(cluster)) exposures.rear = REAR_SETS_PER_EXPOSURE;
    if (BICEPS_CLUSTERS.has(cluster)) {
      // A dedicated pull/arms day stacks 2 curls (~7); a shared upper/full day fits one (~4).
      exposures.direct_biceps =
        cluster === 'pull' || cluster === 'arms' ? DIRECT_ARM_DEDICATED_SETS : DIRECT_ARM_SHARED_SETS;
    }
    if (TRICEPS_CLUSTERS.has(cluster)) {
      // On an ARMS focus EVERY triceps-capable day (upper / push / arms / full) carries
      // the Close-Grip compound + extensions (~8) — the ground-truth composer puts
      // Close-Grip Bench on the arms UPPER day too, which is the structural over-delivery
      // that makes biceps:triceps parity a WEEK contract. Elsewhere triceps is isolation
      // (~4 shared / ~7 on a dedicated push/arms day).
      const dedicated = cluster === 'push' || cluster === 'arms';
      exposures.direct_triceps = focusPreset === 'arms'
        ? TRICEPS_ARMS_DEDICATED_SETS
        : dedicated ? DIRECT_ARM_DEDICATED_SETS : DIRECT_ARM_SHARED_SETS;
    }
    return exposures;
  };

  for (const { day, cluster } of activeClusters) {
    const isPrior = day < dayIdx;
    const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
    if (weights) {
      for (const roKey of Object.keys(weights)) {
        const enKey = BIG11_RO_TO_EN_MAP[roKey];
        if (!enKey) continue;
        const sets = projectDaySetsForGroup(
          cluster, enKey, budget[enKey] ?? 0, weeklySessionsEN[enKey] ?? 1,
        );
        if (sets <= 0) continue;
        ledger.weekSetsByGroup[enKey] = (ledger.weekSetsByGroup[enKey] || 0) + sets;
        if (isPrior) ledger.priorSetsByGroup[enKey] = (ledger.priorSetsByGroup[enKey] || 0) + sets;
      }
    }
    const exposures = subOf(cluster);
    for (const [sub, setsPer] of Object.entries(exposures)) {
      ledger.weekSlotDays[sub] = (ledger.weekSlotDays[sub] || 0) + 1;
      ledger.weekSubSets[sub] = (ledger.weekSubSets[sub] || 0) + setsPer;
      if (isPrior) {
        ledger.priorSlotDays[sub] = (ledger.priorSlotDays[sub] || 0) + 1;
        ledger.priorSubSets[sub] = (ledger.priorSubSets[sub] || 0) + setsPer;
      }
    }
    if (isPrior) ledger.priorActiveDays += 1;
  }
  return ledger;
}

