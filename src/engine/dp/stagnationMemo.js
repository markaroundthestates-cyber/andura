// Perf (2026-11-16, founder "verifica toate load timeurile peste tot prin andura"):
// DP._stagnationWeeks re-parsed the whole `logs` key (1155 rows on his account) and
// re-scanned it for every lift, twice per lift per plan (stagnation + plateau
// occurrence). The result is a pure function of the stored log (+ the name
// resolution the log memo already keys on), so it is kept per lift until
// allLoggedRows() hands back a new array. dp_read_memo_v1 (dp.js caller).
import { detectStagnation } from '../stagnationDetector.js';
import { allLoggedRows } from './logIdentity.js';
import { DB } from '../../db.js';
import { isEnabled } from '../../util/featureFlags.js';


let _rows = /** @type {ReadonlyArray<unknown>|null} */ (null);
/** @type {Map<string, number>} */
let _memo = new Map();

/**
 * Consecutive stagnation weeks for `ex`, memoized per stored log; null when
 * nothing is stored (the caller reads through DB as before).
 * @param {string} ex @returns {number|null}
 */
export function memoStagnationWeeks(ex) {
  const rows = allLoggedRows();
  if (!rows) return null;
  if (rows !== _rows) { _rows = rows; _memo = new Map(); }
  let w = _memo.get(ex);
  if (w === undefined) {
    w = rows.length ? detectStagnation(ex, /** @type {any} */ (rows)).stagnationWeeks : 0;
    _memo.set(ex, w);
  }
  return w;
}

/**
 * DP._stagnationWeeks: the memo above when dp_read_memo_v1 is on and a log is
 * stored, else the original read of the whole `logs` key.
 * @param {string} ex @returns {number}
 */
export function stagnationWeeks(ex) {
  const memo = isEnabled('dp_read_memo_v1') ? memoStagnationWeeks(ex) : null;
  if (memo !== null) return memo;
  const logs = /** @type {Array<any>} */ (DB.get('logs')) || [];
  if (!Array.isArray(logs) || logs.length === 0) return 0;
  return detectStagnation(ex, logs).stagnationWeeks;
}
