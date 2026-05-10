// ══ VALIDATION FRAMEWORK MATCH METRIC ══════════════════════════════════════
// Per `04-architecture/ANDURA_VALIDATION_FRAMEWORK_V1.md` §5.1 LOCKED V1
// (2026-05-05 evening late):
//
//   Universal weights (NU ghilotina conditional pe profile flags):
//     Safety considerations    0.35   (dominant — Maria 65 100-500 organici
//                                       absorbs critical safety semantics)
//     Exercise selection       0.25   (Jaccard similarity exercises set)
//     Sets/reps/RIR band       0.20   (±20% sets / ±2 reps / ±1 RIR per ex)
//     Key principles invoked   0.20   (semantic overlap rationale, LLM-judge)
//
//   Match threshold:
//     ≥0.85 = MATCH
//     0.70-0.85 = PARTIAL (flagged for Daniel selective review §6.2 / §7 Gate 3)
//     <0.70 = MISS (flagged + counted toward Gate 1 fail)
//
//   Pre-Beta gates (§7 LOCKED V1):
//     Gate 1 ≥95% MATCH on full 500-query corpus
//     Gate 2 DROPPED entirely (Safety 0.35 universal absorbs critical safety)
//     Gate 3 selective Daniel review pe Claude-judge flagged uncertain ~5-15%

/**
 * Universal weights LOCKED V1 2026-05-05 evening late.
 * @type {Readonly<{ safety: number, exercise: number, setsRepsRir: number, keyPrinciples: number }>}
 */
export const WEIGHTS = Object.freeze({
  safety: 0.35,
  exercise: 0.25,
  setsRepsRir: 0.20,
  keyPrinciples: 0.20,
});

/** Per-query verdict thresholds. */
export const VERDICT_THRESHOLDS = Object.freeze({
  MATCH: 0.85,
  PARTIAL: 0.70,
});

/** Pre-Beta gates LOCKED V1. */
export const GATES = Object.freeze({
  GATE_1_MIN: 0.95,             // ≥95% corpus MATCH rate
  // GATE_2 DROPPED entirely — Safety 0.35 absorbs critical safety semantics
  GATE_3_FLAG_RATE_MAX: 0.15,   // flagged uncertain ≤15% (selective Daniel review band)
});

// ── Dimension scoring helpers ───────────────────────────────────────────────

/**
 * Jaccard similarity between two sets (arrays of comparable values).
 * @param {ReadonlyArray<unknown>} a
 * @param {ReadonlyArray<unknown>} b
 * @returns {number} 0..1
 */
