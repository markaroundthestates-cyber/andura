// ══ NUTRITION INLINE — Progres Daily Kcal+Protein Chips (task_20 LOCK 11) ══
// Mockup wv2 verbatim (andura-clasic.html#L1800-1834): 2 chips Kcal +
// Proteine cu inline pencil edit pattern. Default values din engine auto
// target — manual override prin pencil → input → Salveaza modificarile.
//
// Phase 4 MVP wired la nutritionStore localStorage. Engine auto target
// mock fixed (2640 kcal / 180g protein per mockup wv2 verbatim) pana
// task_17 Phase 5+ engine wire real.
//
// WORDING all mockup verbatim:
//   - Section: "Nutritie · azi"
//   - Chip labels: "Kcal" / "Proteine (g)"
//   - Aria-labels: "Editeaza kcal" / "Editeaza proteine"
//   - Save button: "Salveaza modificarile"
//   - Helper: "Auto target din engine. Apasa pencil daca vrei sa loghezi
//     manual."
//   - Sub-helper: "Auto din engine" per chip
//   - Footer: "Auto target engine + manual log optional. Engine calibreaza
//     din date reale." (U-08: removed false "CSV batch import" claim — no
//     such feature in MVP per nutritionStore header)

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useNutritionStore } from '../stores/nutritionStore';
import { getNutritionTargetTodayReal } from '../lib/bayesianNutritionAggregate';
import type { NutritionTarget } from '../lib/bayesianNutritionAggregate';
import { readBayesianNutritionContext } from '../lib/nutritionObservations';
import { t } from '../../i18n/index.js';

// Phase 6 task_04 baseline preserved sync render fallback (engine async
// resolve replaces these on mount). Mockup verbatim wv2 L1812/L1825.
const AUTO_KCAL_TARGET = 2640;
const AUTO_PROTEIN_TARGET = 180;

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// RO thousands separator (dot, ICU ro-RO) for display — consistency cross-strip
// parity cu BMRStrip/TDEEStrip ("2.640"). Display-only (draft pastreaza numarul
// brut pentru parse). Prior {displayKcal} raw rendea "2640" inconsistent.
function fmtNum(n: number): string {
  return n.toLocaleString('ro-RO').replace(/,/g, ' ');
}

