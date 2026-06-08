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
import { useScheduleStore } from '../../../stores/scheduleStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { AerobicCoach } from '../../../components/Antrenor/AerobicCoach';
import { BothModeAerobicCard } from '../../../components/Antrenor/BothModeAerobicCard';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../lib/coachDirectorAggregate';
import { gotoPath } from '../../../lib/navigation';
import { t } from '../../../../i18n/index.js';
import { ResumeSessionCard } from '../../../components/Antrenor/ResumeSessionCard';
import { ReactivateCard } from '../../../components/Antrenor/ReactivateCard';
import { CoachTodayCard } from '../../../components/Antrenor/CoachTodayCard';
import { CoachRestCard } from '../../../components/Antrenor/CoachRestCard';
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
import { getTodayReadiness } from '../../../../engine/readiness.js';
import { Zap, ArrowRight } from 'lucide-react';

const FOURTEEN_DAYS_MS = 14 * 86400000;

// Header date line per mockup andura-clasic.html#L733 ("Joi, 7 mai · 18:30").
// Locale-aware: weekday/month strings read from i18n bundle (RO no-diacritics
// per D-LEGACY-064 in the RO branch; EN uses standard full+short month names).
// Manual lookup, NU Intl.DateTimeFormat — ICU emits diacritics under RO locale
// (Marti/Sambata), so we keep our own map.

