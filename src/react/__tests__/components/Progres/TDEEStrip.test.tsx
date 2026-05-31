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

  it('§F-pass2-tdeestrip-03 italic explainer copy present (mockup L1713) — EN default', () => {
    render(<TDEEStrip />);
    const explainer = screen.getByTestId('tdee-explainer');
    expect(explainer).toBeInTheDocument();
    // Wave C2 i18n: EN default → "The engine calculates automatically" + "Log optionally to calibrate."
    expect(explainer.textContent).toMatch(/engine calculates automatically/i);
    expect(explainer.textContent).toMatch(/Log optionally to calibrate/i);
    expect(explainer.className).toMatch(/italic/);
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

// Aerobic-class kcal → nutrition (Daniel spec 2026-05-30). A logged class
// today raises the displayed auto target by that kcal (explicit add-on note),
// so the user can eat a bit more. No add when no class logged.
describe('TDEEStrip — aerobic class kcal add-on', () => {
  it('no aerobic note when no class logged today', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-source')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-aerobic-add-note')).not.toBeInTheDocument();
  });

  it('a class logged today raises the displayed target + shows the add-on note', async () => {
    // 300 kcal class today → target 2640 + 300 = 2940 displayed.
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'spinning', minutes: 50, kcal: 300, ts: Date.now() }],
      lastDuration: 50,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-aerobic-add-note')).toBeInTheDocument();
    });
    // Displayed auto kcal hero = 2640 + 300 = 2940.
    expect(screen.getByTestId('tdee-strip').textContent).toMatch(/2\.940\s*kcal/);
    // Note attributes the +300 explicitly.
    expect(screen.getByTestId('tdee-aerobic-add-note').textContent).toMatch(/300/);
  });

  it('aerobic add-on only ADDS — never lowers the target (floors hold)', async () => {
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'aerobic', minutes: 50, kcal: 250, ts: Date.now() }],
      lastDuration: 50,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-aerobic-add-note')).toBeInTheDocument();
    });
    // 2640 + 250 = 2890 > base 2640 (strictly higher — add-on never reduces).
    expect(screen.getByTestId('tdee-strip').textContent).toMatch(/2\.890\s*kcal/);
  });
});

// Annotation parity (audit fix 2026-05-30) — the badge label + add-on notes must
// describe the RECONCILED + GUARDED final number, never the raw pre-reconcile /
// pre-guard values. Real-store wiring (NU mock engineWrappers) so the SAME
// reconciliation + guard the kcal path uses drives the annotations.
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

describe('TDEEStrip — add-on notes never claim clamped-away kcal', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgresStore.setState({ weightLog: [], bodyData: [], targetObiectiv: { weightKg: null, month: null } } as never);
    useWorkoutStore.setState({ sessionsHistory: [] } as never);
  });

  it('CUT day + big aerobic class clamped at maintenance → honest single note, NOT the +kcal add-on note', async () => {
    // Healthy 80kg/180cm male → real maintenance. CUT base below maintenance, then
    // a big class burn pushes the summed display above maintenance → the guard
    // clamps it back to maintenance. The per-add-on "+kcal" note would over-promise
    // kcal that was clamped away, so the honest clamped note shows instead.
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
    // A big 700-kcal class → cutBase + 700 > maintenance → ceiling clamps.
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'spinning', minutes: 60, kcal: 700, ts: Date.now() }],
      lastDuration: 60,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-addons-clamped-note')).toBeInTheDocument();
    });
    // The over-promising per-add-on note must NOT render when clamped.
    expect(screen.queryByTestId('tdee-aerobic-add-note')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tdee-fatigue-ease-note')).not.toBeInTheDocument();
    // Displayed number is clamped to maintenance — the +700 is NOT in it.
    expect(screen.getByTestId('tdee-strip').textContent).not.toMatch(/700/);
    // No diacritics (D-LEGACY-064).
    const note = screen.getByTestId('tdee-addons-clamped-note');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(note.textContent ?? '')).toBe(false);
  });

  it('CUT day + small class staying below maintenance → real add-on note (not clamped)', async () => {
    setOnboarding({ weight: 80, height: 180, goal: 'slabire' });
    useProgresStore.setState({
      weightLog: [{ date: todayIso(), kg: 80, ts: Date.now() }],
      targetObiectiv: { weightKg: null, month: null },
    } as never);
    const maintenance = readUserMaintenanceTDEE() as number;
    const cutBase = maintenance - 400;
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: cutBase,
      proteinTarget: 160,
      source: 'engine-bn',
      confidence: 0.5,
    });
    // A small 150-kcal class → cutBase + 150 stays below maintenance → no clamp.
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'aerobic', minutes: 20, kcal: 150, ts: Date.now() }],
      lastDuration: 20,
    });
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-aerobic-add-note')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-addons-clamped-note')).not.toBeInTheDocument();
  });
});
