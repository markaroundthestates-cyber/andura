// ══ REALITY ENGINE — Coverage Tests ═════════════════════════
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  realityEngine,
  roundToEquipment,
  getEquipmentForExercise,
  getRealityCheck,
} from '../reality.js';

describe('roundToEquipment', () => {
  it('returns weight unchanged for unknown exercise', () => {
    expect(roundToEquipment(42, 'Unknown Exercise')).toBe(42);
  });

  it('returns weight unchanged for null/undefined exercise', () => {
    // @ts-ignore
    expect(roundToEquipment(42, null)).toBe(42);
  });

  it('rounds to nearest valid stack weight (Lat Pulldown, bailib_stack)', () => {
    // bailib_stack steps: 5, 10, 15, 20, 25, 30, 35, 40, ...
    expect(roundToEquipment(22, 'Lat Pulldown')).toBe(20); // 22 nearest to 20 (delta 2) vs 25 (delta 3)
    expect(roundToEquipment(23, 'Lat Pulldown')).toBe(25); // 23 nearest to 25 (delta 2) vs 20 (delta 3)
    expect(roundToEquipment(50, 'Lat Pulldown')).toBe(50);
  });

  it('rounds to nearest for matrix_cable steps (4.5kg increments)', () => {
    // matrix_cable: [5, 9, 14, 18, 23, 27, ...]
    expect(roundToEquipment(20, 'Face Pulls')).toBe(18);
    expect(roundToEquipment(21, 'Face Pulls')).toBe(23);
  });

  it('rounds dumbbell exercise to nearest available DB weight', () => {
    // dumbbell: [7, 8, 9, 10, 12.5, 15, 17.5, 20, ...]
    expect(roundToEquipment(11, 'Incline DB Press')).toBe(10);
    expect(roundToEquipment(11.5, 'Incline DB Press')).toBe(12.5);
    expect(roundToEquipment(16, 'Incline DB Press')).toBe(15);
  });

  it('preferLower=true picks largest valid weight at-or-below target', () => {
    // bailib_stack: [5, 10, 15, 20, ...]
    expect(roundToEquipment(22, 'Lat Pulldown', true)).toBe(20);
    expect(roundToEquipment(50, 'Lat Pulldown', true)).toBe(50);
    expect(roundToEquipment(7, 'Lat Pulldown', true)).toBe(5);
  });

  it('preferLower=true returns lowest available when target below all valid', () => {
    // bailib_stack lowest is 5
    expect(roundToEquipment(2, 'Lat Pulldown', true)).toBe(5);
  });

  it('handles Pec Deck alias (without "/ Cable Fly")', () => {
    // Pec Deck alias maps to pec_deck: [18, 23, 27, ...]
    expect(roundToEquipment(20, 'Pec Deck')).toBe(18);
    expect(roundToEquipment(21, 'Pec Deck')).toBe(23);
  });
});

describe('getEquipmentForExercise', () => {
  it('returns equipment key for known exercise', () => {
    expect(getEquipmentForExercise('Lat Pulldown')).toBe('bailib_stack');
    expect(getEquipmentForExercise('Incline DB Press')).toBe('dumbbell');
    expect(getEquipmentForExercise('Leg Press')).toBe('leg_press_plates');
    expect(getEquipmentForExercise('Pec Deck')).toBe('pec_deck');
  });

  it('returns null for unknown exercise', () => {
    expect(getEquipmentForExercise('Mystery Exercise')).toBeNull();
  });
});

