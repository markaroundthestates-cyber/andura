// ══ SENTRY — Error monitoring (production only) ════════════════════════
// §4-C1 audit fix — initSentry called from src/main.tsx (React production entry post-D028).
// §4-C5 audit fix — Firebase filter REMOVED (Firebase errors are precisely the signal
// needed for production debugging: quota exceeded, rate limits, network 5xx, auth token
// rejected). Tagged source='firebase' for queryability without dropping.
// §4-H5 + §1-C2 — Sentry DSN migrated to VITE_SENTRY_DSN env var (build-time injection).
// console.log debug stripped (production console drop via vite esbuild §1-C2).

const DEFAULT_SENTRY_DSN = 'https://dcbb183e8d98e95c6cd8b2c3c49b2427@o4511269200068608.ingest.de.sentry.io/4511269203869776';
const SENTRY_DSN = import.meta.env?.VITE_SENTRY_DSN || DEFAULT_SENTRY_DSN;

let _initialized = false;
/** @type {typeof import('@sentry/browser') | null} */
let _Sentry = null;

export async function initSentry() {
  const hostname = location.hostname;
  const isProduction = hostname !== 'localhost'
    && !hostname.includes('127.0.0.1')
    && import.meta.env?.MODE !== 'test';

  if (!isProduction) return;
  if (_initialized) return;

  try {
    _Sentry = await import('@sentry/browser');
    _Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',
      release: `andura@${import.meta.env?.VITE_APP_VERSION ?? '2.0.0'}`,
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
