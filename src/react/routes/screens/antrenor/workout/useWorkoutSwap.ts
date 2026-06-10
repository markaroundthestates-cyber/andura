import { useCallback, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { PlannedExercise } from '../../../../lib/engineWrappers';
import { gotoPath } from '../../../../lib/navigation';
import {
  dedupQueueAfterSwap,
  resolveMissingSwap,
  resolveSwapPickList,
  type SwapPickRow,
} from '../../../../lib/substitution';
import { toast } from '../../../../lib/toast';
import { debugLog } from '../../../../lib/debugLog';
import { incrementRefusal } from '../../../../../engine/schedule/scheduleAdapter.js';
import { t } from '../../../../../i18n/index.js';

export interface UseWorkoutSwapArgs {
  exercises: readonly PlannedExercise[] | null;
  safeExIdx: number;
  currentExercise: PlannedExercise;
  refusalTriedByEx: Record<number, readonly string[]>;
  markRefusalTried: (exIdx: number, name: string) => void;
  swapExercise: (exIdx: number, ex: { id: string; name: string; engineName?: string }) => void;
  dropExercise: (exIdx: number, identity: { id: string; name: string; engineName?: string }) => void;
  setExercises: React.Dispatch<React.SetStateAction<readonly PlannedExercise[] | null>>;
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
  aparatLipsaSheetOpen: boolean;
  pickSheet: SwapPickSheetState;
  handleOcupat: () => void;
  handleNuVreau: () => void;
  handlePickRow: (row: SwapPickRow) => void;
  handleDropExercise: () => void;
  handleClosePick: () => void;
  handleOpenAparatLipsa: () => void;
  handleCloseAparatLipsa: () => void;
  handleAparatLipsaConfirm: (missing: readonly string[]) => void;
}

const CLOSED_PICK: SwapPickSheetState = {
  open: false,
  rows: [],
  muscleGroup: '',
  originalName: '',
};

// Founder swap redesign 2026-06-05 — the in-session substitution buttons no
// longer BLINDLY auto-swap one alternative. "Aparat ocupat" + "Nu vreau" now
// open a SHORT manual pick-list sheet (resolveSwapPickList): a ranked 4-5 row
// same-muscle list (active CORE_AUTO pool minus today's session), row 1 = a
// pre-selected smart distinct pick, exactly one bodyweight fallback, plus a
// separated "I don't want to do this" row that DROPS the exercise (recoverable).
// The user picks any row manually. Aparat lipsa stays a direct equipment swap
// (resolveMissingSwap) — it's a hard machine constraint, not a free choice.
export function useWorkoutSwap(args: UseWorkoutSwapArgs): UseWorkoutSwap {
  const {
    exercises,
    safeExIdx,
    currentExercise,
    refusalTriedByEx,
    markRefusalTried,
    swapExercise,
    dropExercise,
    setExercises,
    bumpActivity,
    advanceOrFinish,
    navigate,
  } = args;

  // Daniel smoke 2026-05-28 #17 — in-session "Aparat lipsa" sheet open state.
  const [aparatLipsaSheetOpen, setAparatLipsaSheetOpen] = useState(false);
  // Founder redesign — manual swap pick-list sheet state (busy / refusal).
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

  const handleOcupat = useCallback((): void => {
    openPickList('equipment-swap');
  }, [openPickList]);

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

  // Daniel smoke 2026-05-28 #17 — in-session aparat-lipsa save flow. The sheet
  // already persisted the new list; we (a) close the sheet, (b) check if the new
  // list blocks the CURRENT exercise's equipment and, if so, swap it in-place via
  // resolveMissingSwap — a hard equipment constraint, not a free choice, so it
  // stays a direct NAMED swap (unchanged from prior behaviour).
  const handleAparatLipsaConfirm = useCallback(
    (_missing: readonly string[]): void => {
      setAparatLipsaSheetOpen(false);
      bumpActivity();
      const engineName = currentExercise.engineName;
      if (typeof engineName !== 'string' || engineName.length === 0) return;
      const otherNames = otherSessionNames();
      const res = resolveMissingSwap(engineName, safeExIdx, otherNames);
      if (!res.swapped || res.exercise === null) {
        if (res.noAlt) {
          toast.show({
            message: t('workout.swap.missingNoAlt', { name: res.originalName }),
            variant: 'info',
          });
        } else {
          toast.show({
            message: t('workout.swap.missingPreserved'),
            variant: 'success',
          });
        }
        return;
      }
      const swapped = res.exercise;
      setExercises((prev) => {
        if (prev === null) return prev;
        const next = prev.slice();
        next[safeExIdx] = swapped;
        // F4 — same post-swap queue dedup as the manual pick path.
        return dedupQueueAfterSwap(next, safeExIdx, swapped.engineName ?? swapped.name);
      });
      swapExercise(safeExIdx, { id: swapped.id, name: swapped.name, ...(swapped.engineName !== undefined ? { engineName: swapped.engineName } : {}) });
      // D107 — equipment-missing swap. No-op when collect gate OFF; never throws.
      debugLog.event(
        'swap',
        { from: res.originalName, to: swapped.name },
        undefined,
        undefined,
        engineName,
      );
      toast.show({
        message: t('workout.swap.swappedMissing', { original: res.originalName, alt: res.alternativeName }),
        variant: 'success',
      });
    },
    [bumpActivity, currentExercise.engineName, safeExIdx, swapExercise, otherSessionNames, setExercises]
  );

  const handleOpenAparatLipsa = useCallback((): void => {
    bumpActivity();
    setAparatLipsaSheetOpen(true);
  }, [bumpActivity]);

  const handleCloseAparatLipsa = useCallback((): void => {
    setAparatLipsaSheetOpen(false);
  }, []);

  return {
    aparatLipsaSheetOpen,
    pickSheet,
    handleOcupat,
    handleNuVreau,
    handlePickRow,
    handleDropExercise,
    handleClosePick,
    handleOpenAparatLipsa,
    handleCloseAparatLipsa,
    handleAparatLipsaConfirm,
  };
}
