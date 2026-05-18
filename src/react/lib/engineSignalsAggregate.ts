// ══ ENGINE SIGNALS AGGREGATE — Adherence + Energy + Vitality React Bundle ═
// Phase 5 task_10 → Phase 6 task_08 real wire. Bundle 3 engine signals în
// 1 React-side helper pentru consume by aaFriction dynamic thresholds
// (Workout.handleLogSet task_07) + Antrenor home cards.
//
// Phase 6 task_08: adherenceScore real wired via getAdherenceOutput engine
// (4-component score: kcal + protein + workout + weight, DB-backed via
// coachDecisionLog). BASELINE_ADHERENCE constant ELIMINATED — sole baseline
// fallback path este în getAdherenceOutput defensive (engine throws).
//
// ZERO src/engine/* mutation per orchestrator §7.

import { getReadiness, getFatigue, getAdherenceOutput } from './engineWrappers';

export interface EngineSignals {
  vitalityScore: number; // 0-100 (higher = better recovery)
  adherenceScore: number; // 0-100 (higher = more consistent)
  energyDirection: 'up' | 'flat' | 'down';
  // Source confidence — useful pentru consumer skip optional features
  source: 'engine' | 'baseline';
}

// Vitality baseline preserved Phase 5 (inverse fatigue proxy când engine
// absent). Phase 7+ wires Vitality Layer engine direct (suflet-andura).
const BASELINE_VITALITY = 50;

/**
 * Aggregate Adherence + Energy + Vitality signals în 1 helper.
 * - vitalityScore: inverse fatigue score (high fatigue = low vitality)
 * - adherenceScore: real Adherence Engine via getAdherenceOutput task_08
 * - energyDirection: derived din readiness verdict score thresholds
 * - source: 'engine' cand orice component fed real engine output
 */
export function getEngineSignals(): EngineSignals {
  const readiness = getReadiness();
  const fatigue = getFatigue();
  const adherence = getAdherenceOutput();
  let energyDirection: EngineSignals['energyDirection'] = 'flat';
  if (readiness !== null) {
    if (readiness.score >= 80) energyDirection = 'up';
    else if (readiness.score < 50) energyDirection = 'down';
  }
  const vitalityScore =
    fatigue !== null && typeof fatigue.score === 'number'
      ? Math.max(0, Math.min(100, 100 - fatigue.score))
      : BASELINE_VITALITY;
  // Phase 6 task_08: real adherence din getAdherenceScore engine
  const adherenceScore = adherence.score;
  // source: 'engine' cand orice composer non-baseline
  const anyEngine =
    readiness !== null || fatigue !== null || adherence.source === 'engine';
  return {
    vitalityScore,
    adherenceScore,
    energyDirection,
    source: anyEngine ? 'engine' : 'baseline',
  };
}
