// ══ BUILD F6c #35 — age-scaled tendon load-rate cap tests (F6c spec §6) ══════
// tendonLoadRateCap(ageYears) is a SECOND, age-keyed throttle on the NEW-max climb
// step (orthogonal to gainDecay's muscular ceiling). It reads CHRONOLOGICAL age
// (onboarding `age`, NOT trainingAge), caps the per-session load-increase FRACTION,
// and is composed MIN-style at the easy-run/CATCH-UP climb. OFF / absent age →
// 1.0 (no cap) → byte-identical. Uses the REAL rating literals + the _devFlags
// dev override (same pattern as the deficit-throttle integration test).

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';
import {
  tendonLoadRateCap,
  TENDON_FULL_AGE,
  TENDON_CAP_AGE,
  TENDON_FLOOR_FRAC,
} from '../dp/ceiling.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const EX = 'Leg Extension'; // machine → e1RM-eligible; REP_RANGES [10,15] → floor 10
const DAY = 86400000;
const BASE = 1_717_000_000_000;

const ON = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_tendon_cap_v1: true }));

// A LONG coach-follower easy-run: the SAME light load taken to target reps + rated
// `usor` across many sessions (consecutiveEasyHit run, no heavier logged set) → the
// pure easy-run NEW-max climb whose stepFrac grows toward its +0.50 max (the branch
// #35 caps). A long run is needed so the step exceeds the tendon floor and the cap
// has something to bite.
function seedEasyRun(kg = 30, n = 6) {
  const logs = [];
  for (let i = 0; i < n; i++) {
    logs.push({ ex: EX, w: kg, reps: 15, rpe: RPE.usor, ts: BASE + i * DAY });
  }
  localStorage.setItem('logs', JSON.stringify(logs));
}

const smart = (ageYears) =>
  DP.getSmartRecommendation(EX, null, null, BASE + 10 * DAY, null, [], { ageYears });

describe('tendonLoadRateCap — pure age→fraction curve', () => {
  it('returns 1.0 (no cap) at / below the full-step age', () => {
    expect(tendonLoadRateCap(TENDON_FULL_AGE)).toBe(1);
    expect(tendonLoadRateCap(30)).toBe(1);
    expect(tendonLoadRateCap(25)).toBe(1);
  });

  it('returns the floor fraction at / above the cap age', () => {
    expect(tendonLoadRateCap(TENDON_CAP_AGE)).toBe(TENDON_FLOOR_FRAC);
    expect(tendonLoadRateCap(70)).toBe(TENDON_FLOOR_FRAC);
    expect(tendonLoadRateCap(99)).toBe(TENDON_FLOOR_FRAC);
  });

  it('is monotonically DECREASING across the taper band', () => {
    let prev = tendonLoadRateCap(TENDON_FULL_AGE);
    for (let a = TENDON_FULL_AGE + 1; a <= TENDON_CAP_AGE; a++) {
      const cur = tendonLoadRateCap(a);
      expect(cur).toBeLessThanOrEqual(prev);
      expect(cur).toBeGreaterThanOrEqual(TENDON_FLOOR_FRAC);
      prev = cur;
    }
  });

  it('a 50yo sits strictly between full and floor (linear midpoint)', () => {
    const c = tendonLoadRateCap(50); // midpoint of [35,65]
    expect(c).toBeLessThan(1);
    expect(c).toBeGreaterThan(TENDON_FLOOR_FRAC);
    expect(c).toBeCloseTo(1 - 0.5 * (1 - TENDON_FLOOR_FRAC), 6);
  });

  it('absent / invalid age → 1.0 (neutral, a cold-start user is never penalized)', () => {
    for (const a of [undefined, null, NaN, 0, -5, 'x']) {
      expect(tendonLoadRateCap(a)).toBe(1);
    }
  });
});

describe('dp_tendon_cap_v1 OFF — byte-identical regardless of age', () => {
  beforeEach(() => { localStorage.clear(); seedEasyRun(); });

  it('an OLD age with the flag OFF gives the SAME climb as a young age / no age', () => {
    const young = smart(30);
    const oldOff = smart(65); // flag OFF → ageYears ignored
    const noAge = smart(undefined);
    expect(oldOff.kg).toBe(young.kg);
    expect(oldOff.kg).toBe(noAge.kg);
    expect(oldOff.status).toBe(noAge.status);
  });
});

describe('dp_tendon_cap_v1 ON — an older lifter climbs LOAD in smaller steps', () => {
  beforeEach(() => { localStorage.clear(); seedEasyRun(); ON(); });

  it('age 30 is byte-identical to the flag-OFF climb (cap inert under TENDON_FULL_AGE)', () => {
    const young = smart(30);
    localStorage.removeItem('_devFlags');
    const off = smart(30);
    expect(young.kg).toBe(off.kg);
  });

  it('age 65 climbs to a SMALLER or equal weight than age 30 on the same easy-run', () => {
    const young = smart(30);
    const old = smart(65);
    // The easy-run NEW-max climb is genuinely live (young climbs above the 30kg log).
    expect(young.kg).toBeGreaterThan(30);
    // The tendon cap damps the new-max step for the older lifter → never above young.
    expect(old.kg).toBeLessThanOrEqual(young.kg);
    // Capacity is never cratered — the older lifter still moves forward.
    expect(old.kg).toBeGreaterThan(30);
  });
});
