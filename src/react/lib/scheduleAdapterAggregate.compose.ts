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
import { getReadinessVerdict } from '../../engine/readiness.js';
import { signalBus, type SessionSignalTrace } from './signalBus';
import { buildDecisionTrace } from './decisionTrace';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { COMPOUND_EX } from '../../constants.js';
import { getExerciseMetadata } from '../../engine/exerciseLibrary.js';
import type { PlannedExercise, PlannedWorkoutOutput, CoachAdaptation } from './engineWrappers';
import { toExerciseDisplay } from './exerciseDisplay';
import { DP } from '../../engine/dp.js';
import { isEnabled } from '../../util/featureFlags.js';
import { suggestStartWeight } from '../../engine/coldStartGuidelines.js';
import { resolveMaxKg } from '../../engine/dp/loadModel.js';
import { roundToEquipmentWeight } from '../../config/weights.js';
import { warmupRampFor } from '../../engine/warmupRamp.js';
import { isBodyweightExercise, bodyweightFraction } from '../../engine/bodyweightLoad.js';
import { getMetricType } from '../../engine/metricType.js';
import { getCurrentWeightKg } from './userTdee';
import { resolveActivePhase, resolveEnergyMagnitude } from './engineWrappers.nutrition';
import { energyVolumeFactor } from '../../engine/dp/ceiling.js';
import {
  emphasizedGroups as resolveEmphasizedGroups,
  deEmphasizedGroups as resolveDeEmphasizedGroups,
} from '../../engine/schedule/scheduleAdapter/focus.js';
import { contraindicatedGroupsFromPainCdl } from '../../engine/movementExclusion.js';
import { movementKey } from '../../engine/sessionBuilder.js';
import { experienceToEngine } from './scheduleAdapterAggregate.session';
import {
  buildUserStateForPipeline,
  readinessScoreForUser,
} from './scheduleAdapterAggregate.builder';
import { resolvePersonaId } from '../../engine/periodization/volumeLandmarks.js';
import { phaseRirShift } from '../../engine/periodization/mesocycle.js';

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
  // Return-after-gap deload (detraining): when the DP brain detects a training
  // GAP for this exercise it deloads the comeback load AND trims one working set.
  // setsAdjust is the per-exercise set delta (−1 on the comeback / ramp), applied
  // here against a MIN floor of 1 so a session never drops below one working set.
  setsAdjust?: number;
  // F5-W0 — the engine's machine status enum for THIS recommendation (EASE BACK /
  // CONSOLIDATE / INIT / ON TARGET / INCREASE / …) + its pre-localized RO
  // progression sentence. Already computed by getSmartRecommendation; carried onto
  // the PlannedExercise (recReason) so the moat "why?" / replay can read the real
  // branch instead of re-guessing.
  status?: string;
  progressionNote?: string;
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

