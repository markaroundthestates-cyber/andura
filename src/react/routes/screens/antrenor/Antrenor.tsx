// ══ ANTRENOR HOME — Phase 3 Rewrite F2/F4/F6/F8/F10/F11 Parity ════════════
// Per mockup andura-clasic.html#L741-825 + task_04 spec orchestrator §2 A.
//
// Single screen vertical stack:
//   1. ResumeSessionCard (conditional pausedSnapshot)
//   2. ReactivateCard (conditional lastSession > 14 zile + NOT dismissed)
//   3. CoachTodayCard SAU CoachRestCard (swap by coachStore.schedContext)
//   4. StatsGrid 3-cell (streak + fatigue + readiness)
//   5. ReadinessVerdict (F4 inline)
//   6. PRNotificationBanner (F11 conditional prHit)
//   7. "Incepe antrenament" CTA → /app/antrenor/energy-check
//
// Persona-aware CSS class wrapper per coachStore.persona.
//
// Cross-refs:
//   - DECISIONS.md §D015 §D016 React migration + §D018 routing
//   - mockup andura-clasic.html lines 735-825

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { getReadiness, getFatigue } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';
import { ResumeSessionCard } from '../../../components/Antrenor/ResumeSessionCard';
import { ReactivateCard } from '../../../components/Antrenor/ReactivateCard';
import { CoachTodayCard } from '../../../components/Antrenor/CoachTodayCard';
import { CoachRestCard } from '../../../components/Antrenor/CoachRestCard';
import { StatsGrid } from '../../../components/Antrenor/StatsGrid';
import { ReadinessVerdict } from '../../../components/Antrenor/ReadinessVerdict';
import { PRNotificationBanner } from '../../../components/Antrenor/PRNotificationBanner';
import { Calendar7Day } from '../../../components/Calendar7Day';

const FOURTEEN_DAYS_MS = 14 * 86400000;

export function Antrenor(): JSX.Element {
  const navigate = useNavigate();
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const streak = useWorkoutStore((s) => s.streak);
  const prHit = useWorkoutStore((s) => s.prHit);
  const resumeSession = useWorkoutStore((s) => s.resumeSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);
  const schedContext = useCoachStore((s) => s.schedContext);
  const persona = useCoachStore((s) => s.persona);
  const reactivateDismissed = useCoachStore((s) => s.reactivateDismissed);
  const dismissReactivate = useCoachStore((s) => s.dismissReactivate);

  const readiness = getReadiness();
  const fatigue = getFatigue();

  const showReactivate =
    lastSession !== null &&
    Date.now() - lastSession.ts > FOURTEEN_DAYS_MS &&
    !reactivateDismissed &&
    pausedSnapshot === null;

  const handleStart = (): void => {
    navigate(gotoPath('energy-check'));
  };

  const handleReactivateStart = (): void => {
    navigate(gotoPath('energy-check'));
  };

  return (
    <section
      className={`p-4 bg-paper persona-${persona}`}
      data-testid="antrenor-home"
      aria-label="Antrenor home"
    >
      <h1 className="text-2xl font-semibold text-ink mb-4">Antrenor</h1>

      {pausedSnapshot && (
        <ResumeSessionCard
          snapshot={pausedSnapshot}
          onResume={resumeSession}
          onDiscard={discardSession}
        />
      )}

      {showReactivate && lastSession && (
        <ReactivateCard
          lastSession={lastSession}
          onStart={handleReactivateStart}
          onDismiss={dismissReactivate}
        />
      )}

      {schedContext === 'workout' ? (
        <CoachTodayCard onStart={handleStart} />
      ) : (
        <CoachRestCard onLightSession={handleStart} onOverride={handleStart} />
      )}

      <Calendar7Day />

      <StatsGrid streak={streak} fatigue={fatigue} readiness={readiness} />
      <ReadinessVerdict readiness={readiness} />
      <PRNotificationBanner prHit={prHit} />

      {!pausedSnapshot && (
        <button
          type="button"
          onClick={handleStart}
          className="w-full bg-brick text-paper rounded-md py-3 font-semibold mt-2"
        >
          Incepe antrenament
        </button>
      )}
    </section>
  );
}
