// ══ DOSE + UNACCUSTOMED RECOVERY SCALING (dp_recovery_dose_v1) ══════════════
// The flat recovery model decays a muscle's stress only with TIME (96h for legs,
// K=1.8). The founder live (2026-06-11): "Andura says legs are fresh, but at the
// volume I gave them I still have some DOMS — I don't know if it's that I hadn't
// trained legs in a while or the volume, but they're not really fresh." Both:
//   (a) a BIG dose of volume in one session → a longer recovery window;
//   (b) a LONG layoff before that session → repeated-bout protection lost →
//       unfamiliar volume produces prolonged DOMS.
// This module STRETCHES the per-head recovery window for those two cases (window
// ×factor in getMuscleState's exp(-K·h/recovH)), so a group reads 'partial'
// (Easing / "functional but not fresh") at a time the flat model already calls
// 'recovered'. A TYPICAL dose on an ACCUSTOMED muscle is EXACTLY ×1.0 — the
// QA-F9 calibration (RECOVERY_DECAY_K=1.8) stays byte-identical.
//
// Flag gate: getRecoveryByGroup only stretches when BOTH opts.doseScaling===true
// AND dp_recovery_dose_v1 is enabled. Enabled here via the `_devFlags`
// localStorage dev-override (isEnabled step 1 wins over rollout).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MS_PER_DAY, MS_PER_HOUR } from '../../constants.js';
import {
  getRecoveryByGroup,
  getGroupRecoveryDetail,
  buildDoseScaledRecoveryHours,
} from '../muscleRecovery.js';
import { MUSCLE_HEADS } from '../muscleMap.js';

const FIXED = 1_700_000_000_000; // fixed reference now (deterministic)
const dAgo = (d) => FIXED - d * MS_PER_DAY;

// Enable / disable the flag via the dev-override localStorage key.
const enableDose = () =>
  localStorage.setItem('_devFlags', JSON.stringify({ dp_recovery_dose_v1: true }));
// Force the flag OFF explicitly — dp_recovery_dose_v1 ships default-ON now, so just
// REMOVING the dev override would fall back to the ON registry default. The dev
// override (isEnabled step 1) with an explicit `false` is the only true OFF.
const disableDose = () =>
  localStorage.setItem('_devFlags', JSON.stringify({ dp_recovery_dose_v1: false }));

// N primary-quad sets on one calendar day (rpe 9). Each entry = one set.
const legSets = (n, dayTs, rpe = 9) =>
  Array.from({ length: n }, () => ({ ex: 'Leg Extension', w: 60, reps: 10, rpe, ts: dayTs }));

describe('dp_recovery_dose_v1 — OFF path byte-identical (anti-regression)', () => {
  beforeEach(disableDose);
  afterEach(disableDose);

  // CEO-shaped logs: a 6-set quad day 6 days ago, a light prior day 30 days ago.
  const ceoLogs = [
    ...legSets(6, dAgo(6)),
    ...legSets(3, dAgo(30)),
  ];

  it('flag OFF → opts.doseScaling has NO effect (identical to no-opts)', () => {
    const plain = getRecoveryByGroup(ceoLogs, undefined, FIXED);
    const withOpt = getRecoveryByGroup(ceoLogs, undefined, FIXED, { doseScaling: true });
    expect(withOpt).toEqual(plain);
  });

  it('no opts → identical to legacy 3-arg call regardless of flag', () => {
    enableDose();
    const a = getRecoveryByGroup(ceoLogs, undefined, FIXED);
    const b = getRecoveryByGroup(ceoLogs, undefined, FIXED, undefined);
    expect(a).toEqual(b);
  });

  it('getGroupRecoveryDetail forwards opts; OFF → identical detail', () => {
    const plain = getGroupRecoveryDetail(ceoLogs, undefined, FIXED);
    const withOpt = getGroupRecoveryDetail(ceoLogs, undefined, FIXED, { doseScaling: true });
    expect(withOpt).toEqual(plain);
  });
});

