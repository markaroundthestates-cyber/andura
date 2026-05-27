// ══ SUBSTITUTION — WP-5 moat: equipment-busy / missing / refused → NAMED swap ═
// The key to the moat (P3-MOAT-DESIGN.md §5.3): a blocked or refused exercise
// must produce a VISIBLE, NAMED alternative — never a silent drop or a navigate-
// away. This module is the single seam the UI (Workout in-session swap +
// EquipmentSwap preview recompose) calls to resolve an alternative and shape it
// into a ready-to-render PlannedExercise.
//
// Two resolution paths (mirrors the engine alternativeFinder contract):
//   - EQUIPMENT path (busy / missing): getFallbackCascade(name, availableTypes)
//     — ordered fallback_cascade, degrading to ranking; honest {noAlt} when zero.
//   - PREFERENCE path ("nu vreau"): findAlternatives(name) — ignores equipment
//     (it is a taste decision, not a hard blocker); first ranked alternative.
//
// Names are resolved through toExerciseDisplay (Romanian-first). The swapped
// PlannedExercise re-uses the SAME DP / cold-start prescription path as the
// initial plan so the alternative arrives with real targetKg/targetReps/rest.
//
// Cross-refs:
//   - src/engine/alternativeFinder.js (findAlternatives + getFallbackCascade)
//   - src/engine/equipmentMap.js (availableCoarseTypes — coarse SoT)
//   - 📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md §5

import {
  findAlternatives,
  getFallbackCascade,
} from '../../engine/alternativeFinder.js';
import { getExerciseMetadata } from '../../engine/exerciseLibrary.js';
import {
  availableCoarseTypes,
  COARSE_EQUIPMENT_TYPES,
} from '../../engine/equipmentMap.js';
import { getMissingEquipment } from '../../engine/schedule/scheduleAdapter.js';
import { toExerciseDisplay } from './exerciseDisplay';
import { buildSwappedExercise } from './scheduleAdapterAggregate';
import type { PlannedExercise } from './engineWrappers';

export interface SwapResolution {
  /** The swapped-in alternative, ready to render. null when no alternative. */
  exercise: PlannedExercise | null;
  /** True when an alternative was found and exercise is non-null. */
  swapped: boolean;
  /** Romanian display name of the alternative (empty when none). */
  alternativeName: string;
  /** Romanian display name of the original (what was replaced). */
  originalName: string;
  /** Honest "no good alternative" flag — anti-paternalism, UI offers skip. */
  noAlt: boolean;
}

/**
 * Coarse equipment types currently available to the user, minus the coarse
 * type(s) of ONE temporarily-busy exercise. Used by the in-session "Aparat
 * ocupat" swap: the machine the user is on is unavailable right now, so the
 * alternative must avoid that coarse type. Permanent missing-equipment is also
 * subtracted (the user never has it). bodyweight is always retained.
 *
 * @param busyEngineName English canonical name of the exercise whose equipment
 *   is busy (its coarse type is removed from the available set)
 * @returns coarse equipment_type values available for the substitution search
 */
export function availableTypesExcludingBusy(busyEngineName: string): string[] {
  const base = availableCoarseTypes(getMissingEquipment());
  const busyType = getExerciseMetadata(busyEngineName)?.equipment_type;
  if (typeof busyType !== 'string' || busyType === 'bodyweight') {
    // No meaningful coarse type to exclude (unknown / bodyweight is never busy).
    return base;
  }
  return base.filter((t) => t !== busyType);
}

/**
 * Resolve the EQUIPMENT substitution for an in-session "Aparat ocupat" (the
 * current machine is busy). Traverses the ordered fallback_cascade for an
 * alternative performable without the busy machine's coarse type; degrades to
 * ranking; honest noAlt when nothing fits.
 *
 * @param engineName English canonical name of the current exercise
 * @param exIdx position in the session (for the swapped exercise id slug)
 */
export function resolveBusySwap(engineName: string, exIdx: number): SwapResolution {
  const available = availableTypesExcludingBusy(engineName);
  return resolveCascade(engineName, available, exIdx, 'Aparat ocupat');
}

/**
 * Resolve the EQUIPMENT substitution when the missing-equipment set blocks the
 * current exercise (permanent home-gym constraint surfaced mid-session). Uses
 * the user's full available coarse set (missing already subtracted).
 *
 * @param engineName English canonical name of the current exercise
 * @param exIdx position in the session
 */
export function resolveMissingSwap(engineName: string, exIdx: number): SwapResolution {
  const available = availableCoarseTypes(getMissingEquipment());
  return resolveCascade(engineName, available, exIdx, 'Aparat lipsa');
}

