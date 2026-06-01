// ══ OBIECTIV CARD — Target Weight + Deadline + ETA (Progres tab) ═════════
// §obiectiv-tinta 2026-05-28 Daniel verbatim "tot ce e la Obiectiv, pe toate
// themes trebuie mutat la progres undeva". Moved from Cont > Profil si tinte
// (SettingsProfile.tsx "Tinte personale") where the values were ephemeral
// local form state (discarded between visits) — useless for actual progress
// tracking. Now lives at the top of Progres tab where it logically belongs
// alongside current weight + trend, and is persisted in progresStore.
//
// Surfaces:
//   - Greutate tinta input (kg) — number, 30-250 range like SettingsProfile.
//   - Pana in input (YYYY-MM-DD) — HTML date picker (deadline desired, full
//     day precision per Daniel feedback 2026-06-01 "vreau sa aleg si ziua").
//     Legacy YYYY-MM values (month-only) hydrate by defaulting to day 01 so
//     the native date input shows a value instead of going blank.
//   - Realistic ETA derived from current weight + target + height at a safe
//     rate (0.5 kg/sapt loss / 0.25 kg/sapt gain via lib/targetEta).
//   - Subponderal guard: target below BMI 18.5 floor → warning, NO projection.
//
// Persistence: progresStore.setTargetObiectiv (zustand persist localStorage).

import type { JSX } from 'react';
import { useState } from 'react';
import { useProgresStore } from '../../stores/progresStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { getCurrentWeightKg } from '../../lib/userTdee';
import { computeTargetEta, fmtKg } from '../../lib/targetEta';
import { evaluateTargetRate, MAX_SAFE_KG_PER_WEEK } from '../../lib/targetSafety';
import { dangerousFloorWeightKg } from '../../../engine/bodyComposition.js';
import { t } from '../../../i18n/index.js';

/**
 * §i18n 2026-05-28 — pluralized horizon label via t() keys. Uses CLDR-style
 * "_one" / "_other" suffix per locale (English: 1 month/2 months; Romanian:
 * 1 luna/2 luni). The pure `etaHorizonLabel` in lib/targetEta.ts still emits
 * a Romanian default for legacy non-React callers (e.g. ad-hoc CDL strings);
 * this React-side helper wraps it in i18n.
 */
function localizeEta(weeks: number): string {
  if (weeks < 8) {
    const key = weeks === 1 ? 'obiectiv.weeks_one' : 'obiectiv.weeks_other';
    return t(key, { n: weeks });
  }
  const months = Math.round(weeks / 4.345);
  const key = months === 1 ? 'obiectiv.months_one' : 'obiectiv.months_other';
  return t(key, { n: months });
}

