// ══ workoutStore — mid-workout reload RESUMES live sets (08.063) ════════════
// Pre-fix partialize persisted only pausedSnapshot/lastSession/history-summary;
// an ACTIVE session (user logging sets live) lost ALL logged sets + position on
// an accidental reload (mobile swipe-refresh, tab crash, PWA OS-kill). The fix
// persists the in-progress live fields (sessionStart/exIdx/setIdx/phase/history/
// prHit/prData) so a reload resumes the session. These tests assert the persist
// payload carries those fields and that the restored state reads as 'active'.

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore, getCurrentMode } from '../../stores/workoutStore';

const PERSIST_KEY = 'wv2-workout-store';

beforeEach(() => {
  localStorage.clear();
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, prData: null, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null, lastSession: null,
    sessionsHistory: [], streak: 0, lastStreakDate: null, sessionContext: null,
    refusalTriedByEx: {},
  });
});

/** Read the zustand-persist snapshot's `state` object from localStorage. */
function persistedState(): Record<string, unknown> {
  const raw = localStorage.getItem(PERSIST_KEY);
  if (!raw) return {};
  return (JSON.parse(raw).state ?? {}) as Record<string, unknown>;
}

describe('workoutStore live-session persistence (08.063)', () => {
  it('persists the in-progress live session fields after logging a set', () => {
    const store = useWorkoutStore.getState();
    store.startSession(123456);
    store.logSet(0, { kg: 80, reps: 8, rating: 'potrivit' });
    store.logSet(0, { kg: 80, reps: 7, rating: 'greu' });
    store.setPhase('rest');

    const ps = persistedState();
    expect(ps.sessionStart).toBe(123456);
    expect(ps.phase).toBe('rest');
    // The logged sets survive (history persisted, not just the summary).
    const history = ps.history as Record<string, unknown[]>;
    expect(history['0']).toHaveLength(2);
  });

  it('restored state reads as an ACTIVE session (resume, not fresh start)', () => {
    // Simulate the post-reload rehydration by setting the live fields back.
    useWorkoutStore.setState({
      sessionStart: 999, exIdx: 1, setIdx: 2, phase: 'logging',
      history: { 0: [{ kg: 60, reps: 10, rating: 'usor' }] },
    });
    const s = useWorkoutStore.getState();
    const mode = getCurrentMode({
      phase: s.phase, sessionStart: s.sessionStart,
      pausedSnapshot: s.pausedSnapshot, lastSession: s.lastSession, exIdx: s.exIdx,
    });
    expect(mode.kind).toBe('active');
    // Logged sets intact for resume.
    expect(useWorkoutStore.getState().history[0]).toHaveLength(1);
  });

  it('a finished session persists as idle (reload after finish does not resume)', () => {
    const store = useWorkoutStore.getState();
    store.startSession(111);
    store.logSet(0, { kg: 50, reps: 5, rating: 'potrivit' });
    store.finishSession({ title: 'Done', meta: '', ts: 222 });

    const ps = persistedState();
    expect(ps.sessionStart).toBeNull();
    expect(ps.phase).toBe('idle');
    expect(ps.history).toEqual({});
  });

  it('discardSession clears the persisted live session (no stale resume)', () => {
    const store = useWorkoutStore.getState();
    store.startSession(333);
    store.logSet(0, { kg: 70, reps: 6, rating: 'greu' });
    store.discardSession();

    const ps = persistedState();
    expect(ps.sessionStart).toBeNull();
    expect(ps.history).toEqual({});
  });
});
