// ══ SPLASH — Pulse auto-advance + tap-to-skip nav tests ═══════════════════
// Pulse arc reskin (GROUP A / A1, 2026-05-29): the two-CTA landing
// (splash-cta / splash-secondary) was replaced by Daniel's auto-advancing
// Pulse splash — animated PulseMark + gradient "Andura" wordmark + tagline +
// dot loader. It advances on a ~2.6s timer AND on tap/keyboard, routing via the
// EXISTING isAuthenticated logic (/app/antrenor authenticated, else /auth).
//
// This file replaces the prior CTA-label/nav assertions (the buttons no longer
// exist) with the new reality: auto-advance routing + tap-to-skip + the
// authenticated branch. The brand wordmark + trust footer + no-diacritics
// invariants are preserved. MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Splash } from '../../routes/screens/Splash';
import { useAppStore } from '../../stores/appStore';
import { isAuthenticated as readAuthFromStorage } from '../../../auth.js';
// SPLASH+AUTH+ONB FINISH i18n — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../i18n/index.js';

// §01.009 — Splash routes on the REAL stored session (firebase-* token via
// auth.js isAuthenticated), not the session-scope appStore flag. Mock the
// token reader so the returning-user branch is deterministic.
vi.mock('../../../auth.js', () => ({
  isAuthenticated: vi.fn(() => false),
}));

// Probe component renders the path a nav lands on so a test can assert the
// auto-advance / tap-to-skip route target.
function NavProbe(): JSX.Element {
  const location = useLocation();
  return <div data-testid="nav-probe" data-path={location.pathname} />;
}

function renderSplash(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<NavProbe />} />
        <Route path="/app/*" element={<NavProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  __resetI18n();
  __setLocale('ro');
  // appStore is a singleton across a test file — pin the skip-auth flag + the
  // stored-token reader per test so the anon vs returning branch is
  // deterministic.
  useAppStore.getState().setAuthenticated(false);
  useAppStore.getState().setSkipAuth(false);
  vi.mocked(readAuthFromStorage).mockReturnValue(false);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Splash — Pulse auto-advance routing', () => {
  it('renders the animated brand mark + "Andura" wordmark', () => {
    renderSplash();
    expect(screen.getByTestId('splash')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-mark')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Andura');
  });

  it('keeps the trust footer', () => {
    renderSplash();
    expect(screen.getByTestId('splash-trust-footer')).toBeInTheDocument();
  });

  it('auto-advances an anonymous user to /auth after the timer', () => {
    vi.useFakeTimers();
    renderSplash();
    // No nav yet before the timer fires.
    expect(screen.queryByTestId('nav-probe')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2700);
    });
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/auth');
  });

  it('auto-advances a returning authenticated user (stored token) to /app/antrenor after the timer', () => {
    vi.useFakeTimers();
    vi.mocked(readAuthFromStorage).mockReturnValue(true);
    renderSplash();
    act(() => {
      vi.advanceTimersByTime(2700);
    });
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/app/antrenor');
  });

  it('auto-advances a returning test-drive user (isSkipAuth) to /app/antrenor', () => {
    vi.useFakeTimers();
    useAppStore.getState().setSkipAuth(true);
    renderSplash();
    act(() => {
      vi.advanceTimersByTime(2700);
    });
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/app/antrenor');
  });
});

describe('Splash — tap-to-skip', () => {
  it('tapping the splash skips straight to /auth (anon)', () => {
    renderSplash();
    fireEvent.click(screen.getByTestId('splash'));
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/auth');
  });

  it('tapping the splash skips to /app/antrenor when a stored token exists', () => {
    vi.mocked(readAuthFromStorage).mockReturnValue(true);
    renderSplash();
    fireEvent.click(screen.getByTestId('splash'));
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/app/antrenor');
  });

  it('Enter key skips the splash (keyboard accessibility)', () => {
    renderSplash();
    fireEvent.keyDown(screen.getByTestId('splash'), { key: 'Enter' });
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/auth');
  });

  it('a tap then the timer firing does NOT double-navigate', () => {
    vi.useFakeTimers();
    renderSplash();
    fireEvent.click(screen.getByTestId('splash'));
    const firstPath = screen.getByTestId('nav-probe').getAttribute('data-path');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Still on the same single landing (the guard blocked the timer's nav).
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', firstPath as string);
  });
});

describe('Splash — invariants', () => {
  it('no diacritics in the splash copy', () => {
    const { container } = renderSplash();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
