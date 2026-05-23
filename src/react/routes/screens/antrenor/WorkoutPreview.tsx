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
import { Clock, Layers, TrendingUp, Flame, Dumbbell, Check } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout } from '../../../lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../../../lib/engineWrappers';
import type { IntensityMod } from './EnergyCheck';

interface WorkoutPreviewLocationState {
  energyLevel?: string;
  intensityMod?: IntensityMod;
  cause?: string;
}

interface IntensityBanner {
  bg: string;
  border: string;
  msg: string;
}

function bannerFor(intensityMod: IntensityMod): IntensityBanner {
  if (intensityMod === 'plus') {
    return {
      bg: 'var(--status-success-bg)',
      border: 'var(--status-success-border)',
      msg: 'Coach urca intensitatea +15%. Mai grele cu o haltera, 1 rep in plus.',
    };
  }
  if (intensityMod === 'minus') {
    return {
      bg: 'var(--status-danger-bg)',
      border: 'var(--status-danger-border)',
      msg: 'Coach reduce intensitatea -20%. Mai usor azi, focus pe forma.',
    };
  }
  return {
    bg: 'var(--status-neutral-bg)',
    border: 'var(--status-neutral-border)',
    msg: 'Sesiune normala - baseline. Coach ajusteaza in timpul sesiunii daca apare ceva.',
  };
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
  name: string;
  detail: string;
}
const FALLBACK_EXERCISES: FallbackExercise[] = [
  { name: 'Impins inclinat cu gantere',  detail: '4 seturi - 22.5 kg - 8-10 reps' },
  { name: 'Impins militar sezand',       detail: '4 seturi - 20 kg - 8-10 reps' },
  { name: 'Ridicari laterale',           detail: '3 seturi - 8 kg - 12-15 reps' },
  { name: 'Extensii triceps la cablu',   detail: '3 seturi - 15 kg - 10-12 reps' },
  { name: 'Plansa abdominala',           detail: '3 seturi - 45 sec' },
];

