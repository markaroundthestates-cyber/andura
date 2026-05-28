// SET RATING BUTTONS - Workout 3-Button Rating Component
// Phase 4 task_12 §A extract din Workout.tsx rating buttons (~lines 213-237
// prior). Pure presentational - 3 buttons RO (Usor / Potrivit / Greu) cu
// data-rating attribute preserved.
//
// Stateless: parent Workout.tsx owns handleLogSet pipeline (logSet store
// action + getPRDelta wire + markPRHit + state machine transition la rest/
// transition/post-rpe). onRate callback dispatches rating la parent.
//
// data-testid + data-rating preserved verbatim pentru Workout.test.tsx 38
// baseline tests preserve.
//
// Mockup parity (andura-clasic.html L1493-1511 wv2-rating-row traffic-light
// dot + label pattern). Emoji is aria-hidden decorative - preserves
// existing accessible name "Usor"/"Potrivit"/"Greu" for Workout.test
// ^Usor$ exact-match regex assertions.
//
// §F-pass2-setrating-02 (LOW chat5) — heading swap "Cum a fost setul?" →
// "Cum a fost?" mockup verbatim andura-clasic.html#L1493 (brevity per
// Daniel reglaj 2026-05-12 §coach-rating-row).

import type { JSX } from 'react';
import { t } from '../../../i18n/index.js';

type SetRating = 'usor' | 'potrivit' | 'greu';

interface SetRatingButtonsProps {
  onRate: (rating: SetRating) => void;
}

interface RatingMeta {
  rating: SetRating;
  emoji: string;
  labelKey: string;
}

const GREEN = '\u{1F7E2}';
const YELLOW = '\u{1F7E1}';
const RED = '\u{1F534}';

// Labels resolved at render time via t() so the locale flip surfaces EN
// copy under default + RO opt-in. Rating IDs stay the canonical engine
// keys (usor/potrivit/greu) consumed by the workoutStore + history.
const RATING_META: readonly RatingMeta[] = [
  { rating: 'usor', emoji: GREEN, labelKey: 'setRating.options.usor' },
  { rating: 'potrivit', emoji: YELLOW, labelKey: 'setRating.options.potrivit' },
  { rating: 'greu', emoji: RED, labelKey: 'setRating.options.greu' },
];

export function SetRatingButtons({ onRate }: SetRatingButtonsProps): JSX.Element {
  return (
    <>
      <p className="text-base text-ink mb-3">{t('setRating.prompt')}</p>
      {/* No role="list": children are <button>s (not valid role="listitem"),
          which makes a screen reader announce an empty list. The "Cum a fost?"
          heading already labels the group (parity §6-M3 EnergyScreens revert). */}
      <div className="flex gap-3">
        {RATING_META.map((opt) => (
          <button
            key={opt.rating}
            type="button"
            onClick={() => onRate(opt.rating)}
            data-rating={opt.rating}
            className="flex-1 flex flex-col items-center gap-1 py-3 bg-paper2 border border-lineStrong rounded-xl text-ink"
          >
            <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
            <span>{t(opt.labelKey)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
