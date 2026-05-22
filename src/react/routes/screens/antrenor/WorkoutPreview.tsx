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
import { Clock, Layers, TrendingUp } from 'lucide-react';
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
      {coachLine && (
        <p
          className="coach-quote text-base text-ink2 italic font-serif mb-6"
          data-testid="preview-coach-line"
        >
          „{coachLine}"
        </p>
      )}
      <button
        type="button"
        onClick={handleStart}
        className="w-full py-4 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        Incepe antrenament
      </button>
    </section>
  );
}
