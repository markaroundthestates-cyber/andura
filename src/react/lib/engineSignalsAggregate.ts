// ══ ENGINE SIGNALS AGGREGATE — Adherence + Energy + Vitality React Bundle ═
// Phase 5 task_10 — bundle 3 engine signals în 1 React-side helper pentru
// consume by aaFriction dynamic thresholds + Antrenor home cards.
// ZERO src/engine/* mutation per orchestrator §7. Composes existing engine
// wrapper exports + fallback baseline când engine API absent.

import { getReadiness, getFatigue } from './engineWrappers';

export interface EngineSignals {
  vitalityScore: number; // 0-100 (higher = better recovery)
  adherenceScore: number; // 0-100 (higher = more consistent)
  energyDirection: 'up' | 'flat' | 'down';
  // Source confidence — useful pentru consumer skip optional features
  source: 'engine' | 'baseline';
}

// Baseline values mid-range cand engine absent. Phase 6+ replaces cu real
// engine outputs (Vitality Engine #5 + Adherence Engine #4 + Energy
// Adjustment Engine #3 readiness ratio).
const BASELINE_VITALITY = 50;
const BASELINE_ADHERENCE = 50;

/**
 * Aggregate Adherence + Energy + Vitality signals în 1 helper. Phase 5
 * task_10 best-effort compose — uses readiness verdict pentru energy
 * direction; vitality + adherence baseline pending Phase 6+ engine wire.
 */
export function getEngineSignals(): EngineSignals {
  const readiness = getReadiness();
  const fatigue = getFatigue();
  let energyDirection: EngineSignals['energyDirection'] = 'flat';
  if (readiness !== null) {
    if (readiness.score >= 80) energyDirection = 'up';
    else if (readiness.score < 50) energyDirection = 'down';
  }
  // Vitality proxy: inverse fatigue score (high fatigue = low vitality).
  // Bounded mid range când fatigue absent.
  const vitalityScore =
    fatigue !== null && typeof fatigue.score === 'number'
      ? Math.max(0, Math.min(100, 100 - fatigue.score))
      : BASELINE_VITALITY;
  // Adherence proxy: streak-derived (Phase 5 task_10 fallback baseline).
  const adherenceScore = BASELINE_ADHERENCE;
  return {
    vitalityScore,
    adherenceScore,
    energyDirection,
    source: readiness !== null || fatigue !== null ? 'engine' : 'baseline',
  };
}
