// ══ DEBUG LOG — permanent interaction-log capture (DECISIONS §D107 phase 1) ══
// A PERMANENT feature (NOT a throwaway beta tool): a local ring buffer that
// records what the user did (taps + semantic events), the state they SAW, and
// what the engine RECOMMENDED, so the founder can export it (deterministic bug
// repro) and later phases can mine it for self-evaluation / personalization.
//
// PHASE 1 = CAPTURE + EXPORT ONLY. No analysis, no auto-correction here — that
// is a later phase (the "prediction-error brain"). This module just buffers and
// hands back JSON.
//
// Storage: localStorage under its OWN key `andura-debug-log` (LOG_KEY), kept
// DELIBERATELY OUT of firebase.js SYNC_KEYS — it is noisy + may carry on-device
// PII (typed loads, routes) → never synced to the cloud (D107 privacy note).
//
// Flag: capture is gated by the `andura-debug` localStorage boolean (FLAG_KEY,
// default OFF). When OFF, debugLog.event() is a cheap early-return no-op and the
// global tap listener in Layout is never attached → ZERO prod cost. When ON,
// capture is active and persists to localStorage on each event.
//
// Safety: EVERY public method is wrapped so it NEVER throws — capture must not
// be able to break the app. jsdom/SSR-safe (all storage access guarded).

export const LOG_KEY = 'andura-debug-log';
export const FLAG_KEY = 'andura-debug';

// Ring buffer cap — last ~500 events. Bounds localStorage footprint (well under
// the ~5MB quota even with fat snapshots) and keeps export copy/paste sane.
export const MAX_EVENTS = 500;

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

/** Discrete things worth recording. `tap` = universal click capture; the rest
 *  are surgically-wired semantic events at their existing call sites.
 *  `adjust` = the engine's post-input re-recommendation for the NEXT set (the
 *  step-by-step "after you entered X + rated Y, Andura now recommends Z" trace
 *  the founder needs to calibrate — D107 phase 2 enrichment). */
export type DebugEventKind = 'tap' | 'rec' | 'log' | 'adjust' | 'swap' | 'skip';

export interface DebugEvent {
  /** epoch ms */
  t: number;
  kind: DebugEventKind;
  /** event-specific fields (testid, exercise, kg, reps, rating, from/to, …). */
  payload?: Record<string, unknown>;
  /** state snapshot the user saw at capture time. */
  snap?: DebugSnapshot;
}

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** Capture is active only when the flag is explicitly 'true'. Default OFF. */
export function isDebugEnabled(): boolean {
  try {
    if (!hasLocalStorage()) return false;
    return localStorage.getItem(FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Persist / clear the capture flag (used by the Settings toggle). */
export function setDebugEnabled(on: boolean): void {
  try {
    if (!hasLocalStorage()) return;
    if (on) localStorage.setItem(FLAG_KEY, 'true');
    else localStorage.removeItem(FLAG_KEY);
  } catch {
    /* never throw from capture controls */
  }
}

function readBuffer(): DebugEvent[] {
  try {
    if (!hasLocalStorage()) return [];
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DebugEvent[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(events: DebugEvent[]): void {
  try {
    if (!hasLocalStorage()) return;
    localStorage.setItem(LOG_KEY, JSON.stringify(events));
  } catch {
    /* quota / serialization failure — drop silently, never break the app */
  }
}

/**
 * Record one event. No-op (cheap early-return) when the flag is OFF. Appends to
 * the ring buffer, trimming to the most-recent MAX_EVENTS, then persists.
 * Wrapped end-to-end: a malformed payload or storage failure can never throw
 * into the caller's render/handler.
 */
function event(kind: DebugEventKind, payload?: Record<string, unknown>, snap?: DebugSnapshot): void {
  try {
    if (!isDebugEnabled()) return;
    const e: DebugEvent = { t: Date.now(), kind };
    if (payload && Object.keys(payload).length > 0) e.payload = payload;
    if (snap && Object.keys(snap).length > 0) e.snap = snap;
    const buf = readBuffer();
    buf.push(e);
    // Ring buffer: keep only the last MAX_EVENTS.
    const trimmed = buf.length > MAX_EVENTS ? buf.slice(buf.length - MAX_EVENTS) : buf;
    writeBuffer(trimmed);
  } catch {
    /* capture must never break the app */
  }
}

/** Current buffer contents (oldest → newest). Empty array on any failure. */
function snapshot(): DebugEvent[] {
  return readBuffer();
}

/** Pretty-printed JSON of the full buffer wrapped with light metadata — the
 *  string copied to the clipboard by the Settings export button. */
function exportJson(): string {
  try {
    return JSON.stringify(
      {
        v: 1,
        exportedAt: Date.now(),
        count: readBuffer().length,
        events: readBuffer(),
      },
      null,
      2,
    );
  } catch {
    return '{"v":1,"events":[]}';
  }
}

/** Wipe the buffer (keeps the flag). */
function clear(): void {
  try {
    if (!hasLocalStorage()) return;
    localStorage.removeItem(LOG_KEY);
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
};
