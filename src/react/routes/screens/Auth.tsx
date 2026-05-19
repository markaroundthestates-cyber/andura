// ══ AUTH — Magic Link Email Entry Phase 5 task_16 ════════════════════════
// Email input + "Trimite link" CTA + mock fallback. Production Phase 6+
// wires backend Magic Link endpoint (src/auth/sendMagicLink.js existing).
// React-side flow stays minimal (anti-paternalism + auth invariant: 0
// password, only email magic link).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function Auth(): JSX.Element {
  const navigate = useNavigate();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend(): void {
    if (!isValidEmail(email)) return;
    // Phase 6+ real wire: import sendMagicLink from '../../auth/sendMagicLink.js'.
    // Phase 5 task_16 React-side flow scaffolded — confirmation message shown.
    setSent(true);
  }

  function handleMockLogin(): void {
    setAuthenticated(true);
    navigate('/onboarding/1');
  }

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
              onClick={handleSend}
              disabled={!isValidEmail(email)}
              data-testid="auth-send"
              className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold disabled:opacity-50"
            >
              Trimite link
            </button>
            <button
              type="button"
              onClick={handleMockLogin}
              data-testid="auth-mock"
              className="w-full mt-3 py-2 text-ink2 text-xs underline"
            >
              Mock login (Phase 5 dev)
            </button>
          </>
        )}
      </div>
    </section>
  );
}
