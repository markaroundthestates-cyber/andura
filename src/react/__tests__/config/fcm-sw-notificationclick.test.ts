// cycle26b (MEDIUM, persona) — tapping a delivered push must OPEN/FOCUS the app
// (and route to the deep-link), not be a dead tap. The FCM service worker
// (public/firebase-messaging-sw.js) had onBackgroundMessage (sends) but NO
// notificationclick handler, so a tap did nothing.
//
// A real service worker can't run in jsdom (importScripts/self.clients/registration),
// so we LOAD the SW source, evaluate it with mocked SW globals, then dispatch a
// synthetic notificationclick and assert the focus/navigate/openWindow decision +
// the data.link URL resolution. MANUAL-VERIFY (live, can't be unit-tested here):
// trigger a real daily-coach push with the tab closed → tap → Andura opens on the
// Antrenor tab.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SW_SRC = readFileSync(
  resolve(__dirname, '../../../../public/firebase-messaging-sw.js'),
  'utf-8',
);

interface ClickEvent {
  notification: { close: () => void; data?: { link?: string } };
  waitUntil: (p: Promise<unknown>) => void;
}

// Evaluate the SW file in a controlled scope: stub importScripts + firebase so the
// top-level init can't throw, capture the notificationclick listener off `self`.
function loadSwHandler(clients: unknown): {
  handler: (e: ClickEvent) => void;
} {
  const listeners: Record<string, (e: ClickEvent) => void> = {};
  const self = {
    addEventListener: (type: string, cb: (e: ClickEvent) => void) => {
      listeners[type] = cb;
    },
    registration: { showNotification: vi.fn() },
    clients,
  };
  const importScripts = (): void => {};
  const firebase = {
    initializeApp: (): void => {},
    messaging: () => ({ onBackgroundMessage: (): void => {} }),
  };
  const run = new Function('self', 'importScripts', 'firebase', SW_SRC);
  run(self, importScripts, firebase);
  const handler = listeners.notificationclick;
  expect(typeof handler).toBe('function');
  return { handler: handler as (e: ClickEvent) => void };
}

describe('FCM SW — notificationclick (cycle26b §notif-tap)', () => {
  let waited: Promise<unknown> | null;
  let closed: boolean;

  beforeEach(() => {
    waited = null;
    closed = false;
  });

  function fireTap(handler: (e: ClickEvent) => void, link?: string): void {
    const notification: ClickEvent['notification'] = {
      close: () => {
        closed = true;
      },
    };
    if (link !== undefined) notification.data = { link };
    handler({
      notification,
      waitUntil: (p) => {
        waited = p;
      },
    });
  }

  it('focuses an existing window and navigates it to the deep-link', async () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    const focus = vi.fn();
    const existing = { focus, navigate };
    const openWindow = vi.fn();
    const { handler } = loadSwHandler({
      matchAll: vi.fn().mockResolvedValue([existing]),
      openWindow,
    });

    fireTap(handler, '/app/antrenor');
    await waited;

    expect(closed).toBe(true); // notification closed
    expect(navigate).toHaveBeenCalledWith('/app/antrenor'); // routed to the deep-link
    expect(focus).toHaveBeenCalled(); // focused the existing window
    expect(openWindow).not.toHaveBeenCalled(); // no new window when one is open
  });

  it('opens a new window when no app window is open', async () => {
    const openWindow = vi.fn().mockResolvedValue(undefined);
    const { handler } = loadSwHandler({
      matchAll: vi.fn().mockResolvedValue([]),
      openWindow,
    });

    fireTap(handler, '/app/antrenor');
    await waited;

    expect(openWindow).toHaveBeenCalledWith('/app/antrenor');
  });

  it('defaults to the app root when the payload carries no link', async () => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    const focus = vi.fn();
    const { handler } = loadSwHandler({
      matchAll: vi.fn().mockResolvedValue([{ focus, navigate }]),
      openWindow: vi.fn(),
    });

    fireTap(handler, undefined);
    await waited;

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('falls back to focus() when the client cannot navigate', async () => {
    const focus = vi.fn();
    const openWindow = vi.fn();
    // No navigate on the client → just focus the window.
    const { handler } = loadSwHandler({
      matchAll: vi.fn().mockResolvedValue([{ focus }]),
      openWindow,
    });

    fireTap(handler, '/app/antrenor');
    await waited;

    expect(focus).toHaveBeenCalled();
    expect(openWindow).not.toHaveBeenCalled();
  });
});
