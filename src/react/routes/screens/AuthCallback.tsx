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
import { verifyMagicLink, parseMagicLinkUrl, getPendingEmail, signInWithGoogleIdToken, AUTH_STORAGE_KEYS } from '../../../auth.js';
import { runPostAuthSync } from '../../lib/reactBoot';

// §B005/D-2 audit fix — Google OAuth fragment parse helper. Google returns
// `#id_token=<jwt>&access_token=...&...` în URL hash post-redirect.
function parseGoogleIdToken(hash: string): string | null {
  if (!hash || !hash.startsWith('#')) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get('id_token');
}

export function AuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      // §B005/D-2 audit fix — Google OAuth return path detection. If URL hash
      // contains `id_token`, exchange via signInWithGoogleIdToken (Firebase REST
      // accounts:signInWithIdp). Else fall through to Magic Link oobCode flow.
      const googleIdToken = parseGoogleIdToken(window.location.hash);
      if (googleIdToken) {
        const result = await signInWithGoogleIdToken(googleIdToken);
        if (cancelled) return;
        if (result.ok) {
          // Clear hash from URL pre-navigate (avoid token leak via referrer header).
          window.history.replaceState(null, '', window.location.pathname);
          setAuthenticated(true);
          // §S-07 audit fix — fresh login on a (possibly new) device: pull the
          // user's RTDB backup + run the legacy path migration. Fire-and-forget
          // (restore is additive, local-always-wins merge — see reactBoot.ts) so
          // the user lands on the app immediately while sync runs in background.
          void runPostAuthSync();
          navigate('/app/antrenor', { replace: true });
          return;
        }
        setError(result.error || 'google_verify_failed');
        navigate(`/auth?error=${encodeURIComponent(result.error || 'google_verify_failed')}`, { replace: true });
        return;
      }

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
        // §S-07 audit fix — see Google path above. Pull cloud backup + path
        // migration post Magic Link verify, fire-and-forget.
        void runPostAuthSync();
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
      {/* U-16 — spinner doar in loading; pe eroare un cerc static (spinner
          care se invarte + "Eroare" = semnal mixt pentru Gigel). */}
      <div
        className={`w-12 h-12 rounded-full border-4 border-line border-t-brick mb-4${error ? '' : ' animate-spin'}`}
        data-testid="auth-callback-spinner"
        aria-hidden="true"
      />
      {/* U-16 — role=status + aria-live anunta tranzitia loading -> eroare la
          screen reader (altfel schimbarea de text e silentioasa). */}
      <div role="status" aria-live="polite">
        <p className="text-base font-semibold text-ink mb-1">
          {error ? 'Eroare la verificare' : 'Te conectam...'}
        </p>
        <p className="text-sm text-ink2">
          {error ? 'Te redirectionam catre login.' : 'Asteapta o secunda.'}
        </p>
      </div>
    </section>
  );
}
