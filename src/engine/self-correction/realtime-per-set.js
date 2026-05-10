// ══ SELF-CORRECTION § 36.28 — Realtime Per-Set Silent Recalibration ══════════
// LOCKED V1 per §36.28 (mid-session recalibration silent) + §36.48 per-set normalization.
// Wording strings consumed din src/engine/dp.js (IN_SESSION_DOWN/UP — already integrated BATCH_02).

/**
 * Detect realtime adjustment trigger based on per-set RPE history.
 * Mid-session ONLY — post-session uses different DP logic.
 * NU expune scor numeric; voice plural collaborative per Filter Bugatti.
 *
 * Trigger conditions:
 *   - 2× RPE 10 consecutive → adjust DOWN (greutate prea mare)
 *   - 2× Easy (RPE ≤6.5) + reps maxime → adjust UP (greutate prea mica)
 *
 * @param {{ rpes: number[], reps: number[], rMax: number }} sessionState
 * @returns {{ direction: 'up'|'down'|'none', reason: string|null }}
 */
export function detectRealtimeAdjust(sessionState) {
  const { rpes = [], reps = [], rMax } = sessionState;
  if (rpes.length < 2) return { direction: 'none', reason: 'insufficient_sets' };

  const last2Rpes = rpes.slice(-2);
  if (last2Rpes.every(r => r >= 10)) {
    return { direction: 'down', reason: 'two_consecutive_rpe10' };
  }

  const last2Reps = reps.slice(-2);
  if (last2Rpes.every(r => r <= 6.5) && last2Reps.every(r => r >= rMax)) {
    return { direction: 'up', reason: 'two_easy_at_max_reps' };
  }

  return { direction: 'none', reason: null };
}
