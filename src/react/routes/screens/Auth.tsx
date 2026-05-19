// ══ AUTH — Magic Link Email Entry Phase 5 task_16 + §07 audit wire ════════
// §7-C1 audit fix — mock login gated import.meta.env.DEV only (production strip)
// §7-C2 audit fix — handleSend wires REAL sendMagicLink from src/auth.js
//   (resolved Phase 6+ "Phase 6+ real wire" comment; auth flow now functional)
// React-side flow stays minimal (anti-paternalism + auth invariant: 0
// password, only email magic link).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { sendMagicLink } from '../../../auth.js';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function Auth(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
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

  const showMockLogin = import.meta.env.DEV;

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6"
      data-testid="auth"
    >
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-ink mb-2 text-center">
          Autentificare
        </h1>
        <p className="text-sm text-ink2 mb-6 text-center">
          Iti trimitem un link pe email. Tap-il sa intri în cont.
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
              className="w-full p-4 mb-4 border border-[var(--line-strong)] rounded-xl bg-paper2 text-base"
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
