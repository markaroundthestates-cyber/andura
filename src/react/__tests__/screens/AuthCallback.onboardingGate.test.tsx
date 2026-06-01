// ══ AUTH CALLBACK — ONBOARDING-GATE RACE TEST ════════════════════════════
// Regression coverage for the re-login onboarding loop: a returning user
// (completed onboarding + cloud profile) who logs out then logs back in via
// Google/Magic Link was bounced through onboarding AGAIN. Root cause: the cloud
// restore was fire-and-forget (`void runPostAuthSync()`), so ProtectedRoute's
// `completed === false` gate fired on freshly-wiped local state BEFORE the async
// restore flipped `completed` true.
//
// Fix (AuthCallback.tsx awaitRestoreOrTimeout): AWAIT runPostAuthSync (capped by
// a 6s timeout) before navigating. These tests drive the real ProtectedRoute +
// onboardingStore through that path and assert:
//   (a) existing user (restore flips completed=true) -> lands in app, NO onboarding
//   (b) brand-new user (restore is a no-op, completed stays false) -> onboarding
//   (c) restore hangs past the timeout -> user is NOT trapped on the spinner
//       (navigates anyway; gate then routes by current state)
//
// We mock reactBoot.runPostAuthSync to simulate the restore side-effect with
// controllable timing; auth.js is mocked to a successful Google sign-in so the
// callback reaches the await-and-navigate path.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthCallback } from '../../routes/screens/AuthCallback';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import { useAppStore } from '../../stores/appStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

// ── auth.js mock — Google OAuth success path (reach await+navigate) ──────────
vi.mock('../../../auth.js', async () => {
  const actual = await vi.importActual<typeof import('../../../auth.js')>(
    '../../../auth.js'
  );
  return {
    ...actual,
    signInWithGoogleIdToken: vi.fn(async () => ({ ok: true })),
    // isAuthenticated drives ProtectedRoute's storage sync — keep it false so the
    // test relies on the programmatic setAuthenticated(true) from the callback.
    isAuthenticated: vi.fn(() => false),
  };
});

// ── reactBoot mock — controllable restore simulation ─────────────────────────
const runPostAuthSync = vi.fn((): Promise<void> => Promise.resolve());
vi.mock('../../lib/reactBoot', () => ({
  runPostAuthSync: () => runPostAuthSync(),
}));

function LocationSentinel(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="location-sentinel" data-pathname={loc.pathname} />;
}

function AppScreen(): JSX.Element {
  return <div data-testid="app-home">ACASA</div>;
}

function OnboardingScreen(): JSX.Element {
  return <div data-testid="onboarding-step1">ONBOARDING</div>;
}

// Render AuthCallback then route the post-navigate target through the REAL
// ProtectedRoute so the gate evaluates against live onboardingStore state.
function renderFlow(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/auth-callback']}>
      <Routes>
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route
          path="/app/antrenor"
          element={
            <ProtectedRoute>
              <AppScreen />
            </ProtectedRoute>
          }
        />
        <Route path="/onboarding/1" element={<OnboardingScreen />} />
        <Route path="/auth" element={<LocationSentinel />} />
      </Routes>
    </MemoryRouter>
  );
}

function stubGoogleReturn(): void {
  const url = new URL('http://localhost/auth-callback#id_token=fake-jwt&access_token=at');
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      href: url.href,
      pathname: '/auth-callback',
      search: '',
      hash: url.hash,
    },
    configurable: true,
    writable: true,
  });
}

const ORIGINAL_LOCATION = window.location;

beforeEach(() => {
  vi.useRealTimers();
  runPostAuthSync.mockReset();
  runPostAuthSync.mockResolvedValue(undefined);
  useAppStore.getState().setAuthenticated(false);
  // Default: freshly-wiped local (mirrors post-logout state).
  useOnboardingStore.setState({ completed: false, completedAt: null });
  localStorage.clear();
  vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  stubGoogleReturn();
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: ORIGINAL_LOCATION,
    configurable: true,
    writable: true,
  });
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('AuthCallback onboarding-gate — returning user (cloud restore)', () => {
  it('existing user: restore flips completed=true BEFORE navigate -> lands in app, NO onboarding', async () => {
    // Simulate the cloud restore sticky-restoring the onboarding-complete flag,
    // exactly as hydrateStoresFromCloud's onboarding `apply` does.
    runPostAuthSync.mockImplementation(async () => {
      useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
    });

    renderFlow();

    await waitFor(() => {
      expect(screen.getByTestId('app-home')).toBeInTheDocument();
    });
    // The gate did NOT route to onboarding.
    expect(screen.queryByTestId('onboarding-step1')).not.toBeInTheDocument();
    expect(useAppStore.getState().isAuthenticated).toBe(true);
  });
});

describe('AuthCallback onboarding-gate — brand-new user (no cloud profile)', () => {
  it('new user: restore is a no-op, completed stays false -> onboarding SHOWN', async () => {
    // No cloud profile → runPostAuthSync does not flip completed.
    runPostAuthSync.mockResolvedValue(undefined);

    renderFlow();

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-step1')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('app-home')).not.toBeInTheDocument();
    expect(useOnboardingStore.getState().completed).toBe(false);
  });
});

describe('AuthCallback onboarding-gate — restore times out (no-trap fallback)', () => {
  it('restore hangs past timeout -> user NOT trapped on spinner, navigates anyway', async () => {
    // Restore that never settles. If the fix did NOT cap the await, the callback
    // would hang on the spinner forever. An existing user (completed already true
    // from a prior local session that survived) must still reach the app once the
    // timeout fires — proving the gate is no longer blocked on an unsettled GET.
    useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
    runPostAuthSync.mockImplementation(
      () => new Promise<void>(() => {/* never resolves */})
    );

    renderFlow();

    // Spinner is up while awaiting.
    expect(screen.getByTestId('auth-callback')).toBeInTheDocument();

    // Within the 6s timeout the user lands in the app (not trapped on spinner).
    await waitFor(
      () => {
        expect(screen.getByTestId('app-home')).toBeInTheDocument();
      },
      { timeout: 7000 }
    );
    expect(screen.queryByTestId('auth-callback')).not.toBeInTheDocument();
  });
});
