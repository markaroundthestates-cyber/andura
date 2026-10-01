// ══ LOGGED RUNGS — the loads the user actually sets on THIS station ══════════════
// dp_logged_rungs_snap_v1 (founder live 2026-10-01: "pe andura apare reverse pec
// deck cu o greutate pe care nu o are aparatul, si mereu o schimb. Si nu e un caz
// izolat"; "imi da 61 kg in loc de 60 cat bag eu").
//
// The active gym ("Sala mea") only carries stacks for the station types the user
// measured (his: bailib / matrix cable / dumbbells). Every OTHER machine fell
// through a chain of priors that all came from the OLD gym or from guesses:
//   - a learned ladder frozen in June (Reverse Pec Deck 18/24/30, step 6 → every
//     load above 42 clamped to 42; he works at 41/50/54 on a Matrix stack),
//   - a template matched from 4 stale observations (Converging Chest Press → a
//     dumbbell ladder that caps at 50; Machine Shoulder Press → a 2 kg grid),
//   - founder stacks + generic grids (Seated Calf Raise: everything → 70).
// Those learned records only refresh when ONE session logs >= 3 distinct loads,
// which a working lifter almost never does — so they never healed.
//
// Ground truth needs no inference: the loads he logged on this exercise in his
// recent sets ARE rungs of the machine he uses. Within the range he has used, a
// prescription snaps to the nearest load he has actually set (interior gaps that
// are an exact multiple of his modal step are filled, so 60 → 70 still offers 65
// on a 5 kg machine). Above his heaviest, the caller's chain may go higher but is
// never allowed to clamp BELOW a load he uses; below his lightest, the chain
// decides (deload/cold paths). Reads go through the canonical matcher, so gym
// equivalences and renamed identities count as one station.
//
// Memoized on the raw `logs` string: roundToEquipmentWeight runs hundreds of times
// per plan compose and must not JSON-parse the log history on every call.

import { loggedRowMatcher } from './logIdentity.js';

export const LOGGED_RUNGS_WINDOW = 24; // most recent sets of this exercise
export const LOGGED_RUNGS_MIN_DISTINCT = 2;

const round05 = (x) => Math.round(x * 2) / 2;

let _rawCache = /** @type {string|null|undefined} */ (undefined);
let _rowsCache = /** @type {Array<any>} */ ([]);
/** @type {Map<string, number[]|null>} */
let _rungsCache = new Map();

function _rows() {
  let raw = null;
  try { raw = typeof localStorage !== 'undefined' ? localStorage.getItem('logs') : null; } catch { raw = null; }
  if (raw !== _rawCache) {
    _rawCache = raw;
    _rungsCache = new Map();
    try {
      const parsed = JSON.parse(raw || 'null');
      _rowsCache = Array.isArray(parsed) ? parsed : [];
    } catch {
      _rowsCache = [];
    }
  }
  return _rowsCache;
}

/**
 * Sorted distinct loads (+ modal-step interior fill) from the user's most recent
 * LOGGED_RUNGS_WINDOW sets of `ex`, or null when fewer than
 * LOGGED_RUNGS_MIN_DISTINCT distinct loads exist. PURE given the logs.
 * @param {Array<{ex?: string, w?: number, ts?: number}>} rows
 * @param {string} ex
 * @returns {number[]|null}
 */
export function loggedRungsFromRows(rows, ex) {
  if (!Array.isArray(rows) || typeof ex !== 'string' || !ex) return null;
  const matches = loggedRowMatcher(ex);
  const mine = rows
    .filter((l) => l && matches(l) && Number.isFinite(Number(l.w)) && Number(l.w) > 0)
    .sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0))
    .slice(0, LOGGED_RUNGS_WINDOW);
  const distinct = [...new Set(mine.map((l) => round05(Number(l.w))))].sort((a, b) => a - b);
  if (distinct.length < LOGGED_RUNGS_MIN_DISTINCT) return null;
  // Modal adjacent gap (needs >= 2 corroborating gaps to be trusted for filling).
  const counts = new Map();
  for (let i = 1; i < distinct.length; i++) {
    const g = round05(distinct[i] - distinct[i - 1]);
    if (g > 0) counts.set(g, (counts.get(g) || 0) + 1);
  }
  let step = 0;
  let n = 0;
  for (const [g, c] of counts) if (c > n || (c === n && g < step)) { step = g; n = c; }
  const out = [...distinct];
  if (step > 0 && n >= 2) {
    for (let i = 1; i < distinct.length; i++) {
      const gap = distinct[i] - distinct[i - 1];
      const k = Math.round(gap / step);
      if (k >= 2 && Math.abs(gap - k * step) < 0.01) {
        for (let j = 1; j < k; j++) out.push(round05(distinct[i - 1] + j * step));
      }
    }
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

/**
 * The user's logged rungs for one exercise (memoized on the logs string).
 * @param {string} ex
 * @returns {number[]|null}
 */
export function loggedRungs(ex) {
  const rows = _rows();
  if (_rungsCache.has(ex)) return /** @type {number[]|null} */ (_rungsCache.get(ex));
  const r = loggedRungsFromRows(rows, ex);
  _rungsCache.set(ex, r);
  return r;
}
