// ══ COACH CONFIDENCE (#63) — sigma → qualitative tier (flag dp_coach_confidence_v1)
// Maps the per-exercise Kalman posterior UNCERTAINTY (sigma) + observation count
// (n), carried on PlannedExercise.confidence (F5-W0), to a GENTLE qualitative tier:
// wide sigma / cold-start → "still learning you", narrow → "dialed in".
//
// MINIMALISM (Daniel LOCK 2026-06-08, _ENGINE_progression_rir_rest_count_policy §5):
// the function returns ONLY a tier enum + an i18n KEY. NO raw sigma / mu / e1RM /
// 1RM / kg / RIR / MEV ever leaves here — the copy is one subtle line, never a
// chart, never a number (the i18n key copy interpolates {exercise} only). The
// PRESCRIPTION is untouched: this is read-only narration.
//
// Thresholds anchor to the engine's OWN uncertainty constant so the UI's "still
// learning" never contradicts the engine's own "this is uncertain enough to probe":
//   SIGMA_HI = SIGMA_PROBE_THRESHOLD (activeProbing.js) — at/above this the engine
//              would spend a probe set → still learning.
//   SIGMA_LO = 4 — half the SIGMA_PRIOR seed width (strengthKalman.js SIGMA_PRIOR=8):
//              "converged well below where we started" → dialed in.
//   N_MIN = 3 — a 1-2 set fluke must NOT claim "dialed in" (mirrors F5 MIN_OBSERVATIONS).

import { SIGMA_PROBE_THRESHOLD } from '../../engine/dp/activeProbing.js';

/** At/above this sigma the engine would probe → "still learning". Tunable. */
export const SIGMA_HI = SIGMA_PROBE_THRESHOLD;
/** Below this sigma (with enough observations) → "dialed in". Tunable. */
export const SIGMA_LO = 4;
/** Minimum usable observations before "dialed in" can ever be claimed. Tunable. */
export const N_MIN = 3;

export type ConfidenceTier = 'LEARNING' | 'GETTING_THERE' | 'DIALED_IN';

/**
 * Pure tier classifier. The honest default is LEARNING: a cold-start / e1RM-
 * ineligible exercise (sigma === null) or one with too few observations never
 * claims more confidence than the posterior actually supports.
 *
 * @param sigma posterior uncertainty (null = cold-start / e1RM-ineligible)
 * @param n     count of usable e1RM observations folded into the posterior
 */
export function confidenceTier(sigma: number | null, n: number): ConfidenceTier {
  if (sigma === null || !Number.isFinite(sigma) || n < N_MIN || sigma >= SIGMA_HI) {
    return 'LEARNING';
  }
  if (sigma < SIGMA_LO) return 'DIALED_IN';
  return 'GETTING_THERE';
}

/** i18n key for a tier (under the `coachConfidence.*` block in en.json/ro.json). */
export function confidenceTierKey(tier: ConfidenceTier): string {
  switch (tier) {
    case 'DIALED_IN':
      return 'coachConfidence.dialedIn';
    case 'GETTING_THERE':
      return 'coachConfidence.gettingThere';
    case 'LEARNING':
    default:
      return 'coachConfidence.learning';
  }
}
