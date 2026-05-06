import { describe, it, expect } from 'vitest';
import {
  detectCompositeTrigger,
  detectAATrigger,
  detectLinearTrigger,
  detectEarlySafetyTrigger,
  resolveTriggerHierarchy,
  isCompositeHardDisabled,
  isEnergyDownSustained,
} from '../triggerHierarchy.js';
import {
  DELOAD_STATE,
  TRIGGER_SOURCE,
  COMPOSITE_THRESHOLDS,
} from '../constants.js';

describe('detectCompositeTrigger — Cluster B1 §36.41 3/3 simultaneous', () => {
  it('All 3 thresholds hit → triggered', () => {
    const r = detectCompositeTrigger({
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         3,
    });
    expect(r.triggered).toBe(true);
    expect(r.metricsHit).toBe(3);
  });

  it('Only 2 thresholds hit → NOT triggered (3/3 strict)', () => {
    const r = detectCompositeTrigger({
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         1,    // below ≥2 threshold
    });
    expect(r.triggered).toBe(false);
    expect(r.metricsHit).toBe(2);
  });

  it('Only 1 threshold hit → NOT triggered', () => {
    const r = detectCompositeTrigger({
      performanceDropPct:  20,
      restTimeMultiplier:  1.0,
      rirMismatch:         0,
    });
    expect(r.triggered).toBe(false);
    expect(r.metricsHit).toBe(1);
  });

  it('Boundary edge — Performance Drop exact 15% → NOT hit (strict >)', () => {
    const r = detectCompositeTrigger({
      performanceDropPct:  COMPOSITE_THRESHOLDS.performanceDropPct,
      restTimeMultiplier:  2.0,
      rirMismatch:         3,
    });
    expect(r.triggered).toBe(false);
  });

  it('Boundary edge — Rest Time Multiplier exact 1.5× → NOT hit', () => {
    const r = detectCompositeTrigger({
      performanceDropPct:  20,
      restTimeMultiplier:  COMPOSITE_THRESHOLDS.restTimeMultiplier,
      rirMismatch:         3,
    });
    expect(r.triggered).toBe(false);
  });

  it('Boundary edge — RIR Mismatch exact 2 → hit (≥2 inclusive)', () => {
    const r = detectCompositeTrigger({
      performanceDropPct:  20,
      restTimeMultiplier:  1.6,
      rirMismatch:         COMPOSITE_THRESHOLDS.rirMismatchMin,
    });
    expect(r.triggered).toBe(true);
  });

  it('Invalid inputs → defensive false', () => {
    expect(detectCompositeTrigger({}).triggered).toBe(false);
    expect(detectCompositeTrigger({ performanceDropPct: 'foo' }).triggered).toBe(false);
  });
});

describe('detectAATrigger — Cluster B13 + Source 2 ADR 013 cross-ref', () => {
  it('Direct AA Detection flag → triggered', () => {
    const r = detectAATrigger({ aaDetectionActive: true });
    expect(r.triggered).toBe(true);
    expect(r.sources).toContain('aa_detection_direct_adr_013');
  });

  it('Energy DOWN sustained → triggered (B13)', () => {
    const r = detectAATrigger({ energyDownSustained: true });
    expect(r.triggered).toBe(true);
    expect(r.sources).toContain('energy_down_sustained_3_consecutive_b13_36_82_3');
  });

  it('AA marker direct (skip penalty C4) → triggered', () => {
    const r = detectAATrigger({ aaMarkerDirectActive: true });
    expect(r.triggered).toBe(true);
    expect(r.sources).toContain('skip_penalty_aa_marker_direct_c4');
  });

  it('Multiple sources → all included în sources list', () => {
    const r = detectAATrigger({
      aaDetectionActive:    true,
      energyDownSustained:  true,
      aaMarkerDirectActive: true,
    });
    expect(r.triggered).toBe(true);
    expect(r.sources.length).toBe(3);
  });

  it('No sources → not triggered', () => {
    const r = detectAATrigger({});
    expect(r.triggered).toBe(false);
    expect(r.sources.length).toBe(0);
  });
});

describe('detectLinearTrigger — Cluster B1 §9.1 cross-ref', () => {
  it('DELOAD phase + CALENDAR window → triggered', () => {
    const r = detectLinearTrigger({
      periodizationPhase:    'DELOAD',
      deloadWindowTrigger:   'CALENDAR',
    });
    expect(r.triggered).toBe(true);
  });

  it('LOAD phase + CALENDAR → NOT triggered (NU în deload phase)', () => {
    const r = detectLinearTrigger({
      periodizationPhase:    'LOAD',
      deloadWindowTrigger:   'CALENDAR',
    });
    expect(r.triggered).toBe(false);
  });

  it('DELOAD phase + EARLY_SAFETY window → NOT triggered (different trigger)', () => {
    const r = detectLinearTrigger({
      periodizationPhase:    'DELOAD',
      deloadWindowTrigger:   'EARLY_SAFETY',
    });
    expect(r.triggered).toBe(false);
  });

  it('null inputs → defensive false', () => {
    const r = detectLinearTrigger({});
    expect(r.triggered).toBe(false);
  });
});

describe('detectEarlySafetyTrigger — §9.1 emit field 5 verbatim', () => {
  it('EARLY_SAFETY → triggered (Invariant 5 Medical Safety)', () => {
    const r = detectEarlySafetyTrigger('EARLY_SAFETY');
    expect(r.triggered).toBe(true);
  });

  it('CALENDAR → NOT triggered', () => {
    expect(detectEarlySafetyTrigger('CALENDAR').triggered).toBe(false);
  });

  it('null → NOT triggered', () => {
    expect(detectEarlySafetyTrigger(null).triggered).toBe(false);
  });
});

