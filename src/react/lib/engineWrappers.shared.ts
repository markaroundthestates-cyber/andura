// ══ ENGINE WRAPPERS — Shared internal helpers ════════════════════════════
// Hygiene split (zero behavior change): the small NON-adapter helpers shared by
// several instrumented adapters in engineWrappers.ts, extracted verbatim. These
// carry NO `captureException` instrumentation (they are not engine-adapter-
// fallback boundaries) so they live OUTSIDE engineWrappers.ts — keeping the
// anti-drift gate (assert_all_adapters_instrumented) scanning only the
// instrumented adapter file. Imported back by engineWrappers.ts; the adapters
// (and thus the public API) are unchanged.
import { DB } from '../../db.js';

/**
 * Flatten workoutStore sessionsHistory → engine logs shape {ex, ts, w, reps}.
 * Shared helper extracted from 3x duplication (getPatternsBanner STAGNATION +
 * getCoachRestReason + getLaggingSignal) per code review nuclear chat 5 HIGH-4
 * DRY fix. Drift risk eliminated: single canonical mapping for engine consumers
 * (detectGlobalStagnation / getRecoveryByGroup / detectWeakGroups).
 *
 * Defensive: session.exercises optional (backward compat pre-Phase-5-task-03
 * persisted sessions fără breakdown). Skips sessions cu exercises absent.
 */
export function flattenSessionsToEngineLogs(
  sessions: ReadonlyArray<{ exercises?: ReadonlyArray<{ exerciseName: string; sets: ReadonlyArray<{ kg: number; reps: number; timestamp: number }> }> }>,
): Array<{ ex: string; ts: number; w: number; reps: number }> {
  const logs: Array<{ ex: string; ts: number; w: number; reps: number }> = [];
  for (const session of sessions) {
    if (!session.exercises) continue;
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        logs.push({
          ex: ex.exerciseName,
          ts: set.timestamp,
          w: set.kg,
          reps: set.reps,
        });
      }
    }
  }
  return logs;
}

/**
 * Phase 4 task_18: enrich engine detectPR output cu 1RM estimate (Epley
 * formula `kg * (1 + reps/30)`) + deltaKg + deltaPct fields. Pure function
 * augment — engine logic unchanged. Backward compat consumers that read only
 * type/kg/reps/prevBest (existing fields preserved).
 *
 * Epley chosen vs Brzycki: Epley simpler closed-form, well-known în
 * fitness apps, accurate la 1-15 rep range typical training context.
 * Brzycki alternative `kg * 36 / (37 - reps)` deferred Phase 5+ daca
 * needed cross-formula calibration.
 */
export function estimateOneRM(kg: number, reps: number): number {
  if (kg <= 0 || reps <= 0) return 0;
  return Math.round(kg * (1 + reps / 30) * 10) / 10; // 1 decimal precision
}

// Pain CDL read (ADR-ENGINE-MATH-LOCKED-VALUES section 9, item 43-H2). I/O
// boundary: read the append-only pain CDL persisted by PainButton
// (DB('pain-cdl')) so getRecoveryByGroup can escalate the recovery state of a
// muscle group with a recently-reported pain region. Engine core stays pure —
// the data is passed in as an argument. Soft-fail -> undefined (recovery falls
// back to log-only state, conservative baseline).
const PAIN_CDL_KEY = 'pain-cdl';

interface PainCdlEntry {
  type?: string;
  region?: string;
  intensity?: 1 | 2 | 3;
  ts?: number;
}

export function readPainCdl(): PainCdlEntry[] | undefined {
  try {
    return (DB.get(PAIN_CDL_KEY) as PainCdlEntry[] | null) ?? undefined;
  } catch {
    return undefined;
  }
}
