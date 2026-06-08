// ══ BUILD #65 — log OUTLIER detector + quarantine tests (F7 §2d) ═════════════
// (1) Pure logOutlier: upper-tail only, mature-N guard, cold-start no-flag.
// (2) Quarantine ledger: additive, revert, ts-keyed, EN-keyed persistence.
// (3) THE POISON TEST (F7 §2d acceptance): a set ~2× the established mu is EXCLUDED
//     from calibration + the posterior fold (mu does not jump), KEPT in logs, and
//     reversible via the userConfirmed path. A genuine PR within a few σ is NOT
//     flagged. Cold-start (n < OUTLIER_MIN_N) never flags. Flag-OFF byte-identical.
// REAL production values (feedback_test_real_values): the band is the user's own
// posterior σ on a real lift, not a round number.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { logOutlier, OUTLIER_Z, OUTLIER_MIN_N } from '../dp/anomalyGuard.js';
import {
  quarantineSet, unquarantineSet, isQuarantined, getQuarantine, LOG_QUARANTINE_KEY,
} from '../dp/logQuarantine.js';
import { savePosterior } from '../dp/strengthKalman.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

describe('logOutlier — pure', () => {
  const matureBand = { mu: 100, sigma: 5, n: OUTLIER_MIN_N }; // working e1RM ~100kg, σ 5kg

  it('flags an upper-tail set far above the mature band', () => {
    // 2× mu = 200 → z = (200-100)/5 = 20 ≫ 4 → outlier.
    const r = logOutlier(200, matureBand);
    expect(r.isOutlier).toBe(true);
    expect(r.z).toBeGreaterThan(OUTLIER_Z);
  });

  it('does NOT flag a genuine PR within a few sigma', () => {
    // A real PR: 115 e1RM → z = 3 < 4 → kept (moves mu a little, stays inside band).
    const r = logOutlier(115, matureBand);
    expect(r.isOutlier).toBe(false);
  });

  it('NEVER flags the lower tail (an under-log is real fatigue)', () => {
    const r = logOutlier(50, matureBand); // z = -10, way below — never an outlier
    expect(r.isOutlier).toBe(false);
  });

  it('does NOT flag against an immature (cold-start) posterior', () => {
    const cold = { mu: 100, sigma: 5, n: OUTLIER_MIN_N - 1 };
    expect(logOutlier(200, cold).isOutlier).toBe(false);
    expect(logOutlier(200, cold).z).toBe(null);
  });

  it('returns not-outlier with z:null when no posterior (Kalman OFF degrade)', () => {
    expect(logOutlier(200, null).isOutlier).toBe(false);
    expect(logOutlier(200, null).z).toBe(null);
  });

  it('returns not-outlier for a degenerate sigma', () => {
    expect(logOutlier(200, { mu: 100, sigma: 0, n: 10 }).isOutlier).toBe(false);
  });

  it('exports tunable constants (Daniel knobs)', () => {
    expect(OUTLIER_Z).toBe(4);
    expect(OUTLIER_MIN_N).toBe(5);
  });
});

describe('logQuarantine ledger — pure', () => {
  beforeEach(() => localStorage.clear());

  it('quarantineSet persists an EN-keyed entry by ts', () => {
    quarantineSet('Lat Pulldown', { ts: 111, w: 200, reps: 8, z: 20 });
    const all = /** @type {any} */ (DB.get(LOG_QUARANTINE_KEY));
    expect(all['Lat Pulldown'][0]).toMatchObject({ ts: 111, w: 200, reps: 8, z: 20 });
    expect(isQuarantined('Lat Pulldown', 111)).toBe(true);
  });

  it('is idempotent on the same ts (no double-list)', () => {
    quarantineSet('Lat Pulldown', { ts: 111, w: 200, reps: 8, z: 20 });
    quarantineSet('Lat Pulldown', { ts: 111, w: 200, reps: 8, z: 20 });
    expect(getQuarantine('Lat Pulldown')).toHaveLength(1);
  });

  it('unquarantineSet removes the entry (revert)', () => {
    quarantineSet('Lat Pulldown', { ts: 111, w: 200, reps: 8, z: 20 });
    unquarantineSet('Lat Pulldown', 111);
    expect(isQuarantined('Lat Pulldown', 111)).toBe(false);
    expect(getQuarantine('Lat Pulldown')).toHaveLength(0);
  });
});