export function NutritionInline(): JSX.Element {
  const dateISO = todayIso();
  const entry = useNutritionStore((s) => s.getDaily(dateISO));
  const setDailyKcal = useNutritionStore((s) => s.setDailyKcal);
  const setDailyProtein = useNutritionStore((s) => s.setDailyProtein);

  const [kcalEdit, setKcalEdit] = useState(false);
  const [proteinEdit, setProteinEdit] = useState(false);
  const [kcalDraft, setKcalDraft] = useState<string>('');
  const [proteinDraft, setProteinDraft] = useState<string>('');

  // Phase 6 task_04 real wire — async getNutritionTargetTodayReal. Engine
  // output overrides mockup baseline on resolve; manual log priority preserved
  // via aggregate. Per DECISIONS.md §D027.
  const [engineTarget, setEngineTarget] = useState<NutritionTarget | null>(null);
  useEffect(() => {
    let cancelled = false;
    // Piesa 2 — construieste ctx din weightLog + dailyLog + onboarding → engine
    // iese din tier 'none' si adapteaza TDEE-ul real per-user (NU baseline 2640).
    const ctx = readBayesianNutritionContext();
    getNutritionTargetTodayReal(dateISO, ctx).then((t) => {
      if (!cancelled) setEngineTarget(t);
    });
    return () => { cancelled = true; };
  }, [dateISO]);

  const autoKcal = engineTarget?.kcalTarget ?? AUTO_KCAL_TARGET;
  const autoProtein = engineTarget?.proteinTarget ?? AUTO_PROTEIN_TARGET;
  const displayKcal = entry?.kcal ?? autoKcal;
  const displayProtein = entry?.protein ?? autoProtein;

  function startKcalEdit(): void {
    setKcalDraft(String(displayKcal));
    setKcalEdit(true);
  }
  function startProteinEdit(): void {
    setProteinDraft(String(displayProtein));
    setProteinEdit(true);
  }
  function saveKcal(): void {
    const n = Number(kcalDraft);
    if (Number.isFinite(n) && n >= 0 && n <= 9999) {
      setDailyKcal(dateISO, n);
    }
    setKcalEdit(false);
  }
  function saveProtein(): void {
    const n = Number(proteinDraft);
    if (Number.isFinite(n) && n >= 0 && n <= 500) {
      setDailyProtein(dateISO, n);
    }
    setProteinEdit(false);
  }
  function saveBoth(): void {
    if (kcalEdit) saveKcal();
    if (proteinEdit) saveProtein();
  }

  const anyEdit = kcalEdit || proteinEdit;
  const kcalIsManual = entry?.kcal !== null && entry?.kcal !== undefined;
  const proteinIsManual = entry?.protein !== null && entry?.protein !== undefined;

  return (
    <div data-testid="nutrition-inline">
      <p className="text-xs font-semibold text-ink2 uppercase tracking-wide mt-4 mb-2">
        {t('bodyComp.nutritionInline.sectionHeading')}
      </p>
      <div className="pulse-card pulse-card-tight p-3.5 mb-2.5">
        <div className="flex gap-2.5 mb-2.5">
          <div className="flex-1" data-testid="nutri-kcal-chip">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink2 uppercase tracking-wide font-semibold">
                {t('bodyComp.nutritionInline.kcalLabel')}
              </span>
              <button
                type="button"
                onClick={startKcalEdit}
                aria-label={t('bodyComp.nutritionInline.editKcalAriaLabel')}
                data-testid="nutri-kcal-edit"
                className="relative p-1 text-ink2 before:absolute before:-inset-[11px] before:content-['']"
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
                aria-label={t('bodyComp.nutritionInline.kcalInputAriaLabel')}
                data-testid="nutri-kcal-input"
                className="w-full p-2 border border-lineStrong rounded-xl bg-paper text-base font-mono"
              />
            ) : (
              <span
                className="text-2xl font-bold text-ink font-mono"
                data-testid="nutri-kcal-val"
              >
                {fmtNum(displayKcal)}
              </span>
            )}
            <span
              className="text-xs text-ink2 mt-1.5 block"
              data-testid="nutri-kcal-source"
            >
              {kcalIsManual ? t('bodyComp.nutritionInline.manualLogged') : t('bodyComp.nutritionInline.autoFromEngine')}
            </span>
          </div>
          <div className="flex-1" data-testid="nutri-protein-chip">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink2 uppercase tracking-wide font-semibold">
                {t('bodyComp.nutritionInline.proteinLabel')}
              </span>
              <button
                type="button"
                onClick={startProteinEdit}
                aria-label={t('bodyComp.nutritionInline.editProteinAriaLabel')}
                data-testid="nutri-protein-edit"
                className="relative p-1 text-ink2 before:absolute before:-inset-[11px] before:content-['']"
                disabled={proteinEdit}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            {proteinEdit ? (
              <input
                type="number"
                value={proteinDraft}
                onChange={(e) => setProteinDraft(e.target.value)}
                min={0}
                max={500}
                inputMode="numeric"
                aria-label={t('bodyComp.nutritionInline.proteinInputAriaLabel')}
                data-testid="nutri-protein-input"
                className="w-full p-2 border border-lineStrong rounded-xl bg-paper text-base font-mono"
              />
            ) : (
              <span
                className="text-2xl font-bold text-ink font-mono"
                data-testid="nutri-protein-val"
              >
                {displayProtein}
              </span>
            )}
            <span
              className="text-xs text-ink2 mt-1.5 block"
              data-testid="nutri-protein-source"
            >
              {proteinIsManual ? t('bodyComp.nutritionInline.manualLogged') : t('bodyComp.nutritionInline.autoFromEngine')}
            </span>
          </div>
        </div>
        {anyEdit && (
          <button
            type="button"
            onClick={saveBoth}
            data-testid="nutri-save"
            className="w-full min-h-[44px] py-2 bg-brick text-paper rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            {t('bodyComp.nutritionInline.saveCta')}
          </button>
        )}
        <p className="text-xs text-ink2 mt-2 leading-snug">
          {t('bodyComp.nutritionInline.helperTop')}
        </p>
      </div>
      <p className="text-xs text-ink2 text-center leading-relaxed">
        {t('bodyComp.nutritionInline.helperBottom')}
      </p>
    </div>
  );
}
