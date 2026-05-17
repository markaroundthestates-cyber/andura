// ══ SCHEDULE ADAPTER AGGREGATE — React-side Pure-Function Composer ═══════
// Phase 5 task_05 — UI-side aggregate composer pentru planned workout.
// Composes real engine calls available (scheduleAdapter.getCalendarOverride
// + getMissingEquipment + mapDateToIndex) cu PHASE_4_DEMO_PUSH baseline
// pentru exercise template. ZERO mutation src/engine/* per ADR 026 §9 +
// orchestrator §7 invariant.
//
// Phase 6+ replaces PHASE_4_DEMO_PUSH cu real Periodization Engine #1 +
// Goal Template lookup + Specialization Engine #6 priorities + Warmup
// Engine #7 prefix + Deload Engine #8 week-4 trigger când engine API
// exposes React-friendly surfaces.
//
// Current composition steps (Phase 5 task_05):
//   1. mapDateToIndex → dayIdx 0-6 (L Ma Mi J V S D)
//   2. getCalendarOverride → rest day check; null → return null (rest day)
//   3. baseExercises din PHASE_4_DEMO_PUSH (Phase 5 stub)
//   4. getMissingEquipment filter — exclude exercises requiring missing eq
//      (best-effort name match — Phase 6+ uses real equipment metadata)
//   5. Compose PlannedWorkoutOutput

import { mapDateToIndex, getCalendarOverride, getMissingEquipment } from '../../engine/schedule/scheduleAdapter.js';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';

// Phase 5 stub baseline — Phase 6+ replaces cu Periodization + Goal Template
// + Specialization engine compose pipeline.
const PHASE_5_BASELINE_PUSH: readonly PlannedExercise[] = [
  { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
  { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
  { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
  { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
];

// Best-effort equipment exclusion — Phase 6+ uses real equipment metadata
// per exercise (exercise.requiredEquipment[]). Phase 5 fallback: simple
// substring match exercise.name vs missing list.
function exerciseUsesEquipment(
  exercise: PlannedExercise,
  missingEqIds: readonly string[]
): boolean {
  const nameLower = exercise.name.toLowerCase();
  return missingEqIds.some((eqId) => {
    const eqLower = eqId.toLowerCase();
    return nameLower.includes(eqLower);
  });
}

// Baseline Phase 5 stub values matching mockup wv2 reference Push session.
// Phase 6+ engine wire replaces cu real Periodization output cu live
// duration/volume estimates per actual mesocycle phase + spec config.
const BASELINE_DURATION_MIN = 50;
const BASELINE_VOLUME_KG = 12450;

/**
 * Phase 5 task_05: aggregate composer. Calendar rest day check + missing
 * equipment filter applied real prin scheduleAdapter engine calls; exercise
 * template din PHASE_5_BASELINE_PUSH stub Phase 6+ replace.
 *
 * Returns null cand calendar rest day (consumer renders empty state).
 */
export function composePlannedWorkoutToday(now: Date = new Date()): PlannedWorkoutOutput | null {
  try {
    const dayIdx = mapDateToIndex(now);
    const override = getCalendarOverride(now);
    // Daca calendar override prezent + dayIdx valid + ziua = 'rest' → rest day.
    if (override !== null && override[dayIdx] === 'rest') {
      return null;
    }

    const missingEqIds = getMissingEquipment();
    const filtered = PHASE_5_BASELINE_PUSH.filter(
      (ex) => !exerciseUsesEquipment(ex, missingEqIds)
    );

    return {
      workoutTitle: 'Push (piept si umeri)',
      exerciseCount: filtered.length,
      estimatedDuration: BASELINE_DURATION_MIN,
      intensityMod: 'normal',
      exercises: filtered.slice(),
      volumeKg: BASELINE_VOLUME_KG,
    };
  } catch (e) {
    console.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
