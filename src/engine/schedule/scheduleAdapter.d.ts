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

export interface WorkoutPlan {
  type: 'training';
  sessionType: string;
  warmup: Record<string, unknown> | null;
  exercises: ReadonlyArray<{ name: string; sets: number }>;
  intensityModifier: Record<string, unknown> | null;
  volumeTargets: Record<string, unknown> | null;
  restTimeRange: readonly [number, number] | null;
  specializationTarget: string | null;
  deloadState: string;
  estimatedDurationMin: number;
  volumeKg: number;
  workoutTitle: string;
}

export function frequencyToSplit(n: number): string[];
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
): Promise<WorkoutPlan | null>;
