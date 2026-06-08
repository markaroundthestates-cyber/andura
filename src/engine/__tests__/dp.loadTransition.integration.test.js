// ══ #75 load-transition-window — dp.js integration (flag ON vs OFF) ══════════
// Proves the wiring end-to-end through DP.recommend: the calibration-sim cohort
// never produces a single-exposure >=10% load change (its synthetic users climb
// via equipment steps), so the sim is hash-neutral ON; these tests force the
// forced-jump scenarios the spec targets.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DP } from '../dp.js';
import { DB } from '../../db.js';
import { getNextWeight } from '../../config/weights.js';

const EX = 'Leg Press'; // mapped, REP_RANGES [8,12]
const BASE = Date.UTC(2026, 0, 1);
const DAY = 86400000;

function on() { localStorage.setItem('_devFlags', JSON.stringify({ dp_load_transition_v1: true })); }
function off() { localStorage.removeItem('_devFlags'); }

beforeEach(() => { off(); DB.set('logs', []); });
afterEach(() => { off(); DB.set('logs', []); });

describe('#75 dp.js UP-jump suppresses the false ease-back', () => {
  // 60kg×12 (easy, x2) → forced 80kg (+33%) rated greu with reps short of floor.
  const upLogs = [
    { ex: EX, w: 80, reps: 7, rpe: 8.5, ts: BASE + 2 * DAY },
    { ex: EX, w: 60, reps: 12, rpe: 6.5, ts: BASE + 1 * DAY },
    { ex: EX, w: 60, reps: 12, rpe: 6.5, ts: BASE },
  ];

  it('OFF → EASE BACK demotes the just-jumped load', () => {
    off(); DB.set('logs', upLogs);
    const r = DP.recommend(EX, BASE + 3 * DAY);
    expect(r.status).toBe('EASE BACK');
    expect(r.kg).toBeLessThan(80);
  });

  it('ON → the ease-back is suppressed (no demotion of the jumped load)', () => {
    on(); DB.set('logs', upLogs);
    const r = DP.recommend(EX, BASE + 3 * DAY);
    expect(r.status).not.toBe('EASE BACK');
    expect(r.kg).toBeGreaterThanOrEqual(80);
  });
});

describe('#75 dp.js DOWN-move caps the rebound (no demoW exemption)', () => {
  // A forced drop where the prior HEAVIER load was NEVER a clean demo (rated greu
  // + short) → no PR-floor demoW to catch up to → the pure easy-run rebound path is
  // the one that must be capped. 70kg×4 greu(short) → 50kg (−29%) easy spike x2.
  const downLogs = [
    { ex: EX, w: 50, reps: 18, rpe: 6.5, ts: BASE + 3 * DAY },
    { ex: EX, w: 50, reps: 18, rpe: 6.5, ts: BASE + 2 * DAY },
    { ex: EX, w: 70, reps: 4, rpe: 8.5, ts: BASE + 1 * DAY },
    { ex: EX, w: 70, reps: 4, rpe: 8.5, ts: BASE },
  ];

  it('ON → rebound is capped to a single step (never a big easy-run jump)', () => {
    on(); DB.set('logs', downLogs);
    const rOn = DP.recommend(EX, BASE + 4 * DAY);
    off(); DB.set('logs', downLogs);
    const rOff = DP.recommend(EX, BASE + 4 * DAY);
    // OFF the easy-run climbs in a big step (>=+20%); ON it is capped to one
    // equipment step (or hold) — strictly NOT larger than the OFF jump.
    expect(rOn.kg).toBeLessThanOrEqual(rOff.kg);
    // And the capped result is exactly one equipment step above the just-reduced
    // 50kg (the min increment) — never a multi-step easy-run jump.
    expect(rOn.kg).toBe(getNextWeight(50, EX));
    expect(rOn.kg).toBeLessThan(rOff.kg + 1); // strictly the smaller, capped path
  });
});
