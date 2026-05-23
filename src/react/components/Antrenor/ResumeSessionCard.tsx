// ══ RESUME SESSION CARD — Mid-Session Recovery ════════════════════════════
// Per mockup andura-clasic.html#L794 resume-session-card.
// Rendered conditional pe workoutStore.pausedSnapshot !== null.
//
// §F-pass2-resume-01 (MED Wave 7 2026-05-23) — PlayCircle brick icon 24x24
// left of content per mockup L796 verbatim (visual call-to-action affordance).
//
// §F-pass2-resume-02 (LOW chat5 Wave 11) — background warm cream #fdf6e8
// per mockup L795 verbatim (urgent-friendly accent vs default paper2 neutral).
// Tailwind arbitrary value `bg-[#fdf6e8]` on light theme; `dark:bg-paper2`
// preserves dark fallback (cream tint loses contrast pe dark surfaces).

import type { JSX } from 'react';
import { PlayCircle } from 'lucide-react';
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
      // §F-pass2-resume-02 — mockup L795 verbatim warm cream urgent-friendly
      // tint #fdf6e8 (light) cu dark fallback paper2 (cream tint loses contrast
      // pe dark surfaces). Tailwind arbitrary value preserves dark: prefix
      // selector specificity superior la inline style.
      className="bg-[#fdf6e8] dark:bg-paper2 border border-brick rounded-xl p-4 mb-4 cursor-pointer"
      role="region"
      aria-label="Reia sesiunea"
      onClick={onResume}
      data-testid="resume-session-card"
    >
      <div className="flex items-center gap-3">
        <PlayCircle
          className="w-6 h-6 text-brick flex-shrink-0"
          aria-hidden="true"
          data-testid="resume-session-icon"
        />
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
