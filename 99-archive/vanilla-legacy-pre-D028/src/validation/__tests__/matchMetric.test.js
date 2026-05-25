import { describe, it, expect } from 'vitest';
import {
  WEIGHTS,
  GATES,
  VERDICT_THRESHOLDS,
  jaccard,
  scoreExerciseOverlap,
  scoreSetsRepsRir,
  scoreSafetyConsiderations,
  scoreKeyPrinciples,
  computeMatchScore,
  aggregateCorpusResults,
} from '../matchMetric.js';

// ── LOCK V1 weights smoke ───────────────────────────────────────────────────

describe('LOCK V1 weights universal Safety-dominant (§5.1)', () => {
  it('weights sum to 1.0 exact', () => {
    const sum = WEIGHTS.safety + WEIGHTS.exercise + WEIGHTS.setsRepsRir + WEIGHTS.keyPrinciples;
    expect(sum).toBeCloseTo(1.0, 6);
  });

  it('Safety dominant 0.35 LOCKED V1', () => {
    expect(WEIGHTS.safety).toBe(0.35);
    expect(WEIGHTS.safety).toBeGreaterThan(WEIGHTS.exercise);
    expect(WEIGHTS.safety).toBeGreaterThan(WEIGHTS.setsRepsRir);
    expect(WEIGHTS.safety).toBeGreaterThan(WEIGHTS.keyPrinciples);
  });

  it('Gate 1 ≥95% LOCKED V1', () => {
    expect(GATES.GATE_1_MIN).toBe(0.95);
  });

  it('Verdict thresholds match spec', () => {
    expect(VERDICT_THRESHOLDS.MATCH).toBe(0.85);
    expect(VERDICT_THRESHOLDS.PARTIAL).toBe(0.70);
  });
});

// ── Jaccard helper ──────────────────────────────────────────────────────────

describe('jaccard', () => {
  it('identical sets → 1', () => {
    expect(jaccard(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1);
  });
  it('disjoint → 0', () => {
    expect(jaccard(['a', 'b'], ['c', 'd'])).toBe(0);
  });
  it('partial overlap', () => {
    // {a,b,c} vs {b,c,d} → intersect 2, union 4 → 0.5
    expect(jaccard(['a', 'b', 'c'], ['b', 'c', 'd'])).toBe(0.5);
  });
  it('both empty → 1 (degenerate match)', () => {
    expect(jaccard([], [])).toBe(1);
  });
});

// ── Exercise overlap ────────────────────────────────────────────────────────

describe('scoreExerciseOverlap', () => {
  it('identical → 1.0 (Jaccard 1.0 ≥0.70)', () => {
    expect(scoreExerciseOverlap(['squat', 'bench'], ['squat', 'bench'])).toBe(1.0);
  });
  it('Jaccard ≥0.70 → 1.0', () => {
    // 7 same out of 10 unique → 7/13 ≈ 0.538 — actually below 0.70
    // craft an explicit ≥0.70 case: 4 common, 1 unique each → 4/6 ≈ 0.667 — still below
    // 8 common out of 10 → 8/12 ≈ 0.667 — below
    // need 7 common, 0 unique each → 7/7 = 1.0 — too easy
    // 7 common, 1 unique each → 7/9 ≈ 0.778 → ≥0.70
    expect(scoreExerciseOverlap(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'extra1'],
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'extra2'],
    )).toBe(1.0);
  });
  it('Jaccard <0.50 → 0', () => {
    // 1 common out of 4 unique → 1/4 = 0.25
    expect(scoreExerciseOverlap(['a', 'b'], ['a', 'c'])).toBe(0); // 1/3 ≈ 0.33
  });
  it('Jaccard 0.50 → 0 (boundary, linear ramp begins)', () => {
    // 2 common, 1 unique each → 2/4 = 0.50 — ramp value = (0.50-0.50)/0.20 = 0
    const score = scoreExerciseOverlap(['a', 'b', 'x'], ['a', 'b', 'y']);
    expect(score).toBe(0);
  });
  it('Jaccard 0.60 → ~0.5 partial credit', () => {
    // 3 common, 1 unique each → 3/5 = 0.60 — ramp value = (0.60-0.50)/0.20 = 0.5
    const score = scoreExerciseOverlap(['a', 'b', 'c', 'x'], ['a', 'b', 'c', 'y']);
    expect(score).toBeCloseTo(0.5, 5);
  });
});

