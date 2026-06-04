// ── "Different group" ephemeral override (D-override-different-muscle 2026-06-02) ──
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// The ScheduleOverride "Alta grupa" option must produce a REAL alternative
// session — NOT a relabel. Andura PICKS the alternative (ADR 025 "user doesn't
// think"): of all Big-6 clusters EXCEPT today's scheduled one, choose the cluster
// whose constituent muscle groups are the most RECOVERED/fresh today (reuse the
// recovery state already computed from the user's logged sessions). This is
// EPHEMERAL — today only, in-memory; it never writes the calendar override (the
// persisted weekly schedule is untouched, resets next session naturally).
//
// Freshness score per recovery state: recovered=2, partial=1, fatigued=0. A
// cluster's score = sum over its Big-11 groups of state-score × cluster weight
// (CLUSTER_BIG6_TO_BIG11_WEIGHT), so a cluster built mostly on fresh groups wins.
// Deterministic tie-break: PHASE_CLUSTERS_BIG6 declaration order (stable, no RNG).

import {
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  PHASE_CLUSTERS_BIG6,
} from '../../periodization/constants.js';

const RECOVERY_FRESHNESS_SCORE = Object.freeze({ recovered: 2, partial: 1, fatigued: 0 });

/**
 * Freshness score for one cluster from the RO-keyed recovery state map. Sums each
 * constituent Big-11 group's freshness (recovered/partial/fatigued) weighted by
 * the cluster's allocation. A group missing from the recovery state is treated as
 * 'recovered' (no logged stress → fresh). Higher = fresher overall. Pure.
 *
 * @param {string} cluster - Big-6 cluster id
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryState - RO-keyed
 * @returns {number}
 */
function clusterFreshnessScore(cluster, recoveryState) {
  const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
  if (!weights) return 0;
  let score = 0;
  for (const [group, weight] of Object.entries(weights)) {
    const state = recoveryState?.[group] ?? 'recovered';
    score += (RECOVERY_FRESHNESS_SCORE[state] ?? 2) * weight;
  }
  return score;
}

/**
 * Pick a sensible ALTERNATIVE cluster for the "Different group" override — the
 * Big-6 cluster (≠ the day's scheduled one) whose muscle groups are the MOST
 * RECOVERED/fresh today. Andura decides (ADR 025). Deterministic: ties break by
 * PHASE_CLUSTERS_BIG6 declaration order. With no recovery signal (cold start /
 * empty state) every candidate scores equal → the first non-scheduled cluster in
 * declaration order is returned (a stable, complementary default). Pure.
 *
 * @param {string} scheduledCluster - the cluster the day would normally train
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryState - RO-keyed
 * @returns {string} an alternative cluster id (always ≠ scheduledCluster when one exists)
 */
export function pickAlternativeCluster(scheduledCluster, recoveryState) {
  const candidates = PHASE_CLUSTERS_BIG6.filter((c) => c !== scheduledCluster);
  if (candidates.length === 0) return scheduledCluster; // degenerate (single cluster) — no-op
  let best = candidates[0];
  let bestScore = clusterFreshnessScore(best, recoveryState);
  for (let i = 1; i < candidates.length; i++) {
    const score = clusterFreshnessScore(candidates[i], recoveryState);
    if (score > bestScore) {
      best = candidates[i];
      bestScore = score;
    }
  }
  return best;
}
