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
import { whySummary } from '../../engine/whyEngine.js';
import { evaluate as evaluateBN } from '../../engine/bayesianNutrition/index.js';
import type { BayesianNutritionContext } from '../../engine/bayesianNutrition/index';
import { detectGlobalStagnation } from '../../engine/stagnationDetector.js';
import { getAdherenceScore } from '../../engine/adherence.js';
import { runProactiveChecks } from '../../engine/proactiveEngine.js';
import {
  getRecoveryByGroup,
  daysSinceGroup,
  GROUP_LABELS_RO_BIG11,
} from '../../engine/muscleRecovery.js';
import { detectWeakGroups } from '../../engine/weaknessDetector.js';
import {
  applyMuscleMemoryUpgrade,
  readMmiState,
  computeWeeksSinceResume,
} from '../../engine/muscleMemoryAdapter.js';
import { DB, tod } from '../../db.js';
import { DP } from '../../engine/dp.js';
import { useWorkoutStore } from '../stores/workoutStore';
import { composePlannedWorkoutToday } from './scheduleAdapterAggregate';
// Piesa 1 nutrition-brain fix — real per-user maintenance TDEE base (omoara
// baza flat 2640). Multiplicatorul de faza se aplica pe TDEE-ul real per-user.
import {
  readUserMaintenanceTDEE,
  readUserWeightKg,
  computeProteinTargetG,
  readOnboardingGoal,
} from './userTdee';
// §48-H1 audit fix — adapter integrity instrumentation. Every catch path
// emits Sentry alert with source='engine-adapter-fallback' tag + adapter
// name extra. Risk addressed (§48.5): silent divergence when engine returns
// malformed shape → adapter swallows + returns null/baseline → UI shows
// stale defaults forever. Sentry alert breaks the silence in production;
// localhost no-ops via initSentry hostname gate. Cross-ref §13-C1 Sentry
// wire (ErrorBoundary precedent) + ADR-ENGINE-MATH-LOCKED-VALUES §1-§5.
import { captureException } from '../../util/sentry.js';

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
  // Romanian display subtitle (equipment/setup, e.g. "Cu gantere · banc 30°").
  // Optional — applied at the scheduleAdapterAggregate boundary via
  // exerciseDisplay.toExerciseDisplay; absent for unknown engine names.
  sub?: string;
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
  // F-workout-preview/T1 — Engine Warm-up §9.7 blueprint surface (duration_min +
  // ui_label "Incalzire ~X min"). Null cand engine emits insufficient ctx OR
  // warmup blueprint absent (rest day / pipeline halt → composer returns null
  // entire output; never reaches this field). Consumer WorkoutPreview renders
  // warmup row only when non-null per mockup andura-clasic.html#L935 FIX 1.
  warmup?: { line: string; durationMin: number } | null;
}

// ── Shared helpers ───────────────────────────────────────────────────────

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
function flattenSessionsToEngineLogs(
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
    // Cold-start honesty: 'Zi de PR'/canPR DOAR cand user are istoric de
    // antrenament. Un user fresh care a dat doar energy-check (readiness=3 →
    // score 85) NU vede 'Zi de PR' — n-are nimic de batut. Mirror fatigue.js
    // 'DATE INSUFICIENTE' gate. sessionsHistory.length === 0 → hasHistory=false.
    const hasHistory = useWorkoutStore.getState().sessionsHistory.length > 0;
    const verdict = getReadinessVerdict(score, { ...opts, hasHistory });
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
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getReadiness' },
    });
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
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getFatigue' },
    });
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
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getPRDelta' },
      extra: { exercise },
    });
    return null;
  }
}

// ── Why-Exercise explainer wrapper (§F-workout-05 audit fix) ─────────────
//
// Wires the in-workout "why this exercise?" help-circle (mockup openWhyExercise
// andura-clasic.html#L1449) to src/engine/whyEngine.js#whySummary. The engine
// emits a single categorical RO sentence (verdict-based: progression_up/down /
// hold / recovery), ZERO leak markers / numerice per its v2 lock. Mirrors the
// vanilla src/pages/coach/modals.js#showWhyForExercise context build but kept
// minimal: readiness score (recovery verdict gate) + recommendation kg vs
// lastWeight (progression direction). Returns null cand engine throws — caller
// renders the why.unavailable i18n fallback.

export interface WhyExerciseInput {
  name: string;
  recommendationKg: number;
  lastWeightKg?: number | null;
}

