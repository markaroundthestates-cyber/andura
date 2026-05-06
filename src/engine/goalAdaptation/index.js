// Engine #2 Goal Adaptation V1 — public API per ADR 026 §9.2 + ADR 018 §2.
//
// Pure function `evaluate(ctx) → GoalAdaptationResult` total + deterministic +
// async-capable (DP-2). ZERO side effects per ADR 030 D2 thin scope.
//
// Pipeline §42.10 sequential — Goal Adaptation = 2nd engine post Engine #1
// Periodization. Consumes Periodization Constraint Object Hook 1 read-only,
// redistribuie volume/intensity INTERIOR Floor/Ceiling per §1.10 LOCKED V1.
//
// Wire-up Faza 3 STRANGLER post engines #1-#8 V1 LANDED — separate task.
// V1 implementation acest task tactical pure-function module only.
//
// Source: 03-decisions/026-offline-coaching-decision-tree-exhaustive.md §9.2

import { resolveGoalId, resolvePersonaId } from '../periodization/volumeLandmarks.js';
import { resolveTemplateId } from './templates.js';
import {
  detectPhase,
  tdeeMultiplierForPhase,
  applyDeloadKcalOverride,
  computeMacroSplit,
} from './phaseAutoDetection.js';
import {
  resolveModeOverlay,
  computeRepRangeModifier,
  computeRirTargetModifier,
  computeRestTimeModifier,
} from './trainingModifiers.js';
import { computePushBackSignal } from './pushBackTiers.js';
import {
  readIntensityCorridor,
  readVolumeCorridor,
  applyTier3Conservative,
} from './crossEngineHooks.js';
import { PUSHBACK_TIERS } from './constants.js';

export const ENGINE_ID = 'goalAdaptation';

/**
 * Compute confidence level based on ctx data completeness.
 *
 * @param {Object} input
 * @param {boolean} input.hasUser
 * @param {boolean} input.hasPeriodizationConstraint
 * @param {boolean} input.hasTdee
 * @returns {'low'|'medium'|'high'}
 */
function computeConfidence({ hasUser, hasPeriodizationConstraint, hasTdee }) {
  let score = 0;
  if (hasUser) score += 1;
  if (hasPeriodizationConstraint) score += 1;
  if (hasTdee) score += 1;
  if (score >= 3) return 'high';
  if (score === 2) return 'medium';
  return 'low';
}

