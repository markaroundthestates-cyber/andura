// ══ POST-SUMMARY TESTS — task_09 §B stats + PR banner + streak + finish ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PostSummary } from '../../../routes/screens/antrenor/PostSummary';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderSummary() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/post-summary']}>
      <Routes>
        <Route path="/app/antrenor/post-summary" element={<PostSummary />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function seedNormalSession(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    history: {},
    sessionStart: null,
    lastRating: 'normala',
    pausedSnapshot: null,
    lastSession: {
      title: 'Push (piept si umeri)',
      meta: '5 seturi · 52 min · 12 450 kg',
      ts: Date.now(),
    },
    streak: 12,
  });
  localStorage.clear();
}

describe('PostSummary — render base', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('renders title from lastSession', () => {
    renderSummary();
    expect(screen.getByTestId('summary-title')).toHaveTextContent(
      'Push (piept si umeri)'
    );
  });

  it('renders coach felicitare line din endSession.potrivit (normala alias)', () => {
    renderSummary();
    const coachLine = screen.getByTestId('summary-coach-line');
    expect(coachLine).toBeInTheDocument();
    expect(coachLine.textContent?.length).toBeGreaterThan(2);
  });

  it('renders stats grid cu 4 cells', () => {
    renderSummary();
    expect(screen.getByTestId('summary-stats-grid')).toBeInTheDocument();
    expect(screen.getByTestId('summary-sets')).toBeInTheDocument();
    expect(screen.getByTestId('summary-duration')).toBeInTheDocument();
    expect(screen.getByTestId('summary-volume')).toBeInTheDocument();
    expect(screen.getByTestId('summary-kcal')).toBeInTheDocument();
  });

  it('renders Terminat CTA button', () => {
    renderSummary();
    expect(screen.getByTestId('summary-finish')).toBeInTheDocument();
    expect(screen.getByTestId('summary-finish')).toHaveTextContent(/Terminat/i);
  });
});

describe('PostSummary — stats parsing', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('parses sets count from meta string', () => {
    renderSummary();
    expect(screen.getByTestId('summary-sets')).toHaveTextContent('5');
  });

  it('parses duration from meta string', () => {
    renderSummary();
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('52 min');
  });

  it('parses volume from meta string', () => {
    renderSummary();
    expect(screen.getByTestId('summary-volume')).toHaveTextContent('12 450 kg');
  });

  it('computes kcal estimate (volume * 0.03)', () => {
    renderSummary();
    // 12450 * 0.03 = 373.5 → round → 374
    expect(screen.getByTestId('summary-kcal')).toHaveTextContent('374');
  });

  it('handles missing meta gracefully (zero stats)', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Test', meta: '', ts: Date.now() },
    });
    renderSummary();
    expect(screen.getByTestId('summary-sets')).toHaveTextContent('0');
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('0 min');
    expect(screen.getByTestId('summary-volume')).toHaveTextContent('0 kg');
    expect(screen.getByTestId('summary-kcal')).toHaveTextContent('0');
  });
});

describe('PostSummary — F8 streak counter', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('renders streak count 12', () => {
    renderSummary();
    expect(screen.getByTestId('summary-streak')).toHaveTextContent('12');
  });

  it('uses plural "sesiuni" cand streak > 1', () => {
    renderSummary();
    expect(screen.getByTestId('summary-streak')).toHaveTextContent('sesiuni');
  });

  it('uses singular "sesiune" cand streak = 1', () => {
    useWorkoutStore.setState({ streak: 1 });
    renderSummary();
    const text = screen.getByTestId('summary-streak').textContent ?? '';
    expect(text).toMatch(/1\s+sesiune/);
    expect(text).not.toMatch(/sesiuni/);
  });
});

describe('PostSummary — F11 PR banner conditional', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('PR banner HIDDEN cand prHit=false', () => {
    renderSummary();
    expect(screen.queryByTestId('summary-pr-banner')).not.toBeInTheDocument();
  });

  it('PR banner VISIBLE cand prHit=true', () => {
    useWorkoutStore.setState({ prHit: true });
    renderSummary();
    expect(screen.getByTestId('summary-pr-banner')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /PR nou detectat/i })).toBeInTheDocument();
  });

  it('PR banner shows lastSession title', () => {
    useWorkoutStore.setState({ prHit: true });
    renderSummary();
    expect(screen.getByTestId('summary-pr-banner')).toHaveTextContent(
      /Push \(piept si umeri\)/
    );
  });
});

describe('PostSummary — coach taxonomy alias mapping', () => {
  it('lastRating=usoara → coach line non-empty (mapped la endSession.usor)', () => {
    seedNormalSession();
    useWorkoutStore.setState({ lastRating: 'usoara' });
    renderSummary();
    const coachLine = screen.getByTestId('summary-coach-line');
    expect(coachLine.textContent?.length).toBeGreaterThan(2);
  });

  it('lastRating=normala → coach line non-empty (mapped la endSession.potrivit)', () => {
    seedNormalSession();
    renderSummary();
    const coachLine = screen.getByTestId('summary-coach-line');
    expect(coachLine.textContent?.length).toBeGreaterThan(2);
  });

  it('lastRating=grea → coach line non-empty (mapped la endSession.greu)', () => {
    seedNormalSession();
    useWorkoutStore.setState({ lastRating: 'grea' });
    renderSummary();
    const coachLine = screen.getByTestId('summary-coach-line');
    expect(coachLine.textContent?.length).toBeGreaterThan(2);
  });

  it('lastRating=null → no coach line rendered', () => {
    seedNormalSession();
    useWorkoutStore.setState({ lastRating: null });
    renderSummary();
    expect(screen.queryByTestId('summary-coach-line')).not.toBeInTheDocument();
  });
});

describe('PostSummary — Terminat closure', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('Terminat resets store + navigates antrenor', () => {
    renderSummary();
    fireEvent.click(screen.getByTestId('summary-finish'));
    expect(useWorkoutStore.getState().phase).toBe('idle');
    expect(useWorkoutStore.getState().history).toEqual({});
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });
});

describe('PostSummary — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('no diacritics in UI rendered text', () => {
    const { container } = renderSummary();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });

  it('no diacritics cu PR banner visible', () => {
    useWorkoutStore.setState({ prHit: true });
    const { container } = renderSummary();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
