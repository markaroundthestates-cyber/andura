// ══ SESSION TIMER — Workout Header Zone Component ════════════════════════
// Phase 4 task_12 §A extract din Workout.tsx ~lines 196-222. Pure
// presentational — sticky header cu workout title + Ex N/M progress +
// elapsed MM:SS + X close button + ⋯ menu button (mockup parity §F-pass2-
// sessiontimer-01 2026-05-22).
//
// Stateless WRT parent (exIdx/elapsed/exitSheetOpen owned upstream). Menu
// sheet open/close = internal local state (self-contained, no parent wire
// required pentru open/close). Action handlers optional callback props —
// parent passes when wires real handlers (pain navigate, skip exercise,
// finish-early, sound toggle, cancel session). Defaults = noop so existing
// callsites compile fara breaking change.
//
// Mockup verbatim andura-clasic.html#L1341-1574 (chrome ⋯ button +
// "Optiuni sesiune" bottom sheet 5 rows pain/skip/finish/sound/cancel).
//
// data-testid preserved verbatim pentru Workout.test.tsx baseline (workout-
// title / workout-progress / workout-elapsed / workout-exit-trigger +
// role="button" aria-label "Iesi din sesiune"). New testids:
// workout-menu-trigger / workout-menu-sheet / workout-menu-{row}.

import { useState } from 'react';
import type { JSX } from 'react';
import { X, MoreHorizontal, AlertCircle, SkipForward, Flag, Volume2, VolumeX, XCircle } from 'lucide-react';
import { formatMMSS } from '../../lib/format';

interface SessionTimerProps {
  exerciseName: string;
  exIdx: number; // 0-indexed
  totalExercises: number;
  elapsedSec: number;
  onExit: () => void;
  // §F-pass2-sessiontimer-01 — optional menu action handlers. Defaults noop
  // so existing Workout.tsx callsite compiles fara modificare (parent
  // wires Phase 7+ cand action targets devin available).
  onPain?: () => void;
  onSkipExercise?: () => void;
  onFinishEarly?: () => void;
  onToggleSound?: () => void;
  onCancelSession?: () => void;
  soundOn?: boolean; // drives Volume2/VolumeX icon + label "Sunet: pornit/oprit"
}

export function SessionTimer({
  exerciseName,
  exIdx,
  totalExercises,
  elapsedSec,
  onExit,
  onPain,
  onSkipExercise,
  onFinishEarly,
  onToggleSound,
  onCancelSession,
  soundOn = true,
}: SessionTimerProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  function handleAction(action?: () => void): void {
    closeMenu();
    if (action) action();
  }

  return (
    <>
      <header className="sticky top-0 bg-paper border-b border-line p-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-base font-semibold text-ink" data-testid="workout-title">
            {exerciseName}
          </h1>
          <p className="text-sm text-ink2" data-testid="workout-progress">
            Ex {exIdx + 1}/{totalExercises}{' '}
            <span data-testid="workout-elapsed">· {formatMMSS(elapsedSec)}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onExit}
            aria-label="Iesi din sesiune"
            data-testid="workout-exit-trigger"
            className="p-2 rounded-full text-ink2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Optiuni sesiune"
            data-testid="workout-menu-trigger"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="p-2 rounded-full text-ink2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
          data-testid="workout-menu-backdrop"
          onClick={closeMenu}
        >
          <div
            className="bg-paper rounded-t-2xl p-4 w-full max-w-md"
            data-testid="workout-menu-sheet"
            role="dialog"
            aria-label="Optiuni sesiune"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-3 px-2">
              Optiuni sesiune
            </p>

            <button
              type="button"
              onClick={() => handleAction(onPain)}
              data-testid="workout-menu-pain"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-ink rounded-lg hover:bg-paper2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">Ma doare ceva</span>
                <span className="block text-xs text-ink2">Coach reduce intensitatea sau schimba exercitiul</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onSkipExercise)}
              data-testid="workout-menu-skip"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-ink rounded-lg hover:bg-paper2"
            >
              <SkipForward className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">Sari exercitiul curent</span>
                <span className="block text-xs text-ink2">Treci la urmatorul, fara penalizare</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onFinishEarly)}
              data-testid="workout-menu-finish-early"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-ink rounded-lg hover:bg-paper2"
            >
              <Flag className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">Termina mai devreme</span>
                <span className="block text-xs text-ink2">Sesiunea partiala se inregistreaza, NU pierzi progresul</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onToggleSound)}
              data-testid="workout-menu-sound"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-ink rounded-lg hover:bg-paper2"
            >
              {soundOn ? (
                <Volume2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              ) : (
                <VolumeX className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              )}
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  {soundOn ? 'Sunet: pornit' : 'Sunet: oprit'}
                </span>
                <span className="block text-xs text-ink2">Vibratie + ding la finalul pauzei</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onCancelSession)}
              data-testid="workout-menu-cancel"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-brick rounded-lg hover:bg-paper2"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">Anuleaza sesiunea</span>
                <span className="block text-xs text-ink2">Pierzi progresul din sesiunea curenta</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