// ── Sets/reps/RIR band ──────────────────────────────────────────────────────

describe('scoreSetsRepsRir', () => {
  const claude = [{ exercise: 'squat', sets: 5, reps: 5, rir: 2 }];
  it('exact match → 1.0', () => {
    expect(scoreSetsRepsRir(claude, [{ exercise: 'squat', sets: 5, reps: 5, rir: 2 }])).toBe(1.0);
  });
  it('within band ±20% sets / ±2 reps / ±1 RIR → 1.0', () => {
    expect(scoreSetsRepsRir(claude, [{ exercise: 'squat', sets: 4, reps: 7, rir: 3 }])).toBe(1.0);
  });
  it('reps over ±2 → fail', () => {
    expect(scoreSetsRepsRir(claude, [{ exercise: 'squat', sets: 5, reps: 8, rir: 2 }])).toBe(0);
  });
  it('RIR over ±1 → fail', () => {
    expect(scoreSetsRepsRir(claude, [{ exercise: 'squat', sets: 5, reps: 5, rir: 4 }])).toBe(0);
  });
  it('exercise NU in Andura → not evaluated (handled by Exercise dim)', () => {
    expect(scoreSetsRepsRir(claude, [{ exercise: 'bench', sets: 5, reps: 5, rir: 2 }])).toBe(0);
  });
  it('empty Claude prescription + non-empty Andura → 0', () => {
    expect(scoreSetsRepsRir([], [{ exercise: 'squat', sets: 5, reps: 5, rir: 2 }])).toBe(0);
  });
  it('both empty → 1.0 degenerate match', () => {
    expect(scoreSetsRepsRir([], [])).toBe(1);
  });
});

// ── Safety considerations ───────────────────────────────────────────────────

describe('scoreSafetyConsiderations (subset semantics)', () => {
  it('Claude empty → 1 (nothing to absorb)', () => {
    expect(scoreSafetyConsiderations([], ['joint_arthrosis_avoid_high_impact'])).toBe(1);
  });
  it('Claude flags ⊆ Andura flags → 1', () => {
    expect(scoreSafetyConsiderations(
      ['joint_arthrosis', 'pregnancy_consult'],
      ['joint_arthrosis', 'pregnancy_consult', 'extra_safety_extra'],
    )).toBe(1);
  });
  it('partial subset → fraction', () => {
    expect(scoreSafetyConsiderations(
      ['joint_arthrosis', 'pregnancy_consult', 'pain_check'],
      ['joint_arthrosis'],
    )).toBeCloseTo(1 / 3, 5);
  });
  it('Andura missing all Claude flags → 0', () => {
    expect(scoreSafetyConsiderations(['joint_arthrosis', 'pregnancy_consult'], [])).toBe(0);
  });
});

// ── Key principles ──────────────────────────────────────────────────────────

describe('scoreKeyPrinciples (token jaccard, lowercased)', () => {
  it('case-insensitive match', () => {
    expect(scoreKeyPrinciples(['Volume', 'Recovery'], ['volume', 'recovery'])).toBe(1);
  });
  it('zero overlap → 0', () => {
    expect(scoreKeyPrinciples(['volume'], ['intensity'])).toBe(0);
  });
});

// ── computeMatchScore (LOCK V1 weighted) ────────────────────────────────────

