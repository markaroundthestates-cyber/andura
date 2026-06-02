// ══ IMBALANCE DETECTOR — TS Ambient Types (M3) ═══════════════════════════
// Antagonist / pattern volume-imbalance detection + correction. Pure engine
// math consumed by the JS schedule adapter (scheduleAdapter.js getDailyWorkout).
// Mirrors muscleRecovery.d.ts / readiness.d.ts ambient pattern.
//
// Return shapes per src/engine/imbalanceDetector.js:
//   - detectImbalances returns one entry per FLAGGED pair (empty = balanced / no-data)
//   - applyImbalanceCorrection raises lagging-side EN budgets toward parity, MRV-capped

import type { LogEntry } from './muscleRecovery';

export interface ImbalanceFinding {
  pair: string;
  dominantSide: readonly string[];
  laggingSide: readonly string[];
  laggingGroups: readonly string[];
  ratio: number;
  dominantVolume: number;
  laggingVolume: number;
  severity: number;
}

export const MIN_SIDE_SETS: number;
export const CORRECTION_STRENGTH: number;

export function detectImbalances(
  profile: { logs?: LogEntry[]; lookbackDays?: number; now?: number } | null | undefined
): ImbalanceFinding[];

export function applyImbalanceCorrection(
  volumeMapEN: Record<string, number> | null | undefined,
  imbalances: ImbalanceFinding[]
): Record<string, number> | null;
