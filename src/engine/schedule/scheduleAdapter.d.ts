// Phase 5 task_05 — TS ambient types pentru scheduleAdapter consumed React-side.
// Phase 6 task_01/task_02 — extended getDailyWorkout async pipeline consumer +
// calendar override storage helpers + week-start ISO derivation. Per
// DECISIONS.md §D027.

export const CALENDAR_OVERRIDE_KEY: string;
export const MISSING_EQUIPMENT_KEY: string;
export const VALID_EQUIPMENT_IDS: readonly string[];

export interface CalendarOverrideDay {
  day: 'L' | 'M' | 'M2' | 'J' | 'V' | 'S' | 'D';
  active: boolean;
}

export interface CalendarOverride {
  selectedDays: CalendarOverrideDay[];
  weekStartIso: string;
  committedAt: string;
}

export type CoachAdaptationKind =
  | 'recovery-cut'
  | 'weakness-amp'
  | 'imbalance-fix'
  | 'deload';

export interface CoachAdaptation {
  kind: CoachAdaptationKind;
  // Big-11 RO group key (piept / picioare-quads / ...) — absent for 'deload'.
  group?: string;
  // recovery-cut origin: a recent aerobic class vs a heavy resistance session.
  cause?: 'aerobic' | 'resistance';
}

export interface WorkoutPlan {
  type: 'training';
  sessionType: string;
  warmup: Record<string, unknown> | null;
  exercises: ReadonlyArray<{ name: string; sets: number }>;
  intensityModifier: Record<string, unknown> | null;
  volumeTargets: Record<string, unknown> | null;
  restTimeRange: readonly [number, number] | null;
  // F2 #2 — Goal Adaptation rep + RIR target modifiers ([min,max] bands).
  // Optional so pre-feature plan-shape fixtures stay valid (additive);
  // getDailyWorkout always emits them (null on absent blueprint).
  repRangeModifier?: readonly [number, number] | null;
  rirTargetModifier?: readonly [number, number] | null;
  // W-Meso — periodization mesocycle phase for the current week-in-block.
  // Optional/additive; getDailyWorkout emits it (null on absent blueprint).
  mesocyclePhase?: 'LOAD' | 'LOAD+' | 'PEAK' | 'DELOAD' | null;
  // F3 #6 — Periodization %1RM intensity corridor {floor,ceiling}. Optional/additive;
  // getDailyWorkout emits it (null on absent blueprint).
  intensityCorridor?: { floor: number; ceiling: number } | null;
  // F2 #3 — Tempo session-level cue (uniform; per-exercise movementId is Faza-3).
  // Optional/additive; getDailyWorkout emits it (null on absent blueprint).
  tempoCue?: { line: string | null; notation: string | null } | null;
  // F2 #4 — Energy Adjustment reconcile input (direction + tier-gated magnitude).
  // Optional/additive; getDailyWorkout emits it (null on absent blueprint).
  energyAdjustment?: { direction: string; magnitudePct: number } | null;
  specializationTarget: string | null;
  deloadState: string;
  // Coach Voice — structured adaptations log (machine tokens, no copy). Empty
  // array when nothing adapted this session. Optional in the type so pre-feature
  // plan-shape fixtures stay valid (additive); getDailyWorkout always emits it.
  coachAdaptations?: CoachAdaptation[];
  // Intra-week deficit recovery (D-intra-week 2026-06-04) — DATA only (no UI this
  // phase). `added` = makeup volume applied to TODAY's session per Big-11 EN group;
  // `behind` = deficit still outstanding after today. A follow-up phase renders a
  // supportive note. Optional so pre-feature plan-shape fixtures stay valid
  // (additive); getDailyWorkout always emits it (empty objects on cold start).
  weekMakeup?: {
    added: Record<string, number>;
    behind: Record<string, number>;
  };
  estimatedDurationMin: number;
  volumeKg: number;
  workoutTitle: string;
}

export type FocusPreset =
  | 'balanced'
  | 'v-taper'
  | 'arms'
  | 'chest'
  | 'shoulders'
  | 'back'
  | 'lower'
  | 'upper';

export interface FocusPresetSpec {
  emphasize: readonly string[];
  deEmphasize: readonly string[];
}

// Focus selector (D-focus 2026-06-02) — goal/look presets → per-Big-11-RO-group
// emphasis. balanced = the empty no-op (byte-identical to pre-feature).
export const FOCUS_PRESETS: Readonly<Record<FocusPreset, FocusPresetSpec>>;
export const FOCUS_PRESET_IDS: readonly FocusPreset[];

// The primary emphasized Big-11 RO group of a preset (first emphasize[] entry,
// Top-1 discipline) — null for balanced/unknown. Routed into the specialization
// engine as the user-picked TARGET when dp_emphasis_specialization_v1 is on.
export function primaryEmphasizedGroup(focusPreset?: string | null): string | null;

export function frequencyToSplit(n: number, focusPreset?: string): string[];
export function weeklySessionsPerGroup(split: string[]): Record<string, number>;

export function mapDateToIndex(date: Date): number;
export function getWeekStartIso(date: Date): string;
export function getCalendarOverride(now?: Date): CalendarOverride | null;
export function commitCalendarEdit(
  selectedDays: ReadonlyArray<CalendarOverrideDay>,
  now?: Date,
): CalendarOverride;
export function resetWeekOverride(): void;
export function getMissingEquipment(): string[];
export function setMissingEquipment(list: string[]): void;
export function toggleMissingEquipment(equipmentId: string): string[];
export function getSkippedExercises(): string[];
export function setSkippedExercises(list: string[]): void;
export function toggleSkippedExercise(exerciseName: string): string[];
export function getRefusalCounter(): Record<string, number>;
export function incrementRefusal(exerciseName: string): number;
export function resetRefusalCounter(exerciseName: string): void;
export function translateToEngineEquipment(userIds: string[]): string[];

export function getDailyWorkout(
  userState?: Record<string, unknown>,
  now?: Date,
  options?: { differentMuscle?: boolean },
): Promise<WorkoutPlan | null>;

// "Different group" ephemeral override — pick the most-recovered ALTERNATIVE
// Big-6 cluster (≠ the scheduled one). Pure; deterministic tie-break.
export function pickAlternativeCluster(
  scheduledCluster: string,
  recoveryState: Record<string, 'recovered' | 'partial' | 'fatigued'>,
): string;
