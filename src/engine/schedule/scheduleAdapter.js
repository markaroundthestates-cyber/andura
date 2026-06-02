// ══ SCHEDULE ADAPTER — Calendar V1 S2 production wiring ════════════════════
// UI-side adapter per ADR 030 D2 thin scope. Engines remain pure-function per
// ADR 026 §9 — this module mutates UI state + localStorage edges only;
// downstream engines absorb naturally via existing evaluate(ctx) consuming
// ctx.meta.calendarOverride + ctx.equipment.available.
//
// Two concerns bundled per Calendar S1.0→S1.7 spec end-state:
//   1. Calendar week override: mid-week edit detection + recompute future days
//      while keeping past days invariant per Daniel verbatim 2026-05-12
//      "zilele trecute raman bifate si se recalibreaza restul".
//   2. Missing equipment list (Tier 0 active rolling per ADR 020): permanent
//      user-driven state, read/write/toggle parity mockup S1.7 demo JS
//      toggleEquipmentMissing() + hydrateAparateLipsa().
//
// ZERO mutation of engine modules. ZERO new engine methods. Engines unchanged.

import { buildEngineContext } from '../../coach/orchestrator/contextBuilder.js';
import { runPipeline } from '../../coach/orchestrator/index.js';
import {
  periodizationAdapter,
  goalAdaptationAdapter,
  energyAdjustmentAdapter,
  bayesianNutritionAdapter,
  tempoAdapter,
  specializationAdapter,
  warmupAdapter,
  deloadAdapter,
} from '../../coach/orchestrator/adapters/index.js';
import { buildSession } from '../sessionBuilder.js';
import { availableCoarseTypes } from '../equipmentMap.js';
import {
  CLUSTER_BIG6_TO_BIG11_WEIGHT,
  BIG11_RO_TO_EN_MAP,
  BIG11_EN_TO_RO_MAP,
  ISRAETEL_BASELINES,
  PHASE_CLUSTERS_BIG6,
} from '../periodization/constants.js';
import {
  getLaggingMuscles,
  getRecoveryByGroup,
  mergeAerobicRecovery,
} from '../muscleRecovery.js';
import { detectImbalances, applyImbalanceCorrection } from '../imbalanceDetector.js';
import {
  toCanonicalRO,
  applyRecoveryStateRedistribution,
} from '../periodization/volumeLandmarks.js';

export const CALENDAR_OVERRIDE_KEY = 'wv2-calendar-override';
export const MISSING_EQUIPMENT_KEY = 'wv2-missing-equipment';

// Day labels — local naming Calendar V1 spec verbatim:
//   L=Monday, M=Tuesday, M2=Wednesday (Miercuri), J=Thursday, V=Friday, S=Saturday, D=Sunday
export const DAY_INDICES = Object.freeze({ L: 0, M: 1, M2: 2, J: 3, V: 4, S: 5, D: 6 });
export const DAY_LABELS = Object.freeze(['L', 'M', 'M2', 'J', 'V', 'S', 'D']);

// User-facing equipment IDs surfaced in screen-aparate-lipsa picker — parity
// mockup S1.7 demo JS APARATE_LIPSA_VALID_IDS constant. 10 entries:
export const VALID_EQUIPMENT_IDS = Object.freeze([
  'banca-inclinata', 'banca-plana', 'bara-halterelor', 'gantere', 'aparat-cablu',
  'power-rack', 'leg-press', 'aparat-extensii', 'aparat-tractiuni', 'banda-elastica'
]);

// ── Date helpers (pure) ──────────────────────────────────────────────────

/**
 * Map a JavaScript Date object to day-of-week index where Monday=0 ... Sunday=6.
 * Engine-internal convention matches Calendar V1 spec week starts Monday.
 *
 * @param {Date} date
 * @returns {number} integer 0..6 (Monday=0)
 */
export function mapDateToIndex(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
  const jsDow = date.getDay(); // Sunday=0 ... Saturday=6
  return jsDow === 0 ? 6 : jsDow - 1;
}

/**
 * Get ISO week-start (Monday) for a given date, in YYYY-MM-DD format. Used to
 * tag calendar override storage with a week-key so Reset Luni naturally
 * invalidates override when crossing week boundary.
 *
 * @param {Date} date
 * @returns {string} YYYY-MM-DD of Monday in this date's week
 */
export function getWeekStartIso(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const todayIdx = mapDateToIndex(date);
  const monday = new Date(date);
  monday.setDate(monday.getDate() - todayIdx);
  return monday.toLocaleDateString('sv'); // YYYY-MM-DD local timezone
}

// ── Mid-week edit detection (pure) ────────────────────────────────────────

/**
 * Split selected days into past (invariant) + future (recomputable) per
 * Daniel verbatim 2026-05-12 LOCK clarification:
 *   "zilele trecute raman bifate si se recalibreaza restul"
 *
 * Edge cases:
 *   - Edit on Monday (todayIdx=0): all 7 days recomputable (week fresh start).
 *   - Edit on Sunday (todayIdx=6): days 0..5 invariant, only Sunday recomputable.
 *
 * @param {Array<{day: string, active: boolean}>} selectedDays array length 7
 * @param {number} todayIdx integer 0..6 (Monday=0 ... Sunday=6)
 * @returns {{past: Array, future: Array, todayIdx: number}}
 */
export function detectMidWeekEdit(selectedDays, todayIdx) {
  const safe = Array.isArray(selectedDays) ? selectedDays.slice(0, 7) : [];
  while (safe.length < 7) safe.push({ day: DAY_LABELS[safe.length], active: false });
  const idx = Number.isInteger(todayIdx) && todayIdx >= 0 && todayIdx <= 6 ? todayIdx : 0;
  return {
    past:     safe.slice(0, idx),
    future:   safe.slice(idx),
    todayIdx: idx,
  };
}

// ── Calendar override storage (edges) ─────────────────────────────────────

/**
 * Read the current calendar override from localStorage. Returns null when
 * absent OR when the stored override is from a prior ISO week (Reset Luni
 * naturally invalidates — no manual reset required, no Date.now timing race).
 *
 * @param {Date} [now=new Date()] injected for deterministic testing
 * @returns {{selectedDays: Array, weekStartIso: string, committedAt: string}|null}
 */
export function getCalendarOverride(now = new Date()) {
  let raw = null;
  try {
    raw = localStorage.getItem(CALENDAR_OVERRIDE_KEY);
  } catch { return null; }
  if (!raw) return null;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!parsed || typeof parsed !== 'object') return null;
  const currentWeekIso = getWeekStartIso(now);
  if (parsed.weekStartIso !== currentWeekIso) return null;
  if (!Array.isArray(parsed.selectedDays)) return null;
  return parsed;
}

/**
 * Commit a calendar edit — persists selectedDays with current ISO week tag.
 * Past-week mid-week clarification: days 0..todayIdx-1 caller-side passed
 * invariant (UI should preserve trecut bifate); this function does NOT
 * enforce that constraint — it stores whatever caller passes. Detect
 * mid-week via detectMidWeekEdit() helper before calling commit.
 *
 * Returns the persisted override object for caller convenience.
 *
 * @param {Array<{day: string, active: boolean}>} selectedDays
 * @param {Date} [now=new Date()] injected for deterministic testing
 * @returns {{selectedDays: Array, weekStartIso: string, committedAt: string}}
 */
export function commitCalendarEdit(selectedDays, now = new Date()) {
  const safe = Array.isArray(selectedDays) ? selectedDays.slice(0, 7) : [];
  const override = {
    selectedDays:  safe,
    weekStartIso:  getWeekStartIso(now),
    committedAt:   now.toISOString(),
  };
  try {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, JSON.stringify(override));
  } catch { /* storage quota / disabled — accept silent loss, engines fallback to preset */ }
  return override;
}

