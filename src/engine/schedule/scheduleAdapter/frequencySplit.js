// ── Frequency-based split (D-volume-driven program 2026-06-02) ───────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// The program is VOLUME-DRIVEN: the user's Nth active training day maps to the
// Nth cluster of a frequency-appropriate template — NOT to the absolute weekday.
// The old DAY_TO_SESSION_TYPE absolute-weekday map surfaced legs only on
// Wednesday and never reached glutes/calves; this maps active-day position →
// cluster so a Lower/Legs/Full day exists at every frequency and every Big-11
// group (incl. fese/gambe) is reachable.
//
// Templates (ordered clusters, lowercase = CLUSTER_BIG6_TO_BIG11_WEIGHT keys).
// 3 → Full×3 (Daniel choice: better frequency, legs every session). Indexed 1..7.

import { SCHEDULE_STORE_KEY } from './constants.js';
import { resolveFocusPreset } from './focus.js';

const FREQUENCY_SPLITS = Object.freeze({
  1: Object.freeze(['full']),
  2: Object.freeze(['upper', 'lower']),
  3: Object.freeze(['full', 'full', 'full']),
  4: Object.freeze(['upper', 'lower', 'upper', 'lower']),
  5: Object.freeze(['upper', 'lower', 'push', 'pull', 'legs']),
  6: Object.freeze(['push', 'pull', 'legs', 'upper', 'lower', 'full']),
  7: Object.freeze(['push', 'pull', 'legs', 'upper', 'lower', 'full', 'full']),
});

// ── Focus-aware split reshaping (D-focus 2026-06-02) ─────────────────────
// A focus preset that DE-EMPHASIZES the lower body should also reshape the WEEK:
// remove ~1 lower/legs cluster and reallocate that day to the focus region
// (upper-biased push/pull). E.g. v-taper @ 4 days: the balanced template
// ['upper','lower','upper','lower'] (TWO leg days) → ['push','pull','upper','lower']
// (ONE leg day; the freed day becomes focus-region work). The emphasized region
// thus gains ≥1 cluster. `balanced` → the templates UNCHANGED (byte-identical).
//
// CRITICAL — recovery SPACING (fix 2026-06-02): a naive slot-swap (replace the
// first leg day with push) yields ['upper','push','upper','lower'] = UPPER then
// PUSH on consecutive training days. Both hammer chest/shoulders/triceps, so the
// same muscles are trained two days running → the second session lands fried
// (recovery cut + bite collapse it to ~2 sets/exercise — the "27-min" thin-session
// bug). The reshape therefore prefers a purpose-built SPACED template
// (FOCUS_LOWER_DEEMPH_SPLITS) that keeps each muscle's hits ≥48-72h apart, and
// only falls back to the slot-swap for day-counts without a spaced template.
const LOWER_CLUSTERS = Object.freeze(['lower', 'legs']);

// Recovery-SPACED templates for lower-de-emphasis presets (v-taper), keyed by
// training-day count. Each trades ONE leg day for focus-region work AND orders
// the week so the push muscles (piept/umeri/triceps) never train on back-to-back
// active days. 4 days L/Ma/J/V: push(Mon)→pull(Tue, spate/biceps fresh)→upper(Thu,
// 72h after push)→lower(Fri). Day-counts absent here fall back to the slot-swap.
const FOCUS_LOWER_DEEMPH_SPLITS = Object.freeze({
  4: Object.freeze(['push', 'pull', 'upper', 'lower']),
  // 5 days L/Ma/Mi/V/S (Mon-Tue-Wed consecutive block + Fri-Sat): push/pull/legs
  // are mutually non-overlapping, so the Mon-Tue-Wed block stays clean, and
  // push(Fri)/pull(Sat) repeat the width work without overlap. ONE leg day (Wed);
  // umeri hit Mon+Fri, spate hit Tue+Sat — emphasis preserved, fully spaced.
  5: Object.freeze(['push', 'pull', 'legs', 'push', 'pull']),
  // 6/7 days are reachable only by MANUAL calendar edits (onboarding offers 2-5),
  // and a dense week is usually consecutive (e.g. Mon-Sat), so the split itself
  // must never place overlapping clusters on adjacent positions. push/pull/legs
  // are mutually non-overlapping, so a push/pull alternation with ONE leg day is
  // spacing-safe at any consecutive-day layout (no muscle on back-to-back days;
  // each width region hit every ~48h). The blind slot-swap instead produced
  // pull→pull (and lower→full) adjacency. Width-emphasis (umeri via push, spate
  // via pull) preserved; legs maintained at one day.
  6: Object.freeze(['push', 'pull', 'push', 'pull', 'push', 'legs']),
  7: Object.freeze(['push', 'pull', 'push', 'pull', 'push', 'pull', 'legs']),
});

