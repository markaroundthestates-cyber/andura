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

  it('suppresses celebratory delta cand schimbarea e fizic imposibila (fat-finger)', () => {
    // Smoke artifact: 110kg apoi 53kg la o zi distanta = ↓57 kg / 2z verde.
    // Rata 57 kg/zi >> prag 2 kg/zi → NU mai aratam trend-ul colorat.
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 110, date: '2026-05-21', ts: now - 86400000 },
        { kg: 53, date: '2026-05-22', ts: now },
      ],
    });
    renderComponent();
    expect(screen.queryByTestId('weight-snapshot-delta')).not.toBeInTheDocument();
    expect(screen.getByTestId('weight-snapshot-delta-implausible')).toHaveTextContent(/Verifica valoarea/i);
  });

  it('arata delta normala (sub prag) ca trend colorat, NU nota neutra', () => {
    // 1.5 kg pe 1 zi = sub pragul de 2 kg/zi → trend valid.
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 81.5, date: '2026-05-21', ts: now - 86400000 },
        { kg: 80, date: '2026-05-22', ts: now },
      ],
    });
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-delta')).toHaveAttribute('data-delta-sign', 'down');
    expect(screen.queryByTestId('weight-snapshot-delta-implausible')).not.toBeInTheDocument();
  });

  it('arata delta mare ca trend valid daca span-ul calendaristic o face plauzibila', () => {
    // 14 kg pe 60 zile = 0.23 kg/zi, plauzibil chiar daca delta absolut e mare.
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 94, date: '2026-03-24', ts: now - 60 * 86400000 },
        { kg: 80, date: '2026-05-23', ts: now },
      ],
    });
    renderComponent();
    expect(screen.getByTestId('weight-snapshot-delta')).toHaveAttribute('data-delta-sign', 'down');
    expect(screen.getByTestId('weight-snapshot-delta')).toHaveTextContent(/14 kg/);
    // Denominatorul = span calendaristic real (60z), NU numarul de cantariri (2).
    expect(screen.getByTestId('weight-snapshot-delta')).toHaveTextContent(/60z/);
    expect(screen.getByTestId('weight-snapshot-delta')).not.toHaveTextContent(/\b2z\b/);
    expect(screen.queryByTestId('weight-snapshot-delta-implausible')).not.toBeInTheDocument();
  });

  it('eticheta "/Nz" foloseste zile calendaristice, NU numarul de cantariri (2 intrari la 30 zile = 30z)', () => {
    // Bug: {last7.length} (=2 intrari) afisat cu sufix "z" facea o pierdere de
    // 4 kg pe 30 zile sa para "4 kg / 2z" (looks like 4kg in 2 zile). Trebuie 30z.
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 84, date: '2026-04-22', ts: now - 30 * 86400000 },
        { kg: 80, date: '2026-05-22', ts: now },
      ],
    });
    renderComponent();
    const delta = screen.getByTestId('weight-snapshot-delta');
    expect(delta).toHaveTextContent(/4 kg/);
    expect(delta).toHaveTextContent(/30z/);
    expect(delta).not.toHaveTextContent(/\b2z\b/);
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
