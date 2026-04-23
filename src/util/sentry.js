// ══ SENTRY — Error monitoring (production only) ════════════════════════
// Only initializes in production builds. Filters internal noise.

const SENTRY_DSN = 'https://dcbb183e8d98e95c6cd8b2c3c49b2427@o4511269200068608.ingest.de.sentry.io/4511269203869776';

let _initialized = false;

export async function initSentry() {
  // Only in production (not localhost, not test)
  const isProduction = location.hostname !== 'localhost'
    && !location.hostname.includes('127.0.0.1')
    && import.meta.env?.MODE !== 'test';

  if (!isProduction || _initialized) return;

  try {
    const Sentry = await import('@sentry/browser');
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',
      release: `salafull@${import.meta.env?.VITE_APP_VERSION ?? 'unknown'}`,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out noise that isn't actionable
        const msg = event.exception?.values?.[0]?.value ?? '';
        if (msg.includes('ResizeObserver loop')) return null;
        if (msg.includes('Non-Error promise rejection')) return null;
        if (msg.includes('Script error.')) return null;
        if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) return null;
        // Don't send Firebase errors — they're expected when offline
        if (msg.includes('Firebase') || msg.includes('firebasedatabase')) return null;
        return event;
      },
    });
    _initialized = true;
    console.log('[Sentry] Initialized for production');
  } catch (e) {
    console.warn('[Sentry] Init failed:', e.message);
  }
}

/**
 * Capture an exception manually (e.g., from caught errors in critical paths).
 */
export function captureException(error, context = {}) {
  if (!_initialized) return;
  import('@sentry/browser').then(Sentry => {
    Sentry.withScope(scope => {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
      Sentry.captureException(error);
    });
  }).catch(() => {});
}
