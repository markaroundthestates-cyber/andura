// PARITY-MISSING-SCREENS Wave 2e — WeightTimeline (PAR-004) tests.
// Per mockup andura-clasic.html L2204-2293 contract verify.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { WeightTimeline } from '../../../routes/screens/progres/WeightTimeline';
import { useProgresStore } from '../../../stores/progresStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/progres/weight-timeline']}>
      <Routes>
        <Route path="/app/progres/weight-timeline" element={<WeightTimeline />} />
        <Route path="/app/progres" element={<LocationProbe />} />
        <Route path="/app/progres/weight-log-list" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  // Wave E2 i18n wire — pin RO so existing mockup-verbatim RO assertions
  // ("Greutate", "30 zile", "Loguri recente", "ultimele N zile") stay
  // stable. EN parity covered by i18nNoRoLeak contract test.
  try { localStorage.clear(); } catch { /* noop */ }
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  _resetI18nCache();
  setLocale('ro');
});

describe('WeightTimeline — Greutate trend screen', () => {
  it('renders heading "Greutate"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Greutate', level: 1 })).toBeInTheDocument();
  });

  it('renders 4 range tabs (30/60/90/all)', () => {
    renderScreen();
    expect(screen.getByTestId('weight-timeline-range-30')).toBeInTheDocument();
    expect(screen.getByTestId('weight-timeline-range-60')).toBeInTheDocument();
    expect(screen.getByTestId('weight-timeline-range-90')).toBeInTheDocument();
    expect(screen.getByTestId('weight-timeline-range-all')).toBeInTheDocument();
    expect(screen.getByTestId('weight-timeline-range-30')).toHaveAttribute('aria-selected', 'true');
  });

  it('range tab click swaps active selection', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('weight-timeline-range-90'));
    expect(screen.getByTestId('weight-timeline-range-90')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('weight-timeline-range-30')).toHaveAttribute('aria-selected', 'false');
  });

  it('empty state cand no logs in range', () => {
    renderScreen();
    expect(screen.getByTestId('weight-timeline-kpi-empty')).toBeInTheDocument();
    expect(screen.getByTestId('weight-timeline-chart-empty')).toBeInTheDocument();
    // Pass 10 canonical "Nu ai X inca" prefix
    expect(screen.getByTestId('weight-timeline-kpi-empty')).toHaveTextContent(/Nu ai loguri/i);
    expect(screen.getByTestId('weight-timeline-chart-empty')).toHaveTextContent(/Nu ai loguri inca/i);
  });

  it('KPI shows latest weight + delta', () => {
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 84.0, date: '2026-04-15', ts: now - 10 * 86400000 },
        { kg: 82.5, date: '2026-05-01', ts: now - 5 * 86400000 },
        { kg: 81.5, date: '2026-05-15', ts: now - 1 * 86400000 },
      ],
      bodyData: [],
    });
    renderScreen();
    expect(screen.getByTestId('weight-timeline-kpi-value')).toHaveTextContent('81.5');
    expect(screen.getByTestId('weight-timeline-kpi-delta')).toHaveTextContent('-2.5');
  });

  it('chart renders dots for filtered entries', () => {
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 82.0, date: '2026-05-01', ts: now - 10 * 86400000 },
        { kg: 81.0, date: '2026-05-15', ts: now - 1 * 86400000 },
      ],
      bodyData: [],
    });
    renderScreen();
    expect(screen.getByTestId('weight-timeline-chart-dot-0')).toBeInTheDocument();
    expect(screen.getByTestId('weight-timeline-chart-dot-1')).toBeInTheDocument();
  });

  it('range filter applies cu cutoff', () => {
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        // 100 days ago - outside 30/60/90, inside 'all'
        { kg: 90.0, date: '2026-02-10', ts: now - 100 * 86400000 },
        // 10 days ago - inside all ranges
        { kg: 82.0, date: '2026-05-12', ts: now - 10 * 86400000 },
      ],
      bodyData: [],
    });
    renderScreen();
    // Default 30 days: only 1 entry (82.0)
    expect(screen.getByTestId('weight-timeline-kpi-value')).toHaveTextContent('82.0');
    // Switch to "all" range to include 90.0
    fireEvent.click(screen.getByTestId('weight-timeline-range-all'));
    // Latest still 82.0 (most recent ts), but delta now exists vs 90.0
    expect(screen.getByTestId('weight-timeline-kpi-value')).toHaveTextContent('82.0');
    expect(screen.getByTestId('weight-timeline-kpi-delta')).toHaveTextContent('-8.0');
  });

  it('logs CTA navigates la /app/progres/weight-log-list', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('weight-timeline-logs-cta'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres/weight-log-list');
  });

  it('back navigates la /app/progres', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });

  it('no diacritics in UI text', () => {
    const now = Date.now();
    useProgresStore.setState({
      weightLog: [
        { kg: 82.4, date: '2026-05-05', ts: now - 1 * 86400000 },
      ],
      bodyData: [],
    });
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
