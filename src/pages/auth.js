// ══ AUTH SCREEN — Google OAuth primary + Firebase Email Magic Link fallback ══
// Wired with bare DOM, no framework (per ADR 005). Bugatti tone — factual,
// no paternalism, no emoji-spam. Wording LOCKED V1 per §56.2.2 +
// §AMENDMENT 2026-05-04 evening BATCH 1-6 .3 soft-hint UI.

import {
  sendMagicLink,
  verifyMagicLink,
  parseMagicLinkUrl,
  buildGoogleSignInUrl,
  signInWithGoogleIdToken,
  signOut,
  isAuthenticated,
  AUTH_STORAGE_KEYS,
} from '../auth.js';

// Wording verbatim per §56.2.2 LOCKED V1 — Bugatti F4 Maria 65 frictionless,
// anti-paternalism, anti-emoji-spam. Soft-hint sub email field per
// §AMENDMENT 2026-05-04 evening BATCH 1-6 .3 (anti-typo Maria 65).
// Network resilience wording per §56.13.1.
const COPY = Object.freeze({
  title: 'Salvează-ți progresul',
  description: 'Săptămânile tale de antrenament rămân în siguranță și le poți accesa de pe orice telefon sau tabletă.',
  emailLabel: 'Adresa de email',
  emailHint: 'Verifică cu atenție adresa de e-mail introdusă pentru a te asigura că primești link-ul de acces.',
  sendBtn: 'Trimite-mi link de acces pe e-mail',
  sendBtnLoading: 'Se trimite link-ul de acces...',
  googleBtn: 'Continuă cu Google',
  pendingTitle: 'Verifică emailul',
  pendingBody: (email) => `Ți-am trimis un link la ${email}. Deschide-l pe acest dispozitiv ca să te conectezi.`,
  resendBtn: 'Trimite din nou',
  changeEmailBtn: 'Schimbă emailul',
  successWelcome: 'Bine ai venit înapoi!',
  errorInvalidEmail: 'Adresa de email nu pare validă.',
  errorSendFailed: 'Nu am putut trimite codul. Verifică conexiunea la internet.',
  errorRetryBtn: 'Reîncearcă',
  errorVerifyFailed: 'Linkul a expirat sau e invalid. Cere unul nou.',
  signedOut: 'Te-ai delogat.',
  signOutBtn: 'Delogare',
});

/**
 * Build the auth screen DOM. Caller appends `element` to a container.
 *
 * @param {object} [opts]
 * @param {string} [opts.googleClientId] - if absent, the Google button is hidden.
 * @param {Function} [opts.onAuthSuccess] - called after successful auth (any provider) with `{ uid }`.
 * @returns {{ element: HTMLElement, dispose: Function }}
 */
export function createAuthScreen(opts = {}) {
  const { googleClientId, onAuthSuccess } = opts;
  const root = document.createElement('div');
  root.className = 'auth-screen';
  root.setAttribute('data-screen', 'auth');

  let pendingEmail = _readPendingEmail();
  const cleanups = [];

  const render = () => {
    root.innerHTML = '';
    if (pendingEmail) {
      _renderPending(root, pendingEmail, {
        onResend: async () => {
          const res = await sendMagicLink(pendingEmail);
          _toast(res.ok ? 'Link retrimis.' : (COPY.errorSendFailed));
        },
        onChange: () => { pendingEmail = null; _writePendingEmail(null); render(); },
      });
    } else {
      _renderForm(root, {
        // Per §56.13.1: sendMagicLink internal 3x retry. Caller handles
        // post-retry-fail via "Reîncearcă" button (toast + caller can resubmit).
        onSendMagicLink: async (email) => {
          const res = await sendMagicLink(email);
          if (res.ok) { pendingEmail = email; render(); }
          else { _toast(res.error === 'invalid_email' ? COPY.errorInvalidEmail : COPY.errorSendFailed); }
        },
        onGoogle: googleClientId
          ? () => {
              try {
                const url = buildGoogleSignInUrl(googleClientId);
                window.location.assign(url);
              } catch (err) {
                _toast(COPY.errorSendFailed);
              }
            }
          : null,
      });
    }
  };

  render();

  // Auto-handle magic-link callback if URL contains oobCode + email.
  // The host app calls this on auth-callback route; we leave it in-screen
  // for resilience.
  (async () => {
    const { oobCode, email } = parseMagicLinkUrl();
    if (!oobCode) return;
    const e = email || pendingEmail || _readPendingEmail();
    if (!e) return;
    const res = await verifyMagicLink(e, oobCode);
    if (res.ok) {
      _writePendingEmail(null);
      if (typeof onAuthSuccess === 'function') onAuthSuccess({ uid: res.uid });
    } else {
      _toast(COPY.errorVerifyFailed);
    }
  })().catch(() => {});

  return { element: root, dispose: () => cleanups.forEach(fn => { try { fn(); } catch {} }) };
}

