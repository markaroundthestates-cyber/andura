// ══ ENERGY CAUSE — Phase 3 task_05 §B Rewrite Stub → Real ════════════════
// Per spec §2 B energy cause picker drill cu Skip anti-force-typing.
// Triggered cand intensityMod='minus' (Slabit / Obosit) din EnergyCheck.
// Coach foloseste cauza pentru context (Phase 4+ wire engine adjustment;
// Phase 3 acceptable propagation only via location.state).
//
// Anti-force-typing D-LEGACY-010 §AMENDED — Skip button vizibil mandatory.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-010 anti-force-typing
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L899-911 screen-energy-cause

import type { JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
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

  return (
    <section className="p-6 bg-paper" data-testid="energy-cause">
      <h1 className="text-2xl font-semibold text-ink mb-2">De ce te simti asa?</h1>
      <p className="text-base text-ink2 mb-6">
        Optional. Coach ajusteaza in functie de cauza.
      </p>
      <div className="grid grid-cols-2 gap-3" role="list">
        {CAUSE_OPTIONS.map((cause) => (
          <button
            key={cause}
            type="button"
            onClick={() => handleSelect(cause)}
            data-cause={cause}
            className="cause-btn p-4 rounded-xl border border-[var(--line-strong)] bg-paper2 text-ink hover:bg-paper transition"
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
    </section>
  );
}
