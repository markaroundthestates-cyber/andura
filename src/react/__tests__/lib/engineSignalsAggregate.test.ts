// Phase 5 task_10 → Phase 6 task_08 — engineSignalsAggregate real wire.
// adherenceScore now consume real getAdherenceOutput wrapper (NU hardcoded
// BASELINE_ADHERENCE 50 proxy).
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
  getAdherenceOutput: vi.fn(() => ({ score: 50, source: 'baseline' as const })),
}));

import { getEngineSignals } from '../../lib/engineSignalsAggregate';
import { getReadiness, getFatigue, getAdherenceOutput } from '../../lib/engineWrappers';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getReadiness).mockReturnValue(null);
  vi.mocked(getFatigue).mockReturnValue(null);
  vi.mocked(getAdherenceOutput).mockReturnValue({ score: 50, source: 'baseline' });
});

describe('getEngineSignals', () => {
  it('returns baseline cand toate engines return null/baseline', () => {
    const s = getEngineSignals();
    expect(s.vitalityScore).toBe(50);
    expect(s.adherenceScore).toBe(50);
    expect(s.energyDirection).toBe('flat');
    expect(s.source).toBe('baseline');
  });

  it('energyDirection=up cand readiness score >= 80', () => {
    vi.mocked(getReadiness).mockReturnValueOnce({
      score: 85,
      label: 'Zi de PR',
      color: 'var(--green)',
      volumeMultiplier: 1.1,
      canPR: true,
    });
    const s = getEngineSignals();
    expect(s.energyDirection).toBe('up');
    expect(s.source).toBe('engine');
  });

  it('energyDirection=down cand readiness score < 50', () => {
    vi.mocked(getReadiness).mockReturnValueOnce({
      score: 35,
      label: 'Sesiune usoara',
      color: 'var(--accent3)',
      volumeMultiplier: 0.7,
      canPR: false,
    });
    const s = getEngineSignals();
    expect(s.energyDirection).toBe('down');
  });

  it('vitalityScore = 100 - fatigue score', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 30,
      key: 'MODERATE_FATIGUE',
      label: 'Pas mai conservator',
      icon: '',
      color: '',
      recommend: 'reduce',
      detail: '',
    });
    const s = getEngineSignals();
    expect(s.vitalityScore).toBe(70);
    expect(s.source).toBe('engine');
  });

  it('vitalityScore clamped la 0-100 range', () => {
    vi.mocked(getFatigue).mockReturnValueOnce({
      score: 150,
      key: 'HIGH_FATIGUE',
      label: '',
      icon: '',
      color: '',
      recommend: 'deload',
      detail: '',
    });
    const s = getEngineSignals();
    expect(s.vitalityScore).toBe(0);
  });

  it('adherenceScore propagates din getAdherenceOutput engine', () => {
    vi.mocked(getAdherenceOutput).mockReturnValueOnce({ score: 85, source: 'engine' });
    const s = getEngineSignals();
    expect(s.adherenceScore).toBe(85);
    expect(s.source).toBe('engine');
  });

  it('adherenceScore baseline cand engine fallback (source baseline)', () => {
    vi.mocked(getAdherenceOutput).mockReturnValueOnce({ score: 50, source: 'baseline' });
    const s = getEngineSignals();
    expect(s.adherenceScore).toBe(50);
    expect(s.source).toBe('baseline');
  });

  it('source="engine" cand any composer non-baseline', () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    vi.mocked(getAdherenceOutput).mockReturnValueOnce({ score: 90, source: 'engine' });
    const s = getEngineSignals();
    expect(s.source).toBe('engine');
  });

  it('source="baseline" cand all composers baseline', () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    vi.mocked(getFatigue).mockReturnValueOnce(null);
    vi.mocked(getAdherenceOutput).mockReturnValueOnce({ score: 50, source: 'baseline' });
    const s = getEngineSignals();
    expect(s.source).toBe('baseline');
  });
});
