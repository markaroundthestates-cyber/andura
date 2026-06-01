// ══ CALENDAR 7-DAY — Weekly Schedule Strip Antrenor Tab (task_19) ════════
// 7-day strip horizontal (L Ma Mi J V S D) cu locked default state + edit
// toggle + silent save Engine #2 dispatch.
//
// Color tokens spec Calendar V1 memory:
//   - training: #3d7a4a (green)
//   - rest: var(--paper-2)
//
// Phase 4 MVP defaults (Daniel CEO §6 pending clarifications):
//   - NU show workout type labels (just letter L/Ma/etc + color)
//   - full-week edits allowed (no forward-only restriction)
//   - NO validation (0/7 valid both extremes)
//
// §F-pass2-calendar-01 (HIGH-EPSILON 2026-05-22) — title swap mockup L830
// "Program de antrenament" CENTRAT (Daniel reglaj 2026-05-12 push-back
// §coach-follows-body). Edit pencil pinned absolute right to preserve
// centered title visual axis per mockup parity.
//
// §F-pass2-calendar-05 (LOW chat5) — edit hint copy added cand editMode
// active. Mockup verbatim andura-clasic.html#L856 (calendar-edit-hint).
//
// Cross-refs: DECISIONS.md §D-LEGACY-076 Calendar V1 ephemeral

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useScheduleStore, weekStartIso } from '../stores/scheduleStore';
import { ScheduleDayPreviewSheet } from './Calendar/ScheduleDayPreviewSheet';
import { t } from '../../i18n/index.js';

// Monday-first short day labels indexed 0..6. EN: "Mon"…"Sun"; RO: "L"…"D".
// Wave E3 i18n: pulled from calendar.day7.dayLabels.* so the calendar speaks
// the active locale (was hardcoded RO L/Ma/Mi pre-flip).
function dayLabel(idx: number): string {
  return t(`calendar.day7.dayLabels.${idx}`);
}

