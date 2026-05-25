// ══ SCHEDULE ADAPTER AGGREGATE — Phase 6 task_02 Real Wire Async ═════════
// Per DECISIONS.md §D027 STRATEGY LOCKED V1 Option C big-bang async migration.
// Phase 5 task_05 PHASE_5_BASELINE_PUSH stub eliminated. Real pipeline
// invocation via scheduleAdapter.getDailyWorkout(userState, now) async
// (Phase 6 task_01 LANDED runPipeline 8-adapter consumer + sessionBuilder
// delegate).
//
// Returns null when:
//   - Calendar override rest day (selectedDays[dayIdx].active === false)
//   - Pipeline hard halt (Periodization or downstream emit hard error)
//   - getDailyWorkout throws (D4 contract surface defensive)
//
// Returns PlannedWorkoutOutput shape when training day + pipeline complete.
// Async signature consumed via useState + useEffect loading pattern în 5
// React consumers (SessionPill / Workout / WorkoutPreview / PostRpe /
// coachDirectorAggregate).

import { getDailyWorkout } from '../../engine/schedule/scheduleAdapter.js';
import { useWorkoutStore } from '../stores/workoutStore';
import type { LastSessionSummary } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { MS_PER_DAY } from '../../constants.js';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';
import { toExerciseDisplay } from './exerciseDisplay';
import { DP } from '../../engine/dp.js';
import { suggestStartWeight } from '../../engine/coldStartGuidelines.js';

// ── RO onboarding → EN engine vocabulary (CRIT C1) ─────────────────────────
// Onboarding stores experience/goal as RO strings (onboardingStore Experience
// 'incepator'|'intermediar'|'avansat'; Goal 'masa'|'slabire'|...). The engine
// cold-start guideline keys on EN buckets (beginner|intermediate|advanced /
// 'cut'). A naive RO pass silently falls to the x1.0 multiplier default — a
// real bug (avansat would get intermediate weights). Map explicitly at the
// adapter boundary so RO strings NEVER enter the engine.
const EXPERIENCE_RO_TO_EN: Readonly<Record<string, string>> = {
  incepator: 'beginner',
  intermediar: 'intermediate',
  avansat: 'advanced',
};

function experienceToEngine(experience: unknown): string {
  if (typeof experience === 'string' && experience in EXPERIENCE_RO_TO_EN) {
    return EXPERIENCE_RO_TO_EN[experience] as string;
  }
  return 'beginner'; // conservative default (lowest start-weight multiplier)
}

// ── recentSessions engine-shape transform (SHAPE audit Gap HIGH #1) ────────
// LastSessionSummary (UI/persist shape) carries display + numeric session
// fields but NONE of the per-session signal fields engine consumers read off
// recentSessions[*]. Passing summaries raw made periodization/deload/
// energyAdjustment/goalAdaptation dual-signal logic permanently run zero-
// signal baseline (verified: mesocycle.js:93-122 isMariusDualSignalGreen reads
// .rir/.weekIdx; goalAdaptation/pushBackTiers.js:76 + templates.js:49 read
// .daysAgo/.injury; bayesianNutrition/profileTyping.js:129 +
// volumeLandmarks.js:156 read .daysAgo).
//
// toEngineSession derives ONLY fields that have an honest source in the
// summary itself (Bugatti truth + D027 §5 anti-fabrication — NU inventa fields
// care nu exista in store):
//   - daysAgo: floor((now - ts) / day) — exact from summary.ts.
//   - rir: mode per-set rating mapped usor→3 / potrivit→2 / greu→1 (matches
//     SHAPE audit table + suflet rir-matrix.js HEAVY/CHALLENGING/COMFORTABLE
//     rirMin bands). Real per-session effort signal from exercises[*].sets[*].
// energy / injury / weekIdx are NOT derived: energy needs a per-session
// readiness-emoji not captured on the summary, injury is the pain CDL channel
// (separate write path), weekIdx needs a mesocycle anchor absent from the
// store. Engines treat these absent fields as "insufficient data" → conservative
// baseline (no false-positive extension/deload). Deriving them from nothing
// would feed wrong signal — strictly worse than absent.
export interface EngineSession extends LastSessionSummary {
  daysAgo: number;
  rir?: number;
}

