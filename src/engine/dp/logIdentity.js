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
