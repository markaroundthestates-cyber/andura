// ══ DEBUG CAPTURE — universal tap listener + store snapshot (D107 phase 1) ════
// The wiring layer on top of debugLog.ts:
//   - buildSnapshot(): reads the cheaply-available state the user SAW from the
//     zustand stores IMPERATIVELY (getState — never hooks; capture runs outside
//     React render). Defensive: any missing/unreadable field is omitted, never
//     thrown. Reused by both the tap listener and the semantic events.
//   - useDebugCapture(): a hook mounted ONCE in Layout that, ONLY when the
//     `andura-debug` flag is ON, attaches a single document-level CAPTURE-phase
//     click listener. On each click it walks closest('[data-testid]') and records
//     a `tap` event with the testid + route + snapshot. Flag OFF → the listener
//     is never attached (the effect early-returns) → ZERO prod cost.
//
// The app already carries data-testid on virtually every interactive element, so
// this captures nearly every tap with ZERO per-component wiring.

import { useEffect } from 'react';
import { useWorkoutStore } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { debugLog, isDebugEnabled, type DebugSnapshot } from './debugLog';

/**
 * Build the state snapshot from the stores. Reads only what is cheaply
 * available imperatively; the per-set specifics (shownKg/shownReps/exercise/
 * setIdx) live in Workout.tsx React state, so they ride along on the SEMANTIC
 * events (rec/log) — the global tap snapshot carries the store-level context
 * (route/phase/focusPreset/setIdx). Never throws.
 */
export function buildSnapshot(): DebugSnapshot {
  const snap: DebugSnapshot = {};
  try {
    if (typeof window !== 'undefined' && window.location) {
      snap.route = window.location.pathname;
    }
  } catch {
    /* omit route */
  }
  try {
    const w = useWorkoutStore.getState();
    if (typeof w.phase === 'string') snap.phase = w.phase;
    if (typeof w.exIdx === 'number') snap.setIdx = w.setIdx;
  } catch {
    /* omit workout fields */
  }
  try {
    const fp = useOnboardingStore.getState().data?.focusPreset;
    if (typeof fp === 'string') snap.focusPreset = fp;
  } catch {
    /* omit focusPreset */
  }
  return snap;
}

/**
 * Single document-level capture-phase click listener. Mounted once in Layout.
 * Only attached when the flag is ON → zero cost when OFF. Walks the event target
 * up to the nearest [data-testid] and records a tap with route + snapshot.
 * Wrapped so a capture failure can never break a real click handler.
 */
export function useDebugCapture(): void {
  useEffect(() => {
    // Flag OFF (default) → never attach the listener. Zero prod cost.
    if (!isDebugEnabled()) return;
    if (typeof document === 'undefined') return;

    function onClick(ev: MouseEvent): void {
      try {
        const target = ev.target;
        if (!(target instanceof Element)) return;
        const el = target.closest('[data-testid]');
        const testid = el?.getAttribute('data-testid') ?? undefined;
        debugLog.event('tap', testid ? { testid } : undefined, buildSnapshot());
      } catch {
        /* capture must never break the app */
      }
    }

    // Capture phase so we record the tap even if a handler stops propagation.
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
    // Mount-once gate: the flag is read at mount. A flag flip applies on the
    // next app load (the toggle copy says as much) — we deliberately do not
    // hot-attach to keep the OFF path a true no-op with no subscription churn.
  }, []);
}
