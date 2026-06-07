// ══ MUSCLE RECOVERY — Per-group recovery state + lagging detection ═══════
// Aggregate per-muscle-head recovery (MUSCLE_HEADS recoveryHours) into broad
// groups Big 11 canonical V1 anatomical taxonomy per ADR_ENGINE_REFACTOR §4.1
// LOCK V1 2026-05-14 (piept/spate/umeri/biceps/triceps/antebrate/core/
// picioare-quads/picioare-hamstrings/fese/gambe). Plus lagging detection:
// muscles sub-volume 2+ saptamani vs equal Big 11 active-group distribution.
//
// Time-dependent functions (recovery decay + recency cutoffs read the wall
// clock). Inject `now` (default Date.now at I/O boundary) for deterministic
// testing per ADR 026 §9. No DB / DOM deps. Inputs: logs array.
// ZERO mutation algorithm semantics per §4.1 (FATIGUED/PARTIAL thresholds
// preserved; aggregation preserved; refactor = taxonomy expansion only).
//
// Cross-ref: ADR-ENGINE-MATH-LOCKED-VALUES §9 — Pain CDL + Recovery Engine
// wire-through documented; recovery state thresholds (FATIGUED=35, PARTIAL=12)
// + volume redistribution multipliers (recovered=1.00, partial=0.80,
// fatigued=0.60) cataloged for cross-engine audit gate.

import { EXERCISE_MUSCLES, getMuscleState } from './muscleMap.js';
import { MS_PER_DAY, MS_PER_HOUR } from '../constants.js';
import {
  GROUP_HEAD_MAP_BIG11,
  GROUP_LABELS_RO_BIG11,
  BIG11_GROUPS,
  PAIN_REGION_GROUP_MAP,
} from './muscleRecoveryConstants.js';

// Big 11 canonical V1 group taxonomy — maps muscle heads → broad group for UI.
// Re-export from constants for backwards-compatible import path.
export const GROUP_HEAD_MAP = GROUP_HEAD_MAP_BIG11;

const GROUP_LABELS_RO = GROUP_LABELS_RO_BIG11;

// Re-export Big 11 constants for downstream cross-engine consumption.
export { GROUP_HEAD_MAP_BIG11, GROUP_LABELS_RO_BIG11, BIG11_GROUPS };

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
 * @param {Array<{type?: string, region?: string, intensity?: 1|2|3, ts?: number}>} [painEntries] — append-only pain CDL (DB('pain-cdl')), read at I/O boundary
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function getRecoveryByGroup(logs, painEntries, now = Date.now()) {
  const headState = /** @type {Record<string, number>} */ (getMuscleState(logs, now));
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
  applyPainEscalation(groupState, painEntries, now);
  return groupState;
}

