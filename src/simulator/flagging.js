// ══ FLAGGING ENGINE — 6 categories per SCENARIOS_SIMULATOR_DESIGN_V1 §6 ════

import { hasViolation } from './invariants.js';

/** @typedef {import('./types.js').BranchReport} BranchReport */
/** @typedef {import('./types.js').FlagCategory} FlagCategory */

/**
 * Detect flags for a branch report (post-pipeline + post-invariants).
 *
 * Categories (per SCENARIOS_SIMULATOR_DESIGN_V1.md §6):
 * 1. engines_disagree — 2+ engines produce contradicting outputs
 * 2. circuit_breaker_fallback — population fallback K-NN <0.50 (ADR 026 Q3)
 * 3. invariant_violation — any 4-Invariant + 5th Medical Safety failure
 * 4. output_non_sane — volume negativ, frequency 0, RIR negativ, kcal sub BMR
 * 5. coverage_gap — combination produces no engine output (orphan branch)
 * 6. persona_critical_edge — safety_critical=true edge cases (Maria 65 + injury,
 *    pregnant, ED history, post-bariatric) → Daniel mandatory review
 *
 * Plus `engine_2_spec_gap` per SCENARIOS_SIMULATOR_DESIGN_V1 §9 workaround.
 *
 * @param {Pick<BranchReport, 'input' | 'engines_pipeline_output' | 'invariants_check'>} branch
 * @returns {FlagCategory[]}
 */
export function flagBranch(branch) {
  /** @type {FlagCategory[]} */
  const flags = [];
  const out = branch.engines_pipeline_output;
  const c = branch.input;

  // 3. invariant_violation
  if (hasViolation(branch.invariants_check)) flags.push('invariant_violation');

  // 5. coverage_gap — no engine output at all
  const engineKeys = ['periodization', 'goal_adaptation', 'energy_adjustment',
    'exercise_selection', 'warm_up', 'execution', 'specialization', 'deload'];
  const present = engineKeys.filter((k) => out[k] !== undefined).length;
  if (present === 0) flags.push('coverage_gap');

  // 4. output_non_sane — concrete spec-gap signals
  const exec = out.execution;
  if (exec && Array.isArray(/** @type {any} */(exec).sets_reps_rir)) {
    for (const s of /** @type {any} */(exec).sets_reps_rir) {
      if (Number(s?.sets) < 0 || Number(s?.reps) < 0 || Number(s?.rir) < 0) {
        flags.push('output_non_sane');
        break;
      }
    }
  }
  if (Number(c.schedule.frequency) <= 0) flags.push('output_non_sane');
  const ga = /** @type {any} */(out.goal_adaptation);
  if (ga && Number(ga.kcal_target) > 0 && Number(ga.kcal_target) < 800) {
    // BMR floor heuristic — under 800 kcal / day = nonsense
    flags.push('output_non_sane');
  }

  // 1. engines_disagree — Energy UP vs Periodization Ceiling, or Goal phase mismatch
  const e5 = /** @type {any} */(out.energy_adjustment);
  const e1 = /** @type {any} */(out.periodization);
  if (e5 && e1 && Number(e5.modulation_factor) > 1.10 && Number(e1.volume_ceiling) > 0
      && Number(e5.modulation_factor) * Number(e1.volume_ceiling) > Number(e1.volume_ceiling) * 1.0) {
    // Trivially flagged — Energy UP exceeding Periodization ceiling
    flags.push('engines_disagree');
  }

  // 2. circuit_breaker_fallback — population fallback flag from pipeline output
  const efb = /** @type {any} */(out.exercise_selection);
  if (efb && efb.fallback_used === true) flags.push('circuit_breaker_fallback');

  // 6. persona_critical_edge — Maria 65 + injury combos, pregnant, ED, post-bariatric
  const safetyCriticalFlags = ['pregnant', 'ed_history', 'post_bariatric',
    'kidney_disease', 'cardiac_event_recent'];
  const matchedCritical = c.recovery.injury_flags.some((f) =>
    safetyCriticalFlags.includes(String(f).toLowerCase()),
  );
  const ageCriticalCombo = c.persona.age >= 65 && c.recovery.injury_flags.length > 0;
  if (matchedCritical || ageCriticalCombo) flags.push('persona_critical_edge');

  // engine_2_spec_gap — design §9 workaround signal
  if (ga && ga.fallback_template_240 === true) flags.push('engine_2_spec_gap');

  return flags;
}

/**
 * Branch requires Claude reasoning fill if any flag present.
 * @param {ReadonlyArray<FlagCategory>} flags
 */
export function claudeReasoningRequired(flags) {
  return flags.length > 0;
}
