// ══ ENERGY CAUSE — Phase 3 task_05 §B Rewrite Stub → Real ════════════════
// Per spec §2 B energy cause picker drill cu Skip anti-force-typing.
// Triggered cand intensityMod='minus' (Slabit / Obosit) din EnergyCheck.
// Coach foloseste cauza pentru context (Phase 4+ wire engine adjustment;
// Phase 3 acceptable propagation only via location.state).
//
// Anti-force-typing D-LEGACY-010 §AMENDED — Skip button vizibil mandatory.
//
// HIGH-GAMMA §F-energy-cause-07: SubHeader consume — cross-cutting back-btn
// pattern shared cu Auth/CevaNuMerge per mockup andura-clasic.html L901
// .sub-header (back-btn + h2 title sticky top). SubHeader created HIGH-ALFA.
//
// HIGH-GAMMA §F-energy-cause-02: Lucide icons per cause — mockup
// andura-clasic.html L905-908 verbatim icon mapping (wind/moon/alert-circle/
// more-horizontal). Co-CTO §F-energy-cause-01 decision KEEP prod 6 granular
// (finer signal pentru engine vs mockup 4 — Marius gap reglaj). Icon
// vocabulary extended la 6 cu Utensils/Dumbbell/Thermometer pentru
// Mancat/Antrenament/Boala mockup-absent.
//
// §F-energy-cause-04 (MED chat5 Wave 13) — header text mockup verbatim
// "Ce e mai greu azi?" mockup andura-clasic.html#L900 (specific contextual
// "ce e mai greu" vs prod generic "De ce te simti asa"). Semantic mai
// precis: intreaba cauza dificultatii, NU starea emotionala.
//
// §F-energy-cause-05 (MED chat5 Wave 13) — body intro mockup verbatim
// "Alege una. Coach-ul foloseste raspunsul ca sa adapteze sesiunea."
// mockup andura-clasic.html#L903. Prod avea "Optional. Coach ajusteaza in
// functie de cauza." Mockup pozitiv (instructional + behavior trigger) vs
// prod technical-warning. Aliniaza tone Suflet Andura voice warm-direct.
//
// §F-energy-cause-03 (MED chat5 Wave 19) — layout vertical stack mockup
// verbatim andura-clasic.html#L904 (flex-direction:column; gap:10px;).
// Prod avea grid 2-col compact (mai dens vizual pe ecran). Mockup full-
// width single-column = scan-pattern mai lent dar etichete mai lizibile
// + buton mai larg pentru thumb-reach Maria 65. Gigel Test: vertical scan
// natural cititor (sus-jos), tap mai sigur cu buton wide. Aliniaza
// taxonomy display cu mockup-intent UX.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-010 anti-force-typing
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L899-911 screen-energy-cause

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Utensils,
  Wind,
  Dumbbell,
  Thermometer,
  MoreHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { t } from '../../../../i18n/index.js';

interface CauseOption {
  /** i18n key under energyCause.causes.* — label localized at render. */
  labelKey: string;
  /** Stable canonical RO label propagated as the `cause` context (engine/state
   *  read side stays language-stable; only the display flows through i18n). */
  cause: string;
  Icon: LucideIcon;
}

const CAUSE_OPTIONS: readonly CauseOption[] = [
  { labelKey: 'energyCause.causes.sleep', cause: 'Dormit putin', Icon: Moon },
  { labelKey: 'energyCause.causes.food', cause: 'Mancat putin', Icon: Utensils },
  { labelKey: 'energyCause.causes.stress', cause: 'Stres mental', Icon: Wind },
  { labelKey: 'energyCause.causes.training', cause: 'Antrenament greu ieri', Icon: Dumbbell },
  { labelKey: 'energyCause.causes.illness', cause: 'Boala sau racit', Icon: Thermometer },
  { labelKey: 'energyCause.causes.other', cause: 'Altceva', Icon: MoreHorizontal },
];

export function EnergyCause(): JSX.Element {
  const navigate = useNavigate();
  // #69 pre-workout reframe — the energy self-report (energyLevel + intensityMod)
  // was recorded into the store by EnergyCheck before routing here; we merge in
  // the chosen cause then return to the MAIN page (no longer straight to preview).
  const sessionEnergy = useWorkoutStore((s) => s.sessionEnergy);
  const setSessionEnergy = useWorkoutStore((s) => s.setSessionEnergy);

  function recordCause(cause?: string): void {
    // Preserve the energyLevel/intensityMod recorded on EnergyCheck; add cause.
    // Defensive fallback: if the slice is somehow empty (deep-link to this
    // screen), default to the 'minus' self-report this drill represents.
    const base = sessionEnergy ?? { energyLevel: 'obosit' as const, intensityMod: 'minus' as const };
    setSessionEnergy({ ...base, ...(cause !== undefined ? { cause } : {}) });
  }

  function handleSelect(cause: string): void {
    recordCause(cause);
    navigate(gotoPath('antrenor'));
  }

  function handleSkip(): void {
    recordCause();
    navigate(gotoPath('antrenor'));
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="energy-cause">
      <SubHeader
        title={t('energyCause.subHeaderTitle')}
        onBack={handleBack}
        testIdBack="energy-cause-back"
      />
      <div className="p-6 flex-1 animate-card-rise">
        <p className="text-base text-ink2 mb-6">
          {t('energyCause.body')}
        </p>
        <div className="flex flex-col gap-2.5">
          {CAUSE_OPTIONS.map(({ labelKey, cause, Icon }) => (
            <button
              key={cause}
              type="button"
              onClick={() => handleSelect(cause)}
              data-cause={cause}
              className="cause-btn pulse-card flex items-center gap-3 p-4 text-ink hover:bg-paper transition text-left"
            >
              <Icon className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{t(labelKey)}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSkip}
          data-testid="energy-cause-skip"
          className="w-full mt-6 py-3 text-ink2 text-sm"
        >
          {t('energyCause.skipCta')}
        </button>
      </div>
    </section>
  );
}
