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
import { Navigate } from 'react-router-dom';
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
  // §A015 audit fix (NC§31-H1..H4) — T0 hard typing gate: redirect /onboarding/1
  // dacă user authenticated dar onboarding NU completed. Prevents engine T0
  // baseline pollution + skip-onboarding bypass attempts.
  const onboardingCompleted = useOnboardingStore((s) => s.completed);

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
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding/1" replace />;
  }
  return <>{children}</>;
}
