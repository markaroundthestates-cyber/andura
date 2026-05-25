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
    getNutritionTargetTodayReal(dateISO).then((t) => {
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
        Nutritie · azi
      </p>
      <div className="bg-paper2 border border-line rounded-2xl p-3.5 mb-2.5">
        <div className="flex gap-2.5 mb-2.5">
          <div className="flex-1" data-testid="nutri-kcal-chip">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink2 uppercase tracking-wide font-semibold">
                Kcal
              </span>
              <button
                type="button"
                onClick={startKcalEdit}
                aria-label="Editeaza kcal"
                data-testid="nutri-kcal-edit"
                className="p-1 text-ink2"
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
                aria-label="Kcal"
                data-testid="nutri-kcal-input"
                className="w-full p-2 border border-lineStrong rounded-xl bg-paper text-base font-mono"
              />
            ) : (
              <span
                className="text-2xl font-bold text-ink font-mono"
                data-testid="nutri-kcal-val"
              >
                {displayKcal}
              </span>
            )}
            <span
              className="text-xs text-ink2 mt-1.5 block"
              data-testid="nutri-kcal-source"
            >
              {kcalIsManual ? 'Logat manual' : 'Auto din engine'}
            </span>
          </div>
          <div className="flex-1" data-testid="nutri-protein-chip">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink2 uppercase tracking-wide font-semibold">
                Proteine (g)
              </span>
              <button
                type="button"
                onClick={startProteinEdit}
                aria-label="Editeaza proteine"
                data-testid="nutri-protein-edit"
                className="p-1 text-ink2"
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
                aria-label="Proteine (g)"
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
              {proteinIsManual ? 'Logat manual' : 'Auto din engine'}
            </span>
          </div>
        </div>
        {anyEdit && (
          <button
            type="button"
            onClick={saveBoth}
            data-testid="nutri-save"
            className="w-full py-2 bg-brick text-paper rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            Salveaza modificarile
          </button>
        )}
        <p className="text-xs text-ink2 mt-2 leading-snug">
          Auto target din engine. Apasa pencil daca vrei sa loghezi manual.
        </p>
      </div>
      <p className="text-xs text-ink2 text-center leading-relaxed">
        Auto target engine + manual log optional. Engine calibreaza din date reale.
      </p>
    </div>
  );
}
