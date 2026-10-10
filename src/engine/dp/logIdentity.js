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
import { resolveCanonical } from '../exerciseAliases.js';
import { gymEquivalentFor } from './gymProfile.js';
import { isEnabled } from '../../util/featureFlags.js';

// dp_same_lift_variants_v1 (founder 2026-10-10: "lat pulldown si wide grip lat
// pulldown... sunt una si aceeasi") — library entries that are ONE lift (same machine,
// same bar, a cosmetic grip label). Audit of the 143 active lifts: this is the only
// pair; neutral grip / V-bar / close grip change the handle and stay their own.
/** @type {Readonly<Record<string, string>>} */
const SAME_LIFT = Object.freeze({ 'Wide-Grip Lat Pulldown': 'Lat Pulldown' });

/**
 * The canonical identity of an exercise for READ purposes, with the ACTIVE gym's
 * equivalences applied first (dp_gym_exercise_equivalents_v1). A gym has ONE
 * chest-press station, so whichever near-identical library entry the plan
 * prescribed, its logs describe the same machine — folding them makes the engine
 * read ONE history instead of several cold-starting fragments.
 *
 * The gym hop runs BEFORE the library resolve so the target is itself canonicalised.
 * Flag OFF / no active gym / no declared equivalence → identical to the plain
 * library resolve (byte-identical). Returns null for an unknown name, exactly like
 * resolveExerciseName, so every caller's back-compat branch is preserved.
 * @param {string|undefined} ex @returns {string|null}
 */
function canonicalIdentity(ex) {
  if (typeof ex !== 'string' || !ex) return null;
  if (isEnabled('dp_same_lift_variants_v1') && SAME_LIFT[ex]) ex = SAME_LIFT[ex];
  const viaGym = isEnabled('dp_gym_exercise_equivalents_v1') ? gymEquivalentFor(ex) : null;
  // dp_read_alias_fold_v1 (founder live 2026-10-01: Hammer Curl rec 8 kg for three
  // months while he curled 12-14) — the log WRITE folds explicit aliases
  // (workoutStore.logic: dp_library_chains_v1 → resolveCanonical, 'Hammer Curl' →
  // 'DB Hammer Curl Standing') but this READ seam resolved through the library only,
  // where both are real entries — so the planner's 'Hammer Curl' read two June sets
  // and never saw a single new one. Read with the same fold the write used.
  const base = isEnabled('dp_read_alias_fold_v1') && isEnabled('dp_library_chains_v1')
    ? resolveCanonical(viaGym ?? ex) : (viaGym ?? ex);
  return resolveExerciseName(base) ?? (viaGym ? viaGym : null);
}

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
  const canon = canonicalIdentity(ex);
  if (!canon) return (l) => l.ex === ex;
  // Perf (measured 2026-10-01): canonicalIdentity re-reads the dev flags + the gym
  // profile from localStorage on every call, and getLogs ran it for EVERY row (786
  // on the founder's account, ~35 getLogs per recommendation → ~200 ms). The log
  // carries ~100 distinct names: resolve each once per matcher. Same answers.
  /** @type {Map<string|undefined, string|null>} */
  const memo = new Map();
  return (l) => {
    if (l.ex === ex) return true;
    let c = memo.get(l.ex);
    if (c === undefined) { c = canonicalIdentity(l.ex); memo.set(l.ex, c); }
    return c === canon;
  };
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
  return canonicalIdentity(name) ?? name;
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
  const canon = canonicalIdentity(ex);
  const lc = typeof ex === 'string' ? ex.toLowerCase() : '';
  return canon
    ? (rowEx) => typeof rowEx === 'string' &&
        (rowEx.toLowerCase() === lc || canonicalIdentity(rowEx) === canon)
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