/**
 * Clear the calendar override unconditionally. Caller responsibility (e.g.,
 * settings reset button OR explicit "Reset saptamana" UI). Reset Luni
 * natural via week-key tag in getCalendarOverride() — this is for explicit
 * resets, not automatic.
 */
export function resetWeekOverride() {
  try { localStorage.removeItem(CALENDAR_OVERRIDE_KEY); } catch { /* noop */ }
}

// ── Missing equipment list storage (edges) ────────────────────────────────

/**
 * Read missing-equipment list from localStorage, filter to known valid IDs.
 * Strips legacy single-string format from S1.5 era (exercise names pushed
 * before list-based normalization 2026-05-12) — parity mockup S1.7 demo JS
 * hydrateAparateLipsa() filter validIds.
 *
 * @returns {string[]} list of valid equipment IDs (subset of VALID_EQUIPMENT_IDS)
 */
export function getMissingEquipment() {
  let raw = null;
  try { raw = localStorage.getItem(MISSING_EQUIPMENT_KEY); } catch { return []; }
  if (!raw) return [];
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(e => typeof e === 'string' && VALID_EQUIPMENT_IDS.includes(e));
}

/**
 * Persist missing-equipment list. Filters to valid IDs before write so storage
 * never contains junk — defense-in-depth against caller bugs.
 *
 * @param {string[]} list
 */
export function setMissingEquipment(list) {
  const safe = Array.isArray(list)
    ? list.filter(e => typeof e === 'string' && VALID_EQUIPMENT_IDS.includes(e))
    : [];
  try {
    localStorage.setItem(MISSING_EQUIPMENT_KEY, JSON.stringify(safe));
  } catch { /* noop */ }
}

/**
 * Toggle a single equipment ID in the missing list. Returns the new list.
 * Unknown IDs (not in VALID_EQUIPMENT_IDS) are silently rejected — return
 * unchanged list.
 *
 * @param {string} equipmentId
 * @returns {string[]} new list post-toggle
 */
export function toggleMissingEquipment(equipmentId) {
  if (typeof equipmentId !== 'string' || !VALID_EQUIPMENT_IDS.includes(equipmentId)) {
    return getMissingEquipment();
  }
  const current = getMissingEquipment();
  const next = current.includes(equipmentId)
    ? current.filter(e => e !== equipmentId)
    : [...current, equipmentId];
  setMissingEquipment(next);
  return next;
}

// ── Refusal flow storage (Bundle 4 — Tier 0 active rolling per ADR 020 §1.4) ──
// Per Daniel verbatim chat-current 2026-05-13 "Daca refuza azi un exercitiu poate
// il face alta data. Daca nu are echipament sigur nu il face" — distinct semantic:
//   - SKIPPED_EXERCISES_KEY  → permanent exercise refusals (cross-session, reversibile Cont)
//   - REFUSAL_COUNTER_KEY    → ephemeral counter cross-session per-exercise (threshold-triggered "permanent?" modal)
// Co-CTO bias REFUSAL_COUNTER_THRESHOLD = 3 (Gigel sweet spot anti-paternalism).

export const SKIPPED_EXERCISES_KEY = 'wv2-skipped-exercises';
export const REFUSAL_COUNTER_KEY   = 'wv2-refusal-counter';
export const REFUSAL_COUNTER_THRESHOLD = 3;

/**
 * Read permanently-skipped exercises list from localStorage. Dedupes + filters
 * to non-empty strings. Safe against malformed JSON / non-array / disabled storage.
 *
 * @returns {string[]} exercise names marked permanent skip
 */
export function getSkippedExercises() {
  let raw = null;
  try { raw = localStorage.getItem(SKIPPED_EXERCISES_KEY); } catch { return []; }
  if (!raw) return [];
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed.filter(e => typeof e === 'string' && e.length > 0))];
}

/**
 * Persist skipped-exercises list. Dedupes + filters to non-empty strings before write.
 *
 * @param {string[]} list
 */
export function setSkippedExercises(list) {
  const safe = Array.isArray(list)
    ? [...new Set(list.filter(e => typeof e === 'string' && e.length > 0))]
    : [];
  try { localStorage.setItem(SKIPPED_EXERCISES_KEY, JSON.stringify(safe)); } catch { /* noop */ }
}

/**
 * Toggle a single exercise name in skipped list. Returns the new list.
 * Empty / non-string exerciseName silently rejected — returns current.
 *
 * @param {string} exerciseName
 * @returns {string[]} new list post-toggle
 */
export function toggleSkippedExercise(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return getSkippedExercises();
  const current = getSkippedExercises();
  const next = current.includes(exerciseName)
    ? current.filter(e => e !== exerciseName)
    : [...current, exerciseName];
  setSkippedExercises(next);
  return next;
}

/**
 * Read refusal counter Map<exerciseName, count>. Safe against malformed JSON.
 *
 * @returns {Record<string, number>} {[exerciseName]: count}
 */
export function getRefusalCounter() {
  let raw = null;
  try { raw = localStorage.getItem(REFUSAL_COUNTER_KEY); } catch { return {}; }
  if (!raw) return {};
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const out = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof k === 'string' && k.length > 0 && typeof v === 'number' && v >= 0 && Number.isFinite(v)) {
      out[k] = Math.floor(v);
    }
  }
  return out;
}

/**
 * Increment counter for one exercise. Returns the new count for that exercise.
 * Empty / non-string exerciseName silently rejected — returns 0.
 *
 * @param {string} exerciseName
 * @returns {number} new count for exerciseName (or 0 on rejection)
 */
export function incrementRefusal(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return 0;
  const current = getRefusalCounter();
  const next = { ...current, [exerciseName]: (current[exerciseName] || 0) + 1 };
  try { localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify(next)); } catch { /* noop */ }
  return next[exerciseName];
}

/**
 * Clear counter entry for one exercise. Preserves other entries.
 * No-op when entry absent or invalid input.
 *
 * @param {string} exerciseName
 */
export function resetRefusalCounter(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return;
  const current = getRefusalCounter();
  if (!(exerciseName in current)) return;
  const { [exerciseName]: _drop, ...rest } = current;
  try { localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify(rest)); } catch { /* noop */ }
}

// ── Translation table USER-FACING → ENGINE EQUIPMENT IDS ─────────────────
// Engine equipment domain (sessionBuilder.js EQUIP_MAP + coachContext.js):
//   ['matrix_cable', 'bailib_stack', 'pec_deck', 'leg_machine',
//    'leg_press_plates', 'dumbbell']
// User-facing IDs (10 picker entries) → 0..many engine IDs:

const USER_TO_ENGINE_EQUIPMENT = Object.freeze({
  'gantere':           ['dumbbell'],
  'aparat-cablu':      ['matrix_cable', 'bailib_stack'],
  'leg-press':         ['leg_press_plates'],
  'aparat-extensii':   ['leg_machine'],
  'aparat-tractiuni':  ['bailib_stack'],
  // 5 user IDs without current engine equipment mapping (recorded for future
  // engine domain expansion — bench/barbell/power-rack/banda capabilities
  // not modelled in V1 engine equipment domain):
  'banca-inclinata':   [],
  'banca-plana':       [],
  'bara-halterelor':   [],
  'power-rack':        [],
  'banda-elastica':    [],
});

// ── WP-4 selection seam: coarse equipment vocabulary ─────────────────────
// sessionBuilder selects from the 657 library and filters on the library's
// COARSE equipment_type (barbell|dumbbell|machine|cable|bodyweight|band). The
// canonical user-ID → coarse mapping + availableCoarseTypes() now live in the
// shared WP-3 module ../equipmentMap.js (imported above) — D081 SoT. The local
// bridge that previously lived here was superseded at the WP-3↔WP-4 merge.

