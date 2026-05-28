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
import { History, Flame, Trophy } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRHistoryAll, getStreakStats } from '../../../lib/prHistoryAggregate';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../../components/Istoric/RatingsStrip90Day';
import { VirtualSessionList } from '../../../components/Istoric/VirtualSessionList';
import { gotoPath } from '../../../lib/navigation';

// §F-istoric-08 — Romanian weekday + month labels no-diacritics manual map.
// Sunday-first index (Date.getDay() returns 0=Sunday). Mockup uses
// lowercase relative weekday (azi/marti/duminica) — preservam consistency
// jos-case per mockup L2162-2178.
const WEEKDAYS_RO = [
  'duminica',
  'luni',
  'marti',
  'miercuri',
  'joi',
  'vineri',
  'sambata',
] as const;

const MONTHS_RO = [
  'ian',
  'feb',
  'mar',
  'apr',
  'mai',
  'iun',
  'iul',
  'aug',
  'sep',
  'oct',
  'noi',
  'dec',
] as const;

function formatDate(ts: number): string {
  const d = new Date(ts);
  const weekday = WEEKDAYS_RO[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_RO[d.getMonth()];
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
      {/* §F-pass4-fontweight-01 (LOW chat5 W17) — title font-weight 600 → 700
          mockup andura-clasic.html#L1157 (font-weight:700). */}
      <h1 className="text-2xl font-bold text-ink mb-6">Istoric</h1>

      {/* Phase 6 task_23: streak stats summary.
          Wave A4 polish (Daniel 2026-05-28) — match Antrenor StatsGrid look:
          radial accent wash anchored top-left, card-rise entrance, stagger
          across the trio. tabular-nums on the hero numbers for consistent
          width. */}
      <div
        className="grid grid-cols-3 gap-2 mb-4"
        data-testid="istoric-stats-grid"
      >
        <div className="relative overflow-hidden bg-paper2 border border-line rounded-xl p-3 text-center animate-card-rise delay-0">
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--brick) 18%, transparent) 0%, transparent 60%)',
            }}
          />
          <Flame className="relative w-4 h-4 text-brick mx-auto mb-1" aria-hidden="true" />
          <p className="relative text-2xl font-bold text-ink font-mono tabular-nums" data-testid="stats-streak">
            {stats.currentStreak}
          </p>
          <p className="relative text-xs text-ink2">Zile consecutive</p>
        </div>
        <div className="relative overflow-hidden bg-paper2 border border-line rounded-xl p-3 text-center animate-card-rise delay-75">
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--olive) 18%, transparent) 0%, transparent 60%)',
            }}
          />
          <History className="relative w-4 h-4 text-brick mx-auto mb-1" aria-hidden="true" />
          <p className="relative text-2xl font-bold text-ink font-mono tabular-nums" data-testid="stats-total">
            {stats.totalSessions}
          </p>
          <p className="relative text-xs text-ink2">Sesiuni total</p>
        </div>
        <div className="relative overflow-hidden bg-paper2 border border-line rounded-xl p-3 text-center animate-card-rise delay-150">
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--warn) 18%, transparent) 0%, transparent 60%)',
            }}
          />
          <Trophy className="relative w-4 h-4 text-brick mx-auto mb-1" aria-hidden="true" />
          <p className="relative text-2xl font-bold text-ink font-mono tabular-nums" data-testid="stats-pr">
            {stats.prCount}
          </p>
          <p className="relative text-xs text-ink2">Recorduri</p>
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
              className="text-sm font-semibold text-brickdark"
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
