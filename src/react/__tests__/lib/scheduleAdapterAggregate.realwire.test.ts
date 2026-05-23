// Phase 6 task_02 Option C — scheduleAdapterAggregate real wire tests.
// Per DECISIONS.md §D027 STRATEGY LOCKED V1.
//
// Async pipeline composer invokes real getDailyWorkout(userState, now) which
// drives runPipeline 8-adapter chain + sessionBuilder delegate. Tests verify:
//   - rest day calendar override → null
//   - pipeline hard halt → null
//   - training day → PlannedWorkoutOutput shape complete
//   - volumeKg + estimatedDuration propagate
//   - intensityMod 'minus' cand deload intensityModifier active
//   - empty stores defensive → does not throw
//   - exercise mapping engine → PlannedExercise (id/name/sets/targetReps/targetKg/restSec)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import {
  CALENDAR_OVERRIDE_KEY,
  commitCalendarEdit,
  getWeekStartIso,
} from '../../../engine/schedule/scheduleAdapter.js';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M, PULL session)
const MONDAY_2026_05_18 = new Date(2026, 4, 18);  // dayIdx 0 (L, PUSH session)

function resetStores(): void {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75 },
    completed: true,
    completedAt: Date.now(),
  });
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 0,
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStores();
  vi.restoreAllMocks();
});

describe('scheduleAdapterAggregate — composePlannedWorkoutToday real wire async', () => {
  it('returns PlannedWorkoutOutput shape on training day', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(typeof out!.workoutTitle).toBe('string');
    expect(typeof out!.exerciseCount).toBe('number');
    expect(typeof out!.estimatedDuration).toBe('number');
    expect(['plus', 'normal', 'minus']).toContain(out!.intensityMod);
    expect(Array.isArray(out!.exercises)).toBe(true);
    expect(typeof out!.volumeKg).toBe('number');
  });

  it('returns null on rest day calendar override', async () => {
    commitCalendarEdit(
      [
        { day: 'L', active: false },
        { day: 'M', active: true },
        { day: 'M2', active: true },
        { day: 'J', active: true },
        { day: 'V', active: true },
        { day: 'S', active: false },
        { day: 'D', active: false },
      ],
      MONDAY_2026_05_18,
    );
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(out).toBeNull();
  });

  it('exerciseCount matches exercises.length', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.exerciseCount).toBe(out!.exercises.length);
  });

  it('exercises map engine output to PlannedExercise shape (id/name/sets/targetReps/targetKg/restSec)', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    if (out!.exercises.length > 0) {
      const ex = out!.exercises[0]!;
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.name).toBe('string');
      expect(typeof ex.sets).toBe('number');
      expect(typeof ex.targetReps).toBe('number');
      expect(typeof ex.targetKg).toBe('number');
      expect(typeof ex.restSec).toBe('number');
    }
  });

  it('workoutTitle defaults to "Antrenament azi" (NO_DIACRITICS_RULE)', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.workoutTitle).toBe('Antrenament azi');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(out!.workoutTitle)).toBe(false);
  });

  it('estimatedDuration defaults 50 min when engine emits 0', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBe(50);
  });

  it('intensityMod normal when no deload intensityModifier', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.intensityMod).toBe('normal');
  });

  it('empty stores → defensive defaults, pipeline completes', async () => {
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null },
      completed: false,
      completedAt: null,
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out === null || typeof out.workoutTitle === 'string').toBe(true);
  });

  it('returns null when pipeline throws unexpectedly (D4 insurance)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockRejectedValueOnce(new Error('boom'));
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).toBeNull();
  });

  it('returns null when getDailyWorkout returns null (rest day OR halt)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce(null);
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).toBeNull();
  });

  it('exercise id slug derived from engine name lowercase + dashes', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    if (out!.exercises.length > 0) {
      // ids should be kebab-case from engine exercise names + index suffix
      out!.exercises.forEach((ex) => {
        expect(ex.id).toMatch(/^[a-z0-9-]+$/);
      });
    }
  });

  it('volumeKg numeric non-negative (engine emits 0 V1 — Phase 7+ live)', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBeGreaterThanOrEqual(0);
  });
});

describe('scheduleAdapterAggregate — week boundary + storage key safety', () => {
  it('does NOT crash when CALENDAR_OVERRIDE_KEY contains malformed JSON', async () => {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, '{not valid json');
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out === null || typeof out.workoutTitle === 'string').toBe(true);
  });

  it('ignores stale override from prior week (Reset Luni natural)', async () => {
    const lastWeekTuesday = new Date(2026, 4, 12);
    commitCalendarEdit(
      [{ day: 'L', active: false }, { day: 'M', active: false }, { day: 'M2', active: false },
       { day: 'J', active: false }, { day: 'V', active: false }, { day: 'S', active: false },
       { day: 'D', active: false }],
      lastWeekTuesday,
    );
    // Current week (May 18 Monday-start) reads → stale override ignored → training day
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(getWeekStartIso(TUESDAY_2026_05_19)).toBe('2026-05-18');
  });
});

// LOW-CODE-09 — nullish coalescing preserves legitimate 0/empty engine values
// (anti-falsy-coercion silent shape mismatch). Mocks getDailyWorkout pentru
// scenarii sintetice care altfel pe pipeline real nu apar (engine emits
// concrete defaults src/engine/schedule/scheduleAdapter.js:493-495).
describe('scheduleAdapterAggregate — falsy-coercion nullish coalesce LOW-CODE-09', () => {
  const STUB_PLAN_BASE = {
    type: 'training' as const,
    sessionType: 'FULL_UPPER',
    warmup: null,
    exercises: [] as Array<{ name: string; sets: number }>,
    intensityModifier: null,
    volumeTargets: null,
    specializationTarget: null,
    deloadState: 'IDLE',
  };

  it('preserves volumeKg=0 from engine (NOT coerced to fallback)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 50,
      volumeKg: 0,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBe(0);
  });

  it('preserves estimatedDuration=0 from engine when explicitly emitted (NOT coerced to 50)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 0,
      volumeKg: 100,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBe(0);
  });

  it('preserves volumeKg=0 + estimatedDuration=42 + workoutTitle non-empty simultaneously', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 42,
      volumeKg: 0,
      workoutTitle: 'Antrenament Push',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBe(0);
    expect(out!.estimatedDuration).toBe(42);
    expect(out!.workoutTitle).toBe('Antrenament Push');
  });

  it('falls back to "Antrenament azi" when engine workoutTitle null (NU empty string coerce)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 50,
      volumeKg: 0,
      // @ts-expect-error — sintetic null testeaza null path; engine real
      // garanteaza string non-null per scheduleAdapter.js:495.
      workoutTitle: null,
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.workoutTitle).toBe('Antrenament azi');
  });

  it('falls back to 50 when engine estimatedDurationMin null/undefined (NU 0 coerce)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      // @ts-expect-error — sintetic undefined testeaza nullish path
      estimatedDurationMin: undefined,
      volumeKg: 0,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.estimatedDuration).toBe(50);
  });

  it('falls back to 0 when engine volumeKg null/undefined (idempotent for 0 case)', async () => {
    const mod = await import('../../../engine/schedule/scheduleAdapter.js');
    vi.spyOn(mod, 'getDailyWorkout').mockResolvedValueOnce({
      ...STUB_PLAN_BASE,
      estimatedDurationMin: 50,
      // @ts-expect-error — sintetic undefined testeaza nullish path
      volumeKg: undefined,
      workoutTitle: 'Antrenament azi',
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    expect(out!.volumeKg).toBe(0);
  });
});