// #7 metric-type prescription honoring (behind dp_metric_types_v1). Default
// PRESCRIBED DURATION (seconds) for a time / carry movement, so a non-reps
// exercise gets a sane "hold X seconds" / "carry X seconds" target instead of a
// phantom rep count. Conservative round figures (the per-exercise DP tuning of
// duration is a future refinement; these are honest starting prescriptions):
//   - time (isometric hold): 30s — a standard plank/hold working set.
//   - carry (loaded carry):  40s — a typical farmer's-walk working bout.
// Keyed loosely; absent → the metric's generic default below.
const METRIC_DEFAULT_SEC: Readonly<Record<'time' | 'carry', number>> = {
  time: 30,
  carry: 40,
};

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
  // Intra-session synergist pre-fatigue: the exercises positioned EARLIER in this
  // session plan (ordered). DP.getSmartRecommendation reads their synergist load
  // (muscle_target_secondary × sets × force) and shaves a modest, capped amount
  // off a small-muscle isolation that follows a compound which used it as a
  // synergist (e.g. a biceps curl after back rows no longer starts as if fresh).
  // Empty / omitted → no discount (the exercise is treated as the session's first
  // work). The cold-start (no history) branch is untouched — the discount only
  // applies to the history-driven DP weight inside getSmartRecommendation.
  priorExercises: ReadonlyArray<{ name: string; sets: number }> = [],
  // F2 #2 — Goal Adaptation rep + RIR target modifiers (session-level [min,max]
  // bands from the goalAdaptation blueprint). Threaded into DP.getSmartRecommendation
  // as an opts context arg. rep_range_modifier narrows the prescribed reps
  // (intersected with DP's phase-aware range, never widened); rir_target_modifier
  // shifts the displayed intensity label only (no load change). null/omitted →
  // byte-identical (DP keeps its phase-aware default band + rir-derived label).
  goalModifiers: {
    repRange?: readonly [number, number] | null;
    rirTarget?: readonly [number, number] | null;
    // F3 #6 — Periodization %1RM intensity corridor {floor,ceiling}. Threaded into
    // getSmartRecommendation opts; behind dp_intensity_corridor_v1 (default OFF) it
    // bounds the prescribed kg's implied %1RM. null/omitted → DP no-op.
    intensityCorridor?: { floor: number; ceiling: number } | null;
  } = {},
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
  // F6c #37 — resolve the active energy phase (read-only) ONLY when the flag is on,
  // threaded into getSmartRecommendation opts so the dp.js climb can throttle a
  // NEW-max push in a deficit + reframe a CUT hold as success. dp.js never imports
  // nutrition — the resolved token is passed in. Flag OFF → null → no throttle →
  // byte-identical.
  const energyPhase = isEnabled('dp_deficit_throttle_v1') ? resolveActivePhase() : null;
  // F6c #35 — read the CHRONOLOGICAL onboarding age ONLY when the flag is on, threaded
  // into getSmartRecommendation opts so the dp.js climb can cap the per-session
  // load-rate for an older lifter (tendon adapts slower than muscle). dp.js never
  // reads onboarding — the number is passed in. Flag OFF → undefined → no cap →
  // byte-identical. (Onboarding age is chronological 18-99, NOT trainingAge.)
  const ageRaw = useOnboardingStore.getState().data.age;
  const ageYears =
    isEnabled('dp_tendon_cap_v1') && typeof ageRaw === 'number' && Number.isFinite(ageRaw)
      ? ageRaw
      : undefined;
  const rec = DP.getSmartRecommendation(
    engineEx.name,
    readinessScore,
    null,
    undefined,
    sessionRating,
    priorExercises,
    {
      repRangeModifier: goalModifiers.repRange ?? null,
      rirTargetModifier: goalModifiers.rirTarget ?? null,
      intensityCorridor: goalModifiers.intensityCorridor ?? null,
      energyPhase,
      ...(ageYears !== undefined ? { ageYears } : {}),
    },
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
  // F3 #4 — cross-exercise transfer cold-start (flag dp_transfer_coldstart_v1,
  // default OFF → null → today's suggestStartWeight path, byte-identical). For a
  // NEW external-load lift with no history, seed from a RELATED lift the user has
  // e1RM for (normalizing the rep scheme) before falling to the population prior.
  const transferSeed =
    !isBw && !hasHistory && isEnabled('dp_transfer_coldstart_v1')
      ? DP.coldStartTransfer(engineEx.name, targetReps)
      : null;
  // F6c #33 — population-prior cold-start (flag dp_population_prior_v1, default OFF
  // → null → byte-identical). Fires ONLY when transfer found NO related lift: seed
  // the new external-load lift's start from the user's OWN demographic profile
  // (sex/BW/experience) via the shipped static POPULATION_E1RM_PRIOR table, before
  // falling to suggestStartWeight. PRIVACY: on-device static lookup, no data
  // collection. Chain: transfer → population prior → suggestStartWeight.
  const populationSeed =
    !isBw && !hasHistory && !transferSeed && isEnabled('dp_population_prior_v1')
      ? DP.coldStartPopulationSeed(engineEx.name, targetReps, {
          bodyweightKg: csProfile?.bodyweightKg ?? null,
          sex: csProfile?.sex ?? null,
          experience: experienceEn,
          // #80 chronological age → cold-start age damper (older→lighter, policy §1).
          age: typeof ageRaw === 'number' && Number.isFinite(ageRaw) ? ageRaw : null,
        })
      : null;
  const rawColdStartKg =
    transferSeed && transferSeed.kg > 0
      ? transferSeed.kg
      : populationSeed && populationSeed.kg > 0
        ? populationSeed.kg
        : suggestStartWeight(engineEx.name, experienceEn, csProfile);
  // F2 (Daniel live 2026-06-10) — clamp the COLD-START external load to the
  // exercise's defensive MAX_KG cap. The cap (loadModel.resolveMaxKg: curated
  // MAX_KG, else metadata-derived behind dp_load_model_v1 — e.g. Y Raise umeri/db
  // → 18) is enforced inside dp.recommend's at-cap brake, but that brake keys on
  // the PRIOR logged weight (lastW) so it is INERT at cold-start (lastW=0). The
  // population-prior / suggestStartWeight seed then snapped to the ladder TOP
  // (umeri raise → 25) with no ceiling → an ego-load preview. The same cap, applied
  // where the cold-start rec is BORN. With-history rows already come capped from
  // dp.recommend, so this is scoped to the cold-start branch only.
  const coldStartCap = isBw
    ? null
    : resolveMaxKg({
        curated: (DP.MAX_KG as Record<string, number>)[engineEx.name],
        meta: getExerciseMetadata(engineEx.name),
        flagOn: isEnabled('dp_load_model_v1'),
      });
  const cappedColdStartKg =
    coldStartCap != null && coldStartCap > 0
      ? Math.min(rawColdStartKg, coldStartCap)
      : rawColdStartKg;
  const rawTargetKg = isBw
    ? hasHistory && rec && typeof rec.kg === 'number'
      ? rec.kg
      : 0
    : hasHistory
      ? rec && typeof rec.kg === 'number'
        ? rec.kg
        : cappedColdStartKg
      : cappedColdStartKg;
  // Snap the prescribed EXTERNAL load to a weight the machine/dumbbell can
  // actually be set to — covers the cold-start suggestStartWeight path that
  // otherwise surfaced impossible weights (smoke 2026-06-01: Flat DB Press 18kg
  // when the rack is 17.5/20). Bodyweight added-load stays raw (0/belt). The
  // history branch already comes snapped from DP.recommend, so this is idempotent
  // there. engineEx.name is the English engine key the equipment map expects.
  const targetKg = isBw
    ? rawTargetKg
    : roundToEquipmentWeight(rawTargetKg, engineEx.name);
  // #7 prescription METRIC. The metric_type DATA is always stamped (consumers
  // read it whether or not the honoring flag is on). The BEHAVIORAL honoring —
  // suppressing the weight × reps prescription for a time / carry movement — is
  // gated behind dp_metric_types_v1 (default OFF → byte-identical reps path; the
  // full-path-sim never enables it, so the determinism hash holds).
  const metricType = getMetricType(engineEx.name);
  const honorMetric =
    isEnabled('dp_metric_types_v1') && (metricType === 'time' || metricType === 'carry');
  // A non-reps exercise no longer gets a rep target: targetReps → 0 (no "× reps"),
  // and a prescribed DURATION (targetSec) is emitted instead. A load may still ride
  // (a weighted plank / a farmer's-walk carry) — targetKg is kept as-is.
  const finalTargetReps = honorMetric ? 0 : targetReps;
  const targetSec = honorMetric ? METRIC_DEFAULT_SEC[metricType] : undefined;
  return {
    id: `${slug}-${idx}`,
    name: display.name,
    // English canonical name preserved for WP-5 substitution + DP/library keys.
    engineName: engineEx.name,
    ...(display.sub !== undefined ? { sub: display.sub } : {}),
    // Return-after-gap deload trims one working set on the comeback / ramp
    // (rec.setsAdjust, −1). Composes with the schedule layer's own recovery-aware
    // set count (engineEx.sets already reflects volume + recovery cuts) by
    // subtracting on top, floored at 1 so a session never drops below one set.
    sets:
      rec && typeof rec.setsAdjust === 'number'
        ? Math.max(1, engineEx.sets + rec.setsAdjust)
        : engineEx.sets,
    targetReps: finalTargetReps,
    // R6c — the rep BAND for preview display ("10–15"). DP attaches repsRange on
    // every recommendation; targetReps stays the numeric per-set prefill target.
    // Suppressed for time/carry metrics (no rep band on a plank).
    ...(!honorMetric && rec && typeof (rec as { repsRange?: unknown }).repsRange === 'string'
      ? { repsBand: (rec as unknown as { repsRange: string }).repsRange }
      : {}),
    targetKg,
    // Fix #4 — rest from the engine rest range (compound=MAX / isolation=MIN),
    // NOT the prior hardcoded 90 for every exercise.
    restSec: resolveRestSec(engineEx.name, restRange),
    // Bodyweight flag + fraction so the UI + volume/PR math resolve the
    // effective load (bodyweight x fraction + targetKg added).
    ...(isBw ? { isBodyweight: true, bwFraction: bodyweightFraction(engineEx.name) } : {}),
    // #7 always-on metric data + the gated prescribed duration.
    metricType,
    ...(targetSec !== undefined ? { targetSec } : {}),
    // F5-W0 — carry the DP decision REASON (status + progression note) forward.
    // Already computed in `rec` above; historically dropped here. Additive +
    // byte-identical: no current consumer reads recReason (grep: 0 matches), so
    // every existing PlannedExercise consumer ignores it. CARRIED ONLY.
    ...(rec && rec.status
      ? {
          recReason: {
            status: String(rec.status),
            ...(rec.progressionNote !== undefined ? { note: rec.progressionNote } : {}),
          },
        }
      : {}),
    // F5-W0 — carry the strength-posterior UNCERTAINTY (sigma) + observation count.
    // DP._posteriorConfidence is a pure recompute from the e1RM log stream (no DB
    // write, driver-flag-independent), returning { sigma:null, n:0 } for a
    // cold-start / e1RM-ineligible exercise. One extra deterministic read; the
    // PRESCRIPTION (kg/reps/sets) above is untouched. CARRIED ONLY — nothing
    // consumes confidence yet.
    ...(rec ? { confidence: DP._posteriorConfidence(engineEx.name) } : {}),
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

// Secunde estimate per set de lucru (timp sub tensiune + re-rack/cretat/micro-
// pauze/check forma). Calibrat 2026-06-10 pe sesiunile reale Daniel: 40s subevalua
// executia reala a unui set; 50s aduce 7ex in 55-70 min si 8ex in 65-80 min.
const SET_WORK_SEC = 50;
// Tranzitie/setup per EXERCITIU (mers la aparat, schimbat greutatile, reglat
// banca, gasit un loc liber). SET_WORK_SEC + restSec acopera doar timpul DIN
// cadrul unui exercitiu; aceasta constanta adauga timpul DINTRE exercitii pe care
// estimarea il rata. Calibrat 2026-06-10: ~105s o medie reala pentru o sala plina.
const EXERCISE_TRANSITION_SEC = 105;

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
  let countedExercises = 0;
  for (const ex of exercises) {
    const sets = Number(ex.sets);
    const restSec = Number(ex.restSec);
    if (Number.isFinite(sets) && sets > 0) {
      const rest = Number.isFinite(restSec) ? restSec : 0;
      totalSec += sets * (SET_WORK_SEC + rest);
      // Tranzitia/setup INTRE exercitii (mers la aparat, incarcat discuri) pe care
      // doar sets×(work+rest) o rata → timp real de sala mai onest.
      countedExercises += 1;
    }
  }
  if (totalSec <= 0) return null;
  totalSec += countedExercises * EXERCISE_TRANSITION_SEC;
  const warmup = Number.isFinite(warmupMin) && warmupMin > 0 ? warmupMin : 0;
  return Math.round(totalSec / 60) + Math.round(warmup);
}

// ── Persona-aware session TIME budget (rest-inclusive) ─────────────────────
// The chassis sizes a session from the weekly volume budget (exercise count
// [4,8] × sets [2,5]) but never bounds the resulting session DURATION, so a
// high-volume day could run ~2.5-3h. A real coach caps the session at a time
// budget; rest periods dominate that time (a heavy compound rests 2-3 min
// between sets), so the cap is measured on the REST-INCLUSIVE duration
// (computeEstimatedDurationMin) — NOT a work-only estimate.
//
// Hard caps (minutes) per persona — older / less-recovered trainees tolerate a
// shorter session (recovery + adherence), a trained Marius a longer one. The
// soft TARGET (~cap − 15) is the comfortable mid-band the trim aims for; the
// HARD cap is the absolute ceiling the trim guarantees the session lands under.
// null / unknown persona → gigica (conservative middle, mirrors resolvePersonaId).
const PERSONA_TIME_CAP_MIN: Readonly<Record<string, number>> = {
  maria: 60,
  gigica: 75,
  marius: 90,
};
const TIME_TARGET_OFFSET_MIN = 15; // soft target = hard cap − this
const DEFAULT_PERSONA_TIME_CAP_MIN = PERSONA_TIME_CAP_MIN.gigica ?? 75;

// Trim floor — never gut the session below a real workout. A trimmed group
// re-surfaces as lagging next session (M2 weakness amplification + M1 recovery
// re-prioritize it), so trimming today is SAFE and self-correcting; the floor
// only stops the trim from producing a stub.
const MIN_EXERCISES_FLOOR = 4; // never below ~4 exercises
const MIN_SETS_PER_EX = 2;     // never below MIN_SETS (matches chassis clamp)
const MIN_SESSION_MIN = 25;    // never trim below a ~25min session
const COMPOUND_MIN_SETS = 3;   // last-resort floor for the TOP compound (idx 0)

// HARD user time-cap floor (dp_hard_time_cap_v1) — when the USER explicitly states
// a tight session budget (workoutStore.sessionTimeBudgetMin), the persona floor
// above stops the trim short of the stated minutes (4 heavy compounds at 3 sets
// with 180s rests is ~52min and never reaches a 35-min cap). For a USER-SET hard
// cap ONLY, the floor is allowed to pierce DOWN to these tighter bounds so the
// session actually fits: a real compound-dense ~35-min session is 3 exercises at
// ~2 sets (supersets), NOT 1 token lift. The FOCUS is still protected by the
// focus-floor drop-guard; these are the absolute lower bounds the trim respects.
const HARDCAP_MIN_EXERCISES = 3; // user-hard-cap floor — never below 3 exercises
const HARDCAP_MIN_SETS = 2;      // user-hard-cap floor — never below 2 working sets
const HARDCAP_MIN_SESSION_MIN = 20; // user-hard-cap session floor (a real 3x2 superset day)

/** Resolve the per-persona HARD time cap (minutes) — the absolute ceiling the
 * trim guarantees. Unknown persona → gigica (conservative). Pure. */
export function personaTimeCapMin(personaId: string | null | undefined): number {
  if (typeof personaId === 'string' && personaId in PERSONA_TIME_CAP_MIN) {
    return PERSONA_TIME_CAP_MIN[personaId]!;
  }
  return DEFAULT_PERSONA_TIME_CAP_MIN;
}

/** Soft TARGET session length (minutes) = hard cap − TIME_TARGET_OFFSET_MIN —
 * the comfortable mid-band (e.g. marius ~75). Floored at MIN_SESSION_MIN so the
 * target never drops below the session floor. Pure. */
export function personaTimeTargetMin(personaId: string | null | undefined): number {
  return Math.max(MIN_SESSION_MIN, personaTimeCapMin(personaId) - TIME_TARGET_OFFSET_MIN);
}

// Per-session-type FATIGUE factor scaling the flat persona cap. Not all minutes
// cost the same: a leg / lower-body day is far more systemically fatiguing per
// minute than an arms / upper day — heavy squat / leg-press load the CNS hard,
// drive whole-body systemic fatigue, and demand long inter-set rests. So the
// effective time ceiling must be LOWER for high-fatigue session types (2h of
// legs is more tiring than 2h of upper). FULL-body sits in between: taxing, but
// the load is distributed across the body rather than concentrated. UPPER / PUSH
// / PULL move smaller muscles with less systemic cost → no reduction. Unknown /
// missing type → 1.0 (graceful: identical to the flat-cap behavior).
const CLUSTER_FATIGUE_FACTOR: Readonly<Record<string, number>> = {
  LEGS: 0.8,  // most fatiguing — heavy lower-body compounds, CNS + systemic load
  LOWER: 0.8, // synonym of LEGS in the engine's session tags
  FULL: 0.9,  // taxing but distributed across the whole body
  UPPER: 1.0, // smaller muscles, less systemic cost
  PUSH: 1.0,
  PULL: 1.0,
};
const DEFAULT_CLUSTER_FATIGUE_FACTOR = 1.0; // unknown/missing → no reduction

/** Per-session-type fatigue multiplier for the time cap. Legs/lower (0.80) <
 * full (0.90) < upper/push/pull (1.00). Unknown/missing → 1.0 (graceful, no
 * reduction → identical to the flat cap). Case-insensitive on the engine tag.
 * Pure. */
export function clusterFatigueFactor(sessionType: string | null | undefined): number {
  if (typeof sessionType !== 'string') return DEFAULT_CLUSTER_FATIGUE_FACTOR;
  const key = sessionType.toUpperCase();
  return key in CLUSTER_FATIGUE_FACTOR
    ? CLUSTER_FATIGUE_FACTOR[key]!
    : DEFAULT_CLUSTER_FATIGUE_FACTOR;
}

// ── F6c #12 — STIMULUS-per-minute optimizer (F6c spec §7) ───────────────────
// The trim below is BLIND tail-first: it drops the positionally-LAST exercise
// among the trimmable tail, optimizing for priority order, NOT training-value-
// per-minute — so a short "27-min legs" day can lose a high-stimulus compound to a
// low-density isolation merely because the compound sits later. #12 DEEPENS the
// drop decision (it does NOT replace the trim): among the TRIMMABLE tail it drops
// the LOWEST stimulus-per-minute candidate instead of strictly the last, so the
// remaining session is DENSER. The FRONT (priority/weak — kept at the head by
// prioritizeWeakGroups) is still never dropped, and every floor still holds.
//
// stimulusScore reuses signals already loaded — NO new data source: a compound
// (COMPOUND_EX) scores higher than an isolation, and a wider muscle-target breadth
// (primary + secondary, getExerciseMetadata) adds to the score. UNVERIFIED weighting
// (spec §9) — the constants are a Daniel/research sanity-check item before the flag
// flips ON; the SHAPE (compound + breadth = more stimulus) is the verified principle.
const STIMULUS_COMPOUND_BONUS = 2; // a compound carries more systemic stimulus
const STIMULUS_PER_SECONDARY = 0.5; // each extra muscle worked adds stimulus breadth
const STIMULUS_BASE = 1; // an isolation single-muscle baseline

/** A coarse training-VALUE score for an exercise: compound vs isolation + muscle-
 * target breadth (primary + secondary). Reuses the library metadata already loaded.
 * UNVERIFIED weighting (spec §9). Pure. */
export function stimulusScore(engineName: string | undefined | null): number {
  const name = typeof engineName === 'string' ? engineName : '';
  let score = STIMULUS_BASE;
  if (COMPOUND_EX.includes(name)) score += STIMULUS_COMPOUND_BONUS;
  const meta = getExerciseMetadata(name) as {
    muscle_target_secondary?: unknown;
  } | null;
  const secondary = meta && Array.isArray(meta.muscle_target_secondary)
    ? meta.muscle_target_secondary.length
    : 0;
  score += secondary * STIMULUS_PER_SECONDARY;
  return score;
}

/** Stimulus-PER-MINUTE for one exercise = stimulusScore / its rest-inclusive minute
 * cost (computeEstimatedDurationMin on the single exercise). Higher = denser
 * training value. A zero/invalid minute cost → score itself (avoid div-by-zero;
 * a 0-set row is already protected by the floor). Pure. */
export function stimulusPerMin(ex: TrimmableExercise): number {
  const minutes = computeEstimatedDurationMin([ex], 0) ?? 0;
  const score = stimulusScore(ex.engineName ?? ex.name);
  return minutes > 0 ? score / minutes : score;
}

type TrimmableExercise = PlannedExercise;

// #1 (Daniel coach audit 2026-06-10) — a MAIN lift's working sets must not be cut
// below 3 by the volume reducers (the deficit/readiness set-scalers + the time-budget
// trim). His live v-taper push (goal=slabire → deficit) had the chest PRESS cut to 2
// while the emphasized shoulder kept its volume: the deficit/readiness scalers + the
// trim all floored at MIN_SETS_PER_EX (2), not compound-aware. A real coach in a cut
// sheds ACCESSORY/isolation volume + drops tail work but keeps each major group's
// press/pull/hinge at a real 3-set effective dose (load preserves muscle; volume is
// trimmed off the fluff, not the main lift). So a tier-1 compound floors at 3.
function compoundSetFloor(ex: TrimmableExercise): number {
  const tier = (getExerciseMetadata(ex.engineName ?? ex.name) as { tier?: number } | null)?.tier;
  return tier === 1 ? COMPOUND_MIN_SETS : MIN_SETS_PER_EX;
}
// The trim's per-position floor: idx 0 (the day's lead compound) always 3; any other
// tier-1 compound also 3; isolations MIN_SETS_PER_EX.
//
// hardCap (dp_hard_time_cap_v1, user-set sessionTimeBudgetMin) — when a USER explicitly
// states a tight budget, the compound's 3-set floor stops the trim short of the stated
// minutes (4 compounds × 3 sets × 180s rest ≈ 52min never reaches 35). For a user hard
// cap ONLY, EVERY position floors at HARDCAP_MIN_SETS (2) — including the lead compound —
// so the session can shave to a real ~2-set superset density that fits the user's minutes.
// hardCap=false → the persona-cap behavior is byte-identical (idx 0 / tier-1 → 3).
function trimSetFloor(ex: TrimmableExercise, idx: number, hardCap: boolean): number {
  if (hardCap) return HARDCAP_MIN_SETS;
  return idx === 0 ? COMPOUND_MIN_SETS : compoundSetFloor(ex);
}

// FOCUS-FLOOR DROP-GUARD (dp_split_rebalance_v1) — build the predicate the time-budget
// trim consults so a slot-starved full-body FOCUS day never gets a maintained MAJOR
// region zeroed by the BLIND tail-first drop. The buildSession slot-guarantee places a
// floor slot for each de-emphasized major region + each emphasized arm head, but those
// land in the TAIL (compounds lead), so the time-trim was dropping the sole leg / sole
// biceps slot — the exact orphan the /10 eval flagged (v-taper legs=0, arms biceps=0).
//
// Two protected notions, each evaluated against the trim's CURRENT list so a region with
// a SURPLUS still yields it (only the LAST slot is held):
//  • a de-emphasized REGION (v-taper/upper → legs = quads+hams+glutes+calves) keeps ≥1
//    slot of the WHOLE region;
//  • a SIGNATURE GROUP kept individually (arms → biceps + triceps, so the 2nd arm head
//    is never squeezed out by the 1st).
// The group of an exercise is its library muscle_target_primary (RO Big-11). Returns
// null when there is nothing to protect (balanced / no de-emphasis & not arms) → the
// trim runs byte-identical. RO group keys.
const ARMS_SIGNATURE_GROUPS: ReadonlyArray<string> = ['biceps', 'triceps'];
function buildFocusFloorDropGuard(
  focusPreset: string | null | undefined,
  // #R6b — spate (disc/lower-back) injury active this session. When true, the
  // hamstring leg-curl guarantee (sessionBuilder) seated a spine-neutral Leg Curl as
  // the ONLY safe hamstring mover (the whole hinge/erector family is excluded). It
  // lands in the tail (an isolation behind the lead compounds), so the blind tail-
  // first time-trim would drop it → re-orphan hamstrings (the 14/32 p7 hams=0). Hold
  // its LAST hams slot here so the backfill survives the trim. Off → no extra hold.
  spateInjured = false,
): ((list: ReadonlyArray<TrimmableExercise>, idx: number) => boolean) | null {
  // Region = the de-emphasized groups as ONE protected region (keep ≥1 of the set).
  const region = [...resolveDeEmphasizedGroups(focusPreset)];
  // Per-group protected signatures: arms keeps biceps + triceps individually.
  const perGroup = focusPreset === 'arms' ? [...ARMS_SIGNATURE_GROUPS] : [];
  // EMPHASIZED-SIGNATURE LEAD (2026-06-13) — the user's emphasized look groups must
  // remain the day's volume signature, so the blind tail-first trim never drops the
  // emphasized width work below a NON-focus competitor. A shoulders focus's UPPER/PUSH
  // day otherwise loses its lateral + rear-delt (the tail, behind the compounds) to the
  // trim while two back compounds survive → back ~12 out-volumes umeri ~6 (eval p7/p9
  // @4-5d INVERTED). The emphasized group's slot is held whenever dropping it would let
  // its count fall to OR below the largest non-emphasized group's count, so the focus
  // leads on slot-count (and thus weekly volume). Non-focus tail accessories are dropped
  // instead; the cap is still met via set-shaves.
  //
  // SCOPED to the UPPER-BODY emphasized groups (umeri/piept/spate) — the only ones that
  // compete on an UPPER/PUSH day where this trim runs. A LEG-emphasized focus (lower)
  // earns its lead from the SPLIT's day allocation (more leg days), NOT the trim, and
  // protecting legs on a lower-focus FULL day would instead drop the sole delt slot
  // (zeroing a non-focus major) — so leg groups are deliberately excluded here. RO keys.
  const UPPER_BODY_EMPH = new Set(['umeri', 'piept', 'spate']);
  const emphSet = new Set(
    [...resolveEmphasizedGroups(focusPreset)].filter((g) => UPPER_BODY_EMPH.has(g)),
  );
  if (region.length === 0 && perGroup.length === 0 && emphSet.size === 0 && !spateInjured) {
    return null;
  }
  const groupOf = (ex: TrimmableExercise): string | undefined =>
    (getExerciseMetadata(ex.engineName ?? ex.name) as
      { muscle_target_primary?: string } | null)?.muscle_target_primary;
  // #R6b — a spine-neutral leg curl (movementKey token `leg-curl` = knee flexion, no
  // axial load) is the ONLY safe hamstring mover under a spate exclusion. Detected by
  // the SAME movementKey vocabulary buildSession uses so the protection never drifts.
  const isLegCurl = (ex: TrimmableExercise): boolean => {
    const name = ex.engineName ?? ex.name;
    const meta = getExerciseMetadata(name);
    return movementKey(name, meta).split('::')[1] === 'leg-curl';
  };
  const regionSet = new Set(region);
  return (list, idx) => {
    const g = groupOf(list[idx]!);
    // (d) spate-injury hamstring backfill: protect the LAST spine-neutral leg-curl
    //     slot so the trim cannot re-orphan hamstrings (a surplus 2nd leg curl still
    //     yields). Evaluated before the group gate so it holds regardless of how the
    //     leg curl's primary group resolves in the library.
    if (spateInjured && isLegCurl(list[idx]!)) {
      const legCurlCount = list.reduce((n, e) => n + (isLegCurl(e) ? 1 : 0), 0);
      if (legCurlCount <= 1) return true;
    }
    if (!g) return false;
    // (a) per-group signature floor: this group's LAST slot is protected.
    if (perGroup.includes(g)) {
      const count = list.reduce((n, e) => n + (groupOf(e) === g ? 1 : 0), 0);
      if (count <= 1) return true;
    }
    // (b) de-emphasized region floor: the region's LAST slot (any region group) is
    //     protected — dropping it would zero the whole maintained region.
    if (regionSet.has(g)) {
      const regionCount = list.reduce((n, e) => {
        const eg = groupOf(e);
        return n + (eg && regionSet.has(eg) ? 1 : 0);
      }, 0);
      if (regionCount <= 1) return true;
    }
    // (c) emphasized-signature lead: an emphasized group keeps enough slots to stay
    //     the day's volume leader — hold its slot while dropping it would tie/trail
    //     the largest NON-emphasized group on the current list. (A surplus emphasized
    //     slot beyond that lead still yields, so the cap can be met.)
    if (emphSet.has(g)) {
      const counts = new Map<string, number>();
      for (const e of list) {
        const eg = groupOf(e);
        if (eg) counts.set(eg, (counts.get(eg) ?? 0) + 1);
      }
      const emphCount = counts.get(g) ?? 0;
      let maxNonEmph = 0;
      for (const [grp, n] of counts) {
        if (!emphSet.has(grp) && n > maxNonEmph) maxNonEmph = n;
      }
      // Dropping this slot → emphCount-1; protect while that would not stay strictly
      // above the largest non-focus group (the emphasized region must LEAD).
      if (emphCount - 1 <= maxNonEmph) return true;
    }
    return false;
  };
}

/**
 * Bound a built session by a persona-aware TIME budget (rest-inclusive).
 *
 * When the session's rest-inclusive duration (computeEstimatedDurationMin)
 * exceeds the persona HARD cap, trim volume until it fits — shaving sets from /
 * dropping the LOWEST-priority exercises FIRST. The session list is already
 * priority-ordered (buildSession → prioritizeWeakGroups puts weak / priority /
 * imbalance-corrected groups at the FRONT), so the trim walks the TAIL and never
 * touches the front: priority/weak groups always survive ("the whole workout
 * optimized and maximized, don't gut the important part").
 *
 * Trim order is COMPOUND-PROTECTIVE — it removes whole TAIL accessories before
 * it ever crushes the FRONT compounds' set counts, so a tight cap yields 2-3
 * REAL lifts (e.g. ~[4,3]) instead of a flat [2,2,2,2,2] of token exercises.
 * Repeated until duration ≤ cap or a floor is hit:
 *   1. Stop once the projected session would fall under MIN_SESSION_MIN.
 *   2. Shave ONE set off the LAST exercise IF it still has > MIN_SETS_PER_EX
 *      (gentle single-set shaves for small overshoots — tail first).
 *   3. ELSE (last exercise already at the set floor) DROP the LAST exercise,
 *      but only while length > MIN_EXERCISES_FLOOR. Dropping tail accessories
 *      keeps the front compounds at full set counts.
 *   4. ELSE (at the exercise floor AND last exercise at the set floor) as a
 *      LAST RESORT shave the last exercise above its floor scanning from the
 *      end — but never shave index 0 (top compound) below COMPOUND_MIN_SETS.
 *      If nothing remains shavable/droppable, break (accept a session slightly
 *      over the cap; MIN_SESSION_MIN keeps the chassis minimum alive — M1/M2
 *      re-balance over the week).
 *
 * Pure + deterministic: same persona + warmup + exercises → identical result.
 * No random, no wall-clock. A session already under the cap (or a tiny/empty
 * one the floor protects) is returned UNCHANGED.
 *
 * @param exercises priority-ordered planned exercises (front = highest priority)
 * @param warmupMin warmup minutes folded into the rest-inclusive duration
 * @param capMin persona hard time cap (minutes)
 */
export function trimSessionToTimeBudget(
  exercises: ReadonlyArray<TrimmableExercise>,
  warmupMin: number,
  capMin: number,
  // FOCUS-FLOOR DROP-GUARD (dp_split_rebalance_v1) — when supplied, an exercise that
  // is the LAST remaining carrier of a protected MAJOR-muscle REGION (a de-emphasized
  // region the slot-guarantee maintained at its floor) or a protected SIGNATURE GROUP
  // (arms → biceps/triceps) must NOT be dropped by step 3: dropping the sole leg /
  // sole biceps slot on a slot-starved full-body FOCUS day is exactly the orphan the
  // /10 eval flagged. The guard ONLY blocks the DROP step (sets can still be shaved to
  // the floor); the trim still meets the time cap via set-shaves + dropping NON-protected
  // tail work. undefined (flag OFF / balanced / no de-emphasis) → no protection →
  // byte-identical to the pre-guard trim. `dropProtected(list, idx)` returns true when
  // removing list[idx] would orphan a protected region/group in the CURRENT list.
  dropProtected?: (list: ReadonlyArray<TrimmableExercise>, idx: number) => boolean,
  // HARD USER TIME-CAP (dp_hard_time_cap_v1) — true when `capMin` is a USER-STATED hard
  // budget (workoutStore.sessionTimeBudgetMin), distinct from the persona-derived cap.
  // The persona cap keeps a comfortable floor (>=4 ex / per-position sets / >=25min) so a
  // high-volume day trims to a REAL session, never a stub — a GOOD default. But that floor
  // STOPS the trim short of a tight user budget (4 heavy compounds at 3 sets, 180s rests
  // ≈ 52min never reaches 35), the /10 eval's "~50% over a hard 35-min cap" defect. When
  // true, the floors PIERCE down to HARDCAP_MIN_EXERCISES (3) / HARDCAP_MIN_SETS (2) /
  // HARDCAP_MIN_SESSION_MIN (20) so the session actually FITS the user's minutes — a real
  // compound-dense ~35-min superset day, not a stub. The FOCUS is still protected: the
  // drop-guard above keeps the focus / maintained-major's last slot present even in the
  // shrunk session. false / omitted → the persona-cap floor (byte-identical pre-fix trim).
  hardCap: boolean = false,
): TrimmableExercise[] {
  const out: TrimmableExercise[] = exercises.map((e) => ({ ...e }));
  if (out.length === 0) return out;

  // Hard-cap-aware floors: a USER-stated tight budget pierces the persona floor so the
  // session fits the stated minutes; otherwise the persona floor holds (byte-identical).
  const minExercises = hardCap ? HARDCAP_MIN_EXERCISES : MIN_EXERCISES_FLOOR;
  const minSessionMin = hardCap ? HARDCAP_MIN_SESSION_MIN : MIN_SESSION_MIN;

  // F6c #12 — when ON, the DROP step (3) removes the lowest stimulus/min tail
  // candidate instead of strictly the positional last (denser remaining session).
  // OFF → strict tail-first (out.pop) → byte-identical.
  const stimulusTrimOn = isEnabled('dp_stimulus_per_min_v1');
  // No guard supplied (flag OFF / no focus) → a predicate that protects NOTHING, so
  // every branch below is byte-identical to the pre-guard trim.
  const isDropProtected =
    typeof dropProtected === 'function'
      ? dropProtected
      : () => false;

  // computeEstimatedDurationMin returns null only for an empty/zero session;
  // the floor protects that (we never trim a session already at/under floor).
  const duration = (list: ReadonlyArray<TrimmableExercise>): number =>
    computeEstimatedDurationMin(list, warmupMin) ?? 0;

  // Deterministic guard — every pass either shaves one set or drops one
  // exercise (both monotonic volume reductions), so the loop strictly shrinks
  // each pass; the bound is a hard ceiling against any future non-monotonic
  // edit (never an expected exit). The drop path can run once per exercise on
  // top of the per-exercise set shaves, so the bound scales with both.
  let guard = 0;
  const maxIterations = out.length * 10 + 10;

  while (duration(out) > capMin && guard < maxIterations) {
    guard += 1;

    // 1) Never trim below the chassis minimum session (the user-hard-cap path uses
    //    a tighter floor so a stated 35-min budget is actually reachable).
    if (duration(out) <= minSessionMin) break;

    const last = out.length - 1;

    // 2) Gentle single-set shave off the LAST (lowest-priority) exercise while
    //    it is above the set floor — preserves the good behavior for small
    //    overshoots without touching the front compounds.
    //    F6c #12: when ON, shave the LOWEST stimulus/min TAIL exercise still above
    //    the floor (positions >= MIN_EXERCISES_FLOOR) instead of strictly the last,
    //    so set-volume is shed from the least-dense work first and the high-stimulus
    //    compounds keep their sets. OFF → the last (legacy) → byte-identical. The
    //    front prefix (< MIN_EXERCISES_FLOOR) is never shaved here (only the last-
    //    resort step 4 may touch it, exactly as before).
    if (stimulusTrimOn) {
      let shaveIdx = -1;
      let lowest = Infinity;
      for (let i = out.length - 1; i >= minExercises; i -= 1) {
        if (out[i]!.sets > trimSetFloor(out[i]!, i, hardCap)) {
          const spm = stimulusPerMin(out[i]!);
          if (spm < lowest) { lowest = spm; shaveIdx = i; }
        }
      }
      // No tail candidate above the floor → fall back to the legacy last-position
      // shave (covers the case where the only shavable rows are in the front prefix,
      // handled identically to OFF below).
      if (shaveIdx >= 0) {
        out[shaveIdx] = { ...out[shaveIdx]!, sets: out[shaveIdx]!.sets - 1 };
        continue;
      }
    }
    if (out[last]!.sets > trimSetFloor(out[last]!, last, hardCap)) {
      out[last] = { ...out[last]!, sets: out[last]!.sets - 1 };
      continue;
    }

    // 3) Last exercise already at the set floor — DROP it (a whole tail
    //    accessory) instead of crushing the front compounds, but never below
    //    the exercise floor. This is what keeps the front sets healthy. (The
    //    user-hard-cap path may drop to a tighter 3-exercise floor so a stated
    //    tight budget is reachable; the focus drop-guard still protects the focus.)
    if (out.length > minExercises) {
      // FOCUS-FLOOR DROP-GUARD — never DROP an exercise whose removal would orphan a
      // protected de-emphasized region / signature group (the last leg / last biceps
      // slot the slot-guarantee maintained). dropProtected reads the CURRENT list so a
      // region with TWO slots still yields its surplus; only the floor slot is held.
      // OFF (no guard) → isDropProtected is always false → identical drop selection.
      // F6c #12 — STIMULUS-per-minute drop: instead of strictly the positional
      // last, drop the LOWEST stimulus/min candidate among the TRIMMABLE TAIL
      // (positions >= MIN_EXERCISES_FLOOR — the FRONT prefix that the floor keeps
      // is priority/weak and is never a drop candidate), so the remaining session
      // is denser. Behind dp_stimulus_per_min_v1 (default OFF) → strict tail-first
      // (out.pop()) → byte-identical. A density tie → the positionally-last (keeps
      // the legacy ordering deterministic).
      let dropIdx = -1;
      if (stimulusTrimOn) {
        let lowest = Infinity;
        for (let i = out.length - 1; i >= minExercises; i -= 1) {
          if (isDropProtected(out, i)) continue; // floor slot — never dropped
          const spm = stimulusPerMin(out[i]!);
          // strict < keeps the positionally-last on a density tie (legacy determinism).
          if (spm < lowest) { lowest = spm; dropIdx = i; }
        }
        // No guard supplied → the loop always finds a candidate (identical to before);
        // the default `last` baseline is set only when nothing was protected-out.
        if (dropIdx < 0 && typeof dropProtected !== 'function') dropIdx = out.length - 1;
      } else {
        // Strict tail-first: drop the LAST non-protected exercise in the trimmable tail.
        for (let i = out.length - 1; i >= minExercises; i -= 1) {
          if (isDropProtected(out, i)) continue;
          dropIdx = i; break;
        }
        if (dropIdx < 0 && typeof dropProtected !== 'function') dropIdx = out.length - 1;
      }
      if (dropIdx >= 0) {
        out.splice(dropIdx, 1);
        continue;
      }
      // Every trimmable-tail candidate is a protected floor slot → do NOT force a drop
      // that would orphan a region. Fall through to step 4 (shave a set) so the cap is
      // still pursued without zeroing a maintained major.
    }

    // 4) At BOTH floors (exercise floor + last exercise at set floor). Last
    //    resort: shave the last exercise still above its floor, scanning from
    //    the end — but never shave index 0 (top compound) below
    //    COMPOUND_MIN_SETS. If everything left is protected, break (accept a
    //    session slightly over the cap; the chassis minimum survives and M1/M2
    //    re-balance over the week).
    let shaved = false;
    for (let i = out.length - 1; i >= 0; i -= 1) {
      const setFloor = trimSetFloor(out[i]!, i, hardCap);
      if (out[i]!.sets > setFloor) {
        out[i] = { ...out[i]!, sets: out[i]!.sets - 1 };
        shaved = true;
        break;
      }
    }
    if (!shaved) break;
  }

  return out;
}

/**
 * F2 #4 — RECONCILE the in-session ±% weight scale FACTORS from the Energy
 * Adjustment engine output, replacing the flat ×0.8 / ×1.15 constants Workout.tsx
 * used. This is NOT a third multiplier and NOT a new trigger: the caller's
 * intensityMod 3-state still GATES whether any scale happens — this only supplies
 * the MAGNITUDE. When the engine emits a DOWN direction with a real magnitude the
 * 'minus' factor becomes (1 − |pct|) (engine |pct| ≤ 0.15, so a SMALLER cut than
 * the old flat 0.8); UP supplies the 'plus' factor (1 + |pct|, ≤ 1.15, never a
 * bigger push). Absent / NONE direction → the legacy constant (byte-identical).
 * Pure.
 *
 * @param energyAdjustment engine direction + tier-gated magnitude, or null
 * @returns { minus, plus } the multipliers for the intensityMod 'minus'/'plus' scale
 */
export function resolveIntensityFactors(
  energyAdjustment: { direction: 'UP' | 'DOWN' | 'NONE'; magnitudePct: number } | null,
): { minus: number; plus: number } {
  const mag =
    energyAdjustment && Number.isFinite(energyAdjustment.magnitudePct)
      ? Math.abs(energyAdjustment.magnitudePct)
      : 0;
  return {
    minus: energyAdjustment?.direction === 'DOWN' && mag > 0 ? 1 - mag : 0.8,
    plus: energyAdjustment?.direction === 'UP' && mag > 0 ? 1 + mag : 1.15,
  };
}

/**
 * F2 #1 — apply the readiness verdict's GRADED volumeMultiplier to the session
 * set counts. readiness.js getReadinessVerdict() emits a per-band multiplier
 * (PR_DAY 1.1 / NORMAL·SOLID 1.0 / MODERATE 0.85 / LIGHT 0.7 / REST 0) that was
 * COMPUTED but never consumed — the only live readiness effect was the binary
 * dp.js < 60 weight-HOLD cliff, so MODERATE vs LIGHT produced zero plan
 * difference. This scales SETS (Path A — dimensionally safe), NOT weight: the
 * cliff still owns the load (kg). multiplier 1.0 → byte-identical. Floored at
 * MIN_SETS_PER_EX (the same trim floor) so a tired day never guts a lift below
 * one real working set; rounded to whole sets. score null (no energy-check) →
 * verdict.volumeMultiplier 1.0 → no change. Applied BEFORE the time-budget trim
 * so the trim measures the readiness-scaled session. Pure + deterministic.
 *
 * @param exercises planned exercises (sets to scale)
 * @param readinessScore live readiness score, or null (no energy-check today)
 */
export function scaleSetsByReadiness(
  exercises: ReadonlyArray<TrimmableExercise>,
  readinessScore: number | null,
): TrimmableExercise[] {
  const { volumeMultiplier } = getReadinessVerdict(readinessScore);
  // 1.0 (NORMAL / no-score) or a non-positive/non-finite guard → no-op
  // (REST = 0 is a rest day the pipeline already filters upstream; never gut to
  // zero here). Identity keeps the common case byte-identical.
  if (!Number.isFinite(volumeMultiplier) || volumeMultiplier <= 0 || volumeMultiplier === 1) {
    return exercises.map((e) => ({ ...e }));
  }
  return exercises.map((e) => ({
    ...e,
    sets: Math.max(MIN_SETS_PER_EX, Math.round(e.sets * volumeMultiplier)),
  }));
}

/**
 * #76 — energy → VOLUME modulation (magnitude-aware). Scales the session set
 * counts by the deficit/surplus MAGNITUDE-derived volumeFactor (energyVolumeFactor,
 * dp/ceiling.js): a deeper deficit cuts volume toward −30% (recovery impaired), a
 * surplus allows a small extra tolerance toward +10% (MRV-bounded). This is the
 * DEEPER half of the nutrition→workout bridge — #37 only throttles the LOAD climb
 * rate; this throttles the VOLUME, scaled by severity.
 *
 * CRITICAL INVARIANT — KEEP LOAD: this scales ONLY sets (path A — the same
 * dimension scaleSetsByReadiness owns); the prescribed targetKg/targetReps are
 * passed through UNTOUCHED. Heavy load preserves muscle in a deficit; nutrition
 * modulates volume + fatigue-management, never the kg.
 *
 * MEV floor conserved: sets are floored at MIN_SETS_PER_EX (the same floor the
 * readiness scaler + trim use) so a deep cut never guts a lift below one real
 * working set. Composes MIN-style with readiness in practice (applied AFTER the
 * readiness scale, on its already-reduced sets) so the two never double-cut
 * catastrophically below the floor. Behind dp_energy_volume_v1 (default OFF) →
 * magnitude null OR factor 1.0 → byte-identical. Pure + deterministic.
 *
 * @param exercises planned exercises (sets to scale; kg/reps untouched)
 * @param volumeFactor the energyVolumeFactor multiplier (1.0 = no change)
 */
export function scaleSetsByEnergy(
  exercises: ReadonlyArray<TrimmableExercise>,
  volumeFactor: number,
  emphasizedGroups?: ReadonlySet<string> | null,
): TrimmableExercise[] {
  // 1.0 / non-positive / non-finite guard → identity (byte-identical common case).
  if (!Number.isFinite(volumeFactor) || volumeFactor <= 0 || volumeFactor === 1) {
    return exercises.map((e) => ({ ...e }));
  }
  // #70-D1 — EMPHASIS FLOOR: the deficit volume cut must COMPOSE with the
  // composition cuts (emphasis / coherent-alloc already trimmed sets upstream), not
  // STACK on top and drag an EMPHASIZED group BELOW its band. The composition-core
  // already lands the v-taper back at its band (≈20); a further −30% energy cut then
  // pulled it to ≈14 (under the muscle-preserving cut band — the gold _REF cut band
  // is 16-20). In a deficit the EMPHASIZED muscle is exactly the one to PRESERVE
  // (cut the rest of the session's volume, keep the priority work), so an exercise
  // whose PRIMARY muscle is emphasized is FLOORED at its pre-cut sets — the cut
  // trims toward the floor, never through it. Non-emphasized groups take the full
  // cut, so the deficit still reduces overall session volume (KEEP-LOAD intact —
  // sets only). No emphasized set / no focus → identical to the plain cut.
  const emphSet = emphasizedGroups ?? null;
  const isEmphasized = (e: TrimmableExercise): boolean => {
    if (!emphSet || emphSet.size === 0) return false;
    const meta = getExerciseMetadata(e.engineName ?? e.name) as { muscle_target_primary?: string } | null;
    const g = meta?.muscle_target_primary;
    return typeof g === 'string' && emphSet.has(g);
  };
  return exercises.map((e) => {
    // #1 — a non-emphasized tier-1 COMPOUND floors at 3 (main lift keeps its dose in a
    // cut); an emphasized group floors at its pre-cut sets (priority muscle preserved);
    // everything else takes the full cut down to MIN_SETS_PER_EX. KEEP-LOAD intact.
    const lo = isEmphasized(e) ? e.sets : compoundSetFloor(e);
    const sets = Math.max(lo, Math.round(e.sets * volumeFactor));
    return {
      ...e,
      // KEEP-LOAD: only sets move. targetKg / targetReps pass through unchanged.
      sets,
    };
  });
}

/**
 * #76 — fold the energy-derived RIR shift into a Goal-Adaptation rir_target_modifier
 * [min,max] band. A deeper deficit pushes FURTHER from failure (positive shift →
 * higher RIR target); a surplus trains slightly CLOSER (negative shift). The band
 * is the DISPLAY/intensity-label channel only (dp.js getSmartRecommendation uses it
 * for the label, NEVER the kg) — so the KEEP-LOAD invariant holds. When no base
 * band exists the shift seeds one from a sane default RIR; rirShift 0 → the base
 * band unchanged (byte-identical). Floored at RIR ≥ 0. Pure.
 *
 * @param base the existing rirTargetModifier band (or null)
 * @param rirShift the energyVolumeFactor RIR shift (reps; + = further from failure)
 */
export function shiftRirBand(
  base: readonly [number, number] | null,
  rirShift: number,
): readonly [number, number] | null {
  if (!Number.isFinite(rirShift) || rirShift === 0) return base;
  // Default band when none supplied — a moderate hypertrophy 1-2 RIR target, the
  // baseline the engine trains toward; the shift moves it from there.
  const [lo, hi] = base ?? [1, 2];
  return [Math.max(0, lo + rirShift), Math.max(0, hi + rirShift)];
}

/**
 * Phase 6 task_02 real wire. Async pipeline consumer — caller (5 consumers
 * React) handles loading state via useState + useEffect pattern. Returns
 * null pe rest day OR pipeline hard halt OR thrown exception (fail-silent).
 */
export async function composePlannedWorkoutToday(
  now: Date = new Date(),
  options: { differentMuscle?: boolean } = {},
): Promise<PlannedWorkoutOutput | null> {
  try {
    const userState = buildUserStateForPipeline();
    // "Different group" ephemeral override threaded into the engine (the engine
    // swaps today's scheduled cluster for the most-recovered alternative, in-memory
    // only). Default {} → byte-identical to the prior single-arg behavior.
    const plan = await getDailyWorkout(userState, now, options);
    if (plan === null) return null;
    // Signal-bus sink (dev-gated, default OFF → no-op). The engine attaches the
    // PURE computed-vs-applied trace as an additive `__signalTrace` field; only
    // this React boundary persists it (engine stays React-free).
    signalBus.record((plan as { __signalTrace?: SessionSignalTrace }).__signalTrace);
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
    // F2 #2 — Goal Adaptation rep + RIR modifiers ([min,max] bands, session-level).
    // Same guard as restRange: only a finite [min,max] pair is threaded; anything
    // else → null → DP keeps its phase-aware default band + rir-derived label.
    const repRangeRaw = plan.repRangeModifier as [number, number] | null | undefined;
    const repRangeMod =
      Array.isArray(repRangeRaw) &&
      repRangeRaw.length >= 2 &&
      Number.isFinite(repRangeRaw[0]) &&
      Number.isFinite(repRangeRaw[1])
        ? repRangeRaw
        : null;
    const rirRangeRaw = plan.rirTargetModifier as [number, number] | null | undefined;
    const rirTargetModBase =
      Array.isArray(rirRangeRaw) &&
      rirRangeRaw.length >= 2 &&
      Number.isFinite(rirRangeRaw[0]) &&
      Number.isFinite(rirRangeRaw[1])
        ? (rirRangeRaw as readonly [number, number])
        : null;
    // #76 — resolve the active energy MAGNITUDE (phase + deficit/surplus severity)
    // ONCE, behind dp_energy_volume_v1 (default OFF → null → no modulation). It feeds
    // BOTH the per-exercise RIR shift (folded into the rir band below) AND the
    // session-volume scale (scaleSetsByEnergy after the readiness scale). The
    // magnitude comes from the coherent kcal-sizing model (resolveEnergyMagnitude) —
    // sessionBuilder/dp never import nutrition; the resolved {phase,severity} token
    // is passed read-only. Flag OFF → null → factor 1.0 + rirShift 0 → byte-identical.
    const energyMagnitude = isEnabled('dp_energy_volume_v1') ? resolveEnergyMagnitude() : null;
    const energyMod = energyMagnitude ? energyVolumeFactor(energyMagnitude) : null;
    // RIR shift folded into the rir DISPLAY band only (never the kg — KEEP-LOAD). 0
    // shift / no magnitude → the base band unchanged (byte-identical).
    const rirEnergyMod = energyMod
      ? shiftRirBand(rirTargetModBase, energyMod.rirShift)
      : rirTargetModBase;
    // W-Meso — intra-block RIR ramp (dp_meso_rir_v1, default OFF). The mesocycle
    // phase (LOAD/LOAD+/PEAK/DELOAD) shifts the rir DISPLAY band so the early weeks
    // run HIGHER RIR (more in reserve) ramping to LOWER RIR at PEAK — the standard
    // accumulation→intensification feel. Folded through the SAME shiftRirBand
    // channel as #76 (label only, never the kg — KEEP-LOAD invariant). DELOAD →
    // shift 0 (the deload machinery already owns its recovery cut). Flag OFF / no
    // phase / shift 0 → the band passes through unchanged (byte-identical).
    const mesoPhase = plan.mesocyclePhase as 'LOAD' | 'LOAD+' | 'PEAK' | 'DELOAD' | null | undefined;
    const mesoRirShift =
      isEnabled('dp_meso_rir_v1') && typeof mesoPhase === 'string' ? phaseRirShift(mesoPhase) : 0;
    const rirTargetMod =
      mesoRirShift !== 0 ? shiftRirBand(rirEnergyMod, mesoRirShift) : rirEnergyMod;
    // F3 #6 — Periodization %1RM intensity corridor {floor,ceiling}. Same guard:
    // only a finite floor<=ceiling pair is threaded; anything else → null → DP
    // no-op. Behind dp_intensity_corridor_v1 (default OFF) DP bounds the prescribed
    // kg's implied %1RM into this band.
    const corridorRaw = plan.intensityCorridor as { floor?: number; ceiling?: number } | null | undefined;
    const intensityCorridor =
      corridorRaw &&
      Number.isFinite(corridorRaw.floor) &&
      Number.isFinite(corridorRaw.ceiling) &&
      (corridorRaw.floor as number) > 0 &&
      (corridorRaw.ceiling as number) >= (corridorRaw.floor as number)
        ? { floor: corridorRaw.floor as number, ceiling: corridorRaw.ceiling as number }
        : null;
    // F-workout-preview/T1 — Engine Warm-up blueprint surface. Engine emits
    // duration_min (5-10 adaptive) + ui_label "Incalzire ~X min" via
    // src/engine/warmup/index.js:289-300. Map to consumer-friendly {line,
    // durationMin}. Null when ui_label missing/empty (defensive guard). Resolved
    // BEFORE the time-budget trim so its minutes fold into the rest-inclusive
    // duration the trim measures against (warmup counts toward the session cap).
    const warmupRaw = plan.warmup as { duration_min?: number; ui_label?: string } | null;
    const warmupLine = typeof warmupRaw?.ui_label === 'string' ? warmupRaw.ui_label : '';
    const warmupDuration = typeof warmupRaw?.duration_min === 'number' ? warmupRaw.duration_min : 0;
    const warmup = warmupRaw !== null && warmupLine.length > 0
      ? { line: warmupLine, durationMin: warmupDuration }
      : null;
    // F2 #3 — Tempo session-level cue. The Tempo engine's preSetIntro (notation +
    // form cue, persona-aware) was computed but dropped. Surfaced as a UNIFORM
    // session narration (per-exercise movementId is a Faza-3 input dep — the
    // engine emits one generic cue, so a per-exercise cue would be faked). Display
    // only — touches NO weight/sets/reps. Null when the line is empty/absent.
    const tempoRaw = plan.tempoCue as {
      line?: string | null;
      notation?: string | null;
      cueId?: string | null;
      persona?: string | null;
    } | null;
    const tempoLine = typeof tempoRaw?.line === 'string' ? tempoRaw.line : '';
    const tempoCue =
      tempoRaw !== null && tempoLine.length > 0
        ? {
            line: tempoLine,
            notation: typeof tempoRaw?.notation === 'string' ? tempoRaw.notation : null,
            // Structured fields for locale-aware rendering (the render boundary
            // localizes cueId via i18n; `line` is the back-compat fallback only).
            cueId: typeof tempoRaw?.cueId === 'string' ? tempoRaw.cueId : null,
            persona: typeof tempoRaw?.persona === 'string' ? tempoRaw.persona : null,
          }
        : null;
    // F2 #4 — Energy Adjustment reconcile passthrough (direction + tier-gated
    // magnitude). Surfaced unchanged so Workout.tsx can use the engine magnitude
    // in place of the flat ±% constants (NOT a new multiplier). Guard the shape;
    // only a UP/DOWN direction with a finite magnitude in the engine band is kept,
    // else null → Workout.tsx falls back to the legacy constant (byte-identical).
    const energyRaw = plan.energyAdjustment as { direction?: string; magnitudePct?: number } | null;
    const energyDir =
      energyRaw?.direction === 'UP' || energyRaw?.direction === 'DOWN' ? energyRaw.direction : 'NONE';
    const energyMag = Number(energyRaw?.magnitudePct);
    const energyAdjustment =
      energyDir !== 'NONE' && Number.isFinite(energyMag) && energyMag !== 0
        ? { direction: energyDir as 'UP' | 'DOWN', magnitudePct: energyMag }
        : null;
    const planExercises = plan.exercises ?? [];
    const mapped = planExercises.map((ex, idx) =>
      // priorExercises = the exercises positioned BEFORE this one in today's plan,
      // so a small-muscle isolation later in the session is discounted for the
      // synergist load the earlier compounds already imposed on it (intra-session
      // pre-fatigue). idx 0 → [] → no discount (nothing precedes it).
      toPlannedExercise(
        ex,
        idx,
        experienceEn,
        readinessScore,
        restRange,
        coldStartProfile,
        planExercises.slice(0, idx),
        { repRange: repRangeMod, rirTarget: rirTargetMod, intensityCorridor },
      ),
    );
    // Persona-aware TIME budget — bound the session by a realistic, rest-
    // inclusive duration. resolvePersonaId reads user.persona / age (the same
    // userState slice the pipeline + specialization Gate 1 consume); null/unknown
    // → gigica. The trim is a pure tail-first transform: it shaves sets from /
    // drops the LOWEST-priority (TAIL) exercises until the session fits the hard
    // cap, never touching the FRONT priority/weak/imbalance groups, and never
    // below the floor (~4 exercises / 2 sets / ~25min). Warmup is folded into the
    // duration the trim measures against (rest-inclusive, same estimator).
    // Mirror the builder's persona resolution exactly (meta.persona Gate 1):
    // pass age ONLY when it is a real number, else {} → resolvePersonaId default
    // 'gigica'. A null age must NOT coerce to 0 (Number(null)=0 → marius); the
    // {} guard keeps an empty/cold-start user on the conservative gigica cap.
    const personaUser = userState.user as { persona?: string; age?: unknown };
    const personaAge = Number(personaUser.age);
    const personaId = resolvePersonaId(
      typeof personaUser.persona === 'string'
        ? { persona: personaUser.persona }
        : Number.isFinite(personaAge)
          ? { age: personaAge }
          : {},
    );
    // Fatigue-aware cap: scale the flat persona ceiling by the session's
    // systemic fatigue cost (clusterFatigueFactor) — a LEGS/LOWER day caps lower
    // than an UPPER/PUSH/PULL day at the SAME persona (heavy lower-body = CNS +
    // systemic load + long rests). plan.sessionType is the engine's day-of-week
    // tag (PUSH/PULL/LEGS/LOWER/UPPER/FULL). Missing/unknown → factor 1.0 →
    // identical to the flat cap. Round so the cap stays a whole-minute ceiling.
    const sessionTypeTag = typeof plan.sessionType === 'string' ? plan.sessionType : null;
    const personaFatigueCap = Math.round(
      personaTimeCapMin(personaId) * clusterFatigueFactor(sessionTypeTag),
    );
    // User-chosen pre-session TIME budget ("I only have N min today", EnergyCheck).
    // It only ever SHRINKS the cap — min(personaFatigueCap, userTimeMin) — never
    // EXTENDS past the persona/fatigue ceiling (safety: a generous user choice
    // can't blow past the realistic load the persona model allows). null / unset
    // → byte-identical to the prior persona+fatigue-derived cap. The trim floor
    // (>=4 ex / >=2 sets / >=25 min) still protects an impossibly-short pick.
    const userTimeMin = useWorkoutStore.getState().sessionTimeBudgetMin;
    const hasUserTimeCap =
      typeof userTimeMin === 'number' && Number.isFinite(userTimeMin) && userTimeMin > 0;
    const timeCapMin = hasUserTimeCap
      ? Math.min(personaFatigueCap, userTimeMin as number)
      : personaFatigueCap;
    // HARD USER TIME-CAP fit (dp_hard_time_cap_v1) — the persona-derived floor (>=4 ex /
    // per-position sets / >=25min) stops the trim short of a tight USER budget (4 heavy
    // compounds at 3 sets, 180s rests ≈ 52min never reaches a stated 35-min cap — the
    // /10 eval's "~50% over a hard cap" defect). The hard-cap floor-pierce is armed ONLY
    // when (a) the user EXPLICITLY set sessionTimeBudgetMin AND (b) that user budget is
    // the BINDING cap (tighter than the persona/fatigue ceiling — a generous user pick
    // never pierces) AND (c) the flag is ON. Persona-cap-only sessions keep their floor
    // byte-identical; the focus drop-guard still protects the focus in the shrunk session.
    const userHardCap =
      hasUserTimeCap &&
      (userTimeMin as number) <= personaFatigueCap &&
      isEnabled('dp_hard_time_cap_v1');
    // F2 #1 — scale set counts by the readiness verdict's graded volumeMultiplier
    // (LIGHT 0.7 / MODERATE 0.85 / NORMAL 1.0 / PR 1.1), floored at MIN_SETS_PER_EX.
    // This consumes the dropped readiness ramp (Path A — sets, not weight); the
    // dp.js < 60 HOLD cliff still owns the load. Applied BEFORE the trim so the
    // time budget measures the readiness-scaled session. 1.0 → byte-identical.
    const readinessScaled = scaleSetsByReadiness(mapped, readinessScore);
    // #76 — energy → VOLUME modulation (magnitude-aware), applied AFTER the readiness
    // scale (composes MIN-style on its already-reduced sets, so the two never double-
    // cut below the MEV floor) and BEFORE the time-budget trim (so the trim measures
    // the energy-scaled session). A deep deficit cuts toward −30% volume; a surplus
    // allows up to +10%. KEEP-LOAD: only sets move, the prescribed kg is untouched.
    // energyMod null (flag OFF / no magnitude) → factor 1.0 → byte-identical.
    // #70-D1 — the emphasized focus groups (the user's look preset) so the energy
    // cut FLOORS them at their pre-cut sets (preserve the priority muscle in a
    // deficit) instead of dragging the emphasized region below its band. balanced /
    // no focus → empty set → the cut is the plain MIN-compose (byte-identical).
    const emphasizedRoGroups = energyMod
      ? resolveEmphasizedGroups(useOnboardingStore.getState().data.focusPreset)
      : null;
    const energyScaled = energyMod
      ? scaleSetsByEnergy(readinessScaled, energyMod.volumeFactor, emphasizedRoGroups)
      : readinessScaled;
    // FOCUS-FLOOR DROP-GUARD (dp_split_rebalance_v1) — on a slot-limited FOCUS day the
    // BLIND tail-first time-trim dropped the sole maintained leg / sole biceps slot OR
    // the emphasized width work (slot-guarantee + focus-policy place them, but they sit
    // in the tail behind the lead compounds). Build the drop-guard so those FLOOR slots
    // survive the trim. Gated on the split-rebalance flag (forced OFF in fp → undefined
    // → byte-identical). Applies on FULL days (the de-emphasis/region floor — the freq≤3
    // slot-crunch) AND on UPPER/PUSH days (the EMPHASIZED-signature lead — a freq≥4
    // shoulders/chest UPPER day whose lateral/flye otherwise loses to a non-focus 2nd
    // back compound under a tight time cap). PULL/LEGS carry no emphasized upper-body
    // signature, so the guard adds nothing there. balanced / no focus → null → no guard.
    const guardDayType =
      typeof plan.sessionType === 'string' ? plan.sessionType.toUpperCase() : '';
    // #R6b — spate (disc/lower-back) injury active this session (read with the SAME
    // injected clock getDailyWorkout's exclusion uses, so they agree). When ON, the
    // drop-guard ALSO holds the spine-neutral leg-curl backfill through the trim — and
    // because that hold is independent of focus, it builds the guard on a LEG day too
    // (LOWER/LEGS), where a disc user's only safe hamstring mover is most at risk of
    // being trimmed. Gated on dp_legcurl_guarantee_v1 (pinned OFF in fp). No injury →
    // false → byte-identical guard.
    const spateInjured =
      isEnabled('dp_legcurl_guarantee_v1') &&
      contraindicatedGroupsFromPainCdl(now.getTime()).includes('spate');
    const wantsDropGuard =
      (isEnabled('dp_split_rebalance_v1') &&
        (guardDayType === 'FULL' || guardDayType === 'UPPER' || guardDayType === 'PUSH')) ||
      (spateInjured &&
        (guardDayType === 'FULL' || guardDayType === 'LOWER' || guardDayType === 'LEGS'));
    const dropGuard = wantsDropGuard
      ? buildFocusFloorDropGuard(useOnboardingStore.getState().data.focusPreset, spateInjured)
      : null;
    const exercises = trimSessionToTimeBudget(
      energyScaled,
      warmup?.durationMin ?? 0,
      timeCapMin,
      dropGuard ?? undefined,
      userHardCap,
    );
    // WARM-UP RAMP (dp_warmup_ramp_v1, default OFF). The session-level warm-up LINE
    // above ("Incalzire ~X min") is what a clipboard says; a real coach also ramps
    // the day's OPENING compound with ascending primer sets (50/70/90% of the working
    // load). Compute the ramp from the FINAL first exercise (the lead lift survives
    // the tail-first trim, idx 0 keeps its 3-set floor) — ONLY when it is a tier-1,
    // reps-metric, NON-bodyweight lift (a bodyweight/time/carry opener has no working
    // kg to ramp toward). warmupRampFor itself returns [] below its load thresholds.
    // Attached ADDITIVELY to the warmup object (the only consumer is WorkoutPreview;
    // the PlannedExercise rows are untouched, so substitution/volume/duration are
    // byte-identical). Flag OFF / no qualifying opener / empty ramp → field omitted →
    // byte-identical output.
    const lead = exercises[0];
    const leadTier =
      lead != null
        ? (getExerciseMetadata(lead.engineName ?? lead.name) as { tier?: number } | null)?.tier
        : undefined;
    const warmupSets =
      isEnabled('dp_warmup_ramp_v1') &&
      lead != null &&
      leadTier === 1 &&
      !lead.isBodyweight &&
      getMetricType(lead.engineName ?? lead.name) === 'reps'
        ? warmupRampFor(Number(lead.targetKg), { exerciseName: lead.engineName ?? lead.name })
        : [];
    // Deload engine emits intensity_modifier object always (IDLE state =
    // {rir_increment:0, intensity_pct_decrement:0}). 'minus' only when
    // ACTIVE deload (any non-zero modifier field). Phase 7+ wires 'plus'
    // via Energy Adjustment composite output.
    const mod = plan.intensityModifier as { rir_increment?: number; intensity_pct_decrement?: number } | null;
    const hasActiveDeload = mod !== null && (
      (mod.rir_increment ?? 0) > 0 || (mod.intensity_pct_decrement ?? 0) > 0
    );
    // Audit HIGH "0 kg" — tonajul planificat REAL din exercitiile prescrise
    // (sets × targetReps × targetKg), NU hardcode-ul 0 din engine
    // (scheduleAdapter.js volumeKg:0 → WorkoutPreview arata "0 kg" via `0 ?? fb`).
    // Sumam aici (React-side) unde targetKg/targetReps deja reale per exercitiu
    // (DP / cold-start). null cand nu avem exercitii → fallback WorkoutPreview.
    const volumeKg = computePlannedVolumeKg(exercises, coldStartProfile.bodyweightKg);
    // Durata estimata REAL din volumul de seturi + odihna (vs hardcode 50 engine):
    // per set ~ timp sub tensiune/tranzitie + restSec. null cand fara exercitii.
    const estimatedDuration = computeEstimatedDurationMin(exercises, warmup?.durationMin ?? 0);
    // A2.1 — consolidated HONEST decision trace, behind dp_decision_trace_v1 (default
    // ON). Pure derivation over values THIS compose already computed — phase (the
    // active CUT/BULK direction), readiness (the energy-check score), the engine's
    // coachAdaptations log (recovery cuts + emphasis shifts), the active-deload flag,
    // the focus preset, the resolved time cap, the per-exercise DP recReason status
    // tally, and the final plan shape. Each factor is emitted ONLY when its real
    // signal fired (an unfired factor is OMITTED, never fabricated). INERT
    // observability — no UI consumer yet (A2.2) — and invisible to the prescription
    // hash, so it NEVER changes exercises/sets/loads. Flag OFF → field omitted →
    // byte-identical output. resolveActivePhase() is read only when the flag is ON.
    const traceOn = isEnabled('dp_decision_trace_v1');
    const planCoachAdaptations = Array.isArray(
      (plan as { coachAdaptations?: CoachAdaptation[] }).coachAdaptations,
    )
      ? (plan as { coachAdaptations?: CoachAdaptation[] }).coachAdaptations!
      : [];
    const decisionTrace = traceOn
      ? buildDecisionTrace({
          readinessScore,
          phase: resolveActivePhase(),
          energyMagnitude,
          coachAdaptations: planCoachAdaptations,
          deloadActive: hasActiveDeload,
          timeCapMin,
          focusPreset: useOnboardingStore.getState().data.focusPreset ?? null,
          exercises,
          sessionType: typeof plan.sessionType === 'string' ? plan.sessionType : null,
          estimatedDuration: estimatedDuration ?? plan.estimatedDurationMin ?? 50,
        })
      : null;
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
      // Warm-up blueprint. The session-level {line, durationMin} unchanged; the
      // per-set ramp is folded in ADDITIVELY only when it fired (flag ON + a
      // qualifying tier-1 opener above the load threshold). Empty ramp → warmup is
      // the untouched original object (byte-identical). A null warmup with a ramp
      // (no engine line but a qualifying opener) still surfaces the ramp.
      warmup:
        warmupSets.length > 0 ? { ...(warmup ?? { line: '', durationMin: 0 }), warmupSets } : warmup,
      // F2 #3 — session-level tempo/form cue (uniform; display only). Null → the
      // render boundary omits the cue row (graceful, byte-identical to pre-feature).
      tempoCue,
      // F2 #4 — Energy Adjustment reconcile input (direction + magnitude). Null →
      // Workout.tsx keeps the legacy flat ±% constant (byte-identical).
      energyAdjustment,
      // Coach Voice — pass the engine's structured adaptations log through to the
      // CoachTodayCard composer (coachInsight). Tokens only; never copy. Defaults
      // to [] when a (pre-this-feature) plan shape omits it.
      coachAdaptations: Array.isArray((plan as { coachAdaptations?: CoachAdaptation[] }).coachAdaptations)
        ? (plan as { coachAdaptations?: CoachAdaptation[] }).coachAdaptations!
        : [],
      // Intra-week deficit recovery — pass the engine's make-up map through to the
      // CoachTodayCard supportive note. Data only; the card composes the copy.
      // Defaults to empty maps when a (pre-this-feature) plan shape omits it.
      weekMakeup: (plan as { weekMakeup?: { added: Record<string, number>; behind: Record<string, number> } }).weekMakeup
        ?? { added: {}, behind: {} },
      // A2.1 — additive honest decision trace (spread-conditional: omitted entirely
      // when the flag is OFF, exactOptionalPropertyTypes-safe). Never read by any
      // current consumer (A2.2 owns the UX surface) → does not change the plan.
      ...(decisionTrace !== null ? { decisionTrace } : {}),
    };
  } catch (e) {
    logger.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
