// Phase 6 task_22 — TDEEStrip Progres dashboard tests.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TDEEStrip } from '../../../components/Progres/TDEEStrip';

vi.mock('../../../lib/bayesianNutritionAggregate', () => ({
  getNutritionTargetTodayReal: vi.fn(async () => ({
    kcalTarget: 2640,
    proteinTarget: 180,
    source: 'engine-bn' as const,
    confidence: 0.5,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TDEEStrip', () => {
  it('renders heading "Target azi" + kcal placeholder before resolve', () => {
    render(<TDEEStrip />);
    expect(screen.getByText(/Target azi/i)).toBeInTheDocument();
  });

  it('renders kcal value after async resolve', async () => {
    render(<TDEEStrip />);
    await waitFor(() => {
      expect(screen.getByText(/2640 kcal/)).toBeInTheDocument();
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

  it('§F-pass2-tdeestrip-03 italic explainer copy present (mockup L1713)', () => {
    render(<TDEEStrip />);
    const explainer = screen.getByTestId('tdee-explainer');
    expect(explainer).toBeInTheDocument();
    expect(explainer.textContent).toMatch(/Engine calculeaza auto/);
    expect(explainer.textContent).toMatch(/Loghezi optional pentru calibrare reala/);
    expect(explainer.className).toMatch(/italic/);
  });
});