export function ObiectivCard(): JSX.Element {
  const target = useProgresStore((s) => s.targetObiectiv);
  const setTarget = useProgresStore((s) => s.setTargetObiectiv);
  const height = useOnboardingStore((s) => s.data.height);
  // §weight-continuity — canonical current weight = latest log > onboarding
  // seed (cross-screen consistency with SettingsProfile, NutritionInline etc).
  const currentWeightKg = getCurrentWeightKg();
  // §obiectiv-floor 2026-06-01 — kg-ul clamp-uit la floor-ul fiziologic (BMI 17)
  // declanseaza un mesaj vizibil. Local UI state (NU persistat): semnaleaza ca
  // valoarea introdusa a fost respinsa/ridicata, fara sa salvam o tinta letala.
  const [clampedFromKg, setClampedFromKg] = useState<number | null>(null);

  const eta = computeTargetEta(target.weightKg, currentWeightKg, height ?? null);
  // §obiectiv-tinta integration (Smoke #16) — surface verdict cand ritm-ul
  // necesar depaseste cap-ul fiziologic (1.5kg/sapt). evaluateTargetRate
  // accepta YYYY-MM (daysUntilTarget interpreteaza ca ultima zi a lunii).
  const rateVerdict = evaluateTargetRate(currentWeightKg, target.weightKg, target.month);

  // HTML <input type="date"> only renders its value when given a full YYYY-MM-DD.
  // A legacy month-only stored deadline (YYYY-MM) would show blank, so default
  // it to the first day of that month for display. Pure presentation — the
  // stored value is left untouched until the user actually changes it.
  const deadlineInputValue =
    target.month && /^\d{4}-\d{2}$/.test(target.month) ? `${target.month}-01` : target.month ?? '';

  function handleWeightChange(value: string): void {
    if (value === '') {
      setClampedFromKg(null);
      setTarget({ weightKg: null });
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      setClampedFromKg(null);
      setTarget({ weightKg: null });
      return;
    }
    // §obiectiv-floor — floor HARD fiziologic (BMI 17 la inaltimea user-ului).
    // O tinta sub el (ex: 20kg/160cm = BMI 7.8, letal) NU se salveaza ca atare —
    // o ridicam (clamp) la floor + afisam warning. Banda 17-18.5 trece (doar
    // subhealthy warning, vezi mai jos). Fara inaltime → nu putem calcula floor,
    // accept valoarea (defense-in-depth ramane in alta parte).
    const floorKg = dangerousFloorWeightKg(height ?? NaN);
    if (floorKg !== null && n < floorKg) {
      setClampedFromKg(n);
      setTarget({ weightKg: floorKg });
      return;
    }
    setClampedFromKg(null);
    setTarget({ weightKg: n });
  }

  function handleDeadlineChange(value: string): void {
    // HTML <input type="date"> returns YYYY-MM-DD or "". Empty → clear. The
    // full date flows straight through to the store + daysUntilTarget consumers
    // (both already accept YYYY-MM-DD with day-level precision).
    setTarget({ month: value === '' ? null : value });
  }

  return (
    <section
      className="mb-5"
      data-testid="obiectiv-card"
      aria-label={t('obiectiv.heading')}
    >
      <div className="pulse-card overflow-hidden">
        <label className="flex items-center justify-between px-4 py-3 border-b border-line">
          <span className="text-sm text-ink">{t('obiectiv.targetWeightLabel')}</span>
          <input
            type="number"
            min={30}
            max={250}
            step={0.1}
            inputMode="decimal"
            autoComplete="off"
            value={target.weightKg ?? ''}
            onChange={(e) => handleWeightChange(e.target.value)}
            data-testid="obiectiv-target-weight-input"
            placeholder="—"
            className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
          />
        </label>
        <label className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-ink">{t('obiectiv.targetMonthLabel')}</span>
          <input
            type="date"
            value={deadlineInputValue}
            onChange={(e) => handleDeadlineChange(e.target.value)}
            data-testid="obiectiv-target-month-input"
            className="w-36 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-[13px]"
          />
        </label>
      </div>
      {clampedFromKg !== null && (
        <p
          className="text-xs text-brick mt-2 px-1 leading-snug font-medium"
          role="alert"
          data-testid="obiectiv-clamped-warning"
        >
          {t('obiectiv.targetClampedWarning', {
            entered: fmtKg(clampedFromKg),
            floor: fmtKg(target.weightKg ?? 0),
          })}
        </p>
      )}
      {eta?.kind === 'subhealthy' && (
        <p
          className="text-xs text-brick mt-2 px-1 leading-snug font-medium"
          role="alert"
          data-testid="obiectiv-warning"
        >
          {t('obiectiv.subhealthyWarning', { minKg: fmtKg(eta.minKg) })}
        </p>
      )}
      {eta?.kind !== 'subhealthy' && rateVerdict?.kind === 'unsafe' && (
        <p
          className="text-xs text-brick mt-2 px-1 leading-snug font-medium"
          role="alert"
          data-testid="obiectiv-rate-warning"
        >
          {t('obiectiv.unsafeRateWarning', {
            rate: fmtKg(rateVerdict.requiredKgPerWeek),
            direction: t(
              rateVerdict.direction === 'loss'
                ? 'obiectiv.unsafeDirectionLoss'
                : 'obiectiv.unsafeDirectionGain',
            ),
            cap: String(MAX_SAFE_KG_PER_WEEK),
            safeDate: rateVerdict.safeDeadlineDate,
          })}
        </p>
      )}
      {eta?.kind === 'at-target' && (
        <p
          className="text-xs text-succ mt-2 px-1 leading-snug font-medium"
          data-testid="obiectiv-at-target"
        >
          {t('obiectiv.atTarget')}
        </p>
      )}
      {eta?.kind === 'eta' && (
        <p
          className="text-xs text-ink3 mt-2 px-1 leading-snug"
          data-testid="obiectiv-eta"
        >
          {t('obiectiv.etaPrefix')} {localizeEta(eta.weeks)} {t('obiectiv.etaSuffix')}
        </p>
      )}
    </section>
  );
}
