// ══ USER PROFILE — read-only display helper (HIGH-BETA §F-cont-01/02/03) ══
// Phase 6+ user-wire fix per RECON_HIGH_OPEN_chat-4 cluster HIGH-BETA:
// avatar initial + name + email display in Cont tab. Firebase Magic Link
// pendingEmail clears post verifyMagicLink (auth.js L169) — id_token JWT
// payload is the surviving source for email + uid.
//
// JWT payload decode is read-only (display-only). Token signature validation
// remains the Firebase REST endpoint responsibility on each authenticated
// request — this helper does NOT trust the JWT for security decisions.
//
// Karpathy SF: minimum code that solves the problem. No JWT signing/verify.
// Surgical: 4 lines + base64url decode. No external deps.

import { AUTH_STORAGE_KEYS } from '../../../../auth.js';

export interface UserProfileDisplay {
  /** Display name — falls back to email prefix or empty string. */
  name: string;
  /** Email from id_token claims (verified by Firebase at issuance). */
  email: string;
  /** Single-character avatar initial uppercase (falls back to 'A'). */
  initial: string;
}

const EMPTY_PROFILE: UserProfileDisplay = { name: '', email: '', initial: 'A' };

/**
 * Decode JWT payload (middle segment). Base64url → JSON.
 * Returns null on malformed input — caller falls back to EMPTY_PROFILE.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    // base64url → base64 (replace -/_, pad =)
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Read user profile for Cont tab display. Pure function — no side effects.
 * Returns EMPTY_PROFILE fallback when unauthenticated or token malformed.
 *
 * Source: firebase-id-token JWT payload contains standard claims
 *   - `email` (Magic Link sign-in always sets this)
 *   - `name` (Google OAuth sets this; Magic Link returns empty → fallback)
 */
export function getUserProfileDisplay(): UserProfileDisplay {
  let idToken: string | null = null;
  try {
    if (typeof localStorage === 'undefined') return EMPTY_PROFILE;
    idToken = localStorage.getItem(AUTH_STORAGE_KEYS.idToken);
  } catch {
    return EMPTY_PROFILE;
  }
  if (!idToken) return EMPTY_PROFILE;

  const claims = decodeJwtPayload(idToken);
  if (!claims) return EMPTY_PROFILE;

  const email = typeof claims.email === 'string' ? claims.email : '';
  // §F-cont-02 fallback: prefer JWT `name` claim (Google OAuth); else email
  // prefix (Magic Link path). Avoids generic "Utilizator" placeholder.
  const name = typeof claims.name === 'string' && claims.name.length > 0
    ? claims.name
    : (email.split('@')[0] ?? '');
  const initial = (name || email || 'A').charAt(0).toUpperCase() || 'A';

  return { name, email, initial };
}
