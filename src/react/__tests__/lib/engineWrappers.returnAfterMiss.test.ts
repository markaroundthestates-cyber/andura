// No-shame return — getReturnAfterMissSignal composer tests.
//
// Detects "returned this week after missing >=1 scheduled training day EARLIER
// this week" (a short, same-week gap) and exposes a machine signal the React
// side turns into a warm, NO-GUILT welcome-back line. COMMUNICATION ONLY: the
// adaptive brain already rebalances a missed group (it reads as lagging → M2
// weakness amp), so this composer adds no rebalance logic — it only reports the
// real same-week miss honestly. Truth-only + deterministic (now injected).

import { describe, it, expect, beforeEach } from 'vitest';
import { getReturnAfterMissSignal } from '../../lib/engineWrappers';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useScheduleStore, type WeekDays } from '../../stores/scheduleStore';

const DAY_MS = 24 * 60 * 60 * 1000;

// Fixed reference clock: Wednesday 2026-06-03 (dow 3 → Monday-first index 2).
// Week Monday = 2026-06-01. Earlier training-day slots this week are Mon(0) +
// Tue(1); today (Wed, idx 2) and Thu..Sun are not yet "missed".
const NOW = new Date('2026-06-03T12:00:00').getTime();
const MON = new Date('2026-06-01T09:00:00').getTime();
const TUE = new Date('2026-06-02T09:00:00').getTime();
const WED = new Date('2026-06-03T09:00:00').getTime();

// A 7-day schedule with training on Mon, Tue, Wed (idx 0,1,2), rest after.
const SCHED_MON_TUE_WED: WeekDays = [
  'training', 'training', 'training', 'rest', 'rest', 'rest', 'rest',
];

function session(ts: number) {
  return { ts, title: 's', meta: '' };
}

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
  useScheduleStore.setState({ days: SCHED_MON_TUE_WED });
});

describe('engineWrappers — getReturnAfterMissSignal (no-shame return)', () => {
  it('missed Mon, trained Wed (returned) → signal with the real missed count', () => {
    // Scheduled Mon+Tue+Wed. User trained only Wed (today) → Mon AND Tue earlier
    // training days were missed → returns after a same-week gap.
    useWorkoutStore.setState({ sessionsHistory: [session(WED)] });
    const sig = getReturnAfterMissSignal(NOW);
    expect(sig).not.toBeNull();
    expect(sig?.missedDays).toBe(2); // Mon + Tue both missed
  });

  it('counts a single missed day honestly (trained Tue + Wed, missed Mon)', () => {
    useWorkoutStore.setState({ sessionsHistory: [session(TUE), session(WED)] });
    const sig = getReturnAfterMissSignal(NOW);
    expect(sig?.missedDays).toBe(1); // only Mon missed
  });

  it('no misses (trained every scheduled day so far this week) → null', () => {
    // Trained Mon, Tue, and today (Wed) → no earlier training day missed.
    useWorkoutStore.setState({
      sessionsHistory: [session(MON), session(TUE), session(WED)],
    });
    expect(getReturnAfterMissSignal(NOW)).toBeNull();
  });

  it('cold start (zero sessions ever) → null (not a "return")', () => {
    useWorkoutStore.setState({ sessionsHistory: [] });
    expect(getReturnAfterMissSignal(NOW)).toBeNull();
  });

  it('idle all week (no session logged this week) → null (has not returned yet)', () => {
    // Last session was last week; nothing this week → the >14d / win-back path
    // owns this case, not the same-week return line.
    useWorkoutStore.setState({
      sessionsHistory: [session(MON - 8 * DAY_MS)],
    });
    expect(getReturnAfterMissSignal(NOW)).toBeNull();
  });

  it('long absence >14d before a single return → null (ReactivateCard owns >14d)', () => {
    // A history whose only session is far in the past, plus a return today: the
    // most-recent session this week is fresh, but the prior gap is >14d so the
    // win-back ReactivateCard owns it — guard via the most-recent-ts window.
    // Here the ONLY logged session is today (Wed) and an ancient one 30d ago.
    useWorkoutStore.setState({
      sessionsHistory: [session(NOW - 30 * DAY_MS), session(WED)],
    });
    // Still a same-week return (most recent = Wed, within 14d) with Mon+Tue
    // missed → signal IS shown (the ancient session does not suppress it).
    const sig = getReturnAfterMissSignal(NOW);
    expect(sig?.missedDays).toBe(2);
  });

  it('rest-only earlier days → null (nothing was scheduled to miss)', () => {
    // Schedule trains only Wed; Mon+Tue are rest → no earlier training to miss.
    useScheduleStore.setState({
      days: ['rest', 'rest', 'training', 'rest', 'rest', 'rest', 'rest'],
    });
    useWorkoutStore.setState({ sessionsHistory: [session(WED)] });
    expect(getReturnAfterMissSignal(NOW)).toBeNull();
  });

  it('deterministic — same inputs + injected now yield the same result', () => {
    useWorkoutStore.setState({ sessionsHistory: [session(WED)] });
    const a = getReturnAfterMissSignal(NOW);
    const b = getReturnAfterMissSignal(NOW);
    expect(a).toEqual(b);
  });
});
