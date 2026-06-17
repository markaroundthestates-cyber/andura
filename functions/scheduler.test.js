'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isDueNow,
  isWeeklySummaryDue,
  isDailyCoachDue,
  isSessionMissedDue,
  inQuietHours,
  hasSessionLoggedToday,
  parseTimeToMinutes,
  firstActiveDayIndex,
  bucharestParts,
} = require('./scheduler');

// All test instants use WINTER 2026 (January) so Europe/Bucharest = UTC+2
// (EET, no DST). That makes UTC+2 == local, so a UTC Date of HH:MM corresponds
// to local (HH+2):MM. Deterministic and DST-stable.
//
// Reference calendar (Jan 2026):
//   Mon 2026-01-05, Tue 06, Wed 07, Thu 08, Fri 09, Sat 10, Sun 11.
// prefs.days index: 0=Monday .. 6=Sunday.

/** Build a UTC instant whose Europe/Bucharest wall clock (winter) is the args. */
function localWinter(year, monthIdx, day, localHour, localMin) {
  // local = UTC + 2 in winter -> UTC hour = localHour - 2.
  return new Date(Date.UTC(year, monthIdx, day, localHour - 2, localMin, 0));
}

const allDays = [true, true, true, true, true, true, true];
const mondayOnly = [true, false, false, false, false, false, false];

