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
// 180 ≈ 6-month returner horizon. Prune throttled to once/minute (PRUNE_MIN_MS)
// to avoid per-event churn.
export const RETENTION_DAYS = 180;
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
 * Durable semantic-event collection gate. DEFAULT-OFF for now (the default-ON
 * decision is Daniel's, pending — D107 P-1).
 *
 * ▶▶ DEFAULT-ON ONE-LINER: to flip the default to ON, change the line below to
 *    `return localStorage.getItem(COLLECT_KEY) !== 'false';`
 *    (treat absent/unset as enabled; only an explicit 'false' disables). No other
 *    code change is required — Settings, reset, export all already honor it. ◀◀
 */
export function isCollectEnabled(): boolean {
  try {
    if (!hasLocalStorage()) return false;
    return localStorage.getItem(COLLECT_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Persist / clear the collection gate (Settings toggle). */
export function setCollectEnabled(on: boolean): void {
  try {
    if (!hasLocalStorage()) return;
    if (on) localStorage.setItem(COLLECT_KEY, 'true');
    else localStorage.removeItem(COLLECT_KEY);
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

/** Pretty-printed JSON of the full durable log wrapped with light metadata — the
 *  string copied to the clipboard by the Settings export button. Async (IDB).
 *  Envelope `v:2` (durable IDB era; v:1 was the localStorage ring). */
async function exportJson(): Promise<string> {
  try {
    const events = await snapshot();
    return JSON.stringify(
      { v: 2, exportedAt: Date.now(), count: events.length, events },
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
