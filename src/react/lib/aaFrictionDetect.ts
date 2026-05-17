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

const FAST_SETS_INTERVAL_MS = 30_000; // 2 sets < 30s = insufficient recovery
const KG_JUMP_THRESHOLD = 0.20; // > 20% increase same exercise
const REP_SPIKE_THRESHOLD = 0.50; // > 50% increase same exercise

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
  newSet: SetSample
): AggressiveLoadCheck {
  if (setHistory.length === 0) return { trigger: false };

  const last = setHistory[setHistory.length - 1];

  // 1. fast_sets — insufficient recovery between sets
  if (newSet.timestamp - last.timestamp < FAST_SETS_INTERVAL_MS) {
    return { trigger: true, reason: 'fast_sets' };
  }

  // 2. kg_jump — > 20% weight increase same exercise
  if (last.kg > 0) {
    const kgRatio = (newSet.kg - last.kg) / last.kg;
    if (kgRatio > KG_JUMP_THRESHOLD) {
      return { trigger: true, reason: 'kg_jump' };
    }
  }

  // 3. rep_spike — > 50% reps increase same exercise
  if (last.reps > 0) {
    const repRatio = (newSet.reps - last.reps) / last.reps;
    if (repRatio > REP_SPIKE_THRESHOLD) {
      return { trigger: true, reason: 'rep_spike' };
    }
  }

  return { trigger: false };
}
