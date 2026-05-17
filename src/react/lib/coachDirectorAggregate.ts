// ══ COACH DIRECTOR AGGREGATE — React-side Pipeline Composer ══════════════
// Phase 5 task_06 — bundle readiness + fatigue + planned workout + PR data
// + streak în single CoachTodayOutput pentru consumer (Antrenor home).
// ZERO src/engine/* mutation per orchestrator §7. Composes existing engine
// wrapper exports (getReadiness + getFatigue + getTodayWorkout) cu state
// from workoutStore (streak + prHit).
//
// Phase 6+ wires real coachDirector instance (src/engine/coachDirector.js
// has CoachDirector class) + buildCoachContext (src/engine/coachContext.js)
// pentru engine-driven recommendations beyond simple data bundle.

import type {
  ReadinessOutput,
  FatigueOutput,
  PlannedWorkoutOutput,
} from './engineWrappers';
import {
  getReadiness,
  getFatigue,
  getTodayWorkout,
} from './engineWrappers';

export interface CoachTodayOutput {
  readiness: ReadinessOutput | null;
  fatigue: FatigueOutput | null;
  plannedWorkout: PlannedWorkoutOutput | null;
  isRestDay: boolean;
}

/**
 * Aggregate today's coach output. Phase 5 task_06 thin React-side
 * composer; Phase 6+ replaces cu real CoachDirector.run(ctx) pipeline cu
 * patterns banner (LOW_ADHERENCE / STAGNATION) + PR Wall recent + alerts.
 */
export function getCoachToday(opts: { isInCut?: boolean } = {}): CoachTodayOutput {
  const readiness = getReadiness(opts);
  const fatigue = getFatigue();
  const plannedWorkout = getTodayWorkout();
  const isRestDay = plannedWorkout === null;
  return { readiness, fatigue, plannedWorkout, isRestDay };
}
