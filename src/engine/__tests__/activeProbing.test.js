// ══ BUILD #1/H — active probing when uncertain tests (F4 spec §H) ════════════
// (1) Pure policy: shouldProbe fires ONLY on a wide sigma + FRESH + non-hard last
//     set; any missing precondition → no probe. probeSet is bounded by ego-cap +
//     ceiling and never below the working load.
// (2) Consumer (DP.getSmartRecommendation): with the flag ON + a wide posterior +
//     high readiness, an activeProbe descriptor is attached WITHOUT changing
//     result.kg; flag OFF → no descriptor (byte-identical). Fatigued → no probe.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  shouldProbe,
  probeSet,
  SIGMA_PROBE_THRESHOLD,
  PROBE_OVERLOAD,
} from '../dp/activeProbing.js';
import { EGO_JUMP_RATIO } from '../dp/egoCap.js';
import { READINESS_HIGH } from '../readiness.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };

describe('shouldProbe — pure policy', () => {
  const wide = SIGMA_PROBE_THRESHOLD + 2;
  it('fires on a wide sigma + fresh + non-hard last set', () => {
    expect(shouldProbe({ sigma: wide, readinessScore: READINESS_HIGH, lastRpe: RPE.potrivit })).toBe(true);
  });
  it('does NOT fire when the posterior is narrow (certain)', () => {
    expect(shouldProbe({ sigma: SIGMA_PROBE_THRESHOLD - 1, readinessScore: 90, lastRpe: RPE.usor })).toBe(false);
  });
  it('does NOT fire when the user is FATIGUED (low readiness)', () => {
    expect(shouldProbe({ sigma: wide, readinessScore: READINESS_HIGH - 1, lastRpe: RPE.usor })).toBe(false);
  });
  it('does NOT fire when the last set was HARD (rpe 8.5)', () => {
    expect(shouldProbe({ sigma: wide, readinessScore: 90, lastRpe: RPE.greu })).toBe(false);
  });
  it('does NOT fire when sigma / readiness are unusable', () => {
    expect(shouldProbe({ sigma: null, readinessScore: 90, lastRpe: RPE.usor })).toBe(false);
    expect(shouldProbe({ sigma: wide, readinessScore: null, lastRpe: RPE.usor })).toBe(false);
  });
});

describe('probeSet — bounded single heavier set', () => {
  it('is a small overload over the working load', () => {
    expect(probeSet(100, 0)).toBeCloseTo(100 * PROBE_OVERLOAD, 5);
  });
  it('never exceeds the ego-cap ratio over the working load', () => {
    // a huge ceiling can't let the probe jump past the ego-cap reach.
    expect(probeSet(100, 999)).toBeLessThanOrEqual(100 * EGO_JUMP_RATIO);
  });
  it('never exceeds the realistic ceiling', () => {
    expect(probeSet(100, 102)).toBeLessThanOrEqual(102);
  });
  it('returns 0 for an unusable working load (no probe)', () => {
    expect(probeSet(0, 100)).toBe(0);
  });
});

describe('DP.getSmartRecommendation — active-probe consumer', () => {
  const EX = 'Barbell Bench Press';
  const DAY = 86400000;
  let now;
  // Seed a thin, recent, high-variance history (only 2 obs → wide posterior) with
  // RECENT timestamps (no 3-week gap → no return-deload, which would exempt the
  // probe). The working load is small enough that one equipment step is a real probe.
  function seedWideHistory() {
    now = Date.now();
    DB.set('logs', [
      { ex: EX, w: 50, kg: 50, reps: '8', rpe: RPE.potrivit, ts: now - 2 * DAY, session: now - 2 * DAY },
      { ex: EX, w: 50, kg: 50, reps: '8', rpe: RPE.usor, ts: now - 5 * DAY, session: now - 5 * DAY },
    ]);
  }
  beforeEach(() => { localStorage.clear(); seedWideHistory(); });
  afterEach(() => vi.restoreAllMocks());

  it('FLAG OFF (default) — no activeProbe descriptor (byte-identical)', () => {
    // dp_active_probing_v1 flipped default-ON (Wave 2026-06-14); pin it OFF to
    // assert the legacy byte-identical (no-descriptor) path explicitly.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_active_probing_v1: false }));
    const r = DP.getSmartRecommendation(EX, 90, null, now);
    expect(r.activeProbe).toBeUndefined();
  });

  it('FLAG ON + wide posterior + FRESH — attaches a probe ABOVE the working load, kg unchanged', () => {
    // Baseline = Kalman ON, probe OFF — so the comparison isolates the PROBE's effect
    // on result.kg (the descriptor-only contract), not the Kalman demoW path.
    const spy = vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_strength_kalman_v1',
    );
    const baselineKg = DP.getSmartRecommendation(EX, 95, null, now).kg;
    spy.mockImplementation(
      (id) => id === 'dp_active_probing_v1' || id === 'dp_strength_kalman_v1',
    );
    const r = DP.getSmartRecommendation(EX, 95, null, now);
    // Main prescription is unchanged by the probe (descriptor-only).
    expect(r.kg).toBe(baselineKg);
    // A probe IS offered (wide sigma + fresh), heavier than the working load.
    expect(r.activeProbe).toBeDefined();
    expect(r.activeProbe.kg).toBeGreaterThan(r.kg);
    // The note is now a STRUCTURED token (i18n resolves the copy) — dp.js emits
    // noteKind, NOT a hardcoded RO string (i18n-leak rule).
    expect(r.activeProbe.noteKind).toBe('calibration');
    expect(r.activeProbe.note).toBeUndefined();
  });

  it('FLAG ON but FATIGUED (low readiness) — no probe', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation(
      (id) => id === 'dp_active_probing_v1' || id === 'dp_strength_kalman_v1',
    );
    const r = DP.getSmartRecommendation(EX, READINESS_HIGH - 5, null, now);
    expect(r.activeProbe).toBeUndefined();
  });
});
