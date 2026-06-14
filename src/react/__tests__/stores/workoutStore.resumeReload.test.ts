// ══ workoutStore — mid-workout reload RESUMES live sets (08.063) ════════════
// Pre-fix partialize persisted only pausedSnapshot/lastSession/history-summary;
// an ACTIVE session (user logging sets live) lost ALL logged sets + position on
// an accidental reload (mobile swipe-refresh, tab crash, PWA OS-kill). The fix
// persists the in-progress live fields (sessionStart/exIdx/setIdx/phase/history/
// prHit/prData) so a reload resumes the session. These tests assert the persist
// payload carries those fields and that the restored state reads as 'active'.

import { describe, it, expect, beforeEach, vi } from 'vitest';
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

// ── APP-LIFECYCLE-01 — stale live session discarded on rehydrate (merge hook) ──
// The 08.063 resume is correct for an accidental refresh, but a session
// abandoned hours ago (tab closed overnight, PWA OS-killed mid-set) would
// rehydrate a ghost "live session" pill (getCurrentMode reads it as 'active').
// The persist `merge` hook resets the in-progress fields when the rehydrated
// sessionStart is older than MAX_LIVE_SESSION_MS (6h), KEEPING sessionsHistory /
// streak / lastSession. Re-importing the module re-runs create()+merge against
// the localStorage snapshot we plant first.
describe('workoutStore stale-session discard on rehydrate (APP-LIFECYCLE-01)', () => {
  /** Plant a persisted snapshot then re-import the store so merge() runs against it. */
  async function rehydrateWith(state: Record<string, unknown>) {
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ state, version: 0 }));
    vi.resetModules();
    const mod = await import('../../stores/workoutStore');
    return mod.useWorkoutStore.getState();
  }

  it('discards an in-progress session older than 6h (ghost pill fix)', async () => {
    const stale = Date.now() - 7 * 60 * 60 * 1000; // 7h ago
    const s = await rehydrateWith({
      sessionStart: stale, exIdx: 2, setIdx: 3, phase: 'logging',
      history: { 0: [{ kg: 80, reps: 8, rating: 'potrivit' }] },
      prHit: true, prData: { exName: 'Bench', kg: 100 },
      // Durable history MUST survive the discard.
      sessionsHistory: [{ title: 'Old', meta: '', ts: 111 }],
      streak: 5, lastStreakDate: '2026-06-10',
      lastSession: { title: 'Old', meta: '', ts: 111 },
    });
    // In-progress fields reset to idle defaults.
    expect(s.sessionStart).toBeNull();
    expect(s.exIdx).toBe(0);
    expect(s.setIdx).toBe(0);
    expect(s.phase).toBe('idle');
    expect(s.history).toEqual({});
    expect(s.prHit).toBe(false);
    expect(s.prData).toBeNull();
    // Durable fields preserved.
    expect(s.sessionsHistory).toHaveLength(1);
    expect(s.streak).toBe(5);
    expect(s.lastStreakDate).toBe('2026-06-10');
    expect(s.lastSession).toEqual({ title: 'Old', meta: '', ts: 111 });
  });

  it('KEEPS a fresh in-progress session (younger than 6h resumes normally)', async () => {
    const fresh = Date.now() - 30 * 60 * 1000; // 30min ago
    const s = await rehydrateWith({
      sessionStart: fresh, exIdx: 1, setIdx: 2, phase: 'logging',
      history: { 0: [{ kg: 60, reps: 10, rating: 'usor' }] },
    });
    expect(s.sessionStart).toBe(fresh);
    expect(s.exIdx).toBe(1);
    expect(s.phase).toBe('logging');
    expect(s.history[0]).toHaveLength(1);
  });
});
