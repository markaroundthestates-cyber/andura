// ══ workoutStore — sessionsHistory overflow archive (08.040) ════════════════
// Pre-fix the SESSIONS_HISTORY_MAX cap silently DROPPED the oldest session via
// slice(-MAX) — ANDURA never-delete violation on a 2-3 year horizon. The fix
// archives the overflow to the Tier-1 IDB (archiveSession) BEFORE the slice so
// no history is ever lost silently. These tests prove the overflow selection +
// that finishSession routes the dropped sessions to the archive.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the archive layer so we can assert WHAT gets archived without needing a
// real IndexedDB (jsdom has none — archiveSession would no-op).
vi.mock('../../lib/dexieMigration', () => ({
  archiveSession: vi.fn(async () => undefined),
}));

import { archiveSession } from '../../lib/dexieMigration';
import {
  useWorkoutStore,
  archiveOverflowSessions,
  SESSIONS_HISTORY_MAX,
  type LastSessionSummary,
} from '../../stores/workoutStore';

const mockArchive = vi.mocked(archiveSession);

function session(ts: number): LastSessionSummary {
  return { title: `S${ts}`, meta: '', ts };
}

beforeEach(() => {
  localStorage.clear();
  useWorkoutStore.setState({ sessionsHistory: [], lastSession: null, sessionStart: 1, history: {} });
  mockArchive.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('archiveOverflowSessions — pure overflow selection', () => {
  it('archives nothing at or under the cap', () => {
    const hist = Array.from({ length: 5 }, (_, i) => session(i));
    archiveOverflowSessions(hist, 5);
    expect(mockArchive).not.toHaveBeenCalled();
  });

  it('archives the OLDEST head overflow exactly (the entries slice(-MAX) drops)', () => {
    const hist = Array.from({ length: 8 }, (_, i) => session(i)); // ts 0..7, oldest = 0
    archiveOverflowSessions(hist, 5); // overflow = 3 oldest (ts 0,1,2)
    expect(mockArchive).toHaveBeenCalledTimes(3);
    const archivedTs = mockArchive.mock.calls.map((c) => (c[0] as LastSessionSummary).ts).sort((a, b) => a - b);
    expect(archivedTs).toEqual([0, 1, 2]);
  });
});

describe('finishSession — overflow archived, not dropped', () => {
  it('keeps newest MAX in history AND archives the dropped oldest session', () => {
    // Seed history at exactly the cap so the next finish overflows by 1.
    const seeded = Array.from({ length: SESSIONS_HISTORY_MAX }, (_, i) => session(i));
    useWorkoutStore.setState({ sessionsHistory: seeded, sessionStart: 1 });

    const newSummary = session(999999);
    useWorkoutStore.getState().finishSession(newSummary);

    const hist = useWorkoutStore.getState().sessionsHistory;
    expect(hist).toHaveLength(SESSIONS_HISTORY_MAX);
    // Newest summary kept (tail).
    expect(hist[hist.length - 1]?.ts).toBe(999999);
    // Oldest (ts=0) dropped from the live list BUT archived (not lost).
    expect(hist.find((s) => s.ts === 0)).toBeUndefined();
    expect(mockArchive).toHaveBeenCalledTimes(1);
    expect((mockArchive.mock.calls[0]?.[0] as LastSessionSummary).ts).toBe(0);
  });

  it('does not archive when history stays under the cap', () => {
    useWorkoutStore.setState({ sessionsHistory: [session(1), session(2)], sessionStart: 1 });
    useWorkoutStore.getState().finishSession(session(3));
    expect(mockArchive).not.toHaveBeenCalled();
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(3);
  });
});