// ══ AEROBIC → RECOVERY (light, fast-recovery cardio touch) ════════════════
// Aerobic CLASSES (aerobicStore) load muscles too, but cardio fatigue is NOT
// resistance fatigue: it is a light, broad, fast-recovering touch. So an aerobic
// session may EASE a group (recovered -> partial / "Easing") but NEVER drives it
// deep "Loaded"/fatigued, and it clears fast (~24h window) instead of the 48-96h
// resistance recovery. The body map should reflect "you moved that yesterday"
// without crying deep fatigue.
//
// Per-class muscle gradient (real aerobic movement: marching, jacks, knee lifts,
// grapevine, lunges, butt kicks, burpees / mountain climbers):
//   core dominant (every move) · legs heavy · upper light · arms light isometric.
//   NOTHING is fully untouched. Spinning is the exception — legs + core dominant,
//   minimal upper. Values are 0..1 RELATIVE intensity per Big-11 group.
/** @type {Record<string, Record<string, number>>} */
export const AEROBIC_GROUP_GRADIENT = {
  // General studio aerobics / step / zumba / "alta" share the full-body gradient.
  aerobic: {
    core: 1.0,
    'picioare-quads': 0.8, fese: 0.8, 'picioare-hamstrings': 0.7, gambe: 0.7,
    umeri: 0.35, piept: 0.3, triceps: 0.3, spate: 0.3,
    biceps: 0.2, antebrate: 0.2,
  },
  step: {
    core: 1.0,
    'picioare-quads': 0.9, fese: 0.85, 'picioare-hamstrings': 0.7, gambe: 0.8,
    umeri: 0.3, piept: 0.25, triceps: 0.25, spate: 0.3,
    biceps: 0.2, antebrate: 0.2,
  },
  zumba: {
    core: 1.0,
    'picioare-quads': 0.8, fese: 0.8, 'picioare-hamstrings': 0.65, gambe: 0.7,
    umeri: 0.4, piept: 0.3, triceps: 0.3, spate: 0.35,
    biceps: 0.25, antebrate: 0.2,
  },
  // Spinning: legs + core dominant, minimal upper (still nothing fully zero —
  // the torso braces, the arms hold the bars).
  spinning: {
    core: 0.9,
    'picioare-quads': 1.0, fese: 0.85, 'picioare-hamstrings': 0.8, gambe: 0.7,
    umeri: 0.15, piept: 0.15, triceps: 0.15, spate: 0.2,
    biceps: 0.15, antebrate: 0.15,
  },
  // Generic "other class" — same broad full-body gradient as aerobic.
  alta: {
    core: 1.0,
    'picioare-quads': 0.8, fese: 0.8, 'picioare-hamstrings': 0.7, gambe: 0.7,
    umeri: 0.35, piept: 0.3, triceps: 0.3, spate: 0.3,
    biceps: 0.2, antebrate: 0.2,
  },
};

// Cardio clears fast — a 24h light-touch window. Beyond it an aerobic session no
// longer eases any group (a single rest day fully resets the cardio touch).
const AEROBIC_RECOVERY_WINDOW_HOURS = 24;
// A group whose decayed aerobic load clears this bar reads "Easing" (partial).
// Tuned so a same-day / recent class eases its dominant groups (core + legs)
// while the light upper-body touch stays mostly below the bar — honest: cardio
// barely taxes the upper body.
const AEROBIC_EASE_THRESHOLD = 0.35;

/**
 * Per-group "Easing" contribution from recent aerobic CLASSES. Pure. Returns a
 * partial map: only groups the recent cardio actually eased appear (value
 * 'partial'); everything else is omitted (caller treats absent as no aerobic
 * touch). Cardio is capped at 'partial' by design — it never reports 'fatigued'.
 *
 * @param {Array<{type?: string, ts?: number, date?: string}>} sessions — aerobicStore sessions
 * @param {number} [now] — reference timestamp (default Date.now); inject for tests
 * @returns {{[group:string]: 'partial'}}
 */
export function getAerobicRecoveryContribution(sessions, now = Date.now()) {
  /** @type {{[group:string]: number}} */
  const load = {};
  if (!Array.isArray(sessions)) return {};
  const windowMs = AEROBIC_RECOVERY_WINDOW_HOURS * 60 * 60 * 1000;
  for (const s of sessions) {
    if (!s || typeof s.type !== 'string') continue;
    const gradient = AEROBIC_GROUP_GRADIENT[s.type];
    if (!gradient) continue;
    // Recency must reflect WHEN THE CLASS HAPPENED, not when it was logged.
    // Backward logging (decision #45): a class logged TODAY for a PAST day keeps
    // a fresh `ts` (= now) but an older `date`. Anchoring on `ts` would read a
    // days-old class as "just done" and ease groups it shouldn't.
    //   - When `ts` falls on the SAME calendar day as `date` it is a genuine
    //     real-time log → use `ts` (precise, and never in the future).
    //   - Otherwise (backdated, or `ts` absent) anchor on the day's NOON so a
    //     past day reads as past and today's morning log never lands in the
    //     future (noon-anchoring `ts` on the current day could).
    const rawTs = typeof s.ts === 'number' ? s.ts : 0;
    const noonTs = s.date ? new Date(`${s.date}T12:00:00`).getTime() : 0;
    let ts;
    if (rawTs && noonTs) {
      const tsDay = new Date(rawTs);
      const sameDay = `${tsDay.getFullYear()}-${String(tsDay.getMonth() + 1).padStart(2, '0')}-${String(tsDay.getDate()).padStart(2, '0')}` === s.date;
      ts = sameDay ? rawTs : noonTs;
    } else {
      ts = rawTs || noonTs;
    }
    if (!ts) continue;
    const hoursAgo = (now - ts) / (60 * 60 * 1000);
    if (hoursAgo < 0 || hoursAgo > AEROBIC_RECOVERY_WINDOW_HOURS) continue;
    // Linear fade across the 24h window (light + fast: a class eases most right
    // after, and is gone by the next day).
    const decay = 1 - (now - ts) / windowMs;
    for (const [group, weight] of Object.entries(gradient)) {
      load[group] = (load[group] ?? 0) + weight * decay;
    }
  }
  /** @type {{[group:string]: 'partial'}} */
  const out = {};
  for (const [group, value] of Object.entries(load)) {
    if (value >= AEROBIC_EASE_THRESHOLD) out[group] = 'partial';
  }
  return out;
}

