// ── Date helpers (pure) ──────────────────────────────────────────────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.

/**
 * Map a JavaScript Date object to day-of-week index where Monday=0 ... Sunday=6.
 * Engine-internal convention matches Calendar V1 spec week starts Monday.
 *
 * @param {Date} date
 * @returns {number} integer 0..6 (Monday=0)
 */
export function mapDateToIndex(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 0;
  const jsDow = date.getDay(); // Sunday=0 ... Saturday=6
  return jsDow === 0 ? 6 : jsDow - 1;
}

/**
 * Get ISO week-start (Monday) for a given date, in YYYY-MM-DD format. Used to
 * tag calendar override storage with a week-key so Reset Luni naturally
 * invalidates override when crossing week boundary.
 *
 * @param {Date} date
 * @returns {string} YYYY-MM-DD of Monday in this date's week
 */
export function getWeekStartIso(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const todayIdx = mapDateToIndex(date);
  const monday = new Date(date);
  monday.setDate(monday.getDate() - todayIdx);
  return monday.toLocaleDateString('sv'); // YYYY-MM-DD local timezone
}
