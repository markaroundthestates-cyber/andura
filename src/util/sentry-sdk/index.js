// Only the @sentry/browser APIs Andura calls (src/util/sentry.js). Named index.js
// so its lazy chunk stays assets/index-*.js — the name the PWA precache globIgnores
// + runtime route (vite.config.js, sw-cache-invariants.test.ts) key on. A dynamic
// import('@sentry/browser') pulls the WHOLE namespace into its chunk (Replay,
// Feedback, tracing — ~152 KB gzip, fetched on every cold start right after the
// main chunk; Lighthouse 11-16 LCP 7.1 s). Lazy-importing this module instead lets
// Rollup tree-shake to what is listed here.
export { init, captureException, captureMessage, withScope, close } from '@sentry/browser';
