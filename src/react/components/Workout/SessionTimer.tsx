// ══ SESSION TIMER — Workout Header Zone Component ════════════════════════
// Phase 4 task_12 §A extract din Workout.tsx ~lines 196-222. Pure
// presentational — sticky header cu workout title + Ex N/M progress +
// elapsed MM:SS + X close button + ⋯ menu button (mockup parity §F-pass2-
// sessiontimer-01 2026-05-22). Sound row render-gated pe onToggleSound
// (ascuns pana exista subsistem audio — decizie Daniel parity LOW).
//
// Stateless WRT parent (exIdx/elapsed/exitSheetOpen owned upstream). Menu
// sheet open/close = internal local state (self-contained, no parent wire
// required pentru open/close). Action handlers optional callback props —
// parent passes when wires real handlers (pain navigate, skip exercise,
// finish-early, sound toggle, cancel session). Defaults = noop so existing
// callsites compile fara breaking change.
//
// Mockup verbatim andura-clasic.html#L1341-1574 (chrome ⋯ button +
// "Optiuni sesiune" bottom sheet pain/skip/finish/cancel; sound row gated pe
// onToggleSound — ascuns pana exista subsistem audio).
//
// §F-pass2-sessiontimer-02 (HIGH-DELTA 2026-05-22): workoutTitle optional
// prop — center label shows workout name (e.g. "Push · piept si umeri") in
// preference to current-exercise name. Backward compat: when workoutTitle
// absent, falls back to exerciseName (existing behavior). Parent (Workout.tsx)
// wires planned.workoutTitle from PlannedWorkoutOutput aggregate.
//
// §F-pass2-sessiontimer-04 (HIGH-DELTA 2026-05-22): optional setsDone /
// setsTotal / exerciseCount / exerciseTotal props drive a `wv2-progress`
// bar block below the chrome header — sets counter + exercise counter +
// linear fill 0-100%. Block render-gated on setsTotal > 0. Backward compat:
// when not provided, block omitted (existing layout preserved).
//
// data-testid preserved verbatim pentru Workout.test.tsx baseline (workout-
// title / workout-progress / workout-elapsed / workout-exit-trigger +
// role="button" aria-label "Iesi din sesiune"). New testids:
// workout-menu-trigger / workout-menu-sheet / workout-menu-{row} +
// workout-progress-bar / workout-progress-sets / workout-progress-ex /
// workout-progress-fill.

import { memo, useState } from 'react';
import type { JSX } from 'react';
import { X, MoreHorizontal, AlertCircle, SkipForward, Flag, Volume2, VolumeX, XCircle } from 'lucide-react';
import { SessionElapsed } from './SessionElapsed';
import { t } from '../../../i18n/index.js';

interface SessionTimerProps {
  exerciseName: string;
  exIdx: number; // 0-indexed
  totalExercises: number;
  // Perf isolation: was `elapsedSec: number` (recomputed in Workout.tsx every
  // second → whole-subtree re-render). Now the raw session start epoch ms, a
  // value that changes only at session start/discard. The per-second tick lives
  // in the <SessionElapsed> leaf rendered below, so SessionTimer (React.memo)
  // does NOT reconcile each second.
  sessionStart: number | null;
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
  // §F-pass2-sessiontimer-02 — workout name center label (e.g. "Push · piept
  // & umeri"). Falls back to exerciseName cand absent (backward compat).
  workoutTitle?: string;
  // §F-pass2-sessiontimer-04 — wv2-progress block sets+exercises counters +
  // fill bar. Block rendered only cand setsTotal>0 (gate).
  setsDone?: number;
  setsTotal?: number;
  exerciseCount?: number; // 1-indexed display number (e.g. 2 of 5)
  exerciseTotal?: number;
}

