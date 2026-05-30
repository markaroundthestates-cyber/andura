// ══ READINESS ENGINE — TS Ambient Types ══════════════════════════════════
// Phase 4 task_11 §A — eliminate @ts-expect-error în engineWrappers.ts.
//
// Engine return shape per src/engine/readiness.js:
//   - getReadinessVerdict returns shape cu label optional (null cand score
//     null fallback path line 37)
//   - getComputedReadinessScore returns number sau null (DB unavailable)

export type ReadinessVerdictKey =
  | 'PR_DAY'
  | 'SOLID'
  | 'NORMAL'
  | 'MODERATE'
  | 'LIGHT'
  | 'REST'
  | 'REST_RECOVER';

export interface ReadinessVerdict {
  /**
   * Wave E4 — semantic key for i18n resolution
   * (coachEngine.readiness.labels.*). Optional for backward-compat with
   * pre-Wave-E4 test fixtures + persisted snapshots. Null when score itself
   * is null.
   */
  key?: ReadinessVerdictKey | null;
  label: string | null;
  color: string;
  volumeMultiplier: number;
  canPR: boolean;
}

export const READINESS_PR: number;
export const READINESS_HIGH: number;
export const READINESS_MED: number;
export const READINESS_LOW: number;

export const READINESS_LABELS: Record<string, string>;

export function getReadinessScore(
  readinessInput: number | null | undefined,
  kcalYesterday: number | null | undefined,
  protYesterday: number | null | undefined,
  targetKcal: number | null | undefined,
  targetProt: number | null | undefined
): number;

export function getReadinessVerdict(
  score: number | null,
  opts?: { isInCut?: boolean; hasHistory?: boolean }
): ReadinessVerdict;

export function saveReadiness(value: number): void;
export function getTodayReadiness(): number | null;
export function clearTodayReadiness(): void;
export function getComputedReadinessScore(
  targetKcal?: number | null,
  targetProt?: number | null
): number | null;
