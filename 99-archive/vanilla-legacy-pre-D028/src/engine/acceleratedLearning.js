// ══ ACCELERATED LEARNING — Aggressive Loading Override Pattern ══════════════
// Per [[wiki/concepts/aggressive-loading-warning-tier-aware]] LOCK V1 2026-05-14
//
// Reads the 'aggressive-loading-log' CDL feed (populated by logging.js
// confirmSessionKg → user override events) and produces two signals:
//
//   1. shouldUpgradeBaseline(entries, exerciseName) — if user override at
//      same exercise with repsAchieved == targetReps AND RPE <= 8 for 2
//      consecutive sessions, engine "I'm wrong" → upgrade baseline by avg
//      observed deviation.
//
//   2. detectT0ToT1AdvanceTrigger(entries) — if pattern persists across 3+
//      distinct exercises, advance calibration tier accelerated.
//
// Integration cross-link: ADR 009 Convergence Guard T2 Unlock §AMENDMENT
// 2026-05-05 + ADR 003 Double Progression increment-per-session signals
// preserved invariant. NU engine separat — INPUT signal nou pentru
// infrastructură existing.
//
// Pure functions — ADR 026 §9 invariant: NO Date.now / Math.random / mutation.

const OVERRIDE_TYPE = 'user_override_weight_high';
const RPE_ACCEPTABLE_MAX = 8;
const CONSECUTIVE_SESSIONS_REQUIRED = 2;
const DISTINCT_EXERCISES_REQUIRED = 3;

/**
 * Filter to entries that meet the "legitimate aggressive override" pattern:
 *   - type === 'user_override_weight_high' (NOT reverted)
 *   - repsAchieved === targetReps (full target hit)
 *   - RPE <= 8 (acceptable effort, not max-out grind)
 *
 * @typedef {{ type?: string, repsAchieved?: number, targetReps?: number, RPE?: number, exerciseName?: string, ts?: number, deviation_pct?: number, [k: string]: unknown }} AcLogEntry
 *
 * @pure
 * @param {unknown[]} entries
 * @returns {AcLogEntry[]}
 */
function _filterLegitimatePattern(entries) {
  if (!Array.isArray(entries)) return [];
  return /** @type {AcLogEntry[]} */ (entries.filter(/** @returns {x is AcLogEntry} */ (x) => {
    const e = /** @type {AcLogEntry} */ (x);
    return Boolean(
      e &&
      e.type === OVERRIDE_TYPE &&
      typeof e.repsAchieved === 'number' &&
      typeof e.targetReps === 'number' &&
      e.repsAchieved === e.targetReps &&
      typeof e.RPE === 'number' &&
      e.RPE <= RPE_ACCEPTABLE_MAX
    );
  }));
}

/**
 * Detect "engine baseline upgrade" trigger for a specific exercise.
 *
 * Returns shouldUpgradeBaseline = true when the last N entries for the
 * exercise (newest first) all meet legitimate pattern criteria.
 *
 * @pure
 * @param {unknown[]} entries - CDL aggressive-loading-log entries (newest first OR mixed; sorted internally by ts)
 * @param {string} exerciseName
 * @returns {{shouldUpgradeBaseline: boolean, upgradedDeviationPct: number, samplesUsed: number}}
 */
export function detectAcceleratedLearningTrigger(entries, exerciseName) {
  const filtered = _filterLegitimatePattern(entries)
    .filter(e => e.exerciseName === exerciseName)
    .slice() // copy before sort to preserve purity
    .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))  // newest first
    .slice(0, CONSECUTIVE_SESSIONS_REQUIRED);

  if (filtered.length < CONSECUTIVE_SESSIONS_REQUIRED) {
    return { shouldUpgradeBaseline: false, upgradedDeviationPct: 0, samplesUsed: filtered.length };
  }

  const sum = filtered.reduce((acc, e) => acc + (e.deviation_pct ?? 0), 0);
  const avgDeviation = sum / filtered.length;
  return {
    shouldUpgradeBaseline: true,
    upgradedDeviationPct: avgDeviation,
    samplesUsed: filtered.length,
  };
}

/**
 * Detect "T0 → T1 calibration tier advance accelerated" trigger.
 *
 * Returns shouldAdvance = true when 3+ distinct exercises each have 2+ legitimate
 * override entries (pattern crosses domains, not just one anomaly exercise).
 *
 * @pure
 * @param {unknown[]} entries - CDL aggressive-loading-log entries
 * @returns {{shouldAdvance: boolean, distinctExercisesWithPattern: number}}
 */
export function detectT0ToT1AdvanceTrigger(entries) {
  const legitimate = _filterLegitimatePattern(entries);

  /** @type {Record<string, number>} */
  const groupedByExercise = {};
  for (const e of legitimate) {
    if (!e || !e.exerciseName) continue;
    if (!groupedByExercise[e.exerciseName]) groupedByExercise[e.exerciseName] = 0;
    groupedByExercise[e.exerciseName] = (groupedByExercise[e.exerciseName] ?? 0) + 1;
  }

  let distinct = 0;
  for (const count of Object.values(groupedByExercise)) {
    if (count >= CONSECUTIVE_SESSIONS_REQUIRED) distinct++;
  }

  return {
    shouldAdvance: distinct >= DISTINCT_EXERCISES_REQUIRED,
    distinctExercisesWithPattern: distinct,
  };
}