/**
 * Reshape an ordered cluster template for a focus preset that de-emphasizes the
 * lower body: replace ONE lower/legs cluster with a focus-region cluster
 * (push/pull alternation), so the week trades a leg day for upper-focus work.
 * Only the FIRST lower slot is swapped (≥1 leg day always retained — a
 * de-emphasized muscle is MAINTAINED, never abandoned). Presets that do not
 * de-emphasize the lower body, or templates with ≤1 lower slot, are returned
 * unchanged. Pure.
 *
 * @param {string[]} split - ordered Big-6 cluster ids (a fresh copy)
 * @param {{emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}} preset
 * @returns {string[]} reshaped split (same length)
 */
function reshapeSplitForFocus(split, preset) {
  // Only reshape when the lower body is de-emphasized (the v-taper / freed-day
  // case). Emphasis-only presets (arms/chest/lower) keep the balanced template
  // — the volume stage carries those; no day is freed.
  const deEmphLower =
    preset.deEmphasize.includes('picioare-quads') ||
    preset.deEmphasize.includes('picioare-hamstrings') ||
    preset.deEmphasize.includes('fese');
  if (!deEmphLower) return split;
  const lowerIdxs = [];
  for (let i = 0; i < split.length; i++) {
    if (LOWER_CLUSTERS.includes(split[i])) lowerIdxs.push(i);
  }
  // Need ≥2 lower slots to free one (always retain ≥1 leg day).
  if (lowerIdxs.length < 2) return split;
  // Prefer a recovery-SPACED template for this day-count (keeps the push muscles
  // off back-to-back days; see FOCUS_LOWER_DEEMPH_SPLITS). Falls through to the
  // slot-swap below only for day-counts without a spaced template.
  const spaced = FOCUS_LOWER_DEEMPH_SPLITS[split.length];
  if (spaced) return [...spaced];
  // Free the FIRST lower slot → a focus-region cluster. Alternate push/pull so
  // both width regions (umeri via push, spate via pull) get the freed work.
  const out = [...split];
  const firstLower = lowerIdxs[0];
  const priorPush = out.slice(0, firstLower).filter((c) => c === 'push').length;
  out[firstLower] = priorPush % 2 === 0 ? 'push' : 'pull';
  return out;
}

/**
 * Ordered cluster template for N training days/week. Pure + unit-testable. N is
 * clamped to [1,7] (0 active days → the 1-day Full template defensively, but the
 * caller gates rest days separately). Returns a fresh array copy.
 *
 * `focusPreset` (optional, default 'balanced') makes the split focus-aware: a
 * preset that de-emphasizes the lower body trades ONE leg day for focus-region
 * work (reshapeSplitForFocus). `balanced`/unknown → the templates UNCHANGED
 * (byte-identical to pre-feature).
 *
 * @param {number} n - active training days that week
 * @param {string} [focusPreset='balanced'] - focus preset id
 * @returns {string[]} ordered Big-6 cluster ids
 */
export function frequencyToSplit(n, focusPreset = 'balanced') {
  const clamped = Math.min(7, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));
  const base = [...(FREQUENCY_SPLITS[clamped] || FREQUENCY_SPLITS[1])];
  return reshapeSplitForFocus(base, resolveFocusPreset(focusPreset));
}

// Cluster id → uppercase session-type title tag (the OUTPUT field consumers
// resolve to a localized title via engineWrappers.resolveSessionTitle). legs and
// lower both surface as a lower-body "Picioare" title; full/upper get their own.
export const CLUSTER_TO_SESSION_TAG = Object.freeze({
  push: 'PUSH',
  pull: 'PULL',
  legs: 'LEGS',
  lower: 'LOWER',
  upper: 'UPPER',
  full: 'FULL',
});

