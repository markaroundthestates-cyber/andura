import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock user.js BEFORE importing SYS — enables lazy getter to see test bio
vi.mock('../../config/user.js', () => ({
  getUserConfig: vi.fn(() => ({
    bio: { age: 30, height: 183, startKg: 111.4, startBF: 23, currentKgFallback: 110.4 },
    targets: { kcal: 2000, protein: 180 },
  })),
  updateUserConfig: vi.fn(),
}));

// Mock DB (key/value store — returns values directly, no JSON parsing)
const mockStorage = {};
vi.mock('../../db.js', () => ({
  DB: {
    get: vi.fn(key => mockStorage[key] ?? null),
    set: vi.fn((key, val) => { mockStorage[key] = val; }),
  },
}));

import { SYS } from '../sys.js';

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── getBF() ────────────────────────────────────────────────────────────────

describe('SYS — getBF()', () => {
  it('T1: bf-override wins everything — returns raw parseFloat, skips all calculations', () => {
    mockStorage['bf-override'] = '18.5';
    mockStorage['weights'] = { '2026-04-27': 105 };
    expect(SYS.getBF()).toBe(18.5);
  });

  it('T2: override returned raw (unclamped); auto-path clamps calculatedBF to [5, 45]', () => {
    // Override path: raw, no clamp
    mockStorage['bf-override'] = '60';
    expect(SYS.getBF()).toBe(60);

    // Auto path: very low kg → startFatKg - fatLost < 0 → currentFatKg = max(3, …) = 3 → BF ≥ 5
    delete mockStorage['bf-override'];
    mockStorage['weights'] = { '2026-04-27': 50 };
    const bfLow = SYS.getBF();
    expect(bfLow).toBeGreaterThanOrEqual(5);
    expect(bfLow).toBeLessThanOrEqual(45);
  });

  it('T3: BF independent de logs (calibration din start, nu din lifting history)', () => {
    mockStorage['weights'] = { '2026-04-27': 100 };
    mockStorage['logs'] = [
      { ex: 'DB Shoulder Press', w: 25, ts: Date.now() },
      { ex: 'DB Shoulder Press', w: 24, ts: Date.now() - 1000 },
    ];
    const bfWithLogs = SYS.getBF();

    mockStorage['logs'] = [];
    const bfNoLogs = SYS.getBF();

    expect(bfWithLogs).toBe(bfNoLogs); // logs irrelevant pentru calibration formula
  });
});

// ── estimateTDEE() ─────────────────────────────────────────────────────────

describe('SYS — estimateTDEE()', () => {
  it('T4a: uses Katch-McArdle (BF-aware) when fewer than 4 weights AND getBF finite', () => {
    mockStorage['weights'] = { '2026-04-27': 100 };
    mockStorage['bf-override'] = '20';
    // lbm = 100 × (1 - 0.20) = 80; bmr = 370 + 21.6 × 80 = 2098; TDEE = round(2098 × 1.55) = 3252
    const tdee = SYS.estimateTDEE();
    expect(tdee).toBeCloseTo(3252, -1);
  });

  it('T4b: uses Mifflin-St Jeor fallback when getBF returns NaN (no usable BF)', () => {
    mockStorage['weights'] = { '2026-04-27': 100 };
    mockStorage['bf-override'] = 'invalid'; // parseFloat → NaN → !Number.isFinite
    // BMR = 10×100 + 6.25×183 - 5×30 + 5 = 1998.75; TDEE = round(1998.75 × 1.55) = 3098
    const tdee = SYS.estimateTDEE();
    expect(tdee).toBeCloseTo(3098, -1);
  });

  it('T5: clamps result to [KCAL_TARGET, 3500] when weight data implies extreme deficit', () => {
    // 20kg lost in 26 days → dailyDeficit ≈ 5923 → currentKcal + deficit >> 3500 → upper clamp
    mockStorage['weights'] = {
      '2026-04-01': 110,
      '2026-04-08': 105,
      '2026-04-15': 100,
      '2026-04-22': 95,
      '2026-04-27': 90,
    };
    mockStorage['current-kcal'] = 2000;
    const tdee = SYS.estimateTDEE();
    expect(tdee).toBeLessThanOrEqual(3500);
    expect(tdee).toBeGreaterThanOrEqual(2000); // KCAL_TARGET
  });

  it('T6: filters to phase-change-date window when ≥4 post-phase entries exist', () => {
    mockStorage['weights'] = {
      '2026-03-01': 110,
      '2026-03-15': 108,
      '2026-04-01': 105,
      '2026-04-15': 103,
      '2026-04-20': 102,
      '2026-04-25': 101,
      '2026-04-27': 100,
    };
    mockStorage['phase-change-date'] = '2026-04-15';
    mockStorage['current-kcal'] = 2000;
    const tdeeFiltered = SYS.estimateTDEE();

    delete mockStorage['phase-change-date'];
    const tdeeNoFilter = SYS.estimateTDEE();

    // 4 entries post-2026-04-15 (3kg/12d) vs full 7-entry window (10kg/57d) → different TDEE
    expect(tdeeFiltered).not.toBe(tdeeNoFilter);
  });
});

// ── getPhase() ─────────────────────────────────────────────────────────────

