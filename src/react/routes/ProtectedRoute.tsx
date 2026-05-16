// ══ PROTECTED ROUTE — Auth Gate Phase 2 Stub ══════════════════════════════
// Phase 2 stub: redirect la /auth dacă !isAuthenticated. Phase 3+ wire real
// Firebase Magic Link state + onboarding gate (T0 Big 6 hard typing).
//
// Cross-refs:
//   - DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid

import type { JSX, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';

interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props): JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}