const RATING_TO_RIR: Readonly<Record<string, number>> = {
  usor: 3,
  potrivit: 2,
  greu: 1,
};

/**
 * Derive the dominant (mode) per-set rating across a session's exercises,
 * mapped to a baseline RIR. Returns undefined when the summary carries no
 * per-set breakdown (pre-Phase-5 persisted sessions) — engines skip rir-less
 * entries rather than assume a value.
 */
function deriveSessionRir(summary: LastSessionSummary): number | undefined {
  const counts: Record<string, number> = {};
  for (const ex of summary.exercises ?? []) {
    for (const s of ex.sets) {
      counts[s.rating] = (counts[s.rating] ?? 0) + 1;
    }
  }
  let topRating: string | null = null;
  let topCount = 0;
  for (const [rating, n] of Object.entries(counts)) {
    if (n > topCount) {
      topCount = n;
      topRating = rating;
    }
  }
  if (topRating === null) return undefined;
  return RATING_TO_RIR[topRating];
}

/**
 * Pure transform: LastSessionSummary → engine recentSessions[*] shape.
 * Additive — preserves all original summary fields; layers derived signal
 * fields the engine pipeline consumes. `now` injectable for testability
 * (engines stay pure; Date read happens here at the adapter boundary).
 */
export function toEngineSession(
  summary: LastSessionSummary,
  now: number = Date.now(),
): EngineSession {
  const daysAgo = Math.max(0, Math.floor((now - summary.ts) / MS_PER_DAY));
  const rir = deriveSessionRir(summary);
  return rir === undefined
    ? { ...summary, daysAgo }
    : { ...summary, daysAgo, rir };
}

/**
 * Build minimal userState aggregate consumed by getDailyWorkout pipeline.
 * Primary-source slice fields verified (anti-recurrence D027 §5):
 *   - user: useOnboardingStore.data Big 6 (age/sex/goal/frequency/experience/weight)
 *   - recentSessions: useWorkoutStore.sessionsHistory (cumulative LastSessionSummary[])
 *   - weights/profileTier/flags/meta defensive empty — buildEngineContext
 *     handles missing fields per src/coach/orchestrator/contextBuilder.js:42-58.
 *
 * Tier resolution Phase 6+ deferred (profileTier:null = engine downstream
 * fallback baseline T0 logic preserved). NU fabricate fields care nu există
 * în stores (slip cause D027 §5).
 */
function buildUserStateForPipeline(): {
  user: Record<string, unknown>;
  recentSessions: ReadonlyArray<unknown>;
  weights: Record<string, unknown>;
  profileTier: null;
  flags: Record<string, unknown>;
  meta: Record<string, unknown>;
} {
  const onboardingData = useOnboardingStore.getState().data;
  const sessionsHistory = useWorkoutStore.getState().sessionsHistory;
  // sessionsHistory appends newest-tail (workoutStore.finishSession); engine
  // recentSessions consumers slice(0, N) expecting newest-first (types.js:17
  // "ordered desc by date" + mesocycle.js:99/triggerHierarchy.js:246 trailing
  // window). Reverse to newest-first, then map each through toEngineSession so
  // the pipeline reads real rir/daysAgo signal instead of zero-signal raw.
  const now = Date.now();
  const recentSessions = (sessionsHistory ?? [])
    .slice()
    .reverse()
    .map((s) => toEngineSession(s, now));
  return {
    user: {
      age: onboardingData.age,
      sex: onboardingData.sex,
      goal: onboardingData.goal,
      frequency: onboardingData.frequency,
      experience: onboardingData.experience,
      weight: onboardingData.weight,
    },
    recentSessions,
    weights: {},
    profileTier: null,
    flags: {},
    meta: {},
  };
}

