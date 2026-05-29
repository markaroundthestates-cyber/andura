// ══ PR WALL RECENT — Phase 6 task_06 Antrenor home slice top 3 ════════════
// Renders top-3 most-recent PR records din coachDirectorAggregate.prWallRecent.
// Phase 5 task_11 PR history aggregate consume — sessionsHistory walk extracts
// set.isPR markers per workoutStore SessionExerciseBreakdown schema.

import type { JSX } from 'react';
import { Trophy } from 'lucide-react';
import type { PRRecord } from '../../lib/prHistoryAggregate';
import { t } from '../../../i18n/index.js';

interface PRWallRecentProps {
  records: readonly PRRecord[];
}

export function PRWallRecent({ records }: PRWallRecentProps): JSX.Element | null {
  if (records.length === 0) return null;
  return (
    <section data-testid="pr-wall-recent" className="mb-4">
      <h2 className="font-display text-base font-bold text-ink mb-2 flex items-center gap-2">
        <Trophy className="w-4 h-4" style={{ color: 'var(--volt)' }} aria-hidden="true" />
        {t('istoric.prWall.title')}
      </h2>
      <ul className="flex flex-col gap-2">
        {records.map((pr, idx) => (
          <li
            key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
            data-testid={`pr-record-${idx}`}
            className="pulse-card pulse-card-tight flex justify-between items-center p-3"
          >
            <span className="text-sm font-medium text-ink">{pr.exerciseName}</span>
            <span className="text-sm text-ink2">
              {t('istoric.landing.recordSummary', { kg: pr.kg, reps: pr.reps, oneRM: pr.oneRMEstimate })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
