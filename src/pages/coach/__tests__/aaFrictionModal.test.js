/**
 * AA Friction Modal — anti-RE rewrite (Decisions A/B/C):
 *   - Per-day dismiss persistence (calendar-day key)
 *   - Single-click override (no typing dictation)
 *   - Neutral copy (no signal counts, no escalation messaging, no signal lists)
 *
 * Tests verify the new DOM, the day-dismiss flow, and the four resolution
 * sources (accept / override-button / backdrop / swipe).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// CSS import is a no-op in jsdom
import { vi } from 'vitest';
vi.mock('../../../styles/aa-friction.css', () => ({}));

import {
  showAAFrictionModal,
  isAAFrictionPending,
  isAAFrictionDismissedToday,
  markAAFrictionDismissedToday,
  clearAAFrictionDismissedDate,
  FRICTION_PENDING_KEY,
  FRICTION_DISMISSED_DATE_KEY,
} from '../aaFrictionModal.js';

function makeSession() {
  return {
    aaBlocked: { level: 'hard', requiresFrictionConfirmation: true },
    exercises: [
      { name: 'Bench Press', sets: 2, aaOriginalSets: 4, aaReduced: true },
      { name: 'Squat',       sets: 2, aaOriginalSets: 3, aaReduced: true },
    ],
  };
}

function clickBtn(selector) {
  const btn = document.querySelector(selector);
  if (!btn) throw new Error(`Button not found: ${selector}`);
  btn.click();
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('showAAFrictionModal — DOM structure (anti-RE)', () => {
  it('mounts with neutral title — no "signals", no count', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    const sheet = document.querySelector('.aa-friction-sheet');
    expect(sheet).not.toBeNull();
    expect(sheet.getAttribute('role')).toBe('dialog');

    const title = document.querySelector('#aa-friction-title');
    expect(title.textContent).toBe('Plan ajustat — recovery');
    expect(title.textContent).not.toMatch(/signals?/i);
    expect(title.textContent).not.toMatch(/\d/);

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('shows comparison list (original strikethrough vs reduced) — visual UX preserved', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    const origItems = document.querySelectorAll('.plan-original li');
    const redItems = document.querySelectorAll('.plan-reduced li');
    expect(origItems.length).toBe(2);
    expect(redItems.length).toBe(2);
    expect(origItems[0].textContent).toContain('4×');
    expect(redItems[0].textContent).toContain('2×');

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('does NOT render signal list or typing input or escalation warning', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    expect(document.querySelector('.aa-friction-signals')).toBeNull();
    expect(document.querySelector('.aa-friction-input')).toBeNull();
    expect(document.querySelector('.aa-friction-details')).toBeNull();
    expect(document.querySelector('.aa-friction-override code')).toBeNull();

    const text = document.querySelector('.aa-friction-sheet').textContent;
    expect(text).not.toMatch(/escaleaza/i);
    expect(text).not.toMatch(/2-a override/i);
    expect(text).not.toMatch(/typing/i);

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('renders both action buttons + minimal "Mai multe?" details', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    expect(document.querySelector('.btn-cancel')).not.toBeNull();
    expect(document.querySelector('.btn-override-simple')).not.toBeNull();
    const more = document.querySelector('.aa-friction-more');
    expect(more).not.toBeNull();
    expect(more.querySelector('p').textContent).toMatch(/oboseala|accidentari/i);

    clickBtn('.btn-cancel');
    await modalPromise;
  });
});

describe('showAAFrictionModal — actions + sources', () => {
  it('"Accepta plan redus" resolves {action:"cancel", source:"accept"} — does NOT mark dismissed', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    clickBtn('.btn-cancel');
    const result = await modalPromise;

    expect(result).toEqual({ action: 'cancel', source: 'accept' });
    expect(localStorage.getItem(FRICTION_PENDING_KEY)).toBeNull();
    expect(localStorage.getItem(FRICTION_DISMISSED_DATE_KEY)).toBeNull();
  });

  it('"Override (inteleg riscurile)" — single click, resolves override + marks dismissed today', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    clickBtn('.btn-override-simple');
    const result = await modalPromise;

    expect(result.action).toBe('override');
    expect(result.source).toBe('override-button');
    expect(isAAFrictionDismissedToday()).toBe(true);
  });

  it('backdrop tap resolves {source:"backdrop"} + marks dismissed today', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    const backdrop = document.querySelector('.aa-friction-backdrop');
    backdrop.click();

    const result = await modalPromise;
    expect(result.action).toBe('cancel');
    expect(result.source).toBe('backdrop');
    expect(isAAFrictionDismissedToday()).toBe(true);
  });

  it('swipe-down >100px resolves {source:"swipe"} + marks dismissed today', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session);

    const handle = document.querySelector('.aa-friction-handle');
    handle.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientY: 0 }], bubbles: true }));
    handle.dispatchEvent(new TouchEvent('touchmove',  { touches: [{ clientY: 150 }], bubbles: true }));

    const result = await modalPromise;
    expect(result.action).toBe('cancel');
    expect(result.source).toBe('swipe');
    expect(isAAFrictionDismissedToday()).toBe(true);
  });
});

describe('isAAFrictionDismissedToday — calendar-day persistence', () => {
  it('returns false when no flag is set', () => {
    expect(isAAFrictionDismissedToday()).toBe(false);
  });

  it('returns true after markAAFrictionDismissedToday()', () => {
    markAAFrictionDismissedToday();
    expect(isAAFrictionDismissedToday()).toBe(true);
  });

  it('returns false when stored date is a different day', () => {
    localStorage.setItem(FRICTION_DISMISSED_DATE_KEY, '2020-01-01');
    expect(isAAFrictionDismissedToday()).toBe(false);
  });

  it('clearAAFrictionDismissedDate() resets the flag', () => {
    markAAFrictionDismissedToday();
    clearAAFrictionDismissedDate();
    expect(isAAFrictionDismissedToday()).toBe(false);
  });
});

describe('isAAFrictionPending — modal-lifecycle key', () => {
  it('returns false when no pending state', () => {
    expect(isAAFrictionPending()).toBe(false);
  });

  it('returns true when pending state exists', () => {
    localStorage.setItem(FRICTION_PENDING_KEY, JSON.stringify({ sessionDate: '2026-04-27' }));
    expect(isAAFrictionPending()).toBe(true);
  });
});
