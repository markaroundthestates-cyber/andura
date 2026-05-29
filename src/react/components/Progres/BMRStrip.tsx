// ══ BMR STRIP — §F-pass2-fatiguestrip-02 mockup L1723 side-by-side ════════
// Per mockup andura-clasic.html#L1716-1728 "Calorii baza" strip side-by-side
// with Oboseala 2-col grid. Daniel LOCKED V1 "single number NU visual bar".
//
// Mifflin-St Jeor BMR formula (gold standard 1990, more accurate than Harris-
// Benedict for modern populations):
//   M: 10·kg + 6.25·cm - 5·age + 5
//   F: 10·kg + 6.25·cm - 5·age - 161
//
// Height collected in onboarding (P-02 — step 7, fitness metric pentru
// Mifflin-St Jeor BMR + US Navy BF%). Real height din onboardingStore.data.
// height feeds formula direct. Sex-average fallback per Romanian population
// norms (178cm M / 165cm F) pastrat DOAR pentru useri pre-v3 cu height null
// (onboarded inainte de P-02) — zero regresie BMR pentru ei.
//
// Renders empty placeholder cand sex/weight/age incomplete (T0 fresh user
// pre-onboarding).

import type { JSX } from 'react';
import { Flame } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import type { Sex } from '../../stores/onboardingStore';
import { getCurrentWeightKg } from '../../lib/userTdee';
import { useCountUp } from '../../hooks/useCountUp';
import { t } from '../../../i18n/index.js';

// Romanian population height averages (INS data ~2020). BMR fallback DOAR
// pentru useri pre-v3 cu height null (onboarded inainte de P-02). Heuristic
// surfaces useful estimate vs no data at all (Gigel filter: scan-ready value).
const HEIGHT_CM_BY_SEX_AVG: Record<Sex, number> = {
  m: 178,
  f: 165,
};

/**
 * Mifflin-St Jeor BMR (kcal/day). Returns null cand inputs incomplete.
 * Foloseste height-ul colectat (P-02); fallback sex-avg doar cand height null
 * (user pre-v3) — Gigel vede estimare utila in loc de placeholder.
 */
function computeMifflinStJeorBMR(
  sex: Sex | null,
  weightKg: number | null,
  ageYears: number | null,
  heightCm: number | null,
): number | null {
  if (sex === null || weightKg === null || ageYears === null) return null;
  if (weightKg <= 0 || ageYears <= 0) return null;
  const h = heightCm !== null && heightCm > 0 ? heightCm : HEIGHT_CM_BY_SEX_AVG[sex];
  const base = 10 * weightKg + 6.25 * h - 5 * ageYears;
  const bmr = sex === 'm' ? base + 5 : base - 161;
  return Math.round(bmr);
}

export function BMRStrip(): JSX.Element {
  const sex = useOnboardingStore((s) => s.data.sex);
  const age = useOnboardingStore((s) => s.data.age);
  const height = useOnboardingStore((s) => s.data.height);
  // Sursa canonica UNICA de greutate curenta: getCurrentWeightKg (ultima
  // greutate LOGATA dupa DATA > onboarding) — aceeasi sursa pe care o folosesc
  // TDEE/BodyFatStrip. Era un read pozitional `weightLog[length-1]` (ultima
  // POZITIE in array, NU cea mai recenta DATA) → o cantarire back-dated afisa
  // greutatea gresita in BMR (split source-of-truth, audit 03.030).
  // Subscribe la weightLog ca strip-ul sa re-randeze cand se logheaza/editeaza.
  useProgresStore((s) => s.weightLog);
  const weight = getCurrentWeightKg();
  const bmr = computeMifflinStJeorBMR(sex, weight, age, height);
  // Count-up the BMR hero number (2026-05-27). Hook called unconditionally
  // (rules of hooks); 0 fallback when bmr null — only rendered in the bmr!==null
  // branch. Snaps under reduced motion; final value synchronous in tests.
  const bmrDisplay = useCountUp(bmr ?? 0);

  return (
    <section
      data-testid="bmr-strip"
      className="pulse-card pulse-card-tight pulse-card-glow overflow-hidden p-4 mb-4 flex items-center gap-4 animate-card-rise"
      style={{ ['--wash' as string]: 'var(--volt)' }}
      aria-label={t('bodyComp.bmrStrip.ariaLabel')}
    >
      {/* Pulse MiniStat parity (11.403, interfata-noua/screens-tabs.jsx:43,126):
          BMR is the "Base calories" MiniStat — volt corner tile-wash (via the
          shared .pulse-card-glow ::after + inline --wash) + a volt-tinted icon.
          Replaces the prior bespoke brick wash span. volt is a CSS var, not a
          Tailwind color, so the icon hue is applied inline. */}
      <Flame
        className="relative w-6 h-6 flex-shrink-0"
        style={{ color: 'var(--volt)' }}
        aria-hidden="true"
      />
      <div className="relative flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          {t('bodyComp.bmrStrip.label')}
        </p>
        {bmr !== null ? (
          <p className="text-xl font-bold text-ink font-mono" data-testid="bmr-value">
            {bmrDisplay.toLocaleString('ro-RO').replace(/,/g, ' ')}{' '}
            <span className="text-sm font-normal text-ink2 ml-2">{t('bodyComp.bmrStrip.valueSuffix')}</span>
          </p>
        ) : (
          <p className="text-sm text-ink2" data-testid="bmr-empty">
            {t('bodyComp.bmrStrip.emptyHint')}
          </p>
        )}
      </div>
    </section>
  );
}
