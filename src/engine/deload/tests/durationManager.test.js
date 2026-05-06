import { describe, it, expect } from 'vitest';
import {
  computeDuration,
  evaluateExtension,
  clampExtensionDepth,
  applyHardResetLinear,
  isExtensionAllowedByCap,
} from '../durationManager.js';
import {
  DELOAD_STATE,
  SCHEMA_CONSTANTS,
} from '../constants.js';

describe('computeDuration — Cluster B6 verbatim', () => {
  it('IDLE → 0 weeks', () => {
    const r = computeDuration({ deloadState: DELOAD_STATE.IDLE });
    expect(r.durationWeeks).toBe(0);
    expect(r.extensionEvaluated).toBe(false);
    expect(r.hardResetLinearApplied).toBe(false);
  });

  it('SCHEDULED_LINEAR → 1 săpt fix calendar', () => {
    const r = computeDuration({ deloadState: DELOAD_STATE.SCHEDULED_LINEAR });
    expect(r.durationWeeks).toBe(SCHEMA_CONSTANTS.durationScheduledWeeks);
    expect(r.extensionEvaluated).toBe(false);
    expect(r.hardResetLinearApplied).toBe(false);
  });

  it('REACTIVE_COMPOSITE → 1 săpt initial + extension considered + Hard Reset', () => {
    const r = computeDuration({ deloadState: DELOAD_STATE.REACTIVE_COMPOSITE });
    expect(r.durationWeeks).toBe(SCHEMA_CONSTANTS.durationReactiveMinWeeks);
    expect(r.extensionEvaluated).toBe(true);
    expect(r.hardResetLinearApplied).toBe(true);
  });

  it('REACTIVE_AA → 1 săpt initial + extension considered + Hard Reset', () => {
    const r = computeDuration({ deloadState: DELOAD_STATE.REACTIVE_AA });
    expect(r.durationWeeks).toBe(1);
    expect(r.extensionEvaluated).toBe(true);
    expect(r.hardResetLinearApplied).toBe(true);
  });

  it('EXTENSION_FLAGGED → 2 săpt total + extension granted dacă flagged still active', () => {
    const r = computeDuration({
      deloadState:        DELOAD_STATE.EXTENSION_FLAGGED,
      flaggedStillActive: true,
    });
    expect(r.durationWeeks).toBe(SCHEMA_CONSTANTS.durationReactiveMaxWeeks);
    expect(r.extensionGranted).toBe(true);
  });

  it('EXTENSION_FLAGGED + flaggedStillActive=false → extensionGranted false', () => {
    const r = computeDuration({
      deloadState:        DELOAD_STATE.EXTENSION_FLAGGED,
      flaggedStillActive: false,
    });
    expect(r.extensionGranted).toBe(false);
  });

  it('RESOLVING → 0 weeks (transition phase)', () => {
    const r = computeDuration({ deloadState: DELOAD_STATE.RESOLVING });
    expect(r.durationWeeks).toBe(0);
  });
});

describe('evaluateExtension — Cluster B8 Flagged-only verbatim', () => {
  it('Week 1 + Flagged still active → extension granted', () => {
    const r = evaluateExtension({
      weekActiveCount:     1,
      flaggedStillActive:  true,
    });
    expect(r.extensionGranted).toBe(true);
  });

  it('Week 1 + Flagged NOT active → no extension', () => {
    const r = evaluateExtension({
      weekActiveCount:     1,
      flaggedStillActive:  false,
    });
    expect(r.extensionGranted).toBe(false);
  });

  it('Week 1 + Cooldown active → no extension (anti false-positive)', () => {
    const r = evaluateExtension({
      weekActiveCount:       1,
      flaggedStillActive:    true,
      cooldownStateActive:   true,
    });
    expect(r.extensionGranted).toBe(false);
    expect(r.reason).toContain('cooldown_state_active_NO_extension');
  });

  it('Week 1 + Resolving active → no extension (anti false-positive)', () => {
    const r = evaluateExtension({
      weekActiveCount:        1,
      flaggedStillActive:     true,
      resolvingStateActive:   true,
    });
    expect(r.extensionGranted).toBe(false);
    expect(r.reason).toContain('resolving_state_active_NO_extension');
  });

  it('Week 2 → NO extension (only Week 1 boundary evaluation)', () => {
    const r = evaluateExtension({
      weekActiveCount:     2,
      flaggedStillActive:  true,
    });
    expect(r.extensionGranted).toBe(false);
    expect(r.reason).toContain('only_at_end_of_week_1');
  });

  it('Invalid weekActiveCount → no extension defensive', () => {
    expect(evaluateExtension({}).extensionGranted).toBe(false);
    expect(evaluateExtension({ weekActiveCount: 'foo' }).extensionGranted).toBe(false);
  });
});

