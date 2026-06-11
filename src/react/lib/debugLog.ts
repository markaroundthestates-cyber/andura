// ══ BEHAVIOR LOG — durable interaction-log capture (DECISIONS §D107) ═════════
// A PERMANENT feature (NOT a throwaway beta tool): a durable, per-UID record of
// what the user did (taps + semantic events), the state they SAW, and what the
// engine RECOMMENDED, so a later phase can mine it for self-evaluation /
// dp.js calibration, and the founder can export it (deterministic bug repro).
//
// DURABILITY (D107 §2): the legacy 500-event localStorage ring was wiped on
// reinstall/cache-clear and could overflow inside a single long session. This
// module now persists to the per-UID Dexie tier (`behavior_tier1`,
// src/storage/db.js) — orders of magnitude more room, already per-UID, already
// never cloud-synced — with a rolling days-window retention (RETENTION_DAYS).
//
// TWO GATES (D107 §3):
//   - COLLECT_KEY (`andura-behavior-collect`) — the durable engine-grade signal
//     (rec/log/adjust/swap/skip). Default-OFF FOR NOW (the default-ON decision is
//     Daniel's, pending — see DEFAULT-ON one-liner note below). Flipping the
//     default later is a ONE-LINE change in `isCollectEnabled()`.
//   - FLAG_KEY (`andura-debug`) — the founder's noisy `tap` capture + export
//     verbosity. Default-OFF, unchanged.
//
// PRIVACY: kept OUT of firebase.js SYNC_KEYS and the storeSync wv2 channel — it
// is local-only by construction (the IDB tier is a local archive). No PII / free
// text is captured (only the numeric kg/reps + coarse rating already present).
//
// Safety: EVERY public method is wrapped so it NEVER throws — capture must not
// be able to break the app. The IDB write is async + best-effort (fire-and-forget
// from the sync `event()` boundary) so render is never blocked. jsdom/SSR-safe.

import { getDb, STORES } from '../../storage/db.js';

export const FLAG_KEY = 'andura-debug';
// D107 collection gate — durable semantic-event capture. Distinct from the
// founder's debug verbosity (FLAG_KEY) so we can collect engine-grade signal
// without the noisy universal-tap capture.
export const COLLECT_KEY = 'andura-behavior-collect';

// Rolling retention window (D107 §2 / P-2): keep the last N days on-device.
// 180 → 45 (Daniel 2026-06-11, disk hygiene): the engine consumers are safe with
// a 45-day raw window — behaviorDistill is PURE over the rows' own `t` (no fixed
// horizon) and every dp half-life is ≤ 28 days, so distilled signal never depends
// on raw rows older than the window. Readability of the founder export is solved
// by SCOPE SLICING (exportJson scope), not by retention.
export const RETENTION_DAYS = 45;
const PRUNE_MIN_MS = 60_000;
const DAY_MS = 86_400_000;

/**
 * Cheaply-available state the user SAW at capture time, read imperatively from
 * the zustand stores (getState — NOT hooks; capture runs outside React render).
 * Every field is OPTIONAL: a missing/unreadable field is simply omitted, never
 * a thrown error.
 */
export interface DebugSnapshot {
  route?: string;
  exercise?: string;
  setIdx?: number;
  shownKg?: number;
  shownReps?: number;
  phase?: string;
  focusPreset?: string;
}

/** Discrete things worth recording. `tap` = universal click capture (debug-grade,
 *  gated by FLAG_KEY); the rest are engine-grade semantic events (gated by
 *  COLLECT_KEY). `adjust` = the engine's post-input re-recommendation. */
export type DebugEventKind = 'tap' | 'rec' | 'log' | 'adjust' | 'swap' | 'skip';

/**
 * BehaviorEvent — the durable row shape (D107 §4), a superset of the legacy
 * DebugEvent so existing export/clear keep working. The future dp.js-calibration
 * engine consumes these; `exEngine` (EN canonical engineName) + `readiness` are
 * the "collect it right now" fields so we never have to re-instrument.
 */
