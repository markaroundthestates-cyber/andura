// ══ SUBSTITUTION TESTS — WP-5 moat: NAMED alternative, not a drop ════════════
// Drives the substitution seam with REAL library names so the test fails if the
// cascade/ranking ever stops producing a named alternative (anti-recurrence of
// the audit's "verde pe gol" — green tests on an empty feature).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveBusySwap,
  resolveRefusalSwap,
  resolveMissingSwap,
  resolveSwapPickList,
  recomposeWithBusyTypes,
  availableTypesExcludingBusy,
} from '../../lib/substitution';
import { movementKey } from '../../../engine/sessionBuilder.js';
import { getExerciseMetadata } from '../../../engine/exerciseLibrary.js';
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

// ── BUG 5 — a busy-swap never returns a movement already pending elsewhere ──
// Root cause: the cascade picked the alternative for THAT exercise alone, blind
// to the rest of the session, so it could hand back a chest-fly variant whose
// movement already lives later in the plan (user got a chest fly twice).
describe('resolveBusySwap — BUG 5 excludeNames (movement-aware)', () => {
  const mk = (name: string) => movementKey(name, getExerciseMetadata(name));

  it('without excludes, a busy chest fly resolves to ANOTHER fly (the bug)', () => {
    const res = resolveBusySwap('Cable Fly', 0);
    expect(res.swapped).toBe(true);
    // Documents the pre-fix collision surface: the natural cascade pick is itself
    // a chest-fly movement (same movementKey as the original).
    expect(mk(res.exercise!.engineName as string)).toBe(mk('Cable Fly'));
  });

  it('with the other fly variants excluded, the swap is a DIFFERENT movement', () => {
    const otherFlyes = [
      'DB Fly', 'Incline DB Fly', 'Decline DB Fly', 'Pec Deck / Cable Fly',
      'Cable Fly Mid', 'Incline Cable Fly', 'Single-Arm Cable Fly',
      'Cable Fly Low-to-High', 'Decline Cable Fly', 'Cable Pec Deck',
      'Floor DB Fly', 'Single-Arm DB Fly',
    ];
    const res = resolveBusySwap('Cable Fly', 0, otherFlyes);
    expect(res.swapped).toBe(true);
    const altKey = mk(res.exercise!.engineName as string);
    // The result is NOT a fly movement, and collides with none of the excludes.
    expect(altKey).not.toBe(mk('Cable Fly'));
    for (const ex of otherFlyes) expect(altKey).not.toBe(mk(ex));
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

  // Daniel smoke 2026-05-28 (#3.2) — tier-1 high-force lifts (Cheat Curl Barbell)
  // whose 2 curated equipment_alternatives include lower force_demand entries
  // used to dead-end at shouldSkip:true via the tier-1 strict rule. The broad
  // refusal pool bypasses the strict rule (refusal != equipment failure) so the
  // user always sees a named same-muscle candidate.
  it('Cheat Curl Barbell (tier-1) refused → surfaces a named biceps alternative (no noAlt)', () => {
    const res = resolveRefusalSwap('Cheat Curl Barbell', 0);
    expect(res.swapped).toBe(true);
    expect(res.noAlt).toBeFalsy();
    expect(res.alternativeName.length).toBeGreaterThan(0);
    expect(res.alternativeName).not.toBe(res.originalName);
  });

  // Daniel smoke 2026-05-28 (#2 + #6) — exhaustive cycle. The triedNames
  // parameter excludes already-offered candidates so each tap gives a NEW one.
  it('triedNames skip — consecutive refusals never repeat the same candidate', () => {
    const seen = new Set<string>();
    let tried: string[] = ['Incline DB Press']; // original is implicit-tried
    for (let i = 0; i < 6; i++) {
      const res = resolveRefusalSwap('Incline DB Press', 0, tried);
      if (!res.swapped) break;
      const name = res.alternativeEngineName!;
      expect(name).toBeDefined();
      expect(seen.has(name)).toBe(false); // never repeat
      seen.add(name);
      tried = [...tried, name];
    }
    // Sanity — broad pool yields well over 2 candidates for chest muscle.
    expect(seen.size).toBeGreaterThan(2);
  });

  // Daniel smoke 2026-05-28 (#6) — pool-exhausted surface. When every same-
  // muscle alternative has been tried, returns poolExhausted:true + muscleGroup.
  it('exhausted pool returns poolExhausted:true with the RO muscle group label', () => {
    // Saturate by walking until empty
    let tried: string[] = [];
    for (let i = 0; i < 100; i++) {
      const r = resolveRefusalSwap('Incline DB Press', 0, tried);
      if (!r.swapped) break;
      tried = [...tried, r.alternativeEngineName!];
    }
    const res = resolveRefusalSwap('Incline DB Press', 0, tried);
    expect(res.swapped).toBe(false);
    expect(res.poolExhausted).toBe(true);
    expect(res.muscleGroup).toBeDefined();
    expect(res.muscleGroup!.length).toBeGreaterThan(0);
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

// ══ resolveSwapPickList — founder manual pick-list shaping ═══════════════════
// Shapes the engine buildSwapPickList ranking into renderable PlannedExercise
// rows (real DP prescription). Pins the UI contract: short ranked list, distinct
// pre-pick row 0, exactly one bodyweight when the muscle has one, RO names.
describe('resolveSwapPickList — manual pick-list rows', () => {
  it('returns SHORT (4-5) ranked rows with row 0 = pre-pick + a RO display name + real prescription', () => {
    const { rows, originalName, muscleGroup } = resolveSwapPickList('Flat Barbell Bench', 0);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBeLessThanOrEqual(5);
    expect(rows[0]!.prePick).toBe(true);
    expect(rows.filter((r) => r.prePick).length).toBe(1);
    // Each row is a ready-to-render alternative: RO display name + engine key +
    // a real swapped PlannedExercise (carries swapReason + engineName).
    for (const r of rows) {
      expect(r.displayName.length).toBeGreaterThan(0);
      expect(r.engineName.length).toBeGreaterThan(0);
      expect(r.exercise.swapReason).toBeTruthy();
      expect(r.exercise.engineName).toBeTruthy();
    }
    expect(originalName.length).toBeGreaterThan(0);
    expect(muscleGroup.length).toBeGreaterThan(0);
  });

  it('pre-pick is NOT a near-duplicate twin (Pec Deck / Cable Fly never pre-picks Cable Fly)', () => {
    const { rows } = resolveSwapPickList('Pec Deck / Cable Fly', 0, ['Flat DB Press']);
    expect(rows[0]!.engineName).not.toBe('Cable Fly');
    expect(rows[0]!.engineName).not.toBe('Pec Deck / Cable Fly');
  });

  it('guarantees EXACTLY one bodyweight row when the muscle has one (chest)', () => {
    const { rows } = resolveSwapPickList('Flat Barbell Bench', 0);
    expect(rows.filter((r) => r.isBodyweight).length).toBe(1);
  });

  it('OMITS bodyweight (no fabrication) when the muscle has none (biceps)', () => {
    const { rows } = resolveSwapPickList('Cable Curl', 0);
    expect(rows.filter((r) => r.isBodyweight).length).toBe(0);
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it('excludes the session + the per-slot tried-set (no duplicate/no re-offer)', () => {
    const inSession = ['Cable Fly', 'Flat DB Press'];
    const tried = ['Incline DB Press'];
    const { rows } = resolveSwapPickList('Flat Barbell Bench', 0, inSession, tried);
    const names = rows.map((r) => r.engineName);
    for (const n of [...inSession, ...tried]) expect(names).not.toContain(n);
  });

  it('honest empty rows when the exercise has no metadata (UI falls to skip)', () => {
    const { rows, muscleGroup } = resolveSwapPickList('Totally Fake Exercise', 0);
    expect(rows).toEqual([]);
    expect(muscleGroup).toBe('');
  });
});
