import { describe, it, expect, beforeEach } from 'vitest';
import { getNutritionTargetToday } from '../../lib/bayesianNutritionAggregate';
import { useNutritionStore } from '../../stores/nutritionStore';

beforeEach(() => {
  useNutritionStore.setState({ dailyLog: [] });
});

describe('getNutritionTargetToday', () => {
  it('returns baseline cand no manual log', () => {
    const r = getNutritionTargetToday('2026-05-17');
    expect(r).toEqual({ kcalTarget: 2640, proteinTarget: 180, source: 'baseline' });
  });

  it('returns manual override cand both kcal + protein logged', () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-17', kcal: 2200, protein: 160, ts: Date.now() }],
    });
    const r = getNutritionTargetToday('2026-05-17');
    expect(r).toEqual({ kcalTarget: 2200, proteinTarget: 160, source: 'manual' });
  });

  it('falls back baseline cand partial log (only kcal)', () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-17', kcal: 2200, protein: null, ts: Date.now() }],
    });
    const r = getNutritionTargetToday('2026-05-17');
    expect(r.source).toBe('baseline');
  });

  it('respects per-date lookup', () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-16', kcal: 2000, protein: 150, ts: Date.now() }],
    });
    const yesterday = getNutritionTargetToday('2026-05-16');
    const today = getNutritionTargetToday('2026-05-17');
    expect(yesterday.source).toBe('manual');
    expect(today.source).toBe('baseline');
  });
});
