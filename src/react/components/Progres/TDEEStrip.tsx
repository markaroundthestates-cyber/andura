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
//     Fatigue + Base-calories panels are MERGED IN: Fatigue lives on the right,
//     base calories (BMR) folds in small at the bottom.
//   - Fatigue → kcal: a recovery-protective deficit ease (easeDeficitForFatigue)
//     nudges the DISPLAYED auto target up toward maintenance ONLY under sustained
//     HIGH_FATIGUE + an active deficit. It never fakes a TDEE change, never lowers
//     the target, is capped, and is labeled transparently (fatigueEaseNote).

import type { JSX } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, Pencil, Check } from 'lucide-react';
import { Pill } from '../pulse/Pill';
import { Kicker } from '../pulse/Kicker';
import { FatigueStrip } from './FatigueStrip';
import { BMRStrip } from './BMRStrip';
import { getNutritionTargetTodayReal } from '../../lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../../lib/bayesianNutritionAggregate';
import { readBayesianNutritionContext } from '../../lib/nutritionObservations';
import { easeDeficitForFatigue } from '../../lib/fatigueDeficitEase';
import { getFatigue } from '../../lib/engineWrappers';
import { readUserMaintenanceTDEE } from '../../lib/userTdee';
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

  const phaseLabel = useMemo(() => getCurrentPhaseLabel(), []);
  const weekInMeso = useMemo(
    () => computeWeekInMesocycle(sessionsHistory.length, 3),
    [sessionsHistory.length],
  );

  // ── Edit state (kcal + protein, current day only) ──────────────────────
  const [kcalEdit, setKcalEdit] = useState(false);
  const [proteinEdit, setProteinEdit] = useState(false);
  const [kcalDraft, setKcalDraft] = useState('');
  const [proteinDraft, setProteinDraft] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Piesa 2 — ctx din weightLog + dailyLog + onboarding → engine adapteaza
    // TDEE-ul real per-user (iese din tier 'none', NU baseline 2640).
    const ctx = readBayesianNutritionContext();
    getNutritionTargetTodayReal(dateISO, ctx).then((tg) => {
      if (!cancelled) setTarget(tg);
    });
    return () => { cancelled = true; };
  }, [dateISO, entry?.kcal, entry?.protein]);

  // ── Fatigue → kcal recovery-protective ease ─────────────────────────────
  // Apply only to a genuine engine/baseline auto target (source !== 'manual':
  // a manual log already reflects the user's intent, don't nudge it). The ease
  // is transparent + capped + never below maintenance (helper guarantees).
  const fatigue = getFatigue();
  const fatigueKey = fatigue?.key ?? null;
  const maintenanceKcal = readUserMaintenanceTDEE();
  const baseAutoKcal = target?.kcalTarget ?? null;
  const ease =
    baseAutoKcal != null && target != null && target.source !== 'manual'
      ? easeDeficitForFatigue(baseAutoKcal, maintenanceKcal, fatigueKey)
      : { easedKcal: baseAutoKcal ?? 0, addedKcal: 0, eased: false };
  // The kcal we DISPLAY as the auto target (post-ease).
  const displayAutoKcal = target ? ease.easedKcal : null;

  // §F-pass2-tdeestrip-02 — current-vs-tinta comparison. Doar cand exista intake
  // logat manual AND tinta e engine/baseline genuina (source 'manual' = echo).
  const showComparison =
    loggedKcal != null && target != null && target.source !== 'manual' && displayAutoKcal != null;
  const kcalDelta = showComparison ? (loggedKcal as number) - (displayAutoKcal as number) : 0;
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
          <Pill color="var(--ember)">
            {t('progres.tdee.phaseLabel', { phase: phaseLabel })}
          </Pill>
        </span>
        <span className="text-xs text-ink2" data-testid="tdee-mesocycle-week">
          {t('progres.tdee.weekInMeso', { n: weekInMeso })}
        </span>
      </div>

      {/* Two columns: HERO target (left) + Fatigue today (right). */}
      <div className="relative flex items-start gap-4">
        {/* ── LEFT: editable kcal hero + protein ──────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Kicker color="var(--aqua)">
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
                {t('progres.tdee.withTarget', { kcal: fmtNum(displayAutoKcal as number), delta: deltaLabel })}
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

        {/* ── RIGHT: Fatigue today ────────────────────────────────────────── */}
        <div className="w-[42%] max-w-[180px] shrink-0">
          <FatigueStrip />
        </div>
      </div>

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

      {/* Fatigue → kcal ease note — only when the recovery-protective ease fired. */}
      {ease.eased && (
        <p
          className="text-xs mt-2 leading-snug"
          style={{ color: 'var(--ember)' }}
          data-testid="tdee-fatigue-ease-note"
        >
          {t('progres.tdee.fatigueEaseNote', { kcal: fmtNum(ease.addedKcal) })}
        </p>
      )}

      {/* §F-pass2-tdeestrip-03 — italic explainer copy. Engine auto-calculates,
          logging optional for calibration. */}
      <p
        className="text-xs text-ink3 mt-3 leading-snug italic relative"
        data-testid="tdee-explainer"
      >
        {t('progres.tdee.explainer')}
      </p>

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

      {/* Base calories (BMR) folded in small — the standalone panel is removed. */}
      <div className="mt-4 pt-3 border-t border-line" data-testid="tdee-base-calories">
        <BMRStrip />
      </div>
    </section>
  );
}
