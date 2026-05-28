// ENERGY CHECK - Phase 3 task_05 §A Rewrite Stub -> Real
// Per spec §2 A energy check 5-option emoji selector + flow routing.
// Mockup andura-clasic.html#L878-897 reference (3-state); spec extends la
// 5-option (Excelent / Bine / Normal / Slabit / Obosit) cu intensity 'plus'
// / 'normal' / 'minus' map. Slabit + Obosit -> energy-cause; restul ->
// direct workout-preview. Intensity propagated via location.state pentru
// Phase 3 izolare flow (Phase 4+ trece la workoutStore intensity slice).
//
// Mockup parity (andura-clasic.html L878-897 traffic-light + per-option hint
// subtitle). 5-option spec extension preserved (intent: granular self-report)
// cu 5-step distinct color ramp green -> lime -> yellow -> orange -> red — fiecare
// stare citeste diferit (prior emoji bucket bine+normal yellow / slabit+obosit
// red erau indistinct). Color dot is aria-hidden decorative.
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
import { ChevronRight } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { saveReadiness } from '../../../../engine/readiness.js';
import { t } from '../../../../i18n/index.js';

export type EnergyLevel = 'excelent' | 'bine' | 'normal' | 'slabit' | 'obosit';
export type IntensityMod = 'plus' | 'normal' | 'minus';

interface EnergyOption {
  level: EnergyLevel;
  color: string;
  /** i18n key under energyCheck.levels.* — visible label localized at render. */
  labelKey: string;
  /** i18n key under energyCheck.levels.* — sub-hint localized at render. */
  hintKey: string;
  intensity: IntensityMod;
  // 1-5 readiness value persisted per-UID via saveReadiness (engine
  // readiness.js#getComputedReadinessScore read-side: StatsGrid /
  // ReadinessVerdict / energyDirection / rest gates). Maps the 5 self-report
  // options to the engine readinessPoints scale (1=Epuizat .. 5=Excelent,
  // readiness.js#READINESS_LABELS). Pre-fix EnergyCheck wrote ONLY navigation
  // location.state → saveReadiness had ZERO React callers → score permanent null.
  readiness: 1 | 2 | 3 | 4 | 5;
}

// 5-step distinct color ramp green -> lime -> yellow -> orange -> red so
// adjacent states read differently (prior emoji bucketed bine+normal yellow,
// slabit+obosit red -> indistinguishable). Anchored pe palette tokens succ/
// warn/danger; lime + orange interpolate steps 2/4 warm-consistent.
const ENERGY_OPTIONS: readonly EnergyOption[] = [
  { level: 'excelent', color: 'var(--succ)', labelKey: 'energyCheck.levels.excellent', hintKey: 'energyCheck.levels.excellentHint', intensity: 'plus', readiness: 5 },
  { level: 'bine', color: '#6b9e3f', labelKey: 'energyCheck.levels.good', hintKey: 'energyCheck.levels.goodHint', intensity: 'normal', readiness: 4 },
  { level: 'normal', color: 'var(--warn)', labelKey: 'energyCheck.levels.normal', hintKey: 'energyCheck.levels.normalHint', intensity: 'normal', readiness: 3 },
  { level: 'slabit', color: '#d4702a', labelKey: 'energyCheck.levels.weak', hintKey: 'energyCheck.levels.weakHint', intensity: 'minus', readiness: 2 },
  { level: 'obosit', color: 'var(--danger)', labelKey: 'energyCheck.levels.tired', hintKey: 'energyCheck.levels.tiredHint', intensity: 'minus', readiness: 1 },
];

export function EnergyCheck(): JSX.Element {
  const navigate = useNavigate();

  function handleSelect(option: EnergyOption): void {
    // Persist self-report to the engine readiness store (per-UID) so the read
    // side (getComputedReadinessScore) is no longer starved. ADD to the
    // existing navigation flow — location.state is still consumed downstream
    // (WorkoutPreview banner + energy-cause routing), NOT removed.
    saveReadiness(option.readiness);
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
        title={t('energyCheck.subHeaderTitle')}
        onBack={handleBack}
        testIdBack="energy-check-back"
      />
      <div className="p-6 flex-1">
      {/* Pulse reskin (mockup interfata-noua/screens-workout.jsx:38-50) — display
          h1 promoted to a bolder title; body keeps the verbose "Cum te simti azi?"
          for user familiarity (h2 semantic preserved per PAR-009 single-h1
          SubHeader pattern + test contract level:2). */}
      <h2 className="font-display text-2xl font-bold text-ink mb-2">{t('energyCheck.title')}</h2>
      <p className="text-base text-ink2 mb-6">
        {t('energyCheck.subtitle')}
      </p>
      <div className="flex flex-col gap-3">
        {ENERGY_OPTIONS.map((opt, i) => (
          <button
            key={opt.level}
            type="button"
            onClick={() => handleSelect(opt)}
            data-energy-level={opt.level}
            data-intensity={opt.intensity}
            className="energy-btn flex items-center gap-4 p-4 rounded-[18px] border border-line bg-paper2 hover:border-lineStrong transition text-left animate-card-rise"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Glowing dot (mockup .energy-dot) — the per-state color drives a soft
                bloom so adjacent energy levels read distinctly. Decorative
                (aria-hidden); the label owns the accessible name. */}
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: opt.color, boxShadow: `0 0 16px ${opt.color}` }}
              aria-hidden="true"
            />
            <span className="flex flex-col flex-1 min-w-0">
              <span className="font-display text-base font-semibold text-ink">{t(opt.labelKey)}</span>
              <span className="text-sm text-ink2">{t(opt.hintKey)}</span>
            </span>
            <ChevronRight className="w-[18px] h-[18px] text-ink3 flex-shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
      </div>
    </section>
  );
}
