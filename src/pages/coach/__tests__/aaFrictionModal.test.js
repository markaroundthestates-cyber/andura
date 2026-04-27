/**
 * TASK #7 — AA Friction Modal (HIGH tier)
 * Tests: modal DOM, typing validation, state persistence, escalation, swipe, signal mapping.
 * ADR 013 §6 + ADR 014 §5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('../../../util/coachDecisionLog.js', () => ({
  readAllActive: vi.fn(() => []),
}));

// CSS import is a no-op in jsdom
vi.mock('../../../styles/aa-friction.css', () => ({}));

import { readAllActive } from '../../../util/coachDecisionLog.js';
import {
  showAAFrictionModal,
  isAAFrictionPending,
  generateExpectedPhrase,
  getRecentOverrideCount,
  FRICTION_PENDING_KEY,
  SIGNAL_WORDING,
} from '../aaFrictionModal.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeSession(signals = ['volume_creep', 'frustration', 'recovery_debt']) {
  return {
    aaBlocked: { level: 'hard', signals, requiresFrictionConfirmation: true },
    exercises: [
      { name: 'Bench Press', sets: 2, aaOriginalSets: 4, aaReduced: true },
      { name: 'Squat',       sets: 2, aaOriginalSets: 3, aaReduced: true },
    ],
  };
}

function makeCtx(signals = ['volume_creep', 'frustration', 'recovery_debt']) {
  return { autoAggression: { tier: 'HIGH', signals, escalating: false } };
}

// Click a button inside the modal by selector
function clickBtn(selector) {
  const btn = document.querySelector(selector);
  if (!btn) throw new Error(`Button not found: ${selector}`);
  btn.click();
}

// Type into the input
function typeInput(text) {
  const input = document.querySelector('.aa-friction-input');
  if (!input) throw new Error('Input not found');
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  vi.clearAllMocks();
  readAllActive.mockReturnValue([]);
});

afterEach(() => {
  // Clean up any lingering DOM
  document.body.innerHTML = '';
  localStorage.clear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('showAAFrictionModal — DOM structure', () => {
  it('mounts with signals listed from session.aaBlocked', async () => {
    const signals = ['volume_creep', 'frustration', 'recovery_debt'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    const sheet = document.querySelector('.aa-friction-sheet');
    expect(sheet).not.toBeNull();
    expect(sheet.getAttribute('role')).toBe('dialog');

    const title = document.querySelector('#aa-friction-title');
    expect(title.textContent).toContain('3 signals detectate');

    const items = document.querySelectorAll('.aa-friction-signals li');
    expect(items.length).toBe(3);

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('generated expected phrase injected with N = signals.length', async () => {
    const signals = ['volume_creep', 'frustration'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    const code = document.querySelector('.aa-friction-override code');
    expect(code).not.toBeNull();
    expect(code.textContent).toBe('continui peste 2 signals în 14 zile');

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('comparison shows original and reduced sets', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session, makeCtx());

    const origItems = document.querySelectorAll('.plan-original li');
    const redItems = document.querySelectorAll('.plan-reduced li');
    expect(origItems.length).toBeGreaterThan(0);
    expect(redItems.length).toBeGreaterThan(0);
    // original sets are aaOriginalSets (4, 3); reduced are session.exercises.sets (2, 2)
    expect(origItems[0].textContent).toContain('4×');
    expect(redItems[0].textContent).toContain('2×');

    clickBtn('.btn-cancel');
    await modalPromise;
  });
});

describe('showAAFrictionModal — typing validation', () => {
  it('"Confirm override" button is disabled until exact phrase match', async () => {
    const session = makeSession(['volume_creep']);
    const modalPromise = showAAFrictionModal(session, makeCtx(['volume_creep']));

    const overrideBtn = document.querySelector('.btn-override');
    expect(overrideBtn.disabled).toBe(true);

    typeInput('wrong phrase');
    expect(overrideBtn.disabled).toBe(true);

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('button enabled after exact lowercase + trim match', async () => {
    const signals = ['volume_creep'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    const phrase = 'continui peste 1 signals în 14 zile';
    typeInput(phrase);

    const overrideBtn = document.querySelector('.btn-override');
    expect(overrideBtn.disabled).toBe(false);

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('normalization: trim + lowercase — padded uppercase input matches', async () => {
    const signals = ['volume_creep', 'frustration', 'recovery_debt'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    typeInput('  Continui Peste 3 Signals În 14 Zile  ');
    const overrideBtn = document.querySelector('.btn-override');
    expect(overrideBtn.disabled).toBe(false);

    clickBtn('.btn-cancel');
    await modalPromise;
  });
});

describe('showAAFrictionModal — actions', () => {
  it('cancel button resolves {action:"cancel"} and clears localStorage', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session, makeCtx());

    clickBtn('.btn-cancel');
    const result = await modalPromise;

    expect(result.action).toBe('cancel');
    expect(localStorage.getItem(FRICTION_PENDING_KEY)).toBeNull();
  });

  it('confirm override resolves {action:"override", overrideRationale} after typing match', async () => {
    const signals = ['volume_creep', 'frustration'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    const phrase = 'continui peste 2 signals în 14 zile';
    typeInput(phrase);
    clickBtn('.btn-override');

    const result = await modalPromise;
    expect(result.action).toBe('override');
    expect(result.overrideRationale).toBe(phrase);
    expect(localStorage.getItem(FRICTION_PENDING_KEY)).toBeNull();
  });
});

describe('showAAFrictionModal — state persistence', () => {
  it('writes aa-friction-pending to localStorage on mount', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session, makeCtx());

    const raw = localStorage.getItem(FRICTION_PENDING_KEY);
    expect(raw).not.toBeNull();
    const state = JSON.parse(raw);
    expect(state.sessionDate).toBe(new Date().toISOString().slice(0, 10));
    expect(state.expectedPhrase).toBe('continui peste 3 signals în 14 zile');

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('refresh simulation: same sessionDate → restores state (expectedPhrase unchanged)', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const savedPhrase = 'continui peste 3 signals în 14 zile';
    localStorage.setItem(FRICTION_PENDING_KEY, JSON.stringify({
      sessionDate: today,
      signals: ['volume_creep', 'frustration', 'recovery_debt'],
      expectedPhrase: savedPhrase,
      escalated: false,
    }));

    const session = makeSession();
    const modalPromise = showAAFrictionModal(session, makeCtx());

    const code = document.querySelector('.aa-friction-override code');
    expect(code.textContent).toBe(savedPhrase);

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('stale sessionDate → clears old state and generates fresh', async () => {
    localStorage.setItem(FRICTION_PENDING_KEY, JSON.stringify({
      sessionDate: '2020-01-01',  // stale date
      signals: ['frustration'],
      expectedPhrase: 'continui peste 1 signals în 14 zile',
      escalated: false,
    }));

    const signals = ['volume_creep', 'frustration', 'recovery_debt'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    // fresh state with today's date and new signal count
    const raw = localStorage.getItem(FRICTION_PENDING_KEY);
    const state = JSON.parse(raw);
    expect(state.sessionDate).toBe(new Date().toISOString().slice(0, 10));
    expect(state.expectedPhrase).toContain('3 signals');

    clickBtn('.btn-cancel');
    await modalPromise;
  });
});

describe('showAAFrictionModal — escalation', () => {
  it('escalated mode: CDL has 1 aaOverride in last 7d → phrase includes escalation wording', async () => {
    readAllActive.mockReturnValue([
      { date: new Date().toISOString().slice(0, 10), outcome: { aaOverride: true } },
    ]);

    const signals = ['volume_creep', 'frustration'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    const code = document.querySelector('.aa-friction-override code');
    expect(code.textContent).toContain('a 2-a override');

    clickBtn('.btn-cancel');
    await modalPromise;
  });

  it('no escalation when no recent aaOverrides in CDL', async () => {
    readAllActive.mockReturnValue([]);

    const signals = ['volume_creep'];
    const session = makeSession(signals);
    const modalPromise = showAAFrictionModal(session, makeCtx(signals));

    const code = document.querySelector('.aa-friction-override code');
    expect(code.textContent).toBe('continui peste 1 signals în 14 zile');
    expect(code.textContent).not.toContain('override');

    clickBtn('.btn-cancel');
    await modalPromise;
  });
});

describe('showAAFrictionModal — swipe-down handle', () => {
  it('simulated swipe >100px on handle resolves {action:"cancel"}', async () => {
    const session = makeSession();
    const modalPromise = showAAFrictionModal(session, makeCtx());

    const handle = document.querySelector('.aa-friction-handle');
    expect(handle).not.toBeNull();

    handle.dispatchEvent(new TouchEvent('touchstart', {
      touches: [{ clientY: 0 }],
      bubbles: true,
    }));
    handle.dispatchEvent(new TouchEvent('touchmove', {
      touches: [{ clientY: 150 }],  // >100px
      bubbles: true,
    }));

    const result = await modalPromise;
    expect(result.action).toBe('cancel');
  });
});

describe('generateExpectedPhrase', () => {
  it('standard (non-escalated) with 3 signals', () => {
    expect(generateExpectedPhrase(3, false, 0)).toBe('continui peste 3 signals în 14 zile');
  });

  it('escalated with 1 prior override → "a 2-a override"', () => {
    expect(generateExpectedPhrase(3, true, 1)).toBe('continui peste 3 signals — a 2-a override în 7 zile');
  });

  it('escalated with 2 prior overrides → "a 3-a override"', () => {
    expect(generateExpectedPhrase(2, true, 2)).toBe('continui peste 2 signals — a 3-a override în 7 zile');
  });
});

describe('SIGNAL_WORDING — mapping coverage', () => {
  it('volume_creep formats with n and optional dates', () => {
    expect(SIGNAL_WORDING.volume_creep(3, '24/04, 25/04')).toContain('Volume creep');
    expect(SIGNAL_WORDING.volume_creep(3, '24/04, 25/04')).toContain('24/04');
  });

  it('frustration formats with n', () => {
    expect(SIGNAL_WORDING.frustration(2)).toContain('Frustration markers: 2');
  });

  it('recovery_debt formats with n and weeks', () => {
    expect(SIGNAL_WORDING.recovery_debt(1, 'săpt 17')).toContain('Recovery debt');
    expect(SIGNAL_WORDING.recovery_debt(1)).toContain('?');
  });

  it('ignore_recovery formats with n', () => {
    expect(SIGNAL_WORDING.ignore_recovery(4)).toContain('Ignore recovery');
  });

  it('calorie_acceleration formats with n', () => {
    expect(SIGNAL_WORDING.calorie_acceleration(300)).toContain('Calorie acceleration');
    expect(SIGNAL_WORDING.calorie_acceleration(300)).toContain('300+');
  });
});

describe('isAAFrictionPending', () => {
  it('returns false when no pending state', () => {
    expect(isAAFrictionPending()).toBe(false);
  });

  it('returns true when pending state exists', () => {
    localStorage.setItem(FRICTION_PENDING_KEY, JSON.stringify({ sessionDate: '2026-04-27' }));
    expect(isAAFrictionPending()).toBe(true);
  });
});
