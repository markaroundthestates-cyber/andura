// REGRESSION — engine honors the USER's chosen training days (Daniel live bug
// 2026-06-03). The Calendar UI persists the weekly training/rest pattern in the
// React scheduleStore (`wv2-schedule-store`); the engine USED to ignore it and
// fall back to the frequency-default week (activeWeekForFrequency) whenever no
// explicit calendar edit had been committed (no `wv2-calendar-override`). When
// the user's persisted days differed from the frequency default (e.g. Mon/Wed/
// Fri/Sat vs the freq-4 default Mon/Tue/Thu/Fri), the POSITIONAL split mapping
// shifted → wrong cluster per weekday for EVERY focus/frequency variant.
//
// Daniel's exact case: focusPreset v-taper, frequency '4', persisted days
// Mon/Wed/Fri/Sat. Expected v-taper split ['push','pull','upper','lower'] mapped
// onto HIS days → Mon=PUSH, Wed=PULL, Fri=UPPER, Sat=LOWER. The bug produced
// Mon=PUSH, Wed=UPPER, Fri=LOWER, Sat=LOWER (frequency-default day shift).
//
// The fix: getDailyWorkout derives the active-day week from the scheduleStore
// (what the UI DISPLAYS) before the frequency default. The engine adapts to the
// user's days — it never forces the user onto a fixed week. This locks that
// across the days × focus × frequency matrix.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDailyWorkout, frequencyToSplit } from '../scheduleAdapter.js';

// Real weekday dates (Monday=0 convention) in one ISO week.
const MON = new Date(2026, 4, 18); // L  dayIdx 0
const TUE = new Date(2026, 4, 19); // Ma dayIdx 1
const WED = new Date(2026, 4, 20); // Mi dayIdx 2
const THU = new Date(2026, 4, 21); // J  dayIdx 3
const FRI = new Date(2026, 4, 22); // V  dayIdx 4
const SAT = new Date(2026, 4, 23); // S  dayIdx 5
const DATE_FOR_IDX = [MON, TUE, WED, THU, FRI, SAT];

function buildUserState(user = {}) {
  return {
    user: { age: 30, goal: 'hipertrofie', persona: 'marius', frequency: '4', ...user },
    recentSessions: [],
    weights: {},
    profileTier: 'T2',
    flags: {},
    meta: { weeksElapsed: 0 },
  };
}

// Persist the weekly pattern exactly as the React scheduleStore does (zustand
// persist envelope { state: { days }, version }). `days` is a 7-tuple of
// 'training'|'rest' (Monday=0).
function setScheduleStoreDays(days) {
  localStorage.setItem(
    'wv2-schedule-store',
    JSON.stringify({ state: { weekStartISO: '2026-05-18', days }, version: 0 }),
  );
}

// Expected uppercase session tag for the active day at ordinal `pos` of the
// reshaped split (CLUSTER_TO_SESSION_TAG is the cluster id uppercased).
function expectedTag(activeCount, focus, pos) {
  const split = frequencyToSplit(activeCount, focus);
  return split[Math.min(pos, split.length - 1)].toUpperCase();
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('getDailyWorkout — honors the user-chosen training days (scheduleStore)', () => {
  it("Daniel live case: v-taper @ Mon/Wed/Fri/Sat → PUSH/PULL/UPPER/LOWER (not the freq-default shift)", async () => {
    // Mon/Wed/Fri/Sat — differs from the freq-4 default (Mon/Tue/Thu/Fri).
    setScheduleStoreDays(['training', 'rest', 'training', 'rest', 'training', 'training', 'rest']);
    const state = () => buildUserState({ focusPreset: 'v-taper', frequency: '4' });

    const mon = await getDailyWorkout(state(), MON);
    const wed = await getDailyWorkout(state(), WED);
    const fri = await getDailyWorkout(state(), FRI);
    const sat = await getDailyWorkout(state(), SAT);

    expect(mon.sessionType).toBe('PUSH');
    expect(wed.sessionType).toBe('PULL');
    expect(fri.sessionType).toBe('UPPER');
    expect(sat.sessionType).toBe('LOWER');
  });

  it('the SAME days/focus on the freq-default week would have shifted (proves the bug class)', async () => {
    // No scheduleStore set → engine falls back to the freq-4 default week
    // (Mon/Tue/Thu/Fri). On Daniel's REAL days this is exactly the wrong output
    // he saw. This documents the pre-fix behavior for the fallback path.
    const state = () => buildUserState({ focusPreset: 'v-taper', frequency: '4' });
    const wed = await getDailyWorkout(state(), WED); // Wed is NOT active in the freq-4 default
    // Freq-4 default active = Mon/Tue/Thu/Fri; Wed slots after Mon,Tue (pos 2) → 'upper'.
    expect(wed.sessionType).toBe('UPPER');
  });

  it('matrix: every active day maps to its positional cluster across focus presets', async () => {
    const patterns = [
      // [label, days(7), focus]
      ['v-taper Mon/Wed/Fri/Sat', ['training', 'rest', 'training', 'rest', 'training', 'training', 'rest'], 'v-taper'],
      ['balanced Mon/Tue/Thu/Fri', ['training', 'training', 'rest', 'training', 'training', 'rest', 'rest'], 'balanced'],
      ['balanced Mon/Wed/Fri', ['training', 'rest', 'training', 'rest', 'training', 'rest', 'rest'], 'balanced'],
      ['v-taper Mon/Tue/Wed/Fri/Sat', ['training', 'training', 'training', 'rest', 'training', 'training', 'rest'], 'v-taper'],
    ];
    for (const [, days, focus] of patterns) {
      setScheduleStoreDays(days);
      const activeIdxs = days.map((d, i) => (d === 'training' ? i : -1)).filter((i) => i >= 0);
      const activeCount = activeIdxs.length;
      for (let pos = 0; pos < activeIdxs.length; pos++) {
        const idx = activeIdxs[pos];
        if (idx > 5) continue; // only have weekday Date fixtures Mon..Sat
        const plan = await getDailyWorkout(
          buildUserState({ focusPreset: focus, frequency: String(activeCount) }),
          DATE_FOR_IDX[idx],
        );
        expect(plan.sessionType).toBe(expectedTag(activeCount, focus, pos));
      }
    }
  });

  it('an explicit calendar override still wins over the scheduleStore (deliberate per-week edit)', async () => {
    // scheduleStore says Mon active; override marks Mon REST → override wins → null.
    setScheduleStoreDays(['training', 'rest', 'training', 'rest', 'training', 'training', 'rest']);
    // Build an override for THIS week marking Monday inactive.
    const { commitCalendarEdit } = await import('../scheduleAdapter.js');
    commitCalendarEdit(
      [
        { day: 'L', active: false },
        { day: 'M', active: true },
        { day: 'M2', active: true },
        { day: 'J', active: true },
        { day: 'V', active: true },
        { day: 'S', active: false },
        { day: 'D', active: false },
      ],
      MON,
    );
    const mon = await getDailyWorkout(buildUserState({ focusPreset: 'v-taper' }), MON);
    expect(mon).toBeNull(); // override rest day wins
  });
});
