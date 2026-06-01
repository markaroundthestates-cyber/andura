// ══ TDEE STRIP — "Target Today" combined hero (Progres AZI zone) ═════════
// Real wire getNutritionTargetTodayReal async (task_04). Surface kcal +
// protein + source badge subtle (engine-bn / manual / baseline).
//
// §F-pass2-tdeestrip-01 (HIGH-EPSILON 2026-05-22) — mockup L1706 top row:
// Faza badge ("Faza: Auto" colored dot) + Sapt. counter ("Sapt. X /
// mesociclu") periodization context. Faza signal read from phase-override
// localStorage (B001 SchimbaFaza wire). Sapt counter derived from sessions
// count modulo 4. Local read pure pre-render, NO async wire pollution.
//
// HERO redesign (Daniel 2026-05-28 "Kcal recomandate trebuiau sa apara sus"):
// the recommended kcal is the most actionable number on the Progres screen, so
// it reads as a HERO — big tabular num-display number; protein + source quiet.
//
// Pulse 1:1 parity (2026-05-29, interfata-noua/screens-tabs.jsx:21-39): the
// hero migrates to the glass card language (.pulse-card) with the mockup's aqua
// radial wash via .pulse-card-glow + inline --wash.
//
// PROGRESS REDESIGN (Daniel locked, 2026-05-30) — this is now the ONE merged
// "Target Today" panel:
//   - kcal + protein are EDITABLE for the current day (editing = logging what
//     you CONSUMED today). Persisted to nutritionStore.dailyLog → the SAME
//     Bayesian context (readBayesianNutritionContext → buildNutritionObservations)
//     that calibrates per-user TDEE. So a manual log sharpens the engine over a
//     window — the honest "loggedNote" microcopy reflects that (NOT a guaranteed
//     next-day flip). Next day reverts to the auto target.
//   - The separate bottom "Nutrition today" panel (NutritionInline) + standalone
//     Fatigue panel were merged in earlier. (The Base-calories / BMR panel was
//     struck out 2026-05-30 as redundant — the hero already reads as an "Adaptive
//     estimate" — so it is no longer rendered here.)
//
// STABLE HERO redesign (Daniel + CEO locked 2026-06-01): the hero kcal must be a
// STABLE goal-based recommended intake — it does NOT move with activity or
// fatigue. So the aerobic add-on and the fatigue deficit-ease no longer change
// the hero, and the Fatigue panel is removed from this card (relocated to Muscle
// Recovery). Today's aerobic burn shows as an INFO line below the hero (it does
// not add to the number). The engine target's safety-limit "floored" note stays.

import type { JSX } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, Pencil, Check } from 'lucide-react';
import { Pill } from '../pulse/Pill';
import { Kicker } from '../pulse/Kicker';
import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../../lib/bayesianNutritionAggregate';
import { readBayesianNutritionContext } from '../../lib/nutritionObservations';
import { guardDisplayTarget } from '../../lib/displayTargetGuard';
import { resolveActivePhase } from '../../lib/engineWrappers';
import { readUserMaintenanceTDEE } from '../../lib/userTdee';
import { useProgresStore } from '../../stores/progresStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useAerobicStore, aerobicKcalForDate } from '../../stores/aerobicStore';
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
const PHASE_KEY_MAP = {
  AUTO: 'progres.tdee.phases.auto',
  CUT: 'progres.tdee.phases.cut',
  BULK: 'progres.tdee.phases.bulk',
  MAINTENANCE: 'progres.tdee.phases.maintenance',
  STRENGTH: 'progres.tdee.phases.strength',
} as const;

const MESOCYCLE_WEEKS = 4; // Linear Block Periodization V1 — 4-week mesocycle clasic

// RO thousands separator (dot, ICU ro-RO) — cross-strip parity ("1.850").
function fmtNum(n: number): string {
  return n.toLocaleString('ro-RO').replace(/,/g, ' ');
}

