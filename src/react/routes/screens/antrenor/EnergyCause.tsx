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
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-010 anti-force-typing
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L899-911 screen-energy-cause

import type { JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import type { EnergyLevel, IntensityMod } from './EnergyCheck';

const CAUSE_OPTIONS: readonly string[] = [
  'Dormit putin',
  'Mancat putin',
  'Stres mental',
  'Antrenament greu ieri',
  'Boala sau racit',
  'Altceva',
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
        title="De ce te simti asa?"
        onBack={handleBack}
        testIdBack="energy-cause-back"
      />
      <div className="p-6 flex-1">
        <p className="text-base text-ink2 mb-6">
          Optional. Coach ajusteaza in functie de cauza.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CAUSE_OPTIONS.map((cause) => (
            <button
              key={cause}
              type="button"
              onClick={() => handleSelect(cause)}
              data-cause={cause}
              className="cause-btn p-4 rounded-xl border border-lineStrong bg-paper2 text-ink hover:bg-paper transition"
            >
              <span className="text-sm font-medium">{cause}</span>
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
