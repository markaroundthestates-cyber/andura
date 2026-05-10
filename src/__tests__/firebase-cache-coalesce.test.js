/**
 * TASK #26 — C10c cache invalidation coalesce
 *
 * Verifica:
 * 1. suppressInvalidations(fn) foldeaza toate DB.set-urile pe COACH_RELEVANT_KEYS intr-o singura invalidare.
 * 2. In afara batch-mode, invalidarile succesive sunt debounced intr-o fereastra de 250ms.
 * 3. Direct `window._directorCache.invalidate()` nu e afectat (bypass explicit).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DB } from '../db.js';
import { suppressInvalidations } from '../firebase.js';

function mockDirectorCache() {
  const invalidate = vi.fn();
  window._directorCache = { invalidate };
  return invalidate;
}

beforeEach(() => {
  localStorage.clear();
  // suppress auto-sync to Firebase in tests — we only exercise cache behavior
  window._suppressFirebaseSync = true;
});

describe('suppressInvalidations — batch mode', () => {
  it('folds 11 DB.set calls on relevant keys into 1 invalidation', () => {
    const invalidate = mockDirectorCache();

    suppressInvalidations(() => {
      DB.set('logs', []);
      DB.set('readiness', {});
      DB.set('phase-override', 'AUTO');
      DB.set('current-kcal', 2000);
      DB.set('weights', {});
      DB.set('unavailable-equipment', []);
      DB.set('equipment-occupied-session', []);
      DB.set('applied-patterns', []);
      DB.set('session-burns', []);
      DB.set('early-stops', []);
      DB.set('workout-skips', {});
    });

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('does not invalidate if no relevant key was written', () => {
    const invalidate = mockDirectorCache();

    suppressInvalidations(() => {
      DB.set('some-random-key', 42);
      DB.set('another-unrelated', 'foo');
    });

    expect(invalidate).not.toHaveBeenCalled();
  });

  it('nested suppressInvalidations flushes once at outermost exit', () => {
    const invalidate = mockDirectorCache();

    suppressInvalidations(() => {
      DB.set('logs', []);
      suppressInvalidations(() => {
        DB.set('readiness', {});
      });
      // After inner returns, still suppressed — nothing yet
      expect(invalidate).not.toHaveBeenCalled();
      DB.set('weights', {});
    });

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('propagates thrown errors but still flushes pending invalidation', () => {
    const invalidate = mockDirectorCache();

    expect(() => {
      suppressInvalidations(() => {
        DB.set('logs', []);
        throw new Error('boom');
      });
    }).toThrow('boom');

    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});

describe('debounce — outside batch mode', () => {
  it('coalesces rapid successive DB.set calls into 1 invalidation after 250ms', () => {
    vi.useFakeTimers();
    const invalidate = mockDirectorCache();

    DB.set('logs', []);
    DB.set('readiness', {});
    DB.set('weights', {});
    DB.set('applied-patterns', []);

    // Before debounce window elapses
    expect(invalidate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);

    expect(invalidate).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('second burst after debounce window produces a second invalidation', () => {
    vi.useFakeTimers();
    const invalidate = mockDirectorCache();

    DB.set('logs', []);
    vi.advanceTimersByTime(250);
    expect(invalidate).toHaveBeenCalledTimes(1);

    DB.set('readiness', {});
    vi.advanceTimersByTime(250);
    expect(invalidate).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe('direct invalidate() — bypass debounce', () => {
  it('direct window._directorCache.invalidate() fires immediately (unchanged semantics)', () => {
    const invalidate = mockDirectorCache();

    // Explicit call, not triggered by DB.set — should remain synchronous
    window._directorCache.invalidate();
    window._directorCache.invalidate();

    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});
