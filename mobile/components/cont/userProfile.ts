// ══ USER PROFILE — read-only display helper (RN port, W6a) ════════════════
// RN twin of src/react/routes/screens/cont/userProfile.ts. SAME contract +
// SAME logic (decode the id_token JWT payload → name/email/initial, graceful
// EMPTY_PROFILE fallback). The ONLY change vs the web source: the web file
// imports AUTH_STORAGE_KEYS from `src/auth.js`, which still uses `import.meta`
// (web env-shim not applied there yet) and therefore cannot be required under
// Metro native / jest. We INLINE the single key constant ('firebase-id-token')
// and read it through the kv adapter (web localStorage / RN MMKV) so this is
// native-safe AND test-safe. The decode/fallback is byte-identical to the web.
//
// NOTE: native auth wiring (Magic Link → token storage through kv) is W-Final;
// until then RN native simply has no token → EMPTY_PROFILE (the same honest
// fallback the web shows when unauthenticated). On Expo web export the token
// (if present in localStorage) is read exactly as on the PWA.

import { kv } from '../../../src/storage/kv';

// Inlined from src/auth.js AUTH_STORAGE_KEYS.idToken (avoids importing auth.js
// — its top-level `import.meta` breaks Metro/jest). Single source still the web
// constant; this mirror is read-only display.
const ID_TOKEN_KEY = 'firebase-id-token';

export interface UserProfileDisplay {
  name: string;
  email: string;
  initial: string;
}

const EMPTY_PROFILE: UserProfileDisplay = { name: '', email: '', initial: 'A' };

/** Decode JWT payload (middle segment). Base64url → JSON. null on malformed. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = typeof atob !== 'undefined' ? atob(padded) : '';
    if (!decoded) return null;
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Read user profile for the Cont tab display. Pure — EMPTY_PROFILE fallback. */
export function getUserProfileDisplay(): UserProfileDisplay {
  const idToken = kv.getItem(ID_TOKEN_KEY);
  if (!idToken) return EMPTY_PROFILE;

  const claims = decodeJwtPayload(idToken);
  if (!claims) return EMPTY_PROFILE;

  const email = typeof claims.email === 'string' ? claims.email : '';
  const name =
    typeof claims.name === 'string' && claims.name.length > 0 ? claims.name : email.split('@')[0] ?? '';
  const initial = (name || email || 'A').charAt(0).toUpperCase() || 'A';

  return { name, email, initial };
}