export function Calendar7Day(): JSX.Element {
  const days = useScheduleStore((s) => s.days);
  const editMode = useScheduleStore((s) => s.editMode);
  const weekStartISO = useScheduleStore((s) => s.weekStartISO);
  const setEditMode = useScheduleStore((s) => s.setEditMode);
  const toggleDay = useScheduleStore((s) => s.toggleDay);
  const saveWeekly = useScheduleStore((s) => s.saveWeekly);
  const resetWeekly = useScheduleStore((s) => s.resetWeekly);

  // Read-only preview sheet — opened when a day is tapped OUTSIDE edit mode.
  // null = closed. In edit mode the tap toggles the day instead (unchanged).
  const [previewDay, setPreviewDay] = useState<number | null>(null);

  // Monday auto-reset cand new week.
  useEffect(() => {
    const currentMonday = weekStartIso();
    if (currentMonday !== weekStartISO) {
      resetWeekly(currentMonday);
    }
  }, [weekStartISO, resetWeekly]);

  function handleSave(): void {
    saveWeekly();
  }

  function handleToggleEdit(): void {
    if (editMode) {
      handleSave();
    } else {
      setEditMode(true);
    }
  }

  // Day tap routing. Edit mode → toggle the day active/rest (UNCHANGED). Non-edit
  // mode → open the read-only preview sheet for that day (proposed exercises from
  // the live engine). Idx is the Monday-first weekday index 0..6.
  function handleDayTap(idx: number): void {
    if (editMode) {
      toggleDay(idx);
    } else {
      setPreviewDay(idx);
    }
  }

  // Monday-first "today" index (Mon=0 … Sun=6) for the aqua today marker
  // (mockup interfata-noua/screens-antrenor.jsx:69 .sched-pill.today).
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <>
    <div
      className="pulse-card p-4 mb-4 animate-card-rise delay-75"
      data-testid="calendar-7day"
      data-edit-mode={editMode ? 'true' : 'false'}
    >
      <div className="relative flex items-center justify-center mb-3">
        <p
          data-testid="calendar-title"
          className="font-display text-base font-bold text-ink text-center"
        >
          {t('calendar.day7.title')}
        </p>
        <button
          type="button"
          onClick={handleToggleEdit}
          data-testid="calendar-edit-toggle"
          aria-label={editMode ? t('calendar.day7.editAriaSave') : t('calendar.day7.editAriaEdit')}
          className="absolute right-0 w-9 h-9 grid place-items-center rounded-xl transition-colors before:absolute before:-inset-1 before:content-['']"
          style={{
            color: editMode ? 'var(--brick)' : 'var(--ink-3)',
            background: 'var(--surface-2)',
            border: '1px solid var(--line)',
          }}
        >
          {editMode ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Pencil className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="flex gap-1.5">
        {days.map((kind, idx) => {
          const trainingDay = kind === 'training';
          const label = dayLabel(idx);
          const isToday = idx === todayIdx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayTap(idx)}
              data-testid={`calendar-day-${idx}`}
              data-kind={kind}
              data-day={label}
              data-today={isToday ? 'true' : undefined}
              // Non-edit tap opens a read-only preview of that day's proposed
              // session; edit tap toggles the day. aria-label reflects the active
              // affordance (preview vs toggle) so screen readers announce intent.
              aria-label={`${label} - ${trainingDay ? t('calendar.day7.kindTraining') : t('calendar.day7.kindRest')}`}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl text-xs font-bold disabled:cursor-default transition-[background,color,box-shadow,transform] duration-150 hover:scale-[1.02] enabled:hover:scale-[1.04] active:scale-[0.94]"
              // ANDURA PULSE reskin (2026-05-29) — the legacy heat-green pill is
              // replaced by the Pulse accent (brick) with a soft volt glow on
              // training days (mockup interfata-noua/screens-antrenor.jsx:84-103
              // .sched-pill.on). Rest days stay the neutral elevated surface.
              // Today gets an aqua focus outline (mockup .sched-pill.today). All
              // colors are tokens (no raw hex) so every theme + dark mode reads
              // native; the WCAG-tuned --on-accent keeps text legible on fill.
              style={{
                background: trainingDay ? 'var(--brick)' : 'var(--surface-2)',
                color: trainingDay ? 'var(--on-accent)' : 'var(--ink-3)',
                border: trainingDay
                  ? '1px solid var(--brick)'
                  : '1px solid var(--line)',
                boxShadow: trainingDay
                  ? '0 0 18px -5px color-mix(in oklab, var(--brick) 75%, transparent)'
                  : 'none',
                outline: isToday
                  ? '2px solid color-mix(in oklab, var(--aqua) 75%, transparent)'
                  : undefined,
                outlineOffset: isToday ? 2 : undefined,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      {editMode && (
        <>
          <p
            data-testid="calendar-edit-hint"
            className="mt-3 text-xs text-ink2 text-center"
          >
            {t('calendar.day7.editHint')}
          </p>
          <button
            type="button"
            onClick={handleSave}
            data-testid="calendar-save"
            className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: 'linear-gradient(120deg, var(--volt), var(--aqua))',
              color: 'var(--on-accent)',
            }}
          >
            {t('calendar.day7.saveCta')}
          </button>
        </>
      )}
    </div>
    {/* Read-only day preview — proposed exercises from the live engine for the
        tapped day. Opens only outside edit mode (handleDayTap). dayKind comes
        from the live schedule (days[idx]) so a rest day renders the rest state
        without invoking the engine. */}
    <ScheduleDayPreviewSheet
      open={previewDay !== null}
      dayIdx={previewDay}
      dayKind={previewDay !== null ? days[previewDay] ?? 'rest' : 'rest'}
      dayLabel={previewDay !== null ? dayLabel(previewDay) : ''}
      onClose={() => setPreviewDay(null)}
    />
    </>
  );
}
