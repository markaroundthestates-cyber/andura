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
import { useNavigate, useLocation } from 'react-router-dom';
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
import type { EnergyLevel, IntensityMod } from './EnergyCheck';

interface CauseOption {
  label: string;
  Icon: LucideIcon;
}

const CAUSE_OPTIONS: readonly CauseOption[] = [
  { label: 'Dormit putin', Icon: Moon },
  { label: 'Mancat putin', Icon: Utensils },
  { label: 'Stres mental', Icon: Wind },
  { label: 'Antrenament greu ieri', Icon: Dumbbell },
  { label: 'Boala sau racit', Icon: Thermometer },
  { label: 'Altceva', Icon: MoreHorizontal },
];

interface EnergyCauseLocationState {
  energyLevel?: EnergyLevel;
  intensityMod?: IntensityMod;
}

export function EnergyCause(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { energyLevel, intensityMod } =
    (location.state as EnergyCauseLocationState | null) ?? {};

  function handleSelect(cause: string): void {
    navigate(gotoPath('workout-preview'), {
      state: { energyLevel, intensityMod, cause },
    });
  }

  function handleSkip(): void {
    navigate(gotoPath('workout-preview'), {
      state: { energyLevel, intensityMod },
    });
  }

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="energy-cause">
      <SubHeader
        title="Ce e mai greu azi?"
        onBack={handleBack}
        testIdBack="energy-cause-back"
      />
      <div className="p-6 flex-1 animate-card-rise">
        <p className="text-base text-ink2 mb-6">
          Alege una. Coach-ul foloseste raspunsul ca sa adapteze sesiunea.
        </p>
        <div className="flex flex-col gap-2.5">
          {CAUSE_OPTIONS.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleSelect(label)}
              data-cause={label}
              className="cause-btn flex items-center gap-3 p-4 rounded-2xl border border-line bg-paper2 text-ink hover:bg-paper transition text-left"
            >
              <Icon className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSkip}
          data-testid="energy-cause-skip"
          className="w-full mt-6 py-3 text-ink2 text-sm"
        >
          Sari peste
        </button>
      </div>
    </section>
  );
}
