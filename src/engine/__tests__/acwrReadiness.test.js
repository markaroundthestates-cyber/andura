// ══ BUILD F6a #5 — ACWR readiness tests (F6a spec §3e) ══════════════════════
// computeACWR (pure) + acwrReadinessPenalty (pure) + the flag-gated readiness
// score path. Real rpe literals (6.5/7.5/8.5). Asserts:
//   - steady volume → ACWR ≈ 1 → no penalty → score byte-identical (flag inert).
//   - volume spike (acute >> chronic) → ACWR > HIGH → penalty crosses <60.
//   - cold start (no chronic history) → null → untouched.
//   - flag OFF → ACWR never applied → identical score regardless of logs.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeACWR,
  acwrReadinessPenalty,
  ACWR_HIGH,
} from '../muscleRecovery.js';
import { getReadinessScore } from '../readiness.js';
import { DB } from '../../db.js';

const DAY = 86400000;
const NOW = 2_000_000_000_000;

// Build N sessions of an exercise spread over the last `spanDays`, all at rpe 7.5
// (potrivit), `perDay` sets each day.
function logsOver(ex, w, spanDays, stepDays, perDay) {
  const out = [];
  for (let d = spanDays; d >= 1; d -= stepDays) {
    for (let s = 0; s < perDay; s++) {
      out.push({ ex, w, reps: '10', rpe: 7.5, ts: NOW - d * DAY + s * 1000 });
    }
  }
  return out;
}

beforeEach(() => {
  localStorage.clear();
});

describe('F6a #5 ACWR readiness', () => {
  it('steady volume → ACWR near 1.0 → no penalty', () => {
    // even cadence across 28d → acute ≈ chronic-per-window.
    const logs = logsOver('Flat DB Press', 60, 28, 2, 1);
    const a = computeACWR(logs, NOW);
    expect(a).not.toBeNull();
    expect(a.acwr).toBeGreaterThan(0.7);
    expect(a.acwr).toBeLessThan(1.4);
    expect(acwrReadinessPenalty(a)).toBe(0);
  });

  it('volume spike (acute >> chronic) → ACWR > HIGH → penalty > 0', () => {
    // sparse old history + a heavy recent week.
    const old = logsOver('Flat DB Press', 60, 28, 7, 1); // ~4 old sessions
    const spike = logsOver('Flat DB Press', 60, 6, 1, 4); // dense last 6 days
    const a = computeACWR([...old, ...spike], NOW);
    expect(a).not.toBeNull();
    expect(a.acwr).toBeGreaterThan(ACWR_HIGH);
    expect(acwrReadinessPenalty(a)).toBeGreaterThan(0);
  });

  it('cold start (no chronic history) → null → untouched', () => {
    expect(computeACWR([], NOW)).toBeNull();
  });

  it('flag OFF → readiness score byte-identical regardless of a spike', () => {
    const old = logsOver('Flat DB Press', 60, 28, 7, 1);
    const spike = logsOver('Flat DB Press', 60, 6, 1, 4);
    DB.set('logs', [...old, ...spike]);
    // dp_acwr_readiness_v1 now DEFAULTS ON (THE FLIP 2026-06-08) so "no _devFlags" no
    // longer means OFF — force the flag OFF explicitly to exercise the no-ACWR path.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_acwr_readiness_v1: false }));
    // readinessInput 4 → base 95, no nutrition penalty.
    const off = getReadinessScore(4, null, null, null, null, NOW);
    expect(off).toBe(95); // flag OFF → ACWR not applied
  });

  it('flag ON + spike → score lowered below the OFF value', () => {
    const old = logsOver('Flat DB Press', 60, 28, 7, 1);
    const spike = logsOver('Flat DB Press', 60, 6, 1, 4);
    DB.set('logs', [...old, ...spike]);
    localStorage.setItem('_devFlags', JSON.stringify({ dp_acwr_readiness_v1: false }));
    const off = getReadinessScore(4, null, null, null, null, NOW); // 95 (forced OFF)
    localStorage.setItem('_devFlags', JSON.stringify({ dp_acwr_readiness_v1: true }));
    const on = getReadinessScore(4, null, null, null, null, NOW);
    expect(on).toBeLessThan(off);
  });
});

// ── Cycle-9 cluster 2 — ACWR uncoupling + cold-start false-spike ──
describe('cycle9 cluster2 — ACWR uncoupled (dp_acwr_uncoupled_v1)', () => {
  const ON = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_acwr_uncoupled_v1: true }));
  const OFF = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_acwr_uncoupled_v1: false }));

  it('returning user (all load in the last 7d) is NOT pinned to acwr 4.0 → null', () => {
    // A user back after a >28d break crams their first week in. The legacy coupled
    // denominator (28d total includes the acute 7d) read acute==chronicTotal → 28/7
    // = 4.0, the max penalty, so the score could never reach the 85 "Zi de PR".
    const returning = [
      { ex: 'Flat DB Press', w: 27.5, reps: '10', rpe: 8, ts: NOW - 1 * DAY },
      { ex: 'Flat DB Press', w: 27.5, reps: '9', rpe: 7.5, ts: NOW - 3 * DAY },
      { ex: 'Flat DB Press', w: 25.0, reps: '11', rpe: 8.5, ts: NOW - 5 * DAY },
    ];
    OFF();
    const off = computeACWR(returning, NOW);
    expect(off).not.toBeNull();
    expect(off.acwr).toBeCloseTo(4.0, 2); // the legacy structural pin
    ON();
    // No pre-acute baseline → honest null (no penalty) instead of a fabricated 4.0.
    expect(computeACWR(returning, NOW)).toBeNull();
  });

  it('steady 2-week user does NOT read a false spike → null (no unearned hold)', () => {
    // Even cadence over the last ~13 days — a stable trainee, no spike. The legacy
    // fixed 7/28 divisor with only chronicTotal>0 as the guard read a false ~2.0
    // acute:chronic spike → an unearned penalty crossing the <60 dp.js HOLD cliff.
    const steady = logsOver('Flat DB Press', 62.5, 13, 2, 1);
    OFF();
    const off = computeACWR(steady, NOW);
    expect(off).not.toBeNull();
    expect(off.acwr).toBeGreaterThan(ACWR_HIGH); // the legacy false spike
    ON();
    // Span < 2x the acute window of real PRE-acute history → honest null.
    expect(computeACWR(steady, NOW)).toBeNull();
  });

  it('a steady ~4-week trainee reads ~1.0 (no penalty), real spike still penalized', () => {
    ON();
    const steady = logsOver('Flat DB Press', 62.5, 28, 2, 1); // even cadence over 28d
    const a = computeACWR(steady, NOW);
    expect(a).not.toBeNull();
    expect(a.acwr).toBeGreaterThan(0.7);
    expect(a.acwr).toBeLessThan(1.4);
    expect(acwrReadinessPenalty(a)).toBe(0);
    // A genuine recent spike on top of a real chronic baseline still trips the penalty.
    const spike = [...logsOver('Flat DB Press', 62.5, 28, 7, 1), ...logsOver('Flat DB Press', 62.5, 5, 1, 5)];
    const s = computeACWR(spike, NOW);
    expect(s).not.toBeNull();
    expect(s.acwr).toBeGreaterThan(ACWR_HIGH);
    expect(acwrReadinessPenalty(s)).toBeGreaterThan(0);
  });
});
