// ══ TDEE STRIP — Phase 6 task_22 Progres Dashboard Bayesian Target ═══════
// Real wire getNutritionTargetTodayReal async (task_04). Surface kcal +
// protein + source badge subtle (engine-bn / manual / baseline).
//
// §F-pass2-tdeestrip-01 (HIGH-EPSILON 2026-05-22) — mockup L1706 top row:
// Faza badge ("Faza: Auto" colored dot) + Sapt. counter ("Sapt. X /
// mesociclu") periodization context. Faza signal read from phase-override
// localStorage (B001 SchimbaFaza wire). Sapt counter derived from sessions
// count modulo 4 (4-week mesocycle convention; conservative defensive
// fallback to "1" cand sessions empty). Per Karpathy SF - local read pure
// pre-render, NO async wire pollution.
//
// HERO redesign (Daniel 2026-05-28 "Kcal recomandate trebuiau sa apara sus"):
// the recommended kcal is the most actionable number on the Progres screen, so
// it now reads as a HERO — big tabular num-display number; protein + source
// demoted to quiet secondary context. (Count-up was tried + dropped: on an
// async-resolved value it starts at 0 and only tweens via rAF, which reads as
// a flash on every load and breaks under no-rAF test envs.) Logic, i18n keys,
// and all testids unchanged — presentation-only.
//
// Pulse 1:1 parity (2026-05-29, interfata-noua/screens-tabs.jsx:21-39): the
// hero migrates to the glass card language (.pulse-card) with the mockup's aqua
// radial wash via .pulse-card-glow + inline --wash; the prior bespoke brick
// bloom div is retired in favor of the shared glow pseudo-layer.

import type { JSX } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Pill } from '../pulse/Pill';
import { Kicker } from '../pulse/Kicker';
import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../../lib/bayesianNutritionAggregate';
import { readBayesianNutritionContext } from '../../lib/nutritionObservations';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { t } from '../../../i18n/index.js';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Source labels read locale-aware via t() at render time (Wave C2 i18n).
function sourceLabel(source: NutritionTarget['source']): string {
  if (source === 'manual') return t('progres.tdee.sources.manual');
  if (source === 'engine-bn') return t('progres.tdee.sources.engineBn');
  return t('progres.tdee.sources.baseline');
}

// §F-pass2-tdeestrip-01 — phase override labels (B001 SchimbaFazaConfirm wire).
// Default "Auto" cand absent OR explicit AUTO (mockup L1706 verbatim "Faza: Auto").
// Wave C2 i18n: labels read from bundle (RO Cut/Bulk/Mentenanta vs EN
// Cut/Bulk/Maintenance).
const PHASE_KEY_MAP = {
  AUTO: 'progres.tdee.phases.auto',
  CUT: 'progres.tdee.phases.cut',
  BULK: 'progres.tdee.phases.bulk',
  MAINTENANCE: 'progres.tdee.phases.maintenance',
  STRENGTH: 'progres.tdee.phases.strength',
} as const;

const MESOCYCLE_WEEKS = 4; // Linear Block Periodization V1 — 4-week mesocycle clasic

// RO thousands separator (dot, ICU ro-RO) — consistency cross-strip parity
// cu BMRStrip ("1.850"). Prior raw {kcalTarget} rendea "2640" inconsistent
// langa BMRStrip "1.850". Mirror BMRStrip pattern toLocaleString('ro-RO').
function fmtNum(n: number): string {
  return n.toLocaleString('ro-RO').replace(/,/g, ' ');
}

/**
 * Read user phase override from localStorage (B001 SchimbaFazaConfirm
 * persist). Returns 'Auto' fallback cand absent / unknown value.
 */
function getCurrentPhaseLabel(): string {
  try {
    const raw = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as string | null;
    if (!raw) return t(PHASE_KEY_MAP.AUTO);
    const key = (PHASE_KEY_MAP as Record<string, string>)[raw];
    return key ? t(key) : t(PHASE_KEY_MAP.AUTO);
  } catch {
    return t(PHASE_KEY_MAP.AUTO);
  }
}

/**
 * Compute current week-in-mesocycle from sessions count. Conservative
 * defensive: sessions count / sessions-per-week-target → 1..4 wrap. Empty
 * sessions → week 1 (T0 fresh user).
 */
function computeWeekInMesocycle(sessionsCount: number, freqPerWeek: number): number {
  if (sessionsCount <= 0 || freqPerWeek <= 0) return 1;
  const weeksElapsed = Math.floor(sessionsCount / freqPerWeek);
  return (weeksElapsed % MESOCYCLE_WEEKS) + 1;
}

