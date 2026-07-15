// ══ SET HISTORY CHIPS — Workout per-set progress row ═════════════════════
// Presentational extraction from Workout.tsx (zero behavior change). Re-skinned
// to the mockup .set-chip glowing done/active/pending progress row
// (interfata-noua/screens-workout.jsx L254-260). One chip per planned set:
// logged sets = filled volt + check (kg x reps x rating preserved as title/
// aria-label so the data is not lost), the current set glows (active), the rest
// are muted pending numbers. Logic + per-set testids (set-history-{i}) kept.

import type { JSX } from 'react';
import { Check } from 'lucide-react';
import type { ExerciseHistoryEntry } from '../../stores/workoutStore';
import { t } from '../../../i18n/index.js';

interface SetHistoryChipsProps {
  totalSets: number;
  loggedSets: readonly ExerciseHistoryEntry[];
  currentSetIdx: number;
  isBodyweight: boolean;
  // EDIT-LOG (founder 2026-07-15) — when provided, DONE chips become tappable
  // (mis-log correction): tapping calls back with the set index so the screen
  // can open its inline kg/reps editor. Absent → chips stay presentational.
  onEditDone?: (setIdx: number) => void;
}

export function SetHistoryChips({
  totalSets,
  loggedSets,
  currentSetIdx,
  isBodyweight,
  onEditDone,
}: SetHistoryChipsProps): JSX.Element {
  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      data-testid="set-history"
    >
      {Array.from({ length: totalSets }, (_, i) => {
        const logged = loggedSets[i];
        const isDone = logged !== undefined;
        const isActive = !isDone && i === currentSetIdx;
        // Bodyweight: surface the ENTERED added weight (0 = bodyweight),
        // not the effective load stored in kg. Loaded: kg as before.
        const detail = isDone
          ? isBodyweight
            ? (logged.addedKg ?? 0) > 0
              ? `+${logged.addedKg} ${t('common.kg')} x ${logged.reps} ${t('common.reps')} - ${logged.rating}`
              : `${t('setLog.bodyweightLabel')} x ${logged.reps} ${t('common.reps')} - ${logged.rating}`
            : `${logged.kg} ${t('common.kg')} x ${logged.reps} ${t('common.reps')} - ${logged.rating}`
          : undefined;
        const label = detail
          ? `${t('workout.setLabel', { current: i + 1, total: totalSets })}: ${detail}`
          : t('workout.setLabel', { current: i + 1, total: totalSets });
        // EDIT-LOG — a DONE chip becomes a real button when the screen wired
        // onEditDone (tap = open the inline mis-log editor for that set).
        if (isDone && onEditDone) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onEditDone(i)}
              className="set-chip set-chip-done"
              data-testid={`set-history-${i}`}
              title={`${detail} — ${t('workout.editSet.chipHint')}`}
              aria-label={`${label} — ${t('workout.editSet.chipHint')}`}
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" strokeWidth={2.6} />
            </button>
          );
        }
        return (
          <div
            key={i}
            className={`set-chip${isDone ? ' set-chip-done' : ''}${isActive ? ' set-chip-active' : ''}`}
            data-testid={isDone ? `set-history-${i}` : undefined}
            title={detail}
            aria-label={label}
          >
            {isDone ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" strokeWidth={2.6} />
            ) : (
              <span aria-hidden="true">{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