/**
 * Evaluate Goal Adaptation Engine #2 per ADR 026 §9.2 spec V1.
 *
 * Total function: NEVER throws. Insufficient ctx → returns valid
 * GoalAdaptationResult cu tier 'none', confidence 'low', signals empty.
 *
 * Deterministic: identical ctx → identical output. ZERO Date.now / Math.random.
 *
 * Pure: NO side effects (NO localStorage / Firebase / mutation of ctx).
 *
 * Output blueprint 6 fields verbatim §9.2.1 Cluster 1:
 *   1. phase                  - auto-derived CUT/BULK/MAINTAIN/RECOMP
 *   2. kcal_target_delta_pct  - TDEE multiplier per phase × goal × persona
 *   3. macro_split            - protein/fat/carb split bands
 *   4. rep_range_modifier     - [min, max] integer pair per (template, phase)
 *   5. rir_target_modifier    - [floor, ceiling] integer pair per (template, phase)
 *   6. rest_time_modifier     - [min, max] secunde per template × phase
 *
 * @param {import('../../coach/orchestrator/types.js').EngineContext} [ctx]
 * @returns {Promise<import('./types.js').GoalAdaptationResult>}
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
  const meta = safeCtx.meta && typeof safeCtx.meta === 'object' ? safeCtx.meta : {};

  // Periodization Constraint Object Hook 1 (consumed read-only)
  const periodizationConstraint = meta.periodizationConstraint || null;
  const hasPeriodizationConstraint = periodizationConstraint !== null
    && typeof periodizationConstraint === 'object';

  const personaId = resolvePersonaId(user);
  const goalId = resolveGoalId(user);
  const templateId = resolveTemplateId(goalId);
  const mode = resolveModeOverlay(user);
  trace.personaId = personaId;
  trace.goalId = goalId;
  trace.templateId = templateId;
  trace.mode = mode;

  // Phase auto-detection runtime per Cluster 3 + RECOMP sub-phase
  const phaseResult = detectPhase({ goalId, templateId, user, recentSessions });
  signals.push(...phaseResult.signals);
  trace.phase = phaseResult.phase;

  // TDEE multiplier per phase × persona × template context
  const isAggressiveOptIn = meta.aggressiveOptIn === true;
  const isNewbie = Number(user.trainingWeeks) <= 12;
  const isDeloadWeek = periodizationConstraint
    && periodizationConstraint.phase === 'DELOAD';
  const baseMultiplier = tdeeMultiplierForPhase({
    phase: phaseResult.phase,
    personaId,
    templateId,
    isNewbie,
    isAggressiveOptIn,
  });
  const kcalDeltaPct = applyDeloadKcalOverride(baseMultiplier, isDeloadWeek);
  trace.baseMultiplier = baseMultiplier;
  trace.kcalDeltaPct = kcalDeltaPct;
  if (isDeloadWeek) signals.push('deload_kcal_override_applied');

  // Macro split per Cluster 3 verbatim bands
  const tdeeKcal = Number(meta.tdeeKcal) || 0;
  const macroSplit = computeMacroSplit({ user, tdeeKcal, kcalDeltaPct });
  trace.macroSplit = macroSplit;

  // Training modifiers per (template, phase) × mode overlay
  const repRange = computeRepRangeModifier({
    templateId,
    phase: phaseResult.phase,
    mode,
  });
  const rirRange = computeRirTargetModifier({
    templateId,
    phase: phaseResult.phase,
    mode,
  });
  const restRange = computeRestTimeModifier({
    templateId,
    phase: phaseResult.phase,
    mode,
  });
  trace.repRange = repRange;
  trace.rirRange = rirRange;
  trace.restRange = restRange;

  // Push-back signal per Cluster 5
  const pushBack = computePushBackSignal({ goalId, user, recentSessions });
  trace.pushBack = pushBack;
  signals.push(`pushback_${pushBack.tier.toLowerCase()}`);
  for (const reason of pushBack.reasons) signals.push(`risk_${reason}`);

  // Cross-engine hooks: redistribuie INTERIOR Periodization corridor
  const intensityCorridor = readIntensityCorridor(periodizationConstraint);
  const volumeCorridor = readVolumeCorridor(periodizationConstraint);
  const applyTier3 = pushBack.tier === PUSHBACK_TIERS.TIER_3_MODAL;
  const adjusted = applyTier3Conservative({
    intensityCorridor,
    volumeCorridor,
    applyTier3,
  });
  trace.adjustedIntensityCorridor = adjusted.intensityCorridor;
  trace.adjustedVolumeCorridor = adjusted.volumeCorridor;
  if (applyTier3) signals.push('tier3_conservative_modifiers_applied');

  /** @type {import('./types.js').GoalAdaptationBlueprint} */
  const blueprint = {
    phase:                phaseResult.phase,
    kcal_target_delta_pct: kcalDeltaPct,
    macro_split:           macroSplit,
    rep_range_modifier:    repRange,
    rir_target_modifier:   rirRange,
    rest_time_modifier:    restRange,
  };

  const confidence = computeConfidence({
    hasUser: Object.keys(user).length > 0,
    hasPeriodizationConstraint,
    hasTdee: tdeeKcal > 0,
  });

  // Tier semantic per ADR 018 §2 enum: 'none' / 'LOW' / 'MED' / 'HIGH'
  // V1 default 'MED' when computed; 'none' when ctx empty
  const tier = Object.keys(user).length === 0 ? 'none' : 'MED';

  return {
    id:               ENGINE_ID,
    tier,
    confidence,
    signals,
    recommendations:  [], // V1 empty — Stage 3 ENHANCEMENT downstream emission
    trace,
    meta:             blueprint,
  };
}