/**
 * Translate user-facing missing equipment IDs to engine equipment domain IDs.
 * Multi-mapping: one user ID may block multiple engine IDs (e.g. 'aparat-cablu'
 * blocks both 'matrix_cable' and 'bailib_stack').
 *
 * Returns deduplicated array.
 *
 * @param {string[]} userIds
 * @returns {string[]} engine equipment IDs to mark unavailable
 */
export function translateToEngineEquipment(userIds) {
  if (!Array.isArray(userIds)) return [];
  const out = new Set();
  for (const id of userIds) {
    const mapped = USER_TO_ENGINE_EQUIPMENT[id] || [];
    for (const eng of mapped) out.add(eng);
  }
  return [...out];
}

// ── Frequency-based split (D-volume-driven program 2026-06-02) ───────────
// The program is VOLUME-DRIVEN: the user's Nth active training day maps to the
// Nth cluster of a frequency-appropriate template — NOT to the absolute weekday.
// The old DAY_TO_SESSION_TYPE absolute-weekday map surfaced legs only on
// Wednesday and never reached glutes/calves; this maps active-day position →
// cluster so a Lower/Legs/Full day exists at every frequency and every Big-11
// group (incl. fese/gambe) is reachable.
//
// Templates (ordered clusters, lowercase = CLUSTER_BIG6_TO_BIG11_WEIGHT keys).
// 3 → Full×3 (Daniel choice: better frequency, legs every session). Indexed 1..7.
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
const CLUSTER_TO_SESSION_TAG = Object.freeze({
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
function activeWeekForFrequency(frequency) {
  return FREQUENCY_DEFAULT_WEEK[String(frequency)] || DEFAULT_ACTIVE_WEEK;
}

/**
 * Active-day boolean tuple from a calendar override's selectedDays (active flag),
 * or null when the override is absent/malformed (caller then falls back to
 * frequency). Length-7 padded (missing/short → inactive tail).
 * @param {{selectedDays?: Array<{active?: boolean}>}|null|undefined} override
 * @returns {boolean[]|null}
 */
function activeWeekFromOverride(override) {
  if (!override || !Array.isArray(override.selectedDays)) return null;
  const out = [];
  for (let i = 0; i < 7; i++) {
    const cfg = override.selectedDays[i];
    out.push(!!(cfg && cfg.active !== false && cfg.active !== undefined ? cfg.active : false));
  }
  return out;
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
function clusterForDay(activeWeek, dayIdx, focusPreset = 'balanced') {
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

// ── "Different group" ephemeral override (D-override-different-muscle 2026-06-02) ──
// The ScheduleOverride "Alta grupa" option must produce a REAL alternative
// session — NOT a relabel. Andura PICKS the alternative (ADR 025 "user doesn't
// think"): of all Big-6 clusters EXCEPT today's scheduled one, choose the cluster
// whose constituent muscle groups are the most RECOVERED/fresh today (reuse the
// recovery state already computed from the user's logged sessions). This is
// EPHEMERAL — today only, in-memory; it never writes the calendar override (the
// persisted weekly schedule is untouched, resets next session naturally).
//
// Freshness score per recovery state: recovered=2, partial=1, fatigued=0. A
// cluster's score = sum over its Big-11 groups of state-score × cluster weight
// (CLUSTER_BIG6_TO_BIG11_WEIGHT), so a cluster built mostly on fresh groups wins.
// Deterministic tie-break: PHASE_CLUSTERS_BIG6 declaration order (stable, no RNG).
const RECOVERY_FRESHNESS_SCORE = Object.freeze({ recovered: 2, partial: 1, fatigued: 0 });

/**
 * Freshness score for one cluster from the RO-keyed recovery state map. Sums each
 * constituent Big-11 group's freshness (recovered/partial/fatigued) weighted by
 * the cluster's allocation. A group missing from the recovery state is treated as
 * 'recovered' (no logged stress → fresh). Higher = fresher overall. Pure.
 *
 * @param {string} cluster - Big-6 cluster id
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryState - RO-keyed
 * @returns {number}
 */
function clusterFreshnessScore(cluster, recoveryState) {
  const weights = CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster];
  if (!weights) return 0;
  let score = 0;
  for (const [group, weight] of Object.entries(weights)) {
    const state = recoveryState?.[group] ?? 'recovered';
    score += (RECOVERY_FRESHNESS_SCORE[state] ?? 2) * weight;
  }
  return score;
}

/**
 * Pick a sensible ALTERNATIVE cluster for the "Different group" override — the
 * Big-6 cluster (≠ the day's scheduled one) whose muscle groups are the MOST
 * RECOVERED/fresh today. Andura decides (ADR 025). Deterministic: ties break by
 * PHASE_CLUSTERS_BIG6 declaration order. With no recovery signal (cold start /
 * empty state) every candidate scores equal → the first non-scheduled cluster in
 * declaration order is returned (a stable, complementary default). Pure.
 *
 * @param {string} scheduledCluster - the cluster the day would normally train
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryState - RO-keyed
 * @returns {string} an alternative cluster id (always ≠ scheduledCluster when one exists)
 */
export function pickAlternativeCluster(scheduledCluster, recoveryState) {
  const candidates = PHASE_CLUSTERS_BIG6.filter((c) => c !== scheduledCluster);
  if (candidates.length === 0) return scheduledCluster; // degenerate (single cluster) — no-op
  let best = candidates[0];
  let bestScore = clusterFreshnessScore(best, recoveryState);
  for (let i = 1; i < candidates.length; i++) {
    const score = clusterFreshnessScore(candidates[i], recoveryState);
    if (score > bestScore) {
      best = candidates[i];
      bestScore = score;
    }
  }
  return best;
}

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
 * Flatten engine recentSessions[*] → muscleRecovery LogEntry[] rows. Mirrors the
 * Progress-tab manikin flattener (MuscleRecoveryGrid.flattenSessionsToLogs): the
 * recovery engine's getMuscleState filters out rows without a weight (`l.w`), so
 * each set must emit { ex, ts, w } — emitting only ex+ts would make every group
 * read 'recovered' (silent no-op). recentSessions carries the persisted
 * SessionExerciseBreakdown shape (exercises[*].exerciseName + sets[*].kg/timestamp).
 * Pure read — no mutation of the input sessions.
 *
 * @param {Array<{exercises?: Array<{exerciseName?: string, sets?: Array<{kg?: number, reps?: number, timestamp?: number}>}>}>} sessions
 * @returns {Array<{ex: string, ts: number, w: number, reps: number}>}
 */
function flattenSessionsToRecoveryLogs(sessions) {
  const logs = [];
  if (!Array.isArray(sessions)) return logs;
  for (const session of sessions) {
    const exercises = session && Array.isArray(session.exercises) ? session.exercises : [];
    for (const ex of exercises) {
      const name = ex && typeof ex.exerciseName === 'string' ? ex.exerciseName : '';
      const sets = ex && Array.isArray(ex.sets) ? ex.sets : [];
      for (const set of sets) {
        if (!set) continue;
        logs.push({
          ex: name,
          ts: typeof set.timestamp === 'number' ? set.timestamp : 0,
          w: typeof set.kg === 'number' ? set.kg : 0,
          reps: typeof set.reps === 'number' ? set.reps : 0,
        });
      }
    }
  }
  return logs;
}

/**
 * Translate a Big-11 RO-keyed volume map back to Big-11 EN keys (inverse of
 * toCanonicalRO) so the recovery-adjusted budget still resolves through
 * setsForGroup, which reads volumeTargets[BIG11_RO_TO_EN_MAP[group]]. Keys absent
 * from the map pass through unchanged (defensive). Pure.
 *
 * @param {Object<string, number>} roMap - Big-11 RO keyed → sets/week
 * @returns {Object<string, number>} - Big-11 EN keyed → sets/week
 */
function toCanonicalEN(roMap) {
  if (!roMap || typeof roMap !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(roMap)) {
    const enKey = BIG11_RO_TO_EN_MAP[key] ?? key;
    out[enKey] = value;
  }
  return out;
}

// ══ FOCUS SELECTOR — goal/look presets shape volume + split (D-focus 2026-06-02) ══
// ADR 025 "override optional": Andura decides by default (focusPreset='balanced'
// → ZERO change, byte-identical to pre-feature). A user CAN pick a high-level
// LOOK (not muscles — Gigel thinks "wider shoulders", not "lateral delt"). The
// preset maps the look → a per-Big-11-group emphasis: EMPHASIZED groups bias
// toward their Israetel MRV (more width/size), DE-EMPHASIZED groups relax toward
// their MEV (MAINTAINED with less work — NEVER below MEV, never abandoned), the
// rest neutral. Two layers act: (1) the focus volume stage below biases the
// weekly budget; (2) frequencyToSplit reshapes the week (a de-emphasized lower
// body frees a leg day → the focus region gets it). Groups are Big-11 RO keys —
// the SAME vocabulary weakGroups / the recovery engine use.
//
// FOCUS_LERP = the fraction of the gap (current → target landmark) the focus
// stage closes. 0.50 rationale: half-way to MRV (emphasize) / half-way to MEV
// (de-emphasize) is a decisive, FELT shift without pinning a group at an extreme
// (MRV is a short overreach ceiling; MEV is the maintenance floor). ONE documented
// constant for both directions — not a per-preset multiplier zoo. Every group is
// clamped to [MEV, MRV] always.
const FOCUS_LERP = 0.50;

/**
 * Goal/look presets → per-Big-11-RO-group emphasis. `balanced` (default) is the
 * empty no-op. `emphasize` raises toward MRV; `deEmphasize` relaxes toward MEV.
 * Groups not listed are neutral (unchanged). RO Big-11 keys (weakGroups vocab).
 *
 * @type {Readonly<Object<string, {emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}>>}
 */
export const FOCUS_PRESETS = Object.freeze({
  // DEFAULT — no change, current behavior exactly.
  balanced: Object.freeze({ emphasize: Object.freeze([]), deEmphasize: Object.freeze([]) }),
  // Width: shoulders + back UP; lower body relaxed to maintenance (Daniel's case:
  // big legs already, wants the V). piept/core/biceps/triceps neutral.
  'v-taper': Object.freeze({
    emphasize: Object.freeze(['umeri', 'spate']),
    deEmphasize: Object.freeze(['picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']),
  }),
  // Arms: biceps + triceps UP (umeri secondary); rest neutral.
  arms: Object.freeze({
    emphasize: Object.freeze(['biceps', 'triceps', 'umeri']),
    deEmphasize: Object.freeze([]),
  }),
  // Chest: piept UP (triceps secondary); rest neutral.
  chest: Object.freeze({
    emphasize: Object.freeze(['piept', 'triceps']),
    deEmphasize: Object.freeze([]),
  }),
  // Lower: fese + quads/hams UP (gambe secondary); upper neutral.
  lower: Object.freeze({
    emphasize: Object.freeze(['fese', 'picioare-quads', 'picioare-hamstrings', 'gambe']),
    deEmphasize: Object.freeze([]),
  }),
});

/** Valid focusPreset ids (the keys of FOCUS_PRESETS). */
export const FOCUS_PRESET_IDS = Object.freeze(Object.keys(FOCUS_PRESETS));

/**
 * Resolve a focusPreset id to its emphasis spec. Unknown/missing/`balanced` →
 * the balanced no-op (graceful degradation, ADR 025). Pure.
 *
 * @param {string|null|undefined} focusPreset
 * @returns {{emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}}
 */
function resolveFocusPreset(focusPreset) {
  return FOCUS_PRESETS[focusPreset] ?? FOCUS_PRESETS.balanced;
}

/**
 * The Big-11 RO groups a preset DE-EMPHASIZES — the set whose auto-signals (M2
 * weakness amp + M3 imbalance correction) must be SUPPRESSED so Andura doesn't
 * re-inflate the region the user intentionally minimized (Daniel: focus BEATS
 * auto-balance). `balanced`/unknown → empty (no suppression). Pure.
 *
 * @param {string|null|undefined} focusPreset
 * @returns {Set<string>} Big-11 RO de-emphasized group ids
 */
function deEmphasizedGroups(focusPreset) {
  return new Set(resolveFocusPreset(focusPreset).deEmphasize);
}

/**
 * Focus volume stage — bias each group's weekly budget by the preset. EMPHASIZED
 * groups lerp toward MRV; DE-EMPHASIZED groups lerp toward MEV (maintenance floor
 * — clamped so they NEVER drop below MEV, never to zero); neutral groups
 * unchanged. Every touched group is clamped to [MEV, MRV]. The budget is EN-keyed
 * (chest/back/...) but presets are Big-11 RO — each is bridged to EN
 * (BIG11_RO_TO_EN_MAP) for its budget entry + landmarks (ISRAETEL_BASELINES).
 * Returns a NEW map. `balanced` (empty preset) → the map returned unchanged
 * (byte-identical, graceful degradation, ADR 025). Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {string|null|undefined} focusPreset
 * @returns {Object<string, number>|null} biased EN-keyed budget (null passes through)
 */
function applyFocusBias(volumeMapEN, focusPreset) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const preset = resolveFocusPreset(focusPreset);
  if (preset.emphasize.length === 0 && preset.deEmphasize.length === 0) {
    return { ...volumeMapEN };
  }
  const out = { ...volumeMapEN };
  const biasGroup = (roGroup, towardKey) => {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    const lm = ISRAETEL_BASELINES[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) return;
    if (!lm) return;
    const target = lm[towardKey];
    if (typeof target !== 'number' || !Number.isFinite(target)) return;
    const biased = current + (target - current) * FOCUS_LERP;
    // Clamp to [MEV, MRV] always — a de-emphasized group is MAINTAINED at MEV,
    // never below; an emphasized group never exceeds MRV.
    out[enKey] = Math.min(lm.MRV, Math.max(lm.MEV, biased));
  };
  for (const roGroup of preset.emphasize) biasGroup(roGroup, 'MRV');
  for (const roGroup of preset.deEmphasize) biasGroup(roGroup, 'MEV');
  return out;
}

// ── M2: weakness AMPLIFIES real volume toward MRV (D-weakness-amplify 2026-06-02) ──
// A lagging/weak group should get genuinely MORE volume (extra sets + likely an
// extra exercise) on its FRESH training days — not just front-of-session
// reordering (M0 positioning) — pushed UP toward its Israetel MRV ceiling.
//
// AMPLIFY_TOWARD_MRV = the fraction of the gap (current → MRV) we close. 0.50
// rationale: half-way to the absolute recoverable max is a decisive, felt bump
// (e.g. chest 14→18/wk under marius/hipertrofie) WITHOUT pinning the group at
// MRV (which Israetel reserves as a short overreach ceiling, not a steady-state
// target). It is a single tunable constant, NOT a per-group multiplier zoo.
// MRV is the HARD cap — the amplified value is clamped to it and NEVER exceeds.
const AMPLIFY_TOWARD_MRV = 0.50;

/**
 * Resolve the lagging Big-11 RO groups for the plan from the SAME persisted
 * sessions M1 flattens (userState.recentSessions → recovery LogEntry rows). The
 * recovery engine's getLaggingMuscles is pure: the adapter builds the { logs,
 * now } profile (reusing flattenSessionsToRecoveryLogs) and reads the result.
 * Returns most-lagging-first RO group ids (matching the weakGroups vocabulary).
 * Empty when there is no lagging signal (graceful degradation, ADR 025). Pure.
 *
 * @param {Array} recoveryLogs - flattened recovery LogEntry rows ({ex, ts, w})
 * @param {number} now - reference timestamp threaded for determinism
 * @returns {string[]} Big-11 RO group ids, most-lagging first
 */
function laggingGroupsFromLogs(recoveryLogs, now) {
  const lagging = getLaggingMuscles({ logs: recoveryLogs, now });
  return lagging.map((l) => l.group);
}

/**
 * Amplify a weak group's weekly volume toward its Israetel MRV ceiling. The
 * budget is EN-keyed (chest/back/...) but weak groups arrive Big-11 RO
 * (specialization target / lagging) — the same vocabulary buildSession's
 * weakGroups uses — so each RO group is bridged to EN (BIG11_RO_TO_EN_MAP) to
 * look up its budget entry + MRV (ISRAETEL_BASELINES, EN-keyed).
 *
 * For each weak group: target = current + (MRV - current) × AMPLIFY_TOWARD_MRV,
 * clamped to MRV (HARD cap — never exceeds, never lowers a group already above
 * MRV). The larger entry flows through buildSession (which exempts weak groups
 * from the per-group slot cap) → more sets + possibly an extra exercise on the
 * weak group. Returns a NEW map. No weak groups → the map is returned unchanged
 * (graceful degradation, ADR 025). Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {string[]} weakGroupsRO - Big-11 RO weak/lagging group ids
 * @returns {Object<string, number>|null} amplified EN-keyed budget (null passes through)
 */
function applyWeaknessAmplification(volumeMapEN, weakGroupsRO) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  if (!Array.isArray(weakGroupsRO) || weakGroupsRO.length === 0) return { ...volumeMapEN };
  const out = { ...volumeMapEN };
  for (const roGroup of weakGroupsRO) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
    if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) continue;
    if (typeof mrv !== 'number' || !Number.isFinite(mrv)) continue;
    if (current >= mrv) continue; // already at/above ceiling — never lower it
    const amplified = current + (mrv - current) * AMPLIFY_TOWARD_MRV;
    out[enKey] = Math.min(mrv, amplified); // HARD MRV cap — never exceed
  }
  return out;
}

