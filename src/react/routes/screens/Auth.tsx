// ══ AUTH — Magic Link Email Entry Phase 5 task_16 + §07 audit wire ════════
// §7-C1 audit fix — mock login gated import.meta.env.DEV only (production strip)
// §7-C2 audit fix — handleSend wires REAL sendMagicLink from src/auth.js
//   (resolved Phase 6+ "Phase 6+ real wire" comment; auth flow now functional)
// React-side flow stays minimal (anti-paternalism + auth invariant: 0
// password, only email magic link).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, FlaskConical, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { sendMagicLink, buildGoogleSignInUrl } from '../../../auth.js';
import { detectWebView, webViewLabel } from '../../lib/webviewDetect';

// §B005/D-2 audit fix — Google OAuth client ID from build-time env. Daniel
// configures via GitHub Secrets + Google Cloud Console OAuth provider enable.
// Graceful degradation: button hidden dacă env var missing (pre-Daniel-setup
// state).
const GOOGLE_OAUTH_CLIENT_ID = (
  import.meta as ImportMeta & { env?: { VITE_GOOGLE_OAUTH_CLIENT_ID?: string } }
).env?.VITE_GOOGLE_OAUTH_CLIENT_ID || '';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function Auth(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const setSkipAuth = useAppStore((s) => s.setSkipAuth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(): Promise<void> {
    if (!isValidEmail(email) || sending) return;
    setSending(true);
    setError(null);
    const result = await sendMagicLink(email);
    setSending(false);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error || 'network_error');
    }
  }

  function handleMockLogin(): void {
    setAuthenticated(true);
    navigate('/onboarding/1');
  }

  // §B006/D-2 audit fix — Skip-auth "test drive" paradigm Slice 1.x.
  // Maria 65 friction-low entry: try app local-only fără Magic Link.
  // Data stays Tier 0; future "Iesi din modul test" → /auth real.
  function handleSkipAuth(): void {
    setSkipAuth(true);
    navigate('/onboarding/1');
  }

  // §B005/D-2 audit fix — Google OAuth via Firebase signInWithIdp REST.
  // buildGoogleSignInUrl returns Google OAuth 2 URL; user redirects, lands
  // back /auth-callback cu #id_token=... fragment; AuthCallback exchanges
  // pentru Firebase token via signInWithGoogleIdToken.
  function handleGoogleSignIn(): void {
    if (!GOOGLE_OAUTH_CLIENT_ID) return;
    try {
      const url = buildGoogleSignInUrl(GOOGLE_OAUTH_CLIENT_ID);
      window.location.assign(url);
    } catch {
      setError('google_oauth_init_failed');
    }
  }

  const showGoogle = GOOGLE_OAUTH_CLIENT_ID !== '';
  const showMockLogin = import.meta.env.DEV;
  // §15-H3 audit fix — detect FB/IG/etc. WebView. Magic Link click opens
  // default browser (Chrome) → localStorage scope different → auth state
  // does NOT sync back to WebView → user stuck în loop. Banner warns to
  // open în Chrome directly.
  const webViewSource = detectWebView();

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6"
      data-testid="auth"
    >
      <div className="w-full max-w-sm">
        {webViewSource && (
          <div
            data-testid="auth-webview-warning"
            role="status"
            className="flex items-start gap-2 p-3 mb-4 rounded-xl border"
            style={{
              background: 'var(--status-info-bg)',
              borderColor: 'var(--status-info-border)',
            }}
          >
            <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
            <p className="text-xs text-ink2 leading-relaxed">
              Esti in browser-ul {webViewLabel(webViewSource)}. Magic Link-ul
              functioneaza mai bine daca deschizi <strong>andura.app</strong> in
              Chrome (meniu &middot;&middot;&middot; &gt; Deschide in Chrome).
            </p>
          </div>
        )}

        <h1 className="text-2xl font-semibold text-ink mb-2 text-center">
          Intra in cont
        </h1>
        <p className="text-sm text-ink2 mb-6 text-center">
          Un tap cu Google. Fara parola, fara link pe email.
        </p>

        {sent ? (
          <div
            className="bg-paper2 border border-line rounded-2xl p-6 text-center"
            data-testid="auth-sent"
          >
            <Mail className="w-10 h-10 mx-auto mb-3 text-brick" aria-hidden="true" />
            <p className="text-base font-semibold text-ink mb-1">Link trimis</p>
            <p className="text-sm text-ink2 mb-4">
              Verifica casuta {email}. Linkul expira in 15 min.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              data-testid="auth-back"
              className="text-sm text-ink2 underline"
            >
              Schimba emailul
            </button>
          </div>
        ) : (
          <>
            <label
              htmlFor="auth-email"
              className="block text-sm text-ink2 font-medium mb-2"
            >
              Email
            </label>
            {/* §6-C3 audit fix — autoComplete="email" enables browser/password-manager
                autofill (Maria 65 typing relief; 1Password/Bitwarden Magic Link suggest). */}
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="numele@email.com"
              data-testid="auth-email-input"
              className="w-full p-4 mb-4 border border-lineStrong rounded-xl bg-paper2 text-base"
            />
            <button
              type="button"
              onClick={() => { void handleSend(); }}
              disabled={!isValidEmail(email) || sending}
              data-testid="auth-send"
              className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold disabled:opacity-50"
            >
              {sending ? 'Se trimite…' : 'Trimite link'}
            </button>
            {error && (
              <p
                className="mt-3 text-sm text-danger text-center"
                data-testid="auth-error"
                role="alert"
              >
                Nu am putut trimite linkul. Reincearca.
              </p>
            )}

            {/* §B005/D-2 Google OAuth Slice 1.x — Gigel/Marius friction-low */}
            {showGoogle && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                data-testid="auth-google"
                className="w-full mt-3 py-3 border border-lineStrong rounded-xl text-sm text-ink bg-paper2 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continua cu Google
              </button>
            )}

            {/* §B006/D-2 Skip-auth Slice 1.x — Maria 65 test drive entry */}
            <button
              type="button"
              onClick={handleSkipAuth}
              data-testid="auth-skip"
              className="w-full mt-3 py-3 border border-lineStrong rounded-xl text-sm text-ink2 flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4" aria-hidden="true" />
              Incearca fara cont
            </button>

            {showMockLogin && (
              <button
                type="button"
                onClick={handleMockLogin}
                data-testid="auth-mock"
                className="w-full mt-3 py-2 text-ink2 text-xs underline"
              >
                Mock login (dev only)
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
