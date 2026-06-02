// ══ COACH TODAY CARD — Workout Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L741 coach-today-card.
// Rendered cand coachStore.schedContext === 'workout'.
//
// §A001 audit fix (MP-pass2-coachtoday-01..03): wire workoutTitle + duration
// + exerciseCount din PlannedWorkoutOutput. Fallback mockup stub cand
// workout=null (loading state pre-aggregate or T0 baseline).
//
// HIGH-CODE-03 chat5 (2026-05-23) — italic quote line wired engine-driven via
// getCoachTodayQuote() composer. Replaces prior hardcoded "Pectoralii
// recupereaza din marti · spatele e gata." (Bugatti truth violation: claim
// shown to ALL users regardless of training). Now: real recovered group +
// days-since label. Safe generic fallback via coachPick('preview') cand engine
// emits null (T0 fresh / no qualifying group). Supersedes §B012 mockup-parity
// preserve note (Bugatti truth > mockup verbatim — Gigel filter wins).
//
// §F-pass2-coachtoday-04 + §F-pass2-coachtoday-06 (HIGH-EPSILON 2026-05-22) —
// Lagging weakness signal extension (mockup L747 coach-today-lagging hidden
// block) + "Vrei altceva azi?" override link (mockup L754
// openScheduleOverride). Lagging via getLaggingSignal() weaknessDetector
// wrapper memoized. Override link navigates internally - Antrenor.tsx
// untouched (HIGH-GAMMA territory same wave 2c). Namespace import + optional-
// chained call tolerates partial mocks in sibling tests.
//
// §F-pass2-coachtoday-07 (LOW chat5 Wave 10) — radial brick gradient
// decoration top-right corner mockup L742 verbatim. 140x140 cerc absolute
// pozitionat -30/-30 cu radial-gradient brick 35% opacity → transparent
// 70%. Subtle warmth highlight pe ink card (decorative-only, NU semantic).
// Content z-relative pentru a sta deasupra gradient (overflow-hidden taie
// la border-radius).

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Layers, Dumbbell, ArrowRight, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { todTs } from '../../../db.js';
import type { PlannedWorkoutOutput } from '../../lib/engineWrappers';
import * as engineWrappers from '../../lib/engineWrappers';
import { coachPick } from '../../lib/coachVoice';
import { composeCoachInsight } from '../../lib/coachInsight';
import { Sparkles } from 'lucide-react';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../lib/scheduleAdapterAggregate';
import { gotoPath } from '../../lib/navigation';
import { useWorkoutStore } from '../../stores/workoutStore';
import { Ripple } from '../Ripple';
import { Kicker } from '../pulse/Kicker';
import { haptic } from '../../lib/motion';
import { t } from '../../../i18n/index.js';

// ANDURA PULSE reskin (2026-05-29) — the prior warm-gold inline color tokens
// (lora/meta/lagging/override) are retired in favor of the Pulse palette
// (volt/aqua/ember + ink tokens) applied inline below. The card itself is a
// gradient surface defined by the scoped `.coach-today-card` rule in
// src/styles/global.css.

interface Props {
  onStart: () => void;
  workout?: PlannedWorkoutOutput | null;
}

// HIGH-CODE-03 — day-label formatter. 1=yesterday, 2-6=N days, 7+=last week.
// Locale-aware via i18n bundle. Pure function (testable inline).
function formatDaysSince(days: number): string {
  if (days <= 1) return t('coachToday.daysSince.yesterday');
  if (days <= 6) return t('coachToday.daysSince.daysFmt', { n: days });
  return t('coachToday.daysSince.lastWeek');
}

