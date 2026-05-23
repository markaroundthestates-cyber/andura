// Phase 6 task_05 — getPatternsBanner Option B composer tests.
// Pure-function engines wire (detectGlobalStagnation + getAdherenceScore)
// NU CoachDirector.buildSession heavyweight side-effects pollution.

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../engine/stagnationDetector.js', () => ({
  detectGlobalStagnation: vi.fn(() => ({ maxStagnationWeeks: 0, byExercise: {} })),
}));

vi.mock('../../../engine/adherence.js', () => ({
  getAdherenceScore: vi.fn(() => ({ score: 75, color: 'var(--accent)', label: 'OK' })),
}));

import {
  getPatternsBanner,
  STAGNATION_WEEKS_THRESHOLD,
} from '../../lib/engineWrappers';
import { detectGlobalStagnation } from '../../../engine/stagnationDetector.js';
import { getAdherenceScore } from '../../../engine/adherence.js';
import { useWorkoutStore } from '../../stores/workoutStore';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(detectGlobalStagnation).mockReturnValue({ maxStagnationWeeks: 0, byExercise: {} });
  vi.mocked(getAdherenceScore).mockReturnValue({ score: 75, color: 'var(--accent)', label: 'OK' });
  // Seed 3 dummy sessions to pass LOW_ADHERENCE gate. Tests that target the
  // fresh-user gate override sessionsHistory inside the it() block.
  useWorkoutStore.setState({
    sessionsHistory: [
      { ts: 1, title: 's1', meta: '' },
      { ts: 2, title: 's2', meta: '' },
      { ts: 3, title: 's3', meta: '' },
    ],
  });
});

describe('engineWrappers — getPatternsBanner Option B composer', () => {
  it('returns [] cand empty sessionsHistory + adherence>=50', () => {
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

  it('LOW_ADHERENCE banner cand score < 50', () => {
    vi.mocked(getAdherenceScore).mockReturnValue({ score: 35, color: 'var(--accent2)', label: 'Slab' });
    const banners = getPatternsBanner();
    expect(banners).toHaveLength(1);
    expect(banners[0]!.id).toBe('LOW_ADHERENCE');
    expect(banners[0]!.severity).toBe('info');
    expect(banners[0]!.text).toMatch(/Adherenta scazuta/);
  });

  it('LOW_ADHERENCE banner NU triggered cand score >= 50', () => {
    vi.mocked(getAdherenceScore).mockReturnValue({ score: 60, color: 'var(--accent)', label: 'OK' });
    expect(getPatternsBanner()).toEqual([]);
  });

  it('both banners stacked cand both triggers active (STAGNATION first, LOW_ADHERENCE second)', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 4,
      byExercise: { 'Squat': 4 },
    });
    vi.mocked(getAdherenceScore).mockReturnValue({ score: 30, color: 'var(--accent2)', label: 'Slab' });
    const banners = getPatternsBanner();
    expect(banners).toHaveLength(2);
    expect(banners[0]!.id).toBe('STAGNATION');
    expect(banners[1]!.id).toBe('LOW_ADHERENCE');
  });

  it('defensive: stagnationDetector throws → graceful empty banner skip', () => {
    vi.mocked(detectGlobalStagnation).mockImplementation(() => {
      throw new Error('stagnation boom');
    });
    vi.mocked(getAdherenceScore).mockReturnValue({ score: 30, color: 'r', label: 'Slab' });
    const banners = getPatternsBanner();
    // STAGNATION skipped, LOW_ADHERENCE still emit
    expect(banners.find((b) => b.id === 'STAGNATION')).toBeUndefined();
    expect(banners.find((b) => b.id === 'LOW_ADHERENCE')).toBeDefined();
  });

  it('Gigel-friendly: LOW_ADHERENCE gated until ≥3 sessions logged', () => {
    // Fresh user with 0-2 sessions: even with low adherence score, no banner
    vi.mocked(getAdherenceScore).mockReturnValue({ score: 10, color: 'r', label: 'Slab' });
    useWorkoutStore.setState({ sessionsHistory: [] });
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();

    useWorkoutStore.setState({
      sessionsHistory: [
        { ts: 1, title: 's', meta: '' },
        { ts: 2, title: 's', meta: '' },
      ],
    });
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeUndefined();

    // User with ≥3 sessions: banner fires
    useWorkoutStore.setState({
      sessionsHistory: [
        { ts: 1, title: 's', meta: '' },
        { ts: 2, title: 's', meta: '' },
        { ts: 3, title: 's', meta: '' },
      ],
    });
    expect(getPatternsBanner().find((b) => b.id === 'LOW_ADHERENCE')).toBeDefined();
  });

  it('defensive: adherence throws → graceful empty banner skip', () => {
    vi.mocked(detectGlobalStagnation).mockReturnValue({
      maxStagnationWeeks: 3,
      byExercise: { 'Bench Press': 3 },
    });
    vi.mocked(getAdherenceScore).mockImplementation(() => {
      throw new Error('adherence boom');
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
    vi.mocked(getAdherenceScore).mockReturnValue({ score: 10, color: 'r', label: 'Slab' });
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