export function jaccard(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 1;
  let intersection = 0;
  for (const v of sa) if (sb.has(v)) intersection += 1;
  const union = sa.size + sb.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/**
 * Exercise selection overlap score.
 * Jaccard ≥0.70 = full credit (1.0); 0.50-0.70 partial (linear); <0.50 = 0.
 * @param {ReadonlyArray<string>} claudeExercises
 * @param {ReadonlyArray<string>} anduraExercises
 * @returns {number} 0..1
 */
export function scoreExerciseOverlap(claudeExercises, anduraExercises) {
  const j = jaccard(claudeExercises, anduraExercises);
  if (j >= 0.70) return 1.0;
  if (j >= 0.50) return (j - 0.50) / 0.20; // linear ramp 0..1 in [0.50, 0.70]
  return 0;
}

/**
 * Sets/reps/RIR band agreement per exercise.
 * Each exercise: sets within ±20% Claude band; reps within ±2; RIR within ±1.
 * Score = fraction exercises where ALL three conditions hold.
 *
 * @param {ReadonlyArray<{exercise: string, sets: number, reps: number, rir: number}>} claudePrescription
 * @param {ReadonlyArray<{exercise: string, sets: number, reps: number, rir: number}>} anduraPrescription
 * @returns {number} 0..1
 */
export function scoreSetsRepsRir(claudePrescription, anduraPrescription) {
  if (!claudePrescription.length) return anduraPrescription.length === 0 ? 1 : 0;
  const anduraByEx = new Map(anduraPrescription.map((p) => [p.exercise, p]));
  let matches = 0;
  let evaluated = 0;
  for (const c of claudePrescription) {
    const a = anduraByEx.get(c.exercise);
    if (!a) continue; // exercise not selected by Andura — handled by Exercise dim, NU double-penalize here
    evaluated += 1;
    const setsBand = Math.abs(a.sets - c.sets) <= Math.max(1, Math.ceil(c.sets * 0.20));
    const repsBand = Math.abs(a.reps - c.reps) <= 2;
    const rirBand = Math.abs(a.rir - c.rir) <= 1;
    if (setsBand && repsBand && rirBand) matches += 1;
  }
  return evaluated === 0 ? 0 : matches / evaluated;
}

/**
 * Safety considerations: Claude flags ⊆ Andura flags.
 * Andura can include MORE flags (extra safety), NU mai putin.
 * Score = 1 daca subset, else fraction of Claude flags present in Andura.
 *
 * @param {ReadonlyArray<string>} claudeFlags
 * @param {ReadonlyArray<string>} anduraFlags
 * @returns {number} 0..1
 */
export function scoreSafetyConsiderations(claudeFlags, anduraFlags) {
  if (claudeFlags.length === 0) return 1;
  const anduraSet = new Set(anduraFlags);
  let present = 0;
  for (const f of claudeFlags) if (anduraSet.has(f)) present += 1;
  return present / claudeFlags.length;
}

/**
 * Key principles invoked — semantic overlap.
 * Pre-LLM-judge implementation: token-level Jaccard on lowercased rationales.
 * Production: replace cu Claude-judge LLM call per §6.1 (out of scope for this utility).
 *
 * @param {ReadonlyArray<string>} claudePrinciples
 * @param {ReadonlyArray<string>} anduraPrinciples
 * @returns {number} 0..1
 */
export function scoreKeyPrinciples(claudePrinciples, anduraPrinciples) {
  return jaccard(
    claudePrinciples.map((p) => String(p).toLowerCase()),
    anduraPrinciples.map((p) => String(p).toLowerCase()),
  );
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute per-query match score per ANDURA_VALIDATION_FRAMEWORK_V1 §5.1 LOCKED V1.
 *
 * Inputs are per-query Claude reasoning baseline vs Andura output. Both must
 * conform to the schema documented in `simulations/validation_corpus_v1.json`
 * + `simulations/ground_truth_v1.json`.
 *
 * @param {{
 *   exercises: ReadonlyArray<string>,
 *   prescription: ReadonlyArray<{exercise: string, sets: number, reps: number, rir: number}>,
 *   safety_flags: ReadonlyArray<string>,
 *   key_principles: ReadonlyArray<string>,
 * }} claudeReasoning
 * @param {{
 *   exercises: ReadonlyArray<string>,
 *   prescription: ReadonlyArray<{exercise: string, sets: number, reps: number, rir: number}>,
 *   safety_flags: ReadonlyArray<string>,
 *   key_principles: ReadonlyArray<string>,
 * }} anduraOutput
 * @returns {{
 *   score: number,
 *   verdict: 'MATCH' | 'PARTIAL' | 'MISS',
 *   flagged_uncertain: boolean,
 *   dimensions: {
 *     safety: number,
 *     exercise: number,
 *     setsRepsRir: number,
 *     keyPrinciples: number,
 *   }
 * }}
 */
export function computeMatchScore(claudeReasoning, anduraOutput) {
  const dimensions = {
    safety: scoreSafetyConsiderations(claudeReasoning.safety_flags, anduraOutput.safety_flags),
    exercise: scoreExerciseOverlap(claudeReasoning.exercises, anduraOutput.exercises),
    setsRepsRir: scoreSetsRepsRir(claudeReasoning.prescription, anduraOutput.prescription),
    keyPrinciples: scoreKeyPrinciples(claudeReasoning.key_principles, anduraOutput.key_principles),
  };

  const score
    = WEIGHTS.safety * dimensions.safety
    + WEIGHTS.exercise * dimensions.exercise
    + WEIGHTS.setsRepsRir * dimensions.setsRepsRir
    + WEIGHTS.keyPrinciples * dimensions.keyPrinciples;

  /** @type {'MATCH' | 'PARTIAL' | 'MISS'} */
  let verdict;
  if (score >= VERDICT_THRESHOLDS.MATCH) verdict = 'MATCH';
  else if (score >= VERDICT_THRESHOLDS.PARTIAL) verdict = 'PARTIAL';
  else verdict = 'MISS';

  // Flagged uncertain = anything not full MATCH; Daniel selective review per §6.2
  const flagged_uncertain = verdict !== 'MATCH';

  return { score, verdict, flagged_uncertain, dimensions };
}

/**
 * Aggregate corpus run results — Pre-Beta gates per §7 LOCKED V1.
 *
 * @param {ReadonlyArray<ReturnType<typeof computeMatchScore>>} perQueryResults
 * @returns {{
 *   overall_match_rate: number,
 *   gate_1_pass: boolean,
 *   flagged_for_daniel_review: number,
 *   flagged_rate: number,
 *   verdict_counts: { MATCH: number, PARTIAL: number, MISS: number },
 *   dimension_breakdown: { safety: number, exercise: number, setsRepsRir: number, keyPrinciples: number },
 * }}
 */
export function aggregateCorpusResults(perQueryResults) {
  const total = perQueryResults.length;
  if (total === 0) {
    return {
      overall_match_rate: 0,
      gate_1_pass: false,
      flagged_for_daniel_review: 0,
      flagged_rate: 0,
      verdict_counts: { MATCH: 0, PARTIAL: 0, MISS: 0 },
      dimension_breakdown: { safety: 0, exercise: 0, setsRepsRir: 0, keyPrinciples: 0 },
    };
  }

  const verdict_counts = { MATCH: 0, PARTIAL: 0, MISS: 0 };
  let flagged = 0;
  const dimSum = { safety: 0, exercise: 0, setsRepsRir: 0, keyPrinciples: 0 };

  for (const r of perQueryResults) {
    verdict_counts[r.verdict] += 1;
    if (r.flagged_uncertain) flagged += 1;
    dimSum.safety += r.dimensions.safety;
    dimSum.exercise += r.dimensions.exercise;
    dimSum.setsRepsRir += r.dimensions.setsRepsRir;
    dimSum.keyPrinciples += r.dimensions.keyPrinciples;
  }

  const overall_match_rate = verdict_counts.MATCH / total;
  const flagged_rate = flagged / total;

  return {
    overall_match_rate,
    gate_1_pass: overall_match_rate >= GATES.GATE_1_MIN,
    flagged_for_daniel_review: flagged,
    flagged_rate,
    verdict_counts,
    dimension_breakdown: {
      safety: dimSum.safety / total,
      exercise: dimSum.exercise / total,
      setsRepsRir: dimSum.setsRepsRir / total,
      keyPrinciples: dimSum.keyPrinciples / total,
    },
  };
}