describe('SYS — getPhase()', () => {
  it('T7: phase-override wins — returns override regardless of date or BF', () => {
    mockStorage['phase-override'] = 'BULK';
    mockStorage['weights'] = { '2026-04-27': 90 };
    expect(SYS.getPhase()).toBe('BULK');
  });

  it('T8: phase auto-derives from BF + season, no pre-pilot CUT short-circuit (Bug 1 regression)', () => {
    vi.useFakeTimers();
    delete mockStorage['phase-override'];
    mockStorage['weights'] = { '2026-04-27': 100 }; // auto BF ~17.1 → bf>15 + summer → MAINTENANCE

    vi.setSystemTime(new Date('2026-06-01')); // before TARGET_DATE 2026-07-20, summer
    expect(SYS.getPhase()).toBe('MAINTENANCE');

    vi.setSystemTime(new Date('2026-08-01')); // still summer, post-fix logic same
    expect(SYS.getPhase()).toBe('MAINTENANCE');
  });
});

// ── getKcalTarget() ────────────────────────────────────────────────────────

describe('SYS — getKcalTarget()', () => {
  it('T_AUTO_pre_pilot: AUTO before TARGET_DATE returns TDEE×phase multiplier, NOT hardcoded KCAL_TARGET (Bug 1 regression)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01')); // before TARGET_DATE 2026-07-20
    delete mockStorage['phase-override'];
    mockStorage['weights'] = { '2026-04-27': 100 }; // auto BF ~17.1 → MAINTENANCE phase

    const kcal = SYS.getKcalTarget();
    expect(kcal).not.toBe(2000); // pre-fix returned hardcoded KCAL_TARGET=2000
    expect(kcal).toBe(SYS.estimateTDEE()); // MAINTENANCE multiplier = 1.0 → tdee
    expect(kcal).toBeGreaterThan(2500); // sanity: BF-derived TDEE much higher than 2000
  });

  it('T_BF_edit_recalc: BF edit on same weight changes kcal target via Katch-McArdle (Bug 2 regression)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01'));
    mockStorage['weights'] = { '2026-04-27': 100 };
    mockStorage['phase-override'] = 'MAINTENANCE'; // pin phase to isolate BF→TDEE math

    mockStorage['bf-override'] = '30';
    const kcalBfHigh = SYS.getKcalTarget(); // lbm=70, bmr=370+21.6×70=1882, tdee≈2917

    mockStorage['bf-override'] = '5';
    const kcalBfLow = SYS.getKcalTarget(); // lbm=95, bmr=370+21.6×95=2422, tdee≈3754

    expect(kcalBfLow).not.toBe(kcalBfHigh);
    expect(Math.abs(kcalBfLow - kcalBfHigh)).toBeGreaterThan(300); // pre-fix: identical
  });

  it('T9: applies correct TDEE multipliers per phase (CUT<MAINT<STRENGTH<BULK)', () => {
    mockStorage['weights'] = { '2026-04-27': 100 }; // 1 entry → Mifflin TDEE ≈ 3098

    mockStorage['phase-override'] = 'CUT';
    const kcalCut = SYS.getKcalTarget();       // ×0.82

    mockStorage['phase-override'] = 'BULK';
    const kcalBulk = SYS.getKcalTarget();      // ×1.08

    mockStorage['phase-override'] = 'MAINTENANCE';
    const kcalMaint = SYS.getKcalTarget();     // ×1.00

    mockStorage['phase-override'] = 'STRENGTH';
    const kcalStrength = SYS.getKcalTarget();  // ×1.05

    expect(kcalCut).toBeLessThan(kcalMaint);
    expect(kcalBulk).toBeGreaterThan(kcalMaint);
    expect(kcalStrength).toBeGreaterThan(kcalMaint);
    expect(kcalStrength).toBeLessThan(kcalBulk);
  });
});

// ── kgAtBF() + weeksToKg() ────────────────────────────────────────────────

describe('SYS — kgAtBF() + weeksToKg()', () => {
  it('T10: kgAtBF produces targetKg < currentKg; weeksToKg returns positive finite weeks', () => {
    mockStorage['weights'] = { '2026-04-27': 105 };
    // LBM ≈ 84.2kg; kgAtBF(15) = 84.2/(1-0.15) ≈ 99.1 < 105 ✓
    const targetKg = SYS.kgAtBF(15);
    expect(targetKg).toBeLessThan(105);
    expect(targetKg).toBeGreaterThan(50);

    // weeksToKg: diff = 105 - 99.1 = 5.9 → ceil(5.9/0.5) = 12 weeks
    const weeks = SYS.weeksToKg(targetKg);
    expect(weeks).toBeGreaterThan(0);
    expect(Number.isFinite(weeks)).toBe(true);
  });
});

// ── Property-based: all phases × BF range ─────────────────────────────────

describe('SYS — getKcalTarget() property-based', () => {
  it('T11: valid kcal output [1000, 4500] across BF [10,35] × all phase combinations', () => {
    mockStorage['weights'] = { '2026-04-27': 100 };
    const phases = ['CUT', 'BULK', 'MAINTENANCE', 'STRENGTH'];

    for (const phase of phases) {
      mockStorage['phase-override'] = phase;
      for (let bf = 10; bf <= 35; bf++) {
        mockStorage['bf-override'] = String(bf);
        const kcal = SYS.getKcalTarget();
        expect(kcal).toBeGreaterThanOrEqual(1000);
        expect(kcal).toBeLessThanOrEqual(4500);
        expect(Number.isFinite(kcal)).toBe(true);
      }
    }
  });
});
