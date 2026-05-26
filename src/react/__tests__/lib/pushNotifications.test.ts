// ══ FCM WEB PUSH — unit tests ════════════════════════════════════════════
// Guard branches (unsupported / no-account / denied) + isPushSupported.
// NU atinge getToken real — firebase dynamic imports mocked. jsdom default NU
// are PushManager/serviceWorker, deci stubuim window/navigator per test.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
// vi.hoisted: factory-urile vi.mock sunt ridicate deasupra import-urilor, deci
// referintele la mock-uri trebuie sa fie hoisted la fel.
const { mockGetUserPath, mockGetIdToken } = vi.hoisted(() => ({
  mockGetUserPath: vi.fn<() => string | null>(),
  mockGetIdToken: vi.fn<() => Promise<string | null>>(),
}));

// Path relativ la FISIERUL DE TEST (src/react/__tests__/lib/), NU la modulul
// testat — vi.mock rezolva fata de locatia test-ului. Modulul testat importa
// '../../firebase.js' (= src/firebase.js); de aici '../../../firebase.js'.
vi.mock('../../../firebase.js', () => ({
  getUserPath: () => mockGetUserPath(),
  FIREBASE_URL: 'https://fittracker-c34e8-default-rtdb.example.app',
}));
vi.mock('../../../auth.js', () => ({
  getIdToken: () => mockGetIdToken(),
}));

// firebase SDK lazy imports — mocked so the test never touches real getToken.
const mockGetToken = vi.fn();
const mockDeleteToken = vi.fn();
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: (...args: unknown[]) => mockGetToken(...args),
  deleteToken: (...args: unknown[]) => mockDeleteToken(...args),
}));

import {
  isPushSupported,
  enablePushNotifications,
  disablePushNotifications,
} from '../../lib/pushNotifications';

// ── window / navigator stubbing helpers ─────────────────────────────────────
// jsdom navigator NU are serviceWorker prototype property; once defined ramane
// vizibil pentru `'serviceWorker' in navigator` chiar daca value=undefined,
// deci removal-ul corect e `delete`.
function deleteServiceWorker(): void {
  try {
    delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
  } catch {
    /* non-configurable in some envs — ignore */
  }
}

function setSupported(supported: boolean): void {
  if (supported) {
    (window as unknown as { Notification: unknown }).Notification = {
      requestPermission: vi.fn(async () => 'granted'),
    };
    (window as unknown as { PushManager: unknown }).PushManager = function () {};
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn(async () => ({ scope: '/firebase-cloud-messaging-push-scope' })),
        getRegistration: vi.fn(async () => undefined),
      },
      configurable: true,
    });
  } else {
    delete (window as unknown as { Notification?: unknown }).Notification;
    delete (window as unknown as { PushManager?: unknown }).PushManager;
    deleteServiceWorker();
  }
}

describe('pushNotifications — isPushSupported', () => {
  afterEach(() => {
    delete (window as unknown as { Notification?: unknown }).Notification;
    delete (window as unknown as { PushManager?: unknown }).PushManager;
    deleteServiceWorker();
  });

  it('true when Notification + serviceWorker + PushManager all present', () => {
    setSupported(true);
    expect(isPushSupported()).toBe(true);
  });

  it('false when PushManager missing', () => {
    setSupported(true);
    delete (window as unknown as { PushManager?: unknown }).PushManager;
    expect(isPushSupported()).toBe(false);
  });

  it('false when Notification missing', () => {
    setSupported(true);
    delete (window as unknown as { Notification?: unknown }).Notification;
    expect(isPushSupported()).toBe(false);
  });

  it('false when serviceWorker missing', () => {
    setSupported(true);
    deleteServiceWorker();
    expect(isPushSupported()).toBe(false);
  });
});

describe('pushNotifications — enablePushNotifications guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    delete (window as unknown as { Notification?: unknown }).Notification;
    delete (window as unknown as { PushManager?: unknown }).PushManager;
    deleteServiceWorker();
  });

  it("returns 'unsupported' when push API absent", async () => {
    setSupported(false);
    await expect(enablePushNotifications()).resolves.toBe('unsupported');
  });

  it("returns 'no-account' when anonymous (getUserPath null)", async () => {
    setSupported(true);
    mockGetUserPath.mockReturnValue(null);
    await expect(enablePushNotifications()).resolves.toBe('no-account');
  });

  it("returns 'denied' when user refuses permission", async () => {
    setSupported(true);
    mockGetUserPath.mockReturnValue('users/uid123');
    (window as unknown as { Notification: { requestPermission: () => Promise<string> } }).Notification = {
      requestPermission: vi.fn(async () => 'denied'),
    };
    await expect(enablePushNotifications()).resolves.toBe('denied');
  });
});

describe('pushNotifications — disablePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    deleteServiceWorker();
  });

  it('never throws when push unsupported', async () => {
    setSupported(false);
    await expect(disablePushNotifications()).resolves.toBeUndefined();
  });
});
