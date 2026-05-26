import { describe, it, expect } from 'vitest';
import {
  resolveTempoNotation,
  composePreSetIntro,
  resolveCueDeliveryTiming,
  composeTempoPrescription,
} from '../tempoPrescription.js';
import { TEMPO_NOTATION, CUE_DELIVERY_TIMING } from '../constants.js';

describe('resolveTempoNotation — Cluster B + D verbatim modulation', () => {
  it('Energy DOWN dominates → slow eccentric universal Q13=B', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'PEAK', energyDirection: 'DOWN' });
    expect(r.notation).toBe(TEMPO_NOTATION.SLOW_ECCENTRIC_UNIVERSAL);
    expect(r.modulation).toBe('energy_down_slow_eccentric');
    expect(r.rationale).toContain('q13_b');
  });

  it('Deload phase → controlled tempo Q12=D when energy NOT DOWN', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'DELOAD', energyDirection: 'UP' });
    expect(r.notation).toBe(TEMPO_NOTATION.DELOAD_CONTROLLED);
    expect(r.modulation).toBe('deload_controlled');
    expect(r.rationale).toContain('q12_d');
  });

  it('PEAK phase → form-conservative amplification Q11=B', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'PEAK', energyDirection: 'NONE' });
    expect(r.notation).toBe(TEMPO_NOTATION.FORM_CONSERVATIVE_AMPLIFIED);
    expect(r.modulation).toBe('high_intensity_form_conservative');
    expect(r.rationale).toContain('q11_b');
  });

  it('LOAD+ phase (W2 heavy) → form-conservative amplification Q11=B', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'LOAD+', energyDirection: 'NONE' });
    expect(r.notation).toBe(TEMPO_NOTATION.FORM_CONSERVATIVE_AMPLIFIED);
  });

  it('bare LOAD phase (W1 lightest) → standard tempo, NOT amplified (F1 fix)', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'LOAD', energyDirection: 'NONE' });
    expect(r.notation).toBe(TEMPO_NOTATION.STANDARD);
  });

  it('default phase + no energy modulation → standard hypertrophy 2-1-2-0', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'ACCUMULATION', energyDirection: 'NONE' });
    expect(r.notation).toBe(TEMPO_NOTATION.STANDARD);
    expect(r.modulation).toBe('standard');
  });

  it('null/undefined inputs safe → standard default', () => {
    const r = resolveTempoNotation({});
    expect(r.notation).toBe(TEMPO_NOTATION.STANDARD);
  });

  it('lowercase phase normalized via toUpperCase', () => {
    const r = resolveTempoNotation({ periodizationPhase: 'deload', energyDirection: 'up' });
    expect(r.notation).toBe(TEMPO_NOTATION.DELOAD_CONTROLLED);
  });

  it('Energy DOWN priority dominates Deload (rare but explicit precedence)', () => {
    // Anti-cascade preserve §9.3 Energy invariant 1 immutable Q8=A — Energy DOWN
    // signal universal regardless of phase.
    const r = resolveTempoNotation({ periodizationPhase: 'DELOAD', energyDirection: 'DOWN' });
    expect(r.notation).toBe(TEMPO_NOTATION.SLOW_ECCENTRIC_UNIVERSAL);
  });
});

describe('composePreSetIntro — Q1=C Hibrid + Q3 persona-aware Maria zero notation', () => {
  it('Maria persona → verbal-only intro (zero notation strict Daniel push-back fundamental)', () => {
    const r = composePreSetIntro({
      notation: '2-1-2-0',
      cueText:  'controleaza coborarea',
      persona:  'maria',
    });
    expect(r.preSetIntro).toBe('controleaza coborarea');
    expect(r.preSetIntro).not.toContain('2-1-2-0');
    expect(r.preSetIntro).not.toMatch(/[0-9]+-[0-9]+/);
  });

  it('Gigica persona → hibrid notation + verbal', () => {
    const r = composePreSetIntro({
      notation: '2-1-2-0',
      cueText:  'controleaza',
      persona:  'gigica',
    });
    expect(r.preSetIntro).toContain('Tempo 2-1-2-0');
    expect(r.preSetIntro).toContain('controleaza');
  });

  it('Marius persona → notation strict (numeric pure)', () => {
    const r = composePreSetIntro({
      notation: '2-1-2-0',
      cueText:  'execute',
      persona:  'marius',
    });
    expect(r.preSetIntro).toContain('2-1-2-0');
  });

  it('reactive expanded text differs by persona (Maria verbal vs others notation)', () => {
    const maria = composePreSetIntro({ notation: '2-1-2-0', cueText: 'X', persona: 'maria' });
    const marius = composePreSetIntro({ notation: '2-1-2-0', cueText: 'X', persona: 'marius' });
    expect(maria.reactiveExpanded).not.toContain('2-1-2-0');
    expect(marius.reactiveExpanded).toContain('2-1-2-0');
  });

  it('handles missing notation gracefully', () => {
    const r = composePreSetIntro({ notation: '', cueText: 'cue', persona: 'gigica' });
    expect(r.preSetIntro).toBe('cue');
  });
});

