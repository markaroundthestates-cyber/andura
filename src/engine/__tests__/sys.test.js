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
  it('T4: uses Mifflin-St Jeor fallback when fewer than 4 weight entries', () => {
    mockStorage['weights'] = { '2026-04-27': 100 };
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

  it('T8: pilot boundary — CUT before TARGET_DATE, pilot logic fires after (vi.setSystemTime)', () => {
    vi.useFakeTimers();
    delete mockStorage['phase-override'];
    mockStorage['weights'] = { '2026-04-27': 100 };

    vi.setSystemTime(new Date('2026-06-01')); // before 2026-07-20
    expect(SYS.getPhase()).toBe('CUT');

    vi.setSystemTime(new Date('2026-08-01')); // after 2026-07-20
    const phaseAfter = SYS.getPhase();
    expect(typeof phaseAfter).toBe('string');
    expect(phaseAfter.length).toBeGreaterThan(0);
  });
});

// ── getKcalTarget() ────────────────────────────────────────────────────────

describe('SYS — getKcalTarget()', () => {
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
