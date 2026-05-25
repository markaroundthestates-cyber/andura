import { describe, it, expect } from 'vitest';
import {
  resolveTemplateId,
  isNewbieEffect,
  isDetrainedReturn,
  isFatRichProfile,
  detectRecompSubPhase,
} from '../templates.js';
import { TEMPLATE_IDS } from '../constants.js';

describe('resolveTemplateId — §9.2.2 Cluster 2 + ADR 024 §1.2 enumerare', () => {
  it('forta → forta_dezvoltare', () => {
    expect(resolveTemplateId('forta')).toBe(TEMPLATE_IDS.forta_dezvoltare);
  });
  it('hipertrofie → tonifiere_definire', () => {
    expect(resolveTemplateId('hipertrofie')).toBe(TEMPLATE_IDS.tonifiere_definire);
  });
  it('recompozitie → tonifiere_definire (sub-phase auto-detected separate)', () => {
    expect(resolveTemplateId('recompozitie')).toBe(TEMPLATE_IDS.tonifiere_definire);
  });
  it('slabire → slabire (CUT-focused template, deficit path)', () => {
    expect(resolveTemplateId('slabire')).toBe(TEMPLATE_IDS.slabire);
  });
  it('longevitate → longevitate', () => {
    expect(resolveTemplateId('longevitate')).toBe(TEMPLATE_IDS.longevitate);
  });
  it('sanatate → sanatate_generala', () => {
    expect(resolveTemplateId('sanatate')).toBe(TEMPLATE_IDS.sanatate_generala);
  });
  it('unknown goal → tonifiere_definire defensive default', () => {
    expect(resolveTemplateId('unknown')).toBe(TEMPLATE_IDS.tonifiere_definire);
    expect(resolveTemplateId(null)).toBe(TEMPLATE_IDS.tonifiere_definire);
    expect(resolveTemplateId(undefined)).toBe(TEMPLATE_IDS.tonifiere_definire);
  });
});

describe('isNewbieEffect — §9.2.2 RECOMP Cluster 2 first 12 weeks', () => {
  it('trainingWeeks <= 12 → true', () => {
    expect(isNewbieEffect({ trainingWeeks: 0 })).toBe(true);
    expect(isNewbieEffect({ trainingWeeks: 6 })).toBe(true);
    expect(isNewbieEffect({ trainingWeeks: 12 })).toBe(true);
  });
  it('trainingWeeks > 12 → false', () => {
    expect(isNewbieEffect({ trainingWeeks: 13 })).toBe(false);
    expect(isNewbieEffect({ trainingWeeks: 100 })).toBe(false);
  });
  it('missing trainingWeeks → false (defensive)', () => {
    expect(isNewbieEffect({})).toBe(false);
    expect(isNewbieEffect(null)).toBe(false);
    expect(isNewbieEffect(undefined)).toBe(false);
    expect(isNewbieEffect({ trainingWeeks: 'foo' })).toBe(false);
  });
});

describe('isDetrainedReturn — §9.2.2 gap >6 weeks', () => {
  it('no recent sessions → true (detrained)', () => {
    expect(isDetrainedReturn([])).toBe(true);
    expect(isDetrainedReturn(null)).toBe(true);
    expect(isDetrainedReturn(undefined)).toBe(true);
  });
  it('session within 6w window → false (NOT detrained)', () => {
    expect(isDetrainedReturn([{ daysAgo: 5 }])).toBe(false);
    expect(isDetrainedReturn([{ daysAgo: 41 }])).toBe(false);
    expect(isDetrainedReturn([{ daysAgo: 42 }])).toBe(false);
  });
  it('all sessions outside 6w window → true (detrained)', () => {
    expect(isDetrainedReturn([{ daysAgo: 43 }, { daysAgo: 60 }])).toBe(true);
  });
});

describe('isFatRichProfile — §9.2.2 BF% high persona-specific', () => {
  it('male BF% >= 25% → true', () => {
    expect(isFatRichProfile({ sex: 'male', bfPct: 0.25 })).toBe(true);
    expect(isFatRichProfile({ sex: 'male', bfPct: 0.30 })).toBe(true);
  });
  it('male BF% < 25% → false', () => {
    expect(isFatRichProfile({ sex: 'male', bfPct: 0.18 })).toBe(false);
  });
  it('female BF% >= 32% → true', () => {
    expect(isFatRichProfile({ sex: 'female', bfPct: 0.32 })).toBe(true);
    expect(isFatRichProfile({ sex: 'female', bfPct: 0.40 })).toBe(true);
  });
  it('female BF% < 32% → false', () => {
    expect(isFatRichProfile({ sex: 'female', bfPct: 0.25 })).toBe(false);
  });
  it('missing BF% → false (defensive)', () => {
    expect(isFatRichProfile({})).toBe(false);
    expect(isFatRichProfile(null)).toBe(false);
  });
  it('default sex male cand missing', () => {
    expect(isFatRichProfile({ bfPct: 0.30 })).toBe(true); // 30% > male 25% threshold
  });
});

describe('detectRecompSubPhase — §9.2.2 Cluster 2 + ADR 024 §2.5 Q5 LOCKED', () => {
  it('only eligible in Tonifiere/Slabire templates', () => {
    const r = detectRecompSubPhase({
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      user: { trainingWeeks: 5 },
    });
    expect(r.isRecomp).toBe(false);
  });
  it('Tonifiere + newbie → RECOMP detected', () => {
    const r = detectRecompSubPhase({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      user: { trainingWeeks: 5 },
    });
    expect(r.isRecomp).toBe(true);
    expect(r.reasons).toContain('newbie_effect_first_12_weeks');
  });
  it('Slabire + detrained return → RECOMP detected', () => {
    const r = detectRecompSubPhase({
      templateId: TEMPLATE_IDS.slabire,
      user: { trainingWeeks: 100 },
      recentSessions: [{ daysAgo: 50 }],
    });
    expect(r.isRecomp).toBe(true);
    expect(r.reasons).toContain('detrained_return_gap_6w');
  });
  it('Tonifiere + fat-rich profile → RECOMP detected', () => {
    const r = detectRecompSubPhase({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      user: { trainingWeeks: 100, bfPct: 0.30, sex: 'male' },
      recentSessions: [{ daysAgo: 5 }],
    });
    expect(r.isRecomp).toBe(true);
    expect(r.reasons).toContain('fat_rich_profile_bf_high');
  });
  it('Tonifiere experienced lean trained → NU RECOMP', () => {
    const r = detectRecompSubPhase({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      user: { trainingWeeks: 100, bfPct: 0.15, sex: 'male' },
      recentSessions: [{ daysAgo: 3 }],
    });
    expect(r.isRecomp).toBe(false);
    expect(r.reasons).toEqual([]);
  });
  it('Tonifiere multiple triggers cumulative reasons', () => {
    const r = detectRecompSubPhase({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      user: { trainingWeeks: 5, bfPct: 0.30, sex: 'male' },
      recentSessions: [],
    });
    expect(r.isRecomp).toBe(true);
    expect(r.reasons.length).toBeGreaterThanOrEqual(2);
  });
});
