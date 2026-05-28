// ══ OBIECTIV GOAL CARD TESTS — Progres tab goal selector ════════════════
// §obiectiv-relocate 2026-05-28 — Goal selector moved din Antrenor home la
// Progres tab. Tests port direct din ObiectivSelector.test.tsx (Antrenor)
// cu testid prefixes preserved + returnTo: 'progres' nav assertion.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ObiectivGoalCard } from '../../../components/Progres/ObiectivGoalCard';
import { useOnboardingStore } from '../../../stores/onboardingStore';
// i18n locale pin — these specs assert RO copy (Masa musculara, Mentenanta,
// "Pierzi grasime, pastrezi muschi"). Force RO so the i18n indirection
// resolves to the RO assertion targets. EN coverage is locked separately
// by i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
});

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const state = (loc.state ?? null) as {
    pendingGoal?: string;
    pendingLabel?: string;
    pendingSub?: string;
    returnTo?: string;
  } | null;
  return (
    <div
      data-testid="probe"
      data-pathname={loc.pathname}
      data-pending-goal={state?.pendingGoal ?? ''}
      data-pending-label={state?.pendingLabel ?? ''}
      data-pending-sub={state?.pendingSub ?? ''}
      data-return-to={state?.returnTo ?? ''}
    />
  );
}

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/app/progres']}>
      <Routes>
        <Route path="/app/progres" element={<ObiectivGoalCard />} />
        <Route path="/app/antrenor/program-change-confirm" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

function resetStore(): void {
  useOnboardingStore.setState({
    data: {
      age: null,
      sex: null,
      goal: null,
      frequency: null,
      experience: null,
      weight: null,
      height: null,
    },
    completed: false,
    completedAt: null,
  });
  localStorage.clear();
}

describe('ObiectivGoalCard — 5 obiective render (post-D080)', () => {
  beforeEach(resetStore);

  it('renders all 5 obiective rows (post-longevitate drop)', () => {
    renderCard();
    expect(screen.getByTestId('obiectiv-row-auto')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-forta')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-masa')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-slabire')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-mentenanta')).toBeInTheDocument();
    // §obiectiv-drop-longevitate — longevitate gone, semantic dup of mentenanta.
    expect(screen.queryByTestId('obiectiv-row-longevitate')).not.toBeInTheDocument();
    expect(screen.getByText('Masa musculara')).toBeInTheDocument();
    expect(screen.getByText('Mentenanta')).toBeInTheDocument();
  });

  it('defaults to Auto selected when store goal=null (mockup L864 is-active)', () => {
    renderCard();
    const autoRow = screen.getByTestId('obiectiv-row-auto');
    expect(autoRow).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('obiectiv-ales-auto')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-forta')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ObiectivGoalCard — pick action navigates la program-change-confirm', () => {
  beforeEach(resetStore);

  it('clicking different row navigates cu pendingGoal state + returnTo=progres', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('obiectiv-row-masa'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/program-change-confirm');
    expect(probe).toHaveAttribute('data-pending-goal', 'masa');
    expect(probe).toHaveAttribute('data-pending-label', 'Masa musculara');
    expect(probe).toHaveAttribute('data-return-to', 'progres');
    // Store NU e modificat pana la confirm accept.
    expect(useOnboardingStore.getState().data.goal).toBeNull();
  });

  it('pendingSub e setat din OPTIONS.sub pe navigate', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('obiectiv-row-slabire'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pending-sub', 'Pierzi grasime, pastrezi muschi');
  });

  it('clicking same-row (already active) = no-op, no navigation', () => {
    renderCard();
    fireEvent.click(screen.getByTestId('obiectiv-row-auto'));
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });

  it('selected state reflects pressed row via aria-pressed=true', () => {
    useOnboardingStore.setState({
      data: {
        age: null,
        sex: null,
        goal: 'slabire',
        frequency: null,
        experience: null,
        weight: null,
        height: null,
      },
      completed: false,
      completedAt: null,
    });
    renderCard();
    expect(screen.getByTestId('obiectiv-row-slabire')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('obiectiv-row-auto')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('obiectiv-ales-slabire')).toBeInTheDocument();
  });
});

describe('ObiectivGoalCard — no diacritics (D-LEGACY-064)', () => {
  beforeEach(resetStore);

  it('no diacritics in rendered text', () => {
    const { container } = renderCard();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
