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
import { useState } from 'react';
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

  // Founder UX 2026-06-06 — the demo box used to expand to an empty dark panel
  // for ~2s while the image/video downloaded (looks broken). A shimmer skeleton
  // now fills the frame until the media's load event fires, then fades out. One
  // flag covers all media branches (single img, dual-frame card, video). For the
  // dual-frame card both images must load before the skeleton clears.
  const [mediaLoaded, setMediaLoaded] = useState(false);
  // dual-frame card counts loaded frames via the updater closure; the value
  // itself is never read, so it stays out of the destructure (no unused var).
  const [, setFramesLoaded] = useState(0);

  // Shimmer overlay shown over a media frame until it finishes loading. Absolute,
  // pointer-events-none, fades out on load so it never blocks interaction.
  const skeleton = !mediaLoaded ? (
    <span
      aria-hidden="true"
      data-testid={`${testId}-skeleton`}
      className="absolute inset-0 bg-paper2 animate-shimmer pointer-events-none"
    />
  ) : null;

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
      <div className={`relative overflow-hidden ${sizeClass} ${className}`} data-variant={variant}>
        {skeleton}
        <video
          className="w-full h-full object-cover"
          data-testid={testId}
          data-variant={variant}
          src={media.url}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
          onLoadedData={() => setMediaLoaded(true)}
          // Clear the skeleton on a failed video load too (mirror the <img>
          // branches) so a broken URL never leaves the shimmer up forever.
          onError={() => setMediaLoaded(true)}
        />
      </div>
    );
  }

  // Card variant with two frames: show start + end of the movement side by side
  // (free-db ships 0.jpg + 1.jpg = the two key positions) so a beginner sees the
  // full range, not a single ambiguous still. Smaller variants stay single-image.
  if (isCard && media.url2) {
    const onFrameLoad = (): void =>
      setFramesLoaded((n) => {
        const next = n + 1;
        if (next >= 2) setMediaLoaded(true);
        return next;
      });
    return (
      <div
        className={`relative grid grid-cols-2 gap-1 overflow-hidden ${sizeClass} ${className}`}
        data-testid={testId}
        data-variant={variant}
        role="img"
        aria-label={alt}
      >
        {skeleton}
        <img className="w-full h-full object-cover" src={media.url} alt={`${alt} (1)`} loading="lazy" decoding="async" onLoad={onFrameLoad} onError={onFrameLoad} />
        <img className="w-full h-full object-cover" src={media.url2} alt={`${alt} (2)`} loading="lazy" decoding="async" onLoad={onFrameLoad} onError={onFrameLoad} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${sizeClass} ${className}`} data-variant={variant}>
      {skeleton}
      <img
        className="w-full h-full object-cover"
        data-testid={testId}
        data-variant={variant}
        src={media.url}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setMediaLoaded(true)}
        onError={() => setMediaLoaded(true)}
      />
    </div>
  );
}