export function TDEEStrip(): JSX.Element {
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // §F-pass2-tdeestrip-02 — logged kcal today (manual nutrition log). null
  // cand user n-a logat inca → afisam doar tinta (NU fabricam "current").
  const loggedKcal = useNutritionStore((s) => s.getDaily(todayIso())?.kcal ?? null);
  // Default 3 sessions/week mid-range when frequency NU known (T0 fresh).
  const phaseLabel = useMemo(() => getCurrentPhaseLabel(), []);
  const weekInMeso = useMemo(
    () => computeWeekInMesocycle(sessionsHistory.length, 3),
    [sessionsHistory.length],
  );

  useEffect(() => {
    let cancelled = false;
    // Piesa 2 — ctx din weightLog + dailyLog + onboarding → engine adapteaza
    // TDEE-ul real per-user (iese din tier 'none', NU baseline 2640).
    const ctx = readBayesianNutritionContext();
    getNutritionTargetTodayReal(todayIso(), ctx).then((t) => {
      if (!cancelled) setTarget(t);
    });
    return () => { cancelled = true; };
  }, []);

  // §F-pass2-tdeestrip-02 — current-vs-tinta comparison (mockup L1796
  // "2 640 kcal · tinta 2 600"). Doar cand exista intake logat manual AND
  // tinta e engine/baseline genuina (source 'manual' = tinta echo-eaza
  // valoarea logata → delta 0 meaningless, ascundem comparatia).
  const showComparison =
    loggedKcal != null && target != null && target.source !== 'manual';
  const kcalDelta = showComparison ? loggedKcal - target.kcalTarget : 0;
  const deltaLabel = kcalDelta >= 0 ? `+${fmtNum(kcalDelta)}` : `-${fmtNum(Math.abs(kcalDelta))}`;

  return (
    <section
      data-testid="tdee-strip"
      className="pulse-card pulse-card-glow overflow-hidden p-5 mb-4"
      style={{ ['--wash' as string]: 'var(--aqua)' }}
      aria-label={t('progres.tdee.ariaLabel')}
    >

      <div className="relative flex items-center justify-between mb-4" data-testid="tdee-faza-row">
        {/* PHASE badge — mockup parity (11.402, interfata-noua/screens-tabs.jsx:26):
            an ember Pill, not the prior neutral-grey chip. Wrapped to preserve the
            tdee-faza-badge testid contract (the Pill primitive owns its own). */}
        <span data-testid="tdee-faza-badge">
          <Pill color="var(--ember)">
            {t('progres.tdee.phaseLabel', { phase: phaseLabel })}
          </Pill>
        </span>
        <span className="text-xs text-ink2" data-testid="tdee-mesocycle-week">
          {t('progres.tdee.weekInMeso', { n: weekInMeso })}
        </span>
      </div>

      {/* HERO — recommended kcal as the screen's primary read (Daniel 2026-05-28
          "kcal recomandate sus"). Big tabular num-display + warm flame accent;
          protein + source sit beneath as quiet context. */}
      <div className="relative">
        {/* Eyebrow — mockup parity (11.402, interfata-noua/screens-tabs.jsx:24):
            an aqua Kicker, not the prior brick Flame + grey label. */}
        <div className="mb-2">
          <Kicker color="var(--aqua)">
            {showComparison ? t('progres.tdee.todayVsTarget') : t('progres.tdee.targetToday')}
          </Kicker>
        </div>

        {showComparison ? (
          <div data-testid="tdee-current-vs-target">
            <p className="num-display text-[3.4rem] leading-[0.95] font-bold text-ink">
              {fmtNum(loggedKcal ?? 0)}
              <span className="text-lg font-semibold text-ink2">{' '}kcal</span>
            </p>
            <p className="text-sm text-ink2 mt-1.5">
              {t('progres.tdee.withTarget', { kcal: fmtNum(target.kcalTarget), delta: deltaLabel })}
            </p>
          </div>
        ) : (
          <p className="num-display text-[3.4rem] leading-[0.95] font-bold text-ink">
            {target ? fmtNum(target.kcalTarget) : '—'}
            <span className="text-lg font-semibold text-ink2">{' '}kcal</span>
          </p>
        )}

        {target && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
            <span className="text-sm font-semibold text-ink">
              {t('progres.tdee.withProtein', { g: fmtNum(target.proteinTarget) })}
            </span>
            <span className="text-xs text-ink3" data-testid="tdee-source">
              {sourceLabel(target.source)}
            </span>
          </div>
        )}
      </div>

      {/* §F-pass2-tdeestrip-03 (MED Wave 7 2026-05-23) — italic explainer copy
          per mockup L1713 verbatim. Sets user expectation: engine auto-calculates,
          logging optional for calibration. */}
      <p
        className="text-xs text-ink3 mt-3 leading-snug italic relative"
        data-testid="tdee-explainer"
      >
        {t('progres.tdee.explainer')}
      </p>
      {/* BUG #4 safety — cand user-ul e subponderal (BMI <= 18.5), tinta nu e
          deficit nici mentenanta, ci un surplus moderat de crestere lenta-sanatoasa.
          Mesaj de sustinere (NU "mergi mai jos"). Nota blanda de medic: subponderalul
          sever poate avea o cauza medicala — formulata prietenos. Stil aliniat
          brand-ului de disclaimer (AlertCircle brick) — guardrail pe OUTPUT. */}
      {target?.healthyFloorClamped && (
        <p
          className="text-xs text-brick mt-2.5 leading-snug flex items-start gap-1.5 relative"
          role="status"
          data-testid="tdee-healthy-floor-msg"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {t('tdeeStrip.healthyFloorMsg')}
          </span>
        </p>
      )}
    </section>
  );
}
