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
//   - PREFERENCE path ("nu vreau"): findRefusalPool(name, triedNames) — ignores
//     equipment (taste decision) AND bypasses tier-1 strict, returning the FULL
//     broad-library same-muscle ranking minus the per-exIdx tried-set so the UI
//     cycles through every candidate ONCE before showing "ai incercat tot"
//     (Daniel smoke 2026-05-28 #2 + #6 + #3.2 — exhaustive cycle, no ping-pong).
//
// Names are resolved through toExerciseDisplay (Romanian-first). The swapped
// PlannedExercise re-uses the SAME DP / cold-start prescription path as the
// initial plan so the alternative arrives with real targetKg/targetReps/rest.
//
// Cross-refs:
//   - src/engine/alternativeFinder.js (findRefusalPool + getFallbackCascade)
//   - src/engine/equipmentMap.js (availableCoarseTypes — coarse SoT)
//   - 📥_inbox/wiring-audit-2026-05-26/P3-MOAT-DESIGN.md §5

import {
  buildSwapPickList,
  findRefusalPool,
  getFallbackCascade,
} from '../../engine/alternativeFinder.js';
import { getExerciseMetadata } from '../../engine/exerciseLibrary.js';
import { movementKey } from '../../engine/sessionBuilder.js';
import {
  availableCoarseTypes,
  COARSE_EQUIPMENT_TYPES,
} from '../../engine/equipmentMap.js';
import {
  getMissingEquipment,
  isEquipmentMissingExercise,
} from '../../engine/schedule/scheduleAdapter.js';
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
  /**
   * Daniel smoke 2026-05-28 (#2 + #6) — "Nu vreau" exhaustive cycle. True when
   * the user has tried every same-muscle alternative we can offer this session
   * (refusal path only — equipment paths never set this). UI surfaces "ai
   * incercat tot ce pot oferi pentru [muscleGroup]" + offers skip / change
   * group. Mutually exclusive with `swapped:true` (you can't be exhausted AND
   * have a new candidate at the same time).
   */
  poolExhausted?: boolean;
  /**
   * Daniel smoke 2026-05-28 (#2 + #6) — RO display muscle group label used in
   * the pool-exhausted copy ("ai incercat tot pentru BICEPS"). Set only on the
   * refusal path; absent for equipment paths. Falls to '' when no metadata.
   */
  muscleGroup?: string;
  /**
   * Daniel smoke 2026-05-28 (#2 + #6) — English canonical engine name of the
   * alternative (the caller appends this to the per-exIdx refusal-tried set so
   * the NEXT "Nu vreau" tap skips it). Refusal path only. Empty when noAlt /
   * poolExhausted.
   */
  alternativeEngineName?: string;
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
 * BUG 5 — `excludeNames` are the still-PENDING (not-yet-completed) exercises in
 * the session: a swap result that duplicates one of them (same name OR same
 * movement) is rejected in favor of the next candidate, so the cascade can never
 * hand back a movement that already lives later in the plan. Optional with a safe
 * default ([]) so existing callers keep working unchanged.
 *
 * @param engineName English canonical name of the current exercise
 * @param exIdx position in the session (for the swapped exercise id slug)
 * @param excludeNames English canonical names already present / pending elsewhere
 */
export function resolveBusySwap(
  engineName: string,
  exIdx: number,
  excludeNames: readonly string[] = [],
): SwapResolution {
  const available = availableTypesExcludingBusy(engineName);
  return resolveCascade(engineName, available, exIdx, 'Aparat ocupat', excludeNames);
}

/**
 * Resolve the EQUIPMENT substitution when the missing-equipment set blocks the
 * current exercise (permanent home-gym constraint surfaced mid-session). Uses
 * the user's full available coarse set (missing already subtracted).
 *
 * @param engineName English canonical name of the current exercise
 * @param exIdx position in the session
 */
export function resolveMissingSwap(
  engineName: string,
  exIdx: number,
  excludeNames: readonly string[] = [],
): SwapResolution {
  const available = availableCoarseTypes(getMissingEquipment());
  return resolveCascade(engineName, available, exIdx, 'Aparat lipsa', excludeNames);
}

