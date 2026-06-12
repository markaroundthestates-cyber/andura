import { useCallback, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { PlannedExercise } from '../../../../lib/engineWrappers';
import { gotoPath } from '../../../../lib/navigation';
import {
  dedupQueueAfterSwap,
  resolveSwapPickList,
  type SwapPickRow,
} from '../../../../lib/substitution';
import { toast } from '../../../../lib/toast';
import { debugLog } from '../../../../lib/debugLog';
import {
  incrementRefusal,
  addMissingEquipmentExercise,
} from '../../../../../engine/schedule/scheduleAdapter.js';
import { getExerciseMetadata } from '../../../../../engine/exerciseLibrary.js';
import { musclesForExercise } from '../../../../../engine/muscleMap.js';
import { t } from '../../../../../i18n/index.js';

// ── Busy-defer muscle-safety helper (founder 2026-06-12) ─────────────────────
// The defer placement must not land the busy lift right behind an exercise that
// PRE-FATIGUED its prime movers / synergists (a chest press dropped just after
// intense triceps or front-delt work hits a pre-tired engine — founder: "sa nu
// mute piept dupa ce am lucrat triceps intensiv sau din astea").
//
// SYNERGIST-CONFLICT definition (deterministic muscle-overlap, both sides read
// via musclesForExercise = curated heads OR library-metadata-derived heads,
// primary + secondary/synergist):
//   - The busy lift's "engine" = its prime movers UNION its synergists
//     (primary ∪ secondary). For a compound that secondary set is the synergist
//     chain (chest press → front-delt + triceps; row/pulldown → biceps;
//     squat/leg-press → the quads/glutes/hams it leans on).
//   - A preceding exercise CONFLICTS when ANY muscle it trains (its primary ∪
//     secondary) intersects the busy lift's engine set. So a triceps pushdown or
//     overhead-triceps before a chest press conflicts (shared triceps heads); a
//     biceps curl before a row/pulldown conflicts (shared biceps); a leg
//     extension before a leg press conflicts (shared quad). A light isolation
//     behind an isolation of an UNRELATED muscle has no overlap → no conflict.
//   - Unknown muscles on either side (musclesForExercise → null) → NOT a
//     conflict (we never block on missing data — "ghidam, nu blocam").
/** All recovery heads (prime movers + synergists) a lift loads, as a Set. */
function muscleSetFor(name: string | undefined): Set<string> {
  const m = name ? musclesForExercise(name) : null;
  if (!m) return new Set();
  return new Set([...(m.primary ?? []), ...(m.secondary ?? [])]);
}

/** True when `predecessor` pre-fatigues any prime mover / synergist of `busy`
 *  (their loaded-muscle sets intersect). Empty set on either side → false. */
function preFatigues(busyEngine: Set<string>, predecessorName: string | undefined): boolean {
  if (busyEngine.size === 0) return false;
  const pred = muscleSetFor(predecessorName);
  for (const h of pred) if (busyEngine.has(h)) return true;
  return false;
}

export interface UseWorkoutSwapArgs {
  exercises: readonly PlannedExercise[] | null;
  safeExIdx: number;
  currentExercise: PlannedExercise;
  refusalTriedByEx: Record<number, readonly string[]>;
  markRefusalTried: (exIdx: number, name: string) => void;
  swapExercise: (exIdx: number, ex: { id: string; name: string; engineName?: string }) => void;
  dropExercise: (exIdx: number, identity: { id: string; name: string; engineName?: string }) => void;
  // Founder Busy/Missing redesign 2026-06-12 — reorder the index-keyed store maps
  // when the screen moves the busy exercise to a later slot (defer).
  deferExercise: (fromIdx: number, toIdx: number) => void;
  setExercises: React.Dispatch<React.SetStateAction<readonly PlannedExercise[] | null>>;
  /** Current set ordinal for the current exercise (history[safeExIdx].length).
   *  Drives the mid-exercise-busy fallback decision (see handleOcupat). */
  currentSetIdx: number;
  bumpActivity: () => void;
  advanceOrFinish: () => void;
  navigate: NavigateFunction;
}

export interface SwapPickSheetState {
  open: boolean;
  rows: readonly SwapPickRow[];
  muscleGroup: string;
  originalName: string;
}

export interface UseWorkoutSwap {
  pickSheet: SwapPickSheetState;
  /** Founder Busy/Missing redesign 2026-06-12 — true while the "Aparat lipsa"
   *  anti-misclick confirm step is showing for the current exercise. */
  missingConfirmOpen: boolean;
  handleOcupat: () => void;
  handleNuVreau: () => void;
  handlePickRow: (row: SwapPickRow) => void;
  handleDropExercise: () => void;
  handleClosePick: () => void;
  /** Open the missing-equipment confirm step (replaces the old picker sheet). */
  handleOpenMissingConfirm: () => void;
  /** Dismiss the confirm step without remembering anything. */
  handleCancelMissing: () => void;
  /** Confirm: remember this exercise's equipment as missing + auto-replace NOW. */
  handleConfirmMissing: () => void;
}

const CLOSED_PICK: SwapPickSheetState = {
  open: false,
  rows: [],
  muscleGroup: '',
  originalName: '',
};

// Founder Busy/Missing redesign 2026-06-12 — the three in-session action buttons
// now have THREE DISTINCT behaviors (they used to mostly do the same thing):
//
//   - "Ocupat" (busy) = DEFER IN-SESSION. The machine is busy right now, so the
//     exercise MOVES to a sensible LATER slot in TODAY's session (it may free up)
//     and the next pending exercise becomes current IMMEDIATELY — NO sheet, NO
//     swap. Ordering only; DP/logs/engine identity untouched. Falls back to the
//     swap pick-list ONLY when there's nothing pending behind it (deferring the
//     last exercise is meaningless) OR when the user is mid-exercise (>=1 set
//     logged — v1 keeps that the existing swap behaviour, see handleOcupat).
//   - "Nu vreau" = the existing manual pick-list (resolveSwapPickList), UNCHANGED.
//   - "Aparat lipsa" (missing) = CONFIRM (anti-misclick) → remember THIS exercise's
//     equipment as missing (per-UID equipment-memory) → AUTO-REPLACE now with the
//     engine's best same-muscle alternative (the SAME row-0 ranking the pick-list
//     uses) excluding same-missing-equipment picks. NO list mid-workout; future
//     sessions exclude it (engine pipeline, dp_equipment_memory_v1); the Account
//     "Echipament lipsa" list is the only place to undo it.
export function useWorkoutSwap(args: UseWorkoutSwapArgs): UseWorkoutSwap {
  const {
    exercises,
    safeExIdx,
    currentExercise,
    refusalTriedByEx,
    markRefusalTried,
    swapExercise,
    dropExercise,
    deferExercise,
    setExercises,
    currentSetIdx,
    bumpActivity,
    advanceOrFinish,
    navigate,
  } = args;

  // Founder Busy/Missing redesign 2026-06-12 — "Aparat lipsa" anti-misclick confirm.
  const [missingConfirmOpen, setMissingConfirmOpen] = useState(false);
  // Founder redesign — manual swap pick-list sheet state ("Nu vreau" + busy fallback).
  const [pickSheet, setPickSheet] = useState<SwapPickSheetState>(CLOSED_PICK);

  // Names already present in / pending elsewhere in the session — never offered
  // as a swap (no duplicate-in-session). Built fresh per open.
  const otherSessionNames = useCallback((): string[] => {
    return (exercises ?? [])
      .filter((_, i) => i !== safeExIdx)
      .map((ex) => ex.engineName ?? ex.name)
      .filter((n): n is string => typeof n === 'string' && n.length > 0);
  }, [exercises, safeExIdx]);

  // Open the manual pick-list for the CURRENT exercise. `triedNames` (the per-
  // slot refusal-tried set) drives the engine's diversify-modality ranking. Empty
  // rows → still open the sheet (it shows the honest "no other exercise" copy +
  // the drop row), so the user is never stranded. No-engineName fixture → legacy
  // navigate fallback so the user is never stranded.
  const openPickList = useCallback(
    (fallbackPath: 'equipment-swap' | 'ceva-nu-merge'): void => {
      bumpActivity();
      const engineName = currentExercise.engineName;
      if (typeof engineName !== 'string' || engineName.length === 0) {
        navigate(gotoPath(fallbackPath));
        return;
      }
      const excludeNames = otherSessionNames();
      const triedNames = [...(refusalTriedByEx[safeExIdx] ?? [])];
      const { rows, muscleGroup, originalName } = resolveSwapPickList(
        engineName,
        safeExIdx,
        excludeNames,
        triedNames,
      );
      setPickSheet({ open: true, rows, muscleGroup, originalName });
    },
    [bumpActivity, currentExercise.engineName, otherSessionNames, refusalTriedByEx, safeExIdx, navigate],
  );

  // Founder Busy/Missing redesign 2026-06-12 — "Ocupat" = DEFER in-session.
  //
  // PLACEMENT RULE (deterministic, reads well on the gym floor): pick the
  // EARLIEST following slot whose landing is BOTH
  //   (a) after an exercise on DIFFERENT equipment than the busy machine (keep
  //       the "machine frees up" intent — the user is sent to another station),
  //       AND
  //   (b) MUSCLE-SAFE — the busy lift does NOT land immediately after an exercise
  //       that pre-fatigued its prime movers / synergists (preFatigues() above:
  //       e.g. a chest press must not drop right behind a triceps / front-delt
  //       exercise; a row/pulldown not right behind a biceps curl; a squat/leg-
  //       press not right behind an isolation of the quads/glutes it relies on).
  // Earliest slot satisfying both = minimum sensible defer.
  //
  // FALLBACK PRECEDENCE when no slot satisfies BOTH (never block — always land
  // forward, "ghidam, nu blocam"):
  //   1. EARLIEST muscle-SAFE landing (even if same equipment) — a pre-fatigued
  //      compound is worse than the same machine maybe-still-busy.
  //   2. else EARLIEST different-equipment landing (muscle conflict unavoidable,
  //      at least honour the station change).
  //   3. else just behind the NEXT slot (minimum meaningful move).
  // The advance loop (nextActiveIdx) already skips any dropped/completed slot the
  // deferred exercise lands behind, so the placement stays robust regardless.
  //
  // FALLBACK to the existing swap pick-list (current behaviour) when:
  //   - there is NOTHING after the busy exercise (deferring the last exercise is
  //     meaningless — it would just stay current), OR
  //   - the user is MID-EXERCISE (>=1 set already logged this slot): v1 keeps the
  //     established mid-set swap path rather than moving a half-done exercise's
  //     remaining sets around (an honest scope choice — DOCUMENTED in the report).
  const handleOcupat = useCallback((): void => {
    bumpActivity();
    const list = exercises;
    // No engineName fixture / no list → legacy pick-list (never strand the user).
    if (
      list === null ||
      typeof currentExercise.engineName !== 'string' ||
      currentExercise.engineName.length === 0
    ) {
      openPickList('equipment-swap');
      return;
    }
    // Mid-exercise busy → existing swap behaviour (v1 scope).
    if (currentSetIdx >= 1) {
      openPickList('equipment-swap');
      return;
    }
    const busyType = getExerciseMetadata(currentExercise.engineName)?.equipment_type;
    // The busy lift's prime movers + synergists (engine set) — what a predecessor
    // must NOT have just pre-fatigued. Empty when muscles are unknown → the
    // muscle-safe predicate is vacuously true (we never block on missing data).
    const busyEngine = muscleSetFor(currentExercise.engineName ?? undefined);
    // Slots strictly AFTER the current one.
    const following: number[] = [];
    for (let i = safeExIdx + 1; i < list.length; i++) {
      if (list[i]) following.push(i);
    }
    // Nothing to defer behind → swap pick-list (deferring is meaningless).
    if (following.length === 0) {
      openPickList('equipment-swap');
      return;
    }
    // For a candidate landing slot `i`, the busy lift lands immediately AFTER the
    // exercise currently at `i` (the forward rotation shifts it to i-1). So both
    // predicates are evaluated on THAT predecessor (list[i]).
    const equipDifferent = (i: number): boolean => {
      const t2 = getExerciseMetadata(list[i]!.engineName ?? list[i]!.name)?.equipment_type;
      return typeof t2 === 'string' && t2 !== busyType;
    };
    const muscleSafe = (i: number): boolean =>
      !preFatigues(busyEngine, list[i]!.engineName ?? list[i]!.name);

    // Earliest slot that is BOTH different-equipment AND muscle-safe (best);
    // else earliest muscle-safe (fallback 1); else earliest different-equipment
    // (fallback 2); else the next slot (fallback 3 — minimum defer). Single
    // earliest-first pass records all three candidates at once.
    let anchorBoth = -1;
    let anchorSafe = -1;
    let anchorEquip = -1;
    for (const i of following) {
      const diff = equipDifferent(i);
      const safe = muscleSafe(i);
      if (diff && safe && anchorBoth === -1) anchorBoth = i;
      if (safe && anchorSafe === -1) anchorSafe = i;
      if (diff && anchorEquip === -1) anchorEquip = i;
      if (anchorBoth !== -1) break; // best found at the earliest index — done
    }
    const anchor =
      anchorBoth !== -1 ? anchorBoth
      : anchorSafe !== -1 ? anchorSafe
      : anchorEquip !== -1 ? anchorEquip
      : following[0]!;
    // After the forward rotation [safeExIdx..anchor], the busy exercise sits at
    // `anchor` (its old neighbours having shifted down by one). Reorder the local
    // list to match, then remap the store's index-keyed maps the same way.
    setExercises((prev) => {
      if (prev === null) return prev;
      const next = prev.slice();
      const [moved] = next.splice(safeExIdx, 1);
      next.splice(anchor, 0, moved!); // moved lands at index `anchor`
      return next;
    });
    deferExercise(safeExIdx, anchor);
    // D107 — record the defer as a (recoverable) skip-style event; no-op when the
    // collect gate is OFF, never throws. The exercise is NOT dropped — it returns.
    debugLog.event(
      'skip',
      { from: currentExercise.name },
      undefined,
      undefined,
      currentExercise.engineName ?? undefined,
    );
    toast.show({
      message: t('workout.swap.deferred', { name: currentExercise.name }),
      variant: 'info',
    });
  }, [
    bumpActivity,
    exercises,
    currentExercise.engineName,
    currentExercise.name,
    currentSetIdx,
    safeExIdx,
    setExercises,
    deferExercise,
    openPickList,
  ]);

  const handleNuVreau = useCallback((): void => {
    openPickList('ceva-nu-merge');
  }, [openPickList]);

  const handleClosePick = useCallback((): void => {
    setPickSheet(CLOSED_PICK);
  }, []);

  // Apply the user's manual pick — swap the current exercise in-place (real DP
  // prescription, restart at set 1) + record the original + the chosen
  // alternative in the per-slot tried-set so a SUBSEQUENT pick-list skips both
  // (the diversify-modality ranking reads this). Increment the refusal counter
  // (threshold "permanent?" flow) on the original, as the old refusal path did.
  const handlePickRow = useCallback(
    (row: SwapPickRow): void => {
      bumpActivity();
      const engineName = currentExercise.engineName;
      if (typeof engineName === 'string' && engineName.length > 0) {
        incrementRefusal(engineName);
        markRefusalTried(safeExIdx, engineName);
      }
      const swapped = row.exercise;
      setExercises((prev) => {
        if (prev === null) return prev;
        const next = prev.slice();
        next[safeExIdx] = swapped;
        // F4 — re-dedup the REMAINING queue against the swap target so a pending
        // same-movement slot (e.g. Cable Lateral Raise queued after swapping in DB
        // Lateral Raise) is substituted now, not left for the user to swap again.
        return dedupQueueAfterSwap(next, safeExIdx, swapped.engineName ?? swapped.name);
      });
      swapExercise(safeExIdx, {
        id: swapped.id,
        name: swapped.name,
        ...(swapped.engineName !== undefined ? { engineName: swapped.engineName } : {}),
      });
      // D107 phase 1 — permanent interaction-log: the manual swap the user made
      // (from original → chosen alternative). No-op when flag OFF; never throws.
      debugLog.event(
        'swap',
        { from: pickSheet.originalName || engineName, to: swapped.name },
        undefined,
        undefined,
        currentExercise.engineName ?? undefined,
      );
      // Record the surfaced alternative so the NEXT pick-list at this slot skips
      // it (no re-offer) and reads it as an already-tried modality.
      markRefusalTried(safeExIdx, row.engineName);
      setPickSheet(CLOSED_PICK);
      toast.show({
        message: t('workout.swap.swappedPick', {
          original: pickSheet.originalName || row.engineName,
          alt: row.displayName,
        }),
        variant: 'success',
      });
    },
    [bumpActivity, currentExercise.engineName, markRefusalTried, safeExIdx, setExercises, swapExercise, pickSheet.originalName],
  );

  // Drop the WHOLE exercise from today's session (pick-list "I don't want to do
  // this"). Index-stable store drop (marks the slot dropped + clears its partial
  // history; never splices the array) + advance past it. The dropped exercise
  // stays recoverable via the skipped-exercises strip (restoreExercise).
  const handleDropExercise = useCallback((): void => {
    bumpActivity();
    const identity = {
      id: currentExercise.id,
      name: pickSheet.originalName || currentExercise.name,
      ...(currentExercise.engineName !== undefined ? { engineName: currentExercise.engineName } : {}),
    };
    // D107 — dropping the whole exercise is a skip. No-op when collect gate OFF.
    debugLog.event(
      'skip',
      { from: identity.name },
      undefined,
      undefined,
      currentExercise.engineName ?? undefined,
    );
    dropExercise(safeExIdx, identity);
    setPickSheet(CLOSED_PICK);
    toast.show({
      message: t('workout.swap.dropped', { name: identity.name }),
      variant: 'info',
    });
    advanceOrFinish();
  }, [bumpActivity, currentExercise, pickSheet.originalName, dropExercise, safeExIdx, advanceOrFinish]);

  // Founder Busy/Missing redesign 2026-06-12 — "Aparat lipsa" anti-misclick step.
  // The old in-session 10-item picker sheet is REPLACED by: a small CONFIRM (so a
  // stray tap mid-set is harmless), then on confirm we (a) PERSIST this exercise as
  // equipment-missing (per-UID memory, name-keyed), (b) AUTO-REPLACE it NOW with the
  // engine's best same-muscle alternative, excluding same-missing-equipment picks.
  const handleOpenMissingConfirm = useCallback((): void => {
    bumpActivity();
    setMissingConfirmOpen(true);
  }, [bumpActivity]);

  const handleCancelMissing = useCallback((): void => {
    setMissingConfirmOpen(false);
  }, []);

  // Confirm the missing-equipment action: remember + auto-replace.
  const handleConfirmMissing = useCallback((): void => {
    setMissingConfirmOpen(false);
    bumpActivity();
    const engineName = currentExercise.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) return;

    // (a) PERSIST the absence — the SPECIFIC exercise the user lacks the machine
    // for. Future composition hard-excludes it (engine pipeline, name-keyed); the
    // Account "Echipament lipsa" list is the single place to undo it.
    addMissingEquipmentExercise(engineName);

    // (b) AUTO-REPLACE NOW using the SAME row-0 ranking the pick-list surfaces
    // (resolveSwapPickList → prePick row), excluding alternatives that hit the
    // SAME missing equipment (same coarse equipment_type as the now-missing
    // exercise — the finest identity the library carries). The whole session is
    // excluded (no duplicate-in-session). If the same-equipment filter empties the
    // list, fall back to the best available row (better a swap than a stranded slot).
    const missingType = getExerciseMetadata(engineName)?.equipment_type;
    const excludeNames = otherSessionNames();
    const triedNames = [...(refusalTriedByEx[safeExIdx] ?? [])];
    const { rows, originalName } = resolveSwapPickList(engineName, safeExIdx, excludeNames, triedNames);
    const differentEquip = rows.filter(
      (r) => getExerciseMetadata(r.engineName)?.equipment_type !== missingType,
    );
    const candidates = differentEquip.length > 0 ? differentEquip : rows;
    const chosen = candidates.find((r) => r.prePick) ?? candidates[0];

    if (!chosen) {
      // No same-muscle alternative at all (honest) — keep the exercise; the user can
      // still skip it from the ⋯ menu. The absence is remembered for next time.
      toast.show({
        message: t('workout.swap.missingNoAlt', { name: originalName || currentExercise.name }),
        variant: 'info',
      });
      return;
    }

    const swapped = chosen.exercise;
    setExercises((prev) => {
      if (prev === null) return prev;
      const next = prev.slice();
      next[safeExIdx] = swapped;
      // F4 — same post-swap queue dedup as the manual pick path.
      return dedupQueueAfterSwap(next, safeExIdx, swapped.engineName ?? swapped.name);
    });
    swapExercise(safeExIdx, {
      id: swapped.id,
      name: swapped.name,
      ...(swapped.engineName !== undefined ? { engineName: swapped.engineName } : {}),
    });
    // D107 — equipment-missing swap. No-op when collect gate OFF; never throws.
    debugLog.event(
      'swap',
      { from: originalName || engineName, to: swapped.name },
      undefined,
      undefined,
      engineName,
    );
    toast.show({
      message: t('workout.swap.swappedMissing', {
        original: originalName || currentExercise.name,
        alt: chosen.displayName,
      }),
      variant: 'success',
    });
  }, [
    bumpActivity,
    currentExercise.engineName,
    currentExercise.name,
    safeExIdx,
    swapExercise,
    otherSessionNames,
    refusalTriedByEx,
    setExercises,
  ]);

  return {
    pickSheet,
    missingConfirmOpen,
    handleOcupat,
    handleNuVreau,
    handlePickRow,
    handleDropExercise,
    handleClosePick,
    handleOpenMissingConfirm,
    handleCancelMissing,
    handleConfirmMissing,
  };
}
