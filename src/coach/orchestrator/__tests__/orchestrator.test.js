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

const errAdapter = (id, code, message, severity) => ({
  id,
  invoke: vi.fn(async () => {
    const error = { code, message };
    if (severity) error.severity = severity;
    return err(error);
  }),
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

  it('preserves err result si tags adapterId cand missing', async () => {
    const a = errAdapter('engine-a', 'BAD_INPUT', 'shape wrong');
    const results = await runPipeline(ctx, [a]);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.code).toBe('BAD_INPUT');
    expect(results[0].error.adapterId).toBe('engine-a');
  });

  it('does NOT overwrite adapterId cand adapter included it explicit', async () => {
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
    expect(results[0].error.severity).toBe('hard');
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

describe('runPipeline — ADR 030 §3.6 RESOLVED V1 severity-aware policy', () => {
  it('halts dupa err with default severity (no severity field → hard fail-safe)', async () => {
    const a = errAdapter('a', 'BAD_INPUT', 'm'); // no explicit severity → default hard
    const b = okAdapter('b', 'should-not-run');
    const results = await runPipeline(ctx, [a, b]);
    expect(results.length).toBe(1); // halted dupa a
    expect(results[0].ok).toBe(false);
    expect(b.invoke).not.toHaveBeenCalled();
  });

  it('halts dupa err with explicit severity hard', async () => {
    const a = errAdapter('a', 'INVALID_INPUT', 'm', 'hard');
    const b = okAdapter('b', 'should-not-run');
    const results = await runPipeline(ctx, [a, b]);
    expect(results.length).toBe(1);
    expect(results[0].error.severity).toBe('hard');
    expect(b.invoke).not.toHaveBeenCalled();
  });

  it('continues dupa err with explicit severity soft (ADR 025 graceful)', async () => {
    const a = errAdapter('a', 'CUSTOM_SOFT', 'm', 'soft');
    const b = okAdapter('b', 'continued');
    const results = await runPipeline(ctx, [a, b]);
    expect(results.length).toBe(2);
    expect(results[0].ok).toBe(false);
    expect(results[0].error.severity).toBe('soft');
    expect(results[1].ok).toBe(true);
    expect(results[1].output).toBe('continued');
  });

  it('treats BUDGET_EXCEEDED as soft default (continue-graceful per Q-OPEN-2 + §3.6)', async () => {
    const a = errAdapter('a', 'BUDGET_EXCEEDED', 'over budget'); // no explicit severity
    const b = okAdapter('b', 'continued-after-budget');
    const results = await runPipeline(ctx, [a, b]);
    expect(results.length).toBe(2);
    expect(results[0].error.code).toBe('BUDGET_EXCEEDED');
    expect(results[1].output).toBe('continued-after-budget');
  });

  it('halts dupa ADAPTER_THREW (hard severity, Anti-Cascade Silent default)', async () => {
    const t = throwingAdapter('t');
    const o = okAdapter('o', 'should-not-run');
    const results = await runPipeline(ctx, [t, o]);
    expect(results.length).toBe(1);
    expect(results[0].error.code).toBe('ADAPTER_THREW');
    expect(results[0].error.severity).toBe('hard');
    expect(o.invoke).not.toHaveBeenCalled();
  });

  it('halts on first INVALID_ADAPTER (hard severity)', async () => {
    const o = okAdapter('o', 'should-not-run');
    const results = await runPipeline(ctx, [null, o]);
    expect(results.length).toBe(1);
    expect(results[0].error.code).toBe('INVALID_ADAPTER');
    expect(results[0].error.severity).toBe('hard');
    expect(o.invoke).not.toHaveBeenCalled();
  });

  it('mixed pipeline: ok → soft err → ok → hard err halts (downstream skipped)', async () => {
    const a = okAdapter('a', 'first');
    const b = errAdapter('b', 'BUDGET_EXCEEDED', 'soft-degrade'); // soft via code
    const c = okAdapter('c', 'third');
    const d = errAdapter('d', 'INVALID_INPUT', 'hard-stop'); // default hard
    const e = okAdapter('e', 'should-not-run');
    const results = await runPipeline(ctx, [a, b, c, d, e]);
    expect(results.length).toBe(4);
    expect(isOk(results[0])).toBe(true);
    expect(results[1].error.code).toBe('BUDGET_EXCEEDED');
    expect(isOk(results[2])).toBe(true);
    expect(results[3].error.code).toBe('INVALID_INPUT');
    expect(e.invoke).not.toHaveBeenCalled();
  });
});
