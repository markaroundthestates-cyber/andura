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
  return (
    <div
      className="bg-brick text-paper rounded-lg p-3 mb-4 text-center"
      role="status"
      aria-live="polite"
      aria-label="PR detectat"
    >
      <div className="font-bold text-sm uppercase tracking-wider">PR sesiunea trecuta</div>
      <div className="text-xs mt-1 opacity-90">Felicitari - record nou.</div>
    </div>
  );
}
