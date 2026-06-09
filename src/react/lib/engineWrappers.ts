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
// HYGIENE SPLIT (2026-05-31, barrel re-export, zero behavior change): the
// cohesive non-adapter code-groups were relocated to sibling modules and are
// re-exported here so the public API is IDENTICAL (every existing
// `import { X } from '.../engineWrappers'` still resolves):
//   - engineWrappers.types     — simplified React-consumption output types
//   - engineWrappers.nutrition  — goal/phase/target kcal coherence math + AUTO
//                                 phase detection (resolveActivePhase etc.)
//   - engineWrappers.mmi        — MMI silent auto-cap (applyMmiCapToWorkout)
//   - engineWrappers.session    — session-type title resolver + weekday-index
//                                 Date helper (resolveSessionTitle etc.)
//   - engineWrappers.shared     — non-adapter helpers shared by the adapters
//                                 (flattenSessionsToEngineLogs / estimateOneRM /
//                                 readPainCdl)
// The instrumented engine ADAPTERS (try/catch + Sentry captureException) stay
// in THIS file — the anti-drift gate (assert_all_adapters_instrumented) scans
// this file's text for adapter instrumentation.
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
import { logger } from '../../util/logger.js';
import { getReadinessVerdict, getComputedReadinessScore } from '../../engine/readiness.js';
import { calculateFatigueScore } from '../../engine/fatigue.js';
import { detectPR } from '../../engine/prEngine.js';
import { whySummary } from '../../engine/whyEngine.js';
import { evaluate as evaluateBN } from '../../engine/bayesianNutrition/index.js';
import type { BayesianNutritionContext } from '../../engine/bayesianNutrition/index';
import { detectGlobalStagnation } from '../../engine/stagnationDetector.js';
import { proposeGoalPivot } from '../../engine/dp/autoPivot.js';
import { ceilingE1RM } from '../../engine/dp/ceiling.js';
import { resolveGoalId } from '../../engine/periodization/volumeLandmarks.js';
import { isEnabled } from '../../util/featureFlags.js';
import { DB } from '../../db.js';
import { getAdherenceScore } from '../../engine/adherence.js';
import { runProactiveChecks } from '../../engine/proactiveEngine.js';
import {
  getRecoveryByGroup,
  daysSinceGroup,
  hoursSinceGroup,
  GROUP_LABELS_RO_BIG11,
} from '../../engine/muscleRecovery.js';
import { flattenSessionsToRecoveryLogs } from '../../engine/schedule/scheduleAdapter/recoveryLogs.js';
import { laggingGroupsFromLogs } from '../../engine/schedule/scheduleAdapter/volumeAdaptation.js';
import { detectCalibrationLevel, CALIBRATION_LEVELS } from '../../engine/calibration.js';
import { useWorkoutStore } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useScheduleStore, weekStartIso } from '../stores/scheduleStore';
import { composePlannedWorkoutToday } from './scheduleAdapterAggregate';
// Piesa 1 nutrition-brain fix — real per-user maintenance TDEE base (omoara
// baza flat 2640). Multiplicatorul de faza se aplica pe TDEE-ul real per-user.
import {
  readUserMaintenanceTDEE,
  readUserWeightKg,
  computeProteinTargetG,
  getCurrentWeightKg,
} from './userTdee';
// Wave E4 — locale-aware muscle-group labels for getCoachTodayQuote so the
// "Pectorals recovered since yesterday" line surfaces in EN under EN locale.
import { t as __t } from '../../i18n/index.js';
// §48-H1 audit fix — adapter integrity instrumentation. Every catch path
// emits Sentry alert with source='engine-adapter-fallback' tag + adapter
// name extra. Risk addressed (§48.5): silent divergence when engine returns
// malformed shape → adapter swallows + returns null/baseline → UI shows
// stale defaults forever. Sentry alert breaks the silence in production;
// localhost no-ops via initSentry hostname gate. Cross-ref §13-C1 Sentry
// wire (ErrorBoundary precedent) + ADR-ENGINE-MATH-LOCKED-VALUES §1-§5.
import { captureException } from '../../util/sentry.js';

// ── Hygiene-split sibling modules (re-exported below for barrel API) ──────
import { applyMmiCapToWorkout } from './engineWrappers.mmi';
// dateForWeekdayIndex is used in this module's body (getWorkoutForDay);
// resolveSessionTitle is only re-exported below (no local use) — keep it out of
// this import to avoid an unused-binding warning.
import { dateForWeekdayIndex } from './engineWrappers.session';
import {
  flattenSessionsToEngineLogs,
  estimateOneRM,
  readPainCdl,
} from './engineWrappers.shared';
import {
  BASELINE_NUTRITION,
  readUserKcalFloor,
  mapBNConfidence,
  buildPerUserBaseline,
  applyHealthyFloorGuardrail,
  getCoherentKcalToday,
  resolveSafetyLimited,
  getPhaseOverrideKcalToday,
} from './engineWrappers.nutrition';
import type {
  ReadinessOutput,
  FatigueOutput,
  PRSet,
  PRHistoryEntry,
  PRDelta,
  PlannedWorkoutOutput,
  WhyExerciseInput,
  NutritionTargetsEngine,
  AdherenceOutput,
  PatternBanner,
  ProactiveAlert,
  ProactiveAlertSeverity,
  CoachRestReason,
  CoachTodayQuote,
  CoachCalibrationSignal,
  CoachReturnSignal,
  GoalPivotProposal,
} from './engineWrappers.types';

