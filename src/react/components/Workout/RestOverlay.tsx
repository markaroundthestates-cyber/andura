// REST OVERLAY - Workout Phase=Rest Fixed Overlay Component
// Phase 4 task_12 §A extract din Workout.tsx phase=rest conditional. Pure
// presentational — countdown timer ring + Sari pauza skip button.
//
// F-pass2-restoverlay-01 (2026-05-22): replaced text-6xl numeric display with
// SVGCountdownRing per mockup andura-clasic.html L1517-1522 signature parity.
//
// Stateless: parent Workout.tsx owns countdown state (interval decrement
// effect + auto-advance la phase=logging cand reaches 0) + onSkip handler
// (setRestCountdown(0) + setPhase('logging')).
//
// data-testid preserved verbatim — rest-overlay (root) / rest-countdown (now
// inherited by SVGCountdownRing wrapper) / rest-skip + role="dialog"
// aria-label "Pauza activa" pentru Workout.test.tsx baseline preserve.

import type { JSX } from 'react';
import { SVGCountdownRing } from './SVGCountdownRing';

interface RestOverlayProps {
  countdownSec: number;
  initialRestSec: number;
  onSkip: () => void;
}

export function RestOverlay({
  countdownSec,
  initialRestSec,
  onSkip,
}: RestOverlayProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 bg-paper/95 flex flex-col items-center justify-center z-50"
      data-testid="rest-overlay"
      role="dialog"
      aria-label="Pauza activa"
    >
      <p className="text-sm text-ink2 mb-4">Pauza</p>
      <SVGCountdownRing
        totalSec={initialRestSec}
        remainingSec={countdownSec}
      />
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
