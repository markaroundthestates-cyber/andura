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
import { evaluate as evaluateBN } from '../../engine/bayesianNutrition/index.js';
import { detectGlobalStagnation } from '../../engine/stagnationDetector.js';
import { getAdherenceScore } from '../../engine/adherence.js';
import { runProactiveChecks } from '../../engine/proactiveEngine.js';
import { useWorkoutStore } from '../stores/workoutStore';
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
 * Today planned workout fetch — Phase 6 task_02 Option C async signature
 * per DECISIONS.md §D027. Delegates la scheduleAdapterAggregate.
 * composePlannedWorkoutToday() async care invoca getDailyWorkout(userState,
 * now) real pipeline (runPipeline 8-adapter chain + sessionBuilder delegate).
 *
 * Consumers (SessionPill / Workout / WorkoutPreview / PostRpe /
 * coachDirectorAggregate) MUST use useState + useEffect loading pattern,
 * NU sync render-time invocation.
 *
 * Returns null cand calendar rest day OR pipeline hard halt OR engine
 * throws (fail-silent).
 */
export async function getTodayWorkout(): Promise<PlannedWorkoutOutput | null> {
  try {
    return await composePlannedWorkoutToday();
  } catch (e) {
    console.warn('[engineWrappers] getTodayWorkout failed:', e);
    return null;
  }
}

// ── Bayesian Nutrition wrapper (Phase 6 task_03) ────────────────────────
//
// Anti-recurrence engine API verify (sketch corrected inline per Daniel
// 2026-05-18 directive): BN engine emits `meta.nutrition_inference_metadata.
// posterior.mu` as TDEE kcal point estimate (Kalman filter posterior mean) +
// `confidence` enum ('low'|'medium'|'high'). NU emite macros (protein/fat/
// carbs) — those derive în React-side aggregate task_04 din kcal + standard
// macro split heuristic (e.g. 30/30/40). Sketch §B `kcal_target` /
// `protein_target_g` / `fat_g` / `carbs_g` fields = inventate. Corecție:
// kcalTarget din posterior.mu cu LOCK 8 floor 1200, macros = baseline V1.

export interface NutritionTargetsEngine {
  kcalTarget: number;
  proteinTargetG: number;
  fatG: number;
  carbsG: number;
  source: 'engine' | 'baseline';
  confidence: number; // 0-1
}

const BASELINE_NUTRITION: NutritionTargetsEngine = {
  kcalTarget: 2640,    // mockup verbatim L1812
  proteinTargetG: 180, // mockup verbatim L1825
  fatG: 70,
  carbsG: 280,
  source: 'baseline',
  confidence: 0,
};

const KCAL_FLOOR_DAILY_MIN = 1200; // LOCK 8 D-LEGACY-041 floor invariant

function mapBNConfidence(c: unknown): number {
  if (c === 'high') return 1;
  if (c === 'medium') return 0.5;
  return 0.2;
}

/**
 * Real wire Bayesian Nutrition Engine adaptive TDEE per Kalman posterior.
 * LOCK 8 floor 1200 invariant preserved (Math.max guard) per DECISIONS
 * §D-LEGACY-041 observation filter NU adjustment.
 *
 * Engine emits doar kcal estimate (posterior.mu); protein/fat/carbs targets
 * V1 = baseline preserved (engine domain NU acoperă macro split).
 *
 * Returns baseline fallback dacă engine throws sau tier 'none' (T0 fresh
 * user pre-observation).
 */
export async function getNutritionTargetsToday(
  userState?: object,
): Promise<NutritionTargetsEngine> {
  try {
    // §1-M1 audit fix: bayesianNutrition.d.ts sibling declares BayesianNutritionContext +
    // BayesianNutritionResult shapes; `as any` cast removed (Phase 4 task_11 §A pattern).
    const ctx = (userState ?? {}) as Parameters<typeof evaluateBN>[0];
    const result = await evaluateBN(ctx);
    if (!result || result.tier === 'none') return BASELINE_NUTRITION;
    const mu = result.meta?.nutrition_inference_metadata?.posterior?.mu;
    if (!Number.isFinite(mu)) return BASELINE_NUTRITION;
    const safeKcal = Math.max(mu as number, KCAL_FLOOR_DAILY_MIN);
    return {
      kcalTarget: Math.round(safeKcal),
      proteinTargetG: BASELINE_NUTRITION.proteinTargetG,
      fatG: BASELINE_NUTRITION.fatG,
      carbsG: BASELINE_NUTRITION.carbsG,
      source: 'engine',
      confidence: mapBNConfidence(result.confidence),
    };
  } catch (e) {
    console.warn('[engineWrappers] getNutritionTargetsToday failed:', e);
    return BASELINE_NUTRITION;
  }
}

// ── Adherence Engine wrapper (Phase 6 task_08) ──────────────────────────
//
// Anti-recurrence engine API verify (sketch v1 fabricated):
// - Sketch invented `computeAdherenceScore(userState)` plain-number return —
//   real export este `getAdherenceScore()` (sync, ZERO args, DB-backed via
//   DB.get + coachDecisionLog.readActiveForDate today).
// - Return shape este `{score: number 0-100, color: string, label: string}` —
//   NU plain number.
// - Score combination: +25 kcal logged + +25 protein>=150 + +30 workout
//   compliance (CDL primary / logs fallback) + +20 weight logged.

export interface AdherenceOutput {
  score: number; // 0-100 clamped invariant
  source: 'engine' | 'baseline';
}