describe('realityEngine.validate', () => {
  it('returns null session unchanged', () => {
    expect(realityEngine.validate(null, {})).toBeNull();
  });

  it('returns undefined session unchanged', () => {
    expect(realityEngine.validate(undefined, {})).toBeUndefined();
  });

  it('returns session unchanged when no exercises property', () => {
    const session = { type: 'PUSH' };
    const ctx = { isInCut: false, readiness: { score: 80 }, user: { phase: 'CUT' }, recentLogs: [] };
    expect(realityEngine.validate(session, ctx)).toBe(session);
  });

  it('rounds recommendation weight to equipment stack', () => {
    const session = {
      exercises: [
        { name: 'Lat Pulldown', recommendation: { weight: 22 } }, // → 20
        { name: 'Face Pulls',   recommendation: { weight: 20 } }, // → 18
      ],
    };
    const ctx = { isInCut: false, readiness: { score: 80 }, user: { phase: 'CUT' }, recentLogs: [], isBeforeJuly20_2026: false };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.weight).toBe(20);
    expect(session.exercises[0].recommendation.realityAdjusted).toBe(true);
    expect(session.exercises[0].recommendation.originalWeight).toBe(22);
    expect(session.exercises[1].recommendation.weight).toBe(18);
  });

  it('skips exercises without recommendation', () => {
    const session = {
      exercises: [
        { name: 'Lat Pulldown' }, // no recommendation
        { name: 'Face Pulls', recommendation: { weight: 20 } },
      ],
    };
    const ctx = { isInCut: false, readiness: { score: 80 }, user: { phase: 'CUT' }, recentLogs: [], isBeforeJuly20_2026: false };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation).toBeUndefined();
    expect(session.exercises[1].recommendation.weight).toBe(18);
  });

  it('does NOT mark realityAdjusted when weight already valid', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 20 } }],
    };
    const ctx = { isInCut: false, readiness: { score: 80 }, user: { phase: 'CUT' }, recentLogs: [], isBeforeJuly20_2026: false };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.realityAdjusted).toBeUndefined();
    expect(session.exercises[0].recommendation.weight).toBe(20);
  });

  it('preferLower applied when isInCut=true', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 22 } }],
    };
    const ctx = { isInCut: true, readiness: { score: 80 }, user: { phase: 'CUT' }, recentLogs: [], isBeforeJuly20_2026: false };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.weight).toBe(20); // preferLower picks 20 not 25
  });

  it('holds weight when readiness < 60 AND recommendation > lastLog', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 25 } }],
    };
    const ctx = {
      isInCut: false,
      readiness: { score: 50 },
      user: { phase: 'CUT' },
      recentLogs: [{ logs: [{ ex: 'Lat Pulldown', w: 20 }] }],
      isBeforeJuly20_2026: false,
    };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.weight).toBe(20);
    expect(session.exercises[0].recommendation.heldDueToReadiness).toBe(true);
  });

  it('does NOT hold when readiness >= 60', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 25 } }],
    };
    const ctx = {
      isInCut: false,
      readiness: { score: 70 },
      user: { phase: 'CUT' },
      recentLogs: [{ logs: [{ ex: 'Lat Pulldown', w: 20 }] }],
      isBeforeJuly20_2026: false,
    };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.heldDueToReadiness).toBeUndefined();
    expect(session.exercises[0].recommendation.weight).toBe(25);
  });

  it('does NOT hold when readiness score is null', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 25 } }],
    };
    const ctx = {
      isInCut: false,
      readiness: { score: null },
      user: { phase: 'CUT' },
      recentLogs: [{ logs: [{ ex: 'Lat Pulldown', w: 20 }] }],
      isBeforeJuly20_2026: false,
    };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.heldDueToReadiness).toBeUndefined();
  });

  it('does NOT hold when recommendation <= lastLog (no increase)', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 15 } }],
    };
    const ctx = {
      isInCut: false,
      readiness: { score: 40 },
      user: { phase: 'CUT' },
      recentLogs: [{ logs: [{ ex: 'Lat Pulldown', w: 20 }] }],
      isBeforeJuly20_2026: false,
    };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.heldDueToReadiness).toBeUndefined();
    expect(session.exercises[0].recommendation.weight).toBe(15);
  });

  it('does NOT hold when no matching lastLog found', () => {
    const session = {
      exercises: [{ name: 'Lat Pulldown', recommendation: { weight: 25 } }],
    };
    const ctx = {
      isInCut: false,
      readiness: { score: 40 },
      user: { phase: 'CUT' },
      recentLogs: [{ logs: [{ ex: 'Other Exercise', w: 50 }] }],
      isBeforeJuly20_2026: false,
    };
    realityEngine.validate(session, ctx);
    expect(session.exercises[0].recommendation.heldDueToReadiness).toBeUndefined();
  });

  it('sets realityMessage when phase=AUTO and isBeforeJuly20_2026', () => {
    const session = { exercises: [] };
    const ctx = {
      isInCut: false,
      readiness: { score: 80 },
      user: { phase: 'AUTO' },
      recentLogs: [],
      isBeforeJuly20_2026: true,
    };
    realityEngine.validate(session, ctx);
    expect(session.realityMessage).toContain('2000');
    expect(session.suppressTrendMessages).toBe(true);
  });

  it('does NOT set realityMessage when phase != AUTO', () => {
    const session = { exercises: [] };
    const ctx = {
      isInCut: false,
      readiness: { score: 80 },
      user: { phase: 'CUT' },
      recentLogs: [],
      isBeforeJuly20_2026: true,
    };
    realityEngine.validate(session, ctx);
    expect(session.realityMessage).toBeUndefined();
  });

  it('does NOT set realityMessage when after July 20 2026', () => {
    const session = { exercises: [] };
    const ctx = {
      isInCut: false,
      readiness: { score: 80 },
      user: { phase: 'AUTO' },
      recentLogs: [],
      isBeforeJuly20_2026: false,
    };
    realityEngine.validate(session, ctx);
    expect(session.realityMessage).toBeUndefined();
  });
});

