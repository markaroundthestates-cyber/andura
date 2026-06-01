// ══ SCHEDULE ADAPTER AGGREGATE — workout-composition concern ══════════════
// Hygiene split (barrel re-export, zero behavior change): the planned-exercise
// prescription path (DP / cold-start targetKg/reps/rest), the volume + duration
// estimators, the WP-5 swap builder, and the async pipeline consumer
// composePlannedWorkoutToday live here. ENGINE_WORKOUT_TITLE_FALLBACK +
// buildSwappedExercise + computePlannedVolumeKg + computeEstimatedDurationMin +
// composePlannedWorkoutToday are re-exported by scheduleAdapterAggregate.ts —
// the public API is unchanged.

import { logger } from '../../util/logger.js';
import { getDailyWorkout } from '../../engine/schedule/scheduleAdapter.js';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { COMPOUND_EX } from '../../constants.js';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';
import { toExerciseDisplay } from './exerciseDisplay';
import { DP } from '../../engine/dp.js';
import { suggestStartWeight } from '../../engine/coldStartGuidelines.js';
import { roundToEquipmentWeight } from '../../config/weights.js';
import { isBodyweightExercise, bodyweightFraction } from '../../engine/bodyweightLoad.js';
import { getCurrentWeightKg } from './userTdee';
import { experienceToEngine } from './scheduleAdapterAggregate.session';
import {
  buildUserStateForPipeline,
  readinessScoreForUser,
} from './scheduleAdapterAggregate.builder';

// Engine workout-title fallback SENTINEL — a non-localized machine marker the
// adapter emits when the pipeline produces no real title. The render boundaries
// (CoachTodayCard / WorkoutPreview) detect it and substitute the locale-aware
// fallback via t(); the source NEVER carries Romanian copy (i18n leak harness).
export const ENGINE_WORKOUT_TITLE_FALLBACK = '__engine_workout_title_fallback__';

// DP.getSmartRecommendation return slice we read for the planned target (kg +
// repsTarget). DP emits a richer object (status/statusLabel/repsRange/...) but
// the planner only needs the prescriptive numbers. `kg` already rounded to the
// equipment step inside DP.recommend (which getSmartRecommendation wraps);
// `repsTarget` is phase-aware (DP reads phase-override for CUT). When readiness
// < 60 on an INCREASE day, getSmartRecommendation HOLDS the weight at lastW
// (readiness gate) — that suppression IS the wire fix #1.
interface DpRecommendation {
  kg?: number;
  repsTarget?: number;
}

// Fix #4 — default rest fallback (the prior hardcode) used only when the engine
// emits no rest range (empty user / goalAdaptation blueprint absent).
const DEFAULT_REST_SEC = 90;

