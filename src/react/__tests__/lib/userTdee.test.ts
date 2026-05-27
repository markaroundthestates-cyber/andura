// Piesa 1 nutrition-brain fix — per-user maintenance TDEE base tests.
//
// Proves the nutrition base is REAL per-user TDEE (omoara baza flat 2640):
// Maria 40kg mentenanta primeste mult mai putin decat Marius 110kg/2m bulk,
// si NICIUNUL nu primeste 2640. Acopera userTdee pure helpers + integrarea
// in engineWrappers.getNutritionTargetsToday via onboardingStore + phase
// override.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../engine/bayesianNutrition/index.js', () => ({
  evaluate: vi.fn(),
  ENGINE_ID: 'bayesianNutrition',
}));

import {
  computeMifflinStJeorBMR,
  computeMaintenanceTDEE,
  computeProteinTargetG,
  countSessionsInWindow,
  countLoggedWeeks,
  blendWeightFromLoggedWeeks,
  blendEffectiveSessions,
  readPlannedSessionsPerWeek,
  NEAT_BASE,
  PER_SESSION_NET_KCAL,
  SESSIONS_WINDOW_DAYS,
  BLEND_FULL_WEEKS,
  PROTEIN_G_PER_KG_BODYWEIGHT,
} from '../../lib/userTdee';
import { getNutritionTargetsToday } from '../../lib/engineWrappers';
import { evaluate as evaluateBN } from '../../../engine/bayesianNutrition/index.js';
import { createMockBNResult } from '../../../test-utils/createMockContext';
import { useOnboardingStore } from '../../stores/onboardingStore';

// Maria: femeie 65 ani, 40kg, 155cm. Marius: barbat 30 ani, 110kg, 200cm.
const MARIA = { sex: 'f' as const, weightKg: 40, ageYears: 65, heightCm: 155 };
const MARIUS = { sex: 'm' as const, weightKg: 110, ageYears: 30, heightCm: 200 };

function setOnboarding(stats: { sex: 'm' | 'f'; weightKg: number; ageYears: number; heightCm: number }): void {
  const s = useOnboardingStore.getState();
  s.setField('sex', stats.sex);
  s.setField('weight', stats.weightKg);
  s.setField('age', stats.ageYears);
  s.setField('height', stats.heightCm);
}

