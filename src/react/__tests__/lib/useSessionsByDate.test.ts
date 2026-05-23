// ══ useSessionsByDate TESTS — F-istoric-01 hook ══════════════════════════
// Tests both localKey pure util + memoized hook via renderHook.

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionsByDate, localKey } from '../../lib/useSessionsByDate';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';

function makeSession(ts: number, title = 'T'): LastSessionSummary {
  return { title, meta: '', ts, exercises: [] };
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
    const may5 = result.current.get('2026-05-05');
    expect(may5).toBeDefined();
    expect(may5).toHaveLength(1);
  });

  it('preserves multiple same-day sessions in array (Marius AM+PM pattern)', () => {
    // Marius perf gym: AM 07:00 push + PM 19:00 pull, same day.
    const amTs = new Date(2026, 4, 10, 7, 0).getTime();
    const pmTs = new Date(2026, 4, 10, 19, 0).getTime();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSession(amTs, 'Push AM'),
        makeSession(pmTs, 'Pull PM'),
      ],
    });
    const { result } = renderHook(() => useSessionsByDate(2026, 4));
    const may10 = result.current.get('2026-05-10');
    expect(may10).toBeDefined();
    expect(may10).toHaveLength(2);
    const [first, second] = may10 ?? [];
    expect(first?.title).toBe('Push AM');
    expect(second?.title).toBe('Pull PM');
  });

  it('preserves 3+ sessions same day (edge case ultra-perf)', () => {
    const day = new Date(2026, 4, 12).getTime();
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSession(day, 'S1'),
        makeSession(day + 1000, 'S2'),
        makeSession(day + 2000, 'S3'),
      ],
    });
    const { result } = renderHook(() => useSessionsByDate(2026, 4));
    expect(result.current.get('2026-05-12')).toHaveLength(3);
  });
});
