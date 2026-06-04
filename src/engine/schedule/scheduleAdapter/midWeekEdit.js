// ── Mid-week edit detection (pure) ────────────────────────────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

import { DAY_LABELS } from './constants.js';

/**
 * Split selected days into past (invariant) + future (recomputable) per
 * Daniel verbatim 2026-05-12 LOCK clarification:
 *   "zilele trecute raman bifate si se recalibreaza restul"
 *
 * Edge cases:
 *   - Edit on Monday (todayIdx=0): all 7 days recomputable (week fresh start).
 *   - Edit on Sunday (todayIdx=6): days 0..5 invariant, only Sunday recomputable.
 *
 * @param {Array<{day: string, active: boolean}>} selectedDays array length 7
 * @param {number} todayIdx integer 0..6 (Monday=0 ... Sunday=6)
 * @returns {{past: Array, future: Array, todayIdx: number}}
 */
export function detectMidWeekEdit(selectedDays, todayIdx) {
  const safe = Array.isArray(selectedDays) ? selectedDays.slice(0, 7) : [];
  while (safe.length < 7) safe.push({ day: DAY_LABELS[safe.length], active: false });
  const idx = Number.isInteger(todayIdx) && todayIdx >= 0 && todayIdx <= 6 ? todayIdx : 0;
  return {
    past:     safe.slice(0, idx),
    future:   safe.slice(idx),
    todayIdx: idx,
  };
}
