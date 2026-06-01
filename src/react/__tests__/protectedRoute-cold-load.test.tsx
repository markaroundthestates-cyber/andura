// ══ PROTECTED ROUTE — COLD-LOAD AUTH GATE ═════════════════════════════════
// §AUTH-COLD-LOAD fix verify — pe cold load deep-link la o ruta protejata
// (PWA/TWA fresh open, hard reload /app/...) appStore boots isAuthenticated:
// false (doar isSkipAuth e persistat) si bridge-ul storage→store traieste
// intr-un useEffect care ruleaza DUPA primul render. Un user CU token valid
// persistat (firebase-id-token + firebase-uid) trebuie sa treaca gate-ul de la
// PRIMUL render — ZERO redirect la /auth. Fara token → tot redirect la /auth.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '../routes/ProtectedRoute';
import { useAppStore } from '../stores/appStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { AUTH_STORAGE_KEYS } from '../../auth.js';

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth" element={<div data-testid="auth-screen">AUTH</div>} />
        <Route
          path="/app/antrenor/workout"
          element={
            <ProtectedRoute>
              <div data-testid="protected-child">WORKOUT</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute — cold-load deep route with persisted token', () => {
  beforeEach(() => {
    // Simuleaza cold boot: store isAuthenticated:false (default reload), NU skip-auth.
    useAppStore.getState().setAuthenticated(false);
    useAppStore.getState().setSkipAuth(false);
    // Onboarding completed ca sa nu interfere /onboarding/1 gate-ul A015.
    useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
    localStorage.removeItem(AUTH_STORAGE_KEYS.idToken);
    localStorage.removeItem(AUTH_STORAGE_KEYS.uid);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.idToken);
    localStorage.removeItem(AUTH_STORAGE_KEYS.uid);
    useAppStore.getState().setAuthenticated(false);
  });

  it('renders protected child pe cold mount cand exista token valid persistat (NU redirect /auth)', () => {
    // Token valid persistat dintr-o sesiune anterioara Magic Link.
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'valid-id-token-xyz');
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-123');

    renderAt('/app/antrenor/workout');

    expect(screen.getByTestId('protected-child')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-screen')).not.toBeInTheDocument();
  });

  it('redirects la /auth pe cold mount cand NU exista token persistat', () => {
    renderAt('/app/antrenor/workout');

    expect(screen.getByTestId('auth-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-child')).not.toBeInTheDocument();
  });
});
