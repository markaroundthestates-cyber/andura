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
// Cross-refs: DECISIONS.md §D-LEGACY-076 Calendar V1 ephemeral

import type { JSX } from 'react';
import { useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useScheduleStore, weekStartIso } from '../stores/scheduleStore';

const DAY_LABELS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] as const;

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
      className="bg-paper border border-line rounded-xl p-3 mb-4"
      data-testid="calendar-7day"
      data-edit-mode={editMode ? 'true' : 'false'}
    >
      <div className="relative flex items-center justify-center mb-2">
        <p
          data-testid="calendar-title"
          className="text-base font-semibold text-ink text-center"
        >
          Program de antrenament
        </p>
        <button
          type="button"
          onClick={handleToggleEdit}
          data-testid="calendar-edit-toggle"
          aria-label={editMode ? 'Salveaza' : 'Editeaza'}
          className="absolute right-0 p-1.5 rounded-full text-ink2"
        >
          {editMode ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Pencil className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="flex gap-1.5" role="list" aria-label="Zile saptamana">
        {days.map((kind, idx) => {
          const trainingDay = kind === 'training';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              disabled={!editMode}
              data-testid={`calendar-day-${idx}`}
              data-kind={kind}
              data-day={DAY_LABELS[idx]}
              aria-label={`${DAY_LABELS[idx]} - ${trainingDay ? 'antrenament' : 'odihna'}`}
              className="flex-1 py-2 rounded-lg text-xs font-semibold disabled:cursor-default"
              // Wiki spec calendar-feature-v1-spec.md §UX states 3 LOCKED
              // post-S1.6: training LOCKED state = #3d7a4a verde inchis; EDIT
              // state = #d4e6cb verde deschis (signal "asta e programul,
              // modifica"). Rest neutral var(--paper-2) invariant cross-states.
              // Color text contrast WCAG: verde deschis + ink dark, verde
              // inchis + white.
              style={{
                background: trainingDay
                  ? editMode
                    ? '#d4e6cb'
                    : '#3d7a4a'
                  : 'var(--paper-2)',
                color: trainingDay
                  ? editMode
                    ? 'var(--ink)'
                    : '#ffffff'
                  : 'var(--ink)',
              }}
            >
              {DAY_LABELS[idx]}
            </button>
          );
        })}
      </div>
      {editMode && (
        <button
          type="button"
          onClick={handleSave}
          data-testid="calendar-save"
          className="w-full mt-3 py-2 bg-brick text-paper rounded-lg text-sm font-semibold"
        >
          Salveaza
        </button>
      )}
    </div>
  );
}
