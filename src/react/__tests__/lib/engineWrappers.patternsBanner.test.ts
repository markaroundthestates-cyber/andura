// Phase 6 task_05 — getPatternsBanner Option B composer tests.
// Pure-function engines wire (detectGlobalStagnation + weekly workout adherence)
// NU CoachDirector.buildSession heavyweight side-effects pollution.
//
// LOW_ADHERENCE rewired 2026-06-05 (Daniel P0): the banner now measures WEEKLY
// WORKOUT adherence (sessions in the rolling 7-day window vs the frequency
// target) instead of the nutrition-weighted daily getAdherenceScore — a gym-only
// user who trains as planned must never read "low adherence".

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setLocale, _resetI18nCache } from '../../../i18n/index.js';

vi.mock('../../../engine/stagnationDetector.js', () => ({
  detectGlobalStagnation: vi.fn(() => ({ maxStagnationWeeks: 0, byExercise: {} })),
}));

// adherence.js is still imported by engineWrappers (other adapters) — mock it so
// no real DB access leaks in. getPatternsBanner itself no longer calls it.
vi.mock('../../../engine/adherence.js', () => ({
  getAdherenceScore: vi.fn(() => ({ score: 75, color: 'var(--accent)', label: 'OK' })),
}));

import {
  getPatternsBanner,
  isLowWeeklyWorkoutAdherence,
  STAGNATION_WEEKS_THRESHOLD,
} from '../../lib/engineWrappers';
import { detectGlobalStagnation } from '../../../engine/stagnationDetector.js';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();
const RECENT = NOW - DAY; // inside the rolling 7-day window
const OLD = NOW - 30 * DAY; // outside the window

// 3 recent sessions clear the gate AND meet a freq=4 target (3 >= ceil(4/2)=2)
// → adherent by default; low-adherence specs override with OLD/sparse sessions.
function recentSessions(n: number) {
  return Array.from({ length: n }, (_, i) => ({ ts: RECENT - i * 1000, title: `s${i}`, meta: '' }));
}
function oldSessions(n: number) {
  return Array.from({ length: n }, (_, i) => ({ ts: OLD - i * 1000, title: `s${i}`, meta: '' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  // The banner text now resolves via t(); these specs assert the RO wording,
  // so pin RO locale (default locale is EN post 2026-05-28).
  setLocale('ro');
  _resetI18nCache();
  setLocale('ro');
  vi.mocked(detectGlobalStagnation).mockReturnValue({ maxStagnationWeeks: 0, byExercise: {} });
  // Default: a user training on plan → 3 recent sessions, frequency target 4.
  useWorkoutStore.setState({ sessionsHistory: recentSessions(3) });
  useOnboardingStore.getState().setField('frequency', '4');
});

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  vi.restoreAllMocks();
});

describe('engineWrappers — isLowWeeklyWorkoutAdherence (pure weekly workout rule)', () => {
  it('low when sessions in the last 7 days < half the frequency target', () => {
    // target 4 → need >= 2 in the window; 1 recent → low.
    expect(isLowWeeklyWorkoutAdherence([RECENT], 4, NOW)).toBe(true);
    expect(isLowWeeklyWorkoutAdherence([], 4, NOW)).toBe(true);
  });

  it('NOT low when sessions in the window meet half the target', () => {
    expect(isLowWeeklyWorkoutAdherence([RECENT, RECENT - 1000], 4, NOW)).toBe(false);
    expect(isLowWeeklyWorkoutAdherence([RECENT, RECENT - 1000, RECENT - 2000], 4, NOW)).toBe(false);
  });

  it('old sessions outside the 7-day window do NOT count', () => {
    expect(isLowWeeklyWorkoutAdherence([OLD, OLD - 1000, OLD - 2000], 4, NOW)).toBe(true);
  });

  it('fail-safe: no / invalid frequency target → never low (do not nag without a plan)', () => {
    expect(isLowWeeklyWorkoutAdherence([], NaN, NOW)).toBe(false);
    expect(isLowWeeklyWorkoutAdherence([], 0, NOW)).toBe(false);
  });
});

