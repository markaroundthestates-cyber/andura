// ══ ACCELERATED LEARNING ADAPTER — Engine Consumer Layer ════════════════════
// Per [[wiki/concepts/aggressive-loading-warning-tier-aware]] §Engine learning
// accelerated T0/T1 LOCK V1 2026-05-14 — consumer wiring close LOCK 9 loop
// end-to-end ("engine I'm wrong se vindeca in 2-3 sesiuni").
//
// Compose pattern preserved (Option B per §A audit):
//   AA.applyTo(DP.recommend(ex), ex)
//     → applyAcceleratedLearningUpgrade(rec, ex, cdlEntries, DP)
//
// Pure functions — ADR 026 §9 invariant. Side-effect read DB encapsulated at
// I/O boundary helper readAggressiveLoadingLog (single seam testable).

import { detectAcceleratedLearningTrigger } from './acceleratedLearning.js';

/**
 * Apply accelerated learning baseline upgrade to a recommendation.
 * Returns the same shape as input recommendation. Augmented with forensic
 * fields when upgrade applies (ADR 011 §append-only transparency invariant):
 *   _acceleratedLearningApplied: true
 *   _originalKg: <baseline kg before upgrade>
 *   _upgradePct: <decimal, e.g. 0.25 = +25%>
 *   _samplesUsed: <2 typical>
 *
 * Idempotency (ADR 018 §2): same (recommendation, exerciseName, cdlEntries)
 * → same output. No internal state, no Date.now / Math.random.
 *
 * @pure
 * @param {Object} recommendation - {kg, ...} from DP.recommend / AA.applyTo
 * @param {string} exerciseName
 * @param {Array} cdlEntries - 'aggressive-loading-log' entries (enriched)
 * @param {Object} dpEngine - DP reference for roundToStep (optional)
 * @returns {Object} recommendation upgraded OR original (when no trigger)
 */
export function applyAcceleratedLearningUpgrade(recommendation, exerciseName, cdlEntries, dpEngine) {
  if (!recommendation || typeof recommendation.kg !== 'number' || recommendation.kg <= 0) {
    return recommendation;
  }
  if (typeof exerciseName !== 'string' || !exerciseName) {
    return recommendation;
  }

  const trigger = detectAcceleratedLearningTrigger(cdlEntries, exerciseName);
  if (!trigger.shouldUpgradeBaseline) {
    return recommendation;
  }

  const upgradedRaw = recommendation.kg * (1 + trigger.upgradedDeviationPct);
  const upgradedKg = dpEngine && typeof dpEngine.roundToStep === 'function'
    ? dpEngine.roundToStep(upgradedRaw, exerciseName)
    : upgradedRaw;

  // Idempotency guard: if upgrade somehow produces same kg (rounding), still
  // mark forensic — downstream consumers can decide to surface or not.
  return {
    ...recommendation,
    kg: upgradedKg,
    _acceleratedLearningApplied: true,
    _originalKg: recommendation.kg,
    _upgradePct: trigger.upgradedDeviationPct,
    _samplesUsed: trigger.samplesUsed,
  };
}

/**
 * I/O boundary helper — read CDL log from DB.
 * Encapsulated for testability + single seam between pure adapter and DB layer.
 *
 * @param {Object} db - DB reference exposing .get(key)
 * @returns {Array} entries or [] when missing/invalid
 */
export function readAggressiveLoadingLog(db) {
  if (!db || typeof db.get !== 'function') return [];
  try {
    const v = db.get('aggressive-loading-log');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
