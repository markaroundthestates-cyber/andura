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
export const DECAY_RATE_HOURS_BIG11: number;
export const BIG11_GROUPS: readonly string[];
export const PAIN_REGION_GROUP_MAP: Record<string, string[]>;

export function getRecoveryByGroup(
  logs: LogEntry[],
  painEntries?: PainCdlEntry[]
): Record<string, RecoveryState>;
export function daysSinceGroup(logs: LogEntry[], group: string): number | null;
export function getLaggingMuscles(
  profile: { logs?: LogEntry[]; lookbackDays?: number } | null | undefined
): LaggingMuscle[];
