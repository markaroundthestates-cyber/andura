// ══ FULL-PATH-SIM CI GATE — the keystone A/B before flipping ~28 engine flags ══
// The calibration-sim drives dp.js getSmartRecommendation DIRECTLY (readiness=null),
// BYPASSING the path-A composition chain. This gate runs multi-session synthetic
// journeys through the COMPLETE getDailyWorkout → runPipeline (8-engine) →
// sessionBuilder → composePlannedWorkoutToday → dp path, with the path-A flags OFF
// (baseline) vs ON, and asserts:
//
//   (§A) DETERMINISM — the OFF + ON full-path prescription-stream hashes match the
//        frozen baseline; any RNG/clock leak in the WHOLE path trips it.
//   (§B) FLAGS ARE EXERCISED — flags ON produce an OBSERVABLE delta vs OFF (the
//        hashes differ + at least one session-shape metric moves). This is the
//        proof the old sim could NOT give: each path-A flag's effect reaches the
//        real seam. Per-flag isolation pins WHICH flag moves WHAT.
//   (§C) SAFETY NOT WORSE — flags ON do not materially increase crater / absurd
//        load (the F-1 bug class) measured on the full-path prescribed kg. (These
//        are RELATIVE OFF-vs-ON, not zero-tolerance: the synthetic true-capacity
//        oracle is approximate — its absolute crater count is an oracle artifact,
//        but a flag making it WORSE is a real regression signal.)
//
// Files into tests/engine/** → runs under `npm run test:run` (CI Unit Tests),
// no workflow edit. Deterministic + offline (no API).

import { describe, it, expect, beforeAll } from 'vitest';
import { runFullPathCohortAsync, acwrRealClockFullPath } from './fp-run.js';
import { analyzeFullPath, craterViolations } from './fp-analyze.js';
import { fullPathStreamHash } from './fp-hash.js';
import { exerciseDipClassifier, exerciseAutoPivot, DIP_CLASS } from './fp-darkprimitives.js';
import { SEED } from './fp-config.js';
import baseline from './_fp_baseline.json';

// CI tier: the frozen baseline's nProfiles + weeks (the full 24×16 ~ minutes; the
// determinism + deltas hold at any size, mirroring the calibration-sim CI tier).
let off, on, aOff, aOn, hashOff, hashOn, crOff, crOn;

beforeAll(async () => {
  off = await runFullPathCohortAsync(false, baseline.nProfiles, SEED, baseline.weeks);
  on = await runFullPathCohortAsync(true, baseline.nProfiles, SEED, baseline.weeks);
  aOff = analyzeFullPath(off);
  aOn = analyzeFullPath(on);
  hashOff = fullPathStreamHash(off);
  hashOn = fullPathStreamHash(on);
  crOff = craterViolations(off).length;
  crOn = craterViolations(on).length;
}, 300000);

