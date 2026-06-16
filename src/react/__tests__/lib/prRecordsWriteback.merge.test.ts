// ══ C16-PR-001 — pr-records merge-keep all-time best (survive 5000-log prune) ══
// refreshPRRecordsFromLogs used to rebuild pr-records DESTRUCTIVELY+ENTIRELY from
// the current DB('logs') window on every finish. logs is capped at LOGS_MAX=5000
// (oldest dropped), so when an all-time PR's source log row aged out, the recorded
// PR regressed to the best surviving in the window (120kg → 100kg) — degrading the
// PR Wall, Coach Records and the MMI peak-pre-pause cap.
//
// FIX: the finish path (default merge:true) MERGES per exercise keep max(existing
// record e1RM, best-in-logs e1RM). The deleteSession recompute path (merge:false)
// still force-rebuilds so a genuinely-deleted PR can be removed (that path's
// removal correctness is asserted by the workoutStore deleteSession suite).

import { describe, it, expect, beforeEach } from 'vitest';
import { refreshPRRecordsFromLogs } from '../../lib/prRecordsWriteback';
import type { PRRecordEntry } from '../../lib/prRecordsWriteback';
import { DB } from '../../../db.js';
import type { LogEntry } from '../../stores/workoutStore';

function log(ex: string, w: number, reps: number, ts: number): LogEntry {
  return {
    date: '2026-06-01', ex, w, kg: w, set: 1, sets: 1, reps: String(reps), ts, session: ts,
  } as LogEntry;
}

beforeEach(() => {
  localStorage.clear();
  DB.set('pr-records', []);
  DB.set('logs', []);
});

describe('refreshPRRecordsFromLogs — merge (C16-PR-001)', () => {
  it('an all-time PR whose source log was pruned out of the window SURVIVES a later finish', () => {
    // Session 1: a genuine 120kg Squat PR is recorded.
    DB.set('logs', [log('Squat', 120, 5, 1_000)]);
    refreshPRRecordsFromLogs();
    expect(DB.get<PRRecordEntry[]>('pr-records')!.find((r) => r.ex === 'Squat')!.kg).toBe(120);

    // Time passes — the 120kg log row ages out of the 5000-log window. The window
    // now only holds a lighter 100kg Squat. A later finish recomputes.
    DB.set('logs', [log('Squat', 100, 5, 9_000)]); // 120kg row is gone
    refreshPRRecordsFromLogs();

    // The recorded all-time PR must STILL be 120kg (not regressed to 100kg).
    const squat = DB.get<PRRecordEntry[]>('pr-records')!.find((r) => r.ex === 'Squat')!;
    expect(squat.kg).toBe(120);
  });

  it('a genuinely heavier in-window set still UPDATES the record (merge keeps the max)', () => {
    DB.set('pr-records', [
      { ex: 'Bench', kg: 100, reps: 5, date: '2026-05-01', ts: 1_000, score: 500 },
    ]);
    DB.set('logs', [log('Bench', 110, 5, 9_000)]); // a real new PR in-window
    refreshPRRecordsFromLogs();
    expect(DB.get<PRRecordEntry[]>('pr-records')!.find((r) => r.ex === 'Bench')!.kg).toBe(110);
  });

  it('merge:false force-rebuilds from surviving logs (a deleted PR can be removed)', () => {
    // A stale record exists but its source log no longer survives.
    DB.set('pr-records', [
      { ex: 'Squat', kg: 120, reps: 5, date: '2026-05-01', ts: 1_000, score: 600 },
    ]);
    DB.set('logs', []); // all logs purged (deleteSession path)
    refreshPRRecordsFromLogs({ merge: false });
    // The stale PR must be GONE — deletion overrides the survive-the-prune merge.
    expect(DB.get<PRRecordEntry[]>('pr-records')!.find((r) => r.ex === 'Squat')).toBeUndefined();
  });
});
