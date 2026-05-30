// ══ WHY EXERCISE MODAL — Workout "why this exercise?" explainer ══════════
// Presentational extraction from Workout.tsx (zero behavior change). §F-workout-05
// — why-exercise explainer bottom sheet. Mockup andura-clasic.html#L1449
// openWhyExercise → whyEngine categorical summary. Backdrop tap or "Am inteles"
// closes.
//
// The why-modal focus management (auto-focus + Escape + Tab trap + restore)
// lives in a PARENT useEffect keyed on whyText; the dismiss button ref is owned
// by the parent and threaded in via dismissRef so that effect keeps working
// unchanged. Open is gated by the parent rendering this only when whyText !== null.

import type { JSX, RefObject } from 'react';
import { t } from '../../../i18n/index.js';

interface WhyExerciseModalProps {
  whyText: string;
  exerciseName: string;
  dismissRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

export function WhyExerciseModal({
  whyText,
  exerciseName,
  dismissRef,
  onClose,
}: WhyExerciseModalProps): JSX.Element {
  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
      data-testid="why-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="animate-slide-up bg-paper rounded-t-2xl p-6 w-full max-w-md"
        data-testid="why-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('workout.whyAriaLabel')}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ink mb-3">
          {t('workout.whyTitle', { exercise: exerciseName })}
        </h2>
        <p className="text-sm text-ink2 leading-relaxed mb-5" data-testid="why-modal-text">
          {whyText}
        </p>
        <button
          ref={dismissRef}
          type="button"
          onClick={onClose}
          data-testid="why-modal-dismiss"
          className="w-full p-3 pulse-grad-bg pulse-shine text-paper rounded-[14px] text-base font-semibold min-h-[44px]"
        >
          {t('workout.whyDismiss')}
        </button>
      </div>
    </div>
  );
}
