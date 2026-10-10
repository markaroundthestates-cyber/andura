// plan_cache_v1 (founder 2026-10-10: "cache... dar si un mecanism de refresh ca sa nu
// arate date eronate dupa o modificare"). The plan is reused only while NOTHING it
// reads changed; any stored write, a session hint, a new day or 15 min recompose.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cachedPlan, invalidatePlanCache, PLAN_CACHE_TTL_MS } from '../../lib/planCache';
import { useWorkoutStore } from '../../stores/workoutStore';

describe('planCache', () => {
  let n = 0;
  const compose = vi.fn(async () => ({ sessionType: 'PUSH', exercises: [{ name: 'Machine Shoulder Press', run: ++n }] }));

  beforeEach(() => {
    n = 0;
    compose.mockClear();
    invalidatePlanCache();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 12, 8, 0));
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Lat Pulldown', w: 52, reps: 8, ts: 1 }]));
  });
  afterEach(() => vi.useRealTimers());

  it('nothing changed → one compose, every caller its own copy', async () => {
    const a = await cachedPlan('today|{}', compose);
    const b = await cachedPlan('today|{}', compose);
    expect(compose).toHaveBeenCalledTimes(1);
    expect(b).toEqual(a);
    a.exercises[0]!.name = 'mutated';
    expect((await cachedPlan('today|{}', compose)).exercises[0]!.name).toBe('Machine Shoulder Press');
  });

  it('concurrent pages share one compose', async () => {
    await Promise.all([cachedPlan('today|{}', compose), cachedPlan('today|{}', compose), cachedPlan('today|{}', compose)]);
    expect(compose).toHaveBeenCalledTimes(1);
  });

  it('any stored write (a logged set, a synced change) recomposes', async () => {
    await cachedPlan('today|{}', compose);
    localStorage.setItem('logs', JSON.stringify([{ ex: 'Lat Pulldown', w: 52, reps: 9, ts: 1 }]));
    await cachedPlan('today|{}', compose);
    expect(compose).toHaveBeenCalledTimes(2);
  });

  it('a session hint the plan reads (time budget) recomposes', async () => {
    await cachedPlan('today|{}', compose);
    useWorkoutStore.setState({ sessionTimeBudgetMin: 30 });
    await cachedPlan('today|{}', compose);
    expect(compose).toHaveBeenCalledTimes(2);
    useWorkoutStore.setState({ sessionTimeBudgetMin: null });
  });

  it('15 minutes or a new day recompose (recovery moves with the clock)', async () => {
    await cachedPlan('today|{}', compose);
    vi.setSystemTime(new Date(2026, 9, 12, 8, 0) .getTime() + PLAN_CACHE_TTL_MS + 1);
    await cachedPlan('today|{}', compose);
    expect(compose).toHaveBeenCalledTimes(2);
    vi.setSystemTime(new Date(2026, 9, 13, 0, 1));
    await cachedPlan('today|{}', compose);
    expect(compose).toHaveBeenCalledTimes(3);
  });

  it('different requests (another day, "alta grupa") never share an entry', async () => {
    await cachedPlan('today|{}', compose);
    await cachedPlan('today|{"differentMuscleCluster":"legs"}', compose);
    await cachedPlan('day|3', compose);
    expect(compose).toHaveBeenCalledTimes(3);
  });

  it('flag OFF → every read recomposes', async () => {
    localStorage.setItem('_devFlags', JSON.stringify({ plan_cache_v1: false }));
    await cachedPlan('today|{}', compose);
    await cachedPlan('today|{}', compose);
    expect(compose).toHaveBeenCalledTimes(2);
  });

  it('a failed compose is not kept', async () => {
    const boom = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue({ ok: 1 });
    await expect(cachedPlan('today|{}', boom)).rejects.toThrow('x');
    expect(await cachedPlan('today|{}', boom)).toEqual({ ok: 1 });
  });
});
