'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isDueNow,
  isWeeklySummaryDue,
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
