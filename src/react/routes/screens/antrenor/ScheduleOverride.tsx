// ══ SCHEDULE OVERRIDE — Phase 3 task_07 §C Rewrite Stub → Real ═══════════
// Per spec §2 C override picker. Calendar V1 ephemeral override per
// D-LEGACY-076 — azi only (next session resets to original preset per
// scheduleAdapter). location.state propagation drives WorkoutPreview, which
// asks the engine for a real alternative session (different-muscle) or rides
// intensityMod (easier/harder).
//
// NO DEAD BUTTONS (Bugatti) — every visible option does something REAL:
//   easier → intensityMod 'minus' (WorkoutPreview banner + session context)
//   harder → intensityMod 'plus'
//   different-muscle → engine picks the most-recovered ALTERNATIVE cluster
//     (getTodayWorkout({differentMuscle:true}) → a real different session, today
//     only, never mutates the persisted schedule)
//
// REMOVED 2026-06-02 (pending real templates — conscious gap, not silent loss):
//   - mobility: no real mobility/stretching routine exists in the engine.
//   - cardio: aerobic logging is an INLINE Antrenor-tab card (AerobicCoach /
//     BothModeAerobicCard for aerobic/both training types) — there is no
//     standalone aerobic route to navigate to. Re-add when a mobility template
//     and/or a reachable cardio-log route exist.
//
// PAR-009 SubHeader consume — mockup andura-clasic.html L1107 sub-header
// verbatim "Schimbi planul de azi?" sticky top + back-btn. Body h1
// 'Vrei alt antrenament azi?' regresat h2 (single h1 SubHeader pattern
// parity). Mockup body L1108-1119 has only `<p>` helper copy after header.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-076 Calendar V1 ephemeral override
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L1106-1152 screen-schedule-override

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';
import type { IntensityMod } from './EnergyCheck';

export type OverrideKind = 'easier' | 'harder' | 'different-muscle';

interface OverrideOption {
  kind: OverrideKind;
  labelKey: string;
  descriptionKey: string;
}

// Label + description resolved via i18n at render time so EN/RO swap is
// wire-only (NU rewrite OVERRIDE_OPTIONS) per Daniel 2026-05-28 EN-default
// mandate.
const OVERRIDE_OPTIONS: readonly OverrideOption[] = [
  { kind: 'easier',            labelKey: 'scheduleOverride.options.easierLabel',           descriptionKey: 'scheduleOverride.options.easierDescription' },
  { kind: 'harder',            labelKey: 'scheduleOverride.options.harderLabel',           descriptionKey: 'scheduleOverride.options.harderDescription' },
  { kind: 'different-muscle',  labelKey: 'scheduleOverride.options.differentMuscleLabel',  descriptionKey: 'scheduleOverride.options.differentMuscleDescription' },
  // mobility + cardio REMOVED 2026-06-02 (no dead buttons) — see file header.
];

function intensityFor(kind: OverrideKind): IntensityMod {
  if (kind === 'easier') return 'minus';
  if (kind === 'harder') return 'plus';
  return 'normal';
}

export function ScheduleOverride(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(kind: OverrideKind): void {
    navigate(gotoPath('workout-preview'), {
      state: { overrideKind: kind, intensityMod: intensityFor(kind) },
    });
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="schedule-override">
      <SubHeader
        title={t('scheduleOverride.subHeaderTitle')}
        onBack={handleBack}
        testIdBack="schedule-override-back"
      />
      <div className="p-6 flex-1 animate-card-rise">
      <h2 className="font-display text-2xl font-bold text-ink tracking-tight mb-2">{t('scheduleOverride.heading')}</h2>
      <p className="text-base text-ink2 mb-6">
        {t('scheduleOverride.body')}
      </p>
      <div className="flex flex-col gap-3">
        {OVERRIDE_OPTIONS.map((opt) => (
          <button
            key={opt.kind}
            type="button"
            onClick={() => handleSelect(opt.kind)}
            data-override-kind={opt.kind}
            className="pulse-card flex flex-col items-start gap-1 p-4 hover:bg-paper transition text-left"
          >
            <span className="text-base font-medium text-ink">{t(opt.labelKey)}</span>
            <span className="text-sm text-ink2">{t(opt.descriptionKey)}</span>
          </button>
        ))}
      </div>
      </div>
    </section>
  );
}
