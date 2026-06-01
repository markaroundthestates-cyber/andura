// Phase 6 task_22 — TDEEStrip Progres dashboard tests.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { useAerobicStore } from '../../../stores/aerobicStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { readUserMaintenanceTDEE } from '../../../lib/userTdee';
import { getNutritionTargetTodayReal } from '../../../lib/bayesianNutritionAggregate';

vi.mock('../../../lib/bayesianNutritionAggregate', () => ({
  getNutritionTargetTodayReal: vi.fn(async () => ({
    kcalTarget: 2640,
    proteinTarget: 180,
    source: 'engine-bn' as const,
    confidence: 0.5,
  })),
}));

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  useNutritionStore.getState().reset();
  useAerobicStore.setState({ sessions: [], lastDuration: 50 });
});

describe('TDEEStrip — Wave C2 i18n EN default', () => {
  it('renders heading "Target today" + kcal placeholder before resolve — EN default', () => {
    render(<TDEEStrip />);
    // Wave C2 i18n: EN default → "Target today" (was RO "Target azi").
    expect(screen.getByText(/Target today/i)).toBeInTheDocument();
  });

  it('renders kcal value after async resolve — EN protein label', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      // RO thousands separator (dot, ICU ro-RO) — parity BMRStrip. Hero redesign
      // 2026-05-28 styles the unit smaller in its own <span>, so the number +
      // unit are separate DOM nodes; assert via the strip textContent (they
      // render together visually as "2.640 kcal").
      expect(screen.getByTestId('tdee-strip').textContent).toMatch(/2\.640\s*kcal/);
    });
    // Wave C2 i18n: EN default → "180 g protein" (was RO "180 g proteine").
    expect(screen.getByText(/180 g protein/)).toBeInTheDocument();
  });

  it('renders source label "Adaptive estimate" cand engine-bn — EN default', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      // Wave C2 i18n: EN default → "Adaptive estimate" (was RO "Estimare adaptiva").
      expect(screen.getByTestId('tdee-source').textContent).toMatch(/Adaptive estimate/);
    });
  });

  it('container data-testid present', () => {
    render(<TDEEStrip />);
    expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    const { container } = render(<TDEEStrip />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('§F-pass2-tdeestrip-02 target-only display cand NU exista intake logat — EN default', async () => {
    // store reset in beforeEach → loggedKcal null → comparison hidden.
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByText(/Target today/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-current-vs-target')).not.toBeInTheDocument();
  });

  it('§F-pass2-tdeestrip-02 current-vs-target cu delta cand intake logat — EN default', async () => {
    // Logged 2800 kcal vs engine target 2640 → +160 surplus.
    useNutritionStore.getState().setDailyKcal(todayIso(), 2800);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-current-vs-target')).toBeInTheDocument();
    });
    const row = screen.getByTestId('tdee-current-vs-target');
    // RO thousands separator (dot, ICU ro-RO) — parity BMRStrip.
    expect(row.textContent).toMatch(/2\.800 kcal/);
    // Wave C2 i18n: EN default → "target 2.640" (was RO "tinta 2.640").
    expect(row.textContent).toMatch(/target 2\.640/);
    expect(row.textContent).toMatch(/\(\+160\)/);
    // Wave C2 i18n: EN default → "Today vs target" (was RO "Azi vs tinta").
    expect(screen.getByText(/Today vs target/i)).toBeInTheDocument();
  });

  it('§F-pass2-tdeestrip-02 negative delta cand sub tinta', async () => {
    useNutritionStore.getState().setDailyKcal(todayIso(), 2500);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-current-vs-target')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tdee-current-vs-target').textContent).toMatch(/\(-140\)/);
  });

  it('§F-pass2-tdeestrip-03 explainer copy present — stable goal-based intake — EN default', () => {
    render(<TDEEStrip />);
    const explainer = screen.getByTestId('tdee-explainer');
    expect(explainer).toBeInTheDocument();
    // STABLE hero redesign (CEO lock 2026-06-01): explainer reads as the
    // recommended daily intake to reach the goal (no "calibrate" jargon).
    expect(explainer.textContent).toMatch(/Recommended daily intake to reach your goal/i);
  });

  // BUG #4 safety — mesaj cand kcal-ul a fost ridicat la surplus (subponderal).
  it('BUG #4: NU arata mesajul de siguranta cand healthyFloorClamped absent', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-healthy-floor-msg')).not.toBeInTheDocument();
  });

  it('BUG #4: arata mesajul de sustinere (crestere) cand healthyFloorClamped true', async () => {
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: 2376,
      proteinTarget: 120,
      source: 'engine-bn',
      confidence: 0.5,
      healthyFloorClamped: true,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-healthy-floor-msg')).toBeInTheDocument();
    });
    const msg = screen.getByTestId('tdee-healthy-floor-msg');
    // BUG #4: mesaj de crestere (NU "mentenanta"/"mai jos"); surplus, nu deficit;
    // nota blanda de medic pastrata.
    expect(msg.textContent).toMatch(/below a healthy weight/);
    expect(msg.textContent).toMatch(/grow gradually/);
    expect(msg.textContent).toMatch(/surplus/);
    expect(msg.textContent).toMatch(/doctor/);
    expect(msg.textContent).not.toMatch(/maintenance/i);
    // RO no-diacritics (D-LEGACY-064).
    expect(/[ăâîșțĂÂÎȘȚ]/.test(msg.textContent ?? '')).toBe(false);
  });

  // L7 safety surfacing — base target rate-capped / floored at extreme profiles.
  it('L7: NU arata nota de siguranta cand safetyLimited absent', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-safety-limit-note')).not.toBeInTheDocument();
  });

  it('L7: arata nota de floor cand safetyLimited floored', async () => {
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: 1000,
      proteinTarget: 90,
      source: 'engine-bn',
      confidence: 0.5,
      safetyLimited: 'floored',
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-safety-limit-note')).toBeInTheDocument();
    });
    const note = screen.getByTestId('tdee-safety-limit-note');
    // CEO LOCK 2026-05-31 — reframed honest floor note: limited to the safe
    // minimum + the goal may not be fully met at this rate.
    expect(note.textContent).toMatch(/Target limited to the safe minimum/);
    expect(note.textContent).toMatch(/may not be fully reached/);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(note.textContent ?? '')).toBe(false);
  });

  it('L7: arata nota de cap cand safetyLimited capped', async () => {
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: 2900,
      proteinTarget: 200,
      source: 'engine-bn',
      confidence: 0.5,
      safetyLimited: 'capped',
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-safety-limit-note')).toBeInTheDocument();
    });
    const note = screen.getByTestId('tdee-safety-limit-note');
    expect(note.textContent).toMatch(/Limited for safety/);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(note.textContent ?? '')).toBe(false);
  });

  // Freeze fix (CEO LOCK 2026-05-31) — the recommended kcal is goal+deadline+
  // weight-driven, so editing the goal weight / deadline / logging a new weight
  // MUST recompute the target live (the useEffect dep array now includes those
  // store inputs). Asserts the async target fetch re-fires on each such change.
  it('FREEZE FIX: recomputeaza tinta cand se schimba tinta-greutate (goal weight)', async () => {
    useProgresStore.setState({
      weightLog: [], bodyData: [], targetObiectiv: { weightKg: null, month: null },
    } as never);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(getNutritionTargetTodayReal).toHaveBeenCalled();
    });
    const callsAfterMount = vi.mocked(getNutritionTargetTodayReal).mock.calls.length;
    // Edit the goal weight → the strip is subscribed to targetObiectiv → re-render
    // → the dep array (targetObiectiv.weightKg) changed → the fetch re-runs.
    useProgresStore.setState({ targetObiectiv: { weightKg: 60, month: '2026-08' } } as never);
    await waitFor(() => {
      expect(vi.mocked(getNutritionTargetTodayReal).mock.calls.length).toBeGreaterThan(callsAfterMount);
    });
  });

  it('FREEZE FIX: recomputeaza tinta cand se logheaza o greutate noua (weightLog)', async () => {
    useProgresStore.setState({
      weightLog: [], bodyData: [], targetObiectiv: { weightKg: 60, month: '2026-08' },
    } as never);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(getNutritionTargetTodayReal).toHaveBeenCalled();
    });
    const callsAfterMount = vi.mocked(getNutritionTargetTodayReal).mock.calls.length;
    useProgresStore.setState({
      weightLog: [{ date: todayIso(), kg: 77, ts: Date.now() }],
    } as never);
    await waitFor(() => {
      expect(vi.mocked(getNutritionTargetTodayReal).mock.calls.length).toBeGreaterThan(callsAfterMount);
    });
  });

  it('L7: nota suprimata cand user-ul a logat manual kcal azi (numarul afisat e intake-ul)', async () => {
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: 1000,
      proteinTarget: 90,
      source: 'engine-bn',
      confidence: 0.5,
      safetyLimited: 'floored',
    });
    useNutritionStore.getState().setDailyKcal(todayIso(), 1800);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-safety-limit-note')).not.toBeInTheDocument();
  });
});

