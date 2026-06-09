// ══ PHASE RESOLUTION LEAF — active-phase + AUTO detection ══════════════════
// Hygiene split (zero behavior change): resolveActivePhase + its AUTO detector
// (detectAutoPhaseKey / getAutoDetectedPhaseLabelRo) + the manual-override gating
// helpers were defined in engineWrappers.nutrition.ts and consumed by
// workoutStore.logic.ts — which closed a circular dependency
// (nutrition → userTdee → workoutStore → workoutStore.logic → nutrition,
// madge hard-gate). Relocated here into a LEAF that imports only stores +
// goalPhaseModel + phaseAutoDetection + the bodyComp leaves + userProfile
// (workoutStore-FREE) — so workoutStore.logic imports resolveActivePhase from
// here, severing the logic→nutrition back-edge. engineWrappers.nutrition.ts
// re-exports resolveActivePhase + getAutoDetectedPhaseLabelRo (and imports the
// gating helpers back) → the public API is unchanged.

import { useProgresStore } from '../stores/progresStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import type { Goal } from '../stores/onboardingStore';
import {
  targetDirection,
  phaseForGoal,
  enabledGoalsForDirection,
  type PhaseToken,
} from './goalPhaseModel';
import {
  detectAutoPhaseFromWeightTrend,
  detectAutoPhaseFromBodyComp,
} from '../../engine/goalAdaptation/phaseAutoDetection.js';
import { computeBMI } from '../../engine/bodyComposition.js';
import { estimateBfFraction } from './bodyComp';
import { getCurrentWeightKg, readOnboardingGoal } from './userProfile';

// Valid manual-override tokens (membership check only — the kcal MAGNITUDE is
// sized coherently via sizeKcalForPhase, NOT these keys; see getPhaseOverrideKcalToday).
export const PHASE_MULTIPLIERS: Record<string, number> = {
  CUT: 0.82,
  BULK: 1.08,
  MAINTENANCE: 1.0,
  STRENGTH: 1.05,
};

// Phase token → its equivalent onboarding goal (inverse of phaseForGoal), so a
// manual override can be tested against the SAME gating set the goal card uses.
const PHASE_TOKEN_TO_GOAL: Record<string, Goal> = {
  CUT: 'slabire',
  BULK: 'masa',
  STRENGTH: 'forta',
  MAINTENANCE: 'mentenanta',
};

/**
 * True when a manual phase override is coherent with the target-weight direction
 * (reuses enabledGoalsForDirection — the goal-card gating set). No direction (no
 * target / MAINTAIN-band) → nothing to contradict, override stays valid. AUTO is
 * never reconciled here (handled before this). Pure.
 */
export function isPhaseTokenEnabledForDirection(
  token: PhaseToken,
  dir: ReturnType<typeof targetDirection>,
): boolean {
  if (dir === null) return true;
  const goal = PHASE_TOKEN_TO_GOAL[token];
  if (goal === undefined) return true;
  return enabledGoalsForDirection(dir).has(goal);
}

/**
 * Resolve the ACTIVE phase token, coherence-model precedence (2026-05-30):
 *   1. manual phase override (B001 SchimbaFaza) when set + not AUTO — honored
 *      UNLESS it contradicts the target-weight direction (override-vs-target
 *      parity via enabledGoalsForDirection), else fall through.
 *   2. else the onboarding goal's phase (phaseForGoal). 'auto'/null → AUTO.
 *   3. AUTO resolves to the real phase: (a) target-weight direction LOSE→CUT /
 *      GAIN→BULK; (b) the established Engine #2 detector (detectAutoPhaseKey).
 * Pure-ish I/O boundary (reads localStorage + stores). Defensive → AUTO.
 */
