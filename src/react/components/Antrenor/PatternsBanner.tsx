// ══ PATTERNS BANNER — Phase 6 task_06 Option B UI ════════════════════════
// Renders STAGNATION + LOW_ADHERENCE banners din coachDirectorAggregate.
// 2 patterns V1 LOCK per PRIMER §2 MODIFY simplified (3 V2-deferred drop).
// NO_DIACRITICS_RULE wording compliance preserved.

import type { JSX } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import type { PatternBanner } from '../../lib/engineWrappers';

interface PatternsBannerProps {
  banners: readonly PatternBanner[];
}

export function PatternsBanner({ banners }: PatternsBannerProps): JSX.Element | null {
  if (banners.length === 0) return null;
  return (
    <div data-testid="patterns-banner" className="flex flex-col gap-2 mb-4">
      {banners.map((b) => (
        <div
          key={b.id}
          data-pattern-id={b.id}
          data-severity={b.severity}
          role="status"
          aria-live="polite"
          className="flex items-start gap-2.5 p-3 rounded-xl border"
          style={
            b.severity === 'warn'
              ? { background: 'var(--status-neutral-bg)', borderColor: 'var(--status-neutral-border)' }
              : { background: 'var(--paper-2)', borderColor: 'var(--line)' }
          }
        >
          {b.severity === 'warn' ? (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink2" aria-hidden="true" />
          )}
          <p className="text-sm text-ink leading-snug">{b.text}</p>
        </div>
      ))}
    </div>
  );
}