export interface BehaviorEvent {
  /** unique row id (epoch ms + counter) — Dexie primary key. */
  id: string;
  /** epoch ms */
  t: number;
  kind: DebugEventKind;
  /** sessionGroupStart — ties rows to ONE workout. Optional (taps lack it). */
  session?: number;
  /** EN canonical engineName — THE engine key (NOT the RO display name). */
  exEngine?: string;
  /** event-specific fields (testid, exercise, kg, reps, rating, from/to, …). */
  payload?: Record<string, unknown>;
  /** state snapshot the user saw at capture time. */
  snap?: DebugSnapshot;
}

// Back-compat alias — older callers / tests refer to DebugEvent.
export type DebugEvent = BehaviorEvent;

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** Founder debug verbosity (tap capture + export visibility). Default OFF. */
export function isDebugEnabled(): boolean {
  try {
    if (!hasLocalStorage()) return false;
    return localStorage.getItem(FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Persist / clear the debug-verbosity flag (Settings toggle). */
export function setDebugEnabled(on: boolean): void {
  try {
    if (!hasLocalStorage()) return;
    if (on) localStorage.setItem(FLAG_KEY, 'true');
    else localStorage.removeItem(FLAG_KEY);
  } catch {
    /* never throw from capture controls */
  }
}

/**
 * Durable semantic-event collection gate. DEFAULT-ON (Daniel decision 2026-06-07,
 * D107 P-1): on-device only, never synced; the user opts OUT via Settings. Absent/
 * unset = enabled; only an explicit 'false' disables — so setCollectEnabled(false)
 * PERSISTS 'false' (does NOT clear the key, else it would revert to the ON default).
 */
export function isCollectEnabled(): boolean {
  try {
    if (!hasLocalStorage()) return false;
    return localStorage.getItem(COLLECT_KEY) !== 'false';
  } catch {
    return false;
  }
}

/** Persist the collection gate (Settings toggle). Explicit 'true'/'false' both
 *  ways so the stored value is unambiguous regardless of the default. */
export function setCollectEnabled(on: boolean): void {
  try {
    if (!hasLocalStorage()) return;
    localStorage.setItem(COLLECT_KEY, on ? 'true' : 'false');
  } catch {
    /* never throw from capture controls */
  }
}

// ── Durable IDB backend (best-effort, never blocks render) ───────────────────

let _idSeq = 0;
function nextId(t: number): string {
  _idSeq = (_idSeq + 1) % 1_000_000;
  return `${t}-${_idSeq}`;
}

let _lastPruneAt = 0;

/** Test-only: reset the prune throttle so a prune fires on the next write. */
export function __resetPruneThrottleForTest(): void {
  _lastPruneAt = 0;
}

/** Throttled days-window prune. Deletes rows older than RETENTION_DAYS. */
async function pruneOld(): Promise<void> {
  const now = Date.now();
  if (now - _lastPruneAt < PRUNE_MIN_MS) return;
  _lastPruneAt = now;
  try {
    const db = getDb();
    const cutoff = now - RETENTION_DAYS * DAY_MS;
    await db.table(STORES.BEHAVIOR_TIER1).where('t').below(cutoff).delete();
  } catch {
    /* prune failure is non-fatal — the window is a soft bound */
  }
}

/** Append one durable row to the behavior store + throttled prune. Best-effort. */
async function appendDurable(e: BehaviorEvent): Promise<void> {
  try {
    const db = getDb();
    await db.table(STORES.BEHAVIOR_TIER1).put(e);
    await pruneOld();
  } catch {
    /* IDB unavailable (jsdom) / quota / serialization — drop silently */
  }
}

/**
 * Record one event. Gating (D107 §3): `tap` → FLAG_KEY (founder debug);
 * every other (engine-grade) kind → COLLECT_KEY. When the relevant gate is OFF
 * this is a cheap early-return no-op. The durable IDB write is fired-and-forgotten
 * (never awaited at the caller boundary) so render is never blocked. Wrapped
 * end-to-end: a malformed payload or storage failure can never throw.
 *
 * @param session  sessionGroupStart — ties the row to one workout (optional).
 * @param exEngine EN canonical engineName (THE engine key — optional).
 */
function event(
  kind: DebugEventKind,
  payload?: Record<string, unknown>,
  snap?: DebugSnapshot,
  session?: number,
  exEngine?: string,
): void {
  try {
    const allowed = kind === 'tap' ? isDebugEnabled() : isCollectEnabled();
    if (!allowed) return;
    const t = Date.now();
    const e: BehaviorEvent = { id: nextId(t), t, kind };
    if (typeof session === 'number') e.session = session;
    if (typeof exEngine === 'string' && exEngine.length > 0) e.exEngine = exEngine;
    if (payload && Object.keys(payload).length > 0) e.payload = payload;
    if (snap && Object.keys(snap).length > 0) e.snap = snap;
    // Fire-and-forget — never block the caller's render/handler on IDB.
    void appendDurable(e);
  } catch {
    /* capture must never break the app */
  }
}

/** All durable rows oldest → newest. Empty array on any failure. Async (IDB). */
async function snapshot(): Promise<BehaviorEvent[]> {
  try {
    const db = getDb();
    const rows = (await db.table(STORES.BEHAVIOR_TIER1).toArray()) as BehaviorEvent[];
    return rows.sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
  } catch {
    return [];
  }
}

/** Export scope (Daniel 2026-06-11 "sa nu citesc 100 antrenamente pana la bug"):
 *  'last' = the most recent WORKOUT only (default — the readable debug slice),
 *  'last3' = the 3 most recent workouts, 'all' = the full raw dump (on demand). */
export type ExportScope = 'last' | 'last3' | 'all';

/** Pretty-printed JSON of the durable log wrapped with light metadata — the
 *  string copied to the clipboard by the Settings export button. Async (IDB).
 *  Envelope `v:2` (durable IDB era; v:1 was the localStorage ring).
 *
 *  SCOPE SLICING: workouts are identified by the `session` field (the
 *  sessionGroupStart stamp every engine-grade row carries). A sliced export
 *  keeps every NON-TAP event from the chosen sessions' time window — `swap`
 *  rows lack `session` but live inside the window, so the window (oldest kept
 *  session start − 60s) is the membership test, not the field. Navigation
 *  `tap` noise (~70% of a raw dump) is excluded from slices; 'all' keeps it. */
async function exportJson(scope: ExportScope = 'last'): Promise<string> {
  try {
    const all = await snapshot();
    let events = all;
    let sessions: number[] = [];
    if (scope !== 'all') {
      const ids = [
        ...new Set(
          all.map((e) => e.session).filter((s): s is number => typeof s === 'number'),
        ),
      ].sort((a, b) => b - a);
      sessions = ids.slice(0, scope === 'last' ? 1 : 3).sort((a, b) => a - b);
      const oldestKept = sessions[0];
      if (oldestKept !== undefined) {
        const windowStart = oldestKept - 60_000;
        events = all.filter((e) => e.kind !== 'tap' && e.t >= windowStart);
      } else {
        // No workout rows yet — fall back to the semantic events only.
        events = all.filter((e) => e.kind !== 'tap');
      }
    }
    return JSON.stringify(
      { v: 2, scope, exportedAt: Date.now(), count: events.length, sessions, events },
      null,
      2,
    );
  } catch {
    return '{"v":2,"events":[]}';
  }
}

/** Wipe the durable behavior store (keeps the flags). Async (IDB). */
async function clear(): Promise<void> {
  try {
    const db = getDb();
    await db.table(STORES.BEHAVIOR_TIER1).clear();
  } catch {
    /* never throw */
  }
}

export const debugLog = {
  event,
  snapshot,
  exportJson,
  clear,
  isEnabled: isDebugEnabled,
  setEnabled: setDebugEnabled,
  isCollectEnabled,
  setCollectEnabled,
};
