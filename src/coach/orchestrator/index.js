// Orchestrator pipeline runner per ADR 030 D1-D5 LOCKED V1.
//
// Sequential per ADR 026 §1.10 §42.10 — Constraint Object immutable propagated
// engine-to-engine. Q-OPEN-4 RESOLVED V1 2026-05-08 (sequential strict V1 preserved
// per ADR 030 §3.4; parallel-where-safe V1.5 reconsideration trigger §5.6).
//
// Error recovery semantics Q-OPEN-6 RESOLVED V1 2026-05-08 — severity-aware policy
// per ADR 030 §3.6 RESOLVED V1 taxonomy table:
//   - 'soft' severity (default if engine emits 'soft' OR `BUDGET_EXCEEDED`) →
//     continue-graceful next adapter (ADR 025 graceful degradation alignment)
//   - 'hard' severity (default if absent — fail-safe Anti-Cascade Silent default,
//     OR if `INVALID_INPUT`/`ENGINE_THREW`/`ADAPTER_THREW`/`INVALID_ADAPTER`) →
//     halt-strict pipeline, return aggregate cu first hard error
//
// See: 03-decisions/030-adapter-design-pattern.md §2.4 D4 §AMENDMENT 2026-05-08
//      + §3.6 RESOLVED V1 + §3.4 RESOLVED V1

import { err } from './result.js';

const SOFT_DEFAULT_CODES = new Set(['BUDGET_EXCEEDED']);

/**
 * Resolve severity per ADR 030 §3.6 RESOLVED V1 taxonomy.
 * - Engine emits explicit 'soft' OR 'hard' → respect
 * - Code în SOFT_DEFAULT_CODES (e.g., BUDGET_EXCEEDED) → 'soft'
 * - Otherwise default 'hard' (fail-safe Anti-Cascade Silent per §3.6)
 *
 * @param {{code?: string, severity?: 'soft'|'hard'}} [error]
 * @returns {'soft'|'hard'}
 */
function resolveSeverity(error) {
  if (error?.severity === 'soft' || error?.severity === 'hard') {
    return error.severity;
  }
  if (error?.code && SOFT_DEFAULT_CODES.has(error.code)) {
    return 'soft';
  }
  return 'hard';
}

/**
 * Run a pipeline of adapters sequentially over an EngineContext.
 *
 * Each adapter's `invoke(ctx)` returns an `AdapterResult`. Orchestrator
 * collects results în order; an adapter that throws (defensive against
 * D4 violations) is captured ca structured err with code `ADAPTER_THREW`.
 *
 * Severity-aware policy V1 (Q-OPEN-6 RESOLVED): 'soft' → continue, 'hard' → halt.
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
      // INVALID_ADAPTER → 'hard' severity per §3.6 taxonomy → halt
      const invalidErr = err({
        code: 'INVALID_ADAPTER',
        message: 'Adapter is missing or has no invoke fn',
        adapterId: adapter?.id ?? '<unknown>',
        severity: 'hard',
      });
      results.push(invalidErr);
      break;
    }
    let result;
    try {
      result = await adapter.invoke(engineContext);
      // Defensive: tag adapterId on err envelopes that didn't include it.
      if (result && result.ok === false && result.error && !result.error.adapterId) {
        result.error.adapterId = adapter.id;
      }
    } catch (cause) {
      // D4 violation: adapter threw instead of returning err. Capture structured.
      // ADAPTER_THREW → 'hard' severity per §3.6 taxonomy → halt
      result = err({
        code: 'ADAPTER_THREW',
        message: cause instanceof Error ? cause.message : String(cause),
        cause,
        adapterId: adapter.id,
        severity: 'hard',
      });
    }
    results.push(result);
    if (result && result.ok === false) {
      const severity = resolveSeverity(result.error);
      if (severity === 'hard') {
        // Halt-strict per §3.6: stop pipeline, downstream cannot trust upstream constraint
        break;
      }
      // 'soft' → continue-graceful per ADR 025 (engine pre-fill default downstream)
    }
  }
  return results;
}
