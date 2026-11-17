// ══ ENTRY ROUTE — "/" for a returning session ═════════════════════════════════════
// splash_skip_returning_v1 (founder 2026-11-17, "merg pe recomandarea ta"): the Splash
// logo screen auto-advances after 2.6 s and ran on EVERY open of the installed app
// (start_url "/"), even for a signed-in user — live Lighthouse read LCP ~7.5 s, most of
// it that wait. A returning session (stored token, same source of truth as
// ProtectedRoute + Splash, or a test-drive returner) goes straight to the app, without
// even fetching the Splash chunk; the splash stays the first contact for everyone else.

import type { JSX, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { isAuthenticated as readAuthFromStorage } from '../../auth.js';
import { isEnabled } from '../../util/featureFlags.js';

export function EntryRoute({ children }: { children: ReactNode }): JSX.Element {
  const isSkipAuth = useAppStore((s) => s.isSkipAuth);
  if (isEnabled('splash_skip_returning_v1') && (readAuthFromStorage() || isSkipAuth)) {
    return <Navigate to="/app/antrenor" replace />;
  }
  return <>{children}</>;
}