// Barrel re-exports — preserve IDENTICAL public API after the hygiene split.
// Types:
export type {
  ReadinessOutput,
  FatigueOutput,
  PRSet,
  PRHistoryEntry,
  PRDelta,
  PlannedExercise,
  PlannedWorkoutOutput,
  WhyExerciseInput,
  NutritionTargetsEngine,
  AdherenceOutput,
  PatternBanner,
  ProactiveAlert,
  ProactiveAlertSeverity,
  CoachRestReason,
  CoachTodayQuote,
  CoachCalibrationSignal,
  CoachReturnSignal,
  GoalPivotProposal,
  CoachAdaptation,
  CoachAdaptationKind,
} from './engineWrappers.types';
// Nutrition / kcal coherence + AUTO phase (public surface):
export { resolveActivePhase, getAutoDetectedPhaseLabelRo } from './engineWrappers.nutrition';
// MMI silent auto-cap:
export { applyMmiCapToWorkout } from './engineWrappers.mmi';
// Session-type title resolver + weekday-index Date helper (public surface):
export { resolveSessionTitle, dateForWeekdayIndex } from './engineWrappers.session';

// ── Wrappers cu try/catch fallback safe ──────────────────────────────────

/**
 * Audit HIGH — readiness score cu tinta nutritionala REALA per-user (NU flat
 * 2000/180). Citeste mentenanta per-user (readUserMaintenanceTDEE) + proteine
 * g/kg × greutate (aceeasi sursa pe care o foloseste wrapper-ul de nutritie) si
 * le threadeaza in engine. Un user mic care mananca corect (Maria tinta 1400,
 * mananca 1400) NU mai e penalizat de ratio-ul fata de 2000 flat. Cold-start
 * fara onboarding → null targets → engine cade pe flat (backward-compat).
 *
 * Single React boundary pentru readiness score — toti consumatorii il folosesc
 * ca tinta per-user sa fie consistenta peste readiness/fatigue/DP-gate.
 */
export function getUserReadinessScore(): number | null {
  const targetKcal = readUserMaintenanceTDEE();
  const targetProt = computeProteinTargetG(readUserWeightKg());
  return getComputedReadinessScore(targetKcal, targetProt);
}

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
    const score = getUserReadinessScore();
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
      key: verdict.key ?? null,
      label: verdict.label,
      color: verdict.color,
      volumeMultiplier: verdict.volumeMultiplier,
      canPR: verdict.canPR,
    };
  } catch (e) {
    logger.warn('[engineWrappers] getReadiness failed:', e);
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
    logger.warn('[engineWrappers] getFatigue failed:', e);
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
 *
 * Phase 4 task_18: enriches engine detectPR output cu 1RM estimate (Epley
 * formula via estimateOneRM) + deltaKg + deltaPct fields. Pure augment —
 * engine logic unchanged. Backward compat consumers that read only
 * type/kg/reps/prevBest (existing fields preserved).
 */
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
    logger.warn('[engineWrappers] getPRDelta failed:', e);
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

export function getWhyExerciseSummary(input: WhyExerciseInput): string | null {
  try {
    const score = getUserReadinessScore();
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
    logger.warn('[engineWrappers] getWhyExerciseSummary failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getWhyExerciseSummary' },
      extra: { exercise: input.name },
    });
    return null;
  }
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
export async function getTodayWorkout(
  options: { differentMuscle?: boolean } = {},
): Promise<PlannedWorkoutOutput | null> {
  try {
    // "Different group" ephemeral override (ScheduleOverride "Alta grupa") threaded
    // through. Default {} → byte-identical to the prior no-arg behavior for every
    // other consumer (Antrenor / Workout / PostRpe / SessionPill / coachDirector).
    const planned = await composePlannedWorkoutToday(new Date(), options);
    if (planned === null) return null;
    return applyMmiCapToWorkout(planned);
  } catch (e) {
    logger.warn('[engineWrappers] getTodayWorkout failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getTodayWorkout' },
    });
    return null;
  }
}

/**
 * Planned workout for a SPECIFIC weekday of the current week (schedule preview).
 * Reuses the exact same pipeline as getTodayWorkout via composePlannedWorkoutToday
 * with an injected Date for that day — so the proposed exercises reflect the live
 * engine state (recovery / readiness / progression / session type for that day).
 *
 * The engine derives the day-of-week session type + rest-day override + selection
 * seed from the injected Date (scheduleAdapter.getDailyWorkout). Returns null when
 * the day is a rest day (override) OR the pipeline halts OR the engine throws —
 * the caller renders an honest rest/empty state (NEVER a fabricated session).
 *
 * Read-only: this is a preview, so the MMI cap (which is a SILENT mutation of the
 * returned plan, identical pure transform) is applied for parity with the real
 * workout the user would start that day.
 */
export async function getWorkoutForDay(dayIdx: number): Promise<PlannedWorkoutOutput | null> {
  try {
    const planned = await composePlannedWorkoutToday(dateForWeekdayIndex(dayIdx));
    if (planned === null) return null;
    return applyMmiCapToWorkout(planned);
  } catch (e) {
    logger.warn('[engineWrappers] getWorkoutForDay failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getWorkoutForDay' },
      extra: { dayIdx },
    });
    return null;
  }
}

