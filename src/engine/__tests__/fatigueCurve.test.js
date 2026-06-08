// ══ BUILD F6a #20 — per-set fatigue curve tests (F6a spec §2e) ═══════════════
// PURE learner + the synced cache read. Real reps literals. Asserts:
//   - identity-at-zero-data: < MIN_SESSIONS → setsAdjust 0 (byte-identical).
//   - maintainer: flat reps curve → drop-off late → +1 set.
//   - crasher: steep reps curve → early drop-off → -1 set.
//   - slow-converge: one anomalous crash barely moves a maintainer's index.
//   - persistence round-trips (quota-guarded, name-keyed) + SYNC_KEYS membership.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  learnFatigueCurve,
  dropIndexForSession,
  saveFatigueCurve,
  fatigueSetsAdjust,
  FATIGUE_CURVE_KEY,
  FATIGUE_MIN_SESSIONS,
} from '../dp/fatigueCurve.js';
import { DB } from '../../db.js';
import { SYNC_KEYS, NAME_KEYED_SYNC_KEYS } from '../../firebase.js';

const DAY = 86400000;

// A fixed-load session: same kg, reps sequence across sets, on calendar `day`.
function session(ex, w, repsSeq, day) {
  return repsSeq.map((reps, i) => ({ ex, w, reps: String(reps), ts: day * DAY + i * 300000 }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('F6a #20 fatigue curve', () => {
  it('dropIndexForSession: flat reps never drop → maintainer (count+1)', () => {
    expect(dropIndexForSession([{ reps: '10' }, { reps: '10' }, { reps: '10' }])).toBe(4);
  });

  it('dropIndexForSession: steep drop by set 2 → crasher index 2', () => {
    expect(dropIndexForSession([{ reps: '10' }, { reps: '6' }, { reps: '4' }])).toBe(2);
  });

  it('identity at zero data: < MIN_SESSIONS → setsAdjust 0', () => {
    const logs = session('Flat DB Press', 60, [10, 10, 10], 1);
    const learned = learnFatigueCurve(logs, undefined);
    saveFatigueCurve(learned);
    // only 1 session → not enough to trust
    expect(fatigueSetsAdjust('Flat DB Press')).toBe(0);
  });

  it('maintainer (flat curve over many sessions) → +1 set', () => {
    let logs = [];
    for (let d = 1; d <= FATIGUE_MIN_SESSIONS + 1; d++) {
      logs = logs.concat(session('Flat DB Press', 60, [10, 10, 10, 10], d));
    }
    const learned = learnFatigueCurve(logs, undefined);
    saveFatigueCurve(learned);
    expect(fatigueSetsAdjust('Flat DB Press')).toBe(1);
  });

  it('crasher (steep curve over many sessions) → -1 set (never below 1)', () => {
    let logs = [];
    for (let d = 1; d <= FATIGUE_MIN_SESSIONS + 1; d++) {
      logs = logs.concat(session('Leg Extension', 80, [12, 6, 4], d));
    }
    const learned = learnFatigueCurve(logs, undefined);
    saveFatigueCurve(learned);
    expect(fatigueSetsAdjust('Leg Extension')).toBe(-1);
  });

  it('slow-converge: one anomalous crash barely moves a maintainer index', () => {
    let logs = [];
    for (let d = 1; d <= 5; d++) logs = logs.concat(session('Cable Row', 50, [10, 10, 10, 10], d));
    const base = learnFatigueCurve(logs, undefined);
    const baseIdx = base['Cable Row'].dropIndex;
    // continue with ONE crash session
    const crash = session('Cable Row', 50, [10, 5, 3], 6);
    const next = learnFatigueCurve(crash, base);
    // EMA alpha 0.3 → a single anomaly moves it < (baseIdx - crashIdx) fully.
    expect(next['Cable Row'].dropIndex).toBeLessThan(baseIdx);
    expect(next['Cable Row'].dropIndex).toBeGreaterThan(2.5); // still firmly maintainer-side
  });

  it('persistence round-trips + is a name-keyed SYNC_KEY', () => {
    saveFatigueCurve({ 'Flat DB Press': { dropIndex: 4.2, n: 5 } });
    const raw = DB.get(FATIGUE_CURVE_KEY);
    expect(raw['Flat DB Press'].dropIndex).toBe(4.2);
    expect(SYNC_KEYS).toContain('dp-fatigue-curve');
    expect(NAME_KEYED_SYNC_KEYS).toContain('dp-fatigue-curve');
  });
});
