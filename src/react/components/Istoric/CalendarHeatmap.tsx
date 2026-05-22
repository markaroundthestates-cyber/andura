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

const CAL_MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
] as const;

const DAY_LABELS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] as const;

// Maps derived rating to tier class. Null (no rating in legacy session) →
// l2 normal fallback per spec §2.2 (matches mockup heat[]=2 placeholder).
function ratingToTierClass(rating: SessionRating | null): string {
  if (rating === 'usor') return 'l1';
  if (rating === 'greu') return 'l3';
  return 'l2'; // potrivit OR null fallback
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
    const session = sessionsByDate.get(key);
    const rating = session ? deriveSessionRating(session) : null;
    cells.push({ day: d, rating: session ? rating : null, key });
  }

  return (
    <section
      data-testid="calendar-heatmap"
      aria-label="Calendar antrenamente lunar"
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-base font-semibold text-ink" data-testid="cal-month-label">
          {CAL_MONTHS[calM]} {calY}
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => navMonth(-1)}
            aria-label="Luna anterioara"
            data-testid="cal-prev"
            className="w-8 h-8 rounded-lg bg-paper2 flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navMonth(1)}
            aria-label="Luna urmatoare"
            data-testid="cal-next"
            className="w-8 h-8 rounded-lg bg-paper2 flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DAY_LABELS.map((lbl) => (
          <div
            key={lbl}
            className="text-[10px] text-ink3 text-center py-1 font-semibold tracking-wider"
          >
            {lbl}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1"
        role="grid"
        aria-label={`${CAL_MONTHS[calM]} ${calY}`}
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
          if (tier === 'l1') textCls = 'text-[#2f5b34]'; // 7.92:1 AAA
          else if (tier === 'l2' || tier === 'l3') textCls = 'text-ink font-semibold';
          return (
            <div
              key={`day-${cell.day}`}
              role="gridcell"
              data-testid={`cal-cell-${cell.day}`}
              data-tier={tier}
              data-date={cell.key}
              className={`aspect-square rounded-md flex items-center justify-center text-[11px] ${bg} ${textCls}`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </section>
  );
}
