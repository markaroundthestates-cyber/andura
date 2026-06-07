// ══ BUILD #5 — per-user learned recovery (F3 spec §5) unit tests ════════════
// Pure learnRecovery() from the durable logs + getMuscleState() learned-override.
// Uses the real per-set rating literals (rpe 6.5/7.5/8.5) + real EXERCISE_MUSCLES
// names so a green test means the live path works.

import { describe, it, expect } from 'vitest';
import {
  learnRecovery,
  getMuscleState,
  MUSCLE_HEADS,
  RECOVERY_CLAMP_LO,
  RECOVERY_CLAMP_HI,
} from '../muscleMap.js';

const MS_DAY = 86400000;
const T0 = Date.UTC(2026, 0, 1);
// Flat Barbell? No — use a real EXERCISE_MUSCLES key. 'Leg Curl' -> hamstring (96h global).
const day = (n) => T0 + n * MS_DAY;

function legCurlLog(dayN, w, reps = 10, rpe = 7.5) {
  return { ex: 'Leg Curl', w, reps, rpe, ts: day(dayN) };
}

describe('learnRecovery — per-muscle constant from performance return', () => {
  it('learns nothing with too few observations (< RECOVERY_MIN_GAPS) → global prior', () => {
    const logs = [legCurlLog(0, 40), legCurlLog(2, 40)];
    const learned = learnRecovery(logs);
    expect(learned.hamstring).toBeUndefined();
  });

  it('a consistent fast recoverer learns BELOW the global, clamped to >=0.5x', () => {
    // hamstring global 96h. Train every 2 days (48h) always recovered (flat/rising
    // e1RM) → observed return-gap 48h, well below 96h. EMA toward 48, clamp 0.5x=48.
    const logs = [];
    for (let i = 0; i <= 8; i++) logs.push(legCurlLog(i * 2, 40 + i)); // rising → always recovered
    const learned = learnRecovery(logs);
    expect(learned.hamstring).toBeDefined();
    const g = MUSCLE_HEADS.hamstring.recoveryHours;
    expect(learned.hamstring.hours).toBeGreaterThanOrEqual(Math.round(g * RECOVERY_CLAMP_LO));
    expect(learned.hamstring.hours).toBeLessThan(g); // shorter than the global
    expect(learned.hamstring.n).toBeGreaterThanOrEqual(1);
  });

  it('clamps the learned constant to [0.5x, 2x] of the global', () => {
    const logs = [];
    for (let i = 0; i <= 8; i++) logs.push(legCurlLog(i * 1, 40 + i)); // 24h gaps, recovered
    const learned = learnRecovery(logs);
    const g = MUSCLE_HEADS.hamstring.recoveryHours;
    expect(learned.hamstring.hours).toBeGreaterThanOrEqual(Math.round(g * RECOVERY_CLAMP_LO));
    expect(learned.hamstring.hours).toBeLessThanOrEqual(Math.round(g * RECOVERY_CLAMP_HI));
  });

  it('EMA-continues from a prior learned value (slow, single anomaly barely moves it)', () => {
    const logs = [];
    for (let i = 0; i <= 8; i++) logs.push(legCurlLog(i * 2, 40 + i));
    const prior = { hamstring: { hours: 96, n: 5 } };
    const learned = learnRecovery(logs, prior);
    // Started at 96 (prior), EMA alpha 0.3 toward ~48 → lands between, NOT at 48.
    expect(learned.hamstring.hours).toBeGreaterThan(48);
    expect(learned.hamstring.hours).toBeLessThan(96);
    expect(learned.hamstring.n).toBe(6); // prior n + 1
  });
});

describe('getMuscleState — learned-hours override', () => {
  const logs = [legCurlLog(0, 40, 10, 7.5)];
  const now = day(1); // 24h after the only log

  it('no override + flag OFF → byte-identical to the global decay', () => {
    // learnedHours omitted, flag default OFF → _learnedRecoveryHours()=null → globals.
    const withGlobal = getMuscleState(logs, now);
    const explicitNull = getMuscleState(logs, now, null);
    expect(withGlobal).toEqual(explicitNull);
    expect(withGlobal.hamstring).toBeGreaterThan(0);
  });

  it('a SHORTER learned constant decays the fatigue faster (lower state at same lag)', () => {
    const global = getMuscleState(logs, now, null);
    const shorter = getMuscleState(logs, now, { hamstring: 48 }); // half the 96h global
    expect(shorter.hamstring).toBeLessThan(global.hamstring);
  });

  it('an explicit empty/invalid learned entry falls back to the global per muscle', () => {
    const a = getMuscleState(logs, now, { hamstring: 0 }); // invalid → global
    const b = getMuscleState(logs, now, null);
    expect(a.hamstring).toBeCloseTo(b.hamstring, 6);
  });
});
