// Goal-driven nutrition kcal — coherence model 2026-05-30.
//
// The onboarding goal maps to a phase (phaseForGoal), the phase sets the kcal
// SIGN, and (absent a target weight/deadline) a DEFAULT %-of-TDEE shift sizes
// the magnitude (Daniel LOCK 2026-05-30): CUT −20% of TDEE, BULK +12%,
// STRENGTH +5%, MAINTENANCE 0. The % is ADAPTIVE — it scales with the user's own
// maintenance, so a 110kg male is never floored at 1200 (20% of 2600 = 520 →
// 2080, not the hard floor). This supersedes both the old fixed multipliers
// (×0.82 / ×1.08) AND the interim fixed kg/week rate (−0.5 / +0.25 kg/wk).
//
// Precedence verified: manual phase override (SchimbaFaza, multiplier-snapshot)
// > goal/AUTO coherent sizing > maintenance. Covers tier 'none' (per-user
// maintenance) and the posterior.mu (adaptive Bayesian) path.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { createMockBNResult } from '../../../test-utils/createMockContext';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import {
  CUT_DEFICIT_FRACTION_DEFAULT,
  BULK_SURPLUS_FRACTION_DEFAULT,
} from '../../lib/goalPhaseModel';

const USER = { sex: 'm' as const, weight: 110, height: 184, age: 35 };

function setUser(goal: Goal | null): void {
  const s = useOnboardingStore.getState();
  s.setField('sex', USER.sex);
  s.setField('weight', USER.weight);
  s.setField('height', USER.height);
  s.setField('age', USER.age);
  if (goal !== null) s.setField('goal', goal);
}

// TDEE = BMR × 1.25 (no sessions). BMR = 10·110 + 6.25·184 − 5·35 + 5 = 2080.
const MAINTENANCE = 2600;
// Default %-of-TDEE deficit/surplus (no target weight): CUT 20%, BULK 12%. The
// shift is ADAPTIVE — sized off whatever maintenance base the path feeds in
// (per-user TDEE on the tier-none path, posterior.mu on the adaptive path).
const cutKcal = (base: number): number => Math.round(base * (1 - CUT_DEFICIT_FRACTION_DEFAULT));
const bulkKcal = (base: number): number => Math.round(base * (1 + BULK_SURPLUS_FRACTION_DEFAULT));

function maintenanceFor(currentWeightKg: number): number {
  const bmr = 10 * currentWeightKg + 6.25 * USER.height - 5 * USER.age + 5;
  return Math.round(bmr * 1.25);
}

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  localStorage.clear();
});

afterEach(() => {
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  localStorage.clear();
});

const DAY = 1000 * 60 * 60 * 24;
function addWeighIn(kg: number, daysAgo: number): void {
  const ts = Date.now() - daysAgo * DAY;
  const date = new Date(ts).toISOString().slice(0, 10);
  useProgresStore.setState((s) => ({ weightLog: [...s.weightLog, { kg, date, ts }] }));
}

describe('engineWrappers — goal-driven kcal (tier none / per-user maintenance)', () => {
  it('goal "mentenanta" == maintenance TDEE (no shift)', async () => {
    setUser('mentenanta');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(MAINTENANCE);
  });

  it('goal "auto" supraponderal (BMI 32.5) → CUT din body-comp', async () => {
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(MAINTENANCE));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('goal "slabire" → deficit la % implicit (sub mentenanta)', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(MAINTENANCE));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('goal "masa" → surplus la % implicit (peste mentenanta)', async () => {
    setUser('masa');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(bulkKcal(MAINTENANCE));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "forta" → surplus usor (+5% STRENGTH)', async () => {
    setUser('forta');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.05));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });
});

describe('engineWrappers — precedence: manual phase override > onboarding goal', () => {
  it('manual phase-override BULK still wins even cand goal = slabire (CUT)', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // Manual override path keeps the multiplier-snapshot (×1.08) — SURPLUS.
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('manual phase-override CUT wins even cand goal = masa (BULK)', async () => {
    setUser('masa');
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });
});

describe('engineWrappers — override-vs-target reconciliation (stale override loses)', () => {
  it('BULK override + target 20kg BELOW current → deficit, NOT surplus', async () => {
    // User set a BULK override earlier, then a target weight clearly LOSING (90 < 110).
    // The contradicting override must be dropped + reconciled to the actual direction
    // (goal AUTO resolves LOSE → CUT). No deadline → default %-of-TDEE deficit.
    setUser('auto'); // weight 110 (onboarding) — current weight; goal AUTO follows the target
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 });
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(MAINTENANCE));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('CUT override + target 20kg ABOVE current → surplus, NOT deficit', async () => {
    // Mirror: a CUT override under a clearly GAINING target (130 > 110) is dropped +
    // reconciled to GAIN → BULK (default %-of-TDEE surplus).
    setUser('auto'); // weight 110 — current weight; goal AUTO follows the target
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    useProgresStore.getState().setTargetObiectiv({ weightKg: 130 });
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(bulkKcal(MAINTENANCE));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('non-contradicting override is STILL honored (CUT override + LOSE target)', async () => {
    // A CUT override that AGREES with a LOSE target keeps the multiplier-snapshot.
    setUser('auto');
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 });
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });
});

