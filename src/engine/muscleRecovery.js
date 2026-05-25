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
//
// Cross-ref: ADR-ENGINE-MATH-LOCKED-VALUES §9 — Pain CDL + Recovery Engine
// wire-through documented; recovery state thresholds (FATIGUED=35, PARTIAL=12)
// + volume redistribution multipliers (recovered=1.00, partial=0.80,
// fatigued=0.60) cataloged for cross-engine audit gate.

import { EXERCISE_MUSCLES, getMuscleState } from './muscleMap.js';
import { MS_PER_DAY } from '../constants.js';
import {
  GROUP_HEAD_MAP_BIG11,
  GROUP_LABELS_RO_BIG11,
  DECAY_RATE_HOURS_BIG11,
  BIG11_GROUPS,
  PAIN_REGION_GROUP_MAP,
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

// Pain CDL -> Recovery escalation (ADR-ENGINE-MATH-LOCKED-VALUES section 9).
// Section 9 wires the consumption but does NOT lock a numeric pain->recovery
// formula, so the mechanism below is the simplest contract aligned with the
// section 8 intensity->action branching + section 9 volume-redistribution
// multipliers:
//   intensity 1 (usor)  -> suggest_alternative -> escalate to >= 'partial'  (0.80x)
//   intensity 2 (mediu) -> reduce_volume        -> escalate to >= 'partial'  (0.80x)
//   intensity 3 (sever) -> skip                 -> escalate to 'fatigued'    (0.60x)
// Escalation only RAISES the computed state (never lowers): a recovered group
// with recent pain becomes partial/fatigued; an already-fatigued group stays.
// Pain is acute — only entries within PAIN_RECENCY_DAYS influence recovery so a
// one-off report does not dampen the group indefinitely.
const PAIN_RECENCY_DAYS = 3;
/** @type {Record<'recovered'|'partial'|'fatigued', number>} */
const STATE_RANK = { recovered: 0, partial: 1, fatigued: 2 };
const STATE_BY_RANK = ['recovered', 'partial', 'fatigued'];

/**
 * Build per-group recovery state map.
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs — workout logs (db.js logs shape)
 * @param {Array<{type?: string, region?: string, intensity?: 1|2|3, ts?: number}>} [painEntries] — append-only pain CDL (DB('pain-cdl')), read at I/O boundary; engine stays pure
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function getRecoveryByGroup(logs, painEntries) {
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
  applyPainEscalation(groupState, painEntries);
  return groupState;
}

/**
 * Escalate group recovery states from recent pain CDL entries (in place).
 * now is an injectable reference timestamp (default Date.now — same
 * time-relative convention as sibling daysSinceGroup / getLaggingMuscles which
 * read Date.now directly). Empty/missing painEntries is a no-op (conservative
 * baseline preserved when the adapter has no pain CDL to pass).
 *
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} groupState — mutated in place
 * @param {Array<{type?: string, region?: string, intensity?: number, ts?: number}>|undefined} painEntries
 * @param {number} [now] — reference timestamp for recency cutoff
 */
function applyPainEscalation(groupState, painEntries, now = Date.now()) {
  if (!Array.isArray(painEntries) || painEntries.length === 0) return;
  const regionMap = /** @type {Record<string, string[]>} */ (PAIN_REGION_GROUP_MAP);
  const cutoff = now - PAIN_RECENCY_DAYS * MS_PER_DAY;
  for (const entry of painEntries) {
    if (!entry || entry.type !== 'pain' || !entry.region) continue;
    const ts = typeof entry.ts === 'number' ? entry.ts : 0;
    if (ts < cutoff) continue;
    const groups = regionMap[entry.region];
    if (!groups) continue;
    // intensity 3 (sever) -> fatigued; 1/2 (usor/mediu) -> at least partial.
    const escalatedRank = entry.intensity === 3 ? STATE_RANK.fatigued : STATE_RANK.partial;
    for (const group of groups) {
      const currentRank = STATE_RANK[groupState[group]] ?? 0;
      if (escalatedRank > currentRank) {
        groupState[group] = /** @type {'recovered'|'partial'|'fatigued'} */ (STATE_BY_RANK[escalatedRank]);
      }
    }
  }
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
