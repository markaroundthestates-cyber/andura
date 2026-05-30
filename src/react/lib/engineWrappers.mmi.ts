// ══ ENGINE WRAPPERS — MMI Silent Auto-Cap (LOCK 10 ADR-033) ══════════════
// Hygiene split (barrel re-export, zero behavior change): the Muscle Memory
// Index silent auto-cap context build + per-exercise cap application, extracted
// verbatim from engineWrappers.ts. The instrumented getTodayWorkout adapter
// stays in engineWrappers.ts and consumes applyMmiCapToWorkout. Re-exported by
// engineWrappers.ts; public API unchanged.
//
// Per ENGINE-DEEPER-AUDIT chat 5 HIGH finding: MMI applyMuscleMemoryUpgrade
// + tests LANDED (Engine #9 LOCK 10) dar production wire vanilla orphan
// (src/main.js:259-305 post-D028 retired entry). Returning users 6+ months
// (Marius post-pause / Maria 65 long pause) primeau baseline weights ZERO
// re-resume cap protection in React production.
//
// SILENT auto-cap design (UI prompt DEFERRED Iter urmator Daniel CEO UX):
// Adapter contract requires `userChoice === 'accepted'` to apply (opt-in
// per §32.3 spec). Silent wire synthesizes `userChoice: 'accepted'` when
// pauseMonths >= 6 AND user has not explicitly refused via prior prompt.
// `userChoice === 'refused'` respected → baseline preserved (anti-paternalism).
//
// Cap buckets per ADR-033 §32.1 verbatim:
//   6-12mo  → 0.80x startMultiplier + 1.25x boost first 3 weeks
//   12-24mo → 0.70x startMultiplier + 1.10x boost first 3 weeks
//   24+mo   → 0.60x startMultiplier + 1.00x boost (start proaspat)
//
// Peak source: pr-records[].kg per exercise (max weight pre-pause). When
// exercise has no PR record → baseline preserved (no fabricated peak).
//
// NOTE: extractSessionDates + computePauseDuration helpers inlined below
// pentru minimal dep chain. Importing din src/engine/coachContext.js pulls
// heavyweight transitive chain (scheduleAdapter + patternLearning +
// autoAggressionDetection) that breaks vi.mock isolation în
// engineWrappers.sentry.test.ts. Pure semantics preserved verbatim per
// src/engine/coachContext.js:173-209 LANDED 2026-05-02 (ADR 026 §9).
import { logger } from '../../util/logger.js';
import {
  applyMuscleMemoryUpgrade,
  readMmiState,
  computeWeeksSinceResume,
} from '../../engine/muscleMemoryAdapter.js';
import { DB, tod } from '../../db.js';
import { DP } from '../../engine/dp.js';
import type { PlannedWorkoutOutput } from './engineWrappers.types';

function extractSessionDatesLocal(logs: ReadonlyArray<{ date?: string }>): string[] {
  if (!Array.isArray(logs)) return [];
  const set = new Set<string>();
  for (const l of logs) {
    if (l && typeof l.date === 'string') set.add(l.date);
  }
  return Array.from(set).sort();
}

function computePauseDurationLocal(
  sessionDates: ReadonlyArray<string>,
  currentDate: string,
): { daysSincePause: number; pauseMonths: number } {
  if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
    return { daysSincePause: 0, pauseMonths: 0 };
  }
  if (typeof currentDate !== 'string' || !currentDate) {
    return { daysSincePause: 0, pauseMonths: 0 };
  }
  let latest = '';
  for (const d of sessionDates) {
    if (typeof d === 'string' && d > latest) latest = d;
  }
  if (!latest) return { daysSincePause: 0, pauseMonths: 0 };
  const lastTime = new Date(latest).getTime();
  const currentTime = new Date(currentDate).getTime();
  if (!Number.isFinite(lastTime) || !Number.isFinite(currentTime)) {
    return { daysSincePause: 0, pauseMonths: 0 };
  }
  if (currentTime <= lastTime) return { daysSincePause: 0, pauseMonths: 0 };
  const days = Math.floor((currentTime - lastTime) / (1000 * 60 * 60 * 24));
  return { daysSincePause: days, pauseMonths: days / 30.44 };
}

