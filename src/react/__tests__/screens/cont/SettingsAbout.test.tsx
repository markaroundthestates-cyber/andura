import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsAbout } from '../../../routes/screens/cont/SettingsAbout';

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
    <MemoryRouter initialEntries={['/app/cont/settings-about']}>
      <Routes>
        <Route path="/app/cont/settings-about" element={<SettingsAbout />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsAbout — Despre Andura screen', () => {
  it('renders heading "Despre Andura"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Despre Andura/i, level: 1 })).toBeInTheDocument();
  });

  it('renders tagline + intro copy', () => {
    renderScreen();
    expect(screen.getByText(/Antrenament cu cap\. Facut in Romania\./)).toBeInTheDocument();
    expect(screen.getByText(/Andura te ajuta sa te antrenezi cu intentie/)).toBeInTheDocument();
  });

  it('renders andura.app external link', () => {
    renderScreen();
    const link = screen.getByRole('link', { name: /andura\.app/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://andura.app');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders version + build info', () => {
    renderScreen();
    expect(screen.getByTestId('about-version')).toHaveTextContent(/v\d+\.\d+\.\d+/);
    expect(screen.getByTestId('about-build')).toHaveTextContent(/\d{4}\.\d{2}\.\d{2}/);
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
