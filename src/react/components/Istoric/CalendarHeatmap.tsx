// ══ CALENDAR HEATMAP — F-istoric-01 signature feature ════════════════════
// Month-navigable grid 7-col x N-week. Chevron prev/next nav with year wrap.
// Cell tier paint via deriveSessionRating (l1 usor / l2 normal / l3 greu)
// + zi libera default (no session for that local date).
//
// T5: scaffold + month state + chevron nav
// T6: render grid + Monday-first offset + day cells + tier classes
// T7: legend row 5 items
// T8: aria-label per cell + aria-live month change announce
// T9: today highlight + future-date muted state
//
// Mockup ref: 04-architecture/mockups/andura-clasic.html L1177-1228 + L2906-2955.
// Spec: 📥_inbox/calendar-heatmap-spec/UI-SPEC.md §3.1 + §6.
//
// WCAG note: l2 cell `--heat-normal` (#7fb185) + white text fails 2.69:1.
// V1 ships text=var(--ink) (#1a1815) → 11.57:1 AAA (deliberate improvement
// over mockup per Bugatti standard + WCAG SC 1.4.3 AA mandate).

import { useState, type JSX } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSessionsByDate, localKey } from '../../lib/useSessionsByDate';
import { deriveSessionRating } from '../../lib/sessionRating';
import type { SessionRating } from '../../lib/sessionRating';
import { t } from '../../../i18n/index.js';

// Wave E3 i18n: month + day labels + cell semantics flow through t(). RO
// bundle preserves the no-diacritics labels used in the mockup; EN bundle
// surfaces calendar/standard English. Helpers below stay pure so the call
// sites can keep their formatting templates.

function monthFull(monthIdx: number): string {
  return t(`months.full.${monthIdx}`);
}

function monthGenitive(monthIdx: number): string {
  return t(`months.fullGenitive.${monthIdx}`);
}

function dayLabel(idx: number): string {
  return t(`calendar.heatmap.dayLabels.${idx}`);
}

// Rating word for aria-label: aligns with mockup tier semantics. Reads from
// calendar.heatmap.cell.* — RO keeps "zi libera/antrenament usor/…" verbatim.
function ratingWord(rating: SessionRating | null, hasSession: boolean): string {
  if (!hasSession) return t('calendar.heatmap.cell.rest');
  if (rating === 'usor') return t('calendar.heatmap.cell.sessionLight');
  if (rating === 'greu') return t('calendar.heatmap.cell.sessionHard');
  if (rating === 'potrivit') return t('calendar.heatmap.cell.sessionFair');
  return t('calendar.heatmap.cell.sessionPresent');
}

// Maps derived rating to tier class. Null (no rating in legacy session) →
// l2 normal fallback per spec §2.2 (matches mockup heat[]=2 placeholder).
function ratingToTierClass(rating: SessionRating | null): string {
  if (rating === 'usor') return 'l1';
  if (rating === 'greu') return 'l3';
  return 'l2'; // potrivit OR null fallback
}

// Multi-session same-day aggregator (Marius perf AM+PM). Severity-first
// tiebreak aligns w/ deriveSessionRating: greu > potrivit > usor > null.
// Null returned only when all sessions return null (all legacy / no sets).
function aggregateDayRating(ratings: Array<SessionRating | null>): SessionRating | null {
  if (ratings.some((r) => r === 'greu')) return 'greu';
  if (ratings.some((r) => r === 'potrivit')) return 'potrivit';
  if (ratings.some((r) => r === 'usor')) return 'usor';
  return null;
}

function tierBgClass(tier: string): string {
  if (tier === 'l1') return 'bg-heatUsor';
  if (tier === 'l2') return 'bg-heatNormal';
  if (tier === 'l3') return 'bg-heatGreu';
  return 'bg-paper2'; // zi libera
}

