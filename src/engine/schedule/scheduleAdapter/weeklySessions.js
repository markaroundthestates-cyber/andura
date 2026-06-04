// ── Weekly per-group session frequency ────────────────────────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { CLUSTER_BIG6_TO_BIG11_WEIGHT } from '../../periodization/constants.js';

/**
 * How many sessions in the week's split train each Big-11 RO group — the
 * per-group weekly frequency the volume budget is divided by (buildSession reads
 * it as ctx.weeklySessionsPerGroup). Derived purely from the frequency template
 * + CLUSTER_BIG6_TO_BIG11_WEIGHT (a cluster "trains" a group when that group is
 * a key of the cluster's weight map). Pure.
 *
 * @param {string[]} split - the week's ordered cluster ids
 * @returns {Record<string, number>} Big-11 RO group -> sessions/week
 */
export function weeklySessionsPerGroup(split) {
  const counts = {};
  for (const cluster of split) {
    const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
    if (!weights) continue;
    for (const group of Object.keys(weights)) {
      counts[group] = (counts[group] || 0) + 1;
    }
  }
  return counts;
}
