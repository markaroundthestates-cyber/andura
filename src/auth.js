// ══ FIREBASE AUTH — REST endpoints (per ADR 002 + ADR_MULTI_TENANT_AUTH_v1) ═
// Goal: replace anonymous `users/daniel` literal with auth-resolved
// `users/{uid}` paths. Email Magic Link primary; Google OAuth via
// `accounts:signInWithIdp` REST endpoint (id_token from Google → Firebase).
//
// Storage layout (localStorage):
//   firebase-id-token           ID token (1h TTL, refresh via refresh token)
//   firebase-uid                Firebase user uid (stable)
//   firebase-refresh-token      Refresh token (long-lived)
//   firebase-id-token-expiry    Unix ms expiry (for proactive refresh)
//   firebase-magic-link-email          Pending email awaiting magic link verification
//   firebase-magic-link-email-expiry   §4-H2 audit fix — TTL expiry timestamp (1h after sendMagicLink)
//
// Per-uid path migration runs ONCE post first auth (see migrations/
// 2026-05-02-auth-path-migration.js).

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_BASE = 'https://securetoken.googleapis.com/v1';

// Web API key (public, embeddable per Firebase docs — not a secret).
// §4-C2 audit fix — VITE_FIREBASE_API_KEY env var preferred (build-time inject);
// preserves window.__FIREBASE_API_KEY runtime fallback + PLACEHOLDER final default.
// Daniel: set VITE_FIREBASE_API_KEY in deploy env OR replace placeholder pre-launch
// publish (per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02).
export const FIREBASE_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY)
  || (typeof window !== 'undefined' && window.__FIREBASE_API_KEY)
  || 'PLACEHOLDER_WEB_API_KEY';

// §B011 audit fix (CODE-REVIEW L-1) — startup assert: fail fast dacă placeholder
// leaked în prod build. Iter 9.5 lesson (D040): silent fallback masked broken
// Magic Link weeks. Visible boot-time error > silent 400s downstream.
if (FIREBASE_API_KEY === 'PLACEHOLDER_WEB_API_KEY') {
  const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD === true;
  const msg = '[auth] FIREBASE_API_KEY = PLACEHOLDER_WEB_API_KEY — Magic Link will fail. Set VITE_FIREBASE_API_KEY build env var (per D040 deploy.yml injection).';
  if (isProd) {
    throw new Error(msg);
  }
  if (typeof console !== 'undefined') console.warn(msg);
}

// Storage keys (single source of truth, used in tests + signOut).
export const AUTH_STORAGE_KEYS = Object.freeze({
  idToken:            'firebase-id-token',
  uid:                'firebase-uid',
  refreshToken:       'firebase-refresh-token',
  expiry:             'firebase-id-token-expiry',
  pendingEmail:       'firebase-magic-link-email',
  pendingEmailExpiry: 'firebase-magic-link-email-expiry', // §4-H2 audit fix — TTL anti-stale pendingEmail
  lastMagicLinkSent:  'firebase-magic-link-last-sent',    // §4-H3 audit fix — throttle timestamp
  lastAuthAt:         'firebase-last-auth-at',            // §A016 audit fix — re-auth freshness gate
});

// §4-H2 audit fix — pendingEmail TTL window after sendMagicLink. Stale values
// auto-cleared on next getPendingEmail() read. Mitigates shared-device leak
// (attacker w/ later access can't enumerate prior magic-link recipients).
export const PENDING_EMAIL_TTL_MS = 60 * 60 * 1000; // 1 hour

// §4-H3 audit fix — minimum interval between sendMagicLink attempts (anti-spam,
// anti-quota-exhaustion). Firebase Identity Toolkit quota lockout legitimate users
// dacă attacker spams. UI button disabled state via getMagicLinkCooldownMs().
export const MAGIC_LINK_THROTTLE_MS = 30 * 1000; // 30 seconds

