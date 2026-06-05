// ══ PUBLIC-ONLY ROUTE — keep authed users out of /auth + onboarding ═══════
// Daniel audit 2026-06-05: the auth guard was one-directional (ProtectedRoute
// kept anon users OUT of /app, but nothing kept an AUTHENTICATED user from
// re-opening /auth, /auth/reactivate, or re-entering /onboarding/:step — they
// rendered the login / onboarding flows instead of redirecting into the app).
//
// This wrapper is the inverse gate:
//   - mode 'auth'       → an authenticated user hitting /auth* lands in /app.
//   - mode 'onboarding' → a user who already COMPLETED onboarding lands in /app
//                         (an authed-but-not-onboarded user still sees onboarding;
//                          an unauthenticated user still sees /auth via the flow).
//
// Auth detection mirrors ProtectedRoute exactly (appStore.isAuthenticated ||
// isSkipAuth || synchronous firebase token read) so cold-load deep-links behave
// identically. We deliberately do NOT redirect unauthenticated users away from
// /auth (that is the legitimate login destination) or push a not-yet-onboarded
// user out of /onboarding.

import type { JSX, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { isAuthenticated as readAuthFromStorage } from '../../auth.js';

interface Props {
  mode: 'auth' | 'onboarding';
  children: ReactNode;
}

export function PublicOnlyRoute({ mode, children }: Props): JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isSkipAuth = useAppStore((s) => s.isSkipAuth);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);

  const isAuthed = isAuthenticated || isSkipAuth || readAuthFromStorage();

  if (mode === 'auth') {
    // Authenticated user has no business on the login / reactivate screens.
    if (isAuthed) return <Navigate to="/app" replace />;
    return <>{children}</>;
  }

  // mode === 'onboarding' — a user who already finished onboarding (authed or
  // skip-auth test drive) must not re-enter the wizard; send them into the app.
  // An authed-but-not-onboarded user (or an anon user mid-flow) still sees it.
  if (isAuthed && onboardingCompleted) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
