// ══ AUTH — Magic Link Email Entry Phase 5 task_16 + §07 audit wire ════════
// §7-C1 audit fix — mock login gated import.meta.env.DEV only (production strip)
// §7-C2 audit fix — handleSend wires REAL sendMagicLink from src/auth.js
//   (resolved Phase 6+ "Phase 6+ real wire" comment; auth flow now functional)
// React-side flow stays minimal (anti-paternalism + auth invariant: 0
// password, only email magic link).

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, FlaskConical, ExternalLink, ArrowLeft, X } from 'lucide-react';
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
  // Daniel-directed redesign 2026-05-26 — doua cai conventionale pe acelasi
  // ecran: Login (default, primar) + Creeaza cont (sub-vedere mode state, NU
  // ruta separata). Ambele cai apeleaza ACELASI sendMagicLink (Firebase
  // creeaza contul la prima deschidere a linkului). Signup gateaza pe bifa
  // explicita de consimtamant (Termeni + Confidentialitate).
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [consent, setConsent] = useState(false);
  // U-09 — legal doc inline modal pe Auth (Termeni/Confidentialitate erau
  // link-uri catre /app/cont/* gated de ProtectedRoute → bounce pe /auth
  // inainte ca Gigel sa poata citi ce accepta). Modal local-readable + link
  // text complet andura.app. NU duplica tot textul GDPR (SSOT ramane ecranele
  // Cont + andura.app/terms) — doar puncte-cheie consimtamant.
  const [legalDoc, setLegalDoc] = useState<'terms' | 'privacy' | null>(null);

  // Signup-only consent gate: nu permite submit fara bifa explicita.
  const consentRequiredUnmet = mode === 'signup' && !consent;

  async function handleSend(): Promise<void> {
    if (!isValidEmail(email) || sending || consentRequiredUnmet) return;
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
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 relative"
      data-testid="auth"
    >
      {/* §F-auth-05 HIGH-ALFA — back button to splash per mockup L423-424.
          Inline anchor (NOT SubHeader sticky pattern) matches the centered
          Auth body layout; SubHeader reserved for Settings/Confirms screens. */}
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Inapoi"
        data-testid="auth-back-splash"
        className="absolute top-4 left-4 p-2 text-ink2"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </button>
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

        <h1 className="text-2xl font-bold text-ink mb-2 text-center">
          {mode === 'signup' ? 'Creeaza cont' : 'Intra in cont'}
        </h1>
        <p className="text-sm text-ink2 mb-6 text-center">
          {mode === 'signup'
            ? 'Iti trimitem un link pe email pentru a-ti crea contul. Fara parola.'
            : 'Iti trimitem un link de intrare pe email. Fara parola.'}
        </p>

        {sent ? (
          /* §F-auth-10 (MED chat5 Wave 16) — Magic Link sent UI mockup
              andura-clasic.html#L467-476 verbatim aliniat. 64x64 circle
              paper-2 background + mail icon brick 28px (mockup L468-470).
              Title "Verifica emailul" warm (vs prior terse "Link trimis").
              Subtitle "Ti-am trimis linkul pe {email}. Deschide-l de pe
              acest telefon." anchoreaza cross-device hint critic Magic Link
              UX (Maria 65: deschide email pe alt device → link 404). Pastrez
              expira-15-min info + Schimba-emailul back btn (prod-extra
              utile NU in mockup demo). */
          <div
            className="bg-paper2 border border-line rounded-2xl p-6 text-center"
            data-testid="auth-sent"
          >
            <div className="w-16 h-16 rounded-full bg-paper mx-auto mb-3 flex items-center justify-center">
              <Mail className="w-7 h-7 text-brick" aria-hidden="true" />
            </div>
            <p className="text-xl font-semibold text-ink mb-2">Verifica emailul</p>
            <p className="text-sm text-ink2 mb-1">
              Ti-am trimis linkul pe <strong className="text-ink">{email}</strong>.
            </p>
            <p className="text-sm text-ink2 mb-4">
              Deschide-l de pe acest telefon. Linkul expira in 15 min.
            </p>
            {mode === 'signup' && (
              <p
                className="text-xs text-ink3 mb-4"
                data-testid="auth-sent-signup-note"
              >
                Contul se creeaza cand deschizi linkul.
              </p>
            )}
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
            {/* P-01 — Google PRIMARY (btn-brick, one-tap) deasupra email, per
                mockup andura-clasic.html#L431-461 + directiva Daniel review
                2026-05-11 §10 ("Google primary, email secondary, skip ultimul").
                Cand Google e ascuns (env nesetat pre-Daniel-setup), email devine
                primary (vezi styling conditional pe auth-send mai jos) ca sa nu
                ramana ecranul fara CTA principal. Aliniere top-vs-centru ramane
                centrata (decizie Daniel UX, in afara acestui fix tehnic).
                Daniel-directed redesign — Google = actiune de login, ascuns pe
                calea de creare cont (focus pe email + bifa consimtamant). */}
            {showGoogle && mode === 'login' && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                data-testid="auth-google"
                className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-[18px] h-[18px] bg-white rounded-full p-0.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continua cu Google
              </button>
            )}

            {/* §F-auth-06 (MED) — "sau" separator intre Google si email per mockup
                andura-clasic.html#L439-443. 1px line + ink3 "sau" label. */}
            {showGoogle && mode === 'login' && (
              <div
                className="flex items-center gap-3 my-3"
                data-testid="auth-divider-google"
                aria-hidden="true"
              >
                <div className="flex-1 h-px bg-line" />
                <span className="text-xs text-ink3">sau</span>
                <div className="flex-1 h-px bg-line" />
              </div>
            )}

            {/* §F-auth-08 (MED chat5 Wave 12) — label + placeholder localization
                per mockup andura-clasic.html#L446-447 verbatim. Label "Email
                (primesti un link)" inline hint elimina nevoia explainer pentru
                Gigel/Maria 65 ("ce primesc daca dau email?" raspuns inline).
                Placeholder ".tau@email.ro" → semnal RO localization clar pentru
                user roman (anchor cultural + auth Romanian-first). Required
                attribute preserved invariant (HTML5 validation + aria-required). */}
            <label
              htmlFor="auth-email"
              className="block text-sm text-ink2 font-medium mb-2"
            >
              Email (primesti un link)
            </label>
            {/* §6-C3 audit fix — autoComplete="email" enables browser/password-manager
                autofill (Maria 65 typing relief; 1Password/Bitwarden Magic Link suggest).
                A11Y HIGH chat5 fix — aria-required + aria-invalid + aria-describedby
                pe input pentru screen reader Maria/Gigel: focus input invalid auzeau
                doar "Email" fara motiv. WCAG SC 3.3.1 + SC 3.3.3. */}
            <input
              id="auth-email"
              type="email"
              required
              aria-required="true"
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'auth-email-error' : undefined}
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="numele.tau@email.ro"
              data-testid="auth-email-input"
              className="w-full p-4 mb-4 border border-lineStrong rounded-xl bg-paper2 text-base"
            />
            {/* §F-auth-09 (LOW chat5) — CTA text "Trimite link" → "Trimite
                link de intrare" mockup verbatim andura-clasic.html#L450 (full
                intent phrase: clear what link does pre-Beta).
                P-01 — email = secondary (ghost) cand Google primary e prezent;
                primary (brick) cand Google e ascuns (graceful degradation). */}
            {/* Daniel-directed redesign — bifa de consimtamant explicita DOAR
                pe calea de creare cont (conventional + GDPR). Login nu o cere
                (userii existenti au acceptat deja la inscriere). Submit ramane
                dezactivat pana cand bifa e marcata + email valid. Link-urile
                deschid paginile publice reale /terms si /privacy. */}
            {mode === 'signup' && (
              <div className="flex items-start gap-2 mb-4" data-testid="auth-consent">
                <input
                  id="auth-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  aria-required="true"
                  data-testid="auth-consent-checkbox"
                  className="mt-0.5 w-4 h-4 flex-shrink-0 accent-brick"
                />
                <label htmlFor="auth-consent" className="text-xs text-ink2 leading-relaxed">
                  Sunt de acord cu{' '}
                  <Link
                    to="/terms"
                    data-testid="auth-consent-terms-link"
                    className="underline text-brick"
                  >
                    Termenii si Conditiile
                  </Link>{' '}
                  si{' '}
                  <Link
                    to="/privacy"
                    data-testid="auth-consent-privacy-link"
                    className="underline text-brick"
                  >
                    Politica de Confidentialitate
                  </Link>
                  .
                </label>
              </div>
            )}
            <button
              type="button"
              onClick={() => { void handleSend(); }}
              disabled={!isValidEmail(email) || sending || consentRequiredUnmet}
              data-testid="auth-send"
              className={
                showGoogle && mode === 'login'
                  ? 'w-full py-3 border border-lineStrong rounded-[14px] text-base font-semibold text-ink bg-paper2 disabled:opacity-50'
                  : 'w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold disabled:opacity-50'
              }
            >
              {sending
                ? 'Se trimite…'
                : mode === 'signup'
                  ? 'Creeaza cont'
                  : 'Trimite link de intrare'}
            </button>
            {error && (
              <p
                id="auth-email-error"
                className="mt-3 text-sm text-danger text-center"
                data-testid="auth-error"
                role="alert"
              >
                Nu am putut trimite linkul. Reincearca.
              </p>
            )}

            {/* Daniel-directed redesign — comutator intre cele doua cai. In
                login: buton secundar "Creeaza cont" (sub CTA primar). In signup:
                link inapoi "Ai deja cont? Intra". Acelasi ecran, mode state. */}
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                data-testid="auth-to-signup"
                className="w-full mt-3 py-3 border border-lineStrong rounded-[14px] text-base font-semibold text-ink bg-paper2"
              >
                Creeaza cont
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode('login'); setConsent(false); setError(null); }}
                data-testid="auth-to-login"
                className="w-full mt-3 py-2 text-sm text-ink2 text-center"
              >
                Ai deja cont? <span className="underline text-brick">Intra</span>
              </button>
            )}

            {/* Skip-auth + dev mock = cale de login only (Maria 65 test drive).
                Ascunse pe calea de creare cont, focusata pe email + bifa. */}
            {mode === 'login' && (
              <>
            {/* §F-auth-06 (MED) — "sau" separator before Skip-auth path per
                mockup andura-clasic.html#L452-456. Matches divider above. */}
            <div
              className="flex items-center gap-3 my-3"
              data-testid="auth-divider-skip"
              aria-hidden="true"
            >
              <div className="flex-1 h-px bg-line" />
              <span className="text-xs text-ink3">sau</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {/* §B006/D-2 Skip-auth Slice 1.x — Maria 65 test drive entry */}
            <button
              type="button"
              onClick={handleSkipAuth}
              data-testid="auth-skip"
              className="w-full mt-3 py-3 border border-lineStrong rounded-xl text-sm text-ink2 flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4" aria-hidden="true" />
              Continua fara cont
            </button>
            {/* §F-auth-04 sub-gap (MED chat5 Wave 16) — Skip-auth risk-note
                mockup andura-clasic.html#L462-464 verbatim. Anchoreaza
                consimtamint informat Maria 65: datele local-only,
                pierdere posibila (telefon resetat / cache sters / reinstall).
                Bugatti UX safety: anti-paternalism + transparenta inainte de
                onboarding T0 commit. Asociat F-auth-04 LANDED ledger
                (B006 button) — closing gap risk-note dintr-acelasi mockup. */}
            <p
              className="mt-2 text-xs text-ink3 leading-relaxed text-center"
              data-testid="auth-skip-risk-note"
            >
              Datele se salveaza doar pe acest dispozitiv. Risti sa le pierzi
              (telefon resetat, browser cache sters, app reinstalat).
            </p>

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
          </>
        )}

        {/* §F-auth-07 HIGH-ALFA — Terms + privacy acceptance footer per
            mockup L479-481. Legal compliance: implicit consent on continue.
            U-09 — butoane care deschid modal inline (NU Link catre /app/cont/*
            gated; acelea faceau bounce pe /auth inainte de citire).
            Daniel-directed redesign — footer implicit-consent ramane pe login
            (userii existenti au acceptat deja). Signup gateaza pe bifa explicita
            de mai sus, deci footer-ul implicit nu se afiseaza pe signup. */}
        {mode === 'login' && (
        <p
          className="mt-6 text-xs text-ink3 text-center leading-relaxed"
          data-testid="auth-terms-footer"
        >
          Continuand accepti{' '}
          <button
            type="button"
            onClick={() => setLegalDoc('terms')}
            data-testid="auth-terms-link"
            className="underline"
          >
            Termenii
          </button>{' '}
          si{' '}
          <button
            type="button"
            onClick={() => setLegalDoc('privacy')}
            data-testid="auth-privacy-link"
            className="underline"
          >
            Confidentialitatea
          </button>
          . Nu folosim datele tale pentru reclame.
        </p>
        )}
      </div>

      {/* U-09 — modal inline legal accesibil pre-auth. */}
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </section>
  );
}

