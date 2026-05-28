// Phase 6 task_14 — SettingsPrivacy sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsPrivacy } from '../../../routes/screens/cont/SettingsPrivacy';
import { useSettingsStore } from '../../../stores/settingsStore';

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

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-privacy']}>
      <Routes>
        <Route path="/app/cont/settings-privacy" element={<SettingsPrivacy />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear(); __resetI18n(); __setLocale("ro"); // Wave E4 RO pin
});

describe('SettingsPrivacy — render + toggles', () => {
  it('renders heading "Confidentialitate"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Confidentialitate', level: 1 })).toBeInTheDocument();
  });

  it('§A025 GDPR Privacy Policy live content section present', () => {
    renderScreen();
    expect(screen.getByTestId('privacy-policy-content')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Politica de confidentialitate/i })).toBeInTheDocument();
    // GDPR sections all 5
    expect(screen.getByRole('heading', { name: /Ce date colectam/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Cum sunt folosite/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Drepturile tale GDPR/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Stocare \+ retentie/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Contact \+ reclamatii/i })).toBeInTheDocument();
    // Contact email present
    expect(screen.getAllByText(/privacy@andura\.app/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders data export toggle + default true', () => {
    renderScreen();
    expect(screen.getByTestId('privacy-data-export-toggle')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders telemetry toggle + default false (anti-paternalism)', () => {
    renderScreen();
    expect(screen.getByTestId('privacy-telemetry-toggle')).toHaveAttribute('aria-checked', 'false');
  });

  it('data export toggle flip → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('privacy-data-export-toggle'));
    expect(useSettingsStore.getState().dataExportConsent).toBe(false);
  });

  it('telemetry toggle flip → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('privacy-telemetry-toggle'));
    expect(useSettingsStore.getState().telemetryOptIn).toBe(true);
  });

  it('renders honest error-reporting hint (Sentry, no usage metrics)', () => {
    renderScreen();
    expect(screen.getByText(/Folosim Sentry doar pentru rapoarte de eroare/i)).toBeInTheDocument();
    expect(screen.getByText(/Nu colectam metrici de utilizare/i)).toBeInTheDocument();
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
