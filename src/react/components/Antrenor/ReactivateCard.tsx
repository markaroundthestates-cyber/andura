// ══ REACTIVATE CARD — Win-Back Inactive >14 Zile ══════════════════════════
// Per mockup andura-clasic.html#L812 reactivate-card.
// Rendered conditional pe lastSession age > 14 zile + NOT dismissed.
//
// §F-pass2-reactivate-01 (MED Wave 7 2026-05-23) — Hand brick icon 20x20
// left of title per mockup L814 verbatim (visual warmth before win-back copy).
//
// §F-pass2-reactivate-02 (LOW chat5 Wave 10) — border-lineStrong (warm
// taupe interactive boundary --line-strong #9a8770) replaces border-line
// (decorative thin #e7e0d0) per mockup L812 verbatim `var(--line-strong)`
// 1.5px boundary. Conditional card visibility > faint decorative line.

import type { JSX } from 'react';
import { Hand } from 'lucide-react';
import type { LastSessionSummary } from '../../stores/workoutStore';

interface Props {
  lastSession: LastSessionSummary;
  onStart: () => void;
  onDismiss: () => void;
}

export function ReactivateCard({ lastSession, onStart, onDismiss }: Props): JSX.Element {
  const daysAgo = Math.floor((Date.now() - lastSession.ts) / 86400000);
  return (
    <div
      className="surface-elevated bg-paper2 border border-lineStrong rounded-2xl p-4 mb-4"
      role="region"
      aria-label="Bun venit inapoi"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <Hand
          className="w-5 h-5 text-brick flex-shrink-0"
          aria-hidden="true"
          data-testid="reactivate-icon"
        />
        <div className="font-display font-bold text-ink text-base">Bun venit inapoi</div>
      </div>
      <div className="text-sm text-ink2 leading-relaxed">
        N-am vorbit de <b>{daysAgo} zile</b>. Fara presiune - reluam usor, cu o sesiune
        ajustata.
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 bg-brick text-paper rounded-lg px-3 py-2.5 text-sm font-semibold"
        >
          Incep usor
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="bg-transparent text-ink2 border border-line rounded-lg px-3.5 py-2.5 text-sm font-medium"
        >
          Mai tarziu
        </button>
      </div>
    </div>
  );
}