function basePrefs(overrides = {}) {
  return {
    enabled: true,
    frequency: 'zilnic',
    days: allDays,
    time: '18:00',
    events: { 'session-reminder': true },
    ...overrides,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

test('bucharestParts: winter UTC+2 maps Monday 18:05 correctly', () => {
  const now = localWinter(2026, 0, 5, 18, 5); // Mon 18:05 local
  const { weekdayMon0, minutes } = bucharestParts(now);
  assert.equal(weekdayMon0, 0); // Monday
  assert.equal(minutes, 18 * 60 + 5);
});

test('bucharestParts: Sunday is index 6', () => {
  const { weekdayMon0 } = bucharestParts(localWinter(2026, 0, 11, 10, 0));
  assert.equal(weekdayMon0, 6);
});

test('parseTimeToMinutes: valid + invalid', () => {
  assert.equal(parseTimeToMinutes('18:00'), 1080);
  assert.equal(parseTimeToMinutes('07:30'), 450);
  assert.equal(parseTimeToMinutes('00:00'), 0);
  assert.equal(parseTimeToMinutes('23:59'), 1439);
  assert.equal(parseTimeToMinutes('24:00'), null);
  assert.equal(parseTimeToMinutes('9:99'), null);
  assert.equal(parseTimeToMinutes('abc'), null);
  assert.equal(parseTimeToMinutes(undefined), null);
});

test('firstActiveDayIndex', () => {
  assert.equal(firstActiveDayIndex([false, false, true, false]), 2);
  assert.equal(firstActiveDayIndex(mondayOnly), 0);
  assert.equal(firstActiveDayIndex([false, false, false]), -1);
  assert.equal(firstActiveDayIndex(undefined), -1);
});

test('zilnic: active day at exact matching time = true', () => {
  const prefs = basePrefs({ time: '18:00' });
  const now = localWinter(2026, 0, 5, 18, 0); // Mon 18:00
  assert.equal(isDueNow(prefs, now), true);
});

test('zilnic: time inside the 15-min tick window = true', () => {
  const prefs = basePrefs({ time: '18:10' });
  // tick covering 18:10 is [18:00, 18:15); now anywhere in that tick fires it.
  const now = localWinter(2026, 0, 5, 18, 0); // tick start 18:00
  assert.equal(isDueNow(prefs, now), true);
});

test('zilnic: time outside the tick window = false', () => {
  const prefs = basePrefs({ time: '18:20' }); // belongs to [18:15, 18:30)
  const now = localWinter(2026, 0, 5, 18, 0); // tick [18:00, 18:15)
  assert.equal(isDueNow(prefs, now), false);
});

test('zilnic: time in a different tick than now = false', () => {
  const prefs = basePrefs({ time: '18:00' });
  const now = localWinter(2026, 0, 5, 18, 30); // tick [18:30, 18:45)
  assert.equal(isDueNow(prefs, now), false);
});

test('off frequency = always false even at matching time', () => {
  const prefs = basePrefs({ frequency: 'off', time: '18:00' });
  const now = localWinter(2026, 0, 5, 18, 0);
  assert.equal(isDueNow(prefs, now), false);
});

test('enabled false = false', () => {
  const prefs = basePrefs({ enabled: false, time: '18:00' });
  const now = localWinter(2026, 0, 5, 18, 0);
  assert.equal(isDueNow(prefs, now), false);
});

test('wrong day (day inactive in prefs.days) = false', () => {
  const prefs = basePrefs({ days: mondayOnly, time: '18:00' });
  const now = localWinter(2026, 0, 6, 18, 0); // Tuesday, not active
  assert.equal(isDueNow(prefs, now), false);
});

test('zilnic on the one active day = true', () => {
  const prefs = basePrefs({ days: mondayOnly, time: '18:00' });
  const now = localWinter(2026, 0, 5, 18, 0); // Monday active
  assert.equal(isDueNow(prefs, now), true);
});

test('saptamanal: fires only on FIRST active day', () => {
  // Active days: Wed(2), Fri(4). First active = Wed.
  const days = [false, false, true, false, true, false, false];
  const prefs = basePrefs({ frequency: 'saptamanal', days, time: '18:00' });
  const wed = localWinter(2026, 0, 7, 18, 0);
  const fri = localWinter(2026, 0, 9, 18, 0);
  assert.equal(isDueNow(prefs, wed), true); // first active day fires
  assert.equal(isDueNow(prefs, fri), false); // later active day suppressed
});

test('saptamanal: first active day but wrong time tick = false', () => {
  const days = [false, false, true, false, true, false, false];
  const prefs = basePrefs({ frequency: 'saptamanal', days, time: '18:00' });
  const wedWrongTick = localWinter(2026, 0, 7, 19, 0);
  assert.equal(isDueNow(prefs, wedWrongTick), false);
});

test('per-event toggle session-reminder=false suppresses = false', () => {
  const prefs = basePrefs({ time: '18:00', events: { 'session-reminder': false } });
  const now = localWinter(2026, 0, 5, 18, 0);
  assert.equal(isDueNow(prefs, now), false);
});

test('absent events object does not block (default enabled)', () => {
  const prefs = basePrefs({ time: '18:00' });
  delete prefs.events;
  const now = localWinter(2026, 0, 5, 18, 0);
  assert.equal(isDueNow(prefs, now), true);
});

test('malformed time = false (no crash)', () => {
  const prefs = basePrefs({ time: 'nope' });
  const now = localWinter(2026, 0, 5, 18, 0);
  assert.equal(isDueNow(prefs, now), false);
});

test('null prefs = false (no crash)', () => {
  assert.equal(isDueNow(null, localWinter(2026, 0, 5, 18, 0)), false);
  assert.equal(isDueNow(undefined, new Date()), false);
});

test('weekly summary: Sunday 19:00 tick fires', () => {
  const prefs = basePrefs({ events: { 'weekly-summary': true } });
  const sun = localWinter(2026, 0, 11, 19, 0); // Sunday 19:00
  assert.equal(isWeeklySummaryDue(prefs, sun), true);
});

test('weekly summary: non-Sunday = false', () => {
  const prefs = basePrefs();
  const sat = localWinter(2026, 0, 10, 19, 0);
  assert.equal(isWeeklySummaryDue(prefs, sat), false);
});

test('weekly summary: Sunday wrong time = false', () => {
  const prefs = basePrefs();
  const sun = localWinter(2026, 0, 11, 10, 0);
  assert.equal(isWeeklySummaryDue(prefs, sun), false);
});

test('weekly summary: event toggle off = false', () => {
  const prefs = basePrefs({ events: { 'weekly-summary': false } });
  const sun = localWinter(2026, 0, 11, 19, 0);
  assert.equal(isWeeklySummaryDue(prefs, sun), false);
});

// ── QUIET HOURS (Nu deranja) [22:00, 07:00) ──────────────────────────────────

test('inQuietHours: boundaries of the fixed [22:00, 07:00) window', () => {
  assert.equal(inQuietHours(21 * 60 + 59), false); // 21:59 outside
  assert.equal(inQuietHours(22 * 60), true); // 22:00 start (inclusive)
  assert.equal(inQuietHours(23 * 60 + 30), true); // 23:30 inside
  assert.equal(inQuietHours(2 * 60), true); // 02:00 inside (wraps midnight)
  assert.equal(inQuietHours(6 * 60 + 59), true); // 06:59 inside
  assert.equal(inQuietHours(7 * 60), false); // 07:00 end (exclusive)
  assert.equal(inQuietHours(7 * 60 + 30), false); // 07:30 outside
});

test('quiet hours: a reminder set at 23:00 is SUPPRESSED (Nu deranja)', () => {
  // FAILS before the quiet-hours enforcement: 23:00 is an active day at the
  // matching tick, so isDueNow returned true and the user got pinged at night.
  const prefs = basePrefs({ time: '23:00' });
  const now = localWinter(2026, 0, 5, 23, 0); // Mon 23:00 inside quiet hours
  assert.equal(isDueNow(prefs, now), false);
});

test('quiet hours: a reminder set at 06:30 is SUPPRESSED (early morning)', () => {
  const prefs = basePrefs({ time: '06:30' });
  const now = localWinter(2026, 0, 5, 6, 30); // Mon 06:30 inside quiet hours
  assert.equal(isDueNow(prefs, now), false);
});

test('quiet hours: a reminder at 18:00 (outside) still fires', () => {
  const prefs = basePrefs({ time: '18:00' });
  const now = localWinter(2026, 0, 5, 18, 0);
  assert.equal(isDueNow(prefs, now), true);
});

// ── DAILY COACH (07:30 morning nudge, default ON) ────────────────────────────

test('daily-coach: fires at 07:30 on an active day (default ON, absent toggle)', () => {
  // FAILS before the daily-coach branch existed: nothing fired the morning nudge.
  const prefs = basePrefs({ events: { 'session-reminder': true } }); // no daily-coach key
  const now = localWinter(2026, 0, 5, 7, 30); // Mon 07:30
  assert.equal(isDailyCoachDue(prefs, now), true);
});

test('daily-coach: 07:30 tick window (07:30 in [07:30, 07:45)) = true', () => {
  const prefs = basePrefs();
  const now = localWinter(2026, 0, 5, 7, 30);
  assert.equal(isDailyCoachDue(prefs, now), true);
});

test('daily-coach: wrong tick (08:00) = false', () => {
  const prefs = basePrefs();
  const now = localWinter(2026, 0, 5, 8, 0);
  assert.equal(isDailyCoachDue(prefs, now), false);
});

test('daily-coach: explicit toggle off = false', () => {
  const prefs = basePrefs({ events: { 'daily-coach': false } });
  const now = localWinter(2026, 0, 5, 7, 30);
  assert.equal(isDailyCoachDue(prefs, now), false);
});

test('daily-coach: inactive day = false', () => {
  const prefs = basePrefs({ days: mondayOnly });
  const tue = localWinter(2026, 0, 6, 7, 30); // Tuesday not active
  assert.equal(isDailyCoachDue(prefs, tue), false);
});

test('daily-coach: saptamanal fires only on the FIRST active day', () => {
  const days = [false, false, true, false, true, false, false]; // Wed, Fri
  const prefs = basePrefs({ frequency: 'saptamanal', days });
  assert.equal(isDailyCoachDue(prefs, localWinter(2026, 0, 7, 7, 30)), true); // Wed (first)
  assert.equal(isDailyCoachDue(prefs, localWinter(2026, 0, 9, 7, 30)), false); // Fri later
});

test('daily-coach: off frequency = false', () => {
  const prefs = basePrefs({ frequency: 'off' });
  const now = localWinter(2026, 0, 5, 7, 30);
  assert.equal(isDailyCoachDue(prefs, now), false);
});

// ── SESSION MISSED (opt-in, real missed signal) ──────────────────────────────

test('hasSessionLoggedToday: matches today Europe/Bucharest date', () => {
  const now = localWinter(2026, 0, 5, 20, 0); // Mon 2026-01-05 local
  assert.equal(hasSessionLoggedToday([{ date: '2026-01-05' }], now), true);
  assert.equal(hasSessionLoggedToday([{ date: '2026-01-04' }], now), false);
  assert.equal(hasSessionLoggedToday([], now), false);
  assert.equal(hasSessionLoggedToday(null, now), false);
});

test('session-missed: opt-in + scheduled day + grace passed + NO log today = true', () => {
  // FAILS before the session-missed branch existed: the toggle fired nothing.
  // Reminder 18:00 + 90min grace => check tick 19:30. No log for today.
  const prefs = basePrefs({
    time: '18:00',
    events: { 'session-reminder': true, 'session-missed': true },
  });
  const now = localWinter(2026, 0, 5, 19, 30); // Mon, 90min after 18:00
  assert.equal(isSessionMissedDue(prefs, now, []), true);
});

test('session-missed: a session WAS logged today = false (no miss)', () => {
  const prefs = basePrefs({
    time: '18:00',
    events: { 'session-missed': true },
  });
  const now = localWinter(2026, 0, 5, 19, 30);
  assert.equal(isSessionMissedDue(prefs, now, [{ date: '2026-01-05' }]), false);
});

test('session-missed: DEFAULT OFF (absent toggle) = false', () => {
  const prefs = basePrefs({ time: '18:00' }); // no session-missed key
  const now = localWinter(2026, 0, 5, 19, 30);
  assert.equal(isSessionMissedDue(prefs, now, []), false);
});

test('session-missed: explicit false = false', () => {
  const prefs = basePrefs({ time: '18:00', events: { 'session-missed': false } });
  const now = localWinter(2026, 0, 5, 19, 30);
  assert.equal(isSessionMissedDue(prefs, now, []), false);
});

test('session-missed: before the grace tick (18:00 itself) = false', () => {
  const prefs = basePrefs({ time: '18:00', events: { 'session-missed': true } });
  const now = localWinter(2026, 0, 5, 18, 0); // exactly reminder time, grace not elapsed
  assert.equal(isSessionMissedDue(prefs, now, []), false);
});

test('session-missed: inactive day = false', () => {
  const prefs = basePrefs({
    days: mondayOnly,
    time: '18:00',
    events: { 'session-missed': true },
  });
  const tue = localWinter(2026, 0, 6, 19, 30); // Tuesday not scheduled
  assert.equal(isSessionMissedDue(prefs, tue, []), false);
});

test('session-missed: suppressed in quiet hours even if opted in + missed', () => {
  // Reminder 22:00 + 90min grace => 23:30 check tick, inside quiet hours.
  const prefs = basePrefs({ time: '22:00', events: { 'session-missed': true } });
  const now = localWinter(2026, 0, 5, 23, 30);
  assert.equal(isSessionMissedDue(prefs, now, []), false);
});

test('session-missed: yesterday log does NOT count as today (real signal)', () => {
  const prefs = basePrefs({ time: '18:00', events: { 'session-missed': true } });
  const now = localWinter(2026, 0, 5, 19, 30);
  const yesterday = new Date(now.getTime() - DAY_MS);
  const yKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(yesterday);
  assert.equal(isSessionMissedDue(prefs, now, [{ date: yKey }]), true);
});
