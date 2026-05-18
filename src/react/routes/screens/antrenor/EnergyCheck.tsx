// ══ ENERGY CHECK — Phase 3 task_05 §A Rewrite Stub → Real ════════════════
// Per spec §2 A energy check 5-option emoji selector + flow routing.
// Mockup andura-clasic.html#L878-897 reference (3-state); spec extends la
// 5-option (Excelent / Bine / Normal / Slabit / Obosit) cu intensity 'plus'
// / 'normal' / 'minus' map. Slabit + Obosit → energy-cause; restul → direct
// workout-preview. Intensity propagated via location.state pentru Phase 3
// izolare flow (Phase 4+ trece la workoutStore intensity slice).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-021 Energy Adjustment ±15% range
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L878-897 screen-energy-check

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';

export type EnergyLevel = 'excelent' | 'bine' | 'normal' | 'slabit' | 'obosit';
export type IntensityMod = 'plus' | 'normal' | 'minus';

interface EnergyOption {
  level: EnergyLevel;
  emoji: string;
  label: string;
  intensity: IntensityMod;
}

const ENERGY_OPTIONS: readonly EnergyOption[] = [
  { level: 'excelent', emoji: '💪', label: 'Excelent', intensity: 'plus' },
  { level: 'bine', emoji: '⚡', label: 'Bine', intensity: 'normal' },
  { level: 'normal', emoji: '😊', label: 'Normal', intensity: 'normal' },
  { level: 'slabit', emoji: '🌱', label: 'Slabit', intensity: 'minus' },
  { level: 'obosit', emoji: '😴', label: 'Obosit', intensity: 'minus' },
];

export function EnergyCheck(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(option: EnergyOption): void {
    const state = { energyLevel: option.level, intensityMod: option.intensity };
    if (option.intensity === 'minus') {
      navigate(gotoPath('energy-cause'), { state });
    } else {
      navigate(gotoPath('workout-preview'), { state });
    }
  }

  return (
    <section className="p-6 bg-paper" data-testid="energy-check">
      <h1 className="text-2xl font-semibold text-ink mb-6">Cum te simti azi?</h1>
      <div className="flex flex-col gap-3" role="list">
        {ENERGY_OPTIONS.map((opt) => (
          <button
            key={opt.level}
            type="button"
            onClick={() => handleSelect(opt)}
            data-energy-level={opt.level}
            data-intensity={opt.intensity}
            className="energy-btn flex items-center gap-4 p-4 rounded-xl border border-[var(--line-strong)] bg-paper2 hover:bg-paper transition"
          >
            <span className="text-3xl" aria-hidden="true">
              {opt.emoji}
            </span>
            <span className="text-base font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
