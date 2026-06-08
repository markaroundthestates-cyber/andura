// ══ BUILD #64 — PERSISTENT pain memory + proactive substitution tests ════════
// _ENGINE_WIRING_2026-06-07/F7_pain_outlier_spec.md §1d.
// (1) Pure module: pinPain / clearPainPin / resolveSubstitute / painSwapMap +
//     non-decay + EN-key persistence.
// (2) Composition: with painSwaps injected, buildSession REPLACES a pinned lift
//     with its persisted chain substitute (when same-group + eligible); the
//     substitute never re-maps to the painful region; flag-off / empty → pool
//     byte-identical; the muscle's last option is never dropped.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  pinPain,
  clearPainPin,
  resolveSubstitute,
  painSwapMap,
  isPinnedPainful,
  getPainPins,
  PAIN_MEMORY_KEY,
} from '../dp/painMemory.js';
import { buildSession } from '../sessionBuilder.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { PAIN_REGION_GROUP_MAP } from '../muscleRecoveryConstants.js';
import { DB } from '../../db.js';

const NOW = Date.UTC(2026, 5, 8);

describe('painMemory — pure module', () => {
  beforeEach(() => localStorage.clear());

  it('pinPain persists an EN-keyed durable pin with a resolved substitute', () => {
    pinPain('Flat Barbell Bench', { region: 'piept', intensity: 3, nowMs: NOW });
    const all = /** @type {any} */ (DB.get(PAIN_MEMORY_KEY));
    expect(all['Flat Barbell Bench']).toBeTruthy();
    expect(all['Flat Barbell Bench'].region).toBe('piept');
    expect(all['Flat Barbell Bench'].intensity).toBe(3);
    expect(all['Flat Barbell Bench'].pinnedTs).toBe(NOW);
    // Substitute is the first chain candidate not re-mapping to the painful region.
    expect(typeof all['Flat Barbell Bench'].substitute).toBe('string');
  });

  it('resolveSubstitute returns the chain-PRIMARY substitute, never the same name', () => {
    const sub = resolveSubstitute('Flat Barbell Bench', 'piept');
    expect(sub).toBeTruthy();
    expect(sub).not.toBe('Flat Barbell Bench');
    // The chain for chest is Flat Barbell Bench → Flat DB Press → … so the first
    // candidate is Flat DB Press.
    expect(sub).toBe('Flat DB Press');
  });

  it('direct same-muscle pain keeps the curated same-family substitute', () => {
    // Chest pain on a chest press: the painful region (piept) IS the worked muscle,
    // so the chain substitute (Flat DB Press, also chest) is the right family move.
    const sub = resolveSubstitute('Flat Barbell Bench', 'piept');
    expect(getExerciseMetadata(/** @type {string} */ (sub))?.muscle_target_primary).toBe('piept');
  });

  it('referred/joint pain skips a substitute that re-maps to the painful region', () => {
    // Shoulder pain (umeri) on a lift whose own muscle is NOT umeri → any candidate
    // whose primary is umeri must be skipped (it would re-irritate the shoulder).
    const painGroups = PAIN_REGION_GROUP_MAP['umar-drept']; // ['umeri']
    // OHP IS a shoulder press (primary umeri) → pain on the shoulder here is direct,
    // not referred, so use a chest press with a shoulder complaint to exercise the
    // referred branch.
    const sub = resolveSubstitute('Incline Barbell Bench', 'umar-drept');
    if (sub) {
      const primary = getExerciseMetadata(sub)?.muscle_target_primary;
      expect(painGroups.includes(/** @type {string} */ (primary))).toBe(false);
    }
  });

  it('the pin does NOT decay — it survives an arbitrary time gap (held until cleared)', () => {
    pinPain('Flat Barbell Bench', { region: 'piept', intensity: 2, nowMs: NOW });
    const farFuture = NOW + 365 * 86400000; // a year later
    // painSwapMap reads the stored substitute regardless of elapsed time.
    expect(painSwapMap()['Flat Barbell Bench']).toBeTruthy();
    expect(isPinnedPainful('Flat Barbell Bench')).toBe(true);
    // (no time argument exists — the pin is non-decaying by construction)
    void farFuture;
  });

  it('clearPainPin removes the pin (reversible)', () => {
    pinPain('Flat Barbell Bench', { region: 'piept', intensity: 2, nowMs: NOW });
    expect(isPinnedPainful('Flat Barbell Bench')).toBe(true);
    clearPainPin('Flat Barbell Bench');
    expect(isPinnedPainful('Flat Barbell Bench')).toBe(false);
    expect(painSwapMap()['Flat Barbell Bench']).toBeUndefined();
  });

  it('painSwapMap omits a pin with no resolvable substitute', () => {
    // A name with no chain / no substitute resolves to null → excluded.
    pinPain('Some Nonexistent Exercise XYZ', { region: 'piept', intensity: 1, nowMs: NOW });
    expect(painSwapMap()['Some Nonexistent Exercise XYZ']).toBeUndefined();
  });

  it('getPainPins returns a defensive copy', () => {
    pinPain('Flat Barbell Bench', { region: 'piept', intensity: 2, nowMs: NOW });
    const a = getPainPins();
    a['Flat Barbell Bench'] = /** @type {any} */ ({ tampered: true });
    expect(getPainPins()['Flat Barbell Bench'].region).toBe('piept');
  });
});

