// ENERGY CHECK - Phase 3 task_05 §A Rewrite Stub -> Real
// Per spec §2 A energy check 5-option emoji selector + flow routing.
// Mockup andura-clasic.html#L878-897 reference (3-state); spec extends la
// 5-option (Excelent / Bine / Normal / Slabit / Obosit) cu intensity 'plus'
// / 'normal' / 'minus' map. Slabit + Obosit -> energy-cause; restul ->
// inapoi la pagina MAIN (Antrenor). Intensity propagat via workoutStore
// sessionEnergy slice (#69 pre-workout reframe 2026-06-08): self-report-ul e
// inregistrat AICI, dar flow-ul se intoarce la hub inainte de Start, deci
// location.state nu mai supravietuieste round-trip-ul -> sessionEnergy e
// purtatorul durabil citit de WorkoutPreview.
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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { saveReadiness } from '../../../../engine/readiness.js';
import { useWorkoutStore } from '../../../stores/workoutStore';
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

// 5-step Pulse energy ramp volt -> aqua -> gold -> ember -> ember-red, 1:1 with
// the mockup (interfata-noua/data.jsx energy[]: excellent=volt, good=aqua,
// normal=gold, low=ember, tired=ember-red). Adjacent states read distinctly and
// every hue is a palette token (no raw hex). Dots are decorative (aria-hidden).
const ENERGY_OPTIONS: readonly EnergyOption[] = [
  { level: 'excelent', color: 'var(--volt)', labelKey: 'energyCheck.levels.excellent', hintKey: 'energyCheck.levels.excellentHint', intensity: 'plus', readiness: 5 },
  { level: 'bine', color: 'var(--aqua)', labelKey: 'energyCheck.levels.good', hintKey: 'energyCheck.levels.goodHint', intensity: 'normal', readiness: 4 },
  { level: 'normal', color: 'var(--gold)', labelKey: 'energyCheck.levels.normal', hintKey: 'energyCheck.levels.normalHint', intensity: 'normal', readiness: 3 },
  { level: 'slabit', color: 'var(--ember)', labelKey: 'energyCheck.levels.weak', hintKey: 'energyCheck.levels.weakHint', intensity: 'minus', readiness: 2 },
  { level: 'obosit', color: 'var(--ember-red)', labelKey: 'energyCheck.levels.tired', hintKey: 'energyCheck.levels.tiredHint', intensity: 'minus', readiness: 1 },
];

export function EnergyCheck(): JSX.Element {
  const navigate = useNavigate();
  const setSessionEnergy = useWorkoutStore((s) => s.setSessionEnergy);
  // #69 pre-workout reframe — selecting a level HIGHLIGHTS it (no auto-navigate);
  // the explicit Continue CTA commits + routes. null until the user picks.
  const [selected, setSelected] = useState<EnergyOption | null>(null);

  function handleContinue(): void {
    if (!selected) return;
    // Persist self-report to the engine readiness store (per-UID) so the read
    // side (getComputedReadinessScore) is no longer starved — UNCHANGED contract.
    saveReadiness(selected.readiness);
    // #69 — the flow now returns to the MAIN page (or energy-cause for minus)
    // before Start, so location.state cannot survive the round-trip. Record the
    // self-report in the workoutStore sessionEnergy slice (the durable carrier
    // WorkoutPreview reads). Drained/Exhausted (minus) still route to the cause
    // drill first; everything else returns straight to the hub.
    setSessionEnergy({ energyLevel: selected.level, intensityMod: selected.intensity });
    if (selected.intensity === 'minus') {
      navigate(gotoPath('energy-cause'));
    } else {
      navigate(gotoPath('antrenor'));
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
      <div className="p-6 flex-1 flex flex-col">
      {/* Pulse reskin (mockup interfata-noua/screens-workout.jsx:38-50) — display
          h1 promoted to a bolder title; body keeps the verbose "Cum te simti azi?"
          for user familiarity (h2 semantic preserved per PAR-009 single-h1
          SubHeader pattern + test contract level:2). */}
      <h2 className="font-display text-2xl font-bold text-ink mb-2">{t('energyCheck.title')}</h2>
      <p className="text-base text-ink2 mb-6">
        {t('energyCheck.subtitle')}
      </p>
      {/* #69 — the time-budget chips moved OFF this screen onto the dedicated
          TimeBudget step (shown after Start). EnergyCheck now ONLY captures the
          energy level: tap selects/highlights (no auto-navigate), then Continue. */}
      <div className="flex flex-col gap-3">
        {ENERGY_OPTIONS.map((opt, i) => {
          const isSelected = selected?.level === opt.level;
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => setSelected(opt)}
              data-energy-level={opt.level}
              data-intensity={opt.intensity}
              data-selected={isSelected}
              aria-pressed={isSelected}
              className="energy-btn pulse-card flex items-center gap-4 p-4 hover:border-lineStrong transition text-left animate-card-rise"
              style={{
                animationDelay: `${i * 0.05}s`,
                ...(isSelected
                  ? { borderColor: opt.color, background: `color-mix(in oklab, ${opt.color} 10%, transparent)` }
                  : {}),
              }}
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
            </button>
          );
        })}
      </div>
      {/* #69 explicit Continue CTA — commits the self-report + routes (minus →
          energy-cause, otherwise back to the hub). Disabled until a level is picked.
          CTA-FOLD FIX (2026-06-12, founder live phone) — the prior `flex-1`
          spacer here shoved this button to the very bottom of the min-h-screen
          column, so after picking an energy level the user faced a long dead gap
          and had to reach/scroll down to Continue. Dropped the spacer so the CTA
          flows directly under the options (matching EnergyCause/PainButton/
          EquipmentSwap), visible in-viewport the moment a level is chosen. The
          mt-6 keeps a comfortable gap; the section still scrolls if the 5 cards
          ever overflow a very short device. */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!selected}
        data-testid="energy-check-continue"
        className="btn-primary-lift press-feedback pulse-grad-bg pulse-shine mt-6 w-full rounded-full py-3.5 px-4 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ color: 'var(--on-accent)' }}
      >
        <span>{t('energyCheck.submitCta')}</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
      </div>
    </section>
  );
}