// §A016 audit fix — recent-auth freshness window for destructive actions
// (account-delete, sensitive cont changes). Token may be valid 1h dar action
// destructiv cere proof-of-presence recent → require re-auth dacă > window.
export const AUTH_FRESHNESS_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// ── Magic Link flow ─────────────────────────────────────────────────────

/**
 * Send a sign-in email to `email`. The email contains a magic link that
 * lands the user back on `continueUrl` with `?oobCode=...&email=...`.
 *
 * Per §56.13.1 LOCKED V1: network failure mid-request → auto-retry **3x**
 * background cu exponential backoff (250/500/1000 ms). Persistent fail
 * surfaces clean error la caller pentru "Reincearca" manual fallback UI.
 *
 * @param {string} email
 * @param {string} [continueUrl] - default: `${window.location.origin}/auth-callback`
 * @returns {Promise<{ ok: boolean, email?: string, error?: string, cooldownMs?: number }>}
 */
export async function sendMagicLink(email, continueUrl) {
  if (!_isValidEmail(email)) return { ok: false, error: 'invalid_email' };
  // §4-H3 audit fix — 30s throttle between send attempts (anti-spam + anti-quota-exhaustion).
  const cooldownMs = getMagicLinkCooldownMs();
  if (cooldownMs > 0) return { ok: false, error: 'throttle_cooldown', cooldownMs };
  // §A018-FIX code-review MEDIUM: timestamp set POST-fetch-success only —
  // anterior set pre-fetch blocking user pentru 30s pe transient network fail
  // (recovery impossible until cooldown expire). Now: failed send = retry-able.
  const url = `${AUTH_BASE}/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
  const body = {
    requestType: 'EMAIL_SIGNIN',
    email,
    continueUrl: continueUrl || `${_origin()}/auth-callback`,
    canHandleCodeInApp: true,
  };

  // Per §56.13: max 3 attempts (1 initial + 2 retries) cu backoff 250/500ms.
  // Retry only on network errors (caught exception) sau HTTP 5xx. NU retry
  // pe 4xx (invalid email, quota, etc — failures deterministic).
  const MAX_ATTEMPTS = 3;
  const BACKOFF_MS = [250, 500];
  let lastError = 'network_error';

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        _setItem(AUTH_STORAGE_KEYS.pendingEmail, email);
        _setItem(AUTH_STORAGE_KEYS.pendingEmailExpiry, String(Date.now() + PENDING_EMAIL_TTL_MS)); // §4-H2 audit fix
        _setItem(AUTH_STORAGE_KEYS.lastMagicLinkSent, String(Date.now())); // §A018-FIX throttle post-success
        return { ok: true, email };
      }
      // 4xx = deterministic failure, NU retry (per §56.13 retry semantic).
      // 5xx = transient, retry.
      const data = await r.json().catch(() => ({}));
      lastError = data?.error?.message || `http_${r.status}`;
      if (r.status < 500) return { ok: false, error: lastError };
    } catch (err) {
      lastError = (err instanceof Error ? err.message : null) || 'network_error';
    }
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise(resolve => setTimeout(resolve, BACKOFF_MS[attempt] ?? 250));
    }
  }
  return { ok: false, error: lastError };
}

/**
 * Complete the magic-link sign-in. Call on `auth-callback` route with the
 * `oobCode` from the URL and the `email` either from the URL or the
 * pending-email cache (set by `sendMagicLink`).
 *
 * @param {string} email
 * @param {string} oobCode
 * @returns {Promise<{ ok: boolean, uid?: string, error?: string }>}
 */
export async function verifyMagicLink(email, oobCode) {
  if (!email || !oobCode) return { ok: false, error: 'missing_input' };
  const url = `${AUTH_BASE}/accounts:signInWithEmailLink?key=${FIREBASE_API_KEY}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, oobCode }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.idToken) {
      return { ok: false, error: data?.error?.message || `http_${r.status}` };
    }
    _persistAuth(data);
    _removeItem(AUTH_STORAGE_KEYS.pendingEmail);
    _removeItem(AUTH_STORAGE_KEYS.pendingEmailExpiry); // §4-H2 audit fix
    return { ok: true, uid: data.localId };
  } catch (err) {
    return { ok: false, error: (err instanceof Error ? err.message : null) || 'network_error' };
  }
}

