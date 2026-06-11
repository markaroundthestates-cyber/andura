// ══ BEHAVIOR LOG — durable interaction-log (DECISIONS §D107) ═════════════════
// Durable per-UID IndexedDB capture (replaces the legacy 500-event localStorage
// ring). Validates:
//   - collection gate (andura-behavior-collect) DEFAULT-OFF → semantic events
//     are a no-op; ON → events persist durably to behavior_tier1
//   - debug gate (andura-debug) DEFAULT-OFF → tap capture is a no-op; ON → taps
//     persist (taps are gated by the DEBUG flag, not the collect flag)
//   - the canonical BehaviorEvent carries exEngine (EN canonical) + readiness
//   - days-window prune drops rows older than RETENTION_DAYS
//   - exportJson envelope is v:2, parseable; snapshot/export are async (IDB)
//   - jsdom IDB safety (fake-indexeddb is registered globally in setup.ts)
//
// The IDB write in event() is fire-and-forget; tests await a microtask flush
// (awaiting snapshot() after a tick) so the async put settles before assertions.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import {
  debugLog,
  isDebugEnabled,
  setDebugEnabled,
  isCollectEnabled,
  setCollectEnabled,
  FLAG_KEY,
  COLLECT_KEY,
  RETENTION_DAYS,
  __resetPruneThrottleForTest,
} from '../../lib/debugLog';
import { useDebugCapture } from '../../lib/debugCapture';
import Dexie from 'dexie';
import { closeDb, _resetNamespaceCache, getDb, getNamespace, DB_NAME_PREFIX, STORES } from '../../../storage/db.js';

const DAY_MS = 86_400_000;

// Let the fire-and-forget IDB put (+ throttled prune) settle before reading.
// A few macrotask ticks cover the put → prune async chain in fake-indexeddb.
async function flush(): Promise<void> {
  for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0));
}

async function freshDb(): Promise<void> {
  const ns = getNamespace();
  await closeDb();
  try { await Dexie.delete(`${DB_NAME_PREFIX}_${ns}`); } catch { /* swallow */ }
  _resetNamespaceCache();
}

beforeEach(async () => {
  localStorage.clear();
  await freshDb();
});

afterEach(async () => {
  cleanup();
  await freshDb();
  localStorage.clear();
});

describe('debugLog — D107 collection gate (default ON, opt-out)', () => {
  it('collection gate defaults ON', () => {
    // Global test setup forces the key OFF for determinism; remove it to assert
    // the real prod default (absent/unset → enabled).
    localStorage.removeItem(COLLECT_KEY);
    expect(isCollectEnabled()).toBe(true);
  });

  it('collect OFF → semantic event() records nothing', async () => {
    setCollectEnabled(false);
    debugLog.event('log', { exercise: 'Bench Press', kg: 60 });
    await flush();
    expect(await debugLog.snapshot()).toHaveLength(0);
  });

  it('collect ON → semantic event() persists durably to IDB', async () => {
    setCollectEnabled(true);
    expect(isCollectEnabled()).toBe(true);
    debugLog.event('log', { exercise: 'Bench Press', kg: 60, reps: 8, rating: 'potrivit' });
    await flush();
    const snap = await debugLog.snapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0]!.kind).toBe('log');
    expect(snap[0]!.payload).toMatchObject({ exercise: 'Bench Press', kg: 60 });
    expect(typeof snap[0]!.t).toBe('number');
  });

  it('setCollectEnabled(false) persists an explicit opt-out', () => {
    setCollectEnabled(true);
    setCollectEnabled(false);
    expect(isCollectEnabled()).toBe(false);
    expect(localStorage.getItem(COLLECT_KEY)).toBe('false');
  });
});

