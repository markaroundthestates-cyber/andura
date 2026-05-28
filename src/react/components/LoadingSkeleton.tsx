// ══ LOADING SKELETON — Phase 5 task_19 Suspense Fallback ═════════════════
// Mobile-first responsive max-width 380px.
//
// Wave A4 (Daniel 2026-05-28) — replaced flat .animate-pulse (full-tile
// opacity blink → reads as "is the app frozen?") with a directional
// .animate-shimmer sweep (gradient pass left-to-right → reads as "we're
// fetching"). The shimmer sits on top of the paper2 tile base via
// background-image, so the tile keeps its color identity. Reduced-motion
// users see the static tile (one shimmer pass settles to mid).

import type { JSX } from 'react';

interface LoadingSkeletonProps {
  /** Optional pulse line count (default 3). */
  lines?: number;
  /** Test id override pentru consumer-specific identification. */
  testId?: string;
}

export function LoadingSkeleton({
  lines = 3,
  testId = 'loading-skeleton',
}: LoadingSkeletonProps): JSX.Element {
  return (
    <section
      className="min-h-screen bg-paper p-6"
      data-testid={testId}
      aria-busy="true"
      aria-label="Se incarca"
    >
      <div className="h-7 w-32 bg-paper2 rounded-md animate-shimmer mb-6" />
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            data-testid={`skeleton-line-${i}`}
            className="h-16 bg-paper2 rounded-xl animate-shimmer"
          />
        ))}
      </div>
    </section>
  );
}
