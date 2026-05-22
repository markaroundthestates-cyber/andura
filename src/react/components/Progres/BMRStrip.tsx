// ══ BMR STRIP — §F-pass2-fatiguestrip-02 mockup L1723 side-by-side ════════
// Per mockup andura-clasic.html#L1716-1728 "Calorii baza" strip side-by-side
// with Oboseala 2-col grid. Daniel LOCKED V1 "single number NU visual bar".
//
// Mifflin-St Jeor BMR formula (gold standard 1990, more accurate than Harris-
// Benedict for modern populations):
//   M: 10·kg + 6.25·cm - 5·age + 5
//   F: 10·kg + 6.25·cm - 5·age - 161
//
// Height NOT collected in OnboardingData (D046 §28-H5 GDPR scope: age/sex/
// weight/goal/frequency/experience only). Average-by-sex fallback per
// Romanian population norms 178cm M / 165cm F provides usable BMR estimate
// without adding onboarding friction (Gigel filter). Post-Beta optional
// height field consideration.
//
// Renders empty placeholder cand sex/weight/age incomplete (T0 fresh user
// pre-onboarding).

import type { JSX } from 'react';
import { Flame } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Sex } from '../../stores/onboardingStore';

// Romanian population height averages (INS data ~2020). Used as BMR fallback
// when explicit height NU collected (current onboarding scope). Heuristic
// surfaces useful estimate vs no data at all (Gigel filter: scan-ready value).
const HEIGHT_CM_BY_SEX_AVG: Record<Sex, number> = {
  m: 178,
  f: 165,
};

/**
 * Mifflin-St Jeor BMR (kcal/day). Returns null cand inputs incomplete.
 */
function computeMifflinStJeorBMR(
  sex: Sex | null,
  weightKg: number | null,
  ageYears: number | null,
): number | null {
  if (sex === null || weightKg === null || ageYears === null) return null;
  if (weightKg <= 0 || ageYears <= 0) return null;
  const heightCm = HEIGHT_CM_BY_SEX_AVG[sex];
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = sex === 'm' ? base + 5 : base - 161;
  return Math.round(bmr);
}

export function BMRStrip(): JSX.Element {
  const sex = useOnboardingStore((s) => s.data.sex);
  const weight = useOnboardingStore((s) => s.data.weight);
  const age = useOnboardingStore((s) => s.data.age);
  const bmr = computeMifflinStJeorBMR(sex, weight, age);

  return (
    <section
      data-testid="bmr-strip"
      className="bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-4"
      aria-label="Calorii baza BMR"
    >
      <Flame className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          Calorii baza
        </p>
        {bmr !== null ? (
          <p className="text-xl font-bold text-ink font-mono" data-testid="bmr-value">
            {bmr.toLocaleString('ro-RO').replace(/,/g, ' ')}
            <span className="text-sm font-normal text-ink2 ml-2">kcal/zi</span>
          </p>
        ) : (
          <p className="text-sm text-ink2" data-testid="bmr-empty">
            Completeaza profilul pentru estimare.
          </p>
        )}
      </div>
    </section>
  );
}