/**
 * Apply muscle-recovery redistribution to the EN-keyed periodization volume
 * budget. The budget is EN-keyed (chest/back/...) but the recovery math is
 * RO-keyed (getRecoveryByGroup returns RO), so: EN→RO (toCanonicalRO) → cut tired
 * groups (applyRecoveryStateRedistribution: partial ×0.80, fatigued ×0.60) → RO→EN
 * (toCanonicalEN) so setsForGroup still resolves the budget. No logs / empty
 * recovery → applyRecoveryStateRedistribution returns the map unchanged → identical
 * to the pre-M1 chassis budget (graceful degradation, ADR 025). Pure.
 *
 * aerobicSessions (optional) are threaded into the RO stage so recent aerobic
 * CLASSES fold into the recovery state (eases fresh groups recovered→partial,
 * never deepens) — a hard spin class makes tomorrow's leg budget lighter. Absent
 * → byte-identical resistance-only path.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN keyed budget
 * @param {Array<{ex: string, ts: number, w: number}>} logs - recovery LogEntry[]
 * @param {number} now - reference timestamp threaded into recovery (determinism)
 * @param {Array<{type?: string, ts?: number, date?: string}>} [aerobicSessions] - aerobicStore sessions
 * @returns {Object<string, number>|null} adjusted EN-keyed budget (null passes through)
 */
