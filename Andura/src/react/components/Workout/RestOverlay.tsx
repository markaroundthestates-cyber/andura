// ══ REST OVERLAY — Workout Phase=Rest Fixed Overlay Component ════════════
// Phase 4 task_12 §A extract din Workout.tsx phase=rest conditional. Pure
// presentational — countdown timer + Sari pauza skip button.
//
// Stateless: parent Workout.tsx owns countdown state (interval decrement
// effect + auto-advance la phase=logging cand reaches 0) + onSkip handler
// (setRestCountdown(0) + setPhase('logging')).
//
// data-testid preserved verbatim (rest-overlay / rest-countdown / rest-skip)
// + role="dialog" aria-label "Pauza activa" pentru Workout.test.tsx baseline
// preserve.

import type { JSX } from 'react';
import { formatMMSS } from '../../lib/format';

interface RestOverlayProps {
  countdownSec: number;
  onSkip: () => void;
}

export function RestOverlay({ countdownSec, onSkip }: RestOverlayProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 bg-paper/95 flex flex-col items-center justify-center z-50"
      data-testid="rest-overlay"
      role="dialog"
      aria-label="Pauza activa"
    >
      <p className="text-sm text-ink2 mb-2">Pauza</p>
      <p
        className="text-6xl font-bold text-ink font-mono"
        data-testid="rest-countdown"
      >
        {formatMMSS(countdownSec)}
      </p>
      <button
        type="button"
        onClick={onSkip}
        data-testid="rest-skip"
        className="mt-6 px-6 py-3 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        Sari pauza
      </button>
    </div>
  );
}
