// ══ ISTORIC TESTS — task_21 list + detail + empty state ══════════════════

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Istoric } from '../../../routes/screens/istoric/Istoric';
import { IstoricDetail } from '../../../routes/screens/istoric/IstoricDetail';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

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
  // Force EN locale — the post-2026-05-28 default.
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
}

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('Istoric — empty state', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders heading + empty state cand sessionsHistory empty (EN default post 2026-05-28)', () => {
    renderIstoric();
    // Default locale flipped to EN — heading is "History".
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('History');
    expect(screen.getByTestId('istoric-empty')).toBeInTheDocument();
    expect(screen.getByText(/Your first session is waiting/i)).toBeInTheDocument();
  });

  it('NU renders list cand empty', () => {
    renderIstoric();
    expect(screen.queryByTestId('istoric-list')).not.toBeInTheDocument();
  });

  // axe heading-order (moderate) — calendar month label era h3 direct sub
  // page h1 (skip h2). Trebuie h2 ca sa nu sara nivelul.
  it('no heading-order skip — calendar month label is h2 under page h1', () => {
    renderIstoric();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('History');
    const calLabel = screen.getByTestId('cal-month-label');
    expect(calLabel.tagName).toBe('H2');
    // zero h3 imediat sub h1 fara h2 intermediar
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
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

// Bug live (History tab, Daniel 2026-05-29): inregistrari fara ts numeric
// (cloud malformat / schema veche) faceau formatDate sa afiseze cheia i18n
// literala "weekdays.relativeShort.NaN · NaN months.short.NaN". Guard-ul din
// Istoric.tsx formatDate degradeaza la em-dash; o sesiune normala afiseaza
// data localizata corecta.
describe('Istoric — formatDate guard (ts lipsa / invalid)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('sesiune cu ts undefined → em-dash, NU cheia i18n literala / NaN', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        // ts lipsa cu totul (cast pentru a simula record malformat din sync)
        { title: 'Push', meta: '5 seturi · 45 min · 9 800 kg' } as unknown as {
          title: string;
          meta: string;
          ts: number;
        },
      ],
    });
    renderIstoric();
    const card = screen.getByTestId('istoric-session-0');
    expect(card.textContent).not.toMatch(/relativeShort/);
    expect(card.textContent).not.toMatch(/months\.short/);
    expect(card.textContent).not.toMatch(/NaN/);
    expect(card.textContent).toMatch(/—/);
  });

  it('sesiune cu ts NaN / invalid → em-dash, NU cheia / NaN', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        { title: 'Pull', meta: '6 seturi · 50 min · 10 200 kg', ts: NaN },
      ],
    });
    renderIstoric();
    const card = screen.getByTestId('istoric-session-0');
    expect(card.textContent).not.toMatch(/relativeShort|months\.short|NaN/);
    expect(card.textContent).toMatch(/—/);
  });

  it('sesiune normala (ts valid) → data localizata corecta (EN)', () => {
    // ts 1700000000000 = nov 2023 → EN "<Wkdy> · <D> Nov" (weekday/ziua depind
    // de TZ runner; verificam formatul localizat real, NU NaN / cheia literala).
    useWorkoutStore.setState({
      sessionsHistory: [
        { title: 'Legs', meta: '7 seturi · 55 min · 14 500 kg', ts: 1700000000000 },
      ],
    });
    renderIstoric();
    const card = screen.getByTestId('istoric-session-0');
    expect(card.textContent).toMatch(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat) · \d{1,2} Nov/);
    expect(card.textContent).not.toMatch(/NaN|relativeShort|months\.short|—/);
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
    expect(screen.getByTestId('detail-volume')).toHaveTextContent('12 450');
  });

  it('Back button navigates Istoric list', () => {
    renderIstoric('/app/istoric/0');
    fireEvent.click(screen.getByTestId('istoric-detail-back'));
    expect(screen.getByTestId('istoric-home')).toBeInTheDocument();
  });

  it('renders missing state cand sessionId invalid (EN default copy)', () => {
    renderIstoric('/app/istoric/999');
    expect(screen.getByTestId('istoric-detail-missing')).toBeInTheDocument();
    expect(screen.getByText(/Session not found/i)).toBeInTheDocument();
  });

  it('missing back button navigates Istoric', () => {
    renderIstoric('/app/istoric/999');
    fireEvent.click(screen.getByTestId('istoric-detail-back-missing'));
    expect(screen.getByTestId('istoric-home')).toBeInTheDocument();
  });
});

