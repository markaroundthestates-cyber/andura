// ══ POST-RPE PR Records Writeback Tests (CRIT #3 + MED #8 chat 5) ═══════════
// Post-D028 vanilla retire React-side PostRpe.handleSubmit never persists
// pr-records. MMI Engine #9 silent cap LANDED 53b97dff but
// buildSilentMmiContext returns null when prRecords.length === 0 ->
// returning user 6+mo never receives baseline weight protection.
//
// Tests verify pr-records writeback + isPR per-set flag enrichment +
// MMI Engine #9 input pipeline integrity.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

const PHASE_5_FIXTURE = {
  workoutTitle: 'Push (piept si umeri)',
  exerciseCount: 5,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 12450,
  exercises: [
    { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
    { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
  ],
};

vi.mock('../../../lib/engineWrappers', () => ({
  getTodayWorkout: vi.fn(async () => PHASE_5_FIXTURE),
}));

import { PostRpe } from '../../../routes/screens/antrenor/PostRpe';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { LogEntry } from '../../../stores/workoutStore';
import { DB } from '../../../../db.js';
import {
  enrichExercisesWithPR,
  refreshPRRecordsFromLogs,
} from '../../../lib/prRecordsWriteback';
import type { PRRecordEntry } from '../../../lib/prRecordsWriteback';
import type { SessionExerciseBreakdown } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPostRpe() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/post-rpe']}>
      <Routes>
        <Route path="/app/antrenor/post-rpe" element={<PostRpe />} />
        <Route path="/app/antrenor/post-summary" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

// Pulse select-then-Save (2026-05-29): pick the rating, then confirm with Save
// — the finalize pipeline only fires on Save.
function submit(name: RegExp): void {
  fireEvent.click(screen.getByRole('button', { name }));
  fireEvent.click(screen.getByTestId('post-rpe-save'));
}

function seedSession(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'logging',
    prHit: false,
    prData: null,
    history: {
      0: [
        { kg: 22.5, reps: 10, rating: 'potrivit', timestamp: Date.now() - 1000 },
      ],
      1: [
        { kg: 17.5, reps: 8, rating: 'potrivit', timestamp: Date.now() - 500 },
      ],
    },
    sessionStart: Date.now() - 30 * 60000,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 5,
  });
  localStorage.clear();
}

describe('PostRpe — pr-records writeback (CRIT #3)', () => {
  beforeEach(() => {
    seedSession();
  });

  it('writes pr-records to DB after submit', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      expect(prs).not.toBeNull();
      expect(Array.isArray(prs)).toBe(true);
    });
  });

  it('pr-records contains entry per exercise', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      expect(prs!.length).toBeGreaterThanOrEqual(2);
      const exNames = prs!.map((p) => p.ex).sort();
      expect(exNames).toContain('Bench Press');
      expect(exNames).toContain('Overhead Press');
    });
  });

  it('pr-records entry shape: { ex, kg, reps, date, ts, score }', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      const benchPR = prs!.find((p) => p.ex === 'Bench Press');
      expect(benchPR).toBeDefined();
      expect(benchPR!.kg).toBe(22.5);
      expect(benchPR!.reps).toBe(10);
      expect(benchPR!.score).toBe(225); // 22.5 * 10
      expect(typeof benchPR!.date).toBe('string');
      expect(typeof benchPR!.ts).toBe('number');
    });
  });

  it('pr-records updates higher score when new PR beats prior', async () => {
    // Seed prior pr-records via logs (a prior 20kg×10 = 200 score Bench).
    const olderLog: LogEntry = {
      date: '2026-05-01',
      ex: 'Bench Press',
      w: 20,
      kg: 20,
      set: 1,
      sets: 1,
      reps: '10',
      ts: Date.now() - 30 * 86400000,
      session: Date.now() - 30 * 86400000,
    };
    DB.set('logs', [olderLog]);

    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      const benchPR = prs!.find((p) => p.ex === 'Bench Press');
      // New session 22.5 × 10 = 225 score > prior 20 × 10 = 200 score.
      expect(benchPR!.kg).toBe(22.5);
      expect(benchPR!.score).toBe(225);
    });
  });

  it('pr-records preserves higher prior PR when new session is lower', async () => {
    // Seed prior pr-records via logs (a prior 30kg×8 = 240 score Bench).
    const olderLog: LogEntry = {
      date: '2026-05-01',
      ex: 'Bench Press',
      w: 30,
      kg: 30,
      set: 1,
      sets: 1,
      reps: '8',
      ts: Date.now() - 30 * 86400000,
      session: Date.now() - 30 * 86400000,
    };
    DB.set('logs', [olderLog]);

    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      const benchPR = prs!.find((p) => p.ex === 'Bench Press');
      // Prior 30 × 8 = 240 > new 22.5 × 10 = 225.
      expect(benchPR!.kg).toBe(30);
      expect(benchPR!.reps).toBe(8);
    });
  });
});

