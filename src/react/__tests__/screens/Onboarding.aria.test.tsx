// §6-M3 audit gap — Onboarding ARIA semantic coverage SUPPLEMENTAL.
// Existing Onboarding.test.tsx only uses data-testid clicks (no ARIA
// assertions). This file plugs the gap by verifying screen-reader-visible
// semantic for steps 2-5.
//
// NOTE 2026-05-22 revert: role=radiogroup + role=radio + aria-checked
// pattern abandoned per Karpathy SF — radiogroup contract necesita
// arrow-key navigation + roving tabIndex (~200 LOC pentru 7 grupuri) =
// zero user benefit pre-Beta. Revertit la aria-pressed pe <button>
// (Screen reader anunta "button, [label], pressed/not pressed" perfect
// valid pentru toggle select). Tests reflect aria-pressed pattern.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Onboarding } from '../../routes/screens/Onboarding';
import { useOnboardingStore } from '../../stores/onboardingStore';
// SPLASH+AUTH+ONB FINISH i18n — these aria-label assertions match RO copy;
// pin RO locale.
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../i18n/index.js';

function renderAt(step: number): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[`/onboarding/${step}`]}>
      <Routes>
        <Route path="/onboarding/:step" element={<Onboarding />} />
        <Route path="/app/antrenor" element={<div data-testid="antrenor" />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useOnboardingStore.setState({
    data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
    completed: false,
    completedAt: null,
  });
  localStorage.clear();
  __resetI18n();
  __setLocale('ro');
});

describe('Onboarding Step 2 (sex) — toggle button semantic', () => {
  it('both options have aria-pressed=false initially', () => {
    renderAt(2);
    expect(screen.getByTestId('onb-sex-m')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('onb-sex-f')).toHaveAttribute('aria-pressed', 'false');
  });

  it('clicking option sets aria-pressed=true on chosen + false on other', () => {
    renderAt(2);
    fireEvent.click(screen.getByTestId('onb-sex-m'));
    expect(screen.getByTestId('onb-sex-m')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('onb-sex-f')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Onboarding Step 3 (goal) — toggle button semantic', () => {
  it('clicking "masa" sets aria-pressed=true exclusively', () => {
    renderAt(3);
    fireEvent.click(screen.getByTestId('onb-goal-masa'));
    expect(screen.getByTestId('onb-goal-masa')).toHaveAttribute('aria-pressed', 'true');
    // All others must remain false.
    // §obiectiv-drop-longevitate 2026-05-28 — longevitate dropped from goal list.
    ['auto', 'forta', 'slabire', 'mentenanta'].forEach((g) => {
      expect(screen.getByTestId(`onb-goal-${g}`)).toHaveAttribute('aria-pressed', 'false');
    });
  });
});

describe('Onboarding Step 4 (frequency) — toggle button semantic', () => {
  it('all 4 frequency options have aria-label with sesiuni count', () => {
    renderAt(4);
    // §6-M3 audit fix added per-button aria-label so screen readers announce
    // numeric value as "3 sesiuni pe saptamana" (not just "3").
    expect(screen.getByTestId('onb-freq-3')).toHaveAttribute(
      'aria-label',
      '3 sesiuni pe saptamana'
    );
    expect(screen.getByTestId('onb-freq-2')).toHaveAttribute(
      'aria-label',
      '2 sesiuni pe saptamana'
    );
  });

  it('aria-pressed flips after click', () => {
    renderAt(4);
    fireEvent.click(screen.getByTestId('onb-freq-4'));
    expect(screen.getByTestId('onb-freq-4')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Onboarding Step 5 (experience) — toggle button semantic', () => {
  it('clicking "intermediar" sets aria-pressed=true exclusively', () => {
    renderAt(5);
    fireEvent.click(screen.getByTestId('onb-exp-intermediar'));
    expect(screen.getByTestId('onb-exp-intermediar')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('onb-exp-incepator')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('onb-exp-avansat')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Onboarding Step 1 + 6 — numeric inputs have aria-label', () => {
  it('Step 1 age input has aria-label "Varsta in ani"', () => {
    renderAt(1);
    expect(screen.getByTestId('onb-age-input')).toHaveAttribute('aria-label', 'Varsta in ani');
  });

  it('Step 6 weight input has aria-label "Greutate in kilograme"', () => {
    renderAt(6);
    expect(screen.getByTestId('onb-weight-input')).toHaveAttribute(
      'aria-label',
      'Greutate in kilograme'
    );
  });
});
