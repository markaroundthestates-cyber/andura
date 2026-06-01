// ══ TRANSITION SCREEN — Workout phase='transition' splash ════════════════
// Presentational extraction from Workout.tsx (zero behavior change). The 1.5s
// transition delay + advanceExercise() timer stay in the PARENT state machine;
// this is purely the next-exercise reveal splash.
//
// Wave C3 (2026-05-28): each line rolls/fades in with a small stagger so the
// next-exercise reveal feels intentional, not a static splash. The screen-level
// backdrop fades in, then the label, name, and coach line cascade. Auto-collapses
// under reduced motion.

import type { JSX } from 'react';
import { t } from '../../../i18n/index.js';

interface TransitionScreenProps {
  nextExerciseName: string | undefined;
  coachLine: string;
}

export function TransitionScreen({
  nextExerciseName,
  coachLine,
}: TransitionScreenProps): JSX.Element {
  return (
    <div
      className="animate-fade-in fixed inset-0 bg-paper flex flex-col items-center justify-center z-40"
      data-testid="transition-screen"
      role="status"
      aria-label={t('workout.transition.ariaLabel')}
    >
      <p className="animate-fade-in-up text-2xl font-semibold text-ink mb-2">{t('workout.transition.next')}</p>
      <p
        className="animate-roll-in text-base text-ink2"
        data-testid="transition-next-name"
        style={{ animationDelay: '120ms' }}
      >
        {nextExerciseName ?? '—'}
      </p>
      <p
        className="animate-fade-in-up text-sm text-ink2 mt-4 italic font-serif"
        style={{ animationDelay: '240ms' }}
      >
        “{coachLine}"
      </p>
    </div>
  );
}
