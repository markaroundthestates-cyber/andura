// ── Calendar override storage (edges) ─────────────────────────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { CALENDAR_OVERRIDE_KEY } from './constants.js';
import { getWeekStartIso } from './dateHelpers.js';

/**
 * Read the current calendar override from localStorage. Returns null when
 * absent OR when the stored override is from a prior ISO week (Reset Luni
 * naturally invalidates — no manual reset required, no Date.now timing race).
 *
 * @param {Date} [now=new Date()] injected for deterministic testing
 * @returns {{selectedDays: Array, weekStartIso: string, committedAt: string}|null}
 */
export function getCalendarOverride(now = new Date()) {
  let raw = null;
  try {
    raw = localStorage.getItem(CALENDAR_OVERRIDE_KEY);
  } catch { return null; }
  if (!raw) return null;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!parsed || typeof parsed !== 'object') return null;
  const currentWeekIso = getWeekStartIso(now);
  if (parsed.weekStartIso !== currentWeekIso) return null;
  if (!Array.isArray(parsed.selectedDays)) return null;
  return parsed;
}

/**
 * Commit a calendar edit — persists selectedDays with current ISO week tag.
 * Past-week mid-week clarification: days 0..todayIdx-1 caller-side passed
 * invariant (UI should preserve trecut bifate); this function does NOT
 * enforce that constraint — it stores whatever caller passes. Detect
 * mid-week via detectMidWeekEdit() helper before calling commit.
 *
 * Returns the persisted override object for caller convenience.
 *
 * @param {Array<{day: string, active: boolean}>} selectedDays
 * @param {Date} [now=new Date()] injected for deterministic testing
 * @returns {{selectedDays: Array, weekStartIso: string, committedAt: string}}
 */
export function commitCalendarEdit(selectedDays, now = new Date()) {
  const safe = Array.isArray(selectedDays) ? selectedDays.slice(0, 7) : [];
  const override = {
    selectedDays:  safe,
    weekStartIso:  getWeekStartIso(now),
    committedAt:   now.toISOString(),
  };
  try {
    localStorage.setItem(CALENDAR_OVERRIDE_KEY, JSON.stringify(override));
  } catch { /* storage quota / disabled — accept silent loss, engines fallback to preset */ }
  return override;
}

/**
 * Clear the calendar override unconditionally. Caller responsibility (e.g.,
 * settings reset button OR explicit "Reset saptamana" UI). Reset Luni
 * natural via week-key tag in getCalendarOverride() — this is for explicit
 * resets, not automatic.
 */
export function resetWeekOverride() {
  try { localStorage.removeItem(CALENDAR_OVERRIDE_KEY); } catch { /* noop */ }
}
