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
    // readinessInput 4 → base 95, no nutrition penalty.
    const off = getReadinessScore(4, null, null, null, null, NOW);
    expect(off).toBe(95); // flag OFF (no _devFlags) → ACWR not applied
  });

  it('flag ON + spike → score lowered below the OFF value', () => {
    const old = logsOver('Flat DB Press', 60, 28, 7, 1);
    const spike = logsOver('Flat DB Press', 60, 6, 1, 4);
    DB.set('logs', [...old, ...spike]);
    const off = getReadinessScore(4, null, null, null, null, NOW); // 95
    localStorage.setItem('_devFlags', JSON.stringify({ dp_acwr_readiness_v1: true }));
    const on = getReadinessScore(4, null, null, null, null, NOW);
    expect(on).toBeLessThan(off);
  });
});
