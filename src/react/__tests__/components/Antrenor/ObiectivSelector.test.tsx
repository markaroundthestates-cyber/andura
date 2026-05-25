// ══ OBIECTIV SELECTOR TESTS — F-antrenor-03 Coverage ════════════════════
// Per MOCKUP-PARITY-chat3 §2.2 + §4 P4 + task spec §7 (4 tests).
// Mockup verbatim ref: 04-architecture/mockups/andura-clasic.html L862-870.
//
// PARITY-CONFIRM-MODALS Wave 2f (PAR-003): pick() navigates la
// /app/antrenor/program-change-confirm cu state.pendingGoal (mockup
// L3211-3220 pickProgram → goto('confirm-program-change')). Same-row click
// = no-op. Tests updated accordingly.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ObiectivSelector } from '../../../components/Antrenor/ObiectivSelector';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const state = (loc.state ?? null) as { pendingGoal?: string; pendingLabel?: string; pendingSub?: string } | null;
  return (
    <div
      data-testid="probe"
      data-pathname={loc.pathname}
      data-pending-goal={state?.pendingGoal ?? ''}
      data-pending-label={state?.pendingLabel ?? ''}
      data-pending-sub={state?.pendingSub ?? ''}
    />
  );
}

function renderSelector() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor']}>
      <Routes>
        <Route path="/app/antrenor" element={<ObiectivSelector />} />
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

describe('ObiectivSelector — 6 obiective V1 LOCK render', () => {
  beforeEach(resetStore);

  it('renders all 6 obiective rows cu labels mockup verbatim', () => {
    renderSelector();
    expect(screen.getByTestId('obiectiv-row-auto')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-forta')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-masa')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-slabire')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-mentenanta')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-row-longevitate')).toBeInTheDocument();
    // Mockup verbatim text labels.
    expect(screen.getByText('Masa musculara')).toBeInTheDocument();
    expect(screen.getByText('Longevitate / Sanatate')).toBeInTheDocument();
    expect(screen.getByText('Mentenanta')).toBeInTheDocument();
  });

  it('defaults to Auto selected when store goal=null (mockup L864 is-active)', () => {
    renderSelector();
    const autoRow = screen.getByTestId('obiectiv-row-auto');
    expect(autoRow).toHaveAttribute('aria-pressed', 'true');
    // "Ales" badge visible on selected row only.
    expect(screen.getByTestId('obiectiv-ales-auto')).toBeInTheDocument();
    // Other rows NOT pressed.
    expect(screen.getByTestId('obiectiv-row-forta')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ObiectivSelector — pick action navigates la program-change-confirm (PAR-003)', () => {
  beforeEach(resetStore);

  it('clicking different row navigates la /app/antrenor/program-change-confirm cu pendingGoal state', () => {
    renderSelector();
    fireEvent.click(screen.getByTestId('obiectiv-row-masa'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/program-change-confirm');
    expect(probe).toHaveAttribute('data-pending-goal', 'masa');
    expect(probe).toHaveAttribute('data-pending-label', 'Masa musculara');
    // Store NU e modificat pana la confirm accept.
    expect(useOnboardingStore.getState().data.goal).toBeNull();
  });

  it('pendingSub e setat din OPTIONS.sub pe navigate', () => {
    renderSelector();
    fireEvent.click(screen.getByTestId('obiectiv-row-slabire'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pending-sub', 'Pierzi grasime, pastrezi muschi');
  });

  it('clicking same-row (already active) = no-op, no navigation', () => {
    // Default activeGoal = 'auto'.
    renderSelector();
    fireEvent.click(screen.getByTestId('obiectiv-row-auto'));
    // Probe absent = still pe /app/antrenor (no nav happened).
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
    renderSelector();
    expect(screen.getByTestId('obiectiv-row-slabire')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('obiectiv-row-auto')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('obiectiv-ales-slabire')).toBeInTheDocument();
  });
});

describe('ObiectivSelector — no diacritics (D-LEGACY-064)', () => {
  beforeEach(resetStore);

  it('no diacritics in rendered text', () => {
    const { container } = renderSelector();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
