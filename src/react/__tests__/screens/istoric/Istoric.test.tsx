// ══ ISTORIC TESTS — task_21 list + detail + empty state ══════════════════

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Istoric } from '../../../routes/screens/istoric/Istoric';
import { IstoricDetail } from '../../../routes/screens/istoric/IstoricDetail';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderIstoric(path: string = '/app/istoric') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/istoric" element={<Istoric />} />
        <Route path="/app/istoric/:sessionId" element={<IstoricDetail />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function resetStore(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    prData: null,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 0,
  });
  localStorage.clear();
}

describe('Istoric — empty state', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders heading + empty state cand sessionsHistory empty', () => {
    renderIstoric();
    expect(
      screen.getByRole('heading', { name: /^Istoric$/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByTestId('istoric-empty')).toBeInTheDocument();
    expect(screen.getByText(/Nu ai antrenamente inca/i)).toBeInTheDocument();
  });

  it('NU renders list cand empty', () => {
    renderIstoric();
    expect(screen.queryByTestId('istoric-list')).not.toBeInTheDocument();
  });
});

describe('Istoric — populated list', () => {
  beforeEach(() => {
    resetStore();
    useWorkoutStore.setState({
      sessionsHistory: [
        { title: 'Push', meta: '5 seturi · 45 min · 9 800 kg', ts: 1700000000000 },
        { title: 'Pull', meta: '6 seturi · 50 min · 10 200 kg', ts: 1700200000000 }, // newer
        { title: 'Legs', meta: '7 seturi · 55 min · 14 500 kg', ts: 1700100000000 },
      ],
    });
  });

  it('renders 3 session cards', () => {
    renderIstoric();
    expect(screen.getByTestId('istoric-list')).toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-0')).toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-1')).toBeInTheDocument();
    expect(screen.getByTestId('istoric-session-2')).toBeInTheDocument();
  });

  it('sorts reverse-chrono (newest first)', () => {
    renderIstoric();
    // Pull (ts=1700200000000) e cel mai recent → poziție 0
    expect(screen.getByTestId('istoric-session-0').textContent).toMatch(/Pull/);
    expect(screen.getByTestId('istoric-session-1').textContent).toMatch(/Legs/);
    expect(screen.getByTestId('istoric-session-2').textContent).toMatch(/Push/);
  });

  it('tap session navigates /app/istoric/:idx', () => {
    renderIstoric();
    fireEvent.click(screen.getByTestId('istoric-session-0'));
    // Pull's original index în sessionsHistory = 1
    expect(screen.getByTestId('istoric-detail')).toBeInTheDocument();
  });
});

describe('IstoricDetail — render', () => {
  beforeEach(() => {
    resetStore();
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push (piept si umeri)',
          meta: '5 seturi · 52 min · 12 450 kg',
          ts: 1700000000000,
          sets: 5,
          durationMin: 52,
          volumeKg: 12450,
        },
      ],
    });
  });

  it('renders session title + meta', () => {
    renderIstoric('/app/istoric/0');
    expect(
      screen.getByRole('heading', { name: /Push \(piept si umeri\)/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByTestId('istoric-detail-meta')).toHaveTextContent('5 seturi');
  });

  it('renders stats grid cand numeric fields prezente', () => {
    renderIstoric('/app/istoric/0');
    expect(screen.getByTestId('detail-sets')).toHaveTextContent('5');
    expect(screen.getByTestId('detail-duration')).toHaveTextContent('52');
    expect(screen.getByTestId('detail-volume')).toHaveTextContent('12450');
  });

  it('Back button navigates Istoric list', () => {
    renderIstoric('/app/istoric/0');
    fireEvent.click(screen.getByTestId('istoric-detail-back'));
    expect(screen.getByTestId('istoric-home')).toBeInTheDocument();
  });

  it('renders missing state cand sessionId invalid', () => {
    renderIstoric('/app/istoric/999');
    expect(screen.getByTestId('istoric-detail-missing')).toBeInTheDocument();
    expect(screen.getByText(/Sesiunea nu a fost gasita/i)).toBeInTheDocument();
  });

  it('missing back button navigates Istoric', () => {
    renderIstoric('/app/istoric/999');
    fireEvent.click(screen.getByTestId('istoric-detail-back-missing'));
    expect(screen.getByTestId('istoric-home')).toBeInTheDocument();
  });
});

describe('Istoric — D-LEGACY-064 no-diacritics', () => {
  beforeEach(() => {
    resetStore();
  });

  it('no diacritics empty state', () => {
    const { container } = renderIstoric();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('no diacritics populated state', () => {
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Push', meta: '5 seturi · 45 min · 9 800 kg', ts: Date.now() }],
    });
    const { container } = renderIstoric();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
