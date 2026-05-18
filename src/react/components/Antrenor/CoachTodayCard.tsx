// ══ COACH TODAY CARD — Workout Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L741 coach-today-card.
// Rendered cand coachStore.schedContext === 'workout'.
//
// Phase 3 stub: static title + duration + exercise count. Phase 5+ va wire
// din engineWrappers.getTodayWorkout() once scheduleAdapter exposes
// getTodayPlannedWorkout aggregate.

import type { JSX } from 'react';

interface Props {
  onStart: () => void;
}

export function CoachTodayCard({ onStart }: Props): JSX.Element {
  return (
    <div
      className="bg-ink text-paper rounded-2xl p-4 mb-2.5"
      role="region"
      aria-label="Coach-ul recomanda azi"
    >
      <div className="text-xs font-semibold tracking-wider uppercase text-brick">
        Coach-ul recomanda azi
      </div>
      <div className="text-xl font-bold mt-1 tracking-tight">Pull (spate &amp; biceps)</div>
      <div
        className="font-serif italic mt-1.5 leading-relaxed text-sm"
        style={{ color: '#e8d9b8' }}
      >
        &bdquo;Pectoralii recupereaza din marti &middot; spatele e gata.&rdquo;
      </div>
      <div className="flex gap-3.5 mt-3.5 text-sm" style={{ color: '#a8a09a' }}>
        <span className="flex items-center gap-1.5">~ 48 min</span>
        <span className="flex items-center gap-1.5">5 exercitii</span>
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