// Daniel smoke 2026-05-28 (#3.3 etc) — RO display labels for engine muscle
// targets so the "ai incercat tot pentru [muscleGroup]" copy reads naturally.
// Keys MUST match the actual EXERCISE_METADATA muscle_target_primary values;
// misses fall to the raw key as a defensive last-line baseline. NO_DIACRITICS.
//
// Recon Section C fix (2026-06-05): the prior map carried DEAD keys that no
// CORE_AUTO entry ever uses (`picioare-fesieri`, `picioare-gambe`, `fesieri`,
// `abdomen`, `oblici`, `trapezi`, `cardio`, `corp-intreg`), while the REAL keys
// (`fese`, `core`, `gambe`) were missing or mis-spelled — so a refusal on a
// glute/core/calf movement fell through to the raw key ("fese"/"core") in the
// exhausted-pool copy. Realigned to the 11 muscle groups actually present in the
// active set (verified against exercises.json CORE_AUTO).
const MUSCLE_GROUP_RO: Readonly<Record<string, string>> = {
  piept: 'piept',
  spate: 'spate',
  umeri: 'umeri',
  biceps: 'biceps',
  triceps: 'triceps',
  antebrate: 'antebrate',
  'picioare-quads': 'cvadriceps',
  'picioare-hamstrings': 'hamstring',
  gambe: 'gambe',
  fese: 'fesieri',
  core: 'abdomen',
};

function muscleGroupLabel(key: string): string {
  return MUSCLE_GROUP_RO[key] ?? key.replace(/-/g, ' ');
}

/**
 * Resolve the PREFERENCE substitution for "Nu vreau" — the user does not want
 * this exercise (taste, not a hard blocker), so equipment is IGNORED. Daniel
 * smoke 2026-05-28 (#2 + #6 + #3.2) — returns an EXHAUSTIVE same-muscle pool
 * cycled one-at-a-time across the session: the caller passes the per-exIdx
 * `triedNames` (from workoutStore.refusalTriedByEx[exIdx]) and we return the
 * first not-yet-tried candidate from the broad 657-library same-muscle ranking.
 *
 * When the pool runs out, returns `poolExhausted:true` + `muscleGroup` (RO
 * label) so the UI can show "ai incercat tot ce pot oferi pentru [muscleGroup]"
 * + offer skip / change group (anti-paternalism — we never force inferior).
 *
 * Tier-1 strict rule is NOT enforced here (unlike equipment paths): "Nu vreau"
 * is a taste decision, not equipment failure, so e.g. Cheat Curl Barbell (tier
 * 1) honestly opens onto every biceps variant — Daniel #3.2 (no alternatives
 * surfaced on Flexii cu avant cu bara was caused by the strict rule kicking in
 * when only 2 curated alts existed; the broad pool here bypasses it entirely
 * because refusal != "you can't perform this", it's "you don't want this").
 *
 * @param engineName English canonical name of the current exercise
 * @param exIdx position in the session (for the swapped exercise id slug)
 * @param triedNames English canonical names already refused this session (the
 *   original + every prior swap); caller tracks via workoutStore. Defaults to
 *   [] (cold first refusal) so callers / tests that don't track yet still work.
 */
export function resolveRefusalSwap(
  engineName: string,
  exIdx: number,
  triedNames: readonly string[] = [],
): SwapResolution {
  const originalName = toExerciseDisplay(engineName).name;
  const { candidates, muscleGroup } = findRefusalPool(
    engineName,
    triedNames as string[],
  ) as { candidates: Array<{ name: string }>; muscleGroup: string };

  // Honest noAlt — original has no metadata or muscle target is unknown
  // (cannot build a same-muscle pool). Distinct from poolExhausted (we COULD
  // never have offered anything).
  if (muscleGroup === 'unknown') {
    return {
      exercise: null,
      swapped: false,
      alternativeName: '',
      originalName,
      noAlt: true,
    };
  }

  // Pool exhausted — every same-muscle alternative tried this session.
  if (candidates.length === 0) {
    return {
      exercise: null,
      swapped: false,
      alternativeName: '',
      originalName,
      noAlt: false,
      poolExhausted: true,
      muscleGroup: muscleGroupLabel(muscleGroup),
    };
  }

  const altName = candidates[0]!.name;
  return {
    exercise: buildSwappedExercise(altName, exIdx, 'Schimbat la cerere'),
    swapped: true,
    alternativeName: toExerciseDisplay(altName).name,
    alternativeEngineName: altName,
    originalName,
    noAlt: false,
    muscleGroup: muscleGroupLabel(muscleGroup),
  };
}

