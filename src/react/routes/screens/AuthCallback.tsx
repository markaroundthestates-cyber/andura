// ══ AUTH CALLBACK — Magic Link verify Phase iter 9.6 ══════════════════════
// Mount-on-route via /auth-callback. Extract oobCode + email from URL query
// (parseMagicLinkUrl helper), fall back to localStorage pendingEmail if email
// absent. Call verifyMagicLink → on success navigate /app/antrenor (store
// authenticated flip lets ProtectedRoute through), on error navigate
// /auth?error=<reason>. Loading spinner during fetch.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { verifyMagicLink, parseMagicLinkUrl, getPendingEmail, AUTH_STORAGE_KEYS } from '../../../auth.js';

export function AuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      const { oobCode, email: urlEmail } = parseMagicLinkUrl(window.location.search);
      // §4-H2 audit fix — getPendingEmail honors 1h TTL (anti-stale shared-device leak).
      const email = urlEmail || getPendingEmail();
      if (!oobCode || !email) {
        if (!cancelled) {
          // §B020 audit fix (CODE-REVIEW L-10) — single navigate path. Remove setError
          // (would cause 1-frame error UI flash pre-navigate). /auth route reads ?error.
          navigate('/auth?error=missing_params', { replace: true });
        }
        return;
      }
      const result = await verifyMagicLink(email, oobCode);
      if (cancelled) return;
      if (result.ok) {
        setAuthenticated(true);
        navigate('/app/antrenor', { replace: true });
      } else {
        // §AuthCallback-FIX code-review MEDIUM: clear pendingEmail on verify-fail
        // (anti-stale-leak shared-device scenario — failed verify means oobCode
        // invalid/expired/replayed, pendingEmail no longer trusted).
        try {
          localStorage.removeItem(AUTH_STORAGE_KEYS.pendingEmail);
          localStorage.removeItem(AUTH_STORAGE_KEYS.pendingEmailExpiry);
        } catch {}
        setError(result.error || 'verify_failed');
        navigate(`/auth?error=${encodeURIComponent(result.error || 'verify_failed')}`, { replace: true });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate, setAuthenticated]);

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 text-center"
      data-testid="auth-callback"
    >
      <div className="w-12 h-12 rounded-full border-4 border-line border-t-brick animate-spin mb-4" aria-hidden="true" />
      <p className="text-base font-semibold text-ink mb-1">
        {error ? 'Eroare la verificare' : 'Te conectam...'}
      </p>
      <p className="text-sm text-ink2">
        {error ? 'Te redirectionam catre login.' : 'Asteapta o secunda.'}
      </p>
    </section>
  );
}
