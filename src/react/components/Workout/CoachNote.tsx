// ══ COACH NOTE — Workout in-session brain note (volt card) ═══════════════
// Presentational extraction from Workout.tsx (zero behavior change). The shared
// volt-tinted "Brain" note styling used by two sibling notices in the log zone:
//   - insession-adjust-notice: DP.checkInSessionAdjust eased/raised the NEXT
//     set's target (reps in masa, weight in STRENGTH) from THIS set's rating +
//     performance vs target; surfaced honestly so the change is never silent.
//   - baseline-note: no prior history for this exercise → per-set autoregulation
//     has nothing to adapt from; explains WHY the targets are not adapting yet.
// role="status" announces the message. The decision of WHICH note to show (and
// the mutually-exclusive gating) stays in the PARENT; this is the shared shell.

import type { JSX } from 'react';
import { Brain } from 'lucide-react';

interface CoachNoteProps {
  testId: string;
  message: string;
}

export function CoachNote({ testId, message }: CoachNoteProps): JSX.Element {
  return (
    <div
      className="animate-fade-in-up mb-3 flex items-start gap-2.5 p-3 rounded-2xl font-serif italic text-sm text-ink"
      data-testid={testId}
      role="status"
      style={{
        background: 'color-mix(in oklab, var(--volt) 11%, var(--surface))',
        border: '1px solid color-mix(in oklab, var(--volt) 32%, transparent)',
      }}
    >
      <Brain
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        aria-hidden="true"
        style={{ color: 'var(--volt-deep)' }}
      />
      <span>{message}</span>
    </div>
  );
}
