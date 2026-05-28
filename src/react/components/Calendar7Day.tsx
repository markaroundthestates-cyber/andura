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
import { useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useScheduleStore, weekStartIso } from '../stores/scheduleStore';
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

  return (
    <div
      className="bg-paper border border-line rounded-xl p-3 mb-4 animate-card-rise delay-75"
      data-testid="calendar-7day"
      data-edit-mode={editMode ? 'true' : 'false'}
    >
      <div className="relative flex items-center justify-center mb-2">
        <p
          data-testid="calendar-title"
          className="text-base font-semibold text-ink text-center"
        >
          {t('calendar.day7.title')}
        </p>
        <button
          type="button"
          onClick={handleToggleEdit}
          data-testid="calendar-edit-toggle"
          aria-label={editMode ? t('calendar.day7.editAriaSave') : t('calendar.day7.editAriaEdit')}
          className="absolute right-0 p-1.5 rounded-full text-ink2"
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
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              disabled={!editMode}
              data-testid={`calendar-day-${idx}`}
              data-kind={kind}
              data-day={label}
              aria-label={`${label} - ${trainingDay ? t('calendar.day7.kindTraining') : t('calendar.day7.kindRest')}`}
              className="flex-1 py-2 rounded-lg text-xs font-semibold disabled:cursor-default"
              // Wiki spec calendar-feature-v1-spec.md §UX states 3 LOCKED
              // post-S1.6: training LOCKED state = #3d7a4a verde inchis; EDIT
              // state = verde deschis (signal "asta e programul, modifica").
              // Rest neutral var(--paper-2) invariant cross-states.
              // THEME-INVERSION fix (2026-05-27): edit-state era hardcodat
              // #d4e6cb bg + var(--ink) text -> pe tema mov var(--ink) devine
              // near-white => text alb pe verde-deschis = 1.18:1 ilizibil.
              // Tokenizat la --heat-usor (#d4e6cb light / #2a4a30 dark) +
              // --heat-usor-text (5.99:1 light / 6.43:1 dark) care au deja
              // paritate dark. Locked (#3d7a4a verde inchis + white) ramane fix
              // intentionat (verde inchis e dark surface in ambele teme).
              style={{
                background: trainingDay
                  ? editMode
                    ? 'var(--heat-usor)'
                    : '#3d7a4a'
                  : 'var(--paper-2)',
                color: trainingDay
                  ? editMode
                    ? 'var(--heat-usor-text)'
                    : '#ffffff'
                  : 'var(--ink)',
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
            className="w-full mt-3 py-2 bg-brick text-paper rounded-lg text-sm font-semibold"
          >
            {t('calendar.day7.saveCta')}
          </button>
        </>
      )}
    </div>
  );
}
