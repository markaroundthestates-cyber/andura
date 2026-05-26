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
import { DB, tod } from '../../../db.js';
import { suggestStartWeight } from '../../../engine/coldStartGuidelines.js';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M, PULL session)
const MONDAY_2026_05_18 = new Date(2026, 4, 18);  // dayIdx 0 (L, PUSH session)

function resetStores(): void {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
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
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
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

// ── C1: weights from the DP brain (no longer hardcoded 20 / 10) ────────────
// TUESDAY 2026-05-19 = PULL session (sessionBuilder PULL_DAY_PLAN includes
// 'Lat Pulldown' EN canonical). Tests prove:
//   - logged-history user gets a DP-derived weight (NOT the old hardcode 20)
//   - cold-start user gets a per-exercise population prior scaled by experience
//   - the EN canonical name keys DP/cold-start (RO display never leaks into the
//     engine lookup)
describe('scheduleAdapterAggregate — C1 DP/cold-start weight wiring', () => {
  function findByEnSlug(
    exercises: ReadonlyArray<{ id: string; targetKg: number; targetReps: number }>,
    enName: string,
  ): { id: string; targetKg: number; targetReps: number } | undefined {
    const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return exercises.find((e) => e.id.startsWith(`${slug}-`));
  }

  it('logged-history exercise gets a DP weight, NOT the old hardcoded 20', async () => {
    // Seed real per-set logs for Lat Pulldown (English canonical key DP reads).
    // 3 sessions at 56 kg below top reps → DP CONSOLIDATE holds last weight,
    // snapped to the equipment stack (bailib_stack 56 -> 55).
    DB.set('logs', [
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 1000 },
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 2000 },
      { ex: 'Lat Pulldown', w: 56, reps: '9', set: 1, ts: Date.now() - 3000 },
    ]);
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    const lat = findByEnSlug(out!.exercises, 'Lat Pulldown');
    expect(lat).toBeDefined();
    // Real DP output (55, equipment-rounded) — proves the brain is wired, NOT
    // the dead 20 default NOR the cold-start prior (30 for this exercise).
    expect(lat!.targetKg).toBe(55);
    expect(lat!.targetKg).not.toBe(20);
    expect(lat!.targetKg).not.toBe(suggestStartWeight('Lat Pulldown', 'intermediate'));
    // DP repsTarget (11) wired too, not the old hardcoded 10.
    expect(lat!.targetReps).toBe(11);
  });

  it('cold-start (no logs) uses suggestStartWeight scaled by experience', async () => {
    // No logs → cold-start path. Intermediate Lat Pulldown prior = 30 * 1.0.
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    const lat = findByEnSlug(out!.exercises, 'Lat Pulldown');
    expect(lat).toBeDefined();
    expect(lat!.targetKg).toBe(suggestStartWeight('Lat Pulldown', 'intermediate'));
    expect(lat!.targetKg).toBe(30);
  });

  it('experience RO->EN scaling: avansat (advanced 1.3x) beats incepator (beginner 0.7x)', async () => {
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'incepator', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const begOut = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    const begLat = findByEnSlug(begOut!.exercises, 'Lat Pulldown');

    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'avansat', weight: 75, height: 175 },
      completed: true,
      completedAt: Date.now(),
    });
    const advOut = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    const advLat = findByEnSlug(advOut!.exercises, 'Lat Pulldown');

    expect(begLat).toBeDefined();
    expect(advLat).toBeDefined();
    // beginner 30*0.7=21, advanced 30*1.3=39 — RO strings mapped to EN buckets,
    // NOT silently falling to the x1.0 default (which would tie them).
    expect(advLat!.targetKg).toBeGreaterThan(begLat!.targetKg);
    expect(begLat!.targetKg).toBe(suggestStartWeight('Lat Pulldown', 'beginner'));
    expect(advLat!.targetKg).toBe(suggestStartWeight('Lat Pulldown', 'advanced'));
  });

  it('preserves Romanian display name + sub while wiring engine weight', async () => {
    const out = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    expect(out).not.toBeNull();
    const lat = findByEnSlug(out!.exercises, 'Lat Pulldown');
    expect(lat).toBeDefined();
    // id stays English-canonical slug (engine identity) while the user-facing
    // exercise carries the RO display (exro base preserved through C1 merge).
    const full = out!.exercises.find((e) => e.id === lat!.id) as { name: string } | undefined;
    expect(full).toBeDefined();
    expect(typeof full!.name).toBe('string');
    expect(full!.name.length).toBeGreaterThan(0);
  });
});