export function getWhyExerciseSummary(input: WhyExerciseInput): string | null {
  try {
    const score = getComputedReadinessScore();
    const exercise = {
      name: input.name,
      recommendation: {
        kg: input.recommendationKg,
        lastWeight: input.lastWeightKg ?? null,
      },
    };
    const ctx = { readiness: { score } };
    const summary = whySummary(exercise, ctx);
    return typeof summary === 'string' && summary.length > 0 ? summary : null;
  } catch (e) {
    console.warn('[engineWrappers] getWhyExerciseSummary failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getWhyExerciseSummary' },
      extra: { exercise: input.name },
    });
    return null;
  }
}

// ── MMI Silent Auto-Cap (LOCK 10 ADR-033 React production wire) ──────────
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
    console.warn('[engineWrappers] buildSilentMmiContext failed:', e);
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

/**
 * Today planned workout fetch — Phase 6 task_02 Option C async signature
 * per DECISIONS.md §D027. Delegates la scheduleAdapterAggregate.
 * composePlannedWorkoutToday() async care invoca getDailyWorkout(userState,
 * now) real pipeline (runPipeline 8-adapter chain + sessionBuilder delegate).
 *
 * Post-pipeline applies SILENT MMI cap pentru returning users 6+ months
 * (LOCK 10 ADR-033 wire — Marius post-pause / Maria 65 long pause re-resume
 * protection). UI prompt deferred Iter urmator Daniel CEO UX decision;
 * baseline pipeline preserved when user has explicitly refused.
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
    const planned = await composePlannedWorkoutToday();
    if (planned === null) return null;
    return applyMmiCapToWorkout(planned);
  } catch (e) {
    console.warn('[engineWrappers] getTodayWorkout failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getTodayWorkout' },
    });
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
 * Piesa 1 nutrition-brain fix — per-user nutrition baseline cand engine NU emite
 * estimare (tier 'none' T0 fresh / posterior.mu absent / engine throws).
 *
 * Omoara baza flat 2640: kcalTarget = TDEE-ul REAL per-user (mentenanta) cand
 * override de faza absent, sau TDEE × multiplicator de faza cand override
 * prezent. proteinTarget = g/kg × greutate per-user. Maria 40kg mentenanta →
 * ~1300-1500; Marius 110kg/2m bulk → ~3500-4000.
 *
 * Pure I/O-boundary read (onboardingStore) + delegare la userTdee pure helpers.
 * Fallback la BASELINE_NUTRITION flat DOAR cand stats onboarding absente
 * (cold start fara onboarding) — ultim resort, NU default.
 *
 * @param phaseKcal kcal-ul derivat din override-ul de faza (deja TDEE-real ×
 *   multiplicator via getPhaseOverrideKcalToday), sau null cand AUTO/absent.
 */
