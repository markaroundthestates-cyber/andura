// PAR-003 / D047 Wave 2f — ProgramChangeConfirm drill-down tests.
// Mockup verbatim ref: 04-architecture/mockups/andura-clasic.html L2362-2375.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ProgramChangeConfirm } from '../../../routes/screens/antrenor/ProgramChangeConfirm';
import { useOnboardingStore } from '../../../stores/onboardingStore';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

interface RenderOpts {
  pendingGoal?: string;
  pendingLabel?: string;
  pendingSub?: string;
}

function renderScreen(opts: RenderOpts = {}) {
  const state = Object.keys(opts).length > 0 ? opts : null;
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/app/antrenor/program-change-confirm', state }]}
    >
      <Routes>
        <Route path="/app/antrenor/program-change-confirm" element={<ProgramChangeConfirm />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
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
  localStorage.clear(); __resetI18n(); __setLocale("ro");
}

describe('ProgramChangeConfirm — PAR-003 drill-down', () => {
  beforeEach(resetStore);

  it('renders heading "Schimba program" SubHeader', () => {
    renderScreen({ pendingGoal: 'masa', pendingLabel: 'Masa musculara' });
    expect(screen.getByRole('heading', { name: /Schimba program/i, level: 1 })).toBeInTheDocument();
  });

  it('renders confirm question + body lines mockup verbatim', () => {
    renderScreen({ pendingGoal: 'masa', pendingLabel: 'Masa musculara', pendingSub: 'Cresti musculatura vizibil' });
    expect(screen.getByText(/Schimbi programul/i)).toBeInTheDocument();
    expect(screen.getByText(/Coach-ul va regenera saptamana pe/i)).toBeInTheDocument();
    expect(screen.getByText(/Sesiunile deja facute raman in istoric/i)).toBeInTheDocument();
  });

  it('renders pendingLabel + pendingSub din route state', () => {
    renderScreen({ pendingGoal: 'slabire', pendingLabel: 'Slabire', pendingSub: 'Pierzi grasime, pastrezi muschi' });
    expect(screen.getByTestId('program-change-confirm-name')).toHaveTextContent('Slabire');
    expect(screen.getByTestId('program-change-confirm-sub')).toHaveTextContent('Pierzi grasime, pastrezi muschi');
  });

  it('renders fallback label "-" cand state lipseste', () => {
    renderScreen();
    expect(screen.getByTestId('program-change-confirm-name')).toHaveTextContent('-');
  });

  it('Confirma schimbarea = setField goal + navigate /app/antrenor', () => {
    renderScreen({ pendingGoal: 'forta', pendingLabel: 'Forta' });
    fireEvent.click(screen.getByTestId('program-change-confirm-accept'));
    expect(useOnboardingStore.getState().data.goal).toBe('forta');
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });

  it('Anuleaza = NU setField + navigate back /app/antrenor', () => {
    // §obiectiv-drop-longevitate 2026-05-28 — longevitate dropped; folosim slabire.
    renderScreen({ pendingGoal: 'slabire', pendingLabel: 'Slabire' });
    fireEvent.click(screen.getByTestId('program-change-confirm-cancel'));
    expect(useOnboardingStore.getState().data.goal).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });

  it('Back arrow SubHeader = NU setField + navigate /app/antrenor', () => {
    renderScreen({ pendingGoal: 'mentenanta', pendingLabel: 'Mentenanta' });
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(useOnboardingStore.getState().data.goal).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });

  it('Accept fara pendingGoal (defensive) = nav fara setField', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('program-change-confirm-accept'));
    expect(useOnboardingStore.getState().data.goal).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/antrenor');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen({ pendingGoal: 'masa', pendingLabel: 'Masa musculara' });
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
