// ══ HISTORY IMPORT — STORE MERGE (I/O boundary, Piesa 3) ═══════════════════
//
// Plumbing-ul care ia rezultatul PUR al parser-ului (historyImportParser.ts) si
// il fuzioneaza in progresStore.weightLog + nutritionStore.dailyLog, deduplicat
// pe data (re-import = NU dublezi). Dupa merge, builder-ul de observatii din
// Piesa 2 (nutritionObservations.readBayesianNutritionContext) citeste store-ul
// LIVE → Kalman/Bayesian bootstrap-eaza automat (zero wiring extra, call-site-
// urile recalculeaza la urmatorul render).
//
// I/O boundary (NU pur): citeste + scrie store. Mirror shape EXACT:
//   - WeightEntry  { kg: number; date: string; ts: number }
//   - NutritionDailyEntry { dateISO: string; kcal: number|null; protein: number|null; ts: number }
// ts derivat din data (Date.UTC) ca observatiile sa se ordoneze cronologic +
// re-import sa fie stabil deterministic per zi (NU Date.now per rand → ordering
// gresit pentru istoric vechi).

import { useProgresStore } from '../stores/progresStore';
import type { WeightEntry } from '../stores/progresStore';
import { useNutritionStore } from '../stores/nutritionStore';
import type { NutritionDailyEntry } from '../stores/nutritionStore';
import type { ParsedWeightEntry, ParsedDailyEntry } from './historyImportParser';

/** Rezumat post-merge pentru UI (cate intrari noi/actualizate). */
export interface MergeSummary {
  weightImported: number; // intrari greutate scrise (noi + actualizate)
  nutritionImported: number; // intrari nutritie scrise (noi + actualizate)
}

/** 'YYYY-MM-DD' → millis UTC (ts stabil pentru ordering). NaN→0 defensiv. */
function dateToTs(dateISO: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return 0;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Fuzioneaza intrari de greutate parsate in weightLog existent, dedup pe date.
 * Pur fata de store (primeste log curent, returneaza log nou) → testabil.
 */
export function mergeWeightEntries(
  existing: ReadonlyArray<WeightEntry>,
  parsed: ReadonlyArray<ParsedWeightEntry>,
): WeightEntry[] {
  const byDate = new Map<string, WeightEntry>();
  for (const e of existing) byDate.set(e.date, e);
  for (const p of parsed) {
    byDate.set(p.date, { kg: p.kg, date: p.date, ts: dateToTs(p.date) });
  }
  return [...byDate.values()].sort((a, b) => a.ts - b.ts);
}

/**
 * Fuzioneaza intrari de nutritie parsate in dailyLog existent, dedup pe dateISO.
 * Pastreaza valorile existente cand cele importate sunt null (merge non-distructiv).
 */
export function mergeDailyEntries(
  existing: ReadonlyArray<NutritionDailyEntry>,
  parsed: ReadonlyArray<ParsedDailyEntry>,
): NutritionDailyEntry[] {
  const byDate = new Map<string, NutritionDailyEntry>();
  for (const e of existing) byDate.set(e.dateISO, e);
  for (const p of parsed) {
    const prev = byDate.get(p.dateISO);
    byDate.set(p.dateISO, {
      dateISO: p.dateISO,
      kcal: p.kcal ?? prev?.kcal ?? null,
      protein: p.protein ?? prev?.protein ?? null,
      ts: dateToTs(p.dateISO),
    });
  }
  return [...byDate.values()].sort((a, b) => a.ts - b.ts);
}

/**
 * I/O boundary — scrie intrarile parsate in cele 2 store-uri (dedup pe data).
 * Returneaza rezumatul pentru UI. Dupa apel, Piesa 2 vede store-ul live la
 * urmatorul render → engine bootstrap automat.
 */
export function applyHistoryImport(
  weightEntries: ReadonlyArray<ParsedWeightEntry>,
  dailyEntries: ReadonlyArray<ParsedDailyEntry>,
): MergeSummary {
  if (weightEntries.length > 0) {
    const existing = useProgresStore.getState().weightLog;
    useProgresStore.setState({ weightLog: mergeWeightEntries(existing, weightEntries) });
  }
  if (dailyEntries.length > 0) {
    const existing = useNutritionStore.getState().dailyLog;
    useNutritionStore.setState({ dailyLog: mergeDailyEntries(existing, dailyEntries) });
  }
  return {
    weightImported: weightEntries.length,
    nutritionImported: dailyEntries.length,
  };
}
