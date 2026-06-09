// ══ A2.1 DECISION-TRACE TESTS — every factor is REAL; an unfired factor is ABSENT ══
// Locks the honesty contract of buildDecisionTrace: each emitted factor reflects a
// decision the compose seam ACTUALLY made (a value present in the context), an
// unfired factor is OMITTED (never fabricated), and a clean session yields a minimal
// honest trace (just the final decision). Determinism (same context → identical
// trace) is asserted too.

import { describe, it, expect } from 'vitest';
import { buildDecisionTrace, type DecisionTraceContext } from '../../lib/decisionTrace';
import type { PlannedExercise } from '../../lib/engineWrappers.types';

// Minimal PlannedExercise factory — only the fields the trace reads (recReason).
function ex(name: string, status?: string): PlannedExercise {
  return {
    id: `${name}-0`,
    name,
    engineName: name,
    sets: 3,
    targetReps: 10,
    targetKg: 40,
    restSec: 90,
    ...(status ? { recReason: { status } } : {}),
  } as PlannedExercise;
}

/** Pull a factor's value out of a trace (or undefined if the factor is absent). */
function valueOf(trace: ReturnType<typeof buildDecisionTrace>, factor: string) {
  return trace.find((e) => e.factor === factor)?.value;
}
function factors(trace: ReturnType<typeof buildDecisionTrace>): string[] {
  return trace.map((e) => e.factor);
}

