import { describe, it, expect } from 'vitest';
import {
  resolveSkipDefaultByTier,
  isSkipAvailable,
  computeSkipDecision,
} from '../skipManager.js';
import { CALIBRATION_TIERS } from '../constants.js';

describe('resolveSkipDefaultByTier — Cluster E1 Source 2 §45.6.5 verbatim', () => {
  it('T0 cold start → instant skip default + ramp-up integrated', () => {
    const r = resolveSkipDefaultByTier(CALIBRATION_TIERS.T0);
    expect(r.t0InstantSkipDefault).toBe(true);
    expect(r.t1PlusOptInExpanded).toBe(false);
    expect(r.rationale).toContain('t0_instant_skip_default');
    expect(r.rationale).toContain('ramp_up_integrated');
  });

  it('T1 established → opt-in expanded routine respected (NU default skip)', () => {
    const r = resolveSkipDefaultByTier(CALIBRATION_TIERS.T1);
    expect(r.t0InstantSkipDefault).toBe(false);
    expect(r.t1PlusOptInExpanded).toBe(true);
    expect(r.rationale).toContain('opt_in_expanded');
  });

  it('T2 established → opt-in expanded routine', () => {
    const r = resolveSkipDefaultByTier(CALIBRATION_TIERS.T2);
    expect(r.t0InstantSkipDefault).toBe(false);
    expect(r.t1PlusOptInExpanded).toBe(true);
  });

  it('Unknown tier → T0 conservative defaults defensive', () => {
    const r = resolveSkipDefaultByTier('UNKNOWN');
    expect(r.t0InstantSkipDefault).toBe(true);
    expect(r.rationale).toContain('default_t0_cold_start_conservative');
  });

  it('null / undefined → T0 conservative defaults', () => {
    expect(resolveSkipDefaultByTier(null).t0InstantSkipDefault).toBe(true);
    expect(resolveSkipDefaultByTier(undefined).t0InstantSkipDefault).toBe(true);
  });
});

describe('isSkipAvailable — Cluster B4 Source 1 §65.3 Option A', () => {
  it('Always true V1 (buton vizibil de la prima sesiune)', () => {
    expect(isSkipAvailable()).toBe(true);
  });

  it('Anti-paternalism — true regardless context (NU disable after 3+ logged warm-ups)', () => {
    // V1 LOCKED — engine NU has logic to disable skip based on history
    // (consistent ADR 025 graceful degradation + "Andura gândește pentru user" alignment)
    expect(isSkipAvailable()).toBe(true);
    expect(isSkipAvailable()).toBe(true); // idempotent
  });

  it('Anti-paternalism — NU NEVER skip (paternalism violation ADR 025)', () => {
    // V1 LOCKED — engine MUST emit skip_available true (anti "Andura forțează")
    expect(isSkipAvailable()).toBe(true);
  });
});

describe('computeSkipDecision — Cluster E1 + B4 integration', () => {
  it('T0 + no opt-out → t0InstantSkipDefault true + skipAvailable true + userOptedSkip false', () => {
    const r = computeSkipDecision({
      tier: CALIBRATION_TIERS.T0,
      userOptedSkip: false,
    });
    expect(r.skipAvailable).toBe(true);
    expect(r.t0InstantSkipDefault).toBe(true);
    expect(r.t1PlusOptInExpanded).toBe(false);
    expect(r.userOptedSkip).toBe(false);
  });

  it('T1 + user opt-out → userOptedSkip true override + rationale captures both', () => {
    const r = computeSkipDecision({
      tier: CALIBRATION_TIERS.T1,
      userOptedSkip: true,
    });
    expect(r.skipAvailable).toBe(true);
    expect(r.t0InstantSkipDefault).toBe(false);
    expect(r.t1PlusOptInExpanded).toBe(true);
    expect(r.userOptedSkip).toBe(true);
    expect(r.rationale).toContain('user_opted_skip_in_session_toggle_b4_q65_3');
  });

  it('T2 + no opt-out → opt-in expanded preserved', () => {
    const r = computeSkipDecision({
      tier: CALIBRATION_TIERS.T2,
      userOptedSkip: false,
    });
    expect(r.t1PlusOptInExpanded).toBe(true);
    expect(r.userOptedSkip).toBe(false);
  });

  it('Defensive — undefined opt-out → false (not opted)', () => {
    const r = computeSkipDecision({ tier: CALIBRATION_TIERS.T0 });
    expect(r.userOptedSkip).toBe(false);
  });

  it('skipAvailable always true V1 invariant (Source 1 §65.3 Option A)', () => {
    for (const tier of [CALIBRATION_TIERS.T0, CALIBRATION_TIERS.T1, CALIBRATION_TIERS.T2]) {
      for (const opted of [true, false, undefined]) {
        const r = computeSkipDecision({ tier, userOptedSkip: opted });
        expect(r.skipAvailable).toBe(true);
      }
    }
  });
});
