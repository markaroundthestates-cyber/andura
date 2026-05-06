import { describe, it, expect } from 'vitest';
import {
  resolveMovementCategory,
  baselineTempoForCategory,
  renderTempoText,
  notationStyleForPersona,
  computeTempoPrescription,
  resolveCueDeliveryTiming,
} from '../tempoPrescription.js';
import {
  MOVEMENT_CATEGORY,
  NOTATION_STYLE,
  CUE_DELIVERY_TIMING,
  PERSONA,
} from '../constants.js';

describe('resolveMovementCategory — Cluster B2 base library taxonomy', () => {
  it('top-30 compound IDs → compound', () => {
    expect(resolveMovementCategory('squat')).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(resolveMovementCategory('deadlift')).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(resolveMovementCategory('bench_press')).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(resolveMovementCategory('hip_thrust')).toBe(MOVEMENT_CATEGORY.COMPOUND);
  });
  it('case-insensitive + space/dash normalize', () => {
    expect(resolveMovementCategory('SQUAT')).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(resolveMovementCategory('bench-press')).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(resolveMovementCategory('hip thrust')).toBe(MOVEMENT_CATEGORY.COMPOUND);
  });
  it('pattern fallback for variants → compound', () => {
    expect(resolveMovementCategory('back_squat_high_bar')).toBe(MOVEMENT_CATEGORY.COMPOUND);
    expect(resolveMovementCategory('barbell_row')).toBe(MOVEMENT_CATEGORY.COMPOUND);
  });
  it('isolation default fallback', () => {
    expect(resolveMovementCategory('bicep_curl')).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(resolveMovementCategory('lateral_raise')).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(resolveMovementCategory('leg_extension')).toBe(MOVEMENT_CATEGORY.ISOLATION);
  });
  it('null / unknown → isolation defensive', () => {
    expect(resolveMovementCategory(null)).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(resolveMovementCategory(undefined)).toBe(MOVEMENT_CATEGORY.ISOLATION);
    expect(resolveMovementCategory(123)).toBe(MOVEMENT_CATEGORY.ISOLATION);
  });
});

describe('baselineTempoForCategory — conservative defaults', () => {
  it('compound → 2-1-X-0 (slow eccentric, brief pause, explosive concentric)', () => {
    const t = baselineTempoForCategory(MOVEMENT_CATEGORY.COMPOUND);
    expect(t.eccentric_s).toBe(2);
    expect(t.pause_bottom_s).toBe(1);
    expect(t.concentric_s).toBe('X');
    expect(t.pause_top_s).toBe(0);
  });
  it('isolation → 2-0-2-0 (controlled both phases)', () => {
    const t = baselineTempoForCategory(MOVEMENT_CATEGORY.ISOLATION);
    expect(t.eccentric_s).toBe(2);
    expect(t.pause_bottom_s).toBe(0);
    expect(t.concentric_s).toBe(2);
    expect(t.pause_top_s).toBe(0);
  });
});

describe('notationStyleForPersona — Cluster B3 Q3 Daniel push-back', () => {
  it('Maria → verbal (zero notation strict)', () => {
    expect(notationStyleForPersona(PERSONA.MARIA)).toBe(NOTATION_STYLE.VERBAL);
  });
  it('Gigica → hibrid (verbal + notation)', () => {
    expect(notationStyleForPersona(PERSONA.GIGICA)).toBe(NOTATION_STYLE.HIBRID);
  });
  it('Marius → numeric pure', () => {
    expect(notationStyleForPersona(PERSONA.MARIUS)).toBe(NOTATION_STYLE.NUMERIC);
  });
  it('null / unknown → hibrid defensive default', () => {
    expect(notationStyleForPersona(null)).toBe(NOTATION_STYLE.HIBRID);
    expect(notationStyleForPersona(undefined)).toBe(NOTATION_STYLE.HIBRID);
    expect(notationStyleForPersona('foo')).toBe(NOTATION_STYLE.HIBRID);
  });
});