/**
 * RESOLVED phase label for the badge. Reuses resolveActivePhase (engineWrappers)
 * — the SAME override-vs-target reconciliation the kcal path applies (commit
 * 56dcf7ef): a manual phase-override that contradicts a clear LOSE/GAIN target
 * direction is DROPPED → falls through to the coherent phase. So the badge can
 * never show "Bulk" next to a correctly-computed deficit number. null (no
 * directional signal, cold-start) → Auto. Defensive → Auto.
 */
function getCurrentPhaseLabel(): string {
  try {
    // Daniel 2026-06-01: when the USER picked AUTO (or never overrode), the badge
    // must read "Auto" — even though the engine resolves AUTO to a directional
    // phase (CUT/BULK) internally for kcal sizing. Read the RAW override first; an
    // AUTO/absent pick short-circuits to Auto. Only an EXPLICIT non-AUTO pick falls
    // through to resolveActivePhase (keeps the contradiction-reconciliation so the
    // badge never shows "Bulk" beside a correctly-computed deficit number).
    const rawOverride = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as
      | string
      | null;
    if (!rawOverride || rawOverride === 'AUTO') return t(PHASE_KEY_MAP.AUTO);
    const phase = resolveActivePhase();
    if (!phase) return t(PHASE_KEY_MAP.AUTO);
    const key = (PHASE_KEY_MAP as Record<string, string>)[phase];
    return key ? t(key) : t(PHASE_KEY_MAP.AUTO);
  } catch {
    return t(PHASE_KEY_MAP.AUTO);
  }
}

/**
 * Compute current week-in-mesocycle from sessions count. Empty sessions →
 * week 1 (T0 fresh user).
 */
function computeWeekInMesocycle(sessionsCount: number, freqPerWeek: number): number {
  if (sessionsCount <= 0 || freqPerWeek <= 0) return 1;
  const weeksElapsed = Math.floor(sessionsCount / freqPerWeek);
  return (weeksElapsed % MESOCYCLE_WEEKS) + 1;
}

