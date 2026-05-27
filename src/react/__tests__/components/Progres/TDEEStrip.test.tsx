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

describe('TDEEStrip', () => {
  it('renders heading "Target azi" + kcal placeholder before resolve', () => {
    render(<TDEEStrip />);
    expect(screen.getByText(/Target azi/i)).toBeInTheDocument();
  });

  it('renders kcal value after async resolve', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      // RO thousands separator (dot, ICU ro-RO) — parity BMRStrip.
      expect(screen.getByText(/2\.640 kcal/)).toBeInTheDocument();
    });
    expect(screen.getByText(/180 g proteine/)).toBeInTheDocument();
  });

  it('renders source label "Estimare adaptiva" cand engine-bn', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-source').textContent).toMatch(/Estimare adaptiva/);
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

  it('§F-pass2-tdeestrip-02 target-only display cand NU exista intake logat', async () => {
    // store reset in beforeEach → loggedKcal null → comparison hidden.
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByText(/Target azi/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-current-vs-target')).not.toBeInTheDocument();
  });

  it('§F-pass2-tdeestrip-02 current-vs-tinta cu delta cand intake logat (engine target)', async () => {
    // Logged 2800 kcal vs engine target 2640 → +160 surplus.
    useNutritionStore.getState().setDailyKcal(todayIso(), 2800);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-current-vs-target')).toBeInTheDocument();
    });
    const row = screen.getByTestId('tdee-current-vs-target');
    // RO thousands separator (dot, ICU ro-RO) — parity BMRStrip.
    expect(row.textContent).toMatch(/2\.800 kcal/);
    expect(row.textContent).toMatch(/tinta 2\.640/);
    expect(row.textContent).toMatch(/\(\+160\)/);
    expect(screen.getByText(/Azi vs tinta/i)).toBeInTheDocument();
  });

  it('§F-pass2-tdeestrip-02 negative delta cand sub tinta', async () => {
    useNutritionStore.getState().setDailyKcal(todayIso(), 2500);
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-current-vs-target')).toBeInTheDocument();
    });
    expect(screen.getByTestId('tdee-current-vs-target').textContent).toMatch(/\(-140\)/);
  });

  it('§F-pass2-tdeestrip-03 italic explainer copy present (mockup L1713)', () => {
    render(<TDEEStrip />);
    const explainer = screen.getByTestId('tdee-explainer');
    expect(explainer).toBeInTheDocument();
    expect(explainer.textContent).toMatch(/Engine calculeaza auto/);
    expect(explainer.textContent).toMatch(/Loghezi optional pentru calibrare reala/);
    expect(explainer.className).toMatch(/italic/);
  });

  // BUG #13 safety — mesaj cand kcal-ul a fost ridicat la mentenanta (subponderal).
  it('BUG #13: NU arata mesajul de siguranta cand healthyFloorClamped absent', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('tdee-healthy-floor-msg')).not.toBeInTheDocument();
  });

  it('BUG #13: arata mesajul ferm-prietenos cand healthyFloorClamped true', async () => {
    vi.mocked(getNutritionTargetTodayReal).mockResolvedValueOnce({
      kcalTarget: 2200,
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
    expect(msg.textContent).toMatch(/sub greutatea sanatoasa minima/);
    expect(msg.textContent).toMatch(/mentenanta/);
    expect(msg.textContent).toMatch(/medic/);
    // RO no-diacritics (D-LEGACY-064).
    expect(/[ăâîșțĂÂÎȘȚ]/.test(msg.textContent ?? '')).toBe(false);
  });
});
