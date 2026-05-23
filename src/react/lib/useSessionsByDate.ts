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
