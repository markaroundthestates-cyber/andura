// splash_skip_returning_v1 (founder 2026-11-17) — a returning session opening "/" goes
// straight to the app; the 2.6 s splash stays the first contact for everyone else.
import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EntryRoute } from '../../routes/EntryRoute';
import { useAppStore } from '../../stores/appStore';
import { isAuthenticated as readAuthFromStorage } from '../../../auth.js';

vi.mock('../../../auth.js', () => ({
  isAuthenticated: vi.fn(() => false),
}));

function NavProbe(): JSX.Element {
  const location = useLocation();
  return <div data-testid="nav-probe" data-path={location.pathname} />;
}

function renderEntry(): void {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<EntryRoute><div data-testid="splash-stub" /></EntryRoute>} />
        <Route path="/app/*" element={<NavProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.removeItem('_devFlags');
  useAppStore.getState().setSkipAuth(false);
  vi.mocked(readAuthFromStorage).mockReturnValue(false);
});

describe('EntryRoute', () => {
  it('a stored session goes straight to /app/antrenor (no splash)', () => {
    vi.mocked(readAuthFromStorage).mockReturnValue(true);
    renderEntry();
    expect(screen.queryByTestId('splash-stub')).not.toBeInTheDocument();
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/app/antrenor');
  });

  it('a test-drive returner goes straight in too', () => {
    useAppStore.getState().setSkipAuth(true);
    renderEntry();
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/app/antrenor');
  });

  it('no session → the splash', () => {
    renderEntry();
    expect(screen.getByTestId('splash-stub')).toBeInTheDocument();
  });

  it('flag off → the splash even with a session', () => {
    localStorage.setItem('_devFlags', JSON.stringify({ splash_skip_returning_v1: false }));
    vi.mocked(readAuthFromStorage).mockReturnValue(true);
    renderEntry();
    expect(screen.getByTestId('splash-stub')).toBeInTheDocument();
  });
});
