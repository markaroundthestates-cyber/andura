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
//
// ── HYGIENE SPLIT (barrel re-export, zero behavior change) ────────────────
// The implementation moved verbatim into four cohesive sibling concerns; this
// file is now a BARREL re-exporting the byte-identical public API so every
// existing consumer import resolves unchanged:
//   - .session : RO→EN experience map + LastSessionSummary→EngineSession transform
//   - .injury  : Pain CDL → injury safety signal derivation
//   - .builder : builder-layer signal helpers + buildUserStateForPipeline
//   - .compose : exercise prescription + volume/duration + composePlannedWorkoutToday

export type { EngineSession } from './scheduleAdapterAggregate.session';
export { toEngineSession } from './scheduleAdapterAggregate.session';

export type { InjurySignal } from './scheduleAdapterAggregate.injury';
export { deriveInjurySignal } from './scheduleAdapterAggregate.injury';

export {
  estimateBfFraction,
  buildUserStateForPipeline,
} from './scheduleAdapterAggregate.builder';

export {
  ENGINE_WORKOUT_TITLE_FALLBACK,
  buildSwappedExercise,
  computePlannedVolumeKg,
  computeEstimatedDurationMin,
  composePlannedWorkoutToday,
  personaTimeCapMin,
  personaTimeTargetMin,
  clusterFatigueFactor,
  trimSessionToTimeBudget,
  scaleSetsByReadiness,
} from './scheduleAdapterAggregate.compose';