// Engine-side mirror of scheduleStore.defaultWeekForFrequency: derive the 7-day
// active/rest tuple from the onboarding `frequency` ('2'..'5') when no calendar
// override exists. Returns an array of 7 booleans (true = active training day).
// Spacing matches the store exactly so the engine + UI agree on which weekdays
// are training days. Unknown/missing frequency → the store DEFAULT_WEEK pattern.
const FREQUENCY_DEFAULT_WEEK = Object.freeze({
  '2': Object.freeze([true, false, false, true, false, false, false]),       // L, J
  '3': Object.freeze([true, false, true, false, true, false, false]),        // L, Mi, V
  '4': Object.freeze([true, true, false, true, true, false, false]),         // L, Ma, J, V
  '5': Object.freeze([true, true, true, false, true, true, false]),          // L, Ma, Mi, V, S
});
// Store DEFAULT_WEEK fallback: L, Mi, V, S active (4 days).
const DEFAULT_ACTIVE_WEEK = Object.freeze([true, false, true, false, true, true, false]);

/**
 * Active-day boolean tuple (length 7, Monday=0) for a frequency string.
 * @param {string|null|undefined} frequency - onboarding frequency ('2'..'5')
 * @returns {ReadonlyArray<boolean>}
 */
export function activeWeekForFrequency(frequency) {
  return FREQUENCY_DEFAULT_WEEK[String(frequency)] || DEFAULT_ACTIVE_WEEK;
}

/**
 * Active-day boolean tuple from a calendar override's selectedDays (active flag),
 * or null when the override is absent/malformed (caller then falls back to
 * frequency). Length-7 padded (missing/short → inactive tail).
 * @param {{selectedDays?: Array<{active?: boolean}>}|null|undefined} override
 * @returns {boolean[]|null}
 */
export function activeWeekFromOverride(override) {
  if (!override || !Array.isArray(override.selectedDays)) return null;
  const out = [];
  for (let i = 0; i < 7; i++) {
    const cfg = override.selectedDays[i];
    out.push(!!(cfg && cfg.active !== false && cfg.active !== undefined ? cfg.active : false));
  }
  return out;
}

/**
 * Active-day boolean tuple (length 7, Monday=0) from the persisted React
 * scheduleStore (`wv2-schedule-store` → state.days: ('training'|'rest')[7]).
 * This is the schedule the Calendar UI DISPLAYS, so honoring it keeps the engine
 * in agreement with what the user sees even when no explicit calendar edit was
 * committed (no override). Returns null when the store is absent/malformed so the
 * caller falls back to the frequency default.
 *
 * @returns {boolean[]|null}
 */
export function activeWeekFromScheduleStore() {
  let raw = null;
  try { raw = localStorage.getItem(SCHEDULE_STORE_KEY); } catch { return null; }
  if (!raw) return null;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return null; }
  const days = parsed && parsed.state && parsed.state.days;
  if (!Array.isArray(days) || days.length !== 7) return null;
  return days.map((d) => d === 'training');
}

/**
 * Resolve the cluster for a given weekday index from an active-day week +
 * frequency split. The cluster is template[ position-of-dayIdx-among-active ].
 * When dayIdx is not itself active (no override gating it), position = the count
 * of active days strictly before it (where it would slot) — keeps a deterministic
 * cluster for any queried day without returning null (rest-day null is gated
 * separately by the override only, per unchanged behavior).
 *
 * The focus-aware split (focusPreset) reshapes which cluster fills each slot, so
 * the scheduled cluster matches the reshaped week. Default 'balanced' → unchanged.
 *
 * @param {ReadonlyArray<boolean>} activeWeek - length-7 active flags (Monday=0)
 * @param {number} dayIdx - 0..6
 * @param {string} [focusPreset='balanced'] - focus preset id
 * @returns {string} cluster id
 */
export function clusterForDay(activeWeek, dayIdx, focusPreset = 'balanced') {
  const activeIdxs = [];
  for (let i = 0; i < 7; i++) if (activeWeek[i]) activeIdxs.push(i);
  const n = activeIdxs.length;
  const split = frequencyToSplit(n > 0 ? n : 1, focusPreset);
  const pos = activeIdxs.indexOf(dayIdx);
  // dayIdx active → its ordinal position; otherwise slot by active-days-before-it.
  const position = pos >= 0
    ? pos
    : activeIdxs.filter((i) => i < dayIdx).length;
  return split[Math.min(position, split.length - 1)];
}