// ── Bayesian Nutrition wrapper (Phase 6 task_03) ────────────────────────
//
// Anti-recurrence engine API verify (sketch corrected inline per Daniel
// 2026-05-18 directive): BN engine emits `meta.nutrition_inference_metadata.
// posterior.mu` as TDEE kcal point estimate + `confidence` enum
// ('low'|'medium'|'high'). NU emite macros (protein/fat/carbs) — those derive în
// React-side aggregate task_04 din kcal + standard macro split heuristic (e.g.
// 30/30/40). Sketch §B `kcal_target` / `protein_target_g` / `fat_g` / `carbs_g`
// fields = inventate. Corecție: kcalTarget din posterior.mu, macros = baseline V1.
//
// ONESTITATE (audit MED): posterior.mu = posterior-ul BAYESIAN conjugat
// (conjugateUpdate din observatiile energy-balance), NU filtrul Kalman.
// bayesianNutrition/index.js calculeaza un kalmanState (B2) DAR il foloseste
// doar pentru semnalul de fallback EWMA — il NU il livreaza ca posterior
// (index.js:344 livreaza posterior.mu, NU kalmanState.mu). Kalman = INERT V1.
// Calibrarea lenta de fond traieste in nutritionObservations (cantarul →
// observatii energy-balance → conjugateUpdate), NU in Kalman.
//
// The goal/phase/target kcal coherence math + AUTO phase detection used by the
// adapters below live in engineWrappers.nutrition (hygiene split 2026-05-31).

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
    // posterior.mu = TDEE de mentenanta adaptiv (posterior BAYESIAN conjugat din
    // observatii, NU Kalman — inert V1). Goal-delta se aplica pe ACEASTA estimare
    // cand NU exista override manual, ca un user care invata (TDEE adaptiv) sa
    // primeasca tot deficit/surplus per goal onboarding.
    // Coherence model 2026-05-30 — size kcal off the ADAPTIVE maintenance (mu,
    // the Bayesian posterior) using the goal/phase direction + rate-capped target
    // magnitude. The phase sign is forced (BULK=surplus, CUT=deficit), so a
    // below-current target weight can no longer flip a masa goal into a deficit.
    const coherent = getCoherentKcalToday(mu as number);
    // Precedence: manual phase override snapshot (B001 SchimbaFaza phase-log) >
    // coherent goal/target/AUTO sizing > adaptive maintenance (mu, floored).
    const finalKcal =
      phaseKcal !== null
        ? phaseKcal
        : coherent !== null
          ? coherent.kcal
          : Math.max(Math.round(mu as number), readUserKcalFloor());
    // L7 — surface the base-target safety limit only when coherent sizing is the
    // shown value (a manual phase-override snapshot supersedes it).
    const safetyLimited = phaseKcal === null ? resolveSafetyLimited(coherent) : undefined;
    // BUG #4 safety — guardrail anti-subnutritie: user subponderal → ridica la
    // un surplus moderat de crestere (TDEE×1.08). Aplicat DUPA precedenta
    // (override faza / goal / Bayesian) ca sa prinda orice deficit, oricare sursa.
    const guarded = applyHealthyFloorGuardrail(finalKcal);
    // Piesa 1 fix — proteine g/kg × greutate per-user (fallback flat 180 cand
    // greutate absenta). Engine BN acopera DOAR kcal, NU macro split.
    const proteinTargetG =
      computeProteinTargetG(readUserWeightKg()) ?? BASELINE_NUTRITION.proteinTargetG;
    return {
      kcalTarget: guarded.kcal,
      proteinTargetG,
      fatG: BASELINE_NUTRITION.fatG,
      carbsG: BASELINE_NUTRITION.carbsG,
      source: 'engine',
      confidence: mapBNConfidence(result.confidence),
      healthyFloorClamped: guarded.clamped,
      // Suppress when the subponderal guardrail raised the target (not held down
      // by a floor/cap) so the limit note never contradicts the support message.
      ...(!guarded.clamped && safetyLimited ? { safetyLimited } : {}),
      // A4 — surface the coached vs math split ONLY when the flag is ON (the
      // coherent result carries coachedReason only then). Flag OFF → absent →
      // byte-identical output.
      ...(phaseKcal === null && coherent?.coachedReason !== undefined
        ? { mathKcalTarget: coherent.mathKcal, coachedReason: coherent.coachedReason }
        : {}),
    };
  } catch (e) {
    logger.warn('[engineWrappers] getNutritionTargetsToday failed:', e);
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
    logger.warn('[engineWrappers] readTdeeEstimateKcal failed:', e);
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
    logger.warn('[engineWrappers] getAdherenceOutput failed:', e);
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

const LOW_ADHERENCE_MIN_SESSIONS_GATE = 3; // Gigel-friendly: fresh user (<3 sessions) sees no adherence-low banner

/**
 * Weekly WORKOUT adherence (Daniel P0 2026-06-05). The banner previously read
 * getAdherenceScore() — a TODAY score that is 75% nutrition (kcal/protein/
 * weight), so a gym-only user who trains perfectly but logs no food was
 * STRUCTURALLY flagged "low adherence", contradicting Andura's gym-first
 * positioning (Gigel: "I trained 3x and the coach says I slacked?"). For a
 * workout-focused app, adherence = did you train as often as you planned.
 *
 * Counts sessions in the rolling 7-day window vs the user's frequency target;
 * "low" = fewer than HALF the target over a full week. Rolling 7 days self-
 * normalizes for how far into the week we are (a consistent user always has
 * ~target sessions in ANY 7-day window). No / invalid target → never low
 * (fail-safe: don't nag a user with no plan). Pure (state in, no globals).
 *
 * @param sessionTimestamps finished-session `ts` values (workoutStore.sessionsHistory)
 * @param frequencyTarget planned sessions/week (onboarding frequency, parsed)
 * @param now reference epoch ms (threaded for determinism)
 */
export function isLowWeeklyWorkoutAdherence(
  sessionTimestamps: readonly number[],
  frequencyTarget: number,
  now: number,
): boolean {
  if (!Number.isFinite(frequencyTarget) || frequencyTarget <= 0) return false;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const sessionsThisWeek = sessionTimestamps.filter((ts) => ts >= weekAgo).length;
  return sessionsThisWeek < Math.ceil(frequencyTarget / 2);
}

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
        // i18n render boundary: resolve to localized copy via t() (engine-side
        // stagnationDetector stays locale-agnostic — it returns a week count).
        text: __t('patterns.stagnationWeeks', { weeks: stag.maxStagnationWeeks }),
      });
    }
  } catch (e) {
    logger.warn('[engineWrappers] getPatternsBanner STAGNATION failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getPatternsBanner', pattern: 'STAGNATION' },
    });
  }

  // Pattern 2: LOW_ADHERENCE via adherence engine (gated on user with
  // history — fresh T0 user with 0-2 sessions sees ZERO adherence pattern
  // since "adherence" requires a baseline to fall below. Gigel-friendly:
  // first-time user sees encouragement, not "you slacked").
  try {
    const sessionsHistory = useWorkoutStore.getState().sessionsHistory;
    if (sessionsHistory.length >= LOW_ADHERENCE_MIN_SESSIONS_GATE) {
      // Workout adherence, NOT the nutrition-weighted daily getAdherenceScore:
      // a gym-only user who trains as planned must never read "low adherence".
      const frequencyTarget = parseInt(
        String(useOnboardingStore.getState().data.frequency ?? ''),
        10,
      );
      const lowAdherence = isLowWeeklyWorkoutAdherence(
        sessionsHistory.map((s) => s.ts),
        frequencyTarget,
        Date.now(),
      );
      if (lowAdherence) {
        banners.push({
          id: 'LOW_ADHERENCE',
          severity: 'info',
          text: __t('patterns.lowAdherenceFull'),
        });
      }
    }
  } catch (e) {
    logger.warn('[engineWrappers] getPatternsBanner LOW_ADHERENCE failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getPatternsBanner', pattern: 'LOW_ADHERENCE' },
    });
  }

  return banners;
}

