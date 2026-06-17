// ══ C19-CARRY-PRWALL-FABRICATED — metric (time/carry) sets never fabricate a kg PR ══
// refreshPRRecordsFromLogs scanned logs with ZERO metric awareness. A loaded carry
// (metric_type 'carry' — Farmer's Walk) or a hold (metric_type 'time' — Plank)
// persists w=load>0 + reps:"0" (a TRUTHY string the `!l.reps` guard missed) +
// durationSec. parseInt("0",10)||1 then coerced reps→1 and recorded a bogus
// "{load} kg x 1 reps" PR — inflating the Records count and polluting the coach
// prWallRecent slice.
//
// FIX: skip any non-reps metric row (engine-canonical getMetricType on the ENGLISH log
// key, durationSec as a robust fallback) before recording. A real reps set still records.

import { describe, it, expect, beforeEach } from 'vitest';
import { refreshPRRecordsFromLogs } from '../../lib/prRecordsWriteback';
import type { PRRecordEntry } from '../../lib/prRecordsWriteback';
import { DB } from '../../../db.js';
import type { LogEntry } from '../../stores/workoutStore';

// A normal reps set (Squat resolves to metric_type 'reps').
function repsLog(ex: string, w: number, reps: number, ts: number): LogEntry {
  return {
    date: '2026-06-01', ex, w, kg: w, set: 1, sets: 1, reps: String(reps), ts, session: ts,
  } as LogEntry;
}

// A loaded carry as it is REALLY persisted: w=carryLoad>0, reps:"0" (string),
// durationSec set. Mirrors the production LogEntry shape for a metric set.
function carryLog(ex: string, load: number, durationSec: number, ts: number): LogEntry {
  return {
    date: '2026-06-01', ex, w: load, kg: load, set: 1, sets: 1, reps: '0', durationSec, ts, session: ts,
  } as LogEntry;
}

beforeEach(() => {
  localStorage.clear();
  DB.set('pr-records', []);
  DB.set('logs', []);
});

describe('refreshPRRecordsFromLogs — metric guard (C19-CARRY-PRWALL-FABRICATED)', () => {
  it('a loaded-carry log row (real name "Farmer\'s Walk DB") produces NO pr-records entry', () => {
    DB.set('logs', [carryLog("Farmer's Walk DB", 40, 45, 1_000)]);
    refreshPRRecordsFromLogs({ merge: false });
    const prs = DB.get<PRRecordEntry[]>('pr-records')!;
    expect(prs.find((r) => r.ex === "Farmer's Walk DB")).toBeUndefined();
    expect(prs).toHaveLength(0);
  });

  it('a Plank (time-metric) hold row produces NO pr-records entry', () => {
    DB.set('logs', [carryLog('Plank', 10, 60, 1_000)]);
    refreshPRRecordsFromLogs({ merge: false });
    const prs = DB.get<PRRecordEntry[]>('pr-records')!;
    expect(prs.find((r) => r.ex === 'Plank')).toBeUndefined();
    expect(prs).toHaveLength(0);
  });

  it('a normal reps set still records its PR (the guard does not over-skip)', () => {
    DB.set('logs', [repsLog('Squat', 120, 5, 1_000)]);
    refreshPRRecordsFromLogs({ merge: false });
    const squat = DB.get<PRRecordEntry[]>('pr-records')!.find((r) => r.ex === 'Squat');
    expect(squat).toBeDefined();
    expect(squat!.kg).toBe(120);
    expect(squat!.reps).toBe(5);
  });

  it('the Records count EXCLUDES metric sets — mixed window keeps only the reps PR', () => {
    DB.set('logs', [
      repsLog('Squat', 120, 5, 1_000),
      carryLog("Farmer's Walk DB", 40, 45, 2_000),
      carryLog('Plank', 0, 60, 3_000),
    ]);
    refreshPRRecordsFromLogs({ merge: false });
    const prs = DB.get<PRRecordEntry[]>('pr-records')!;
    expect(prs).toHaveLength(1);
    expect(prs[0]!.ex).toBe('Squat');
  });
});