// DP.recommend return slice we read for the planned target (kg + repsTarget).
// DP emits a richer object (status/statusLabel/...) but the planner only needs
// the prescriptive numbers. `kg` already rounded to the equipment step inside
// DP.recommend; `repsTarget` is phase-aware (DP reads phase-override for CUT).
interface DpRecommendation {
  kg?: number;
  repsTarget?: number;
}

/**
 * Map engine exercise (sessionBuilder output `{ name, sets }`) to
 * PlannedExercise consumer shape. Engine emits only name + sets count; the
 * prescriptive targetKg/targetReps come from the DP progressive-overload brain
 * (CRIT C1 — was hardcoded targetKg:20 / targetReps:10 for every exercise).
 *
 *   - User WITH logged history (DP.getLogs(name) non-empty): targetKg/
 *     targetReps from DP.recommend(name) — the real double-progression output
 *     keyed on the ENGLISH canonical name.
 *   - NEW user / cold start (no logs): targetKg from suggestStartWeight(name,
 *     experienceEn) population prior; targetReps from DP's phase-aware INIT
 *     repsTarget (rMin, CUT-capped via phase-override).
 *
 * CRIT parity: the engine name is an English canonical key (PR records,
 * alternativeEngine maps, DP REP_RANGES). The `id` slug + the DP/cold-start
 * lookups all use that English name; only `name`/`sub` carry the Romanian
 * display form (Romanian-first app) via exerciseDisplay.toExerciseDisplay.
 */
function toPlannedExercise(
  engineEx: { name: string; sets: number },
  idx: number,
  experienceEn: string,
): PlannedExercise {
  const slug = engineEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const display = toExerciseDisplay(engineEx.name);
  // English canonical name — DP records + cold-start guideline key on it.
  const rec = DP.recommend(engineEx.name) as DpRecommendation | null;
  const hasHistory = DP.getLogs(engineEx.name, 1).length > 0;
  const targetReps =
    rec && typeof rec.repsTarget === 'number' ? rec.repsTarget : 10;
  // With history → DP weight (double-progression). Cold start → population
  // prior scaled by experience (DP INIT default 20/10 is too coarse for a new
  // user; suggestStartWeight is per-exercise calibrated).
  const targetKg = hasHistory
    ? rec && typeof rec.kg === 'number'
      ? rec.kg
      : suggestStartWeight(engineEx.name, experienceEn)
    : suggestStartWeight(engineEx.name, experienceEn);
  return {
    id: `${slug}-${idx}`,
    name: display.name,
    ...(display.sub !== undefined ? { sub: display.sub } : {}),
    sets: engineEx.sets,
    targetReps,
    targetKg,
    restSec: 90,
  };
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
    const exercises = (plan.exercises ?? []).map((ex, idx) =>
      toPlannedExercise(ex, idx, experienceEn),
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
    // LOW-CODE-09 fix: nullish coalescing (??) NU falsy (||) — preserve
    // legitimate 0/empty engine values (volumeKg=0 valid, estimatedDurationMin=0
    // valid if engine ever emits, workoutTitle='' indicates shape mismatch
    // surfaced explicit). Engine emits concrete defaults
    // src/engine/schedule/scheduleAdapter.js:493-495 → fallback rarely fires;
    // when it does, signals null/undefined NU coerced 0/empty.
    return {
      workoutTitle: plan.workoutTitle ?? 'Antrenament azi',
      exerciseCount: exercises.length,
      estimatedDuration: plan.estimatedDurationMin ?? 50,
      intensityMod: hasActiveDeload ? 'minus' : 'normal',
      exercises,
      volumeKg: plan.volumeKg ?? 0,
      warmup,
    };
  } catch (e) {
    console.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
