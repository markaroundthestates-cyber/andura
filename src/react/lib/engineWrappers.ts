// ══ ENGINE WRAPPERS — Pure-Function Adapters src/engine/* ═════════════════
// Per ADR 026 §9 pure-function paradigm + DECISIONS.md §D015 React migration.
// Backend layer (src/engine/*) preserves test coverage 3743+ PASS invariant.
// React side imports via these wrappers cu types + simplified interface + try/
// catch safe fallback (NU bloochează render daca engine throws).
//
// IMPORTANT: Underlying engines (readiness, fatigue, prEngine) read DB module
// (localStorage). Wrappers NU pure-function strict — sunt safe-fallback
// adapters. React caller responsible pentru side-effect ordering (e.g. invoke
// din useEffect or store action, NU în render body).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-017 Bayesian Nutrition Inference
//   - DECISIONS.md §D-LEGACY-027 Engine Energy Adjustment
//   - DECISIONS.md §D-LEGACY-076 Calendar Feature V1 scheduleAdapter
//   - DECISIONS.md §D-LEGACY-098 LOCK 10 MMI Engine #9

// @ts-expect-error — JS engine modules NU au .d.ts (implicit any acceptable la boundary)
import { getReadinessVerdict, getComputedReadinessScore } from '../../engine/readiness.js';
// @ts-expect-error — JS engine module
import { calculateFatigueScore } from '../../engine/fatigue.js';
// @ts-expect-error — JS engine module
import { detectPR } from '../../engine/prEngine.js';

// ── Output types simplified pentru React consumption ─────────────────────

export interface ReadinessOutput {
  score: number;
  label: string;
  color: string; // CSS var ref
  volumeMultiplier: number;
  canPR: boolean;
}

export interface FatigueOutput {
  score: number; // 0-100
  key: 'HIGH_FATIGUE' | 'MODERATE_FATIGUE' | 'PEAK_FORM' | 'NORMAL' | string;
  label: string;
  icon: string;
  color: string;
  recommend: 'deload' | 'reduce' | 'push' | 'normal' | 'none' | string;
  detail: string;
}

export interface PRSet {
  w: number;
  reps: number;
}

export interface PRHistoryEntry {
  ex?: string;
  w?: number;
  reps?: number;
  baseline?: boolean;
}

export interface PRDelta {
  type: 'weight' | 'reps' | 'volume';
  kg: number;
  reps: number;
  prevBest: PRHistoryEntry | null;
}

export interface PlannedExercise {
  id: string;
  name: string;
  sets: number;
  targetReps: number;
  targetKg: number;
  restSec: number;
}

export interface PlannedWorkoutOutput {
  workoutTitle: string;
  exerciseCount: number;
  estimatedDuration: number; // minutes
  intensityMod: 'plus' | 'normal' | 'minus';
  exercises: PlannedExercise[]; // Phase 4 task_10 — rich aggregate Workout/WorkoutPreview consume
  volumeKg: number; // Phase 4 task_10 — estimated total tonnage planned
}

// ── Wrappers cu try/catch fallback safe ──────────────────────────────────

/**
 * Compute today readiness verdict from DB-stored readiness input + nutrition
 * yesterday vs targets. Returns null daca readiness NU loged azi sau engine
 * throws (e.g. DB unavailable în SSR).
 *
 * Engine deps: src/engine/readiness.js#getComputedReadinessScore +
 * getReadinessVerdict. Engine reads DB.get('readiness'/'kcals'/'prots').
 */
export function getReadiness(opts: { isInCut?: boolean } = {}): ReadinessOutput | null {
  try {
    const score = getComputedReadinessScore();
    if (score == null) return null;
    const verdict = getReadinessVerdict(score, opts);
    if (!verdict || verdict.label == null) return null;
    return {
      score,
      label: verdict.label,
      color: verdict.color,
      volumeMultiplier: verdict.volumeMultiplier,
      canPR: verdict.canPR,
    };
  } catch (e) {
    console.warn('[engineWrappers] getReadiness failed:', e);
    return null;
  }
}

/**
 * Compute fatigue score din ultimele 4 sesiuni. Returns null daca engine
 * throws. Score=0 + label='DATE INSUFICIENTE' valid output daca <2 sesiuni
 * logged (engine semantics).
 *
 * Engine dep: src/engine/fatigue.js#calculateFatigueScore. Reads DB.get(
 * 'logs'/'wellbeing').
 */
export function getFatigue(): FatigueOutput | null {
  try {
    const raw = calculateFatigueScore();
    if (!raw) return null;
    return {
      score: raw.score,
      key: raw.key,
      label: raw.label,
      icon: raw.icon,
      color: raw.color,
      recommend: raw.recommend,
      detail: raw.detail,
    };
  } catch (e) {
    console.warn('[engineWrappers] getFatigue failed:', e);
    return null;
  }
}

/**
 * Detect PR pentru un set logged. Returns null daca set NU este PR sau
 * engine throws. Per src/engine/prEngine.js: 3 PR types — weight / reps /
 * volume; baseline entries excluded.
 *
 * Engine dep: src/engine/prEngine.js#detectPR.
 */
export function getPRDelta(
  exercise: string,
  set: PRSet,
  history: PRHistoryEntry[]
): PRDelta | null {
  try {
    return detectPR(exercise, set, history) ?? null;
  } catch (e) {
    console.warn('[engineWrappers] getPRDelta failed:', e);
    return null;
  }
}

// Phase 4 task_10 demo seed — Push session matching mockup wv2 reference.
// Phase 5+ replaces cu real scheduleAdapter aggregate (getTodayPlannedWorkout
// or sessionBuilder layer) când scheduleAdapter exposes planned-workout
// aggregate api (currently exposes override + missing equipment + skip only).
const PHASE_4_DEMO_PUSH: PlannedWorkoutOutput = {
  workoutTitle: 'Push (piept si umeri)',
  exerciseCount: 5,
  estimatedDuration: 50,
  intensityMod: 'normal',
  volumeKg: 12450,
  exercises: [
    { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
    { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
    { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
    { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
  ],
};

/**
 * Today planned workout fetch — Phase 4 task_10 returns demo Push session;
 * Phase 5+ wires real scheduleAdapter aggregate când exposes planned-workout
 * api. Phase 4 consumers (Workout / WorkoutPreview / PostRpe / PostSummary)
 * derive title + exercises + duration + volume direct din result.
 *
 * Returns null doar daca explicit error (caller pattern matches existing
 * fail-silent wrappers like getReadiness). Phase 4 stub never null.
 */
export function getTodayWorkout(): PlannedWorkoutOutput | null {
  try {
    return PHASE_4_DEMO_PUSH;
  } catch (e) {
    console.warn('[engineWrappers] getTodayWorkout failed:', e);
    return null;
  }
}
