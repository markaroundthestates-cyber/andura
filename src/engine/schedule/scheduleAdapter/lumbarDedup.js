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

// Clusters whose SPATE pool can offer a back-extension accessory (the S-band
// 45° Hyperextension is muscle_target_primary 'spate', so it competes on every
// back-capable day — Daniel's real week stacked it Thu pull + Fri upper + RDL Sat).
const BACK_ACCESSORY_CLUSTERS = new Set(['pull', 'upper', 'back']);

// Curated heavy-lumbar hip-hinge engineNames (CORE_AUTO). Penalizing a name that
// is not selected today is a harmless no-op, so the set can be inclusive.
export const LUMBAR_HINGES = Object.freeze([
  // Hip-hinge deadlift family (heavy erector/posterior-chain load)
  'Romanian Deadlift', 'Stiff-Leg Deadlift', 'Conventional Deadlift', 'Barbell Good Morning',
  // Back-extension / hyperextension family (direct erector loading)
  'Roman Chair Back Extension', '45° Hyperextension', 'GHD Back Extension',
  'Weighted Hyperextension', 'Hyperextension Machine',
  // Daniel focus-sweep review 2026-06-11: these two library variants escaped the
  // curated list — 'Hyperextension Bodyweight' is hams-PRIMARY (tier 2), so it
  // surfaces from the hamstrings pool on legs/lower days and landed on 2-3 days
  // of a lower-focus week, untouched by the demote that caught its 45° sibling.
  'Hyperextension Bodyweight', 'Reverse Hyperextension',
]);

// The back-extension SUBSET of LUMBAR_HINGES — the only members that can surface
// on a pull/upper/back day (the deadlift family anchors leg/posterior days; it is
// not offered from the spate accessory pool, so demoting it there is a no-op we
// deliberately avoid widening to).
export const BACK_EXTENSION_FAMILY = Object.freeze([
  'Roman Chair Back Extension', '45° Hyperextension', 'GHD Back Extension',
  'Weighted Hyperextension', 'Hyperextension Machine',
  // 2026-06-11 sweep review — same list-gap fix as LUMBAR_HINGES above.
  'Hyperextension Bodyweight', 'Reverse Hyperextension',
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
 * @param {string[]} [input.owedClusters=[]] clusters front-loaded (dp_carryover_balance_v1)
 * @returns {Record<string, number> | null} demote map ({name:1}) or null (no-op)
 */
export function lumbarDedupPenalties({
  flagOn,
  activeWeek,
  dayIdx,
  todayCluster,
  focusPreset = 'balanced',
  splitRebalance = false,
  owedClusters = [],
}) {
  if (!flagOn) return null;
  if (!Array.isArray(activeWeek)) return null;
  // ── Back-extension cross-day dedup (Daniel live coach-review 2026-06-11) ──
  // His real week: 45° Hyperextension on Thu (pull) AND Fri (upper) with the RDL
  // on Sat — three consecutive lumbar-loaded days. The hinge branch below never
  // saw it (pull/upper are not hinge clusters). Same first-day-keeps shape: the
  // FIRST back-capable day of the week keeps its (single) back-extension; every
  // SUBSEQUENT pull/upper/back day demotes the family so a non-lumbar spate
  // accessory (pullover / shrug / row variant) leads. Demote-only via the same
  // penalty channel → last-option guarded, never a ban.
  if (BACK_ACCESSORY_CLUSTERS.has(todayCluster)) {
    let priorBackDays = 0;
    for (let i = 0; i < dayIdx; i++) {
      if (!activeWeek[i]) continue;
      if (BACK_ACCESSORY_CLUSTERS.has(clusterForDay(activeWeek, i, focusPreset, splitRebalance, owedClusters))) {
        priorBackDays += 1;
      }
    }
    if (priorBackDays < 1) return null; // first back-capable day keeps it
    const penalties = {};
    for (const name of BACK_EXTENSION_FAMILY) penalties[name] = 1.0;
    return penalties;
  }
  // Only a leg/posterior (hinge-capable) day can carry a redundant hinge.
  if (!HINGE_CLUSTERS.has(todayCluster)) return null;
  // Count active hinge-cluster days scheduled BEFORE today this week.
  let priorHingeDays = 0;
  for (let i = 0; i < dayIdx; i++) {
    if (!activeWeek[i]) continue;
    if (HINGE_CLUSTERS.has(clusterForDay(activeWeek, i, focusPreset, splitRebalance, owedClusters))) {
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
 * The active week's derived cluster list (F5 dp_latiso_dedup_v1, 2026-06-10).
 * Same cheap re-derivation as the lumbar dedup above: the day→cluster map is
 * deterministic + pure, so cross-day awareness needs no ledger. Used by the
 * focus-policy resolver to defer a weekly minimum from the GENERALIST 'upper'
 * day to the week's SPECIALIST days (pull/back own the lat-iso exposure).
 *
 * @param {Object} input
 * @param {ReadonlyArray<boolean>} input.activeWeek length-7 active flags
 * @param {string} [input.focusPreset='balanced']
 * @param {boolean} [input.splitRebalance=false]
 * @param {string[]} [input.owedClusters=[]] clusters front-loaded (dp_carryover_balance_v1)
 * @returns {string[]} clusters of the ACTIVE days, in day order
 */
export function weekClustersFor({ activeWeek, focusPreset = 'balanced', splitRebalance = false, owedClusters = [] }) {
  if (!Array.isArray(activeWeek)) return [];
  const out = [];
  for (let i = 0; i < activeWeek.length; i++) {
    if (!activeWeek[i]) continue;
    out.push(clusterForDay(activeWeek, i, focusPreset, splitRebalance, owedClusters));
  }
  return out;
}

/**
 * MAX-merge any number of {name:penalty} maps (each may be null). Mirrors how
 * poolForGroup reads a single penalty channel — the higher demote wins so a
 * lumbar-redundant hinge that is ALSO pain-flagged stays demoted. Variadic since
 * 2026-06-10 (pain + refusal-memory + lumbar feed the same channel); a 2-arg
 * call behaves exactly as before.
 *
 * @param {...(Record<string, number> | null | undefined)} maps
 * @returns {Record<string, number> | null}
 */
export function mergePenalties(...maps) {
  /** @type {Record<string, number> | null} */
  let out = null;
  for (const m of maps) {
    if (!m) continue;
    if (!out) { out = { ...m }; continue; }
    for (const [k, v] of Object.entries(m)) out[k] = Math.max(out[k] ?? 0, v);
  }
  return out;
}
