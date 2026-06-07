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
import { useSessionsByDate, useAerobicDatesByMonth, localKey } from '../../lib/useSessionsByDate';
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

// Pulse reskin (2026-05-29 GROUP E): per-day session-state marks. The mockup
// paints each logged day with a small glowing dot keyed to the session's
// derived rating tier (easy=volt / normal=aqua / hard=ember). Tier is REAL
// (deriveSessionRating → l1/l2/l3); zi-libera renders no dot. Returns a Pulse
// color token (never raw hex) or null when there is no session that day.
function tierDotColor(tier: string): string | null {
  if (tier === 'l1') return 'var(--volt)';
  if (tier === 'l2') return 'var(--aqua)';
  if (tier === 'l3') return 'var(--ember)';
  return null; // zi libera — no mark
}

export function CalendarHeatmap(): JSX.Element {
  const today = new Date();
  const [calY, setCalY] = useState(today.getFullYear());
  const [calM, setCalM] = useState(today.getMonth()); // 0-indexed
  const sessionsByDate = useSessionsByDate(calY, calM);
  // Aerobic-class overlay (2026-05-30) — a SEPARATE visual layer. Aerobic
  // classes (aerobicStore.sessions) have no sets/volume/PR, so they never enter
  // the gym tier paint above; they only add an aqua ring marker on their day so
  // a 'both'/aerobic-only user sees their training instead of an empty cell.
  const aerobicDates = useAerobicDatesByMonth(calY, calM);
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

  // a11y (2026-05-29) — ARIA grid pattern requires grid > row > gridcell. The
  // flat cell list is chunked into weeks of 7 so each week becomes a role="row".
  // The row wrappers use display:contents (CSS below) so the parent CSS grid
  // (grid-cols-7) still lays the cells out unchanged — purely a semantics layer.
  const weeks: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabel = monthFull(calM);

  return (
    <section
      data-testid="calendar-heatmap"
      aria-label={t('calendar.heatmap.ariaLabel')}
      className="pulse-card p-4 mb-4 animate-card-rise delay-150"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base font-semibold text-ink" data-testid="cal-month-label">
          {monthLabel} {calY}
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => navMonth(-1)}
            aria-label={t('calendar.heatmap.prevMonth')}
            data-testid="cal-prev"
            className="relative w-[30px] h-[30px] rounded-[9px] border border-line flex items-center justify-center press-feedback before:absolute before:-inset-[7px] before:content-['']"
            style={{ background: 'var(--surface-2)' }}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navMonth(1)}
            aria-label={t('calendar.heatmap.nextMonth')}
            data-testid="cal-next"
            className="relative w-[30px] h-[30px] rounded-[9px] border border-line flex items-center justify-center press-feedback before:absolute before:-inset-[7px] before:content-['']"
            style={{ background: 'var(--surface-2)' }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="text-[10px] text-center py-1 font-semibold tracking-wider"
            style={{ color: 'var(--aqua)' }}
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
        {weeks.map((week, weekIdx) => (
          // role="row" wrapper (ARIA grid > row > gridcell). display:contents
          // (cal-week class) keeps the cells as direct items of the parent
          // grid-cols-7 grid so the visual layout is unchanged.
          <div key={`week-${weekIdx}`} role="row" className="cal-week">
            {week.map((cell, cellIdx) => {
          const idx = weekIdx * 7 + cellIdx;
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
          // Aerobic-class day overlay — distinct aqua ring, independent of the
          // gym tier dot. A 'both' day shows BOTH (gym dot + aqua ring).
          const hasAerobic = cell.key !== null && aerobicDates.has(cell.key);
          const tier = hasSession ? ratingToTierClass(cell.rating) : 'zi-libera';
          // Pulse reskin (GROUP E) — the mockup drops the filled-tier square in
          // favour of a neutral cell + a glowing dot keyed to the session state.
          // Logged days sit on the surface (bg-paper2); future/rest cells stay
          // transparent. data-tier is preserved (real tier) so the engine + tests
          // keep their truth source.
          const dotColor = tierDotColor(tier);
          const isToday = cell.key === todayKey;
          const isFuture = cell.key !== null && cell.key > todayKey;
          // Rest-day glyph (Daniel 2026-06-04) — a PAST day with no gym session
          // and no aerobic mark is a logged rest day. The legend promises a rest
          // swatch (empty square); draw the matching glyph on the cell so the
          // calendar honours the legend. Future + today + logged days never get
          // it (nothing to mark / a mark already sits there).
          const isRestDay = !isFuture && !isToday && !hasSession && !hasAerobic;
          // Future cells stay transparent (nothing logged yet); past + rest days
          // sit on the nested glass surface (--surface-2) so the month reads as a
          // filled grid inside the glass card (mockup .cal-day parity).
          const cellBg = isFuture ? undefined : 'var(--surface-2)';
          const numCls = isFuture
            ? 'text-ink3 opacity-50'
            : isToday
              ? 'text-brick font-bold'
              : 'text-ink2';
          const todayCls = isToday ? 'ring-2 ring-brick ring-inset' : '';
          // Wave A5 polish (Daniel "Top Grade" 2026-05-28) — cells with logged
          // sessions get a subtle hover lift (scale 1.06) so the past months
          // feel scrub-able. Future/empty cells stay still — the lift would
          // suggest interactivity that's not there. transform-only keeps the
          // grid stable (no layout shift); reduced-motion auto-collapses.
          const hoverCls = (hasSession || hasAerobic) && !isFuture ? 'transition-transform hover:scale-110' : '';
          const labelSuffix = isToday
            ? t('calendar.heatmap.cell.todaySuffix')
            : isFuture
              ? t('calendar.heatmap.cell.futureSuffix')
              : '';
          // Aerobic-class info appended to the gym aria-label (additive — the
          // gym rating word stays first so screen readers read both layers).
          const aerobicWord = hasAerobic ? `, ${t('calendar.heatmap.cell.aerobic')}` : '';
          const ariaLabel = `${cell.day} ${monthGenitive(calM)} ${calY}, ${ratingWord(cell.rating, hasSession)}${aerobicWord}${labelSuffix}`;
          return (
            <div
              key={`day-${cell.day}`}
              role="gridcell"
              data-testid={`cal-cell-${cell.day}`}
              data-tier={tier}
              data-aerobic={hasAerobic ? 'true' : undefined}
              data-date={cell.key}
              data-today={isToday ? 'true' : undefined}
              data-future={isFuture ? 'true' : undefined}
              aria-label={ariaLabel}
              aria-disabled={isFuture ? 'true' : undefined}
              className={`relative aspect-square rounded-[10px] flex flex-col items-center justify-center gap-[3px] ${todayCls} ${hoverCls}`.trim()}
              style={cellBg ? { background: cellBg } : undefined}
            >
              <span className={`font-mono text-[12px] leading-none ${numCls}`}>{cell.day}</span>
              {(dotColor || hasAerobic || isRestDay) && (
                <span className="flex items-center gap-[3px]" aria-hidden="true">
                  {isRestDay && (
                    // Rest-day glyph — empty square matching the legend's rest
                    // swatch (bg-paper2 + lineStrong border), sized like the dot.
                    <span
                      data-testid={`cal-rest-${cell.day}`}
                      className="w-1.5 h-1.5 rounded-[3px] bg-paper2 border border-lineStrong"
                    />
                  )}
                  {dotColor && (
                    <span
                      data-testid={`cal-dot-${cell.day}`}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
                    />
                  )}
                  {hasAerobic && (
                    // Aerobic-class marker — hollow aqua ring (vs the solid gym
                    // intensity dot) so a 'both' day reads as two distinct marks
                    // and aqua never collides with the gym-normal solid dot.
                    <span
                      data-testid={`cal-aerobic-${cell.day}`}
                      className="w-1.5 h-1.5 rounded-full border-[1.5px] bg-transparent"
                      style={{ borderColor: 'var(--aqua)', boxShadow: '0 0 6px var(--aqua)' }}
                    />
                  )}
                </span>
              )}
            </div>
          );
            })}
          </div>
        ))}
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="cal-month-announce"
      >
        {t('calendar.heatmap.monthAnnounce', { month: monthLabel, year: calY })}
      </div>

      {/* Pulse reskin (GROUP E) — legend mirrors the cell marks: glowing dots in
          the session-state tokens (easy=volt / normal=aqua / hard=ember). Rest
          keeps its real token (no Pulse glow — not a logged session). Order
          follows the mockup: easy → normal → hard → rest. */}
      <div
        className="flex items-center gap-3.5 flex-wrap pt-3.5 mt-3.5 border-t border-line"
        data-testid="cal-legend"
      >
        {/* Source legend (2026-05-30) — gym (solid intensity dot) vs aerobic
            class (hollow aqua ring). Self-explains the two day-marker shapes so
            a 'both'-mode user reads the calendar correctly. */}
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink2" data-testid="cal-legend-gym">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: 'var(--volt)', boxShadow: '0 0 6px var(--volt)' }}
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.gym')}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink2" data-testid="cal-legend-aerobic">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border-[1.5px] bg-transparent"
            style={{ borderColor: 'var(--aqua)', boxShadow: '0 0 6px var(--aqua)' }}
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.aerobic')}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[3px]"
            style={{ background: 'var(--volt)', boxShadow: '0 0 6px var(--volt)' }}
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.easy')}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[3px]"
            style={{ background: 'var(--aqua)', boxShadow: '0 0 6px var(--aqua)' }}
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.normal')}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[3px]"
            style={{ background: 'var(--ember)', boxShadow: '0 0 6px var(--ember)' }}
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.hard')}
        </span>
        {/* Audit 2026-06-07 (LOW-2): the "recovery"/violet legend swatch was
            removed — tierDotColor only ever paints volt/aqua/ember (l1/l2/l3),
            so no cell ever showed a recovery mark; the legend advertised a swatch
            users would never see. */}
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-[3px] bg-paper2 border border-lineStrong"
            aria-hidden="true"
          />
          {t('calendar.heatmap.legend.rest')}
        </span>
      </div>
    </section>
  );
}