/**
 * Resolve the PREFERENCE substitution for "Nu vreau" — the user does not want
 * this exercise (taste, not a hard blocker), so equipment is IGNORED. Returns
 * the first ranked alternative sharing the muscle target; honest noAlt when the
 * library offers no valid alternative (anti-paternalism — never force inferior).
 *
 * @param engineName English canonical name of the current exercise
 * @param exIdx position in the session
 */
export function resolveRefusalSwap(engineName: string, exIdx: number): SwapResolution {
  const originalName = toExerciseDisplay(engineName).name;
  const { alternatives, shouldSkip } = findAlternatives(engineName) as {
    alternatives: Array<{ name: string }>;
    shouldSkip: boolean;
  };
  if (shouldSkip || alternatives.length === 0) {
    return { exercise: null, swapped: false, alternativeName: '', originalName, noAlt: true };
  }
  const altName = alternatives[0]!.name;
  return {
    exercise: buildSwappedExercise(altName, exIdx, 'Schimbat la cerere'),
    swapped: true,
    alternativeName: toExerciseDisplay(altName).name,
    originalName,
    noAlt: false,
  };
}

/**
 * Shared cascade resolver: run getFallbackCascade and shape the result into a
 * SwapResolution. muscle_group_compose (a 1-2 exercise cascade step) is handled
 * by surfacing the FIRST exercise of the bundle as the swap (the simplest UX
 * that keeps one row = one exercise); the 2-for-1 detail is deferred (flagged in
 * the WP-5 report). noAlt → honest skip.
 */
function resolveCascade(
  engineName: string,
  availableTypes: string[],
  exIdx: number,
  reason: string,
): SwapResolution {
  const originalName = toExerciseDisplay(engineName).name;
  const res = getFallbackCascade(engineName, availableTypes) as {
    exercise?: string;
    exercises?: string[];
    isAlternative: boolean;
    noAlt?: boolean;
  };
  // Original still performable (caller asked but equipment fits) → no swap.
  if (res.isAlternative === false && !res.noAlt && res.exercise === engineName) {
    return { exercise: null, swapped: false, alternativeName: '', originalName, noAlt: false };
  }
  if (res.noAlt) {
    return { exercise: null, swapped: false, alternativeName: '', originalName, noAlt: true };
  }
  // muscle_group_compose returns `exercises` (1-2); surface the first as the swap.
  const altName = res.exercise ?? (Array.isArray(res.exercises) ? res.exercises[0] : undefined);
  if (typeof altName !== 'string' || altName.length === 0) {
    return { exercise: null, swapped: false, alternativeName: '', originalName, noAlt: true };
  }
  return {
    exercise: buildSwappedExercise(altName, exIdx, reason),
    swapped: true,
    alternativeName: toExerciseDisplay(altName).name,
    originalName,
    noAlt: false,
  };
}

/**
 * Recompute a planned exercise LIST with a set of coarse equipment types marked
 * temporarily unavailable (EquipmentSwap "busy" preview). Each exercise that can
 * no longer be performed is replaced via the cascade; performable ones pass
 * through untouched. Exercises with no alternative are kept (the UI shows the
 * honest "fara alternativa" note rather than dropping the row).
 *
 * Pure-ish: reads DP/cold-start/library through buildSwappedExercise; takes the
 * busy coarse types explicitly so the caller controls the "what is unavailable"
 * decision.
 *
 * @param exercises the current planned list
 * @param busyCoarseTypes coarse equipment_type values temporarily unavailable
 */
export function recomposeWithBusyTypes(
  exercises: readonly PlannedExercise[],
  busyCoarseTypes: readonly string[],
): PlannedExercise[] {
  const busy = new Set(busyCoarseTypes);
  const available = COARSE_EQUIPMENT_TYPES.filter((t) => !busy.has(t));
  // bodyweight is never unavailable.
  if (!available.includes('bodyweight')) available.push('bodyweight');
  return exercises.map((ex, idx) => {
    const engineName = ex.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) return ex;
    const res = getFallbackCascade(engineName, available) as {
      exercise?: string;
      exercises?: string[];
      isAlternative: boolean;
      noAlt?: boolean;
    };
    if (res.isAlternative === false) return ex; // performable as-is OR no metadata
    if (res.noAlt) return ex; // honest: keep original, UI notes no alternative
    const altName = res.exercise ?? (Array.isArray(res.exercises) ? res.exercises[0] : undefined);
    if (typeof altName !== 'string' || altName.length === 0) return ex;
    const originalName = toExerciseDisplay(engineName).name;
    return buildSwappedExercise(altName, idx, `${originalName} ocupat`);
  });
}