// ── FIX #1: readiness GATES the planned weight (DP.getSmartRecommendation) ──
// Anti-recurrence of the cycle-4 "vizor fara usa": the live planner used to call
// bare DP.recommend(), so today's readiness never touched the prescribed kg.
// These tests drive the REAL pipeline (NO mock of the engine path) and prove a
// DIFFERENT readiness produces a DIFFERENT recommended kg end-to-end:
//   - seed Lat Pulldown at top reps (12) + light RPE → DP base = INCREASE day
//   - LOW readiness (<60) → getSmartRecommendation HOLDS weight at lastW (55)
//   - HIGH readiness → INCREASE intact → +1 step (55 -> 59 -> stack-rounded 60)
// Readiness reads the REAL `tod()` (engine internal Date), so we seed against it.
describe('scheduleAdapterAggregate — FIX #1 readiness-gated planned weight', () => {
  function findByEnSlug(
    exercises: ReadonlyArray<{ id: string; targetKg: number; targetReps: number }>,
    enName: string,
  ): { id: string; targetKg: number; targetReps: number } | undefined {
    const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return exercises.find((e) => e.id.startsWith(`${slug}-`));
  }

  // Lat Pulldown at top reps (12) / RPE 7 across 3 sessions → DP INCREASE branch
  // (atTopReps && lastRPE <= 8). 55 kg already sits on the bailib_stack.
  function seedIncreaseDayLogs(): void {
    DB.set('logs', [
      { ex: 'Lat Pulldown', w: 55, reps: '12', rpe: 7, set: 1, ts: Date.now() - 1000 },
      { ex: 'Lat Pulldown', w: 55, reps: '12', rpe: 7, set: 1, ts: Date.now() - 2000 },
      { ex: 'Lat Pulldown', w: 55, reps: '12', rpe: 7, set: 1, ts: Date.now() - 3000 },
    ]);
  }

  function yesterdayKey(): string {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toLocaleDateString('sv');
  }

  it('LOW readiness (<60) HOLDS the INCREASE weight; HIGH readiness adds a step', async () => {
    // ── LOW readiness: energy 1 (=60) + a big kcal deficit yesterday (-20) → 40.
    seedIncreaseDayLogs();
    DB.set('readiness', { [tod()]: 1 });
    DB.set('kcals', { [yesterdayKey()]: 1000 }); // 50% of KCAL_TARGET 2000 → -20
    const lowOut = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    const lowLat = findByEnSlug(lowOut!.exercises, 'Lat Pulldown');
    expect(lowLat).toBeDefined();
    // Readiness gate held the weight at lastW (55), did NOT add the +step.
    expect(lowLat!.targetKg).toBe(55);

    // ── HIGH readiness: energy 5 (=100), no deficit. Same logs → INCREASE fires.
    seedIncreaseDayLogs();
    DB.set('readiness', { [tod()]: 5 });
    DB.set('kcals', {});
    const highOut = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    const highLat = findByEnSlug(highOut!.exercises, 'Lat Pulldown');
    expect(highLat).toBeDefined();
    // INCREASE: 55 + 4 = 59 → bailib_stack round → 60. Strictly heavier than LOW.
    expect(highLat!.targetKg).toBe(60);
    expect(highLat!.targetKg).toBeGreaterThan(lowLat!.targetKg);
  });

  it('readiness reaches the engine: low-readiness kg differs from no-readiness kg', async () => {
    // No energy-check today (readiness null) → engine runs plain double-
    // progression (INCREASE → 60). Then a LOW readiness → held at 55. The two
    // diverging numbers prove the score is CONSUMED, not ignored.
    seedIncreaseDayLogs();
    DB.set('readiness', {}); // none today → getComputedReadinessScore() = null
    const noReadyOut = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    const noReadyLat = findByEnSlug(noReadyOut!.exercises, 'Lat Pulldown');
    expect(noReadyLat!.targetKg).toBe(60); // ungated INCREASE

    seedIncreaseDayLogs();
    DB.set('readiness', { [tod()]: 1 });
    DB.set('kcals', { [yesterdayKey()]: 1000 });
    const lowOut = await composePlannedWorkoutToday(TUESDAY_2026_05_19);
    const lowLat = findByEnSlug(lowOut!.exercises, 'Lat Pulldown');
    expect(lowLat!.targetKg).toBe(55); // gated hold
    expect(lowLat!.targetKg).not.toBe(noReadyLat!.targetKg);
  });
});