export function CoachTodayCard({ onStart, workout }: Props): JSX.Element {
  const navigate = useNavigate();
  // MED-CODE-21 chat5 — generic non-claim fallback. Prior 'Pull (spate &
  // biceps)' was Bugatti truth violation (hardcoded muscle-group claim shown
  // to ALL users regardless of actual plan) + D-LEGACY-064 violation (& vs
  // 'si'). Same pattern ca HIGH-CODE-03 quote engine-wire (Wave 9 74650a5f) —
  // here render-only fallback so generic copy suffices.
  //
  // i18n bridge — the engine adapter (scheduleAdapterAggregate) seeds
  // workoutTitle with the non-localized sentinel ENGINE_WORKOUT_TITLE_FALLBACK
  // when the plan has no real title. Treat that sentinel as null on the React
  // side so the locale-aware fallback fires; otherwise it would surface raw.
  // (Legacy 'Antrenament azi'/engineFallbackTitle still detected for persisted
  // plans + back-compat.)
  const engineFallbackSentinel = t('coachToday.engineFallbackTitle');
  const rawWorkoutTitle = workout?.workoutTitle;
  const isEngineFallback =
    rawWorkoutTitle === ENGINE_WORKOUT_TITLE_FALLBACK ||
    rawWorkoutTitle === 'Antrenament azi' ||
    rawWorkoutTitle === engineFallbackSentinel;
  // No real engine title (sentinel) → derive the localized title from the engine
  // SESSION TYPE (PUSH/PULL/...) so a PULL day reads "Pull", not a hardcoded
  // "Push". Only when a real sessionType is present; otherwise keep the existing
  // generic coachToday fallback (T0 fresh / loading / no plan). chained ?.
  // tolerates partial engineWrappers mocks in sibling tests.
  const sessionType = workout?.sessionType;
  const title = rawWorkoutTitle && !isEngineFallback
    ? rawWorkoutTitle
    : sessionType
      ? engineWrappers.resolveSessionTitle?.(sessionType) ?? t('coachToday.fallbackTitle')
      : t('coachToday.fallbackTitle');
  const duration = workout?.estimatedDuration ?? 48;
  const exerciseCount = workout?.exerciseCount ?? 5;
  // Pulse meta chip (mockup interfata-noua/screens-antrenor.jsx:50) — the
  // mockup hard-coded "+15%"; the engine exposes a truthful 'plus'|'normal'|
  // 'minus' intensityMod instead (no fabricated percentage — Bugatti truth).
  // Default 'normal' when no plan is loaded (T0 fresh / loading).
  const intensityMod = workout?.intensityMod ?? 'normal';
  const intensityLabel = t(`coachToday.intensity.${intensityMod}`);
  // HIGH-CODE-03 chat5 — engine-driven quote replaces hardcoded muscle-group
  // claim. Composer returns null cand T0 fresh / no qualifying recovered
  // group → fallback safe generic non-claim line via coachPick('preview').
  // Memoized: engine call runs once per mount, NU per render. Optional-
  // chained call tolerates partial engineWrappers mocks (Antrenor.test).
  //
  // MED-CODE-20 chat5 (2026-05-23) — useMemo deps [sessionsHistory, todayDate]
  // pentru recompute cand user finishes workout mid-day (sessionsHistory
  // append) sau day rollover (date string slice change). Prior `[]` empty
  // deps locked engine result la mount — user trains la 09:00, returns post-
  // workout 14:00 → recovery state changed dar quote stays stale.
  // getCoachTodayQuote() reads useWorkoutStore.getState().sessionsHistory
  // imperative (NU subscription), so dep array must trigger recompute via
  // Zustand selector subscription pe sessionsHistory.
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const todayDate = new Date().toISOString().slice(0, 10);
  const coachQuote = useMemo<string>(() => {
    try {
      const dynamic = engineWrappers.getCoachTodayQuote?.() ?? null;
      if (dynamic !== null) {
        const dayLabel = formatDaysSince(dynamic.daysSince);
        return t('coachToday.recoveredQuote', { group: dynamic.recoveredLabel, when: dayLabel });
      }
    } catch {
      // fall through to generic fallback
    }
    // Safe non-claim generic — deterministic seed 0 mirrors WorkoutPreview
    // pattern; pool entries are non-claim general motivation (NO muscle
    // recovery claims).
    return coachPick('preview', undefined, 0);
    // MED-CODE-20 — sessionsHistory + todayDate sunt SIGNAL deps intentional
    // (NU direct references in body). getCoachTodayQuote() reads
    // useWorkoutStore.getState().sessionsHistory imperative inside engine
    // wrapper; deps array trigger recompute via Zustand subscription +
    // date rollover signal. eslint-disable warranted — exhaustive-deps
    // lint cannot see indirect engine getState() read pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsHistory, todayDate]);
  // §F-pass2-coachtoday-04 — memo lagging signal so weaknessDetector engine
  // call NU runs every render. Null cand T0 fresh / balanced training.
  // Namespace-imported with optional-chained access: tolerates partial mocks
  // in sibling tests that stub engineWrappers without exporting
  // getLaggingSignal (Antrenor.test pattern pre-HIGH-EPSILON dispatch).
  const laggingSignal = useMemo<string | null>(() => {
    try {
      return engineWrappers.getLaggingSignal?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  // Coach Voice — the daily "why" line. ONE plain-language sentence synthesizing
  // the adaptations the engine actually applied to TODAY's plan (recovery cut /
  // weakness amp / imbalance fix / deload), surfaced ABOVE the Start CTA as the
  // first thing the user reads. composeCoachInsight returns null when NOTHING
  // adapted → the line renders nothing (graceful, no filler). Memoized on the
  // engine adaptations log carried by the workout prop.
  const coachWhyLine = useMemo<string | null>(() => {
    try {
      return composeCoachInsight(workout?.coachAdaptations);
    } catch {
      return null;
    }
  }, [workout?.coachAdaptations]);

  // Calibration honesty — the "still learning you" line. The "no fabricated
  // certainty" Andura value made visible: while the model is still immature
  // (early calibration tier), say so plainly; once the model is dialed in
  // (PERSONALIZED+) the engine returns null and the line disappears for good.
  // Truth-only: when the engine exposes a real "sessions remaining" count we
  // show it; otherwise we phrase it WITHOUT a number (never a fabricated count).
  // Recomputes when the session history changes (a finished session matures the
  // model). engineWrappers reads sessionsHistory imperatively (getState).
  const calibrationLine = useMemo<string | null>(() => {
    try {
      const sig = engineWrappers.getCalibrationMaturity?.() ?? null;
      if (sig === null) return null;
      return sig.sessionsToNext != null
        ? t('coachCalibration.withCount', { n: sig.sessionsToNext })
        : t('coachCalibration.noCount');
    } catch {
      return null;
    }
    // sessionsHistory is the signal dep — getCalibrationMaturity reads it via
    // getState() (indirect), so the lint cannot see the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsHistory]);

  // START-side double-session guard (counterpart to the PostRpe finish-side
  // confirm shipped dc9400d6). When a gym session is already logged TODAY we
  // must NOT show the normal "Start session" button — an accidental tap would
  // start/log a second session. Mirror the exact today-detection PostRpe uses
  // (todTs(s.ts) === todTs(now), tz-safe local day-key) so the two surfaces
  // agree. We keep the FIRST matching today session's ts for the delete action.
  const todaySession = useMemo(
    () =>
      sessionsHistory.find(
        (s) => Number.isFinite(s.ts) && todTs(s.ts) === todTs(Date.now()),
      ) ?? null,
    [sessionsHistory],
  );
  const deleteSession = useWorkoutStore((s) => s.deleteSession);
  // Two-tap reveal: tapping "Session logged" opens the delete / add-second
  // choice inline (no separate route — matches the lightweight reveal pattern
  // used elsewhere). Add-second is the ONLY path to a 2nd session today.
  const [revealOptions, setRevealOptions] = useState(false);

  const handleDeleteToday = (): void => {
    if (todaySession) deleteSession(todaySession.ts);
    setRevealOptions(false);
  };

  const handleOverride = (): void => {
    navigate(gotoPath('schedule-override'));
  };

  return (
    <div
      className="pulse-card pulse-card-glow overflow-hidden p-[18px] mb-2.5 animate-card-rise"
      role="region"
      aria-label={t('coachToday.ariaLabel')}
      style={{ ['--wash' as string]: 'var(--volt)' }}
    >
      {/* Pulse volt glow corner (mockup interfata-noua/screens-antrenor.jsx:38
          .coach-glow) — replaces the prior brick radial. aria-hidden decoration,
          token-only volt via color-mix so every theme reads native. */}
      <div
        aria-hidden="true"
        data-testid="coach-today-gradient"
        className="absolute -top-[50px] -right-[50px] w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--volt) 26%, transparent), transparent 68%)',
        }}
      />
      <div className="relative">
        <Kicker color="var(--volt)">{t('coachToday.kicker')}</Kicker>
      </div>
      <div className="relative font-display text-xl font-bold mt-1.5 tracking-tight leading-tight text-ink">
        {title}
      </div>
      <div
        className="relative font-serif italic mt-2 leading-relaxed text-sm"
        style={{ color: 'var(--volt)' }}
        data-testid="coach-today-quote"
      >
        &ldquo;{coachQuote}&rdquo;
      </div>
      {laggingSignal && (
        <div
          data-testid="coach-today-lagging"
          className="relative font-serif italic mt-2 leading-relaxed text-xs pt-2 border-t border-dashed"
          style={{
            color: 'var(--ember)',
            borderColor: 'color-mix(in oklab, var(--ember) 35%, transparent)',
          }}
        >
          &ldquo;{laggingSignal}&rdquo;
        </div>
      )}
      <div className="relative flex gap-3.5 mt-3.5 text-sm text-ink2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          {t('coachToday.durationLabel', { min: duration })}
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          {t(exerciseCount === 1 ? 'coachToday.exercisesCount_one' : 'coachToday.exercisesCount_other', { n: exerciseCount })}
        </span>
        <span className="flex items-center gap-1.5" data-testid="coach-today-intensity">
          <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />
          {intensityLabel}
        </span>
      </div>
      {coachWhyLine && (
        /* Coach Voice — the daily "why" line. Rendered ABOVE the Start CTA as
           the first thing the user reads when the brain adapted today's plan.
           Subtle volt sparkle affordance + mono kicker, consistent with the
           card's Pulse ink tones. Hidden entirely when the composer returns null
           (nothing adapted). */
        <div
          data-testid="coach-why-line"
          className="relative flex items-start gap-2 mt-3.5 text-sm leading-relaxed text-ink2"
        >
          <Sparkles
            className="w-4 h-4 mt-0.5 shrink-0"
            aria-hidden="true"
            style={{ color: 'var(--volt)' }}
          />
          <span>{coachWhyLine}</span>
        </div>
      )}
      {calibrationLine && (
        /* Calibration honesty — the "still learning you" line. Sits just under
           the coach "why" line, in a quieter ink tone (this is humility, not a
           headline). Hidden entirely once the model is dialed in (composer
           returns null at PERSONALIZED+). */
        <div
          data-testid="coach-calibration-line"
          className="relative flex items-start gap-2 mt-2 text-xs leading-relaxed text-ink3"
        >
          <span>{calibrationLine}</span>
        </div>
      )}
      {todaySession ? (
        /* A gym session is already logged TODAY → the normal start CTA is
           replaced by a "Session logged" state. Tapping it reveals two
           explicit choices: delete today's session (reverts to the normal
           CTA) or opt in to a genuine second session today. */
        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => {
              haptic(12);
              setRevealOptions((v) => !v);
            }}
            data-testid="coach-session-logged"
            aria-expanded={revealOptions}
            className="press-feedback w-full rounded-full py-[15px] font-semibold flex items-center justify-center gap-2 border"
            style={{
              color: 'var(--volt)',
              borderColor: 'color-mix(in oklab, var(--volt) 45%, transparent)',
              background: 'color-mix(in oklab, var(--volt) 10%, transparent)',
            }}
          >
            <CheckCircle2 className="w-[18px] h-[18px]" aria-hidden="true" />
            <span>{t('coachToday.sessionLogged')}</span>
          </button>
          {revealOptions && (
            <div className="flex flex-col gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleDeleteToday}
                data-testid="coach-session-delete"
                className="press-feedback w-full rounded-full py-3 font-semibold text-sm flex items-center justify-center gap-2 border"
                style={{
                  color: 'var(--ember)',
                  borderColor: 'color-mix(in oklab, var(--ember) 45%, transparent)',
                }}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                {t('coachToday.deleteSessionToday')}
              </button>
              <button
                type="button"
                onClick={() => {
                  haptic(12);
                  onStart();
                }}
                data-testid="coach-session-add-second"
                className="press-feedback w-full rounded-full py-3 font-semibold text-sm flex items-center justify-center gap-2 border text-ink2"
                style={{ borderColor: 'var(--line-strong)' }}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t('coachToday.addSecondToday')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Wave C3 (2026-05-28) — the day's ritual launch. Ripple + haptic +
              press-feedback so the tap feels like a real commitment. Pulse swaps
              the flat brick fill for the volt→aqua gradient (the signature CTA). */}
          <button
            type="button"
            onClick={() => {
              haptic(12);
              onStart();
            }}
            className="btn-primary-lift press-feedback pulse-grad-bg pulse-shine relative overflow-hidden w-full mt-4 rounded-full py-[15px] font-semibold flex items-center justify-center gap-2"
            style={{ color: 'var(--on-accent)' }}
          >
            <Ripple color="rgba(255,255,255,0.55)" />
            <span className="relative">{t('coachToday.startCta')}</span>
            <ArrowRight className="relative w-[18px] h-[18px]" aria-hidden="true" />
          </button>
          <div className="relative text-center mt-2.5">
            <button
              type="button"
              onClick={handleOverride}
              data-testid="coach-today-override"
              className="text-sm underline underline-offset-2 text-ink3"
            >
              {t('coachToday.overrideCta')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
