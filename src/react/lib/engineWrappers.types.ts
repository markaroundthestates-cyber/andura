// ══ ENGINE WRAPPERS — Shared output types ════════════════════════════════
// Hygiene split (barrel re-export, zero behavior change): the simplified
// React-consumption types extracted verbatim from engineWrappers.ts so the
// adapter bodies + the nutrition/MMI math modules can share one type source.
// Re-exported by engineWrappers.ts — the public API is unchanged.

// ── Output types simplified pentru React consumption ─────────────────────

// A2.1 — one honest factor that shaped a composed session (the decision-trace
// entry). The builder lives in decisionTrace.ts; the type is HERE (the shared type
// home) so PlannedWorkoutOutput can reference it without a circular import.
export interface DecisionTraceEntry {
  /** the load-bearing decision dimension (phase / readiness / dp / …). */
  factor: string;
  /** the ACTUAL value of that decision (a number, a token, or a short summary). */
  value: string | number;
}

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
  // R6c (Daniel coach audit 2026-06-10): the per-exercise rep BAND ("10–15") for
  // preview display — the engine now carries class-correct bands (dp_rep_class_v1)
  // and showing only the single target ("8 reps") hid half the prescription.
  // Sourced from DP.getSmartRecommendation().repsRange at the compose boundary;
  // optional — preview rows fall back to targetReps when absent.
  repsBand?: string;
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
  // #7 per-exercise prescription METRIC. Always stamped at the
  // scheduleAdapterAggregate boundary (always-on DATA): 'reps' (default — weight ×
  // reps), 'time' (an isometric hold prescribed in seconds), 'distance' (meters),
  // or 'carry' (a loaded carry — load over time/distance). Absent on pre-#7
  // fixtures → consumers treat it as 'reps'.
  metricType?: 'reps' | 'time' | 'distance' | 'carry';
  // #7 prescribed DURATION in seconds for a time / carry exercise. Present ONLY
  // when dp_metric_types_v1 is ON AND metricType is 'time'/'carry' — then
  // targetReps is 0 (no rep target) and targetSec carries the hold/carry duration
  // so the consumer never renders a "× reps" prescription. Absent → reps path.
  targetSec?: number;
  // F5-W0 — the per-exercise DP decision REASON, carried forward from
  // getSmartRecommendation (which engine branch fired: EASE BACK / CONSOLIDATE /
  // INIT / ON TARGET / INCREASE / …). The composer already computes this rec but
  // historically dropped status/progressionNote at toPlannedExercise; W0 carries
  // them so the moat "De ce atat?" / replay-debugger can read the real reason
  // instead of re-guessing. `status` is the engine's machine enum; `note` is the
  // engine's pre-localized RO progression sentence (progressionNote). Absent on a
  // cold-start row with no rec, or on a pre-W0 fixture → consumers degrade to the
  // honest fallback. CARRIED ONLY — nothing renders this yet.
  recReason?: { status: string; note?: string };
  // F5-W0 — the per-exercise strength-posterior UNCERTAINTY (Kalman sigma) +
  // observation count, carried forward via DP._posteriorSigma (a pure recompute
  // from the e1RM log stream, no DB write, independent of dp_strength_kalman_v1).
  // `sigma` is null for an e1RM-ineligible / cold-start exercise (the honest "I
  // don't know you yet"); `n` is the count of usable e1RM observations folded into
  // the posterior. Feeds the coach-confidence tier (#63) + the replay trace (#66).
  // CARRIED ONLY — nothing consumes this yet.
  confidence?: { sigma: number | null; n: number };
}

// Coach Voice — structured, machine-readable record of an adaptation the
// adaptive brain applied to TODAY's plan. Emitted by the engine (getDailyWorkout);
// the React composer (coachInsight) turns the log into ONE localized coach line.
// NO copy strings — tokens only (kind/group/cause); the engine never emits RO copy.
export type CoachAdaptationKind =
  | 'recovery-cut'
  | 'weakness-amp'
  | 'imbalance-fix'
  | 'deload';

