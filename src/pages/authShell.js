// ══ AUTH SHELL — modal overlay + /auth-callback handler + auth-banner-soft ══
//
// Per §AMENDMENT 2026-05-04 + §56.1-§56.19 LOCKED V1 spec, this module wires
// the auth screen + Magic Link callback + Anonymous prompt banner into the
// SPA shell. Exports invoked from main.js on boot.
//
// Architecture:
//   - showAuthScreen(opts)         → opens auth modal overlay (Bugatti-styled)
//   - handleAuthCallbackRoute()    → detects /auth-callback URL, processes Magic Link
//   - mountAuthBanner({ onAuth })  → "Salvează contul" non-blocking banner per §56.1.1
//   - hideAuthScreen()             → tears down modal cleanly
//
// Per ADR 005: vanilla JS, bare DOM. NU framework. Per §56.17.1 SW + Firebase
// Auth coexistence — SW NU intercepteză /auth-callback (handled aici client-side).

import {
  createAuthScreen,
  AUTH_SCREEN_COPY,
} from './auth.js';
import {
  parseMagicLinkUrl,
  verifyMagicLink,
  signInWithGoogleIdToken,
  isAuthenticated,
  AUTH_STORAGE_KEYS,
} from '../auth.js';

// Pending email storage key — module-private constant, mirror auth.js layout.
const PENDING_EMAIL_KEY = AUTH_STORAGE_KEYS.pendingEmail;

let _activeOverlay = null;

/**
 * Open the auth screen as a modal overlay over the SPA. Tears down on
 * successful auth (default) or when user dismisses.
 *
 * Per §56.3.1 LOCKED V1: auth-screen position = DUPĂ T0 onboarding (post
 * Investment Phase commitment psihologic maxim). Caller decides trigger.
 *
 * @param {object} [opts]
 * @param {string} [opts.googleClientId]      passed through to createAuthScreen
 * @param {Function} [opts.onAuthSuccess]     called with { uid } after auth
 * @param {boolean}  [opts.dismissable=true]  show close (X) button + ESC handler
 * @returns {{ close: () => void }}
 */
export function showAuthScreen(opts = {}) {
  const { googleClientId, onAuthSuccess, dismissable = true } = opts;

  if (_activeOverlay) return { close: hideAuthScreen };

  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.setAttribute('data-screen', 'auth-overlay');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:600',
    'background:rgba(10,10,15,0.96)', 'backdrop-filter:blur(8px)',
    'overflow-y:auto', 'padding:60px 20px 40px',
    'display:flex', 'justify-content:center', 'align-items:flex-start',
  ].join(';');

  const card = document.createElement('div');
  card.style.cssText = [
    'background:var(--bg2)', 'border:1px solid var(--border)',
    'border-radius:var(--r,16px)', 'padding:28px 22px 24px',
    'max-width:420px', 'width:100%',
    'box-shadow:0 12px 48px rgba(0,0,0,0.55)',
  ].join(';');

  if (dismissable) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Închide');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = [
      'position:absolute', 'top:18px', 'right:22px',
      'background:none', 'border:none', 'color:var(--text2)',
      'font-size:28px', 'line-height:1', 'cursor:pointer',
      'padding:4px 10px', 'font-family:inherit',
    ].join(';');
    closeBtn.addEventListener('click', () => hideAuthScreen());
    overlay.appendChild(closeBtn);
  }

  const screen = createAuthScreen({
    googleClientId,
    onAuthSuccess: (info) => {
      _toast(AUTH_SCREEN_COPY.successWelcome || 'Bine ai venit înapoi!', 'var(--green)');
      hideAuthScreen();
      if (typeof onAuthSuccess === 'function') {
        try { onAuthSuccess(info); } catch (err) { console.warn('[authShell] onAuthSuccess threw:', err); }
      }
      // Notify rest of app — pages/dashboard/coach can re-render with auth state.
      try { window.dispatchEvent(new CustomEvent('andura:authsuccess', { detail: info })); } catch {}
    },
  });

  card.appendChild(screen.element);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  _activeOverlay = { overlay, dispose: screen.dispose };

  if (dismissable) {
    const onKey = (ev) => {
      if (ev.key === 'Escape') hideAuthScreen();
    };
    document.addEventListener('keydown', onKey);
    _activeOverlay.onKey = onKey;
  }

  return { close: hideAuthScreen };
}

export function hideAuthScreen() {
  if (!_activeOverlay) return;
  const { overlay, dispose, onKey } = _activeOverlay;
  _activeOverlay = null;
  if (onKey) document.removeEventListener('keydown', onKey);
  if (typeof dispose === 'function') { try { dispose(); } catch {} }
  if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
}

/**
 * Detect /auth-callback URL on boot. If present, parses Magic Link params
 * (oobCode + email) sau Google id_token (from URL fragment), invokes the
 * matching verify call, and dispatches `andura:authsuccess` on win.
 *
 * Per §56.10.1: continueUrl `https://andura.app/auth-callback`. Pre-Beta
 * Android Universal Links handles native PWA deep-link; pe browsers
 * fără Universal Links handler, route processing happens here.
 *
 * Returns null when current URL is NOT /auth-callback (no-op).
 *
 * @returns {Promise<{ ok: boolean, uid?: string, provider?: 'magic-link'|'google', error?: string }|null>}
 */
