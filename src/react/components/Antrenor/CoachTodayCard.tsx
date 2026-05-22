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
//
// §F-pass2-coachtoday-04 + §F-pass2-coachtoday-06 (HIGH-EPSILON 2026-05-22) —
// Lagging weakness signal extension (mockup L747 coach-today-lagging hidden
// block) + "Vrei altceva azi?" override link (mockup L754
// openScheduleOverride). Lagging via getLaggingSignal() weaknessDetector
// wrapper memoized. Override link navigates internally - Antrenor.tsx
// untouched (HIGH-GAMMA territory same wave 2c). Namespace import + optional-
// chained call tolerates partial mocks in sibling tests.

import type { JSX } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Layers } from 'lucide-react';
import type { PlannedWorkoutOutput } from '../../lib/engineWrappers';
import * as engineWrappers from '../../lib/engineWrappers';
import { gotoPath } from '../../lib/navigation';

// §B037 audit fix (UI-REVIEW #2) — extract design tokens out of inline style
// hex literals → CSS custom properties. Tailwind extend in `tailwind.config.js`
// pentru future bg-coach-lora / text-coach-meta utility classes; pe loc CSS vars
// inline preserve fallback. Quote color = "lora" (warm gold accent line), meta
// color = "meta" (sub-text gray-warm).
const COACH_LORA_COLOR = 'var(--coach-lora, #e8d9b8)';
const COACH_META_COLOR = 'var(--coach-meta, #a8a09a)';
// §F-pass2-coachtoday-04 — lagging extension mockup L747 color #f6c89a (warmer
// gold accent vs lora primary; secondary weakness signal context).
const COACH_LAGGING_COLOR = 'var(--coach-lagging, #f6c89a)';
// §F-pass2-coachtoday-06 — override link mockup L754 color #c8b89a (muted
// paper-tone hint subtle CTA "Vrei altceva azi?" → openScheduleOverride).
const COACH_OVERRIDE_COLOR = 'var(--coach-override, #c8b89a)';

interface Props {
  onStart: () => void;
  workout?: PlannedWorkoutOutput | null;
}

export function CoachTodayCard({ onStart, workout }: Props): JSX.Element {
  const navigate = useNavigate();
  const title = workout?.workoutTitle ?? 'Pull (spate & biceps)';
  const duration = workout?.estimatedDuration ?? 48;
  const exerciseCount = workout?.exerciseCount ?? 5;
  // §F-pass2-coachtoday-04 — memo lagging signal so weaknessDetector engine
  // call NU runs every render. Null cand T0 fresh / balanced training.
  // Namespace-imported with optional-chained access: tolerates partial mocks
  // in sibling tests that stub engineWrappers without exporting
  // getLaggingSignal (Antrenor.test pattern pre-HIGH-EPSILON dispatch).
  const laggingSignal = useMemo<string | null>(() => {
    try {
      return engineWrappers.getLaggingSignal?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  const handleOverride = (): void => {
    navigate(gotoPath('schedule-override'));
  };

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
      {laggingSignal && (
        <div
          data-testid="coach-today-lagging"
          className="font-serif italic mt-1.5 leading-relaxed text-xs pt-1.5 border-t border-dashed"
          style={{ color: COACH_LAGGING_COLOR, borderColor: 'rgba(246,200,154,0.3)' }}
        >
          &bdquo;{laggingSignal}&rdquo;
        </div>
      )}
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
      <div className="text-center mt-2.5">
        <button
          type="button"
          onClick={handleOverride}
          data-testid="coach-today-override"
          className="text-sm underline underline-offset-2"
          style={{ color: COACH_OVERRIDE_COLOR }}
        >
          Vrei altceva azi? &rarr;
        </button>
      </div>
    </div>
  );
}
