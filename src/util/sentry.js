// ══ SENTRY — Error monitoring (production only) ════════════════════════
// §4-C1 audit fix — initSentry called from src/main.tsx (React production entry post-D028).
// §4-C5 audit fix — Firebase filter REMOVED (Firebase errors are precisely the signal
// needed for production debugging: quota exceeded, rate limits, network 5xx, auth token
// rejected). Tagged source='firebase' for queryability without dropping.
// §4-H5 + §1-C2 — Sentry DSN migrated to VITE_SENTRY_DSN env var (build-time injection).
// console.log debug stripped (production console drop via vite esbuild §1-C2).

import { VITE_ENV } from './env';

const DEFAULT_SENTRY_DSN = 'https://dcbb183e8d98e95c6cd8b2c3c49b2427@o4511269200068608.ingest.de.sentry.io/4511269203869776';
const SENTRY_DSN = VITE_ENV.VITE_SENTRY_DSN || DEFAULT_SENTRY_DSN;

let _initialized = false;
/** @type {typeof import('@sentry/browser') | null} */
let _Sentry = null;

export async function initSentry() {
  const hostname = location.hostname;
  const isProduction = hostname !== 'localhost'
    && !hostname.includes('127.0.0.1')
    && VITE_ENV.MODE !== 'test';

  if (!isProduction) return;
  if (_initialized) return;

  try {
    _Sentry = await import('@sentry/browser');
    _Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',
      release: `andura@${VITE_ENV.VITE_APP_VERSION ?? '2.0.0'}`,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        const msg = event.exception?.values?.[0]?.value ?? '';
        if (msg.includes('ResizeObserver loop')) return null;
        if (msg.includes('Non-Error promise rejection')) return null;
        if (msg.includes('Script error.')) return null;
        if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) return null;
        // §4-C5 audit fix — Firebase errors tagged (NOT dropped) for queryability.
        if (msg.includes('Firebase') || msg.includes('firebasedatabase')) {
          event.tags = { ...(event.tags || {}), source: 'firebase' };
        }
        // §17-M3 + §S2.1 + §MED-1 audit fix — PII strip pass.
        // Firebase uid is a 28-char alphanumeric. Earlier broad pattern
        // /\b[A-Za-z0-9]{28}\b/g destroyed Vite chunk hashes in source-map
        // refs (e.g., webpack:///./src/abc...xyz.js) — now anchored to
        // explicit uid contexts: uid=/userId=/user_id= prefix, OR Firebase
        // REST URL path /users/<uid>.
        // §MED-1 (REVIEW-chat3) — char class extended with " and ' to cover
        // JSON-serialized payloads in Sentry breadcrumb data (e.g., fetch
        // integration parks request bodies as JSON: '"uid":"<28chars>"').
        /**
         * @param {unknown} s
         * @returns {unknown}
         */
        const scrubMsg = (s) => {
          if (typeof s !== 'string') return s;
          let out = s.replace(/\b(uid|userId|user_id)["':=\s/]+([A-Za-z0-9]{28})\b/gi, '$1=<UID>');
          out = out.replace(/\/users\/[A-Za-z0-9]{28}\b/g, '/users/<UID>');
          // §S-08 (audit) — Firebase RTDB REST URLs carry the auth idToken (JWT)
          // as ?auth=<jwt> / &auth=<jwt> query param (_buildUrl in firebase.js).
          // Sentry fetch integration parks these full URLs in request.url +
          // breadcrumb.data.url, leaking the bearer token. Redact the token
          // value (kept prefix for queryability) up to next query delimiter.
          out = out.replace(/([?&]auth=)[^&\s"'<]+/gi, '$1[REDACTED]');
          // Email: \b prefix prevents stripping preceding word
          // (e.g., 'User user@example.com' kept 'User' instead of consuming it).
          out = out.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<EMAIL>');
          return out;
        };
        if (event.exception?.values) {
          for (const ex of event.exception.values) {
            if (ex.value) ex.value = /** @type {string} */ (scrubMsg(ex.value));
          }
        }
        if (event.message) event.message = /** @type {string} */ (scrubMsg(event.message));
        // §S2.1 — request.url + user channels populated by default Sentry
        // browser integrations. Auth-callback URL carries oobCode + email
        // continueUrl reflection; user.email / user.id populated by any
        // setUser call.
        if (event.request?.url) event.request.url = /** @type {string} */ (scrubMsg(event.request.url));
        if (event.user?.email) event.user.email = '<EMAIL>';
        if (event.user?.username) event.user.username = '<EMAIL>';
        if (event.user?.id) event.user.id = '<UID>';
        if (Array.isArray(event.breadcrumbs)) {
          for (const bc of event.breadcrumbs) {
            if (bc.message) bc.message = /** @type {string} */ (scrubMsg(bc.message));
            // §S2.1 — breadcrumb.data.url is where Sentry default fetch
            // integration parks every fbGet/fbSet URL (uid in /users/ path).
            if (bc.data && typeof bc.data === 'object' && typeof bc.data.url === 'string') {
              bc.data.url = /** @type {string} */ (scrubMsg(bc.data.url));
            }
          }
        }
        return event;
      },
    });
    _initialized = true;

    // Manual testing surface (production console drop §1-C2 leaves window vars
    // intact — accessed via DevTools console even in prod build).
    const Sentry = _Sentry;
    window.Sentry = Sentry;
    window.testSentry = (msg = 'Manual test from Andura console') => {
      if (!_initialized) return;
      Sentry.captureMessage(msg, 'info');
    };
  } catch {
    // Sentry init failure = best-effort fallback (silent). Errors still
    // surface via ErrorBoundary console + Phase 6 task_20 path.
  }
}

/**
 * Capture an exception manually from critical paths.
 *
 * @param {unknown} error
 * @param {{ tags?: Record<string, unknown>, extra?: Record<string, unknown>, [k: string]: unknown }} [context]
 */
export function captureException(error, context = {}) {
  if (!_initialized || !_Sentry) return;
  const Sentry = _Sentry;
  Sentry.withScope(/** @param {import('@sentry/browser').Scope} scope */ (scope) => {
    if (context.tags && typeof context.tags === 'object') {
      for (const [k, v] of Object.entries(context.tags)) scope.setTag(k, String(v));
    }
    if (context.extra && typeof context.extra === 'object') {
      for (const [k, v] of Object.entries(context.extra)) scope.setExtra(k, v);
    }
    for (const [k, v] of Object.entries(context)) {
      if (k !== 'tags' && k !== 'extra') scope.setExtra(k, v);
    }
    Sentry.captureException(error);
  });
}