function buildPerUserBaseline(phaseKcal: number | null): NutritionTargetsEngine {
  const tdee = readUserMaintenanceTDEE();
  // Stats onboarding absente (cold start) → fallback flat 2640 ultim resort.
  if (tdee === null && phaseKcal === null) return BASELINE_NUTRITION;

  // kcal precedence: override manual faza (TDEE×mult) > goal onboarding
  // (TDEE×goalMult) > mentenanta (TDEE real). goalMult null cand AUTO/absent.
  const goalMult = getGoalKcalMultiplier();
  const baseTdee = tdee as number;
  const kcalTarget =
    phaseKcal !== null
      ? phaseKcal
      : goalMult !== null
        ? Math.max(Math.round(baseTdee * goalMult), KCAL_FLOOR_DAILY_MIN)
        : Math.max(Math.round(baseTdee), KCAL_FLOOR_DAILY_MIN);

  const proteinTargetG =
    computeProteinTargetG(readUserWeightKg()) ?? BASELINE_NUTRITION.proteinTargetG;

  return {
    kcalTarget,
    proteinTargetG,
    fatG: BASELINE_NUTRITION.fatG,
    carbsG: BASELINE_NUTRITION.carbsG,
    // 'engine' cand am o estimare derivata real (TDEE per-user sau override
    // faza); 'baseline' doar cand cadem pe flat 2640 (cold start).
    source: tdee !== null || phaseKcal !== null ? 'engine' : 'baseline',
    confidence: 0,
  };
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
/**
 * Read user manual phase override (B001 SchimbaFazaConfirm). Returns null
 * when AUTO or absent. When present, derive kcalTarget from current TDEE
 * estimate + phase multiplier (CUT 0.82 / BULK 1.08 / STRENGTH 1.05 /
 * MAINTENANCE 1.00). Persists across days — separate from per-day phase-log.
 *
 * Surfaces visible feedback "you picked CUT → reduced kcal target today"
 * without waiting for Bayesian inference observation accumulation.
 */
const PHASE_MULTIPLIERS: Record<string, number> = {
  CUT: 0.82,
  BULK: 1.08,
  MAINTENANCE: 1.0,
  STRENGTH: 1.05,
};
function getPhaseOverrideKcalToday(): number | null {
  try {
    const phaseRaw = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as
      | string
      | null;
    if (!phaseRaw || phaseRaw === 'AUTO') return null;
    const multiplier = PHASE_MULTIPLIERS[phaseRaw];
    if (multiplier === undefined) return null;
    // Try today's phase-log entry first (snapshot at change-time, deterministic)
    const todayISO = new Date().toLocaleDateString('sv');
    const phaseLog = JSON.parse(localStorage.getItem('phase-log') ?? '[]') as Array<{
      date: string;
      kcalTarget: number;
    }>;
    const todayEntry = phaseLog.find((e) => e.date === todayISO);
    if (todayEntry) return Math.max(todayEntry.kcalTarget, KCAL_FLOOR_DAILY_MIN);
    // Piesa 1 fix — derive from REAL per-user maintenance TDEE × multiplier
    // (user picked phase earlier, days later → still apply override). Fallback
    // la baza flat 2640 DOAR cand stats onboarding absente (cold start).
    const baseKcal = readUserMaintenanceTDEE() ?? BASELINE_NUTRITION.kcalTarget;
    return Math.max(Math.round(baseKcal * multiplier), KCAL_FLOOR_DAILY_MIN);
  } catch {
    return null;
  }
}

/**
 * Goal-driven kcal phase delta — onboarding goal (RO vocab) → multiplicator,
 * reutilizand PHASE_MULTIPLIERS (single source of truth, ZERO magic numbers
 * duplicate). Mirror semantics goalPhaseForGoal (scheduleAdapterAggregate.ts)
 * care drive faza workout: slabire→CUT / masa→BULK / forta→STRENGTH /
 * mentenanta+longevitate→MAINTENANCE. 'auto'/null → null (NU aplica delta;
 * cold-start = mentenanta, engine auto-detecteaza din progres in timp).
 *
 * Folosit DOAR cand NU exista override manual de faza (SchimbaFaza). Astfel
 * un user fresh care a ales "slabire" la onboarding vede deficit imediat,
 * fara sa deschida ecranul ascuns SchimbaFaza. Returns null cand goal absent
 * sau 'auto' → caller pastreaza estimarea de mentenanta/Bayesian as-is.
 */
function getGoalKcalMultiplier(): number | null {
  let phaseKey: string | null;
  switch (readOnboardingGoal()) {
    case 'slabire':
      phaseKey = 'CUT';
      break;
    case 'masa':
      phaseKey = 'BULK';
      break;
    case 'forta':
      phaseKey = 'STRENGTH';
      break;
    case 'mentenanta':
    case 'longevitate':
      phaseKey = 'MAINTENANCE';
      break;
    default:
      // 'auto' / null → ZERO goal-delta (mentenanta cold-start, engine invata).
      return null;
  }
  return PHASE_MULTIPLIERS[phaseKey] ?? null;
}

export async function getNutritionTargetsToday(
  userState?: BayesianNutritionContext,
): Promise<NutritionTargetsEngine> {
  const phaseKcal = getPhaseOverrideKcalToday();
  try {
    // §1-M1 audit fix: bayesianNutrition.d.ts sibling declares BayesianNutritionContext +
    // BayesianNutritionResult shapes; `as any` cast removed (Phase 4 task_11 §A pattern).
    const ctx = (userState ?? {}) as Parameters<typeof evaluateBN>[0];
    const result = await evaluateBN(ctx);
    // Piesa 1 fix — engine fara estimare (tier 'none' T0 fresh): cade pe baza
    // REALA per-user (TDEE × faza / mentenanta), NU flat 2640.
    if (!result || result.tier === 'none') {
      return buildPerUserBaseline(phaseKcal);
    }
    const mu = result.meta?.nutrition_inference_metadata?.posterior?.mu;
    if (!Number.isFinite(mu)) {
      return buildPerUserBaseline(phaseKcal);
    }
    // posterior.mu = TDEE de mentenanta adaptiv (Kalman). Goal-delta se aplica
    // pe ACEASTA estimare cand NU exista override manual, ca un user care invata
    // (TDEE adaptiv) sa primeasca tot deficit/surplus per goal onboarding.
    const goalMult = getGoalKcalMultiplier();
    const adjustedMu =
      goalMult !== null ? (mu as number) * goalMult : (mu as number);
    const safeKcal = Math.max(adjustedMu, KCAL_FLOOR_DAILY_MIN);
    // Precedence: override manual faza (B001 SchimbaFaza) > goal onboarding
    // (deja aplicat in adjustedMu) > estimare Bayesiana de mentenanta. User
    // explicit pick beats goal + Bayesian; engine continua sa invete din log.
    const finalKcal = phaseKcal !== null ? phaseKcal : Math.round(safeKcal);
    // Piesa 1 fix — proteine g/kg × greutate per-user (fallback flat 180 cand
    // greutate absenta). Engine Kalman acopera DOAR kcal, NU macro split.
    const proteinTargetG =
      computeProteinTargetG(readUserWeightKg()) ?? BASELINE_NUTRITION.proteinTargetG;
    return {
      kcalTarget: finalKcal,
      proteinTargetG,
      fatG: BASELINE_NUTRITION.fatG,
      carbsG: BASELINE_NUTRITION.carbsG,
      source: 'engine',
      confidence: mapBNConfidence(result.confidence),
    };
  } catch (e) {
    console.warn('[engineWrappers] getNutritionTargetsToday failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getNutritionTargetsToday' },
    });
    return buildPerUserBaseline(phaseKcal);
  }
}