beforeEach(() => {
  vi.clearAllMocks();
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

afterEach(() => {
  useOnboardingStore.getState().reset();
  localStorage.clear();
});

describe('userTdee — pure helpers', () => {
  it('Mifflin-St Jeor BMR matches formula for female + male', () => {
    // F: 10·40 + 6.25·155 - 5·65 - 161 = 400 + 968.75 - 325 - 161 = 882.75 → 883
    expect(computeMifflinStJeorBMR(MARIA)).toBe(883);
    // M: 10·110 + 6.25·200 - 5·30 + 5 = 1100 + 1250 - 150 + 5 = 2205
    expect(computeMifflinStJeorBMR(MARIUS)).toBe(2205);
  });

  it('returns null cand inputs incomplete', () => {
    expect(computeMifflinStJeorBMR({ sex: null, weightKg: 40, ageYears: 65, heightCm: 155 })).toBeNull();
    expect(computeMifflinStJeorBMR({ sex: 'f', weightKg: null, ageYears: 65, heightCm: 155 })).toBeNull();
  });

  // Forward physical model (2026-05-27 redesign): TDEE = BMR × NEAT_BASE +
  // (sessionsThisWeek × PER_SESSION_NET_KCAL)/7. With 0 sessions → BMR×NEAT only.
  it('maintenance TDEE = forward model (NEAT base, 0 sessions)', () => {
    expect(computeMaintenanceTDEE(MARIA)).toBe(Math.round(883 * NEAT_BASE));
    expect(computeMaintenanceTDEE(MARIUS)).toBe(Math.round(2205 * NEAT_BASE));
  });

  it('maintenance TDEE RISES with more actual sessions this week (4 vs 6)', () => {
    const base = Math.round(2205 * NEAT_BASE);
    const four = computeMaintenanceTDEE({ ...MARIUS, sessionsThisWeek: 4 });
    const six = computeMaintenanceTDEE({ ...MARIUS, sessionsThisWeek: 6 });
    expect(four).toBe(Math.round(2205 * NEAT_BASE + (4 * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS));
    expect(six).toBe(Math.round(2205 * NEAT_BASE + (6 * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS));
    // The whole point of the redesign: 6 workouts > 4 workouts > sedentary base.
    expect((four as number)).toBeGreaterThan(base);
    expect((six as number)).toBeGreaterThan(four as number);
  });

  it('countSessionsInWindow counts only finishes within the last 7 days', () => {
    const now = Date.UTC(2026, 4, 27);
    const DAY = 24 * 60 * 60 * 1000;
    const sessions = [
      { ts: now - 1 * DAY }, // in window
      { ts: now - 3 * DAY }, // in window
      { ts: now - 6 * DAY }, // in window
      { ts: now - 9 * DAY }, // OUT of window (>7 days)
    ];
    expect(countSessionsInWindow(sessions, now)).toBe(3);
    expect(countSessionsInWindow([], now)).toBe(0);
  });

  it('protein target = g/kg × bodyweight per-user', () => {
    expect(computeProteinTargetG(40)).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(computeProteinTargetG(110)).toBe(Math.round(110 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(computeProteinTargetG(null)).toBeNull();
  });
});

// Planned-prior -> actual-posterior confidence blend (2026-05-27 refinement).
// Fixes the cold-start gap: a brand-new user who PLANS 4/week but hasn't logged
// a full week must be fed for 4, NOT sedentary-zero. Plan is the prior at
// cold-start; logged sessions refine it as weeks of history accumulate.
describe('userTdee — planned-prior -> actual-posterior blend', () => {
  const helper = (sessions: Partial<UserStatsInputLike>) =>
    computeMaintenanceTDEE({ ...MARIUS, ...sessions } as never);

  type UserStatsInputLike = {
    sessionsThisWeek?: number;
    plannedPerWeek?: number;
    loggedWeeks?: number;
  };

  function tdeeForEffective(eff: number): number {
    return Math.round(2205 * NEAT_BASE + (eff * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS);
  }

  it('blendWeightFromLoggedWeeks ramps 0 -> 1 over BLEND_FULL_WEEKS', () => {
    expect(blendWeightFromLoggedWeeks(0)).toBe(0);
    expect(blendWeightFromLoggedWeeks(BLEND_FULL_WEEKS / 2)).toBeCloseTo(0.5);
    expect(blendWeightFromLoggedWeeks(BLEND_FULL_WEEKS)).toBe(1);
    expect(blendWeightFromLoggedWeeks(BLEND_FULL_WEEKS + 10)).toBe(1); // capped
    expect(blendWeightFromLoggedWeeks(-3)).toBe(0);
  });

  it('blendEffectiveSessions: no plan -> pure actual (prior-less fallback)', () => {
    expect(blendEffectiveSessions(6, null, 0)).toBe(6);
    expect(blendEffectiveSessions(6, undefined, 5)).toBe(6);
    expect(blendEffectiveSessions(0, 0, 2)).toBe(0);
  });

  it('blendEffectiveSessions: cold-start trusts plan, drifts to actual', () => {
    // 0 logged weeks -> w=0 -> pure plan.
    expect(blendEffectiveSessions(0, 4, 0)).toBe(4);
    // half-way -> 50/50.
    expect(blendEffectiveSessions(2, 4, BLEND_FULL_WEEKS / 2)).toBeCloseTo(3);
    // full weeks -> w=1 -> pure actual.
    expect(blendEffectiveSessions(6, 4, BLEND_FULL_WEEKS)).toBe(6);
  });

  it('countLoggedWeeks = whole weeks span from oldest logged session to now', () => {
    const now = Date.UTC(2026, 4, 27);
    const DAY = 24 * 60 * 60 * 1000;
    expect(countLoggedWeeks([], now)).toBe(0);
    expect(countLoggedWeeks([{ ts: now - 3 * DAY }], now)).toBe(0); // <1 week
    expect(countLoggedWeeks([{ ts: now - 10 * DAY }, { ts: now - 2 * DAY }], now)).toBe(1);
    expect(countLoggedWeeks([{ ts: now - 25 * DAY }], now)).toBe(3);
  });

  // Helper: current ISO week-start (Monday), matching userTdee.weekStartIso.
  function currentWeekStartIso(): string {
    const d = new Date();
    const jsDow = d.getDay();
    const mondayIdx = jsDow === 0 ? 6 : jsDow - 1;
    d.setDate(d.getDate() - mondayIdx);
    return d.toLocaleDateString('sv');
  }

  it('readPlannedSessionsPerWeek prefers calendar plan, falls back to onboarding freq', () => {
    // No signal at all -> null.
    expect(readPlannedSessionsPerWeek()).toBeNull();

    // Onboarding frequency only -> uses it.
    useOnboardingStore.getState().setField('frequency', '3');
    expect(readPlannedSessionsPerWeek()).toBe(3);

    // Calendar override (current week, 5 active days) PREFERRED over onboarding.
    const selectedDays = ['L', 'M', 'M2', 'J', 'V', 'S', 'D'].map((day, i) => ({
      day,
      active: i < 5, // 5 active days
    }));
    localStorage.setItem(
      'wv2-calendar-override',
      JSON.stringify({ selectedDays, weekStartIso: currentWeekStartIso(), committedAt: '' }),
    );
    expect(readPlannedSessionsPerWeek()).toBe(5);

    // Stale (prior week) override -> ignored, falls back to onboarding freq.
    localStorage.setItem(
      'wv2-calendar-override',
      JSON.stringify({ selectedDays, weekStartIso: '2000-01-03', committedAt: '' }),
    );
    expect(readPlannedSessionsPerWeek()).toBe(3);
  });

  // CLAIM (a) — cold-start: 0 logged weeks, planned=4 feeds for 4 sessions,
  // NOT sedentary-zero. This is the whole point of the refinement.
  it('(a) cold-start (0 logged weeks, planned 4) is fed for 4, NOT sedentary-zero', () => {
    const sedentary = tdeeForEffective(0);
    const coldStart = helper({ sessionsThisWeek: 0, plannedPerWeek: 4, loggedWeeks: 0 });
    expect(coldStart).toBe(tdeeForEffective(4));
    expect(coldStart as number).toBeGreaterThan(sedentary);
  });

  // CLAIM (b) — as logged weeks accumulate, the blend drifts toward actual.
  it('(b) blend drifts toward actual as logged weeks accumulate (plan 4, actual 6)', () => {
    const w0 = helper({ sessionsThisWeek: 6, plannedPerWeek: 4, loggedWeeks: 0 });
    const wHalf = helper({ sessionsThisWeek: 6, plannedPerWeek: 4, loggedWeeks: BLEND_FULL_WEEKS / 2 });
    const wFull = helper({ sessionsThisWeek: 6, plannedPerWeek: 4, loggedWeeks: BLEND_FULL_WEEKS });
    expect(w0).toBe(tdeeForEffective(4)); // trusts plan
    expect(wFull).toBe(tdeeForEffective(6)); // pure actual
    expect(wHalf as number).toBeGreaterThan(w0 as number);
    expect(wHalf as number).toBeLessThan(wFull as number);
  });

  // CLAIM (c) — plan 4 but sustained actual 2 -> drifts DOWN toward 2.
  it('(c) plan 4 / sustained actual 2 drifts DOWN toward 2 over weeks', () => {
    const start = helper({ sessionsThisWeek: 2, plannedPerWeek: 4, loggedWeeks: 0 });
    const later = helper({ sessionsThisWeek: 2, plannedPerWeek: 4, loggedWeeks: BLEND_FULL_WEEKS });
    expect(start).toBe(tdeeForEffective(4)); // starts at plan
    expect(later).toBe(tdeeForEffective(2)); // drifts down to actual
    expect(later as number).toBeLessThan(start as number);
  });
});

describe('engineWrappers — per-user nutrition base (Piesa 1)', () => {
  it('tier none: light 40kg woman gets MUCH lower kcal than heavy 110kg man, NEITHER is 2640', async () => {
    // Maria mentenanta (no phase override = AUTO).
    setOnboarding(MARIA);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const maria = await getNutritionTargetsToday({});

    useOnboardingStore.getState().reset();
    setOnboarding(MARIUS);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const marius = await getNutritionTargetsToday({});

    expect(maria.kcalTarget).not.toBe(2640);
    expect(marius.kcalTarget).not.toBe(2640);
    expect(maria.kcalTarget).toBeLessThan(marius.kcalTarget);
    // Forward model, 0 sessions: Maria 883×1.25 ≈ 1104 mentenanta. Maria 40kg/155cm
    // e SUBPONDERALA (BMI 16.6) → guardrail-ul de crestere o ridica la surplus
    // (mentenanta × 1.08 = 1192), NU la podeaua absoluta. Floor-ul feminin (1000)
    // nu mai forteaza artificial 1200; surplus-ul de crestere e tinta corecta.
    expect(maria.kcalTarget).toBe(Math.round(Math.round(883 * NEAT_BASE) * 1.08));
    // Marius mentenanta ~ 2205×1.25 ≈ 2756 (NEAT base, 0 sessions this week).
    expect(marius.kcalTarget).toBe(Math.round(2205 * NEAT_BASE));
    // Protein per-user, NOT flat 180.
    expect(maria.proteinTargetG).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(marius.proteinTargetG).toBe(Math.round(110 * PROTEIN_G_PER_KG_BODYWEIGHT));
    expect(maria.source).toBe('engine');
  });

  it('phase override BULK applies multiplier to REAL per-user TDEE (forward model)', async () => {
    setOnboarding(MARIUS);
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // Forward model, 0 sessions: 2205 BMR × 1.25 NEAT = 2756 TDEE × 1.08 BULK ≈ 2976.
    // BULK is a surplus over the per-user maintenance, NOT the flat 2640.
    const maintenance = Math.round(2205 * NEAT_BASE);
    expect(r.kcalTarget).toBe(Math.round(maintenance * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(maintenance);
    expect(r.kcalTarget).not.toBe(2640);
  });

  it('phase override CUT reduces target below maintenance (per-user)', async () => {
    setOnboarding(MARIUS);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const maintenance = await getNutritionTargetsToday({});

    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const cut = await getNutritionTargetsToday({});

    expect(cut.kcalTarget).toBeLessThan(maintenance.kcalTarget);
  });

  it('cold start (no onboarding stats) falls back to flat 2640 baseline', async () => {
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(2640);
    expect(r.proteinTargetG).toBe(180);
    expect(r.source).toBe('baseline');
  });

  // CLAIM (a) end-to-end + (d) phase delta still applies on top of the blended
  // base. Onboarding frequency='4' is the planned prior read at the I/O boundary
  // (readPlannedSessionsPerWeek). Cold-start (no logged sessions) -> fed for the
  // planned 4, NOT sedentary; BULK multiplier applies over that blended base.
  it('(a)+(d) cold-start uses planned freq as base, phase BULK delta applies on top', async () => {
    setOnboarding(MARIUS);
    useOnboardingStore.getState().setField('frequency', '4');
    const blendedBase = Math.round(2205 * NEAT_BASE + (4 * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS);
    const sedentaryBase = Math.round(2205 * NEAT_BASE);

    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});

    // Base is the PLANNED-fed maintenance, not sedentary; BULK 1.08 over it.
    expect(r.kcalTarget).toBe(Math.round(blendedBase * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(Math.round(sedentaryBase * 1.08));
  });

  // CLAIM (d) — BUG #4: Maria 40kg/155cm e SUBPONDERALA (BMI 16.6), deci
  // guardrail-ul de crestere (healthy-floor) o ridica la un SURPLUS de crestere
  // (mentenanta × 1.08), NU o lasa la podeaua de 1200 (care pentru ea ar fi
  // sub-hranire). Surplus-ul supersede podeaua absoluta de 1200. (Podeaua 1200
  // ramane enforced in cod pentru caile non-subponderale / cold-start.)
  it('(d) BUG #4 subponderala → ridicata la surplus de crestere, peste podeaua 1200', async () => {
    setOnboarding(MARIA);
    useOnboardingStore.getState().setField('frequency', '2');
    const blended = Math.round(883 * NEAT_BASE + (2 * PER_SESSION_NET_KCAL) / SESSIONS_WINDOW_DAYS);
    vi.mocked(evaluateBN).mockResolvedValueOnce(createMockBNResult({ tier: 'none', meta: {} }));
    const r = await getNutritionTargetsToday({});
    // Subponderala → surplus de crestere (clamped), NU podeaua 1200 nici deficit.
    expect(r.healthyFloorClamped).toBe(true);
    expect(r.kcalTarget).toBe(Math.round(blended * 1.08));
    expect(r.kcalTarget).toBeGreaterThan(1200);
  });

  it('engine posterior present: kcal from Kalman mu, protein still per-user', async () => {
    setOnboarding(MARIA);
    vi.mocked(evaluateBN).mockResolvedValueOnce(
      createMockBNResult({
        confidence: 'high',
        meta: { nutrition_inference_metadata: { posterior: { mu: 1400 } } },
      }),
    );
    const r = await getNutritionTargetsToday({});
    expect(r.kcalTarget).toBe(1400);
    expect(r.proteinTargetG).toBe(Math.round(40 * PROTEIN_G_PER_KG_BODYWEIGHT));
  });
});