export async function handleAuthCallbackRoute() {
  if (typeof window === 'undefined' || !window.location) return null;
  const path = window.location.pathname || '';
  if (!path.endsWith('/auth-callback')) return null;

  // Magic Link path — params în query string.
  const { oobCode, email: emailFromUrl } = parseMagicLinkUrl();
  if (oobCode) {
    const email = emailFromUrl || _readPendingEmail();
    if (!email) {
      return { ok: false, provider: 'magic-link', error: 'missing_email' };
    }
    const res = await verifyMagicLink(email, oobCode);
    if (res.ok) {
      _writePendingEmail(null);
      _cleanCallbackUrl();
      try { window.dispatchEvent(new CustomEvent('andura:authsuccess', { detail: { uid: res.uid, provider: 'magic-link' } })); } catch {}
      return { ok: true, uid: res.uid, provider: 'magic-link' };
    }
    return { ok: false, provider: 'magic-link', error: res.error };
  }

  // Google OAuth implicit flow — id_token în URL fragment.
  const hash = window.location.hash || '';
  if (hash) {
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const idToken = params.get('id_token');
    if (idToken) {
      const res = await signInWithGoogleIdToken(idToken);
      if (res.ok) {
        _cleanCallbackUrl();
        try { window.dispatchEvent(new CustomEvent('andura:authsuccess', { detail: { uid: res.uid, provider: 'google' } })); } catch {}
        return { ok: true, uid: res.uid, provider: 'google' };
      }
      return { ok: false, provider: 'google', error: res.error };
    }
  }

  return null;
}

/**
 * Mount the auth-banner-soft per §56.1.1 LOCKED V1. Non-blocking strip
 * la top: "Salvează-ți progresul →" pentru Anonymous users. Click → opens
 * showAuthScreen(). Auto-hides cand `isAuthenticated()` becomes true.
 *
 * Anti-spam: NU mount dacă deja authenticated. Banner persists Bugatti F4
 * Maria 65 — non-blocking, NU modal, NU hard-prompt.
 *
 * @param {object} [opts]
 * @param {string} [opts.googleClientId]      forwarded to showAuthScreen
 * @param {Function} [opts.onAuthSuccess]     forwarded to showAuthScreen
 * @returns {{ unmount: () => void } | null}
 */
export function mountAuthBanner(opts = {}) {
  if (typeof document === 'undefined') return null;
  if (isAuthenticated()) return null;
  if (document.getElementById('auth-banner-soft')) return null;

  const banner = document.createElement('div');
  banner.id = 'auth-banner-soft';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Salvează contul');
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:400',
    'background:linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%)',
    'border-bottom:1px solid var(--border)',
    'padding:8px 14px', 'display:flex', 'align-items:center', 'gap:10px',
    'font-family:inherit', 'font-size:12px', 'color:var(--text2)',
    'cursor:pointer',
  ].join(';');

  const label = document.createElement('span');
  label.textContent = 'Salvează-ți progresul';
  label.style.flex = '1';
  banner.appendChild(label);

  const cta = document.createElement('span');
  cta.textContent = 'Conectează-te →';
  cta.style.cssText = 'color:var(--accent);font-weight:600';
  banner.appendChild(cta);

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.setAttribute('aria-label', 'Ascunde');
  dismiss.textContent = '×';
  dismiss.style.cssText = [
    'background:none', 'border:none', 'color:var(--text3)',
    'font-size:18px', 'line-height:1', 'cursor:pointer',
    'padding:0 4px', 'margin-left:6px',
  ].join(';');
  dismiss.addEventListener('click', (ev) => {
    ev.stopPropagation();
    unmount();
  });
  banner.appendChild(dismiss);

  banner.addEventListener('click', () => {
    showAuthScreen({
      googleClientId: opts.googleClientId,
      onAuthSuccess: opts.onAuthSuccess,
    });
  });

  document.body.appendChild(banner);

  // Auto-unmount on auth success.
  const onAuth = () => unmount();
  window.addEventListener('andura:authsuccess', onAuth);

  function unmount() {
    window.removeEventListener('andura:authsuccess', onAuth);
    if (banner.parentNode) banner.parentNode.removeChild(banner);
  }

  return { unmount };
}

// ── internals ───────────────────────────────────────────────────────────

function _readPendingEmail() {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(PENDING_EMAIL_KEY) : null; }
  catch { return null; }
}

function _writePendingEmail(value) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (value) localStorage.setItem(PENDING_EMAIL_KEY, value);
    else localStorage.removeItem(PENDING_EMAIL_KEY);
  } catch {}
}

// Strip auth params from URL post-success so refresh doesn't re-trigger
// verifyMagicLink (oobCode is single-use; second attempt would error).
function _cleanCallbackUrl() {
  try {
    if (typeof window === 'undefined' || !window.history?.replaceState) return;
    const cleanPath = '/';
    window.history.replaceState({}, document.title, cleanPath);
  } catch {}
}

function _toast(msg, color) {
  if (typeof window !== 'undefined' && typeof window.toast === 'function') {
    window.toast(msg, color);
    return;
  }
  console.log('[Auth]', msg);
}
