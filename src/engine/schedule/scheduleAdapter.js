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

// ── Daily workout pipeline consumer (Phase 6 task_01) ────────────────────
// LEGACY fine-grained engine equipment domain (sala-pilot specific IDs).
// Retained as documented reference + paired with translateToEngineEquipment
// (still exported/tested). NO LONGER drives selection per D081 — getDailyWorkout
// now derives a COARSE equipment_type set via equipmentMap.availableCoarseTypes.
export const ENGINE_EQUIPMENT_DOMAIN = Object.freeze([
  'matrix_cable',
  'bailib_stack',
  'pec_deck',
  'leg_machine',
  'leg_press_plates',
  'dumbbell',
]);

// Day-of-week → session type V1 deterministic mapping per mockup convention
// (L=Push, M=Pull, M2=Picioare, J=Umeri/brate, V=Full Upper, S=Push, D=Pull).
// Engine pipeline blueprint outputs orthogonal — session type drives only
// sessionBuilder exercise template selection (delegated downstream).
const DAY_TO_SESSION_TYPE = Object.freeze([
  'PUSH',           // L (0)
  'PULL',           // M (1)
  'UPPER_PICIOARE', // M2 (2)
  'UMERI_BRATE',    // J (3)
  'FULL_UPPER',     // V (4)
  'PUSH',           // S (5)
  'PULL',           // D (6)
]);

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

  // Compute available equipment as COARSE equipment_type set per D081 (coarse
  // equipment_type = SoT). buildSession filters on coarse types directly; the
  // legacy fine-grained ENGINE_EQUIPMENT_DOMAIN / translateToEngineEquipment
  // path is retained (exported, tested) but no longer drives selection here.
  const missingUserIds = getMissingEquipment();
  const availableTypes = availableCoarseTypes(missingUserIds);

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

  // sessionBuilder ctx: equipment available + weak groups derived from
  // Specialization target_muscle_group (single-element list for prioritization)
  const sessionType = DAY_TO_SESSION_TYPE[dayIdx] || 'FULL_UPPER';
  const specializationTarget = blueprints.specialization?.target_muscle_group ?? null;
  const sessionCtx = {
    equipment: { available: availableTypes },
    weakGroups: specializationTarget ? [specializationTarget] : [],
  };

  const session = buildSession(sessionType, sessionCtx);

  return {
    type: 'training',
    sessionType,
    warmup: blueprints.warmup || null,
    exercises: session && Array.isArray(session.exercises) ? session.exercises : [],
    intensityModifier: blueprints.deload?.intensity_modifier ?? null,
    volumeTargets: blueprints.periodization?.volume_target_pct ?? null,
    // Goal Adaptation rest-time prescription [minSec, maxSec] per template ×
    // phase × mode (goalAdaptation/index.js:178 rest_time_modifier). Was
    // computed by the engine but dropped here → planner hardcoded restSec 90.
    // null when the blueprint is absent (empty user) → planner falls back to 90.
    restTimeRange: blueprints.goalAdaptation?.rest_time_modifier ?? null,
    specializationTarget,
    deloadState: blueprints.deload?.deload_state ?? 'IDLE',
    estimatedDurationMin: 50,
    volumeKg: 0,
    workoutTitle: 'Antrenament azi',
  };
}
