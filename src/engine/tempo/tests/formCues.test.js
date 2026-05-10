import { describe, it, expect } from 'vitest';
import {
  getBaseCue,
  getTopCompoundOverride,
  resolveCueText,
  applyPersonaTone,
  resolvePersona,
  resolveCueDepth,
  composeFormCue,
} from '../formCues.js';
import { PERSONA, MOVEMENT_CATEGORY, CUE_DEPTH_BY_TIER } from '../constants.js';

describe('getBaseCue — Cluster B2 base library per category', () => {
  it('compound category → controleaza coborarea cue', () => {
    expect(getBaseCue(MOVEMENT_CATEGORY.COMPOUND)).toContain('controleaza');
  });

  it('isolation category → muschiul tinta cue', () => {
    expect(getBaseCue(MOVEMENT_CATEGORY.ISOLATION)).toContain('muschiul tinta');
  });

  it('unknown category → safe default compound', () => {
    expect(getBaseCue('unknown_cat')).toBe(getBaseCue(MOVEMENT_CATEGORY.COMPOUND));
  });
});

describe('getTopCompoundOverride — Cluster B2 top-12 (V1 majority)', () => {
  it('back_squat returns specific cue', () => {
    expect(getTopCompoundOverride('back_squat')).toContain('genunchii');
  });

  it('deadlift returns spate neutru cue', () => {
    expect(getTopCompoundOverride('deadlift')).toContain('spate neutru');
  });

  it('bench_press returns omoplati cue', () => {
    expect(getTopCompoundOverride('bench_press')).toContain('omoplati');
  });

  it('hip_thrust returns fesieri cue', () => {
    expect(getTopCompoundOverride('hip_thrust')).toContain('fesieri');
  });

  it('movement NOT in top-30 list → null', () => {
    expect(getTopCompoundOverride('cable_curl')).toBeNull();
  });

  it('null/empty input → null', () => {
    expect(getTopCompoundOverride('')).toBeNull();
    expect(getTopCompoundOverride(null)).toBeNull();
    expect(getTopCompoundOverride(undefined)).toBeNull();
  });

  it('case insensitive match', () => {
    expect(getTopCompoundOverride('BACK_SQUAT')).toContain('genunchii');
  });
});

describe('resolveCueText — top-30 override priority over base library', () => {
  it('movement in top-30 → override wins', () => {
    const r = resolveCueText({
      movementId:       'back_squat',
      movementCategory: MOVEMENT_CATEGORY.COMPOUND,
    });
    expect(r).toContain('genunchii');
  });

  it('movement NOT in top-30 → base library fallback per category', () => {
    const r = resolveCueText({
      movementId:       'cable_curl',
      movementCategory: MOVEMENT_CATEGORY.ISOLATION,
    });
    expect(r).toContain('muschiul tinta');
  });

  it('no movementId → base library category fallback', () => {
    const r = resolveCueText({ movementCategory: MOVEMENT_CATEGORY.COMPOUND });
    expect(r).toContain('controleaza');
  });
});

describe('applyPersonaTone — Cluster D18 Q18=D persona-aware tone', () => {
  it('Maria persona → rationale-first "De ce asa? Pentru control"', () => {
    const r = applyPersonaTone({ cueText: 'controleaza', persona: 'maria' });
    expect(r).toContain('De ce asa?');
    expect(r).toContain('Pentru control');
  });

  it('Gigica persona → suggestion "Sugerez"', () => {
    const r = applyPersonaTone({ cueText: 'controleaza', persona: 'gigica' });
    expect(r).toContain('Sugerez');
  });

  it('Marius persona → imperative "Execute"', () => {
    const r = applyPersonaTone({ cueText: 'controleaza', persona: 'marius' });
    expect(r).toContain('Execute');
  });

  it('unknown persona → neutral fallback (raw cue)', () => {
    const r = applyPersonaTone({ cueText: 'controleaza', persona: 'unknown' });
    expect(r).toBe('controleaza');
  });

  it('empty cue → empty string safe', () => {
    expect(applyPersonaTone({ cueText: '', persona: 'maria' })).toBe('');
  });
});

describe('resolvePersona — ADR 017 demographic prior fallback chain', () => {
  it('declared maria from ctx.meta.persona', () => {
    expect(resolvePersona({ meta: { persona: 'maria' } })).toBe(PERSONA.MARIA);
  });

  it('declared marius case-insensitive', () => {
    expect(resolvePersona({ meta: { persona: 'MARIUS' } })).toBe(PERSONA.MARIUS);
  });

  it('declared gigica', () => {
    expect(resolvePersona({ meta: { persona: 'gigica' } })).toBe(PERSONA.GIGICA);
  });

  it('missing meta.persona → default Gigica (middle ground hibrid)', () => {
    expect(resolvePersona({})).toBe(PERSONA.GIGICA);
  });

  it('null ctx → default Gigica', () => {
    expect(resolvePersona(null)).toBe(PERSONA.GIGICA);
  });

  it('unknown persona string → default Gigica', () => {
    expect(resolvePersona({ meta: { persona: 'random_xyz' } })).toBe(PERSONA.GIGICA);
  });
});

describe('resolveCueDepth — Cluster C15 Q15=B tier-aware depth', () => {
  it('T0 → minimal depth', () => {
    expect(resolveCueDepth('T0')).toBe('minimal');
  });

  it('T1 → rich depth', () => {
    expect(resolveCueDepth('T1')).toBe('rich');
  });

  it('T2 → adaptive depth', () => {
    expect(resolveCueDepth('T2')).toBe('adaptive');
  });

  it('unknown tier → fallback minimal (conservative T0)', () => {
    expect(resolveCueDepth('T99')).toBe(CUE_DEPTH_BY_TIER.T0);
  });
});

describe('composeFormCue — bundle integration', () => {
  it('Maria + back_squat + T1 → tonata cue cu depth=rich', () => {
    const r = composeFormCue({
      movementId:       'back_squat',
      movementCategory: MOVEMENT_CATEGORY.COMPOUND,
      persona:          'maria',
      tier:             'T1',
    });
    expect(r.cueText).toContain('De ce asa?');
    expect(r.cueText).toContain('genunchii');
    expect(r.category).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(r.movementId).toBe('back_squat');
    expect(r.persona).toBe('maria');
    expect(r.depth).toBe('rich');
  });

  it('Marius + isolation + T2 → imperative tone + adaptive depth', () => {
    const r = composeFormCue({
      movementId:       'cable_curl',
      movementCategory: MOVEMENT_CATEGORY.ISOLATION,
      persona:          'marius',
      tier:             'T2',
    });
    expect(r.cueText).toContain('Execute');
    expect(r.category).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(r.depth).toBe('adaptive');
  });

  it('missing movementId safely defaults to empty string', () => {
    const r = composeFormCue({
      movementCategory: MOVEMENT_CATEGORY.COMPOUND,
      persona:          'gigica',
      tier:             'T0',
    });
    expect(r.movementId).toBe('');
    expect(r.depth).toBe('minimal');
  });

  it('Maria zero notation: cue NEVER contains numeric tempo notation', () => {
    // Cluster B3 Q3 Daniel push-back fundamental — Maria persona zero notation
    // strict. composeFormCue does NOT include tempo notation (tempoPrescription
    // module owns notation prefix). Cue text alone NU should contain notation.
    const r = composeFormCue({
      movementId:       'back_squat',
      movementCategory: MOVEMENT_CATEGORY.COMPOUND,
      persona:          'maria',
      tier:             'T1',
    });
    expect(r.cueText).not.toMatch(/\d+-\d+-\d+-\d+/);
  });
});