// STABLE hero (CEO lock 2026-06-01) — the aerobic class no longer ADDS to the
// hero. The hero stays the stable engine target; a logged class shows ONLY as an
// info line below it ("kcal burned — closer to your goal"). No add-on, no clamp.
describe('TDEEStrip — aerobic class info line (does NOT move the hero)', () => {
  it('no aerobic info line when no class logged today', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-source')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-aerobic-info')).not.toBeInTheDocument();
  });

  it('hero equals the engine target — UNCHANGED by a logged aerobic class', async () => {
    // 300 kcal class today. Pre-redesign this raised the hero to 2940; now the
    // hero MUST stay the stable engine target 2640.
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'spinning', minutes: 50, kcal: 300, ts: Date.now() }],
      lastDuration: 50,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-aerobic-info')).toBeInTheDocument();
    });
    // Hero = stable engine target 2640 (NOT 2640 + 300).
    expect(screen.getByTestId('tdee-strip').textContent).toMatch(/2\.640\s*kcal/);
    expect(screen.getByTestId('tdee-strip').textContent).not.toMatch(/2\.940/);
  });

  it('the activity info line shows when a class is logged (attributes the burn)', async () => {
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'aerobic', minutes: 50, kcal: 250, ts: Date.now() }],
      lastDuration: 50,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-aerobic-info')).toBeInTheDocument();
    });
    // Info line attributes the 250 kcal burned; hero stays the stable 2640.
    expect(screen.getByTestId('tdee-aerobic-info').textContent).toMatch(/250/);
    expect(screen.getByTestId('tdee-strip').textContent).toMatch(/2\.640\s*kcal/);
  });
});

