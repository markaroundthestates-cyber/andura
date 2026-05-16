// ══ ANTRENOR HOME TESTS — F2/F4/F6/F8/F10/F11 Parity Verify ══════════════
// Per task_04 spec §4 A.
// MemoryRouter jsdom paradigm per D020 (NU createBrowserRouter).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock engineWrappers BEFORE importing Antrenor (vi.mock hoisted)
vi.mock('../../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(),
  getFatigue: vi.fn(),
  getPRDelta: vi.fn(() => null),
  getTodayWorkout: vi.fn(() => null),
}));

import { Antrenor } from '../../../routes/screens/antrenor/Antrenor';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { getReadiness, getFatigue } from '../../../lib/engineWrappers';

function resetStores(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 0,
  });
  useCoachStore.setState({
    schedContext: 'workout',
    persona: 'gigel',
    reactivateDismissed: false,
  });
  localStorage.clear();
}

function renderAntrenor() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor']}>
      <Routes>
        <Route path="/app/antrenor" element={<Antrenor />} />
        <Route path="/app/antrenor/energy-check" element={<div>EnergyCheckStub</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Antrenor home — base render', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders Antrenor heading', () => {
    renderAntrenor();
    expect(screen.getByRole('heading', { name: 'Antrenor', level: 1 })).toBeInTheDocument();
  });

  it('renders Incepe antrenament CTA by default (no paused session)', () => {
    renderAntrenor();
    expect(screen.getByRole('button', { name: /Incepe antrenament/i })).toBeInTheDocument();
  });

  it('renders CoachTodayCard cand schedContext=workout', () => {
    renderAntrenor();
    expect(screen.getByText(/Pull \(spate & biceps\)/i)).toBeInTheDocument();
  });

  it('renders CoachRestCard cand schedContext=rest', () => {
    useCoachStore.getState().setSchedContext('rest');
    renderAntrenor();
    expect(screen.getByText(/Zi de recuperare activa/i)).toBeInTheDocument();
  });

  it('renders StatsGrid cu streak count', () => {
    useWorkoutStore.setState({ streak: 12 });
    renderAntrenor();
    expect(screen.getByTestId('stats-streak')).toHaveTextContent('12');
  });

  it('StatsGrid placeholder cand fatigue + readiness null', () => {
    renderAntrenor();
    expect(screen.getByTestId('stats-fatigue')).toHaveTextContent('-');
    expect(screen.getByTestId('stats-readiness')).toHaveTextContent('-');
  });
});

describe('Antrenor home — resume session card', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders ResumeSessionCard cand pausedSnapshot exists', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 18 * 60000,
      },
    });
    renderAntrenor();
    expect(screen.getByRole('region', { name: /Reia sesiunea/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Reia$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Renunta/i })).toBeInTheDocument();
  });

  it('hides Incepe antrenament CTA cand pausedSnapshot exists', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    expect(screen.queryByRole('button', { name: /Incepe antrenament/i })).not.toBeInTheDocument();
  });

  it('clicks Reia → restores pausedSnapshot via store', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 2,
        setIdx: 1,
        phase: 'logging',
        history: { 0: [{ kg: 20, reps: 10, rating: 'usor' }] },
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /^Reia$/i }));
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(useWorkoutStore.getState().exIdx).toBe(2);
  });

  it('clicks Renunta → discards session', () => {
    useWorkoutStore.setState({
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 2,
        setIdx: 1,
        phase: 'logging',
        history: { 0: [{ kg: 20, reps: 10, rating: 'usor' }] },
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Renunta/i }));
    expect(useWorkoutStore.getState().pausedSnapshot).toBeNull();
    expect(useWorkoutStore.getState().history).toEqual({});
  });
});

