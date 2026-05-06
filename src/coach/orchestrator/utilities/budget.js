// Layer D ≤50ms budget wrapper per ADR 030 D5 LOCKED V1.
//
// Cross-cutting orchestrator-level utility (NOT per-adapter) per D5. V1 stub
// = simple Promise.race timeout. Concrete enforcement mechanism Q-OPEN-2
// PENDING (sync timeout, async profiling, fail-fast on overrun) — defer post
// faza 3 batch 1 wiring + measure actual budget per engine before mechanism
// choice.
//
// Per ADR_CASCADE_DEFENSE_v1 §EXT-2 Composite Signal Layer Layer D Budget
// Reaffirmation (§36.41): ≤50ms hard ceiling per engine pipeline step.
//
// See: 03-decisions/030-adapter-design-pattern.md §2.5 D5 + §3 Q-OPEN-2
//      03-decisions/ADR_CASCADE_DEFENSE_v1.md §EXT-2

import { err, isOk } from '../result.js';

export const DEFAULT_BUDGET_MS = 50;

/**
 * Wrap a function call în a budget-enforced race. Returns the fn's result if
 * it settles within `budgetMs`, otherwise an err Result `BUDGET_EXCEEDED`.
 *
 * Defensive: if `fn` throws synchronously, captured ca err `WITHIN_BUDGET_THREW`.
 * If `fn` returns a non-Result value (rare misuse), result is wrapped passthrough.
 *
 * V1 simple Promise.race — does NOT cancel the underlying fn (no AbortController
 * threading în adapter contract V1). Concrete cancel semantics Q-OPEN-2 PENDING.
 *
 * @template T
 * @param {() => Promise<T>|T} fn
 * @param {number} [budgetMs=DEFAULT_BUDGET_MS]
 * @returns {Promise<T | {ok: false, error: object}>}
 */
export async function withBudget(fn, budgetMs = DEFAULT_BUDGET_MS) {
  if (typeof fn !== 'function') {
    return err({ code: 'INVALID_FN', message: 'withBudget expected a function' });
  }
  const ms = typeof budgetMs === 'number' && budgetMs > 0 ? budgetMs : DEFAULT_BUDGET_MS;

  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(
      () => resolve(err({ code: 'BUDGET_EXCEEDED', message: `over ${ms}ms budget` })),
      ms,
    );
  });

  try {
    const result = await Promise.race([
      Promise.resolve().then(() => fn()),
      timeout,
    ]);
    return result;
  } catch (cause) {
    return err({
      code: 'WITHIN_BUDGET_THREW',
      message: cause instanceof Error ? cause.message : String(cause),
      cause,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Convenience: returns true if the budget result was a budget-exceeded err.
 *
 * @param {{ok: boolean, error?: {code?: string}}} result
 * @returns {boolean}
 */
export function isBudgetExceeded(result) {
  return !isOk(result) && result?.error?.code === 'BUDGET_EXCEEDED';
}
