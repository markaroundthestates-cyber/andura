// _DIAG probe (auto-excluded from collection) — bug #34 missed-day verification.
// Drives the FULL React production path (composePlannedWorkoutToday → engine
// getDailyWorkout → 8-engine pipeline → sessionBuilder → time-budget trim) for
// the founder's exact reported case: days Mon/Tue/Thu/Fri, Tuesday skipped, then
// open the next training day. Reports the ACTUAL session shape (exercises / sets /
// minutes) so we can confirm whether a thin ~27-min legs session still emerges.
//
// Run: npx vitest run src/react/__tests__/lib/_DIAG_missedDay34.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore.types';

// Real weekday dates (Monday=0) in one ISO week.
const MON = new Date(2026, 4, 18);
const TUE = new Date(2026, 4, 19);
const THU = new Date(2026, 4, 21);
const FRI = new Date(2026, 4, 22);

function setScheduleStoreDays(days: string[]): void {
  localStorage.setItem(
    'wv2-schedule-store',
    JSON.stringify({ state: { weekStartISO: '2026-05-18', days }, version: 0 }),
  );
}

// A real Monday session in sessionsHistory (the shape workoutStore persists). Only
// the Monday day is trained — Tuesday is genuinely missed.
function monSession(): LastSessionSummary {
  const ts = MON.getTime();
  const ex = (id: string, name: string, kg: number) => ({
    exerciseId: id,
    exerciseName: name,
    engineName: name,
    sets: [
      { kg, reps: 8, rating: 'potrivit' as const, timestamp: ts + 1000 },
      { kg, reps: 8, rating: 'potrivit' as const, timestamp: ts + 2000 },
      { kg, reps: 8, rating: 'potrivit' as const, timestamp: ts + 3000 },
    ],
    totalVolume: kg * 8 * 3,
    peakOneRM: kg * 1.3,
  });
  return {
    title: 'Upper',
    meta: '9 seturi · 50 min',
    ts,
    exercises: [
      ex('flat-barbell-bench', 'Flat Barbell Bench', 60),
      ex('barbell-row', 'Barbell Row', 50),
      ex('db-shoulder-press', 'DB Shoulder Press', 20),
    ],
  };
}

beforeEach(() => {
  localStorage.clear();
  // Founder persona: balanced freq-4, intermediate, age 30 (gigica cap 75).
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 178 },
    completed: true,
    completedAt: Date.now(),
  });
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, prData: null, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null, lastSession: null,
    sessionsHistory: [monSession()], streak: 0, sessionTimeBudgetMin: null,
  });
  // Founder days Mon/Tue/Thu/Fri; balanced freq-4 split ['upper','lower','upper','lower']
  // → Mon=UPPER, Tue=LOWER (leg day), Thu=UPPER, Fri=LOWER.
  setScheduleStoreDays(['training', 'training', 'rest', 'training', 'training', 'rest', 'rest']);
});

function report(label: string, out: Awaited<ReturnType<typeof composePlannedWorkoutToday>>): void {
  if (!out) { console.log(`[DIAG #34] ${label}: NULL (rest day)`); return; }
  const sets = out.exercises.map((e) => e.sets);
  const totalSets = sets.reduce((a, b) => a + b, 0);
  console.log(
    `[DIAG #34] ${label}: type=${out.sessionType} ` +
    `ex=${out.exerciseCount} totalSets=${totalSets} sets=[${sets.join(',')}] ` +
    `duration=${out.estimatedDuration}min`,
  );
}

describe('_DIAG #34 — missed Tuesday → next leg day session shape (full React path)', () => {
  it('reports the actual shape of the leg day after a skipped Tuesday', async () => {
    const tue = await composePlannedWorkoutToday(TUE); // the leg day itself (skipped)
    const thu = await composePlannedWorkoutToday(THU); // next trained day after the miss
    const fri = await composePlannedWorkoutToday(FRI); // the following leg day

    report('TUE (leg day, was skipped)', tue);
    report('THU (next day after miss)', thu);
    report('FRI (following leg day)', fri);

    // The reported bug: a thin ~27-min LEGS session. Assert the leg days are NOT thin.
    expect(tue).not.toBeNull();
    expect(fri).not.toBeNull();
    expect(tue!.sessionType).toBe('LOWER');
    expect(fri!.sessionType).toBe('LOWER');
    expect(tue!.estimatedDuration!).toBeGreaterThanOrEqual(40);
    expect(fri!.estimatedDuration!).toBeGreaterThanOrEqual(40);
    expect(tue!.exercises.length).toBeGreaterThanOrEqual(5);
    expect(fri!.exercises.length).toBeGreaterThanOrEqual(5);
  });

  it('reports the v-taper variant (the original founder focus) leg day shape', async () => {
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 178, focusPreset: 'v-taper' } as never,
      completed: true,
      completedAt: Date.now(),
    });
    // v-taper @ Mon/Tue/Thu/Fri → ['push','pull','upper','lower'] → Fri=LOWER.
    const fri = await composePlannedWorkoutToday(FRI);
    report('FRI v-taper (the sole leg day)', fri);
    expect(fri).not.toBeNull();
    expect(fri!.estimatedDuration!).toBeGreaterThanOrEqual(40);
    expect(fri!.exercises.length).toBeGreaterThanOrEqual(5);
  });
});