describe('PostRpe — isPR per-set flag wire (MED #8)', () => {
  beforeEach(() => {
    seedSession();
  });

  it('exercises[].sets[].isPR populated on submit (first ever session)', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      // First session ever — detectPR returns null (no prior history). So
      // isPR should be absent/false on all sets.
      const exs = useWorkoutStore.getState().lastSession?.exercises;
      expect(exs).toBeDefined();
      const anyPR = exs!.some((ex) => ex.sets.some((s) => s.isPR === true));
      expect(anyPR).toBe(false);
    });
  });

  it('exercises[].sets[].isPR=true when new set beats prior history', async () => {
    // Seed prior logs cu lighter weight so new session sets become PRs.
    const olderLog: LogEntry = {
      date: '2026-05-01',
      ex: 'Bench Press',
      w: 15,
      kg: 15,
      set: 1,
      sets: 1,
      reps: '8',
      ts: Date.now() - 30 * 86400000,
      session: Date.now() - 30 * 86400000,
    };
    DB.set('logs', [olderLog]);

    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const exs = useWorkoutStore.getState().lastSession?.exercises;
      const benchEx = exs!.find((e) => e.exerciseName === 'Bench Press');
      // New 22.5kg > prior 15kg → weight PR detected on first new set.
      expect(benchEx!.sets[0]!.isPR).toBe(true);
    });
  });

  it('isPR flag persisted into DB.logs via finishSession writeback', async () => {
    const olderLog: LogEntry = {
      date: '2026-05-01',
      ex: 'Bench Press',
      w: 15,
      kg: 15,
      set: 1,
      sets: 1,
      reps: '8',
      ts: Date.now() - 30 * 86400000,
      session: Date.now() - 30 * 86400000,
    };
    DB.set('logs', [olderLog]);

    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const logs = DB.get<LogEntry[]>('logs');
      const newBenchLog = logs!.find(
        (l) => l.ex === 'Bench Press' && l.isPR === true
      );
      expect(newBenchLog).toBeDefined();
    });
  });
});

describe('PostRpe — MMI Engine #9 activatable post writeback', () => {
  beforeEach(() => {
    seedSession();
  });

  it('after submit DB.get(pr-records) returns non-empty array (MMI input)', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      // MMI Engine #9 buildSilentMmiContext requires prRecords.length > 0
      // (returns null otherwise → no cap applied → returning user starts
      // at baseline). Post writeback this is now guaranteed.
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      expect(Array.isArray(prs)).toBe(true);
      expect(prs!.length).toBeGreaterThan(0);
    });
  });

  it('pr-records[].kg is queryable per exercise name (MMI peak lookup)', async () => {
    renderPostRpe();
    submit(/Just right/i);
    await waitFor(() => {
      const prs = DB.get<PRRecordEntry[]>('pr-records');
      const benchPR = prs!.find((p) => p.ex === 'Bench Press');
      // MMI buildSilentMmiContext loop: r.ex + r.kg per exercise key.
      // Schema validated — peakPrePauseKgPerExercise populated correctly.
      expect(benchPR!.kg).toBe(22.5);
      expect(typeof benchPR!.kg).toBe('number');
    });
  });
});

