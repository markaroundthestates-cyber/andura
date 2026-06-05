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

  it('LOW_ADHERENCE banner cand weekly workout adherence low (sessions stale)', () => {
    // ≥3 sessions (gate) but none in the last 7 days → behind on a freq=4 plan.
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    const banners = getPatternsBanner();
    expect(banners).toHaveLength(1);
    expect(banners[0]!.id).toBe('LOW_ADHERENCE');
    expect(banners[0]!.severity).toBe('info');
    expect(banners[0]!.text).toMatch(/Adherenta scazuta/);
  });

  it('LOW_ADHERENCE banner NU triggered cand user trained on plan this week', () => {
    // default beforeEach = 3 recent sessions, target 4 → adherent.
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
  });

  it('LOW_ADHERENCE NU triggered for a gym-only user with no frequency plan (fail-safe)', () => {
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    useOnboardingStore.setState((s) => ({ data: { ...s.data, frequency: null } }));
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
  });

  it('both banners stacked cand both triggers active (STAGNATION first, LOW_ADHERENCE second)', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 4,
      byExercise: { 'Squat': 4 },
    });
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    const banners = getPatternsBanner();
    expect(banners).toHaveLength(2);
    expect(banners[0]!.id).toBe('STAGNATION');
    expect(banners[1]!.id).toBe('LOW_ADHERENCE');
  });

  it('defensive: stagnationDetector throws → graceful empty banner skip', () => {
    vi.mocked(detectGlobalStagnation).mockImplementation(() => {
      throw new Error('stagnation boom');
    });
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    const banners = getPatternsBanner();
    // STAGNATION skipped, LOW_ADHERENCE still emit
    expect(banners.find((b) => b.id === 'STAGNATION')).toBeUndefined();
    expect(banners.find((b) => b.id === 'LOW_ADHERENCE')).toBeDefined();
  });

  it('Gigel-friendly: LOW_ADHERENCE gated until ≥3 sessions logged', () => {
    // Fresh user with 0-2 sessions: even when behind, no banner.
    useWorkoutStore.setState({ sessionsHistory: [] });
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();

    useWorkoutStore.setState({ sessionsHistory: oldSessions(2) });
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();

    // User with ≥3 sessions (stale) → banner fires.
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeDefined();
  });

  it('defensive: adherence read throws → graceful empty banner skip', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 3,
      byExercise: { 'Bench Press': 3 },
    });
    useWorkoutStore.setState({ sessionsHistory: oldSessions(3) });
    vi.spyOn(useOnboardingStore, 'getState').mockImplementation(() => {
      throw new Error('onboarding boom');
    });
    const banners = getPatternsBanner();
    expect(banners.find((b) => b.id === 'STAGNATION')).toBeDefined();
    expect(banners.find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();
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
