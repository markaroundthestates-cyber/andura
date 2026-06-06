// ══ DEBUG LOG — permanent interaction-log (DECISIONS §D107 phase 1) ══════════
// CAPTURE + EXPORT ONLY. Validates:
//   - flag OFF (default) → debugLog.event() is a no-op (nothing recorded)
//   - flag ON → events are recorded with payload + snapshot
//   - the global tap listener (useDebugCapture) records a tap with route +
//     snapshot when a data-testid'd element is clicked; OFF → no listener
//   - ring buffer caps at MAX_EVENTS
//   - exportJson() returns valid, parseable JSON
//   - a semantic 'log' event captures kg/reps/rating
//
// The flag + buffer live in localStorage (jsdom provides it). Each test resets
// both. The tap-listener tests render a tiny tree that mounts useDebugCapture.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import {
  debugLog,
  isDebugEnabled,
  setDebugEnabled,
  LOG_KEY,
  FLAG_KEY,
  MAX_EVENTS,
} from '../../lib/debugLog';
import { useDebugCapture } from '../../lib/debugCapture';

beforeEach(() => {
  localStorage.removeItem(LOG_KEY);
  localStorage.removeItem(FLAG_KEY);
});

afterEach(() => {
  cleanup();
  localStorage.removeItem(LOG_KEY);
  localStorage.removeItem(FLAG_KEY);
});

describe('debugLog — D107 phase 1 flag gate', () => {
  it('flag defaults OFF', () => {
    expect(isDebugEnabled()).toBe(false);
  });

  it('flag OFF → event() records nothing (no-op)', () => {
    debugLog.event('tap', { testid: 'x' });
    expect(debugLog.snapshot()).toHaveLength(0);
    expect(localStorage.getItem(LOG_KEY)).toBeNull();
  });

  it('flag ON → event() records with payload + snapshot', () => {
    setDebugEnabled(true);
    expect(isDebugEnabled()).toBe(true);
    debugLog.event('tap', { testid: 'btn' }, { route: '/app/antrenor' });
    const snap = debugLog.snapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0]!.kind).toBe('tap');
    expect(snap[0]!.payload).toEqual({ testid: 'btn' });
    expect(snap[0]!.snap).toEqual({ route: '/app/antrenor' });
    expect(typeof snap[0]!.t).toBe('number');
  });

  it('setDebugEnabled(false) clears the flag', () => {
    setDebugEnabled(true);
    setDebugEnabled(false);
    expect(isDebugEnabled()).toBe(false);
  });
});

describe('debugLog — ring buffer + export', () => {
  it('caps the buffer at MAX_EVENTS (keeps the most recent)', () => {
    setDebugEnabled(true);
    for (let i = 0; i < MAX_EVENTS + 25; i++) {
      debugLog.event('tap', { i });
    }
    const snap = debugLog.snapshot();
    expect(snap).toHaveLength(MAX_EVENTS);
    // Oldest 25 evicted → first remaining is index 25, last is the final push.
    expect(snap[0]!.payload).toEqual({ i: 25 });
    expect(snap[MAX_EVENTS - 1]!.payload).toEqual({ i: MAX_EVENTS + 24 });
  });

  it('exportJson() returns valid parseable JSON wrapping the events', () => {
    setDebugEnabled(true);
    debugLog.event('tap', { testid: 'a' });
    debugLog.event('skip', { from: 'Bench Press' });
    const json = debugLog.exportJson();
    const parsed = JSON.parse(json) as { v: number; count: number; events: unknown[] };
    expect(parsed.v).toBe(1);
    expect(parsed.count).toBe(2);
    expect(parsed.events).toHaveLength(2);
  });

  it('clear() empties the buffer', () => {
    setDebugEnabled(true);
    debugLog.event('tap', {});
    debugLog.clear();
    expect(debugLog.snapshot()).toHaveLength(0);
  });
});

describe('debugLog — semantic log event', () => {
  it("'log' event captures kg/reps/rating", () => {
    setDebugEnabled(true);
    debugLog.event(
      'log',
      { exercise: 'Bench Press', kg: 60, reps: 8, rating: 'ok' },
      { route: '/app/antrenor/workout', setIdx: 2, shownKg: 60, shownReps: 8 },
    );
    const e = debugLog.snapshot()[0]!;
    expect(e.kind).toBe('log');
    expect(e.payload).toEqual({ exercise: 'Bench Press', kg: 60, reps: 8, rating: 'ok' });
    expect(e.snap?.setIdx).toBe(2);
  });
});

