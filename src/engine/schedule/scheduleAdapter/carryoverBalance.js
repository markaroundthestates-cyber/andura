// ══ CROSS-WEEK CARRYOVER BALANCE (2026-06-15, dp_carryover_balance_v1) ════════
// The weekly split is a STATIC deterministic template (frequencyToSplit /
// clusterForDay). A focus that de-emphasizes a region collapses it to ONE day,
// and FOCUS_LOWER_DEEMPH_SPLITS[4] = ['push','pull','upper','lower'] places that
// single lower day LAST. If the user skips the end of the week they skip that
// region entirely — and NOTHING reacts: the template is identical next week (no
// cross-week carryover), and intraWeekMakeup.js only makes up VOLUME within the
// SAME week (it cannot recover a region whose only/last day WAS the skipped one).
//
// THE FIX (PLACEMENT ONLY — NOT volume cramming): if a muscle REGION/cluster was
// SCHEDULED last microcycle but received ZERO real working sets, THIS week move
// that cluster to the EARLIEST spacing-safe slot (never the last) so the user
// trains it while fresh. We do NOT pile last week's missed sets onto this week —
// that is junk / injury risk (RP principle); the existing intra-week +30% volume
// makeup stays untouched and within-week.
//
// Pure + deterministic: every input (recoveryLogs, activeWeek, focusPreset,
// nowMs, weekStartMs) is threaded in. NO Date.now() / new Date() / Math.random().
// Cold-start (empty logs / no in-window rows / malformed) → owed [] → the split
// is returned unchanged → byte-identical to today. Flag-gated at the call site
// (dp_carryover_balance_v1); the OFF arm never builds owed → empty → byte-identical.

import {
  clusterForDay,
  adjacencyCount,
  spaceOutSplit,
} from './frequencySplit.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';
import { CLUSTER_BIG6_TO_BIG11_WEIGHT } from '../../periodization/constants.js';

/** One day in ms — the prior-window width is exactly 7 of these (one microcycle). */
const DAY_MS = 86400000;

/**
 * Derive the current 7-day microcycle START (ms) deterministically from `nowMs`
 * when no finite weekStartMs is supplied. Floors `nowMs` to the start of its
 * 7-day block measured from the Unix epoch — a pure, clock-free derivation (the
 * SAME determinism contract weekStartISO honors: a function of the planned clock
 * only, never Date.now()). Returns null when nowMs is not finite.
 *
 * The derived start is the LOCAL MONDAY 00:00 of nowMs's week — the SAME
 * Monday-anchored microcycle boundary getWeekStartIso + mapDateToIndex use (both
 * read local weekday from the planned date), so a CURRENT-week session (e.g. a
 * Monday log queried on the same week's Friday) is NOT mistaken for prior-week
 * work. Built from `new Date(nowMs)` (the planned clock as an ARGUMENT — NOT the
 * argless new Date() / Date.now()) so it is deterministic given nowMs and agrees
 * with the rest of the engine's local-weekday math.
 *
 * @param {number|undefined} weekStartMs - explicit microcycle start (ms), if known
 * @param {number|undefined} nowMs - the injected planning clock (ms)
 * @returns {number|null} the microcycle start in ms (local Monday 00:00), or null
 */
function resolveWeekStartMs(weekStartMs, nowMs) {
  if (typeof weekStartMs === 'number' && Number.isFinite(weekStartMs)) return weekStartMs;
  if (typeof nowMs !== 'number' || !Number.isFinite(nowMs)) return null;
  const d = new Date(nowMs); // ARGUMENT form — deterministic, NOT Date.now()
  const jsDow = d.getDay(); // Sunday=0 ... Saturday=6 (local)
  const dowMon = jsDow === 0 ? 6 : jsDow - 1; // Monday=0 (matches mapDateToIndex)
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - dowMon);
  return monday.getTime();
}