export function TDEEStrip(): JSX.Element {
  const dateISO = todayIso();
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // Editable daily log (= what you CONSUMED today). Subscribe so the chips +
  // comparison re-render on save.
  const entry = useNutritionStore((s) => s.getDaily(dateISO));
  const setDailyKcal = useNutritionStore((s) => s.setDailyKcal);
  const setDailyProtein = useNutritionStore((s) => s.setDailyProtein);
  const loggedKcal = entry?.kcal ?? null;

  // The PHASE badge must reflect the LIVE phase: the gating model auto-switches
  // the phase (ObiectivGoalCard re-sets phase-override to AUTO when a target
  // change disables the picked goal). Subscribe to the same store inputs that
  // drive that switch — that re-renders the component — and read the label fresh
  // each render (cheap localStorage read), instead of useMemo([]) frozen at mount.
  // These same inputs are ALSO reactive deps of the kcal-target fetch below (the
  // target is goal+deadline+weight-driven): editing the goal weight, deadline, or
  // logging a new weight must recompute the recommended kcal LIVE (freeze fix
  // 2026-05-31). The captured values drive the useEffect dep array.
  const targetObiectiv = useProgresStore((s) => s.targetObiectiv);
  const weightLog = useProgresStore((s) => s.weightLog);
  const phaseLabel = getCurrentPhaseLabel();
  const weekInMeso = useMemo(
    () => computeWeekInMesocycle(sessionsHistory.length, 3),
    [sessionsHistory.length],
  );

  // ── Edit state (kcal + protein, current day only) ──────────────────────
  const [kcalEdit, setKcalEdit] = useState(false);
  const [proteinEdit, setProteinEdit] = useState(false);
  const [kcalDraft, setKcalDraft] = useState('');
  const [proteinDraft, setProteinDraft] = useState('');

  // Recompute trigger for the localStorage-backed inputs the target also depends
  // on but that do NOT live in a store (phase-override from SchimbaFaza, bf-
  // override from SettingsProfile). Those edits happen on OTHER screens; on
  // returning to Progres (focus / tab visible) we bump this nonce so the target
  // re-fetches with the fresh override. The store-backed inputs (goal weight,
  // deadline, weight log) are reactive deps directly. (Freeze fix 2026-05-31.)
  const [recomputeNonce, setRecomputeNonce] = useState(0);
  useEffect(() => {
    const bump = (): void => setRecomputeNonce((n) => n + 1);
    const onVisible = (): void => { if (document.visibilityState === 'visible') bump(); };
    window.addEventListener('focus', bump);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', bump);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Piesa 2 — ctx din weightLog + dailyLog + onboarding → engine adapteaza
    // TDEE-ul real per-user (iese din tier 'none', NU baseline 2640).
    const ctx = readBayesianNutritionContext();
    getNutritionTargetTodayReal(dateISO, ctx).then((tg) => {
      if (!cancelled) setTarget(tg);
    });
    return () => { cancelled = true; };
    // Freeze fix 2026-05-31 — the recommended kcal is goal+deadline+weight-driven,
    // so it MUST recompute when any of those change: goal weight + deadline
    // (targetObiectiv), current weight (weightLog), the daily log echo, and the
    // off-screen localStorage overrides (recomputeNonce on focus/visibility).
  }, [
    dateISO,
    entry?.kcal,
    entry?.protein,
    targetObiectiv.weightKg,
    targetObiectiv.month,
    weightLog,
    recomputeNonce,
  ]);

  // ── STABLE hero = the goal-based recommended intake ──────────────────────
  // The hero is the engine target, floored (guardDisplayTarget applies the hard
  // sex floor + healthy BMI floor). It does NOT move with activity or fatigue —
  // it is the stable daily allowance the user reads as their target. The aerobic
  // add-on and the fatigue deficit-ease were removed (CEO lock 2026-06-01) so the
  // number stays put day-to-day.
  const maintenanceKcal = readUserMaintenanceTDEE();
  const baseAutoKcal = target?.kcalTarget ?? null;
  const displayAutoKcal =
    target && baseAutoKcal != null
      ? guardDisplayTarget(baseAutoKcal, baseAutoKcal, maintenanceKcal).kcal
      : null;

  // ── Aerobic-class kcal → today's activity INFO line ──────────────────────
  // A logged aerobic class is energy burned today. It is shown as an INFO line
  // below the hero (only when a class is logged today) — it does NOT add to the
  // hero number. Applied to a genuine auto target only (a manual log already
  // reflects the user's intent).
  const aerobicSessions = useAerobicStore((s) => s.sessions);
  const aerobicKcalToday = aerobicKcalForDate(aerobicSessions, dateISO);
  const aerobicInfo =
    target != null && target.source !== 'manual' && aerobicKcalToday > 0
      ? aerobicKcalToday
      : 0;

  // §F-pass2-tdeestrip-02 — current-vs-tinta comparison. Doar cand exista intake
  // logat manual AND tinta e engine/baseline genuina (source 'manual' = echo).
  // Base = the same stable guarded engine target the hero shows.
  const comparisonBase = displayAutoKcal;
  const showComparison =
    loggedKcal != null && target != null && target.source !== 'manual' && comparisonBase != null;
  const kcalDelta = showComparison ? (loggedKcal as number) - (comparisonBase as number) : 0;
  const deltaLabel = kcalDelta >= 0 ? `+${fmtNum(kcalDelta)}` : `-${fmtNum(Math.abs(kcalDelta))}`;

  // What the editable chips show: a logged value when present, else the auto.
  const displayKcalChip = loggedKcal ?? displayAutoKcal ?? null;
  const displayProteinChip = entry?.protein ?? target?.proteinTarget ?? null;
  const kcalIsManual = entry?.kcal != null;
  const proteinIsManual = entry?.protein != null;
  // Honest "noted, sharpens over time" microcopy — shown once the user has
  // logged either field today.
  const hasLoggedToday = kcalIsManual || proteinIsManual;

  function startKcalEdit(): void {
    setKcalDraft(displayKcalChip != null ? String(displayKcalChip) : '');
    setKcalEdit(true);
  }
  function startProteinEdit(): void {
    setProteinDraft(displayProteinChip != null ? String(displayProteinChip) : '');
    setProteinEdit(true);
  }
  function saveKcal(): void {
    const n = Number(kcalDraft);
    if (Number.isFinite(n) && n >= 0 && n <= 9999) setDailyKcal(dateISO, n);
    setKcalEdit(false);
  }
  function saveProtein(): void {
    const n = Number(proteinDraft);
    if (Number.isFinite(n) && n >= 0 && n <= 500) setDailyProtein(dateISO, n);
    setProteinEdit(false);
  }
  function saveBoth(): void {
    if (kcalEdit) saveKcal();
    if (proteinEdit) saveProtein();
  }
  const anyEdit = kcalEdit || proteinEdit;

  return (
    <section
      data-testid="tdee-strip"
      className="pulse-card pulse-card-glow overflow-hidden p-5 mb-4"
      style={{ ['--wash' as string]: 'var(--aqua)' }}
      aria-label={t('progres.tdee.ariaLabel')}
    >
      <div className="relative flex items-center justify-between mb-4" data-testid="tdee-faza-row">
        <span data-testid="tdee-faza-badge">
          <Pill color="var(--ember-ink)">
            {t('progres.tdee.phaseLabel', { phase: phaseLabel })}
          </Pill>
        </span>
        <span className="text-xs text-ink2" data-testid="tdee-mesocycle-week">
          {t('progres.tdee.weekInMeso', { n: weekInMeso })}
        </span>
      </div>

      {/* Full-width HERO target (stable goal-based recommended intake). */}
      <div className="relative">
        {/* ── Editable kcal hero + protein ────────────────────────────────── */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Kicker color="var(--aqua-ink)">
              {showComparison ? t('progres.tdee.todayVsTarget') : t('progres.tdee.targetToday')}
            </Kicker>
            <button
              type="button"
              onClick={startKcalEdit}
              aria-label={t('progres.tdee.editKcalAriaLabel')}
              data-testid="nutri-kcal-edit"
              className="relative p-1 text-ink2 before:absolute before:-inset-[10px] before:content-['']"
              disabled={kcalEdit}
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {kcalEdit ? (
            <input
              type="number"
              value={kcalDraft}
              onChange={(e) => setKcalDraft(e.target.value)}
              min={0}
              max={9999}
              inputMode="numeric"
              aria-label={t('progres.tdee.kcalInputAriaLabel')}
              data-testid="nutri-kcal-input"
              className="w-full p-2 border border-lineStrong rounded-xl bg-paper text-2xl font-mono"
            />
          ) : showComparison ? (
            <div data-testid="tdee-current-vs-target">
              <p className="num-display text-[3.4rem] leading-[0.95] font-bold text-ink" data-testid="nutri-kcal-val">
                {fmtNum(loggedKcal ?? 0)}
                <span className="text-lg font-semibold text-ink2">{' '}kcal</span>
              </p>
              <p className="text-sm text-ink2 mt-1.5">
                {t('progres.tdee.withTarget', { kcal: fmtNum(comparisonBase as number), delta: deltaLabel })}
              </p>
            </div>
          ) : (
            <p className="num-display text-[3.4rem] leading-[0.95] font-bold text-ink" data-testid="nutri-kcal-val">
              {displayKcalChip != null ? fmtNum(displayKcalChip) : '—'}
              <span className="text-lg font-semibold text-ink2">{' '}kcal</span>
            </p>
          )}

          {/* Protein — editable, quiet secondary context. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3" data-testid="nutri-protein-chip">
            {proteinEdit ? (
              <input
                type="number"
                value={proteinDraft}
                onChange={(e) => setProteinDraft(e.target.value)}
                min={0}
                max={500}
                inputMode="numeric"
                aria-label={t('progres.tdee.proteinInputAriaLabel')}
                data-testid="nutri-protein-input"
                className="w-24 p-1.5 border border-lineStrong rounded-lg bg-paper text-sm font-mono"
              />
            ) : (
              <span className="text-sm font-semibold text-ink" data-testid="nutri-protein-val">
                {displayProteinChip != null
                  ? t('progres.tdee.withProtein', { g: fmtNum(displayProteinChip) })
                  : `· ${t('progres.tdee.proteinLabel')}`}
              </span>
            )}
            <button
              type="button"
              onClick={startProteinEdit}
              aria-label={t('progres.tdee.editProteinAriaLabel')}
              data-testid="nutri-protein-edit"
              className="relative p-1 text-ink2 before:absolute before:-inset-[10px] before:content-['']"
              disabled={proteinEdit}
            >
              <Pencil className="w-3 h-3" aria-hidden="true" />
            </button>
            {target && (
              <span className="text-xs text-ink3" data-testid="tdee-source">
                {kcalIsManual ? sourceLabel('manual') : sourceLabel(target.source)}
              </span>
            )}
          </div>

          {anyEdit && (
            <button
              type="button"
              onClick={saveBoth}
              data-testid="nutri-save"
              className="mt-3 min-h-[44px] px-4 py-2 bg-brick text-paper rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              {t('progres.tdee.saveCta')}
            </button>
          )}
        </div>
      </div>

      {/* Explainer under the hero — what this number is (stable, goal-based). */}
      <p
        className="text-xs text-ink3 mt-3 leading-snug relative"
        data-testid="tdee-explainer"
      >
        {t('progres.tdee.explainer')}
      </p>

      {/* Aerobic-class INFO line — only when a class is logged today. It does NOT
          add to the hero; it reassures the user today's burn moved them closer. */}
      {aerobicInfo > 0 && (
        <p
          className="text-xs mt-2 leading-snug"
          style={{ color: 'var(--aqua-deep)' }}
          data-testid="tdee-aerobic-info"
        >
          {t('progres.tdee.aerobicInfo', { kcal: fmtNum(aerobicInfo) })}
        </p>
      )}

      {/* Log CTA — prompts the user to log today's intake. Hidden once they have
          logged (the after-log "sharpens" note then replaces it). Explains that
          NOT logging is fine: the coach assumes the target was hit and calibrates
          from the weight trend. */}
      {!hasLoggedToday && (
        <p
          className="text-xs mt-3 leading-snug"
          style={{ color: 'var(--aqua-deep)' }}
          data-testid="tdee-log-cta"
        >
          {t('progres.tdee.logCta')}
        </p>
      )}

      {/* Honest microcopy — appears once the user has logged today. Logging
          sharpens the engine over a window (NOT a guaranteed next-day flip). */}
      {hasLoggedToday && (
        <p
          className="text-xs mt-3 leading-snug"
          style={{ color: 'var(--aqua-deep)' }}
          data-testid="tdee-logged-note"
        >
          {t('progres.tdee.loggedNote')}
        </p>
      )}

      {/* BUG #4 safety — subponderal support message (TDEE×1.08 surplus). */}
      {target?.healthyFloorClamped && (
        <p
          className="text-xs text-brick mt-2.5 leading-snug flex items-start gap-1.5 relative"
          role="status"
          data-testid="tdee-healthy-floor-msg"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('tdeeStrip.healthyFloorMsg')}</span>
        </p>
      )}

      {/* L7 — base-target safety limit note. Surfaced when the auto target was
          rate-capped or clamped to the sex floor at an extreme profile, so the
          user understands WHY the number landed there. Distinct from the add-on
          "addOnsClampedNote" (that is about ease/aerobic add-ons over maintenance,
          not the base target) and suppressed under a manual log (the shown number
          is then the user's intake, not the limited target). */}
      {!kcalIsManual && target?.safetyLimited && (
        <p
          className="text-xs text-ink2 mt-2 leading-snug relative"
          data-testid="tdee-safety-limit-note"
        >
          {target.safetyLimited === 'floored'
            ? t('progres.tdee.safetyFloorNote')
            : t('progres.tdee.safetyCapNote')}
        </p>
      )}
    </section>
  );
}
