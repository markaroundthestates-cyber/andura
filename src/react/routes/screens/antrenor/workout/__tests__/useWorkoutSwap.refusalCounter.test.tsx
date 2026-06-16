// ══ useWorkoutSwap — BUSY swap must NOT count as a taste refusal ═══════════
// §C6 audit fix verify. The pick-list is entered from TWO reasons: the taste
// "Nu vreau" path AND the equipment-busy "Ocupat" fallback. handlePickRow used
// to incrementRefusal() on EVERY manual pick, so a busy swap wrote the {n,ts}
// that getRefusalPenalties turns into a ~10-day soft compose-demote — "the
// machine was busy once" made the coach stop programming the exercise. The fix
// threads a `reason` on the pick-sheet and increments the counter ONLY on the
// taste-refusal path. Uses the REAL refusal-counter storage (localStorage) so
// the assertion proves the persisted penalty is/ isn't written.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useWorkoutSwap, type UseWorkoutSwapArgs } from '../useWorkoutSwap';
import { getRefusalCounter } from '../../../../../../engine/schedule/scheduleAdapter.js';
import type { PlannedExercise } from '../../../../../lib/engineWrappers';

// A real CORE_AUTO chest exercise so resolveSwapPickList returns a populated list.
const ENGINE_NAME = 'Flat Barbell Bench';

function makeExercise(): PlannedExercise {
  return {
    id: 'ex-0',
    name: 'Impins la piept cu bara',
    engineName: ENGINE_NAME,
    sets: 3,
    targetReps: 8,
    targetKg: 60,
    restSec: 120,
  } as PlannedExercise;
}

function makeArgs(overrides: Partial<UseWorkoutSwapArgs> = {}): UseWorkoutSwapArgs {
  const current = makeExercise();
  return {
    exercises: [current],
    safeExIdx: 0,
    currentExercise: current,
    refusalTriedByEx: {},
    markRefusalTried: vi.fn(),
    swapExercise: vi.fn(),
    dropExercise: vi.fn(),
    deferExercise: vi.fn(),
    setExercises: vi.fn(),
    currentSetIdx: 0,
    bumpActivity: vi.fn(),
    advanceOrFinish: vi.fn(),
    navigate: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('useWorkoutSwap — busy swap does not touch the refusal counter', () => {
  it('busy "Ocupat" fallback → pick → incrementRefusal NOT called (no penalty written)', () => {
    // Single-exercise session → handleOcupat has nothing to defer behind, so it
    // falls back to the swap pick-list with reason 'busy'.
    const { result } = renderHook(() => useWorkoutSwap(makeArgs()));

    act(() => {
      result.current.handleOcupat();
    });
    expect(result.current.pickSheet.open).toBe(true);
    expect(result.current.pickSheet.reason).toBe('busy');
    const row = result.current.pickSheet.rows[0]!;
    expect(row).toBeTruthy();

    act(() => {
      result.current.handlePickRow(row);
    });

    // The HARD blocker must NOT write a refusal penalty for the original.
    expect(getRefusalCounter()[ENGINE_NAME]).toBeUndefined();
  });

  it('taste "Nu vreau" → pick → incrementRefusal IS called (penalty written)', () => {
    const { result } = renderHook(() => useWorkoutSwap(makeArgs()));

    act(() => {
      result.current.handleNuVreau();
    });
    expect(result.current.pickSheet.open).toBe(true);
    expect(result.current.pickSheet.reason).toBe('refusal');
    const row = result.current.pickSheet.rows[0]!;
    expect(row).toBeTruthy();

    act(() => {
      result.current.handlePickRow(row);
    });

    // The taste refusal DOES write the penalty for the original.
    expect(getRefusalCounter()[ENGINE_NAME]).toBe(1);
  });
});
