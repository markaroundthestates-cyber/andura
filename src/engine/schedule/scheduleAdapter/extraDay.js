// ══ EXTRA DAY — dp_extra_day_recovered_v1 ═════════════════════════════════════════
// Founder 2026-11-17: "dacă luni am push, marți pull, joi picioare și vineri upper... și
// mă decid să fac 5-6 zile în loc de 4, Andura de ce nu recomandă, cu volum redus, grupa
// care e cea mai recuperată la momentul schimbării?"
//
// A session started on a calendar REST day used to take the next training day's slot:
// Wednesday → Thursday's legs at full volume, then Thursday planned legs again (the
// done-early swap ignores rest-day sessions). An extra day is a BONUS: it trains the
// week's cluster that is freshest NOW and will be fresh again before its next scheduled
// session — a group trained tomorrow counts as fatigued, one trained the day after as
// partial at best — at reduced volume (EXTRA_DAY_SETS_FACTOR, floor EXTRA_DAY_MIN_SETS),
// so the scheduled days keep their work. PURE (recovery state + calendar injected).

import { CLUSTER_BIG6_TO_BIG11_WEIGHT } from '../../periodization/constants.js';
import { clusterForDay } from './frequencySplit.js';
import { rankAlternativeClusters } from './alternativeCluster.js';

/** Sets on an extra day = planned × this (the recovery engine's fatigued multiplier). */
export const EXTRA_DAY_SETS_FACTOR = 0.6;
/** Never under this many sets per exercise. */
export const EXTRA_DAY_MIN_SETS = 2;
/** A cluster's group counts for the calendar look-ahead from this weight up. */
const LOOKAHEAD_MIN_WEIGHT = 0.15;

const RANK = Object.freeze({ fatigued: 0, partial: 1, recovered: 2 });
const BY_RANK = Object.freeze(['fatigued', 'partial', 'recovered']);

/**
 * The cluster for a session on a calendar rest day.
 * @param {Object} input
 * @param {ReadonlyArray<boolean>} input.activeWeek length-7 active flags (Monday = 0)
 * @param {number} input.dayIdx today's weekday (Monday = 0)
 * @param {{[group: string]: 'recovered'|'partial'|'fatigued'}} input.recoveryState RO-keyed
 * @param {string} [input.focusPreset]
 * @param {boolean} [input.splitRebalance]
 * @param {string[]} [input.owedClusters]
 * @returns {string|null} null when the week has no training day to draw from
 */
export function pickExtraDayCluster({ activeWeek, dayIdx, recoveryState, focusPreset = 'balanced', splitRebalance = false, owedClusters = [] }) {
  const clusterOf = (d) => clusterForDay(activeWeek, d, focusPreset, splitRebalance, owedClusters);
  const weekClusters = [];
  for (let d = 0; d < 7; d++) if (activeWeek[d] && !weekClusters.includes(clusterOf(d))) weekClusters.push(clusterOf(d));
  if (!weekClusters.length) return null;

  // Days until each group's next scheduled session (wrapping into next week).
  /** @type {Record<string, number>} */
  const until = {};
  for (let k = 1; k <= 7; k++) {
    const d = (dayIdx + k) % 7;
    if (!activeWeek[d]) continue;
    for (const [g, w] of Object.entries(CLUSTER_BIG6_TO_BIG11_WEIGHT[clusterOf(d)] ?? {})) {
      if (w >= LOOKAHEAD_MIN_WEIGHT && until[g] === undefined) until[g] = k;
    }
  }
  // Freshness capped by the look-ahead: tomorrow → fatigued, the day after → partial.
  /** @type {Record<string, 'recovered'|'partial'|'fatigued'>} */
  const state = {};
  for (const g of new Set([...Object.keys(recoveryState || {}), ...Object.keys(until)])) {
    const now = RANK[(recoveryState || {})[g] ?? 'recovered'] ?? 2;
    const cap = until[g] === 1 ? 0 : until[g] === 2 ? 1 : 2;
    state[g] = BY_RANK[Math.min(now, cap)];
  }
  const ranked = rankAlternativeClusters('', state).filter((r) => weekClusters.includes(r.cluster));
  return ranked.length ? ranked[0].cluster : weekClusters[0];
}

/**
 * Reduced volume for an extra-day session (pure; returns new exercise objects).
 * @template {{sets?: number}} E
 * @param {E[]} exercises
 * @returns {E[]}
 */
export function extraDaySets(exercises) {
  return (Array.isArray(exercises) ? exercises : []).map((e) => {
    const sets = Number(e && e.sets);
    if (!(sets > 0)) return e;
    return { ...e, sets: Math.max(Math.min(sets, EXTRA_DAY_MIN_SETS), Math.round(sets * EXTRA_DAY_SETS_FACTOR)) };
  });
}
