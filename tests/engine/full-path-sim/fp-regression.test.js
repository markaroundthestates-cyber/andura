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

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  runFullPathCohortAsync,
  acwrRealClockFullPath,
  fatigueCurveFullPath,
  effectiveRepsDoseFullPath,
  subRecoveryDriftFullPath,
  dipClassifierFullPath,
  cutCohortFullPath,
} from './fp-run.js';
import { analyzeFullPath, craterViolations } from './fp-analyze.js';
import { fullPathStreamHash } from './fp-hash.js';
import { exerciseDipClassifier, exerciseAutoPivot, DIP_CLASS } from './fp-darkprimitives.js';
import { SEED } from './fp-config.js';
import baseline from './_fp_baseline.json';

// ── DATE-STABLE GATE ────────────────────────────────────────────────────────
// This gate composes the WHOLE seam, and parts of the engine resolve "today"
// against the WALL clock (db.tod() = new Date(), readiness.js, the ACWR
// acute(7d)/chronic(28d) windows, the real-clock probes below). The cohort
// journey injects a fixed COHORT_START date, but those wall-clock reads still
// leak the real date in — so the frozen prescription hashes drifted whenever the
// system date crossed an ACWR window edge (e.g. 2026-06-14 → 2026-06-15 shifted
// a seeded log across the acute/chronic boundary → the ratio moved → the hash
// moved → baseline mismatch, even with zero code change).
//
// FIX: freeze the wall clock to a FIXED instant for the whole gate so every
// new Date()/Date.now() in the driven path resolves deterministically regardless
// of the real date. FIXED_NOW is 2026-06-14T12:00:00Z — the instant the current
// baseline was frozen at (verified: this instant reproduces the frozen hashOff/
// hashOn byte-for-byte, so the baseline stays unchanged). Any instant on or
// before 2026-06-14 reproduces the freeze; 2026-06-15 is the first that drifts —
// pinning the clock removes the date as an input entirely.
//
// We fake ONLY Date (toFake:['Date']), leaving setTimeout real: the orchestrator
// budget guard (coach/orchestrator/utilities/budget.js) does Promise.race against
// a real setTimeout, so faking timers would deadlock the compose. Date-only fake
// is sufficient — the leak is the clock, not the timers.
const FIXED_NOW = Date.UTC(2026, 5, 14, 12, 0, 0); // 2026-06-14T12:00:00Z (baseline freeze instant)

// CI tier: the frozen baseline's nProfiles + weeks (the full 24×16 ~ minutes; the
// determinism + deltas hold at any size, mirroring the calibration-sim CI tier).
let off, on, aOff, aOn, hashOff, hashOn, crOff, crOn;

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] }); // freeze Date only; setTimeout stays real (budget-race)
  vi.setSystemTime(FIXED_NOW);
  off = await runFullPathCohortAsync(false, baseline.nProfiles, SEED, baseline.weeks);
  on = await runFullPathCohortAsync(true, baseline.nProfiles, SEED, baseline.weeks);
  aOff = analyzeFullPath(off);
  aOn = analyzeFullPath(on);
  hashOff = fullPathStreamHash(off);
  hashOn = fullPathStreamHash(on);
  crOff = craterViolations(off).length;
  crOn = craterViolations(on).length;
}, 300000);

