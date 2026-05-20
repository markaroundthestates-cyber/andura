// ══ PROGRES LANDING TESTS — task_16 CTA + last entries display ═══════════

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Progres } from '../../../routes/screens/progres/Progres';
import { useProgresStore } from '../../../stores/progresStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderProgres() {
  return render(
    <MemoryRouter initialEntries={['/app/progres']}>
      <Routes>
        <Route path="/app/progres" element={<Progres />} />
        <Route path="/app/progres/log-weight" element={<LocationProbe />} />
        <Route path="/app/progres/body-data" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  localStorage.clear();
});

describe('Progres landing', () => {
  it('renders heading + tagline', () => {
    renderProgres();
    expect(
      screen.getByRole('heading', { name: /^Progres$/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Logheaza periodic/i)).toBeInTheDocument();
  });

  it('renders Log weight CTA + Body data CTA', () => {
    renderProgres();
    expect(screen.getByTestId('cta-log-weight')).toBeInTheDocument();
    expect(screen.getByTestId('cta-body-data')).toBeInTheDocument();
  });

  it('Log weight CTA tap navigates /app/progres/log-weight', () => {
    renderProgres();
    fireEvent.click(screen.getByTestId('cta-log-weight'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/progres/log-weight'
    );
  });

  it('Body data CTA tap navigates /app/progres/body-data', () => {
    renderProgres();
    fireEvent.click(screen.getByTestId('cta-body-data'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/progres/body-data'
    );
  });

  it('hides last-weight-card cand weightLog empty', () => {
    renderProgres();
    expect(screen.queryByTestId('last-weight-card')).not.toBeInTheDocument();
  });

  it('shows last-weight-card cand entry present', () => {
    useProgresStore.setState({
      weightLog: [{ kg: 78.5, date: '2026-05-17', ts: Date.now() }],
    });
    renderProgres();
    expect(screen.getByTestId('last-weight-card')).toBeInTheDocument();
    expect(screen.getByTestId('last-weight-card')).toHaveTextContent('78.5 kg');
  });

  it('shows last-body-card cand bodyData entry present', () => {
    useProgresStore.setState({
      bodyData: [{ date: '2026-05-17', ts: Date.now(), waistCm: 85, bicepsCm: 35 }],
    });
    renderProgres();
    expect(screen.getByTestId('last-body-card')).toBeInTheDocument();
    expect(screen.getByTestId('last-body-card')).toHaveTextContent('Talie 85');
    expect(screen.getByTestId('last-body-card')).toHaveTextContent('Biceps 35');
  });
});

describe('Progres — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics în text', () => {
    const { container } = renderProgres();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
