// ══ SET RATING BUTTONS — Workout 3-Button Rating Component ═══════════════
// Phase 4 task_12 §A extract din Workout.tsx rating buttons (~lines 213-237
// prior). Pure presentational — 3 buttons RO (Usor / Potrivit / Greu) cu
// data-rating attribute preserved.
//
// Stateless: parent Workout.tsx owns handleLogSet pipeline (logSet store
// action + getPRDelta wire + markPRHit + state machine transition la rest/
// transition/post-rpe). onRate callback dispatches rating la parent.
//
// data-testid + data-rating preserved verbatim pentru Workout.test.tsx 38
// baseline tests preserve.

import type { JSX } from 'react';

type SetRating = 'usor' | 'potrivit' | 'greu';

interface SetRatingButtonsProps {
  onRate: (rating: SetRating) => void;
}

interface RatingOption {
  rating: SetRating;
  label: string;
}

const RATING_OPTIONS: readonly RatingOption[] = [
  { rating: 'usor', label: 'Usor' },
  { rating: 'potrivit', label: 'Potrivit' },
  { rating: 'greu', label: 'Greu' },
];

export function SetRatingButtons({ onRate }: SetRatingButtonsProps): JSX.Element {
  return (
    <>
      <p className="text-base text-ink mb-3">Cum a fost setul?</p>
      <div className="flex gap-3" role="list" aria-label="Rating set">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => onRate(opt.rating)}
            data-rating={opt.rating}
            className="flex-1 py-3 bg-paper2 border border-[var(--line-strong)] rounded-xl text-ink"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}
