import { describe, it, expect } from 'vitest';
import {
  translateGroupToRO,
  buildUiLabel,
  isApplicationPhaseEligible,
  computeVolumeModifier,
  computeMesocycleProgress,
} from '../applicationStrategy.js';
import {
  VOLUME_MODIFIER_TARGET_PCT,
  VOLUME_REDUCTION_OTHER_GROUPS_PCT,
  FREQUENCY_MODIFIER_TARGET_SESSIONS,
  MESOCYCLE_DURATION_WEEKS,
  APPLICATION_MODE,
} from '../constants.js';

describe('translateGroupToRO — Cluster C4 Bugatti craft RO native', () => {
  it('chest → Piept', () => {
    expect(translateGroupToRO('chest')).toBe('Piept');
  });

  it('back → Spate', () => {
    expect(translateGroupToRO('back')).toBe('Spate');
  });

  it('shoulders → Umeri', () => {
    expect(translateGroupToRO('shoulders')).toBe('Umeri');
  });

  it('legs → Picioare', () => {
    expect(translateGroupToRO('legs')).toBe('Picioare');
  });

  it('biceps → Biceps', () => {
    expect(translateGroupToRO('biceps')).toBe('Biceps');
  });

  it('triceps → Triceps', () => {
    expect(translateGroupToRO('triceps')).toBe('Triceps');
  });

  it('core → Core', () => {
    expect(translateGroupToRO('core')).toBe('Core');
  });

  it('unknown group → capitalized fallback', () => {
    expect(translateGroupToRO('forearms')).toBe('Forearms');
  });

  it('case-insensitive normalized', () => {
    expect(translateGroupToRO('CHEST')).toBe('Piept');
  });

  it('null/undefined → empty string', () => {
    expect(translateGroupToRO(null)).toBe('');
    expect(translateGroupToRO(undefined)).toBe('');
  });
});

describe('buildUiLabel — Cluster C4 Q17=C "Bloc focus [Grupa]"', () => {
  it('biceps → "Bloc focus Biceps"', () => {
    expect(buildUiLabel('biceps')).toBe('Bloc focus Biceps');
  });

  it('legs → "Bloc focus Picioare"', () => {
    expect(buildUiLabel('legs')).toBe('Bloc focus Picioare');
  });

  it('null group → "Bloc focus" prefix only', () => {
    expect(buildUiLabel(null)).toBe('Bloc focus');
  });

  it('Bugatti craft RO native NU calque Englez', () => {
    const r = buildUiLabel('back');
    expect(r).not.toContain('Specialization');
    expect(r).not.toContain('Block');
    expect(r).toBe('Bloc focus Spate');
  });
});

describe('isApplicationPhaseEligible — Cluster C5 Q11=B PARALLEL modifier', () => {
  it('ACCUMULATION → eligible', () => {
    expect(isApplicationPhaseEligible('ACCUMULATION')).toBe(true);
  });

  it('LOAD → eligible', () => {
    expect(isApplicationPhaseEligible('LOAD')).toBe(true);
  });

  it('PEAK → NOT eligible (high intensity emphasis incompatible)', () => {
    expect(isApplicationPhaseEligible('PEAK')).toBe(false);
  });

  it('DELOAD → NOT eligible (Engine #4 standard deload week 4 preserved Q12=A)', () => {
    expect(isApplicationPhaseEligible('DELOAD')).toBe(false);
  });

  it('case-insensitive normalized', () => {
    expect(isApplicationPhaseEligible('accumulation')).toBe(true);
    expect(isApplicationPhaseEligible('peak')).toBe(false);
  });

  it('null/unknown phase → NOT eligible (conservative)', () => {
    expect(isApplicationPhaseEligible(null)).toBe(false);
    expect(isApplicationPhaseEligible('UNKNOWN')).toBe(false);
  });
});