describe('POISON TEST — a log outlier never moves learning (F7 §2d)', () => {
  const EX = 'Lat Pulldown';
  const base = Date.UTC(2026, 0, 1);

  beforeEach(() => {
    localStorage.clear();
    // REAL working history ~60kg × 10 @ rpe 7.5 → e1RM ≈ 60·(1+12/30) ≈ 84.
    DB.set('logs', [
      { ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + 5 * 86400000 },
      { ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + 4 * 86400000 },
      { ex: EX, w: 58, reps: 10, rpe: 7.5, ts: base + 3 * 86400000 },
      { ex: EX, w: 57, reps: 10, rpe: 7.5, ts: base + 2 * 86400000 },
      { ex: EX, w: 55, reps: 10, rpe: 7.5, ts: base + 1 * 86400000 },
    ]);
    // Seed a MATURE posterior around the real working e1RM band (n ≥ OUTLIER_MIN_N).
    savePosterior(EX, { mu: 84, sigma: 5, lastObsTs: base + 5 * 86400000, n: 6 });
  });

  afterEach(() => vi.restoreAllMocks());

  function calFactor() {
    const f = /** @type {any} */ (DB.get('dp-cal-factors')) || {};
    return f[EX] ? f[EX].kgFactor : null;
  }

  it('flag OFF → an over-log still calibrates (byte-identical legacy)', () => {
    // Flag off (default): a 130kg log (inside the ×4 fat-finger jump from 60) feeds
    // calibration as before — the outlier guard is inert.
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 130, setIdx: 1, nowMs: base + 6 * 86400000,
    });
    expect(calFactor()).not.toBe(null);
    expect(isQuarantined(EX, base + 6 * 86400000)).toBe(false);
  });

  it('flag ON → an upper-tail over-log is EXCLUDED from calibration + quarantined', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_log_outlier_v1');
    const setTs = base + 6 * 86400000;
    // 130kg × 10 @ rpe 7.5 → e1RM ≈ 182 ≫ mu+4σ (84+20=104) → outlier.
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 130, setIdx: 1, nowMs: setTs,
    });
    expect(calFactor(), 'calibration must not learn from the outlier').toBe(null);
    expect(isQuarantined(EX, setTs), 'the set is recorded to the quarantine ledger').toBe(true);
  });

  it('flag ON → the outlier set STAYS in logs verbatim (never deleted)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_log_outlier_v1');
    DB.set('logs', [
      { ex: EX, w: 130, reps: 10, rpe: 7.5, ts: base + 6 * 86400000 },
      .../** @type {any[]} */ (DB.get('logs')),
    ]);
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 130, setIdx: 1, nowMs: base + 6 * 86400000,
    });
    const logs = /** @type {any[]} */ (DB.get('logs'));
    expect(logs.some((l) => l.w === 130 && l.ex === EX)).toBe(true);
  });

  it('flag ON → a genuine PR within a few sigma DOES calibrate (no false-positive)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_log_outlier_v1');
    const setTs = base + 6 * 86400000;
    // 62kg × 10 @ rpe 7.5 → e1RM ≈ 87 → z = (87-84)/5 ≈ 0.6 < 4 → kept.
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 62, setIdx: 1, nowMs: setTs,
    });
    expect(calFactor()).not.toBe(null);
    expect(isQuarantined(EX, setTs)).toBe(false);
  });

  it('flag ON + userConfirmed → the outlier flows to calibration (reversible)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_log_outlier_v1');
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 130, setIdx: 1, nowMs: base + 6 * 86400000,
      userConfirmed: true,
    });
    expect(calFactor(), 'confirmed real → learned').not.toBe(null);
    expect(isQuarantined(EX, base + 6 * 86400000)).toBe(false);
  });

  it('flag ON, cold-start posterior (n < OUTLIER_MIN_N) → never flags', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_log_outlier_v1');
    savePosterior(EX, { mu: 84, sigma: 5, lastObsTs: base + 5 * 86400000, n: 2 });
    const setTs = base + 6 * 86400000;
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 130, setIdx: 1, nowMs: setTs,
    });
    // Immature band cannot judge → calibration learns (fat-finger still under ×4).
    expect(calFactor()).not.toBe(null);
    expect(isQuarantined(EX, setTs)).toBe(false);
  });
});
