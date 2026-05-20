// ══ COACH TODAY CARD — Workout Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L741 coach-today-card.
// Rendered cand coachStore.schedContext === 'workout'.
//
// §A001 audit fix (MP-pass2-coachtoday-01..03): wire workoutTitle + duration
// + exerciseCount din PlannedWorkoutOutput. Fallback mockup stub cand
// workout=null (loading state pre-aggregate or T0 baseline).

import type { JSX } from 'react';
import type { PlannedWorkoutOutput } from '../../lib/engineWrappers';

interface Props {
  onStart: () => void;
  workout?: PlannedWorkoutOutput | null;
}

export function CoachTodayCard({ onStart, workout }: Props): JSX.Element {
  const title = workout?.workoutTitle ?? 'Pull (spate & biceps)';
  const duration = workout?.estimatedDuration ?? 48;
  const exerciseCount = workout?.exerciseCount ?? 5;

  return (
    <div
      className="bg-ink text-paper rounded-2xl p-4 mb-2.5"
      role="region"
      aria-label="Coach-ul recomanda azi"
    >
      <div className="text-xs font-semibold tracking-wider uppercase text-brick">
        Coach-ul recomanda azi
      </div>
      <div className="text-xl font-bold mt-1 tracking-tight">{title}</div>
      <div
        className="font-serif italic mt-1.5 leading-relaxed text-sm"
        style={{ color: '#e8d9b8' }}
      >
        &bdquo;Pectoralii recupereaza din marti &middot; spatele e gata.&rdquo;
      </div>
      <div className="flex gap-3.5 mt-3.5 text-sm" style={{ color: '#a8a09a' }}>
        <span className="flex items-center gap-1.5">~ {duration} min</span>
        <span className="flex items-center gap-1.5">{exerciseCount} exercitii</span>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="w-full mt-3.5 bg-brick text-paper rounded-md py-2.5 font-semibold"
      >
        Incepe sesiunea
      </button>
    </div>
  );
}
