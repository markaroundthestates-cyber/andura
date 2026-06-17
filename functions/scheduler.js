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

// ── Quiet hours (Nu deranja) ────────────────────────────────────────────────
// The Settings UI displays a FIXED quiet-hours window (SettingsNotifications.tsx
// "22:00 — 07:00") but never syncs a custom range into notificationPrefs, so the
// scheduler enforces that same fixed window: NO send when the local Europe/
// Bucharest time falls within [22:00, 07:00). Half-open at 07:00 so a 07:00 /
// 07:30 daily-coach (the earliest deliberate send) is allowed.
const QUIET_START_MIN = 22 * 60; // 22:00
const QUIET_END_MIN = 7 * 60; // 07:00

/**
 * Is the given minutes-since-midnight inside the quiet-hours window
 * [22:00, 07:00)? The window WRAPS midnight, so it is the UNION of [22:00, 24:00)
 * and [00:00, 07:00).
 * @param {number} minutes minutes-since-midnight, local Europe/Bucharest
 * @returns {boolean}
 */
function inQuietHours(minutes) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return false;
  return minutes >= QUIET_START_MIN || minutes < QUIET_END_MIN;
}

// Daily coach nudge time: 07:30 Europe/Bucharest (just outside quiet hours).
const DAILY_COACH_MIN = 7 * 60 + 30; // 07:30

// Grace after the planned reminder time before a missed session is declared.
const MISSED_GRACE_MIN = 90;

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
 *  - QUIET HOURS: suppressed when the local time is within [22:00, 07:00).
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

  // Quiet hours (Nu deranja): never deliver inside [22:00, 07:00) local. The
  // tick's wall-clock decides — a user who set a reminder for 23:00 simply does
  // not get it (respecting Nu deranja over the configured time).
  if (inQuietHours(nowMinutes)) return false;

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
  if (inQuietHours(nowMinutes)) return false; // Nu deranja (19:00 is outside; defensive)
  if (weekdayMon0 !== 6) return false; // Sunday only
  const target = 19 * 60; // 19:00
  const tickStart = Math.floor(nowMinutes / WINDOW_MINUTES) * WINDOW_MINUTES;
  return target >= tickStart && target < tickStart + WINDOW_MINUTES;
}

/**
 * PURE decision: should the DAILY-COACH nudge fire for these prefs at `now`?
 * A short morning coach message at 07:30 Europe/Bucharest on an ACTIVE training
 * day. Mirrors isDueNow's day/frequency gating but on the FIXED 07:30 slot
 * (independent of the user's configured reminder time).
 *
 * Contract:
 *  - prefs.enabled true + frequency not 'off' (zilnic / saptamanal).
 *  - prefs.events['daily-coach'] !== false (DEFAULT ON — absent => enabled).
 *  - 07:30 must fall within the current 15-min tick window.
 *  - prefs.days[weekdayMon0] active; 'saptamanal' => only the FIRST active day.
 *  - 07:30 is just outside quiet hours, but the inQuietHours guard is applied
 *    for symmetry (a future earlier slot would be suppressed).
 *
 * @param {object} prefs
 * @param {Date} now
 * @returns {boolean}
 */
function isDailyCoachDue(prefs, now) {
  if (!prefs || prefs.enabled !== true) return false;
  if (prefs.frequency !== 'zilnic' && prefs.frequency !== 'saptamanal') {
    return false;
  }
  // DEFAULT ON: only block when explicitly false.
  if (prefs.events && prefs.events['daily-coach'] === false) return false;

  const { weekdayMon0, minutes: nowMinutes } = bucharestParts(now);
  if (inQuietHours(nowMinutes)) return false; // Nu deranja

  const days = prefs.days;
  if (!Array.isArray(days) || days[weekdayMon0] !== true) return false;
  if (prefs.frequency === 'saptamanal' && firstActiveDayIndex(days) !== weekdayMon0) {
    return false;
  }

  const tickStart = Math.floor(nowMinutes / WINDOW_MINUTES) * WINDOW_MINUTES;
  return DAILY_COACH_MIN >= tickStart && DAILY_COACH_MIN < tickStart + WINDOW_MINUTES;
}

