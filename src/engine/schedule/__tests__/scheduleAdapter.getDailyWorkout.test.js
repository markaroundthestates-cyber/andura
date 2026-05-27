// Phase 6 task_01 — getDailyWorkout pipeline consumer tests
//
// Validates that scheduleAdapter.getDailyWorkout invokes the runPipeline
// 8-adapter sequential strict pipeline + aggregates blueprints by engine id
// + delegates exercise selection to sessionBuilder + handles rest day and
// hard halt edges per ORCHESTRATOR §7 contract.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyWorkout,
  commitCalendarEdit,
  setMissingEquipment,
} from '../scheduleAdapter.js';
import { getExerciseMetadata } from '../../exerciseLibrary.js';

const TUESDAY_2026_05_19 = new Date(2026, 4, 19); // dayIdx 1 (M)
const MONDAY_2026_05_18 = new Date(2026, 4, 18);  // dayIdx 0 (L)

function buildUserState(overrides = {}) {
  return {
    user: { gender: 'M', age: 30, level: 'intermediate', goal: 'hypertrophy' },
    recentSessions: [],
    weights: {},
    profileTier: 'T1',
    flags: {},
    meta: { weeksElapsed: 0 },
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('scheduleAdapter — getDailyWorkout pipeline consumer', () => {
  it('returns null on rest day calendar override', async () => {
    // Mark Monday inactive — query on Monday should return null
    const selectedDays = [
      { day: 'L', active: false },
      { day: 'M', active: true },
      { day: 'M2', active: true },
      { day: 'J', active: true },
      { day: 'V', active: true },
      { day: 'S', active: false },
      { day: 'D', active: false },
    ];
    commitCalendarEdit(selectedDays, MONDAY_2026_05_18);
    const plan = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    expect(plan).toBeNull();
  });

  it('training day + pipeline ok → returns WorkoutPlan complete shape', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(plan.type).toBe('training');
    expect(plan).toHaveProperty('sessionType');
    expect(plan).toHaveProperty('warmup');
    expect(plan).toHaveProperty('exercises');
    expect(plan).toHaveProperty('intensityModifier');
    expect(plan).toHaveProperty('volumeTargets');
    expect(plan).toHaveProperty('specializationTarget');
    expect(plan).toHaveProperty('deloadState');
    expect(plan).toHaveProperty('estimatedDurationMin');
    expect(plan).toHaveProperty('volumeKg');
    expect(plan).toHaveProperty('workoutTitle');
  });

  it('returns null when runPipeline emits hard error', async () => {
    const orchestratorModule = await import('../../../coach/orchestrator/index.js');
    vi.spyOn(orchestratorModule, 'runPipeline').mockResolvedValueOnce([
      { ok: false, error: { code: 'ENGINE_THREW', message: 'simulated', severity: 'hard', adapterId: 'periodization' } },
    ]);
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).toBeNull();
  });

  it('aggregates blueprints by engine id (periodization, deload, specialization, warmup)', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    // periodization blueprint propagates volumeTargets (non-null map)
    expect(plan.volumeTargets).not.toBeNull();
    expect(typeof plan.volumeTargets).toBe('object');
    // deload state defaults IDLE when no deload window
    expect(typeof plan.deloadState).toBe('string');
    // warmup blueprint propagates (object or null per pipeline emission)
    expect(plan.warmup === null || typeof plan.warmup === 'object').toBe(true);
  });

  it('delegates exercise selection to sessionBuilder (array shape)', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(Array.isArray(plan.exercises)).toBe(true);
    // sessionBuilder emits objects with { name, sets } shape
    if (plan.exercises.length > 0) {
      expect(plan.exercises[0]).toHaveProperty('name');
      expect(plan.exercises[0]).toHaveProperty('sets');
    }
  });

  it('estimatedDurationMin + volumeKg present with numeric defaults', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(typeof plan.estimatedDurationMin).toBe('number');
    expect(typeof plan.volumeKg).toBe('number');
  });

  it('deloadState string + intensityModifier propagated from deload blueprint', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(typeof plan.deloadState).toBe('string');
    // intensityModifier may be null (no deload) or object (deload active)
    expect(plan.intensityModifier === null || typeof plan.intensityModifier === 'object').toBe(true);
  });

  it('specializationTarget propagates from specialization blueprint', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(plan.specializationTarget === null || typeof plan.specializationTarget === 'string').toBe(true);
  });

  it('workoutTitle defaults to "Antrenament azi"', async () => {
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    expect(plan.workoutTitle).toBe('Antrenament azi');
  });

  it('sessionType derives from day-of-week deterministically', async () => {
    const planMon = await getDailyWorkout(buildUserState(), MONDAY_2026_05_18);
    const planTue = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(planMon).not.toBeNull();
    expect(planTue).not.toBeNull();
    expect(planMon.sessionType).toBe('PUSH');     // L (0)
    expect(planTue.sessionType).toBe('PULL');     // M (1)
  });

  it('empty userState → defensive defaults, pipeline still completes', async () => {
    const plan = await getDailyWorkout({}, TUESDAY_2026_05_19);
    // Empty user → Periodization tier 'none' but constraint object still emitted
    // → downstream adapters proceed → pipeline completes (no hard halt)
    expect(plan).not.toBeNull();
    expect(plan.type).toBe('training');
  });

  it('undefined userState → defensive defaults, returns shape or null gracefully', async () => {
    const plan = await getDailyWorkout(undefined, TUESDAY_2026_05_19);
    expect(plan === null || plan.type === 'training').toBe(true);
  });

  it('missingEquipment filter applied via sessionBuilder coarse equipment', async () => {
    // WP-4: mark gantere + aparat-cablu missing → dumbbell + cable coarse types
    // unavailable. The session still composes (bodyweight + remaining types fill
    // it — no DROP-to-empty), but no dumbbell/cable exercise survives.
    setMissingEquipment(['gantere', 'aparat-cablu']);
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).not.toBeNull();
    const types = plan.exercises.map(
      (e) => getExerciseMetadata(e.name).equipment_type,
    );
    expect(types).not.toContain('dumbbell');
    expect(types).not.toContain('cable');
  });

  it('A2 H-4: marking gantere missing EXCLUDES dumbbell exercises from session', async () => {
    // Baseline (nothing missing) — selection may include a dumbbell exercise.
    const baseline = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(baseline).not.toBeNull();

    // Mark gantere (→ coarse 'dumbbell') missing. Same day, same session type.
    setMissingEquipment(['gantere']);
    const adapted = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(adapted).not.toBeNull();
    const adaptedTypes = adapted.exercises.map(
      (e) => getExerciseMetadata(e.name).equipment_type,
    );
    // No dumbbell exercise survives; the session is still fully composed
    // (substitution territory is WP-5 — here it just doesn't crash/empty).
    expect(adaptedTypes).not.toContain('dumbbell');
    expect(adapted.exercises.length).toBeGreaterThan(0);
  });

  it('runPipeline returns empty array → returns null (defensive)', async () => {
    const orchestratorModule = await import('../../../coach/orchestrator/index.js');
    vi.spyOn(orchestratorModule, 'runPipeline').mockResolvedValueOnce([]);
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).toBeNull();
  });

  it('runPipeline throws → returns null (D4 violation insurance)', async () => {
    const orchestratorModule = await import('../../../coach/orchestrator/index.js');
    vi.spyOn(orchestratorModule, 'runPipeline').mockRejectedValueOnce(new Error('boom'));
    const plan = await getDailyWorkout(buildUserState(), TUESDAY_2026_05_19);
    expect(plan).toBeNull();
  });
});
