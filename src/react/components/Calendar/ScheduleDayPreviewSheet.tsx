// ══ SCHEDULE DAY PREVIEW SHEET — clock-aware day preview ═══════════════════
// Tapping a TRAINING day on the weekly schedule (Calendar7Day) when NOT in edit
// mode opens this bottom sheet. The app HAS A CLOCK: the previewed weekday is
// classified PAST / TODAY / FUTURE (date derived from dayIdx via the engine's
// own dateForWeekdayIndex, current week, compared at LOCAL midnight via localKey
// — the SAME local-date logic CalendarHeatmap uses, never UTC).
//
//   - TODAY / FUTURE → the DYNAMIC engine PROPOSAL (getWorkoutForDay →
//     composePlannedWorkoutToday → scheduleAdapter.getDailyWorkout), reflecting
//     current recovery / readiness / progression. Recomputes each open.
//   - PAST → what the user ACTUALLY did: the logged session from
//     useWorkoutStore.sessionsHistory matched by local date (read-only, real
//     performed kg×reps per set). The proposal engine is NOT invoked for a past
//     day — we never fabricate a "proposed" plan for a day already gone.
//
// States (honest — never fabricate a session):
//   - REST day                  → rest copy (engine not invoked).
//   - TODAY/FUTURE + exercises  → proposed exercise list (name + sets/reps/target).
//   - TODAY/FUTURE + null/empty → explanatory empty state (engine can't produce
//                                 a session yet: too far out / insufficient data).
//   - PAST + logged session     → "what you did" — real exercises + actual sets.
//   - PAST + no session         → honest "missed" state (you didn't train).
//
// Read-only: NO logging, NO editing the session from here (the "Confirma, incep"
// CTA from WorkoutPreview is deliberately absent). The TODAY/FUTURE proposal
// recomputes from the live engine each open; the PAST view is static history.
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
  dateForWeekdayIndex,
} from '../../lib/engineWrappers';
import type { PlannedWorkoutOutput, PlannedExercise } from '../../lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../lib/scheduleAdapterAggregate';
import { useWorkoutStore } from '../../stores/workoutStore';
import type { LastSessionSummary } from '../../stores/workoutStore';
import { localKey } from '../../lib/useSessionsByDate';
import { ExerciseMedia } from '../ExerciseMedia';
import { Kicker } from '../pulse/Kicker';
import { t } from '../../../i18n/index.js';

// Temporal classification of the previewed weekday relative to TODAY. The app
// must have a clock: a PAST day shows what the user ACTUALLY did (logged
// session, read-only), TODAY/FUTURE shows the live engine PROPOSAL. The date is
// derived from dayIdx via the SAME mapping the engine uses (dateForWeekdayIndex,
// current week), then compared at LOCAL midnight (localKey — never UTC, matching
// CalendarHeatmap day-matching).
type DayPhase = 'past' | 'today' | 'future';

function classifyPhase(dayIdx: number): DayPhase {
  const previewKey = localKey(dateForWeekdayIndex(dayIdx).getTime());
  const todayKey = localKey(Date.now());
  if (previewKey < todayKey) return 'past';
  if (previewKey > todayKey) return 'future';
  return 'today';
}

