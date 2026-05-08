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
// Constraint Object propagation per ADR 026 §1.10 + ADR 030 D3:
//   When adapter Result `ok: true` includes `output.constraintObject`,
//   orchestrator extends EngineContext.meta.constraintObject (frozen) for
//   downstream adapters. Periodization (ADR 026 §9.1) emits Constraint Object
//   first; downstream 7 engines consume Floor/Ceiling.
//
// Telemetry sub-span capture per Q-OPEN-3 RESOLVED V1 (ADR 030 §3.3):
//   Optional `onSubSpan` callback fired per adapter cu `{ adapterId,
//   durationMs, ok, errorCode?, severity? }`. ADR 011 §X Changelog 2026-05-08
//   `pipeline_event` payload schema. Sentry per-error capture = separate scope.
//
// See: 03-decisions/030-adapter-design-pattern.md §2.4 D4 §AMENDMENT 2026-05-08
//      + §3.3 + §3.4 + §3.6 RESOLVED V1
//      03-decisions/011-coach-decision-log-architecture.md Changelog 2026-05-08

import { err } from './result.js';
import { extendEngineContext } from './contextBuilder.js';

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
 * Monotonic timer source — uses `performance.now()` when available (browser +
 * modern Node), falls back to Date.now (Date.now is wall-clock, NOT monotonic,
 * but acceptable telemetry-only baseline for environments without performance).
 *
 * @returns {number}
 */
function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
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
 * Constraint Object propagation V1 (ADR 030 D3 + §3.4): when adapter output
 * includes `constraintObject`, orchestrator extends EngineContext.meta and
 * passes new frozen ctx to next adapter. Sequential strict per ADR 026 §1.10.
 *
 * @param {import('./types.js').EngineContext} engineContext
 * @param {Array<import('./types.js').EngineAdapter>} adapters
 * @param {{ onSubSpan?: (subSpan: {adapterId: string, durationMs: number, ok: boolean, errorCode?: string, severity?: 'soft'|'hard'}) => void }} [options]
 * @returns {Promise<Array<import('./types.js').AdapterResult>>}
 */
export async function runPipeline(engineContext, adapters, options = {}) {
  if (!Array.isArray(adapters)) {
    return [];
  }
  const onSubSpan = typeof options?.onSubSpan === 'function' ? options.onSubSpan : null;
  const results = [];
  let currentCtx = engineContext;

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
      if (onSubSpan) {
        onSubSpan({
          adapterId: adapter?.id ?? '<unknown>',
          durationMs: 0,
          ok: false,
          errorCode: 'INVALID_ADAPTER',
          severity: 'hard',
        });
      }
      break;
    }

    const startMs = nowMs();
    let result;
    try {
      result = await adapter.invoke(currentCtx);
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
    const durationMs = nowMs() - startMs;
    results.push(result);

    // Telemetry sub-span capture per Q-OPEN-3 RESOLVED V1 (§3.3)
    if (onSubSpan) {
      const subSpan = {
        adapterId: adapter.id,
        durationMs,
        ok: Boolean(result?.ok),
      };
      if (result && result.ok === false) {
        subSpan.errorCode = result.error?.code;
        subSpan.severity = resolveSeverity(result.error);
      }
      onSubSpan(subSpan);
    }

    if (result && result.ok === false) {
      const severity = resolveSeverity(result.error);
      if (severity === 'hard') {
        // Halt-strict per §3.6: stop pipeline, downstream cannot trust upstream constraint
        break;
      }
      // 'soft' → continue-graceful per ADR 025 (engine pre-fill default downstream)
      continue;
    }

    // Constraint Object propagation per ADR 026 §1.10 + ADR 030 D3:
    // when adapter output exposes `constraintObject`, extend ctx for downstream
    if (result?.ok === true && result?.output && typeof result.output === 'object') {
      const co = result.output.constraintObject;
      if (co !== undefined && co !== null) {
        currentCtx = extendEngineContext(currentCtx, {
          constraintObject: Object.isFrozen(co) ? co : Object.freeze(co),
        });
      }
    }
  }
  return results;
}
