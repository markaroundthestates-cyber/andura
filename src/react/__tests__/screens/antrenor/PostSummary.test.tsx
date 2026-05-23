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
    prData: null,
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

  it('renders h1 "Sesiune terminata" closure framing per mockup L1630', () => {
    renderSummary();
    expect(
      screen.getByRole('heading', { name: /^Sesiune terminata$/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders workout title as subtitle below h1 closure', () => {
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

  it('§F-post-summary-06 stats grid order Durata/Seturi logate/Volum total/Kcal estimate', () => {
    renderSummary();
    const grid = screen.getByTestId('summary-stats-grid');
    const cells = grid.querySelectorAll('[data-testid^="summary-"]');
    const testids = Array.from(cells).map((c) => c.getAttribute('data-testid'));
    expect(testids).toEqual([
      'summary-duration',
      'summary-sets',
      'summary-volume',
      'summary-kcal',
    ]);
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('Durata');
    expect(screen.getByTestId('summary-sets')).toHaveTextContent('Seturi logate');
    expect(screen.getByTestId('summary-volume')).toHaveTextContent('Volum total');
    expect(screen.getByTestId('summary-kcal')).toHaveTextContent('Kcal estimate');
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

describe('PostSummary — numeric fields direct consumption (task_10 §D)', () => {
  it('prefers numeric fields over parseMeta regex', () => {
    useWorkoutStore.setState({
      lastSession: {
        title: 'Push (piept si umeri)',
        meta: 'STALE_META', // intentionally bad regex match
        ts: Date.now(),
        sets: 7,
        durationMin: 45,
        volumeKg: 11000,
      },
      lastRating: 'normala',
      streak: 1,
      prHit: false,
    });
    renderSummary();
    expect(screen.getByTestId('summary-sets')).toHaveTextContent('7');
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('45 min');
    expect(screen.getByTestId('summary-volume')).toHaveTextContent('11 000 kg');
    expect(screen.getByTestId('summary-kcal')).toHaveTextContent('330'); // 11000*0.03=330
  });

  it('falls back la parseMeta cand numeric fields absent (legacy persisted)', () => {
    useWorkoutStore.setState({
      lastSession: {
        title: 'Legacy Session',
        meta: '5 seturi · 52 min · 12 450 kg',
        ts: Date.now(),
        // sets / durationMin / volumeKg deliberately omitted (legacy schema)
      },
      lastRating: 'normala',
      streak: 1,
      prHit: false,
    });
    renderSummary();
    expect(screen.getByTestId('summary-sets')).toHaveTextContent('5');
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('52 min');
    expect(screen.getByTestId('summary-volume')).toHaveTextContent('12 450 kg');
  });

  it('partial numeric fields fall back per-field la parseMeta', () => {
    useWorkoutStore.setState({
      lastSession: {
        title: 'Partial',
        meta: '5 seturi · 52 min · 12 450 kg',
        ts: Date.now(),
        sets: 8, // numeric override
        // durationMin + volumeKg omitted → parseMeta fallback per field
      },
      lastRating: 'normala',
      streak: 1,
      prHit: false,
    });
    renderSummary();
    expect(screen.getByTestId('summary-sets')).toHaveTextContent('8'); // override
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('52 min'); // parsed
    expect(screen.getByTestId('summary-volume')).toHaveTextContent('12 450 kg'); // parsed
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

describe('PostSummary — §F-post-summary-03 muscle groups pills', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('renders muscle pills for Push session (Piept primary + Umeri + Triceps + Abs)', () => {
    renderSummary();
    const muscles = screen.getByTestId('summary-muscles');
    expect(muscles).toBeInTheDocument();
    expect(muscles).toHaveTextContent('Piept');
    expect(muscles).toHaveTextContent('Umeri');
    expect(muscles).toHaveTextContent('Triceps');
    expect(muscles).toHaveTextContent('Abs');
  });

  it('marks primary muscles cu data-muscle-primary=true', () => {
    renderSummary();
    const piept = screen.getByText('Piept').closest('[data-muscle]');
    expect(piept).toHaveAttribute('data-muscle-primary', 'true');
  });

  it('marks secondary muscles cu data-muscle-primary=false (Abs in Push)', () => {
    renderSummary();
    const abs = screen.getByText('Abs').closest('[data-muscle]');
    expect(abs).toHaveAttribute('data-muscle-primary', 'false');
  });

  it('renders Pull session muscle set cand title contine "pull" or "spate"', () => {
    useWorkoutStore.setState({
      lastSession: {
        title: 'Pull (spate si biceps)',
        meta: '5 seturi · 52 min · 12 450 kg',
        ts: Date.now(),
      },
    });
    renderSummary();
    expect(screen.getByText('Spate')).toBeInTheDocument();
    expect(screen.getByText('Biceps')).toBeInTheDocument();
  });

  it('hides muscle pills cand title is unrecognized keyword', () => {
    useWorkoutStore.setState({
      lastSession: {
        title: 'Custom random session',
        meta: '5 seturi · 52 min · 12 450 kg',
        ts: Date.now(),
      },
    });
    renderSummary();
    expect(screen.queryByTestId('summary-muscles')).not.toBeInTheDocument();
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

describe('PostSummary — F11 PR banner enrichment (task_22)', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('renders PR type label "PR greutate" cand type=weight', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: {
        exercise: 'Bench Press',
        deltaKg: 2.5,
        type: 'weight',
        deltaPct: 11.1,
        oneRMEstimate: 33.3,
      },
    });
    renderSummary();
    const label = screen.getByTestId('summary-pr-type-label');
    expect(label).toHaveAttribute('data-pr-type', 'weight');
    expect(label.textContent).toMatch(/PR greutate/);
  });

  it('renders PR type label "PR volum" cand type=volume', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Squat', deltaKg: 0, type: 'volume', deltaPct: 0, oneRMEstimate: 75 },
    });
    renderSummary();
    expect(screen.getByTestId('summary-pr-type-label').textContent).toMatch(/PR volum/);
  });

  it('renders PR type label "PR repetari" cand type=reps', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Pullup', deltaKg: 0, type: 'reps', deltaPct: 0, oneRMEstimate: 25 },
    });
    renderSummary();
    expect(screen.getByTestId('summary-pr-type-label').textContent).toMatch(/PR repetari/);
  });

  it('renders deltaPct cand non-zero', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Bench Press', deltaKg: 2.5, type: 'weight', deltaPct: 11.1, oneRMEstimate: 33.3 },
    });
    renderSummary();
    const pct = screen.getByTestId('summary-pr-delta-pct');
    expect(pct.textContent).toMatch(/\+11\.1%/);
  });

  it('NU renders deltaPct cand 0 (first ever PR no baseline)', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Bench Press', deltaKg: 22.5, type: 'weight', deltaPct: 0, oneRMEstimate: 30 },
    });
    renderSummary();
    expect(screen.queryByTestId('summary-pr-delta-pct')).not.toBeInTheDocument();
  });

  it('renders 1RM estimate cand > 0', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Bench Press', deltaKg: 2.5, type: 'weight', deltaPct: 11.1, oneRMEstimate: 116.7 },
    });
    renderSummary();
    expect(screen.getByTestId('summary-pr-1rm').textContent).toMatch(/1RM estimat: 116\.7kg/);
  });

  it('NU renders 1RM cand zero', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Bench Press', deltaKg: 0, type: 'volume', deltaPct: 0, oneRMEstimate: 0 },
    });
    renderSummary();
    expect(screen.queryByTestId('summary-pr-1rm')).not.toBeInTheDocument();
  });

  it('enrichment hidden cand prData=null (backward compat task_10 baseline)', () => {
    useWorkoutStore.setState({ prHit: true, prData: null });
    renderSummary();
    expect(screen.queryByTestId('summary-pr-enrichment')).not.toBeInTheDocument();
    expect(screen.queryByTestId('summary-pr-type-label')).not.toBeInTheDocument();
  });

  it('banner hidden cand prHit=false (preserve task_10 behavior)', () => {
    useWorkoutStore.setState({ prHit: false });
    renderSummary();
    expect(screen.queryByTestId('summary-pr-banner')).not.toBeInTheDocument();
  });
});