// ── Proactive Alerts wrapper ────────────────────────────────────────────

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
      // i18n render boundary: the engine emits a semantic messageKey + params
      // (locale-agnostic). Resolve to localized copy here via t(). Legacy
      // `message` fallback kept for defensive parity (engine-internal callers /
      // older mocks that still pass raw text).
      text: alert?.messageKey
        ? __t(alert.messageKey, alert.messageParams ?? {})
        : (alert?.message ?? ''),
      severity: SEVERITY_MAP[alert?.severity] ?? DEFAULT_PROACTIVE_ALERT_SEVERITY,
    }));
  } catch (e) {
    logger.warn('[engineWrappers] getProactiveAlerts failed:', e);
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

const MAX_FATIGUED_GROUPS_DISPLAY = 2; // top-2 most fatigued shown in coach line

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
    const readiness = getUserReadinessScore();
    const sessions = useWorkoutStore.getState().sessionsHistory;
    const logs = flattenSessionsToEngineLogs(sessions);
    const groupState = getRecoveryByGroup(logs, readPainCdl());
    const fatigued: string[] = [];
    for (const [group, state] of Object.entries(groupState)) {
      if (state === 'fatigued') {
        // Wave E4 — locale-aware label: prefer i18n bundle bucket
        // (coachEngine.muscleGroups.${key}) so EN users see "Chest" /
        // "Back" / etc.; fall back to canonical RO label when the bundle
        // doesn't carry the key (defensive — engine emits Big 11 keys).
        const i18nKey = `coachEngine.muscleGroups.${group}`;
        const localized = __t(i18nKey);
        const label =
          localized && localized !== i18nKey
            ? localized
            : (GROUP_LABELS_RO_BIG11[group] ?? group);
        fatigued.push(label);
      }
    }
    const topFatigued = fatigued.slice(0, MAX_FATIGUED_GROUPS_DISPLAY);
    if (readiness === null && topFatigued.length === 0) return null;
    return { fatiguedGroups: topFatigued, readinessScore: readiness };
  } catch (e) {
    logger.warn('[engineWrappers] getCoachRestReason failed:', e);
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
 * Plan-allocation gate (LLM-judge Pattern A, 2026-06-06): the line says "focus
 * azi pe {group}". That is a lie unless TODAY's plan actually trains {group}.
 * Callers pass today's allocation (getPlanAllocationByGroup on the proposed
 * exercise list — RO Big-11 keys, same buckets weaknessDetector emits); the line
 * is suppressed when the top weak group is not in the plan today. With no
 * allocation passed the gate is inert (back-compat for partial-mock callers).
 *
 * Defensive: engine throws → null fallback graceful.
 */
