// REGRESSION — bug #34: a missed training day must NOT yield a thin ~27-min legs
// session. Founder reported (live 2026-06-06) days Mon/Tue/Thu/Fri, skipped
// Tuesday, then saw a thin ~27-min LEGS workout. Root cause was a STALE client
// bundle (pre-§D101 redistribution + pre-§D104 tier floor); on the current engine
// the behavior is sane. The engine layer is locked in
// scheduleAdapter.scheduleStoreActiveWeek.test.js (exercise count); THIS test locks
// the FULL React production path (composePlannedWorkoutToday → engine pipeline →
// sessionBuilder → persona time-budget trim) so the user-visible session DURATION +
// shape can never silently regress to a thin stub.
//
// The numbers asserted are the real production output (verified via the _DIAG
// probe): every leg day after a skipped Tuesday lands 40+ min with 5+ exercises —
// never a 27-min / 2-3 exercise collapse.

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
// Monday is trained — Tuesday (the scheduled leg day) is genuinely missed.
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
  // → Mon=UPPER, Tue=LOWER (the leg day), Thu=UPPER, Fri=LOWER.
  setScheduleStoreDays(['training', 'training', 'rest', 'training', 'training', 'rest', 'rest']);
});

describe('#34 — missed Tuesday never yields a thin ~27-min legs session (full React path)', () => {
  it('the skipped leg day + the following leg day are substantial (40+ min, 5+ exercises)', async () => {
    const tue = await composePlannedWorkoutToday(TUE); // the leg day (skipped)
    const thu = await composePlannedWorkoutToday(THU); // next trained day after the miss
    const fri = await composePlannedWorkoutToday(FRI); // the following leg day

    // The missed day does NOT relocate legs onto Thursday — Thu keeps its UPPER
    // cluster; Tue/Fri remain the (correct) leg days.
    expect(tue!.sessionType).toBe('LOWER');
    expect(thu!.sessionType).toBe('UPPER');
    expect(fri!.sessionType).toBe('LOWER');

    // The leg days are real sessions — never the reported ~27-min / 2-3 exercise stub.
    for (const plan of [tue!, fri!]) {
      expect(plan.estimatedDuration!).toBeGreaterThanOrEqual(40);
      expect(plan.exercises.length).toBeGreaterThanOrEqual(5);
      // No flat field of token sets — a substantial leg day has real working volume.
      const totalSets = plan.exercises.reduce((a, e) => a + e.sets, 0);
      expect(totalSets).toBeGreaterThanOrEqual(15);
    }
  });

  it('v-taper (the original founder focus) sole leg day is also substantial', async () => {
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 178, focusPreset: 'v-taper' } as never,
      completed: true,
      completedAt: Date.now(),
    });
    // v-taper @ Mon/Tue/Thu/Fri → ['push','pull','upper','lower'] → Fri=LOWER.
    const fri = await composePlannedWorkoutToday(FRI);
    expect(fri!.sessionType).toBe('LOWER');
    expect(fri!.estimatedDuration!).toBeGreaterThanOrEqual(40);
    expect(fri!.exercises.length).toBeGreaterThanOrEqual(5);
  });
});
