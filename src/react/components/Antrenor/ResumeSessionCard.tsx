// ══ RESUME SESSION CARD — Mid-Session Recovery ════════════════════════════
// Per mockup andura-clasic.html#L794 resume-session-card.
// Rendered conditional pe workoutStore.pausedSnapshot !== null.

import type { JSX } from 'react';
import type { PausedSession } from '../../stores/workoutStore';

interface Props {
  snapshot: PausedSession;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumeSessionCard({ snapshot, onResume, onDiscard }: Props): JSX.Element {
  const minutesAgo = Math.max(1, Math.floor((Date.now() - snapshot.sessionStart) / 60000));
  return (
    <div
      className="bg-paper2 border border-brick rounded-xl p-4 mb-4 cursor-pointer"
      role="region"
      aria-label="Reia sesiunea"
      onClick={onResume}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-xs font-bold tracking-wider uppercase text-brick">Reia sesiunea</div>
          <div className="font-bold text-ink mt-0.5">{snapshot.title}</div>
          <div className="text-sm text-ink2 mt-0.5">
            Oprit la ex {snapshot.exIdx + 1} · acum {minutesAgo} min
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-line">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResume();
          }}
          className="flex-1 bg-ink text-paper rounded-md px-3 py-2 text-sm font-semibold"
        >
          Reia
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDiscard();
          }}
          className="bg-transparent text-ink2 border border-line rounded-md px-3.5 py-2 text-sm font-medium"
        >
          Renunta
        </button>
      </div>
    </div>
  );
}
