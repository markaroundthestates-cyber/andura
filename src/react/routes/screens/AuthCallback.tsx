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
import { t } from '../../../i18n/index.js';

// §56.5.2 soft-delete — post-restore landing target. When the cloud sync found
// a pending deletion marker (runPostAuthSync set appStore.pendingDeletionRestore)
// the user must choose Restore vs Delete-now BEFORE entering the app, so route
// to the restore screen instead of the home tab. Read inside the click handler
// (not via a hook) so the just-settled sync state is observed.
const APP_HOME = '/app/antrenor';
const RESTORE_ROUTE = '/app/cont/restore-account';

function postAuthLanding(): string {
  return useAppStore.getState().pendingDeletionRestore ? RESTORE_ROUTE : APP_HOME;
}

// §B005/D-2 audit fix — Google OAuth fragment parse helper. Google returns
// `#id_token=<jwt>&access_token=...&...` în URL hash post-redirect.
function parseGoogleIdToken(hash: string): string | null {
  if (!hash || !hash.startsWith('#')) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get('id_token');
}

// Onboarding-gate race fix — AWAIT the cloud restore before navigating into the
// app. Pre-fix `void runPostAuthSync()` was fire-and-forget, so a returning user
// (local wiped on logout) hit ProtectedRoute's `completed === false` gate BEFORE
// the async restore flipped it true → bounced back through onboarding every
// re-login. Awaiting hydrateStoresFromCloud (inside runPostAuthSync) lands the
// sticky-restored `completed` flag before the gate evaluates. Capped by a timeout
// so a slow/offline cloud GET can never trap the user on the spinner: on timeout
// we navigate anyway (ProtectedRoute then routes by whatever state restored so
// far — a genuinely new user with no cloud profile still correctly sees
// onboarding; the next boot retries the sync since the per-uid done-flag stays
// unset on failure). runPostAuthSync owns its own try/catch and never throws.
const RESTORE_GATE_TIMEOUT_MS = 6000;

async function awaitRestoreOrTimeout(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, RESTORE_GATE_TIMEOUT_MS);
  });
  try {
    await Promise.race([runPostAuthSync(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
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
          // user's RTDB backup + run the legacy path migration. AWAITED (capped)
          // so a returning user's restored onboarding-`completed` flag is in place
          // BEFORE ProtectedRoute's gate evaluates — without this the gate fired
          // on freshly-wiped local state + re-routed the user through onboarding.
          await awaitRestoreOrTimeout();
          if (cancelled) return;
          navigate(postAuthLanding(), { replace: true });
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
        // Strip the auth query params (oobCode/mode/apiKey/continueUrl) from the
        // URL pre-navigate — parity cu Google path above (avoid token leak via
        // referrer header on the runPostAuthSync fetch that fires below while the
        // oobCode still lingers in window.location.search).
        window.history.replaceState(null, '', window.location.pathname);
        setAuthenticated(true);
        // §S-07 audit fix — see Google path above. Pull cloud backup + path
        // migration post Magic Link verify. AWAITED (capped) so the restored
        // onboarding-`completed` flag lands before ProtectedRoute's gate (see
        // awaitRestoreOrTimeout rationale) — prevents the re-login onboarding loop.
        await awaitRestoreOrTimeout();
        if (cancelled) return;
        navigate(postAuthLanding(), { replace: true });
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
          {error ? t('authCallback.errorTitle') : t('authCallback.verifyingTitle')}
        </p>
        <p className="text-sm text-ink2">
          {error ? t('authCallback.errorBody') : t('authCallback.verifyingBody')}
        </p>
      </div>
    </section>
  );
}