/**
 * Merge the aerobic "Easing" contribution into a resistance recovery-state map
 * (from getRecoveryByGroup). Cardio only RAISES a 'recovered' group to 'partial'
 * — it never deepens an already-stressed group and never reaches 'fatigued'. So
 * a muscle the user lifted heavy stays 'fatigued'/'partial' from the weights;
 * one only touched by cardio shows 'partial' (Easing). Returns a NEW map.
 *
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} resistanceState
 * @param {Array<{type?: string, ts?: number, date?: string}>} aerobicSessions
 * @param {number} [now]
 * @returns {{[group:string]: 'recovered'|'partial'|'fatigued'}}
 */
export function mergeAerobicRecovery(resistanceState, aerobicSessions, now = Date.now()) {
  const aerobic = getAerobicRecoveryContribution(aerobicSessions, now);
  /** @type {{[group:string]: 'recovered'|'partial'|'fatigued'}} */
  const merged = { ...resistanceState };
  for (const [group, state] of Object.entries(aerobic)) {
    // Only lift a recovered group up to partial — never lower a stressed one.
    if ((merged[group] ?? 'recovered') === 'recovered') merged[group] = state;
  }
  return merged;
}

/**
 * Escalate group recovery states from recent pain CDL entries (in place).
 * now is an injectable reference timestamp (default Date.now — same
 * time-relative convention as sibling daysSinceGroup / getLaggingMuscles which
 * also accept an injectable now). Empty/missing painEntries is a no-op (conservative
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
 * Most-recent timestamp (epoch ms) of a session that touched a given group, or
 * null if the group was never trained. Single source of truth for the
 * elapsed-time helpers below: session.ts is epoch ms and carries time-of-day, so
 * the raw timestamp preserves sub-day (hour-level) precision that day-floored
 * callers would otherwise lose. Pure.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @returns {number|null} — epoch ms of the last-trained session, or null if never trained
 */
function lastTrainedTsForGroup(logs, group) {
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
  return latest === 0 ? null : latest;
}

/**
 * REAL elapsed HOURS since the last session targeting a given group (NOT floored
 * to whole days). This is the honest rest-gap signal: a session at 18:00 read at
 * 07:00 the next morning is ~13h — sub-minimal for the same group — even though
 * daysSinceGroup would floor it to 0/1 "day" and read it as a full rest. Pairs
 * with getRecoveryByGroup (which already decays per-hour) so the daily plan and
 * narrative speak the same hour-accurate truth.
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @returns {number|null} — elapsed hours (float), or null if never trained
 */
export function hoursSinceGroup(logs, group, now = Date.now()) {
  const latest = lastTrainedTsForGroup(logs, group);
  if (latest === null) return null;
  return (now - latest) / MS_PER_HOUR;
}

/**
 * Days since last session targeting a given group (floored). Kept for callers
 * that genuinely want whole-day buckets; derives from the same last-trained
 * timestamp as hoursSinceGroup (single source of truth).
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {string} group
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @returns {number|null} — null if never trained
 */
