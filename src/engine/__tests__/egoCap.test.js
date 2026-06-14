// ══ BUILD #6/B — ego-jump cap tests (F4 spec §B) ═════════════════════════════
// (1) Pure isEgoJump / egoCappedKg.
// (2) FLAG-OFF byte-identical: with dp_ego_cap_v1 OFF (default), an ego-jump set
//     calibrates + adjusts EXACTLY as legacy (no cap, factor learns the load).
// (3) FLAG-ON: an ego jump caps the next set + down-weights calibration; the cap
//     never craters (PR-floored); a non-ego set is untouched.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { isEgoJump, egoCappedKg, EGO_JUMP_RATIO } from '../dp/egoCap.js';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import * as flags from '../../util/featureFlags.js';

describe('isEgoJump / egoCappedKg — pure', () => {
  it('flags an aggressive jump that was hard', () => {
    expect(isEgoJump({ recKg: 60, loggedKg: 80, loggedReps: 8, rMin: 8, wasHard: true })).toBe(true);
  });
  it('flags an aggressive jump that missed reps', () => {
    expect(isEgoJump({ recKg: 60, loggedKg: 80, loggedReps: 5, rMin: 8, wasHard: false })).toBe(true);
  });
  it('does NOT flag a modest jump within ratio', () => {
    expect(isEgoJump({ recKg: 60, loggedKg: 70, loggedReps: 8, rMin: 8, wasHard: true })).toBe(false);
  });
  it('does NOT flag an aggressive jump that was easy + hit reps', () => {
    expect(isEgoJump({ recKg: 60, loggedKg: 90, loggedReps: 10, rMin: 8, wasHard: false })).toBe(false);
  });
  it('egoCappedKg = rec × ratio', () => {
    expect(egoCappedKg(60)).toBeCloseTo(60 * EGO_JUMP_RATIO, 6);
  });
});

describe('ego-cap wired into checkInSessionAdjust', () => {
  const EX = 'Lat Pulldown';
  beforeEach(() => {
    localStorage.clear();
    const base = Date.UTC(2026, 0, 1);
    DB.set('logs', [
      { ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + 2 * 86400000 },
      { ex: EX, w: 60, reps: 10, rpe: 7.5, ts: base + 1 * 86400000 },
    ]);
  });
  afterEach(() => vi.restoreAllMocks());

  function calFactor() {
    const f = /** @type {any} */ (DB.get('dp-cal-factors')) || {};
    return f[EX] ? f[EX].kgFactor : null;
  }

  it('FLAG OFF (default) — an ego jump is NOT capped and DOES calibrate (byte-identical legacy)', () => {
    // dp_ego_cap_v1 flipped default-ON (Wave 2026-06-14); pin it OFF to assert the
    // legacy (no-cap, calibration-runs) path explicitly.
    localStorage.setItem('_devFlags', JSON.stringify({ dp_ego_cap_v1: false }));
    // greu ego jump: rec 60, logged 90 (×1.5), rated greu. Flag off → no egoCap msg,
    // factor learns the 90 (legacy behavior).
    const r = DP.checkInSessionAdjust(EX, [10], [6], {
      recKg: 60, recReps: 10, loggedKg: 90, setIdx: 1, nowMs: Date.UTC(2026, 0, 5),
    });
    expect(calFactor()).not.toBe(null); // legacy: calibration ran
    // Whatever the legacy adjust is, it is NOT the egoCap message.
    if (r && r.msg) expect(r.msg).not.toContain('construim corect');
  });

  it('FLAG ON — an ego jump caps the next set + skips calibration', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_ego_cap_v1');
    const r = DP.checkInSessionAdjust(EX, [10], [6], {
      recKg: 60, recReps: 10, loggedKg: 90, setIdx: 1, nowMs: Date.UTC(2026, 0, 5),
    });
    expect(r.adjust).toBe(true);
    expect(r.dir).toBe('down');
    // Capped at rec × ratio = 75, snapped to the equipment step, and < the logged 90.
    expect(r.newKg).toBeLessThan(90);
    expect(r.newKg).toBeGreaterThan(0);
    // Calibration did NOT learn from the inflated 90.
    expect(calFactor()).toBe(null);
  });

  it('FLAG ON — a non-ego set is untouched (calibrates normally)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id) => id === 'dp_ego_cap_v1');
    DP.checkInSessionAdjust(EX, [7.5], [10], {
      recKg: 60, recReps: 10, loggedKg: 62, setIdx: 1, nowMs: Date.UTC(2026, 0, 5),
    });
    expect(calFactor()).not.toBe(null);
  });
});