describe('computeMatchScore — universal Safety 0.35 dominant', () => {
  const claude = {
    exercises: ['squat', 'bench', 'row'],
    prescription: [
      { exercise: 'squat', sets: 4, reps: 6, rir: 2 },
      { exercise: 'bench', sets: 4, reps: 8, rir: 1 },
      { exercise: 'row', sets: 4, reps: 10, rir: 1 },
    ],
    safety_flags: ['joint_check'],
    key_principles: ['volume', 'recovery'],
  };

  it('perfect match → score 1.0, verdict MATCH, flagged_uncertain false', () => {
    const r = computeMatchScore(claude, claude);
    expect(r.score).toBeCloseTo(1.0, 5);
    expect(r.verdict).toBe('MATCH');
    expect(r.flagged_uncertain).toBe(false);
  });

  it('safety mismatch dominates score (Maria 65 senerio — Andura skips safety flag)', () => {
    const anduraNoSafety = { ...claude, safety_flags: [] };
    const r = computeMatchScore(claude, anduraNoSafety);
    // Safety dim = 0 → contribution lost = 0.35; rest perfect → score = 0.65
    expect(r.dimensions.safety).toBe(0);
    expect(r.score).toBeCloseTo(0.65, 5);
    expect(r.verdict).toBe('MISS'); // 0.65 < 0.70 PARTIAL threshold
    expect(r.flagged_uncertain).toBe(true);
  });

  it('partial Exercise + perfect Safety → PARTIAL verdict', () => {
    // Andura swaps row → curl (Jaccard 2/4 = 0.50 → exerciseScore 0)
    const andura = {
      ...claude,
      exercises: ['squat', 'bench', 'curl'],
      prescription: [
        { exercise: 'squat', sets: 4, reps: 6, rir: 2 },
        { exercise: 'bench', sets: 4, reps: 8, rir: 1 },
        { exercise: 'curl', sets: 4, reps: 10, rir: 1 },
      ],
    };
    const r = computeMatchScore(claude, andura);
    // Safety 1 × 0.35 + Exercise 0 × 0.25 + SetsRepsRir 1 (2/2 evaluated) × 0.20 + Key 1 × 0.20 = 0.75
    expect(r.dimensions.safety).toBe(1);
    expect(r.dimensions.exercise).toBeCloseTo(0, 5);
    expect(r.dimensions.setsRepsRir).toBeCloseTo(1, 5); // 2 of 2 evaluated match
    expect(r.score).toBeCloseTo(0.75, 5);
    expect(r.verdict).toBe('PARTIAL');
    expect(r.flagged_uncertain).toBe(true);
  });
});

// ── aggregateCorpusResults — Gate 1 ≥95% LOCK ───────────────────────────────

describe('aggregateCorpusResults — Pre-Beta Gate 1 ≥95% LOCKED V1', () => {
  function mkResult(verdict) {
    const dim = { safety: 1, exercise: 1, setsRepsRir: 1, keyPrinciples: 1 };
    return {
      score: verdict === 'MATCH' ? 0.95 : verdict === 'PARTIAL' ? 0.75 : 0.50,
      verdict,
      flagged_uncertain: verdict !== 'MATCH',
      dimensions: dim,
    };
  }

  it('100% MATCH → Gate 1 PASS', () => {
    const results = Array.from({ length: 100 }, () => mkResult('MATCH'));
    const agg = aggregateCorpusResults(results);
    expect(agg.overall_match_rate).toBe(1.0);
    expect(agg.gate_1_pass).toBe(true);
    expect(agg.flagged_for_daniel_review).toBe(0);
  });

  it('95% MATCH → Gate 1 PASS exact threshold', () => {
    const results = [
      ...Array.from({ length: 95 }, () => mkResult('MATCH')),
      ...Array.from({ length: 5 }, () => mkResult('PARTIAL')),
    ];
    const agg = aggregateCorpusResults(results);
    expect(agg.overall_match_rate).toBe(0.95);
    expect(agg.gate_1_pass).toBe(true);
    expect(agg.flagged_for_daniel_review).toBe(5);
    expect(agg.flagged_rate).toBe(0.05);
  });

  it('94% MATCH → Gate 1 FAIL', () => {
    const results = [
      ...Array.from({ length: 94 }, () => mkResult('MATCH')),
      ...Array.from({ length: 6 }, () => mkResult('MISS')),
    ];
    const agg = aggregateCorpusResults(results);
    expect(agg.gate_1_pass).toBe(false);
    expect(agg.verdict_counts).toEqual({ MATCH: 94, PARTIAL: 0, MISS: 6 });
  });

  it('empty corpus → safe defaults, no Gate pass', () => {
    const agg = aggregateCorpusResults([]);
    expect(agg.gate_1_pass).toBe(false);
    expect(agg.overall_match_rate).toBe(0);
  });
});
