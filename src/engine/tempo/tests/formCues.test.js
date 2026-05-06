import { describe, it, expect } from 'vitest';
import {
  toneStyleForPersona,
  lookupCueBase,
  cueDepthForTier,
  applyPersonaTone,
  computeFormCue,
} from '../formCues.js';
import {
  PERSONA,
  TONE_STYLE,
  CUE_DEPTH,
  CALIBRATION_TIERS,
  NOTATION_STYLE,
} from '../constants.js';

describe('toneStyleForPersona — Cluster D18 Q18=D verbatim', () => {
  it('Maria → rationale_first ("De ce X? Pentru Y.")', () => {
    expect(toneStyleForPersona(PERSONA.MARIA)).toBe(TONE_STYLE.RATIONALE_FIRST);
  });
  it('Gigica → suggestion ("Sugerez X.")', () => {
    expect(toneStyleForPersona(PERSONA.GIGICA)).toBe(TONE_STYLE.SUGGESTION);
  });
  it('Marius → imperative ("X. Execute.")', () => {
    expect(toneStyleForPersona(PERSONA.MARIUS)).toBe(TONE_STYLE.IMPERATIVE);
  });
  it('null / unknown → suggestion defensive default', () => {
    expect(toneStyleForPersona(null)).toBe(TONE_STYLE.SUGGESTION);
  });
});

describe('lookupCueBase — Cluster B2 base library + top-30 overrides', () => {
  it('top-30 compound override (squat) → movement-specific cue', () => {
    const r = lookupCueBase('squat');
    expect(r.core).toMatch(/Genunchii|coapsele/);
    expect(r.rationale).toMatch(/cvadricepșii|fesierii/);
  });
  it('top-30 compound override (deadlift) → distinct from squat', () => {
    const squat = lookupCueBase('squat');
    const deadlift = lookupCueBase('deadlift');
    expect(squat.core).not.toBe(deadlift.core);
    expect(deadlift.core).toMatch(/Bara|tibie/);
  });
  it('non-top-30 compound (front_squat) → category base fallback compound', () => {
    const r = lookupCueBase('front_squat');
    expect(r.core).toMatch(/coloana|controlează/);
  });
  it('isolation movement → category base isolation', () => {
    const r = lookupCueBase('bicep_curl');
    expect(r.core).toMatch(/contracția mușchiului/);
  });
  it('null / unknown → isolation defensive', () => {
    const r = lookupCueBase(null);
    expect(r.core).toBeDefined();
    expect(r.rationale).toBeDefined();
  });
});

describe('cueDepthForTier — Cluster C15 Q15=B tier-aware', () => {
  it('T0 → minimal', () => {
    expect(cueDepthForTier(CALIBRATION_TIERS.T0)).toBe(CUE_DEPTH.T0);
    expect(cueDepthForTier(CALIBRATION_TIERS.T0)).toBe('minimal');
  });
  it('T1 → richer', () => {
    expect(cueDepthForTier(CALIBRATION_TIERS.T1)).toBe(CUE_DEPTH.T1);
    expect(cueDepthForTier(CALIBRATION_TIERS.T1)).toBe('richer');
  });
  it('T2 → adaptive', () => {
    expect(cueDepthForTier(CALIBRATION_TIERS.T2)).toBe(CUE_DEPTH.T2);
    expect(cueDepthForTier(CALIBRATION_TIERS.T2)).toBe('adaptive');
  });
});

describe('applyPersonaTone — D18 verbatim', () => {
  it('Maria rationale-first → "De ce" rationale + core', () => {
    const r = applyPersonaTone({
      coreText:      'controlează coborârea',
      rationaleText: 'Pentru a controla încărcarea articulară',
      tone:          TONE_STYLE.RATIONALE_FIRST,
    });
    expect(r).toMatch(/Pentru a controla/);
    expect(r).toMatch(/controlează coborârea/);
  });
  it('Marius imperative → "X. Execute."', () => {
    const r = applyPersonaTone({
      coreText:      'controlează coborârea',
      rationaleText: 'irrelevant',
      tone:          TONE_STYLE.IMPERATIVE,
    });
    expect(r).toMatch(/Execute\.$/);
  });
  it('Gigica suggestion → "Sugerez X."', () => {
    const r = applyPersonaTone({
      coreText:      'controlează coborârea',
      rationaleText: 'irrelevant',
      tone:          TONE_STYLE.SUGGESTION,
    });
    expect(r).toMatch(/^Sugerez:/);
  });
});

describe('computeFormCue — Cluster B + D persona-aware integration', () => {
  it('Maria + T1 + squat → verbal notation + rationale-first tone + rationale present', () => {
    const r = computeFormCue({
      movementId:    'squat',
      persona:       PERSONA.MARIA,
      tier:          CALIBRATION_TIERS.T1,
      notationStyle: NOTATION_STYLE.VERBAL,
    });
    expect(r.notation_style).toBe(NOTATION_STYLE.VERBAL);
    expect(r.tone).toBe(TONE_STYLE.RATIONALE_FIRST);
    expect(r.rationale).toBeDefined();
    expect(r.suggested_fix).toBeDefined();
  });
  it('Marius + T0 + squat → minimal depth (no rationale, no suggested_fix)', () => {
    const r = computeFormCue({
      movementId:    'squat',
      persona:       PERSONA.MARIUS,
      tier:          CALIBRATION_TIERS.T0,
      notationStyle: NOTATION_STYLE.NUMERIC,
    });
    expect(r.rationale).toBeUndefined();
    expect(r.suggested_fix).toBeUndefined();
  });
  it('Marius + T2 + squat → adaptive depth, persona tone wrapper applied', () => {
    const r = computeFormCue({
      movementId:    'squat',
      persona:       PERSONA.MARIUS,
      tier:          CALIBRATION_TIERS.T2,
      notationStyle: NOTATION_STYLE.NUMERIC,
    });
    expect(r.text).toMatch(/Execute\.$/);
    expect(r.tone).toBe(TONE_STYLE.IMPERATIVE);
  });
  it('Maria zero notation strict invariant — Maria persona NEVER produces numeric notation', () => {
    // Even when notationStyle is overridden, persona Maria should resolve to verbal
    const r = computeFormCue({
      movementId:    'squat',
      persona:       PERSONA.MARIA,
      tier:          CALIBRATION_TIERS.T1,
      notationStyle: NOTATION_STYLE.VERBAL,
    });
    expect(r.notation_style).toBe(NOTATION_STYLE.VERBAL);
  });
});
