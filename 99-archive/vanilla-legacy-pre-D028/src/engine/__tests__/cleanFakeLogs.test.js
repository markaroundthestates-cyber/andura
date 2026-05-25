import { describe, it, expect } from 'vitest';
import { filterValidLogs } from '../../util/logFilter.js';

// ── helpers ─────────────────────────────────────────────────────────────────
function makeSet(session, ex = 'Cable Curl', overrides = {}) {
  return { date: '2026-04-23', ex, w: 30, reps: '10', rpe: 7, ts: Date.now(), session, ...overrides };
}
function makeBaseline(ex = 'Lat Pulldown') {
  return { date: '2026-04-17', ex, w: 50, reps: '8', baseline: true, ts: 1, session: null };
}

// ── filterValidLogs ──────────────────────────────────────────────────────────

describe('filterValidLogs — Bug 1 regression (number session key)', () => {
  it('preserves a session with >=2 sets when session key is a Number', () => {
    const ts = Date.now();
    const logs = [
      makeSet(ts, 'Cable Curl'),
      makeSet(ts, 'Preacher Curl'),
      makeSet(ts, 'Overhead Triceps'),
    ];
    expect(filterValidLogs(logs)).toHaveLength(3);
  });

  it('removes a singleton session (1 set, no earlyStop)', () => {
    const ts = Date.now();
    const logs = [makeSet(ts, 'Cable Curl')];
    expect(filterValidLogs(logs)).toHaveLength(0);
  });

  it('preserves a singleton session that has earlyStop=true', () => {
    const ts = Date.now();
    const logs = [makeSet(ts, 'Cable Curl', { earlyStop: true })];
    expect(filterValidLogs(logs)).toHaveLength(1);
  });

  it('preserves baseline logs unconditionally', () => {
    const ts = Date.now();
    const logs = [
      makeBaseline('Lat Pulldown'),
      makeSet(ts, 'Cable Curl'), // singleton — removed
    ];
    const result = filterValidLogs(logs);
    expect(result).toHaveLength(1);
    expect(result[0].baseline).toBe(true);
  });

  it('handles mixed baseline + multi-set session — both preserved', () => {
    const ts = Date.now();
    const logs = [
      makeBaseline(),
      makeSet(ts, 'Cable Curl'),
      makeSet(ts, 'Preacher Curl'),
    ];
    expect(filterValidLogs(logs)).toHaveLength(3);
  });

  it('matches number session key against string session key from old data', () => {
    // Simulate edge case: one log has numeric session, another has string session
    const ts = 1745366400000;
    const logs = [
      { ...makeSet(ts), session: ts },              // number key
      { ...makeSet(ts, 'Preacher Curl'), session: String(ts) }, // string key
    ];
    expect(filterValidLogs(logs)).toHaveLength(2);
  });

  it('two distinct sessions — each with >=2 sets both preserved', () => {
    const ts1 = 1745280000000;
    const ts2 = 1745366400000;
    const logs = [
      makeSet(ts1, 'Cable Curl'), makeSet(ts1, 'Preacher Curl'),
      makeSet(ts2, 'Lateral Raises'), makeSet(ts2, 'Rear Delt Fly'),
    ];
    expect(filterValidLogs(logs)).toHaveLength(4);
  });
});
