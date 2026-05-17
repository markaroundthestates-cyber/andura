import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
}));

import { getEngineSignals } from '../../lib/engineSignalsAggregate';
import { getReadiness, getFatigue } from '../../lib/engineWrappers';

describe('getEngineSignals', () => {
  it('returns baseline cand engines return null', () => {
    vi.mocked(getReadiness).mockReturnValueOnce(null);
    vi.mocked(getFatigue).mockReturnValueOnce(null);
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
      score: 150, // out of range
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
});