describe('clampExtensionDepth — Cluster B9 atrophy literature limit 60%', () => {
  it('Input 60% → unchanged (within limit)', () => {
    const r = clampExtensionDepth(60);
    expect(r.depthPct).toBe(60);
    expect(r.clamped).toBe(false);
  });

  it('Input 70% → clamped to 60% (atrophy literature limit Schoenfeld/Helms)', () => {
    const r = clampExtensionDepth(70);
    expect(r.depthPct).toBe(SCHEMA_CONSTANTS.depthExtensionPreservePct);
    expect(r.clamped).toBe(true);
    expect(r.rationale).toContain('atrophy_literature_limit');
  });

  it('Input 50% → unchanged (below limit)', () => {
    const r = clampExtensionDepth(50);
    expect(r.depthPct).toBe(50);
    expect(r.clamped).toBe(false);
  });

  it('Invalid input → defensive limit fallback', () => {
    const r = clampExtensionDepth('foo');
    expect(r.depthPct).toBe(SCHEMA_CONSTANTS.depthExtensionPreservePct);
  });
});

describe('applyHardResetLinear — Cluster B7 anti back-to-back Week 5', () => {
  it('Reactive triggered → hardResetApplied true + Week 1 NEW cycle', () => {
    const r = applyHardResetLinear({
      reactiveTriggered:  true,
      currentMesoWeek:    4,
    });
    expect(r.hardResetApplied).toBe(true);
    expect(r.newMesoWeek).toBe(1);
    expect(r.rationale).toContain('hard_reset_linear_block_week_1_new');
  });

  it('No reactive trigger → no hard reset, currentMesoWeek preserved', () => {
    const r = applyHardResetLinear({
      reactiveTriggered:  false,
      currentMesoWeek:    3,
    });
    expect(r.hardResetApplied).toBe(false);
    expect(r.newMesoWeek).toBe(3);
  });

  it('Defensive — invalid currentMesoWeek → fallback Week 1', () => {
    const r = applyHardResetLinear({
      reactiveTriggered:  false,
    });
    expect(r.newMesoWeek).toBe(1);
  });
});

describe('isExtensionAllowedByCap — §9.1 Cluster 2.3 anti-abuse cross-ref', () => {
  it('0 consecutive → allowed', () => {
    expect(isExtensionAllowedByCap(0).allowed).toBe(true);
  });

  it('1 consecutive → allowed (below max 2)', () => {
    expect(isExtensionAllowedByCap(1).allowed).toBe(true);
  });

  it('2 consecutive → BLOCKED (at max anti-abuse cap)', () => {
    expect(isExtensionAllowedByCap(2).allowed).toBe(false);
  });

  it('3+ consecutive → BLOCKED', () => {
    expect(isExtensionAllowedByCap(5).allowed).toBe(false);
  });

  it('Invalid input → defensive allowed', () => {
    expect(isExtensionAllowedByCap('foo').allowed).toBe(true);
    expect(isExtensionAllowedByCap(NaN).allowed).toBe(true);
  });
});