// ══ SWAP PICK-LIST — founder redesign 2026-06-05 (manual short list) ════════
export interface SwapPickRow {
  /** Ready-to-render alternative (real DP/cold-start prescription). */
  exercise: PlannedExercise;
  /** English canonical engine name (for the tried-set + dedup). */
  engineName: string;
  /** RO display name (sheet row label). */
  displayName: string;
  /** True for ROW 1 — the pre-selected smart default. */
  prePick: boolean;
  /** True when this is the single universal-fallback bodyweight row. */
  isBodyweight: boolean;
}

export interface SwapPickList {
  /** Ranked 4-5 rows (row 0 = prePick). Empty when no same-muscle option. */
  rows: SwapPickRow[];
  /** RO display name of the original being replaced. */
  originalName: string;
  /** RO muscle-group label (header copy). '' when unknown. */
  muscleGroup: string;
}

/**
 * Build the manual swap PICK-LIST for the current exercise (founder redesign).
 * Wraps the engine buildSwapPickList ranking into renderable PlannedExercise
 * rows. The UI renders these as a short sheet and lets the user pick any row;
 * row 0 (`prePick:true`) is the default. Equipment is IGNORED here — the
 * pick-list is the user's deliberate choice (busy / "want something else"), the
 * same taste-decision semantics as the old refusal path. Honest empty `rows`
 * when the muscle has no same-muscle active alternative (UI falls to skip).
 *
 * @param engineName English canonical name of the exercise to replace
 * @param exIdx position in the session (for each row's swapped id slug)
 * @param excludeNames English canonical names already in today's session (any
 *   slot) — never offered (no duplicate-in-session, ever)
 * @param triedNames English canonical names already tried/busy at THIS slot —
 *   drives diversify-modality + excluded from the list (never re-offered)
 */
export function resolveSwapPickList(
  engineName: string,
  exIdx: number,
  excludeNames: readonly string[] = [],
  triedNames: readonly string[] = [],
): SwapPickList {
  const originalName = toExerciseDisplay(engineName).name;
  const { items, muscleGroup } = buildSwapPickList(
    engineName,
    excludeNames as string[],
    triedNames as string[],
  ) as {
    items: Array<{ name: string; prePick: boolean; isBodyweight: boolean }>;
    muscleGroup: string;
  };

  if (muscleGroup === 'unknown' || items.length === 0) {
    return { rows: [], originalName, muscleGroup: '' };
  }

  // §C6 audit fix — subtract the per-exercise equipment-missing set (the SPECIFIC
  // names the user marked "Aparat lipsa", canonical-aware via
  // isEquipmentMissingExercise) so the swap never re-offers an exercise the
  // composition pipeline (getDailyWorkout under dp_equipment_memory_v1) hard-
  // excludes. LAST-OPTION guarded, mirroring buildSession: if filtering empties
  // the pool (the muscle has ONLY equipment-missing candidates), keep the
  // unfiltered list rather than strand the user with no row.
  const offerable = items.filter((it) => !isEquipmentMissingExercise(it.name));
  const usable = offerable.length > 0 ? offerable : items;

  const rows: SwapPickRow[] = usable.map((it) => ({
    exercise: buildSwappedExercise(it.name, exIdx, 'Schimbat la cerere'),
    engineName: it.name,
    displayName: toExerciseDisplay(it.name).name,
    prePick: it.prePick,
    isBodyweight: it.isBodyweight,
  }));

  return { rows, originalName, muscleGroup: muscleGroupLabel(muscleGroup) };
}

/**
 * Movement key for an engine name (BUG 5) — single source of truth in
 * sessionBuilder so the swap layer dedups movements the SAME way the session
 * builder does. Unknown metadata falls back to a name-unique key.
 */
function movementKeyOf(engineName: string): string {
  return movementKey(engineName, getExerciseMetadata(engineName) ?? {});
}

/**
 * Shared cascade resolver: run getFallbackCascade and shape the result into a
 * SwapResolution. muscle_group_compose (a 1-2 exercise cascade step) is handled
 * by surfacing the FIRST exercise of the bundle as the swap (the simplest UX
 * that keeps one row = one exercise); the 2-for-1 detail is deferred (flagged in
 * the WP-5 report). noAlt → honest skip.
 *
 * BUG 5 — `excludeNames` are the still-pending (not-yet-completed) session
 * exercises. The cascade pick is REJECTED when it duplicates one of them by name
 * OR by movement (so a busy-swap of a chest fly can't hand back another chest
 * fly that is already planned later). On collision we fall forward to the broad
 * ranked same-muscle pool (findRefusalPool) and take the first candidate that is
 * both performable with availableTypes and movement-distinct from the excludes.
 */
