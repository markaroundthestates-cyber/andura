// ══ READINESS VERDICT — F4 Pre-Session Core Coach Value ═══════════════════
// Per mockup §F4 audit-driven V1 feature.
// Show the qualitative readiness band (label) as the primary signal + the
// optional PR-day suffix. The raw NN/100 score is intentionally NOT surfaced
// here — Gigel reads "Zi de PR" / "Sesiune normala", not a bare number.
//
// Returns null daca readiness null (NU log readiness astazi).

import type { JSX } from 'react';
import type { ReadinessOutput } from '../../lib/engineWrappers';
import { t } from '../../../i18n/index.js';

interface Props {
  readiness: ReadinessOutput | null;
}

export function ReadinessVerdict({ readiness }: Props): JSX.Element | null {
  if (!readiness) return null;
  // Wave E4 — resolve the verdict label via the engine's semantic `key` so
  // EN surfaces "Normal session" / "Light session" / etc. Fall back to the
  // engine's RO label when the key is missing (defensive — engine guarantees
  // a key in the post-Wave-E4 shape but old persisted shapes may not).
  const i18nLabelKey = readiness.key
    ? `coachEngine.readiness.labels.${readiness.key}`
    : null;
  const resolvedLabel = i18nLabelKey
    ? (() => {
        const v = t(i18nLabelKey);
        return v && v !== i18nLabelKey ? v : readiness.label;
      })()
    : readiness.label;
  return (
    <div
      className="text-sm text-ink2"
      role="status"
      aria-live="polite"
      aria-label={t('readinessVerdictWidget.ariaLabel')}
    >
      <span
        className="font-display text-lg font-bold block"
        style={{ color: readiness.color }}
      >
        {resolvedLabel}
      </span>
      {readiness.canPR ? (
        <span className="text-ink2">
          {t('coachEngine.readiness.canPrSuffix')}
        </span>
      ) : null}
    </div>
  );
}