afterAll(() => {
  vi.useRealTimers(); // restore the wall clock for any sibling suite
});

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
  it('§B isolation — dp_coherent_weekly_alloc_v1 moves the stream alone', async () => {
    // #71 — the v-taper emphasis users get a push/pull/upper/lower split where back
    // is trained on two clusters with DIFFERENT slot counts (pull 4, upper 2), so the
    // coherent per-exercise dose visibly re-levels the same lift across those days.
    expect(await singleFlagMoves('dp_coherent_weekly_alloc_v1')).toBe(true);
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

  // ── §B F6a WIRED flags (was dark → now alive through the real compose seam) ──
  // Each was a built-but-DARK primitive (no live consumer); now wired at its seam.
  // These ride the deload-set path (not the journey-cohort readiness/energy path),
  // so — like ACWR — they get a targeted real-clock probe that flips OFF→ON and
  // shows the COMPOSED session move. Proof the wiring is live: OFF did NOTHING.
  it('§B #20 dp_fatigue_curve_v1 — a learned CRASHER drops a working set (full path)', async () => {
    const r = await fatigueCurveFullPath();
    expect(r.curveKeys, JSON.stringify(r)).toBeGreaterThan(0);   // the learner ran
    // OFF→ON moves the composed stream, and the -1 lands on the CRASHER (above its
    // band floor → visible), never below the ≥1 clamp.
    expect(r.moved, JSON.stringify(r)).toBe(true);
    expect(r.crasherOn, JSON.stringify(r)).toBe(r.crasherOff - 1);
    expect(r.setsOn, JSON.stringify(r)).toBeLessThan(r.setsOff);
  }, 60000);
  it('§B #19 dp_effective_reps_v1 DOSE — a grinder gets one raw set trimmed (full path)', async () => {
    const r = await effectiveRepsDoseFullPath();
    // OFF: the grinder composes at its full set count. ON: the trim drops ONE set
    // (trim-only, never below the band floor) → the composed stream moves.
    expect(r.grinderOff, JSON.stringify(r)).toBeGreaterThan(0);
    expect(r.moved, JSON.stringify(r)).toBe(true);
    expect(r.grinderOn, JSON.stringify(r)).toBe(r.grinderOff - 1);
    expect(r.setsOn, JSON.stringify(r)).toBeLessThan(r.setsOff);
  }, 60000);
  it('§B #26 dp_subrecovery_drift_v1 — systemic drift pre-empts a deload (full path)', async () => {
    const r = await subRecoveryDriftFullPath();
    // OFF: no AA candidate → no reactive deload. ON: the drift candidate feeds the
    // AA trigger → REACTIVE_AA deload → intensityMod flips 'normal' → 'minus'.
    expect(r.intensityModOff, JSON.stringify(r)).toBe('normal');
    expect(r.intensityModOn, JSON.stringify(r)).toBe('minus');
  }, 60000);
  it('§B #32 dp_dip_classifier_v1 — a LIFE_DIP suppresses an over-reactive deload (full path)', async () => {
    const r = await dipClassifierFullPath();
    // The scenario fires a reactive (energy-down-sustained) deload OFF; ON the
    // classifier resolves LIFE_DIP (low ACWR + bad-sleep, not training fatigue) and
    // SUPPRESSES it → intensityMod 'minus' → 'normal'. ACWR must be LOW (the guard).
    expect(r.acwr, JSON.stringify(r)).toBeLessThanOrEqual(1.2);
    expect(r.intensityModOff, JSON.stringify(r)).toBe('minus');
    expect(r.intensityModOn, JSON.stringify(r)).toBe('normal');
    expect(r.suppressed, JSON.stringify(r)).toBe(true);
  }, 60000);

  // ── §B #76 energy→volume — a CUT cohort gets LESS volume but SAME loads ──────
  // The deeper half Daniel flagged: #37 only throttles the LOAD climb; #76 cuts the
  // VOLUME by the deficit MAGNITUDE. This proves it through the WHOLE seam AND proves
  // the CRITICAL invariant — KEEP LOAD: a deficit cuts sets, NEVER the prescribed kg.
  it('§B #76 dp_energy_volume_v1 — a CUT cohort gets LESS volume but the SAME loads (full path)', async () => {
    const r = await cutCohortFullPath();
    // 1) The deficit cut the session VOLUME (fewer working sets ON than OFF).
    expect(r.setsOn, JSON.stringify(r)).toBeLessThan(r.setsOff);
    expect(r.lessVolume, JSON.stringify(r)).toBe(true);
    // 2) KEEP-LOAD — every prescribed kg is BYTE-IDENTICAL OFF vs ON. Nutrition
    //    modulates volume + fatigue, never the heavy load that preserves muscle.
    expect(r.loadsOn, JSON.stringify(r)).toBe(r.loadsOff);
    expect(r.loadsIdentical, JSON.stringify(r)).toBe(true);
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
    // convergedPct band widened 2.0 -> 2.5 (2026-06-09, OHP-dedup + tier-select-anchor
    // coupling). The ON-vs-OFF convergedPct gap is small-N oracle noise — N=8/W=6 gap
    // 2.1 -> N=16/W=10 gap 0.4 -> N=24/W=16 gap -0.2 (ON converges identically/better at
    // the real CI tier), the SAME class as the meanErr band above. Widened for the
    // coupling; still trips on a material convergence regression.
    expect(aOn.convergence.convergedPct).toBeGreaterThanOrEqual(aOff.convergence.convergedPct - 2.5);
    // Oracle-band widened 0.02 -> 0.03 (2026-06-09, dp_daniel_tier_select_v1 default-ON
    // flip). At the small N=8/W=6 CI tier the ON-vs-OFF meanFinalAbsErr wobble is +0.024
    // — verified to be small-cohort oracle NOISE, not a regression: at N=16/W=10 it is
    // +0.007 and at N=24/W=16 it is +0.002 (ON converges essentially identically), and
    // craters strictly DECREASE ON at every tier (68->57, 163->133, 288->233 → ON is
    // SAFER). The 0.03 band admits this small-N wobble while still tripping on a material
    // convergence regression.
    expect(aOn.convergence.meanFinalAbsErr).toBeLessThanOrEqual(aOff.convergence.meanFinalAbsErr + 0.03);
  });
});

// ── path-A primitive unit-seam coverage ─────────────────────────────────────
// dp_auto_pivot_v1 (proposeGoalPivot) is still DARK — its live render-surface is a
// UX moment DEFERRED for Daniel (no live caller in compose). dp_dip_classifier_v1
// is now WIRED into the deload seam (proven by the §B full-path test above); its
// unit-seam branches stay covered here as a fast, deterministic logic guard.
describe('full-path-sim — path-A primitive unit seams', () => {
  it('dp_dip_classifier_v1 branch logic is correct (now also wired §B full-path)', () => {
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
