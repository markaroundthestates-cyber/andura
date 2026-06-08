// ══ BUILD #1 — e1RM value-path INTEGRATION test (F3 spec §1, wiring-verify V1) ═
// The full-cohort sim (V2) proved dp_e1rm_v1 ON helps the cohort, but nothing
// proved the value path on a concrete realistic case. This locks it: a high-rep
// history (Leg Extension 60kg x ~30 reps rated `usor`) feeds the PR-floor /
// find-your-weight demonstrated working load. With dp_e1rm_v1 ON the demonstrated
// load RISES above the raw-kg path (which stays stuck at the heaviest logged kg,
// ~60), because e1RM re-expresses high-rep work as a higher 1RM estimate; with the
// flag OFF the demonstrated load is byte-identical to the raw heaviest set.
//
// Uses the REAL rating literals the app stores (workoutStore RATING_TO_RPE:
// usor 6.5 / potrivit 7.5 / greu 8.5) — NOT round comfort numbers — so a green
// test means the live rating path works. Forces the flag via _devFlags (the same
// dev override the ceiling/corridor integration tests use).

import { describe, it, expect, beforeEach } from 'vitest';
import { DP } from '../dp.js';

const RPE = { usor: 6.5, potrivit: 7.5, greu: 8.5 };
const EX = 'Leg Extension'; // machine → e1RM-eligible; REP_RANGES [10,15] → floor 10
const RAW_KG = 60;

// A realistic returning-user history: the SAME 60kg taken to ~30 reps and rated
// `usor` (clear headroom) across several sessions. Raw kg sees only "60 at >=10
// reps"; e1RM sees a much higher estimated 1RM because 30 easy reps is far from
// failure. Newest-first ts so getLogs orders them deterministically.
function seedHighRepHistory() {
  const day = 86400000;
  const base = 1_717_000_000_000; // fixed epoch (deterministic)
  const logs = [];
  for (let i = 0; i < 5; i++) {
    logs.push({ ex: EX, w: RAW_KG, reps: 30, rpe: RPE.usor, ts: base + i * day });
  }
  localStorage.setItem('logs', JSON.stringify(logs));
}

const ON = () => localStorage.setItem('_devFlags', JSON.stringify({ dp_e1rm_v1: true }));

describe('dp_e1rm_v1 — value path on a realistic high-rep history', () => {
  beforeEach(() => {
    localStorage.clear();
    seedHighRepHistory();
  });

  it('OFF: demonstrated working load = the raw heaviest set (~60kg, stuck)', () => {
    // No _devFlags → dp_e1rm_v1 resolves to its default (OFF) → raw path.
    const rMin = (DP.REP_RANGES[EX] || [8, 12])[0]; // 10
    const off = DP._demoWorkingW(EX, rMin);
    expect(off).toBeCloseTo(RAW_KG, 6); // 60 — high-rep work discarded by raw kg
  });

  it('ON: e1RM re-expresses the high-rep work → demonstrated load RISES above 60', () => {
    ON();
    const rMin = (DP.REP_RANGES[EX] || [8, 12])[0]; // 10
    const on = DP._demoWorkingW(EX, rMin);
    // 60x30 usor → e1RM = 60*(1+min(12,30+3)/30) = 60*1.4 = 84; back-solved at the
    // floor (10 reps, potrivit RIR 1 → R_eff 11) = 84/(1+11/30) ≈ 61.46kg.
    const e1rm = 60 * (1 + 12 / 30);
    const expectedOn = e1rm / (1 + 11 / 30);
    expect(on).toBeCloseTo(expectedOn, 4);
    expect(on).toBeGreaterThan(RAW_KG); // the rise — high-rep capacity now counts
  });

  it('ON never regresses below the OFF/raw demonstrated load (PR-floor safe)', () => {
    const rMin = (DP.REP_RANGES[EX] || [8, 12])[0];
    const off = DP._demoWorkingW(EX, rMin);
    ON();
    const on = DP._demoWorkingW(EX, rMin);
    expect(on).toBeGreaterThanOrEqual(off);
  });
});
