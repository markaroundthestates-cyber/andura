// ══ FOLLOW RECENT — the prescription follows what the user actually did ═════════
// Founder live 2026-10-01 (1000 kcal cut, 148 → 88 kg): "nu tine cont de cat pot si
// imi face push in deficit" + "daca prima oara fac 10 repetari dupa clar pot ori 10
// ori mai putine... nu tot 10 mereu". Pure helpers wired from dp.js (growth
// moratorium — dp.js keeps only the call sites).
//
// dp_reps_follow_recent_v1 — the plan's rep target came from the goal band (clamped
// UP to 10) and never looked at what he did at that load: Cable Row 66x10 for a man
// logging 66x7-9. Cap = the most reps he logged at EXACTLY this load in his last 3
// sessions, + 1 (double progression: he leads, the coach follows one rep ahead).
// No recent set at this load → no cap (a new load is a progression step; the e1RM
// inverse is not used here — it saturates at 12 effective reps and would choke a
// legit high-rep climb). Only ever lowers.
//
// dp_cap_yields_to_repeated_v1 — MAX_KG is a hand-tuned DEFENSIVE cap (Reverse Pec
// Deck 45, set when he pulled 30-36 at the old gym). He now works at 50 every
// session, so "over the cap" fired every time (45 → snapped 42, reps to the range
// top: 42x20 for a man doing 50x10). A load above the cap logged in >= 2 distinct
// sessions (>= 6 reps, not greu) moves the cap to that load + 25% — still a
// fat-finger bound; a single ego set never moves it.

import { recentSessionRows } from './baseLookback.js';

const repsOf = (l) => (typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps));

/**
 * Max reps logged at exactly `kg` (±0.25) within the last 3 sessions of `rows`.
 * @param {Array<{w?:number, reps?:number|string, ts?:number}>} rows newest-first
 * @param {number} kg
 * @returns {number} 0 when no recent set at this load
 */
export function repsReachedAt(rows, kg) {
  if (!Array.isArray(rows) || !(kg > 0)) return 0;
  let best = 0;
  for (const l of recentSessionRows(rows)) {
    const r = repsOf(l);
    if (Math.abs(Number(l.w) - kg) <= 0.25 && r > best) best = r;
  }
  return best;
}

/**
 * The rep target capped at (reps reached at this load recently) + 1. Only lowers.
 * @param {Array<{w?:number, reps?:number|string, ts?:number}>} rows newest-first
 * @param {number} kg prescribed load
 * @param {number} repsTarget prescribed reps
 * @returns {number}
 */
export function followRecentReps(rows, kg, repsTarget) {
  const reached = repsReachedAt(rows, kg);
  return reached > 0 && repsTarget > reached + 1 ? reached + 1 : repsTarget;
}

/**
 * Heaviest load worked in >= 2 DISTINCT sessions (>= 6 reps, rpe < 8.5); 0 if none.
 * @param {Array<{w?:number, reps?:number|string, rpe?:number, ts?:number}>} rows
 * @returns {number}
 */
export function repeatedWorkingLoad(rows) {
  /** @type {Map<number, Set<number>>} */
  const daysByLoad = new Map();
  for (const l of Array.isArray(rows) ? rows : []) {
    const w = Number(l.w);
    const ts = Number(l.ts);
    if (!(w > 0) || !(repsOf(l) >= 6) || !(Number(l.rpe || 7) < 8.5) || !(ts > 0)) continue;
    if (!daysByLoad.has(w)) daysByLoad.set(w, new Set());
    /** @type {Set<number>} */ (daysByLoad.get(w)).add(Math.floor(ts / 86400000));
  }
  let best = 0;
  for (const [w, days] of daysByLoad) if (days.size >= 2 && w > best) best = w;
  return best;
}

/**
 * The defensive cap, moved to repeated-load + 25% when the user's ordinary working
 * load exceeds it. @param {number} flat @param {Array<any>} rows @returns {number}
 */
export function yieldedCap(flat, rows) {
  const repeated = repeatedWorkingLoad(rows);
  return repeated > flat ? repeated * 1.25 : flat;
}

/**
 * dp_cut_restraint_energy_v1 — the heaviest load of the most recent session (rows
 * newest-first, calendar-day bucket). On a deliberate cut the learned calibration
 * factor may lift a base only up to this: his factors were learned during the
 * July-August deload latch (recs ×0.875, he logged real loads → factors 1.08-1.11),
 * so they inflated every rec once the latch was fixed (Reverse Pec Deck 50 → 54,
 * Machine Shoulder Press 60 → 61-65). 0 when no rows.
 * @param {Array<{w?:number, ts?:number}>} rows newest-first
 * @returns {number}
 */
export function lastSessionTop(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const day = Math.floor(Number(rows[0].ts) / 86400000);
  let top = 0;
  for (const l of rows) {
    if (Math.floor(Number(l.ts) / 86400000) !== day) break;
    if (Number(l.w) > top) top = Number(l.w);
  }
  return top;
}
