// ══ PROTECTED ROUTE — SOFT-DELETE RESTORE INTERCEPT ═══════════════════════
// §C6 audit fix verify — after a soft-delete, onboardingStore.reset() sets
// completed:false AND runPostAuthSync returns early on the deletion marker
// BEFORE hydrate (completed stays false). When the user lands on
// /app/cont/restore-account, the pending-deletion intercept is skipped (path
// matches), so without the precedence guard the !onboardingCompleted redirect
// fires → /onboarding/1 → the RestoreAccount screen NEVER mounts and the user is
// forced through full re-onboarding before recovery is offered. The fix bypasses
// the onboarding gate while a deletion is pending so the restore screen mounts.

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
        <Route path="/onboarding/1" element={<div data-testid="onboarding-screen">ONBOARDING</div>} />
        <Route
          path="/app/cont/restore-account"
          element={
            <ProtectedRoute>
              <div data-testid="restore-child">RESTORE</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute — soft-delete restore intercept precedes the onboarding gate', () => {
  beforeEach(() => {
    // Authenticated returning user (valid token persisted from prior session).
    localStorage.setItem(AUTH_STORAGE_KEYS.idToken, 'valid-id-token-xyz');
    localStorage.setItem(AUTH_STORAGE_KEYS.uid, 'uid-123');
    useAppStore.getState().setAuthenticated(true);
    useAppStore.getState().setSkipAuth(false);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.idToken);
    localStorage.removeItem(AUTH_STORAGE_KEYS.uid);
    useAppStore.getState().setAuthenticated(false);
    useAppStore.getState().setPendingDeletionRestore(null);
    useOnboardingStore.setState({ completed: false, completedAt: null });
  });

  it('renders the RestoreAccount screen when pending-deletion + onboarding-not-completed (NOT a redirect to onboarding)', () => {
    // Soft-delete state: deletion pending + onboarding reset to incomplete.
    useAppStore.getState().setPendingDeletionRestore({ requestedAt: Date.now(), expired: false });
    useOnboardingStore.setState({ completed: false, completedAt: null });

    renderAt('/app/cont/restore-account');

    expect(screen.getByTestId('restore-child')).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-screen')).not.toBeInTheDocument();
  });

  it('still redirects to onboarding when NOT pending-deletion + onboarding-not-completed', () => {
    // No deletion marker — the onboarding gate must still fire (regression guard).
    useAppStore.getState().setPendingDeletionRestore(null);
    useOnboardingStore.setState({ completed: false, completedAt: null });

    renderAt('/app/cont/restore-account');

    expect(screen.getByTestId('onboarding-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('restore-child')).not.toBeInTheDocument();
  });
});