describe('renderTempoText — persona-aware Daniel push-back invariant', () => {
  const sampleNotation = { eccentric_s: 2, pause_bottom_s: 1, concentric_s: 'X', pause_top_s: 0 };

  it('Maria verbal — ZERO numeric notation strict (anti-friction Maria 65)', () => {
    const text = renderTempoText({ notation: sampleNotation, style: NOTATION_STYLE.VERBAL });
    expect(text).not.toMatch(/\d-\d/);          // NO X-Y notation
    expect(text).not.toMatch(/Tempo \d/);       // NO "Tempo 2-1..."
    expect(text).toMatch(/coboară/);            // verbal description
  });
  it('Gigica hibrid — notation + verbal hint în paranteze', () => {
    const text = renderTempoText({ notation: sampleNotation, style: NOTATION_STYLE.HIBRID });
    expect(text).toMatch(/tempo \d-\d/);        // notation present
    expect(text).toMatch(/\(/);                 // verbal hint în paranteze
  });
  it('Marius numeric pure — Tempo X-Y-Z-W format strict', () => {
    const text = renderTempoText({ notation: sampleNotation, style: NOTATION_STYLE.NUMERIC });
    expect(text).toMatch(/^Tempo \d-\d-\w-\d$/);
  });
  it('null notation → empty string defensive', () => {
    expect(renderTempoText({ notation: null, style: NOTATION_STYLE.VERBAL })).toBe('');
  });
});

describe('computeTempoPrescription — Cluster B integration', () => {
  it('Maria + squat → verbal display, reactive expand available', () => {
    const r = computeTempoPrescription({
      movementId: 'squat',
      persona:    PERSONA.MARIA,
      periodizationPhase: 'LOAD',
    });
    expect(r.notation.eccentric_s).toBe(2);
    expect(r.display_text).toMatch(/coboară/);
    expect(r.display_text).not.toMatch(/Tempo \d/);  // Maria zero notation strict
    expect(r.reactive_expand_available).toBe(true);
  });
  it('Marius + bench_press → numeric pure display', () => {
    const r = computeTempoPrescription({
      movementId: 'bench_press',
      persona:    PERSONA.MARIUS,
      periodizationPhase: 'LOAD',
    });
    expect(r.display_text).toMatch(/^Tempo /);
  });
  it('Periodization PEAK → eccentric ≥3s amplification (Cluster D11)', () => {
    const r = computeTempoPrescription({
      movementId: 'squat',
      persona:    PERSONA.MARIUS,
      periodizationPhase: 'PEAK',
    });
    expect(r.notation.eccentric_s).toBeGreaterThanOrEqual(3);
  });
  it('Periodization LOAD+ → eccentric ≥3s amplification', () => {
    const r = computeTempoPrescription({
      movementId: 'squat',
      persona:    PERSONA.MARIUS,
      periodizationPhase: 'LOAD+',
    });
    expect(r.notation.eccentric_s).toBeGreaterThanOrEqual(3);
  });
  it('Periodization DELOAD → no amplification (eccentric stays baseline)', () => {
    const r = computeTempoPrescription({
      movementId: 'squat',
      persona:    PERSONA.MARIUS,
      periodizationPhase: 'DELOAD',
    });
    expect(r.notation.eccentric_s).toBe(2);
  });
});

describe('resolveCueDeliveryTiming — Cluster B8 Q8=D NU INTRA_SET', () => {
  it('default → PRE_SET (intro before set)', () => {
    expect(resolveCueDeliveryTiming({})).toBe(CUE_DELIVERY_TIMING.PRE_SET);
  });
  it('postSetContext → POST_SET (RIR feedback / form check)', () => {
    expect(resolveCueDeliveryTiming({ postSetContext: true })).toBe(CUE_DELIVERY_TIMING.POST_SET);
  });
  it('userInitiatedExpand → MID_REST (B1 Hibrid Q1=C reactive)', () => {
    expect(resolveCueDeliveryTiming({ userInitiatedExpand: true })).toBe(CUE_DELIVERY_TIMING.MID_REST);
  });
  it('userInitiatedExpand priority over postSetContext', () => {
    const r = resolveCueDeliveryTiming({ postSetContext: true, userInitiatedExpand: true });
    expect(r).toBe(CUE_DELIVERY_TIMING.MID_REST);
  });
  it('NEVER returns INTRA_SET (Q8=D constraint)', () => {
    // Verify enum doesn't even contain INTRA_SET
    const values = Object.values(CUE_DELIVERY_TIMING);
    expect(values).not.toContain('INTRA_SET');
  });
});