describe('full-path-sim CI gate', () => {
  // ── §A DETERMINISM ────────────────────────────────────────────────────────
  it('§A OFF full-path prescription hash is stable (no RNG/clock leak)', () => {
    expect(hashOff).toBe(baseline.hashOff);
  });
  it('§A ON full-path prescription hash is stable (no RNG/clock leak)', () => {
    expect(hashOn).toBe(baseline.hashOn);
  });
  it('§A a fresh OFF run reproduces itself byte-for-byte', async () => {
    const again = await runFullPathCohortAsync(false, baseline.nProfiles, SEED, baseline.weeks);
    expect(fullPathStreamHash(again)).toBe(hashOff);
  }, 300000);

  // ── §B FLAGS ARE EXERCISED THROUGH THE FULL SEAM (the keystone proof) ──────
  it('§B path-A flags ON change the composed prescription stream (the old sim saw NOTHING)', () => {
    // If the flags were dark in the compose path, ON would equal OFF here.
    expect(hashOn).not.toBe(hashOff);
  });
  it('§B path-A flags ON move at least one whole-session metric', () => {
    const moved =
      aOn.session.meanSetTotal !== aOff.session.meanSetTotal ||
      aOn.session.meanDurationMin !== aOff.session.meanDurationMin ||
      aOn.session.meanVolumeKg !== aOff.session.meanVolumeKg;
    expect(moved, JSON.stringify({ off: aOff.session, on: aOn.session })).toBe(true);
  });
  it('§B every full-path planned session is non-empty (the seam never produces a stub)', () => {
    expect(aOff.session.emptySessions).toBe(0);
    expect(aOn.session.emptySessions).toBe(0);
    expect(aOff.session.plannedSessions).toBeGreaterThan(0);
  });

  // ── §B per-flag isolation: each JOURNEY-DRIVABLE flag, alone, is observable ──
  // Proves the EFFECT of each path-A flag reaches the real seam in isolation (the
  // first per-flag flip signal). A flag whose single-flag hash equals OFF would be
  // dark in the compose path. These four read logs / sessionsHistory / time-budget
  // (all date-injectable across the journey). dp_acwr_readiness_v1 is NOT here —
  // readiness resolves against the WALL clock, so it can't be driven across the
  // simulated journey; it is proven separately by the real-clock test below. One
  // test per flag (a single small cohort each) keeps every block short under the
  // full parallel suite (avoids the vitest worker RPC-heartbeat timeout).
  async function singleFlagMoves(flag) {
    const cohort = await runFullPathCohortAsync({ only: flag }, baseline.nProfiles, SEED, baseline.weeks);
    return fullPathStreamHash(cohort) !== hashOff;
  }
  it('§B isolation — dp_weekly_recovery_alloc_v1 moves the stream alone', async () => {
    expect(await singleFlagMoves('dp_weekly_recovery_alloc_v1')).toBe(true);
  }, 120000);
  it('§B isolation — dp_emphasis_specialization_v1 moves the stream alone', async () => {
    expect(await singleFlagMoves('dp_emphasis_specialization_v1')).toBe(true);
  }, 120000);
  it('§B isolation — dp_learned_volume_v1 moves the stream alone', async () => {
    expect(await singleFlagMoves('dp_learned_volume_v1')).toBe(true);
  }, 120000);
  it('§B isolation — dp_stimulus_per_min_v1 moves the stream alone', async () => {
    expect(await singleFlagMoves('dp_stimulus_per_min_v1')).toBe(true);
  }, 120000);

  // ── §B ACWR readiness — proven on a REAL-CLOCK session (not the journey) ────
  // The journey can't set per-session readiness (wall-clock dependency), so ACWR's
  // observability is proven here: a genuine acute:chronic spike dated to the real
  // now → dp_acwr_readiness_v1 ON pushes the readiness score across the band and
  // CUTS the composed session set-volume through the FULL path. The old sim (dp.js
  // direct, readiness=null) could never show this.
  it('§B ACWR readiness flag cuts composed session volume on a real-clock spike (full path)', async () => {
    const r = await acwrRealClockFullPath();
    expect(r.acwr, JSON.stringify(r)).toBeGreaterThan(1.5);     // a real spike
    expect(r.scoreOn, JSON.stringify(r)).toBeLessThan(r.scoreOff); // ACWR lowered the score
    expect(r.moved, JSON.stringify(r)).toBe(true);              // prescription changed
    expect(r.setsOn, JSON.stringify(r)).toBeLessThan(r.setsOff); // fewer sets ON
  }, 120000);

  // ── §C SAFETY NOT WORSE (relative OFF→ON on the full-path prescribed kg) ────
  // crater + oscillation are ZERO-TOLERANCE-style (a flag must not REINTRODUCE the
  // F-1 crater class nor a saw-tooth): ON must not exceed OFF. absurd + convergence
  // ride a small tolerance band — the synthetic true-capacity ORACLE is approximate,
  // so a tiny absolute wobble is oracle noise, but a MATERIAL increase is a real
  // flip-blocker (mirrors the calibration-sim §1.A regression-band philosophy).
  it('§C flags ON do not increase crater count (F-1 class) vs OFF', () => {
    expect(crOn, `craters OFF ${crOff} → ON ${crOn}`).toBeLessThanOrEqual(crOff);
  });
  it('§C flags ON do not increase oscillation (saw-tooth) vs OFF', () => {
    expect(aOn.failureFlags.counts.oscillation).toBeLessThanOrEqual(aOff.failureFlags.counts.oscillation);
  });
  it('§C absurd-load does not get MATERIALLY worse ON vs OFF (oracle-band)', () => {
    // Tolerance band: a few absurd flips are synthetic-oracle artifacts; a material
    // jump (>10) would mean a flag genuinely craters loads through the seam.
    expect(
      aOn.failureFlags.counts.absurd,
      `absurd OFF ${aOff.failureFlags.counts.absurd} → ON ${aOn.failureFlags.counts.absurd}`,
    ).toBeLessThanOrEqual(aOff.failureFlags.counts.absurd + 10);
  });
  it('§C convergence not materially worse than OFF (oracle-band)', () => {
    expect(aOn.convergence.convergedPct).toBeGreaterThanOrEqual(aOff.convergence.convergedPct - 2.0);
    expect(aOn.convergence.meanFinalAbsErr).toBeLessThanOrEqual(aOff.convergence.meanFinalAbsErr + 0.02);
  });
});

// ── DARK path-A primitives (NOT full-path-drivable — honest unit-seam coverage) ──
// dp_dip_classifier_v1 + dp_auto_pivot_v1 have no live caller in the compose path,
// so the cohort cannot observe them. Exercised here at their reachable seam with a
// loud marker that they are NOT yet seam-wired (flip them only with this caveat).
describe('full-path-sim — DARK path-A primitives (unit seam, NOT wired into compose)', () => {
  it('dp_dip_classifier_v1 logic is correct (but uncalled in the session path)', () => {
    const r = exerciseDipClassifier();
    expect(r.gap).toBe(DIP_CLASS.DETRAINING);
    expect(r.fatigueByAcwr).toBe(DIP_CLASS.FATIGUE); // ACWR-high safety guard
    expect(r.lifeDip.class).toBe(DIP_CLASS.LIFE_DIP);
    expect(r.lifeDip.suppressDeload).toBe(true);
    expect(r.none).toBe(DIP_CLASS.NONE);
    expect(r.degradeNoAcwr).toBe(DIP_CLASS.FATIGUE); // degrades safe when ACWR off
  });
  it('dp_auto_pivot_v1 logic is correct (but uncalled in the session path)', () => {
    const r = exerciseAutoPivot(Date.UTC(2026, 5, 1));
    expect(r.proposed).not.toBeNull();
    expect(r.proposed.propose).toBe(true);
    expect(r.proposed.share).toBeGreaterThanOrEqual(0.5);
    expect(r.notProposedMidrange).toBeNull();
    expect(r.notProposedFresh).toBeNull(); // sub-threshold stagnation gate
  });
});