export interface CoachAdaptation {
  kind: CoachAdaptationKind;
  // Big-11 RO group key (piept / spate / picioare-quads / ...) — absent for 'deload'.
  group?: string;
  // recovery-cut origin: a recent aerobic class vs a heavy resistance session.
  cause?: 'aerobic' | 'resistance';
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
  // warmupSets — per-set ascending ramp (50/70/90% of the working load) for the
  // day's OPENING compound, ADDITIVE + behind dp_warmup_ramp_v1 (default OFF). Absent
  // when the flag is off / no qualifying tier-1 opener / load below the ramp
  // threshold. Each entry is an equipment-snapped primer {kg, reps, pct}.
  warmup?: { line: string; durationMin: number; warmupSets?: Array<{ kg: number; reps: number; pct: number }> } | null;
  // F2 #3 — Tempo session-level form/tempo cue (Tempo engine preSetIntro +
  // notation). UNIFORM across the session: per-exercise movementId is a Faza-3
  // input dep (meta.movementId unset → one generic cue), so it is a session-level
  // narration string, NOT a per-exercise faked-movement cue. Touches NO
  // weight/sets/reps. Null when the blueprint is absent (cold start / rest day).
  tempoCue?: { line: string; notation: string | null } | null;
  // F2 #4 — Energy Adjustment direction + tier-gated magnitude. RECONCILE input
  // for the in-session ±% scale: Workout.tsx uses this engine magnitude in place
  // of the flat ×0.8/×1.15 constants (NOT a third channel — the same single
  // scale, real number). direction UP/DOWN/NONE; magnitudePct signed [-0.15,+0.15].
  // Null when the blueprint is absent → Workout.tsx keeps the legacy constant.
  energyAdjustment?: { direction: 'UP' | 'DOWN' | 'NONE'; magnitudePct: number } | null;
  // Coach Voice — the adaptive brain's structured adaptations for TODAY (tokens,
  // not copy). The CoachTodayCard composer (coachInsight) turns it into one
  // plain-language coach line. Empty array / absent → no line (graceful).
  coachAdaptations?: CoachAdaptation[];
  // Intra-week deficit recovery (D-intra-week 2026-06-04) — `added` = make-up
  // volume the engine ADDED to TODAY's session per Big-11 EN group (chest/back/
  // ...); `behind` = deficit still outstanding after today (capped/fatigued).
  // CoachTodayCard turns a non-empty `added` into a short supportive note.
  // Optional so pre-feature plan-shape fixtures stay valid (additive); the
  // engine adapter always emits it (empty objects on cold start).
  weekMakeup?: {
    added: Record<string, number>;
    behind: Record<string, number>;
  };
  // A2.1 — consolidated HONEST decision trace: a structured array of the REAL
  // multi-factor reasons that shaped THIS session's plan (phase / readiness /
  // recovery cut / emphasis / deload / focus / time budget / DP load tally /
  // finalDecision), each derived from a signal the compose path actually computed —
  // an unfired factor is OMITTED, never fabricated. Present ONLY when
  // dp_decision_trace_v1 is ON; INERT observability (A2.2 owns rendering), invisible
  // to the prescription determinism hash → additive, never changes the plan.
  decisionTrace?: DecisionTraceEntry[];
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
  // A4 coached recommendation (flag dp_nutrition_coached_v1, default OFF). The
  // kcalTarget shown is the COACHED (sustainable-capped) number; mathKcalTarget is
  // the raw math target it was bounded from (TDEE − deficit / + surplus, sex-floored)
  // and coachedReason explains the relationship. ALL THREE present ONLY when the flag
  // is ON (flag OFF → these are absent + kcalTarget is the math target, byte-identical).
  mathKcalTarget?: number;
  coachedReason?:
    | 'deficit_capped_sustainable'
    | 'surplus_capped_moderate'
    | 'at_floor'
    | 'within_sustainable';
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
  daysSince: number; // 1..N days since last trained (floored — legacy day bucket)
  // REAL elapsed hours since the group was last trained (NOT floored to days).
  // Lets the card render an hour-accurate "{when}" ("20h" vs "yesterday") and
  // exposes the honest rest gap to any narrative layer. Always >= the day bucket.
  elapsedHours: number;
}

// Calibration maturity signal for the honest "still learning you" line.
// Emitted by getCalibrationMaturity() ONLY while the model is still immature
// (early tier); null once dialed in (PERSONALIZED+ — bannerText goes null). The
// React side composes the user copy from these machine signals (no copy here).
export interface CoachCalibrationSignal {
  tierId: number; // 0=cold_start .. 3=personalizing (immature tiers only)
  tierName: string; // engine tier name (e.g. 'cold_start', 'developing')
  sessionsCount: number; // real unique-session count behind the model so far
  // Sessions remaining until the NEXT tier's entry threshold. A real number
  // when the engine exposes the next-tier minSessions; null when no honest
  // count can be derived (then the React copy drops the number — never faked).
  sessionsToNext: number | null;
}

// No-shame return signal — the user returned this week after missing >=1
// scheduled training day EARLIER this week (short, same-week miss). Emitted by
// getReturnAfterMissSignal() ONLY when there is a real miss + real prior history;
// null otherwise (no miss / cold start / >14d absence owned by ReactivateCard).
// The React side composes a warm, no-guilt line from the count (no copy here).
// Truth-only: missedDays is the REAL count of scheduled training days earlier
// this week with no logged session — never fabricated.
export interface CoachReturnSignal {
  missedDays: number; // 1..N scheduled training days earlier this week with no session
}

// Goal-pivot proposal (#15 dp_auto_pivot_v1) — emitted by getGoalPivotProposal()
// ONLY when the flag is ON AND the engine proposes a pivot (a broad share of the
// user's main lifts near their realistic ceiling + sustained global stagnation +
// the pushBackTiers anti-spam cooldowns all clear); null otherwise (flag OFF /
// not near ceiling / cooling down / cold start). The React side renders a Tier-2
// banner + Tier-3 confirm and, on accept, sets the goal (no copy here).
export interface GoalPivotProposal {
  // Onboarding Goal ids the consumer can switch to (the wording's offered moves).
  // 'masa' = mass/hypertrophy (→ hipertrofie volume), 'mentenanta' = maintenance
  // (→ sanatate). Filtered against the user's CURRENT goal (never re-offers it).
  targets: Array<'masa' | 'mentenanta'>;
  share: number; // [0,1] share of main lifts classified near_ceiling
  nearCount: number; // count of main lifts near ceiling
  total: number; // total main lifts with usable data
  stagnationWeeks: number; // sustained global stagnation (weeks)
}
