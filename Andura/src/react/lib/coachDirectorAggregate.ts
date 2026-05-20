// ══ COACH DIRECTOR AGGREGATE — Phase 6 Option B Composer Enrich ═══════════
// Per Daniel CEO "quality over speed" 2026-05-18 → Option B Bugatti composer
// React-side pure-function engines direct (stagnationDetector + adherence +
// proactiveEngine + prHistoryAggregate) NU CoachDirector.buildSession
// heavyweight side-effects (CDL write + Sentry capture + Auto-backup).
//
// Phase 5 task_06 thin 4-field bundle (readiness + fatigue + plannedWorkout +
// isRestDay) enriched cu 4 NEW fields composer:
//   - patternsBanner V1 LOCK 2 patterns (STAGNATION + LOW_ADHERENCE)
//   - prWallRecent slice top 3 sorted desc din getPRHistoryAll
//   - alerts via getProactiveAlerts severity 3-tier
//   - source 'engine'|'baseline' aggregate flag
//
// Async signature ALIGNED cu task_02 D027 Option C cascade (await
// getTodayWorkout).

import type {
  ReadinessOutput,
  FatigueOutput,
  PlannedWorkoutOutput,
  PatternBanner,
  ProactiveAlert,
} from './engineWrappers';
import {
  getReadiness,
  getFatigue,
  getTodayWorkout,
  getPatternsBanner,
  getProactiveAlerts,
} from './engineWrappers';
import { getPRHistoryAll } from './prHistoryAggregate';
import type { PRRecord } from './prHistoryAggregate';

const PR_WALL_RECENT_LIMIT = 3; // top 3 most recent PRs per Antrenor home

export interface CoachTodayOutput {
  readiness: ReadinessOutput | null;
  fatigue: FatigueOutput | null;
  plannedWorkout: PlannedWorkoutOutput | null;
  isRestDay: boolean;
  patternsBanner: PatternBanner[];
  prWallRecent: PRRecord[];
  alerts: ProactiveAlert[];
  source: 'engine' | 'baseline';
}

/**
 * Phase 6 Option B enrich aggregate per DECISIONS.md §D027. Composes
 * task_02 async planned workout + task_05 sync composer outputs (patterns +
 * alerts) + Phase 5 task_11 PR history slice top 3.
 *
 * `source` flag: 'engine' cand orice composer returns non-empty signal;
 * 'baseline' cand all composers empty (T0 fresh user pre-data).
 */
export async function getCoachToday(
  opts: { isInCut?: boolean } = {},
): Promise<CoachTodayOutput> {
  const readiness = getReadiness(opts);
  const fatigue = getFatigue();
  const plannedWorkout = await getTodayWorkout();
  const isRestDay = plannedWorkout === null;
  const patternsBanner = getPatternsBanner();
  const allPRs = getPRHistoryAll();
  // getPRHistoryAll already sorts reverse-chrono — defensive re-sort + slice
  const prWallRecent = allPRs
    .slice()
    .sort((a, b) => b.sessionTs - a.sessionTs)
    .slice(0, PR_WALL_RECENT_LIMIT);
  const alerts = getProactiveAlerts({});
  const hasEngineData =
    readiness !== null ||
    fatigue !== null ||
    plannedWorkout !== null ||
    patternsBanner.length > 0 ||
    prWallRecent.length > 0 ||
    alerts.length > 0;
  return {
    readiness,
    fatigue,
    plannedWorkout,
    isRestDay,
    patternsBanner,
    prWallRecent,
    alerts,
    source: hasEngineData ? 'engine' : 'baseline',
  };
}
