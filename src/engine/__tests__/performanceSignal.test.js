// ══ PERFORMANCE SIGNAL + energy temper (founder live 2026-08-28) ═════════════
// The energy modulation was blind to how the user actually handles the deficit.
// Founder's REAL account numbers are the fixtures here: severity 0.52 (past the
// 0.30 saturation → every knob maxed) while setting 9 PRs in 30 days with a 14%
// `greu` share. Asserts the detector's verdict AND the tempered curve output.

import { describe, it, expect } from 'vitest';
import {
  detectStrongPerformance,
  PERF_WINDOW_DAYS,
  PERF_MIN_SETS,
  PERF_GREU_SHARE_MAX,
} from '../dp/performanceSignal.js';
import {
  energyVolumeFactor,
  SEVERITY_AT_MAX_CUT,
  VOLUME_FACTOR_MIN,
  RIR_SHIFT_MAX,
} from '../dp/ceiling.js';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 7, 28, 7, 30);
const DELOAD_BIAS_PULL_FORWARD = 0.75; // periodization/index.js:50 (mirrored)

/** n sets `days` ago, `greu` of them rated 8.5 (the rest potrivit 7.5). */
function sets(n, greu, days) {
  return Array.from({ length: n }, (_, i) => ({
    ts: NOW - days * DAY + i * 1000,
    rpe: i < greu ? 8.5 : 7.5,
  }));
}

describe('detectStrongPerformance', () => {
  it("founder's real shape (9 PRs / 14% greu / 240 sets) → STRONG", () => {
    const logs = [...sets(120, 17, 5), ...sets(120, 17, 12)];
    const prs = Array.from({ length: 9 }, (_, i) => ({ ts: NOW - (i + 1) * DAY }));
    const v = detectStrongPerformance(logs, prs, NOW);
    expect(v.strong).toBe(true);
    expect(v.recentPRs).toBe(9);
    expect(v.greuShare).toBeLessThan(PERF_GREU_SHARE_MAX);
  });

  it('grinding (greu share over the cap) → NOT strong even with a PR', () => {
    const logs = sets(40, 20, 4); // 50% greu
    const v = detectStrongPerformance(logs, [{ ts: NOW - DAY }], NOW);
    expect(v.strong).toBe(false);
  });

  it('no recent PR → NOT strong (coasting is not thriving)', () => {
    const logs = sets(40, 4, 4);
    const oldPr = [{ ts: NOW - (PERF_WINDOW_DAYS + 5) * DAY }];
    expect(detectStrongPerformance(logs, oldPr, NOW).strong).toBe(false);
  });

  it('too little evidence (< PERF_MIN_SETS) → NOT strong (legacy protection stands)', () => {
    const logs = sets(PERF_MIN_SETS - 1, 0, 3);
    expect(detectStrongPerformance(logs, [{ ts: NOW - DAY }], NOW).strong).toBe(false);
  });

  it('sets older than the window do not vote', () => {
    const logs = sets(60, 0, PERF_WINDOW_DAYS + 10);
    const v = detectStrongPerformance(logs, [{ ts: NOW - DAY }], NOW);
    expect(v.sets).toBe(0);
    expect(v.strong).toBe(false);
  });

  it('malformed rows are skipped, never thrown on', () => {
    expect(() => detectStrongPerformance([null, {}, { ts: 'x' }], null, NOW)).not.toThrow();
    expect(detectStrongPerformance(null, null, NOW).strong).toBe(false);
  });
});

describe('energyVolumeFactor — performance temper', () => {
  // Founder's real severity: 1303 kcal deficit / 2503 TDEE.
  const founderMag = { phase: 'CUT', severity: 0.52 };

  it('without the signal his deficit saturates EVERY knob (the shipped legacy dose)', () => {
    expect(founderMag.severity).toBeGreaterThan(SEVERITY_AT_MAX_CUT);
    const legacy = energyVolumeFactor(founderMag);
    expect(legacy.volumeFactor).toBe(VOLUME_FACTOR_MIN); // -30% volume
    expect(legacy.rirShift).toBe(RIR_SHIFT_MAX); // +2 RIR
    expect(legacy.deloadBias).toBe(1); // deload pulled forward every mesocycle
  });

  it('strong performance halves the ramp: less cut, 1 RIR, no deload pull-forward', () => {
    const tempered = energyVolumeFactor(founderMag, { strong: true });
    expect(tempered.volumeFactor).toBeGreaterThan(VOLUME_FACTOR_MIN);
    expect(tempered.rirShift).toBe(1);
    // The whole point: bias drops under the periodization pull-forward threshold.
    expect(tempered.deloadBias).toBeLessThan(DELOAD_BIAS_PULL_FORWARD);
  });

  it('a still-real cut — the temper relaxes, it does not remove', () => {
    const tempered = energyVolumeFactor(founderMag, { strong: true });
    expect(tempered.volumeFactor).toBeLessThan(1); // volume IS still reduced
    expect(tempered.rirShift).toBeGreaterThan(0);
  });

  it('strong:false / absent → byte-identical to the legacy single-arg call', () => {
    const legacy = energyVolumeFactor(founderMag);
    expect(energyVolumeFactor(founderMag, null)).toEqual(legacy);
    expect(energyVolumeFactor(founderMag, { strong: false })).toEqual(legacy);
  });

  it('the temper never touches a SURPLUS (bulk) — only the deficit ramp', () => {
    const bulk = { phase: 'BULK', severity: 0.2 };
    expect(energyVolumeFactor(bulk, { strong: true })).toEqual(energyVolumeFactor(bulk));
  });
});