export function getLaggingSignal(
  allocation?: { allocatedGroups: Set<string> } | null,
): string | null {
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    // Honesty repoint (F0 dedup #2, 2026-06-07): name the muscle the PLAN actually
    // amplifies, not a narrate-only signal that can disagree with it. The plan
    // drives weakness off getLaggingMuscles (set-volume ratio < 0.6 over 14d,
    // EN-keyed via recovery logs) at getDailyWorkout.js → laggingGroupsFromLogs.
    // The old detectWeakGroups path (Brzycki 1RM ratio < 0.8) was NARRATE-only and
    // could name a different muscle than the one M2 pushes toward MRV — a lie.
    // Both emit the same Big-11 RO vocabulary, so the i18n key + plan-allocation
    // gate below stay valid. laggingGroupsFromLogs returns most-lagging-first.
    const recoveryLogs = flattenSessionsToRecoveryLogs(sessions);
    const weakGroups = laggingGroupsFromLogs(recoveryLogs, Date.now());
    if (!weakGroups || weakGroups.length === 0) return null;
    // Truth gate (chest-heavy-plan bug, 2026-06-05): the "{group} undervolume
    // {weeks} wks" line is a CONFIDENT multi-week TREND claim. While the model is
    // still immature (the "still learning you — N more sessions" line is showing)
    // we do NOT have enough history to assert a multi-week trend — a trend claim
    // and "still learning" must be mutually exclusive. Suppress the line entirely
    // until the model matures (getCalibrationMaturity returns null at that point).
    if (getCalibrationMaturity() !== null) return null;
    const topWeak = weakGroups[0];
    if (topWeak === undefined) return null;
    // Plan-allocation gate (LLM-judge Pattern A): never claim "focus azi pe
    // {group}" for a group today's plan does not train. Only enforced when the
    // caller passed the plan's allocation (back-compat otherwise).
    if (allocation && !allocation.allocatedGroups.has(topWeak)) return null;
    // i18n render boundary: resolve a locale-aware muscle label (engine bucket
    // key → coachEngine.muscleGroups.* per locale, RO label as fallback) then
    // build the line via t() — never hardcoded RO copy (leaked under EN).
    const i18nKey = `coachEngine.muscleGroups.${topWeak}`;
    const localized = __t(i18nKey);
    const label =
      localized && localized !== i18nKey
        ? localized
        : (GROUP_LABELS_RO_BIG11[topWeak] ?? topWeak);
    return __t('coachToday.laggingSignal', { group: label, weeks: STAGNATION_WEEKS_THRESHOLD });
  } catch (e) {
    logger.warn('[engineWrappers] getLaggingSignal failed:', e);
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
    // hours = the REAL elapsed gap (sub-day precise); days = the floored bucket
    // used for the recently-trained window guard (1..COACH_TODAY_QUOTE_MAX_DAYS).
    let best: { group: string; days: number; hours: number } | null = null;
    for (const [group, state] of Object.entries(groupState)) {
      if (state !== 'recovered') continue;
      const days = daysSinceGroup(logs, group);
      if (days === null) continue;
      // F-2 fix: gate on real elapsed HOURS, not floored days. The old `days < 1`
      // guard (days is floored) skipped every group trained <24h ago before
      // `hours` was read, so the formatter's sub-day "{n}h ago" branch could never
      // fire. A `recovered` group is by definition past its recovery threshold, so
      // any positive elapsed time is a valid "recovered since" window; cap at
      // COACH_TODAY_QUOTE_MAX_DAYS (in hours).
      const hours = hoursSinceGroup(logs, group) ?? days * 24;
      if (hours <= 0 || hours > COACH_TODAY_QUOTE_MAX_DAYS * 24) continue;
      if (best === null || hours < best.hours) {
        best = { group, days, hours };
      }
    }
    if (best === null) return null;
    // Wave E4 — surface a locale-aware label. Engine canonical bucket key
    // (e.g. 'piept') resolves via coachEngine.muscleGroups.* per locale; the
    // RO display label stays as fallback if the key is unknown to the bundle.
    const i18nKey = `coachEngine.muscleGroups.${best.group}`;
    const localized = __t(i18nKey);
    const label =
      localized && localized !== i18nKey
        ? localized
        : (GROUP_LABELS_RO_BIG11[best.group] ?? best.group);
    return { recoveredLabel: label, daysSince: best.days, elapsedHours: best.hours };
  } catch (e) {
    logger.warn('[engineWrappers] getCoachTodayQuote failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getCoachTodayQuote' },
    });
    return null;
  }
}

// ── Calibration maturity composer (calibration honesty — "still learning you") ─
//
// Surfaces the "no fabricated certainty" Andura value: an HONEST indicator that
// the model is still calibrating, that fades as it matures. Reuses the real
// calibration engine (src/engine/calibration.js#detectCalibrationLevel) — the
// 6-tier maturity math (COLD_START → OPTIMIZED, ADR 009 §AMENDMENT). We do NOT
// reinvent the maturity math; we read the tier the engine reports and expose a
// machine signal the React side turns into copy (no RO/EN copy in this engine
// boundary — i18n leak harness).
//
// Truth-only: the session count is the user's REAL unique-session count (one
// per logged session ts); the "sessions to next tier" is the next tier's
// minSessions entry threshold minus the real count. When the next tier exposes
// no threshold we return null for the count and the React side phrases it
// WITHOUT a fabricated number ("still getting to know you").
//
// Hidden when mature: PERSONALIZED (id 4) and OPTIMIZED (id 5) have a null
// bannerText (the model is dialed in) → this composer returns null so a mature
// user NEVER sees the line. Cold start with zero sessions → an honest early-
// state signal (count 0) is fine; the React copy stays count-free.

