// POST-RPE - Phase 3 task_09 §A Rewrite Stub -> Real
// Post-session RPE rating (la finalul ultimului exercitiu, before summary).
// 3-button RO: Usoara / Normala / Grea (workoutStore.lastRating taxonomy -
// distinct de per-set rating 'usor/potrivit/greu' which lives in
// ExerciseHistoryEntry).
//
// Mockup parity (andura-clasic.html L1593-1626 traffic-light per rating):
// usor -> green (U+1F7E2), potrivit -> yellow (U+1F7E1), greu -> red
// (U+1F534). Mockup 'usor/potrivit/greu' labels; React component uses
// 'usoara/normala/grea' SessionRating taxonomy - semantic 1:1 map. Emoji
// is aria-hidden decorative - preserves accessible name for tests.
//
// Submit pipeline:
//   1. workoutStore.setLastRating(rating)
//   2. Compute session summary (sets / volume / duration min)
//   3. workoutStore.finishSession(summary) clears history + sets lastSession
//   4. workoutStore.incrementStreak() (NU in PostSummary, avoid double-inc)
//   5. navigate('/app/antrenor/post-summary')
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-027 Energy Adjustment (calibrare per rating)
//   - DECISIONS.md §D-LEGACY-029 Specialization Engine (rating feeds learning)
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet (rating descriptor copy)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html submitPostRpeV2()

import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useWorkoutStore, energyLightForIntensityMod } from '../../../stores/workoutStore';
import type {
  SessionExerciseBreakdown,
  LogEntry,
} from '../../../stores/workoutStore';
import { getTodayWorkout } from '../../../lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../lib/scheduleAdapterAggregate';
import { gotoPath } from '../../../lib/navigation';
import {
  enrichExercisesWithPR,
  refreshPRRecordsFromLogs,
} from '../../../lib/prRecordsWriteback';
import { DB } from '../../../../db.js';
import { toast } from '../../../lib/toast';
import { Kicker } from '../../../components/pulse/Kicker';
import { t } from '../../../../i18n/index.js';

export type SessionRating = 'usoara' | 'normala' | 'grea';

// Labels + descriptions resolved at render time via t() so the locale flip
// surfaces EN copy under default + RO copy when the user opts in via
// Cont > Setari > Limba (Daniel 2026-05-28 mandate).
interface RatingMeta {
  rating: SessionRating;
  labelKey: string;
  descriptionKey: string;
  // Pulse accent token per feel (mockup interfata-noua/screens-workout.jsx:463-465):
  // easy=volt (had more), right=aqua (balanced), hard=ember (to the limit).
  accent: string;
}

const RATING_META: readonly RatingMeta[] = [
  { rating: 'usoara', labelKey: 'postRpe.ratings.easyLabel',  descriptionKey: 'postRpe.ratings.easyDescription', accent: 'var(--volt)' },
  { rating: 'normala', labelKey: 'postRpe.ratings.rightLabel', descriptionKey: 'postRpe.ratings.rightDescription', accent: 'var(--aqua)' },
  { rating: 'grea', labelKey: 'postRpe.ratings.hardLabel',  descriptionKey: 'postRpe.ratings.hardDescription', accent: 'var(--ember)' },
];

function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/\./g, ' ').replace(/,/g, '.');
}

