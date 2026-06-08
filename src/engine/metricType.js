// ══ METRIC TYPE — per-exercise prescription axis (reps | time | distance | carry) ══
// Wave 2 #7 (Daniel SSOT ANDURA-CORE-LIBRARY-v2-2026-06-03.md §DECISIONS bullet 2):
// isometrics + loaded carries must NOT receive a "weight × reps" prescription. A
// Plank is prescribed in SECONDS, a Farmer's Walk as a LOAD over a duration — never
// "8 × 60kg reps". This module is the single read for an exercise's metric.
//
// SOURCE OF TRUTH = the library's `metric_type` field (exercises.json), curated on
// the 143 CORE_AUTO + adjacent FALLBACK/MANUAL entries. ABSENT → 'reps' (the safe
// default — every loaded/bodyweight strength lift). No runtime guessing, no second
// hand-list: the data lives next to equipment_type. Unknown names → 'reps'.
//
// ALWAYS-ON DATA, INERT BY DEFAULT: this helper is pure + always available, but the
// BEHAVIORAL honoring (suppressing the weight × reps prescription for a non-reps
// exercise) is gated behind dp_metric_types_v1 at the prescription boundary
// (scheduleAdapterAggregate). With the flag OFF the prescription path is byte-
// identical to today — reading metric_type alone changes nothing.

import { EXERCISE_METADATA } from './exerciseLibrary.js';

/** @typedef {'reps'|'time'|'distance'|'carry'} MetricType */

const VALID = /** @type {ReadonlySet<string>} */ (new Set(['reps', 'time', 'distance', 'carry']));

/**
 * The prescription metric for an exercise. Reads the library `metric_type` field;
 * absent / unknown name / invalid value → 'reps' (the safe default).
 * @param {string} exerciseName ENGLISH canonical name (library key)
 * @returns {MetricType}
 */
export function getMetricType(exerciseName) {
  if (typeof exerciseName !== 'string') return 'reps';
  const meta = EXERCISE_METADATA[exerciseName];
  const m = meta && meta.metric_type;
  return typeof m === 'string' && VALID.has(m) ? /** @type {MetricType} */ (m) : 'reps';
}

/**
 * True when the exercise is prescribed as weight × reps (the default). False for a
 * time / distance / carry movement (an isometric hold or a loaded carry) — those
 * must not get a rep prescription.
 * @param {string} exerciseName ENGLISH canonical name
 * @returns {boolean}
 */
export function isRepsMetric(exerciseName) {
  return getMetricType(exerciseName) === 'reps';
}

/**
 * True when the exercise's working axis is TIME (an isometric hold prescribed in
 * seconds: Plank, Dead Hang, Pallof, …). A load may still ride (weighted plank),
 * but reps are never prescribed.
 * @param {string} exerciseName ENGLISH canonical name
 * @returns {boolean}
 */
export function isTimeMetric(exerciseName) {
  return getMetricType(exerciseName) === 'time';
}

/**
 * True when the exercise is a loaded CARRY (load over time/distance — Farmer's
 * Walk). Carries a load AND a distance/time axis; never reps.
 * @param {string} exerciseName ENGLISH canonical name
 * @returns {boolean}
 */
export function isCarryMetric(exerciseName) {
  return getMetricType(exerciseName) === 'carry';
}