// Tier order matching calibration.js TIER_ORDER (id 0..5). Used to look up the
// NEXT tier's entry threshold for an honest "sessions remaining" figure.
const CALIBRATION_TIER_BY_ID = [
  CALIBRATION_LEVELS.COLD_START,
  CALIBRATION_LEVELS.INITIAL,
  CALIBRATION_LEVELS.DEVELOPING,
  CALIBRATION_LEVELS.PERSONALIZING,
  CALIBRATION_LEVELS.PERSONALIZED,
  CALIBRATION_LEVELS.OPTIMIZED,
];

// The model is "dialed in" (line hidden) at PERSONALIZED+ — exactly the tiers
// the engine marks with a null bannerText. Mirror that boundary by id so the
// honesty line and the engine's own "done learning" signal never disagree.
const CALIBRATION_MATURE_TIER_ID = CALIBRATION_LEVELS.PERSONALIZED.id;

export function getCalibrationMaturity(): CoachCalibrationSignal | null {
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    // One calibration log per logged session: its finish `ts` is BOTH the unique
    // session key (engine dedups by session/date) and the date the engine ages
    // the model from. This is the user's real history — no fabrication.
    const allLogs = sessions
      .filter((s) => Number.isFinite(s.ts))
      .map((s) => ({ session: s.ts, ts: s.ts }));
    const level = detectCalibrationLevel({ allLogs });
    // Mature → hidden. A dialed-in user never sees the line (graceful).
    if (level.id >= CALIBRATION_MATURE_TIER_ID) return null;
    const sessionsCount = allLogs.length;
    // Honest "sessions to next tier": the NEXT tier's entry threshold minus the
    // real count. Null when no next tier or no threshold is exposed (then the
    // React copy drops the number rather than inventing one).
    const nextTier = CALIBRATION_TIER_BY_ID[level.id + 1];
    const nextMin = nextTier?.minSessions;
    const sessionsToNext =
      typeof nextMin === 'number' && Number.isFinite(nextMin) && nextMin > sessionsCount
        ? nextMin - sessionsCount
        : null;
    return {
      tierId: level.id,
      tierName: level.name,
      sessionsCount,
      sessionsToNext,
    };
  } catch (e) {
    logger.warn('[engineWrappers] getCalibrationMaturity failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getCalibrationMaturity' },
    });
    return null;
  }
}

// ── No-shame return composer (Coach Voice / minimal-friction arc, ADR 025) ──
//
// Detects "returned this week after missing >=1 scheduled training day EARLIER
// this week" and exposes a machine signal the React side turns into a warm,
// NO-GUILT welcome-back line. This is COMMUNICATION ONLY — the adaptive brain
// ALREADY rebalances a missed group on its own: a missed session means fewer
// sets accumulate for that group over the trailing 14 days, so getLaggingMuscles
// flags it (ratio < 0.6 vs peers) and M2 applyWeaknessAmplification pushes its
// volume UP toward MRV on the remaining FRESH days — capped at MRV + recovery
// cuts (NEVER cramming all missed volume into fewer days). So we do NOT add new
// rebalance logic here; we only tell the user, honestly, that the week adapted.
//
// Truth-only: missedDays is the REAL count of scheduled training days earlier in
// the current (Monday-anchored) week with NO logged session. Null when:
//   - no scheduled training day earlier this week was missed (nothing to say)
//   - cold start (zero prior sessions ever — not a "return")
//   - the user has logged ZERO sessions this week so far (they have not actually
//     "returned" yet — the line is for someone back in the gym after a same-week
//     gap, not someone idle all week; the >14d absence case is ReactivateCard's)
//
// Determinism: `now` injected for testing; defaults to the live clock. Pure read
// of the schedule (Mon..Sun training/rest tuple) + sessionsHistory; no mutation.
const RETURN_WINDOW_DAYS = 14; // beyond this, the >14d ReactivateCard owns the win-back

