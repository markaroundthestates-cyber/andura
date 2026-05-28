import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsSupport } from '../../../routes/screens/cont/SettingsSupport';

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
    <MemoryRouter initialEntries={['/app/cont/settings-support']}>
      <Routes>
        <Route path="/app/cont/settings-support" element={<SettingsSupport />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsSupport — Suport screen', () => {
  it('renders heading "Suport"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Suport/i, level: 1 })).toBeInTheDocument();
  });

  it('renders email mailto link', () => {
    renderScreen();
    const link = screen.getByTestId('support-email');
    expect(link).toHaveAttribute('href', 'mailto:support@andura.app');
  });

  it('renders WhatsApp as post-Beta non-link', () => {
    renderScreen();
    const ws = screen.getByTestId('support-whatsapp');
    expect(ws).toBeInTheDocument();
    expect(ws.tagName.toLowerCase()).toBe('div');
    expect(ws.textContent).toMatch(/post-Beta/);
  });

  it('renders feedback mailto CTA with subject/body', () => {
    renderScreen();
    const cta = screen.getByTestId('support-feedback-mailto');
    expect(cta).toHaveAttribute('href', expect.stringContaining('mailto:support@andura.app'));
    expect(cta).toHaveAttribute('href', expect.stringContaining('subject='));
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