export function WorkoutPreview(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { intensityMod = 'normal' } =
    (location.state as WorkoutPreviewLocationState | null) ?? {};

  // Phase 6 task_02 Option C: async getTodayWorkout — useState fallback null
  // while pipeline pending; preview still renders cu hardcoded fallback values
  // (durationFor/volumeFor/'Push (piept si umeri)') pana resolve. Per
  // DECISIONS.md §D027.
  const [workout, setWorkout] = useState<PlannedWorkoutOutput | null>(null);
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((w) => {
      if (!cancelled) setWorkout(w);
    });
    return () => { cancelled = true; };
  }, []);
  const title = workout?.workoutTitle ?? 'Push (piept si umeri)';
  const banner = bannerFor(intensityMod);
  const baseDuration = workout?.estimatedDuration ?? durationFor('normal');
  const baseVolume = workout?.volumeKg ?? volumeFor('normal');
  const duration =
    intensityMod === 'minus'
      ? Math.round(baseDuration * 0.7)
      : intensityMod === 'plus'
      ? Math.round(baseDuration * 1.2)
      : baseDuration;
  const volume =
    intensityMod === 'minus'
      ? Math.round(baseVolume * 0.82)
      : intensityMod === 'plus'
      ? Math.round(baseVolume * 1.16)
      : baseVolume;
  const coachLine = coachPick('preview', undefined, 0);

  function handleStart(): void {
    navigate(gotoPath('workout'));
  }

  // F-workout-preview/T2 — Hero card dark idiom mirror CoachTodayCard L36-61
  // (bg-ink text-paper rounded-2xl + brick eyebrow + chips). DIFFERENT vs
  // CoachTodayCard: eyebrow "Sesiunea de azi" + 3 chips (duration / count /
  // volume) + NO embedded CTA (separate "Incepe antrenament" stays below).
  // Mockup parity andura-clasic.html#L924-932.
  const exerciseCount = workout?.exerciseCount ?? 5;

  return (
    <section className="p-6 bg-paper" data-testid="workout-preview">
      <div
        className="preview-intensity-banner p-3 rounded-xl border mb-4"
        data-intensity={intensityMod}
        role="status"
        aria-label="Intensitate sesiune"
        style={{ background: banner.bg, borderColor: banner.border }}
      >
        <p className="text-base text-ink">{banner.msg}</p>
      </div>
      <div
        className="bg-ink text-paper rounded-2xl p-4 mb-4"
        data-testid="preview-hero"
        role="region"
        aria-label="Sesiunea de azi"
      >
        <div className="text-xs font-semibold tracking-wider uppercase text-brick">
          Sesiunea de azi
        </div>
        <h1 className="text-xl font-bold mt-1 tracking-tight text-paper">{title}</h1>
        <div className="flex gap-3.5 mt-2 text-sm text-ink3">
          <span className="flex items-center gap-1.5" data-testid="preview-duration">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            ~ {duration} min
          </span>
          <span className="flex items-center gap-1.5" data-testid="preview-exercise-count">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            {exerciseCount} exercitii
          </span>
          <span className="flex items-center gap-1.5" data-testid="preview-volume">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            {formatVolume(volume)} kg
          </span>
        </div>
      </div>
      {/* F-workout-preview/T3 — Warmup row. Mockup andura-clasic.html#L935-939
          FIX 1 (2026-05-11) adaptive per main lift + recovery state. Renders
          ONLY cand engine emits warmup blueprint (workout.warmup != null).
          Idiom mirror intensity banner L122-130: flex+items-center+gap+padded
          +rounded+border+bg-paper2 + italic-Lora coach-quote font. */}
      {workout?.warmup && (
        <div
          className="flex items-center gap-2.5 p-3 rounded-xl border border-line bg-paper2 mb-4"
          data-testid="preview-warmup-row"
          role="region"
          aria-label="Incalzire azi"
        >
          <Flame className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
          <span className="coach-quote font-serif italic text-ink2 text-sm flex-1 leading-relaxed">
            {workout.warmup.line}
          </span>
        </div>
      )}
      {/* F-workout-preview/T4 — Exercise list 5 numbered. Mockup parity
          andura-clasic.html#L941-985. Renders engine exercises cand
          available; falls back hardcoded mockup demo cand engine emits
          empty array (defensive — getTodayWorkout returns null for
          rest/halt; this guards sessionBuilder edge case 0 exercises).
          Each row: numbered badge + name + detail (sets/reps) + dumbbell icon. */}
      <div className="settings-section text-xs uppercase tracking-wider text-ink3 font-semibold mb-2">
        Exercitii
      </div>
      <ul
        className="rounded-xl bg-paper2 border border-line divide-y divide-line mb-4"
        data-testid="preview-exercise-list"
      >
        {(workout?.exercises && workout.exercises.length > 0
          ? workout.exercises.map((ex, i) => ({
              key: ex.id,
              name: ex.name,
              detail: `${ex.sets} seturi - ${ex.targetKg} kg - ${ex.targetReps} reps`,
              idx: i,
            }))
          : FALLBACK_EXERCISES.map((ex, i) => ({
              key: `fallback-${i}`,
              name: ex.name,
              detail: ex.detail,
              idx: i,
            }))
        ).map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 p-3"
            data-testid="preview-exercise-row"
          >
            <div className="w-8 h-8 rounded-lg bg-paper border border-line flex items-center justify-center font-mono font-bold text-ink2 text-sm flex-shrink-0">
              {item.idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{item.name}</div>
              <div className="text-xs text-ink3 font-mono mt-0.5">{item.detail}</div>
            </div>
            <Dumbbell className="w-4 h-4 text-ink3 flex-shrink-0" aria-hidden="true" />
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
        Coach-ul ajusteaza in timpul sesiunii daca apare ceva: durere,
        oboseala, set greu. Nu trebuie sa stii dinainte tot.
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
        className="w-full flex items-center justify-center gap-2 py-4 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        <Check className="w-5 h-5" aria-hidden="true" />
        Confirma, incep
      </button>
    </section>
  );
}
