// ══ REACT ENTRY POINT — Andura Clasic Build Phase 2 Routing Wire ══════════
// Per DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid.
// Phase 1 App.tsx placeholder = preserved (used as splash content reuse
// option future). Router config în src/react/routes/router.tsx.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './react/routes/router';
import { initSentry, captureException } from './util/sentry.js';
import './styles/global.css';

// §4-C1 audit fix — Sentry production observability wired into React entry.
// initSentry no-ops on localhost/test; safe to call unconditionally here.
initSentry();

// §13-H3 + §13-H4 audit fix — global async + sync error handlers route to
// Sentry. Catches errors escaping React ErrorBoundary tree (third-party
// scripts, async promise rejection unhandled, browser API exceptions).
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));
  captureException(reason, { tags: { source: 'unhandledrejection' } });
});
window.addEventListener('error', (event) => {
  if (event.error instanceof Error) {
    captureException(event.error, { tags: { source: 'window.error' } });
  }
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    {/* Opt-in to React Router v7 future flag — wraps state updates in
        React.startTransition for smoother concurrent rendering. Silences
        the deprecation warning logged on every nav in v6.28+. */}
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>
);
