// ══ ISTORIC — Tab 3 of 4 Phase 5 task_21 + Phase 6 task_23 Enrich ════════
// Phase 5 MVP: list past sessions reverse chrono + empty state.
// Phase 6 task_23: streak stats summary card + PR Wall full list +
// existing list preserved. Drill-down navigate /app/istoric/:sessionId
// (IstoricDetail Phase 5 task_03 LANDED).
//
// §F-istoric-08 (LOW chat5 Wave 14) — date format Romanian weekday no-diacritics
// per mockup andura-clasic.html#L2162-2178 (azi/marti/duminica/vineri/miercuri).
// Manual weekday + month map (NU Intl.DateTimeFormat — locale ICU emite
// diacritice marti/sambata violand D-LEGACY-064). Format "<Weekday> · <DD>
// <mon>" pentru cititor casnic; numeric DD.MM.YYYY retras (jargon-numeric).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Flame, Trophy, type LucideIcon } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRHistoryAll, getStreakStats } from '../../../lib/prHistoryAggregate';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../../components/Istoric/RatingsStrip90Day';
import { VirtualSessionList } from '../../../components/Istoric/VirtualSessionList';
import { useCountUp } from '../../../hooks/useCountUp';
import { Kicker } from '../../../components/pulse/Kicker';
import { gotoPath } from '../../../lib/navigation';
import { t } from '../../../../i18n/index.js';

// §F-istoric-08 — weekday + month labels via i18n bundle.
// Wave E3 (2026-05-28): pulled from weekdays.relativeShort + months.short so
// the label flips locale per Daniel mandate. RO surfaces lower-case
// "luni/marti" (mockup parity L2162-2178, no-diacritics per D-LEGACY-064).
// EN surfaces "Mon/Tue".
function formatDate(ts: number): string {
  const d = new Date(ts);
  const dow = d.getDay();
  const weekday = t(`weekdays.relativeShort.${dow}`);
  const day = d.getDate();
  const month = t(`months.short.${d.getMonth()}`);
  return `${weekday} · ${day} ${month}`;
}

