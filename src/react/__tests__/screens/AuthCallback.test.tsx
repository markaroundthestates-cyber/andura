// ══ AUTH CALLBACK TEST — Magic Link verifier coverage gap closure ═════════
// Per TEST_COVERAGE_GAP_INVESTIGATION chat 5 Top 5 priority gap #3.
// AuthCallback.tsx 99 LOC = 0% line coverage critical pentru Gigel/Maria 65
// Magic Link verify flow. Mount-on-route component cu 2 entry paths:
//   1. Magic Link via ?oobCode=&email= query (Firebase email link)
//   2. Google OAuth via #id_token= hash fragment (signInWithIdp REST)
// Plus error branches: missing params, verify_failed, google_verify_failed.
//
// Pattern: window.location stub (component reads window.location.search/hash
// direct, NU useLocation hook) + MemoryRouter + LocationSentinel pentru
// post-navigate verify. vi.mock auth.js pentru Firebase REST isolation.
// AUTH_STORAGE_KEYS real values preserved via importActual.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthCallback } from '../../routes/screens/AuthCallback';
import { useAppStore } from '../../stores/appStore';

// ── Auth module mock ─────────────────────────────────────────────────────
// Preserve AUTH_STORAGE_KEYS real values (component reads them for
// localStorage.removeItem on verify-fail) via importActual partial mock.
vi.mock('../../../auth.js', async () => {
  const actual = await vi.importActual<typeof import('../../../auth.js')>(
    '../../../auth.js'
  );
  return {
    ...actual,
    verifyMagicLink: vi.fn(async () => ({ ok: true })),
    parseMagicLinkUrl: vi.fn((search: string) => {
      if (!search) return { oobCode: null, email: null };
      const q = search.startsWith('?') ? search.slice(1) : search;
      const params = new URLSearchParams(q);
      return { oobCode: params.get('oobCode'), email: params.get('email') };
    }),
    getPendingEmail: vi.fn(() => null),
    signInWithGoogleIdToken: vi.fn(async () => ({ ok: true })),
  };
});

// ── Location sentinel — captures useLocation post-navigate ───────────────
function LocationSentinel(): JSX.Element {
  const loc = useLocation();
  return (
    <div
      data-testid="location-sentinel"
      data-pathname={loc.pathname}
      data-search={loc.search}
    />
  );
}

// ── window.location stub helper ──────────────────────────────────────────
// AuthCallback reads window.location.search + window.location.hash direct
// (NU via useLocation). jsdom default location = http://localhost/, search='',
// hash=''. Override via defineProperty for each test scenario.
function stubLocation(search: string, hash: string = ''): void {
  const url = new URL('http://localhost/auth-callback' + search + hash);
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      href: url.href,
      pathname: '/auth-callback',
      search: url.search,
      hash: url.hash,
    },
    configurable: true,
    writable: true,
  });
}

function renderCallback(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/auth-callback']}>
      <Routes>
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/auth" element={<LocationSentinel />} />
        <Route path="/app/antrenor" element={<LocationSentinel />} />
      </Routes>
    </MemoryRouter>
  );
}

const ORIGINAL_LOCATION = window.location;

beforeEach(() => {
  useAppStore.getState().setAuthenticated(false);
  localStorage.clear();
  // history.replaceState spy reset
  vi.spyOn(window.history, 'replaceState');
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: ORIGINAL_LOCATION,
    configurable: true,
    writable: true,
  });
  vi.restoreAllMocks();
});

describe('AuthCallback — initial loading state render', () => {
  it('renders spinner + "Te conectam..." message la mount', () => {
    stubLocation('?oobCode=abc&email=test%40example.com');
    renderCallback();
    expect(screen.getByTestId('auth-callback')).toBeInTheDocument();
    expect(screen.getByText('Te conectam...')).toBeInTheDocument();
    expect(screen.getByText('Asteapta o secunda.')).toBeInTheDocument();
  });

  // U-16 — spinner se invarte in loading (animate-spin prezent).
  it('spinner has animate-spin in loading state', () => {
    stubLocation('?oobCode=abc&email=test%40example.com');
    renderCallback();
    expect(screen.getByTestId('auth-callback-spinner').className).toMatch(/animate-spin/);
  });

  // U-16 — status region role=status + aria-live anunta tranzitia la
  // screen reader (WCAG SC 4.1.3).
  it('status region has role=status + aria-live=polite', () => {
    stubLocation('?oobCode=abc&email=test%40example.com');
    renderCallback();
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Te conectam...');
  });
});

