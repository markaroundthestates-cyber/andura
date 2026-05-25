// ══ ADMIN CLEANUP HELPERS — pure functions for unit testing (§56.14.A) ═════
// Per `06-sessions-log/_FROZEN/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.14.A.
// Pure helpers extracted from `scripts/admin-cleanup.js` for vitest coverage.

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Determine if archive timestamp falls outside 7-day grace window.
 * @param {number} timestamp
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
export function isExpiredArchive(timestamp, now = Date.now()) {
  return typeof timestamp === 'number' && timestamp < (now - SEVEN_DAYS_MS);
}

/**
 * Determine if soft-delete is past hard-delete schedule.
 * @param {number} scheduledHardDelete
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
export function isPastHardDeleteSchedule(scheduledHardDelete, now = Date.now()) {
  return typeof scheduledHardDelete === 'number' && scheduledHardDelete < now;
}
