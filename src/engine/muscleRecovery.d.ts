// ══ MUSCLE RECOVERY ENGINE — TS Ambient Types ════════════════════════════
// §F-pass2-coachrest-01 audit fix — engine consumed by engineWrappers.ts
// getCoachRestReason composer (passes lagging muscle group via CoachRestCard
// wire). Mirrors readiness.d.ts / fatigue.d.ts ambient pattern.
//
// Engine return shapes per src/engine/muscleRecovery.js:
//   - getRecoveryByGroup returns map group → 'recovered'|'partial'|'fatigued'
//   - GROUP_LABELS_RO_BIG11 = RO display labels per canonical group key
//   - getLaggingMuscles returns sorted array (most lagging first)

export type RecoveryState = 'recovered' | 'partial' | 'fatigued';

export type Big11Group =
  | 'piept'
  | 'spate'
  | 'umeri'
  | 'biceps'
  | 'triceps'
  | 'antebrate'
  | 'core'
  | 'picioare-quads'
  | 'picioare-hamstrings'
  | 'fese'
  | 'gambe';

export interface LogEntry {
  ex?: string;
  baseline?: boolean;
  ts?: number;
  date?: string;
}

export interface PainCdlEntry {
  type?: string;
  region?: string;
  intensity?: 1 | 2 | 3;
  ts?: number;
}

export interface LaggingMuscle {
  group: string;
  label: string;
  ratio: number;
  sets: number;
}

export const GROUP_LABELS_RO_BIG11: Record<string, string>;
export const GROUP_HEAD_MAP_BIG11: Record<string, string[]>;
export const BIG11_GROUPS: readonly string[];
export const PAIN_REGION_GROUP_MAP: Record<string, string[]>;

export interface RecoveryOpts {
  /** Stretch per-head recovery window by dose × unaccustomed factors when the
   *  dp_recovery_dose_v1 flag is on. Omitted / flag OFF → time-only decay. */
  doseScaling?: boolean;
}

export function getRecoveryByGroup(
  logs: LogEntry[],
  painEntries?: PainCdlEntry[],
  now?: number,
  opts?: RecoveryOpts
): Record<string, RecoveryState>;

/** Per-head recovery hours for getMuscleState's `learnedHours` arg, with the
 *  dose × unaccustomed window stretch applied over a base-hours source (learned
 *  map or MUSCLE_HEADS globals). Heads with no qualifying signal keep base hours. */
export function buildDoseScaledRecoveryHours(
  logs: LogEntry[],
  now?: number,
  baseHours?: Record<string, number> | null
): Record<string, number>;
export function daysSinceGroup(logs: LogEntry[], group: string, now?: number): number | null;
export function hoursSinceGroup(logs: LogEntry[], group: string, now?: number): number | null;

export interface GroupRecoveryDetail {
  state: RecoveryState;
  elapsedHours: number | null;
}
export function getGroupRecoveryDetail(
  logs: LogEntry[],
  painEntries?: PainCdlEntry[],
  now?: number,
  opts?: RecoveryOpts
): Record<string, GroupRecoveryDetail>;
export function groupForExerciseBig11(engineName: string | null | undefined): string[];
export function getLaggingMuscles(
  profile: { logs?: LogEntry[]; lookbackDays?: number; now?: number } | null | undefined
): LaggingMuscle[];

// Aerobic-class recovery contribution (light, fast-clear cardio touch — caps at
// 'partial'/Easing, never 'fatigued'). Per src/engine/muscleRecovery.js.
export const AEROBIC_GROUP_GRADIENT: Record<string, Record<string, number>>;
export function getAerobicRecoveryContribution(
  sessions: Array<{ type?: string; ts?: number; date?: string }>,
  now?: number
): Record<string, RecoveryState>;
export function mergeAerobicRecovery(
  resistanceState: Record<string, RecoveryState>,
  aerobicSessions: Array<{ type?: string; ts?: number; date?: string }>,
  now?: number
): Record<string, RecoveryState>;

// F6a #5 — acute:chronic workload ratio (also consumed by the #32 dip classifier).
export const ACWR_HIGH: number;
export const ACWR_LOW: number;
export function computeACWR(
  logs: ReadonlyArray<{ ex?: string; baseline?: boolean; w?: number; rpe?: number; ts?: number; date?: string }>,
  now?: number
): { acwr: number; acute: number; chronic: number } | null;
export function acwrReadinessPenalty(
  acwr: { acwr: number } | null
): number;
