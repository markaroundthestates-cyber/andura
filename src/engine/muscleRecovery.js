// ══ MUSCLE RECOVERY — Per-group recovery state + lagging detection ═══════
// Aggregate per-muscle-head recovery (MUSCLE_HEADS recoveryHours) into broad
// groups Big 6 (chest / back / shoulders / legs / arms / core). Plus lagging
// detection: muscles sub-volume 2+ saptamani vs equal Big 6 distribution.
//
// Pure functions — no DB / DOM deps. Inputs: logs array. Testable in vacuum.

import { EXERCISE_MUSCLES, MUSCLE_HEADS, getMuscleState } from './muscleMap.js';
import { MS_PER_DAY } from '../constants.js';

// Big 6 group taxonomy — maps muscle heads → broad group for UI.
export const GROUP_HEAD_MAP = {
  chest:     ['chest_upper', 'chest_mid', 'chest_lower'],
  back:      ['lat', 'mid_trap', 'lower_back'],
  shoulders: ['delt_front', 'delt_mid', 'delt_rear', 'rear_delt_trap'],
  legs:      ['quad', 'hamstring', 'glute', 'calf'],
  arms:      ['bi_long', 'bi_short', 'tri_long', 'tri_lateral', 'tri_medial'],
  core:      [],
};

const GROUP_LABELS_RO = {
  chest:     'Pieptul',
  back:      'Spatele',
  shoulders: 'Umerii',
  legs:      'Picioarele',
  arms:      'Bratele',
  core:      'Core-ul',
};

// State thresholds — getMuscleState returns 0-100 (higher = more recent stress).
// Calibrated against typical session contribution: ~22.5 per primary muscle head
// at peak (no decay, rpe 1.0). Two-three primary hits on same head ~= fatigued.
const FATIGUED_THRESHOLD = 35;
const PARTIAL_THRESHOLD  = 12;

/**
 * Build per-group recovery state map.
 * @param {Array} logs — workout logs (db.js logs shape)
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function getRecoveryByGroup(logs) {
  const headState = getMuscleState(logs);
  const groupState = {};
  for (const [group, heads] of Object.entries(GROUP_HEAD_MAP)) {
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
 * @param {Array} logs
 * @param {string} group
 * @returns {number|null} — null if never trained
 */
export function daysSinceGroup(logs, group) {
  const heads = new Set(GROUP_HEAD_MAP[group] || []);
  if (heads.size === 0) return null;
  let latest = 0;
  for (const log of logs || []) {
    if (log.baseline || !log.ex) continue;
    const muscles = EXERCISE_MUSCLES[log.ex];
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
 * @param {Object} profile — { logs: Array, lookbackDays?: 14 }
 * @returns {Array<{group: string, label: string, ratio: number, sets: number}>}
 *   Sorted by ratio ascending (most lagging first).
 */
export function getLaggingMuscles(profile) {
  const logs = profile?.logs || [];
  const lookbackDays = profile?.lookbackDays ?? 14;
  const cutoff = Date.now() - lookbackDays * MS_PER_DAY;

  const setsPerGroup = {};
  for (const g of Object.keys(GROUP_HEAD_MAP)) setsPerGroup[g] = 0;

  for (const log of logs) {
    if (log.baseline || !log.ex) continue;
    const ts = log.ts || (log.date ? new Date(log.date).getTime() : 0);
    if (ts < cutoff) continue;
    const muscles = EXERCISE_MUSCLES[log.ex];
    if (!muscles) continue;
    const touched = new Set();
    for (const head of muscles.primary || []) {
      for (const [g, heads] of Object.entries(GROUP_HEAD_MAP)) {
        if (heads.includes(head)) touched.add(g);
      }
    }
    touched.forEach(g => { setsPerGroup[g] += 1; });
  }

  // Only consider groups user actually trains (sets > 0 across any group)
  const activeGroups = Object.entries(setsPerGroup).filter(([, s]) => s > 0);
  if (activeGroups.length < 2) return [];

  const avg = activeGroups.reduce((a, [, s]) => a + s, 0) / activeGroups.length;
  const lagging = [];
  for (const [group, sets] of activeGroups) {
    const ratio = avg > 0 ? sets / avg : 1;
    if (ratio < 0.6) {
      lagging.push({
        group,
        label: GROUP_LABELS_RO[group] || group,
        ratio: parseFloat(ratio.toFixed(3)),
        sets,
      });
    }
  }
  lagging.sort((a, b) => a.ratio - b.ratio);
  return lagging;
}