/**
 * The RO Big-11 groups a cluster actually TRAINS — the keys of its weight map with
 * weight > 0 (CLUSTER_BIG6_TO_BIG11_WEIGHT). A logged exercise whose primary RO
 * group is in this set counts as a real set FOR that cluster.
 *
 * @param {string} cluster - cluster id
 * @returns {Set<string>} RO group keys the cluster trains (weight > 0)
 */
function clusterTrainedGroups(cluster) {
  const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
  const out = new Set();
  if (!weights) return out;
  for (const roGroup of Object.keys(weights)) {
    const w = weights[roGroup];
    if (typeof w === 'number' && w > 0) out.add(roGroup);
  }
  return out;
}

/**
 * Detect the clusters that were SCHEDULED last microcycle but received ZERO real
 * working sets — the regions the user skipped. PLACEMENT signal only (the caller
 * front-loads them this week; it never crams last week's missed volume forward).
 *
 * Prior window = the 7 days immediately BEFORE the current microcycle start:
 * [weekStartMs - 7d, weekStartMs). weekStartMs is derived from nowMs when not
 * supplied (resolveWeekStartMs — deterministic from the injected clock).
 *
 * Last week's SCHEDULED clusters = the distinct clusters clusterForDay derives
 * over the active days (assume the SAME activeWeek last week — the template is
 * static). A cluster "received" a real set when an in-window logged exercise's
 * primary RO group is one the cluster trains (clusterTrainedGroups). Owed =
 * scheduled clusters with ZERO real sets in the window.
 *
 * COLD-START (empty logs / no in-window rows / malformed) → [] (→ byte-identical).
 *
 * @param {Object} input
 * @param {Array<{ex?: string, ts?: number}>} input.recoveryLogs - flattened recovery rows
 * @param {ReadonlyArray<boolean>} input.activeWeek - length-7 active flags (Monday=0)
 * @param {string} [input.focusPreset='balanced'] - focus preset id (split reshape)
 * @param {boolean} [input.splitRebalance=false] - W-Split flag (dp_split_rebalance_v1)
 * @param {number} [input.nowMs] - the injected planning clock (ms) — NEVER Date.now()
 * @param {number} [input.weekStartMs] - explicit current microcycle start (ms), if known
 * @returns {string[]} owed cluster ids (distinct, in scheduled-day order; possibly empty)
 */
export function detectOwedClusters({
  recoveryLogs,
  activeWeek,
  focusPreset = 'balanced',
  splitRebalance = false,
  nowMs,
  weekStartMs,
} = {}) {
  if (!Array.isArray(activeWeek) || !Array.isArray(recoveryLogs)) return [];
  const start = resolveWeekStartMs(weekStartMs, nowMs);
  if (start === null) return []; // no derivable window → cold-start no-op
  const windowStart = start - 7 * DAY_MS;
  const windowEnd = start; // [windowStart, windowEnd)

  // Last week's SCHEDULED clusters (distinct, in day order) — the static template.
  const scheduledClusters = [];
  const seenCluster = new Set();
  for (let day = 0; day < 7; day++) {
    if (!activeWeek[day]) continue;
    const cluster = clusterForDay(activeWeek, day, focusPreset, splitRebalance);
    if (!seenCluster.has(cluster)) {
      seenCluster.add(cluster);
      scheduledClusters.push(cluster);
    }
  }
  if (scheduledClusters.length === 0) return [];

  // RO groups that actually received >=1 real set in the prior window.
  const trainedGroups = new Set();
  for (const row of recoveryLogs) {
    if (!row) continue;
    const ts = typeof row.ts === 'number' ? row.ts : NaN;
    if (!Number.isFinite(ts) || ts < windowStart || ts >= windowEnd) continue;
    const ex = typeof row.ex === 'string' ? row.ex : '';
    if (!ex) continue;
    const roGroup = getExerciseMetadata(ex).muscle_target_primary;
    if (typeof roGroup === 'string' && roGroup && roGroup !== 'unknown') {
      trainedGroups.add(roGroup);
    }
  }
  if (trainedGroups.size === 0) return []; // no in-window real sets → cold-start no-op

  // Owed = a scheduled cluster none of whose trained groups received a real set.
  const owed = [];
  for (const cluster of scheduledClusters) {
    const groups = clusterTrainedGroups(cluster);
    let received = false;
    for (const g of groups) {
      if (trainedGroups.has(g)) { received = true; break; }
    }
    if (!received) owed.push(cluster);
  }
  return owed;
}

