// ══ deriveSessionRating TESTS — F-istoric-01 pure util ═══════════════════
// Cases per spec §9.3 + extra severity-tiebreak coverage.

import { describe, it, expect } from 'vitest';
import { deriveSessionRating } from '../../lib/sessionRating';
import type { LastSessionSummary } from '../../stores/workoutStore';

function makeSession(
  ratings: Array<'usor' | 'potrivit' | 'greu'>,
  hasExercises = true,
): LastSessionSummary {
  return {
    title: 'T',
    meta: '',
    ts: 0,
    exercises: hasExercises
      ? [
          {
            exerciseId: 'ex',
            exerciseName: 'Ex',
            sets: ratings.map((rating) => ({ kg: 100, reps: 5, rating, timestamp: 0 })),
            totalVolume: 500,
            peakOneRM: 100,
          },
        ]
      : undefined,
  };
}

describe('deriveSessionRating', () => {
  it('session without exercises field → returns null (backward compat legacy)', () => {
    const s = makeSession([], false);
    expect(deriveSessionRating(s)).toBeNull();
  });

  it('session with empty exercises [] → returns null', () => {
    const s: LastSessionSummary = { title: 'T', meta: '', ts: 0, exercises: [] };
    expect(deriveSessionRating(s)).toBeNull();
  });

  it('2 sets usor + usor → returns usor (most-frequent)', () => {
    const s = makeSession(['usor', 'usor']);
    expect(deriveSessionRating(s)).toBe('usor');
  });

  it('2 sets greu + greu → returns greu', () => {
    const s = makeSession(['greu', 'greu']);
    expect(deriveSessionRating(s)).toBe('greu');
  });

  it('mixed 1 usor + 2 potrivit → returns potrivit (most-frequent)', () => {
    const s = makeSession(['usor', 'potrivit', 'potrivit']);
    expect(deriveSessionRating(s)).toBe('potrivit');
  });

  it('1 set each rating → tiebreak picks greu (severity-first)', () => {
    const s = makeSession(['usor', 'potrivit', 'greu']);
    expect(deriveSessionRating(s)).toBe('greu');
  });

  it('2 sets potrivit + 2 sets greu → tiebreak picks greu (max count tie, severity-first)', () => {
    const s = makeSession(['potrivit', 'potrivit', 'greu', 'greu']);
    expect(deriveSessionRating(s)).toBe('greu');
  });

  it('2 sets usor + 2 sets potrivit → tiebreak picks potrivit (no greu present)', () => {
    const s = makeSession(['usor', 'usor', 'potrivit', 'potrivit']);
    expect(deriveSessionRating(s)).toBe('potrivit');
  });
});