describe('dp_recovery_dose_v1 — CEO anchor: big leg dose after a long layoff', () => {
  beforeEach(enableDose);
  afterEach(disableDose);

  // A 6-set quad day 6 days ago (the stressful session, rpe 9), preceded by a
  // light 3-set quad day 30 days ago → layoff 24d (repeated-bout lost) + dose 2×
  // the typical (floored at 3). At day +6 the flat model has decayed quad below
  // the 'partial' bar (reads 'recovered' / "fresh"); the stretch keeps it 'partial'.
  const stressDay = dAgo(6);
  const priorDay = dAgo(30);
  const ceoLogs = [
    ...legSets(6, stressDay),
    ...legSets(3, priorDay),
  ];

  it('flat model reads quad recovered at +6d (reproduces "Andura says fresh")', () => {
    const flat = getRecoveryByGroup(ceoLogs, undefined, FIXED);
    expect(flat['picioare-quads']).toBe('recovered');
  });

  it('dose-scaled reads quad PARTIAL at +6d (honest "functional but not fresh")', () => {
    const scaled = getRecoveryByGroup(ceoLogs, undefined, FIXED, { doseScaling: true });
    expect(scaled['picioare-quads']).toBe('partial');
    expect(scaled['picioare-quads']).not.toBe('recovered');
  });

  it('scaling only RAISES state — never reports below the flat model', () => {
    const RANK = { recovered: 0, partial: 1, fatigued: 2 };
    const flat = getRecoveryByGroup(ceoLogs, undefined, FIXED);
    const scaled = getRecoveryByGroup(ceoLogs, undefined, FIXED, { doseScaling: true });
    for (const g of Object.keys(flat)) {
      expect(RANK[scaled[g]]).toBeGreaterThanOrEqual(RANK[flat[g]]);
    }
  });

  it('at day +2 the muscle is still clearly loaded (not fresh)', () => {
    const logs = [...legSets(6, dAgo(2)), ...legSets(3, dAgo(26))];
    const scaled = getRecoveryByGroup(logs, undefined, FIXED, { doseScaling: true });
    expect(['partial', 'fatigued']).toContain(scaled['picioare-quads']);
  });
});

describe('dp_recovery_dose_v1 — F9 anchors preserved (typical dose / accustomed)', () => {
  beforeEach(enableDose);
  afterEach(disableDose);

  it('typical dose on an accustomed muscle → ×1.0 → byte-identical to flat', () => {
    // 3-set quad day (typical) with a prior 3-set day 3 days earlier (accustomed,
    // layoff 3d < 10d threshold). doseFactor 1.0 × unaccustomed 1.0 = 1.0.
    const logs = [...legSets(3, dAgo(1)), ...legSets(3, dAgo(4))];
    const flat = getRecoveryByGroup(logs, undefined, FIXED);
    const scaled = getRecoveryByGroup(logs, undefined, FIXED, { doseScaling: true });
    expect(scaled).toEqual(flat);
  });

  it('F9: a typical fresh leg day still reads fatigued same-evening (unchanged)', () => {
    // ~16 short hours after a typical leg session — the QA-F9 "legs fatigued@24h"
    // family. Typical dose → ×1.0 → identical to flat → still fatigued.
    const logs = [...legSets(3, FIXED - 16 * MS_PER_HOUR), ...legSets(3, dAgo(4))];
    const scaled = getRecoveryByGroup(logs, undefined, FIXED, { doseScaling: true });
    expect(scaled['picioare-quads']).toBe('fatigued');
  });

  it('a single first-ever session has no prior exposure → unaccustomed ×1.0', () => {
    // Only one quad day ever (no layoff to measure) → unaccustomed neutral; dose
    // at/under the floor → 1.0 → identical to flat (no false stretch at cold start).
    const logs = legSets(3, dAgo(6));
    const flat = getRecoveryByGroup(logs, undefined, FIXED);
    const scaled = getRecoveryByGroup(logs, undefined, FIXED, { doseScaling: true });
    expect(scaled).toEqual(flat);
  });
});

