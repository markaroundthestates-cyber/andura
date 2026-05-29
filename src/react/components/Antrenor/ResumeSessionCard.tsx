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
import { t } from '../../../i18n/index.js';

interface Props {
  snapshot: PausedSession;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumeSessionCard({ snapshot, onResume, onDiscard }: Props): JSX.Element {
  const minutesAgo = Math.max(1, Math.floor((Date.now() - snapshot.sessionStart) / 60000));
  return (
    <div
      // ANDURA PULSE reskin (2026-05-29) — the paused-session recovery card is
      // the most time-sensitive surface on the home, so it gets an elevated
      // Pulse surface with a 1.5px brick accent border + brick glow corner.
      // Token-only (no raw hex) so light + every dark theme reads native.
      className="pulse-card overflow-hidden p-4 mb-4 cursor-pointer"
      style={{ border: '1.5px solid var(--brick)' }}
      role="region"
      aria-label={t('resumeSession.title')}
      onClick={onResume}
      data-testid="resume-session-card"
    >
      <div
        aria-hidden="true"
        className="absolute -top-[40px] -right-[40px] w-[140px] h-[140px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--brick) 22%, transparent), transparent 70%)',
        }}
      />
      <div className="relative flex items-center gap-3">
        <PlayCircle
          className="w-6 h-6 text-brick flex-shrink-0"
          aria-hidden="true"
          data-testid="resume-session-icon"
        />
        <div className="flex-1">
          <div className="font-mono text-[11px] tracking-wider uppercase text-brick">{t('resumeSession.title')}</div>
          <div className="font-display font-bold text-ink mt-0.5">{snapshot.title}</div>
          <div className="text-sm text-ink2 mt-0.5">
            {t('resumeSession.metaLine', { n: snapshot.exIdx + 1, min: minutesAgo })}
          </div>
        </div>
      </div>
      <div className="relative flex gap-2 mt-2.5 pt-2.5 border-t border-line">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResume();
          }}
          className="flex-1 bg-brick text-paper rounded-md px-3 py-2 text-sm font-semibold"
        >
          {t('resumeSession.resumeCta')}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDiscard();
          }}
          className="bg-transparent text-ink2 border border-line rounded-md px-3.5 py-2 text-sm font-medium"
        >
          {t('resumeSession.discardCta')}
        </button>
      </div>
    </div>
  );
}
