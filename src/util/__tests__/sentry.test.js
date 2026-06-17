// §TEST-COVERAGE-GAP-CHAT5 — close sentry.js coverage gap 19.53% -> ≥80%.
// Existing sentryBeforeSend.test.js + sentryPiiStrip.test.js exercita scrubMsg
// regex pattern via source extraction (anti-drift) DAR NU executa codul real
// din initSentry (production guard + idempotent + Sentry.init invocation +
// beforeSend hook ca functie live + captureException scope dispatch).
//
// Acest test foloseste vi.mock('@sentry/browser') + vi.stubEnv pentru a
// trece production guard si a invoca initSentry pe codul real, capturand
// optiunile pasate la Sentry.init si executand beforeSend cu event mock.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Capture Sentry.init opts via mock — must declare BEFORE vi.mock call (hoisted).
let capturedInitOpts = null;
let capturedScope = null;
const mockSentryInit = vi.fn((opts) => {
  capturedInitOpts = opts;
});
const mockWithScope = vi.fn((cb) => {
  capturedScope = {
    tags: {},
    extras: {},
    setTag: vi.fn(function (k, v) { this.tags[k] = v; }),
    setExtra: vi.fn(function (k, v) { this.extras[k] = v; }),
  };
  capturedScope.setTag = capturedScope.setTag.bind(capturedScope);
  capturedScope.setExtra = capturedScope.setExtra.bind(capturedScope);
  cb(capturedScope);
});
const mockCaptureException = vi.fn();
const mockCaptureMessage = vi.fn();

vi.mock('@sentry/browser', () => ({
  init: mockSentryInit,
  withScope: mockWithScope,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
}));

const ORIGINAL_LOCATION = window.location;

function setHostname(hostname) {
  Object.defineProperty(window, 'location', {
    value: { ...ORIGINAL_LOCATION, hostname },
    writable: true,
    configurable: true,
  });
}

function restoreLocation() {
  Object.defineProperty(window, 'location', {
    value: ORIGINAL_LOCATION,
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  capturedInitOpts = null;
  capturedScope = null;
  mockSentryInit.mockClear();
  mockWithScope.mockClear();
  mockCaptureException.mockClear();
  mockCaptureMessage.mockClear();
  // Fresh module per test for _initialized state isolation.
  vi.resetModules();
  // Stub MODE so production guard NU short-circuit. Each test restores.
  vi.stubEnv('MODE', 'production');
});

afterEach(() => {
  restoreLocation();
  vi.unstubAllEnvs();
  // Clean window globals set by initSentry.
  delete window.Sentry;
  delete window.testSentry;
});

describe('initSentry — production guard branches', () => {
  it('early-returns pe localhost (NU porneste Sentry.init)', async () => {
    setHostname('localhost');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
  });

  it('early-returns pe 127.0.0.1 (NU porneste Sentry.init)', async () => {
    setHostname('127.0.0.1');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
  });

  it('early-returns cand MODE=test (Vitest default)', async () => {
    setHostname('andura.app');
    vi.stubEnv('MODE', 'test');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
  });

  it('porneste Sentry.init in production-like env (andura.app + MODE!=test)', async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    expect(mockSentryInit).toHaveBeenCalledTimes(1);
    expect(capturedInitOpts.dsn).toBeTruthy();
    expect(capturedInitOpts.environment).toBe('production');
    expect(capturedInitOpts.tracesSampleRate).toBe(0.1);
    expect(capturedInitOpts.release).toMatch(/^andura@/);
    expect(typeof capturedInitOpts.beforeSend).toBe('function');
  });

  it('idempotent — al doilea apel NU re-invoca Sentry.init', async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    await initSentry();
    await initSentry();
    expect(mockSentryInit).toHaveBeenCalledTimes(1);
  });

  it('expune window.Sentry si window.testSentry post-init', async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    expect(window.Sentry).toBeDefined();
    expect(typeof window.testSentry).toBe('function');
  });

  it('window.testSentry invoca Sentry.captureMessage', async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    window.testSentry('hello');
    expect(mockCaptureMessage).toHaveBeenCalledWith('hello', 'info');
  });

  it('window.testSentry foloseste default message daca NU primeste arg', async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    window.testSentry();
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      'Manual test from Andura console',
      'info',
    );
  });
});

describe('initSentry — error fallback (silent catch)', () => {
  it('NU arunca daca dynamic import @sentry/browser esueaza', async () => {
    setHostname('andura.app');
    // Override mock to throw on init call (simulate SDK load failure path).
    mockSentryInit.mockImplementationOnce(() => {
      throw new Error('SDK init failed');
    });
    const { initSentry } = await import('../sentry.js');
    await expect(initSentry()).resolves.toBeUndefined();
  });
});