/**
 * Piesa 4 (Preconizare) — TDEE EXPENDITURE estimate (kcal/zi), NU tinta.
 *
 * Returns BN engine posterior.mu (cheltuiala estimata, driven de demographicMu
 * Piesa 1 + observatii energy-balance Piesa 2). Cand engine tier 'none' / mu
 * absent / throws → cade pe mentenanta per-user (readUserMaintenanceTDEE).
 * Returns null DOAR cand nici engine nici stats onboarding nu dau estimare
 * (cold start total) → caller ascunde proiectia.
 *
 * Distinct de getNutritionTargetsToday: ACELA emite kcalTarget (tinta ajustata
 * faza+floor); ASTA emite expenditure raw pentru energy-balance projection.
 */
export async function readTdeeEstimateKcal(
  userState?: BayesianNutritionContext,
): Promise<number | null> {
  try {
    const ctx = (userState ?? {}) as Parameters<typeof evaluateBN>[0];
    const result = await evaluateBN(ctx);
    const mu = result?.meta?.nutrition_inference_metadata?.posterior?.mu;
    if (result && result.tier !== 'none' && Number.isFinite(mu)) {
      return mu as number;
    }
  } catch (e) {
    console.warn('[engineWrappers] readTdeeEstimateKcal failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'readTdeeEstimateKcal' },
    });
  }
  // Engine no-estimate → per-user maintenance (Piesa 1). Null cand cold start.
  return readUserMaintenanceTDEE();
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
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getAdherenceOutput' },
    });
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

/**
 * MED-CODE-24 fix: shared stagnation business rule constant.
 *
 * Business rule: 2+ consecutive weeks of flat 1RM progression per exercise
 * triggers stagnation surfacing (banner pattern + lagging coach line copy).
 * Source: PRIMER §2 MODIFY simplified spec + andura-clasic.html mockup
 * L747 "sub-volum 2 sapt" + L763 STAGNATION banner verbatim copy.
 *
 * Use sites (consistency invariant — change here propagates everywhere):
 *   1. getPatternsBanner STAGNATION gate (line ~654)
 *      `stag.maxStagnationWeeks >= STAGNATION_WEEKS_THRESHOLD`
 *   2. getLaggingSignal coach copy interpolation (line ~840)
 *      "sub-volum ${STAGNATION_WEEKS_THRESHOLD} sapt"
 *
 * Exported pentru test invariant assertions + future composer reuse.
 * NU schimba fără update DECISIONS.md (impacts user-visible thresholds +
 * mockup copy parity).
 */
export const STAGNATION_WEEKS_THRESHOLD = 2;

