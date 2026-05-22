// ══ useSessionsByDate TESTS — F-istoric-01 hook ══════════════════════════
// Tests both localKey pure util + memoized hook via renderHook.

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionsByDate, localKey } from '../../lib/useSessionsByDate';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';

function makeSession(ts: number): LastSessionSummary {
  return { title: 'T', meta: '', ts, exercises: [] };
}

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
});

describe('localKey', () => {
  it('formats YYYY-MM-DD local from ts', () => {
    const ts = new Date(2026, 4, 15, 10, 30).getTime(); // Mai 15 2026
    expect(localKey(ts)).toBe('2026-05-15');
  });

  it('pads single-digit month + day', () => {
    const ts = new Date(2026, 0, 3, 10, 0).getTime(); // Ian 3
    expect(localKey(ts)).toBe('2026-01-03');
  });
});

describe('useSessionsByDate', () => {
  it('returns empty map when no sessions in month', () => {
    const { result } = renderHook(() => useSessionsByDate(2026, 4));
    expect(result.current.size).toBe(0);
  });

  it('filters sessions to (year, month0) and keys by local YYYY-MM-DD', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSession(new Date(2026, 4, 5).getTime()),  // Mai 5
        makeSession(new Date(2026, 4, 20).getTime()), // Mai 20
        makeSession(new Date(2026, 5, 1).getTime()),  // Iunie 1 (excluded)
      ],
    });
    const { result } = renderHook(() => useSessionsByDate(2026, 4));
    expect(result.current.size).toBe(2);
    expect(result.current.has('2026-05-05')).toBe(true);
    expect(result.current.has('2026-05-20')).toBe(true);
    expect(result.current.has('2026-06-01')).toBe(false);
  });

  it('excludes sessions from different year', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSession(new Date(2025, 4, 5).getTime()),
        makeSession(new Date(2026, 4, 5).getTime()),
      ],
    });
    const { result } = renderHook(() => useSessionsByDate(2026, 4));
    expect(result.current.size).toBe(1);
    expect(result.current.has('2026-05-05')).toBe(true);
  });
});