describe('resolveTriggerHierarchy — Cluster B2 priority Composite > AA > Linear', () => {
  const triggered = (active) => ({ triggered: active });

  it('No triggers → IDLE state', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(false),
      aa:           triggered(false),
      linear:       triggered(false),
      earlySafety:  triggered(false),
    });
    expect(r.resolvedState).toBe(DELOAD_STATE.IDLE);
    expect(r.primarySource).toBe(TRIGGER_SOURCE.NONE);
  });

  it('Composite only → REACTIVE_COMPOSITE', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(true),
      aa:           triggered(false),
      linear:       triggered(false),
      earlySafety:  triggered(false),
    });
    expect(r.resolvedState).toBe(DELOAD_STATE.REACTIVE_COMPOSITE);
    expect(r.primarySource).toBe(TRIGGER_SOURCE.COMPOSITE);
  });

  it('AA only → REACTIVE_AA', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(false),
      aa:           triggered(true),
      linear:       triggered(false),
      earlySafety:  triggered(false),
    });
    expect(r.resolvedState).toBe(DELOAD_STATE.REACTIVE_AA);
    expect(r.primarySource).toBe(TRIGGER_SOURCE.AA);
  });

  it('Linear only → SCHEDULED_LINEAR', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(false),
      aa:           triggered(false),
      linear:       triggered(true),
      earlySafety:  triggered(false),
    });
    expect(r.resolvedState).toBe(DELOAD_STATE.SCHEDULED_LINEAR);
    expect(r.primarySource).toBe(TRIGGER_SOURCE.LINEAR);
  });

  it('Composite + AA → COMPOSITE wins (priority)', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(true),
      aa:           triggered(true),
      linear:       triggered(false),
      earlySafety:  triggered(false),
    });
    expect(r.primarySource).toBe(TRIGGER_SOURCE.COMPOSITE);
    expect(r.sourcesActive).toContain(TRIGGER_SOURCE.AA);
  });

  it('Composite + AA + Linear → COMPOSITE wins, all 3 în sourcesActive (multi-signal additive)', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(true),
      aa:           triggered(true),
      linear:       triggered(true),
      earlySafety:  triggered(false),
    });
    expect(r.primarySource).toBe(TRIGGER_SOURCE.COMPOSITE);
    expect(r.sourcesActive.length).toBe(3);
  });

  it('AA + Linear → AA wins (priority)', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(false),
      aa:           triggered(true),
      linear:       triggered(true),
      earlySafety:  triggered(false),
    });
    expect(r.primarySource).toBe(TRIGGER_SOURCE.AA);
  });

  it('EARLY_SAFETY → REACTIVE_AA escalate (Invariant 5)', () => {
    const r = resolveTriggerHierarchy({
      composite:    triggered(false),
      aa:           triggered(false),
      linear:       triggered(false),
      earlySafety:  triggered(true),
    });
    expect(r.resolvedState).toBe(DELOAD_STATE.REACTIVE_AA);
    expect(r.rationale).toContain('early_safety');
  });

  it('Extension evaluating → EXTENSION_FLAGGED state priority', () => {
    const r = resolveTriggerHierarchy({
      composite:           triggered(false),
      aa:                  triggered(false),
      linear:              triggered(false),
      earlySafety:         triggered(false),
      extensionEvaluating: true,
    });
    expect(r.resolvedState).toBe(DELOAD_STATE.EXTENSION_FLAGGED);
  });
});

describe('isCompositeHardDisabled — Cluster B3 Source 3 anti math collision', () => {
  it('IDLE → false (Composite NU hard-disabled)', () => {
    expect(isCompositeHardDisabled(DELOAD_STATE.IDLE)).toBe(false);
  });

  it('SCHEDULED_LINEAR → true (Composite hard-disabled)', () => {
    expect(isCompositeHardDisabled(DELOAD_STATE.SCHEDULED_LINEAR)).toBe(true);
  });

  it('REACTIVE_COMPOSITE → true', () => {
    expect(isCompositeHardDisabled(DELOAD_STATE.REACTIVE_COMPOSITE)).toBe(true);
  });

  it('REACTIVE_AA → true', () => {
    expect(isCompositeHardDisabled(DELOAD_STATE.REACTIVE_AA)).toBe(true);
  });

  it('EXTENSION_FLAGGED → true', () => {
    expect(isCompositeHardDisabled(DELOAD_STATE.EXTENSION_FLAGGED)).toBe(true);
  });
});

describe('isEnergyDownSustained — B13 §36.82.3 cross-ref', () => {
  it('3 consecutive DOWN → true', () => {
    const r = isEnergyDownSustained([
      { energyDirection: 'DOWN' },
      { energyDirection: 'DOWN' },
      { energyDirection: 'DOWN' },
    ]);
    expect(r).toBe(true);
  });

  it('2 consecutive DOWN (insufficient) → false', () => {
    const r = isEnergyDownSustained([
      { energyDirection: 'DOWN' },
      { energyDirection: 'DOWN' },
    ]);
    expect(r).toBe(false);
  });

  it('3 mixed (DOWN + UP) → false', () => {
    const r = isEnergyDownSustained([
      { energyDirection: 'DOWN' },
      { energyDirection: 'UP' },
      { energyDirection: 'DOWN' },
    ]);
    expect(r).toBe(false);
  });

  it('Empty / null → false defensive', () => {
    expect(isEnergyDownSustained([])).toBe(false);
    expect(isEnergyDownSustained(null)).toBe(false);
    expect(isEnergyDownSustained(undefined)).toBe(false);
  });
});
