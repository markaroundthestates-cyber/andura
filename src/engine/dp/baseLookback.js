// ══ #43 DP LOOKBACK — multi-session demonstrated base (not last-session-only) ══
// Backlog #43. The case: Lat Pulldown recommended ~45 kg despite a clearly
// stronger recent history (59-64 kg sessions, one weak session). dp.js anchors the
// progression on `lastW = lastLog.w` — the SINGLE newest log row (dp.js getState).
// The PR-floor (_demoWorkingW) catches that back up ONLY through the non-hard /
// hit-reps catch-up gate; when the latest session was rated hard or fell short, the
// gate is suppressed and the engine eases from the one weak session — forgetting
// what the user demonstrated a session or two ago. That is the last-session-only
// failure.
//
// FIX: a demonstrated BASE aggregated over the last 3 DISTINCT sessions of the
// exercise, in RIR-corrected e1RM space (the engine's currency — same as the
// PR-floor / Kalman, via dp.js's e1RMForSet closure; inline Epley fallback for
// pure-fn callers).
//
// AGGREGATION CHOICE — MAX-OF-MEDIANS over the last 3 distinct sessions, then an
// ANTI-REGRESSION clamp toward the latest session. Why each piece:
//   • PER-SESSION MEDIAN (not the session's top single set): one fluke-heavy
//     warm-up-mislogged or ego set in an old session must not define the base. The
//     median is the session's robust working level.
//   • MAX across the 3 sessions: "do not forget what the user can do" — the base is
//     the best robust session of the recent three, so one weak session cannot pull
//     it down. (Constrained below — it is NOT a free ratchet to ancient strength.)
//   • RECENCY GUARD (anti-regression after a layoff): the base is NOT allowed to sit
//     more than MAX_LIFT_ABOVE_LATEST above the LATEST session's own level. So if the
//     user genuinely came back weaker (latest session well below the recent best),
//     the base eases down WITH them rather than forcing the old number back instantly
//     — it remembers, but it does not deny the day. A small allowance above the
//     latest absorbs ordinary day-to-day noise (a slightly off session) without
//     erasing the demonstrated base.
//
// NET: the base never URCĂ (rises) just because one OLD session beat the latest
// (the recency guard caps it to the latest + a small band); and the base never
// CRATERS to one weak session's value when the recent history is clearly stronger
// (the max-of-medians floor). It targets "don't forget what the user can do" while
// still honoring the signal of the day.
//
// PURE + DETERMINISTIC: rows in (DP.getLogs-style, newest-first {w,reps,rpe,ts}),
// kg out. No DB, no clock. Returns 0 on thin/cold history → the caller keeps its
// existing single-session base (byte-identical / inert for a new user).

import { e1rmSeries } from './progressionSignal.js';

// ── Tunables (DESIGN PROPOSALS — conservative; sim sweep + Daniel before flip) ──
// How many DISTINCT sessions (calendar days) back the base aggregates over. 3 per
// the spec — enough to bridge one off day, short enough to stay current.
export const LOOKBACK_SESSIONS = 3;
// Minimum DISTINCT sessions required before the lookback produces a base. < this →
// 0 (inert; the caller's single-session path stands). One session is not a lookback.
export const MIN_SESSIONS = 2;
// Recency guard: the multi-session base may sit at most this FRACTION above the
// LATEST session's own e1RM level. 5% absorbs ordinary one-session noise (a slightly
// flat day) without forcing an old number back; beyond it (a real layoff — the
// latest session is materially weaker) the base eases down with the user. So a true
// comeback is NOT shoved back to pre-break strength on session one.
export const MAX_LIFT_ABOVE_LATEST = 0.05;

/**
 * Median of a numeric array (sorted copy; no mutation). Empty → 0.
 * @param {number[]} arr
 * @returns {number}
 */
function median(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Group log rows (newest-first) into the most-recent `maxSessions` DISTINCT calendar
 * days, each as the chronological per-set e1RM series for that day. Rows with no
 * usable e1RM are dropped; a row with no `ts` is treated as its own (oldest) day so
 * legacy logs never collapse into a real day. Returns sessions newest-first, each a
 * non-empty number[] of e1RMs. PURE.
 *
 * @param {Array<{w?:number, reps?:number|string, rpe?:number, ts?:number}>} rows newest-first
 * @param {((w:number, reps:number, rpe:number)=>(number|null))|null} e1RMForSet
 * @param {number} maxSessions
 * @returns {number[][]} per-session e1RM series, newest session first
 */
function sessionsFromRows(rows, e1RMForSet, maxSessions) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  // Bucket by calendar day (ts → day index). Keep day order newest-first.
  const byDay = new Map(); // dayKey → rows[] (preserve newest-first within a day)
  const order = []; // dayKeys in first-seen (newest-first) order
  let legacyCounter = 0;
  for (const l of rows) {
    const ts = Number(l && l.ts);
    const dayKey = Number.isFinite(ts) && ts > 0
      ? `d${Math.floor(ts / 86400000)}`
      : `legacy${legacyCounter++}`; // each ts-less row = its own day (never merge)
    if (!byDay.has(dayKey)) { byDay.set(dayKey, []); order.push(dayKey); }
    byDay.get(dayKey).push(l);
  }
  const out = [];
  for (const dayKey of order) {
    if (out.length >= maxSessions) break;
    // Per-day e1RM series — reuse e1rmSeries with a window covering the whole day.
    const dayRows = byDay.get(dayKey);
    const series = e1rmSeries(dayRows, e1RMForSet, dayRows.length);
    if (series.length > 0) out.push(series);
  }
  return out;
}

/**
 * Demonstrated working e1RM (kg-scale e1RM, NOT a back-solved working kg) aggregated
 * over the last LOOKBACK_SESSIONS distinct sessions: MAX of the per-session medians,
 * clamped by the recency guard (never more than MAX_LIFT_ABOVE_LATEST above the
 * latest session's own median). Returns 0 when fewer than MIN_SESSIONS usable
 * sessions exist (cold/thin → caller keeps its single-session base).
 *
 * NOTE: this returns an e1RM, mirroring dp._bestE1RM's units, so the caller
 * back-solves it to a working kg with the SAME _kgFromE1RM the engine already uses
 * (dimension-correct, no duplicated inverse). See the wiring spec in the report.
 *
 * @param {Array<{w?:number, reps?:number|string, rpe?:number, ts?:number}>} rows newest-first
 * @param {((w:number, reps:number, rpe:number)=>(number|null))|null} [e1RMForSet] dp.js closure; null → inline Epley
 * @returns {number} demonstrated base e1RM, or 0 when unusable
 */
export function lookbackBaseE1RM(rows, e1RMForSet) {
  const sessions = sessionsFromRows(rows, e1RMForSet, LOOKBACK_SESSIONS);
  if (sessions.length < MIN_SESSIONS) return 0; // one session is not a lookback
  const medians = sessions.map(median).filter((m) => m > 0);
  if (medians.length < MIN_SESSIONS) return 0;
  const maxMedian = Math.max(...medians);
  // Recency guard: the LATEST session is sessions[0] (newest-first).
  const latestMedian = medians[0];
  if (!(latestMedian > 0)) return maxMedian; // defensive: no latest → unclamped max
  const ceiling = latestMedian * (1 + MAX_LIFT_ABOVE_LATEST);
  // Remember the recent best, but never force it more than the small band above the
  // latest session (anti-regression after a layoff). The base also never drops BELOW
  // the latest session itself (max with latestMedian) — the day's level is the floor.
  return Math.max(latestMedian, Math.min(maxMedian, ceiling));
}
