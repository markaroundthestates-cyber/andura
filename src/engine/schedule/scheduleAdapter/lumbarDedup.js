// R6d — cross-week lumbar (lower-back) redundancy dedup. Daniel coach audit
// 2026-06-10: his real week prescribed BOTH a Romanian Deadlift AND a
// Hyperextension/Back-Extension — two systemically lumbar-fatiguing hip-hinges
// in the same week without accounting for the shared erector load. A good coach
// puts the heavy hinge on ONE leg day and lets the other posterior day lead with
// a non-hinge movement (leg curl).
//
// CHEAP cross-week, no ledger: the weekly day→cluster map is deterministic and
// re-derivable from clusterForDay (a pure function). We count the leg/posterior
// days BEFORE today; the FIRST such day keeps its heavy hinge, a SUBSEQUENT one
// demotes the hinge so a non-hinge sibling (leg curl / glute) leads. Demote-only
// via the existing poolForGroup penalty channel → never a hard ban, last-option
// guarded → never strands a muscle. OFF (flag off / not a repeat leg day) → null
// → byte-identical.
//
// Granularity caveat (honest): we know a sibling day trains a leg/posterior
// cluster, NOT whether it actually picked a hinge there (knowing that would need
// to build the sibling session = circular). So on the rare week where the prior
// leg day's hamstrings pick is itself a non-hinge, today's demote is slightly
// conservative (skips a hinge that wasn't truly redundant). Per Daniel's "coach-ul
// taie mai mult decat adauga", that trade is acceptable; the demote never strands.

import { clusterForDay } from './frequencySplit.js';

// Clusters that carry a heavy lumbar hip-hinge (the hamstrings/posterior anchor
// lives here): legs / lower / full. push/pull/upper do not anchor a heavy hinge.
const HINGE_CLUSTERS = new Set(['legs', 'lower', 'full']);

// Curated heavy-lumbar hip-hinge engineNames (CORE_AUTO). Penalizing a name that
// is not selected today is a harmless no-op, so the set can be inclusive.
export const LUMBAR_HINGES = Object.freeze([
  // Hip-hinge deadlift family (heavy erector/posterior-chain load)
  'Romanian Deadlift', 'Stiff-Leg Deadlift', 'Conventional Deadlift', 'Barbell Good Morning',
  // Back-extension / hyperextension family (direct erector loading)
  'Roman Chair Back Extension', '45° Hyperextension', 'GHD Back Extension',
  'Weighted Hyperextension', 'Hyperextension Machine',
]);

/**
 * Penalty map that demotes a SECOND heavy lumbar hinge on a repeat leg/posterior
 * day this week. The first hinge-cluster day keeps its hinge (no prior → null);
 * a subsequent one demotes the hinge family so a non-hinge sibling leads.
 *
 * @param {Object} input
 * @param {boolean} input.flagOn isEnabled('dp_lumbar_dedup_v1')
 * @param {ReadonlyArray<boolean>} input.activeWeek length-7 active flags
 * @param {number} input.dayIdx 0..6 — today
 * @param {string} input.todayCluster today's effective cluster
 * @param {string} [input.focusPreset='balanced']
 * @param {boolean} [input.splitRebalance=false]
 * @returns {Record<string, number> | null} demote map ({name:1}) or null (no-op)
 */
export function lumbarDedupPenalties({
  flagOn,
  activeWeek,
  dayIdx,
  todayCluster,
  focusPreset = 'balanced',
  splitRebalance = false,
}) {
  if (!flagOn) return null;
  if (!Array.isArray(activeWeek)) return null;
  // Only a leg/posterior (hinge-capable) day can carry a redundant hinge.
  if (!HINGE_CLUSTERS.has(todayCluster)) return null;
  // Count active hinge-cluster days scheduled BEFORE today this week.
  let priorHingeDays = 0;
  for (let i = 0; i < dayIdx; i++) {
    if (!activeWeek[i]) continue;
    if (HINGE_CLUSTERS.has(clusterForDay(activeWeek, i, focusPreset, splitRebalance))) {
      priorHingeDays += 1;
    }
  }
  // The FIRST hinge-cluster day of the week keeps its heavy hinge.
  if (priorHingeDays < 1) return null;
  // A REPEAT hinge-cluster day → demote the heavy lumbar hinges so a non-hinge
  // sibling leads (the demote channel keeps the last option, never strands).
  const penalties = {};
  for (const name of LUMBAR_HINGES) penalties[name] = 1.0;
  return penalties;
}

/**
 * MAX-merge two {name:penalty} maps (either may be null). Mirrors how
 * poolForGroup reads a single penalty channel — the higher demote wins so a
 * lumbar-redundant hinge that is ALSO pain-flagged stays demoted.
 *
 * @param {Record<string, number> | null} a
 * @param {Record<string, number> | null} b
 * @returns {Record<string, number> | null}
 */
export function mergePenalties(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}
