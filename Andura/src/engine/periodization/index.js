// Engine #1 Periodization V1 — public API per ADR 026 §9.1 + ADR 018 §2.
//
// Pure function `evaluate(ctx) → PeriodizationResult` total + deterministic +
// async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Wire-up Faza 3 STRANGLER post engines #1-#8 V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/_FROZEN/026-offline-coaching-decision-tree-exhaustive.md §9.1

import {
  computePhase,
  volumeMultiplierForPhase,
  intensityMultiplierForPhase,
  resolveTrigger,
} from './mesocycle.js';
import {
  resolvePersonaId,
  resolveGoalId,
  computeVolumeMap,
} from './volumeLandmarks.js';
import {
  computeMacrocycleBlock,
  effectiveBlockScaling,
} from './macrocycle.js';
import {
  emitConstraintObject,
  intensityCorridorForGoal,
  enforceHardCapIntensity,
} from './crossEngineHooks.js';

export const ENGINE_ID = 'periodization';

/**
 * Compute confidence level based on ctx data completeness.
 *
 * @param {Object} input
 * @param {boolean} input.hasUser
 * @param {boolean} input.hasRecentSessions
 * @param {boolean} input.hasMacrocycleAnchor
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({ hasUser, hasRecentSessions, hasMacrocycleAnchor }) {
  let score = 0;
  if (hasUser) score += 1;
  if (hasRecentSessions) score += 1;
  if (hasMacrocycleAnchor) score += 1;
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

/**
 * Evaluate Periodization Engine #1 per ADR 026 §9.1 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid
 * PeriodizationResult cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').PeriodizationResult>}
 */
export async function evaluate(ctx) {
  /** @type {string[]} */
  const signals = [];
  /** @type {Object} */
  const trace = {};

  // Defensive ctx unpacking — total function semantics
  const safeCtx = ctx && typeof ctx === 'object' ? ctx : {};
  const user = safeCtx.user && typeof safeCtx.user === 'object' ? safeCtx.user : {};
  const recentSessions = Array.isArray(safeCtx.recentSessions) ? safeCtx.recentSessions : [];
  const profileTier = typeof safeCtx.profileTier === 'string' ? safeCtx.profileTier : null;
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};

  const personaId = resolvePersonaId(user);
  const goalId = resolveGoalId(user);
  trace.personaId = personaId;
  trace.goalId = goalId;

  // Macrocycle position from elapsed weeks (orchestrator passes via meta)
  const weeksElapsed = Number(meta.weeksElapsed);
  const hasMacrocycleAnchor = Number.isFinite(weeksElapsed) && weeksElapsed >= 0;
  const block = computeMacrocycleBlock(hasMacrocycleAnchor ? weeksElapsed : 0, goalId);
  trace.block = block;

  // Effective block scaling (Maria adaptive override applied)
  const { scaling, gateSignals } = effectiveBlockScaling({
    mesocycleIdx: block.mesocycleIdx,
    personaId,
    profileTier,
    recentSessions,
  });
  signals.push(...gateSignals);
  trace.blockScaling = scaling;

  // Phase + multipliers
  const phase = computePhase(block.weekInMesocycle);
  const phaseVolMul = volumeMultiplierForPhase(phase);
  const phaseIntMul = intensityMultiplierForPhase(phase);
  trace.phase = phase;
  trace.phaseVolMul = phaseVolMul;
  trace.phaseIntMul = phaseIntMul;

  // Trigger hierarchy resolution (EARLY_SAFETY > EXTENSION_MARIUS > CALENDAR)
  const earlySafetyTriggered = meta.earlySafetyTriggered === true;
  const consecutiveExtensions = Number(meta.consecutiveExtensions) || 0;
  const triggerInfo = resolveTrigger({
    earlySafetyTriggered,
    personaId,
    recentSessions,
    consecutiveExtensions,
  });
  signals.push(...triggerInfo.signals);
  trace.trigger = triggerInfo.trigger;

  // Deload window emission per Cluster 1 + Cluster 2 trigger source
  /** @type {import('./types.js').DeloadWindow} */
  let deloadWindow = null;
  if (triggerInfo.trigger === 'EARLY_SAFETY') {
    deloadWindow = { trigger: 'EARLY_SAFETY', days: 7 };
  } else if (phase === 'DELOAD' && triggerInfo.trigger !== 'EXTENSION_MARIUS') {
    deloadWindow = { trigger: 'CALENDAR', days: 7 };
  } else if (triggerInfo.trigger === 'EXTENSION_MARIUS') {
    deloadWindow = null; // extension granted — no deload this week
    signals.push('marius_extension_granted_no_deload');
  }
  trace.deloadWindow = deloadWindow;

  // Volume map computation (Israetel × persona × goal × scaling × phase)
  const recoveryGreen = safeCtx.recoveryGreen === true || (safeCtx.recovery && safeCtx.recovery.green === true);
  const recoveryStrength = (safeCtx.recovery && safeCtx.recovery.strength) || undefined;
  const volumeMap = computeVolumeMap({
    personaId,
    goalId,
    blockScaling: scaling,
    phaseVolumeMul: phaseVolMul,
    recoveryGreen,
    recoveryStrength,
  });
  trace.volumeMap = volumeMap;

  // Intensity corridor (goal-derived, hard-capped 90% 1RM, phase-multiplied)
  const baseCorridor = intensityCorridorForGoal(goalId);
  const phaseAdjustedCorridor = enforceHardCapIntensity({
    floor:   baseCorridor.floor * phaseIntMul,
    ceiling: baseCorridor.ceiling * phaseIntMul,
  });
  trace.intensityCorridor = phaseAdjustedCorridor;

  // Constraint Object emitted via Cluster 5 cross-engine hooks
  const constraintObject = emitConstraintObject({
    phase,
    volumeMap,
    intensityCorridor: phaseAdjustedCorridor,
    deloadWindow,
  });
  trace.constraintObject = constraintObject;

  /** @type {import('./types.js').PeriodizationBlueprint} */
  const blueprint = {
    mesocycle_phase:      phase,
    volume_target_pct:    volumeMap,
    intensity_target_pct: phaseAdjustedCorridor,
    macrocycle_block:     block,
    deload_window:        deloadWindow,
  };

  const confidence = computeConfidence({
    hasUser: Object.keys(user).length > 0,
    hasRecentSessions: recentSessions.length > 0,
    hasMacrocycleAnchor,
  });

  // Tier semantic per ADR 018 §2 enum: 'none' / 'LOW' / 'MED' / 'HIGH'
  // V1 default 'MED' when computed; 'none' when ctx empty (no user info)
  const tier = Object.keys(user).length === 0 ? 'none' : 'MED';

  return {
    id:               ENGINE_ID,
    tier,
    confidence,
    signals,
    recommendations:  [],   // V1 empty — Hook 1-4 Constraint Object emission via meta; downstream engines consume
    trace,
    meta:             blueprint,
  };
}
