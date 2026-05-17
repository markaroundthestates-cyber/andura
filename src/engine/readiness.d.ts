// ══ READINESS ENGINE — TS Ambient Types ══════════════════════════════════
// Phase 4 task_11 §A — eliminate @ts-expect-error în engineWrappers.ts.
//
// Engine return shape per src/engine/readiness.js:
//   - getReadinessVerdict returns shape cu label optional (null cand score
//     null fallback path line 37)
//   - getComputedReadinessScore returns number sau null (DB unavailable)

export interface ReadinessVerdict {
  label: string | null;
  color: string;
  volumeMultiplier: number;
  canPR: boolean;
}

export function getReadinessVerdict(
  score: number | null,
  opts?: { isInCut?: boolean }
): ReadinessVerdict;

export function getComputedReadinessScore(): number | null;