function applyRecoveryToVolumeBudget(volumeMapEN, logs, now, aerobicSessions) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const ro = toCanonicalRO(volumeMapEN);
  const adjustedRo = applyRecoveryStateRedistribution(ro, logs, now, aerobicSessions);
  return toCanonicalEN(adjustedRo);
}

/**
 * Recovery REDISTRIBUTION — the freed volume from a recovery-cut group flows to
 * the FRESH (recovered) groups trained in TODAY's SAME session, so a fatigued
 * chest on a push day becomes "lighter chest, HEAVIER shoulders/triceps" instead
 * of a collapsed session whose freed volume simply vanished.
 *
 * The recovery cut (applyRecoveryToVolumeBudget: partial ×0.80, fatigued ×0.60)
 * lowers a group's weekly budget; the difference (`balanced - recovered`) was
 * previously DROPPED — `computeSessionExerciseCount` + `sessionSetBudget` size each
 * group INDEPENDENTLY, so cutting chest never lifted shoulders. This reallocates
 * that freed volume to the cluster's fresh groups, proportional to their cluster
 * weight (CLUSTER_BIG6_TO_BIG11_WEIGHT), each HARD-capped at its own MRV
 * (ISRAETEL_BASELINES) so no fresh group is ever pushed over its recoverable max.
 *
 * SESSION-LOCAL: this returns a NEW budget consumed by buildSession for TODAY only;
 * the persisted weekly budget (`balancedTargets`) is never mutated, so chest is
 * normal again on a fresh day (a per-day emphasis shift, not a weekly reweight).
 *
 * Only groups in TODAY's cluster participate (both the freed-from and the
 * receive-into side) — the transfer is confined to the muscles this session trains.
 * If NO fresh group is in the cluster (everything's fried), there is nothing to
 * redistribute to → the cut budget passes through unchanged and the session
 * legitimately stays lighter. Balanced / all-recovered day → no group is cut →
 * freed total is 0 → the recovered map is returned untouched (byte-identical to
 * pre-feature). Pure + deterministic (state in, no globals).
 *
 * @param {Object<string, number>|null|undefined} balancedTargetsEN - pre-recovery-cut EN budget
 * @param {Object<string, number>|null|undefined} recoveredTargetsEN - post-recovery-cut EN budget
 * @param {string} cluster - today's Big-6 cluster id (push|pull|legs|upper|lower|full)
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} recoveryStateRO - RO recovery state (merged)
 * @returns {Object<string, number>|null} session-local EN budget (null/recovered passes through)
 */
function redistributeRecoveredVolumeToFreshSessionGroups(
  balancedTargetsEN, recoveredTargetsEN, cluster, recoveryStateRO,
) {
  if (!recoveredTargetsEN || typeof recoveredTargetsEN !== 'object') {
    return recoveredTargetsEN ?? null;
  }
  if (!balancedTargetsEN || typeof balancedTargetsEN !== 'object') {
    return { ...recoveredTargetsEN };
  }
  const weights =
    CLUSTER_BIG6_TO_BIG11_WEIGHT[cluster] || CLUSTER_BIG6_TO_BIG11_WEIGHT[FALLBACK_CLUSTER];
  const state = recoveryStateRO && typeof recoveryStateRO === 'object' ? recoveryStateRO : {};

  // Sum the weekly volume the cut groups (in today's cluster) gave up, and tally
  // the FRESH (recovered) cluster groups + their cluster weight so the transfer
  // is proportional. A group is "fresh" when its state is absent or 'recovered'.
  let freed = 0;
  let freshWeightTotal = 0;
  const freshGroupsRO = [];
  for (const roGroup of Object.keys(weights)) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const w = typeof weights[roGroup] === 'number' ? weights[roGroup] : 0;
    const groupState = state[roGroup] ?? 'recovered';
    if (groupState === 'partial' || groupState === 'fatigued') {
      const balanced = balancedTargetsEN[enKey];
      const recovered = recoveredTargetsEN[enKey];
      if (typeof balanced === 'number' && typeof recovered === 'number' && balanced > recovered) {
        freed += balanced - recovered;
      }
    } else if (w > 0) {
      freshGroupsRO.push(roGroup);
      freshWeightTotal += w;
    }
  }

  // Nothing freed (no cut group in the cluster) OR nowhere to send it (all
  // fried) → pass the recovered budget through unchanged (session stays light).
  if (freed <= 0 || freshWeightTotal <= 0 || freshGroupsRO.length === 0) {
    return { ...recoveredTargetsEN };
  }

  const out = { ...recoveredTargetsEN };
  for (const roGroup of freshGroupsRO) {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current)) continue;
    const share = freed * (weights[roGroup] / freshWeightTotal);
    const mrv = ISRAETEL_BASELINES[enKey]?.MRV;
    const bumped = current + share;
    out[enKey] = typeof mrv === 'number' && Number.isFinite(mrv)
      ? Math.min(mrv, bumped) // HARD MRV cap — a fresh group never exceeds its max
      : bumped;
  }
  return out;
}

