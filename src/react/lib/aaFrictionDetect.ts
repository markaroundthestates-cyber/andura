// ══ AGGRESSIVE LOAD FRICTION DETECTOR — LOCK 9 Safety Helper ═════════════
// Phase 4 task_14 §A — pure helper detect aggressive loading 3-pattern (fast
// _sets / kg_jump / rep_spike). ZERO side effects, ZERO React deps. Used by
// Workout.handleLogSet pre-logSet check pentru aaFrictionModal trigger.
//
// Thresholds Phase 4 hardcoded (task_14 §A spec). Phase 5+ user-configurable
// sau Vitality/Adherence engine-driven dynamic thresholds.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-040 LOCK 9 anti-aggressive loading safety
//   - src/pages/coach/aaFrictionModal.js — session-level pattern precedent
//     (different scope: this helper = per-set timing/jump detection)

// Phase 5 task_09: dynamic thresholds Vitality/Adherence-driven.
// Defaults remain Phase 4 task_14 baseline — caller poate pass thresholds
// custom (Vitality high → laxer; Adherence low → stricter). Engine real
// wire Phase 6+ via buildCoachContext output.
const DEFAULT_FAST_SETS_INTERVAL_MS = 30_000;
const DEFAULT_KG_JUMP_THRESHOLD = 0.20;
const DEFAULT_REP_SPIKE_THRESHOLD = 0.50;

export interface AaFrictionThresholds {
  fastSetsIntervalMs: number;
  kgJumpThreshold: number; // decimal (0.20 = 20%)
  repSpikeThreshold: number; // decimal (0.50 = 50%)
}

export const DEFAULT_THRESHOLDS: Readonly<AaFrictionThresholds> = {
  fastSetsIntervalMs: DEFAULT_FAST_SETS_INTERVAL_MS,
  kgJumpThreshold: DEFAULT_KG_JUMP_THRESHOLD,
  repSpikeThreshold: DEFAULT_REP_SPIKE_THRESHOLD,
};

/**
 * Phase 5 task_09: derive thresholds din Vitality/Adherence engine signals.
 * High Vitality (recovery markers strong) → laxer thresholds (user
 * sustained higher load OK). Low Adherence (skipped sessions) → stricter
 * (avoid push too hard after gap). NU mutate engines per orchestrator §7.
 */
export function deriveThresholds(opts: {
  vitalityScore?: number; // 0-100 (higher = better recovery)
  adherenceScore?: number; // 0-100 (higher = more consistent)
} = {}): AaFrictionThresholds {
  const vitality = opts.vitalityScore ?? 50;
  const adherence = opts.adherenceScore ?? 50;
  // Scale kg jump threshold: high vitality + high adherence → 25% (laxer);
  // low signals → 15% (stricter). Range [0.15, 0.25].
  const vitalityMod = (vitality - 50) / 100; // [-0.5, 0.5]
  const adherenceMod = (adherence - 50) / 100;
  const kgJumpThreshold = Math.max(
    0.15,
    Math.min(0.25, DEFAULT_KG_JUMP_THRESHOLD + (vitalityMod + adherenceMod) * 0.05),
  );
  const repSpikeThreshold = Math.max(
    0.40,
    Math.min(0.60, DEFAULT_REP_SPIKE_THRESHOLD + (vitalityMod + adherenceMod) * 0.10),
  );
  return {
    fastSetsIntervalMs: DEFAULT_FAST_SETS_INTERVAL_MS,
    kgJumpThreshold: Math.round(kgJumpThreshold * 100) / 100,
    repSpikeThreshold: Math.round(repSpikeThreshold * 100) / 100,
  };
}

export type AggressiveReason = 'fast_sets' | 'kg_jump' | 'rep_spike';

export interface AggressiveLoadCheck {
  trigger: boolean;
  reason?: AggressiveReason;
}

export interface SetSample {
  kg: number;
  reps: number;
  timestamp: number;
}

/**
 * Detect aggressive loading pattern. Pure function — input = chronological
 * set history for current exercise + new set candidate, output = trigger
 * boolean cu reason cand triggered.
 *
 * Priority order check (return first match):
 *   1. fast_sets: ≥2 sets logged < 30sec interval (last in history vs newSet)
 *   2. kg_jump: newSet.kg vs last in history > 20% increase
 *   3. rep_spike: newSet.reps vs last in history > 50% increase
 *
 * NU trigger cand history empty (first set per exercise — no baseline).
 */
export function detectAggressiveLoad(
  setHistory: readonly SetSample[],
  newSet: SetSample,
  thresholds: AaFrictionThresholds = DEFAULT_THRESHOLDS,
): AggressiveLoadCheck {
  if (setHistory.length === 0) return { trigger: false };

  const last = setHistory[setHistory.length - 1];

  // 1. fast_sets — insufficient recovery between sets
  if (newSet.timestamp - last.timestamp < thresholds.fastSetsIntervalMs) {
    return { trigger: true, reason: 'fast_sets' };
  }

  // 2. kg_jump — > threshold weight increase same exercise
  if (last.kg > 0) {
    const kgRatio = (newSet.kg - last.kg) / last.kg;
    if (kgRatio > thresholds.kgJumpThreshold) {
      return { trigger: true, reason: 'kg_jump' };
    }
  }

  // 3. rep_spike — > threshold reps increase same exercise
  if (last.reps > 0) {
    const repRatio = (newSet.reps - last.reps) / last.reps;
    if (repRatio > thresholds.repSpikeThreshold) {
      return { trigger: true, reason: 'rep_spike' };
    }
  }

  return { trigger: false };
}
