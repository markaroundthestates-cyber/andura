// ══ PUBLIC-ONLY ROUTE TESTS — auth guard symmetry (Daniel audit 2026-06-05) ══
// Authenticated users must be bounced out of /auth + /auth/reactivate, and a
// user who already completed onboarding must be bounced out of /onboarding/*.
// The legitimate flows (anon → /auth, authed-but-not-onboarded → /onboarding)
// must keep rendering.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PublicOnlyRoute } from '../../routes/PublicOnlyRoute';
import { useAppStore } from '../../stores/appStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

// auth.js token read — default no token (unauthenticated). Per-test override
// via localStorage seeding is read by the real isAuthenticated(), but we mock
// to keep token detection deterministic + isolated from firebase internals.
vi.mock('../../../auth.js', () => ({
  isAuthenticated: vi.fn(() => false),
}));
import { isAuthenticated as readAuthFromStorage } from '../../../auth.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderAt(path: string, element: JSX.Element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/auth" element={element} />
        <Route path="/auth/reactivate" element={element} />
        <Route path="/onboarding/:step" element={element} />
        <Route path="/app" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(readAuthFromStorage).mockReturnValue(false);
  useAppStore.setState({ isAuthenticated: false, isSkipAuth: false });
  useOnboardingStore.setState({ completed: false });
});

describe('PublicOnlyRoute — mode="auth"', () => {
  it('redirects an authenticated user away from /auth to /app', () => {
    useAppStore.setState({ isAuthenticated: true });
    renderAt('/auth', <PublicOnlyRoute mode="auth"><div data-testid="auth-screen" /></PublicOnlyRoute>);
    expect(screen.queryByTestId('auth-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app');
  });

  it('redirects an authenticated user away from /auth/reactivate to /app', () => {
    useAppStore.setState({ isAuthenticated: true });
    renderAt('/auth/reactivate', <PublicOnlyRoute mode="auth"><div data-testid="auth-screen" /></PublicOnlyRoute>);
    expect(screen.queryByTestId('auth-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app');
  });

  it('redirects when authed via a persisted firebase token (cold-load deep-link)', () => {
    vi.mocked(readAuthFromStorage).mockReturnValue(true);
    renderAt('/auth', <PublicOnlyRoute mode="auth"><div data-testid="auth-screen" /></PublicOnlyRoute>);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app');
  });

  it('LEGITIMATE: an unauthenticated user still sees /auth (login)', () => {
    renderAt('/auth', <PublicOnlyRoute mode="auth"><div data-testid="auth-screen" /></PublicOnlyRoute>);
    expect(screen.getByTestId('auth-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });
});

describe('PublicOnlyRoute — mode="onboarding"', () => {
  it('redirects an authed + already-onboarded user away from /onboarding to /app', () => {
    useAppStore.setState({ isAuthenticated: true });
    useOnboardingStore.setState({ completed: true });
    renderAt('/onboarding/1', <PublicOnlyRoute mode="onboarding"><div data-testid="onboarding-screen" /></PublicOnlyRoute>);
    expect(screen.queryByTestId('onboarding-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app');
  });

  it('LEGITIMATE: an authed-but-NOT-onboarded user still sees /onboarding', () => {
    useAppStore.setState({ isAuthenticated: true });
    useOnboardingStore.setState({ completed: false });
    renderAt('/onboarding/1', <PublicOnlyRoute mode="onboarding"><div data-testid="onboarding-screen" /></PublicOnlyRoute>);
    expect(screen.getByTestId('onboarding-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });

  it('LEGITIMATE: an unauthenticated user mid-flow still sees /onboarding', () => {
    useOnboardingStore.setState({ completed: false });
    renderAt('/onboarding/1', <PublicOnlyRoute mode="onboarding"><div data-testid="onboarding-screen" /></PublicOnlyRoute>);
    expect(screen.getByTestId('onboarding-screen')).toBeInTheDocument();
  });
});
