import { describe, it, expect, vi } from 'vitest';
import { EVENTS, isKnownEvent, buildIncrementPayload, trackEvent } from '../telemetry.js';

describe('§56.15 EVENTS — allowed keys subset (sync cu firestore.rules)', () => {
  const expectedKeys = [
    'onboarding_started', 'onboarding_completed',
    'auth_required_hit', 'auth_signin_success', 'auth_signin_fail',
    'account_deleted', 'account_reactivated',
    'merge_fork_telefon', 'merge_fork_cloud',
    'email_change_initiated', 'email_change_completed',
    'logout_no_wipe', 'logout_with_wipe',
  ];
  it('EVENTS values match firestore.rules allowedTelemetryKeys exact', () => {
    expect(Object.values(EVENTS).sort()).toEqual(expectedKeys.sort());
  });
  it('EVENTS frozen', () => {
    expect(Object.isFrozen(EVENTS)).toBe(true);
  });
});

describe('isKnownEvent', () => {
  it('known event → true', () => {
    expect(isKnownEvent(EVENTS.AUTH_SIGNIN_SUCCESS)).toBe(true);
  });
  it('unknown event → false', () => {
    expect(isKnownEvent('random_event')).toBe(false);
  });
});

describe('buildIncrementPayload', () => {
  it('returns Firestore-shape payload cu fieldTransforms increment(1)', () => {
    const p = buildIncrementPayload(EVENTS.MERGE_FORK_TELEFON);
    expect(p.transforms).toEqual([
      { fieldPath: 'merge_fork_telefon', increment: { integerValue: '1' } },
    ]);
  });
});

describe('trackEvent — silent fail (telemetry MUST NOT block app flow)', () => {
  it('unknown event returns ok=false NU throws', async () => {
    const r = await trackEvent('not_an_event');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('unknown_event');
  });

  it('no fetch impl → returns ok=false', async () => {
    const r = await trackEvent(EVENTS.ONBOARDING_STARTED, { fetchImpl: null });
    expect(r.ok).toBe(false);
  });

  it('network fail → returns ok=false NU throws', async () => {
    const fetchImpl = vi.fn(async () => { throw new Error('network error'); });
    const r = await trackEvent(EVENTS.AUTH_SIGNIN_SUCCESS, { fetchImpl });
    expect(r.ok).toBe(false);
    // Either no_auth (no token) or network_error — both acceptable silent fail
    expect(['no_auth', 'network_error']).toContain(r.error);
  });

  it('non-ok HTTP response → ok=false silent', async () => {
    // Mock auth state cu expiry > 60s default skew so getIdToken nu trigger refresh
    localStorage.setItem('firebase-id-token', 'fake-token');
    localStorage.setItem('firebase-uid', 'fake-uid');
    localStorage.setItem('firebase-id-token-expiry', String(Date.now() + 5 * 60_000));
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 403 }));
    const r = await trackEvent(EVENTS.LOGOUT_NO_WIPE, { fetchImpl });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('http_403');
    localStorage.clear();
  });
});
