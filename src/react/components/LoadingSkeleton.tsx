// ══ LOADING SKELETON — Phase 5 task_19 Suspense Fallback ═════════════════
// Simple skeleton pulse pentru route-level Suspense fallback (lazy code-
// split future Phase 6+). Mobile-first responsive max-width 380px.

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
      <div className="h-7 w-32 bg-paper2 rounded-md animate-pulse mb-6" />
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            data-testid={`skeleton-line-${i}`}
            className="h-16 bg-paper2 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