const LOW_ADHERENCE_THRESHOLD = 50;   // adherence < 50 → banner
const LOW_ADHERENCE_MIN_SESSIONS_GATE = 3; // Gigel-friendly: fresh user (<3 sessions) sees no adherence-low banner

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
    const logs = flattenSessionsToEngineLogs(sessions);
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
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getPatternsBanner', pattern: 'STAGNATION' },
    });
  }

  // Pattern 2: LOW_ADHERENCE via adherence engine (gated on user with
  // history — fresh T0 user with 0-2 sessions sees ZERO adherence pattern
  // since "adherence" requires a baseline to fall below. Gigel-friendly:
  // first-time user sees encouragement, not "you slacked").
  try {
    const sessionCount = useWorkoutStore.getState().sessionsHistory.length;
    if (sessionCount >= LOW_ADHERENCE_MIN_SESSIONS_GATE) {
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
    }
  } catch (e) {
    console.warn('[engineWrappers] getPatternsBanner LOW_ADHERENCE failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getPatternsBanner', pattern: 'LOW_ADHERENCE' },
    });
  }

  return banners;
}

// ── Proactive Alerts wrapper ────────────────────────────────────────────

export type ProactiveAlertSeverity = 'info' | 'warn' | 'urgent';

export interface ProactiveAlert {
  id: string;
  text: string;
  severity: ProactiveAlertSeverity;
}

// LOW-CODE-13 fix — typed SEVERITY_MAP + named DEFAULT centralize magic
// constants previously scattered (inline `'info'` literal in lookup fallback).
// Engine severity strings ('warning' | 'info' | 'success') → UI 3-tier
// (ProactiveAlertSeverity). 'success' collapses to 'info' (NU urgent UI bias).
// Unknown/missing engine severity → DEFAULT_PROACTIVE_ALERT_SEVERITY ('info').
const DEFAULT_PROACTIVE_ALERT_SEVERITY: ProactiveAlertSeverity = 'info';
const SEVERITY_MAP: Record<string, ProactiveAlertSeverity> = {
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
export function getProactiveAlerts(ctx: Record<string, unknown> = {}): ProactiveAlert[] {
  try {
    const raw = runProactiveChecks(ctx);
    if (!Array.isArray(raw)) return [];
    return raw.map((alert, idx) => ({
      id: `${alert?.type ?? 'unknown'}_${idx}`,
      text: alert?.message ?? '',
      severity: SEVERITY_MAP[alert?.severity] ?? DEFAULT_PROACTIVE_ALERT_SEVERITY,
    }));
  } catch (e) {
    console.warn('[engineWrappers] getProactiveAlerts failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getProactiveAlerts' },
    });
    return [];
  }
}

// ── Coach Rest Reason composer (§F-pass2-coachrest-01 audit fix) ─────────
//
// Wires CoachRestCard de la hardcoded "Pectoralii si picioarele inca
// recupereaza" la engine-driven via muscleRecovery.getRecoveryByGroup +
// readiness score. Fallback null cand zero data (T0 fresh) → CoachRestCard
// renders generic recovery message.

export interface CoachRestReason {
  fatiguedGroups: string[]; // RO display labels (e.g. ["Pieptul", "Quadricepsul"])
  readinessScore: number | null; // 0-100, null cand readiness NU logged
}

const MAX_FATIGUED_GROUPS_DISPLAY = 2; // top-2 most fatigued shown in coach line

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

function readPainCdl(): PainCdlEntry[] | undefined {
  try {
    return (DB.get(PAIN_CDL_KEY) as PainCdlEntry[] | null) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Composer §F-pass2-coachrest-01 — extract fatigued muscle groups + readiness
 * score for CoachRestCard wire. Reads workoutStore sessionsHistory →
 * getRecoveryByGroup → filter 'fatigued' → map RO labels.
 *
 * Returns null cand readiness null AND zero fatigued groups (T0 fresh user).
 * Defensive: engine throws → null fallback graceful.
 */
export function getCoachRestReason(): CoachRestReason | null {
  try {
    const readiness = getComputedReadinessScore();
    const sessions = useWorkoutStore.getState().sessionsHistory;
    const logs = flattenSessionsToEngineLogs(sessions);
    const groupState = getRecoveryByGroup(logs, readPainCdl());
    const fatigued: string[] = [];
    for (const [group, state] of Object.entries(groupState)) {
      if (state === 'fatigued') {
        const label = GROUP_LABELS_RO_BIG11[group] ?? group;
        fatigued.push(label);
      }
    }
    const topFatigued = fatigued.slice(0, MAX_FATIGUED_GROUPS_DISPLAY);
    if (readiness === null && topFatigued.length === 0) return null;
    return { fatiguedGroups: topFatigued, readinessScore: readiness };
  } catch (e) {
    console.warn('[engineWrappers] getCoachRestReason failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getCoachRestReason' },
    });
    return null;
  }
}