export function resolveActivePhase(): PhaseToken | null {
  // Target-weight direction (master intent) — needed up front so a manual
  // override can be reconciled against it before it is honored.
  const { weightKg } = useProgresStore.getState().targetObiectiv;
  const dir = targetDirection(getCurrentWeightKg(), weightKg);
  try {
    const raw = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as string | null;
    if (raw && raw !== 'AUTO' && PHASE_MULTIPLIERS[raw] !== undefined) {
      // Override-vs-target reconciliation (parity with goal-vs-target below): a
      // manual phase that contradicts a clear target direction (e.g. a BULK
      // override while target < current) is treated as INVALID via the same
      // gating set the goal card uses, and we fall through to the coherent
      // goal/AUTO resolution. A non-contradicting override is honored.
      if (!isPhaseTokenEnabledForDirection(raw as PhaseToken, dir)) {
        /* contradicting override → drop, fall through to goal-derived */
      } else {
        return raw as PhaseToken;
      }
    }
  } catch {
    /* fall through to goal-derived */
  }
  const goal = readOnboardingGoal();
  // Cold-start, no onboarding goal AND no target → no directional signal at all;
  // return null so the caller falls back to plain maintenance (no fabricated
  // deficit/surplus). A target set without a goal still drives direction below.
  if ((goal === null || goal === undefined) && dir === null) return null;

  const token = phaseForGoal(goal as Parameters<typeof phaseForGoal>[0]);
  if (token !== 'AUTO') return token;

  // AUTO — (a) target direction is the explicit master signal.
  if (dir === 'LOSE') return 'CUT';
  if (dir === 'GAIN') return 'BULK';

  // (b) established Engine #2 detector (weight-trend + sex-aware body-comp).
  const trendKey = detectAutoPhaseKey();
  return trendKey === 'CUT' || trendKey === 'BULK' || trendKey === 'STRENGTH'
    ? (trendKey as PhaseToken)
    : 'MAINTENANCE';
}

/**
 * AUTO phase key (Engine #2): weight-trend prioritar (CUT/BULK), body-comp
 * fallback cand trend e MAINTAIN (cold-start / span scurt / platou). Mapeaza
 * PHASES engine → cheile PHASE_MULTIPLIERS ('MAINTAIN' → 'MAINTENANCE').
 * Defensive: throw → 'MAINTENANCE'. Pure-ish I/O boundary (citeste stores).
 */
function detectAutoPhaseKey(): string {
  try {
    const phaseToKey = (phase: string): string =>
      phase === 'CUT' ? 'CUT' : phase === 'BULK' ? 'BULK' : 'MAINTENANCE';

    // 1. weight-trend prioritar cand are semnal directional (CUT/BULK).
    const weightLog = useProgresStore.getState().weightLog;
    const trend = detectAutoPhaseFromWeightTrend(weightLog);
    if (trend.phase === 'CUT' || trend.phase === 'BULK') {
      return phaseToKey(trend.phase);
    }

    // 2. weight-trend MAINTAIN (cold-start/flat) → decide din compozitia corporala.
    // Canonical greutate curenta (ultima logata > onboarding) — audit CRIT.
    const { sex, height, age } = useOnboardingStore.getState().data;
    const weight = getCurrentWeightKg();
    const bfFraction = estimateBfFraction({ weight, height, age, sex });
    const bmi = computeBMI(Number(weight), Number(height));
    const bodyComp = detectAutoPhaseFromBodyComp({
      bfPctFraction: bfFraction ?? null,
      bmi,
      ...(sex ? { sex } : {}),
    });
    return phaseToKey(bodyComp.phase);
  } catch {
    return 'MAINTENANCE';
  }
}

/**
 * Eticheta RO a fazei AUTO-detectate (weight trend + body-comp), pentru
 * SchimbaFaza ("Auto → Mentinere/Cut/Bulk recomandat"). Cold-start fara stats →
 * 'Mentinere'. Reuse detectAutoPhaseKey (single source).
 */
const AUTO_PHASE_LABELS_RO: Record<string, string> = {
  CUT: 'Cut',
  BULK: 'Bulk',
  MAINTENANCE: 'Mentinere',
};
export function getAutoDetectedPhaseLabelRo(): string {
  return AUTO_PHASE_LABELS_RO[detectAutoPhaseKey()] ?? 'Mentinere';
}
