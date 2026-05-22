// ══ READINESS VERDICT — F4 Pre-Session Core Coach Value ═══════════════════
// Per mockup §F4 audit-driven V1 feature.
// Show readiness label + score + volume modifier hint.
//
// Returns null daca readiness null (NU log readiness astazi).

import type { JSX } from 'react';
import type { ReadinessOutput } from '../../lib/engineWrappers';

interface Props {
  readiness: ReadinessOutput | null;
}

export function ReadinessVerdict({ readiness }: Props): JSX.Element | null {
  if (!readiness) return null;
  return (
    <div
      className="text-sm text-ink2 mb-4 text-center"
      role="status"
      aria-live="polite"
      aria-label="Verdict readiness"
    >
      <span className="font-semibold" style={{ color: readiness.color }}>
        {readiness.label}
      </span>
      {' '}
      <span className="text-ink2">
        ({readiness.score}/100
        {readiness.canPR ? ' - poti incerca PR' : ''})
      </span>
    </div>
  );
}
