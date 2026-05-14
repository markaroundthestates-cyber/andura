import { describe, it, expect } from 'vitest';
import {
  isEligiblePersona,
  isEligibleTier,
  isEligibleGoalPhase,
  detectInjuryAutoDisable,
  evaluateEligibility,
} from '../activationGating.js';
import { ACTIVATION_STATE } from '../constants.js';

describe('isEligiblePersona — Cluster A Q12 §45.3 LOCKED Marius ONLY', () => {
  it('marius → eligible', () => {
    expect(isEligiblePersona('marius')).toBe(true);
  });

  it('maria → NOT eligible (Q12 LOCKED strict)', () => {
    expect(isEligiblePersona('maria')).toBe(false);
  });

  it('gigica → NOT eligible (Q12 LOCKED strict)', () => {
    expect(isEligiblePersona('gigica')).toBe(false);
  });

  it('case insensitive marius', () => {
    expect(isEligiblePersona('MARIUS')).toBe(true);
    expect(isEligiblePersona('Marius')).toBe(true);
  });

  it('null/undefined/empty → NOT eligible', () => {
    expect(isEligiblePersona(null)).toBe(false);
    expect(isEligiblePersona(undefined)).toBe(false);
    expect(isEligiblePersona('')).toBe(false);
  });

  it('unknown persona → NOT eligible', () => {
    expect(isEligiblePersona('random_xyz')).toBe(false);
  });
});

describe('isEligibleTier — Cluster A T1+ established', () => {
  it('T0 → NOT eligible (calibration window noise high)', () => {
    expect(isEligibleTier('T0')).toBe(false);
  });

  it('T1 → eligible', () => {
    expect(isEligibleTier('T1')).toBe(true);
  });

  it('T2 → eligible', () => {
    expect(isEligibleTier('T2')).toBe(true);
  });

  it('null/undefined → NOT eligible', () => {
    expect(isEligibleTier(null)).toBe(false);
    expect(isEligibleTier(undefined)).toBe(false);
  });

  it('unknown tier string → NOT eligible', () => {
    expect(isEligibleTier('T99')).toBe(false);
  });
});

describe('isEligibleGoalPhase — Cluster A Q5=D + Q13=A dual safety gate', () => {
  it('BULK → eligible', () => {
    expect(isEligibleGoalPhase('BULK')).toBe(true);
  });

  it('RECOMP → eligible', () => {
    expect(isEligibleGoalPhase('RECOMP')).toBe(true);
  });

  it('CUT → NOT eligible (Q5=D dual safety gate, recovery risk universal)', () => {
    expect(isEligibleGoalPhase('CUT')).toBe(false);
  });

  it('MAINTAIN → NOT eligible V1', () => {
    expect(isEligibleGoalPhase('MAINTAIN')).toBe(false);
  });

  it('case-insensitive normalized', () => {
    expect(isEligibleGoalPhase('bulk')).toBe(true);
    expect(isEligibleGoalPhase('cut')).toBe(false);
  });

  it('null → NOT eligible', () => {
    expect(isEligibleGoalPhase(null)).toBe(false);
  });
});

describe('detectInjuryAutoDisable — Q14=A Safety Override §42.9 invariant 5', () => {
  it('PainButton inactive → NOT disabled', () => {
    const r = detectInjuryAutoDisable({ painButtonActive: false });
    expect(r.disabled).toBe(false);
  });

  it('PainButton active + target group affected → disabled', () => {
    const r = detectInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   ['picioare-quads'],
      targetGroup:      'picioare-quads',
    });
    expect(r.disabled).toBe(true);
    expect(r.affectedGroup).toBe('picioare-quads');
    expect(r.rationale).toContain('q14_a');
    expect(r.rationale).toContain('invariant_5');
  });

  it('PainButton active + target group NOT in affected → conservative disable any active', () => {
    const r = detectInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   ['spate', 'umeri'],
      targetGroup:      'picioare-quads',
    });
    expect(r.disabled).toBe(true);
    expect(r.rationale).toContain('conservative');
  });

  it('PainButton active + no specific groups + no target → NOT disabled (no actionable signal)', () => {
    const r = detectInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   [],
    });
    expect(r.disabled).toBe(false);
  });

  it('case-insensitive group matching', () => {
    const r = detectInjuryAutoDisable({
      painButtonActive: true,
      affectedGroups:   ['PICIOARE-QUADS'],
      targetGroup:      'picioare-quads',
    });
    expect(r.disabled).toBe(true);
  });
});

