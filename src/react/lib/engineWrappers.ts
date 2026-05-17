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

// Phase 4 task_11 §A — JS engine modules acum tipate via sibling .d.ts files
// (src/engine/readiness.d.ts / fatigue.d.ts / prEngine.d.ts). TS rezolva
// .d.ts înainte de .js inference; @ts-expect-error directives no longer
// needed.
import { getReadinessVerdict, getComputedReadinessScore } from '../../engine/readiness.js';
import { calculateFatigueScore } from '../../engine/fatigue.js';
import { detectPR } from '../../engine/prEngine.js';
import { composePlannedWorkoutToday } from './scheduleAdapterAggregate';

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
  // Phase 4 task_18: enriched fields pentru PostSummary banner visual
  // extension Phase 5+ (task_22 dependency).
  deltaKg: number; // newKg - prevBest.w (0 cand prevBest null = first ever set)
  deltaPct: number; // (newKg - prev) / prev * 100 (0 cand prevBest null)
  oneRMEstimate: number; // Epley estimate: kg * (1 + reps/30)
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
    // Phase 4 task_11 §A: ?? '' fallback pentru raw.key/icon undefined în
    // early-return shape (DATE INSUFICIENTE path în src/engine/fatigue.js
    // line 20 returns 5-field shape without key/icon). FatigueOutput.key/
    // icon contract = string non-optional; fallback defends invariant.
    return {
      score: raw.score,
      key: raw.key ?? '',
      label: raw.label,
      icon: raw.icon ?? '',
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
function estimateOneRM(kg: number, reps: number): number {
  if (kg <= 0 || reps <= 0) return 0;
  return Math.round(kg * (1 + reps / 30) * 10) / 10; // 1 decimal precision
}

export function getPRDelta(
  exercise: string,
  set: PRSet,
  history: PRHistoryEntry[]
): PRDelta | null {
  try {
    const raw = detectPR(exercise, set, history);
    if (!raw) return null;
    const prevKg = raw.prevBest?.w ?? 0;
    const deltaKg = raw.kg - prevKg;
    const deltaPct = prevKg > 0 ? (deltaKg / prevKg) * 100 : 0;
    return {
      type: raw.type,
      kg: raw.kg,
      reps: raw.reps,
      prevBest: raw.prevBest,
      deltaKg: Math.round(deltaKg * 10) / 10,
      deltaPct: Math.round(deltaPct * 10) / 10,
      oneRMEstimate: estimateOneRM(raw.kg, raw.reps),
    };
  } catch (e) {
    console.warn('[engineWrappers] getPRDelta failed:', e);
    return null;
  }
}

/**
 * Today planned workout fetch — Phase 5 task_05 delegates la
 * scheduleAdapterAggregate.composePlannedWorkoutToday() pentru real
 * engine integration (calendar rest day check + missing equipment filter
 * applied via src/engine/schedule/scheduleAdapter exports). Exercise
 * template Phase 5 stub PHASE_5_BASELINE_PUSH în adapter; Phase 6+ wires
 * Periodization + Goal Template + Specialization + Warmup + Deload
 * compose pipeline.
 *
 * Returns null cand calendar rest day sau engine throws (fail-silent).
 */
export function getTodayWorkout(): PlannedWorkoutOutput | null {
  try {
    return composePlannedWorkoutToday();
  } catch (e) {
    console.warn('[engineWrappers] getTodayWorkout failed:', e);
    return null;
  }
}
