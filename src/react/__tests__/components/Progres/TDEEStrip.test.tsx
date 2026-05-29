// Phase 6 task_22 — TDEEStrip Progres dashboard tests.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';
import { useNutritionStore } from '../../../stores/nutritionStore';
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
});
