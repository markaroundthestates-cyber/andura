// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createSafetyBanner,
  resetDismiss,
  isDismissed,
} from '../safetyBanner.js';

function makeStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    _raw: data,
  };
}

describe('safetyBanner — input validation', () => {
  it('throws on missing opts', () => {
    expect(() => createSafetyBanner()).toThrow(/opts required/);
  });

  it('throws on invalid severity', () => {
    expect(() => createSafetyBanner({ severity: 'fatal', message: 'x' })).toThrow(/severity must be/);
  });

  it('throws on empty message', () => {
    expect(() => createSafetyBanner({ severity: 'info', message: '' })).toThrow(/non-empty string/);
  });

  it('throws on non-string message', () => {
    expect(() => createSafetyBanner({ severity: 'info', message: 42 })).toThrow(/non-empty string/);
  });
});

describe('safetyBanner — rendering by severity', () => {
  it('renders info severity with role=status', () => {
    const banner = createSafetyBanner({ severity: 'info', message: 'Hello.' });
    expect(banner.element).toBeTruthy();
    expect(banner.element.classList.contains('safety-banner--info')).toBe(true);
    expect(banner.element.getAttribute('role')).toBe('status');
    expect(banner.element.getAttribute('data-severity')).toBe('info');
  });

  it('renders warning severity with role=status', () => {
    const banner = createSafetyBanner({ severity: 'warning', message: 'Heads up.' });
    expect(banner.element.classList.contains('safety-banner--warning')).toBe(true);
    expect(banner.element.getAttribute('role')).toBe('status');
  });

  it('renders critical severity with role=alert', () => {
    const banner = createSafetyBanner({ severity: 'critical', message: 'Stop and reassess.' });
    expect(banner.element.classList.contains('safety-banner--critical')).toBe(true);
    expect(banner.element.getAttribute('role')).toBe('alert');
  });

  it('renders the message text in a <p>', () => {
    const banner = createSafetyBanner({ severity: 'info', message: 'Hello world.' });
    const msg = banner.element.querySelector('.safety-banner__message');
    expect(msg).toBeTruthy();
    expect(msg.textContent).toBe('Hello world.');
  });
});

describe('safetyBanner — dismiss button', () => {
  it('renders dismiss button on info severity', () => {
    const banner = createSafetyBanner({ severity: 'info', message: 'x' });
    expect(banner.element.querySelector('.safety-banner__dismiss')).toBeTruthy();
  });

  it('renders dismiss button on warning severity', () => {
    const banner = createSafetyBanner({ severity: 'warning', message: 'x' });
    expect(banner.element.querySelector('.safety-banner__dismiss')).toBeTruthy();
  });

  it('does NOT render dismiss button on critical severity', () => {
    const banner = createSafetyBanner({ severity: 'critical', message: 'x' });
    expect(banner.element.querySelector('.safety-banner__dismiss')).toBeNull();
  });

  it('dismiss click removes the banner from DOM', () => {
    const banner = createSafetyBanner({ severity: 'info', message: 'x' });
    document.body.appendChild(banner.element);
    expect(document.body.contains(banner.element)).toBe(true);
    banner.element.querySelector('.safety-banner__dismiss').click();
    expect(document.body.contains(banner.element)).toBe(false);
  });
});

describe('safetyBanner — action button', () => {
  it('renders no action button when action prop omitted', () => {
    const banner = createSafetyBanner({ severity: 'info', message: 'x' });
    expect(banner.element.querySelector('.safety-banner__action')).toBeNull();
  });

  it('renders action button with label and fires onClick', () => {
    const onClick = vi.fn();
    const banner = createSafetyBanner({
      severity: 'warning',
      message: 'Pick a path.',
      action: { label: 'Folosesc varianta mea', onClick },
    });
    const btn = banner.element.querySelector('.safety-banner__action');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toBe('Folosesc varianta mea');
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('falls back to "OK" label when none provided', () => {
    const banner = createSafetyBanner({
      severity: 'info',
      message: 'x',
      action: { onClick: () => {} },
    });
    expect(banner.element.querySelector('.safety-banner__action').textContent).toBe('OK');
  });
});

describe('safetyBanner — dismiss persistence per session', () => {
  let storage;
  beforeEach(() => { storage = makeStorage(); });

  it('does not persist dismiss when no dismissId provided', () => {
    const banner = createSafetyBanner({
      severity: 'info', message: 'x', storage,
    });
    document.body.appendChild(banner.element);
    banner.element.querySelector('.safety-banner__dismiss').click();
    expect(storage._raw.size).toBe(0);
  });

  it('persists dismiss flag when dismissId provided', () => {
    const banner = createSafetyBanner({
      severity: 'warning', message: 'x', dismissId: 'deload-skip', storage,
    });
    document.body.appendChild(banner.element);
    banner.element.querySelector('.safety-banner__dismiss').click();
    expect(isDismissed('deload-skip', storage)).toBe(true);
  });

  it('returns null element when dismissId already dismissed', () => {
    storage.setItem('safetyBanner_dismissed_deload-skip', '1');
    const banner = createSafetyBanner({
      severity: 'warning', message: 'x', dismissId: 'deload-skip', storage,
    });
    expect(banner.element).toBeNull();
    expect(banner.dismissed).toBe(true);
  });

  it('resetDismiss clears the persisted flag', () => {
    storage.setItem('safetyBanner_dismissed_x', '1');
    expect(isDismissed('x', storage)).toBe(true);
    resetDismiss('x', storage);
    expect(isDismissed('x', storage)).toBe(false);
  });

  it('resetDismiss is no-op on missing storage / id', () => {
    expect(() => resetDismiss('x', null)).not.toThrow();
    expect(() => resetDismiss(null, storage)).not.toThrow();
  });
});

describe('safetyBanner — dispose cleans up listeners', () => {
  it('exposes a dispose function that does not throw', () => {
    const banner = createSafetyBanner({
      severity: 'warning',
      message: 'x',
      action: { label: 'Go', onClick: () => {} },
    });
    expect(typeof banner.dispose).toBe('function');
    expect(() => banner.dispose()).not.toThrow();
  });
});

describe('safetyBanner — integration sample (F-NEW-2 deload skip)', () => {
  it('renders deload skip wording with action button (LOCKED Bugatti tone)', () => {
    const onUseMine = vi.fn();
    const banner = createSafetyBanner({
      severity: 'warning',
      message: 'Săptămâna de deload a trecut neutilizată. Sesiunea de azi merge mai bine la RPE 6-7 — corpul recuperează în mișcare, nu doar în repaus.',
      action: { label: 'Folosesc varianta mea', onClick: onUseMine },
      dismissId: 'deload-skip-2026-w19',
      storage: makeStorage(),
    });
    expect(banner.element.textContent).toContain('corpul recuperează în mișcare');
    // Anti-RE: NO procentage leak in the banner copy
    expect(banner.element.textContent).not.toMatch(/\d+%/);
    banner.element.querySelector('.safety-banner__action').click();
    expect(onUseMine).toHaveBeenCalledTimes(1);
  });
});
