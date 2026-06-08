// ══ BUILD F6b V3 #19 — "real stimulus this week" narration (spec §2c.1) ══════
// Raw set count alone hides whether a user is actually pushing close to failure
// (where hypertrophy lives) or padding the log with everything-in-reserve sets.
// summarizeStimulus weights each logged set by proximity-to-failure via the
// existing RATING_TO_RIR (effectiveReps.js) and exposes the EQUIVALENT number of
// full to-failure working sets. The narration contrasts that "stimulus set"
// count with the raw set count over the last 7 days.
//
// READ-ONLY — pure read of sessionsHistory rows (w/reps/rating); no prescription
// change, no DB write, no new persistence. Mirrors GoalForecastBlock's null-render
// discipline: nothing honest to show → render nothing (no empty card). The whole
// block is gated on dp_effective_reps_v1 — flag OFF → returns null → byte-
// identical Progres.

import type { JSX } from 'react';
import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { isEnabled } from '../../../util/featureFlags.js';
import { summarizeStimulus } from '../../../engine/dp/effectiveReps.js';
import { t } from '../../../i18n/index.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// Below this many raw working sets in the window there isn't enough signal to
// narrate honestly — stay silent (mirrors GoalForecast's >=3-session guard).
const MIN_SETS_TO_NARRATE = 6;

export function StimulusBlock(): JSX.Element | null {
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);

  const summary = useMemo(() => {
    if (!isEnabled('dp_effective_reps_v1')) return null;
    const cutoff = Date.now() - WEEK_MS;
    const sets: Array<{ reps?: number; rating?: string }> = [];
    for (const sess of sessionsHistory) {
      if (!sess || sess.ts < cutoff || !sess.exercises) continue;
      for (const ex of sess.exercises) {
        for (const st of ex.sets) sets.push({ reps: st.reps, rating: st.rating });
      }
    }
    if (sets.length < MIN_SETS_TO_NARRATE) return null;
    return summarizeStimulus(sets);
  }, [sessionsHistory]);

  if (summary === null) return null;

  // stimulusSets is the equivalent full-to-failure working-set count; rawSets is
  // what a naive counter shows. The gap = junk volume the user is logging.
  const stimulusLabel = summary.stimulusSets.toLocaleString('ro-RO', {
    maximumFractionDigits: 1,
  });

  return (
    <section
      data-testid="stimulus-block"
      className="pulse-card pulse-card-tight p-4 mb-4"
      aria-label={t('progres.stimulus.heading')}
    >
      <div className="flex items-start gap-4">
        <Flame className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
            {t('progres.stimulus.heading')}
          </p>
          <p className="text-base font-semibold text-ink" data-testid="stimulus-block-line">
            {t('progres.stimulus.line', {
              stimulus: stimulusLabel,
              raw: summary.rawSets,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
