// ══ LINEAR BLOCK 4+1 — Foundation 2 (§29.2.5 LOCKED) ════════════════════
// State machine for the 4-week-load + 1-week-deload progression cycle.
//   Week 1-4: normal progression (uses progressionMatrix bands)
//   Week 5:   automatic deload (~40-50% volume cut, 10-15% intensity cut)
//   Week 6:   resets to Week 1 (cycle restart)
//
// The user retains 100% agency: they can SKIP the deload (continue Week 5
// at normal volume/intensity). On skip, a soft warning surfaces via
// SafetyBanner with the LOCKED wording from `progressionMatrix.getDeloadSkipWarning()`.
// We never force-deload retroactively.
//
// State storage (localStorage):
//   sf.linearBlock = {
//     cycleStartDate: '2026-05-02',  // ISO date — when cycle Week 1 started
//     cycleWeek: 3,                   // 1..5 (computed from start date + today)
//     deloadSkippedAt: null|number,   // ms timestamp of last skip (per cycle)
//   }
//
// Cross-refs:
//   - HANDOVER §29.2.5 Forta & Dezvoltare V1 LOCKED
//   - F-NEW-2 progressionMatrix.getDeloadSkipWarning() (LOCKED wording)
//   - SafetyBanner consumer (Task 8 wiring)

import { getDeloadSkipWarning } from './progressionMatrix.js';

export const LINEAR_BLOCK_KEY = 'sf.linearBlock';

// Default per-week scalar policy. Volume/intensity multipliers applied to
// engine output (sets/reps × multipliers) downstream — NOT here.
export const WEEK_POLICY = Object.freeze({
  1: { phase: 'load',   volumeMul: 1.00, intensityMul: 1.00 },
  2: { phase: 'load',   volumeMul: 1.00, intensityMul: 1.00 },
  3: { phase: 'load',   volumeMul: 1.00, intensityMul: 1.00 },
  4: { phase: 'load',   volumeMul: 1.00, intensityMul: 1.00 },
  5: { phase: 'deload', volumeMul: 0.55, intensityMul: 0.875 }, // ~45% vol cut, ~12.5% intensity cut
});

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Read state from storage. Returns null when nothing initialized.
 *
 * @param {Storage} [storage]
 * @returns {{ cycleStartDate: string, deloadSkippedAt: number|null }|null}
 */
export function getState(storage) {
  const s = _resolve(storage);
  if (!s) return null;
  try {
    const raw = s.getItem(LINEAR_BLOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Initialize the cycle (or reset it). `cycleStartDate` defaults to today.
 *
 * @param {{ cycleStartDate?: string, storage?: Storage, now?: number }} [opts]
 */
export function initCycle(opts = {}) {
  const s = _resolve(opts.storage);
  if (!s) return;
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const startDate = opts.cycleStartDate || _toIsoDate(new Date(now));
  const state = { cycleStartDate: startDate, deloadSkippedAt: null };
  try { s.setItem(LINEAR_BLOCK_KEY, JSON.stringify(state)); } catch {}
}

/**
 * Compute current cycle week (1..5) given today's date and the stored
 * cycle start. Day 0-6 = Week 1, Day 7-13 = Week 2, ... Day 28-34 = Week 5,
 * then Day 35+ wraps to Week 1 of the next cycle.
 *
 * @param {{ today?: Date, storage?: Storage }} [opts]
 * @returns {number} 1..5
 */
export function getCycleWeek(opts = {}) {
  const state = getState(opts.storage);
  if (!state || !state.cycleStartDate) return 1;
  const today = opts.today || new Date();
  const start = _parseIsoDate(state.cycleStartDate);
  if (!start) return 1;
  const daysElapsed = Math.max(0, Math.floor((_dateOnly(today) - start.getTime()) / ONE_DAY_MS));
  return ((daysElapsed % 35) >>> 0) >= 0
    ? Math.floor((daysElapsed % 35) / 7) + 1
    : 1;
}

/**
 * Returns true if the current week is the deload week (Week 5).
 *
 * @param {{ today?: Date, storage?: Storage }} [opts]
 * @returns {boolean}
 */
export function isDeloadWeek(opts = {}) {
  return getCycleWeek(opts) === 5;
}

/**
 * Returns the policy for the current week.
 *
 * @param {{ today?: Date, storage?: Storage }} [opts]
 * @returns {{ phase: string, volumeMul: number, intensityMul: number, week: number }}
 */
export function getWeekPolicy(opts = {}) {
  const week = getCycleWeek(opts);
  const policies = /** @type {Record<number, {phase: string, volumeMul: number, intensityMul: number}>} */ (WEEK_POLICY);
  const policy = policies[week] || policies[1] || { phase: 'load', volumeMul: 1.0, intensityMul: 1.0 };
  return { ...policy, week };
}

/**
 * Mark the deload as skipped for this cycle. The session-level UI then
 * surfaces a soft SafetyBanner using `getDeloadSkipWarning()` wording.
 *
 * @param {{ storage?: Storage, now?: number }} [opts]
 */
export function markDeloadSkipped(opts = {}) {
  const s = _resolve(opts.storage);
  if (!s) return;
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  /** @type {{ cycleStartDate: string, deloadSkippedAt: number | null }} */
  const state = getState(s) || { cycleStartDate: _toIsoDate(new Date(now)), deloadSkippedAt: null };
  state.deloadSkippedAt = now;
  try { s.setItem(LINEAR_BLOCK_KEY, JSON.stringify(state)); } catch {}
}

/**
 * Returns true if the user has explicitly skipped the deload for the
 * current cycle (and we're still in the deload week). Resets when the
 * cycle wraps to Week 1.
 *
 * @param {{ today?: Date, storage?: Storage }} [opts]
 * @returns {boolean}
 */
export function isDeloadSkipped(opts = {}) {
  const state = getState(opts.storage);
  if (!state || !state.deloadSkippedAt) return false;
  if (!isDeloadWeek(opts)) return false;
  // Same-cycle invariant: if the skip predates the current cycle start
  // (e.g. re-init), treat as not skipped.
  const start = _parseIsoDate(state.cycleStartDate);
  if (!start) return false;
  return state.deloadSkippedAt >= start.getTime();
}

/**
 * Banner payload for the deload-skip soft warning. Returns null when no
 * banner should render (not deload week, or skip not invoked).
 *
 * @param {{ today?: Date, storage?: Storage }} [opts]
 * @returns {{ severity: 'warning', message: string, dismissId: string }|null}
 */
export function getDeloadSkipBanner(opts = {}) {
  if (!isDeloadSkipped(opts)) return null;
  return {
    severity: 'warning',
    message: getDeloadSkipWarning(),
    dismissId: 'linearBlock-deload-skip',
  };
}

/**
 * Convenience for dashboard display — formatted week label.
 *
 * @param {{ today?: Date, storage?: Storage }} [opts]
 * @returns {string}
 */
export function getWeekLabel(opts = {}) {
  return `Saptamana ${getCycleWeek(opts)}/5`;
}

// ── internals ───────────────────────────────────────────────────────────

/** @param {Date} d */
function _toIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** @param {unknown} s */
function _parseIsoDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const parts = s.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y == null || m == null || d == null) return null;
  return new Date(y, m - 1, d);
}

/** @param {Date} d */
function _dateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** @param {Storage | null | undefined} override */
function _resolve(override) {
  if (override) return override;
  try { return typeof localStorage !== 'undefined' ? localStorage : null; }
  catch { return null; }
}