describe('beforeSend hook — filter rules (return null pentru known noise)', () => {
  let beforeSend;

  beforeEach(async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    beforeSend = capturedInitOpts.beforeSend;
  });

  it('drop ResizeObserver loop errors', () => {
    const event = {
      exception: { values: [{ value: 'ResizeObserver loop limit exceeded' }] },
    };
    expect(beforeSend(event)).toBeNull();
  });

  it('drop Non-Error promise rejection', () => {
    const event = {
      exception: { values: [{ value: 'Non-Error promise rejection captured' }] },
    };
    expect(beforeSend(event)).toBeNull();
  });

  it('drop Script error.', () => {
    const event = { exception: { values: [{ value: 'Script error.' }] } };
    expect(beforeSend(event)).toBeNull();
  });

  it('drop NetworkError', () => {
    const event = {
      exception: { values: [{ value: 'NetworkError when attempting to fetch' }] },
    };
    expect(beforeSend(event)).toBeNull();
  });

  it('drop Failed to fetch', () => {
    const event = {
      exception: { values: [{ value: 'Failed to fetch resource' }] },
    };
    expect(beforeSend(event)).toBeNull();
  });
});

describe('beforeSend hook — Firebase error tagging (NU drop, tag source)', () => {
  let beforeSend;

  beforeEach(async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    beforeSend = capturedInitOpts.beforeSend;
  });

  it('tag Firebase errors cu source=firebase (NU drop)', () => {
    const event = {
      exception: { values: [{ value: 'Firebase quota exceeded' }] },
    };
    const result = beforeSend(event);
    expect(result).not.toBeNull();
    expect(result.tags.source).toBe('firebase');
  });

  it('tag firebasedatabase URL errors cu source=firebase', () => {
    const event = {
      exception: {
        values: [{
          value: 'fetch failed for https://andura-default-rtdb.firebasedatabase.app/users',
        }],
      },
    };
    const result = beforeSend(event);
    expect(result.tags.source).toBe('firebase');
  });

  it('preserva tags existente la tag Firebase', () => {
    const event = {
      exception: { values: [{ value: 'Firebase auth token rejected' }] },
      tags: { component: 'auth' },
    };
    const result = beforeSend(event);
    expect(result.tags.component).toBe('auth');
    expect(result.tags.source).toBe('firebase');
  });
});

describe('beforeSend hook — PII scrub aplicat la event fields', () => {
  let beforeSend;
  const UID = 'abcDEF1234567890XYZabcde9876';

  beforeEach(async () => {
    setHostname('andura.app');
    const { initSentry } = await import('../sentry.js');
    await initSentry();
    beforeSend = capturedInitOpts.beforeSend;
  });

  it('scrub exception.values[].value cu uid context', () => {
    const event = {
      exception: { values: [{ value: `Failure uid=${UID} during sync` }] },
    };
    const result = beforeSend(event);
    expect(result.exception.values[0].value).toBe('Failure uid=<UID> during sync');
  });

  it('scrub event.message direct', () => {
    const event = { message: `Sent to alice@example.com about thing` };
    const result = beforeSend(event);
    expect(result.message).toBe('Sent to <EMAIL> about thing');
  });

  it('scrub event.request.url cu /users/<uid> path', () => {
    const event = {
      request: { url: `https://rtdb/users/${UID}/sessions.json` },
    };
    const result = beforeSend(event);
    expect(result.request.url).toBe('https://rtdb/users/<UID>/sessions.json');
  });

  it('§S-08 scrub event.request.url cu ?auth=<jwt> token (RTDB leak)', () => {
    const jwt = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW';
    const event = {
      request: { url: `https://rtdb/users/${UID}/sessions.json?auth=${jwt}` },
    };
    const result = beforeSend(event);
    expect(result.request.url).toBe('https://rtdb/users/<UID>/sessions.json?auth=[REDACTED]');
  });

  it('§S-08 scrub breadcrumb.data.url cu &auth=<jwt> (fetch integration leak)', () => {
    const jwt = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW';
    const event = {
      breadcrumbs: [
        { data: { url: `https://rtdb/x.json?print=pretty&auth=${jwt}` } },
      ],
    };
    const result = beforeSend(event);
    expect(result.breadcrumbs[0].data.url).toBe('https://rtdb/x.json?print=pretty&auth=[REDACTED]');
  });

  it('scrub event.user.email cu placeholder', () => {
    const event = { user: { email: 'user@example.com' } };
    const result = beforeSend(event);
    expect(result.user.email).toBe('<EMAIL>');
  });

  it('scrub event.user.username cu placeholder', () => {
    const event = { user: { username: 'user@example.com' } };
    const result = beforeSend(event);
    expect(result.user.username).toBe('<EMAIL>');
  });

  it('scrub event.user.id cu placeholder', () => {
    const event = { user: { id: UID } };
    const result = beforeSend(event);
    expect(result.user.id).toBe('<UID>');
  });

  it('scrub breadcrumb.message cu PII', () => {
    const event = {
      breadcrumbs: [
        { message: `error uid=${UID} happened` },
        { message: 'innocent log' },
      ],
    };
    const result = beforeSend(event);
    expect(result.breadcrumbs[0].message).toBe('error uid=<UID> happened');
    expect(result.breadcrumbs[1].message).toBe('innocent log');
  });

  it('scrub breadcrumb.data.url (fetch integration leak)', () => {
    const event = {
      breadcrumbs: [
        {
          data: { url: `https://rtdb/users/${UID}/sessions.json` },
        },
      ],
    };
    const result = beforeSend(event);
    expect(result.breadcrumbs[0].data.url).toBe('https://rtdb/users/<UID>/sessions.json');
  });

  it('NU se prabuseste cand breadcrumb.data NU este object', () => {
    const event = {
      breadcrumbs: [
        { data: null },
        { data: 'not an object' },
      ],
    };
    expect(() => beforeSend(event)).not.toThrow();
  });

  it('NU se prabuseste pe event minimal (lipsa exception/message/etc.)', () => {
    const event = {};
    expect(() => beforeSend(event)).not.toThrow();
    expect(beforeSend({})).toEqual({});
  });

  it('combine — scrub exception + message + breadcrumb intr-un event', () => {
    const event = {
      exception: { values: [{ value: `failure uid=${UID}` }] },
      message: 'mail user@example.com',
      breadcrumbs: [{ message: `path /users/${UID}` }],
    };
    const result = beforeSend(event);
    expect(result.exception.values[0].value).toBe('failure uid=<UID>');
    expect(result.message).toBe('mail <EMAIL>');
    expect(result.breadcrumbs[0].message).toBe('path /users/<UID>');
  });

  // §SEC-22-01 — magic-link sign-in leak. On /auth-callback the live URL with
  // the single-use oobCode + (encoded) email sits in window.location until
  // replaceState (success path). Any exception in that window auto-fills
  // request.url + breadcrumbs from window.location → ships the credential.
  it('§SEC-22-01 scrub oobCode + encoded email in request.url + breadcrumb.data.url', () => {
    const OOB = 'ABCdef123_THE_REAL_SIGNIN_TOKEN_xyz789';
    const liveUrl =
      `https://andura.app/auth-callback?mode=signIn&oobCode=${OOB}&apiKey=AIzaSyFAKE&lang=en&email=gigel%40example.com`;
    const event = {
      exception: { values: [{ value: `TypeError at ${liveUrl}` }] },
      request: { url: liveUrl },
      breadcrumbs: [
        { category: 'navigation', data: { url: liveUrl } },
        { category: 'fetch', message: `GET ${liveUrl} failed`, data: { url: liveUrl } },
      ],
    };
    const result = beforeSend(event);
    // The one-time sign-in token + email must NOT survive in ANY channel.
    for (const channel of [
      result.request.url,
      result.exception.values[0].value,
      result.breadcrumbs[0].data.url,
      result.breadcrumbs[1].data.url,
      result.breadcrumbs[1].message,
    ]) {
      expect(channel).not.toContain(OOB);
      expect(channel).toContain('oobCode=[REDACTED]');
      expect(channel).not.toContain('gigel%40example.com');
      expect(channel).toContain('email=[REDACTED]');
    }
    // Non-sensitive params preserved for queryability.
    expect(result.request.url).toContain('mode=signIn');
    expect(result.request.url).toContain('lang=en');
  });
});

