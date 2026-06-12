// Phase 6 task_11 — SettingsSubscription sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsSubscription } from '../../../routes/screens/cont/SettingsSubscription';

// #3 fix 2026-06-12 — mock the betaNotify helper so this stays a pure UI test
// (the RTDB write + local-flag persistence are covered in betaNotify.test.ts).
// recordBetaNotifyInterest is a no-op resolved promise here; isBetaNotified is
// driven per-test so the CTA's initial state is deterministic.
const recordBetaNotifyInterest = vi.fn().mockResolvedValue(true);
const isBetaNotified = vi.fn().mockReturnValue(false);
vi.mock('../../../lib/betaNotify', () => ({
  recordBetaNotifyInterest: () => recordBetaNotifyInterest(),
  isBetaNotified: () => isBetaNotified(),
}));

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });

beforeEach(() => {
  vi.clearAllMocks();
  isBetaNotified.mockReturnValue(false);
});


function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-subscription']}>
      <Routes>
        <Route path="/app/cont/settings-subscription" element={<SettingsSubscription />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsSubscription — render', () => {
  it('renders heading "Abonament"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Abonament', level: 1 })).toBeInTheDocument();
  });

  it('renders heading "In curand"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /In curand/i, level: 2 })).toBeInTheDocument();
  });

  it('renders Beta gratuit card', () => {
    renderScreen();
    expect(screen.getByTestId('subscription-beta-card')).toBeInTheDocument();
    expect(screen.getByText(/Beta gratuit/)).toBeInTheDocument();
    expect(screen.getByText(/Acces complet/)).toBeInTheDocument();
  });

  it('notify CTA → toggles label + records interest (RTDB write)', () => {
    renderScreen();
    const cta = screen.getByTestId('subscription-notify-cta');
    expect(cta.textContent).toMatch(/Anunta-ma cand e gata/);
    fireEvent.click(cta);
    expect(cta.textContent).toMatch(/Te anuntam cand e gata/);
    expect(cta).toBeDisabled();
    // #3 — the tap must actually record interest, not just flip local state.
    expect(recordBetaNotifyInterest).toHaveBeenCalledTimes(1);
  });

  it('CTA starts in done-state when already notified (survives reload)', () => {
    isBetaNotified.mockReturnValue(true);
    renderScreen();
    const cta = screen.getByTestId('subscription-notify-cta');
    expect(cta.textContent).toMatch(/Te anuntam cand e gata/);
    expect(cta).toBeDisabled();
  });

  it('back navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