// U-09 — Legal doc modal inline pe Auth. Puncte-cheie consimtamant (NU tot
// textul GDPR: SSOT complet = ecrane Cont + andura.app/terms). Focus capture
// + restore + Escape, aliniat cu pattern-ul MedicalDisclaimerModal.
function LegalModal({
  doc,
  onClose,
}: {
  doc: 'terms' | 'privacy' | null;
  onClose: () => void;
}): JSX.Element | null {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!doc) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus();
    };
  }, [doc, onClose]);

  if (!doc) return null;
  const isTerms = doc === 'terms';
  return (
    <div
      className="fixed inset-0 bg-overlayStrong flex items-center justify-center z-[60] p-6"
      data-testid="auth-legal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        data-testid="auth-legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-legal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="auth-legal-title" className="text-base font-bold text-ink">
            {isTerms ? 'Termeni si conditii' : 'Confidentialitate'}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Inchide"
            data-testid="auth-legal-close"
            className="p-1 text-ink2"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {isTerms ? (
          <div className="text-sm text-ink2 space-y-2.5">
            <p>Andura este un coach de antrenament local-first. Folosind app accepti:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Andura ofera recomandari, NU prescriptii medicale.</li>
              <li>Esti responsabil de propria siguranta in sala.</li>
              <li>Backup-ul Firebase e optional si cripteaza datele in transit (HTTPS).</li>
              <li>Telemetria anonima e opt-in (implicit oprita), k-anonimat 5+ GDPR.</li>
              <li>Andura e in Beta gratuita; functii pot fi schimbate pana la V1.</li>
            </ul>
          </div>
        ) : (
          <div className="text-sm text-ink2 space-y-2.5">
            <p>Datele tale raman pe telefon. Tu controlezi ce iese de aici.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Colectam doar profilul + sesiunile + biometrici opt-in + email Magic Link.</li>
              <li>Folosite pentru personalizarea antrenamentelor, local pe telefon.</li>
              <li>ZERO publicitate, ZERO vanzare date, ZERO third-party trackers.</li>
              <li>Acces, export, stergere, rectificare oricand din ecranul Cont.</li>
            </ul>
          </div>
        )}

        <p className="text-xs text-ink2 mt-4">
          Textul complet:{' '}
          <a
            href="https://andura.app/terms"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="auth-legal-live-link"
            className="underline text-brick"
          >
            andura.app/terms
          </a>
          {!isTerms && (
            <>
              {' '}&middot; intrebari GDPR:{' '}
              <a href="mailto:privacy@andura.app" className="underline text-brick">
                privacy@andura.app
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
