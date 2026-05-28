// PROGRES LANDING TESTS — task_16 CTA + last entries display + F-progres-07.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

vi.mock('../../../lib/coachDirectorAggregate', () => ({
  getCoachToday: vi.fn(async () => ({
    readiness: null,
    fatigue: null,
    plannedWorkout: null,
    isRestDay: true,
    patternsBanner: [],
    prWallRecent: [],
    alerts: [],
    source: 'baseline',
  })),
}));

import { Progres } from '../../../routes/screens/progres/Progres';
import { useProgresStore } from '../../../stores/progresStore';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';

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
  it('renders heading + tagline (EN default post 2026-05-28 paradigm flip)', () => {
    renderProgres();
    // Default locale flipped to EN — heading is "Progress" + tagline localized.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Progress');
    expect(screen.getByText(/Body composition/i)).toBeInTheDocument();
  });

  it('renders Log weight CTA + Body data CTA', () => {
    renderProgres();
    expect(screen.getByTestId('cta-log-weight')).toBeInTheDocument();
    expect(screen.getByTestId('cta-body-data')).toBeInTheDocument();
  });

  it('Log weight CTA tap navigates /app/progres/log-weight', () => {
    renderProgres();
    fireEvent.click(screen.getByTestId('cta-log-weight'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres/log-weight');
  });

  it('Body data CTA tap navigates /app/progres/body-data', () => {
    renderProgres();
    fireEvent.click(screen.getByTestId('cta-body-data'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres/body-data');
  });

  it('hides last-weight-card cand weightLog empty', () => {
    renderProgres();
    expect(screen.queryByTestId('last-weight-card')).not.toBeInTheDocument();
  });

  it('shows last-weight-card cand entry present', () => {
    useProgresStore.setState({ weightLog: [{ kg: 78.5, date: '2026-05-17', ts: Date.now() }] });
    renderProgres();
    expect(screen.getByTestId('last-weight-card')).toBeInTheDocument();
    expect(screen.getByTestId('last-weight-card')).toHaveTextContent('78.5 kg');
  });

  it('shows last-body-card cand bodyData entry present', () => {
    useProgresStore.setState({ bodyData: [{ date: '2026-05-17', ts: Date.now(), waistCm: 85, bicepsCm: 35 }] });
    renderProgres();
    expect(screen.getByTestId('last-body-card')).toBeInTheDocument();
    expect(screen.getByTestId('last-body-card')).toHaveTextContent('Talie 85');
    expect(screen.getByTestId('last-body-card')).toHaveTextContent('Biceps 35');
  });
});

describe('Progres — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics in text', () => {
    const { container } = renderProgres();
    expect(/[\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('Progres — F-progres-07 Alerte azi banner mockup parity', () => {
  beforeEach(() => {
    vi.mocked(getCoachToday).mockResolvedValue({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'baseline',
    });
  });

  it('hides Alerte azi label + banner cand alerts empty', async () => {
    renderProgres();
    await Promise.resolve();
    expect(screen.queryByTestId('alerte-azi-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('alerts-banner')).not.toBeInTheDocument();
  });

  it('renders Alerte azi label + 3-row banner when alerts present', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [
        { id: 'adherence_0', text: 'Saptamana asta ai sarit 2 antrenamente', severity: 'warn' },
        { id: 'stagnation_1', text: 'Greutatile stau pe loc de 3 saptamani', severity: 'info' },
        { id: 'weakness_2', text: 'Umerii ramasi in urma', severity: 'info' },
      ],
      restReason: null,
      source: 'engine',
    });
    renderProgres();
    expect(await screen.findByTestId('alerts-banner')).toBeInTheDocument();
    expect(screen.getByTestId('alerte-azi-label')).toHaveTextContent(/Alerte azi/i);
    expect(screen.getByText(/sarit 2 antrenamente/i)).toBeInTheDocument();
    expect(screen.getByText(/stau pe loc de 3 saptamani/i)).toBeInTheDocument();
    expect(screen.getByText(/Umerii ramasi in urma/i)).toBeInTheDocument();
  });

  it('Alerte azi banner placed above log-weight CTA', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [{ id: 'a_0', text: 'alpha', severity: 'warn' }],
      restReason: null,
      source: 'engine',
    });
    renderProgres();
    const banner = await screen.findByTestId('alerts-banner');
    const cta = screen.getByTestId('cta-log-weight');
    expect(banner.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
