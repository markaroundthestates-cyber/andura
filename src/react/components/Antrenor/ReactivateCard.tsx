// ══ REACTIVATE CARD — Win-Back Inactive >14 Zile ══════════════════════════
// Per mockup andura-clasic.html#L812 reactivate-card.
// Rendered conditional pe lastSession age > 14 zile + NOT dismissed.

import type { JSX } from 'react';
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
      className="bg-paper border border-line rounded-xl p-4 mb-4"
      role="region"
      aria-label="Bun venit inapoi"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="font-bold text-ink text-base">Bun venit inapoi</div>
      </div>
      <div className="text-sm text-ink2 leading-relaxed">
        N-am vorbit de <b>{daysAgo} zile</b>. Fara presiune - reluam usor, cu o sesiune
        ajustata.
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 bg-ink text-paper rounded-lg px-3 py-2.5 text-sm font-semibold"
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