// Post-session subjective rating of the LAST finished session, persisted by the
// workout store (PostRpe → setLastRating). Read via getState() (safe outside
// React). Null when no session has been rated yet (cold start). Mirrors the
// readinessScoreForUser() idiom — this layer reads persisted store state directly
// so the prescription consumes the post-session 'grea' signal (Daniel bug
// 2026-05-31: rating was stored but never wired into the next weight).
function readLastSessionRating(): 'usoara' | 'normala' | 'grea' | null {
  try {
    return useWorkoutStore.getState().lastRating ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve a per-exercise rest in seconds from the engine's goal-adaptation rest
 * range [minSec, maxSec] (template × phase × mode). A real coach rests compounds
 * longer than isolation, so compounds (COMPOUND_EX) take the range MAX, isolation
 * the range MIN. Range absent/malformed → DEFAULT_REST_SEC (prior 90s behavior).
 * Pure.
 *
 * @param engineName English canonical exercise name (COMPOUND_EX keys on it)
 * @param restRange engine rest-time prescription [minSec, maxSec] or null
 */
function resolveRestSec(
  engineName: string,
  restRange: readonly [number, number] | null,
): number {
  if (
    !Array.isArray(restRange) ||
    restRange.length < 2 ||
    !Number.isFinite(restRange[0]) ||
    !Number.isFinite(restRange[1])
  ) {
    return DEFAULT_REST_SEC;
  }
  const [minSec, maxSec] = restRange;
  return COMPOUND_EX.includes(engineName) ? maxSec : minSec;
}

/**
 * Map engine exercise (sessionBuilder output `{ name, sets }`) to
 * PlannedExercise consumer shape. Engine emits only name + sets count; the
 * prescriptive targetKg/targetReps come from the DP progressive-overload brain
 * (CRIT C1 — was hardcoded targetKg:20 / targetReps:10 for every exercise).
 *
 *   - User WITH logged history (DP.getLogs(name) non-empty): targetKg/
 *     targetReps from DP.getSmartRecommendation(name, readinessScore, null) —
 *     the readiness-GATED double-progression output keyed on the ENGLISH
 *     canonical name. On an INCREASE day with readiness < 60 the engine holds
 *     the weight at lastW instead of adding a step ("don't push heavy when you
 *     slept badly"). readinessScore null (no energy-check today) → engine runs
 *     the plain double-progression (no gate), identical to the prior behavior.
 *   - NEW user / cold start (no logs): targetKg from suggestStartWeight(name,
 *     experienceEn) population prior; targetReps from DP's phase-aware INIT
 *     repsTarget (rMin, CUT-capped via phase-override).
 *
 * CRIT parity: the engine name is an English canonical key (PR records,
 * alternativeEngine maps, DP REP_RANGES). The `id` slug + the DP/cold-start
 * lookups all use that English name; only `name`/`sub` carry the Romanian
 * display form (Romanian-first app) via exerciseDisplay.toExerciseDisplay.
 *
 * @param readinessScore live today readiness (getComputedReadinessScore) read
 *   ONCE by the composer and threaded in — null when no energy-check logged.
 * @param restRange engine goal-adaptation rest prescription [minSec, maxSec]
 *   (template × phase × mode), threaded from the plan. Compounds rest at the
 *   range MAX, isolation at MIN (resolveRestSec). null → 90s fallback.
 */
function toPlannedExercise(
  engineEx: { name: string; sets: number },
  idx: number,
  experienceEn: string,
  readinessScore: number | null,
  restRange: readonly [number, number] | null,
  coldStartProfile: { bodyweightKg: number | null; sex: string | null } | null = null,
): PlannedExercise {
  const slug = engineEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const display = toExerciseDisplay(engineEx.name);
  // English canonical name — DP records + cold-start guideline key on it.
  // getSmartRecommendation wraps DP.recommend + applies the readiness gate
  // (holds weight on INCREASE days when readinessScore < 60). This is the
  // cycle-4 fix completion: the prescribed kg now consumes today's readiness.
  // Post-session rating from the LAST finished session (workoutStore.lastRating):
  // an honest coach must not blindly push when the user said it was hard. Passed
  // into getSmartRecommendation, which demotes an INCREASE day to a HOLD on 'grea'
  // (per-set 'greu' already blocks the increase via logs.rpe; this closes the
  // post-session signal that was previously stored but never wired into load).
  const sessionRating = readLastSessionRating();
  const rec = DP.getSmartRecommendation(
    engineEx.name,
    readinessScore,
    null,
    undefined,
    sessionRating,
  ) as DpRecommendation | null;
  const hasHistory = DP.getLogs(engineEx.name, 1).length > 0;
  const targetReps =
    rec && typeof rec.repsTarget === 'number' ? rec.repsTarget : 10;
  // With history → DP weight (double-progression). Cold start → population
  // prior scaled by experience AND bodyweight/sex when a profile is supplied
  // (DP INIT default 20/10 is too coarse for a new user; suggestStartWeight is
  // per-exercise calibrated and now bodyweight-aware so a heavy trained user
  // does not start at the equipment floor).
  const csProfile = coldStartProfile
    ? { bodyweightKg: coldStartProfile.bodyweightKg, sex: coldStartProfile.sex }
    : undefined;
  // Bodyweight model: for a bodyweight movement the prescribed kg is NOT a
  // barbell-style target — the load is the user's own bodyweight. targetKg
  // therefore carries the ADDED weight (belt/dumbbell), defaulting to 0 (pure
  // bodyweight). We do NOT run suggestStartWeight (population priors are tuned
  // for external loads) — a bodyweight "start" is bodyweight reps. With history,
  // the DP recommendation kg IS the added weight (the user logged effective
  // load — see logSet — but the recommendation tracks the same axis), so we
  // keep it; cold-start added = 0.
  const isBw = isBodyweightExercise(engineEx.name);
  const rawTargetKg = isBw
    ? hasHistory && rec && typeof rec.kg === 'number'
      ? rec.kg
      : 0
    : hasHistory
      ? rec && typeof rec.kg === 'number'
        ? rec.kg
        : suggestStartWeight(engineEx.name, experienceEn, csProfile)
      : suggestStartWeight(engineEx.name, experienceEn, csProfile);
  // Snap the prescribed EXTERNAL load to a weight the machine/dumbbell can
  // actually be set to — covers the cold-start suggestStartWeight path that
  // otherwise surfaced impossible weights (smoke 2026-06-01: Flat DB Press 18kg
  // when the rack is 17.5/20). Bodyweight added-load stays raw (0/belt). The
  // history branch already comes snapped from DP.recommend, so this is idempotent
  // there. engineEx.name is the English engine key the equipment map expects.
  const targetKg = isBw
    ? rawTargetKg
    : roundToEquipmentWeight(rawTargetKg, engineEx.name);
  return {
    id: `${slug}-${idx}`,
    name: display.name,
    // English canonical name preserved for WP-5 substitution + DP/library keys.
    engineName: engineEx.name,
    ...(display.sub !== undefined ? { sub: display.sub } : {}),
    sets: engineEx.sets,
    targetReps,
    targetKg,
    // Fix #4 — rest from the engine rest range (compound=MAX / isolation=MIN),
    // NOT the prior hardcoded 90 for every exercise.
    restSec: resolveRestSec(engineEx.name, restRange),
    // Bodyweight flag + fraction so the UI + volume/PR math resolve the
    // effective load (bodyweight x fraction + targetKg added).
    ...(isBw ? { isBodyweight: true, bwFraction: bodyweightFraction(engineEx.name) } : {}),
  };
}

/**
 * WP-5 moat substitution — build a ready-to-render PlannedExercise for an
 * alternative swapped IN for a blocked/refused exercise. Re-uses the SAME
 * prescription path as the initial plan (toPlannedExercise) so the alternative
 * arrives with a real DP / cold-start targetKg/targetReps/rest, then stamps the
 * substitution marker (`swapReason` → WorkoutPreview "Inlocuit · {motiv}").
 *
 * Reads experience (cold-start scaling) + live readiness (DP gate) at this
 * boundary — the same sources composePlannedWorkoutToday threads in — so a
 * mid-session swap is prescribed consistently with the rest of the session.
 * Rest range is not re-derived per swap (the goal-adaptation range needs the
 * full pipeline); restSec falls back to the engine default inside
 * toPlannedExercise (null restRange → 90s), which matches an un-planned swap.
 *
 * @param engineName English canonical name of the alternative
 * @param idx position in the session (id slug)
 * @param swapReason short RO reason surfaced in the display sub slot
 */
export function buildSwappedExercise(
  engineName: string,
  idx: number,
  swapReason: string,
): PlannedExercise {
  const experienceEn = experienceToEngine(
    useOnboardingStore.getState().data.experience,
  );
  const readinessScore = readinessScoreForUser();
  // Same cold-start profile the main composer threads, so a swapped-in
  // alternative with no history is prescribed consistently (bodyweight-scaled).
  const coldStartProfile = {
    bodyweightKg: getCurrentWeightKg(),
    sex: useOnboardingStore.getState().data.sex,
  };
  const planned = toPlannedExercise(
    { name: engineName, sets: 3 },
    idx,
    experienceEn,
    readinessScore,
    null,
    coldStartProfile,
  );
  return { ...planned, swapReason };
}

// Audit HIGH "0 kg" — secunde estimate per set de lucru (timp sub tensiune +
// tranzitie/setup), folosit la estimarea de durata. Banda tipica 30-50s pentru
// un set de hipertrofie; 40 = mijloc conservativ. Estimare documentata.
const SET_WORK_SEC = 40;

/**
 * Tonajul planificat REAL (kg) — suma sets × targetReps × targetKg peste
 * exercitiile prescrise. Inlocuieste hardcode-ul volumeKg:0 din engine (care
 * facea WorkoutPreview sa arate "0 kg"). Returns null cand NU exista exercitii
 * (sau toate cu greutate 0, ex: bodyweight) → caller cade pe fallback-ul UI.
 * Pure. Rotunjit la kg.
 */
export function computePlannedVolumeKg(
  exercises: ReadonlyArray<{
    sets: number;
    targetReps: number;
    targetKg: number;
    isBodyweight?: boolean;
    bwFraction?: number;
  }>,
  bodyweightKg: number | null = null,
): number | null {
  if (!Array.isArray(exercises) || exercises.length === 0) return null;
  const bw = Number(bodyweightKg);
  const hasBw = Number.isFinite(bw) && bw > 0;
  let total = 0;
  for (const ex of exercises) {
    const sets = Number(ex.sets);
    const reps = Number(ex.targetReps);
    const added = Number(ex.targetKg);
    // Bodyweight: effective load = bodyweight x fraction + added. Loaded: kg as
    // entered. A pure-bodyweight set (added 0) now contributes REAL tonnage
    // (bodyweight x reps x sets) instead of 0 — the old bug under-counted it.
    const kg = ex.isBodyweight
      ? (hasBw ? bw * (Number(ex.bwFraction) || 0) : 0) + (Number.isFinite(added) ? added : 0)
      : added;
    if (Number.isFinite(sets) && Number.isFinite(reps) && Number.isFinite(kg)) {
      total += sets * reps * kg;
    }
  }
  // Tonaj 0 (toate bodyweight / greutati 0) → null ca UI sa cada pe fallback,
  // NU sa afiseze "0 kg" (acelasi simptom pe care il reparam).
  return total > 0 ? Math.round(total) : null;
}

/**
 * Durata estimata (minute) REAL din volumul de seturi: fiecare set ~ SET_WORK_SEC
 * de lucru + restSec de odihna, sumat peste exercitii, plus incalzirea. Inlocuieste
 * hardcode-ul estimatedDurationMin:50 din engine. Returns null cand fara exercitii
 * → caller cade pe fallback. Pure. Rotunjit la minut.
 */
export function computeEstimatedDurationMin(
  exercises: ReadonlyArray<{ sets: number; restSec: number }>,
  warmupMin: number = 0,
): number | null {
  if (!Array.isArray(exercises) || exercises.length === 0) return null;
  let totalSec = 0;
  for (const ex of exercises) {
    const sets = Number(ex.sets);
    const restSec = Number(ex.restSec);
    if (Number.isFinite(sets) && sets > 0) {
      const rest = Number.isFinite(restSec) ? restSec : 0;
      totalSec += sets * (SET_WORK_SEC + rest);
    }
  }
  if (totalSec <= 0) return null;
  const warmup = Number.isFinite(warmupMin) && warmupMin > 0 ? warmupMin : 0;
  return Math.round(totalSec / 60) + Math.round(warmup);
}

/**
 * Phase 6 task_02 real wire. Async pipeline consumer — caller (5 consumers
 * React) handles loading state via useState + useEffect pattern. Returns
 * null pe rest day OR pipeline hard halt OR thrown exception (fail-silent).
 */
export async function composePlannedWorkoutToday(
  now: Date = new Date(),
): Promise<PlannedWorkoutOutput | null> {
  try {
    const userState = buildUserStateForPipeline();
    const plan = await getDailyWorkout(userState, now);
    if (plan === null) return null;
    // RO onboarding experience → EN engine bucket once (cold-start weight
    // scaling). RO strings never reach the engine (CRIT C1 map above).
    const experienceEn = experienceToEngine(
      useOnboardingStore.getState().data.experience,
    );
    // Cold-start profile — bodyweight (canonical: last logged > onboarding) +
    // sex. Threaded into suggestStartWeight so a new HEAVY/trained user starts at
    // a realistic load instead of the equipment floor (the "Flat DB Press 10kg
    // for a 110kg user" bug). Only the no-history path consumes this; the DP
    // double-progression path (logs present) is untouched.
    const coldStartProfile = {
      bodyweightKg: getCurrentWeightKg(),
      sex: useOnboardingStore.getState().data.sex,
    };
    // Fix #1 — live readiness read ONCE here, threaded into every exercise's
    // DP.getSmartRecommendation. Null when no energy-check logged today (engine
    // skips the gate). Same source the readiness card + "why" explainer use.
    const readinessScore = readinessScoreForUser();
    // Fix #4 — engine goal-adaptation rest range [minSec, maxSec] threaded into
    // each exercise's restSec (compound=MAX / iso=MIN). null → 90s fallback.
    const restRangeRaw = plan.restTimeRange as [number, number] | null | undefined;
    const restRange =
      Array.isArray(restRangeRaw) && restRangeRaw.length >= 2 ? restRangeRaw : null;
    const exercises = (plan.exercises ?? []).map((ex, idx) =>
      toPlannedExercise(ex, idx, experienceEn, readinessScore, restRange, coldStartProfile),
    );
    // Deload engine emits intensity_modifier object always (IDLE state =
    // {rir_increment:0, intensity_pct_decrement:0}). 'minus' only when
    // ACTIVE deload (any non-zero modifier field). Phase 7+ wires 'plus'
    // via Energy Adjustment composite output.
    const mod = plan.intensityModifier as { rir_increment?: number; intensity_pct_decrement?: number } | null;
    const hasActiveDeload = mod !== null && (
      (mod.rir_increment ?? 0) > 0 || (mod.intensity_pct_decrement ?? 0) > 0
    );
    // F-workout-preview/T1 — Engine Warm-up blueprint surface. Engine emits
    // duration_min (5-10 adaptive) + ui_label "Incalzire ~X min" via
    // src/engine/warmup/index.js:289-300. Map to consumer-friendly {line,
    // durationMin}. Null when ui_label missing/empty (defensive guard).
    const warmupRaw = plan.warmup as { duration_min?: number; ui_label?: string } | null;
    const warmupLine = typeof warmupRaw?.ui_label === 'string' ? warmupRaw.ui_label : '';
    const warmupDuration = typeof warmupRaw?.duration_min === 'number' ? warmupRaw.duration_min : 0;
    const warmup = warmupRaw !== null && warmupLine.length > 0
      ? { line: warmupLine, durationMin: warmupDuration }
      : null;
    // Audit HIGH "0 kg" — tonajul planificat REAL din exercitiile prescrise
    // (sets × targetReps × targetKg), NU hardcode-ul 0 din engine
    // (scheduleAdapter.js volumeKg:0 → WorkoutPreview arata "0 kg" via `0 ?? fb`).
    // Sumam aici (React-side) unde targetKg/targetReps deja reale per exercitiu
    // (DP / cold-start). null cand nu avem exercitii → fallback WorkoutPreview.
    const volumeKg = computePlannedVolumeKg(exercises, coldStartProfile.bodyweightKg);
    // Durata estimata REAL din volumul de seturi + odihna (vs hardcode 50 engine):
    // per set ~ timp sub tensiune/tranzitie + restSec. null cand fara exercitii.
    const estimatedDuration = computeEstimatedDurationMin(exercises, warmup?.durationMin ?? 0);
    return {
      workoutTitle: plan.workoutTitle ?? ENGINE_WORKOUT_TITLE_FALLBACK,
      // Thread the engine's day-of-week session type so the render boundaries
      // can show a real per-day title (PUSH/PULL/...) instead of a hardcoded
      // "Push" fallback. Spread-conditional (exactOptionalPropertyTypes) — omit
      // cand engine nu emite sessionType.
      ...(typeof plan.sessionType === 'string' ? { sessionType: plan.sessionType } : {}),
      exerciseCount: exercises.length,
      // Real-or-fallback: cand computul da null (fara exercitii), cade pe valoarea
      // engine (?? 50 / ?? 0 in WorkoutPreview). NU mai forteaza 0/50 hardcodat.
      estimatedDuration: estimatedDuration ?? plan.estimatedDurationMin ?? 50,
      intensityMod: hasActiveDeload ? 'minus' : 'normal',
      exercises,
      volumeKg: volumeKg ?? plan.volumeKg ?? 0,
      warmup,
    };
  } catch (e) {
    logger.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