// ── Coach Voice: structured adaptations log (the moat made felt) ──────────
// The adaptive brain (M1 recovery cut, M2 weakness amp, M3 imbalance fix,
// deload) silently shapes the plan; the user sees only the result. This derives
// a STRUCTURED, machine-readable log of what ACTUALLY changed this session —
// NO copy strings (the React composer turns tokens → a localized sentence;
// engines never emit Romanian copy, i18n leak harness forbids it). Truth-only:
// every entry maps to a real budget delta this run (compare the SAME maps the
// plan was built from), zero fabrication. Empty array when nothing adapted →
// the React side renders no line (graceful).
//
// Each entry: { kind, group?, cause? } where group is a Big-11 RO key (the
// vocabulary getLaggingMuscles / weakGroups use), cause is the recovery-cut
// origin ('aerobic' | 'resistance'). Tolerance guards float noise so a 0.0001
// rounding drift is never reported as a change.
const ADAPT_EPSILON = 0.01;

/**
 * Derive the structured coach-adaptations log from the SAME maps the plan was
 * built from. Pure — no recompute of the math, only a diff of what changed.
 *
 * @param {object} args
 * @param {Object<string, number>|null} args.baseTargets - pre-adaptation EN budget (periodization)
 * @param {Object<string, number>|null} args.amplifiedTargets - post weakness-amp (M2) EN budget
 * @param {Object<string, number>|null} args.balancedTargets - post imbalance-fix (M3) EN budget
 * @param {Object<string, number>|null} args.recoveredTargets - post recovery-cut (M1) EN budget (final)
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} args.resistanceState - RO recovery state (resistance only)
 * @param {{[group:string]: 'recovered'|'partial'|'fatigued'}} args.mergedState - RO recovery state (resistance + aerobic)
 * @param {boolean} args.deloadActive - true when an ACTIVE deload modifier is in play
 * @returns {Array<{kind: 'recovery-cut'|'weakness-amp'|'imbalance-fix'|'deload', group?: string, cause?: 'aerobic'|'resistance'}>}
 */
function deriveCoachAdaptations({
  baseTargets,
  amplifiedTargets,
  balancedTargets,
  recoveredTargets,
  resistanceState,
  mergedState,
  deloadActive,
}) {
  /** @type {Array<{kind: string, group?: string, cause?: string}>} */
  const out = [];

  // Deload — the highest-salience signal (whole-week lighter on purpose).
  if (deloadActive) out.push({ kind: 'deload' });

  // Recovery cut (M1) — groups whose FINAL budget dropped below the balanced
  // budget. Cause = aerobic when the resistance-only state for that group was
  // 'recovered' but the merged state (with recent cardio) raised it (so the cut
  // is owed to a class, e.g. spinning), else resistance.
  if (balancedTargets && recoveredTargets) {
    // recoveredTargets is EN-keyed (toCanonicalEN output) — read by EN key.
    for (const [enKey, balanced] of Object.entries(balancedTargets)) {
      const cut = recoveredTargets[enKey];
      if (typeof balanced !== 'number' || typeof cut !== 'number') continue;
      if (cut < balanced - ADAPT_EPSILON) {
        const roGroup = BIG11_EN_TO_RO_MAP[enKey] ?? enKey;
        const resistance = resistanceState[roGroup] ?? 'recovered';
        const merged = mergedState[roGroup] ?? 'recovered';
        const cause = resistance === 'recovered' && merged !== 'recovered'
          ? 'aerobic'
          : 'resistance';
        out.push({ kind: 'recovery-cut', group: roGroup, cause });
      }
    }
  }

  // Weakness amplification (M2) — groups whose budget was raised above the
  // base periodization budget toward MRV.
  if (baseTargets && amplifiedTargets) {
    for (const [enKey, amp] of Object.entries(amplifiedTargets)) {
      const base = baseTargets[enKey];
      if (typeof base !== 'number' || typeof amp !== 'number') continue;
      if (amp > base + ADAPT_EPSILON) {
        out.push({ kind: 'weakness-amp', group: BIG11_EN_TO_RO_MAP[enKey] ?? enKey });
      }
    }
  }

  // Imbalance correction (M3) — groups raised above the amplified budget to
  // close an antagonist/pattern imbalance.
  if (amplifiedTargets && balancedTargets) {
    for (const [enKey, balanced] of Object.entries(balancedTargets)) {
      const amp = amplifiedTargets[enKey];
      if (typeof amp !== 'number' || typeof balanced !== 'number') continue;
      if (balanced > amp + ADAPT_EPSILON) {
        out.push({ kind: 'imbalance-fix', group: BIG11_EN_TO_RO_MAP[enKey] ?? enKey });
      }
    }
  }

  return out;
}

/**
 * Compose today's workout plan — invoke 8-engine pipeline §42.10 sequential
 * strict + aggregate blueprints by engine id + delegate exercise selection
 * to sessionBuilder.
 *
 * Returns null when:
 *   - Calendar override marks today as a rest day (`selectedDays[dayIdx].active === false`)
 *   - Pipeline emits a hard halt (e.g. Periodization fails — downstream cannot proceed)
 *   - runPipeline throws unexpectedly (D4 contract violation insurance)
 *
 * Returns a unified WorkoutPlan when training day + pipeline complete.
 *
 * @param {object} [userState] - { user, recentSessions, weights, profileTier, flags, meta }
 * @param {Date} [now=new Date()] - injected for deterministic testing
 * @returns {Promise<{
 *   type: 'training',
 *   sessionType: string,
 *   warmup: object|null,
 *   exercises: Array<{name: string, sets: number}>,
 *   intensityModifier: object|null,
 *   volumeTargets: object|null,
 *   restTimeRange: [number, number]|null,
 *   specializationTarget: string|null,
 *   deloadState: string,
 *   estimatedDurationMin: number,
 *   volumeKg: number,
 *   workoutTitle: string,
 * }|null>}
 */
