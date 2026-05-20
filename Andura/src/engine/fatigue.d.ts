// ══ FATIGUE ENGINE — TS Ambient Types ════════════════════════════════════
// Phase 4 task_11 §A — eliminate @ts-expect-error în engineWrappers.ts +
// align test mock shape cu engine return contract.
//
// Engine has 2 return shapes per src/engine/fatigue.js:
//   - Early-return cand last4.length < 2: 5-field DATE INSUFICIENTE shape
//     (NU key, NU icon, NU avgRPE/sleepBad/fatigue/strong)
//   - Late-return normal path: 11-field shape cu key+icon+RPE metrics
//
// Declared shape covers both via optional fields. engineWrappers.ts handles
// `key ?? ''` + `icon ?? ''` fallback pentru early-return path (preserves
// FatigueOutput.key/icon string non-optional contract).

export function calculateFatigueScore(): {
  score: number;
  key?: string;
  label: string;
  icon?: string;
  color: string;
  recommend: string;
  detail: string;
  avgRPE?: number;
  sleepBad?: number;
  fatigue?: number;
  strong?: number;
} | null;