describe('buildDoseScaledRecoveryHours — factor boundaries (deterministic, pure)', () => {
  const base = MUSCLE_HEADS.quad.recoveryHours; // 96

  it('untrained head → base hours unchanged', () => {
    const hours = buildDoseScaledRecoveryHours([], FIXED);
    expect(hours.quad).toBe(base);
    expect(hours.chest_mid).toBe(MUSCLE_HEADS.chest_mid.recoveryHours);
  });

  it('typical dose, no layoff → exactly base (×1.0)', () => {
    const logs = [...legSets(3, dAgo(1)), ...legSets(3, dAgo(4))];
    const hours = buildDoseScaledRecoveryHours(logs, FIXED);
    expect(hours.quad).toBe(base);
  });

  it('dose just below the unaccustomed threshold (10d) does NOT stretch on layoff', () => {
    // layoff exactly 10d (== MIN) → unaccustomed 1.0; typical dose → total 1.0.
    const logs = [...legSets(3, dAgo(2)), ...legSets(3, dAgo(12))];
    const hours = buildDoseScaledRecoveryHours(logs, FIXED);
    expect(hours.quad).toBe(base);
  });

  it('big dose (6 sets, typical 3) → dose factor capped at 1.6', () => {
    // Recent prior day keeps layoff small (accustomed) so ONLY the dose factor
    // fires: 6/3 = 2.0 → clamped to 1.6.
    const logs = [...legSets(6, dAgo(1)), ...legSets(3, dAgo(4))];
    const hours = buildDoseScaledRecoveryHours(logs, FIXED);
    expect(hours.quad).toBeCloseTo(base * 1.6, 6);
  });

  it('long layoff (>=21d), typical dose → unaccustomed factor capped at 1.4', () => {
    const logs = [...legSets(3, dAgo(1)), ...legSets(3, dAgo(25))];
    const hours = buildDoseScaledRecoveryHours(logs, FIXED);
    expect(hours.quad).toBeCloseTo(base * 1.4, 6);
  });

  it('big dose AND long layoff → composed factor clamped to the 1.8 cap', () => {
    // 1.6 × 1.4 = 2.24 → clamped to 1.8. Prior day is 30d ago: layoff 24d, and it
    // sits inside the 42d lookback so typical = max(floor 3, median[3]) = 3.
    const logs = [...legSets(6, dAgo(6)), ...legSets(3, dAgo(30))];
    const hours = buildDoseScaledRecoveryHours(logs, FIXED);
    expect(hours.quad).toBeCloseTo(base * 1.8, 6);
  });

  it('respects a passed base-hours map (learned override is the base of the stretch)', () => {
    const logs = [...legSets(6, dAgo(6)), ...legSets(3, dAgo(30))];
    const learned = { quad: 120 }; // learned > global
    const hours = buildDoseScaledRecoveryHours(logs, FIXED, learned);
    expect(hours.quad).toBeCloseTo(120 * 1.8, 6);
  });

  it('unaccustomed ramps linearly between 10d and 21d (strictly inside the band)', () => {
    // Day-bucket layoff = 15d → t = (15-10)/(21-10) = 5/11 → factor = 1 + (5/11)·0.4.
    const logs = [...legSets(3, dAgo(2)), ...legSets(3, dAgo(17.5))];
    const expectedFactor = 1 + (5 / 11) * 0.4; // ≈ 1.1818
    const hours = buildDoseScaledRecoveryHours(logs, FIXED);
    expect(hours.quad).toBeCloseTo(base * expectedFactor, 4);
    // And it is genuinely between the no-stretch floor and the cap.
    expect(hours.quad).toBeGreaterThan(base);
    expect(hours.quad).toBeLessThan(base * 1.4);
  });
});
