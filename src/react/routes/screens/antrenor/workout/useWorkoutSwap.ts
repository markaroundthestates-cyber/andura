import { useCallback, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { PlannedExercise } from '../../../../lib/engineWrappers';
import { gotoPath } from '../../../../lib/navigation';
import { resolveBusySwap, resolveMissingSwap, resolveRefusalSwap } from '../../../../lib/substitution';
import { toast } from '../../../../lib/toast';
import { incrementRefusal } from '../../../../../engine/schedule/scheduleAdapter.js';
import { t } from '../../../../../i18n/index.js';

export interface UseWorkoutSwapArgs {
  exercises: readonly PlannedExercise[] | null;
  safeExIdx: number;
  currentExercise: PlannedExercise;
  refusalTriedByEx: Record<number, readonly string[]>;
  markRefusalTried: (exIdx: number, name: string) => void;
  swapExercise: (exIdx: number, ex: { id: string; name: string; engineName?: string }) => void;
  setExercises: React.Dispatch<React.SetStateAction<readonly PlannedExercise[] | null>>;
  bumpActivity: () => void;
  navigate: NavigateFunction;
}

export interface UseWorkoutSwap {
  aparatLipsaSheetOpen: boolean;
  handleOcupat: () => void;
  handleNuVreau: () => void;
  handleOpenAparatLipsa: () => void;
  handleCloseAparatLipsa: () => void;
  handleAparatLipsaConfirm: (missing: readonly string[]) => void;
}

// WP-5 moat — in-session substitution for the CURRENT exercise. Extracted
// verbatim from Workout.tsx (behavior preserved): owns aparatLipsaSheetOpen +
// applySwap + the busy/refusal/missing-equipment handlers. The exercise list
// lives in the screen's local `exercises` state (setExercises in); the store
// owns the logged-set integrity (swapExercise in).
export function useWorkoutSwap(args: UseWorkoutSwapArgs): UseWorkoutSwap {
  const {
    exercises,
    safeExIdx,
    currentExercise,
    refusalTriedByEx,
    markRefusalTried,
    swapExercise,
    setExercises,
    bumpActivity,
    navigate,
  } = args;

  // Daniel smoke 2026-05-28 #17 — in-session "Aparat lipsa" sheet open state.
  const [aparatLipsaSheetOpen, setAparatLipsaSheetOpen] = useState(false);

  // WP-5 moat — in-place substitution for the CURRENT exercise. The exercise
  // list lives in this screen's local `exercises` state; the store owns the
  // logged-set integrity. Swap = replace exercises[safeExIdx] with the
  // alternative + swapExercise(safeExIdx) (drops partial sets of the original,
  // restarts at set 1) + a NAMED toast (the key to the moat: the user SEES the
  // alternative). Honest noAlt → toast tells the user to skip it (anti-
  // paternalism, never force an inferior movement). Replaces the old behavior
  // where the buttons navigated AWAY and the user never saw a named alternative.
  //
  // Daniel smoke 2026-05-28 (#2 + #6 + #3.2) — REFUSAL path now consumes a
  // per-exIdx tried-set so each "Nu vreau" tap surfaces a DIFFERENT same-muscle
  // candidate (no 2-element ping-pong). On exhaustion (every same-muscle option
  // tried this session) the toast switches to "ai incercat tot pentru
  // [muscleGroup]". Equipment paths unchanged (different semantic).
  const applySwap = useCallback(
    (engineName: string, kind: 'busy' | 'refusal'): void => {
      bumpActivity();
      let res;
      if (kind === 'busy') {
        // BUG 5 — exclude every OTHER session exercise (already-completed
        // earlier + still-pending later) so a busy-swap never returns a movement
        // that exists elsewhere in the session (the "chest fly twice" bug).
        const otherNames = (exercises ?? [])
          .filter((_, i) => i !== safeExIdx)
          .map((ex) => ex.engineName ?? ex.name)
          .filter((n): n is string => typeof n === 'string' && n.length > 0);
        res = resolveBusySwap(engineName, safeExIdx, otherNames);
      } else {
        // Refusal: build tried-set = the original we're about to swap out + all
        // names previously refused at this slot. markRefusalTried below records
        // the alternative we surface so the NEXT tap skips it. Daniel verbatim
        // "nu sa dea doar 2 alternative" — pool walks the whole same-muscle
        // library before exhausting.
        // BUG 6 — also exclude every OTHER session exercise (already-completed +
        // still-pending) so a refusal substitute never re-offers a movement that
        // exists elsewhere in the session (Farmer's Walk offered twice / an already-
        // logged curl re-offered). Mirrors the busy path's otherNames exclusion.
        const otherNames = (exercises ?? [])
          .filter((_, i) => i !== safeExIdx)
          .map((ex) => ex.engineName ?? ex.name)
          .filter((n): n is string => typeof n === 'string' && n.length > 0);
        const triedNames = [
          engineName,
          ...otherNames,
          ...(refusalTriedByEx[safeExIdx] ?? []),
        ];
        res = resolveRefusalSwap(engineName, safeExIdx, triedNames);
      }
      if (kind === 'refusal') {
        // Preserve the existing refusal counter (threshold → "permanent?" flow).
        incrementRefusal(engineName);
        // Append the JUST-refused exercise to the per-exIdx tried-set so a
        // subsequent "Nu vreau" tap doesn't re-offer it (idempotent on store).
        markRefusalTried(safeExIdx, engineName);
      }
      if (kind === 'refusal' && res.poolExhausted) {
        const groupLabel = res.muscleGroup ?? t('workout.swap.exhaustedFallbackGroup');
        toast.show({
          message: t('workout.swap.exhaustedPool', { group: groupLabel }),
          variant: 'info',
        });
        return;
      }
      if (!res.swapped || res.exercise === null) {
        toast.show({
          message: t('workout.swap.noAlternative', { name: res.originalName }),
          variant: 'info',
        });
        return;
      }
      const swapped = res.exercise;
      setExercises((prev) => {
        if (prev === null) return prev;
        const next = prev.slice();
        next[safeExIdx] = swapped;
        return next;
      });
      swapExercise(safeExIdx, { id: swapped.id, name: swapped.name, ...(swapped.engineName !== undefined ? { engineName: swapped.engineName } : {}) });
      // Refusal path: record the alternative we just surfaced so the NEXT
      // "Nu vreau" tap on this slot skips it (Daniel exhaustive cycle).
      if (kind === 'refusal' && typeof res.alternativeEngineName === 'string') {
        markRefusalTried(safeExIdx, res.alternativeEngineName);
      }
      toast.show({
        message:
          kind === 'busy'
            ? t('workout.swap.swappedBusy', { original: res.originalName, alt: res.alternativeName })
            : t('workout.swap.swappedRefusal', { original: res.originalName, alt: res.alternativeName }),
        variant: 'success',
      });
    },
    [bumpActivity, safeExIdx, swapExercise, refusalTriedByEx, markRefusalTried, exercises, setExercises]
  );

  // Daniel smoke 2026-05-28 #17 — in-session aparat-lipsa save flow. The sheet
  // already persisted the new list (single SoT = wv2-missing-equipment local
  // storage, read by Cont -> AparateLipsa next mount), so we only need to (a)
  // close the sheet, (b) check if the new list blocks the CURRENT exercise's
  // equipment and, if so, swap it in-place via resolveMissingSwap — same UX
  // contract as Aparat ocupat (NAMED alternative + toast). When the current
  // exercise is still performable, no swap, no toast — quiet success.
  const handleAparatLipsaConfirm = useCallback(
    (_missing: readonly string[]): void => {
      setAparatLipsaSheetOpen(false);
      bumpActivity();
      const engineName = currentExercise.engineName;
      if (typeof engineName !== 'string' || engineName.length === 0) return;
      // BUG 5 — exclude every other session exercise so the missing-equipment
      // swap never duplicates a movement that exists elsewhere in the session.
      const otherNames = (exercises ?? [])
        .filter((_, i) => i !== safeExIdx)
        .map((ex) => ex.engineName ?? ex.name)
        .filter((n): n is string => typeof n === 'string' && n.length > 0);
      const res = resolveMissingSwap(engineName, safeExIdx, otherNames);
      // resolveMissingSwap returns swapped=false when the original is still
      // performable with the new missing list (no equipment overlap). Honest
      // noAlt when the user has marked so much missing that nothing works —
      // toast tells them, mirrors Aparat ocupat path.
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
        return next;
      });
      swapExercise(safeExIdx, { id: swapped.id, name: swapped.name, ...(swapped.engineName !== undefined ? { engineName: swapped.engineName } : {}) });
      toast.show({
        message: t('workout.swap.swappedMissing', { original: res.originalName, alt: res.alternativeName }),
        variant: 'success',
      });
    },
    [bumpActivity, currentExercise.engineName, safeExIdx, swapExercise, exercises, setExercises]
  );

  const handleOpenAparatLipsa = useCallback((): void => {
    bumpActivity();
    setAparatLipsaSheetOpen(true);
  }, [bumpActivity]);

  const handleCloseAparatLipsa = useCallback((): void => {
    setAparatLipsaSheetOpen(false);
  }, []);

  const handleOcupat = useCallback((): void => {
    const engineName = currentExercise.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) {
      // No canonical name (defensive — pre-WP-5 fixture) → fall back to the old
      // navigate path so the user is never stranded.
      navigate(gotoPath('equipment-swap'));
      return;
    }
    applySwap(engineName, 'busy');
  }, [currentExercise.engineName, applySwap, navigate]);

  const handleNuVreau = useCallback((): void => {
    const engineName = currentExercise.engineName;
    if (typeof engineName !== 'string' || engineName.length === 0) {
      navigate(gotoPath('ceva-nu-merge'));
      return;
    }
    applySwap(engineName, 'refusal');
  }, [currentExercise.engineName, applySwap, navigate]);

  return {
    aparatLipsaSheetOpen,
    handleOcupat,
    handleNuVreau,
    handleOpenAparatLipsa,
    handleCloseAparatLipsa,
    handleAparatLipsaConfirm,
  };
}