describe('AuthCallback — Magic Link success path', () => {
  it('verifyMagicLink ok -> setAuthenticated(true) + navigate /app/antrenor', async () => {
    stubLocation('?oobCode=valid-code&email=gigel%40example.com');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor'
      );
    });
    expect(useAppStore.getState().isAuthenticated).toBe(true);
  });

  it('Magic Link success -> history.replaceState strips oobCode (anti referrer leak)', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    stubLocation(
      '?oobCode=valid-code&email=gigel%40example.com&mode=signIn&apiKey=AIza-x&continueUrl=http%3A%2F%2Flocalhost%2Fauth-callback'
    );
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor'
      );
    });
    // Parity cu Google path: URL cleaned to bare pathname (no oobCode/mode/apiKey).
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/auth-callback');
  });

  it('falls back la getPendingEmail() cand email lipseste din URL', async () => {
    const authModule = await import('../../../auth.js');
    vi.mocked(authModule.getPendingEmail).mockReturnValueOnce('maria65@example.com');
    stubLocation('?oobCode=valid-code');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor'
      );
    });
    expect(authModule.verifyMagicLink).toHaveBeenCalledWith(
      'maria65@example.com',
      'valid-code'
    );
  });
});

describe('AuthCallback — Magic Link error paths', () => {
  it('missing oobCode + missing pendingEmail -> navigate /auth?error=missing_params', async () => {
    stubLocation('');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/auth'
      );
    });
    expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
      'data-search',
      '?error=missing_params'
    );
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('verifyMagicLink fail (expired token) -> navigate /auth?error=verify_failed', async () => {
    const authModule = await import('../../../auth.js');
    vi.mocked(authModule.verifyMagicLink).mockResolvedValueOnce({
      ok: false,
      error: 'EXPIRED_OOB_CODE',
    });
    stubLocation('?oobCode=expired-code&email=test%40example.com');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/auth'
      );
    });
    expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
      'data-search',
      '?error=EXPIRED_OOB_CODE'
    );
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('verifyMagicLink fail without error code -> default "verify_failed"', async () => {
    const authModule = await import('../../../auth.js');
    vi.mocked(authModule.verifyMagicLink).mockResolvedValueOnce({ ok: false });
    stubLocation('?oobCode=bad&email=test%40example.com');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-search',
        '?error=verify_failed'
      );
    });
  });

  it('verifyMagicLink fail clears pendingEmail (anti shared-device leak)', async () => {
    const authModule = await import('../../../auth.js');
    vi.mocked(authModule.verifyMagicLink).mockResolvedValueOnce({
      ok: false,
      error: 'INVALID_OOB_CODE',
    });
    // Seed localStorage pendingEmail (anti-leak target).
    localStorage.setItem('firebase-magic-link-email', 'leaked@example.com');
    localStorage.setItem(
      'firebase-magic-link-email-expiry',
      String(Date.now() + 60_000)
    );
    stubLocation('?oobCode=replay&email=test%40example.com');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/auth'
      );
    });
    expect(localStorage.getItem('firebase-magic-link-email')).toBeNull();
    expect(localStorage.getItem('firebase-magic-link-email-expiry')).toBeNull();
  });
});

describe('AuthCallback — Google OAuth path (§B005/D-2)', () => {
  it('id_token in hash + signInWithGoogleIdToken ok -> navigate /app/antrenor', async () => {
    stubLocation('', '#id_token=fake-jwt&access_token=at&expires_in=3600');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor'
      );
    });
    expect(useAppStore.getState().isAuthenticated).toBe(true);
  });

  it('Google OAuth success -> history.replaceState clears hash (anti referrer leak)', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    stubLocation('', '#id_token=token&access_token=at');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor'
      );
    });
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/auth-callback');
  });

  it('signInWithGoogleIdToken fail -> navigate /auth?error=<code>', async () => {
    const authModule = await import('../../../auth.js');
    vi.mocked(authModule.signInWithGoogleIdToken).mockResolvedValueOnce({
      ok: false,
      error: 'google_token_invalid',
    });
    stubLocation('', '#id_token=bad-jwt');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-search',
        '?error=google_token_invalid'
      );
    });
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('signInWithGoogleIdToken fail without error code -> default "google_verify_failed"', async () => {
    const authModule = await import('../../../auth.js');
    vi.mocked(authModule.signInWithGoogleIdToken).mockResolvedValueOnce({ ok: false });
    stubLocation('', '#id_token=stale-jwt');
    renderCallback();
    await waitFor(() => {
      expect(screen.getByTestId('location-sentinel')).toHaveAttribute(
        'data-search',
        '?error=google_verify_failed'
      );
    });
  });
});

describe('AuthCallback — Romanian no-diacritics', () => {
  it('all UI copy contains zero diacritics', () => {
    stubLocation('?oobCode=x&email=test%40x.com');
    const { container } = renderCallback();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