export function getReturnAfterMissSignal(now: number = Date.now()): CoachReturnSignal | null {
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    // Cold start → not a "return" (never trained before). Honesty gate.
    if (sessions.length === 0) return null;

    const days = useScheduleStore.getState().days; // Mon..Sun, 'training'|'rest'
    if (!Array.isArray(days) || days.length !== 7) return null;

    const nowDate = new Date(now);
    // Monday-first index of today (JS Sun=0 → Mon=0..Sun=6).
    const todayIdx = (nowDate.getDay() + 6) % 7;

    // LOCAL day-key (YYYY-MM-DD) of a Date — used for BOTH the scheduled-slot
    // keys and the session keys so they compare on the same local-day basis
    // (a session logged 09:00 local must match its weekday slot regardless of UTC
    // offset). weekStartIso is itself local-day anchored (Monday of this week).
    const localDayKey = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    const weekStart = weekStartIso(nowDate); // Monday ISO of the current week
    const weekStartMs = new Date(`${weekStart}T00:00:00`).getTime();
    const dayKeyFor = (idx: number): string =>
      localDayKey(new Date(weekStartMs + idx * 86400000));
    const sessionDayKey = (ts: number): string => localDayKey(new Date(ts));

    // Sessions logged THIS week (within [weekStart, now]).
    const loggedKeysThisWeek = new Set<string>();
    let mostRecentTs = -Infinity;
    for (const s of sessions) {
      if (!Number.isFinite(s.ts)) continue;
      if (s.ts > mostRecentTs) mostRecentTs = s.ts;
      if (s.ts < weekStartMs || s.ts > now) continue;
      loggedKeysThisWeek.add(sessionDayKey(s.ts));
    }

    // The user must have actually RETURNED this week (>=1 session logged this
    // week). Someone idle the whole week has not "come back" — and a long
    // absence (>14d) is ReactivateCard's job, not this same-week line.
    if (loggedKeysThisWeek.size === 0) return null;
    if (mostRecentTs !== -Infinity && now - mostRecentTs > RETURN_WINDOW_DAYS * 86400000) {
      return null;
    }

    // Count scheduled training days EARLIER this week (idx < today) with no
    // logged session — the real misses the user is returning from. Today is
    // excluded (it is not yet "missed"); future days are not yet due.
    let missedDays = 0;
    for (let idx = 0; idx < todayIdx; idx++) {
      if (days[idx] !== 'training') continue;
      if (!loggedKeysThisWeek.has(dayKeyFor(idx))) missedDays++;
    }
    if (missedDays === 0) return null;
    return { missedDays };
  } catch (e) {
    logger.warn('[engineWrappers] getReturnAfterMissSignal failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getReturnAfterMissSignal' },
    });
    return null;
  }
}

// ── Goal-pivot (#15 dp_auto_pivot_v1) — the LAST dark primitive's live consumer ──
// proposeGoalPivot is a PURE goal-pivot proposer (autoPivot.js): when a broad share
// of the user's MAIN lifts are near their realistic ceiling AND a sustained global
// stagnation persists (they keep forcing PRs that won't come), it PROPOSES moving
// off pure strength. The anti-spam cooldowns (28d rolling / 60d post-goal-shift /
// 4-per-year cap) are reused VERBATIM via evaluateReprompt inside the engine. This
// wrapper is the I/O boundary: it derives the per-lift mu+ceiling exactly like the
// strength-forecast surface (goalForecast.ts) and threads the persisted re-prompt
// bookkeeping (`dp-pivot-prompts`, the SYNC_KEY whose value is the goal-shift anchor;
// phase-change-date records the NUTRITION phase, NOT goal, so it cannot double as it).

const PIVOT_PROMPTS_KEY = 'dp-pivot-prompts';
// How many distinct main lifts (by recent volume) we read for the population call —
// the same recency window + lift surface the strength forecast uses (goalForecast.ts).
const PIVOT_WINDOW_DAYS = 84;

interface PivotPromptsRecord {
  lastRepromptMs?: number;
  lastConfirmMs?: number;
  lastGoalShiftMs?: number;
  repromptCountThisYear?: number;
  // The calendar year the count belongs to — lets the 4-per-year cap roll over
  // cleanly without a cron (read-time reset when the year changes).
  repromptYear?: number;
}

function readPivotPrompts(): PivotPromptsRecord {
  try {
    const raw = DB.get(PIVOT_PROMPTS_KEY) as PivotPromptsRecord | null;
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function writePivotPrompts(rec: PivotPromptsRecord): void {
  try {
    DB.set(PIVOT_PROMPTS_KEY, rec);
  } catch (e) {
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'writePivotPrompts' },
    });
  }
}

/**
 * The live consumer of proposeGoalPivot (#15). Returns the proposal descriptor
 * (banner targets + the near-ceiling evidence) ONLY when dp_auto_pivot_v1 is ON
 * AND the engine proposes a pivot; null otherwise (flag OFF / not near ceiling /
 * cooling down / cold start). FLAG OFF → returns null BEFORE any aggregation, so
 * the live path is byte-identical (no detection runs). Read-only — persistence is
 * the explicit record* actions on accept/decline/shown.
 */
