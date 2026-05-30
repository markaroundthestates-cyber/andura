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
}

export function SetHistoryChips({
  totalSets,
  loggedSets,
  currentSetIdx,
  isBodyweight,
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
        return (
          <div
            key={i}
            className={`set-chip${isDone ? ' set-chip-done' : ''}${isActive ? ' set-chip-active' : ''}`}
            data-testid={isDone ? `set-history-${i}` : undefined}
            title={detail}
            aria-label={
              detail
                ? `${t('workout.setLabel', { current: i + 1, total: totalSets })}: ${detail}`
                : t('workout.setLabel', { current: i + 1, total: totalSets })
            }
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
