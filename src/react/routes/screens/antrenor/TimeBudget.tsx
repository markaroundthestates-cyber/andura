// ══ TIME BUDGET — "Cat timp ai azi? / How much time today?" ════════════════
// Pre-workout reframe (Daniel UX LOCK 2026-06-08). The time-budget chips moved
// OFF EnergyCheck onto this dedicated short step. Flow: on the main Antrenor
// page, when the energy-check is done, tapping Start opens THIS screen → the
// user picks a time (or leaves "No limit") → Continue → workout-preview.
//
// The pick is written to workoutStore.sessionTimeBudgetMin BEFORE composition,
// exactly where composePlannedWorkoutToday / trimSessionToTimeBudget read it —
// only the COLLECTION POINT changed (was EnergyCheck), the engine contract is
// untouched. "No limit" (null) keeps the persona-derived session byte-identical.
//
// Testids mirror the old EnergyCheck time-budget block (time-chip-{min} /
// time-chip-nolimit) so existing time-budget coverage re-points cleanly.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - ADR 025 skippable pre-session time budget (engine tail-first trim)

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { t } from '../../../../i18n/index.js';

// Optional pre-session TIME budget chips. Skippable per ADR 025 — leaving
// "No limit" (null, the default) keeps the persona-derived session byte-identical.
// Picking a value SHRINKS today's session to fit (the engine's tail-first trim,
// never below the floor). The user time only ever tightens the cap.
const TIME_BUDGET_CHOICES = [30, 45, 60, 90] as const;

export function TimeBudget(): JSX.Element {
  const navigate = useNavigate();
  const sessionTimeBudgetMin = useWorkoutStore((s) => s.sessionTimeBudgetMin);
  const setSessionTimeBudgetMin = useWorkoutStore((s) => s.setSessionTimeBudgetMin);

  function handleContinue(): void {
    // sessionTimeBudgetMin is already committed to the store on each chip tap, so
    // composePlannedWorkoutToday (read in WorkoutPreview) sees it before composing.
    navigate(gotoPath('workout-preview'));
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="time-budget">
      <SubHeader
        title={t('energyCheck.timeBudget.label')}
        onBack={handleBack}
        testIdBack="time-budget-back"
      />
      <div className="p-6 flex-1 flex flex-col">
        <h2 className="font-display text-2xl font-bold text-ink mb-2">
          {t('energyCheck.timeBudget.label')}
        </h2>
        <p className="text-base text-ink2 mb-6">{t('timeBudget.subtitle')}</p>
        <div className="flex flex-wrap gap-2" data-testid="time-budget-chips">
          {TIME_BUDGET_CHOICES.map((min) => {
            const selected = sessionTimeBudgetMin === min;
            return (
              <button
                key={min}
                type="button"
                onClick={() => setSessionTimeBudgetMin(selected ? null : min)}
                data-testid={`time-chip-${min}`}
                data-selected={selected}
                aria-pressed={selected}
                className="rounded-full px-4 py-2 text-sm font-semibold border transition"
                style={
                  selected
                    ? { color: 'var(--volt)', borderColor: 'var(--volt)', background: 'color-mix(in oklab, var(--volt) 12%, transparent)' }
                    : { color: 'var(--ink2)', borderColor: 'var(--line-strong)' }
                }
              >
                {t('energyCheck.timeBudget.minutes', { n: min })}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSessionTimeBudgetMin(null)}
            data-testid="time-chip-nolimit"
            data-selected={sessionTimeBudgetMin === null}
            aria-pressed={sessionTimeBudgetMin === null}
            className="rounded-full px-4 py-2 text-sm font-semibold border transition"
            style={
              sessionTimeBudgetMin === null
                ? { color: 'var(--volt)', borderColor: 'var(--volt)', background: 'color-mix(in oklab, var(--volt) 12%, transparent)' }
                : { color: 'var(--ink2)', borderColor: 'var(--line-strong)' }
            }
          >
            {t('energyCheck.timeBudget.noLimit')}
          </button>
        </div>
        {/* CTA-FOLD FIX (2026-06-12, founder live phone) — dropped the `flex-1`
            spacer that pinned Continue to the bottom of the min-h-screen column
            (long dead gap below the time chips). The button now flows directly
            under the chips like EnergyCause/EquipmentSwap, visible without scroll. */}
        <button
          type="button"
          onClick={handleContinue}
          data-testid="time-budget-continue"
          className="btn-primary-lift press-feedback pulse-grad-bg pulse-shine mt-6 w-full rounded-full py-3.5 px-4 text-base font-semibold flex items-center justify-center gap-2"
          style={{ color: 'var(--on-accent)' }}
        >
          <span>{t('energyCheck.submitCta')}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
