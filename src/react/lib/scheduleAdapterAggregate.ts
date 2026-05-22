// ══ SCHEDULE ADAPTER AGGREGATE — Phase 6 task_02 Real Wire Async ═════════
// Per DECISIONS.md §D027 STRATEGY LOCKED V1 Option C big-bang async migration.
// Phase 5 task_05 PHASE_5_BASELINE_PUSH stub eliminated. Real pipeline
// invocation via scheduleAdapter.getDailyWorkout(userState, now) async
// (Phase 6 task_01 LANDED runPipeline 8-adapter consumer + sessionBuilder
// delegate).
//
// Returns null when:
//   - Calendar override rest day (selectedDays[dayIdx].active === false)
//   - Pipeline hard halt (Periodization or downstream emit hard error)
//   - getDailyWorkout throws (D4 contract surface defensive)
//
// Returns PlannedWorkoutOutput shape when training day + pipeline complete.
// Async signature consumed via useState + useEffect loading pattern în 5
// React consumers (SessionPill / Workout / WorkoutPreview / PostRpe /
// coachDirectorAggregate).

import { getDailyWorkout } from '../../engine/schedule/scheduleAdapter.js';
import { useWorkoutStore } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';

/**
 * Build minimal userState aggregate consumed by getDailyWorkout pipeline.
 * Primary-source slice fields verified (anti-recurrence D027 §5):
 *   - user: useOnboardingStore.data Big 6 (age/sex/goal/frequency/experience/weight)
 *   - recentSessions: useWorkoutStore.sessionsHistory (cumulative LastSessionSummary[])
 *   - weights/profileTier/flags/meta defensive empty — buildEngineContext
 *     handles missing fields per src/coach/orchestrator/contextBuilder.js:42-58.
 *
 * Tier resolution Phase 6+ deferred (profileTier:null = engine downstream
 * fallback baseline T0 logic preserved). NU fabricate fields care nu există
 * în stores (slip cause D027 §5).
 */
function buildUserStateForPipeline(): {
  user: object;
  recentSessions: ReadonlyArray<unknown>;
  weights: object;
  profileTier: null;
  flags: object;
  meta: object;
} {
  const onboardingData = useOnboardingStore.getState().data;
  const sessionsHistory = useWorkoutStore.getState().sessionsHistory;
  return {
    user: {
      age: onboardingData.age,
      sex: onboardingData.sex,
      goal: onboardingData.goal,
      frequency: onboardingData.frequency,
      experience: onboardingData.experience,
      weight: onboardingData.weight,
    },
    recentSessions: sessionsHistory ?? [],
    weights: {},
    profileTier: null,
    flags: {},
    meta: {},
  };
}

/**
 * Map engine exercise (sessionBuilder output `{ name, sets }`) to
 * PlannedExercise consumer shape. Engine emits only name + sets count;
 * targetReps/targetKg/restSec derived defensive defaults V1 (Phase 7+
 * wires Bayesian Nutrition + DP recommendations per-exercise).
 */
function toPlannedExercise(engineEx: { name: string; sets: number }, idx: number): PlannedExercise {
  const slug = engineEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: `${slug}-${idx}`,
    name: engineEx.name,
    sets: engineEx.sets,
    targetReps: 10,
    targetKg: 20,
    restSec: 90,
  };
}

/**
 * Phase 6 task_02 real wire. Async pipeline consumer — caller (5 consumers
 * React) handles loading state via useState + useEffect pattern. Returns
 * null pe rest day OR pipeline hard halt OR thrown exception (fail-silent).
 */
export async function composePlannedWorkoutToday(
  now: Date = new Date(),
): Promise<PlannedWorkoutOutput | null> {
  try {
    const userState = buildUserStateForPipeline();
    const plan = await getDailyWorkout(userState, now);
    if (plan === null) return null;
    const exercises = (plan.exercises ?? []).map(toPlannedExercise);
    // Deload engine emits intensity_modifier object always (IDLE state =
    // {rir_increment:0, intensity_pct_decrement:0}). 'minus' only when
    // ACTIVE deload (any non-zero modifier field). Phase 7+ wires 'plus'
    // via Energy Adjustment composite output.
    const mod = plan.intensityModifier as { rir_increment?: number; intensity_pct_decrement?: number } | null;
    const hasActiveDeload = mod !== null && (
      (mod.rir_increment ?? 0) > 0 || (mod.intensity_pct_decrement ?? 0) > 0
    );
    // F-workout-preview/T1 — Engine Warm-up blueprint surface. Engine emits
    // duration_min (5-10 adaptive) + ui_label "Incalzire ~X min" via
    // src/engine/warmup/index.js:289-300. Map to consumer-friendly {line,
    // durationMin}. Null when ui_label missing/empty (defensive guard).
    const warmupRaw = plan.warmup as { duration_min?: number; ui_label?: string } | null;
    const warmupLine = typeof warmupRaw?.ui_label === 'string' ? warmupRaw.ui_label : '';
    const warmupDuration = typeof warmupRaw?.duration_min === 'number' ? warmupRaw.duration_min : 0;
    const warmup = warmupRaw !== null && warmupLine.length > 0
      ? { line: warmupLine, durationMin: warmupDuration }
      : null;
    return {
      workoutTitle: plan.workoutTitle || 'Antrenament azi',
      exerciseCount: exercises.length,
      estimatedDuration: plan.estimatedDurationMin || 50,
      intensityMod: hasActiveDeload ? 'minus' : 'normal',
      exercises,
      volumeKg: plan.volumeKg || 0,
      warmup,
    };
  } catch (e) {
    console.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