describe('resolveCueDeliveryTiming — Q8=D NU intra-set distraction', () => {
  it('default → PRE_SET (engine surfaces INAINTE of set)', () => {
    expect(resolveCueDeliveryTiming({})).toBe(CUE_DELIVERY_TIMING.PRE_SET);
  });

  it('user tap-to-expand mid-rest → MID_REST (Q1=C reactive Q6=D)', () => {
    expect(resolveCueDeliveryTiming({ userInitiatedTapToExpand: true }))
      .toBe(CUE_DELIVERY_TIMING.MID_REST);
  });

  it('post-set context → POST_SET (RIR feedback)', () => {
    expect(resolveCueDeliveryTiming({ postSetFeedbackContext: true }))
      .toBe(CUE_DELIVERY_TIMING.POST_SET);
  });

  it('user tap dominates over post-set context (user agency Q6=D Bugatti)', () => {
    expect(resolveCueDeliveryTiming({
      userInitiatedTapToExpand: true,
      postSetFeedbackContext:    true,
    })).toBe(CUE_DELIVERY_TIMING.MID_REST);
  });

  it('NEVER returns INTRA_SET — Q8=D constraint preserve user concentration', () => {
    const cases = [
      {},
      { userInitiatedTapToExpand: true },
      { postSetFeedbackContext: true },
      { userInitiatedTapToExpand: false, postSetFeedbackContext: false },
    ];
    for (const c of cases) {
      const t = resolveCueDeliveryTiming(c);
      expect(t).not.toBe('INTRA_SET');
      expect(['PRE_SET', 'POST_SET', 'MID_REST']).toContain(t);
    }
  });
});

describe('composeTempoPrescription — bundle integration', () => {
  it('returns full prescription bundle with all fields populated', () => {
    const r = composeTempoPrescription({
      periodizationPhase: 'LOAD+',
      energyDirection:    'NONE',
      cueText:            'controleaza',
      persona:            'gigica',
    });
    expect(r.notation).toBe(TEMPO_NOTATION.FORM_CONSERVATIVE_AMPLIFIED);
    expect(r.preSetIntro).toContain('Tempo');
    expect(r.reactiveExpanded).toContain('controleaza');
    expect(r.timing).toBe(CUE_DELIVERY_TIMING.PRE_SET);
    expect(r.rationale).toContain('q11_b');
  });

  it('Maria + Energy DOWN → verbal-only intro + slow eccentric notation in trace', () => {
    const r = composeTempoPrescription({
      periodizationPhase: 'ACCUMULATION',
      energyDirection:    'DOWN',
      cueText:            'coboara lent',
      persona:            'maria',
    });
    expect(r.notation).toBe(TEMPO_NOTATION.SLOW_ECCENTRIC_UNIVERSAL);
    // Maria zero notation strict — preSetIntro NU contains numeric notation
    expect(r.preSetIntro).toBe('coboara lent');
    expect(r.preSetIntro).not.toMatch(/[0-9]+-[0-9]+/);
  });

  it('user tap-to-expand mid-rest reflected in timing field', () => {
    const r = composeTempoPrescription({
      periodizationPhase:        'LOAD',
      energyDirection:           'NONE',
      cueText:                   'X',
      persona:                   'gigica',
      userInitiatedTapToExpand:  true,
    });
    expect(r.timing).toBe(CUE_DELIVERY_TIMING.MID_REST);
  });
});
