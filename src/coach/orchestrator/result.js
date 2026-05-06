// Result helpers per ADR 030 D4 LOCKED V1.
//
// Adapters return `{ ok: true, output } | { ok: false, error }` — never throws.
// Errors first-class în type system; composable cu sequential pipeline §42.10
// short-circuit fail-safe (Anti-Cascade Silent precedent ADR_CASCADE_DEFENSE_v1
// §EXT-2 Layer D ≤50ms budget).
//
// See: 03-decisions/030-adapter-design-pattern.md §2.4 D4

/**
 * Wrap a successful output în an ok-discriminated Result.
 *
 * @template T
 * @param {T} output
 * @returns {{ ok: true, output: T }}
 */
export function ok(output) {
  return { ok: true, output };
}

/**
 * Wrap an error în an err-discriminated Result. Accepts an `AdapterError`
 * envelope OR a string shorthand (which becomes `{ code: 'GENERIC', message }`).
 *
 * NEVER throws — errors are first-class data per D4.
 *
 * @param {string|{code: string, message: string, cause?: unknown, adapterId?: string}} error
 * @returns {{ ok: false, error: {code: string, message: string, cause?: unknown, adapterId?: string} }}
 */
export function err(error) {
  if (typeof error === 'string') {
    return { ok: false, error: { code: 'GENERIC', message: error } };
  }
  return { ok: false, error };
}

/**
 * Type-guard — narrows the union în consumer call sites.
 *
 * @param {{ok: boolean}} result
 * @returns {boolean}
 */
export function isOk(result) {
  return Boolean(result && result.ok === true);
}

/**
 * Map an ok-result through a transform; passthrough err untouched.
 *
 * Useful for adapter pipelines where a downstream step transforms the
 * upstream output without re-introducing throw semantics.
 *
 * @template T,U
 * @param {{ok: true, output: T} | {ok: false, error: object}} result
 * @param {(output: T) => U} fn
 * @returns {{ok: true, output: U} | {ok: false, error: object}}
 */
export function mapOk(result, fn) {
  if (!isOk(result)) return result;
  try {
    return ok(fn(result.output));
  } catch (cause) {
    return err({
      code: 'MAP_THREW',
      message: cause instanceof Error ? cause.message : String(cause),
      cause,
    });
  }
}
