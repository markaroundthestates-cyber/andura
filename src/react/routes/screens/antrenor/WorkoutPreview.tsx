// ══ WORKOUT PREVIEW — Phase 3 task_05 §C Rewrite Stub → Real ═════════════
// Per spec §2 C workout preview screen cu intensity banner + duration/volume
// + coach line + start workout CTA.
//
// Pasul 3 al flow-ului energy → cause → preview (mockup andura-clasic.html
// L913-985, NEW 2026-05-12 anti-surprize Gigel-friendly).
// Coach intensity ajustata din EnergyCheck via location.state intensityMod
// 'plus'/'normal'/'minus' → banner colors + duration/volume estimate.
//
// Phase 4+ wire real engine output (sessionBuilder/coachDirector aggregate)
// via engineWrappers.getTodayWorkout. Phase 3 fallback placeholder values
// pentru flow demonstrare.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-021 Energy Adjustment ±15%
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet coach voice
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L913-985 screen-workout-preview

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Layers, TrendingUp, Flame, Check, Zap } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout, resolveSessionTitle } from '../../../lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../../../lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../lib/scheduleAdapterAggregate';
import { recomposeWithBusyTypes } from '../../../lib/substitution';
import { ExerciseMedia } from '../../../components/ExerciseMedia';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { Kicker } from '../../../components/pulse/Kicker';
import { t } from '../../../../i18n/index.js';
import type { IntensityMod } from './EnergyCheck';

interface WorkoutPreviewLocationState {
  energyLevel?: string;
  intensityMod?: IntensityMod;
  cause?: string;
  // U-03 (HIGH) — pain context propagat din PainButton (region + intensity).
  painContext?: { region: string; intensity: 1 | 2 | 3 };
  // WP-5 moat — busy coarse equipment types from EquipmentSwap. The preview
  // recomposes the session with these temporarily unavailable → named swaps.
  equipmentContext?: { busyCoarseTypes?: string[] };
}

interface IntensityBanner {
  /** Pulse accent token tinted for bg/border/icon (mockup banner color ramp). */
  accent: string;
  msg: string;
}

// Pulse intensity ramp (mockup interfata-noua/screens-workout.jsx:67-71): the
// banner is tinted by the self-report — volt (charged) for a stronger session,
// aqua for baseline, ember when the coach is easing off. Token-only so every
// theme + the WCAG Pulse palette read native; bg/border derive via color-mix.
function bannerFor(intensityMod: IntensityMod): IntensityBanner {
  if (intensityMod === 'plus') {
    return { accent: 'var(--volt)', msg: t('workout.preview.intensityBanner.plus') };
  }
  if (intensityMod === 'minus') {
    return { accent: 'var(--ember)', msg: t('workout.preview.intensityBanner.minus') };
  }
  return { accent: 'var(--aqua)', msg: t('workout.preview.intensityBanner.normal') };
}

function durationFor(intensityMod: IntensityMod): number {
  if (intensityMod === 'minus') return 35;
  if (intensityMod === 'plus') return 60;
  return 50;
}

function volumeFor(intensityMod: IntensityMod): number {
  if (intensityMod === 'minus') return 10200;
  if (intensityMod === 'plus') return 14500;
  return 12450;
}

function formatVolume(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/,/g, ' ').replace(/\./g, ' ');
}

// F-workout-preview/T4 — Hardcoded mockup demo fallback exercise list cand
// engine emits 0 exercises (rest day handled upstream null; this guards
// pipeline edge: sessionBuilder returns empty array on context mismatch).
// Verbatim mockup andura-clasic.html#L945-984 — 5 exercises Push session
// (incline DB press / military / lateral / triceps cable / abdominal plank).
interface FallbackExercise {
  nameKey: string;
  detail: { sets: number; kg?: number; reps?: string; seconds?: number };
}
const FALLBACK_EXERCISES: FallbackExercise[] = [
  { nameKey: 'workout.preview.fallbackExercises.inclineDbPress',       detail: { sets: 4, kg: 22.5, reps: '8-10' } },
  { nameKey: 'workout.preview.fallbackExercises.seatedMilitaryPress',  detail: { sets: 4, kg: 20,   reps: '8-10' } },
  { nameKey: 'workout.preview.fallbackExercises.lateralRaise',         detail: { sets: 3, kg: 8,    reps: '12-15' } },
  { nameKey: 'workout.preview.fallbackExercises.tricepCableExtension', detail: { sets: 3, kg: 15,   reps: '10-12' } },
  { nameKey: 'workout.preview.fallbackExercises.plank',                detail: { sets: 3, seconds: 45 } },
];

