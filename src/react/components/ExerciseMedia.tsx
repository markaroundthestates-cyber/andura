// ══ EXERCISE MEDIA — Visual guidance tile (Daniel 2026-05-28 #11) ═════════
// Renders a movement image/gif/video for an exercise, or a tasteful muscle-
// group placeholder when the asset is not yet sourced.
//
// Daniel smoke 2026-05-28: "vreau sa adaugam si poze sau gif-uri la fiecare
// exercitiu pentru visual guidance". V1 = pipeline foundation: this component
// handles the rendering surface, the placeholder design, and the loading/
// error states. The asset SOURCING (WGER vs Lottie vs custom) is Daniel-
// gated V2 work — see ../lib/exerciseMedia.ts header.
//
// Variants:
//   - 'thumbnail' — 48x48 round tile for list rows (WorkoutPreview exercise
//     list). Compact, glance-able.
//   - 'card' — full-width 16:9 panel for the workout-in-progress hero (the
//     primary "show me the movement" surface where Gigel needs guidance
//     RIGHT NOW between sets).
//   - 'compact' — 64x64 rounded square for mid-density lists (Library tab
//     V2, exercise detail screens).
//
// Placeholder design (when media absent):
//   - Variant 'thumbnail' / 'compact': muscle-group Dumbbell icon centered on
//     a soft paper2 surface with a subtle accent ring (matches StatsGrid
//     card-rise polish so the placeholder feels intentional, not "broken").
//   - Variant 'card': larger Dumbbell + "Imagine in curand" label so users
//     know media is incoming (not a permanent gap). Honest copy, no fake
//     loading spinner.
//
// Reduced-motion: GIFs by definition animate; we honor the global a11y by
// respecting `prefers-reduced-motion` and swapping the GIF for the still
// poster (when one is provided via mediaPoster prop — V2 enhancement;
// for V1, GIFs render as-is since the demo set is image/lottie not GIF).

import type { JSX } from 'react';
import { Dumbbell } from 'lucide-react';
import { getExerciseMedia, getExerciseMediaAlt } from '../lib/exerciseMedia';
import { t } from '../../i18n/index.js';

export type ExerciseMediaVariant = 'thumbnail' | 'compact' | 'card';

interface ExerciseMediaProps {
  /** Engine canonical name (English ID — same key as exerciseDisplay/library). */
  engineName: string;
  /** Visual variant — see file header. Default 'thumbnail'. */
  variant?: ExerciseMediaVariant;
  /** Optional className passthrough for layout tweaks (margins). */
  className?: string;
  /** testid prefix override — defaults to 'exercise-media'. */
  testId?: string;
}

const VARIANT_CLASSES: Readonly<Record<ExerciseMediaVariant, string>> = {
  thumbnail: 'w-12 h-12 rounded-full',
  compact: 'w-16 h-16 rounded-xl',
  card: 'w-full aspect-video rounded-2xl',
};

const ICON_SIZE_BY_VARIANT: Readonly<Record<ExerciseMediaVariant, number>> = {
  thumbnail: 20,
  compact: 24,
  card: 48,
};

export function ExerciseMedia({
  engineName,
  variant = 'thumbnail',
  className = '',
  testId = 'exercise-media',
}: ExerciseMediaProps): JSX.Element {
  const media = getExerciseMedia(engineName);
  const alt = getExerciseMediaAlt(engineName);
  const sizeClass = VARIANT_CLASSES[variant];
  const isCard = variant === 'card';

  if (!media) {
    // Placeholder — muscle-group icon on accent-washed paper2 surface. The
    // radial wash (top-left, brick accent at 12%) matches the StatsGrid
    // polish, so the placeholder reads as intentional design, not a broken
    // image. "Imagine in curand" label only on the card variant where there
    // is room and the user is mid-set; smaller variants stay icon-only.
    // Pulse arc 2026-05-29 (blueprint C3) — the card-variant placeholder picks
    // up the mockup's .ex-media diagonal-hatch fill + a token-tinted "Coming
    // soon" badge so the demo surface reads as intentional craft, not a gap.
    // Smaller variants keep the soft radial wash (StatsGrid polish). Icon /
    // role / aria-label / testids unchanged (consumed by WorkoutPreview rows +
    // the flow agent), so this is a pure skin swap.
    const placeholderBg = isCard
      ? 'repeating-linear-gradient(135deg, var(--paper) 0 11px, var(--paper2) 11px 22px)'
      : 'radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--brick) 14%, transparent) 0%, transparent 60%)';
    return (
      <div
        className={`relative overflow-hidden bg-paper2 border border-line flex flex-col items-center justify-center ${sizeClass} ${className}`}
        data-testid={`${testId}-placeholder`}
        data-variant={variant}
        role="img"
        aria-label={alt}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: placeholderBg }}
        />
        <Dumbbell
          aria-hidden="true"
          className="relative text-ink3"
          size={ICON_SIZE_BY_VARIANT[variant]}
        />
        {isCard && (
          <span
            className="relative mt-2.5 font-mono text-[9px] uppercase tracking-[0.1em] font-medium px-2.5 py-1 rounded-full"
            style={{
              color: 'var(--brick)',
              background: 'color-mix(in oklab, var(--brick) 12%, transparent)',
              border: '1px solid color-mix(in oklab, var(--brick) 32%, transparent)',
            }}
          >
            {t('common.imageSoon')}
          </span>
        )}
      </div>
    );
  }

  // Live media — image/gif via <img>; video via <video>; lottie deferred V2
  // (would require a player dep; the pipeline supports the type so future
  // assets land without API churn).
  if (media.type === 'video') {
    return (
      <video
        className={`object-cover ${sizeClass} ${className}`}
        data-testid={testId}
        data-variant={variant}
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
      />
    );
  }

  return (
    <img
      className={`object-cover ${sizeClass} ${className}`}
      data-testid={testId}
      data-variant={variant}
      src={media.url}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