describe('evaluateEligibility — composite gating priority order', () => {
  it('all eligible (Marius + T1 + Bulk + no injury) → PROPOSAL_PENDING', () => {
    const r = evaluateEligibility({
      persona:    'marius',
      tier:       'T1',
      goalPhase:  'BULK',
    });
    expect(r.eligible).toBe(true);
    expect(r.state).toBe(ACTIVATION_STATE.PROPOSAL_PENDING);
  });

  it('Maria → INELIGIBLE_NOT_MARIUS (early return Gate 1)', () => {
    const r = evaluateEligibility({
      persona:    'maria',
      tier:       'T2',
      goalPhase:  'BULK',
    });
    expect(r.eligible).toBe(false);
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
  });

  it('Gigica → INELIGIBLE_NOT_MARIUS (Q12 §45.3 LOCKED strict)', () => {
    const r = evaluateEligibility({
      persona:    'gigica',
      tier:       'T1',
      goalPhase:  'BULK',
    });
    expect(r.eligible).toBe(false);
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
  });

  it('Marius + T0 → INELIGIBLE_NOT_ADVANCED (Gate 2)', () => {
    const r = evaluateEligibility({
      persona:    'marius',
      tier:       'T0',
      goalPhase:  'BULK',
    });
    expect(r.eligible).toBe(false);
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_ADVANCED);
  });

  it('Marius + T1 + CUT → INELIGIBLE_PHASE_GATE (Gate 3 dual safety)', () => {
    const r = evaluateEligibility({
      persona:    'marius',
      tier:       'T1',
      goalPhase:  'CUT',
    });
    expect(r.eligible).toBe(false);
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_PHASE_GATE);
    expect(r.reason).toContain('q5_d');
  });

  it('Marius + T1 + RECOMP + injury target → INELIGIBLE_INJURY_OVERRIDE (Gate 4)', () => {
    const r = evaluateEligibility({
      persona:                  'marius',
      tier:                     'T1',
      goalPhase:                'RECOMP',
      painButtonActive:         true,
      painAffectedGroups:       ['picioare-quads'],
      candidateTargetGroup:     'picioare-quads',
    });
    expect(r.eligible).toBe(false);
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_INJURY_OVERRIDE);
    expect(r.reason).toContain('q14_a');
  });

  it('priority order: persona > tier > phase > injury (Maria + T0 + CUT → Maria reject first)', () => {
    const r = evaluateEligibility({
      persona:    'maria',
      tier:       'T0',
      goalPhase:  'CUT',
    });
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_MARIUS);
  });

  it('priority order: tier before phase (Marius + T0 + BULK → tier reject)', () => {
    const r = evaluateEligibility({
      persona:    'marius',
      tier:       'T0',
      goalPhase:  'BULK',
    });
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_NOT_ADVANCED);
  });

  it('all gates pass even cu painButton inactive (default)', () => {
    const r = evaluateEligibility({
      persona:                'marius',
      tier:                   'T2',
      goalPhase:              'BULK',
      painButtonActive:       false,
      candidateTargetGroup:   'piept',
    });
    expect(r.eligible).toBe(true);
  });

  it('Marius + T1 + BULK + injury but NOT target group → still passes (target safe)', () => {
    const r = evaluateEligibility({
      persona:                'marius',
      tier:                   'T1',
      goalPhase:              'BULK',
      painButtonActive:       true,
      painAffectedGroups:     ['umeri'],
      candidateTargetGroup:   'picioare-quads',
    });
    // Conservative pattern: any pain active disables (per detectInjuryAutoDisable)
    expect(r.eligible).toBe(false);
    expect(r.state).toBe(ACTIVATION_STATE.INELIGIBLE_INJURY_OVERRIDE);
  });
});
