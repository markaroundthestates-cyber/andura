// ══ LIVE PLAN — the host's workout, prescribed for ME (founder 2026-11-07) ════
// "daca ma antrenez cu un prieten, sa ii dea si lui in aplicatie antrenamentul meu,
// si sa ii porneasca sesiune independenta in care sa bage el greutatile lui" — they
// don't lift the same weights. A friend who joins gets the host's exercises in the
// host's order with HIS OWN prescription (the same DP path as any swap-in:
// buildSwappedExercise), and what he can't do (his refusals + "Nu pot face asta"
// list) becomes his best same-muscle alternative, or drops when there is none.
// Loaded lazily by getTodayWorkout only when the session carries a livePlan.

import { buildSwappedExercise, computeEstimatedDurationMin, computePlannedVolumeKg } from './scheduleAdapterAggregate';
import { resolveSwapPickList } from './substitution';
import { getExerciseMetadata } from '../../engine/exerciseLibrary.js';
import { movementKey } from '../../engine/sessionBuilder.js';
import { buildExclusionTokens, isExcludedMovement } from '../../engine/movementExclusion.js';
import { isEquipmentMissingExercise } from '../../engine/schedule/scheduleAdapter.js';
import { isEnabled } from '../../util/featureFlags.js';
import { useOnboardingStore } from '../stores/onboardingStore';
import { t } from '../../i18n/index.js';
import type { LivePlan } from '../stores/workoutStore';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';

/** True when this user can do the lift (not refused, not on his "Nu pot face asta" list). */
export function canDoExercise(name: string): boolean {
  if (isEquipmentMissingExercise(name)) return false;
  const refused = useOnboardingStore.getState().data?.refusedPatterns;
  if (!Array.isArray(refused) || refused.length === 0) return true;
  const excl = buildExclusionTokens([], refused, {
    kneeSafeQuads: isEnabled('dp_knee_safe_quads_v1'),
    shoulderSafe: isEnabled('dp_shoulder_safe_v1'),
  });
  const token = movementKey(name, getExerciseMetadata(name)).split('::')[1] ?? '';
  return !isExcludedMovement(name, token, excl);
}

export function composeLivePlan(live: LivePlan): PlannedWorkoutOutput {
  const exercises: PlannedExercise[] = [];
  const hostNames = live.exercises.map((e) => e.engineName);
  live.exercises.forEach((e, i) => {
    if (canDoExercise(e.engineName)) {
      const { swapReason: _r, ...own } = buildSwappedExercise(e.engineName, i, '', e.sets);
      exercises.push(own);
      return;
    }
    const taken = [...hostNames, ...exercises.map((x) => x.engineName ?? x.name)];
    const alt = resolveSwapPickList(e.engineName, i, taken, [], e.sets).rows[0];
    if (alt) exercises.push({ ...alt.exercise, swapReason: t('live.altReason') });
  });
  return {
    workoutTitle: live.title,
    ...(live.sessionType ? { sessionType: live.sessionType } : {}),
    exerciseCount: exercises.length,
    estimatedDuration: computeEstimatedDurationMin(exercises) ?? 0,
    intensityMod: 'normal',
    exercises,
    volumeKg: computePlannedVolumeKg(exercises) ?? 0,
    warmup: null,
  } as PlannedWorkoutOutput;
}
