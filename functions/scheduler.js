'use strict';

// Andura FCM scheduler - PURE logic (no I/O, no Date.now inside).
// `now` is always passed in so this module is fully testable via node --test.

// Tick window of the scheduled function. Cron runs every 15 minutes, so a
// reminder is "due" if its configured time falls within the current tick:
// [tickStart, tickStart + WINDOW_MINUTES). Keeping it exactly 15 avoids both
// double-fires and missed fires across consecutive ticks.
const WINDOW_MINUTES = 15;

/**
 * Convert a Date into Europe/Bucharest wall-clock fields (handles DST via
 * Intl, no hard-coded offset). Returns { weekdayMon0, minutes } where
 * weekdayMon0 is 0=Monday ... 6=Sunday (matches prefs.days indexing) and
 * minutes is minutes-since-midnight local time.
 * @param {Date} now
 * @returns {{ weekdayMon0: number, minutes: number }}
 */
function bucharestParts(now) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Bucharest',
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = fmt.formatToParts(now);
  let weekday = 'Mon';
  let hour = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === 'weekday') weekday = p.value;
    else if (p.type === 'hour') hour = parseInt(p.value, 10);
    else if (p.type === 'minute') minute = parseInt(p.value, 10);
  }
  // en-GB 'short' weekday -> Mon-indexed (0=Monday ... 6=Sunday).
  const map = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const weekdayMon0 = map[weekday] !== undefined ? map[weekday] : 0;
  // Node's en-GB sometimes renders midnight as '24'; normalize to 0.
  if (hour === 24) hour = 0;
  return { weekdayMon0, minutes: hour * 60 + minute };
}

/**
 * Parse 'HH:MM' (24h) into minutes-since-midnight. Returns null if malformed.
 * @param {string} time
 * @returns {number|null}
 */
function parseTimeToMinutes(time) {
  if (typeof time !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Index (0=Monday ... 6=Sunday) of the first active day in prefs.days, or -1
 * if none active.
 * @param {boolean[]} days
 * @returns {number}
 */
function firstActiveDayIndex(days) {
  if (!Array.isArray(days)) return -1;
  for (let i = 0; i < days.length; i++) {
    if (days[i]) return i;
  }
  return -1;
}

/**
 * PURE decision: should the daily reminder fire for these prefs at `now`?
 *
 * Contract:
 *  - prefs.enabled must be true; otherwise false.
 *  - prefs.frequency: 'off' -> always false; 'zilnic' -> fires on any active
 *    day; 'saptamanal' -> fires only on the FIRST active day of the week.
 *  - prefs.days[weekdayMon0] (0=Mon..6=Sun) must be true for the current day.
 *  - prefs.time ('HH:MM') must fall within the current 15-min tick window:
 *    tickStartMinutes <= timeMinutes < tickStartMinutes + 15, where
 *    tickStartMinutes = floor(nowMinutes / 15) * 15.
 *  - Honors the per-event toggle prefs.events['session-reminder'] when present
 *    (absent/undefined -> treated as enabled; explicit false -> false).
 *
 * @param {object} prefs notificationPrefs node
 * @param {Date} now current instant (UTC Date; converted to Europe/Bucharest)
 * @returns {boolean}
 */
function isDueNow(prefs, now) {
  if (!prefs || prefs.enabled !== true) return false;
  if (prefs.frequency === 'off') return false;
  if (prefs.frequency !== 'zilnic' && prefs.frequency !== 'saptamanal') {
    return false;
  }
  // Per-event toggle: only block when explicitly false.
  if (prefs.events && prefs.events['session-reminder'] === false) return false;

  const timeMinutes = parseTimeToMinutes(prefs.time);
  if (timeMinutes === null) return false;

  const { weekdayMon0, minutes: nowMinutes } = bucharestParts(now);

  const days = prefs.days;
  if (!Array.isArray(days) || days[weekdayMon0] !== true) return false;

  if (prefs.frequency === 'saptamanal') {
    if (firstActiveDayIndex(days) !== weekdayMon0) return false;
  }

  const tickStart = Math.floor(nowMinutes / WINDOW_MINUTES) * WINDOW_MINUTES;
  return timeMinutes >= tickStart && timeMinutes < tickStart + WINDOW_MINUTES;
}

/**
 * PURE decision: should the weekly summary fire? V1 = Sunday evening tick that
 * contains 19:00 Europe/Bucharest, gated by prefs and the weekly-summary event
 * toggle. Independent of the daily reminder time.
 * @param {object} prefs
 * @param {Date} now
 * @returns {boolean}
 */
function isWeeklySummaryDue(prefs, now) {
  if (!prefs || prefs.enabled !== true) return false;
  if (prefs.frequency === 'off') return false;
  if (prefs.events && prefs.events['weekly-summary'] === false) return false;
  const { weekdayMon0, minutes: nowMinutes } = bucharestParts(now);
  if (weekdayMon0 !== 6) return false; // Sunday only
  const target = 19 * 60; // 19:00
  const tickStart = Math.floor(nowMinutes / WINDOW_MINUTES) * WINDOW_MINUTES;
  return target >= tickStart && target < tickStart + WINDOW_MINUTES;
}

// Romanian no-diacritics notification copy (V1 minimal). Vault docs may use
// diacritics, but user-facing strings stay diacritic-free per D-LEGACY-064.
const DAILY_REMINDER = {
  title: 'Andura',
  body: 'E timpul pentru antrenament. Hai sa misti putin azi.',
};

const WEEKLY_SUMMARY = {
  title: 'Andura',
  body: 'Sumarul saptamanii e gata. Vezi cum ai progresat.',
};

module.exports = {
  WINDOW_MINUTES,
  isDueNow,
  isWeeklySummaryDue,
  parseTimeToMinutes,
  firstActiveDayIndex,
  bucharestParts,
  DAILY_REMINDER,
  WEEKLY_SUMMARY,
};