describe('IstoricDetail — per-exercise breakdown (task_03)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders breakdown table cand session.exercises present', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '5 seturi · 30 min · 910 kg',
          ts: Date.now(),
          sets: 5,
          durationMin: 30,
          volumeKg: 910,
          exercises: [
            {
              exerciseId: 'bench-press',
              exerciseName: 'Bench Press',
              sets: [
                { kg: 22.5, reps: 10, rating: 'usor', timestamp: Date.now() },
                { kg: 22.5, reps: 10, rating: 'potrivit', timestamp: Date.now() },
              ],
              totalVolume: 450,
              peakOneRM: 20.4,
            },
          ],
        },
      ],
    });
    renderIstoric('/app/istoric/0');
    expect(screen.getByTestId('istoric-detail-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('detail-ex-bench-press')).toBeInTheDocument();
    expect(screen.getByTestId('detail-ex-volume').textContent).toMatch(/450 kg/);
    // Decimal 1RM must keep its decimal separator (regression: ro-RO formatKg
    // once turned the decimal comma into a space, rendering "20 4 kg").
    expect(screen.getByTestId('detail-ex-1rm').textContent).toMatch(/20\.4 kg/);
    expect(screen.getByTestId('detail-ex-1rm').textContent).not.toMatch(/20 4/);
    expect(screen.getByTestId('detail-set-bench-press-0').textContent).toMatch(/22\.5/);
    // Rating column under EN default surfaces "Right" (ratingLabels.potrivit -> Right).
    expect(screen.getByTestId('detail-set-bench-press-1').textContent).toMatch(/Right/);
  });

  it('marks PR sets visual (PR label)', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '1 seturi · 5 min · 25 kg',
          ts: Date.now(),
          exercises: [
            {
              exerciseId: 'bench-press',
              exerciseName: 'Bench Press',
              sets: [{ kg: 25, reps: 10, rating: 'greu', timestamp: Date.now(), isPR: true }],
              totalVolume: 250,
              peakOneRM: 33.3,
            },
          ],
        },
      ],
    });
    renderIstoric('/app/istoric/0');
    expect(screen.getByTestId('detail-set-bench-press-0').textContent).toMatch(/PR/);
  });

  it('renders legacy fallback cand exercises field absent', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '5 seturi · 30 min · 910 kg',
          ts: Date.now(),
        },
      ],
    });
    renderIstoric('/app/istoric/0');
    expect(screen.queryByTestId('istoric-detail-breakdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('istoric-detail-legacy')).toBeInTheDocument();
  });

  it('renders multiple exercises', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        {
          title: 'Push',
          meta: '6 seturi · 45 min · 1200 kg',
          ts: Date.now(),
          exercises: [
            {
              exerciseId: 'bench',
              exerciseName: 'Bench Press',
              sets: [{ kg: 22.5, reps: 10, rating: 'potrivit', timestamp: Date.now() }],
              totalVolume: 225,
              peakOneRM: 30,
            },
            {
              exerciseId: 'overhead',
              exerciseName: 'Overhead Press',
              sets: [{ kg: 17.5, reps: 8, rating: 'greu', timestamp: Date.now() }],
              totalVolume: 140,
              peakOneRM: 22.2,
            },
          ],
        },
      ],
    });
    renderIstoric('/app/istoric/0');
    expect(screen.getByTestId('detail-ex-bench')).toBeInTheDocument();
    expect(screen.getByTestId('detail-ex-overhead')).toBeInTheDocument();
  });
});

describe('IstoricDetail — delete a mislogged session', () => {
  beforeEach(() => {
    resetStore();
  });

  it('two-tap delete removes the session + records a tombstone + navigates back', () => {
    const ts = 1717000000000;
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Push', meta: '5 seturi · 45 min · 9 800 kg', ts }],
    });
    renderIstoric('/app/istoric/0');
    // First tap reveals confirm; session still present.
    fireEvent.click(screen.getByTestId('istoric-detail-delete-cta'));
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
    // Confirm deletes + tombstones + routes back to /app/istoric.
    fireEvent.click(screen.getByTestId('istoric-detail-delete-accept'));
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(0);
    expect(useWorkoutStore.getState().deletedSessionTs).toContain(ts);
    // Routed back to the Istoric list (now empty).
    expect(screen.getByTestId('istoric-home')).toBeInTheDocument();
  });

  it('cancel keeps the session', () => {
    const ts = 1717000000001;
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Pull', meta: '4 seturi · 40 min · 8 000 kg', ts }],
    });
    renderIstoric('/app/istoric/0');
    fireEvent.click(screen.getByTestId('istoric-detail-delete-cta'));
    fireEvent.click(screen.getByTestId('istoric-detail-delete-cancel'));
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(1);
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
