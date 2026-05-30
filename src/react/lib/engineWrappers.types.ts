// ══ ENGINE WRAPPERS — Shared output types ════════════════════════════════
// Hygiene split (barrel re-export, zero behavior change): the simplified
// React-consumption types extracted verbatim from engineWrappers.ts so the
// adapter bodies + the nutrition/MMI math modules can share one type source.
// Re-exported by engineWrappers.ts — the public API is unchanged.

// ── Output types simplified pentru React consumption ─────────────────────

export interface ReadinessOutput {
  score: number;
  /**
   * Wave E4 — semantic key from the engine (`PR_DAY` / `SOLID` / `NORMAL` /
   * `MODERATE` / `LIGHT` / `REST` / `REST_RECOVER`). React consumers resolve
   * the user-facing label via `t('coachEngine.readiness.labels.${key}')`.
   * Optional for backward-compat with pre-Wave-E4 test fixtures + persisted
   * snapshots that pre-date the key field. `label` keeps the engine's
   * canonical RO copy as a fallback.
   */
  key?: string | null;
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
  // English canonical engine name (PR records, library lookups, DP keys). The
  // `name` field is the Romanian display form; `engineName` is the identity used
  // by substitution (findAlternatives/getFallbackCascade), DP, and the exercise
  // library. Set at the scheduleAdapterAggregate boundary. Optional for backward
  // compat with any pre-WP-5 fixture that omits it (callers fall back to a
  // best-effort lookup or skip substitution honestly).
  engineName?: string;
  // Romanian display subtitle (equipment/setup, e.g. "Cu gantere · banc 30°").
  // Optional — applied at the scheduleAdapterAggregate boundary via
  // exerciseDisplay.toExerciseDisplay; absent for unknown engine names.
  sub?: string;
  // WP-5 moat substitution marker: when this exercise was swapped in for another
  // (equipment busy / missing / refused), this is the short reason shown in the
  // `sub` slot (WorkoutPreview "Inlocuit · {motiv}"). Absent on un-swapped rows.
  swapReason?: string;
  sets: number;
  targetReps: number;
  // For LOADED exercises: the external kg on the bar/stack (the load).
  // For BODYWEIGHT exercises: the ADDED weight (belt/dumbbell; default 0 =
  // pure bodyweight, negative = assisted). The TRAINING load used by
  // volume/PR/progression is the EFFECTIVE load (bodyweight x fraction +
  // targetKg) — see isBodyweight / bwFraction below. The UI shows a bodyweight
  // pill + an optional "+ added" input instead of a barbell-style kg target.
  targetKg: number;
  restSec: number;
  // Bodyweight model (bodyweightLoad.js). When true, targetKg is ADDED weight,
  // not the full load — consumers must resolve effective load via the fraction.
  isBodyweight?: boolean;
  // Fraction of bodyweight this movement loads (pull-up/dip 1.0, push-up 0.65,
  // core/plank 0). Present only when isBodyweight. Effective load =
  // userBodyweightKg x bwFraction + targetKg(added).
  bwFraction?: number;
}

export interface PlannedWorkoutOutput {
  workoutTitle: string;
  // Engine session-type tag (PUSH / PULL / UPPER_PICIOARE / UMERI_BRATE /
  // FULL_UPPER), derived day-of-week by getDailyWorkout (DAY_TO_SESSION_TYPE).
  // The render boundaries map it to a localized session title — fixing the
  // "Push" label that showed on every day because the engine never emitted a
  // real per-day title (workoutTitle was always the sentinel → boundaries fell
  // to a HARDCODED "Push" copy). Optional for backward-compat with fixtures.
  sessionType?: string;
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

export interface WhyExerciseInput {
  name: string;
  recommendationKg: number;
  lastWeightKg?: number | null;
}

export interface NutritionTargetsEngine {
  kcalTarget: number;
  proteinTargetG: number;
  fatG: number;
  carbsG: number;
  source: 'engine' | 'baseline';
  confidence: number; // 0-1
  // BUG #4 safety — true cand recomandarea a fost ridicata la un surplus de
  // crestere fiindca user-ul e subponderal (BMI <= 18.5). UI arata mesajul de sustinere.
  healthyFloorClamped?: boolean;
  // L7 safety surfacing — la profile extreme tinta de baza a fost LIMITATA de
  // siguranta: 'floored' = clampata la floor-ul sex-aware (1200 m / 1000 f),
  // 'capped' = ritmul a fost plafonat (max 1.5kg/sapt pierdere, 0.5kg crestere).
  // UI (TDEEStrip) arata o nota scurta care explica DE CE tinta e la acea valoare.
  // Distinct de healthyFloorClamped (subponderal) si de add-on clamp (plafonare
  // add-on peste mentenanta) — aici e despre tinta de baza, NU add-on-uri.
  safetyLimited?: 'floored' | 'capped';
}

export interface AdherenceOutput {
  score: number; // 0-100 clamped invariant
  source: 'engine' | 'baseline';
}

export interface PatternBanner {
  id: 'LOW_ADHERENCE' | 'STAGNATION';
  severity: 'info' | 'warn';
  text: string; // RO wording NO_DIACRITICS_RULE
}

export type ProactiveAlertSeverity = 'info' | 'warn' | 'urgent';

export interface ProactiveAlert {
  id: string;
  text: string;
  severity: ProactiveAlertSeverity;
}

export interface CoachRestReason {
  fatiguedGroups: string[]; // RO display labels (e.g. ["Pieptul", "Quadricepsul"])
  readinessScore: number | null; // 0-100, null cand readiness NU logged
}

export interface CoachTodayQuote {
  recoveredLabel: string; // RO display label (e.g., "Pectoralii", "Spatele")
  daysSince: number; // 1..N days since last trained
}
