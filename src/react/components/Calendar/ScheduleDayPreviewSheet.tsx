// ══ SCHEDULE DAY PREVIEW SHEET — read-only proposed-workout preview ════════
// Tapping a TRAINING day on the weekly schedule (Calendar7Day) when NOT in edit
// mode opens this bottom sheet: a READ-ONLY preview of the exercises the coach
// would propose for that specific day. The list is DYNAMIC — it comes from the
// same engine pipeline the real Workout/WorkoutPreview screen uses
// (getWorkoutForDay → composePlannedWorkoutToday → scheduleAdapter.getDailyWorkout),
// so it reflects current recovery / readiness / progression for that day.
//
// States (honest — never fabricate a session):
//   - REST day            → rest copy (engine not even invoked; the day is rest
//                           per the live schedule).
//   - TRAINING + exercises → proposed exercise list (name + sets/reps/target).
//   - TRAINING + null/empty → explanatory empty state (engine can't produce a
//                           session yet: too far out / insufficient data).
//
// Read-only: NO logging, NO editing the session from here (the "Confirma, incep"
// CTA from WorkoutPreview is deliberately absent). Recomputes from the live
// engine each open (re-runs on `dayIdx` change) so it tracks current state.
//
// UX idiom mirrors the existing Pulse bottom-sheet (Workout/AparatLipsaSheet):
// fade-in backdrop + slide-up panel + role=dialog + Escape close + focus
// management + focus restore on close.
//
// Edit-mode behavior is UNCHANGED — in edit mode Calendar7Day still routes a tap
// to toggleDay (this sheet never opens). See Calendar7Day.tsx onClick branch.
//
// Cross-refs:
//   - src/react/lib/engineWrappers.ts getWorkoutForDay / resolveSessionTitle
//   - src/react/routes/screens/antrenor/WorkoutPreview.tsx (presentation source)
//   - src/react/components/Workout/AparatLipsaSheet.tsx (sheet pattern source)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Layers, Clock } from 'lucide-react';
import {
  getWorkoutForDay,
  resolveSessionTitle,
} from '../../lib/engineWrappers';
import type { PlannedWorkoutOutput, PlannedExercise } from '../../lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../lib/scheduleAdapterAggregate';
import { ExerciseMedia } from '../ExerciseMedia';
import { Kicker } from '../pulse/Kicker';
import { t } from '../../../i18n/index.js';

interface ScheduleDayPreviewSheetProps {
  /** Open boolean — parent (Calendar7Day) owns it. */
  open: boolean;
  /** Monday-first weekday index 0..6 of the tapped day. null when closed. */
  dayIdx: number | null;
  /** Live schedule kind for that day — drives rest vs training routing. */
  dayKind: 'training' | 'rest';
  /** Localized day label (e.g. "Mon" / "L") for the sheet title. */
  dayLabel: string;
  onClose: () => void;
}

// Same bodyweight-aware detail copy as WorkoutPreview (kept local so the preview
// sheet stays self-contained + read-only; identical i18n keys → identical copy).
function exerciseDetail(ex: PlannedExercise): string {
  if (ex.isBodyweight) {
    return ex.targetKg > 0
      ? t('workout.preview.exerciseDetailBodyweightAdded', {
          sets: ex.sets,
          kg: ex.targetKg,
          reps: ex.targetReps,
        })
      : t('workout.preview.exerciseDetailBodyweight', {
          sets: ex.sets,
          reps: ex.targetReps,
        });
  }
  return t('workout.preview.exerciseDetail', {
    sets: ex.sets,
    kg: ex.targetKg,
    reps: ex.targetReps,
  });
}

// Resolve the localized session title the same way WorkoutPreview does — a real
// engine title passes through; the non-localized sentinel (or legacy fallback)
// derives from the engine session type (PUSH/PULL/...).
function resolveTitle(workout: PlannedWorkoutOutput): string {
  const raw = workout.workoutTitle;
  const engineFallbackSentinel = t('coachToday.engineFallbackTitle');
  const isFallback =
    raw === ENGINE_WORKOUT_TITLE_FALLBACK ||
    raw === 'Antrenament azi' ||
    raw === engineFallbackSentinel;
  return raw && !isFallback ? raw : resolveSessionTitle(workout.sessionType);
}