function SessionTimerImpl({
  exerciseName,
  exIdx,
  totalExercises,
  sessionStart,
  onExit,
  onPain,
  onSkipExercise,
  onFinishEarly,
  onToggleSound,
  onCancelSession,
  soundOn = true,
  workoutTitle,
  setsDone,
  setsTotal,
  exerciseCount,
  exerciseTotal,
}: SessionTimerProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  function handleAction(action?: () => void): void {
    closeMenu();
    if (action) action();
  }

  // §F-pass2-sessiontimer-02 — center label: workout name (e.g. "Push · piept
  // & umeri") if provided, else exercise name fallback. Mockup verbatim
  // andura-clasic.html#L1345.
  const centerLabel = workoutTitle ?? exerciseName;

  // §F-pass2-sessiontimer-04 — wv2-progress block render gate. Setting total
  // 0 (rest day / loading) skips render. fillPct clamped 0-100.
  const showProgress = typeof setsTotal === 'number' && setsTotal > 0;
  const fillPct = showProgress
    ? Math.min(100, Math.max(0, Math.round(((setsDone ?? 0) / (setsTotal as number)) * 100)))
    : 0;

  return (
    <>
      <header className="sticky top-0 bg-paper border-b border-line p-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-base font-semibold text-ink" data-testid="workout-title">
            {centerLabel}
          </h1>
          <p className="text-sm text-ink2" data-testid="workout-progress">
            {t('workoutHeader.exerciseProgress', { n: exIdx + 1, total: totalExercises })}{' '}
            <SessionElapsed startedAt={sessionStart} />
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onExit}
            aria-label={t('workout.timer.exitAriaLabel')}
            data-testid="workout-exit-trigger"
            className="p-2 rounded-full text-ink2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('workout.timer.menuAriaLabel')}
            data-testid="workout-menu-trigger"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="p-2 rounded-full text-ink2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* §F-pass2-sessiontimer-04 — wv2-progress block. Mockup #L1351-1358. */}
      {showProgress && (
        <div
          className="px-5 pt-2 pb-3 bg-paper border-b border-line"
          data-testid="workout-progress-bar"
        >
          <div className="flex items-center justify-between text-[11px] text-ink2 uppercase tracking-wide font-medium mb-1.5">
            <span data-testid="workout-progress-sets">
              {(setsDone ?? 0) === 1 && (setsTotal as number) === 1
                ? t('workout.progress.setsLabel_one', { done: setsDone ?? 0, total: setsTotal as number })
                : t('workout.progress.setsLabel_other', { done: setsDone ?? 0, total: setsTotal as number })}
            </span>
            <span data-testid="workout-progress-ex">
              {(() => {
                const done = exerciseCount ?? exIdx + 1;
                const total = exerciseTotal ?? totalExercises;
                return done === 1 && total === 1
                  ? t('workout.progress.exercisesLabel_one', { done, total })
                  : t('workout.progress.exercisesLabel_other', { done, total });
              })()}
            </span>
          </div>
          <div className="h-1 bg-paper2 rounded-sm overflow-hidden">
            <span
              data-testid="workout-progress-fill"
              className="block h-full bg-brick transition-all duration-300"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      )}

      {menuOpen && (
        <div
          className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
          data-testid="workout-menu-backdrop"
          onClick={closeMenu}
        >
          <div
            className="animate-slide-up bg-paper rounded-t-2xl p-4 w-full max-w-md"
            data-testid="workout-menu-sheet"
            role="dialog"
            aria-label={t('workout.timer.menuAriaLabel')}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-3 px-2">
              {t('workout.timer.menuHeading')}
            </p>

            <button
              type="button"
              onClick={() => handleAction(onPain)}
              data-testid="workout-menu-pain"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-ink rounded-lg hover:bg-paper2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{t('workout.timer.actions.pain')}</span>
                <span className="block text-xs text-ink2">{t('workout.timer.actions.painDesc')}</span>
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
                <span className="block text-sm font-semibold">{t('workout.timer.actions.skip')}</span>
                <span className="block text-xs text-ink2">{t('workout.timer.actions.skipDesc')}</span>
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
                <span className="block text-sm font-semibold">{t('workout.timer.actions.finishEarly')}</span>
                <span className="block text-xs text-ink2">{t('workout.timer.actions.finishEarlyDesc')}</span>
              </span>
            </button>

            {/* Parity LOW (decizie Daniel): randul Sunet e ascuns pana exista
                un subsistem audio/vibratie real. Render-gated pe onToggleSound
                — Workout.tsx NU il paseaza intentionat (ar fi toggle fals).
                Cand un parent wireaza un handler real, randul reapare. */}
            {onToggleSound && (
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
                    {soundOn ? t('workout.timer.actions.soundOn') : t('workout.timer.actions.soundOff')}
                  </span>
                  <span className="block text-xs text-ink2">{t('workout.timer.actions.soundDesc')}</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAction(onCancelSession)}
              data-testid="workout-menu-cancel"
              className="w-full flex items-center gap-3 px-3 py-3 text-left text-brick rounded-lg hover:bg-paper2"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{t('workout.timer.actions.cancel')}</span>
                <span className="block text-xs text-ink2">{t('workout.timer.actions.cancelDesc')}</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Perf isolation: memoized so the header chrome reconciles only when its own
// props change (exercise/title/progress/handlers). The per-second elapsed tick
// is owned by the <SessionElapsed> leaf inside, NOT a SessionTimer prop, so
// memo holds across every clock tick. Parent (Workout) passes stable
// useCallback handlers + the raw sessionStart timestamp to keep this effective.
export const SessionTimer = memo(SessionTimerImpl);
