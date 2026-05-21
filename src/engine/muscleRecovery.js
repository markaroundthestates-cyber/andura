// ══ MUSCLE RECOVERY — Per-group recovery state + lagging detection ═══════
// Aggregate per-muscle-head recovery (MUSCLE_HEADS recoveryHours) into broad
// groups Big 11 canonical V1 anatomical taxonomy per ADR_ENGINE_REFACTOR §4.1
// LOCK V1 2026-05-14 (piept/spate/umeri/biceps/triceps/antebrate/core/
// picioare-quads/picioare-hamstrings/fese/gambe). Plus lagging detection:
// muscles sub-volume 2+ saptamani vs equal Big 11 active-group distribution.
//
// Pure functions — no DB / DOM deps. Inputs: logs array. Testable in vacuum.
// ZERO mutation algorithm semantics per §4.1 (FATIGUED/PARTIAL thresholds
// preserved; aggregation preserved; refactor = taxonomy expansion only).

import { EXERCISE_MUSCLES, MUSCLE_HEADS, getMuscleState } from './muscleMap.js';
import { MS_PER_DAY } from '../constants.js';
import {
  GROUP_HEAD_MAP_BIG11,
  GROUP_LABELS_RO_BIG11,
  DECAY_RATE_HOURS_BIG11,
  BIG11_GROUPS,
} from './muscleRecoveryConstants.js';

// Big 11 canonical V1 group taxonomy — maps muscle heads → broad group for UI.
// Re-export from constants for backwards-compatible import path.
export const GROUP_HEAD_MAP = GROUP_HEAD_MAP_BIG11;

const GROUP_LABELS_RO = GROUP_LABELS_RO_BIG11;

// Re-export Big 11 constants for downstream cross-engine consumption.
export { GROUP_HEAD_MAP_BIG11, GROUP_LABELS_RO_BIG11, DECAY_RATE_HOURS_BIG11, BIG11_GROUPS };

// State thresholds — getMuscleState returns 0-100 (higher = more recent stress).
// Calibrated against typical session contribution: ~22.5 per primary muscle head
// at peak (no decay, rpe 1.0). Two-three primary hits on same head ~= fatigued.
const FATIGUED_THRESHOLD = 35;
const PARTIAL_THRESHOLD  = 12;

/**
 * Build per-group recovery state map.
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs — workout logs (db.js logs shape)
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function getRecoveryByGroup(logs) {
  const headState = /** @type {Record<string, number>} */ (getMuscleState(logs));
  /** @type {{[group:string]: 'recovered'|'partial'|'fatigued'}} */
  const groupState = {};
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  for (const [group, heads] of Object.entries(headMap)) {
    if (heads.length === 0) {
      groupState[group] = 'recovered';
      continue;
    }
    const max = heads.reduce((m, h) => Math.max(m, headState[h] ?? 0), 0);
    if (max >= FATIGUED_THRESHOLD)      groupState[group] = 'fatigued';
    else if (max >= PARTIAL_THRESHOLD)  groupState[group] = 'partial';
    else                                groupState[group] = 'recovered';
  }
  return groupState;
}

/**
 * Days since last session targeting a given group.
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @returns {number|null} — null if never trained
 */
export function daysSinceGroup(logs, group) {
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  const heads = new Set(headMap[group] || []);
  if (heads.size === 0) return null;
  let latest = 0;
  const exMap = /** @type {Record<string, {primary?: string[], secondary?: string[]}>} */ (EXERCISE_MUSCLES);
  for (const log of logs || []) {
    if (log.baseline || !log.ex) continue;
    const muscles = exMap[log.ex];
    if (!muscles) continue;
    const touchesGroup = [...(muscles.primary || []), ...(muscles.secondary || [])]
      .some(h => heads.has(h));
    if (!touchesGroup) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (ts > latest) latest = ts;
  }
  if (latest === 0) return null;
  return Math.floor((Date.now() - latest) / MS_PER_DAY);
}

/**
 * Volume-based lagging detection: groups under-volume 2+ saptamani vs Big 6
 * equal distribution (~16-17% target each). Lagging = group < 60% of average
 * peer group volume across last 14 days.
 *
 * @param {{ logs?: Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>, lookbackDays?: number } | null | undefined} profile — { logs: Array, lookbackDays?: 14 }
 * @returns {Array<{group: string, label: string, ratio: number, sets: number}>}
 *   Sorted by ratio ascending (most lagging first).
 */
export function getLaggingMuscles(profile) {
  const logs = profile?.logs || [];
  const lookbackDays = profile?.lookbackDays ?? 14;
  const cutoff = Date.now() - lookbackDays * MS_PER_DAY;

  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  const exMap = /** @type {Record<string, {primary?: string[], secondary?: string[]}>} */ (EXERCISE_MUSCLES);
  /** @type {Record<string, number>} */
  const setsPerGroup = {};
  for (const g of Object.keys(headMap)) setsPerGroup[g] = 0;

  for (const log of logs) {
    if (log.baseline || !log.ex) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (ts < cutoff) continue;
    const muscles = exMap[log.ex];
    if (!muscles) continue;
    /** @type {Set<string>} */
    const touched = new Set();
    for (const head of muscles.primary || []) {
      for (const [g, heads] of Object.entries(headMap)) {
        if (heads.includes(head)) touched.add(g);
      }
    }
    touched.forEach(g => { setsPerGroup[g] = (setsPerGroup[g] ?? 0) + 1; });
  }

  // Only consider groups user actually trains (sets > 0 across any group)
  const activeGroups = Object.entries(setsPerGroup).filter(([, s]) => s > 0);
  if (activeGroups.length < 2) return [];

  const avg = activeGroups.reduce((a, [, s]) => a + s, 0) / activeGroups.length;
  const labels = /** @type {Record<string, string>} */ (GROUP_LABELS_RO);
  const lagging = [];
  for (const [group, sets] of activeGroups) {
    const ratio = avg > 0 ? sets / avg : 1;
    if (ratio < 0.6) {
      lagging.push({
        group,
        label: labels[group] || group,
        ratio: parseFloat(ratio.toFixed(3)),
        sets,
      });
    }
  }
  lagging.sort((a, b) => a.ratio - b.ratio);
  return lagging;
}