// ── Lagging Signal composer (§F-pass2-coachtoday-04 audit fix) ───────────
//
// Wires CoachTodayCard hidden mockup `coach-today-lagging` block (L747)
// to weaknessDetector engine. Returns RO sentence cand top-1 weak group
// detected (1RM ratio < 0.8 vs avg), null otherwise. T0 fresh user with
// <2 muscle groups logged → null (engine returns weakGroups=[]).

// MED-CODE-24 fix: reuse shared STAGNATION_WEEKS_THRESHOLD (declared above).
// Prior STAGNATION_WEEKS_LAGGING_DEFAULT inline literal `2` represented same
// business rule scattered across module — drift risk when rule changes.
// Mockup verbatim "sub-volum 2 sapt" preserved via interpolation.

/**
 * Composer §F-pass2-coachtoday-04 — extract top weak muscle group as RO
 * sentence for CoachTodayCard italic line below WHY quote. Null cand no
 * weakness detected (T0 fresh / balanced training).
 *
 * Defensive: engine throws → null fallback graceful.
 */
export function getLaggingSignal(): string | null {
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    const logs = flattenSessionsToEngineLogs(sessions);
    const { weakGroups } = detectWeakGroups(logs);
    if (!weakGroups || weakGroups.length === 0) return null;
    const topWeak = weakGroups[0];
    if (topWeak === undefined) return null;
    const label = GROUP_LABELS_RO_BIG11[topWeak] ?? topWeak;
    return `${label} sub-volum ${STAGNATION_WEEKS_THRESHOLD} sapt - focus azi pe sesiune.`;
  } catch (e) {
    console.warn('[engineWrappers] getLaggingSignal failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getLaggingSignal' },
    });
    return null;
  }
}

// ── Coach Today Quote composer (HIGH-CODE-03 chat5 Bugatti truth fix) ────
//
// Replaces CoachTodayCard hardcoded "Pectoralii recupereaza din marti ·
// spatele e gata." (mockup L750 verbatim) with engine-driven dynamic line
// reflecting REAL muscle recovery state. Bugatti truth: NU minciuni
// user-side. Coach claims about pectorals only when pectorals were actually
// trained recently AND have recovered.
//
// Strategy:
//   - Find top 1 recovered group cu recent training (1-14 days ago).
//   - Find top 1 fresh/ready group (recovered status, optional days context).
//   - Format RO sentence: `"${recoveredLabel} recupereaza din ${dayLabel}."`
//   - Returns null cand T0 fresh user (no sessions) OR no group both recently
//     trained AND recovered → caller renders safe generic fallback.
//
// Day label rules (RO no-diacritics):
//   - 1 day = "ieri"
//   - 2-6 days = "${N} zile"
//   - 7+ days = "saptamana trecuta"

export interface CoachTodayQuote {
  recoveredLabel: string; // RO display label (e.g., "Pectoralii", "Spatele")
  daysSince: number; // 1..N days since last trained
}

const COACH_TODAY_QUOTE_MAX_DAYS = 14; // beyond this, group not "recently trained"

/**
 * Composer HIGH-CODE-03 — extract one recovered + recently-trained group as
 * dynamic coach quote source for CoachTodayCard. Engine-truth: returns null
 * cand no group qualifies (T0 fresh / all groups stale or fatigued) → caller
 * renders safe generic non-claim line via coachPick('preview').
 *
 * Defensive: engine throws → null fallback graceful + Sentry captured.
 */
export function getCoachTodayQuote(): CoachTodayQuote | null {
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    const logs = flattenSessionsToEngineLogs(sessions);
    if (logs.length === 0) return null;
    const groupState = getRecoveryByGroup(logs, readPainCdl());
    // Iterate groups; pick first recovered group cu daysSince in window.
    let best: { group: string; days: number } | null = null;
    for (const [group, state] of Object.entries(groupState)) {
      if (state !== 'recovered') continue;
      const days = daysSinceGroup(logs, group);
      if (days === null) continue;
      if (days < 1 || days > COACH_TODAY_QUOTE_MAX_DAYS) continue;
      if (best === null || days < best.days) {
        best = { group, days };
      }
    }
    if (best === null) return null;
    const label = GROUP_LABELS_RO_BIG11[best.group] ?? best.group;
    return { recoveredLabel: label, daysSince: best.days };
  } catch (e) {
    console.warn('[engineWrappers] getCoachTodayQuote failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getCoachTodayQuote' },
    });
    return null;
  }
}
