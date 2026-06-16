// ══ PROTECTED ROUTE — Auth Gate Phase 2 Stub + §7-C3 audit wire ═══════════
// §7-C3 audit fix — bridge vanilla auth state (src/auth.js localStorage tokens
// persisted by Magic Link flow) → React appStore.isAuthenticated. Storage
// event listener handles multi-tab + Magic Link landing sync. Replaces "Phase 2
// stub" passive check with reactive auth-state subscriber.
//
// Cross-refs:
//   - DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid
//   - src/auth.js — getAuthState() reads firebase-id-token + firebase-uid localStorage

import type { JSX, ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { isAuthenticated as readAuthFromStorage } from '../../auth.js';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props): JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isSkipAuth = useAppStore((s) => s.isSkipAuth);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  // §56.5.2 soft-delete — a cold-booting returning user whose account is
  // pending deletion (marker found by runPostAuthSync) must land on the RESTORE
  // choice screen, not the app. Set asynchronously after boot's fire-and-forget
  // sync resolves, so the gate re-evaluates reactively when the flag flips.
  const pendingDeletionRestore = useAppStore((s) => s.pendingDeletionRestore);
  // §A015 audit fix (NC§31-H1..H4) — T0 hard typing gate: redirect /onboarding/1
  // dacă user authenticated dar onboarding NU completed. Prevents engine T0
  // baseline pollution + skip-onboarding bypass attempts.
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const location = useLocation();

  // §7-C3 audit fix — reactive auth state sync ADDITIVE only:
  // 1. On mount: if storage has valid auth (Magic Link landed prior session),
  //    set appStore true. Empty storage does NOT override programmatic
  //    setAuthenticated(true) — preserves dev mock login + test isolation.
  // 2. Storage event: react to other-tab Magic Link landing OR signOut.
  // 3. Visibility change: re-check on tab focus.
  // 4. §ProtectedRoute-FIX code-review MEDIUM: bidirectional sync —
  //    storage event + andura:signedout listener catches cross-tab logout
  //    (storage event NU fires în the tab dispatching the change → need
  //    explicit andura:signedout for same-tab + signOut() dispatch).
  useEffect(() => {
    const sync = (): void => {
      const fromStorage = readAuthFromStorage();
      if (fromStorage && !isAuthenticated) {
        setAuthenticated(true);
      }
      // NU set false când !fromStorage — preserves programmatic mock login
      // pentru tests + dev (per §7-C3 audit invariant).
    };
    const onSignedOut = (): void => setAuthenticated(false);
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('andura:signedout', onSignedOut);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('andura:signedout', onSignedOut);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [isAuthenticated, setAuthenticated]);

  // §B006/D-2 audit fix — Skip-auth mode bypasses Magic Link gate (Maria 65
  // test drive paradigm Slice 1.x). Onboarding still mandatory for engine T0.
  //
  // §AUTH-COLD-LOAD fix — appStore boots isAuthenticated:false on every reload
  // (only isSkipAuth is persisted) si bridge-ul storage→store traieste intr-un
  // useEffect care ruleaza DUPA primul render. Pe cold load deep-link la o ruta
  // protejata (PWA/TWA fresh open, hard reload /app/...) un user CU token valid
  // persistat ar fi gresit redirectat la /auth + OAuth. Citim sincron token-ul
  // din storage in gate (readAuthFromStorage = isAuthenticated() din auth.js,
  // verifica firebase-id-token + firebase-uid prezent) ca un token valid sa
  // conteze de la primul render. App-ul revalideaza/refreshes token-ul downstream.
  const passesAuthGate = isAuthenticated || isSkipAuth || readAuthFromStorage();
  if (!passesAuthGate) {
    return <Navigate to="/auth" replace />;
  }
  // §56.5.2 soft-delete — pending deletion intercepts the app before onboarding:
  // route to the RESTORE choice screen. Guard against a self-redirect loop (the
  // restore screen itself lives under /app/cont/restore-account).
  if (pendingDeletionRestore && location.pathname !== '/app/cont/restore-account') {
    return <Navigate to="/app/cont/restore-account" replace />;
  }
  // §C6 audit fix — the restore intercept must PRECEDE the onboarding gate. A
  // soft-delete resets onboarding (completed:false) AND runPostAuthSync returns
  // early on the deletion marker BEFORE hydrate, so completed stays false. On the
  // restore path guard 2 above is skipped (path matches), so without this guard
  // the !onboardingCompleted redirect below would fire and force the user through
  // full re-onboarding before the RestoreAccount screen ever mounts — recovery
  // unreachable. While a deletion is pending, bypass the onboarding gate so the
  // RestoreAccount screen mounts; choosing Restore hydrates the cloud profile
  // (re-sets completed), Delete-now clears the marker — both then re-gate normally.
  if (!onboardingCompleted && !pendingDeletionRestore) {
    return <Navigate to="/onboarding/1" replace />;
  }
  return <>{children}</>;
}
