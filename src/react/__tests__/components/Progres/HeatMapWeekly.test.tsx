// §F-pass2-heatmap-01 — Weight snapshot 7-day mockup parity tests.
// Rebuilt 2026-05-22: paradigm align mockup L1730-1749 (weight bars, NU volume heatmap).
// File/export name HeatMapWeekly preserved pentru import-stability.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeatMapWeekly } from '../../../components/Progres/HeatMapWeekly';
import { useProgresStore } from '../../../stores/progresStore';

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/app/progres']}>
      <HeatMapWeekly />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  localStorage.clear();
});

describe('HeatMapWeekly — weight snapshot 7-day mockup parity', () => {
  it('renders heading "Greutate (7 zile)"', () => {
    renderComponent();
    expect(screen.getByText(/Greutate \(7 zile\)/i)).toBeInTheDocument();
  });

  it('renders empty state cand weightLog empty', () => {
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-empty')).toBeInTheDocument();
    // Pass 10 canonical "Nu ai X inca" + anticipatory follow-up
    expect(screen.getByText(/Nu ai loguri inca/i)).toBeInTheDocument();
  });

  it('hides bars chart cand weightLog empty', () => {
    renderComponent();
    expect(screen.queryByTestId('weight-snapshot-chart')).not.toBeInTheDocument();
  });

  it('renders bars chart cand weightLog has entries', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 80, date: '2026-05-16', ts: Date.now() - 6 * 86400000 },
        { kg: 79.5, date: '2026-05-22', ts: Date.now() },
      ],
    });
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-chart')).toBeInTheDocument();
    expect(screen.getByTestId('weight-bar-0')).toBeInTheDocument();
    expect(screen.getByTestId('weight-bar-1')).toBeInTheDocument();
  });

  it('renders up to 7 bars from last 7 weight entries', () => {
    const now = Date.now();
    useProgresStore.setState({
      weightLog: Array.from({ length: 10 }, (_, i) => ({
        kg: 80 - i * 0.2,
        date: `2026-05-${10 + i}`,
        ts: now - (9 - i) * 86400000,
      })),
    });
    renderComponent();
    // Only last 7 rendered
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`weight-bar-${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId('weight-bar-7')).not.toBeInTheDocument();
  });

  it('shows latest weight value', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 81.2, date: '2026-05-20', ts: Date.now() - 86400000 },
        { kg: 80.8, date: '2026-05-22', ts: Date.now() },
      ],
    });
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-latest')).toHaveTextContent(/80\.8/);
  });

  it('shows down-delta cand weight decreasing', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 82, date: '2026-05-16', ts: Date.now() - 6 * 86400000 },
        { kg: 81.6, date: '2026-05-22', ts: Date.now() },
      ],
    });
    renderComponent();
    const delta = screen.getByTestId('weight-snapshot-delta');
    expect(delta).toHaveAttribute('data-delta-sign', 'down');
    expect(delta).toHaveTextContent(/0\.4 kg/);
  });

  it('shows up-delta cand weight increasing', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 80, date: '2026-05-16', ts: Date.now() - 6 * 86400000 },
        { kg: 80.5, date: '2026-05-22', ts: Date.now() },
      ],
    });
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-delta')).toHaveAttribute('data-delta-sign', 'up');
  });

  it('hides delta cand only 1 entry (need 2 puncte)', () => {
    useProgresStore.setState({
      weightLog: [{ kg: 80, date: '2026-05-22', ts: Date.now() }],
    });
    renderComponent();
    expect(screen.queryByTestId('weight-snapshot-delta')).not.toBeInTheDocument();
  });

  it('renders snapshot hint as non-interactive p (DRIFT-3 mockup parity)', () => {
    renderComponent();
    const hint = screen.getByTestId('weight-snapshot-hint');
    expect(hint).toBeInTheDocument();
    expect(hint.tagName).toBe('P');
  });

  it('does NOT render drill button (mockup L1730 NO drill, doar vizibil)', () => {
    renderComponent();
    expect(screen.queryByTestId('weight-snapshot-drill')).not.toBeInTheDocument();
  });

  it('hint copy references Istoric > Greutate si BF', () => {
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-hint')).toHaveTextContent(/Istoric/i);
    expect(screen.getByTestId('weight-snapshot-hint')).toHaveTextContent(/Greutate/i);
  });

  it('container has aria-label', () => {
    renderComponent();
    expect(screen.getByLabelText(/Greutate ultimele 7 zile/i)).toBeInTheDocument();
  });

  it('no diacritics in UI', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 80, date: '2026-05-16', ts: Date.now() - 6 * 86400000 },
        { kg: 79.5, date: '2026-05-22', ts: Date.now() },
      ],
    });
    const { container } = renderComponent();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
