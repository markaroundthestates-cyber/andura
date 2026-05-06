import { describe, it, expect } from 'vitest';
import {
  resolveModeOverlay,
  computeRepRangeModifier,
  computeRirTargetModifier,
  computeRestTimeModifier,
  computeModePhaseMultipliers,
} from '../trainingModifiers.js';
import {
  TEMPLATE_IDS,
  PHASES,
  TEMPLATE_BASE_MODIFIERS,
  MODE_PHASE_CEILING,
} from '../constants.js';

describe('resolveModeOverlay — case + diacritic insensitive', () => {
  it('estetica / Estetică → estetica', () => {
    expect(resolveModeOverlay({ mode: 'estetica' })).toBe('estetica');
    expect(resolveModeOverlay({ mode: 'Estetică' })).toBe('estetica');
    expect(resolveModeOverlay({ mode: 'ESTETICA' })).toBe('estetica');
  });
  it('forta / Forță → forta', () => {
    expect(resolveModeOverlay({ mode: 'forta' })).toBe('forta');
    expect(resolveModeOverlay({ mode: 'Forță' })).toBe('forta');
  });
  it('missing / unknown → none', () => {
    expect(resolveModeOverlay({})).toBe('none');
    expect(resolveModeOverlay(null)).toBe('none');
    expect(resolveModeOverlay({ mode: 'foo' })).toBe('none');
  });
});

describe('computeRepRangeModifier — §9.2.4 Cluster 4 base table verbatim', () => {
  it('Forța & Dezvoltare baseline → rep [3, 8]', () => {
    const r = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual(TEMPLATE_BASE_MODIFIERS.forta_dezvoltare.rep);
  });
  it('Tonifiere baseline → rep [8, 12]', () => {
    const r = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual(TEMPLATE_BASE_MODIFIERS.tonifiere_definire.rep);
  });
  it('Slăbire baseline → rep [10, 15]', () => {
    const r = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.slabire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual(TEMPLATE_BASE_MODIFIERS.slabire.rep);
  });
  it('CUT phase shifts rep ceiling +2 (preserve volume despite kcal deficit)', () => {
    const r = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.CUT,
      mode: 'none',
    });
    expect(r[1]).toBeGreaterThan(TEMPLATE_BASE_MODIFIERS.tonifiere_definire.rep[1]);
  });
  it('Mode estetica shifts rep ceiling +1 (volume emphasis)', () => {
    const baseline = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    const estetica = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'estetica',
    });
    expect(estetica[1]).toBeGreaterThan(baseline[1]);
  });
  it('Mode forta shifts rep ceiling -1 (intensity emphasis)', () => {
    const baseline = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    const forta = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'forta',
    });
    expect(forta[1]).toBeLessThan(baseline[1]);
  });
  it('rep min always >= 1 (defensive)', () => {
    const r = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      phase: PHASES.CUT,
      mode: 'forta',
    });
    expect(r[0]).toBeGreaterThanOrEqual(1);
  });
  it('rep max always >= rep min (defensive)', () => {
    const r = computeRepRangeModifier({
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      phase: PHASES.MAINTAIN,
      mode: 'forta',
    });
    expect(r[1]).toBeGreaterThanOrEqual(r[0]);
  });
  it('unknown templateId → defensive [8, 12] Tonifiere fallback', () => {
    const r = computeRepRangeModifier({
      templateId: 'unknown',
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual([8, 12]);
  });
});

describe('computeRirTargetModifier — §9.2.4 Cluster 4 RIR ranges', () => {
  it('Forța → RIR [1, 3]', () => {
    const r = computeRirTargetModifier({
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual(TEMPLATE_BASE_MODIFIERS.forta_dezvoltare.rir);
  });
  it('Tonifiere → RIR [0, 2]', () => {
    const r = computeRirTargetModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual([0, 2]);
  });
  it('Longevitate → RIR [2, 3]', () => {
    const r = computeRirTargetModifier({
      templateId: TEMPLATE_IDS.longevitate,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual([2, 3]);
  });
  it('Sănătate Generală → RIR [2, 3]', () => {
    const r = computeRirTargetModifier({
      templateId: TEMPLATE_IDS.sanatate_generala,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r).toEqual([2, 3]);
  });
  it('floor preserved >= 0', () => {
    const r = computeRirTargetModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'forta',
    });
    expect(r[0]).toBeGreaterThanOrEqual(0);
  });
});

describe('computeRestTimeModifier — §1.2 ADR 024 verbatim seconds bands', () => {
  it('Forța → 120-240s (compound focus)', () => {
    const r = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.forta_dezvoltare,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r[0]).toBe(120);
    expect(r[1]).toBe(240);
  });
  it('Slăbire → 45-90s (cut + conditioning shorter rest)', () => {
    const r = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.slabire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    expect(r[0]).toBe(45);
    expect(r[1]).toBe(90);
  });
  it('CUT phase reduces rest -15s', () => {
    const baseline = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    const cut = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.CUT,
      mode: 'none',
    });
    expect(cut[0]).toBeLessThan(baseline[0]);
  });
  it('BULK phase increases rest +15s', () => {
    const baseline = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.MAINTAIN,
      mode: 'none',
    });
    const bulk = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.tonifiere_definire,
      phase: PHASES.BULK,
      mode: 'none',
    });
    expect(bulk[0]).toBeGreaterThan(baseline[0]);
  });
  it('rest min always >= 30s (defensive floor)', () => {
    const r = computeRestTimeModifier({
      templateId: TEMPLATE_IDS.slabire,
      phase: PHASES.CUT,
      mode: 'estetica',
    });
    expect(r[0]).toBeGreaterThanOrEqual(30);
  });
});

describe('computeModePhaseMultipliers — §9.2.6 Reconsideration Trigger 4 ceiling', () => {
  it('mode none → 1.0 / 1.0 baseline', () => {
    const r = computeModePhaseMultipliers({ phase: PHASES.MAINTAIN, mode: 'none' });
    expect(r.volumeMul).toBe(1.0);
    expect(r.intensityMul).toBe(1.0);
    expect(r.ceilingApplied).toEqual([]);
  });
  it('mode estetica → +5% volume, -3% intensity', () => {
    const r = computeModePhaseMultipliers({ phase: PHASES.MAINTAIN, mode: 'estetica' });
    expect(r.volumeMul).toBeCloseTo(1.05, 5);
    expect(r.intensityMul).toBeCloseTo(0.97, 5);
  });
  it('mode forta → -5% volume, +5% intensity', () => {
    const r = computeModePhaseMultipliers({ phase: PHASES.MAINTAIN, mode: 'forta' });
    expect(r.volumeMul).toBeCloseTo(0.95, 5);
    expect(r.intensityMul).toBeCloseTo(1.05, 5);
  });
  it('multipliers always within ceiling rule [-20%, +20%]', () => {
    for (const mode of ['none', 'estetica', 'forta']) {
      for (const phase of Object.values(PHASES)) {
        const r = computeModePhaseMultipliers({ phase, mode });
        expect(r.volumeMul).toBeGreaterThanOrEqual(MODE_PHASE_CEILING.volumeFloor);
        expect(r.volumeMul).toBeLessThanOrEqual(MODE_PHASE_CEILING.volumeCeiling);
        expect(r.intensityMul).toBeGreaterThanOrEqual(MODE_PHASE_CEILING.intensityFloor);
        expect(r.intensityMul).toBeLessThanOrEqual(MODE_PHASE_CEILING.intensityCeiling);
      }
    }
  });
});
