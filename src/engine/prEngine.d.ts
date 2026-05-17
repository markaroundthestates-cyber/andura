// ══ PR ENGINE — TS Ambient Types ═════════════════════════════════════════
// Phase 4 task_11 §A — eliminate @ts-expect-error în engineWrappers.ts.
//
// Engine returns 3 PR variants (weight / reps / volume) cu prevBest entry
// reference, or null cand set NU este PR. Baseline entries excluded engine-
// side (history filter).

export interface PRHistoryEntry {
  ex?: string;
  w?: number;
  reps?: number;
  baseline?: boolean;
}

export interface PRDetection {
  type: 'weight' | 'reps' | 'volume';
  kg: number;
  reps: number;
  prevBest: PRHistoryEntry | null;
}

export function detectPR(
  exercise: string,
  set: { w: number; reps: number },
  history: PRHistoryEntry[]
): PRDetection | null;
