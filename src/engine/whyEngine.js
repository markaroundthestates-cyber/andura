// ══ WHY ENGINE — Categorical wording lock-uite v2 (rewrite 2026-05-01) ══════
// Per spec lock-uit chat strategic 2026-05-01: 4 verdict-based wording-uri
// fixe (vezi `t('why.categorical.*')`). NU mai expunem categorii raw + score
// + numerice (anti-RE breach previously had `[phase]/[readiness]/[pattern]`
// markers visible to user; eliminated).
//
// ── Verdict logic ───────────────────────────────────────────────────────────
//
//   1. recovery       — readiness < READINESS_MED (override toate celelalte)
//   2. progression_up — rec.kg > lastWeight (forward progression)
//   3. progression_down — rec.kg < lastWeight (technique reset)
//   4. hold           — default fallback (consolidation)
//
// ── Output contract ─────────────────────────────────────────────────────────
//
// `whySummary(exercise, ctx) → string` — single message, ZERO leak markers,
// ZERO numerice (NU score, NU kg, NU RPE), exercise name interpolated via
// i18n key fallback la EN raw.
//
// `explainRecommendation(exercise, ctx) → { summary, verdict, reasons }`:
//   - summary: same as `whySummary` (categorical i18n string)
//   - verdict: one of `progression_up | progression_down | hold | recovery`
//   - reasons: legacy array (kept for backward-compat callers care still
//     citesc — DAR populated cu single-element [{ text: summary }] only;
//     NU mai conține `category` field cu raw codes leakable user-facing)

import { READINESS_MED } from './readiness.js';
import { t } from '../i18n/index.js';

/**
 * Determine verdict din rec + ctx. Pure function, no side effects.
 *
 * Priority ladder:
 *   recovery > progression_up > progression_down > hold (default)
 *
 * @param {object} rec - exercise.recommendation
 * @param {object} ctx - CoachContext
 * @returns {'progression_up' | 'progression_down' | 'hold' | 'recovery'}
 */
export function selectVerdict(rec, ctx) {
  const score = ctx?.readiness?.score;
  if (typeof score === 'number' && score < READINESS_MED) {
    return 'recovery';
  }

  const kg = _toFiniteNumber(rec?.kg ?? rec?.weight);
  const lastWeight = _toFiniteNumber(rec?.lastWeight ?? rec?.previousKg);

  if (kg != null && lastWeight != null) {
    if (kg > lastWeight) return 'progression_up';
    if (kg < lastWeight) return 'progression_down';
  }

  // Status-based hint (legacy CoachDirector signal)
  if (rec?.status === 'INCREASE') return 'progression_up';
  if (rec?.status === 'SCALE_BACK') return 'progression_down';
  if (rec?.isInitial || rec?.status === 'INIT') return 'hold';

  return 'hold';
}

/**
 * Generate human-readable explanation pentru recommendation.
 *
 * @param {object} exercise - { name, recommendation: { kg, status, ... } }
 * @param {object} ctx - CoachContext { readiness, isInCut, ... }
 * @returns {{ summary: string, verdict: string, reasons: Array<{ text: string }> }}
 */
export function explainRecommendation(exercise, ctx) {
  const rec = exercise?.recommendation ?? {};
  const name = exercise?.name ?? (typeof exercise === 'string' ? exercise : '');
  const verdict = selectVerdict(rec, ctx);

  const summary = t(`why.categorical.${verdict}`, { exercise: name });

  return {
    summary,
    verdict,
    // Legacy `reasons` array preserved for backward-compat callers — single
    // element cu summary only. ZERO category leak (no raw codes).
    reasons: [{ text: summary }],
  };
}

/**
 * Shorthand: returnează doar summary string (categorical wording).
 */
export function whySummary(exercise, ctx) {
  return explainRecommendation(exercise, ctx).summary;
}

// ── Internal helpers ────────────────────────────────────────────────────────

function _toFiniteNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
