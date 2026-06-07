// ══ ENGINE SIGNAL-BUS SINK — dev-gated persistence of the engine trace ══════
// The dev-only sink for the per-session computed-vs-applied trace built by the
// PURE engine helper (src/engine/schedule/scheduleAdapter/signalBus.core.js).
// Mirrors debugLog.ts exactly: own localStorage key, gated by the SAME
// `andura-debug` flag (default OFF → cheap early-return no-op, ZERO prod cost),
// kept OUT of firebase.js SYNC_KEYS (never synced — same privacy stance).
//
// Buffer holds the last N=30 traces (one per composed session is plenty). Every
// method is wrapped so it NEVER throws — observation must not break the app.
// jsdom/SSR-safe (all storage access guarded).

import { isDebugEnabled } from './debugLog';

export const SIGNAL_KEY = 'andura-engine-signal';

// Last ~30 session traces — bounds localStorage footprint, keeps export sane.
export const MAX_TRACES = 30;

/** One engine's computed-vs-applied row. Mirrors EngineSignal in the core. */
export interface EngineSignal {
  engineId: string;
  ran: boolean;
  errorCode?: string;
  computed: string[];
  applied: string[];
  dropped: string[];
}

/** One composed-session trace (the shape buildSessionSignalTrace emits). */
export interface SessionSignalTrace {
  v: 1;
  t: number;
  hardHalt: string | null;
  engines: EngineSignal[];
}

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readBuffer(): SessionSignalTrace[] {
  try {
    if (!hasLocalStorage()) return [];
    const raw = localStorage.getItem(SIGNAL_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionSignalTrace[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(traces: SessionSignalTrace[]): void {
  try {
    if (!hasLocalStorage()) return;
    localStorage.setItem(SIGNAL_KEY, JSON.stringify(traces));
  } catch {
    /* quota / serialization failure — drop silently, never break the app */
  }
}

/**
 * Persist one session trace. No-op (cheap early-return) when the debug flag is
 * OFF. Appends to the ring buffer, trimming to the most-recent MAX_TRACES.
 * Wrapped end-to-end: a malformed trace or storage failure can never throw.
 */
function record(trace: SessionSignalTrace | null | undefined): void {
  try {
    if (!isDebugEnabled()) return;
    if (!trace || typeof trace !== 'object') return;
    const buf = readBuffer();
    buf.push(trace);
    const trimmed = buf.length > MAX_TRACES ? buf.slice(buf.length - MAX_TRACES) : buf;
    writeBuffer(trimmed);
  } catch {
    /* observation must never break the app */
  }
}

/** Current buffer contents (oldest → newest). Empty array on any failure. */
function snapshot(): SessionSignalTrace[] {
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
        traces: readBuffer(),
      },
      null,
      2,
    );
  } catch {
    return '{"v":1,"traces":[]}';
  }
}

/** Wipe the buffer (keeps the flag). */
function clear(): void {
  try {
    if (!hasLocalStorage()) return;
    localStorage.removeItem(SIGNAL_KEY);
  } catch {
    /* never throw */
  }
}

export const signalBus = {
  record,
  snapshot,
  exportJson,
  clear,
  isEnabled: isDebugEnabled,
};