describe('Antrenor home — reactivate card win-back', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders ReactivateCard cand lastSession > 14 zile + NOT dismissed', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
    });
    renderAntrenor();
    expect(screen.getByRole('region', { name: /Bun venit inapoi/i })).toBeInTheDocument();
    expect(screen.getByText(/17 zile/i)).toBeInTheDocument();
  });

  it('hides ReactivateCard cand dismissed', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
    });
    useCoachStore.getState().dismissReactivate();
    renderAntrenor();
    expect(screen.queryByRole('region', { name: /Bun venit inapoi/i })).not.toBeInTheDocument();
  });

  it('hides ReactivateCard cand lastSession < 14 zile', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 5 * 86400000 },
    });
    renderAntrenor();
    expect(screen.queryByRole('region', { name: /Bun venit inapoi/i })).not.toBeInTheDocument();
  });

  it('clicks Mai tarziu → dismisses + hides card', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
    });
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Mai tarziu/i }));
    expect(useCoachStore.getState().reactivateDismissed).toBe(true);
  });

  it('hides ReactivateCard cand pausedSnapshot present (precedence)', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 1',
        exIdx: 0,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now(),
      },
    });
    renderAntrenor();
    expect(screen.queryByRole('region', { name: /Bun venit inapoi/i })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Reia sesiunea/i })).toBeInTheDocument();
  });
});

describe('Antrenor home — F4 readiness verdict', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('renders verdict label + score cand readiness present', () => {
    vi.mocked(getReadiness).mockReturnValue({
      score: 85,
      label: 'Zi de PR',
      color: 'var(--green)',
      volumeMultiplier: 1.1,
      canPR: true,
    });
    renderAntrenor();
    const verdict = screen.getByRole('status', { name: /Verdict readiness/i });
    expect(verdict).toBeInTheDocument();
    expect(verdict).toHaveTextContent('Zi de PR');
    expect(verdict).toHaveTextContent('85/100');
  });

  it('hides verdict cand readiness null', () => {
    vi.mocked(getReadiness).mockReturnValue(null);
    renderAntrenor();
    expect(screen.queryByRole('status', { name: /Verdict readiness/i })).not.toBeInTheDocument();
  });

  it('shows poti incerca PR hint cand canPR=true', () => {
    vi.mocked(getReadiness).mockReturnValue({
      score: 90,
      label: 'Zi de PR',
      color: 'var(--green)',
      volumeMultiplier: 1.1,
      canPR: true,
    });
    renderAntrenor();
    expect(screen.getByText(/poti incerca PR/i)).toBeInTheDocument();
  });
});

describe('Antrenor home — F11 PR banner', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('hides PR banner cand prHit=false', () => {
    renderAntrenor();
    expect(screen.queryByRole('status', { name: /PR detectat/i })).not.toBeInTheDocument();
  });

  it('renders PR banner cand prHit=true', () => {
    useWorkoutStore.setState({ prHit: true });
    renderAntrenor();
    expect(screen.getByRole('status', { name: /PR detectat/i })).toBeInTheDocument();
    expect(screen.getByText(/PR sesiunea trecuta/i)).toBeInTheDocument();
  });
});

describe('Antrenor home — persona variant', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('persona-gigel CSS class applied default', () => {
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toHaveClass('persona-gigel');
  });

  it('persona-maria CSS class applied cand persona=maria', () => {
    useCoachStore.getState().setPersona('maria');
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toHaveClass('persona-maria');
  });

  it('persona-marius CSS class applied cand persona=marius', () => {
    useCoachStore.getState().setPersona('marius');
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toHaveClass('persona-marius');
  });
});

describe('Antrenor home — navigation', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('clicks Incepe antrenament → navigates la /app/antrenor/energy-check', () => {
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Incepe antrenament/i }));
    expect(screen.getByText('EnergyCheckStub')).toBeInTheDocument();
  });

  it('clicks CoachTodayCard Incepe sesiunea → navigates', () => {
    renderAntrenor();
    fireEvent.click(screen.getByRole('button', { name: /Incepe sesiunea/i }));
    expect(screen.getByText('EnergyCheckStub')).toBeInTheDocument();
  });
});

describe('Antrenor home — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    resetStores();
    vi.mocked(getReadiness).mockReturnValue(null);
    vi.mocked(getFatigue).mockReturnValue(null);
  });

  it('no diacritics in UI rendered text', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '5 ex', ts: Date.now() - 17 * 86400000 },
      pausedSnapshot: {
        title: 'Push',
        meta: 'ex 2',
        exIdx: 1,
        setIdx: 0,
        phase: 'logging',
        history: {},
        sessionStart: Date.now() - 18 * 60000,
      },
      prHit: true,
    });
    const { container } = renderAntrenor();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
