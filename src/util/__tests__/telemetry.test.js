import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EVENTS, isKnownEvent, buildIncrementPayload, trackEvent, isTelemetryEnabled } from '../telemetry.js';
import { useSettingsStore } from '../../react/stores/settingsStore';

// §MED-1 SECURITY-AUDIT-NUCLEAR chat 5 — trackEvent now gated on
// telemetryOptIn (default FALSE). Existing path tests need opt-in TRUE pre-test
// pentru a exersa cod post-gate. Reset post-test mentine izolare.
beforeEach(() => {
  useSettingsStore.getState().reset();
  useSettingsStore.getState().setTelemetryOptIn(true);
});

afterEach(() => {
  useSettingsStore.getState().reset();
});

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

// §MED-1 SECURITY-AUDIT-NUCLEAR chat 5 — GDPR consent gate parity per
// Privacy Policy "Opozitie telemetrie" wording. trackEvent MUST return
// early cu zero writes cand telemetryOptIn=false. Mirror Sentry gate
// pattern (main.tsx §SECURITY-HIGH-1). Tests verifica gate + toggle parity.
describe('§MED-1 trackEvent — telemetryOptIn consent gate parity', () => {
  it('isTelemetryEnabled default FALSE per settingsStore §51 DEFAULTS', () => {
    useSettingsStore.getState().reset();
    expect(isTelemetryEnabled()).toBe(false);
  });

  it('isTelemetryEnabled TRUE dupa setTelemetryOptIn(true)', () => {
    useSettingsStore.getState().reset();
    useSettingsStore.getState().setTelemetryOptIn(true);
    expect(isTelemetryEnabled()).toBe(true);
  });

  it('trackEvent cu telemetryOptIn=FALSE → ok=false + error=opt_out, ZERO fetch', async () => {
    useSettingsStore.getState().reset(); // opt-in default FALSE
    const fetchImpl = vi.fn();
    const r = await trackEvent(EVENTS.AUTH_SIGNIN_SUCCESS, { fetchImpl });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('opt_out');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('trackEvent cu telemetryOptIn=TRUE → fetch invocat (gate pass)', async () => {
    useSettingsStore.getState().reset();
    useSettingsStore.getState().setTelemetryOptIn(true);
    localStorage.setItem('firebase-id-token', 'fake-token');
    localStorage.setItem('firebase-uid', 'fake-uid');
    localStorage.setItem('firebase-id-token-expiry', String(Date.now() + 5 * 60_000));
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200 }));
    const r = await trackEvent(EVENTS.AUTH_SIGNIN_SUCCESS, { fetchImpl });
    expect(r.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    // Firestore PATCH endpoint contine fieldPath
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('auth_signin_success');
    expect(init.method).toBe('PATCH');
    localStorage.clear();
  });

  it('trackEvent gate respecta toggle mid-session TRUE→FALSE (re-init-safe)', async () => {
    useSettingsStore.getState().reset();
    useSettingsStore.getState().setTelemetryOptIn(true);
    localStorage.setItem('firebase-id-token', 'fake-token');
    localStorage.setItem('firebase-uid', 'fake-uid');
    localStorage.setItem('firebase-id-token-expiry', String(Date.now() + 5 * 60_000));
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200 }));

    // Prima chemare: opt-in TRUE → fetch invocat
    const r1 = await trackEvent(EVENTS.ONBOARDING_STARTED, { fetchImpl });
    expect(r1.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    // User revoca consent mid-session
    useSettingsStore.getState().setTelemetryOptIn(false);

    // A doua chemare: opt-in FALSE → ZERO fetch (gate blocheaza)
    const r2 = await trackEvent(EVENTS.ONBOARDING_COMPLETED, { fetchImpl });
    expect(r2.ok).toBe(false);
    expect(r2.error).toBe('opt_out');
    expect(fetchImpl).toHaveBeenCalledTimes(1); // unchanged

    localStorage.clear();
  });

  it('trackEvent gate respecta toggle mid-session FALSE→TRUE (opt-in lazy)', async () => {
    useSettingsStore.getState().reset(); // FALSE default
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200 }));

    // Prima chemare: opt-in FALSE → gate blocheaza
    const r1 = await trackEvent(EVENTS.AUTH_REQUIRED_HIT, { fetchImpl });
    expect(r1.error).toBe('opt_out');
    expect(fetchImpl).not.toHaveBeenCalled();

    // User opt-in via SettingsPrivacy toggle
    useSettingsStore.getState().setTelemetryOptIn(true);
    localStorage.setItem('firebase-id-token', 'fake-token');
    localStorage.setItem('firebase-uid', 'fake-uid');
    localStorage.setItem('firebase-id-token-expiry', String(Date.now() + 5 * 60_000));

    // A doua chemare: opt-in TRUE → fetch invocat (gate pass)
    const r2 = await trackEvent(EVENTS.AUTH_REQUIRED_HIT, { fetchImpl });
    expect(r2.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    localStorage.clear();
  });

  it('gate precedes isKnownEvent check — opt-out blocheaza chiar pentru unknown event', async () => {
    useSettingsStore.getState().reset();
    const r = await trackEvent('not_an_event');
    expect(r.error).toBe('opt_out'); // gate first, unknown_event nu se ajunge
  });
});
