// ENERGY CHECK - Phase 3 task_05 §A Rewrite Stub -> Real
// Per spec §2 A energy check 5-option emoji selector + flow routing.
// Mockup andura-clasic.html#L878-897 reference (3-state); spec extends la
// 5-option (Excelent / Bine / Normal / Slabit / Obosit) cu intensity 'plus'
// / 'normal' / 'minus' map. Slabit + Obosit -> energy-cause; restul ->
// direct workout-preview. Intensity propagated via location.state pentru
// Phase 3 izolare flow (Phase 4+ trece la workoutStore intensity slice).
//
// Mockup parity (andura-clasic.html L878-897 traffic-light per intensity
// bucket): plus = green (U+1F7E2), normal = yellow (U+1F7E1), minus = red
// (U+1F534). 5-option spec extension preserved (intent: granular self-
// report), bucketed visually to mockup 3-state Excelent/Normal/Obosit
// color metaphor by intensity. Emoji is aria-hidden decorative.
//
// PAR-009 SubHeader consume — mockup andura-clasic.html L879 sub-header
// verbatim title "Cum te simti?" sticky top + back-btn. Body h1 "Cum te simti
// azi?" regresat h2 (single h1 SubHeader pattern parity CevaNuMerge/EnergyCause).
// Mockup short form "Cum te simti?" vs current verbose "Cum te simti azi?"
// preserve in body for user familiarity (no breaking semantic test on body
// text).
//
// §F-energy-check-04 (MED chat5 Wave 19) — body intro coach transparency
// per mockup andura-clasic.html#L881 "Coach-ul ajusteaza intensitatea pe
// baza energiei tale." Prod 5-state extends mockup 3-state (Excelent/Bine/
// Normal/Slabit/Obosit traffic-light bucketed plus/normal/minus) — omit
// "3 stari simple" mockup hint (inaccurate vs prod 5-option granularity);
// preserve universal transparency signal "Coach-ul ajusteaza intensitatea
// pe baza energiei tale." Anti-paternalism positioning Suflet Andura.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-021 Energy Adjustment ±15% range
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L878-897 screen-energy-check

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';

export type EnergyLevel = 'excelent' | 'bine' | 'normal' | 'slabit' | 'obosit';
export type IntensityMod = 'plus' | 'normal' | 'minus';

interface EnergyOption {
  level: EnergyLevel;
  emoji: string;
  label: string;
  intensity: IntensityMod;
}

const GREEN = '\u{1F7E2}';
const YELLOW = '\u{1F7E1}';
const RED = '\u{1F534}';

const ENERGY_OPTIONS: readonly EnergyOption[] = [
  { level: 'excelent', emoji: GREEN, label: 'Excelent', intensity: 'plus' },
  { level: 'bine', emoji: YELLOW, label: 'Bine', intensity: 'normal' },
  { level: 'normal', emoji: YELLOW, label: 'Normal', intensity: 'normal' },
  { level: 'slabit', emoji: RED, label: 'Slabit', intensity: 'minus' },
  { level: 'obosit', emoji: RED, label: 'Obosit', intensity: 'minus' },
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

  function handleBack(): void {
    navigate(-1);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="energy-check">
      <SubHeader
        title="Cum te simti?"
        onBack={handleBack}
        testIdBack="energy-check-back"
      />
      <div className="p-6 flex-1">
      <h2 className="text-2xl font-semibold text-ink mb-2">Cum te simti azi?</h2>
      <p className="text-base text-ink2 mb-6">
        Coach-ul ajusteaza intensitatea pe baza energiei tale.
      </p>
      <div className="flex flex-col gap-3">
        {ENERGY_OPTIONS.map((opt) => (
          <button
            key={opt.level}
            type="button"
            onClick={() => handleSelect(opt)}
            data-energy-level={opt.level}
            data-intensity={opt.intensity}
            className="energy-btn flex items-center gap-4 p-4 rounded-xl border border-lineStrong bg-paper2 hover:bg-paper transition"
          >
            <span className="text-3xl" aria-hidden="true">
              {opt.emoji}
            </span>
            <span className="text-base font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>
      </div>
    </section>
  );
}
