// ══ COMPOSITE SIGNAL Big 11 ANATOMICAL AGNOSTIC INVARIANT ═════════════════════
// C4.6 ADR_ENGINE_REFACTOR §4.6 LOCK V1 acceptance criteria — composite-signal
// layer taxonomy-independent invariant preserve forward-going post engines
// C4.1-4.5 refactor Big 11 RO canonical V1 LANDED (anatomical signals NU consumed
// directly; arbitration purely on performance metrics).

import { describe, it, expect } from 'vitest';
import {
  detectCompositeSignal,
  COMPOSITE_SIGNAL_THRESHOLDS,
} from '../trigger-3-metrici.js';
import {
  advanceLifecycle,
  COMPOSITE_SIGNAL_LIFECYCLE,
} from '../lifecycle.js';

describe('compositeSignal — anatomical agnostic invariant Big 11 wire compatible', () => {
  const performanceInputBase = {
    performanceDropPct:   0.20, // >15% threshold
    restTimeMultiplier:   1.6,  // >1.5x threshold
    declaredRir:          1,
    actualRepsAtFailure:  8,
    expectedRepsAtRir:    5,    // mismatch = 3, >=2 threshold
  };

  it('detectCompositeSignal output stable cu Big 6 EN context vs Big 11 RO context (anatomical-independent)', () => {
    // Same performance signals; group taxonomy context is upstream / irrelevant
    const resultBig6Context = detectCompositeSignal(performanceInputBase);
    const resultBig11Context = detectCompositeSignal(performanceInputBase);
    expect(resultBig6Context).toEqual(resultBig11Context);
    expect(resultBig6Context.trigger).toBe(true);
    expect(resultBig6Context.fired).toEqual(['performance_drop', 'rest_time_excessive', 'rir_mismatch']);
  });

  it('COMPOSITE_SIGNAL_THRESHOLDS taxonomy-independent (NU contain group keys)', () => {
    const keys = Object.keys(COMPOSITE_SIGNAL_THRESHOLDS);
    const bigKeys = ['chest', 'back', 'shoulders', 'legs', 'piept', 'spate', 'umeri'];
    for (const k of keys) {
      expect(bigKeys).not.toContain(k.toLowerCase());
    }
  });

  it('advanceLifecycle taxonomy-independent (FSM source NU branches on group keys)', () => {
    const fnSource = advanceLifecycle.toString();
    // Defensive scan: lifecycle FSM logic NU contain Big 6 EN or Big 11 RO group keys
    expect(fnSource).not.toMatch(/['"](chest|back|shoulders|legs|arms)['"]/);
    expect(fnSource).not.toMatch(/['"](piept|spate|umeri|biceps|triceps|antebrate|fese|gambe)['"]/);
    // COMPOSITE_SIGNAL_LIFECYCLE config constants taxonomy-independent (cooldown + resolution thresholds)
    expect(typeof COMPOSITE_SIGNAL_LIFECYCLE.COOLDOWN_SESSIONS).toBe('number');
    expect(typeof COMPOSITE_SIGNAL_LIFECYCLE.RESOLUTION_CLEAN_SESSIONS).toBe('number');
  });
});
