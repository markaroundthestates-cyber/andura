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
import { useNavigate, useLocation } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { coachPick } from '../../../lib/coachVoice';
import { getTodayWorkout } from '../../../lib/engineWrappers';
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
      bg: '#e7f0e2',
      border: '#bdd9b3',
      msg: 'Coach urca intensitatea +15%. Mai grele cu o haltera, 1 rep in plus.',
    };
  }
  if (intensityMod === 'minus') {
    return {
      bg: '#fbe3df',
      border: '#e8b2a8',
      msg: 'Coach reduce intensitatea -20%. Mai usor azi, focus pe forma.',
    };
  }
  return {
    bg: '#fdf3df',
    border: '#e8d59a',
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

  // Phase 4 task_10: wire planned workout aggregate cand disponibil; duration
  // + volume estimates scaled per intensityMod (baseline din planned, scaled
  // -20% pe minus / +15% pe plus consistent cu D-LEGACY-021 Energy Adjustment).
  const workout = getTodayWorkout();
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

  return (
    <section className="p-6 bg-paper" data-testid="workout-preview">
      <h1 className="text-2xl font-semibold text-ink mb-2">{title}</h1>
      <div
        className="preview-intensity-banner p-3 rounded-xl border mb-6"
        data-intensity={intensityMod}
        role="status"
        aria-label="Intensitate sesiune"
        style={{ background: banner.bg, borderColor: banner.border }}
      >
        <p className="text-base text-ink">{banner.msg}</p>
      </div>
      <div className="flex gap-3 mb-6">
        <div
          className="flex-1 p-4 rounded-xl bg-paper2 border border-line"
          data-testid="preview-duration"
        >
          <p className="text-sm text-ink2">Durata estimata</p>
          <p className="text-2xl font-semibold text-ink">~ {duration} min</p>
        </div>
        <div
          className="flex-1 p-4 rounded-xl bg-paper2 border border-line"
          data-testid="preview-volume"
        >
          <p className="text-sm text-ink2">Tonaj total</p>
          <p className="text-2xl font-semibold text-ink">{formatVolume(volume)} kg</p>
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