/**
 * Helper for clients that already received the magic-link URL — extracts
 * `oobCode` and `email` (if encoded) from the query string.
 *
 * @param {string} [search] - default: window.location.search
 * @returns {{ oobCode: string|null, email: string|null }}
 */
export function parseMagicLinkUrl(search) {
  const q = typeof search === 'string' ? search : (typeof window !== 'undefined' ? window.location.search : '');
  if (!q) return { oobCode: null, email: null };
  try {
    const params = new URLSearchParams(q.startsWith('?') ? q.slice(1) : q);
    return { oobCode: params.get('oobCode'), email: params.get('email') };
  } catch {
    return { oobCode: null, email: null };
  }
}

// ── Google OAuth (signInWithIdp) ────────────────────────────────────────

/**
 * Build the Google OAuth URL. Caller redirects the browser to it; Google
 * round-trips back to `continueUrl` with `id_token` in the URL fragment.
 *
 * NOTE: requires a Google OAuth Client ID configured in Firebase Console →
 * Authentication → Sign-in providers → Google. Daniel sets this once
 * pre-launch (see ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-02).
 *
 * @param {string} googleClientId
 * @param {string} [continueUrl] - default: `${window.location.origin}/auth-callback`
 * @returns {string} URL to redirect to
 */
export function buildGoogleSignInUrl(googleClientId, continueUrl) {
  if (!googleClientId) throw new Error('googleClientId required');
  const redirect = continueUrl || `${_origin()}/auth-callback`;
  // §B019 audit fix (CODE-REVIEW L-9) — CSPRNG nonce (16 bytes hex = 32 char).
  // Node 20+ + browser + jsdom = crypto global. Replaces Math.random ~4 byte entropy.
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(nonceBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirect,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange a Google `id_token` (from the redirect fragment) for Firebase
 * Auth credentials via the `accounts:signInWithIdp` REST endpoint.
 *
 * @param {string} googleIdToken
 * @returns {Promise<{ ok: boolean, uid?: string, error?: string }>}
 */
export async function signInWithGoogleIdToken(googleIdToken) {
  if (!googleIdToken) return { ok: false, error: 'missing_id_token' };
  const url = `${AUTH_BASE}/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
        requestUri: _origin(),
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.idToken) {
      return { ok: false, error: data?.error?.message || `http_${r.status}` };
    }
    _persistAuth(data);
    return { ok: true, uid: data.localId };
  } catch (err) {
    return { ok: false, error: (err instanceof Error ? err.message : null) || 'network_error' };
  }
}

// ── Token state / refresh ───────────────────────────────────────────────

/**
 * Read current auth state. Returns null if no auth or token expired and
 * no refresh token available.
 *
 * @returns {{ uid: string, idToken: string, expiry: number }|null}
 */
export function getAuthState() {
  const uid = _getItem(AUTH_STORAGE_KEYS.uid);
  const idToken = _getItem(AUTH_STORAGE_KEYS.idToken);
  if (!uid || !idToken) return null;
  const expiry = Number(_getItem(AUTH_STORAGE_KEYS.expiry)) || 0;
  return { uid, idToken, expiry };
}

/**
 * Return current ID token, refreshing proactively if within `skewMs` of
 * expiry. `skewMs` defaults to 60s.
 *
 * @param {number} [skewMs=60000]
 * @returns {Promise<string|null>}
 */
export async function getIdToken(skewMs = 60_000) {
  const auth = getAuthState();
  if (!auth) return null;
  const now = Date.now();
  if (auth.expiry && (auth.expiry - now) > skewMs) return auth.idToken;
  // Stale or near-stale → refresh.
  const refreshed = await refreshIdToken();
  return refreshed.ok && refreshed.idToken ? refreshed.idToken : null;
}

/**
 * Force-refresh the ID token using the stored refresh token.
 *
 * @returns {Promise<{ ok: boolean, idToken?: string, error?: string }>}
 */
export async function refreshIdToken() {
  const refreshToken = _getItem(AUTH_STORAGE_KEYS.refreshToken);
  if (!refreshToken) return { ok: false, error: 'no_refresh_token' };
  const url = `${TOKEN_BASE}/token?key=${FIREBASE_API_KEY}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.id_token) {
      return { ok: false, error: data?.error?.message || `http_${r.status}` };
    }
    // Token endpoint returns snake_case fields.
    _persistAuth({
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      localId: data.user_id || _getItem(AUTH_STORAGE_KEYS.uid),
      expiresIn: data.expires_in,
    });
    return { ok: true, idToken: data.id_token };
  } catch (err) {
    return { ok: false, error: (err instanceof Error ? err.message : null) || 'network_error' };
  }
}

