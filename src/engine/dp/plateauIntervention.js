// ══ BUILD #2/C — plateau → intervention done right (F4 spec §C) ═════════════
// TWO halves existed, disconnected: stagnationDetector (detectStagnation → weeks
// of <1% weekly-avg-1RM growth) NARRATED only, and classifyPlateau(mu, ceiling)
// (dp/ceiling.js) classified near_ceiling | problem | midrange but had NO live
// consumer. This is the thin GLUE that turns the narration into an ACTION and
// picks the right intervention — it reuses BOTH primitives, adds no new detector
// and no new classifier (Daniel hard rule: stagnationDetector stays the sole
// detector, classifyPlateau the sole classifier).
//
//   detectStagnation → stagnationWeeks
//   stagnationWeeks >= MIN → classifyPlateau(mu, ceiling):
//     • near_ceiling → NORMAL. Narrate "near your natural ceiling" + rotate this
//       lift to a same-muscle VARIATION (reuses alternativeFinder.findRefusalPool —
//       no new selection code). NO deload, NO problem alert. (Daniel's distinction
//       made real: a genetic plateau is not a problem to "fix".)
//     • problem → INTERVENE. Pick ONE intervention per occurrence, escalating
//       across occurrences: rep_shift (1st) → deload (2nd) → variation (3rd+).
//       The descriptor NAMES which existing mechanism to invoke (the deload trigger
//       hierarchy / a phase rep-band shift / a variation swap) — it does NOT
//       reimplement them.
//     • midrange → none (today's double-progression already handles it).
//
// PURE — no DB, no side effects. The caller (dp.getSmartRecommendation) supplies
// mu + ceiling (it owns the Kalman posterior / e1RM + the derived ceiling) and
// applies the descriptor behind dp_plateau_intervention_v1 (default OFF →
// byte-identical legacy: this module is never reached). Depends on dp_ceiling_v1
// for a real EXPECTED/PROBLEM split (without it the caller passes a flat MAX_KG
// ceiling → classification is coarser but still works: near-MAX_KG = near_ceiling).

import { classifyPlateau } from './ceiling.js';
import { findRefusalPool } from '../alternativeFinder.js';

// The stagnation-weeks gate — the SAME threshold the narration banner already uses
// (stagnationDetector consecutive-weeks). Surfaced as a Daniel-tunable constant.
export const PLATEAU_MIN_WEEKS = 2;

// Problem-plateau intervention ladder, escalating across repeated occurrences.
// occurrence 1 → rep_shift (cheapest, reversible), 2 → deload (reuse trigger
// hierarchy), 3+ → variation (reuse alternativeFinder). One per occurrence.
export const PROBLEM_LADDER = Object.freeze(['rep_shift', 'deload', 'variation']);

/**
 * Pick the problem-plateau intervention for the Nth occurrence (1-based). Clamps
 * past the end of the ladder to its last rung (variation) — a persistent problem
 * plateau keeps rotating the variation rather than re-deloading forever.
 * @param {number} occurrence 1-based count of distinct problem-plateau episodes
 * @returns {'rep_shift'|'deload'|'variation'}
 */
export function problemIntervention(occurrence) {
  const i = Number.isFinite(occurrence) && occurrence > 0 ? Math.floor(occurrence) : 1;
  return PROBLEM_LADDER[Math.min(i - 1, PROBLEM_LADDER.length - 1)];
}

/**
 * Classify a plateau and resolve the intervention. PURE.
 *
 * @param {object} args
 * @param {number} args.stagnationWeeks consecutive stagnant weeks (detectStagnation)
 * @param {number} args.mu current strength estimate (Kalman posterior mu or e1RM)
 * @param {number} args.ceiling derived ceiling e1RM (or flat MAX_KG when dp_ceiling_v1 off)
 * @param {string} args.ex canonical engineName (for the variation pool)
 * @param {number} [args.occurrence=1] 1-based count of prior problem episodes for this lift
 * @param {string[]} [args.triedNames=[]] variations already rotated through (for the pool)
 * @returns {null | {
 *   classification: 'near_ceiling'|'problem'|'midrange',
 *   action: 'variation'|'rep_shift'|'deload'|'none',
 *   variation?: string|null,
 *   muscleGroup?: string,
 * }}
 *   null when there is no qualifying stagnation (below the weeks gate) → no-op.
 */
export function classifyAndIntervene({ stagnationWeeks, mu, ceiling, ex, occurrence = 1, triedNames = [] }) {
  const weeks = Number(stagnationWeeks);
  if (!Number.isFinite(weeks) || weeks < PLATEAU_MIN_WEEKS) return null;

  const classification = classifyPlateau(mu, ceiling);

  if (classification === 'near_ceiling') {
    // NORMAL — narrate + rotate to a same-muscle variation. Reuse the existing
    // refusal pool (same-muscle ranked, best-first); the first candidate not yet
    // tried is the rotation target. No deload, no problem alert.
    const pool = findRefusalPool(ex, triedNames);
    const variation = pool.candidates.length ? pool.candidates[0].name : null;
    return { classification, action: 'variation', variation, muscleGroup: pool.muscleGroup };
  }

  if (classification === 'problem') {
    const action = problemIntervention(occurrence);
    if (action === 'variation') {
      const pool = findRefusalPool(ex, triedNames);
      const variation = pool.candidates.length ? pool.candidates[0].name : null;
      return { classification, action, variation, muscleGroup: pool.muscleGroup };
    }
    return { classification, action };
  }

  // midrange → keep today's behavior (the existing double-progression handles it).
  return { classification, action: 'none' };
}