/**
 * Programmatic Google id_token handler — call from the redirect-callback
 * route once the URL fragment has been parsed.
 *
 * @param {string} googleIdToken
 * @returns {Promise<{ ok: boolean, uid?: string, error?: string }>}
 */
export async function handleGoogleCallback(googleIdToken) {
  return signInWithGoogleIdToken(googleIdToken);
}

/**
 * Wire a logout button. Returns a dispose function.
 *
 * @param {HTMLElement} btn
 * @param {Function} [onDone]
 */
export function wireLogoutButton(btn, onDone) {
  const handler = () => {
    signOut();
    if (typeof onDone === 'function') onDone();
  };
  btn.addEventListener('click', handler);
  return () => btn.removeEventListener('click', handler);
}

export { isAuthenticated, signOut, COPY as AUTH_SCREEN_COPY };

// ── internals ───────────────────────────────────────────────────────────

function _renderForm(root, { onSendMagicLink, onGoogle }) {
  const h = document.createElement('h2');
  h.className = 'auth-screen__title';
  h.textContent = COPY.title;
  root.appendChild(h);

  const desc = document.createElement('p');
  desc.className = 'auth-screen__description';
  desc.textContent = COPY.description;
  root.appendChild(desc);

  const form = document.createElement('form');
  form.className = 'auth-screen__form';

  const label = document.createElement('label');
  label.className = 'auth-screen__label';
  label.textContent = COPY.emailLabel;
  form.appendChild(label);

  const input = document.createElement('input');
  input.type = 'email';
  input.required = true;
  input.autocomplete = 'email';
  input.className = 'auth-screen__email';
  label.appendChild(input);

  // §AMENDMENT 2026-05-04 evening BATCH 1-6 .3 — soft-hint sub email field
  // anti-confusion typo Maria 65 + zero account-enumeration security risk.
  const hint = document.createElement('p');
  hint.className = 'auth-screen__email-hint';
  hint.textContent = COPY.emailHint;
  form.appendChild(hint);

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.className = 'auth-screen__send';
  sendBtn.textContent = COPY.sendBtn;
  form.appendChild(sendBtn);

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = (input.value || '').trim();
    // Per §56.13: loading state during 3x retry window (~2s worst case).
    const originalLabel = sendBtn.textContent;
    sendBtn.textContent = COPY.sendBtnLoading;
    sendBtn.disabled = true;
    Promise.resolve(onSendMagicLink(email)).finally(() => {
      sendBtn.textContent = originalLabel;
      sendBtn.disabled = false;
    });
  });
  root.appendChild(form);

  if (typeof onGoogle === 'function') {
    const sep = document.createElement('div');
    sep.className = 'auth-screen__sep';
    sep.textContent = '—';
    root.appendChild(sep);

    // §56.2.1 — Google OAuth primary (1-tap), so render BEFORE email form
    // would invert ordering. Spec §56.2.2 places Google CTA primar above
    // email CTA secundar. Current DOM ordering keeps email form first
    // pentru users care vor email-only — Daniel decide UX ordering Beta.
    const googleBtn = document.createElement('button');
    googleBtn.type = 'button';
    googleBtn.className = 'auth-screen__google';
    googleBtn.textContent = COPY.googleBtn;
    googleBtn.addEventListener('click', onGoogle);
    root.appendChild(googleBtn);
  }
}

function _renderPending(root, email, { onResend, onChange }) {
  const h = document.createElement('h2');
  h.className = 'auth-screen__title';
  h.textContent = COPY.pendingTitle;
  root.appendChild(h);

  const body = document.createElement('p');
  body.className = 'auth-screen__pending-body';
  body.textContent = COPY.pendingBody(email);
  root.appendChild(body);

  const resendBtn = document.createElement('button');
  resendBtn.type = 'button';
  resendBtn.className = 'auth-screen__resend';
  resendBtn.textContent = COPY.resendBtn;
  resendBtn.addEventListener('click', onResend);
  root.appendChild(resendBtn);

  const changeBtn = document.createElement('button');
  changeBtn.type = 'button';
  changeBtn.className = 'auth-screen__change';
  changeBtn.textContent = COPY.changeEmailBtn;
  changeBtn.addEventListener('click', onChange);
  root.appendChild(changeBtn);
}

function _readPendingEmail() {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEYS.pendingEmail) : null; }
  catch { return null; }
}

function _writePendingEmail(value) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (value) localStorage.setItem(AUTH_STORAGE_KEYS.pendingEmail, value);
    else localStorage.removeItem(AUTH_STORAGE_KEYS.pendingEmail);
  } catch {}
}

function _toast(msg) {
  // Use existing global toast if available; fallback to console.
  if (typeof window !== 'undefined' && typeof window.toast === 'function') {
    window.toast(msg);
    return;
  }
  console.warn('[Auth]', msg);
}