export function ScheduleDayPreviewSheet({
  open,
  dayIdx,
  dayKind,
  dayLabel,
  onClose,
}: ScheduleDayPreviewSheetProps): JSX.Element | null {
  const [workout, setWorkout] = useState<PlannedWorkoutOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Recompute from the live engine each open + whenever the tapped day changes.
  // Rest days skip the engine entirely (the day is rest per the live schedule —
  // the coach proposes nothing). Training days fetch the proposed session.
  useEffect(() => {
    if (!open || dayIdx === null) return;
    if (dayKind === 'rest') {
      setWorkout(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setWorkout(null);
    getWorkoutForDay(dayIdx)
      .then((w) => {
        if (!cancelled) {
          setWorkout(w);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkout(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, dayIdx, dayKind]);

  // Focus management + Escape close + focus restore (mirror AparatLipsaSheet).
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open || dayIdx === null) return null;

  const isRest = dayKind === 'rest';
  const kindLabel = isRest
    ? t('calendar.dayPreview.restKind')
    : t('calendar.dayPreview.trainingKind');
  const exercises = workout?.exercises ?? [];
  const hasSession = !isRest && workout !== null && exercises.length > 0;

  return (
    <div
      className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50"
      data-testid="schedule-day-preview-backdrop"
      onClick={onClose}
    >
      <div
        className="animate-slide-up bg-paper rounded-t-2xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
        data-testid="schedule-day-preview-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('calendar.dayPreview.ariaLabel')}
        onClick={(e) => e.stopPropagation()}
      >
        <Kicker color="var(--volt)">
          {t('calendar.dayPreview.title', { day: dayLabel, kind: kindLabel })}
        </Kicker>

        {hasSession && (
          <h2
            className="font-display text-xl font-bold mt-1 tracking-tight text-ink leading-tight"
            data-testid="schedule-day-preview-title"
          >
            {resolveTitle(workout)}
          </h2>
        )}

        {/* Meta row (count + duration) — only for a real proposed session. */}
        {hasSession && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 mb-1 text-sm text-ink2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              {t('calendar.dayPreview.metaCount', { n: exercises.length })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {t('calendar.dayPreview.metaDuration', {
                min: workout.estimatedDuration,
              })}
            </span>
          </div>
        )}

        {/* REST state — the day is rest per the live schedule. */}
        {isRest && (
          <p
            className="text-sm text-ink2 leading-relaxed mt-2"
            data-testid="schedule-day-preview-rest"
          >
            {t('calendar.dayPreview.restBody')}
          </p>
        )}

        {/* LOADING state (training day, engine pending). */}
        {!isRest && loading && (
          <p
            className="text-sm text-ink3 italic leading-relaxed mt-2"
            data-testid="schedule-day-preview-loading"
            aria-live="polite"
          >
            {t('workout.preview.loading')}
          </p>
        )}

        {/* EMPTY state — training day but the engine can't propose a session
            (too far out / insufficient data). Honest copy, NO fabricated list. */}
        {!isRest && !loading && !hasSession && (
          <p
            className="text-sm text-ink2 leading-relaxed mt-2"
            data-testid="schedule-day-preview-empty"
          >
            {t('calendar.dayPreview.emptyBody')}
          </p>
        )}

        {/* PROPOSED exercise list — read-only (no logging / editing). */}
        {hasSession && (
          <>
            <div className="mt-3 mb-2">
              <Kicker>{t('calendar.dayPreview.exercisesHeading')}</Kicker>
            </div>
            <ul
              className="pulse-card divide-y divide-line overflow-hidden mb-4"
              data-testid="schedule-day-preview-list"
            >
              {exercises.map((ex, i) => (
                <li
                  key={ex.id}
                  className="flex items-center gap-3 p-3"
                  data-testid="schedule-day-preview-exercise"
                >
                  <div className="relative flex-shrink-0">
                    <ExerciseMedia
                      engineName={ex.engineName ?? ex.name}
                      variant="thumbnail"
                      testId={`schedule-day-preview-media-${i}`}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border border-paper flex items-center justify-center font-mono font-bold text-[10px]"
                      style={{
                        background:
                          'color-mix(in oklab, var(--brick) 16%, var(--paper))',
                        color: 'var(--brick)',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {ex.name}
                    </div>
                    {ex.sub && (
                      <div className="text-xs text-ink3 mt-0.5">{ex.sub}</div>
                    )}
                    <div className="text-xs text-ink3 font-mono mt-0.5">
                      {exerciseDetail(ex)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Honest live-recompute note — this is a preview, not a plan you can
                edit; it tracks current recovery/progress each open. */}
            <p
              className="text-sm text-ink3 italic leading-relaxed mb-3"
              data-testid="schedule-day-preview-live-note"
            >
              {t('calendar.dayPreview.liveNote')}
            </p>
          </>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          data-testid="schedule-day-preview-close"
          className="w-full mt-1 py-2.5 text-ink2 text-sm min-h-[44px]"
        >
          {t('calendar.dayPreview.closeCta')}
        </button>
      </div>
    </div>
  );
}