export function daysSinceGroup(logs, group, now = Date.now()) {
  const latest = lastTrainedTsForGroup(logs, group);
  if (latest === null) return null;
  return Math.floor((now - latest) / MS_PER_DAY);
}

/**
 * Per-group recovery DETAIL — the clean machine signal a narrative layer words.
 * For every Big-11 group, exposes BOTH the recovery `state`
 * ('recovered'|'partial'|'fatigued', already hour-accurate via getMuscleState's
 * per-hour decay) AND the REAL `elapsedHours` since that group was last trained
 * (null if never trained). No copy here — the narrative agent decides whether to
 * say "13h" / "yesterday" / "fresh" from these numbers.
 *
 * Sub-minimal rest surfaces honestly: a group trained 13h ago reads
 * elapsedHours≈13 with state 'partial'/'fatigued' (never a false 'recovered').
 *
 * @param {Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>} logs
 * @param {Array<{type?: string, region?: string, intensity?: 1|2|3, ts?: number}>} [painEntries]
 * @param {number} [now] — reference timestamp (default Date.now); inject for deterministic testing
 * @returns {{[group:string]: {state: 'recovered'|'partial'|'fatigued', elapsedHours: number|null}}}
 */
export function getGroupRecoveryDetail(logs, painEntries, now = Date.now()) {
  const groupState = getRecoveryByGroup(logs, painEntries, now);
  /** @type {{[group:string]: {state: 'recovered'|'partial'|'fatigued', elapsedHours: number|null}}} */
  const detail = {};
  for (const group of Object.keys(groupState)) {
    detail[group] = {
      state: groupState[group],
      elapsedHours: hoursSinceGroup(logs, group, now),
    };
  }
  return detail;
}

/**
 * Map a single exercise (by its canonical EN engine name) to the Big-11 group(s)
 * its PRIMARY muscles load. Same taxonomy + attribution the recovery + lagging
 * math use (EXERCISE_MUSCLES.primary → GROUP_HEAD_MAP_BIG11), so a narrative
 * layer can compute "which groups does TODAY's plan actually train" against the
 * exact buckets the engine reasons in. Returns [] for an unknown exercise name.
 *
 * Primary-only (not secondary) so allocation reflects the exercise's MAIN target
 * — a bench press counts toward chest, not toward the triceps it incidentally
 * assists. Pure; no clock.
 *
 * @param {string|undefined|null} engineName — canonical EN exercise name (the key into EXERCISE_MUSCLES)
 * @returns {string[]} Big-11 RO group keys this exercise primarily trains (deduped)
 */
export function groupForExerciseBig11(engineName) {
  if (!engineName) return [];
  const exMap = /** @type {Record<string, {primary?: string[], secondary?: string[]}>} */ (EXERCISE_MUSCLES);
  const muscles = exMap[engineName];
  if (!muscles) return [];
  const headMap = /** @type {Record<string, string[]>} */ (GROUP_HEAD_MAP);
  /** @type {Set<string>} */
  const groups = new Set();
  for (const head of muscles.primary || []) {
    for (const [g, heads] of Object.entries(headMap)) {
      if (heads.includes(head)) groups.add(g);
    }
  }
  return [...groups];
}

/**
 * Volume-based lagging detection: groups under-volume 2+ saptamani vs Big 6
 * equal distribution (~16-17% target each). Lagging = group < 60% of average
 * peer group volume across last 14 days.
 *
 * @param {{ logs?: Array<{ex?: string, baseline?: boolean, ts?: number, date?: string}>, lookbackDays?: number, now?: number } | null | undefined} profile — { logs: Array, lookbackDays?: 14, now?: Date.now } — inject now for deterministic testing
 * @returns {Array<{group: string, label: string, ratio: number, sets: number}>}
 *   Sorted by ratio ascending (most lagging first).
 */
export function getLaggingMuscles(profile) {
  const logs = profile?.logs || [];
  const lookbackDays = profile?.lookbackDays ?? 14;
  const injectedNow = profile?.now;
  const now = Number.isFinite(injectedNow) ? /** @type {number} */ (injectedNow) : Date.now();
  const cutoff = now - lookbackDays * MS_PER_DAY;

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
