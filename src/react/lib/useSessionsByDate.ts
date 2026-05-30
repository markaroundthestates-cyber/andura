// ══ useSessionsByDate — F-istoric-01 hook ════════════════════════════════
// Returns Map<YYYY-MM-DD, LastSessionSummary[]> for the given (year, month0)
// window. Memoized on sessionsHistory + (year, month0) identity. Powers
// CalendarHeatmap month-grid cell-paint lookup.
//
// Map value is array (NOT single session) to preserve multi-session same-day
// patterns (Marius perf gym AM+PM training). Pre-fix collapsed via Map.set
// last-write-wins masking activity in Istoric. Order preserved from input
// sessionsHistory iteration order.
//
// Local-date keying via Date.getFullYear/Month/Date (NOT toISOString — UTC
// would shift cells across midnight in some timezones). Aligns w/ todTs().

import { useMemo } from 'react';
import { useWorkoutStore } from '../stores/workoutStore';
import type { LastSessionSummary } from '../stores/workoutStore';
import { useAerobicStore } from '../stores/aerobicStore';

export function localKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useSessionsByDate(year: number, month0: number): Map<string, LastSessionSummary[]> {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  return useMemo(() => {
    const map = new Map<string, LastSessionSummary[]>();
    const prefix = `${year}-${String(month0 + 1).padStart(2, '0')}`;
    for (const session of sessionsHistory) {
      const key = localKey(session.ts);
      if (!key.startsWith(prefix)) continue;
      const bucket = map.get(key);
      if (bucket) bucket.push(session);
      else map.set(key, [session]);
    }
    return map;
  }, [sessionsHistory, year, month0]);
}

// ══ useAerobicDatesByMonth — aerobic-class day overlay (2026-05-30) ════════
// A SEPARATE visual layer for the calendar: the set of local-ISO dates in the
// (year, month0) window that have at least one logged aerobic class. Aerobic
// sessions live in aerobicStore.sessions (already keyed by `date` YYYY-MM-DD —
// no ts→localKey conversion needed) and carry NO sets/volume/PR, so they MUST
// NOT enter gym aggregates (useSessionsByDate above). This hook keeps them
// fully isolated — the heatmap merges the two only at paint time.
export function useAerobicDatesByMonth(year: number, month0: number): Set<string> {
  const aerobicSessions = useAerobicStore((s) => s.sessions);
  return useMemo(() => {
    const set = new Set<string>();
    const prefix = `${year}-${String(month0 + 1).padStart(2, '0')}`;
    for (const s of aerobicSessions) {
      if (s == null || typeof s.date !== 'string') continue;
      if (s.date.startsWith(prefix)) set.add(s.date);
    }
    return set;
  }, [aerobicSessions, year, month0]);
}
