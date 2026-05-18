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

import { getPatternsBanner } from '../../lib/engineWrappers';
import { detectGlobalStagnation } from '../../../engine/stagnationDetector.js';
import { getAdherenceScore } from '../../../engine/adherence.js';
import { useWorkoutStore } from '../../stores/workoutStore';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(detectGlobalStagnation).mockReturnValue({ maxStagnationWeeks: 0, byExercise: {} });
  vi.mocked(getAdherenceScore).mockReturnValue({ score: 75, color: 'var(--accent)', label: 'OK' });
  useWorkoutStore.setState({ sessionsHistory: [] });
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
    expect(banners[0].id).toBe('STAGNATION');
    expect(banners[0].severity).toBe('warn');
    expect(banners[0].text).toMatch(/3 saptamani/);
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
    expect(banners[0].id).toBe('LOW_ADHERENCE');
    expect(banners[0].severity).toBe('info');
    expect(banners[0].text).toMatch(/Adherenta scazuta/);
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
    expect(banners[0].id).toBe('STAGNATION');
    expect(banners[1].id).toBe('LOW_ADHERENCE');
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
});
