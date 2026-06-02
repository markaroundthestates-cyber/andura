// ══ SESSION PILL — Global Mini-Player Cross-Tab Persistence ══════════════
// Phase 4 task_13 §A — sticky pill rendered above BottomNav cand workoutStore
// .phase ≠ 'idle' AND current route ≠ workout (anti-duplicate). Tap → resume
// la /app/antrenor/workout. Read-only consumer (NU mutate store), self-managed
// 1Hz elapsed interval.
//
// Mockup ref: andura-clasic.html#L105-127 .session-pill brick background sticky
// bottom + L2522 #session-mini-player markup. Phase 4 simplified copy:
// "{exerciseName} · {elapsed} min" (active) sau "Reia sesiunea curenta" verbatim
// aria-label mockup (paused snapshot).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics
//   - mockup andura-clasic.html FIX 6 mini-player 2026-05-11

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { useWorkoutStore, getCurrentMode } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { getTodayWorkout } from '../lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../lib/engineWrappers';
import { gotoPath } from '../lib/navigation';
import { t } from '../../i18n/index.js';

const WORKOUT_PATH = gotoPath('workout');
// The pill is a "resume your session" affordance for the TABS — it must not show
// on the workout-completion flow screens (PostRpe "How was your session" /
// PostSummary), which carry their own sticky Continue/Save CTA. The session is
// still non-idle during rating, so without this guard the pill rendered fixed at
// the bottom and OVERLAPPED the Continue button (Daniel 2026-06-02 screenshot).
const POST_RPE_PATH = gotoPath('post-rpe');
const POST_SUMMARY_PATH = gotoPath('post-summary');

export function SessionPill(): JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  // §44-C1 — derive tagged WorkoutModeView inline via getCurrentMode pure
  // selector. Subscribe to primitive fields (stable refs) — calling
  // getCurrentMode at Zustand selector level returns new object identity each
  // render and triggers infinite re-render loop. Pattern: subscribe to inputs,
  // compute tagged view in render body.
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  // Aerobic mode-gate (Daniel spec 2026-05-30) — a PURE aerobic user must never
  // see a gym "resume workout" pill (it taps straight into the gym workout
  // flow). Read before any conditional return (Rules of Hooks). 'gym' + 'both'
  // keep the pill — gate is strictly === 'aerobic'.
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  const mode = getCurrentMode({
    phase,
    sessionStart,
    pausedSnapshot,
    lastSession,
    exIdx,
  });

  const [elapsedMin, setElapsedMin] = useState(0);

  // Phase 6 task_02 Option C: async getTodayWorkout — useState fallback null
  // during loading; pill displays "Sesiune" label while pending. Pill still
  // renders (active session). On resolve, planned updates → re-render with
  // real exercise name. Per DECISIONS.md §D027.
  const [planned, setPlanned] = useState<PlannedWorkoutOutput | null>(null);

  // Live elapsed update 1Hz cand mode=active|resting (live session).
  const liveSessionStart =
    mode.kind === 'active' || mode.kind === 'resting' ? mode.sessionStart : null;
  useEffect(() => {
    if (liveSessionStart === null) {
      setElapsedMin(0);
      return;
    }
    const update = (): void => {
      setElapsedMin(Math.floor((Date.now() - liveSessionStart) / 60000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [liveSessionStart]);

  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((p) => {
      if (!cancelled) setPlanned(p);
    });
    return () => { cancelled = true; };
  }, []);

  // Aerobic mode-gate — never surface the gym resume pill for a pure aerobic user.
  if (trainingType === 'aerobic') return null;

  // Anti-duplicate + completion-flow route guard (no pill on workout, post-rpe,
  // post-summary — the latter two own a sticky CTA the pill would overlap).
  if (
    location.pathname === WORKOUT_PATH ||
    location.pathname === POST_RPE_PATH ||
    location.pathname === POST_SUMMARY_PATH
  ) {
    return null;
  }

  // §44-C1 exhaustive switch on tagged mode — render only for active/resting
  // (live session pill) sau paused (resume hatch). idle + finished → null.
  let active = false;
  let paused = false;
  switch (mode.kind) {
    case 'active':
    case 'resting':
      active = true;
      break;
    case 'paused':
      paused = true;
      break;
    case 'idle':
    case 'finished':
      break;
    default: {
      const _exhaustive: never = mode;
      void _exhaustive;
    }
  }

  if (!active && !paused) return null;

  // Phase 4 demo: derive workout title + exercise name din planned aggregate.
  // Fallback "Sesiune" cand engine returns null or still loading.
  const currentExerciseName =
    planned?.exercises[Math.min(exIdx, (planned?.exercises.length ?? 1) - 1)]?.name ?? t('sessionPill.sessionFallback');

  const label = paused
    ? t('sessionPill.ariaLabel')
    : t('sessionPill.liveLabel', { exercise: currentExerciseName, min: elapsedMin });

  function handleTap(): void {
    navigate(WORKOUT_PATH);
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      data-testid="session-pill"
      data-state={active ? 'active' : 'paused'}
      aria-label={t('sessionPill.ariaLabel')}
      className="session-pill app-fixed-column app-fixed-column--inset fixed bottom-[80px] z-[55] flex items-center gap-2.5 px-4 py-2.5 bg-brick text-paper rounded-full text-sm font-semibold shadow-lg"
    >
      <Play className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" aria-hidden="true" />
    </button>
  );
}
