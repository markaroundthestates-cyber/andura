// ══ DP LOG IDENTITY — id-migration Phase 2 read-side helpers ═══════════════════
// Extracted from dp.js (getLogs + _loggedExerciseNames) to honor the dp.js growth
// moratorium — new dp logic lives in a dp/<submodule>, never inline.
//
// THE read seam for the NAME-KEY bug class (Chest Fly→Cable Fly, Overhead Triceps
// Extension→… in the 2026-06-10 data remap): a set persisted under a HISTORICAL
// name stays in `logs` under that old `l.ex` forever (logs are append-only
// history), so once an exercise is renamed `l.ex === ex` misses it → the row is
// orphaned → the engine cold-start-INITs a lift the user has actually been doing.
// resolveExerciseName maps name/id/alias/old-name → the current canonical name.

import { resolveExerciseName } from '../exerciseLibrary.js';

/**
 * A predicate matching a stored log row to a query exercise by CANONICAL identity.
 * The query resolves once; a row matches when its stored `l.ex` resolves to the
 * same canonical name. The raw `===` is kept as the cheap first hop (the common
 * already-canonical case) AND as the back-compat path for an unknown query
 * (resolve null → exact match only, never a false canonical merge).
 * @param {string} ex - the query exercise (name | id | alias)
 * @returns {(l: {ex?: string}) => boolean}
 */
export function loggedRowMatcher(ex) {
  const canon = resolveExerciseName(ex);
  return canon
    ? (l) => l.ex === ex || resolveExerciseName(l.ex) === canon
    : (l) => l.ex === ex;
}

/**
 * The canonical name a logged exercise should collapse to for the transfer-source
 * set (so a lift logged under a historical alias AND its current name is ONE
 * source, not a phantom duplicate that could seed from a stale-named slice).
 * Unknown name → kept as-is (a brand-new exercise stays itself).
 * @param {string} name
 * @returns {string}
 */
export function canonicalLoggedName(name) {
  return resolveExerciseName(name) ?? name;
}

// ── Phase 2b read-side: case-insensitive log-row match by CANONICAL identity ───
// stagnationDetector.weeklyProgression matches a log row by
// `l.ex.toLowerCase() === exerciseName.toLowerCase()` — the SAME stranding bug as
// getLogs (a renamed lift's old-named rows fall out of the window → false "no
// progression"). This is the matcher for that call site: the query resolves once,
// a row matches when its `l.ex` resolves to the same canonical name. The
// case-insensitive `===` is kept as the cheap first hop AND the back-compat path
// for an unknown query (resolve null → CI exact match only, never a false merge).
// @param {string} ex - the query exercise (name | id | alias)
// @returns {(rowEx: string | undefined) => boolean}
export function loggedNameMatchesCI(ex) {
  const canon = resolveExerciseName(ex);
  const lc = typeof ex === 'string' ? ex.toLowerCase() : '';
  return canon
    ? (rowEx) => typeof rowEx === 'string' &&
        (rowEx.toLowerCase() === lc || resolveExerciseName(rowEx) === canon)
    : (rowEx) => typeof rowEx === 'string' && rowEx.toLowerCase() === lc;
}

/**
 * Collapse a name-keyed record onto CANONICAL keys, folding entries that share a
 * canonical identity (a historical alias + the current name) into ONE under that
 * canonical name. THE Phase-2b read-side primitive for the producer maps
 * (refusal penalties, pain swaps): the engine reads ONE correct value per
 * movement even when a rename stranded part of the history under the old name.
 *
 * - Unknown keys (not in the library) keep themselves verbatim — a brand-new or
 *   off-library name is never lost (matches loggedRowMatcher's back-compat path).
 * - `combine(prev, next, key)` merges two entries colliding on the same canonical
 *   key; it is NOT called for the first entry. Caller owns the semantic
 *   (sum / max / latest-wins) and documents it at the call site.
 * - Iteration order is the source's; `combine` receives (accumulated, incoming).
 *
 * Pure given (obj, combine). Non-object input → {}.
 * @template V
 * @param {Record<string, V> | null | undefined} obj
 * @param {(prev: V, next: V, canonKey: string) => V} combine
 * @returns {Record<string, V>}
 */
export function canonicalizeNameKeyedMap(obj, combine) {
  /** @type {Record<string, V>} */
  const out = {};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) {
    const canon = canonicalLoggedName(k);
    out[canon] = canon in out ? combine(out[canon], v, canon) : v;
  }
  return out;
}
