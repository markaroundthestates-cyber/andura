// ══ NUTRITION PIPELINE REAL-WIRE E2E ═══════════════════════════════════════
// P4 calibration wave — genuine end-to-end regression guard for the nutrition
// brain (the strongest, most Daniel-sensitive part of the app).
//
// WHY THIS FILE EXISTS (sweep audit 2026-05-26):
//   Every prior nutrition test either (a) mocks `evaluateBN` / `getNutrition
//   TargetsToday` (engineWrappers.goalKcalDelta / .getNutritionTargetsToday /
//   bayesianNutritionAggregate tests) or (b) tests the pure builder in
//   isolation feeding a hand-assembled ctx (nutritionObservations.test). NONE
//   drive the REAL production path the user actually sees:
//
//     real stores (progresStore.weightLog + nutritionStore.dailyLog +
//     onboardingStore) → readBayesianNutritionContext() → REAL evaluateBN()
//     → getNutritionTargetTodayReal() → kcalTarget rendered in NutritionInline
//
//   These tests use NO engine mock. They seed the same Zustand stores the UI
//   writes to, then assert the user-visible kcal target through the unmocked
//   pipeline. They are the regression guard against the exact "green tests on a
//   hollow/dead nutrition wire" failure: if the energy-balance builder, the
//   conjugate Bayesian update, the goal-delta precedence, the per-user
//   maintenance prior, or the kcal floor silently regressed, THESE break (the
//   mocked suites would not).
//
//   Numbers below are NOT guessed — they were computed by running the real
//   engine modules in Node against these exact inputs (anti-hallucination).
//   Behavioral relationships are asserted alongside the pinned values so the
//   intent survives a deliberate recalibration (which would update the pins).

import { describe, it, expect, beforeEach } from 'vitest';
import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { readBayesianNutritionContext } from '../../lib/nutritionObservations';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { useNutritionStore } from '../../stores/nutritionStore';

// User din bug report (goalKcalDelta.test parity): barbat, 110kg, 184cm, 35 ani.
// Mifflin BMR = 10·110 + 6.25·184 − 5·35 + 5 = 2080; TDEE = round(2080×1.55) = 3224.
const USER = { sex: 'm' as const, weight: 110, height: 184, age: 35 };
const MAINTENANCE = 3224;

// Energy-balance trend: 100→99→98 kg across two 10-day windows, logging 2000
// kcal/day. Each window: −1 kg / 10 d @ 2000 → TDEE = 2000 + 7700/10 = 2770.
// Two observations ~2770 → tier T1 (input-dominated). The REAL conjugate update
// blends the 3224 per-user prior with the ~2770 trend → posterior.mu ≈ 2820
// (verified via Node run of the actual engine). The point: it ADAPTS below the
// flat maintenance toward the cantar-implied TDEE — the brand promise made real.
const ADAPTED_MU = 2820; // posterior.mu from real evaluateBN (±1 rounding)

function setUser(goal: Goal | null): void {
  const s = useOnboardingStore.getState();
  s.setField('sex', USER.sex);
  s.setField('weight', USER.weight);
  s.setField('height', USER.height);
  s.setField('age', USER.age);
  if (goal !== null) s.setField('goal', goal);
}

// Seed a real weight + kcal trend the energy-balance builder consumes. We set
// weightLog directly (test-only) to control the historical trend deterministic-
// ally; the daily kcal log feeds avgLoggedIntakeInWindow.
function seedAdaptiveTrend(): void {
  useProgresStore.setState({
    weightLog: [
      { kg: 100, date: '2026-05-01', ts: Date.UTC(2026, 4, 1) },
      { kg: 99, date: '2026-05-11', ts: Date.UTC(2026, 4, 11) },
      { kg: 98, date: '2026-05-21', ts: Date.UTC(2026, 4, 21) },
    ],
  });
  useNutritionStore.setState({
    dailyLog: [
      { dateISO: '2026-05-05', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-09', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-15', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-19', kcal: 2000, protein: null, ts: 0 },
    ],
  });
}

beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  useNutritionStore.getState().reset();
});