describe('computeVolumeModifier — Cluster C1+C2+C5 Hybrid V+F + -25% other groups', () => {
  it('active + ACCUMULATION + target → hybrid modifier emit', () => {
    const r = computeVolumeModifier({
      targetGroup:           'biceps',
      periodizationPhase:    'ACCUMULATION',
      specializationActive:  true,
    });
    expect(r.targetGroup).toBe('biceps');
    expect(r.volumeIncreasePct).toBe(VOLUME_MODIFIER_TARGET_PCT);
    expect(r.frequencyIncreaseSessions).toBe(FREQUENCY_MODIFIER_TARGET_SESSIONS);
    expect(r.otherGroupsReductionPct).toBe(VOLUME_REDUCTION_OTHER_GROUPS_PCT);
    expect(r.mode).toBe(APPLICATION_MODE.HYBRID);
    expect(r.mrvCapRespected).toBe(true);
  });

  it('active + LOAD → hybrid modifier emit', () => {
    const r = computeVolumeModifier({
      targetGroup:           'back',
      periodizationPhase:    'LOAD',
      specializationActive:  true,
    });
    expect(r.volumeIncreasePct).toBeGreaterThan(0);
  });

  it('active + PEAK → modifier suspended (zero — Q11=B+Q12=A cross-ref)', () => {
    const r = computeVolumeModifier({
      targetGroup:           'biceps',
      periodizationPhase:    'PEAK',
      specializationActive:  true,
    });
    expect(r.volumeIncreasePct).toBe(0);
    expect(r.frequencyIncreaseSessions).toBe(0);
    expect(r.rationale).toContain('not_accumulation_or_load');
  });

  it('active + DELOAD → modifier suspended Q12=A', () => {
    const r = computeVolumeModifier({
      targetGroup:           'biceps',
      periodizationPhase:    'DELOAD',
      specializationActive:  true,
    });
    expect(r.volumeIncreasePct).toBe(0);
  });

  it('NOT active → no modifier (zero modifier always respects MRV cap)', () => {
    const r = computeVolumeModifier({
      targetGroup:           'biceps',
      periodizationPhase:    'ACCUMULATION',
      specializationActive:  false,
    });
    expect(r.volumeIncreasePct).toBe(0);
    expect(r.mrvCapRespected).toBe(true); // zero respects cap by definition
  });

  it('null targetGroup → zero modifier', () => {
    const r = computeVolumeModifier({
      targetGroup:           null,
      periodizationPhase:    'LOAD',
      specializationActive:  true,
    });
    expect(r.volumeIncreasePct).toBe(0);
  });

  it('MRV §42.9 invariant 1 always respected by construction (V1 conservative)', () => {
    // V1: caller (orchestrator) applies modifier sub MRV cap absolute. Engine
    // always emits mrvCapRespected=true.
    const cases = [
      { targetGroup: 'biceps', periodizationPhase: 'LOAD', specializationActive: true },
      { targetGroup: 'biceps', periodizationPhase: 'PEAK', specializationActive: true },
      { targetGroup: null, periodizationPhase: 'LOAD', specializationActive: false },
    ];
    for (const c of cases) {
      expect(computeVolumeModifier(c).mrvCapRespected).toBe(true);
    }
  });

  it('Other groups reduction = -25% per Q8=B partial maintenance', () => {
    const r = computeVolumeModifier({
      targetGroup:           'biceps',
      periodizationPhase:    'LOAD',
      specializationActive:  true,
    });
    expect(r.otherGroupsReductionPct).toBe(-0.25);
  });

  it('Application mode = hybrid V1 default Q7=C combinatorial recovery stimulus', () => {
    const r = computeVolumeModifier({
      targetGroup:           'biceps',
      periodizationPhase:    'LOAD',
      specializationActive:  true,
    });
    expect(r.mode).toBe('hybrid');
  });
});

describe('computeMesocycleProgress — Cluster C3 Q9=A fixed 4 weeks exit', () => {
  it('NOT active → currentWeek 0, exiting false', () => {
    const r = computeMesocycleProgress({ specializationActive: false });
    expect(r.currentWeek).toBe(0);
    expect(r.exiting).toBe(false);
  });

  it('active week 1 → currentWeek 1', () => {
    const r = computeMesocycleProgress({
      specializationActive:  true,
      weeksElapsed:          0,
    });
    expect(r.currentWeek).toBe(1);
    expect(r.exiting).toBe(false);
  });

  it('active week 2 → currentWeek 2', () => {
    const r = computeMesocycleProgress({
      specializationActive:  true,
      weeksElapsed:          1,
    });
    expect(r.currentWeek).toBe(2);
  });

  it('active week 4 → currentWeek 4 + exiting true', () => {
    const r = computeMesocycleProgress({
      specializationActive:  true,
      weeksElapsed:          MESOCYCLE_DURATION_WEEKS,
    });
    expect(r.currentWeek).toBe(MESOCYCLE_DURATION_WEEKS);
    expect(r.exiting).toBe(true);
    expect(r.rationale).toContain('q9_a');
    expect(r.rationale).toContain('q10_b');
  });

  it('beyond week 4 → cap currentWeek + exiting true', () => {
    const r = computeMesocycleProgress({
      specializationActive:  true,
      weeksElapsed:          6,
    });
    expect(r.currentWeek).toBe(MESOCYCLE_DURATION_WEEKS);
    expect(r.exiting).toBe(true);
  });

  it('totalWeeks always 4 (Q9=A simplicity invariant V1)', () => {
    const r = computeMesocycleProgress({
      specializationActive:  true,
      weeksElapsed:          1,
    });
    expect(r.totalWeeks).toBe(4);
  });

  it('invalid weeksElapsed → defaults safely', () => {
    const r = computeMesocycleProgress({
      specializationActive:  true,
      weeksElapsed:          -5,
    });
    expect(r.currentWeek).toBe(1); // floor(0)+1 = 1
    expect(r.exiting).toBe(false);
  });
});
