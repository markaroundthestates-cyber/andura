// ══ REACT ENTRY POINT — Andura Clasic Build Phase 2 Routing Wire ══════════
// Per DECISIONS.md §D015 + §D016 + Co-CTO LOCK Phase 2 routing C hybrid.
// Phase 1 App.tsx placeholder = preserved (used as splash content reuse
// option future). Router config în src/react/routes/router.tsx.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './react/routes/router';
import { initSentry, captureException } from './util/sentry.js';
import { applyInitialTheme, ThemeSync } from './react/lib/themeSync';
import { useSettingsStore } from './react/stores/settingsStore';
import { runReactBoot } from './react/lib/reactBoot';
import './styles/global.css';

// Apply persisted theme synchronously pre-mount to prevent FOUC flash.
applyInitialTheme();

// §SECURITY-HIGH-1-SENTRY-FIX (DIM 10 SECURITY-AUDIT-DEEPER chat 5) —
// GDPR Art. 7 consent gate. Sentry init pornit DOAR daca user opt-in
// explicit via SettingsPrivacy "Telemetrie anonima" toggle (default FALSE
// per settingsStore §51). Pre-fix unconditional call ignora consent =
// drift fata de PrivacyPolicy claim "Implicit oprit" (SettingsPrivacy
// L81 + L120). Subscribe lazy-init pe toggle false->true pentru a porni
// Sentry mid-session dupa opt-in. NOTE: NU putem un-init Sentry runtime
// (Sentry SDK limit) — daca user revoca post-init, scope ramane active
// duration session, dar NO new envelopes envoit post-toggle false
// inseamna user trebuie reload pentru full disable (TODO future:
// Sentry.close()).
if (useSettingsStore.getState().telemetryOptIn) {
  initSentry();
}
useSettingsStore.subscribe((state, prevState) => {
  if (state.telemetryOptIn && !prevState.telemetryOptIn) {
    initSentry();
  }
});

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

// §S-07 audit fix (AUDIT-3) — wire boot orchestration into the React entry.
// The D028 vanilla→React swap left schema migrations + tier rotation + cloud
// restore wired only into the retired src/main.js. Fire-and-forget here so
// migrations + tier rotation run eagerly + a returning authenticated user's
// cloud backup is pulled, WITHOUT blocking first paint (graceful degradation
// per ADR 018 §4). See src/react/lib/reactBoot.ts for the no-data-loss
// invariants. Fresh-login restore is triggered separately in AuthCallback.
void runReactBoot();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    {/* Opt-in to React Router v7 future flag — wraps state updates in
        React.startTransition for smoother concurrent rendering. Silences
        the deprecation warning logged on every nav in v6.28+. */}
    <ThemeSync />
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>
);

// LOCK V1 D060 + D064 — PWA quadruple optimization §4 modulepreload + hash-agnostic requestIdleCallback pattern (DECISIONS.md §D060 + §D064)
// Perf chat 5 MODULEPRELOAD-CRITICAL-CHUNKS-FIX (Lighthouse post-lazy
// opportunity #1) — preload Splash + Auth lazy chunks post-FCP idle.
// Vite default genereaza modulepreload pentru vendor chunks (react/state/
// icons), NU pentru React.lazy() dynamic imports — browser blocheaza pe
// chunk fetch la Suspense resolve ~150-300ms primul navigate.
//
// requestIdleCallback dupa mount = chunks descarcate parallel cu render
// initial, gata la React Suspense resolve (instant route swap). Fallback
// setTimeout pentru Safari < 16.4 fara rIC. ZERO impact LCP (fetch idle,
// nu blocheaza main thread). Maria 65 mobile 3G first-paint -100-150ms
// estimated. Hash-agnostic via Vite resolved import URL (NU fragile
// hard-coded path).
const preloadCriticalChunks = (): void => {
  // Splash = first-paint pe /, Auth = next-likely pentru anon users
  void import('./react/routes/screens/Splash');
  void import('./react/routes/screens/Auth');
};
if ('requestIdleCallback' in window) {
  window.requestIdleCallback(preloadCriticalChunks, { timeout: 2000 });
} else {
  // Safari < 16.4 fallback — 200ms post-mount approximates idle
  setTimeout(preloadCriticalChunks, 200);
}