export function PostRpe(): JSX.Element {
  const navigate = useNavigate();
  const history = useWorkoutStore((s) => s.history);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const sessionContext = useWorkoutStore((s) => s.sessionContext);
  const setLastRating = useWorkoutStore((s) => s.setLastRating);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const incrementStreak = useWorkoutStore((s) => s.incrementStreak);

  // Select-then-Save (mockup interfata-noua/screens-workout.jsx:461-483) — the
  // user picks a feel, then confirms with Save. Two taps on a finalize screen
  // guards against an accidental tap silently ending the session. The Save
  // button calls handleSubmit(pick) — the full finalize pipeline is unchanged.
  const [pick, setPick] = useState<SessionRating | null>(null);

  // [15.022] In-flight submit latch. handleSubmit is async (awaits
  // getTodayWorkout) so a fast double-tap could re-enter before navigate and
  // call finishSession + incrementStreak twice → duplicate sessionsHistory
  // entry + double streak. A useRef (not state) latches synchronously on the
  // first tap, before any await, so the second tap is dropped. Reset only on
  // the early-return path (user can retry); the success path unmounts on
  // navigate so no reset is needed.
  const submittingRef = useRef(false);

  async function handleSubmit(rating: SessionRating): Promise<void> {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLastRating(rating);

    const entries = Object.values(history).flat();
    const setsDone = entries.length;
    const volume = entries.reduce((acc, h) => acc + h.kg * h.reps, 0);
    const dur =
      sessionStart !== null
        ? Math.max(1, Math.floor((Date.now() - sessionStart) / 60000))
        : 0;

    // H2 audit fix (midnight data loss) — re-deriving the plan here was the bug:
    // getTodayWorkout() returns null when the day has rolled over into a rest day
    // (or pipeline halt), so the COMPLETED session the user just logged was
    // silently dropped. The save must NOT depend on the plan re-deriving; it must
    // persist the in-memory sets the user actually logged this session.
    //
    // HIGH-CODE-06 truth preserved: when the plan is gone we must NOT fabricate a
    // muscle-group title (the old 'Push (piept si umeri)' lie). We save under an
    // honest neutral title 'Antrenament' (it genuinely WAS a workout — no claim
    // about which muscles) + the real logged sets; exercise names degrade to the
    // honest 'Exercitiu N' fallback below. Only a session with NOTHING logged is
    // rejected (nothing to save) — that is the legitimate empty case.
    const planned = await getTodayWorkout();
    if (setsDone === 0) {
      submittingRef.current = false; // nothing persisted — allow a retry
      toast.show({
        message: t('postRpe.noSetsToast'),
        variant: 'error',
      });
      navigate(gotoPath('antrenor'));
      return;
    }
    const rawTitle = planned?.workoutTitle;
    const title =
      rawTitle && rawTitle !== ENGINE_WORKOUT_TITLE_FALLBACK
        ? rawTitle
        : t('postRpe.fallbackTitle');
    // Locale-aware sets phrase: RO uses pluralRo grammar (1 set / 4 seturi);
    // EN uses the simple "{n} set(s)" form (1 set / 4 sets). Both flow into
    // postRpe.metaTemplate "{sets} · {minutes} min · {kg} kg".
    const setsPart = setsDone === 1 ? `1 ${t('common.set')}` : `${setsDone} ${t('common.setsPlural')}`;
    const meta = t('postRpe.metaTemplate', {
      sets: setsPart,
      minutes: dur,
      kg: formatKg(volume),
    });

    const exercisesBase: SessionExerciseBreakdown[] = Object.entries(history)
      .map(([exIdxStr, sets]) => {
        const exIdx = Number(exIdxStr);
        const planEx = planned?.exercises[exIdx];
        const exerciseId = planEx?.id ?? `ex-${exIdx}`;
        const exerciseName = planEx?.name ?? t('postRpe.fallbackExerciseName', { n: exIdx + 1 });
        let totalVolume = 0;
        let peakOneRM = 0;
        const breakdownSets = sets.map((s) => {
          totalVolume += s.kg * s.reps;
          const oneRM = s.kg * (1 + s.reps / 30);
          if (oneRM > peakOneRM) peakOneRM = oneRM;
          return {
            kg: s.kg,
            reps: s.reps,
            rating: s.rating,
            timestamp: s.timestamp ?? Date.now(),
          };
        });
        return {
          exerciseId,
          exerciseName,
          sets: breakdownSets,
          totalVolume,
          peakOneRM: Math.round(peakOneRM * 10) / 10,
        };
      })
      .filter((bd) => bd.sets.length > 0);

    // CRIT #3 + MED #8 shape-check audit chat 5 — enrich exercises cu isPR
    // flag per set before finishSession persists. detectPR runs vs prior
    // DB.get('logs') accumulator. PR Wall (prHistoryAggregate) now surfaces
    // real PRs from React production path.
    const priorLogs = (DB.get<LogEntry[]>('logs') ?? []) as LogEntry[];
    const exercises = enrichExercisesWithPR(exercisesBase, priorLogs);

    // Persist the pre-workout readiness traffic-light on the finished session so
    // the live energy engines read a per-session signal off recentSessions[*].
    // Source = sessionContext.intensityMod (set by WorkoutPreview from the
    // EnergyCheck readiness pick); absent when the user entered Antrenor directly
    // (no energy-check) → engines see no-signal baseline (NU fabricate green).
    const energy =
      sessionContext !== null
        ? energyLightForIntensityMod(sessionContext.intensityMod)
        : undefined;

    finishSession({
      title,
      meta,
      ts: Date.now(),
      sets: setsDone,
      durationMin: dur,
      volumeKg: volume,
      exercises,
      ...(energy !== undefined ? { energyEmoji: energy, energy } : {}),
    });
    incrementStreak();

    // CRIT #3 — after finishSession persists new logs (workoutStore writeback),
    // refresh pr-records hash from full logs scan. MMI Engine #9
    // buildSilentMmiContext consumes DB.get('pr-records') — was permanent
    // null pre-shim. Returning users 6+mo now receive baseline weight cap
    // protection in React production path.
    refreshPRRecordsFromLogs();

    navigate(gotoPath('post-summary'));
  }

  return (
    <section className="p-6 bg-paper min-h-screen flex flex-col" data-testid="post-rpe">
      {/* Pulse reskin (mockup interfata-noua/screens-workout.jsx:467-483) —
          Kicker eyebrow + display h1; coach intro keeps its serif italic +
          testid. */}
      <Kicker color="var(--aqua)">{t('postRpe.kicker')}</Kicker>
      <h1 className="font-display text-2xl font-bold text-ink mt-2 mb-2">{t('postRpe.heading')}</h1>
      {/* §F-post-rpe-01 (HIGH chat5 Wave 15) — coach quote Lora italic mockup
          andura-clasic.html#L1596 verbatim. Product personality signal Andura
          Suflet (D-LEGACY-052) — engine-transparent framing ("calibreaza
          sesiunea de maine") substitueste subtitle plain anterior. */}
      <p
        className="coach-quote text-base text-ink2 italic font-serif mb-6 leading-relaxed"
        data-testid="post-rpe-intro"
      >
        “{t('postRpe.intro')}”
      </p>
      {/* No role="list": children are <button>s (not valid role="listitem"),
          which makes a screen reader announce an empty list. The "Cum a fost
          sesiunea?" heading already labels the group (parity §6-M3 revert).
          Select-then-Save: a tap sets pick (aria-pressed), the radio circle
          fills with the feel accent; finalize fires only on Save. */}
      <div className="flex flex-col gap-3 flex-1">
        {RATING_META.map((opt) => {
          const selected = pick === opt.rating;
          return (
            <button
              key={opt.rating}
              type="button"
              onClick={() => setPick(opt.rating)}
              data-rating={opt.rating}
              aria-pressed={selected}
              className="pulse-card flex items-center gap-4 p-5 transition text-left animate-card-rise"
              style={{
                borderColor: selected ? opt.accent : 'var(--line)',
                borderWidth: 1.5,
                background: selected
                  ? `color-mix(in oklab, ${opt.accent} 9%, var(--surface))`
                  : undefined,
                boxShadow: selected
                  ? `0 0 28px -8px color-mix(in oklab, ${opt.accent} 60%, transparent)`
                  : undefined,
              }}
            >
              <span className="flex flex-col items-start gap-1 flex-1 min-w-0">
                <span
                  className="font-display text-lg font-bold"
                  style={{ color: selected ? opt.accent : 'var(--ink)' }}
                >
                  {t(opt.labelKey)}
                </span>
                <span className="text-sm text-ink2">{t(opt.descriptionKey)}</span>
              </span>
              {/* Radio check circle (mockup .rpe-check) — fills with the feel
                  accent when selected. Decorative; aria-pressed on the button
                  carries selection to assistive tech. */}
              <span
                className="w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition"
                style={{
                  borderColor: selected ? opt.accent : 'var(--line-strong)',
                  background: selected ? opt.accent : 'transparent',
                }}
                aria-hidden="true"
              >
                {selected && (
                  <Check className="w-4 h-4" style={{ color: 'var(--on-accent)' }} strokeWidth={2.6} />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {/* Save (mockup .btn-grad gated on pick) — finalize pipeline fires once
          here. Disabled until a feel is picked (opacity + pointer guard +
          disabled attr for assistive tech). */}
      <button
        type="button"
        onClick={() => { if (pick) void handleSubmit(pick); }}
        disabled={pick === null}
        data-testid="post-rpe-save"
        className="btn-primary-lift pulse-grad-bg pulse-shine w-full py-4 mt-4 text-paper rounded-full text-base font-semibold disabled:opacity-45 disabled:pointer-events-none"
      >
        {t('postRpe.submitCta')}
      </button>
      {/* §F-post-rpe-04 (MED chat5 Wave 15) — footer gratitude + explainer
          mockup andura-clasic.html#L1624 verbatim. Andura Suflet warmth
          (D-LEGACY-052) — recunoaste valoarea contribution Gigel/Marius
          fara paternalism. Pozitionat post-rating ca anchor recognition. */}
      <p
        className="mt-6 text-xs text-ink3 text-center leading-relaxed"
        data-testid="post-rpe-footer"
      >
        {t('postRpe.footer')}
      </p>
    </section>
  );
}
