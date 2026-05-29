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
// 06.AA.010 — over-recommendation safety ratio. The engine recommends a load
// (targetKg); entering a load >= rec * (1 + ratio) is a hard safety flag that
// fires INDEPENDENT of set history (first set, fresh install — no baseline
// needed). 0.40 = 40% over rec. A 50kg vs 10kg rec (5x) trips this instantly.
// Deliberately laxer than kg_jump (history-based) because the rec already bakes
// in readiness/tier — a modest overshoot is normal; a large one is not.
const DEFAULT_OVER_RECOMMENDATION_RATIO = 0.40;

export interface AaFrictionThresholds {
  fastSetsIntervalMs: number;
  kgJumpThreshold: number; // decimal (0.20 = 20%)
  repSpikeThreshold: number; // decimal (0.50 = 50%)
  overRecommendationRatio: number; // decimal (0.40 = 40% over engine rec)
}

export const DEFAULT_THRESHOLDS: Readonly<AaFrictionThresholds> = {
  fastSetsIntervalMs: DEFAULT_FAST_SETS_INTERVAL_MS,
  kgJumpThreshold: DEFAULT_KG_JUMP_THRESHOLD,
  repSpikeThreshold: DEFAULT_REP_SPIKE_THRESHOLD,
  overRecommendationRatio: DEFAULT_OVER_RECOMMENDATION_RATIO,
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
    // over-recommendation ratio is a fixed hard-safety floor — NOT relaxed by
    // vitality/adherence. A large overshoot vs the engine rec is dangerous
    // regardless of recovery state.
    overRecommendationRatio: DEFAULT_OVER_RECOMMENDATION_RATIO,
  };
}

export type AggressiveReason = 'fast_sets' | 'kg_jump' | 'rep_spike' | 'over_recommendation';

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
 *   0. over_recommendation: newSet.kg vs engine rec (targetKg) > 40% over.
 *      Fires EVEN cand history empty (06.AA.010 — first set / fresh install
 *      has no baseline, but the engine rec IS a baseline). Highest priority:
 *      a large overshoot vs the rec is the most direct danger signal.
 *   1. fast_sets: ≥2 sets logged < 30sec interval (last in history vs newSet)
 *   2. kg_jump: newSet.kg vs last in history > 20% increase
 *   3. rep_spike: newSet.reps vs last in history > 50% increase
 *
 * History-based checks (1-3) NU trigger cand history empty (first set per
 * exercise — no baseline). over_recommendation (0) does NOT need history.
 */
export function detectAggressiveLoad(
  setHistory: readonly SetSample[],
  newSet: SetSample,
  thresholds: AaFrictionThresholds = DEFAULT_THRESHOLDS,
  targetKg?: number,
): AggressiveLoadCheck {
  const last = setHistory.length > 0 ? setHistory[setHistory.length - 1] : undefined;

  // 0. over_recommendation — entered load far above the engine rec. Runs
  // BEFORE the empty-history guard so it fires on the very first set (the
  // 50kg-vs-10kg-rec danger Daniel confirmed). Guard targetKg > 0 (no rec /
  // bodyweight exercise → skip, no baseline to compare).
  //
  // Suppression: if the user's OWN set history is already at/above this load,
  // they are established here — their history is the stronger baseline and
  // the (possibly stale/low) rec must NOT nag. kg_jump (check 2) still catches
  // a sudden jump vs that history. (06.AA.010 matrix: prior 48-50, log 50,
  // rec 10 → no friction; no-history, log 50, rec 10 → friction.)
  if (targetKg !== undefined && targetKg > 0 && newSet.kg > 0) {
    const establishedAtLoad = last !== undefined && last.kg >= newSet.kg;
    if (!establishedAtLoad) {
      const overRatio = (newSet.kg - targetKg) / targetKg;
      if (overRatio > thresholds.overRecommendationRatio) {
        return { trigger: true, reason: 'over_recommendation' };
      }
    }
  }

  if (setHistory.length === 0) return { trigger: false };

  if (last === undefined) return { trigger: false };

  // 1. fast_sets — insufficient recovery between sets.
  // Guard: skip cand last.timestamp <= 0 (no real baseline — legacy/fresh
  // install/test fixture default 0). Symmetric cu last.kg>0 / last.reps>0
  // guards below. LOW-CODE-08 fix.
  if (
    last.timestamp > 0 &&
    newSet.timestamp > 0 &&
    newSet.timestamp - last.timestamp < thresholds.fastSetsIntervalMs
  ) {
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