describe('debugLog — canonical BehaviorEvent (exEngine + readiness + session)', () => {
  it('persists exEngine (EN canonical), session, and readiness from the call', async () => {
    setCollectEnabled(true);
    debugLog.event(
      'log',
      { exercise: 'Impins din piept', readiness: 'green', prescribedKg: 60, enteredKg: 62.5 },
      { route: '/app/antrenor/workout', setIdx: 2 },
      1717000000000, // sessionGroupStart
      'Flat Barbell Bench Press', // EN canonical engineName
    );
    await flush();
    const e = (await debugLog.snapshot())[0]!;
    expect(e.exEngine).toBe('Flat Barbell Bench Press');
    expect(e.session).toBe(1717000000000);
    expect(e.payload?.readiness).toBe('green');
    expect(e.snap?.setIdx).toBe(2);
  });
});

describe('debugLog — durable IDB backend + days-window prune', () => {
  it(`prunes rows older than RETENTION_DAYS (${RETENTION_DAYS}d) on write`, async () => {
    setCollectEnabled(true);
    __resetPruneThrottleForTest(); // ensure the prune fires on the next write
    // Seed an ANCIENT row directly (older than the window) + a fresh event.
    const ancientT = Date.now() - (RETENTION_DAYS + 5) * DAY_MS;
    const db = getDb();
    await db.table(STORES.BEHAVIOR_TIER1).put({ id: `${ancientT}-9`, t: ancientT, kind: 'log' });
    // A fresh event triggers the (now un-throttled) days-window prune.
    debugLog.event('log', { exercise: 'Squat' });
    await flush();
    const snap = await debugLog.snapshot();
    // The ancient row is pruned; only the fresh one survives.
    expect(snap.map((r) => r.id)).not.toContain(`${ancientT}-9`);
    expect(snap.some((r) => r.payload?.exercise === 'Squat')).toBe(true);
  });

  it('clear() empties the durable store', async () => {
    setCollectEnabled(true);
    debugLog.event('log', { exercise: 'Bench' });
    await flush();
    await debugLog.clear();
    expect(await debugLog.snapshot()).toHaveLength(0);
  });

  it('exportJson() returns a parseable v:2 envelope', async () => {
    setCollectEnabled(true);
    debugLog.event('log', { exercise: 'a' });
    debugLog.event('skip', { from: 'Bench Press' });
    await flush();
    const json = await debugLog.exportJson();
    const parsed = JSON.parse(json) as { v: number; count: number; events: unknown[] };
    expect(parsed.v).toBe(2);
    expect(parsed.count).toBe(2);
    expect(parsed.events).toHaveLength(2);
  });
});

describe('debugLog — debug gate (tap capture, default OFF, separate from collect)', () => {
  it('debug gate defaults OFF', () => {
    expect(isDebugEnabled()).toBe(false);
  });

  it('tap is gated by the DEBUG flag, NOT the collect flag', async () => {
    // Collect ON but debug OFF → a `tap` must STILL be a no-op (tap is debug-grade).
    setCollectEnabled(true);
    setDebugEnabled(false);
    debugLog.event('tap', { testid: 'x' });
    await flush();
    expect(await debugLog.snapshot()).toHaveLength(0);
  });

  it('debug ON → tap persists', async () => {
    setDebugEnabled(true);
    debugLog.event('tap', { testid: 'btn' }, { route: '/app/antrenor' });
    await flush();
    const snap = await debugLog.snapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0]!.kind).toBe('tap');
    expect(localStorage.getItem(FLAG_KEY)).toBe('true');
  });
});

// ── Universal tap capture (useDebugCapture in Layout) — gated by DEBUG flag ──
function Harness(): JSX.Element {
  useDebugCapture();
  return (
    <div>
      <button type="button" data-testid="my-button">tap me</button>
    </div>
  );
}

describe('useDebugCapture — universal tap listener', () => {
  it('debug OFF → listener not attached, tap records nothing', async () => {
    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('my-button'));
    await flush();
    expect(await debugLog.snapshot()).toHaveLength(0);
  });

  it('debug ON → a tap on a testid element records route + snapshot', async () => {
    setDebugEnabled(true);
    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('my-button'));
    await flush();
    const snap = await debugLog.snapshot();
    expect(snap).toHaveLength(1);
    const e = snap[0]!;
    expect(e.kind).toBe('tap');
    expect(e.payload).toEqual({ testid: 'my-button' });
    expect(typeof e.snap?.route).toBe('string');
  });
});

