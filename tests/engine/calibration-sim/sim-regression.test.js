// ══ CALIBRATION-SIM CI GATE — regression + zero-tolerance bug-class ════════
// Runs the deterministic 50-Gigel cohort ONCE through the REAL engine, then
// asserts:
//   (§1.B) ZERO-TOLERANCE bug-class invariants — crater === 0 (F-1 class). These
//          hold regardless of the baseline; a refactor that reintroduces a crater
//          fails hard even if the averages look fine.
//   (§1.A) REGRESSION vs a FROZEN baseline — soft metrics (convergence, oscillation,
//          equipment bias) may not get MATERIALLY WORSE than the committed snapshot.
//          NOT gated on absolute convergence% (the sim oracle is an aggressive
//          synthetic capacity the conservative engine deliberately does not chase —
//          gating on absolute convergence would red-light a healthy build, per §0).
//   (T1.6) DETERMINISM — the prescription-stream hash matches the frozen baseline;
//          any RNG/clock leak trips it.
//
// Files itself into the existing tests/engine/** glob → runs under npm run test:run
// (the CI "Unit Tests" gate), no workflow edit. Deterministic + offline (no API).

import { describe, it, expect, beforeAll } from 'vitest';
import { runCohort } from './sim-run.js';
import { resetStore } from './sim-config.js';
import { analyzeCohort, craterViolations } from './sim-analyze.js';
import { cohortStreamHash } from './sim-hash.js';
import baseline from './_sim_baseline.json';

// One cohort run shared across the gate assertions. nProfiles comes from the
// frozen baseline (12 — CI tier; the full 50-cohort ~28s blocks the vitest worker
// RPC heartbeat under the full suite, while crater/regression invariants hold at
// any N). Deterministic → a fresh run reproduces the baseline byte-for-byte.
let cohort;
let analysis;
let craters;
let hash;

beforeAll(async () => {
  // CROSS-FILE _devFlags HARDENING (2026-06-14): the determinism hash is computed
  // here in beforeAll, which runs BEFORE this file's per-test localStorage.clear
  // (setup.ts beforeEach) — so it inherits whatever _devFlags a PRIOR test file
  // left in the shared jsdom store. runCohort already calls resetStore() per
  // profile (full pinned baseline), but we ALSO apply it once up front so the
  // baseline is unambiguously in place before any sim/engine read, immune to
  // leaked cross-file flag state. This does NOT weaken the determinism gate — it
  // just guarantees the frozen-baseline flag world before the hash is taken.
  resetStore();
  cohort = await runCohort(baseline.nProfiles);
  analysis = analyzeCohort(cohort);
  craters = craterViolations(cohort);
  hash = cohortStreamHash(cohort);
  // 60000->180000 (2026-06-14): the brain-on flag defaults add per-session engine
  // compute, and under the FULL parallel suite (495 files) the 50-session cohort sim
  // exceeds 60s so the hook times out -> tests skipped -> false-red. The sim is
  // deterministic + ~27-40s solo; the headroom just survives parallel CPU contention
  // (same class as the wiring-coverage timeout). Does NOT weaken any assertion.
}, 180000);

describe('calibration-sim CI gate', () => {
  // ── §1.B ZERO-TOLERANCE bug-class invariants (absolute) ──────────────────
  it('§1.B no crater — a currently-worked load is never re-prescribed at <25% (F-1)', () => {
    expect(craters, JSON.stringify(craters.slice(0, 8))).toHaveLength(0);
  });

  it('§1.B no absurd OVERSHOOT — rec never exceeds 3x the synthetic true capacity', () => {
    // The aggressive-oracle gap explains UNDER-shoots (regression band below), but a
    // rec OVER 3x true capacity is a genuine bug class with no oracle excuse → ZERO.
    const overshoots = (analysis.failureFlags.absurd || []).filter(
      (a) => a.trueWork > 0 && a.recKg > a.trueWork * 3,
    );
    expect(overshoots, JSON.stringify(overshoots.slice(0, 8))).toHaveLength(0);
  });

  // ── T1.6 DETERMINISM (the CI deterministic contract) ─────────────────────
  it('T1.6 cohort prescription hash is stable (no RNG/clock leak)', () => {
    expect(hash).toBe(baseline.hash);
  });

  // ── §1.A REGRESSION vs frozen baseline (soft metrics, NOT absolute) ───────
  it('§1.A convergence not materially worse than baseline', () => {
    const o = analysis.convergence.overall;
    // convergedPct: catch a refactor that BREAKS learning (>= baseline - 1.0 pp).
    expect(o.convergedPct).toBeGreaterThanOrEqual(baseline.convergedPct - 1.0);
    // medianSessionsToConverge: catch a slow-down (<= baseline + 2 sessions).
    expect(o.medianSessionsToConverge).toBeLessThanOrEqual(baseline.medianSessionsToConverge + 2);
    // meanFinalAbsErr: catch systematic drift away from capacity (<= baseline + 0.02).
    expect(o.meanFinalAbsErr).toBeLessThanOrEqual(baseline.meanFinalAbsErr + 0.02);
  });

  it('§1.A oscillation + nonAdaptation never increase (saw-tooth / ignore-override guards)', () => {
    const f = analysis.failureFlags.counts;
    // The hard-no-adapt saw-tooth detector — must never increase.
    expect(f.oscillation).toBeLessThanOrEqual(baseline.flags.oscillation);
    // Engine ignoring sustained overrides — must never increase.
    expect(f.nonAdaptation).toBeLessThanOrEqual(baseline.flags.nonAdaptation);
  });

  it('§1.A no NEW equipment-class collapse (per-bucket signed bias floored)', () => {
    const eq = analysis.systematicBias.byEquipment;
    for (const [bucket, base] of Object.entries(baseline.equipMeanSignedErr)) {
      const cur = eq[bucket]?.meanSignedErr;
      expect(cur, `bucket ${bucket}`).toBeDefined();
      // No NEW collapse: each bucket may not drift materially below its frozen
      // signed bias (barbell baseline ~ -0.38; allow a small -0.07 tolerance band).
      expect(cur, `bucket ${bucket} (${cur} vs base ${base})`).toBeGreaterThanOrEqual(base - 0.07);
    }
  });

  it('§1.A stuckLow + absurd (oracle-relative undershoot) ride the regression baseline', () => {
    // These are conservative-vs-aggressive-oracle gaps (NOT zero-tolerance per §0);
    // gate that they do not get materially worse than the frozen snapshot.
    const f = analysis.failureFlags.counts;
    expect(f.stuckLow).toBeLessThanOrEqual(baseline.flags.stuckLow + 10);
    expect(f.absurd).toBeLessThanOrEqual(baseline.flags.absurd + 5);
  });
});
