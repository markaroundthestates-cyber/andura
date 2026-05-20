// Phase 5 task_07 → Phase 6 task_04 — async real wire BN engine consumer.
// Per DECISIONS.md §D027 cascade. Engine output mocked via engineWrappers
// getNutritionTargetsToday (BN async wrapper task_03).
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/engineWrappers', () => ({
  getNutritionTargetsToday: vi.fn(async () => ({
    kcalTarget: 2640,
    proteinTargetG: 180,
    fatG: 70,
    carbsG: 280,
    source: 'baseline',
    confidence: 0,
  })),
}));

import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import { useNutritionStore } from '../../stores/nutritionStore';
import { getNutritionTargetsToday } from '../../lib/engineWrappers';

beforeEach(() => {
  useNutritionStore.setState({ dailyLog: [] });
  vi.clearAllMocks();
  vi.mocked(getNutritionTargetsToday).mockResolvedValue({
    kcalTarget: 2640,
    proteinTargetG: 180,
    fatG: 70,
    carbsG: 280,
    source: 'baseline',
    confidence: 0,
  });
});

describe('getNutritionTargetTodayReal — async real wire', () => {
  it('returns baseline cand no manual log + engine returns baseline source', async () => {
    const r = await getNutritionTargetTodayReal('2026-05-17');
    expect(r.source).toBe('baseline');
    expect(r.kcalTarget).toBe(2640);
    expect(r.proteinTarget).toBe(180);
    expect(r.confidence).toBe(0);
  });

  it('returns manual override cand both kcal + protein logged', async () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-17', kcal: 2200, protein: 160, ts: Date.now() }],
    });
    const r = await getNutritionTargetTodayReal('2026-05-17');
    expect(r.source).toBe('manual');
    expect(r.kcalTarget).toBe(2200);
    expect(r.proteinTarget).toBe(160);
    expect(r.confidence).toBe(1);
  });

  it('falls back engine cand partial log (only kcal, missing protein)', async () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-17', kcal: 2200, protein: null, ts: Date.now() }],
    });
    const r = await getNutritionTargetTodayReal('2026-05-17');
    expect(r.source).toBe('baseline'); // engine returns baseline source per mock
    expect(r.kcalTarget).toBe(2640);
  });

  it('respects per-date lookup', async () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-16', kcal: 2000, protein: 150, ts: Date.now() }],
    });
    const yesterday = await getNutritionTargetTodayReal('2026-05-16');
    const today = await getNutritionTargetTodayReal('2026-05-17');
    expect(yesterday.source).toBe('manual');
    expect(today.source).toBe('baseline');
  });

  it('source mapping: engine source "engine" → "engine-bn"', async () => {
    vi.mocked(getNutritionTargetsToday).mockResolvedValueOnce({
      kcalTarget: 2850,
      proteinTargetG: 180,
      fatG: 70,
      carbsG: 280,
      source: 'engine',
      confidence: 1,
    });
    const r = await getNutritionTargetTodayReal('2026-05-17');
    expect(r.source).toBe('engine-bn');
    expect(r.kcalTarget).toBe(2850);
    expect(r.confidence).toBe(1);
  });

  it('confidence propagates from engine wrapper', async () => {
    vi.mocked(getNutritionTargetsToday).mockResolvedValueOnce({
      kcalTarget: 2700,
      proteinTargetG: 180,
      fatG: 70,
      carbsG: 280,
      source: 'engine',
      confidence: 0.5,
    });
    const r = await getNutritionTargetTodayReal('2026-05-17');
    expect(r.confidence).toBe(0.5);
  });

  it('async signature awaits properly (Promise return)', () => {
    const result = getNutritionTargetTodayReal('2026-05-17');
    expect(result).toBeInstanceOf(Promise);
  });

  it('manual log priority preserves invariant even cand engine emits higher confidence', async () => {
    useNutritionStore.setState({
      dailyLog: [{ dateISO: '2026-05-17', kcal: 2200, protein: 160, ts: Date.now() }],
    });
    vi.mocked(getNutritionTargetsToday).mockResolvedValueOnce({
      kcalTarget: 3000,
      proteinTargetG: 200,
      fatG: 70,
      carbsG: 280,
      source: 'engine',
      confidence: 1,
    });
    const r = await getNutritionTargetTodayReal('2026-05-17');
    expect(r.source).toBe('manual');
    expect(r.kcalTarget).toBe(2200); // manual wins
  });

  it('userState pass-through to engine wrapper', async () => {
    const userState = { user: { age: 30 } };
    await getNutritionTargetTodayReal('2026-05-17', userState);
    expect(getNutritionTargetsToday).toHaveBeenCalledWith(userState);
  });
});