describe('getRealityCheck', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('returns fixed kcal message before July 20 2026 and no override', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    const result = getRealityCheck();
    expect(result).not.toBeNull();
    expect(result.type).toBe('fixed');
    expect(result.icon).toBe('✅');
    expect(result.message).toContain('2000');
    vi.useRealTimers();
  });

  it('skips fixed-period gate when phase-override set', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    // No weights data → returns null after gate skipped (dates.length<4)
    const result = getRealityCheck();
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it('returns null when fewer than 4 weigh-ins', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00Z')); // after target date
    localStorage.setItem('weights', JSON.stringify({
      '2026-07-21': 80,
      '2026-07-22': 79.8,
      '2026-07-23': 79.6,
    }));
    expect(getRealityCheck()).toBeNull();
    vi.useRealTimers();
  });

  it('returns plateau when 7+ days span with no decrease >0.05kg', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    // Same weight across 8 days with phase-override active so we bypass fixed gate
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    localStorage.setItem('weights', JSON.stringify({
      '2026-08-01': 80,
      '2026-08-03': 80.01,
      '2026-08-06': 79.98,
      '2026-08-08': 80.02,
      '2026-08-10': 80,
      '2026-08-12': 80.01,
      '2026-08-14': 80,
      '2026-08-15': 80.02,
    }));
    const result = getRealityCheck();
    expect(result).not.toBeNull();
    expect(result.type).toBe('plateau');
    expect(result.icon).toBe('🔴');
    expect(result.message).toContain('nu a scazut');
    vi.useRealTimers();
  });

  it('returns warning (too fast) when losing more than 1 kg/week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    // 8 weigh-ins descending fast — slope ~-0.5 kg/day → ~-3.5 kg/week
    localStorage.setItem('weights', JSON.stringify({
      '2026-08-01': 85,
      '2026-08-03': 84.5,
      '2026-08-05': 84,
      '2026-08-07': 83.5,
      '2026-08-09': 83,
      '2026-08-11': 82.5,
      '2026-08-13': 82,
      '2026-08-15': 81.5,
    }));
    const result = getRealityCheck();
    expect(result).not.toBeNull();
    expect(result.type).toBe('warning');
    expect(result.icon).toBe('⚡');
    expect(result.message).toContain('repede');
    vi.useRealTimers();
  });

  it('returns ok (in tinta) when -0.3 to -1 kg/week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    // ~0.5 kg/week → slope ~-0.07 kg/day
    localStorage.setItem('weights', JSON.stringify({
      '2026-08-01': 80,
      '2026-08-03': 79.86,
      '2026-08-05': 79.72,
      '2026-08-07': 79.58,
      '2026-08-09': 79.44,
      '2026-08-11': 79.3,
      '2026-08-13': 79.16,
      '2026-08-15': 79.02,
    }));
    const result = getRealityCheck();
    expect(result).not.toBeNull();
    expect(result.type).toBe('ok');
    expect(result.icon).toBe('✅');
    expect(result.message).toContain('ritmul');
    vi.useRealTimers();
  });

  it('returns slow when trend > -0.3 and >= 7 dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    // Loss too small + values decreasing slightly to avoid plateau (non-decreasing) detector
    // Need: spanDays>=7 AND NOT all-non-decreasing (so plateau skips) AND trend > -0.3
    // Use a small linear loss ~0.05 kg/day → ~0.35 kg/week loss... too fast for slow.
    // Try 0.02 kg/day → 0.14 kg/week loss → slope -0.02 → trend = -0.14 → >-0.3 → slow.
    localStorage.setItem('weights', JSON.stringify({
      '2026-08-01': 80.00,
      '2026-08-03': 79.96,
      '2026-08-05': 79.92,
      '2026-08-07': 79.88,
      '2026-08-09': 79.84,
      '2026-08-11': 79.80,
      '2026-08-13': 79.76,
      '2026-08-15': 79.72,
    }));
    const result = getRealityCheck();
    expect(result).not.toBeNull();
    expect(result.type).toBe('slow');
    expect(result.icon).toBe('🐢');
    vi.useRealTimers();
  });

  it('returns null when trend > -0.3 but < 7 dates (slow gate filters out)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    // Exactly 4 dates, small loss
    localStorage.setItem('weights', JSON.stringify({
      '2026-08-09': 80.00,
      '2026-08-11': 79.96,
      '2026-08-13': 79.92,
      '2026-08-15': 79.88,
    }));
    const result = getRealityCheck();
    // spanDays = 6, but at-most-7 path skips plateau. With 4 dates and slow trend it returns null
    // because trend>-0.3 && dates.length>=7 fails (dates.length=4), trend<=-0.3 fails, trend<-1 fails.
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it('returns null when malformed weights data (empty object)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    localStorage.setItem('weights', JSON.stringify({}));
    expect(getRealityCheck()).toBeNull();
    vi.useRealTimers();
  });

  it('returns null when no weights in localStorage', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'));
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    expect(getRealityCheck()).toBeNull();
    vi.useRealTimers();
  });

  // ── CRIT-2 timezone date comparison (code-review chat 5) ──────────────
  // tod() returns toLocaleDateString('sv') = local YYYY-MM-DD.
  // TARGET_DATE.toISOString().slice(0,10) returned UTC YYYY-MM-DD.
  // In Romania EEST (UTC+3) the 00:00-03:00 local window had local date
  // AHEAD of UTC date — comparison flagged phase=fixed off-by-one.
  // After fix: both sides use local format via todDate(TARGET_DATE).
  describe('TZ date comparison (CRIT-2 regression)', () => {
    it('returns fixed before TARGET_DATE — mid-day same-date local + UTC', () => {
      vi.useFakeTimers();
      // 2026-06-15 14:00 UTC = 2026-06-15 17:00 EEST — both sides agree
      vi.setSystemTime(new Date('2026-06-15T14:00:00Z'));
      const result = getRealityCheck();
      expect(result).not.toBeNull();
      expect(result.type).toBe('fixed');
      vi.useRealTimers();
    });

    it('returns fixed when local date AHEAD of UTC date (Romania 02:00 EEST eve)', () => {
      vi.useFakeTimers();
      // 2026-07-19 23:00 UTC = 2026-07-20 02:00 EEST.
      // Old behavior (broken): today_local='2026-07-20' compared against
      // UTC-formatted TARGET_DATE — depends on TARGET_DATE construction.
      // New behavior (fixed): both sides use local format, so today_local
      // < target_local correctly on date BEFORE TARGET_DATE_local.
      vi.setSystemTime(new Date('2026-07-19T23:00:00Z'));
      const result = getRealityCheck();
      // Before TARGET_DATE (2026-07-20) in local Romania → fixed expected
      // regardless of UTC date. Test machine TZ may vary — assert against
      // local-formatted today vs local-formatted TARGET_DATE invariant.
      const todayLocal = new Date().toLocaleDateString('sv');
      const targetLocal = new Date('2026-07-20').toLocaleDateString('sv');
      if (todayLocal < targetLocal) {
        expect(result).not.toBeNull();
        expect(result.type).toBe('fixed');
      } else {
        // Test machine TZ rolled us past TARGET_DATE locally — gate skipped,
        // no weights → null. Either way both comparison sides must agree.
        expect(result).toBeNull();
      }
      vi.useRealTimers();
    });

    it('skips fixed gate on/after TARGET_DATE local (Romania late EEST evening)', () => {
      vi.useFakeTimers();
      // 2026-07-20 22:00 UTC = 2026-07-21 01:00 EEST — well past TARGET_DATE
      // in every reasonable timezone the app runs in.
      vi.setSystemTime(new Date('2026-07-20T22:00:00Z'));
      // No weights → after gate skipped → null (dates.length<4)
      const result = getRealityCheck();
      expect(result).toBeNull();
      vi.useRealTimers();
    });

    it('both comparison sides use local format — invariant check', () => {
      // Post-fix invariant: at any point in time, the gate check must compare
      // local-format-today against local-format-TARGET_DATE consistently.
      // No UTC slice on right-hand side. Sample 4 wall-clock points across
      // a full UTC day to assert behavior matches local-format expectation.
      const samples = [
        new Date('2026-06-15T00:30:00Z'), // 03:30 EEST same date
        new Date('2026-06-15T08:00:00Z'), // 11:00 EEST same date
        new Date('2026-06-15T15:00:00Z'), // 18:00 EEST same date
        new Date('2026-06-15T23:30:00Z'), // 02:30 EEST NEXT date (in EEST)
      ];
      for (const t of samples) {
        vi.useFakeTimers();
        vi.setSystemTime(t);
        const result = getRealityCheck();
        const todayLocal = new Date().toLocaleDateString('sv');
        const targetLocal = new Date('2026-07-20').toLocaleDateString('sv');
        if (todayLocal < targetLocal) {
          expect(result).not.toBeNull();
          expect(result.type).toBe('fixed');
        }
        vi.useRealTimers();
      }
    });
  });
});
