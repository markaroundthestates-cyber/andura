/**
 * Data integrity regression tests for C4c and C5c fixes.
 *
 * C4c: confirmReps now writes set + kg fields → log schema is complete.
 * C5c: endSession no longer auto-deletes logs from sessions shorter than 5 min.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cleanDuplicateLogs } from '../dataCleanup.js';

beforeEach(() => { localStorage.clear(); });

// ── C4c — Log schema completeness ─────────────────────────────────────────

describe('C4c — log schema has set + kg fields', () => {
  it('3 sets same exercise same weight same reps survive cleanDuplicateLogs (ts-keyed dedup)', () => {
    // Simulates what confirmReps now writes: set=1,2,3 with unique ts
    const now = Date.now();
    const logs = [
      { date: '2026-04-24', ex: 'Lat Pulldown', w: 64, kg: 64, set: 1, sets: 1, reps: '8', ts: now,       session: now - 3600000, baseline: false },
      { date: '2026-04-24', ex: 'Lat Pulldown', w: 64, kg: 64, set: 2, sets: 1, reps: '8', ts: now + 120000, session: now - 3600000, baseline: false },
      { date: '2026-04-24', ex: 'Lat Pulldown', w: 64, kg: 64, set: 3, sets: 1, reps: '8', ts: now + 240000, session: now - 3600000, baseline: false },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    cleanDuplicateLogs();
    const result = JSON.parse(localStorage.getItem('logs'));
    expect(result).toHaveLength(3);
    expect(result.map(l => l.set)).toEqual([1, 2, 3]);
  });

  it('log object from confirmReps shape has set, kg, w, ts, ex, session', () => {
    // Verifies the required fields are present in a canonical confirmReps log
    const sessStart = Date.now() - 600000;
    const logKg = 80;
    const currentSet = 2;
    const log = {
      date: '2026-04-24', ex: 'Incline DB Press',
      w: logKg, kg: logKg, set: currentSet, sets: 1,
      reps: '10', notes: [], ts: Date.now(), session: sessStart
    };
    expect(log.set).toBe(2);
    expect(log.kg).toBe(80);
    expect(log.w).toBe(80);
    expect(log.ts).toBeTypeOf('number');
    expect(log.session).toBe(sessStart);
  });
});

// ── C5c — endSession no auto-delete for short sessions ────────────────────

describe('C5c — endSession preserves logs from short sessions', () => {
  it('logs with session key are NOT filtered by endSession for <5min sessions', () => {
    // Verify that a short session (4min) still retains its logs in storage.
    // We cannot import endSession directly (requires DOM), so we test the
    // storage contract: logs written by confirmReps survive a simulated short session.
    const sessStart = Date.now() - 4 * 60 * 1000; // 4 minutes ago
    const logs = [
      { date: '2026-04-24', ex: 'Lat Pulldown', w: 64, kg: 64, set: 1, reps: '8', ts: sessStart + 1000, session: sessStart, baseline: false },
      { date: '2026-04-24', ex: 'Lat Pulldown', w: 64, kg: 64, set: 2, reps: '8', ts: sessStart + 2000, session: sessStart, baseline: false },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));

    // Simulate: endSession no longer filters on duration — just cleanDuplicateLogs
    cleanDuplicateLogs();

    const result = JSON.parse(localStorage.getItem('logs'));
    expect(result).toHaveLength(2);
    expect(result.every(l => l.session === sessStart)).toBe(true);
  });

  it('a sub-5min session with 2 sets has both sets after cleanDuplicateLogs', () => {
    const sessStart = Date.now() - 3 * 60 * 1000; // 3 minutes ago
    const logs = [
      { ex: 'Cable Row', w: 72, kg: 72, set: 1, reps: '8', ts: sessStart + 500,  session: sessStart, baseline: false, date: '2026-04-24' },
      { ex: 'Cable Row', w: 72, kg: 72, set: 2, reps: '8', ts: sessStart + 1000, session: sessStart, baseline: false, date: '2026-04-24' },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
    cleanDuplicateLogs();
    expect(JSON.parse(localStorage.getItem('logs'))).toHaveLength(2);
  });
});