export function getGoalPivotProposal(now: number = Date.now()): GoalPivotProposal | null {
  // Flag gate FIRST — OFF → no aggregation, no proposal (byte-identical live path).
  if (!isEnabled('dp_auto_pivot_v1')) return null;
  try {
    const sessions = useWorkoutStore.getState().sessionsHistory;
    if (!Array.isArray(sessions) || sessions.length === 0) return null;

    const data = useOnboardingStore.getState().data;
    const bwKg = getCurrentWeightKg() ?? data.weight ?? 0;
    if (!(bwKg > 0)) return null;
    const sex = typeof data.sex === 'string' ? data.sex : 'm';
    // Engine goal id the user is currently on (a target == current is dropped by
    // proposeGoalPivot). resolveGoalId maps the onboarding vocab → engine vocab.
    const currentGoalId =
      typeof data.goal === 'string' ? resolveGoalId({ goal: data.goal }) : resolveGoalId({});

    // Training age ≈ distinct training-day count (ceiling's ageFraction input) —
    // the same monotone proxy goalForecast.ts uses.
    const DAY_MS = 86400000;
    const trainingAge = new Set(
      sessions
        .map((s) =>
          Array.isArray(s.exercises) && s.exercises.length ? Math.floor((s.ts ?? 0) / DAY_MS) : null,
        )
        .filter((d): d is number => d !== null && d > 0),
    ).size;

    // Per-lift mu (best recent demonstrated e1RM) + ceiling, mirroring the
    // strength-forecast derivation (recency-windowed, EN-canonical engineName for
    // classifyPattern — the namekey lesson). mu = max estimated 1RM in-window per
    // lift (the demonstrated proxy classifyPlateau expects).
    const cutoff = now - PIVOT_WINDOW_DAYS * DAY_MS;
    const muByLift = new Map<string, number>();
    const engineKeyByLift = new Map<string, string>();
    for (const session of sessions) {
      if (!session.exercises) continue;
      for (const ex of session.exercises) {
        const name = ex.exerciseName;
        if (typeof name !== 'string' || name.length === 0) continue;
        if (!engineKeyByLift.has(name)) engineKeyByLift.set(name, ex.engineName || name);
        for (const set of ex.sets) {
          const ts = set.timestamp;
          if (!Number.isFinite(ts) || ts < cutoff || ts > now) continue;
          const oneRm = estimateOneRM(set.kg, set.reps);
          if (oneRm <= 0) continue;
          const prev = muByLift.get(name) ?? 0;
          if (oneRm > prev) muByLift.set(name, oneRm);
        }
      }
    }

    const lifts = Array.from(muByLift.entries()).map(([name, mu]) => ({
      ex: engineKeyByLift.get(name) || name,
      mu,
      ceiling: ceilingE1RM(engineKeyByLift.get(name) || name, bwKg, sex, trainingAge),
    }));
    if (lifts.length === 0) return null;

    // Sustained global stagnation gate — the SAME detector the per-exercise
    // stagnation banner uses (engine logs flattened EN-canonical).
    const logs = flattenSessionsToEngineLogs(sessions);
    const { maxStagnationWeeks } = detectGlobalStagnation(logs);

    // Anti-spam bookkeeping — the persisted goal-shift anchor + cooldowns. The
    // 4-per-year cap count is read-time-reset when the calendar year changes.
    const stored = readPivotPrompts();
    const thisYear = new Date(now).getFullYear();
    const repromptCountThisYear =
      stored.repromptYear === thisYear ? stored.repromptCountThisYear ?? 0 : 0;

    const proposal = proposeGoalPivot({
      lifts,
      maxStagnationWeeks,
      currentGoalId,
      nowMs: now,
      prompts: {
        lastRepromptMs: stored.lastRepromptMs,
        lastConfirmMs: stored.lastConfirmMs,
        lastGoalShiftMs: stored.lastGoalShiftMs,
        repromptCountThisYear,
      },
    });
    if (!proposal) return null;

    // Map the engine's pivot targets → the onboarding Goal ids the selector sets.
    // The wording offers two productive moves: hypertrophy (masa → hipertrofie
    // volume) + maintenance (mentenanta → sanatate). 'Raman pe forta' (decline) is
    // a UI-only action (no goal change) handled by the consumer. Filter out the
    // user's current onboarding goal so we never re-offer what they're already on.
    const currentOnboardingGoal = typeof data.goal === 'string' ? data.goal : 'auto';
    const targets = (['masa', 'mentenanta'] as const).filter((g) => g !== currentOnboardingGoal);
    if (targets.length === 0) return null;

    return {
      targets: [...targets],
      share: proposal.share,
      nearCount: proposal.nearCount,
      total: proposal.total,
      stagnationWeeks: proposal.stagnationWeeks,
    };
  } catch (e) {
    logger.warn('[engineWrappers] getGoalPivotProposal failed:', e);
    captureException(e, {
      tags: { source: 'engine-adapter-fallback', adapter: 'getGoalPivotProposal' },
    });
    return null;
  }
}

/**
 * Record that the pivot banner was SHOWN to the user (a re-prompt fired). Stamps
 * lastRepromptMs (the 28d rolling anchor) + bumps the 4-per-year cap count. Called
 * once when the banner first appears (the consumer guards against double-stamping).
 */
export function recordGoalPivotShown(now: number = Date.now()): void {
  const stored = readPivotPrompts();
  const thisYear = new Date(now).getFullYear();
  const count = stored.repromptYear === thisYear ? stored.repromptCountThisYear ?? 0 : 0;
  writePivotPrompts({
    ...stored,
    lastRepromptMs: now,
    repromptCountThisYear: count + 1,
    repromptYear: thisYear,
  });
}

/**
 * Record that the user ACCEPTED a pivot (goal changed). Stamps lastConfirmMs (21d
 * post-confirm cooldown) + lastGoalShiftMs (60d post-goal-shift cooldown — the
 * anchor phase-change-date cannot provide, as it tracks the nutrition phase).
 */
export function recordGoalPivotAccepted(now: number = Date.now()): void {
  const stored = readPivotPrompts();
  writePivotPrompts({ ...stored, lastConfirmMs: now, lastGoalShiftMs: now });
}

/**
 * Record that the user DECLINED / dismissed ('Raman pe forta'). Stamps the 28d
 * rolling re-prompt anchor (lastRepromptMs) so the prompt cools down without a
 * goal change — the decline IS the cooldown.
 */
export function recordGoalPivotDeclined(now: number = Date.now()): void {
  recordGoalPivotShown(now);
}