function resolveCascade(
  engineName: string,
  availableTypes: string[],
  exIdx: number,
  reason: string,
  excludeNames: readonly string[] = [],
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
  let altName = res.exercise ?? (Array.isArray(res.exercises) ? res.exercises[0] : undefined);
  if (typeof altName !== 'string' || altName.length === 0) {
    return { exercise: null, swapped: false, alternativeName: '', originalName, noAlt: true };
  }

  // BUG 5 — reject a swap that would duplicate a still-pending exercise (name or
  // movement). Build the forbidden movement-key set from the excludes, then if
  // the cascade pick collides, walk the broad ranked same-muscle pool for the
  // first performable, movement-distinct candidate.
  const excludedNameSet = new Set(excludeNames);
  const excludedMovementSet = new Set(excludeNames.map(movementKeyOf));
  const collides = (name: string): boolean =>
    excludedNameSet.has(name) || excludedMovementSet.has(movementKeyOf(name));

  if (collides(altName)) {
    const available = new Set(availableTypes);
    const performable = (name: string): boolean => {
      const type = getExerciseMetadata(name)?.equipment_type;
      return type === 'bodyweight' || (typeof type === 'string' && available.has(type));
    };
    const { candidates } = findRefusalPool(engineName, [...excludeNames]) as {
      candidates: Array<{ name: string }>;
    };
    const next = candidates.find((c) => performable(c.name) && !collides(c.name));
    if (!next) {
      // Every performable same-muscle alternative duplicates a pending movement —
      // honest skip rather than re-offering a movement already in the plan.
      return { exercise: null, swapped: false, alternativeName: '', originalName, noAlt: true };
    }
    altName = next.name;
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
 * F4 (Daniel live 2026-06-10) — POST-SWAP queue dedup. After a swap lands at
 * `swapIdx`, the swap TARGET can collide (same movement family) with an exercise
 * still PENDING later in the session — the original compose was valid, the swap
 * introduced the redundancy. Live case: Y Raise → DB Lateral Raise while Cable
 * Lateral Raise was queued next ⇒ two lateral raises back-to-back, the user had to
 * swap again. The existing BUG-5 dedup protects the swap PICK from duplicating a
 * pending movement, but not the REVERSE (a pending slot now duplicating the new
 * target). This re-checks indices AFTER swapIdx and substitutes each slot whose
 * movement matches the target, reusing the SAME ranked same-muscle pick-list
 * (resolveSwapPickList → row 0) the manual swap uses, excluding the whole session
 * + the target so the replacement is movement-distinct. Last-option guard: if a
 * colliding slot has no movement-distinct substitute, it is LEFT untouched (never
 * empty/drop a slot). Performed/earlier slots (≤ swapIdx) are never touched.
 *
 * @param exercises the session list AFTER the swap was applied at swapIdx
 * @param swapIdx index of the just-swapped slot
 * @param targetEngineName English canonical name swapped IN at swapIdx
 * @returns the same array reference when nothing collides, else a new list with
 *   the colliding downstream slot(s) substituted
 */
export function dedupQueueAfterSwap(
  exercises: readonly PlannedExercise[],
  swapIdx: number,
  targetEngineName: string,
): readonly PlannedExercise[] {
  if (typeof targetEngineName !== 'string' || targetEngineName.length === 0) return exercises;
  const targetKey = movementKeyOf(targetEngineName);
  // Names already committed across the session (any slot) — the pick must avoid
  // every one of them, plus the target itself, so it is movement-distinct.
  const sessionNames = exercises
    .map((ex) => ex.engineName ?? ex.name)
    .filter((n): n is string => typeof n === 'string' && n.length > 0);
  const exclude = new Set<string>([...sessionNames, targetEngineName]);
  let next: PlannedExercise[] | null = null;
  for (let i = swapIdx + 1; i < exercises.length; i++) {
    const ex = exercises[i]!;
    const name = ex.engineName ?? ex.name;
    if (typeof name !== 'string' || name.length === 0) continue;
    if (movementKeyOf(name) !== targetKey) continue;
    // Colliding pending slot — find a movement-distinct same-muscle substitute.
    const { rows } = resolveSwapPickList(name, i, [...exclude], []);
    const pick = rows.find((r) => movementKeyOf(r.engineName) !== targetKey);
    if (!pick) continue; // last-option guard — leave the slot rather than empty it
    if (next === null) next = exercises.slice();
    next[i] = pick.exercise;
    exclude.delete(name);
    exclude.add(pick.engineName);
  }
  return next ?? exercises;
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
