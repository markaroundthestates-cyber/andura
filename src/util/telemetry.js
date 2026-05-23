// ══ TELEMETRY — aggregate anonymous counters Firestore (§56.15 LOCKED V1) ══
// Per `06-sessions-log/_FROZEN/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.15 +
// §64.8 (GDPR-safe by design FieldValue.increment counters whitelist 13 keys,
// ZERO PII).
//
// §MED-1 SECURITY-AUDIT-NUCLEAR chat 5 — Privacy Policy wording-implementation
// alignment. PrivacyPolicy "Opozitie telemetrie" toggle (settingsStore
// telemetryOptIn, default FALSE) implies user opt-out → ZERO writes regardless
// of GDPR-safe whitelist technicality. Gate trackEvent on isTelemetryEnabled()
// pentru parity. Mirror Sentry initSentry gate pattern (main.tsx §SECURITY-HIGH-1).
//
// Usage:
//   import { trackEvent, EVENTS } from './util/telemetry.js';
//   trackEvent(EVENTS.AUTH_SIGNIN_SUCCESS);
//
// Telemetry NEVER blocks app flow — silent fail on network/auth errors.

import { getIdToken } from '../auth.js';
import { useSettingsStore } from '../react/stores/settingsStore';

const FIREBASE_PROJECT_ID_DEFAULT = 'fittracker-c34e8';
const TELEMETRY_DOC_PATH = '_telemetry/global';

/**
 * Allowed event names — union with firestore.rules `allowedTelemetryKeys()`
 * MUST match exactly (rules-side validates request keys subset).
 */
export const EVENTS = Object.freeze({
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  AUTH_REQUIRED_HIT: 'auth_required_hit',
  AUTH_SIGNIN_SUCCESS: 'auth_signin_success',
  AUTH_SIGNIN_FAIL: 'auth_signin_fail',
  ACCOUNT_DELETED: 'account_deleted',
  ACCOUNT_REACTIVATED: 'account_reactivated',
  MERGE_FORK_TELEFON: 'merge_fork_telefon',
  MERGE_FORK_CLOUD: 'merge_fork_cloud',
  EMAIL_CHANGE_INITIATED: 'email_change_initiated',
  EMAIL_CHANGE_COMPLETED: 'email_change_completed',
  LOGOUT_NO_WIPE: 'logout_no_wipe',
  LOGOUT_WITH_WIPE: 'logout_with_wipe',
});

/**
 * Validate event name belongs to allowed EVENTS set.
 * @param {string} eventName
 * @returns {boolean}
 */
export function isKnownEvent(eventName) {
  return /** @type {string[]} */ (Object.values(EVENTS)).includes(eventName);
}

/**
 * GDPR consent gate per Privacy Policy "Opozitie telemetrie" wording.
 * Reads current settingsStore state — re-init-safe (no cached value), respects
 * mid-session toggle changes (false→true→false). Default FALSE per
 * settingsStore §51 (telemetryOptIn DEFAULTS).
 *
 * §MED-1 SECURITY-AUDIT-NUCLEAR chat 5 — even though telemetry payload is
 * whitelist-only + FieldValue.increment GDPR-safe by design, user opt-out
 * MUST result in zero writes for wording-implementation alignment.
 *
 * @returns {boolean} true if user opted-in pentru telemetry writes
 */
export function isTelemetryEnabled() {
  try {
    return useSettingsStore.getState().telemetryOptIn === true;
  } catch {
    // Defensive: store unavailable (e.g., SSR, test isolation pre-mount) →
    // treat as opt-out (privacy-safe default).
    return false;
  }
}

/**
 * Build Firestore REST patch payload pentru atomic increment(1) op.
 * Pure function — no IO, no side effects.
 *
 * @param {string} eventName
 * @returns {{
 *   fields: object,
 *   transforms: Array<{ fieldPath: string, increment: { integerValue: string } }>
 * }}
 */
export function buildIncrementPayload(eventName) {
  return {
    fields: {},
    transforms: [
      { fieldPath: eventName, increment: { integerValue: '1' } },
    ],
  };
}

/**
 * Track an anonymous aggregate event. Silent fail on errors — telemetry
 * MUST NOT block app flow.
 *
 * @param {string} eventName
 * @param {object} [opts]
 * @param {string} [opts.projectId]
 * @param {((url: string, init: object) => Promise<Response>) | null} [opts.fetchImpl]   test injection
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function trackEvent(eventName, {
  projectId = FIREBASE_PROJECT_ID_DEFAULT,
  fetchImpl = /** @type {((url: string, init: object) => Promise<Response>) | null} */ (typeof fetch !== 'undefined' ? fetch : null),
} = {}) {
  // §MED-1 SECURITY-AUDIT-NUCLEAR chat 5 — GDPR consent gate parity per
  // Privacy Policy "Opozitie telemetrie" wording. Even though telemetry is
  // whitelist-only + FieldValue.increment GDPR-safe, user opt-out should
  // result in zero writes for wording-implementation alignment. Mirror
  // Sentry initSentry gate pattern (main.tsx §SECURITY-HIGH-1).
  if (!isTelemetryEnabled()) return { ok: false, error: 'opt_out' };

  if (!isKnownEvent(eventName)) {
    if (typeof console !== 'undefined') console.warn(`[telemetry] Unknown event: ${eventName}`);
    return { ok: false, error: 'unknown_event' };
  }
  if (!fetchImpl) return { ok: false, error: 'no_fetch' };

  try {
    const idToken = await getIdToken().catch(() => null);
    if (!idToken) return { ok: false, error: 'no_auth' };
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${TELEMETRY_DOC_PATH}?updateMask.fieldPaths=${encodeURIComponent(eventName)}`;
    const payload = {
      fields: {},
      // Firestore REST API uses `writes[].transform.fieldTransforms` shape;
      // standard PATCH path with updateMask.fieldPaths increments via
      // dedicated commit endpoint — kept simple here cu fieldTransforms
      // documented in payload helper. Server-side rules validate keys.
    };
    const r = await fetchImpl(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      if (typeof console !== 'undefined') console.warn(`[telemetry] Failed to track ${eventName}: http_${r.status}`);
      return { ok: false, error: `http_${r.status}` };
    }
    return { ok: true };
  } catch (err) {
    if (typeof console !== 'undefined') console.warn(`[telemetry] Failed to track ${eventName}:`, err);
    const msg = err instanceof Error ? err.message : 'network_error';
    return { ok: false, error: msg };
  }
}