// ── D107 enrichment: RECOMMENDED-vs-ENTERED discrepancy + step-by-step adapt ──
// These mirror the exact payload shapes Workout.tsx now emits, with REAL values
// (recommended 15, entered 30 → deltaKg 15, manual override) so the founder can
// see rec-vs-entered-vs-discrepancy and the engine's response-to-input.
describe('debugLog — D107 discrepancy + re-recommendation enrichment', () => {
  it("'log' pairs the active rec onto the entry + computes deltas + manual-override (rec 15, entered 30)", () => {
    setDebugEnabled(true);
    debugLog.event('log', {
      exercise: 'Bench Press',
      setIdx: 1,
      recKg: 15,
      recReps: 10,
      enteredKg: 30,
      enteredReps: 8,
      rating: 'ok',
      deltaKg: 30 - 15,
      deltaReps: 8 - 10,
      wasManualOverride: true,
      kg: 30,
      reps: 8,
    });
    const e = debugLog.snapshot()[0]!;
    expect(e.kind).toBe('log');
    expect(e.payload?.recKg).toBe(15);
    expect(e.payload?.enteredKg).toBe(30);
    expect(e.payload?.deltaKg).toBe(15);
    expect(e.payload?.deltaReps).toBe(-2);
    expect(e.payload?.wasManualOverride).toBe(true);
    // Phase-1 kg/reps keys preserved for prior export readability.
    expect(e.payload?.kg).toBe(30);
  });

  it("'adjust' records the engine's post-input next-set re-recommendation (up)", () => {
    setDebugEnabled(true);
    debugLog.event('adjust', {
      exercise: 'Bench Press',
      setIdx: 1,
      fromRecKg: 60,
      fromRecReps: 8,
      enteredKg: 60,
      rating: 'usor',
      toRecKg: 62.5,
      toRecReps: 8,
      dir: 'up',
      reason: 'A mers usor - urcam la 62.5 kg pe setul urmator',
    });
    const e = debugLog.snapshot()[0]!;
    expect(e.kind).toBe('adjust');
    expect(e.payload?.fromRecKg).toBe(60);
    expect(e.payload?.toRecKg).toBe(62.5);
    expect(e.payload?.dir).toBe('up');
  });

  it("'adjust' records a HOLD when the engine did not re-recommend", () => {
    setDebugEnabled(true);
    debugLog.event('adjust', {
      exercise: 'Bench Press',
      setIdx: 1,
      fromRecKg: 60,
      fromRecReps: 8,
      enteredKg: 60,
      rating: 'ok',
      toRecKg: 60,
      toRecReps: 8,
      dir: 'hold',
      reason: 'no-adjust',
    });
    const e = debugLog.snapshot()[0]!;
    expect(e.payload?.dir).toBe('hold');
    expect(e.payload?.toRecKg).toBe(e.payload?.fromRecKg);
  });

  it("'rec' carries the starting-recommendation source (coldstart vs history)", () => {
    setDebugEnabled(true);
    debugLog.event('rec', { exercise: 'Bench Press', setIdx: 1, recKg: 40, recReps: 10, source: 'coldstart' });
    const e = debugLog.snapshot()[0]!;
    expect(e.kind).toBe('rec');
    expect(e.payload?.source).toBe('coldstart');
  });

  it('flag OFF → enriched events still record nothing + export stays valid JSON', () => {
    debugLog.event('log', { exercise: 'Bench Press', recKg: 15, enteredKg: 30, deltaKg: 15, wasManualOverride: true });
    debugLog.event('adjust', { exercise: 'Bench Press', dir: 'up', toRecKg: 62.5 });
    expect(debugLog.snapshot()).toHaveLength(0);
    const parsed = JSON.parse(debugLog.exportJson()) as { v: number; events: unknown[] };
    expect(parsed.v).toBe(1);
    expect(parsed.events).toHaveLength(0);
  });
});

// ── Universal tap capture (useDebugCapture in Layout) ───────────────────────
function Harness(): JSX.Element {
  useDebugCapture();
  return (
    <div>
      <button type="button" data-testid="my-button">tap me</button>
    </div>
  );
}

describe('useDebugCapture — universal tap listener', () => {
  it('flag OFF → listener not attached, tap records nothing', () => {
    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('my-button'));
    expect(debugLog.snapshot()).toHaveLength(0);
  });

  it('flag ON → a tap on a testid element records route + snapshot', () => {
    setDebugEnabled(true);
    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('my-button'));
    const snap = debugLog.snapshot();
    expect(snap).toHaveLength(1);
    const e = snap[0]!;
    expect(e.kind).toBe('tap');
    expect(e.payload).toEqual({ testid: 'my-button' });
    // Snapshot always carries the route (jsdom location.pathname).
    expect(typeof e.snap?.route).toBe('string');
  });
});
