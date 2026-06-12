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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Flame, Trophy, ChevronDown, type LucideIcon } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { getPRHistoryAll, getStreakStats } from '../../../lib/prHistoryAggregate';
import { CalendarHeatmap } from '../../../components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../../components/Istoric/RatingsStrip90Day';
import { VirtualSessionList } from '../../../components/Istoric/VirtualSessionList';
import { useCountUp } from '../../../hooks/useCountUp';
import { t } from '../../../../i18n/index.js';

// §F-istoric-08 — weekday + month labels via i18n bundle.
// Wave E3 (2026-05-28): pulled from weekdays.relativeShort + months.short so
// the label flips locale per Daniel mandate. RO surfaces lower-case
// "luni/marti" (mockup parity L2162-2178, no-diacritics per D-LEGACY-064).
// EN surfaces "Mon/Tue".
function formatDate(ts: number): string {
  // Guard: ts lipsa / NaN / Invalid Date → em-dash, NU cheia i18n literala
  // ("weekdays.relativeShort.NaN") sau "NaN". Inregistrarile fara ts numeric
  // pot intra via sync cloud (storeMerge nu coerce ts) — degrade silentios.
  if (!Number.isFinite(ts)) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
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

  // Founder UX 2026-06-06 — which record row is expanded (collapsed by default
  // so the records list stays compact). Single-open accordion; null = all closed.
  const [openRecord, setOpenRecord] = useState<number | null>(null);

  // Founder UX 2026-06-07 — both lists preview the first 3 rows + a "Show all"
  // expand, so a long history reads as a short preview, not a wall of pages.
  const LIST_PREVIEW = 3;
  const [showAllRecords, setShowAllRecords] = useState(false);
  const visiblePr =
    showAllRecords || prHistory.length <= LIST_PREVIEW
      ? prHistory
      : prHistory.slice(0, LIST_PREVIEW);

  // IA change 2026-06-12 (Daniel live) — the separate Records + Sessions sections
  // collapse into ONE segmented view: a single control toggles between the records
  // body and the sessions body (the dashboard header — stats + calendar + ratings —
  // stays shared above both). Default 'sessions' (the chronological log is the
  // primary "history" read; records are one tap away). The standalone /app/istoric/
  // pr-wall route is preserved for deep-links, but the in-screen segment is now the
  // primary path to records (the old "See all" jump is gone — redundant).
  const [tab, setTab] = useState<'sessions' | 'records'>('sessions');

  return (
    <section
      className="p-6 min-h-screen"
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

      {/* IA change 2026-06-12 (Daniel live) — ONE segmented control replaces the
          two separate Records + Sessions sections. The dashboard header above
          (stats + calendar + ratings) is shared; this control switches the body
          between the records list and the sessions list. Pulse pill-group idiom
          (same as WeightTimeline range tabs): active fills with --volt. */}
      <div
        className="flex gap-1 p-1 rounded-full border border-line bg-[var(--surface-2)] mb-4"
        role="tablist"
        aria-label={t('istoric.landing.segAriaLabel')}
        data-testid="istoric-segment"
      >
        {(['sessions', 'records'] as const).map((seg) => {
          const active = tab === seg;
          return (
            <button
              key={seg}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`istoric-segment-${seg}`}
              onClick={() => setTab(seg)}
              className={`flex-1 py-2 rounded-full text-xs font-semibold font-mono transition-colors ${
                active ? 'text-[var(--on-accent)]' : 'text-ink2'
              }`}
              style={active ? { background: 'var(--volt)' } : undefined}
            >
              {t(seg === 'sessions' ? 'istoric.landing.segSessions' : 'istoric.landing.segRecords')}
            </button>
          );
        })}
      </div>

      {/* ── RECORDS segment — reuses the PR list body (getPRHistoryAll). The old
          standalone /pr-wall jump ("See all") is gone; this IS the records view.
          Empty-state mirrors the sessions empty pattern. */}
      {tab === 'records' && (
        <section className="mb-6" data-testid="istoric-pr-wall">
          {prHistory.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center animate-card-rise"
              data-testid="istoric-records-empty"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in oklab, var(--brick) 18%, transparent), transparent 70%)',
                }}
              >
                <Trophy className="w-7 h-7 text-brick" aria-hidden="true" />
              </div>
              <p className="text-base font-semibold text-ink mb-1">
                {t('istoric.prWallScreen.emptyTitle')}
              </p>
              <p className="text-sm text-ink2 max-w-[280px]">
                {t('istoric.prWallScreen.emptyBody')}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <Trophy className="w-4 h-4" style={{ color: 'var(--ember)' }} aria-hidden="true" />
                  {t('istoric.landing.recordsHeading', { n: prHistory.length })}
                </h2>
              </div>
              {/* Founder UX 2026-06-06 — records are COLLAPSED by default: each row
                  shows just the exercise name + a chevron, so a 10+ record wall no
                  longer makes the page endless. Tapping a row reveals its detail
                  (kg x reps ~1RM). All data stays accessible, just one tap deeper. */}
              <ul className="flex flex-col gap-2">
                {visiblePr.map((pr, idx) => {
                  const open = openRecord === idx;
                  return (
                    <li
                      key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
                      data-testid={`pr-row-${idx}`}
                      className="pulse-card pulse-card-tight overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenRecord(open ? null : idx)}
                        data-testid={`pr-row-toggle-${idx}`}
                        aria-expanded={open}
                        className="w-full flex justify-between items-center gap-2 p-3 text-left"
                      >
                        <span className="text-sm font-medium text-ink truncate">{pr.exerciseName}</span>
                        <ChevronDown
                          className={`w-4 h-4 flex-shrink-0 text-ink3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </button>
                      {open && (
                        <p
                          data-testid={`pr-row-detail-${idx}`}
                          className="font-mono text-[13px] text-ink2 px-3 pb-3 -mt-1 animate-fade-in-up"
                        >
                          {t('istoric.landing.recordSummary', { kg: pr.kg, reps: pr.reps, oneRM: pr.oneRMEstimate })}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              {prHistory.length > LIST_PREVIEW && (
                <button
                  type="button"
                  onClick={() => setShowAllRecords((v) => !v)}
                  data-testid="istoric-records-toggle"
                  aria-expanded={showAllRecords}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-brickdark press-feedback"
                >
                  {showAllRecords
                    ? t('istoric.landing.showLess')
                    : t('istoric.landing.showAllCount', { n: prHistory.length })}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${showAllRecords ? 'rotate-180' : ''}`}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              )}
            </>
          )}
        </section>
      )}

      {/* ── SESSIONS segment — the chronological session log (default view). */}
      {tab === 'sessions' && (
        <div data-testid="istoric-sessions">
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
              formatDate={formatDate}
              // Preview the first 3 sessions + "Show all" expand (Daniel 2026-06-07).
              previewCount={LIST_PREVIEW}
              // Navigate by stable session `ts`, NOT array index (Daniel audit
              // 2026-06-05) — index pointed at the wrong session after a
              // delete/reorder and broke deep-links.
              onSelect={(ts) => navigate(`/app/istoric/${ts}`)}
            />
          )}
        </div>
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
      className={`pulse-card pulse-card-tight relative overflow-hidden px-2 py-4 text-center animate-card-rise ${delayCls}`}
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