// ── Export scope slicing (Daniel 2026-06-11: "sa nu citesc 100 antrenamente") ──
// Rows are written straight to the IDB table (the public event() stamps its own
// Date.now(), so explicit timestamps need the direct path — same technique the
// prune test uses). Shape mirrors the REAL founder export: taps lack `session`;
// `swap` rows lack `session` but live inside the workout's time window.
describe('debugLog — exportJson scope slicing', () => {
  const S1 = 1_000_000; // older workout (sessionGroupStart)
  const S2 = 2_000_000; // newest workout

  async function seedTwoWorkouts(): Promise<void> {
    const rows = [
      // workout S1: rec + swap (no session field) + log + an in-workout tap
      { id: 't1', t: S1 + 100, kind: 'rec', session: S1, exEngine: 'Bench', payload: { recKg: 60 } },
      { id: 't2', t: S1 + 150, kind: 'swap', exEngine: 'Bench', payload: { from: 'Bench', to: 'DB Press' } },
      { id: 't3', t: S1 + 200, kind: 'log', session: S1, exEngine: 'DB Press', payload: { kg: 25 } },
      { id: 't4', t: S1 + 300, kind: 'tap', payload: { testid: 'rest-skip' } },
      // navigation noise BETWEEN workouts
      { id: 't5', t: 1_500_000, kind: 'tap', payload: { testid: 'cont-row-prefs' } },
      // workout S2
      { id: 't6', t: S2 + 100, kind: 'rec', session: S2, exEngine: 'Lat Pulldown', payload: { recKg: 60 } },
      { id: 't7', t: S2 + 150, kind: 'swap', exEngine: 'Lat Pulldown', payload: { from: 'A', to: 'B' } },
      { id: 't8', t: S2 + 200, kind: 'log', session: S2, exEngine: 'Lat Pulldown', payload: { kg: 59 } },
      { id: 't9', t: S2 + 300, kind: 'tap', payload: { testid: 'rest-skip' } },
      // trailing navigation noise
      { id: 't10', t: 2_500_000, kind: 'tap', payload: { testid: 'advanced-debug-copy' } },
    ];
    const db = getDb();
    for (const r of rows) await db.table(STORES.BEHAVIOR_TIER1).put(r);
  }

  it("default scope 'last' → ONLY the newest workout's semantic rows, zero taps", async () => {
    await seedTwoWorkouts();
    const out = JSON.parse(await debugLog.exportJson());
    expect(out.v).toBe(2);
    expect(out.scope).toBe('last');
    expect(out.sessions).toEqual([S2]);
    expect(out.events.map((e: { id: string }) => e.id)).toEqual(['t6', 't7', 't8']);
    expect(out.events.some((e: { kind: string }) => e.kind === 'tap')).toBe(false);
  });

  it("'last3' → both workouts' semantic rows (window from the oldest kept), zero taps", async () => {
    await seedTwoWorkouts();
    const out = JSON.parse(await debugLog.exportJson('last3'));
    expect(out.sessions).toEqual([S1, S2]);
    expect(out.events.map((e: { id: string }) => e.id)).toEqual(['t1', 't2', 't3', 't6', 't7', 't8']);
  });

  it("'all' → the full raw dump, taps included", async () => {
    await seedTwoWorkouts();
    const out = JSON.parse(await debugLog.exportJson('all'));
    expect(out.scope).toBe('all');
    expect(out.count).toBe(10);
    expect(out.events.some((e: { kind: string }) => e.kind === 'tap')).toBe(true);
  });

  it('empty store → parseable envelope with empty events', async () => {
    const out = JSON.parse(await debugLog.exportJson());
    expect(out.events).toEqual([]);
    expect(out.sessions).toEqual([]);
  });

  it('no workout rows yet (taps only) → slice falls back to semantic-only (empty)', async () => {
    const db = getDb();
    await db.table(STORES.BEHAVIOR_TIER1).put({ id: 'x1', t: 123, kind: 'tap', payload: { testid: 'a' } });
    const out = JSON.parse(await debugLog.exportJson());
    expect(out.events).toEqual([]);
  });
});