describe('engineWrappers — getPatternsBanner Option B composer', () => {
  it('returns [] cand user adherent (recent sessions on plan) + no stagnation', () => {
    expect(getPatternsBanner()).toEqual([]);
  });

  it('STAGNATION banner cand maxStagnationWeeks >= 2 (threshold)', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 3,
      byExercise: { 'Bench Press': 3 },
    });
    const banners = getPatternsBanner();
    expect(banners).toHaveLength(1);
    expect(banners[0]!.id).toBe('STAGNATION');
    expect(banners[0]!.severity).toBe('warn');
    expect(banners[0]!.text).toMatch(/3 saptamani/);
  });

  it('STAGNATION banner NU triggered cand maxStagnationWeeks < 2', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 1,
      byExercise: {},
    });
    expect(getPatternsBanner()).toEqual([]);
  });

  // LOW_ADHERENCE banner removed 2026-06-13 (owner P0: paternalistic/nagging).
  // The composer must NEVER emit a LOW_ADHERENCE banner now, even when the
  // underlying weekly-adherence signal is low. The engine signal itself stays
  // available via the pure isLowWeeklyWorkoutAdherence function (tested above).
  it('LOW_ADHERENCE banner NEVER emitted even when weekly workout adherence is low (invisibility guarantee)', () => {
    // ≥3 stale sessions on a freq=4 plan → signal is low, but NO banner.
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    // Confirm the engine signal IS low for this exact input (the invisibility
    // is intentional suppression, not an absent signal).
    expect(
      isLowWeeklyWorkoutAdherence(oldSessions(3).map((s) => s.ts), 4, NOW),
    ).toBe(true);
    const banners = getPatternsBanner();
    expect(banners.find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
    // No stagnation mocked → composer returns no banners at all.
    expect(banners).toEqual([]);
  });

  it('LOW_ADHERENCE never emitted across session-count / frequency variations', () => {
    // Fresh, partial, and ≥3-stale users — all must never surface the banner.
    for (const history of [[], oldSessions(2), oldSessions(3), oldSessions(5)]) {
      useWorkoutStore.setState({ sessionsHistory: history });
      expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
    }
    // Gym-only user with no frequency plan: still never.
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    useOnboardingStore.setState((s) => ({ data: { ...s.data, frequency: null } }));
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
  });

  it('only STAGNATION emits cand its trigger active (LOW_ADHERENCE gone)', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 4,
      byExercise: { 'Squat': 4 },
    });
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    const banners = getPatternsBanner();
    expect(banners).toHaveLength(1);
    expect(banners[0]!.id).toBe('STAGNATION');
    expect(banners.find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
  });

  it('defensive: stagnationDetector throws → graceful empty banner skip', () => {
    vi.mocked(detectGlobalStagnation).mockImplementation(() => {
      throw new Error('stagnation boom');
    });
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    const banners = getPatternsBanner();
    // STAGNATION skipped → empty (LOW_ADHERENCE no longer emitted at all).
    expect(banners).toEqual([]);
  });

  it('text wording NO_DIACRITICS_RULE compliance', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 5,
      byExercise: {},
    });
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    const banners = getPatternsBanner();
    banners.forEach((b) => {
      expect(/[ăâîșțĂÂÎȘȚ]/.test(b.text)).toBe(false);
    });
  });

  it('flattens sessionsHistory exercises sets to logs shape (engine input contract)', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '4 seturi · 50 min · 12000 kg',
          ts: 1234567890,
          exercises: [
            {
              exerciseId: 'bench-press',
              exerciseName: 'Bench Press',
              sets: [
                { kg: 100, reps: 5, rating: 'potrivit', timestamp: 1234567000 },
                { kg: 100, reps: 5, rating: 'potrivit', timestamp: 1234567100 },
              ],
              totalVolume: 1000,
              peakOneRM: 116.7,
            },
          ],
        },
      ],
    });
    getPatternsBanner();
    expect(detectGlobalStagnation).toHaveBeenCalledTimes(1);
    const passedLogs = vi.mocked(detectGlobalStagnation).mock.calls[0]?.[0];
    expect(passedLogs).toHaveLength(2);
    expect(passedLogs?.[0]).toEqual({
      ex: 'Bench Press',
      ts: 1234567000,
      w: 100,
      reps: 5,
    });
  });

  // MED-CODE-24 fix: exported constant invariant + use-site consistency
  // (anti-drift guard). Prior magic-number `2` scattered across STAGNATION
  // banner gate + lagging coach copy → single shared rule now.
  it('STAGNATION_WEEKS_THRESHOLD exported constant = 2 (business rule invariant)', () => {
    expect(STAGNATION_WEEKS_THRESHOLD).toBe(2);
  });

  it('STAGNATION banner gate uses STAGNATION_WEEKS_THRESHOLD (no magic number)', () => {
    // Boundary: maxStagnationWeeks === THRESHOLD → banner fires
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: STAGNATION_WEEKS_THRESHOLD,
      byExercise: {},
    });
    expect(getPatternsBanner().find((b) => b.id === 'STAGNATION')).toBeDefined();

    // Below threshold → no banner
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: STAGNATION_WEEKS_THRESHOLD - 1,
      byExercise: {},
    });
    expect(getPatternsBanner().find((b) => b.id === 'STAGNATION')).toBeUndefined();
  });
});