export function CalendarHeatmap(): JSX.Element {
  const today = new Date();
  const [calY, setCalY] = useState(today.getFullYear());
  const [calM, setCalM] = useState(today.getMonth()); // 0-indexed
  const sessionsByDate = useSessionsByDate(calY, calM);
  const todayKey = localKey(today.getTime());

  const navMonth = (delta: -1 | 1): void => {
    let m = calM + delta;
    let y = calY;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalY(y);
    setCalM(m);
  };

  // Monday-first offset: JS getDay() returns 0=Sun..6=Sat. App convention
  // Monday-first → (getDay() + 6) % 7 yields 0=Mon..6=Sun.
  const firstOfMonth = new Date(calY, calM, 1);
  const monOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();

  // Build day cells array: leading empties + actual day numbers.
  const cells: Array<{ day: number | null; rating: SessionRating | null; key: string | null }> = [];
  for (let i = 0; i < monOffset; i++) {
    cells.push({ day: null, rating: null, key: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${calY}-${String(calM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const sessions = sessionsByDate.get(key);
    const rating = sessions
      ? aggregateDayRating(sessions.map((s) => deriveSessionRating(s)))
      : null;
    cells.push({ day: d, rating: sessions ? rating : null, key });
  }

  const monthLabel = monthFull(calM);

  return (
    <section
      data-testid="calendar-heatmap"
      aria-label={t('calendar.heatmap.ariaLabel')}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-base font-semibold text-ink" data-testid="cal-month-label">
          {monthLabel} {calY}
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => navMonth(-1)}
            aria-label={t('calendar.heatmap.prevMonth')}
            data-testid="cal-prev"
            className="w-8 h-8 rounded-lg bg-paper2 flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navMonth(1)}
            aria-label={t('calendar.heatmap.nextMonth')}
            data-testid="cal-next"
            className="w-8 h-8 rounded-lg bg-paper2 flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="text-[10px] text-ink3 text-center py-1 font-semibold tracking-wider"
          >
            {dayLabel(idx)}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1 mb-2.5"
        role="grid"
        aria-label={`${monthLabel} ${calY}`}
        data-testid="cal-grid"
      >
        {cells.map((cell, idx) => {
          if (cell.day === null) {
            return (
              <div
                key={`empty-${idx}`}
                aria-hidden="true"
                className="aspect-square"
                data-testid={`cal-cell-empty-${idx}`}
              />
            );
          }
          const hasSession = sessionsByDate.has(cell.key ?? '');
          const tier = hasSession ? ratingToTierClass(cell.rating) : 'zi-libera';
          const bg = tierBgClass(tier);
          // Text color tuned for contrast: l1 light bg uses dark text;
          // l2/l3 medium-dark green uses ink (11.57:1 / improvement vs mockup white 5.43:1 / 2.69:1).
          let textCls = 'text-ink3';
          if (tier === 'l1') textCls = 'text-heatUsorText'; // 7.92:1 AAA via --heat-usor-text token
          else if (tier === 'l2' || tier === 'l3') textCls = 'text-ink font-semibold';
          const isToday = cell.key === todayKey;
          const isFuture = cell.key !== null && cell.key > todayKey;
          const todayCls = isToday ? 'ring-2 ring-brick' : '';
          const futureCls = isFuture ? 'opacity-50' : '';
          // Wave A5 polish (Daniel "Top Grade" 2026-05-28) — cells with logged
          // sessions get a subtle hover lift (scale 1.06) so the past months
          // feel scrub-able. Future/empty cells stay still — the lift would
          // suggest interactivity that's not there. transform-only keeps the
          // grid stable (no layout shift); reduced-motion auto-collapses.
          const hoverCls = hasSession && !isFuture ? 'transition-transform hover:scale-110' : '';
          const labelSuffix = isToday
            ? t('calendar.heatmap.cell.todaySuffix')
            : isFuture
              ? t('calendar.heatmap.cell.futureSuffix')
              : '';
          const ariaLabel = `${cell.day} ${monthGenitive(calM)} ${calY}, ${ratingWord(cell.rating, hasSession)}${labelSuffix}`;
          return (
            <div
              key={`day-${cell.day}`}
              role="gridcell"
              data-testid={`cal-cell-${cell.day}`}
              data-tier={tier}
              data-date={cell.key}
              data-today={isToday ? 'true' : undefined}
              data-future={isFuture ? 'true' : undefined}
              aria-label={ariaLabel}
              aria-disabled={isFuture ? 'true' : undefined}
              className={`aspect-square rounded-md flex items-center justify-center text-[11px] ${bg} ${textCls} ${todayCls} ${futureCls} ${hoverCls}`.trim()}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="cal-month-announce"
      >
        {t('calendar.heatmap.monthAnnounce', { month: monthLabel, year: calY })}
      </div>

      <div
        className="flex items-center gap-3.5 flex-wrap"
        data-testid="cal-legend"
      >
        <span className="flex items-center gap-1.5 text-[11px] text-ink3">
          <span className="inline-block w-3 h-3 rounded-sm bg-heatGreu" aria-hidden="true" />
          {t('calendar.heatmap.legend.hard')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink3">
          <span className="inline-block w-3 h-3 rounded-sm bg-heatNormal" aria-hidden="true" />
          {t('calendar.heatmap.legend.normal')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink3">
          <span className="inline-block w-3 h-3 rounded-sm bg-heatUsor" aria-hidden="true" />
          {t('calendar.heatmap.legend.easy')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink3">
          <span
            className="inline-block w-3 h-3 rounded-sm bg-heatRecovery border border-heatRecoveryBorder"
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.recovery')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink3">
          <span className="inline-block w-3 h-3 rounded-sm bg-paper2" aria-hidden="true" />
          {t('calendar.heatmap.legend.rest')}
        </span>
      </div>
    </section>
  );
}
