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

/**
 * Ordered cluster template for N training days/week. Pure + unit-testable. N is
 * clamped to [1,7] (0 active days → the 1-day Full template defensively, but the
 * caller gates rest days separately). Returns a fresh array copy.
 *
 * @param {number} n - active training days that week
 * @returns {string[]} ordered Big-6 cluster ids
 */
export function frequencyToSplit(n) {
  const clamped = Math.min(7, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));
  return [...(FREQUENCY_SPLITS[clamped] || FREQUENCY_SPLITS[1])];
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
 * @param {ReadonlyArray<boolean>} activeWeek - length-7 active flags (Monday=0)
 * @param {number} dayIdx - 0..6
 * @returns {string} cluster id
 */
function clusterForDay(activeWeek, dayIdx) {
  const activeIdxs = [];
  for (let i = 0; i < 7; i++) if (activeWeek[i]) activeIdxs.push(i);
  const n = activeIdxs.length;
  const split = frequencyToSplit(n > 0 ? n : 1);
  const pos = activeIdxs.indexOf(dayIdx);
  // dayIdx active → its ordinal position; otherwise slot by active-days-before-it.
  const position = pos >= 0
    ? pos
    : activeIdxs.filter((i) => i < dayIdx).length;
  return split[Math.min(position, split.length - 1)];
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
export async function getDailyWorkout(userState, now = new Date()) {
  const date = (now instanceof Date && !isNaN(now.getTime())) ? now : new Date();
  const dayIdx = mapDateToIndex(date);

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
  const activeWeek =
    activeWeekFromOverride(override) ?? activeWeekForFrequency(userState?.user?.frequency);
  const cluster = clusterForDay(activeWeek, dayIdx);
  const split = frequencyToSplit(activeWeek.filter(Boolean).length || 1);
  const sessionsPerGroup = weeklySessionsPerGroup(split);
  // OUTPUT session-type tag (uppercase) for the localized title boundary — kept
  // SEPARATE from the cluster id buildSession consumes.
  const sessionType = CLUSTER_TO_SESSION_TAG[cluster] || 'FULL';
  const specializationTarget = blueprints.specialization?.target_muscle_group ?? null;
  const userId = userState?.user?.uid ?? userState?.uid ?? '';
  const seed = `${userId}|${getWeekStartIso(date)}|${dayIdx}`;

  // ── M1: muscle-recovery → today's volume budget (the moat seam) ──────────
  // The recovery brain already exists (getRecoveryByGroup) but only DISPLAYED.
  // Here it ACTS on the plan: a group fatigued today gets its weekly budget cut
  // today (partial ×0.80, fatigued ×0.60), and the freed budget naturally flows
  // to fresh groups since buildSession distributes session slots from the
  // per-group budget. Logs come from the SAME persisted sessions the Progress
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
  const weakGroups = [...new Set(
    [priorityGroup, specializationTarget, ...laggingGroups].filter((g) => typeof g === 'string' && g.length > 0),
  )];

  // ── M3: detect + correct antagonist/pattern imbalances (the moat substance:
  // Andura silently balances push/pull + quad/ham from history, ZERO user input).
  // Detected from the SAME flattened sessions M1/M2 use; the lagging side's group
  // budgets are raised toward parity with the dominant side, severity-scaled, each
  // group HARD-capped at its MRV. ADDITIVE only — never lowers the dominant side.
  // No imbalance (balanced / insufficient data) → budget unchanged → identical to
  // the M2 output (graceful degradation, ADR 025). NOT a medical signal — volume
  // biasing only. date.getTime() threads the clock for determinism.
  const imbalances = detectImbalances({ logs: recoveryLogs, now: date.getTime() });

  // CRITICAL ORDERING (M2 → M3 → M1): amplify weak groups (M2), then close
  // antagonist/pattern imbalances (M3) — both RAISE the WEEKLY budget, each group
  // still clamped to its MRV — then M1's recovery redistribution cuts TODAY's
  // budget on top (recovery runs LAST, wins for today). Net: a group that is
  // weak/lagging-side AND fatigued today is still rested today; the weekly
  // correction expresses on its FRESH days when recovery is a no-op for it.
  const amplifiedTargets = applyWeaknessAmplification(baseVolumeTargets, weakGroups);
  const balancedTargets = applyImbalanceCorrection(amplifiedTargets, imbalances);
  const volumeTargets = applyRecoveryToVolumeBudget(
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
  // ACTIVE deload = any non-zero intensity modifier (mirrors the React-side
  // hasActiveDeload check in scheduleAdapterAggregate.compose: the IDLE blueprint
  // emits a zero modifier, every real deload state — SCHEDULED_LINEAR /
  // REACTIVE_* — a non-zero one).
  const deloadMod = blueprints.deload?.intensity_modifier ?? null;
  const deloadActive =
    deloadMod !== null &&
    ((deloadMod.rir_increment ?? 0) > 0 || (deloadMod.intensity_pct_decrement ?? 0) > 0);
  const coachAdaptations = deriveCoachAdaptations({
    baseTargets: baseVolumeTargets,
    amplifiedTargets,
    balancedTargets,
    recoveredTargets: volumeTargets,
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
