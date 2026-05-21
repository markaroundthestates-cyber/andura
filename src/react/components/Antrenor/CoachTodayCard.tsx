// ══ COACH TODAY CARD — Workout Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L741 coach-today-card.
// Rendered cand coachStore.schedContext === 'workout'.
//
// §A001 audit fix (MP-pass2-coachtoday-01..03): wire workoutTitle + duration
// + exerciseCount din PlannedWorkoutOutput. Fallback mockup stub cand
// workout=null (loading state pre-aggregate or T0 baseline).
//
// §B012 audit fix (CODE-REVIEW L-2) — italic quote line 36 ("Pectoralii
// recupereaza...") = PERMANENT DESIGN ELEMENT mockup parity, NU engine-driven
// micro-coaching V1. Per mockup andura-clasic.html#L750 verbatim. Engine-driven
// dynamic quote candidate post-Beta (cross-ref future MMI Engine #9 extension).

import type { JSX } from 'react';
import { Clock, Layers } from 'lucide-react';
import type { PlannedWorkoutOutput } from '../../lib/engineWrappers';

// §B037 audit fix (UI-REVIEW #2) — extract design tokens out of inline style
// hex literals → CSS custom properties. Tailwind extend in `tailwind.config.js`
// pentru future bg-coach-lora / text-coach-meta utility classes; pe loc CSS vars
// inline preserve fallback. Quote color = "lora" (warm gold accent line), meta
// color = "meta" (sub-text gray-warm).
const COACH_LORA_COLOR = 'var(--coach-lora, #e8d9b8)';
const COACH_META_COLOR = 'var(--coach-meta, #a8a09a)';

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
      className="bg-ink text-paper dark:bg-paper2 dark:text-ink dark:border dark:border-brick rounded-2xl p-4 mb-2.5"
      role="region"
      aria-label="Coach-ul recomanda azi"
    >
      <div className="text-xs font-semibold tracking-wider uppercase text-brick">
        Coach-ul recomanda azi
      </div>
      <div className="text-xl font-bold mt-1 tracking-tight">{title}</div>
      <div
        className="font-serif italic mt-1.5 leading-relaxed text-sm"
        style={{ color: COACH_LORA_COLOR }}
      >
        &bdquo;Pectoralii recupereaza din marti &middot; spatele e gata.&rdquo;
      </div>
      <div className="flex gap-3.5 mt-3.5 text-sm" style={{ color: COACH_META_COLOR }}>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          ~ {duration} min
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          {exerciseCount} exercitii
        </span>
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
