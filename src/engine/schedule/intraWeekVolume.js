// ══ INTRA-WEEK VOLUME — measurement layer (Phase 1, UNWIRED) ═══════════════
// Pure measurement primitives for intra-week adaptive programming: how much
// working-set volume the user has ALREADY logged this microcycle, per muscle
// group, and the recover-only deficit vs a target passed by the caller.
//
// PHASE 1 SCOPE: pure, deterministic, well-tested functions. NOTHING wires
// these into getDailyWorkout / the pipeline / any plan output — ZERO behavior
// change to any generated plan. A later phase consumes them. (See DESIGN
// intra-week-adaptive.)
//
// KEY MAPPING: logged sessions carry exercises whose metadata muscle groups are
// Big-11 RO keys (piept/spate/picioare-quads/...). The engine's per-session
// volumeTargets (periodization volume_target_pct) are Big-11 EN keys
// (chest/back/quads/...). We bridge RO→EN via the EXISTING SSOT translator
// BIG11_RO_TO_EN_MAP (periodization/constants.js) so output keys match
// volumeTargets exactly — NO new mapping invented.

import { getExerciseMetadata } from '../exerciseLibrary.js';
import { BIG11_RO_TO_EN_MAP } from '../periodization/constants.js';

/**
 * Volume credited to each SECONDARY muscle group of an exercise, as a fraction
 * of a full working set. A set primarily trains one group but partially loads
 * its synergists; 0.5 is the conventional "half-credit" used for secondary
 * involvement (Israetel/Schoenfeld effective-set accounting). ONE documented
 * constant — tune here, not inline.
 *
 * @type {number}
 */
export const SECONDARY_SET_CREDIT = 0.5;

/**
 * Done working-set volume per Big-11 EN muscle group for the CURRENT microcycle.
 *
 * Counts each exercise's LOGGED working sets (sets.length) and credits them to
 * the exercise's PRIMARY muscle group (full credit) plus, optionally, a fraction
 * (SECONDARY_SET_CREDIT, default 0.5) to each SECONDARY group. Only sessions
 * whose finish timestamp `ts` falls in the inclusive window [weekStartMs, nowMs]
 * are considered. RO muscle keys are bridged to EN via BIG11_RO_TO_EN_MAP so the
 * output keys match the engine's volumeTargets keys exactly. Unknown/unmapped
 * groups (e.g. the 'unknown' fallback sentinel, or a non-Big-11 key) are skipped
 * — never throws.
 *
 * Pure + deterministic: reads ONLY the passed sessionsHistory (no store/DB/clock
 * access inside). Sessions store ONLY logged sets, so this is purely a measure of
 * what was actually performed — no planned/target sets involved.
 *
 * @param {Array<{ts?: number, exercises?: Array<{exerciseName?: string, sets?: Array<unknown>}>}>|null|undefined} sessionsHistory
 *   Logged sessions (useWorkoutStore sessionsHistory shape). Tolerates missing fields.
 * @param {number} weekStartMs - microcycle start (inclusive), epoch ms.
 * @param {number} nowMs - upper bound (inclusive), epoch ms.
 * @param {{secondaryCredit?: number}} [opts] - override SECONDARY_SET_CREDIT (default 0.5).
 * @returns {Record<string, number>} EN-group-keyed done working-set volume (only groups with >0 volume present).
 */
export function doneVolumeByGroupThisWeek(sessionsHistory, weekStartMs, nowMs, opts = {}) {
  /** @type {Record<string, number>} */
  const out = {};
  if (!Array.isArray(sessionsHistory)) return out;

  const secondaryCredit =
    typeof opts.secondaryCredit === 'number' && Number.isFinite(opts.secondaryCredit)
      ? opts.secondaryCredit
      : SECONDARY_SET_CREDIT;

  const lo = typeof weekStartMs === 'number' ? weekStartMs : -Infinity;
  const hi = typeof nowMs === 'number' ? nowMs : Infinity;

  const credit = (roGroup, amount) => {
    if (typeof roGroup !== 'string' || roGroup.length === 0) return;
    const enKey = BIG11_RO_TO_EN_MAP[roGroup];
    if (!enKey) return; // unknown/unmapped (incl. 'unknown' sentinel) → skip, don't throw
    out[enKey] = (out[enKey] || 0) + amount;
  };

  for (const session of sessionsHistory) {
    if (!session || typeof session !== 'object') continue;
    const ts = session.ts;
    if (typeof ts !== 'number' || ts < lo || ts > hi) continue; // outside the window
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];
    for (const ex of exercises) {
      if (!ex || typeof ex !== 'object') continue;
      const loggedSets = Array.isArray(ex.sets) ? ex.sets.length : 0;
      if (loggedSets <= 0) continue;
      const meta = getExerciseMetadata(ex.exerciseName);
      credit(meta.muscle_target_primary, loggedSets);
      if (secondaryCredit !== 0 && Array.isArray(meta.muscle_target_secondary)) {
        for (const sec of meta.muscle_target_secondary) {
          credit(sec, loggedSets * secondaryCredit);
        }
      }
    }
  }

  return out;
}

/**
 * Recover-only volume deficit per group: how much each group is still SHORT of
 * its to-date target, never negative. For every group key present in
 * `targetToDate`: `max(0, targetToDate[g] - (done[g] || 0))`. An over-done group
 * yields 0 (we never "owe back" excess volume — the layer only compensates
 * shortfalls). Keys come from `targetToDate` so the result is bounded by the
 * caller's target shape (the EN group keys it chose).
 *
 * Pure: no clock/store access. The weekly/to-date target itself is NOT computed
 * here (Phase 2) — it is passed in as a plain argument so this is unit-testable
 * in isolation.
 *
 * @param {Record<string, number>|null|undefined} targetToDate - target volume per group.
 * @param {Record<string, number>|null|undefined} done - done volume per group (e.g. doneVolumeByGroupThisWeek output).
 * @returns {Record<string, number>} per-group recover-only deficit (>= 0).
 */
export function deficitByGroup(targetToDate, done) {
  /** @type {Record<string, number>} */
  const out = {};
  if (!targetToDate || typeof targetToDate !== 'object') return out;
  const doneMap = done && typeof done === 'object' ? done : {};
  for (const group of Object.keys(targetToDate)) {
    const target = targetToDate[group];
    if (typeof target !== 'number' || !Number.isFinite(target)) continue;
    const did = typeof doneMap[group] === 'number' ? doneMap[group] : 0;
    out[group] = Math.max(0, target - did);
  }
  return out;
}