function setOnboarding(data: Partial<{
  age: number; sex: 'm' | 'f'; goal: string; weight: number; height: number;
}>): void {
  useOnboardingStore.setState({
    data: {
      age: 30, sex: 'm', goal: 'auto', frequency: '3',
      experience: 'intermediar', weight: 80, height: 180,
      ...data,
    } as never,
    completed: true,
    completedAt: Date.now(),
  });
}

describe('TDEEStrip — phase badge reflects RESOLVED phase (override-vs-target)', () => {
  beforeEach(() => {
    localStorage.clear();
    useOnboardingStore.setState({
      data: { age: 30, sex: 'm', goal: 'auto', frequency: '3',
        experience: 'intermediar', weight: 80, height: 180 } as never,
      completed: false, completedAt: null,
    });
    useProgresStore.setState({ weightLog: [], bodyData: [], targetObiectiv: { weightKg: null, month: null } } as never);
    useWorkoutStore.setState({ sessionsHistory: [] } as never);
  });

  it('drops a BULK override that contradicts a LOSE target → badge shows resolved Cut, not Bulk', async () => {
    // Current 80kg, target 70kg → LOSE. A manual BULK override contradicts that
    // direction, so resolveActivePhase drops it → resolves to CUT. The badge must
    // never show "Bulk" next to a deficit-coherent number.
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    setOnboarding({ weight: 80, height: 180 });
    useProgresStore.setState({
      weightLog: [{ date: todayIso(), kg: 80, ts: Date.now() }],
      targetObiectiv: { weightKg: 70, month: null },
    } as never);
    render(<TDEEStrip />);
    const badge = screen.getByTestId('tdee-faza-badge');
    expect(badge.textContent).toMatch(/Cut/);
    expect(badge.textContent).not.toMatch(/Bulk/);
  });

  it('honors a non-contradicting CUT override under a LOSE target → badge shows Cut', async () => {
    localStorage.setItem('phase-override', JSON.stringify('CUT'));
    setOnboarding({ weight: 80, height: 180 });
    useProgresStore.setState({
      weightLog: [{ date: todayIso(), kg: 80, ts: Date.now() }],
      targetObiectiv: { weightKg: 70, month: null },
    } as never);
    render(<TDEEStrip />);
    expect(screen.getByTestId('tdee-faza-badge').textContent).toMatch(/Cut/);
  });
});

// STABLE hero (CEO lock 2026-06-01) — no more add-ons means no more "clamp"
// interplay. Even a big aerobic class on a CUT day leaves the hero as the stable
// engine target; the info line attributes the burn without touching the number,
// and the old "Capped at maintenance" note no longer exists.
describe('TDEEStrip — no add-on clamp (stable hero on a CUT day)', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgresStore.setState({ weightLog: [], bodyData: [], targetObiectiv: { weightKg: null, month: null } } as never);
    useWorkoutStore.setState({ sessionsHistory: [] } as never);
  });

  it('CUT day + big aerobic class → hero stays the engine target, info line attributes the burn, no clamped note', async () => {
    setOnboarding({ weight: 80, height: 180, goal: 'slabire' });
    useProgresStore.setState({
      weightLog: [{ date: todayIso(), kg: 80, ts: Date.now() }],
      targetObiectiv: { weightKg: null, month: null },
    } as never);
    const maintenance = readUserMaintenanceTDEE() as number;
    const cutBase = maintenance - 400; // a real deficit base
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: cutBase,
      proteinTarget: 160,
      source: 'engine-bn',
      confidence: 0.5,
    });
    // A big 700-kcal class — pre-redesign this clamped at maintenance; now it
    // does NOT touch the hero at all.
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'spinning', minutes: 60, kcal: 700, ts: Date.now() }],
      lastDuration: 60,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-aerobic-info')).toBeInTheDocument();
    });
    // Hero = the stable engine target (cutBase), NOT inflated by the +700 burn.
    expect(screen.getByTestId('tdee-strip').textContent).toMatch(new RegExp(`${cutBase.toLocaleString('ro-RO').replace(/,/g, '.')}\\s*kcal`));
    // The retired add-on / clamped notes no longer exist.
    expect(screen.queryByTestId('tdee-addons-clamped-note')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tdee-aerobic-add-note')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tdee-fatigue-ease-note')).not.toBeInTheDocument();
    // The info line attributes the 700 kcal burned.
    expect(screen.getByTestId('tdee-aerobic-info').textContent).toMatch(/700/);
  });
});
