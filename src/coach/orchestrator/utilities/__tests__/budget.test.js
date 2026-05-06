import { describe, it, expect, vi } from 'vitest';
import { withBudget, isBudgetExceeded, DEFAULT_BUDGET_MS } from '../budget.js';
import { ok, isOk } from '../../result.js';

describe('withBudget — ADR 030 D5 Layer D ≤50ms (Q-OPEN-2 PENDING)', () => {
  it('exposes DEFAULT_BUDGET_MS = 50', () => {
    expect(DEFAULT_BUDGET_MS).toBe(50);
  });

  it('returns fn result când settles within budget', async () => {
    const r = await withBudget(() => ok(42), 100);
    expect(isOk(r)).toBe(true);
    expect(r.output).toBe(42);
  });

  it('returns BUDGET_EXCEEDED când fn slower than budget', async () => {
    vi.useFakeTimers();
    const slowFn = () => new Promise((resolve) => setTimeout(() => resolve(ok('late')), 200));
    const promise = withBudget(slowFn, 50);
    await vi.advanceTimersByTimeAsync(60);
    const r = await promise;
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('BUDGET_EXCEEDED');
    expect(r.error.message).toMatch(/50ms/);
    vi.useRealTimers();
  });

  it('captures sync throw ca WITHIN_BUDGET_THREW', async () => {
    const r = await withBudget(() => { throw new Error('sync boom'); }, 50);
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('WITHIN_BUDGET_THREW');
    expect(r.error.message).toBe('sync boom');
  });

  it('captures async throw ca WITHIN_BUDGET_THREW', async () => {
    const r = await withBudget(async () => { throw new Error('async boom'); }, 50);
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('WITHIN_BUDGET_THREW');
    expect(r.error.message).toBe('async boom');
  });

  it('rejects non-function input', async () => {
    const r = await withBudget(null);
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('INVALID_FN');
  });

  it('uses DEFAULT_BUDGET_MS când budgetMs invalid', async () => {
    // Smoke — fn fast enough to settle regardless de default vs custom
    const r = await withBudget(() => ok('fast'), -1);
    expect(isOk(r)).toBe(true);
    expect(r.output).toBe('fast');
  });

  describe('isBudgetExceeded', () => {
    it('true when result is BUDGET_EXCEEDED err', () => {
      expect(isBudgetExceeded({ ok: false, error: { code: 'BUDGET_EXCEEDED' } })).toBe(true);
    });

    it('false for ok result', () => {
      expect(isBudgetExceeded(ok(1))).toBe(false);
    });

    it('false for other err codes', () => {
      expect(isBudgetExceeded({ ok: false, error: { code: 'OTHER' } })).toBe(false);
    });

    it('false for malformed inputs', () => {
      expect(isBudgetExceeded(null)).toBe(false);
      expect(isBudgetExceeded({ ok: false })).toBe(false);
    });
  });
});