// Find the logged session for the previewed local date. Matches each session's
// finish timestamp (ts, ms) → its LOCAL calendar date (localKey) against the
// previewed date. Returns the first match (multi-session same-day is rare here;
// the first finished session is shown). null = the user did not train that day.
function findLoggedSession(dayIdx: number): LastSessionSummary | null {
  const previewKey = localKey(dateForWeekdayIndex(dayIdx).getTime());
  const history = useWorkoutStore.getState().sessionsHistory;
  return history.find((s) => localKey(s.ts) === previewKey) ?? null;
}

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
  const [loggedSession, setLoggedSession] = useState<LastSessionSummary | null>(null);

  // PAST = read history (what you did); TODAY/FUTURE = live engine proposal.
  // Classified per open/day-change (cheap; the sheet is short-lived).
  const phase: DayPhase | null = dayIdx === null ? null : classifyPhase(dayIdx);
  const isPast = phase === 'past';

  // Resolve the previewed day's content each open + whenever the tapped day
  // changes. Branching by phase:
  //   - REST           → coach proposes nothing (no engine, no history lookup).
  //   - PAST training  → look up the logged session (read-only); NO engine — a
  //                      past day shows what actually happened, not a proposal.
  //   - TODAY/FUTURE   → live engine proposal (unchanged behavior).
  useEffect(() => {
    if (!open || dayIdx === null) return;
    if (dayKind === 'rest') {
      setWorkout(null);
      setLoggedSession(null);
      setLoading(false);
      return;
    }
    if (classifyPhase(dayIdx) === 'past') {
      // Past day: render the user's actual logged session (or the honest missed
      // empty state). The live proposal engine is deliberately NOT invoked.
      setWorkout(null);
      setLoggedSession(findLoggedSession(dayIdx));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setWorkout(null);
    setLoggedSession(null);
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
  // Proposed (TODAY/FUTURE training only) — never for a past day.
  const hasSession = !isRest && !isPast && workout !== null && exercises.length > 0;
  // Logged (PAST training only) — the real session the user performed.
  const loggedExercises = loggedSession?.exercises ?? [];
  const hasLogged = isPast && !isRest && loggedSession !== null && loggedExercises.length > 0;
  // Past training day with no logged session → honest "missed" empty state.
  const isMissed = isPast && !isRest && !hasLogged;

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

        {/* PAST logged session — "what you did" kicker + the real session title. */}
        {hasLogged && (
          <>
            <div className="mt-1">
              <Kicker color="var(--aqua)">{t('calendar.dayPreview.doneTitle')}</Kicker>
            </div>
            <h2
              className="font-display text-xl font-bold mt-1 tracking-tight text-ink leading-tight"
              data-testid="schedule-day-preview-done-title"
            >
              {loggedSession.title}
            </h2>
          </>
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
              {t('calendar.dayPreview.metaDurationRange', {
                lo: Math.max(0, workout.estimatedDuration - 10),
                hi: workout.estimatedDuration + 10,
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

        {/* LOADING state (today/future training day, engine pending). */}
        {!isRest && !isPast && loading && (
          <p
            className="text-sm text-ink3 italic leading-relaxed mt-2"
            data-testid="schedule-day-preview-loading"
            aria-live="polite"
          >
            {t('workout.preview.loading')}
          </p>
        )}

        {/* EMPTY state — TODAY/FUTURE training day but the engine can't propose a
            session (too far out / insufficient data). Honest copy, NO fabricated
            list. Past days use the MISSED state below, never a proposal. */}
        {!isRest && !isPast && !loading && !hasSession && (
          <p
            className="text-sm text-ink2 leading-relaxed mt-2"
            data-testid="schedule-day-preview-empty"
          >
            {t('calendar.dayPreview.emptyBody')}
          </p>
        )}

        {/* MISSED state — a PAST training day with no logged session. Honest:
            the user did not train that day. NO recomputed proposal. */}
        {isMissed && (
          <p
            className="text-sm text-ink2 leading-relaxed mt-2"
            data-testid="schedule-day-preview-missed"
          >
            {t('calendar.dayPreview.missed')}
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

        {/* PAST logged session — the REAL exercises with the ACTUAL sets
            performed (kg x reps per set). Read-only history; NO live-recompute
            note (this is what happened, not a proposal that re-derives). */}
        {hasLogged && (
          <>
            <div className="mt-3 mb-2">
              <Kicker>{t('calendar.dayPreview.performedHeading')}</Kicker>
            </div>
            <ul
              className="pulse-card divide-y divide-line overflow-hidden mb-4"
              data-testid="schedule-day-preview-logged-list"
            >
              {loggedExercises.map((ex, i) => (
                <li
                  key={ex.exerciseId}
                  className="flex items-start gap-3 p-3"
                  data-testid="schedule-day-preview-logged-exercise"
                >
                  <div className="relative flex-shrink-0">
                    <ExerciseMedia
                      engineName={ex.exerciseName}
                      variant="thumbnail"
                      testId={`schedule-day-preview-logged-media-${i}`}
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
                      {ex.exerciseName}
                    </div>
                    <div className="text-xs text-ink3 font-mono mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      {ex.sets.map((s, si) => (
                        <span key={si} data-testid="schedule-day-preview-logged-set">
                          {t('calendar.dayPreview.performedSet', {
                            kg: s.kg,
                            reps: s.reps,
                          })}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