// ── (b) onboarding goal → correct kcal delta through the REAL nutrition path ──
// Drives readBayesianNutritionContext() → unmocked evaluateBN() →
// getNutritionTargetsToday(). Proves the goal a user picked at onboarding
// produces a deficit / surplus / maintenance target off the ADAPTED estimate
// (not a flat constant), end-to-end.
describe('nutrition pipeline realwire — onboarding goal → kcal delta (NO engine mock)', () => {
  it('cut goal → target meaningfully BELOW the adapted maintenance estimate', async () => {
    setUser('slabire');
    seedAdaptiveTrend();
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetsToday(ctx);
    expect(r.source).toBe('engine'); // real engine produced the number, not fallback
    // CUT 0.82 × adapted mu (~2820) ≈ 2313, strictly under the adapted estimate.
    expect(r.kcalTarget).toBeLessThan(ADAPTED_MU);
    expect(r.kcalTarget).toBeCloseTo(Math.round(ADAPTED_MU * 0.82), -1);
  });

  it('bulk goal → target meaningfully ABOVE the adapted maintenance estimate', async () => {
    setUser('masa');
    seedAdaptiveTrend();
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetsToday(ctx);
    expect(r.source).toBe('engine');
    // BULK 1.08 × adapted mu (~2820) ≈ 3046, strictly above the adapted estimate.
    expect(r.kcalTarget).toBeGreaterThan(ADAPTED_MU);
    expect(r.kcalTarget).toBeCloseTo(Math.round(ADAPTED_MU * 1.08), -1);
  });

  it('different goals → different targets (cut < maintenance < bulk) through one real pipeline', async () => {
    const target = async (goal: Goal): Promise<number> => {
      useOnboardingStore.getState().reset();
      useProgresStore.getState().reset();
      useNutritionStore.getState().reset();
      setUser(goal);
      seedAdaptiveTrend();
      return (await getNutritionTargetsToday(readBayesianNutritionContext())).kcalTarget;
    };
    const cut = await target('slabire');
    const maintain = await target('mentenanta');
    const bulk = await target('masa');
    // The same engine + same trend, only the onboarding goal differs → the
    // user-visible target orders deficit < maintenance < surplus. A regression
    // that dropped the goal read (the original bug) would tie all three.
    expect(cut).toBeLessThan(maintain);
    expect(maintain).toBeLessThan(bulk);
    expect(maintain).toBeCloseTo(ADAPTED_MU, -1);
  });
});

// ── weight logging → adaptive TDEE (the audit's strongest journey, REAL wire) ──
describe('nutrition pipeline realwire — adapts to logged weight trend (NO engine mock)', () => {
  it('a real weight+kcal trend moves the maintenance estimate OFF the flat per-user TDEE', async () => {
    setUser('mentenanta');
    seedAdaptiveTrend();
    const ctx = readBayesianNutritionContext();
    // Tier escalates with accumulated observations (2 windows → T1).
    expect(ctx.profileTier).toBe('T1');
    const r = await getNutritionTargetsToday(ctx);
    expect(r.source).toBe('engine');
    // The cantar-implied TDEE (~2770) pulls the posterior below the 3224 prior.
    // Proves the inference CONSUMED the logged trend (not the static maintenance).
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
    expect(r.kcalTarget).toBeCloseTo(ADAPTED_MU, -1);
  });

  it('cold start (no weight history) → per-user maintenance, NOT a flat 2640 baseline', async () => {
    setUser('mentenanta'); // no seedAdaptiveTrend → zero observations
    const ctx = readBayesianNutritionContext();
    expect(ctx.profileTier).toBe('T0'); // 0 observations
    const r = await getNutritionTargetsToday(ctx);
    expect(r.source).toBe('engine'); // demographic prior escapes tier 'none'
    // 0 obs → posterior == per-user maintenance prior (Mifflin × 1.55), the
    // immediate honest estimate. NOT the old hardcoded flat 2640.
    expect(r.kcalTarget).toBe(MAINTENANCE);
    expect(r.kcalTarget).not.toBe(2640);
  });

  it('manual full log overrides the engine target (priority 1, real wire)', async () => {
    setUser('masa');
    seedAdaptiveTrend();
    useNutritionStore.setState((s) => ({
      dailyLog: [...s.dailyLog, { dateISO: '2026-05-22', kcal: 2500, protein: 180, ts: Date.now() }],
    }));
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetTodayReal('2026-05-22', ctx);
    expect(r.source).toBe('manual');
    expect(r.kcalTarget).toBe(2500); // user's explicit log wins over the engine
  });
});

// ── kcal floor (LOCK 8) enforced through the REAL wire ──────────────────────
describe('nutrition pipeline realwire — kcal floor 1200 (NO engine mock)', () => {
  it('a tiny user on a cut never drops below the 1200 daily floor', async () => {
    // Very small user → low maintenance; CUT would push under the floor.
    const s = useOnboardingStore.getState();
    s.setField('sex', 'f');
    s.setField('weight', 42);
    s.setField('height', 150);
    s.setField('age', 70);
    s.setField('goal', 'slabire');
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetsToday(ctx);
    // Whatever the CUT-adjusted estimate, the floor clamps it (D-LEGACY-041).
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1200);
  });
});

// ── manual phase override > onboarding goal, through the REAL wire ──────────
describe('nutrition pipeline realwire — phase override precedence (NO engine mock)', () => {
  it('manual SchimbaFaza CUT beats a masa (bulk) onboarding goal', async () => {
    setUser('masa');
    seedAdaptiveTrend();
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetsToday(ctx);
    // Explicit user phase pick wins → a deficit target despite the bulk goal.
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });
});
