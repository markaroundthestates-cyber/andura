// ══ PR NOTIFICATION BANNER — F11 PR Notification Per-PR ═══════════════════
// Per mockup §F11 audit-driven V1 feature.
// Show banner daca workoutStore.prHit true (set ultim sesiunii flag PR).
//
// Phase 3 stub: simple banner cu count. Phase 9 task_09 va detail PR types
// per lastSession history via engineWrappers.getPRDelta.

import type { JSX } from 'react';

interface Props {
  prHit: boolean;
}

export function PRNotificationBanner({ prHit }: Props): JSX.Element | null {
  if (!prHit) return null;
  // Wave A5 polish (Daniel "Top Grade" 2026-05-28) — animate-pop-in so the
  // PR banner "lands with intent" on mount (scale 0.6 -> 1.05 -> 1 over
  // 380ms cubic-bezier(0.34, 1.56, 0.64, 1)). Pair with brick fill so the
  // celebratory moment registers without becoming noisy. Reduced-motion
  // auto-collapses to snap.
  return (
    <div
      className="bg-brick text-paper rounded-lg p-3 mb-4 text-center animate-pop-in"
      role="status"
      aria-live="polite"
      aria-label="PR detectat"
    >
      <div className="font-bold text-sm uppercase tracking-wider">PR sesiunea trecuta</div>
      <div className="text-xs mt-1 opacity-90">Felicitari - record nou.</div>
    </div>
  );
}
