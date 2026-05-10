import { describe, it, expect } from 'vitest';
import {
  computeFinalDepth,
  applyGoalPhaseModulation,
  resolveIntensityModifier,
} from '../depthCalculator.js';
import {
  DELOAD_STATE,
  TRIGGER_SOURCE,
  GOAL_PHASE,
  SCHEMA_CONSTANTS,
} from '../constants.js';

describe('computeFinalDepth — Cluster B5 Final_Depth formula', () => {
  it('SCHEDULED_LINEAR → 45% scheduled depth', () => {
    const r = computeFinalDepth({
      deloadState:   DELOAD_STATE.SCHEDULED_LINEAR,
      sourcesActive: [TRIGGER_SOURCE.LINEAR],
    });
    expect(r.finalDepthPct).toBe(45);
  });

  it('REACTIVE_COMPOSITE → 60% reactive depth (override scheduled)', () => {
    const r = computeFinalDepth({
      deloadState:   DELOAD_STATE.REACTIVE_COMPOSITE,
      sourcesActive: [TRIGGER_SOURCE.COMPOSITE],
    });
    expect(r.finalDepthPct).toBe(60);
  });

  it('REACTIVE_AA → 60% reactive depth', () => {
    const r = computeFinalDepth({
      deloadState:   DELOAD_STATE.REACTIVE_AA,
      sourcesActive: [TRIGGER_SOURCE.AA],
    });
    expect(r.finalDepthPct).toBe(60);
  });

  it('Multi-signal (Composite + AA) → 60% MAX wins, behavioral additive when ≥2 sources', () => {
    const r = computeFinalDepth({
      deloadState:   DELOAD_STATE.REACTIVE_COMPOSITE,
      sourcesActive: [TRIGGER_SOURCE.COMPOSITE, TRIGGER_SOURCE.AA],
    });
    // MAX(45, 60, 30) = 60 base
    expect(r.finalDepthPct).toBe(60);
    expect(r.behavioralPct).toBe(30); // behavioral active when ≥2 sources
  });

  it('Behavioral_Modifiers additive (NU multiplicative anti-cascade)', () => {
    const r = computeFinalDepth({
      deloadState:                 DELOAD_STATE.REACTIVE_COMPOSITE,
      sourcesActive:               [TRIGGER_SOURCE.COMPOSITE, TRIGGER_SOURCE.AA],
      behavioralModifiersInputPct: 10,
    });
    expect(r.finalDepthPct).toBe(70); // 60 + 10 additive
    expect(r.behavioralModifiersAppliedPct).toBe(10);
  });

  it('Behavioral_Modifiers capped at SCHEMA_CONSTANTS.behavioralModifiersCapPct', () => {
    const r = computeFinalDepth({
      deloadState:                 DELOAD_STATE.REACTIVE_AA,
      sourcesActive:               [TRIGGER_SOURCE.AA],
      behavioralModifiersInputPct: 50, // request beyond cap
    });
    expect(r.behavioralModifiersAppliedPct).toBe(SCHEMA_CONSTANTS.behavioralModifiersCapPct);
    expect(r.finalDepthPct).toBe(60 + SCHEMA_CONSTANTS.behavioralModifiersCapPct);
  });

  it('EXTENSION_FLAGGED → clamped to 60% atrophy literature limit B9', () => {
    const r = computeFinalDepth({
      deloadState:                 DELOAD_STATE.EXTENSION_FLAGGED,
      sourcesActive:               [TRIGGER_SOURCE.EXTENSION, TRIGGER_SOURCE.COMPOSITE, TRIGGER_SOURCE.AA],
      behavioralModifiersInputPct: 20, // would push beyond if not clamped
    });
    expect(r.finalDepthPct).toBe(SCHEMA_CONSTANTS.depthExtensionPreservePct);
    expect(r.extensionDepthClamped).toBe(true);
  });

  it('IDLE → 0 depth', () => {
    const r = computeFinalDepth({
      deloadState:   DELOAD_STATE.IDLE,
      sourcesActive: [],
    });
    expect(r.finalDepthPct).toBe(0);
  });

  it('RESOLVING → step-down depth (transition phase)', () => {
    const r = computeFinalDepth({
      deloadState:   DELOAD_STATE.RESOLVING,
      sourcesActive: [],
    });
    expect(r.finalDepthPct).toBeGreaterThan(0);
    expect(r.finalDepthPct).toBeLessThan(SCHEMA_CONSTANTS.depthScheduledPct);
  });

  it('Final depth always 0-100 bounded (defensive)', () => {
    const r = computeFinalDepth({
      deloadState:                 DELOAD_STATE.REACTIVE_AA,
      sourcesActive:               [TRIGGER_SOURCE.COMPOSITE, TRIGGER_SOURCE.AA],
      behavioralModifiersInputPct: -10, // negative input
    });
    expect(r.finalDepthPct).toBeGreaterThanOrEqual(0);
    expect(r.finalDepthPct).toBeLessThanOrEqual(100);
  });
});