function fallbackDetail(d: FallbackExercise['detail']): string {
  if (d.seconds !== undefined) {
    return t('workout.preview.exerciseTimedDetail', { sets: d.sets, seconds: d.seconds });
  }
  return t('workout.preview.exerciseDetail', {
    sets: d.sets,
    kg: d.kg ?? 0,
    reps: d.reps ?? '',
  });
}

export function WorkoutPreview(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSessionContext = useWorkoutStore((s) => s.setSessionContext);
  const { intensityMod = 'normal', painContext, equipmentContext } =
    (location.state as WorkoutPreviewLocationState | null) ?? {};
  const busyCoarseTypes = equipmentContext?.busyCoarseTypes ?? [];

  // Phase 6 task_02 Option C: async getTodayWorkout — useState fallback null
  // while pipeline pending; preview still renders cu hardcoded fallback values
  // (durationFor/volumeFor/'Push (piept si umeri)') pana resolve. Per
  // DECISIONS.md §D027.
  //
  // FALLBACK guard (gsd-ui-auditor chat 5 Wave 8): explicit loading + error
  // state machine. engineWrappers.getTodayWorkout already catches engine throws
  // internally + returns null (engineWrappers.ts L412-418), but defense-in-
  // depth `.catch` here ensures promise rejection NEVER leaves UI silently
  // stuck on fallback without AT signal. `aria-busy` exposes loading to screen
  // readers; error banner surfaces rare upstream catch failure to Gigel.
  const [workout, setWorkout] = useState<PlannedWorkoutOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout()
      .then((w) => {
        if (!cancelled) {
          setWorkout(w);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);
  // i18n bridge — same engine fallback sentinel handling as CoachTodayCard.
  // scheduleAdapterAggregate seeds workoutTitle with the non-localized sentinel
  // ENGINE_WORKOUT_TITLE_FALLBACK when the plan has no real title; treat it (and
  // the legacy 'Antrenament azi'/engineFallbackTitle for persisted plans) as "no
  // real title" so the locale-aware preview fallback fires.
  const engineFallbackSentinel = t('coachToday.engineFallbackTitle');
  const rawWorkoutTitle = workout?.workoutTitle;
  const isEngineFallback =
    rawWorkoutTitle === ENGINE_WORKOUT_TITLE_FALLBACK ||
    rawWorkoutTitle === 'Antrenament azi' ||
    rawWorkoutTitle === engineFallbackSentinel;
  // When the engine has no real per-plan title (the sentinel), derive the
  // localized title from the engine SESSION TYPE (PUSH/PULL/...) instead of the
  // old hardcoded "Push (piept si umeri)" copy that showed on every day. A real
  // engine title still passes through untouched.
  const title = rawWorkoutTitle && !isEngineFallback
    ? rawWorkoutTitle
    : resolveSessionTitle(workout?.sessionType);
  // Banner stays the self-report transparency signal (user said "Excelent" →
  // "Coach urca intensitatea"). The duration/volume PRESCRIPTION, however, now
  // tracks the ENGINE intensityMod baseline (deload output) — C3. The blunt
  // self-report multiplier no longer stacks on the prescription (the self-report
  // feeds the engine VIA readiness, C2); stacking it here double-counted.
  // Magnitudes (-/+) unchanged (separate Daniel UX call).
  const engineIntensityMod: IntensityMod = workout?.intensityMod ?? 'normal';
  const banner = bannerFor(intensityMod);
  const baseDuration = workout?.estimatedDuration ?? durationFor('normal');
  const baseVolume = workout?.volumeKg ?? volumeFor('normal');
  const duration =
    engineIntensityMod === 'minus'
      ? Math.round(baseDuration * 0.7)
      : engineIntensityMod === 'plus'
      ? Math.round(baseDuration * 1.2)
      : baseDuration;
  const volume =
    engineIntensityMod === 'minus'
      ? Math.round(baseVolume * 0.82)
      : engineIntensityMod === 'plus'
      ? Math.round(baseVolume * 1.16)
      : baseVolume;
  const coachLine = coachPick('preview', undefined, 0);

  // WP-5 moat — when EquipmentSwap forwarded busy coarse types, recompose the
  // planned exercises with them unavailable so the affected rows show their
  // NAMED alternative (swapReason → "Inlocuit · {original} ocupat"). No busy
  // types → the original list passes through untouched.
  const displayExercises =
    workout?.exercises && busyCoarseTypes.length > 0
      ? recomposeWithBusyTypes(workout.exercises, busyCoarseTypes)
      : workout?.exercises;

  function handleStart(): void {
    // U-03 (HIGH) — persist session intensity/pain in store inainte de navigate
    // (location.state se pierde la navigate fara state + la refresh). Workout.tsx
    // aplica modifierul la target-uri ca adaptarea afisata aici sa fie reala.
    setSessionContext({ intensityMod, painContext: painContext ?? null });
    navigate(gotoPath('workout'));
  }

  // F-workout-preview/T2 — Hero card dark idiom mirror CoachTodayCard L36-61
  // (bg-ink text-paper rounded-2xl + brick eyebrow + chips). DIFFERENT vs
  // CoachTodayCard: eyebrow "Sesiunea de azi" + 3 chips (duration / count /
  // volume) + NO embedded CTA (separate "Incepe antrenament" stays below).
  // Mockup parity andura-clasic.html#L924-932.
  const exerciseCount = workout?.exerciseCount ?? 5;

  return (
    <section
      className="pt-2 px-5 pb-6 bg-paper"
      data-testid="workout-preview"
      aria-busy={loading}
    >
      {/* FALLBACK guard error banner (gsd-ui-auditor chat 5 Wave 8) — visible
          only when getTodayWorkout promise rejects past wrapper safe-catch.
          Fallback content below still renders (5 mockup exercises + default
          duration/volume) so Gigel can still start a session. */}
      {error && (
        <div
          className="p-3 rounded-xl border mb-4"
          data-testid="preview-error-banner"
          role="alert"
          aria-live="assertive"
          style={{
            background: 'var(--status-danger-bg)',
            borderColor: 'var(--status-danger-border)',
          }}
        >
          <p className="text-base text-ink">
            {t('workout.preview.errorBanner')}
          </p>
        </div>
      )}
      {/* Pulse hero (mockup interfata-noua/screens-workout.jsx:76-82) — Kicker
          eyebrow + display title + inline meta row (replaces the prior dark
          inverted card). preview-hero keeps its region role + testids; the
          duration/count/volume chips keep their individual testids. */}
      <div
        data-testid="preview-hero"
        role="region"
        aria-label={t('workout.preview.ariaLabel')}
        className="mb-4 animate-card-rise"
      >
        <Kicker color="var(--volt)">{t('workout.preview.todaysSessionKicker')}</Kicker>
        <h1 className="font-display text-2xl font-bold mt-1.5 tracking-tight text-ink leading-tight">{title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-sm text-ink2">
          <span className="flex items-center gap-1.5" data-testid="preview-duration">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            ~ {duration} min
          </span>
          <span className="flex items-center gap-1.5" data-testid="preview-exercise-count">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            {t('workout.preview.exercisesCount', { n: exerciseCount })}
          </span>
          <span className="flex items-center gap-1.5" data-testid="preview-volume">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            {formatVolume(volume)} kg
          </span>
        </div>
      </div>
      {/* Intensity banner — Pulse tinted card with a Zap glyph (mockup
          interfata-noua/screens-workout.jsx:83-87). bg/border derive from the
          per-intensity accent via color-mix so each state reads distinctly.
          Stays the self-report transparency signal; role=status preserved. */}
      <div
        className="preview-intensity-banner flex items-start gap-3 p-3.5 rounded-2xl border mb-4 animate-card-rise delay-75"
        data-intensity={intensityMod}
        role="status"
        aria-live="polite"
        aria-label={t('workout.preview.intensityBanner.ariaLabel')}
        style={{
          background: `color-mix(in oklab, ${banner.accent} 12%, var(--surface))`,
          borderColor: `color-mix(in oklab, ${banner.accent} 35%, transparent)`,
        }}
      >
        <Zap
          className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
          style={{ color: banner.accent }}
          fill="currentColor"
          aria-hidden="true"
        />
        <p className="text-sm leading-relaxed text-ink">{banner.msg}</p>
      </div>
      {/* F-workout-preview/T3 — Warmup row. Mockup andura-clasic.html#L935-939
          FIX 1 (2026-05-11) adaptive per main lift + recovery state. Renders
          ONLY cand engine emits warmup blueprint (workout.warmup != null).
          Idiom mirror intensity banner L122-130: flex+items-center+gap+padded
          +rounded+border+bg-paper2 + italic-Lora coach-quote font. */}
      {workout?.warmup && (
        <div
          className="pulse-card flex items-center gap-2.5 p-3 mb-4 animate-card-rise delay-100"
          data-testid="preview-warmup-row"
          role="region"
          aria-label={t('workout.preview.warmupAriaLabel')}
        >
          <Flame className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
          <span className="coach-quote font-serif italic text-ink2 text-sm flex-1 leading-relaxed">
            {/* Engine emits warmup.line as RO native "Incalzire ~X min" via
                src/engine/warmup/constants.js. Synthesize from durationMin
                via the locale-aware warmupLine key so EN locale renders
                "Warm-up ~X min" instead of the RO leak. Falls back to the
                raw line when durationMin is missing (defensive). */}
            {workout.warmup.durationMin > 0
              ? t('workout.preview.warmupLine', { min: workout.warmup.durationMin })
              : workout.warmup.line}
          </span>
        </div>
      )}
      {/* F-workout-preview/T4 — Exercise list 5 numbered. Mockup parity
          andura-clasic.html#L941-985. Renders engine exercises cand
          available; falls back hardcoded mockup demo cand engine emits
          empty array (defensive — getTodayWorkout returns null for
          rest/halt; this guards sessionBuilder edge case 0 exercises).
          Each row: numbered badge + name + detail (sets/reps) + dumbbell icon. */}
      <div className="mb-2.5">
        <Kicker>{t('workout.preview.exercisesHeading')}</Kicker>
      </div>
      <ul
        className="pulse-card divide-y divide-line overflow-hidden mb-4"
        data-testid="preview-exercise-list"
      >
        {(displayExercises && displayExercises.length > 0
          ? displayExercises.map((ex, i) => ({
              key: ex.id,
              name: ex.name,
              // Engine canonical name passed to <ExerciseMedia> (image/gif
              // lookup keyed on the English ID — same id used by PR/DP/library).
              // Fallback to display name keeps the placeholder rendering valid
              // even on pre-WP-5 fixtures that omit engineName.
              engineName: ex.engineName ?? ex.name,
              // WP-5 moat: a swapped-in alternative surfaces the substitution
              // reason in the sub slot ("Inlocuit · {motiv}") so the user SEES
              // it was replaced; otherwise the normal equipment/setup sub.
              sub: ex.swapReason ? t('workout.preview.swappedPrefix', { reason: ex.swapReason }) : ex.sub,
              // Bodyweight: show "greutatea corpului" instead of "0 kg" (the
              // symptom Daniel flagged); append "+X kg" only when added > 0.
              detail: ex.isBodyweight
                ? ex.targetKg > 0
                  ? t('workout.preview.exerciseDetailBodyweightAdded', { sets: ex.sets, kg: ex.targetKg, reps: ex.targetReps })
                  : t('workout.preview.exerciseDetailBodyweight', { sets: ex.sets, reps: ex.targetReps })
                : t('workout.preview.exerciseDetail', { sets: ex.sets, kg: ex.targetKg, reps: ex.targetReps }),
              idx: i,
            }))
          : FALLBACK_EXERCISES.map((ex, i) => {
              const name = t(ex.nameKey);
              return {
                key: `fallback-${i}`,
                name,
                engineName: name,
                sub: undefined as string | undefined,
                detail: fallbackDetail(ex.detail),
                idx: i,
              };
            })
        ).map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 p-3"
            data-testid="preview-exercise-row"
          >
            {/* Wave A4 (Daniel 2026-05-28 #11) — visual guidance thumbnail
                per row. ExerciseMedia auto-renders the muscle-group placeholder
                today + a real image/gif once the asset is sourced (V2). The
                numbered badge moves into the bottom-right of the tile so the
                ordering remains glance-able without the tile losing its
                visual anchor. */}
            <div className="relative flex-shrink-0">
              <ExerciseMedia
                engineName={item.engineName}
                variant="thumbnail"
                testId={`preview-exercise-media-${item.idx}`}
              />
              {/* Pulse accent-tinted number badge (mockup .ex-num) — anchored to
                  the thumbnail bottom-right so ordering stays glance-able. */}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border border-paper flex items-center justify-center font-mono font-bold text-[10px]"
                style={{
                  background: 'color-mix(in oklab, var(--brick) 16%, var(--paper))',
                  color: 'var(--brick)',
                }}
              >
                {item.idx + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{item.name}</div>
              {/* Subtitle line (equipment/setup, e.g. "Cu gantere · banc 30°")
                  per mockup andura-clasic.html#L1450 wv2-ex-sub. Rendered only
                  cand engine exercise carries display sub (RO display map). */}
              {item.sub && (
                <div className="text-xs text-ink3 mt-0.5" data-testid="preview-exercise-sub">
                  {item.sub}
                </div>
              )}
              <div className="text-xs text-ink3 font-mono mt-0.5">{item.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      {coachLine && (
        <p
          className="coach-quote text-base text-ink2 italic font-serif mb-6"
          data-testid="preview-coach-line"
        >
          „{coachLine}"
        </p>
      )}
      {/* §F-workout-preview-04 (MED chat5 Wave 14) — closing italic note
          mockup andura-clasic.html#L991 verbatim (anti-paternalism reassurance):
          "Coach-ul ajusteaza in timpul sesiunii daca apare ceva: durere,
          oboseala, set greu. Nu trebuie sa stii dinainte tot." Pozitionat
          INAINTE de CTA per mockup ordine (small-text italic ink-3). */}
      <p
        className="text-sm text-ink3 italic leading-relaxed mt-3.5 mb-4"
        data-testid="preview-closing-note"
      >
        {t('workout.preview.closingNote')}
      </p>
      {/* §F-workout-preview-05 (HIGH chat5 Wave 15) — CTA mockup verbatim
          andura-clasic.html#L993-995 (confirmation framing + check icon):
          "Incepe antrenament" → "Confirma, incep" + Check icon prefix.
          Confirmation tone reduces accidental tap pe preview screen +
          intent-acknowledgement pattern reglaj Daniel 2026-05-12 §preview-cta. */}
      <button
        type="button"
        onClick={handleStart}
        data-testid="preview-start-cta"
        className="btn-primary-lift pulse-grad-bg pulse-shine w-full flex items-center justify-center gap-2 py-4 text-paper rounded-full text-base font-semibold"
      >
        <Check className="w-5 h-5" aria-hidden="true" />
        {t('workout.preview.confirmStartCta')}
      </button>
    </section>
  );
}