describe('PostSummary — F11 PR banner prData expand (task_10 §B)', () => {
  beforeEach(() => {
    seedNormalSession();
  });

  it('banner shows fallback copy cand prHit=true + prData=null', () => {
    useWorkoutStore.setState({ prHit: true, prData: null });
    renderSummary();
    const detail = screen.getByTestId('summary-pr-detail');
    expect(detail.textContent).toMatch(/Cel mai bun set la/);
    expect(detail.textContent).toMatch(/Push \(piept si umeri\)/);
  });

  it('banner shows prData exercise + deltaKg cand prData present', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Bench Press', deltaKg: 2.5, type: 'weight' },
    });
    renderSummary();
    const detail = screen.getByTestId('summary-pr-detail');
    expect(detail.textContent).toMatch(/Bench Press/);
    expect(detail.textContent).toMatch(/\+2\.5 kg/);
    // task_22: type now displayed în separate enrichment label badge
    expect(screen.getByTestId('summary-pr-type-label').textContent).toMatch(/PR greutate/);
  });

  it('banner shows negative deltaKg fara double-sign', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Squat', deltaKg: -5, type: 'reps' },
    });
    renderSummary();
    const detail = screen.getByTestId('summary-pr-detail');
    expect(detail.textContent).toMatch(/-5 kg/);
    expect(detail.textContent).not.toMatch(/\+-5/);
  });

  it('volume PR type rendered in banner enrichment label', () => {
    useWorkoutStore.setState({
      prHit: true,
      prData: { exercise: 'Deadlift', deltaKg: 10, type: 'volume' },
    });
    renderSummary();
    // task_22: type label în enrichment badge cu RO copy "PR volum"
    expect(screen.getByTestId('summary-pr-type-label').textContent).toMatch(/PR volum/);
  });

  it('detail testid absent cand prHit=false (whole banner hidden)', () => {
    useWorkoutStore.setState({ prHit: false });
    renderSummary();
    expect(screen.queryByTestId('summary-pr-detail')).not.toBeInTheDocument();
  });
});
