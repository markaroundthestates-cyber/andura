import { describe, it, expect } from 'vitest';
import { validateBranch, hasViolation } from '../invariants.js';

/** @typedef {import('../types.js').ConstraintObject} ConstraintObject */
/** @typedef {import('../types.js').EnginesPipelineOutput} EnginesPipelineOutput */

/** @returns {ConstraintObject} */
function mkConstraint(overrides = {}) {
  return /** @type {ConstraintObject} */ ({
    persona: { name: 'Test', age: 30, sex: 'M', kg: 75, height: 175, bmi: 24, job: 'office', lifestyle: 'sedentary' },
    goal: { template: 'Tonifiere', phase: 'MAINTAIN', mode: 'Estetica' },
    experience: 'intermediate',
    equipment: ['dumbbell'],
    schedule: { frequency: 4, session_duration_target: 60 },
    history: { tier: 'T2', cdl_window: [] },
    recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: [] },
    profile_typing: { primary: 'mixed', secondary: 'mixed', confidence: 0.5 },
    demographic_prior: { anchor_personas: [] },
    ...overrides,
  });
}

/** @returns {EnginesPipelineOutput} */
function mkOutput(overrides = {}) {
  return /** @type {EnginesPipelineOutput} */ ({
    execution: {
      sets_reps_rir: [
        { exercise: 'squat', sets: 4, reps: 8, rir: 2 },
        { exercise: 'bench', sets: 4, reps: 8, rir: 2 },
      ],
    },
    deload: { triggered: false, depth: null },
    ...overrides,
  });
}

describe('I1 volume under MRV', () => {
  it('moderate Marius volume → PASS', () => {
    const r = validateBranch(mkOutput(), mkConstraint());
    expect(r.I1_volume_under_mrv).toBe('PASS');
  });
  it('huge volume Maria 65 → FAIL', () => {
    const out = mkOutput({
      execution: {
        sets_reps_rir: Array.from({ length: 10 }, () => ({ exercise: 'x', sets: 5, reps: 10, rir: 2 })),
      },
      deload: { triggered: false, depth: null },
    });
    const c = mkConstraint({ persona: { ...mkConstraint().persona, age: 65 } });
    const r = validateBranch(out, c);
    expect(r.I1_volume_under_mrv).toBe('FAIL');
    expect(hasViolation(r)).toBe(true);
  });
});

describe('I2 RIR > 0', () => {
  it('all RIR ≥1 → PASS', () => {
    expect(validateBranch(mkOutput(), mkConstraint()).I2_rir_above_zero).toBe('PASS');
  });
  it('RIR=0 fara intentional_failure → FAIL', () => {
    const out = mkOutput({
      execution: { sets_reps_rir: [{ exercise: 'squat', sets: 4, reps: 6, rir: 0 }] },
      deload: { triggered: false, depth: null },
    });
    expect(validateBranch(out, mkConstraint()).I2_rir_above_zero).toBe('FAIL');
  });
  it('RIR=0 cu intentional_failure flag → PASS', () => {
    const out = mkOutput({
      execution: { sets_reps_rir: [{ exercise: 'squat', sets: 4, reps: 6, rir: 0, intentional_failure: true }] },
      deload: { triggered: false, depth: null },
    });
    expect(validateBranch(out, mkConstraint()).I2_rir_above_zero).toBe('PASS');
  });
  it('RIR negative → FAIL (nonsense)', () => {
    const out = mkOutput({
      execution: { sets_reps_rir: [{ exercise: 'squat', sets: 4, reps: 6, rir: -1 }] },
      deload: { triggered: false, depth: null },
    });
    expect(validateBranch(out, mkConstraint()).I2_rir_above_zero).toBe('FAIL');
  });
});

describe('I3 frequency under 6/sapt', () => {
  it('frequency 5 → PASS', () => {
    const r = validateBranch(mkOutput(), mkConstraint({ schedule: { frequency: 5, session_duration_target: 60 } }));
    expect(r.I3_frequency_under_6).toBe('PASS');
  });
  it('frequency 6 → FAIL', () => {
    const r = validateBranch(mkOutput(), mkConstraint({ schedule: { frequency: 6, session_duration_target: 60 } }));
    expect(r.I3_frequency_under_6).toBe('FAIL');
  });
});

describe('I4 deload mandatory block present', () => {
  it('deload block present → PASS', () => {
    expect(validateBranch(mkOutput(), mkConstraint()).I4_deload_mandatory).toBe('PASS');
  });
  it('deload block missing → FAIL (engine #4 spec gap)', () => {
    const out = /** @type {EnginesPipelineOutput} */ ({
      execution: { sets_reps_rir: [{ exercise: 'squat', sets: 4, reps: 8, rir: 2 }] },
    });
    expect(validateBranch(out, mkConstraint()).I4_deload_mandatory).toBe('FAIL');
  });
});

describe('I5 medical safety contraindication respect', () => {
  it('no injury flags → PASS', () => {
    expect(validateBranch(mkOutput(), mkConstraint()).I5_medical_safety).toBe('PASS');
  });
  it('knee_arthrosis + squat_deep selected → FAIL', () => {
    const out = mkOutput({
      execution: { sets_reps_rir: [{ exercise: 'squat_deep_back', sets: 4, reps: 6, rir: 2 }] },
      deload: { triggered: false, depth: null },
    });
    const c = mkConstraint({
      recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['knee_arthrosis'] },
    });
    expect(validateBranch(out, c).I5_medical_safety).toBe('FAIL');
  });
  it('pregnant + supine_bench → FAIL', () => {
    const out = mkOutput({
      execution: { sets_reps_rir: [{ exercise: 'supine_bench_press', sets: 3, reps: 10, rir: 3 }] },
      deload: { triggered: false, depth: null },
    });
    const c = mkConstraint({
      recovery: { vitality_tier: 'MED', pre_session_readiness: 'GREEN', injury_flags: ['pregnant'] },
    });
    expect(validateBranch(out, c).I5_medical_safety).toBe('FAIL');
  });
});

describe('hasViolation aggregator', () => {
  it('all PASS → no violation', () => {
    expect(hasViolation({
      I1_volume_under_mrv: 'PASS', I2_rir_above_zero: 'PASS',
      I3_frequency_under_6: 'PASS', I4_deload_mandatory: 'PASS', I5_medical_safety: 'PASS',
    })).toBe(false);
  });
  it('any FAIL → violation', () => {
    expect(hasViolation({
      I1_volume_under_mrv: 'PASS', I2_rir_above_zero: 'FAIL',
      I3_frequency_under_6: 'PASS', I4_deload_mandatory: 'PASS', I5_medical_safety: 'PASS',
    })).toBe(true);
  });
});