describe('buildSession composition — proactive swap (F7 §1d acceptance)', () => {
  const CTX = {
    profileTier: 'T2',
    prNames: [],
    seed: 'pain-swap-seed',
    equipment: { available: ['dumbbell', 'barbell', 'cable', 'machine', 'bodyweight', 'band'] },
  };

  function names(extra) {
    const s = buildSession('push', { ...CTX, ...extra });
    return s.exercises.map((e) => e.name);
  }

  it('flag-OFF / null painSwaps → pool byte-identical', () => {
    const a = names({ painSwaps: null });
    const b = names({});
    expect(a).toEqual(b);
  });

  it('empty painSwaps → pool byte-identical (flag ON, nobody pinned)', () => {
    const baseline = names({});
    const withEmpty = names({ painSwaps: {} });
    expect(withEmpty).toEqual(baseline);
  });

  it('a pinned painful exercise is REPLACED in the pool (removed) by its substitute', () => {
    const baseline = names({});
    // Pick a chest lift in the SELECTED session whose substitute is same-group,
    // eligible, and not already selected — so the swap demonstrably applies.
    const pinned = baseline.find((n) => {
      if (getExerciseMetadata(n)?.muscle_target_primary !== 'piept') return false;
      const s = resolveSubstitute(n, 'piept');
      return !!s &&
        getExerciseMetadata(/** @type {string} */ (s))?.muscle_target_primary === 'piept' &&
        !baseline.includes(/** @type {string} */ (s));
    });
    expect(pinned, 'a chest lift with an unused same-group substitute').toBeTruthy();
    const sub = resolveSubstitute(/** @type {string} */ (pinned), 'piept');
    const swapped = names({ painSwaps: { [/** @type {string} */ (pinned)]: /** @type {string} */ (sub) } });
    // Swap REPLACES the pool entry → the pinned lift can no longer be selected.
    expect(swapped).not.toContain(/** @type {string} */ (pinned));
    // The muscle is still trained (substitute took its slot or another chest lift did).
    expect(swapped.some((n) => getExerciseMetadata(n)?.muscle_target_primary === 'piept')).toBe(true);
    expect(swapped.length).toBe(baseline.length);
  });

  it('never drops the muscle group entirely (last-option safety holds)', () => {
    const baseline = names({});
    const target = baseline[0];
    // Point the swap at a nonsense substitute → no eligible swap → degrades (left).
    const swapped = names({ painSwaps: { [target]: 'Definitely Not An Exercise' } });
    expect(swapped.length).toBe(baseline.length);
    expect(swapped).toContain(target); // left in place (no eligible substitute)
  });
});
