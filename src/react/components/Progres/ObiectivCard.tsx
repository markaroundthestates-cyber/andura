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
//   - Pana in input (YYYY-MM) — HTML month picker (deadline desired).
//   - Realistic ETA derived from current weight + target + height at a safe
//     rate (0.5 kg/sapt loss / 0.25 kg/sapt gain via lib/targetEta).
//   - Subponderal guard: target below BMI 18.5 floor → warning, NO projection.
//
// Persistence: progresStore.setTargetObiectiv (zustand persist localStorage).

import type { JSX } from 'react';
import { Target } from 'lucide-react';
import { useProgresStore } from '../../stores/progresStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { getCurrentWeightKg } from '../../lib/userTdee';
import { computeTargetEta, fmtKg } from '../../lib/targetEta';

export function ObiectivCard(): JSX.Element {
  const target = useProgresStore((s) => s.targetObiectiv);
  const setTarget = useProgresStore((s) => s.setTargetObiectiv);
  const height = useOnboardingStore((s) => s.data.height);
  // §weight-continuity — canonical current weight = latest log > onboarding
  // seed (cross-screen consistency with SettingsProfile, NutritionInline etc).
  const currentWeightKg = getCurrentWeightKg();

  const eta = computeTargetEta(target.weightKg, currentWeightKg, height ?? null);

  function handleWeightChange(value: string): void {
    if (value === '') {
      setTarget({ weightKg: null });
      return;
    }
    const n = Number(value);
    setTarget({ weightKg: Number.isFinite(n) && n > 0 ? n : null });
  }

  function handleMonthChange(value: string): void {
    // HTML <input type="month"> returns YYYY-MM or "". Empty → clear.
    setTarget({ month: value === '' ? null : value });
  }

  return (
    <section
      className="mb-5"
      data-testid="obiectiv-card"
      aria-labelledby="obiectiv-card-heading"
    >
      <p
        id="obiectiv-card-heading"
        className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2 flex items-center gap-1.5"
      >
        <Target className="w-3.5 h-3.5" aria-hidden="true" />
        Obiectiv
      </p>
      <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
        <label className="flex items-center justify-between px-4 py-3 border-b border-line">
          <span className="text-sm text-ink">Greutate tinta (kg)</span>
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
          <span className="text-sm text-ink">Pana in</span>
          <input
            type="month"
            value={target.month ?? ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            data-testid="obiectiv-target-month-input"
            className="w-36 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-[13px]"
          />
        </label>
      </div>
      {eta?.kind === 'subhealthy' && (
        <p
          className="text-xs text-brick mt-2 px-1 leading-snug font-medium"
          role="alert"
          data-testid="obiectiv-warning"
        >
          Tinta e sub greutatea sanatoasa (~{fmtKg(eta.minKg)} kg minim la inaltimea ta). Alege o tinta sanatoasa.
        </p>
      )}
      {eta?.kind === 'at-target' && (
        <p
          className="text-xs text-succ mt-2 px-1 leading-snug font-medium"
          data-testid="obiectiv-at-target"
        >
          Esti deja la tinta.
        </p>
      )}
      {eta?.kind === 'eta' && (
        <p
          className="text-xs text-ink3 mt-2 px-1 leading-snug"
          data-testid="obiectiv-eta"
        >
          Estimat in {eta.label} la un ritm sanatos.
        </p>
      )}
    </section>
  );
}
