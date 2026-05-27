// ══ SUBSTITUTION TESTS — WP-5 moat: NAMED alternative, not a drop ════════════
// Drives the substitution seam with REAL library names so the test fails if the
// cascade/ranking ever stops producing a named alternative (anti-recurrence of
// the audit's "verde pe gol" — green tests on an empty feature).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveBusySwap,
  resolveRefusalSwap,
  resolveMissingSwap,
  recomposeWithBusyTypes,
  availableTypesExcludingBusy,
} from '../../lib/substitution';
import type { PlannedExercise } from '../../lib/engineWrappers';

beforeEach(() => {
  localStorage.clear();
});

describe('resolveBusySwap — equipment cascade produces a NAMED alternative', () => {
  it('barbell exercise + barbell busy → named machine/dumbbell alternative (not a drop)', () => {
    // Incline Barbell Bench (barbell) → cascade first step Smith Incline Bench
    // (machine), reachable when barbell is the busy type.
    const res = resolveBusySwap('Incline Barbell Bench', 0);
    expect(res.swapped).toBe(true);
    expect(res.noAlt).toBe(false);
    expect(res.exercise).not.toBeNull();
    // NAMED — the whole point of the moat. Romanian display, non-empty.
    expect(res.alternativeName.length).toBeGreaterThan(0);
    expect(res.alternativeName).not.toBe(res.originalName);
    // The swapped exercise carries a swap marker for the UI sub slot.
    expect(res.exercise?.swapReason).toBeTruthy();
    expect(res.exercise?.engineName).toBeTruthy();
  });

  it('availableTypesExcludingBusy removes the busy coarse type', () => {
    const avail = availableTypesExcludingBusy('Incline Barbell Bench'); // barbell
    expect(avail).not.toContain('barbell');
    expect(avail).toContain('bodyweight'); // bodyweight always retained
  });
});

describe('resolveRefusalSwap — preference path (ignores equipment)', () => {
  it('Incline DB Press refused → ranked same-muscle alternative, named', () => {
    const res = resolveRefusalSwap('Incline DB Press', 0);
    expect(res.swapped).toBe(true);
    expect(res.alternativeName.length).toBeGreaterThan(0);
    expect(res.alternativeName).not.toBe(res.originalName);
    expect(res.exercise?.swapReason).toBeTruthy();
  });

  it('unknown / no-alternative exercise → honest noAlt (anti-paternalism skip)', () => {
    const res = resolveRefusalSwap('Totally Made Up Movement XYZ', 0);
    expect(res.swapped).toBe(false);
    expect(res.noAlt).toBe(true);
    expect(res.exercise).toBeNull();
  });
});

describe('resolveMissingSwap — permanent missing equipment mid-session', () => {
  it('barbell missing (persisted) → barbell exercise resolves to a named alternative', () => {
    localStorage.setItem('wv2-missing-equipment', JSON.stringify(['bara-halterelor']));
    const res = resolveMissingSwap('Incline Barbell Bench', 0);
    expect(res.swapped).toBe(true);
    expect(res.alternativeName.length).toBeGreaterThan(0);
  });
});

describe('recomposeWithBusyTypes — list recompose never drops a row', () => {
  const list: PlannedExercise[] = [
    {
      id: 'a-0',
      name: 'inclinat cu bara',
      engineName: 'Incline Barbell Bench',
      sets: 3,
      targetReps: 8,
      targetKg: 60,
      restSec: 90,
    },
    {
      id: 'b-1',
      name: 'Impins inclinat',
      engineName: 'Incline DB Press',
      sets: 3,
      targetReps: 10,
      targetKg: 22,
      restSec: 90,
    },
  ];

  it('barbell busy → barbell row swapped (named), other rows untouched, length preserved', () => {
    const out = recomposeWithBusyTypes(list, ['barbell']);
    expect(out).toHaveLength(list.length); // NO drop
    // The barbell row was replaced with a named alternative + swap marker.
    expect(out[0]!.name).not.toBe(list[0]!.name);
    expect(out[0]!.swapReason).toContain('ocupat');
    // The dumbbell row (performable) passes through unchanged.
    expect(out[1]!.name).toBe(list[1]!.name);
  });

  it('no busy types → list passes through identical', () => {
    const out = recomposeWithBusyTypes(list, []);
    expect(out[0]!.name).toBe(list[0]!.name);
    expect(out[1]!.name).toBe(list[1]!.name);
  });

  it('exercise without engineName is left untouched (defensive)', () => {
    const noEngine: PlannedExercise[] = [
      { id: 'x-0', name: 'Misterios', sets: 3, targetReps: 10, targetKg: 10, restSec: 90 },
    ];
    const out = recomposeWithBusyTypes(noEngine, ['barbell', 'dumbbell', 'machine', 'cable']);
    expect(out[0]!.name).toBe('Misterios');
  });
});
