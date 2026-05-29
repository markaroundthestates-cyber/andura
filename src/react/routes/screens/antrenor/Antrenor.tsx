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
//   5. StatsGrid 3-cell (streak + fatigue + readiness) — BUG #4 top per mockup
//   6. ReadinessVerdict (F4 inline) — BUG #4 top per mockup
//   7. PRNotificationBanner (F11 conditional prHit) — BUG #4 top per mockup
//   8. CoachTodayCard SAU CoachRestCard (swap by coachStore.schedContext)
//   9. Calendar7Day
//  10. PRWallRecent (Phase 6 task_06 — top 3 din getPRHistoryAll)
//  (Item "Incepe antrenament" CTA removed 2026-05-28 — duplicate of
//   CoachTodayCard "Incepe sesiunea" / CoachRestCard buttons, no extra signal.)
//  (ObiectivSelector relocated 2026-05-28 to Progres > ObiectivGoalCard per
//   Daniel verbatim "muta aia cu Obiectiv de la Coach la progres".)
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
import { t } from '../../../../i18n/index.js';
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
import { Calendar7Day } from '../../../components/Calendar7Day';
import { ReadinessOrb } from '../../../components/pulse/ReadinessOrb';
import { PulseMark } from '../../../components/pulse/PulseMark';
import { Kicker } from '../../../components/pulse/Kicker';
import { Pill } from '../../../components/pulse/Pill';
import { Zap } from 'lucide-react';

const FOURTEEN_DAYS_MS = 14 * 86400000;

// Header date line per mockup andura-clasic.html#L733 ("Joi, 7 mai · 18:30").
// Locale-aware: weekday/month strings read from i18n bundle (RO no-diacritics
// per D-LEGACY-064 in the RO branch; EN uses standard full+short month names).
// Manual lookup, NU Intl.DateTimeFormat — ICU emits diacritics under RO locale
// (Marti/Sambata), so we keep our own map.