describe('applyGoalPhaseModulation — Cluster D2 light coupling', () => {
  it('CUT + SCHEDULED_LINEAR → escalate to 60% Marius retention', () => {
    const r = applyGoalPhaseModulation({
      baseDepthPct:  45,
      goalPhase:     'CUT',
      deloadState:   DELOAD_STATE.SCHEDULED_LINEAR,
    });
    expect(r.adjustedDepthPct).toBe(60);
    expect(r.rationale).toContain('cut_phase_scheduled_linear_escalate_60');
  });

  it('BULK + SCHEDULED_LINEAR → baseline preserved 45%', () => {
    const r = applyGoalPhaseModulation({
      baseDepthPct:  45,
      goalPhase:     'BULK',
      deloadState:   DELOAD_STATE.SCHEDULED_LINEAR,
    });
    expect(r.adjustedDepthPct).toBe(45);
    expect(r.rationale).toContain('bulk_phase_classical');
  });

  it('CUT + REACTIVE → NU CUT override (only SCHEDULED_LINEAR triggers escalation)', () => {
    const r = applyGoalPhaseModulation({
      baseDepthPct:  60,
      goalPhase:     'CUT',
      deloadState:   DELOAD_STATE.REACTIVE_COMPOSITE,
    });
    expect(r.adjustedDepthPct).toBe(60); // unchanged
  });

  it('MAINTAIN baseline preserved', () => {
    const r = applyGoalPhaseModulation({
      baseDepthPct:  45,
      goalPhase:     'MAINTAIN',
      deloadState:   DELOAD_STATE.SCHEDULED_LINEAR,
    });
    expect(r.adjustedDepthPct).toBe(45);
  });

  it('null phase → baseline preserved defensive', () => {
    const r = applyGoalPhaseModulation({
      baseDepthPct:  45,
      goalPhase:     null,
      deloadState:   DELOAD_STATE.SCHEDULED_LINEAR,
    });
    expect(r.adjustedDepthPct).toBe(45);
  });
});

describe('resolveIntensityModifier — Cluster B4 verbatim AA-driven', () => {
  it('REACTIVE_COMPOSITE → RIR +1 + Intensity -12.5% obligatoriu', () => {
    const r = resolveIntensityModifier(DELOAD_STATE.REACTIVE_COMPOSITE);
    expect(r.rir_increment).toBe(1);
    expect(r.intensity_pct_decrement).toBe(12.5);
  });

  it('SCHEDULED_LINEAR → RIR +1 + Intensity -12.5% obligatoriu', () => {
    const r = resolveIntensityModifier(DELOAD_STATE.SCHEDULED_LINEAR);
    expect(r.rir_increment).toBe(1);
    expect(r.intensity_pct_decrement).toBe(12.5);
  });

  it('REACTIVE_AA → RIR +1 + Intensity -12.5% obligatoriu', () => {
    const r = resolveIntensityModifier(DELOAD_STATE.REACTIVE_AA);
    expect(r.rir_increment).toBe(1);
    expect(r.intensity_pct_decrement).toBe(12.5);
  });

  it('IDLE → zero modifier (no deload active)', () => {
    const r = resolveIntensityModifier(DELOAD_STATE.IDLE);
    expect(r.rir_increment).toBe(0);
    expect(r.intensity_pct_decrement).toBe(0);
  });

  it('Daniel push-back B4 verbatim — Volume CUT 30% + RIR ↑ + Intensity ↓ all obligatoriu when active', () => {
    // Volume CUT 30% NU in intensity_modifier (separat in depth_pct field)
    // intensity_modifier = RIR + intensity decrement only per B4 verbatim
    const r = resolveIntensityModifier(DELOAD_STATE.REACTIVE_AA);
    expect(r.rir_increment).toBeGreaterThan(0);
    expect(r.intensity_pct_decrement).toBeGreaterThan(0);
  });
});
