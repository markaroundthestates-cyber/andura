// Goal-driven nutrition kcal delta — onboarding goal produce deficit/surplus.
//
// Bug fix: un user care alege "slabire" (cut) la onboarding vedea mereu
// kcal-ul de mentenanta (~3191) fiindca pipeline-ul de nutritie NU citea
// goal-ul. Fix-ul: goal onboarding → multiplicator kcal (reuse
// PHASE_MULTIPLIERS) cand NU exista override manual de faza (SchimbaFaza).
//
// Precedence verificat aici: override manual faza > goal onboarding >
// mentenanta. Acopera atat path-ul tier 'none' (mentenanta per-user) cat si
// path-ul cu posterior.mu (TDEE adaptiv Kalman) — ambele primesc goal-delta.

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

// User din bug report: barbat, 110kg, 184cm, 35 ani. Mentenanta TDEE ~3191.
const USER = { sex: 'm' as const, weight: 110, height: 184, age: 35 };

function setUser(goal: Goal | null): void {
  const s = useOnboardingStore.getState();
  s.setField('sex', USER.sex);
  s.setField('weight', USER.weight);
  s.setField('height', USER.height);
  s.setField('age', USER.age);
  if (goal !== null) s.setField('goal', goal);
}

// Maintenance TDEE pentru USER — forward physical model (2026-05-27 redesign):
// TDEE = BMR × NEAT_BASE(1.25) + (sessionsThisWeek × 300)/7. No sessions logged
// in these tests → activity term = 0 → TDEE = BMR × 1.25.
// BMR = 10·110 + 6.25·184 - 5·35 + 5 = 1100 + 1150 - 175 + 5 = 2080
// TDEE = round(2080 × 1.25) = 2600.
const MAINTENANCE = 2600;

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
  // progresStore.addWeightEntry stampeaza ts=Date.now(); pentru trend istoric
  // controlat setam direct prin setState (test-only, ocoleste upsert-by-date).
  const ts = Date.now() - daysAgo * DAY;
  const date = new Date(ts).toISOString().slice(0, 10);
  useProgresStore.setState((s) => ({ weightLog: [...s.weightLog, { kg, date, ts }] }));
}