function formatHeaderDate(now: Date): string {
  const weekday = t(`weekdays.full.${now.getDay()}`);
  const day = now.getDate();
  const month = t(`months.short.${now.getMonth()}`);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const sep = t('antrenor.header.dateSeparator');
  return `${weekday}, ${day} ${month} ${sep} ${hh}:${mm}`;
}

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
  //
  // HIGH-CODE-07 (code-review v2 chat 5 post-Wave 10): defense-in-depth
  // .catch on getCoachToday promise. Engine wrappers already safe-catch
  // internally + return null fallbacks, dar promise rejection past wrapper
  // would leave UI silently stuck (console error + stale baseline render).
  // Pattern mirror WorkoutPreview Wave 11 fallback guard (f81e2716):
  // visible error banner role=alert + fallback engine-null baseline still
  // renders (CoachRestCard cu restReason=null, baseline stats) so Gigel
  // can still tap Incepe antrenament.
  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  const [coachError, setCoachError] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    getCoachToday()
      .then((c) => {
        if (!cancelled) setCoach(c);
      })
      .catch(() => {
        if (!cancelled) setCoachError(true);
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
      className={`pt-4 px-5 pb-6 bg-paper persona-${persona}`}
      data-testid="antrenor-home"
      aria-label={t('antrenor.ariaLabel')}
    >
      {/* Pulse header (mockup interfata-noua/screens-antrenor.jsx:11-20) — mono
          date eyebrow, display title with the animated PulseMark to the right,
          serif coach subtitle. Date keeps its testid + i18n formatter. */}
      <div className="mb-4 animate-card-rise">
        <p
          className="font-mono text-[11px] tracking-wider text-ink3"
          data-testid="antrenor-header-date"
        >
          {formatHeaderDate(new Date())}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <h1 className="font-display text-3xl font-bold text-ink">
            {t('tabs.antrenor.title')}
          </h1>
          <PulseMark size={34} />
        </div>
        <p className="font-serif italic text-ink2 text-sm mt-0.5">
          {t('antrenor.subtitle')}
        </p>
      </div>

      {/* HIGH-CODE-07 defense-in-depth error banner (code-review v2 chat 5
          post-Wave 10) — visible only when getCoachToday promise rejects past
          wrapper safe-catch. Fallback baseline content still renders below
          (CoachRestCard or CoachTodayCard cu coach=null defaults) so Gigel
          can still proceed to start sesiunea. Pattern mirror WorkoutPreview
          Wave 11 (f81e2716). */}
      {coachError && (
        <div
          className="p-3 rounded-xl border mb-4"
          data-testid="antrenor-error-banner"
          role="alert"
          aria-live="assertive"
          style={{
            background: 'var(--status-danger-bg)',
            borderColor: 'var(--status-danger-border)',
          }}
        >
          <p className="text-base text-ink">
            {t('antrenor.errorBanner')}
          </p>
        </div>
      )}

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

      {/* Pulse readiness HERO (mockup interfata-noua/screens-antrenor.jsx:22-33)
          — readiness is promoted from a flat StatsGrid cell to a big animated
          ReadinessOrb. The orb is the living hero and is ALWAYS present (Daniel
          CEO LOCKED 2026-05-29). When readiness is known: orb carries the real
          score + the ReadinessVerdict line (role=status + score/100 + canPR
          contract) + a "primed for a PR" pill. When readiness is unknown (T0
          fresh / no log → engine refuses a verdict, honesty invariant): the orb
          breathes in placeholder mode (em-dash, ring 0, dimmed) with a microcopy
          line inviting the first log — NEVER a fabricated number, no PR pill. */}
      <div
        className="pulse-card pulse-card-glow overflow-hidden p-4 mb-4 flex items-center gap-4 animate-card-rise delay-75"
        data-testid="readiness-hero"
        style={{ ['--wash' as string]: 'var(--aqua)' }}
      >
        <ReadinessOrb
          score={readiness ? readiness.score : null}
          label={t('stats.readiness')}
          canPR={readiness?.canPR ?? false}
        />
        <div className="flex-1 min-w-0">
          <Kicker color="var(--aqua)">{t('readinessVerdictWidget.ariaLabel')}</Kicker>
          {readiness ? (
            <>
              <div className="mt-1.5">
                <ReadinessVerdict readiness={readiness} />
              </div>
              {readiness.canPR && (
                <Pill color="var(--volt)" solid>
                  <Zap className="w-3 h-3" aria-hidden="true" fill="currentColor" />
                  {t('antrenor.primedForPr')}
                </Pill>
              )}
            </>
          ) : (
            <p
              className="font-serif italic text-ink2 text-sm mt-1.5"
              data-testid="readiness-empty-microcopy"
            >
              {t('antrenor.readinessEmpty')}
            </p>
          )}
        </div>
      </div>

      {/* Compact signal strip — streak + fatigue (readiness now lives in the
          orb hero above, so the strip drops that tile via `compact`). Mockup
          keeps the body signals visible without duplicating readiness. */}
      <StatsGrid streak={streak} fatigue={fatigue} readiness={readiness} compact />
      <PRNotificationBanner prHit={prHit} />

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

      {/* §obiectiv-relocate 2026-05-28 Daniel verbatim "muta aia cu Obiectiv de
          la Coach la progres". ObiectivSelector decommissioned din Antrenor —
          goal pick now lives la Progres > ObiectivGoalCard (top of tab, near
          target weight). Antrenor ramane focused pe "today's session" context. */}

      <PRWallRecent records={coach?.prWallRecent ?? []} />

      {/* Daniel smoke 2026-05-28 verbatim "ala de incepe antrenament trebuie sa
          dispara ca nu ii vad sensul" — bottom CTA was a redundant duplicate of
          CoachTodayCard's "Incepe sesiunea" button (workout day) / CoachRestCard's
          "Sesiune usoara" + "Vreau totusi antrenament" pair (rest day). Each
          surface already owns its own start affordance in the right context;
          this orphan button below PRWallRecent was visual noise. Removed. */}
    </section>
  );
}
