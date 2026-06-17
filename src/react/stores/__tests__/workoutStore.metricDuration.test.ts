// ══ C17-METRIC-DURATION-LOST — timed/carry set duration writeback regression ══
// PROVES: a time/carry set's performed seconds (durationSec) — captured live on
// the Workout screen — now survives the finish writeback into the durable log row,
// instead of being dropped (the row then read reps:0, losing the user's real timed
// work + showing a phantom 0-reps in Istoric). And a normal reps set is unchanged
// (no durationSec leaks onto it).

import { describe, it, expect, beforeEach } from 'vitest';
import { buildLogEntriesFromSummary } from '../workoutStore.logic';
import type { LastSessionSummary, SessionExerciseBreakdown } from '../workoutStore.types';

const SESSION = 1_700_000_000_000;

// Production-shaped: a Plank held 60s (isometric → kg 0) followed by a normal
// reps set, exactly the breakdown PostRpe persists into LastSessionSummary.
function summary(): LastSessionSummary {
  const plank: SessionExerciseBreakdown = {
    exerciseId: 'plank',
    exerciseName: 'Planseta',
    engineName: 'Plank',
    sets: [{ kg: 0, reps: 0, rating: 'potrivit', timestamp: SESSION + 1, durationSec: 60 }],
    totalVolume: 0,
    peakOneRM: 0,
  };
  const bench: SessionExerciseBreakdown = {
    exerciseId: 'flat-db',
    exerciseName: 'Impins plat',
    engineName: 'Flat DB Press',
    sets: [{ kg: 60, reps: 8, rating: 'potrivit', timestamp: SESSION + 2 }],
    totalVolume: 480,
    peakOneRM: 75,
  };
  return { meta: '2 seturi', exercises: [plank, bench] } as unknown as LastSessionSummary;
}

beforeEach(() => {
  localStorage.clear();
});

describe('C17-METRIC-DURATION-LOST — durationSec persists into the durable log row', () => {
  it('a timed set carries durationSec into its LogEntry (was lost as reps:0)', () => {
    const entries = buildLogEntriesFromSummary(summary(), SESSION);
    const plankRow = entries.find((e) => e.ex === 'Plank');
    expect(plankRow).toBeDefined();
    expect(plankRow?.durationSec).toBe(60);
  });

  it('a normal reps set carries NO durationSec (additive, no leak)', () => {
    const entries = buildLogEntriesFromSummary(summary(), SESSION);
    const benchRow = entries.find((e) => e.ex === 'Flat DB Press');
    expect(benchRow).toBeDefined();
    expect(benchRow?.durationSec).toBeUndefined();
    expect(benchRow?.reps).toBe('8');
  });
});