describe('engineWrappers — recency: fresher same-day edit beats earlier snapshot', () => {
  it('a noon weigh-in (newer ts) outranks the morning phase-log snapshot', async () => {
    // Morning: a CUT phase-log snapshot at a STALE kcal + an old ts.
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    const todayISO = new Date().toLocaleDateString('sv');
    const morningTs = Date.now() - 6 * 60 * 60 * 1000; // ~6h ago
    localStorage.setItem(
      'phase-log',
      JSON.stringify([{ date: todayISO, phase: 'CUT', kcalTarget: 9999, ts: morningTs }]),
    );
    // Noon: a fresher weigh-in (ts newer than the snapshot) → snapshot is stale, the
    // coherent path recomputes off the current phase/weight (default 20% deficit).
    addWeighIn(110, 0); // ts = Date.now() > morningTs
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(MAINTENANCE));
    expect(r.kcalTarget).not.toBe(9999);
  });

  it('no fresher edit → the same-day snapshot still wins (recency unchanged)', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    const todayISO = new Date().toLocaleDateString('sv');
    // Snapshot ts NEWER than any weigh-in → snapshot remains authoritative.
    addWeighIn(110, 0);
    const snapshotTs = Date.now() + 60 * 60 * 1000; // 1h in the future vs weigh-in
    localStorage.setItem(
      'phase-log',
      JSON.stringify([{ date: todayISO, phase: 'CUT', kcalTarget: 2050, ts: snapshotTs }]),
    );
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(2050);
  });
});

describe('engineWrappers — goal sizing applies to adaptive Bayesian TDEE (posterior.mu)', () => {
  it('goal "slabire" → deficit % implicit pe posterior.mu', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(3000)); // 3000 × 0.80 = 2400
    expect(r.source).toBe('engine');
  });

  it('goal "masa" → surplus % implicit pe posterior.mu', async () => {
    setUser('masa');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(bulkKcal(3000)); // 3000 × 1.12 = 3360
  });

  it('goal "auto" supraponderal → CUT din body-comp pe posterior.mu', async () => {
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(3000));
  });

  it('manual override BULK wins over goal even on posterior.mu path', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // Override BULK derives from REAL per-user maintenance × 1.08 (NU posterior.mu).
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "slabire" preserves LOCK 8 floor 1200 when posterior.mu small', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 1400 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // 1400 × 0.80 = 1120 < 1200 → floored la 1200 (hard floor barbati).
    expect(r.kcalTarget).toBe(1200);
  });
});

describe('engineWrappers — AUTO auto-detects phase (weight trend + body-comp)', () => {
  it('AUTO cold-start supraponderal → CUT din body-comp', async () => {
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(MAINTENANCE));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('AUTO cold-start greutate sanatoasa → MAINTAIN (body-comp NU forteaza CUT)', async () => {
    useOnboardingStore.getState().reset();
    const s = useOnboardingStore.getState();
    s.setField('sex', 'm');
    s.setField('weight', 75);
    s.setField('height', 180);
    s.setField('age', 30);
    s.setField('goal', 'auto');
    // BMR = 10·75 + 6.25·180 − 5·30 + 5 = 1730; ×1.25 = 2163. MAINTAIN → no shift.
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(2163);
  });

  it('AUTO cu weight trend SCADERE → CUT (sub mentenanta)', async () => {
    setUser('auto');
    addWeighIn(84, 28);
    addWeighIn(82, 0); // -2kg / 4 sapt
    const maint = maintenanceFor(82);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(maint));
    expect(r.kcalTarget).toBeLessThan(maint);
  });

  it('AUTO cu weight trend CRESTERE → BULK (peste mentenanta)', async () => {
    setUser('auto');
    addWeighIn(80, 28);
    addWeighIn(82, 0); // +2kg / 4 sapt
    const maint = maintenanceFor(82);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(bulkKcal(maint));
    expect(r.kcalTarget).toBeGreaterThan(maint);
  });

  it('AUTO platou supraponderal (trend flat) → CUT din body-comp', async () => {
    setUser('auto');
    addWeighIn(110.0, 28);
    addWeighIn(110.1, 0);
    const maint = maintenanceFor(110.1);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(maint));
    expect(r.kcalTarget).toBeLessThan(maint);
  });

  it('manual override CUT inca bate AUTO-detected BULK (precedence)', async () => {
    setUser('auto');
    addWeighIn(80, 28);
    addWeighIn(82, 0); // AUTO ar detecta BULK
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    const maint = maintenanceFor(82);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // Override CUT (multiplier-snapshot 0.82) bate AUTO BULK.
    expect(r.kcalTarget).toBe(Math.round(maint * 0.82));
  });

  it('AUTO trend scadere aplica CUT pe posterior.mu adaptiv', async () => {
    setUser('auto');
    addWeighIn(84, 28);
    addWeighIn(82, 0);
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(cutKcal(3000));
  });
});