describe('engineWrappers — goal-driven kcal delta (tier none / per-user maintenance)', () => {
  it('goal "mentenanta" == maintenance TDEE (no delta)', async () => {
    setUser('mentenanta');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(MAINTENANCE);
  });

  it('goal "auto" supraponderal (BMI 32.5) → CUT din body-comp (BUG #5)', async () => {
    // USER e 110kg/184cm = BMI 32.5 supraponderal. Fara istoric de greutate,
    // weight-trend e flat → AUTO cade pe body-comp → CUT (NU mai mentenanta
    // tacuta). Asta e exact bug-ul raportat: "Auto da 2788 dar ar trebui CUT".
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('goal "slabire" gives target meaningfully BELOW maintenance (~0.82x CUT)', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('goal "masa" gives target ABOVE maintenance (~1.08x BULK)', async () => {
    setUser('masa');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "forta" gives slight surplus (~1.05x STRENGTH)', async () => {
    setUser('forta');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.05));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('goal "longevitate" == maintenance (no delta)', async () => {
    setUser('longevitate');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(MAINTENANCE);
  });
});

describe('engineWrappers — precedence: manual phase override > onboarding goal', () => {
  it('manual phase-override BULK still wins even cand goal = slabire (CUT)', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // BULK 1.08 pe TDEE real — SURPLUS, NU deficit, desi goal e slabire.
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

describe('engineWrappers — goal-delta applies to adaptive Bayesian TDEE (posterior.mu)', () => {
  it('goal "slabire" applies CUT 0.82 to learning user posterior.mu', async () => {
    setUser('slabire');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(3000 * 0.82));
    expect(r.source).toBe('engine');
  });

  it('goal "masa" applies BULK 1.08 to posterior.mu', async () => {
    setUser('masa');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(3000 * 1.08));
  });

  it('goal "auto" supraponderal aplica CUT din body-comp pe posterior.mu (BUG #5)', async () => {
    // USER supraponderal (BMI 32.5) fara weight-trend → body-comp CUT 0.82,
    // aplicat pe TDEE-ul adaptiv Kalman (posterior.mu). NU mai lasa mu neatins.
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(3000 * 0.82));
  });

  it('manual override BULK wins over goal-delta even on posterior.mu path', async () => {
    setUser('slabire');
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 3000 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    // Override BULK deriva din TDEE real per-user (NU posterior.mu), via
    // getPhaseOverrideKcalToday → readUserMaintenanceTDEE × 1.08.
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
    // 1400 × 0.82 = 1148 < 1200 → floored la 1200.
    expect(r.kcalTarget).toBe(1200);
  });
});

describe('engineWrappers — AUTO auto-detects phase (weight trend + body-comp BUG #5)', () => {
  it('AUTO cold-start supraponderal (zero cantariri) → CUT din body-comp (BUG #5)', async () => {
    // Fara cantariri, weight-trend e insuficient → body-comp decide. USER e
    // supraponderal (BMI 32.5) → CUT. Inainte era MAINTAIN tacut (bug-ul).
    setUser('auto');
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('AUTO cold-start greutate sanatoasa → MAINTAIN (body-comp NU forteaza CUT)', async () => {
    // Contra-proba BUG #5: un user AUTO la greutate sanatoasa (75kg/180cm =
    // BMI 23.1, fara cantariri) ramane la MENTENANTA — body-comp da CUT DOAR
    // la supraponderal/bf-mare, NU blanket. Mentenanta = BMR×1.25 (no sessions).
    useOnboardingStore.getState().reset();
    const s = useOnboardingStore.getState();
    s.setField('sex', 'm');
    s.setField('weight', 75);
    s.setField('height', 180);
    s.setField('age', 30);
    s.setField('goal', 'auto');
    // BMR = 10·75 + 6.25·180 - 5·30 + 5 = 750 + 1125 - 150 + 5 = 1730; ×1.25 = 2163.
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(2163);
  });

  it('AUTO cu weight trend SCADERE → CUT delta (sub mentenanta)', async () => {
    setUser('auto');
    addWeighIn(84, 28); // acum 28 zile
    addWeighIn(82, 0); // azi → -2kg / 4 sapt
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('AUTO cu weight trend CRESTERE → BULK delta (peste mentenanta)', async () => {
    setUser('auto');
    addWeighIn(80, 28);
    addWeighIn(82, 0); // +2kg / 4 sapt
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(MAINTENANCE);
  });

  it('AUTO platou supraponderal (trend flat) → CUT din body-comp (BUG #5)', async () => {
    // Weight-trend flat (sub prag) → NU semnal directional → body-comp decide.
    // USER supraponderal → CUT (un user gras la platou ARE nevoie de deficit).
    setUser('auto');
    addWeighIn(80.0, 28);
    addWeighIn(80.1, 0); // zgomot, sub prag 0.1 kg/sapt
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('AUTO span scurt supraponderal (< 14 zile) → CUT din body-comp (BUG #5)', async () => {
    // Span prea scurt pentru un trend de incredere → body-comp decide. USER
    // supraponderal → CUT.
    setUser('auto');
    addWeighIn(84, 5);
    addWeighIn(82, 0); // span 5 zile, prea scurt
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
    expect(r.kcalTarget).toBeLessThan(MAINTENANCE);
  });

  it('manual override CUT inca bate AUTO-detected BULK (precedence)', async () => {
    setUser('auto');
    addWeighIn(80, 28);
    addWeighIn(82, 0); // AUTO ar detecta BULK
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // Override CUT (0.82) bate AUTO BULK.
    expect(r.kcalTarget).toBe(Math.round(MAINTENANCE * 0.82));
  });

  it('AUTO trend scadere aplica CUT pe posterior.mu adaptiv (user care invata)', async () => {
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
    expect(r.kcalTarget).toBe(Math.round(3000 * 0.82));
  });
});