/**
 * PURE decision: should a SESSION-MISSED nudge fire for these prefs at `now`?
 *
 * Fires when the user OPTED IN (prefs.events['session-missed'] === true — this
 * toggle DEFAULTS OFF, so it is never sent unless explicitly enabled) AND there
 * is a REAL missed-session signal: today is a scheduled training day whose
 * configured time has already passed, and NO session was logged for today.
 *
 * The missed-session signal is derived from the user's durable `logs` (a
 * SYNC_KEY written to RTDB users/{uid}/logs, so the Cloud Function has it
 * server-side). Each log row carries a `date` ('YYYY-MM-DD'); a session counts
 * as logged today when any row's date equals today's Europe/Bucharest date. To
 * avoid double-firing across the 15-min ticks, the nudge fires ONLY in the
 * single tick exactly MISSED_GRACE_MIN after the configured reminder time.
 *
 * DATA DEPENDENCY: requires `logs` (and today's date). When `logs` is absent
 * (not yet synced) the function CANNOT prove a miss, so it returns false (never
 * fabricate a miss) — the branch is implemented but only fires on a real signal.
 *
 * @param {object} prefs notificationPrefs node
 * @param {Date} now current instant (UTC; converted to Europe/Bucharest)
 * @param {Array<{date?: string}>} logs the user's logged sessions (RTDB logs)
 * @returns {boolean}
 */
function isSessionMissedDue(prefs, now, logs) {
  if (!prefs || prefs.enabled !== true) return false;
  if (prefs.frequency === 'off') return false;
  // OPT-IN only: this event DEFAULTS OFF, so require an EXPLICIT true.
  if (!prefs.events || prefs.events['session-missed'] !== true) return false;

  const timeMinutes = parseTimeToMinutes(prefs.time);
  if (timeMinutes === null) return false;

  const { weekdayMon0, minutes: nowMinutes } = bucharestParts(now);
  if (inQuietHours(nowMinutes)) return false; // Nu deranja

  const days = prefs.days;
  if (!Array.isArray(days) || days[weekdayMon0] !== true) return false;
  // 'saptamanal' only schedules the first active day, so a miss is only real there.
  if (prefs.frequency === 'saptamanal' && firstActiveDayIndex(days) !== weekdayMon0) {
    return false;
  }

  // Fire ONE tick, MISSED_GRACE_MIN after the planned time (the user had a grace
  // window to start). The check time wraps the day at 24h is impossible here
  // (reminder times are < 24:00 and the grace is small), and a check time pushed
  // into quiet hours is already suppressed by the inQuietHours guard above.
  const checkMin = timeMinutes + MISSED_GRACE_MIN;
  const tickStart = Math.floor(nowMinutes / WINDOW_MINUTES) * WINDOW_MINUTES;
  if (!(checkMin >= tickStart && checkMin < tickStart + WINDOW_MINUTES)) return false;

  // Real missed signal: no session logged for TODAY's local date.
  return !hasSessionLoggedToday(logs, now);
}

/**
 * Today's Europe/Bucharest date as 'YYYY-MM-DD' (DST-safe via Intl).
 * @param {Date} now
 * @returns {string}
 */
function bucharestDateKey(now) {
  // 'en-CA' renders ISO 'YYYY-MM-DD'.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Was any session logged for TODAY (Europe/Bucharest)? True when a `logs` row's
 * `date` equals today's local date key. Defensive: a non-array / empty logs =>
 * false (no proof of a session => the caller treats it as a potential miss only
 * when the user opted in AND it is a scheduled day past the grace window).
 * @param {Array<{date?: string}>} logs
 * @param {Date} now
 * @returns {boolean}
 */
function hasSessionLoggedToday(logs, now) {
  if (!Array.isArray(logs) || logs.length === 0) return false;
  const today = bucharestDateKey(now);
  for (const row of logs) {
    if (row && typeof row.date === 'string' && row.date === today) return true;
  }
  return false;
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

// Daily-coach morning nudge — a short, truthful coach line (NO fabricated stats).
const DAILY_COACH = {
  title: 'Andura',
  body: 'Buna dimineata. Esti gata de antrenamentul de azi?',
};

// Session-missed — a no-guilt nudge that today's planned session is still open.
const SESSION_MISSED = {
  title: 'Andura',
  body: 'Ti-ai sarit antrenamentul de azi? Inca e timp pentru o sesiune scurta.',
};

module.exports = {
  WINDOW_MINUTES,
  isDueNow,
  isWeeklySummaryDue,
  isDailyCoachDue,
  isSessionMissedDue,
  inQuietHours,
  hasSessionLoggedToday,
  parseTimeToMinutes,
  firstActiveDayIndex,
  bucharestParts,
  DAILY_REMINDER,
  WEEKLY_SUMMARY,
  DAILY_COACH,
  SESSION_MISSED,
};