describe('captureException — manual exception dispatch', () => {
  it('short-circuit early daca _initialized=false (NU invoca Sentry)', async () => {
    setHostname('localhost'); // forteaza guard return → _initialized stays false
    const { captureException } = await import('../sentry.js');
    captureException(new Error('boom'));
    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(mockWithScope).not.toHaveBeenCalled();
  });

  it('invoca Sentry.captureException prin withScope dupa init', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    const err = new Error('boom');
    captureException(err);
    expect(mockWithScope).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(err);
  });

  it('seteaza tags via scope.setTag (context.tags param)', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    captureException(new Error('x'), {
      tags: { module: 'auth', step: 'login' },
    });
    expect(capturedScope.tags.module).toBe('auth');
    expect(capturedScope.tags.step).toBe('login');
  });

  it('converteste tag values la string', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    captureException(new Error('x'), { tags: { retries: 3 } });
    expect(capturedScope.tags.retries).toBe('3');
  });

  it('seteaza extras via scope.setExtra (context.extra param)', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    const payload = { foo: 'bar' };
    captureException(new Error('x'), { extra: { payload } });
    expect(capturedScope.extras.payload).toEqual(payload);
  });

  it('seteaza arbitrary keys (non-tags/extra) ca extras', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    captureException(new Error('x'), { customField: 'value' });
    expect(capturedScope.extras.customField).toBe('value');
  });

  it('default context={} cand NU primeste arg secund', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    expect(() => captureException(new Error('x'))).not.toThrow();
    expect(mockCaptureException).toHaveBeenCalled();
  });

  it('tags NU este object — sare peste setTag loop fara crash', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    expect(() =>
      captureException(new Error('x'), { tags: 'not-object' }),
    ).not.toThrow();
    expect(capturedScope.tags).toEqual({});
  });

  it('extra NU este object — sare peste setExtra loop fara crash', async () => {
    setHostname('andura.app');
    const { initSentry, captureException } = await import('../sentry.js');
    await initSentry();
    expect(() =>
      captureException(new Error('x'), { extra: 'not-object' }),
    ).not.toThrow();
  });
});