export function Istoric(): JSX.Element {
  const navigate = useNavigate();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // Subscribe to streak prin selector pentru re-render on change
  useWorkoutStore((s) => s.streak);

  // Reverse-chrono UI iteration (newest first).
  const sorted = [...sessionsHistory].sort((a, b) => b.ts - a.ts);

  // Phase 6 task_23 enrich aggregates
  const stats = getStreakStats();
  const prHistory = getPRHistoryAll();

  return (
    <section
      className="p-6 bg-paper min-h-screen"
      data-testid="istoric-home"
    >
      {/* Pulse reskin (2026-05-29 GROUP E) — display font wordmark heading. */}
      <h1 className="font-display text-[30px] font-bold text-ink mb-4">{t('tabs.istoric.title')}</h1>

      {/* Phase 6 task_23: streak stats summary. Pulse reskin (GROUP E) — the
          mockup tints each tile with its own accent (streak=volt, sessions=aqua,
          records=ember) + animated count-up. Radial accent wash anchored top,
          card-rise entrance staggered across the trio, tabular-nums hero number. */}
      <div
        className="grid grid-cols-3 gap-2.5 mb-4"
        data-testid="istoric-stats-grid"
      >
        <HistStat
          icon={Flame}
          color="var(--volt)"
          value={stats.currentStreak}
          label={t('istoric.landing.statDaysStreak')}
          testId="stats-streak"
          delayCls="delay-0"
        />
        <HistStat
          icon={History}
          color="var(--aqua)"
          value={stats.totalSessions}
          label={t('istoric.landing.statTotalSessions')}
          testId="stats-total"
          delayCls="delay-75"
        />
        <HistStat
          icon={Trophy}
          color="var(--ember)"
          value={stats.prCount}
          label={t('istoric.landing.statRecords')}
          testId="stats-pr"
          delayCls="delay-150"
        />
      </div>

      {/* F-istoric-01 signature: month-navigable calendar heatmap */}
      <CalendarHeatmap />

      {/* F-istoric-03 signature: 90-day ratings strip + categorical aggregate */}
      <RatingsStrip90Day />

      {/* Phase 6 task_23: PR Wall full list. PAR-001 Wave 2e — "Vezi toate"
          link drill la /app/istoric/pr-wall standalone screen. */}
      {prHistory.length > 0 && (
        <section className="mb-6" data-testid="istoric-pr-wall">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-ink flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: 'var(--ember)' }} aria-hidden="true" />
              {t('istoric.landing.recordsHeading', { n: prHistory.length })}
            </h2>
            <button
              type="button"
              onClick={() => navigate(gotoPath('pr-wall'))}
              data-testid="istoric-pr-wall-see-all"
              className="text-sm font-semibold text-brickdark press-feedback"
            >
              {t('istoric.landing.seeAll')}
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {prHistory.map((pr, idx) => (
              <li
                key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
                data-testid={`pr-row-${idx}`}
                className="flex justify-between items-center p-3 rounded-2xl bg-paper2 border border-line"
              >
                <span className="text-sm font-medium text-ink">{pr.exerciseName}</span>
                <span className="font-mono text-[13px] text-ink2">
                  {t('istoric.landing.recordSummary', { kg: pr.kg, reps: pr.reps, oneRM: pr.oneRMEstimate })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-3">
        <Kicker>{t('istoric.landing.sessionsHeading')}</Kicker>
      </div>
      {sorted.length === 0 ? (
        /* UX polish 2026-05-28 — empty state lifted: accent-tinted icon
           halo (color-mix --brick) + heading line + softer body copy +
           tasteful card-rise on mount. Reads as "we've got space waiting
           for your first session" rather than a flat error message. */
        <div
          className="flex flex-col items-center justify-center py-12 text-center animate-card-rise"
          data-testid="istoric-empty"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background:
                'radial-gradient(circle, color-mix(in oklab, var(--brick) 18%, transparent), transparent 70%)',
            }}
          >
            <History className="w-7 h-7 text-brick" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-ink mb-1">
            {t('istoric.landing.emptyTitle')}
          </p>
          <p className="text-sm text-ink2 max-w-[280px]">
            {t('istoric.landing.emptyBody')}
          </p>
        </div>
      ) : (
        // §35-M2 perf — windowed list (window-scroll virtualization) pentru
        // liste lungi. Comportament vizibil identic: ordering, drill-down nav
        // la originalIdx, testid-uri rand neschimbate.
        <VirtualSessionList
          sorted={sorted}
          sessionsHistory={sessionsHistory}
          formatDate={formatDate}
          onSelect={(originalIdx) => navigate(`/app/istoric/${originalIdx}`)}
        />
      )}
    </section>
  );
}

// Pulse stat tile (GROUP E reskin) — accent-tinted radial wash + colored icon +
// animated count-up hero number + label. One per streak/sessions/records. The
// count-up snaps to the final value under reduced motion / in tests (useCountUp).
function HistStat({
  icon: Icon,
  color,
  value,
  label,
  testId,
  delayCls,
}: {
  icon: LucideIcon;
  color: string;
  value: number;
  label: string;
  testId: string;
  delayCls: string;
}): JSX.Element {
  const display = useCountUp(value);
  return (
    <div
      className={`relative overflow-hidden bg-paper2 border border-line rounded-xl px-2 py-4 text-center animate-card-rise ${delayCls}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, color-mix(in oklab, ${color} 16%, transparent) 0%, transparent 65%)`,
        }}
      />
      <Icon className="relative w-[18px] h-[18px] mx-auto mb-1.5" style={{ color }} aria-hidden="true" />
      <p className="relative font-display text-2xl font-bold text-ink tabular-nums" data-testid={testId}>
        {display}
      </p>
      <p className="relative text-[11px] text-ink2 mt-0.5">{label}</p>
    </div>
  );
}
