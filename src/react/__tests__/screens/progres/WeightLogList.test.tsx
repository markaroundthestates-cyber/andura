import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { WeightLogList } from '../../../routes/screens/progres/WeightLogList';
import { useProgresStore } from '../../../stores/progresStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/progres/weight-log-list']}>
      <Routes>
        <Route path="/app/progres/weight-log-list" element={<WeightLogList />} />
        <Route path="/app/progres" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useProgresStore.setState({ weightLog: [], bodyData: [] });
});

describe('WeightLogList — Loguri greutate screen', () => {
  it('renders heading "Loguri greutate"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Loguri greutate/i, level: 1 })).toBeInTheDocument();
  });

  it('empty state when no weight entries', () => {
    renderScreen();
    expect(screen.getByTestId('weight-log-empty')).toBeInTheDocument();
    expect(screen.getByText(/Prima cantarire deschide trend-ul/i)).toBeInTheDocument();
  });

  it('renders weight entries reverse-chrono (newest first)', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 82.4, date: '2026-05-05', ts: 1620100000000 },
        { kg: 81.0, date: '2026-05-12', ts: 1620700000000 },
        { kg: 80.5, date: '2026-05-19', ts: 1621300000000 },
      ],
      bodyData: [],
    });
    renderScreen();
    const rows = screen.getAllByTestId(/^weight-log-row-/);
    expect(rows).toHaveLength(3);
    // Newest first
    expect(rows[0]).toHaveTextContent('80.5 kg');
    expect(rows[1]).toHaveTextContent('81.0 kg');
    expect(rows[2]).toHaveTextContent('82.4 kg');
  });

  it('formats date as RO short (DD lun)', () => {
    useProgresStore.setState({
      weightLog: [{ kg: 82.4, date: '2026-05-05', ts: 1620100000000 }],
      bodyData: [],
    });
    renderScreen();
    expect(screen.getByText(/5 mai/i)).toBeInTheDocument();
  });

  it('back navigates la /app/progres', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });

  it('no diacritics in UI text', () => {
    useProgresStore.setState({
      weightLog: [{ kg: 80, date: '2026-01-15', ts: Date.now() }],
      bodyData: [],
    });
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