/**
 * Reorder a split so each OWED cluster sitting in a LATE slot (especially the
 * last) moves to the EARLIEST position that does NOT increase same-cluster
 * adjacency. PLACEMENT only — the multiset of clusters is unchanged (same
 * day-type counts), only the ORDER moves so the skipped region is trained fresh.
 *
 * GUARD — only an owed cluster whose EARLIEST current occurrence sits in the LATE
 * half of the week is front-loaded. A cluster that ALREADY appears early (its
 * first slot is in the front half, e.g. balanced upper/lower/upper/lower trains
 * lower at slot 1) is already trained fresh — moving its last occurrence to the
 * front would be gratuitous churn that displaces an equally-fresh day. The
 * founder problem is the SINGLE-late-slot case (v-taper push/pull/upper/lower:
 * lower ONLY at the last slot), which this guard targets exactly.
 *
 * Reuses adjacencyCount + spaceOutSplit from frequencySplit.js to validate
 * spacing. Legs (lower/legs) are region-disjoint from push/pull/upper so they
 * move freely; an owed push/pull goes to the earliest non-adjacency-worsening
 * slot. Empty owed → the split is returned UNCHANGED (byte-identical). Pure,
 * deterministic, stable (no random tie-breaks).
 *
 * @param {string[]} split - ordered Big-6 cluster ids
 * @param {string[]} owedClusters - cluster ids owed (front-load these)
 * @returns {string[]} a reordered copy (or the input reference when no change)
 */
export function reorderSplitForCarryover(split, owedClusters) {
  if (!Array.isArray(split) || split.length === 0) return split;
  if (!Array.isArray(owedClusters) || owedClusters.length === 0) return split;
  const owedSet = new Set(owedClusters);
  // A cluster is "trained fresh enough" when its FIRST slot is in the front half —
  // front-loading only the LATE-only owed clusters (the founder single-last-slot case).
  const frontHalfEnd = Math.floor(split.length / 2);
  let out = [...split];
  let moved = false;
  // Process owed clusters in the order they appear in owedClusters (stable) so the
  // result is deterministic. For each owed cluster, take its LAST occurrence (the
  // one most in need of front-loading) and reinsert it at the earliest slot that
  // does not worsen adjacency.
  for (const owed of owedClusters) {
    if (!owedSet.has(owed)) continue;
    const firstIdx = out.indexOf(owed);
    if (firstIdx < 0) continue; // not present
    if (firstIdx < frontHalfEnd) continue; // already trained early → no churn
    const lastIdx = out.lastIndexOf(owed);
    if (lastIdx <= 0) continue; // already first → nothing earlier to move to
    const baseAdj = adjacencyCount(out);
    // Try every earlier insertion position; pick the EARLIEST that does not
    // increase same-cluster adjacency vs the current arrangement.
    let bestPos = -1;
    for (let pos = 0; pos < lastIdx; pos++) {
      const candidate = out.filter((_, i) => i !== lastIdx);
      candidate.splice(pos, 0, owed);
      if (adjacencyCount(candidate) <= baseAdj) { bestPos = pos; break; }
    }
    if (bestPos >= 0) {
      const candidate = out.filter((_, i) => i !== lastIdx);
      candidate.splice(bestPos, 0, owed);
      out = candidate;
      moved = true;
    }
  }
  if (!moved) return split;
  // Final safety: if the move somehow worsened overall adjacency vs the original,
  // re-space the multiset deterministically (same day-type counts, alternation
  // restored) — never return a more-clustered week than we started with.
  if (adjacencyCount(out) > adjacencyCount(split)) return spaceOutSplit(out);
  return out;
}