describe('buildDecisionTrace — honest factor derivation', () => {
  it('a CLEAN session (no energy-check, MAINTAIN phase, no cut/cap/deload, cold-start DP) → minimal honest trace', () => {
    const ctx: DecisionTraceContext = {
      readinessScore: null,
      phase: 'MAINTAIN',
      energyMagnitude: null,
      coachAdaptations: [],
      deloadActive: false,
      timeCapMin: null,
      focusPreset: 'balanced',
      exercises: [ex('Flat Barbell Bench Press'), ex('Lat Pulldown')],
      sessionType: 'PUSH',
      estimatedDuration: 48,
    };
    const trace = buildDecisionTrace(ctx);
    // ONLY the final decision — every other factor was a no-op default → omitted.
    expect(factors(trace)).toEqual(['finalDecision']);
    expect(valueOf(trace, 'finalDecision')).toBe('PUSH session, 2 exercises, 48 min');
  });

  it('each fired factor reflects its REAL decision value', () => {
    const ctx: DecisionTraceContext = {
      readinessScore: 62,
      phase: 'CUT',
      coachAdaptations: [
        { kind: 'recovery-cut', group: 'piept', cause: 'resistance' },
        { kind: 'weakness-amp', group: 'umeri' },
      ],
      deloadActive: true,
      timeCapMin: 75,
      focusPreset: 'v-taper',
      exercises: [
        ex('Flat Barbell Bench Press', 'INCREASE'),
        ex('Lat Pulldown', 'EASE BACK'),
        ex('Lateral Raise', 'EASE BACK'),
      ],
      sessionType: 'PULL',
      estimatedDuration: 52,
    };
    const trace = buildDecisionTrace(ctx);
    expect(valueOf(trace, 'phase')).toBe('CUT');
    expect(valueOf(trace, 'readiness')).toBe(62);
    expect(valueOf(trace, 'recovery')).toBe('cut piept');
    expect(valueOf(trace, 'emphasis')).toBe('boosted umeri');
    expect(valueOf(trace, 'deload')).toBe('active');
    expect(valueOf(trace, 'focusPolicy')).toBe('v-taper');
    expect(valueOf(trace, 'timeBudget')).toBe('capped to 75 min');
    // DP tally: highest count first, then alphabetical — EASE BACK×2 before INCREASE×1.
    expect(valueOf(trace, 'dp')).toBe('EASE BACK×2, INCREASE×1');
    expect(valueOf(trace, 'finalDecision')).toBe('PULL session, 3 exercises, 52 min');
  });

  it('NO fabrication — an unfired factor is ABSENT (not a fabricated entry)', () => {
    // readiness null, MAINTAIN phase, balanced focus, no adaptations, no deload, no
    // time cap, no DP status → ONLY finalDecision survives. Anything else would be
    // a fabricated plausible-sounding story.
    const ctx: DecisionTraceContext = {
      readinessScore: null,
      phase: null,
      coachAdaptations: [],
      deloadActive: false,
      timeCapMin: null,
      focusPreset: 'balanced',
      exercises: [ex('Goblet Squat')],
      sessionType: 'LEGS',
      estimatedDuration: 40,
    };
    const trace = buildDecisionTrace(ctx);
    expect(factors(trace)).toEqual(['finalDecision']);
    expect(valueOf(trace, 'phase')).toBeUndefined();
    expect(valueOf(trace, 'readiness')).toBeUndefined();
    expect(valueOf(trace, 'recovery')).toBeUndefined();
    expect(valueOf(trace, 'dp')).toBeUndefined();
  });

  it('MAINTAIN phase is the no-op default → OMITTED (only CUT/BULK are recorded)', () => {
    const maintain = buildDecisionTrace({ phase: 'MAINTAIN', exercises: [ex('X')], sessionType: 'FULL' });
    expect(valueOf(maintain, 'phase')).toBeUndefined();
    const bulk = buildDecisionTrace({ phase: 'BULK', exercises: [ex('X')], sessionType: 'FULL' });
    expect(valueOf(bulk, 'phase')).toBe('BULK');
  });

  it('phase falls back to energyMagnitude.phase when no explicit phase token', () => {
    const trace = buildDecisionTrace({
      phase: null,
      energyMagnitude: { phase: 'CUT', severity: 0.3 },
      exercises: [ex('X')],
      sessionType: 'PUSH',
    });
    expect(valueOf(trace, 'phase')).toBe('CUT');
  });

  it('readiness 0 is a REAL score → emitted (not falsy-dropped)', () => {
    const trace = buildDecisionTrace({ readinessScore: 0, exercises: [ex('X')], sessionType: 'PUSH' });
    expect(valueOf(trace, 'readiness')).toBe(0);
  });

  it('multiple recovery cuts dedupe + sort; only recovery-cut groups counted', () => {
    const trace = buildDecisionTrace({
      coachAdaptations: [
        { kind: 'recovery-cut', group: 'spate' },
        { kind: 'recovery-cut', group: 'piept' },
        { kind: 'recovery-cut', group: 'piept' },
        { kind: 'deload' }, // not a recovery-cut → ignored here
      ],
      exercises: [ex('X')],
      sessionType: 'PULL',
    });
    expect(valueOf(trace, 'recovery')).toBe('cut piept, spate');
  });

  it('imbalance-fix folds into the emphasis factor alongside weakness-amp', () => {
    const trace = buildDecisionTrace({
      coachAdaptations: [
        { kind: 'imbalance-fix', group: 'picioare-hamstrings' },
        { kind: 'weakness-amp', group: 'umeri' },
      ],
      exercises: [ex('X')],
      sessionType: 'LEGS',
    });
    expect(valueOf(trace, 'emphasis')).toBe('boosted picioare-hamstrings, umeri');
  });

  it('finalDecision is ALWAYS present and singular-aware', () => {
    const one = buildDecisionTrace({ exercises: [ex('X')], sessionType: 'PUSH', estimatedDuration: 30 });
    expect(valueOf(one, 'finalDecision')).toBe('PUSH session, 1 exercise, 30 min');
    // Missing sessionType / duration → graceful (no type prefix, no duration suffix).
    const bare = buildDecisionTrace({ exercises: [] });
    expect(valueOf(bare, 'finalDecision')).toBe('session, 0 exercises');
  });

  it('factor ORDER is stable: inputs first (phase→readiness→…→dp), finalDecision last', () => {
    const trace = buildDecisionTrace({
      phase: 'CUT',
      readinessScore: 70,
      coachAdaptations: [
        { kind: 'recovery-cut', group: 'piept' },
        { kind: 'weakness-amp', group: 'umeri' },
      ],
      deloadActive: true,
      focusPreset: 'arms',
      timeCapMin: 60,
      exercises: [ex('X', 'INCREASE')],
      sessionType: 'PULL',
      estimatedDuration: 50,
    });
    expect(factors(trace)).toEqual([
      'phase',
      'readiness',
      'recovery',
      'emphasis',
      'deload',
      'focusPolicy',
      'timeBudget',
      'dp',
      'finalDecision',
    ]);
  });

  it('DETERMINISM — same context → byte-identical trace across calls', () => {
    const ctx: DecisionTraceContext = {
      phase: 'CUT',
      readinessScore: 55,
      coachAdaptations: [{ kind: 'recovery-cut', group: 'spate' }],
      deloadActive: false,
      focusPreset: 'back',
      timeCapMin: 72,
      exercises: [ex('A', 'INCREASE'), ex('B', 'EASE BACK')],
      sessionType: 'UPPER',
      estimatedDuration: 58,
    };
    const a = buildDecisionTrace(ctx);
    const b = buildDecisionTrace(ctx);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('null / non-object context → empty trace (never throws)', () => {
    expect(buildDecisionTrace(null)).toEqual([]);
    expect(buildDecisionTrace(undefined)).toEqual([]);
  });
});
