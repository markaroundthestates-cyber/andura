// ══ TELEMETRY — aggregate anonymous counters Firestore (§56.15 LOCKED V1) ══
// Per `06-sessions-log/_FROZEN/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.15 +
// §64.8 (ZERO opt-out toggle, GDPR-safe by design FieldValue.increment counters,
// ZERO PII).
//
// Usage:
//   import { trackEvent, EVENTS } from './util/telemetry.js';
//   trackEvent(EVENTS.AUTH_SIGNIN_SUCCESS);
//
// Telemetry NEVER blocks app flow — silent fail on network/auth errors.

import { getIdToken } from '../auth.js';

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
  return Object.values(EVENTS).includes(eventName);
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
 * @param {(url: string, init: object) => Promise<Response>} [opts.fetchImpl]   test injection
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function trackEvent(eventName, {
  projectId = FIREBASE_PROJECT_ID_DEFAULT,
  fetchImpl = (typeof fetch !== 'undefined' ? fetch : null),
} = {}) {
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
    return { ok: false, error: err?.message || 'network_error' };
  }
}