export async function getDailyWorkout(userState, now = new Date(), options = {}) {
  const date = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const dayIdx = mapDateToIndex(date);
  // "Different group" ephemeral override (ScheduleOverride "Alta grupa"). When
  // true, Andura swaps today's scheduled cluster for the most-recovered ALTERNATIVE
  // cluster (pickAlternativeCluster) — a real different session, in-memory only,
  // never persisted to the calendar (the weekly schedule is untouched). Default
  // false → byte-identical to the prior behavior for every other caller.
  const wantDifferentMuscle = options?.differentMuscle === true;

  // Rest day check via calendar override
  const override = getCalendarOverride(date);
  if (override && Array.isArray(override.selectedDays)) {
    const dayConfig = override.selectedDays[dayIdx];
    if (dayConfig && dayConfig.active === false) {
      return null;
    }
  }

  // Compute available equipment — WP-4 selection uses COARSE equipment types
  // (library equipment_type), derived from the user's missing picker IDs.
  const missingUserIds = getMissingEquipment();
  const availableCoarse = availableCoarseTypes(missingUserIds);

  // Build EngineContext + invoke 8-adapter pipeline sequential strict
  const ctx = buildEngineContext(userState);
  const adapters = [
    periodizationAdapter,
    goalAdaptationAdapter,
    energyAdjustmentAdapter,
    bayesianNutritionAdapter,
    tempoAdapter,
    specializationAdapter,
    warmupAdapter,
    deloadAdapter,
  ];

  let results;
  try {
    results = await runPipeline(ctx, adapters);
  } catch {
    return null;
  }

  if (!Array.isArray(results) || results.length === 0) return null;

  // Hard halt detection — first hard error short-circuits pipeline downstream
  const hardError = results.find(r => r && r.ok === false && r.error && r.error.severity === 'hard');
  if (hardError) return null;

  // Aggregate engine blueprints by engine id (output.meta carries blueprint payload)
  const blueprints = {};
  for (const r of results) {
    if (r && r.ok === true && r.output && typeof r.output.id === 'string') {
      blueprints[r.output.id] = r.output.meta || {};
    }
  }

  // Frequency-based split: resolve the active-day week (override edge first, else
  // derive from onboarding frequency threaded via userState.user.frequency) and
  // map the queried day's ordinal-among-active-days → the Nth cluster of the
  // frequency-appropriate template. cluster drives BOTH selection (buildSession)
  // and the per-group weekly frequency the volume budget is divided across.
  // Focus selector (D-focus 2026-06-02) — the user's optional LOOK preset shapes
  // BOTH the split (focus-aware frequencyToSplit reshapes the week) and the
  // volume budget (applyFocusBias below). Default 'balanced' → ZERO change
  // (byte-identical to pre-feature). The de-emphasized RO groups are computed
  // once + reused to SUPPRESS the auto-signals (M2 weakness / M3 imbalance) on
  // the region the user intentionally minimized (focus BEATS auto-balance).
  const focusPreset =
    typeof userState?.user?.focusPreset === 'string' && FOCUS_PRESETS[userState.user.focusPreset]
      ? userState.user.focusPreset
      : 'balanced';
  const deEmphSet = deEmphasizedGroups(focusPreset);
  const activeWeek =
    activeWeekFromOverride(override) ?? activeWeekForFrequency(userState?.user?.frequency);
  const scheduledCluster = clusterForDay(activeWeek, dayIdx, focusPreset);
  // "Different group" override — Andura picks the most-recovered ALTERNATIVE
  // cluster (≠ today's scheduled one) from the recovery state already derivable
  // from the user's logged sessions. Recovery flatten + state are pure + cheap;
  // the later resistanceState (Coach Voice attribution) recomputes them under the
  // SAME clock, so the values agree. No override requested → effectiveCluster IS
  // the scheduledCluster (zero change).
  const overrideRecoveryLogs = wantDifferentMuscle
    ? flattenSessionsToRecoveryLogs(userState?.recentSessions)
    : [];
  const overrideRecoveryState =
    wantDifferentMuscle && overrideRecoveryLogs.length > 0
      ? getRecoveryByGroup(overrideRecoveryLogs, undefined, date.getTime())
      : {};
  const cluster = wantDifferentMuscle
    ? pickAlternativeCluster(scheduledCluster, overrideRecoveryState)
    : scheduledCluster;
  const split = frequencyToSplit(activeWeek.filter(Boolean).length || 1, focusPreset);
  const sessionsPerGroup = weeklySessionsPerGroup(split);
  // OUTPUT session-type tag (uppercase) for the localized title boundary — kept
  // SEPARATE from the cluster id buildSession consumes. Reflects the EFFECTIVE
  // cluster so a "Different group" override surfaces the alternative session type.
  const sessionType = CLUSTER_TO_SESSION_TAG[cluster] || 'FULL';
  const specializationTarget = blueprints.specialization?.target_muscle_group ?? null;
  const userId = userState?.user?.uid ?? userState?.uid ?? '';
  const seed = `${userId}|${getWeekStartIso(date)}|${dayIdx}`;

  // ── M1: muscle-recovery → today's volume budget (the moat seam) ──────────
  // The recovery brain already exists (getRecoveryByGroup) but only DISPLAYED.
  // Here it ACTS on the plan: a group fatigued today gets its weekly budget cut
  // today (partial ×0.80, fatigued ×0.60), and the volume it gives up is then
  // REDISTRIBUTED to the fresh groups TODAY's cluster trains (see
  // redistributeRecoveredVolumeToFreshSessionGroups below — proportional to
  // cluster weight, MRV-capped), so the freed volume does NOT vanish: a fatigued
  // chest on a push day becomes lighter-chest/heavier-shoulders, not a collapsed
  // session. Logs come from the SAME persisted sessions the Progress
  // manikin reads (recentSessions → flattenSessionsToRecoveryLogs). `date.getTime()`
  // threads the planned clock into recovery so the cut is DETERMINISTIC.
  // No logs / all-recovered → budget unchanged → identical to pre-M1 chassis
  // (graceful degradation, ADR 025). Aerobic sessions (userState.aerobicSessions
  // from useAerobicStore) are folded into the recovery state at the RO stage of
  // applyRecoveryToVolumeBudget below: a recent class only EASES a fresh group
  // (recovered→partial ×0.80), never deepens an already-stressed one — so a hard
  // spin class (legs) makes today's leg budget lighter. No aerobic → identical.
  const baseVolumeTargets = blueprints.periodization?.volume_target_pct ?? null;
  const recoveryLogs = flattenSessionsToRecoveryLogs(userState?.recentSessions);
  const aerobicSessions = Array.isArray(userState?.aerobicSessions)
    ? userState.aerobicSessions
    : undefined;

  // ── M2: weakness amplifies REAL volume toward MRV (the substance, not just
  // reordering). Weak groups are layered, graceful (ADR 025):
  //   1. the Specialization 4-gate target (when it fires), then
  //   2. the always-available lagging signal (getLaggingMuscles) from the SAME
  //      flattened sessions M1 uses — so amplification still works when the
  //      4-gate doesn't fire. De-duped, most-lagging-first after the spec target.
  // No weak signal at all → weakGroups empty → amplification + reordering are
  // both no-ops → plan identical to the M1 chassis.
  const laggingGroups = laggingGroupsFromLogs(recoveryLogs, date.getTime());
  // ── M4a: OPTIONAL priority-muscle override (D-priority-muscle 2026-06-02) ──
  // Andura INFERS the priority by default — the lagging group above IS the
  // inferred priority (M2). M4a only adds an opt-in hook so a user CAN pin a
  // group ("vreau brate mai mari") via userState.user.priorityGroup (a Big-11 RO
  // key, the SAME vocabulary weakGroups uses). When set, the pinned group is fed
  // as an ADDITIONAL weak/priority group → it flows through the existing M2
  // amplification-toward-MRV mechanism (NO duplicate math). When unset (default
  // null) → ZERO change; the inferred priority governs. The picker UI is deferred
  // (override optional, never required) — this is the engine-ready hook only.
  const priorityGroup =
    typeof userState?.user?.priorityGroup === 'string' && userState.user.priorityGroup.length > 0
      ? userState.user.priorityGroup
      : null;
  // Focus suppression (D-focus): drop any de-emphasized group from the weak set
  // so M2 weakness amplification does NOT re-inflate the region the user
  // intentionally minimized (focus BEATS auto-balance). EMPHASIZED groups are
  // unaffected here — focus + weakness compose fine (both raise), still MRV-capped.
  // balanced → deEmphSet empty → identical to pre-feature.
  const weakGroups = [...new Set(
    [priorityGroup, specializationTarget, ...laggingGroups].filter(
      (g) => typeof g === 'string' && g.length > 0 && !deEmphSet.has(g),
    ),
  )];

  // ── M3: detect + correct antagonist/pattern imbalances (the moat substance:
  // Andura silently balances push/pull + quad/ham from history, ZERO user input).
  // Detected from the SAME flattened sessions M1/M2 use; the lagging side's group
  // budgets are raised toward parity with the dominant side, severity-scaled, each
  // group HARD-capped at its MRV. ADDITIVE only — never lowers the dominant side.
  // No imbalance (balanced / insufficient data) → budget unchanged → identical to
  // the M2 output (graceful degradation, ADR 025). NOT a medical signal — volume
  // biasing only. date.getTime() threads the clock for determinism.
  const rawImbalances = detectImbalances({ logs: recoveryLogs, now: date.getTime() });
  // Focus suppression (D-focus): strip de-emphasized groups from each imbalance's
  // laggingGroups so M3 imbalance correction does NOT re-inflate the minimized
  // region (e.g. v-taper must not let a quad/ham imbalance pull the de-emphasized
  // legs back up). A pair whose lagging side is fully de-emphasized drops out.
  // balanced → deEmphSet empty → imbalances pass through unchanged (identical).
  const imbalances =
    deEmphSet.size === 0
      ? rawImbalances
      : rawImbalances
        .map((imb) => ({
          ...imb,
          laggingGroups: imb.laggingGroups.filter((g) => !deEmphSet.has(g)),
        }))
        .filter((imb) => imb.laggingGroups.length > 0);

  // CRITICAL ORDERING (base → FOCUS → M2 → M3 → M1): the focus selector biases
  // the budget FIRST (emphasized→MRV, de-emphasized→MEV), then weakness (M2) +
  // imbalance (M3) amplify ON TOP (both already SUPPRESSED on de-emphasized
  // groups above) — each clamped to MRV — then M1's recovery redistribution cuts
  // TODAY's budget last (recovery + time remain guards: focus shapes intent, not
  // safety). balanced → focusBiasedTargets === baseVolumeTargets clone → the rest
  // of the chain is byte-identical to pre-feature.
  const focusBiasedTargets = applyFocusBias(baseVolumeTargets, focusPreset);
  const amplifiedTargets = applyWeaknessAmplification(focusBiasedTargets, weakGroups);
  const balancedTargets = applyImbalanceCorrection(amplifiedTargets, imbalances);
  const recoveredTargets = applyRecoveryToVolumeBudget(
    balancedTargets,
    recoveryLogs,
    date.getTime(),
    aerobicSessions,
  );

  // Coach Voice — derive the structured adaptations log from the SAME maps the
  // plan was built from (zero recompute of the math, only a diff of deltas). The
  // recovery STATES (resistance-only vs merged-with-aerobic) drive the
  // recovery-cut cause attribution (a spin class vs a heavy session). Both
  // recompute cheaply + deterministically under the same clock the plan used.
  const resistanceState =
    recoveryLogs.length > 0 ? getRecoveryByGroup(recoveryLogs, undefined, date.getTime()) : {};
  const mergedState = aerobicSessions
    ? mergeAerobicRecovery(resistanceState, aerobicSessions, date.getTime())
    : resistanceState;

  // Recovery REDISTRIBUTION (the moat fix): the volume a recovery-cut group gave
  // up this session is reallocated to the FRESH groups TODAY's cluster trains
  // (proportional to cluster weight, each MRV-capped) — so a fatigued chest on a
  // push day becomes "lighter chest, HEAVIER shoulders/triceps" and the session
  // stays substantial instead of collapsing (the freed volume no longer vanishes).
  // SESSION-LOCAL: balancedTargets (the weekly SSOT) is untouched, so chest is
  // normal again on a fresh day. All-recovered / balanced → freed total is 0 →
  // volumeTargets === recoveredTargets (byte-identical to pre-feature). Uses the
  // SAME mergedState that drove the cut + the EFFECTIVE cluster the session trains.
  const volumeTargets = redistributeRecoveredVolumeToFreshSessionGroups(
    balancedTargets,
    recoveredTargets,
    cluster,
    mergedState,
  );
  // ACTIVE deload = any non-zero intensity modifier (mirrors the React-side
  // hasActiveDeload check in scheduleAdapterAggregate.compose: the IDLE blueprint
  // emits a zero modifier, every real deload state — SCHEDULED_LINEAR /
  // REACTIVE_* — a non-zero one).
  const deloadMod = blueprints.deload?.intensity_modifier ?? null;
  const deloadActive =
    deloadMod !== null &&
    ((deloadMod.rir_increment ?? 0) > 0 || (deloadMod.intensity_pct_decrement ?? 0) > 0);
  const coachAdaptations = deriveCoachAdaptations({
    // weakness-amp (M2) is the amplified-vs-focusBiased delta — so a focus-bias
    // bump is NOT mislabeled as weakness amplification (focus is intent, not a
    // detected weakness). balanced → focusBiasedTargets === baseVolumeTargets
    // clone → identical attribution to pre-feature.
    baseTargets: focusBiasedTargets,
    amplifiedTargets,
    balancedTargets,
    // The recovery-CUT attribution compares balanced→recovered (the groups that
    // dropped), so it reads the PRE-redistribution recovered budget — the
    // session-local fresh-group bump is an emphasis shift, not a detected cut.
    recoveredTargets,
    resistanceState,
    mergedState,
    deloadActive,
  });

  const sessionCtx = {
    equipment: { available: availableCoarse },
    weakGroups,
    profileTier: userState?.profileTier ?? null,
    prNames: Array.isArray(userState?.prNames) ? userState.prNames : [],
    seed,
    // Periodization volume signal (sets/week per Big-11 group, varies by
    // mesocycle phase), recovery-redistributed for TODAY (M1) — drives
    // per-exercise set counts in buildSession.
    volumeTargets,
    // Per-group weekly session frequency from the split — buildSession divides
    // the weekly volume budget by it to size the session (count + set counts).
    weeklySessionsPerGroup: sessionsPerGroup,
    // M1 "make it bite" — per-group recovery state (RO-keyed, recovered/partial/
    // fatigued) so the recovery cut REACHES the visible session: a fatigued group
    // is allowed below the normal compound set-floor AND drops ~1 exercise that
    // day (visibly lighter), not just on paper. This is the SAME mergedState that
    // drove the M1 budget cut above (resistance + aerobic) — NOT a new penalty,
    // it only makes the existing cut visible. Empty state (no logs) → no-op.
    recoveryState: mergedState,
  };

  const session = buildSession(cluster, sessionCtx);

  return {
    type: 'training',
    sessionType,
    warmup: blueprints.warmup || null,
    exercises: session && Array.isArray(session.exercises) ? session.exercises : [],
    intensityModifier: blueprints.deload?.intensity_modifier ?? null,
    // Recovery-redistributed budget actually consumed by buildSession this
    // session — the reported field matches what drove the plan (M1).
    volumeTargets,
    // Goal Adaptation rest-time prescription [minSec, maxSec] per template ×
    // phase × mode (goalAdaptation/index.js:178 rest_time_modifier). Was
    // computed by the engine but dropped here → planner hardcoded restSec 90.
    // null when the blueprint is absent (empty user) → planner falls back to 90.
    restTimeRange: blueprints.goalAdaptation?.rest_time_modifier ?? null,
    specializationTarget,
    deloadState: blueprints.deload?.deload_state ?? 'IDLE',
    // Coach Voice — structured, machine-readable adaptations log (the React side
    // synthesizes one plain-language coach line from it). ADDITIVE field; empty
    // array when nothing adapted this session. NO copy strings — tokens only.
    coachAdaptations,
    estimatedDurationMin: 50,
    volumeKg: 0,
    // Non-localized fallback SENTINEL (NOT user copy). The React render
    // boundaries (CoachTodayCard / WorkoutPreview / Workout / PostRpe) detect it
    // and substitute a locale-aware title via t() — engines never emit localized
    // Romanian copy. Value mirrors ENGINE_WORKOUT_TITLE_FALLBACK in
    // src/react/lib/scheduleAdapterAggregate.ts (engine→React import is a
    // layering violation, so the literal is duplicated with this cross-ref).
    workoutTitle: '__engine_workout_title_fallback__',
  };
}
