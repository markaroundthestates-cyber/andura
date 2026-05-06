// Orchestrator pipeline runner per ADR 030 D1-D5 LOCKED V1.
//
// Sequential per ADR 026 §1.10 §42.10 — Constraint Object immutable propagated
// engine-to-engine. Q-OPEN-4 PENDING (parallel-where-safe) — V1 strict sequential.
//
// Error recovery semantics Q-OPEN-6 PENDING — V1 default = continue-on-err
// (graceful, ADR 025 aligned), but flag în adapter-level error envelope so
// orchestrator caller can inspect downstream. Strict halt on err = future amendment
// once concrete failure scenario surfaces (e.g., Periodization fails →
// downstream Goal Adaptation reads stale Constraint Object).
//
// See: 03-decisions/030-adapter-design-pattern.md §2.4 D4 + §3 Q-OPEN-6

import { err } from './result.js';

/**
 * Run a pipeline of adapters sequentially over an EngineContext.
 *
 * Each adapter's `invoke(ctx)` returns an `AdapterResult`. Orchestrator
 * collects results în order; an adapter that throws (defensive against
 * D4 violations) is captured ca structured err with code `ADAPTER_THREW`.
 *
 * V1 default: continue-on-err (Q-OPEN-6 PENDING resolution post-Beta concrete
 * failure scenarios). Caller can inspect the result array and decide policy.
 *
 * @param {import('./types.js').EngineContext} engineContext
 * @param {Array<import('./types.js').EngineAdapter>} adapters
 * @returns {Promise<Array<import('./types.js').AdapterResult>>}
 */
export async function runPipeline(engineContext, adapters) {
  if (!Array.isArray(adapters)) {
    return [];
  }
  const results = [];
  for (const adapter of adapters) {
    if (!adapter || typeof adapter.invoke !== 'function') {
      results.push(err({
        code: 'INVALID_ADAPTER',
        message: 'Adapter is missing or has no invoke fn',
        adapterId: adapter?.id ?? '<unknown>',
      }));
      continue;
    }
    try {
      const result = await adapter.invoke(engineContext);
      // Defensive: tag adapterId on err envelopes that didn't include it.
      if (result && result.ok === false && result.error && !result.error.adapterId) {
        result.error.adapterId = adapter.id;
      }
      results.push(result);
    } catch (cause) {
      // D4 violation: adapter threw instead of returning err. Capture structured.
      results.push(err({
        code: 'ADAPTER_THREW',
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
        adapterId: adapter.id,
      }));
    }
  }
  return results;
}