/**
 * Sign out — clears all stored auth tokens. Triggers an `andura:signedout`
 * window event so the UI can re-route.
 */
export function signOut() {
  _removeItem(AUTH_STORAGE_KEYS.idToken);
  _removeItem(AUTH_STORAGE_KEYS.uid);
  _removeItem(AUTH_STORAGE_KEYS.refreshToken);
  _removeItem(AUTH_STORAGE_KEYS.expiry);
  _removeItem(AUTH_STORAGE_KEYS.pendingEmail);
  _removeItem(AUTH_STORAGE_KEYS.pendingEmailExpiry); // §4-H2 audit fix
  _removeItem(AUTH_STORAGE_KEYS.lastMagicLinkSent);  // §4-H3 audit fix — allow immediate Magic Link re-login post signOut
  _removeItem(AUTH_STORAGE_KEYS.lastAuthAt);         // §A016 audit fix — clear freshness marker on sign out
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try { window.dispatchEvent(new Event('andura:signedout')); } catch {}
  }
}

/**
 * §4-H3 audit fix — returns ms remaining until next sendMagicLink call allowed,
 * or 0 if no active cooldown. UI button can disable + show countdown.
 *
 * @returns {number} milliseconds remaining (0 = no cooldown)
 */
export function getMagicLinkCooldownMs() {
  const lastSent = Number(_getItem(AUTH_STORAGE_KEYS.lastMagicLinkSent));
  if (!Number.isFinite(lastSent) || lastSent <= 0) return 0;
  const elapsed = Date.now() - lastSent;
  if (elapsed >= MAGIC_LINK_THROTTLE_MS) return 0;
  return MAGIC_LINK_THROTTLE_MS - elapsed;
}

/**
 * §4-H2 audit fix — read pendingEmail honoring TTL window. Returns email
 * if `pendingEmailExpiry` > now, else clears both keys + returns null.
 * Migrates legacy entries lacking expiry by treating them as stale.
 *
 * @returns {string|null}
 */
export function getPendingEmail() {
  const email = _getItem(AUTH_STORAGE_KEYS.pendingEmail);
  if (!email) return null;
  const expiry = Number(_getItem(AUTH_STORAGE_KEYS.pendingEmailExpiry));
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    _removeItem(AUTH_STORAGE_KEYS.pendingEmail);
    _removeItem(AUTH_STORAGE_KEYS.pendingEmailExpiry);
    return null;
  }
  return email;
}

/**
 * Returns true if there's an authenticated user (auth state present, even
 * if token is stale but refreshable).
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getAuthState() !== null;
}

// ── internals ───────────────────────────────────────────────────────────

/** @param {Record<string, any>} data */
function _persistAuth(data) {
  // Firebase identitytoolkit returns: { idToken, refreshToken, localId, expiresIn }
  // expiresIn is seconds (string in REST response).
  if (data.idToken) _setItem(AUTH_STORAGE_KEYS.idToken, data.idToken);
  if (data.refreshToken) _setItem(AUTH_STORAGE_KEYS.refreshToken, data.refreshToken);
  if (data.localId) _setItem(AUTH_STORAGE_KEYS.uid, data.localId);
  const expiresInSec = Number(data.expiresIn);
  if (Number.isFinite(expiresInSec) && expiresInSec > 0) {
    _setItem(AUTH_STORAGE_KEYS.expiry, String(Date.now() + expiresInSec * 1000));
  }
  // §A016 audit fix — track last fresh auth event for destructive action gate.
  _setItem(AUTH_STORAGE_KEYS.lastAuthAt, String(Date.now()));
}

