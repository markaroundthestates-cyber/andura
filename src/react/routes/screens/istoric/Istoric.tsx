// ══ ISTORIC — Tab 3 of 4 Phase 5 task_21 + Phase 6 task_23 Enrich ════════
// Phase 5 MVP: list past sessions reverse chrono + empty state.
// Phase 6 task_23: streak stats summary card + PR Wall full list +
// existing list preserved. Drill-down navigate /app/istoric/:sessionId
// (IstoricDetail Phase 5 task_03 LANDED).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ChevronRight, Flame, Trophy } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRHistoryAll, getStreakStats } from '../../../lib/prHistoryAggregate';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../../components/Istoric/RatingsStrip90Day';
import { gotoPath } from '../../../lib/navigation';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
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
      <h1 className="text-2xl font-semibold text-ink mb-6">Istoric</h1>

      {/* Phase 6 task_23: streak stats summary */}
      <div
        className="grid grid-cols-3 gap-2 mb-4"
        data-testid="istoric-stats-grid"
      >
        <div className="bg-paper2 border border-line rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-brick mx-auto mb-1" aria-hidden="true" />
          <p className="text-2xl font-bold text-ink font-mono" data-testid="stats-streak">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-ink2">Streak</p>
        </div>
        <div className="bg-paper2 border border-line rounded-xl p-3 text-center">
          <History className="w-4 h-4 text-brick mx-auto mb-1" aria-hidden="true" />
          <p className="text-2xl font-bold text-ink font-mono" data-testid="stats-total">
            {stats.totalSessions}
          </p>
          <p className="text-xs text-ink2">Sesiuni</p>
        </div>
        <div className="bg-paper2 border border-line rounded-xl p-3 text-center">
          <Trophy className="w-4 h-4 text-brick mx-auto mb-1" aria-hidden="true" />
          <p className="text-2xl font-bold text-ink font-mono" data-testid="stats-pr">
            {stats.prCount}
          </p>
          <p className="text-xs text-ink2">PR-uri</p>
        </div>
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
              <Trophy className="w-4 h-4" aria-hidden="true" />
              Recorduri ({prHistory.length})
            </h2>
            <button
              type="button"
              onClick={() => navigate(gotoPath('pr-wall'))}
              data-testid="istoric-pr-wall-see-all"
              className="text-sm font-semibold text-brick"
            >
              Vezi toate
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {prHistory.map((pr, idx) => (
              <li
                key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
                data-testid={`pr-row-${idx}`}
                className="flex justify-between items-center p-3 rounded-xl bg-paper2 border border-line"
              >
                <span className="text-sm font-medium text-ink">{pr.exerciseName}</span>
                <span className="text-sm text-ink2">
                  {pr.kg} kg x {pr.reps} (~{pr.oneRMEstimate} kg 1RM)
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="text-base font-semibold text-ink mb-2">Sesiuni</h2>
      {sorted.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-testid="istoric-empty"
        >
          <History className="w-12 h-12 text-ink2 mb-3" aria-hidden="true" />
          <p className="text-base text-ink2">
            Nu ai antrenamente inca. Prima sesiune apare aici dupa ce o termini.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="list" data-testid="istoric-list">
          {sorted.map((session, idx) => {
            // Find original index în sessionsHistory pentru detail navigate.
            const originalIdx = sessionsHistory.findIndex((s) => s.ts === session.ts);
            return (
              <li key={`${session.ts}-${idx}`}>
                <button
                  type="button"
                  onClick={() => navigate(`/app/istoric/${originalIdx}`)}
                  data-testid={`istoric-session-${idx}`}
                  data-session-idx={originalIdx}
                  className="w-full flex items-center gap-3 p-4 bg-paper2 border border-line rounded-xl text-left"
                >
                  <History className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink2 uppercase tracking-wide font-semibold">
                      {formatDate(session.ts)}
                    </p>
                    <p className="text-base font-semibold text-ink mt-0.5">
                      {session.title}
                    </p>
                    <p className="text-sm text-ink2 mt-0.5">{session.meta}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-ink2 flex-shrink-0" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
