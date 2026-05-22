// ══ ANTRENOR HOME — Phase 3 Rewrite F2/F4/F6/F8/F10/F11 Parity ════════════
// Per mockup andura-clasic.html#L741-825 + task_04 spec orchestrator §2 A.
//
// Phase 6 task_06 Option B Bugatti enrich — consume coachDirectorAggregate
// async (single source aggregate: readiness + fatigue + plannedWorkout +
// patternsBanner + prWallRecent + alerts + source). 3 NEW UI components
// wired: PatternsBanner + AlertsBanner + PRWallRecent.
//
// Single screen vertical stack:
//   1. ResumeSessionCard (conditional pausedSnapshot)
//   2. ReactivateCard (conditional lastSession > 14 zile + NOT dismissed)
//   3. PatternsBanner (Phase 6 task_06 — STAGNATION + LOW_ADHERENCE)
//   4. AlertsBanner (Phase 6 task_06 — proactiveEngine wrap)
//   5. CoachTodayCard SAU CoachRestCard (swap by coachStore.schedContext)
//   6. Calendar7Day
//   7. StatsGrid 3-cell (streak + fatigue + readiness)
//   8. ReadinessVerdict (F4 inline)
//   9. PRNotificationBanner (F11 conditional prHit)
//  10. PRWallRecent (Phase 6 task_06 — top 3 din getPRHistoryAll)
//  11. "Incepe antrenament" CTA → /app/antrenor/energy-check
//
// Persona-aware CSS class wrapper per coachStore.persona.
//
// Cross-refs:
//   - DECISIONS.md §D015 §D016 React migration + §D018 routing + §D027
//   - mockup andura-clasic.html lines 735-825

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore, getCurrentMode } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../lib/coachDirectorAggregate';
import { gotoPath } from '../../../lib/navigation';
import { ResumeSessionCard } from '../../../components/Antrenor/ResumeSessionCard';
import { ReactivateCard } from '../../../components/Antrenor/ReactivateCard';
import { CoachTodayCard } from '../../../components/Antrenor/CoachTodayCard';
import { CoachRestCard } from '../../../components/Antrenor/CoachRestCard';
import { StatsGrid } from '../../../components/Antrenor/StatsGrid';
import { ReadinessVerdict } from '../../../components/Antrenor/ReadinessVerdict';
import { PRNotificationBanner } from '../../../components/Antrenor/PRNotificationBanner';
import { PatternsBanner } from '../../../components/Antrenor/PatternsBanner';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';
import { PRWallRecent } from '../../../components/Antrenor/PRWallRecent';
import { ObiectivSelector } from '../../../components/Antrenor/ObiectivSelector';
import { Calendar7Day } from '../../../components/Calendar7Day';

const FOURTEEN_DAYS_MS = 14 * 86400000;

export function Antrenor(): JSX.Element {
  const navigate = useNavigate();
  // §44-C1 — derive tagged WorkoutModeView inline (subscribe primitives, compute
  // in render). pausedSnap gates ResumeSessionCard + showReactivate + CTA hide.
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const streak = useWorkoutStore((s) => s.streak);
  const prHit = useWorkoutStore((s) => s.prHit);
  const resumeSession = useWorkoutStore((s) => s.resumeSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);
  const mode = getCurrentMode({ phase, sessionStart, pausedSnapshot, lastSession, exIdx });
  const pausedSnap = mode.kind === 'paused' ? mode.snapshot : null;
  const schedContext = useCoachStore((s) => s.schedContext);
  // §1-H3 audit fix: persona wrapper ALSO hoisted to Layout.tsx so all 4 tabs
  // inherit persona scaling. Antrenor section keeps local class for explicit
  // testid contract + redundant inheritance harmless (same class chain).
  const persona = useCoachStore((s) => s.persona);
  const reactivateDismissed = useCoachStore((s) => s.reactivateDismissed);
  const dismissReactivate = useCoachStore((s) => s.dismissReactivate);

  // Phase 6 task_06: single source coach aggregate consume async pipeline.
  // Per DECISIONS.md §D027 Option C cascade + Option B composer pure-function
  // engines (NU CoachDirector.buildSession side-effects pollution).
  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  useEffect(() => {
    let cancelled = false;
    getCoachToday().then((c) => {
      if (!cancelled) setCoach(c);
    });
    return () => { cancelled = true; };
  }, []);

  const readiness = coach?.readiness ?? null;
  const fatigue = coach?.fatigue ?? null;

  const showReactivate =
    lastSession !== null &&
    Date.now() - lastSession.ts > FOURTEEN_DAYS_MS &&
    !reactivateDismissed &&
    pausedSnap === null;

  // §B018 audit fix (CODE-REVIEW L-8) — extract ternary readability:
  // engine signal preferred when aggregate loaded, fallback user override (§A002).
  const showWorkoutCard = coach !== null ? !coach.isRestDay : schedContext === 'workout';

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

      {pausedSnap && (
        <ResumeSessionCard
          snapshot={pausedSnap}
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

      <PatternsBanner banners={coach?.patternsBanner ?? []} />
      <AlertsBanner alerts={coach?.alerts ?? []} />

      {/* §A002 audit fix + §B018 extract: engine-driven isRestDay routing —
          prefer coach.isRestDay (engine signal) when aggregate loaded, fallback
          coachStore.schedContext (user override mechanism). */}
      {showWorkoutCard ? (
        <CoachTodayCard onStart={handleStart} workout={coach?.plannedWorkout ?? null} />
      ) : (
        <CoachRestCard
          onLightSession={handleStart}
          onOverride={handleStart}
          restReason={coach?.restReason ?? null}
        />
      )}

      <Calendar7Day />

      {/* F-antrenor-03 parity per MOCKUP-PARITY-chat3 §2.2 + §4 P4.
          Mockup L862-870 "Programe (6 obiective V1 LOCK)" — sits right after
          Calendar7Day, before stats. Daniel "6 obiective V1 LOCK" decizie:
          user can pick goal din Antrenor home, NU doar din SettingsProfile. */}
      <ObiectivSelector />

      <StatsGrid streak={streak} fatigue={fatigue} readiness={readiness} />
      <ReadinessVerdict readiness={readiness} />
      <PRNotificationBanner prHit={prHit} />
      <PRWallRecent records={coach?.prWallRecent ?? []} />

      {!pausedSnap && (
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