/**
 * §A016 audit fix — checks whether the user's auth event is within freshness
 * window for destructive actions. Returns true daca lastAuthAt found AND
 * Date.now() - lastAuthAt <= AUTH_FRESHNESS_WINDOW_MS. False altfel (stale or
 * missing → caller must trigger re-Magic-Link flow).
 *
 * @returns {boolean}
 */
export function isAuthFresh() {
  const lastAuthAt = Number(_getItem(AUTH_STORAGE_KEYS.lastAuthAt));
  if (!Number.isFinite(lastAuthAt) || lastAuthAt <= 0) return false;
  return (Date.now() - lastAuthAt) <= AUTH_FRESHNESS_WINDOW_MS;
}

/** @param {unknown} s */
function _isValidEmail(s) {
  if (typeof s !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function _origin() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'https://andura.local';
}

/** @param {string} k */
function _getItem(k) {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null; }
  catch { return null; }
}

/** @param {string} k @param {string} v */
function _setItem(k, v) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); }
  catch {}
}

/** @param {string} k */
function _removeItem(k) {
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); }
  catch {}
}

// ── §56.5.3 Reactivation flow — USER_DISABLED catching ─────────────────────

/**
 * Wording UI LOCKED V1 verbatim — DO NOT modify (anti-drift §56.5.3).
 * Display when Firebase Auth REST returns USER_DISABLED error code post
 * Magic Link verify SAU Google OAuth signin.
 */
export const USER_DISABLED_COPY
  = 'Acest cont este dezactivat si programat pentru stergere definitiva. Daca te-ai razgandit si vrei sa il reactivezi, trimite un e-mail la suport@andura.app in termenul de 30 de zile de la solicitare.';

/**
 * Returns true if the auth REST error string indicates USER_DISABLED.
 * Firebase REST error codes can be `USER_DISABLED` exact sau cu suffix.
 *
 * @param {string|null|undefined} errorCode
 * @returns {boolean}
 */
export function isUserDisabledError(errorCode) {
  if (typeof errorCode !== 'string') return false;
  return errorCode === 'USER_DISABLED' || errorCode.startsWith('USER_DISABLED');
}

// ── §56.5.2 Account soft-delete — flag schema ──────────────────────────────

/**
 * Build soft-delete flag payload (Firestore document field).
 * 30 zile grace per §56.5.2 LOCKED V1.
 *
 * @param {number} [now=Date.now()]
 * @returns {{ requestedAt: number, scheduledHardDelete: number }}
 */
export function buildSoftDeleteFlag(now = Date.now()) {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  return {
    requestedAt: now,
    scheduledHardDelete: now + THIRTY_DAYS_MS,
  };
}

// ── §56.7 Anonymous→Auth Merge — detection helpers (pure) ─────────────────

/**
 * Detect whether anonymous local IndexedDB has user data.
 * Pure helper — caller injects probe (real impl: tier1All non-empty count).
 *
 * @param {() => Promise<boolean>} probe   async non-empty checker
 * @returns {Promise<boolean>}
 */
export async function detectAnonymousLocalData(probe) {
  if (typeof probe !== 'function') return false;
  try { return Boolean(await probe()); } catch { return false; }
}

/**
 * Detect whether cloud user data exists at users/{authUid}.
 * Pure helper — caller injects probe (real impl: Firestore document exists).
 *
 * @param {() => Promise<boolean>} probe   async non-empty checker
 * @returns {Promise<boolean>}
 */
export async function detectCloudUserData(probe) {
  if (typeof probe !== 'function') return false;
  try { return Boolean(await probe()); } catch { return false; }
}