describe('enrichExercisesWithPR — pure helper unit tests', () => {
  it('returns sets without isPR when prior history empty (first ever)', () => {
    const exercises: SessionExerciseBreakdown[] = [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        sets: [{ kg: 22.5, reps: 10, rating: 'potrivit', timestamp: 1 }],
        totalVolume: 225,
        peakOneRM: 30,
      },
    ];
    const enriched = enrichExercisesWithPR(exercises, []);
    expect(enriched[0]!.sets[0]!.isPR).toBeUndefined();
  });

  it('marks isPR=true when new weight beats prior history max', () => {
    const exercises: SessionExerciseBreakdown[] = [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        sets: [{ kg: 25, reps: 8, rating: 'potrivit', timestamp: 1 }],
        totalVolume: 200,
        peakOneRM: 31.7,
      },
    ];
    const priorLogs = [
      { ex: 'Bench Press', w: 20, reps: '8' },
      { ex: 'Bench Press', w: 15, reps: '10' },
    ];
    const enriched = enrichExercisesWithPR(exercises, priorLogs);
    expect(enriched[0]!.sets[0]!.isPR).toBe(true);
  });

  it('marks consecutive progressive overload sets cu isPR within session', () => {
    const exercises: SessionExerciseBreakdown[] = [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        sets: [
          { kg: 22.5, reps: 8, rating: 'potrivit', timestamp: 1 },
          { kg: 25, reps: 8, rating: 'potrivit', timestamp: 2 },
        ],
        totalVolume: 380,
        peakOneRM: 31.7,
      },
    ];
    const priorLogs = [{ ex: 'Bench Press', w: 20, reps: '8' }];
    const enriched = enrichExercisesWithPR(exercises, priorLogs);
    // First set: 22.5 > 20 = weight PR.
    expect(enriched[0]!.sets[0]!.isPR).toBe(true);
    // Second set: 25 > 22.5 (accumulated) = another weight PR.
    expect(enriched[0]!.sets[1]!.isPR).toBe(true);
  });

  it('does NOT mark isPR when set weight + reps below prior', () => {
    const exercises: SessionExerciseBreakdown[] = [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        sets: [{ kg: 15, reps: 5, rating: 'potrivit', timestamp: 1 }],
        totalVolume: 75,
        peakOneRM: 17.5,
      },
    ];
    const priorLogs = [{ ex: 'Bench Press', w: 30, reps: '10' }];
    const enriched = enrichExercisesWithPR(exercises, priorLogs);
    expect(enriched[0]!.sets[0]!.isPR).toBeUndefined();
  });
});

describe('refreshPRRecordsFromLogs — pure helper unit tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when DB.logs empty', () => {
    const result = refreshPRRecordsFromLogs();
    expect(result).toEqual([]);
    expect(DB.get<PRRecordEntry[]>('pr-records')).toEqual([]);
  });

  it('computes max score per exercise from logs', () => {
    const logs: LogEntry[] = [
      { date: '2026-05-23', ex: 'Bench Press', w: 22.5, kg: 22.5, set: 1, sets: 1, reps: '10', ts: 1000, session: 1000 },
      { date: '2026-05-23', ex: 'Bench Press', w: 25, kg: 25, set: 2, sets: 1, reps: '8', ts: 2000, session: 1000 },
      { date: '2026-05-23', ex: 'Overhead Press', w: 17.5, kg: 17.5, set: 1, sets: 1, reps: '8', ts: 3000, session: 1000 },
    ];
    DB.set('logs', logs);
    const result = refreshPRRecordsFromLogs();
    expect(result.length).toBe(2);
    const benchPR = result.find((r) => r.ex === 'Bench Press');
    // Bench: 22.5×10=225 vs 25×8=200. Max score = 225 wins.
    expect(benchPR!.kg).toBe(22.5);
    expect(benchPR!.score).toBe(225);
  });

  it('excludes baseline-marked log entries', () => {
    const logs = [
      { date: '2026-05-23', ex: 'Bench Press', w: 50, kg: 50, set: 1, sets: 1, reps: '10', ts: 1000, session: 1000, baseline: true },
      { date: '2026-05-23', ex: 'Bench Press', w: 22.5, kg: 22.5, set: 1, sets: 1, reps: '10', ts: 2000, session: 2000 },
    ];
    DB.set('logs', logs);
    const result = refreshPRRecordsFromLogs();
    const benchPR = result.find((r) => r.ex === 'Bench Press');
    expect(benchPR!.kg).toBe(22.5);
  });

  it('sorts pr-records desc by ts (newest first)', () => {
    const logs: LogEntry[] = [
      { date: '2026-05-01', ex: 'Squat', w: 60, kg: 60, set: 1, sets: 1, reps: '5', ts: 1000, session: 1000 },
      { date: '2026-05-23', ex: 'Bench Press', w: 22.5, kg: 22.5, set: 1, sets: 1, reps: '10', ts: 5000, session: 5000 },
    ];
    DB.set('logs', logs);
    const result = refreshPRRecordsFromLogs();
    expect(result[0]!.ex).toBe('Bench Press');
    expect(result[1]!.ex).toBe('Squat');
  });

  it('soft-fails gracefully when DB throws', () => {
    const origGet = DB.get;
    (DB as { get: (k: string) => unknown }).get = () => {
      throw new Error('quota exceeded');
    };
    const result = refreshPRRecordsFromLogs();
    expect(result).toEqual([]);
    (DB as { get: typeof origGet }).get = origGet;
  });
});