const BASELINE_ADHERENCE_OUTPUT: AdherenceOutput = {
  score: 50,
  source: 'baseline',
};

/**
 * Real wire Adherence Engine. Returns score 0-100 din 4 components
 * (kcal + protein>=150 + workout compliance + weight). Engine reads DB
 * localStorage direct + CDL — caller-side ctx NU needed.
 *
 * Defensive: typeof score check + clamp 0-100 + baseline fallback când
 * engine throws (DB unavailable în SSR sau test env fără localStorage mock).
 */
export function getAdherenceOutput(): AdherenceOutput {
  try {
    const raw = getAdherenceScore();
    if (!raw || typeof raw !== 'object' || typeof (raw as { score?: unknown }).score !== 'number') {
      return BASELINE_ADHERENCE_OUTPUT;
    }
    const rawScore = (raw as { score: number }).score;
    const safeScore = Math.max(0, Math.min(100, rawScore));
    return { score: safeScore, source: 'engine' };
  } catch (e) {
    console.warn('[engineWrappers] getAdherenceOutput failed:', e);
    return BASELINE_ADHERENCE_OUTPUT;
  }
}

// ── Patterns Banner + Proactive Alerts composers (Phase 6 task_05) ──────
//
// Option B Bugatti per Daniel "quality over speed" 2026-05-18 — composer
// React-side pure-function engines direct (stagnationDetector + adherence
// + proactiveEngine) NU CoachDirector.buildSession heavyweight side-effects
// (CDL write + Sentry capture + Auto-backup). Anti-recurrence task_05 §1:
// CoachDirector class method este `.buildSession(sessionType)` NU `.run`,
// return shape NU emite top-level `{patternsBanner, prWallRecent, alerts}`.

export interface PatternBanner {
  id: 'LOW_ADHERENCE' | 'STAGNATION';
  severity: 'info' | 'warn';
  text: string; // RO wording NO_DIACRITICS_RULE
}

const STAGNATION_WEEKS_THRESHOLD = 2; // 2+ consecutive weeks → banner
const LOW_ADHERENCE_THRESHOLD = 50;   // adherence < 50 → banner

/**
 * Composer Option B Bugatti — patterns banner via pure-function engines
 * direct (stagnationDetector.detectGlobalStagnation + adherence.
 * getAdherenceScore). ZERO side-effects.
 *
 * 2 patterns V1 LOCK per PRIMER §2 MODIFY simplified: LOW_ADHERENCE +
 * STAGNATION (3 V2-deferred paranoid drop).
 *
 * Defensive: engine throws → empty array fallback graceful.
 */
export function getPatternsBanner(): PatternBanner[] {
  const banners: PatternBanner[] = [];

  // Pattern 1: STAGNATION via stagnationDetector
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    // Flatten sessions.exercises.sets → logs shape {ex, ts, w, reps}
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
    const stag = detectGlobalStagnation(logs);
    if (stag && stag.maxStagnationWeeks >= STAGNATION_WEEKS_THRESHOLD) {
      banners.push({
        id: 'STAGNATION',
        severity: 'warn',
        text: `Stagnare ${stag.maxStagnationWeeks} saptamani. Coach ajusteaza intensitatea.`,
      });
    }
  } catch (e) {
    console.warn('[engineWrappers] getPatternsBanner STAGNATION failed:', e);
  }

  // Pattern 2: LOW_ADHERENCE via adherence engine
  try {
    const adherence = getAdherenceScore();
    // Engine returns {score, color, label}; defensive number-only legacy fallback
    const score = typeof adherence === 'object' && adherence !== null
      ? (adherence as { score?: number }).score
      : (typeof adherence === 'number' ? adherence : null);
    if (typeof score === 'number' && score < LOW_ADHERENCE_THRESHOLD) {
      banners.push({
        id: 'LOW_ADHERENCE',
        severity: 'info',
        text: 'Adherenta scazuta saptamana asta. Reia ritmul cu o sesiune scurta.',
      });
    }
  } catch (e) {
    console.warn('[engineWrappers] getPatternsBanner LOW_ADHERENCE failed:', e);
  }

  return banners;
}

// ── Proactive Alerts wrapper ────────────────────────────────────────────

export interface ProactiveAlert {
  id: string;
  text: string;
  severity: 'info' | 'warn' | 'urgent';
}

const SEVERITY_MAP: Record<string, ProactiveAlert['severity']> = {
  warning: 'warn',
  info: 'info',
  success: 'info', // success collapses to info în UI (NU urgent)
};

/**
 * Wraps runProactiveChecks. Reads ctx din DB-backed localStorage direct
 * (engine internal uses DB.get pattern). Phase 6 V1: pass empty {} → engine
 * reads DB defensive via tod()/todDate() internals OR caller passes
 * pre-built ctx (e.g. coach context aggregate).
 *
 * Returns mapped UI shape (severity normalize 3-tier). Defensive try/catch
 * graceful empty array fallback per orchestrator §7.
 */
export function getProactiveAlerts(ctx: object = {}): ProactiveAlert[] {
  try {
    const raw = runProactiveChecks(ctx);
    if (!Array.isArray(raw)) return [];
    return raw.map((alert, idx) => ({
      id: `${alert?.type ?? 'unknown'}_${idx}`,
      text: alert?.message ?? '',
      severity: SEVERITY_MAP[alert?.severity] ?? 'info',
    }));
  } catch (e) {
    console.warn('[engineWrappers] getProactiveAlerts failed:', e);
    return [];
  }
}