function formatHeaderDate(now: Date): string {
  // Defensive guard (call site always passes new Date() — live clock, never
  // persisted ts — dar pastram simetria cu formatDate-urile din Istoric).
  if (Number.isNaN(now.getTime())) return '—';
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
  // Mode-gating (Daniel spec 2026-05-30) — trainingType drives the whole tab.
  // Read it here but gate at the JSX return (NOT an early return) so the gym
  // hooks below still run unconditionally (Rules of Hooks). 'aerobic' → the
  // class-only AerobicCoach dashboard; 'gym'/'both' → the gym layout, with
  // 'both' also showing an aerobic-class log card. Default 'gym' (legacy).
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  // §44-C1 — derive tagged WorkoutModeView inline (subscribe primitives, compute
  // in render). pausedSnap gates ResumeSessionCard + showReactivate + CTA hide.
  const phase = useWorkoutStore((s) => s.phase);
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  // FIX 2 (Daniel audit 2026-06-05) — "has trained before" derives from durable
  // session history, not the transient lastSession (null after deletes / certain
  // flows). Used to swap the readiness-empty microcopy: a returning user must
  // NOT see the "log your FIRST session" copy when readiness is merely unknown
  // today (no energy-check yet).
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const hasTrainedBefore = sessionsHistory.length > 0;
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
  // Smoke #6 schedule-reactivity — coach aggregate (isRestDay / plannedWorkout)
  // derives from the weekly schedule (scheduleAdapter.getCalendarOverride). The
  // week editor lives on THIS screen (Calendar7Day → toggleDay → saveWeekly),
  // so when the user removes today's training day the aggregate is stale until a
  // remount (tab switch). Subscribe to the reactive schedule signals — days +
  // editMode — and re-run getCoachToday on change so removing today's workout
  // immediately swaps CoachTodayCard → CoachRestCard (no tab switch). saveWeekly
  // commits localStorage then flips editMode:false; depending on editMode means
  // the re-fetch fires after the commit, reading the fresh override.
  const scheduleDays = useScheduleStore((s) => s.days);
  const scheduleEditMode = useScheduleStore((s) => s.editMode);

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
    // scheduleDays/scheduleEditMode deps: re-derive the coach aggregate when the
    // weekly schedule changes (Smoke #6 — remove today's workout reflects live).
  }, [scheduleDays, scheduleEditMode]);

  const readiness = coach?.readiness ?? null;

  // PRE-WORKOUT STEP reframe (Daniel Option A 2026-06-07) — the energy-check is
  // now a deliberate "step 1: assess" that PRECEDES the start, not something the
  // Start button drops you into. "Done today" = today has a self-report in the
  // engine readiness store (saveReadiness keys by tod() local-date). When NOT
  // done, the hero leads with the energy-check CTA; when done, Start proceeds
  // straight to the plan/preview (readiness already known — no re-route). Read
  // in render: leaving for energy-check and coming back remounts this screen, so
  // the flag is fresh; coach (the async aggregate) is also a recompute signal.
  const energyCheckDoneToday = getTodayReadiness() != null;

  const showReactivate =
    lastSession !== null &&
    Date.now() - lastSession.ts > FOURTEEN_DAYS_MS &&
    !reactivateDismissed &&
    pausedSnap === null;

  // §B018 audit fix (CODE-REVIEW L-8) — extract ternary readability:
  // engine signal preferred when aggregate loaded, fallback user override (§A002).
  const showWorkoutCard = coach !== null ? !coach.isRestDay : schedContext === 'workout';

  // Step 2: START (#69 pre-workout reframe — Daniel UX LOCK 2026-06-08). When
  // today's energy-check is DONE, Start opens the dedicated "how much time today"
  // step (TimeBudget) → workout-preview. When it's NOT done yet, Start routes to
  // the energy-check first (the assess step); EnergyCheck now returns to THIS hub
  // (not straight to preview), so the user then taps Start again → time → preview.
  // No double-prompt: the energy-check is never re-shown once done. Reused by the
  // reactivate / light-session / override CTAs so every "start" affordance honors
  // the same rule.
  const handleStart = (): void => {
    navigate(gotoPath(energyCheckDoneToday ? 'time-budget' : 'energy-check'));
  };

  const handleReactivateStart = (): void => {
    navigate(gotoPath(energyCheckDoneToday ? 'time-budget' : 'energy-check'));
  };

  // Re-run the check on demand — tapping the readiness hero (orb/verdict)
  // re-opens energy-check even when it's already done today, so the user is
  // never locked into a stale self-report. Distinct from handleStart (which
  // skips the check once done).
  const handleEnergyCheck = (): void => {
    navigate(gotoPath('energy-check'));
  };

  // Aerobic mode — class-only dashboard (all gym hooks above still ran).
  if (trainingType === 'aerobic') {
    return <AerobicCoach />;
  }

  return (
    <section
      className={`pt-4 px-5 pb-6 persona-${persona}`}
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
        {/* Orb is tappable — re-opens the energy-check on demand (even when
            already done today) so the user is never locked into a stale
            self-report. Re-run intent, distinct from Start (handleStart). */}
        <button
          type="button"
          onClick={handleEnergyCheck}
          data-testid="readiness-orb-rerun"
          aria-label={t('antrenor.energyCheckRerunAria')}
          className="flex-shrink-0 rounded-full"
        >
          <ReadinessOrb
            score={readiness ? readiness.score : null}
            label={t('stats.readiness')}
            canPR={readiness?.canPR ?? false}
          />
        </button>
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
              {t(hasTrainedBefore ? 'antrenor.readinessEmptyReturning' : 'antrenor.readinessEmpty')}
            </p>
          )}
          {/* Step 1: ASSESS. Until today's energy-check is recorded, the hero
              leads with a clear primary action to run it — presented as the
              deliberate pre-workout step, separate from starting the session.
              Once done today, this disappears (readiness is known) and Start
              proceeds straight to the plan. */}
          {!energyCheckDoneToday && (
            <button
              type="button"
              onClick={handleEnergyCheck}
              data-testid="readiness-energy-check-cta"
              className="btn-primary-lift press-feedback pulse-grad-bg pulse-shine mt-3 w-full rounded-full py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ color: 'var(--on-accent)' }}
            >
              <span>{t('antrenor.energyCheckCta')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Streak + fatigue signal strip removed 2026-05-31 (Daniel verbatim
          "scoate ala de streak de acolo si de fatigue"). Readiness stays in the
          orb hero above; body signals no longer surfaced on the Coach home. */}
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

      {/* 'both' mode (Daniel spec 2026-05-30) — gym PLUS the ability to log an
          aerobic class. The card opens the same logger as the aerobic-only
          dashboard; gym workouts above stay fully intact. */}
      {trainingType === 'both' && <BothModeAerobicCard />}

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
