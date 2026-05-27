// REST OVERLAY - Workout Phase=Rest Bottom Card
// Phase 4 task_12 §A extract din Workout.tsx phase=rest conditional. Pure
// presentational — countdown timer ring + Sari pauza skip button.
//
// F-pass2-restoverlay-01 (2026-05-22): replaced text-6xl numeric display with
// SVGCountdownRing per mockup andura-clasic.html L1517-1522 signature parity.
//
// §F-pass2-restoverlay-03 (MED chat5 Wave 11) — contextual cue extension
// mockup pattern "Pauza · {currentExercise} recupereaza". Optional prop
// currentExerciseName surfaced sub "Pauza" header; rendered DOAR cand
// non-empty. Stateless preserve — parent Workout.tsx passes
// currentExercise.name (mockup L1515 next-exercise context hint).
//
// BUG #7+#8 (2026-05-27): aliniat la mockup andura-clasic.html L1600-1613 +
// L2794-2803 — card NON-modal pinned bottom (NU full-screen inset-0), fundal
// dark var(--ink) + text alb var(--paper), layout orizontal ring+body+skip.
// Fix #7 = paritate vizuala (negru/alb vs vechiul bg-paper deschis fullscreen).
// Fix #8 = cardul ocupa doar banda de jos, deci butoanele X + ... din header
// (SessionTimer sticky top z-10) raman clickabile in timpul pauzei (vechiul
// fixed inset-0 z-50 le acoperea + intercepta pointer events).
//
// Stateless: parent Workout.tsx owns countdown state (interval decrement
// effect + auto-advance la phase=logging cand reaches 0) + onSkip handler
// (setRestCountdown(0) + setPhase('logging')).
//
// data-testid preserved verbatim — rest-overlay (root) / rest-countdown (now
// inherited by SVGCountdownRing wrapper) / rest-skip + role="dialog"
// aria-label "Pauza activa" pentru Workout.test.tsx baseline preserve.

import type { JSX } from 'react';
import { SkipForward } from 'lucide-react';
import { SVGCountdownRing } from './SVGCountdownRing';

interface RestOverlayProps {
  countdownSec: number;
  initialRestSec: number;
  onSkip: () => void;
  // §F-pass2-restoverlay-03 — optional current exercise context. Cand
  // non-empty, renders sub-label "{name} recupereaza" pentru contextual cue.
  currentExerciseName?: string;
}

export function RestOverlay({
  countdownSec,
  initialRestSec,
  onSkip,
  currentExerciseName,
}: RestOverlayProps): JSX.Element {
  return (
    <div
      className="fixed left-3.5 right-3.5 bottom-[78px] z-40 flex items-center gap-3.5 rounded-[18px] px-4 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
      style={{ background: 'var(--ink)', color: 'var(--paper)' }}
      data-testid="rest-overlay"
      role="dialog"
      aria-label="Pauza activa"
    >
      <SVGCountdownRing
        totalSec={initialRestSec}
        remainingSec={countdownSec}
        timeColorClass="text-paper"
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.1em] text-brick"
        >
          Pauza
        </p>
        {currentExerciseName && (
          <p
            className="font-serif italic text-[13px] leading-snug mt-0.5"
            style={{ color: 'var(--paper)' }}
            data-testid="rest-context-line"
          >
            {currentExerciseName} recupereaza
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onSkip}
        data-testid="rest-skip"
        className="flex-shrink-0 flex items-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-xs font-semibold"
        style={{
          background: 'rgba(255,255,255,0.12)',
          borderColor: 'rgba(255,255,255,0.2)',
          color: 'var(--paper)',
        }}
      >
        <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
        Sari pauza
      </button>
    </div>
  );
}
