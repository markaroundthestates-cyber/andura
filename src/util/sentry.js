// ══ SENTRY — Error monitoring (production only) ════════════════════════
// Only initializes in production builds. Filters internal noise.

const SENTRY_DSN = 'https://dcbb183e8d98e95c6cd8b2c3c49b2427@o4511269200068608.ingest.de.sentry.io/4511269203869776';

let _initialized = false;
let _Sentry = null;

export async function initSentry() {
  const hostname = location.hostname;
  const isProduction = hostname !== 'localhost'
    && !hostname.includes('127.0.0.1')
    && import.meta.env?.MODE !== 'test';

  if (!isProduction) {
    console.log('[Sentry] Skipped — not production (hostname:', hostname, ')');
    return;
  }
  if (_initialized) return;

  try {
    _Sentry = await import('@sentry/browser');
    _Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',
      release: `salafull@${import.meta.env?.VITE_APP_VERSION ?? '2.0.0'}`,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        const msg = event.exception?.values?.[0]?.value ?? '';
        // Log every event before filtering so we can debug
        console.log('[Sentry] beforeSend:', msg || event.message || '(no message)');
        if (msg.includes('ResizeObserver loop')) return null;
        if (msg.includes('Non-Error promise rejection')) return null;
        if (msg.includes('Script error.')) return null;
        if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) return null;
        if (msg.includes('Firebase') || msg.includes('firebasedatabase')) return null;
        return event;
      },
    });
    _initialized = true;
    console.log('[Sentry] ✅ Initialized on', hostname);

    // Expose for manual testing from browser console:
    // window.testSentry('mesaj') → sends test event
    // window.Sentry.captureException(new Error('test'))
    window.Sentry = _Sentry;
    window.testSentry = (msg = 'Manual test from SalaFull console') => {
      if (!_initialized) { console.warn('[Sentry] Not initialized'); return; }
      _Sentry.captureMessage(msg, 'info');
      console.log('[Sentry] testSentry() sent:', msg);
    };
  } catch (e) {
    console.warn('[Sentry] Init failed:', e.message);
  }
}

/**
 * Capture an exception manually from critical paths.
 */
export function captureException(error, context = {}) {
  if (!_initialized || !_Sentry) return;
  _Sentry.withScope(scope => {
    for (const [key, value] of Object.entries(context)) {
      scope.setExtra(key, value);
    }
    _Sentry.captureException(error);
  });
}
