// ══ BODY FAT STRIP — BUG #12b: surface bf% estimat in Progres ════════════
// Afiseaza estimarea de grasime corporala (bf%) pe tab-ul Progres, langa BMR.
// Pana acum bf%-ul era calculat (US-Navy / Deurenberg, two-tier) dar surfat
// DOAR in SettingsProfile (editare) — nu si pe dashboard-ul Progres. Aici il
// aratam cu caveat "estimat" + sursa (US Navy cand exista talie+gat masurate,
// altfel Estimat = Deurenberg din BMI/varsta/sex).
//
// Two-tier mirror nutritionProjection.deriveCurrentBfPct + SettingsProfile:
//   - ACURAT: US-Navy cand talie+gat masurate (progresStore.bodyData) + height/sex.
//   - ESTIMAT: fallback Deurenberg cu cap high-BMI (mereu disponibil post-
//     onboarding Big6+height). Smoke 2026-05-28 #1: cap-ul `min(Deurenberg,
//     BMI×0.85)` aplicat la BMI>=27 (Deurenberg supraevalueaza la BMI mare).
//     Aplicat numai pe surface UI — engine path neatins.
// Stil aliniat BMRStrip ("Calorii baza" strip) — single number + caveat, NU bar.
// Placeholder cand stats incomplete (T0 fresh user pre-onboarding).

import type { JSX } from 'react';
import { Percent } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useProgresStore, latestBodyMeasurements } from '../../stores/progresStore';
import { estimateBF_USNavy } from '../../../engine/usNavyBF.js';
import { estimateBfDeurenbergCapped } from '../../../engine/bodyComposition.js';
import { getCurrentWeightKg } from '../../lib/userTdee';
import { DB } from '../../../db.js';
import { t } from '../../../i18n/index.js';

export function BodyFatStrip(): JSX.Element {
  const sex = useOnboardingStore((s) => s.data.sex);
  const age = useOnboardingStore((s) => s.data.age);
  const height = useOnboardingStore((s) => s.data.height);
  const bodyData = useProgresStore((s) => s.bodyData);
  // Smoke 2026-05-28 #15 — agregare per camp peste TOATE intrarile. Un user
  // care a introdus gat in Cont apoi piept in Progres tot vede BF% US Navy
  // (gat-ul nu se pierde pentru ca intrarea ulterioara n-are gat). SSOT.
  const latest = latestBodyMeasurements(bodyData);
  // Sursa canonica UNICA de greutate curenta: getCurrentWeightKg (ultima
  // greutate LOGATA dupa DATA > onboarding) — aceeasi sursa pe care o folosesc
  // TDEE/BMR/proteine. Era un read ad-hoc `weightLog[length-1]` (ultima POZITIE
  // in array, NU cea mai recenta DATA) → o cantarire back-dated sau o editare de
  // greutate in profil nu mutau bf% (split source-of-truth, audit CRIT).
  // Subscribe la weightLog ca strip-ul sa re-randeze cand se logheaza/editeaza.
  useProgresStore((s) => s.weightLog);
  const weight = getCurrentWeightKg();

  // Tier 1 (ACURAT) — US-Navy cand talie+gat masurate. Build arg omitting empty
  // fields (exactOptionalPropertyTypes); engine returneaza null daca lipseste
  // ceva SAU masuratorile sunt in afara benzii fiziologice (plauzibilitate).
  let bfNavy: number | null = null;
  if (latest.waistCm != null && latest.neckCm != null) {
    const args: { sex?: string; height_cm?: number; neck_cm?: number; waist_cm?: number; hip_cm?: number } = {};
    if (sex) args.sex = sex;
    if (height) args.height_cm = height;
    args.neck_cm = latest.neckCm;
    args.waist_cm = latest.waistCm;
    if (latest.hipsCm != null) args.hip_cm = latest.hipsCm;
    bfNavy = estimateBF_USNavy(args);
  }

  // Tier 2 (ESTIMAT) — Deurenberg din onboarding cu cap high-BMI (mereu
  // disponibil post-onb). Smoke 2026-05-28 #1: la BMI>=27 cap-ul `min(raw,
  // BMI×0.85)` reduce bias-ul cunoscut al formulei Deurenberg.
  const { bfPct: bfDeurenberg, capped } = estimateBfDeurenbergCapped({
    weightKg: weight ?? NaN,
    heightCm: height ?? NaN,
    ageYears: age ?? NaN,
    ...(sex ? { sex } : {}),
  });
  // §08.038 — manual BF% override (Cont > Profil) wins over auto US-Navy/
  // Deurenberg, mirroring sys.getBF() which prioritizes `bf-override` over every
  // calculation. Without this the override the user sets in Profil never showed
  // on its primary surface (this strip). Read on render — a remount on tab
  // navigation back from Profil picks up the freshly-saved value.
  const bfOverrideRaw = DB.get('bf-override');
  const bfOverride = bfOverrideRaw != null ? Number(bfOverrideRaw) : null;
  const hasOverride = bfOverride != null && Number.isFinite(bfOverride);
  const bfAuto = bfNavy ?? bfDeurenberg;
  const bf = hasOverride ? bfOverride : bfAuto;
  const isUsingDeurenberg = !hasOverride && bfNavy == null && bfDeurenberg != null;
  const sourceLabel = hasOverride
    ? t('progres.bodyFat.sourceManual')
    : bfNavy != null
      ? t('progres.bodyFat.sourceUsNavy')
      : t('progres.bodyFat.sourceEstimated');

  return (
    <section
      data-testid="bodyfat-strip"
      className="pulse-card pulse-card-tight p-4 mb-4 flex items-center gap-4"
      aria-label={t('progres.bodyFat.ariaLabel')}
    >
      <Percent className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          {t('progres.bodyFat.label')}
        </p>
        {bf != null ? (
          <>
            <p className="text-xl font-bold text-ink font-mono" data-testid="bodyfat-value">
              {bf}%{' '}
              <span className="text-sm font-normal text-ink2 ml-2" data-testid="bodyfat-source">
                {sourceLabel}
              </span>
            </p>
            {/* Smoke 2026-05-28 #1 — la estimat (fara talie/gat masurate)
                surface caveat + nudge la sursa precisa. La cap activat (BMI
                mare) suplimentar onestitate: "aproximativ" in loc de tacut. */}
            {isUsingDeurenberg && (
              <p
                className="text-xs text-ink3 mt-1 leading-snug"
                data-testid="bodyfat-cta"
              >
                {capped ? t('progres.bodyFat.captionApprox') : t('progres.bodyFat.captionFromBmi')}
                {t('progres.bodyFat.nudge')}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink2" data-testid="bodyfat-empty">
            {t('progres.bodyFat.emptyHint')}
          </p>
        )}
      </div>
    </section>
  );
}
