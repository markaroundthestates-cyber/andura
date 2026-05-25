import { describe, it, expect } from 'vitest';
import { flagBranch, claudeReasoningRequired } from '../flagging.js';

/** @typedef {import('../types.js').ConstraintObject} ConstraintObject */
/** @typedef {import('../types.js').EnginesPipelineOutput} EnginesPipelineOutput */

/** @returns {ConstraintObject} */
function mkConstraint(overrides = {}) {
  return /** @type {ConstraintObject} */ ({
    persona: { name: 'Test', age: 30, sex: 'M', kg: 75, height: 175, bmi: 24, job: 'office', lifestyle: 'sedentary' },
    goal: { template: 'Tonifiere', phase: 'MAINTAIN', mode: 'Estetica' },
    experience: 'intermediate',
    equipment: ['dumbbell'],
    schedule: { frequency: 3, session_duration_target: 60 },
    history: { tier: 'T2', cdl_window: [] },
    recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: [] },
    profile_typing: { primary: 'mixed', secondary: 'mixed', confidence: 0.5 },
    demographic_prior: { anchor_personas: [] },
    ...overrides,
  });
}

const ALL_PASS = { I1_volume_under_mrv: 'PASS', I2_rir_above_zero: 'PASS', I3_frequency_under_6: 'PASS', I4_deload_mandatory: 'PASS', I5_medical_safety: 'PASS' };

describe('persona_critical_edge flag', () => {
  it('Maria 65 + injury → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint({
        persona: { ...mkConstraint().persona, age: 65 },
        recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['knee_arthrosis'] },
      }),
      engines_pipeline_output: { execution: { sets_reps_rir: [] }, deload: {} },
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('persona_critical_edge');
  });
  it('pregnant → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint({
        recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['pregnant'] },
      }),
      engines_pipeline_output: { execution: { sets_reps_rir: [] }, deload: {} },
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('persona_critical_edge');
  });
});

describe('invariant_violation flag', () => {
  it('any invariant FAIL → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint(),
      engines_pipeline_output: { execution: { sets_reps_rir: [] }, deload: {} },
      invariants_check: { ...ALL_PASS, I2_rir_above_zero: 'FAIL' },
    });
    expect(flags).toContain('invariant_violation');
  });
});

describe('engine_2_spec_gap flag (§9 STUB workaround)', () => {
  it('fallback_template_240 flag → engine_2_spec_gap', () => {
    const flags = flagBranch({
      input: mkConstraint(),
      engines_pipeline_output: {
        execution: { sets_reps_rir: [{ exercise: 'squat', sets: 4, reps: 8, rir: 2 }] },
        deload: {},
        goal_adaptation: { fallback_template_240: true, kcal_target: 2200 },
      },
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('engine_2_spec_gap');
  });
});

describe('output_non_sane flag', () => {
  it('frequency 0 → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint({ schedule: { frequency: 0, session_duration_target: 60 } }),
      engines_pipeline_output: { execution: { sets_reps_rir: [] }, deload: {} },
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('output_non_sane');
  });
  it('kcal under BMR floor 800 → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint(),
      engines_pipeline_output: {
        execution: { sets_reps_rir: [] },
        deload: {},
        goal_adaptation: { kcal_target: 600 },
      },
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('output_non_sane');
  });
});

describe('circuit_breaker_fallback flag', () => {
  it('exercise_selection.fallback_used=true → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint(),
      engines_pipeline_output: {
        execution: { sets_reps_rir: [] },
        deload: {},
        exercise_selection: { exercises: [], fallback_used: true },
      },
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('circuit_breaker_fallback');
  });
});

describe('coverage_gap flag', () => {
  it('no engine output keys → flagged', () => {
    const flags = flagBranch({
      input: mkConstraint(),
      engines_pipeline_output: {},
      invariants_check: ALL_PASS,
    });
    expect(flags).toContain('coverage_gap');
  });
});

describe('claudeReasoningRequired', () => {
  it('any flag → true', () => {
    expect(claudeReasoningRequired(['invariant_violation'])).toBe(true);
  });
  it('zero flags → false', () => {
    expect(claudeReasoningRequired([])).toBe(false);
  });
});
