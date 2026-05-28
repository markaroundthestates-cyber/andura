// ══ PR WALL — Istoric sub-screen (mockup #screen-pr-wall) ════════════════
// Per mockup andura-clasic.html L1241-1335. Full-screen all-time PR list cu
// 3-stat header (Total PR / Luna asta / Exercitii) + chrono-descending list.
//
// Data source: getPRHistoryAll() (existing aggregate, Phase 5 task_11).
// Stats aggregate inline (Total PR = list length; Luna asta = filter ts
// in current month; Exercitii = distinct exerciseId count).
//
// Drill-down per-exercise progres detail = deferred post-Beta (Karpathy SF
// — V1 ships read-only list per recon spec PAR-001).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ChevronRight } from 'lucide-react';
import { getPRHistoryAll } from '../../../lib/prHistoryAggregate';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

// Wave E3 i18n: months pulled from months.short via t() so the format flips
// EN/RO. RO bundle still ships "ian/feb/mai/noi" lower-case (D-LEGACY-064 +
// mockup parity); EN bundle ships "Jan/Feb/May/Nov".
function formatPrDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const month = t(`months.short.${d.getMonth()}`);
  const year = d.getFullYear();
  return t('prDate.format', { day, month, year });
}

export function PrWall(): JSX.Element {
  const navigate = useNavigate();
  const prList = getPRHistoryAll();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthCount = prList.filter((pr) => {
    const d = new Date(pr.sessionTs);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  const distinctExercises = new Set(prList.map((pr) => pr.exerciseId)).size;

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="pr-wall">
      <SubHeader
        title={t('istoric.prWallScreen.title')}
        onBack={() => navigate('/app/istoric')}
        testIdBack="pr-wall-back"
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm text-ink2 mb-4 leading-relaxed">
          {t('istoric.prWallScreen.description')}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-5" data-testid="pr-wall-stats">
          <div className="bg-paper2 border border-line rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-ink font-mono" data-testid="pr-wall-stat-total">
              {prList.length}
            </p>
            <p className="text-xs text-ink2 mt-0.5">{t('istoric.prWallScreen.statTotal')}</p>
          </div>
          <div className="bg-paper2 border border-line rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-ink font-mono" data-testid="pr-wall-stat-month">
              {thisMonthCount}
            </p>
            <p className="text-xs text-ink2 mt-0.5">{t('istoric.prWallScreen.statMonth')}</p>
          </div>
          <div className="bg-paper2 border border-line rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-ink font-mono" data-testid="pr-wall-stat-exercises">
              {distinctExercises}
            </p>
            <p className="text-xs text-ink2 mt-0.5">{t('istoric.prWallScreen.statExercises')}</p>
          </div>
        </div>

        {prList.length === 0 ? (
          /* UX polish 2026-05-28 — accent halo + heading + softer body copy. */
          <div
            className="flex flex-col items-center justify-center py-12 text-center animate-card-rise"
            data-testid="pr-wall-empty"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklab, var(--brick) 18%, transparent), transparent 70%)',
              }}
            >
              <Award className="w-7 h-7 text-brick" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-ink mb-1">
              {t('istoric.prWallScreen.emptyTitle')}
            </p>
            <p className="text-sm text-ink2 max-w-[280px]">
              {t('istoric.prWallScreen.emptyBody')}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" data-testid="pr-wall-list">
            {prList.map((pr, idx) => (
              <li
                key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
                data-testid={`pr-wall-row-${idx}`}
                className="flex items-center gap-3 p-3 bg-paper2 border border-line rounded-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-paper border border-line flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-brick" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{pr.exerciseName}</p>
                  <p className="text-xs text-ink2 font-mono mt-0.5">
                    {t('istoric.prWallScreen.rowLine', {
                      kg: pr.kg,
                      reps: pr.reps,
                      date: formatPrDate(pr.sessionTs),
                    })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink2 flex-shrink-0" strokeWidth={1.6} aria-hidden="true" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
