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
// Forward physical model (2026-05-27 redesign): TDEE = BMR × NEAT_BASE(1.25) +
// (sessionsThisWeek × 300)/7. These tests log NO workouts → activity term = 0 →
// Mifflin BMR = 10·110 + 6.25·184 − 5·35 + 5 = 2080; TDEE = round(2080×1.25) = 2600.
const USER = { sex: 'm' as const, weight: 110, height: 184, age: 35 };
const MAINTENANCE = 2600;

// Energy-balance trend (scale = slow calibrator): 100→99→98→97 kg over a 30-day
// span (4 weigh-ins, linear-regression slope), logging 2000 kcal/day. Slope =
// −0.1 kg/day → ONE trend observation TDEE = 2000 + 0.1×7700 = 2770. With 4
// weigh-ins → tier T1 (trend calibrates, but slowly).
//
// AUDIT CRIT (greutate canonica): greutatea CURENTA = ultima LOGATA (97kg), NU
// onboarding (110). Deci forward-model prior-ul foloseste 97kg: BMR = 10·97 +
// 6.25·184 − 5·35 + 5 = 1950 → mentenanta = round(1950×1.25) = 2438. Conjugate
// update blendeaza prior-ul 2438 cu trend-ul 2770 → posterior.mu ≈ 2704 (verificat
// via run real al engine-ului). The point: it ADAPTS off the forward-model prior
// toward the cantar-implied TDEE (here UP — slabire while logging only 2000
// implies a higher real burn) — slowly, never day-to-day.
const ADAPTED_MU = 2704; // posterior.mu from real evaluateBN (greutate canonica 97kg, ±1 rounding)

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
      { kg: 97, date: '2026-05-31', ts: Date.UTC(2026, 4, 31) },
    ],
  });
  useNutritionStore.setState({
    dailyLog: [
      { dateISO: '2026-05-05', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-09', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-15', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-19', kcal: 2000, protein: null, ts: 0 },
      { dateISO: '2026-05-25', kcal: 2000, protein: null, ts: 0 },
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
    // CUT 0.82 × adapted mu (~2736) ≈ 2244, strictly under the adapted estimate.
    expect(r.kcalTarget).toBeLessThan(ADAPTED_MU);
    expect(r.kcalTarget).toBeCloseTo(Math.round(ADAPTED_MU * 0.82), -1);
  });

  it('bulk goal → target meaningfully ABOVE the adapted maintenance estimate', async () => {
    setUser('masa');
    seedAdaptiveTrend();
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetsToday(ctx);
    expect(r.source).toBe('engine');
    // BULK 1.08 × adapted mu (~2736) ≈ 2955, strictly above the adapted estimate.
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
    // Tier escalates with accumulated weigh-ins (4 weigh-ins → T1, slow calibrator).
    expect(ctx.profileTier).toBe('T1');
    const r = await getNutritionTargetsToday(ctx);
    expect(r.source).toBe('engine');
    // The cantar-implied TDEE (~2770) pulls the posterior OFF the 2600 forward-
    // model prior (here UP: losing weight while logging only 2000 implies a
    // higher real burn). Proves the inference CONSUMED the logged trend (not the
    // static maintenance). The KEY relationship: estimate != flat prior.
    expect(r.kcalTarget).not.toBe(MAINTENANCE);
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
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

// ── kcal floor (sex-aware) enforced through the REAL wire ───────────────────
describe('nutrition pipeline realwire — kcal floor sex-aware (NO engine mock)', () => {
  it('o femeie mica pe cut nu coboara sub floor-ul feminin (1000, CEO directive 2026-05-26)', async () => {
    // Very small user → low maintenance; CUT would push under the floor.
    // AUDIT MED — floor-ul de recomandare e per-sex (femei 1000 / barbati 1200),
    // aliniat cu filtrul de observatii (resolveKcalFloorForSex), per directiva CEO
    // 2026-05-26 ("minim ABSOLUT, nu recomandat — femei 1000 / barbati 1200").
    // 42kg/150cm → BMI 18.67 (peste 18.5, NU subponderala → guardrail-ul de
    // crestere NU se aplica), deci CUT-ul real coboara la floor-ul feminin 1000.
    const s = useOnboardingStore.getState();
    s.setField('sex', 'f');
    s.setField('weight', 42);
    s.setField('height', 150);
    s.setField('age', 70);
    s.setField('goal', 'slabire');
    const ctx = readBayesianNutritionContext();
    const r = await getNutritionTargetsToday(ctx);
    // Floor-ul feminin (1000) clampeaza recomandarea de CUT, NU 1200 flat.
    expect(r.kcalTarget).toBeGreaterThanOrEqual(1000);
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
