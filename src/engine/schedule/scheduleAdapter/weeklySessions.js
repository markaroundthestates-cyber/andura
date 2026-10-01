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

/**
 * The weekly-budget DIVISOR per group for TODAY's session, weighted by how much each
 * day of the split belongs to the group (dp_home_day_volume_v1, founder 2026-10-01:
 * "un antrenament de 27 minute... mi se pare cam scurt"). Dividing by the plain
 * session COUNT split his back 7 Pull + 7 Upper, so the day named for the muscle
 * was the thinnest of the week while the catch-all Upper ran ~55 min. A group's
 * share of the week follows the cluster weights the split already declares (back:
 * pull 0.625 vs upper 0.30 → ~2/3 on Pull): divisor = Σ weights / today's weight.
 * The weekly total is unchanged (the shares sum to 1). Groups whose days all carry
 * the same weight (U/L x2, PPL x2, full-body) and the `keep` groups (a de-emphasized
 * group's balanced divisor) keep their count → identical. Pure.
 *
 * @param {string[]} split - the week's ordered cluster ids
 * @param {string} cluster - today's cluster (must be one of `split`)
 * @param {Record<string, number>} counts - weeklySessionsPerGroup (possibly adjusted)
 * @param {Set<string>} [keep] - RO groups whose divisor must not change
 * @returns {Record<string, number>} a NEW map (counts untouched)
 */
export function homeDayDivisors(split, cluster, counts, keep = new Set()) {
  const out = { ...counts };
  const today = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
  if (!today || !split.includes(cluster)) return out;
  for (const [group, wToday] of Object.entries(today)) {
    if (keep.has(group) || !(wToday > 0)) continue;
    const ws = split.map((c) => CLUSTER_BIG6_TO_BIG11_WEIGHT[c]?.[group]).filter((w) => w > 0);
    if (ws.length < 2 || ws.every((w) => w === ws[0])) continue;
    out[group] = ws.reduce((a, b) => a + b, 0) / wToday;
  }
  return out;
}
