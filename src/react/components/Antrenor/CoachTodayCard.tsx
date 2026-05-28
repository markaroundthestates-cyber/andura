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
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Layers } from 'lucide-react';
import type { PlannedWorkoutOutput } from '../../lib/engineWrappers';
import * as engineWrappers from '../../lib/engineWrappers';
import { coachPick } from '../../lib/coachVoice';
import { gotoPath } from '../../lib/navigation';
import { useWorkoutStore } from '../../stores/workoutStore';
import { t } from '../../../i18n/index.js';

// §B037 audit fix (UI-REVIEW #2) — extract design tokens out of inline style
// hex literals → CSS custom properties. Tailwind extend in `tailwind.config.js`
// pentru future bg-coach-lora / text-coach-meta utility classes; pe loc CSS vars
// inline preserve fallback. Quote color = "lora" (warm gold accent line), meta
// color = "meta" (sub-text gray-warm).
const COACH_LORA_COLOR = 'var(--coach-lora, #e8d9b8)';
const COACH_META_COLOR = 'var(--coach-meta, #a8a09a)';
// §F-pass2-coachtoday-04 — lagging extension mockup L747 color #f6c89a (warmer
// gold accent vs lora primary; secondary weakness signal context).
const COACH_LAGGING_COLOR = 'var(--coach-lagging, #f6c89a)';
// §F-pass2-coachtoday-06 — override link mockup L754 color #c8b89a (muted
// paper-tone hint subtle CTA "Vrei altceva azi?" → openScheduleOverride).
const COACH_OVERRIDE_COLOR = 'var(--coach-override, #c8b89a)';

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
  const title = workout?.workoutTitle ?? t('coachToday.fallbackTitle');
  const duration = workout?.estimatedDuration ?? 48;
  const exerciseCount = workout?.exerciseCount ?? 5;
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

  const handleOverride = (): void => {
    navigate(gotoPath('schedule-override'));
  };

  return (
    <div
      className="relative overflow-hidden bg-ink text-paper dark:bg-paper2 dark:text-ink dark:border dark:border-brick rounded-[18px] p-[18px] mb-2.5 animate-card-rise"
      role="region"
      aria-label={t('coachToday.ariaLabel')}
    >
      {/* §F-pass2-coachtoday-07 (LOW chat5 Wave 10) — decorative radial brick
         gradient mockup L742 verbatim. aria-hidden + presentation-only div,
         dark-theme hidden (background swap negates warmth intent). */}
      <div
        aria-hidden="true"
        data-testid="coach-today-gradient"
        className="absolute -top-[30px] -right-[30px] w-[140px] h-[140px] rounded-full pointer-events-none dark:hidden"
        style={{
          background:
            'radial-gradient(circle, rgba(200,65,46,0.35), transparent 70%)',
        }}
      />
      {/* Wave A4 (2026-05-28) — dark-theme accent wash. The light-theme brick
          gradient above hides on dark because rgba(200,65,46) red sits wrong on
          mov/noir/earth surfaces; this companion overlay uses the active
          --brick token via color-mix so each dark palette gets its OWN warm
          accent (purple on Brain Coach, champagne on Luxury, gold on Living
          Body). Same -30/-30 anchor + 140x140 footprint keeps the visual
          composition consistent cross-theme. */}
      <div
        aria-hidden="true"
        data-testid="coach-today-gradient-dark"
        className="hidden dark:block absolute -top-[40px] -right-[40px] w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--brick) 28%, transparent), transparent 70%)',
        }}
      />
      <div className="relative text-xs font-semibold tracking-wider uppercase text-brick">
        {t('coachToday.kicker')}
      </div>
      <div className="relative text-xl font-bold mt-1 tracking-tight">{title}</div>
      <div
        className="relative font-serif italic mt-1.5 leading-relaxed text-sm"
        style={{ color: COACH_LORA_COLOR }}
        data-testid="coach-today-quote"
      >
        &bdquo;{coachQuote}&rdquo;
      </div>
      {laggingSignal && (
        <div
          data-testid="coach-today-lagging"
          className="relative font-serif italic mt-1.5 leading-relaxed text-xs pt-1.5 border-t border-dashed"
          style={{ color: COACH_LAGGING_COLOR, borderColor: 'rgba(246,200,154,0.3)' }}
        >
          &bdquo;{laggingSignal}&rdquo;
        </div>
      )}
      <div className="relative flex gap-3.5 mt-3.5 text-sm" style={{ color: COACH_META_COLOR }}>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          {t('coachToday.durationLabel', { min: duration })}
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          {t(exerciseCount === 1 ? 'coachToday.exercisesCount_one' : 'coachToday.exercisesCount_other', { n: exerciseCount })}
        </span>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="relative w-full mt-3.5 bg-brick text-paper rounded-md py-2.5 font-semibold transition-transform active:scale-[.97]"
      >
        {t('coachToday.startCta')}
      </button>
      <div className="relative text-center mt-2.5">
        <button
          type="button"
          onClick={handleOverride}
          data-testid="coach-today-override"
          className="text-sm underline underline-offset-2"
          style={{ color: COACH_OVERRIDE_COLOR }}
        >
          {t('coachToday.overrideCta')}
        </button>
      </div>
    </div>
  );
}