interface MmiSilentContext {
  // Always 'accepted' din buildSilentMmiContext path — silent auto-opt-in
  // synthesizes accepted (refused returns null earlier; pre-prompt null
  // also synthesizes accepted). Matches muscleMemoryAdapter JSDoc shape
  // `userChoice?: string` (TS string supertype compat).
  userChoice: 'accepted';
  pauseMonths: number;
  weeksSinceResume: number;
  peakPrePauseKgPerExercise: Record<string, number>;
}

/**
 * Build MMI context for silent auto-cap. Reads DB.logs + DB.pr-records +
 * DB.mmi-state. Returns null when no cap should apply (insufficient pause,
 * user refused, no PR baseline). Silent auto-opt-in: pauseMonths >= 6 AND
 * userChoice !== 'refused' → synthesizes 'accepted' for adapter call.
 *
 * Defensive: any DB read failure → null fallback (graceful degrade to
 * baseline pipeline).
 */
function buildSilentMmiContext(): MmiSilentContext | null {
  try {
    const logs = (DB.get('logs') as Array<{ date?: string }> | null) ?? [];
    if (!Array.isArray(logs) || logs.length === 0) return null;
    const sessionDates = extractSessionDatesLocal(logs);
    const { pauseMonths } = computePauseDurationLocal(sessionDates, tod());
    if (typeof pauseMonths !== 'number' || pauseMonths < 6) return null;

    const mmiState = readMmiState(DB) as
      | { userChoice?: string; resumeStartDate?: string }
      | null;
    const userChoice = mmiState?.userChoice ?? null;
    // Respect explicit refuse per §32.3 — user opted out, baseline pipeline wins.
    if (userChoice === 'refused') return null;

    const prRecords = (DB.get('pr-records') as Array<{ ex?: string; kg?: number }> | null) ?? [];
    if (!Array.isArray(prRecords) || prRecords.length === 0) return null;
    const peakPrePauseKgPerExercise: Record<string, number> = {};
    for (const r of prRecords) {
      if (r && typeof r.ex === 'string' && typeof r.kg === 'number' && r.kg > 0) {
        // Keep max per exercise (defensive — pr-records may have multiple entries per ex).
        if (!peakPrePauseKgPerExercise[r.ex] || r.kg > peakPrePauseKgPerExercise[r.ex]!) {
          peakPrePauseKgPerExercise[r.ex] = r.kg;
        }
      }
    }
    if (Object.keys(peakPrePauseKgPerExercise).length === 0) return null;

    const weeksSinceResume = computeWeeksSinceResume(mmiState?.resumeStartDate ?? null, tod());

    return {
      // Silent auto-opt-in: synthesize 'accepted' when pause >= 6mo + NOT refused.
      // UI prompt deferred (Iter urmator) — when surfaced, user can override
      // via 'refused' which this context respects (early return above).
      userChoice: 'accepted',
      pauseMonths,
      weeksSinceResume,
      peakPrePauseKgPerExercise,
    };
  } catch (e) {
    logger.warn('[engineWrappers] buildSilentMmiContext failed:', e);
    return null;
  }
}

/**
 * Apply silent MMI cap to each planned exercise targetKg via
 * applyMuscleMemoryUpgrade adapter. Returns workout with capped weights
 * when MMI context active, otherwise returns workout unchanged.
 *
 * Per-exercise: when pr-records lacks peak for exercise → adapter returns
 * recommendation unchanged (no fabricated cap). Preserves all other fields
 * (id, name, sets, targetReps, restSec) via spread.
 */
export function applyMmiCapToWorkout(workout: PlannedWorkoutOutput): PlannedWorkoutOutput {
  const mmiContext = buildSilentMmiContext();
  if (!mmiContext) return workout;
  const cappedExercises = workout.exercises.map((ex) => {
    const recommendation = { kg: ex.targetKg };
    const capped = applyMuscleMemoryUpgrade(recommendation, ex.name, mmiContext, DP) as {
      kg: number;
      _muscleMemoryApplied?: boolean;
    };
    if (!capped || typeof capped.kg !== 'number') return ex;
    return { ...ex, targetKg: capped.kg };
  });
  return { ...workout, exercises: cappedExercises };
}
