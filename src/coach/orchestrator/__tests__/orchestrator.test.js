import { describe, it, expect, vi } from 'vitest';
import { runPipeline } from '../index.js';
import { ok, err, isOk } from '../result.js';

const ctx = Object.freeze({
  user: { id: 'u1' },
  recentSessions: [],
  weights: {},
  profileTier: 'T1',
  flags: {},
  meta: {},
});

const okAdapter = (id, output) => ({
  id,
  invoke: vi.fn(async () => ok(output)),
});

const errAdapter = (id, code, message) => ({
  id,
  invoke: vi.fn(async () => err({ code, message })),
});

const throwingAdapter = (id, msg = 'kaboom') => ({
  id,
  invoke: vi.fn(async () => { throw new Error(msg); }),
});

describe('runPipeline — ADR 030 D1+D4 sequential pipeline §42.10', () => {
  it('returns empty when adapters list is missing or non-array', async () => {
    expect(await runPipeline(ctx)).toEqual([]);
    expect(await runPipeline(ctx, null)).toEqual([]);
    expect(await runPipeline(ctx, 'not-array')).toEqual([]);
  });

  it('invokes adapters in order with the same context', async () => {
    const a = okAdapter('a', { v: 1 });
    const b = okAdapter('b', { v: 2 });
    const results = await runPipeline(ctx, [a, b]);
    expect(results.length).toBe(2);
    expect(isOk(results[0]) && results[0].output).toEqual({ v: 1 });
    expect(isOk(results[1]) && results[1].output).toEqual({ v: 2 });
    expect(a.invoke).toHaveBeenCalledWith(ctx);
    expect(b.invoke).toHaveBeenCalledWith(ctx);
  });

  it('preserves err result și tags adapterId când missing', async () => {
    const a = errAdapter('engine-a', 'BAD_INPUT', 'shape wrong');
    const results = await runPipeline(ctx, [a]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('BAD_INPUT');
    expect(results[0].error.adapterId).toBe('engine-a');
  });

  it('does NOT overwrite adapterId când adapter included it explicit', async () => {
    const a = {
      id: 'engine-a',
      invoke: async () => err({ code: 'X', message: 'm', adapterId: 'inner-id' }),
    };
    const results = await runPipeline(ctx, [a]);
    expect(results[0].error.adapterId).toBe('inner-id');
  });

  it('captures throwing adapter ca ADAPTER_THREW err (D4 violation defense)', async () => {
    const t = throwingAdapter('engine-t', 'oops');
    const results = await runPipeline(ctx, [t]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.message).toBe('oops');
    expect(results[0].error.adapterId).toBe('engine-t');
    expect(results[0].error.cause).toBeInstanceOf(Error);
  });

  it('continues după err (V1 default — Q-OPEN-6 graceful)', async () => {
    const a = errAdapter('a', 'X', 'm');
    const b = okAdapter('b', { ok: true });
    const results = await runPipeline(ctx, [a, b]);
    expect(results.length).toBe(2);
    expect(results[0].ok).toBe(false);
    expect(results[1].ok).toBe(true);
  });

  it('continues după throw (V1 default — Q-OPEN-6 graceful)', async () => {
    const t = throwingAdapter('t');
    const o = okAdapter('o', 'after');
    const results = await runPipeline(ctx, [t, o]);
    expect(results.length).toBe(2);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[1].output).toBe('after');
  });

  it('flags missing/invalid adapter entries as INVALID_ADAPTER err', async () => {
    const results = await runPipeline(ctx, [null, { id: 'no-invoke' }, okAdapter('o', 1)]);
    expect(results[0].error.code).toBe('INVALID_ADAPTER');
    expect(results[1].error.code).toBe('INVALID_ADAPTER');
    expect(results[1].error.adapterId).toBe('no-invoke');
    expect(isOk(results[2])).toBe(true);
  });

  it('handles sync (non-async) invoke fns (covers D2 thin scope flexibility)', async () => {
    const sync = { id: 's', invoke: () => ok('sync-output') };
    const results = await runPipeline(ctx, [sync]);
    expect(isOk(results[0])).toBe(true);
    expect(results[0].output).toBe('sync-output');
  });

  it('passes empty adapter list cleanly', async () => {
    const results = await runPipeline(ctx, []);
    expect(results).toEqual([]);
  });
});
