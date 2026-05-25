/**
 * TASK #30.8 — renderIdle CDL-sourced banner + suppression
 * Tests: shouldShowPatternBanner, formatPatternMessage, ctx.patterns suppression flow
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

// ── Mock all heavy renderIdle dependencies ─────────────────────────────────
vi.mock('../../../db.js', () => ({
  DB: { get: vi.fn(() => null), set: vi.fn() },
  $: vi.fn(() => null),
  tod: vi.fn(() => '2026-04-26'),
  todDate: vi.fn(d => d.toISOString().slice(0, 10)),
  cleanEx: vi.fn(n => n || ''),
}));
vi.mock('../../../constants.js', () => ({
  PROG: Array(7).fill({ t: 'off', ex: [], day: 'Luni', lb: 'OFF' }),
  EX_SETS: {},
  COMPOUND_EX: [],
  KCAL_TARGET: 2000,
  PROT_TARGET: 150,
  TARGET_DATE: new Date('2026-07-20'),
}));
vi.mock('../../../engine/dp.js', () => ({
  DP: { recommend: vi.fn(() => ({ kg: 50, status: 'OK', statusColor: '#fff' })), getLogs: vi.fn(() => []) },
}));
vi.mock('../../../engine/aa.js', () => ({ AA: { applyTo: vi.fn(r => r) } }));
vi.mock('../../../engine/sys.js', () => ({
  SYS: { getOffDayQuest: vi.fn(() => ({ stepsToday: 0, streak: 0, totalDays: 0 })), getCurrentKg: vi.fn(() => 75) },
}));
vi.mock('../../../ui/ui.js', () => ({ toast: vi.fn() }));
vi.mock('../../../engine/fatigue.js', () => ({
  calculateFatigueScore: vi.fn(() => ({ color: '#fff', icon: '', label: 'OK', detail: '' })),
}));
vi.mock('../../../engine/readiness.js', () => ({
  getTodayReadiness: vi.fn(() => null),
  getReadinessVerdict: vi.fn(() => ({ color: '#fff', label: 'OK', volumeMultiplier: 1 })),
  getReadinessScore: vi.fn(() => 75),
  READINESS_LABELS: {
    1: { emoji: '😴', label: 'Slab' }, 2: { emoji: '😕', label: 'Mediu' },
    3: { emoji: '😐', label: 'Normal' }, 4: { emoji: '😊', label: 'Bun' }, 5: { emoji: '🔥', label: 'Excelent' },
  },
}));
vi.mock('../../../engine/patternLearning.js', () => ({
  analyzeAndApplyPatterns: vi.fn(),
  analyzeFromCDL: vi.fn(() => []),
}));
vi.mock('../../../util/coachDecisionLog.js', () => ({
  readAllActive: vi.fn(() => []),
  STORAGE_KEYS: { TIER_1: 'coach-decisions', TIER_2: 'coach-decisions-aggregate', TIER_3: 'coach-decisions-archive' },
  RESERVED_RATIONALE_IDS: { SYNTHETIC_BACKFILL: 'SYNTHETIC_BACKFILL', NO_PROPOSED: 'NO_PROPOSED', NO_RULE_FIRED: 'NO_RULE_FIRED' },
  writeProposed: vi.fn(() => ({ written: false })),
  populateOutcome: vi.fn(),
  readActiveForDate: vi.fn(() => null),
  demoteToTier2: vi.fn(),
  demoteToTier3: vi.fn(),
}));
vi.mock('../../../engine/coachDirector.js', () => ({
  coachDirector: {
    buildSession: vi.fn(async () => ({
      exercises: [],
      context: { patterns: [], patternsSuppressed: true },
      calibrationBanner: null,
      calibrationLevel: { displayName: 'INITIAL', patternsEnabled: true, patternMinConfidence: 0.6 },
    })),
  },
}));
vi.mock('../state.js', () => ({
  sessionCache: { get: vi.fn(() => null), set: vi.fn(), invalidate: vi.fn() },
  setCachedDirector: vi.fn(),
  uiToggleFlags: { exListExpanded: {}, prWallExpanded: false },
}));
vi.mock('../util.js', () => ({
  formatSetsReps: vi.fn(() => ''),
  getGroupColor: vi.fn(() => '#fff'),
  getDisplayTime: vi.fn(() => ''),
  isInCutPhase: vi.fn(() => false),
}));
vi.mock('../pr.js', () => ({ renderPRWall: vi.fn() }));

import { shouldShowPatternBanner, formatPatternMessage } from '../renderIdle.js';
import * as patternLearning from '../../../engine/patternLearning.js';
import * as cdl from '../../../util/coachDecisionLog.js';

// ── Tests 1–5: shouldShowPatternBanner ────────────────────────────────────

describe('shouldShowPatternBanner', () => {
  it('1. returns false when ctx === null', () => {
    expect(shouldShowPatternBanner(null)).toBe(false);
  });

  it('2. returns false when ctx.patternsSuppressed === true even with non-empty patterns', () => {
    const ctx = { patternsSuppressed: true, patterns: [{ type: 'LOW_ADHERENCE', adherenceRate: 35 }] };
    expect(shouldShowPatternBanner(ctx)).toBe(false);
  });

  it('3. returns false when ctx.patterns is not an array', () => {
    expect(shouldShowPatternBanner({ patternsSuppressed: false, patterns: null })).toBe(false);
    expect(shouldShowPatternBanner({ patternsSuppressed: false, patterns: 'bad' })).toBe(false);
    expect(shouldShowPatternBanner({ patternsSuppressed: false, patterns: undefined })).toBe(false);
  });

  it('4. returns false when ctx.patterns === []', () => {
    expect(shouldShowPatternBanner({ patternsSuppressed: false, patterns: [] })).toBe(false);
  });

  it('5. returns true when patterns.length > 0 and patternsSuppressed !== true', () => {
    const ctx = { patternsSuppressed: false, patterns: [{ type: 'LOW_ADHERENCE', adherenceRate: 40 }] };
    expect(shouldShowPatternBanner(ctx)).toBe(true);
  });
});

// ── Tests 6–12: formatPatternMessage ─────────────────────────────────────

describe('formatPatternMessage', () => {
  it('6. LOW_ADHERENCE: output contains adherenceRate', () => {
    const msg = formatPatternMessage({ type: 'LOW_ADHERENCE', adherenceRate: 35 });
    expect(msg).not.toBeNull();
    expect(msg).toContain('35%');
  });

  it('7. HIGH_DEVIATION: output contains deviationRate', () => {
    const msg = formatPatternMessage({ type: 'HIGH_DEVIATION', deviationRate: 45 });
    expect(msg).not.toBeNull();
    expect(msg).toContain('45%');
  });

  it('8. EARLY_END: output contains earlyEndRate', () => {
    const msg = formatPatternMessage({ type: 'EARLY_END', earlyEndRate: 50 });
    expect(msg).not.toBeNull();
    expect(msg).toContain('50%');
  });

  it('9. STAGNATION: output contains exercises count', () => {
    const msg = formatPatternMessage({ type: 'STAGNATION', exercises: ['Bench', 'Squat', 'Deadlift'] });
    expect(msg).not.toBeNull();
    expect(msg).toContain('3');
  });

  it('10. Unknown pattern type returns null and calls console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = formatPatternMessage({ type: 'UNKNOWN_TYPE' });
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('[renderIdle] Unknown pattern type:', 'UNKNOWN_TYPE');
    warnSpy.mockRestore();
  });

  it('11. SKIP_DAY pattern throws Error (deprecated assertion)', () => {
    expect(() => formatPatternMessage({ type: 'SKIP_DAY', day: 'Marti', skipRate: 88 }))
      .toThrow('SKIP_DAY pattern is deprecated');
  });

  it('12. Pattern without type returns null', () => {
    expect(formatPatternMessage(null)).toBeNull();
    expect(formatPatternMessage({})).toBeNull();
    expect(formatPatternMessage({ adherenceRate: 35 })).toBeNull();
  });
});

// ── Tests 13–16: ctx.patterns suppression flow (via coachContext) ─────────

describe('ctx.patterns suppression flow', () => {
  afterEach(() => {
    vi.mocked(cdl.readAllActive).mockReturnValue([]);
    vi.mocked(patternLearning.analyzeFromCDL).mockReturnValue([]);
  });

  it('13. realCDLCount === 0 → patternsSuppressed === true, patterns === []', async () => {
    vi.mocked(cdl.readAllActive).mockReturnValue([]);

    const { buildCoachContext } = await import('../../../engine/coachContext.js');
    const ctx = buildCoachContext();

    expect(ctx.realCDLCount).toBe(0);
    expect(ctx.patternsSuppressed).toBe(true);
    expect(ctx.patterns).toEqual([]);
  });

  it('14. realCDLCount === 2 (below 3) → patternsSuppressed === true, patterns === []', async () => {
    const entries = [
      { id: 'r1', date: '2026-04-10', synthetic: false, superseded: false,
        outcome: { executed: true, deviation: false } },
      { id: 'r2', date: '2026-04-11', synthetic: false, superseded: false,
        outcome: { executed: true, deviation: false } },
    ];
    vi.mocked(cdl.readAllActive).mockImplementation(filterFn =>
      filterFn ? entries.filter(filterFn) : entries
    );

    const { buildCoachContext } = await import('../../../engine/coachContext.js');
    const ctx = buildCoachContext();

    expect(ctx.realCDLCount).toBe(2);
    expect(ctx.patternsSuppressed).toBe(true);
    expect(ctx.patterns).toEqual([]);
  });

  it('15. realCDLCount === 5 → patternsSuppressed === false, patterns from analyzeFromCDL', async () => {
    const mockPatterns = [{ type: 'LOW_ADHERENCE', adherenceRate: 30, appliedAt: Date.now() }];
    vi.mocked(patternLearning.analyzeFromCDL).mockReturnValue(mockPatterns);

    const entries = Array.from({ length: 5 }, (_, i) => ({
      id: `r${i}`, date: `2026-04-1${i}`, synthetic: false, superseded: false,
      outcome: { executed: true, deviation: false },
    }));
    vi.mocked(cdl.readAllActive).mockImplementation(filterFn =>
      filterFn ? entries.filter(filterFn) : entries
    );

    const { buildCoachContext } = await import('../../../engine/coachContext.js');
    const ctx = buildCoachContext();

    expect(ctx.realCDLCount).toBe(5);
    expect(ctx.patternsSuppressed).toBe(false);
    // patterns should contain mockPatterns with derived confidence added
    expect(ctx.patterns.length).toBe(mockPatterns.length);
    expect(ctx.patterns[0].type).toBe('LOW_ADHERENCE');
    expect(typeof ctx.patterns[0].confidence).toBe('number');
  });

  it('16. Synthetic-only entries → realCDLCount === 0 → suppressed', async () => {
    const syntheticEntries = [
      { id: 's1', date: '2026-04-01', synthetic: true, superseded: false,
        outcome: { executed: true } },
      { id: 's2', date: '2026-04-02', synthetic: true, superseded: false,
        outcome: { executed: true } },
    ];
    vi.mocked(cdl.readAllActive).mockImplementation(filterFn =>
      filterFn ? syntheticEntries.filter(filterFn) : syntheticEntries
    );

    const { buildCoachContext } = await import('../../../engine/coachContext.js');
    const ctx = buildCoachContext();

    expect(ctx.realCDLCount).toBe(0);
    expect(ctx.patternsSuppressed).toBe(true);
    expect(ctx.patterns).toEqual([]);
  });
});
