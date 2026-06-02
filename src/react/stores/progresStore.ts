// ══ PROGRES STORE — Weight Log + Body Data Entries ═══════════════════════
// Phase 4 task_16 — persist weight + measurements locally cu zustand
// persist middleware (localStorage). Phase 5+ replaces cu cloud sync sau
// Firestore wire conform Pre-Beta backend strategy.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { kv } from '../../storage/kv';

export interface WeightEntry {
  kg: number;
  date: string; // YYYY-MM-DD format (date-only, NU full timestamp)
  ts: number; // Date.now() la save (for ordering + edit detection)
}

export interface BodyDataEntry {
  date: string;
  ts: number;
  // §progress-v2 — only circumferences that FEED BF estimation are kept:
  // talie + gat (US Navy men) + sold (US Navy women). Chest/biceps/thigh
  // CIRCUMFERINTE au fost eliminate (masoara muschi, NU grasime = noise).
  // Valorile vechi stocate sunt ignorate gratios (latestBodyMeasurements
  // itereaza doar BODY_FIELDS curent — campurile sterse raman in JSON dar
  // nu mai sunt citite). Partial entries supported.
  waistCm?: number;
  neckCm?: number;
  hipsCm?: number;
  // Optional skinfold caliper sites (mm) — Jackson-Pollock 3-site. Men:
  // chest/abdomen/thigh; Women: triceps/suprailiac/thigh. Cand prezente,
  // BF% foloseste J-P (mai acurat) peste US Navy (vezi BodyFatStrip).
  chestSkinfoldMm?: number;
  abdomenSkinfoldMm?: number;
  thighSkinfoldMm?: number;
  tricepsSkinfoldMm?: number;
  suprailiacSkinfoldMm?: number;
}

// §obiectiv-tinta 2026-05-28 — Daniel verbatim "tot ce e la Obiectiv, pe
// toate themes trebuie mutat la progres undeva". Target weight + target month
// were previously local form state in SettingsProfile (Cont) — values were
// discarded between visits, which made them useless feedback for progress
// tracking. Promoting to progresStore so the Obiectiv tinta surfaces on the
// Progres tab (where it logically belongs alongside current weight + trend)
// and survives across sessions.
export interface TargetObiectiv {
  /** Target weight in kg (kept as number — store-level validation: finite, >0). */
  weightKg: number | null;
  /** Target deadline as YYYY-MM (HTML <input type="month"> shape). */
  month: string | null; // "" → null, never empty string
}

export interface ProgresState {
  weightLog: WeightEntry[];
  bodyData: BodyDataEntry[];
  /** §obiectiv-tinta — user-set Obiectiv target. null on cold-start. */
  targetObiectiv: TargetObiectiv;
}

/**
 * Smoke 2026-05-28 #15 — sursa unica de masuratori curente.
 *
 * Pana acum BF% / SettingsProfile / BodyFatStrip citeau DOAR ultima intrare din
 * bodyData (`bodyData[length-1]`). Dar Progres → Masuratori si Cont → Profil
 * scriu in acelasi array, fiecare cu PROPRIA SELECTIE de campuri (vezi
 * BODY_FIELDS — circumferinte talie/gat/sold + pliuri cutanate; circumferintele
 * piept/biceps/coapsa au fost eliminate ca noise per §progress-v2):
 *   - Cont scrie talie + gat (date pentru US Navy BF% barbati)
 *   - Progres scrie talie + gat + sold + pliuri cutanate (Jackson-Pollock)
 * Cand un user introduce gat in Cont apoi pliuri in Progres, ultima intrare nu
 * mai are gat → BF% cade pe Deurenberg (estimat populational) desi gat-ul tot
 * exista in istoric. Aceeasi sursa logica = aceeasi sursa fizica de adevar.
 *
 * Aceasta functie pura agrega ultimele valori per camp din ISTORICUL complet
 * (fiecare camp ia cea mai recenta intrare in care e prezent — sortat dupa
 * `date` cu fallback pe `ts` cand date e gol), astfel BF% / formularul
 * SettingsProfile vad mereu cea mai recenta valoare pentru fiecare camp,
 * indiferent din care ecran a fost completata.
 */
export interface LatestBodyMeasurements {
  date?: string;
  waistCm?: number;
  neckCm?: number;
  hipsCm?: number;
  chestSkinfoldMm?: number;
  abdomenSkinfoldMm?: number;
  thighSkinfoldMm?: number;
  tricepsSkinfoldMm?: number;
  suprailiacSkinfoldMm?: number;
}

const BODY_FIELDS = [
  'waistCm',
  'neckCm',
  'hipsCm',
  'chestSkinfoldMm',
  'abdomenSkinfoldMm',
  'thighSkinfoldMm',
  'tricepsSkinfoldMm',
  'suprailiacSkinfoldMm',
] as const;
type BodyField = (typeof BODY_FIELDS)[number];

export function latestBodyMeasurements(
  entries: readonly BodyDataEntry[]
): LatestBodyMeasurements {
  if (!entries || entries.length === 0) return {};
  // Sortare pe date (ISO YYYY-MM-DD, sortabil lex) cu fallback ts. Stabil:
  // cand date egale, intrarea cu ts mai mare castiga (cantarire mai noua azi).
  const sorted = [...entries].sort((a, b) => {
    const dateCmp = (a.date ?? '').localeCompare(b.date ?? '');
    if (dateCmp !== 0) return dateCmp;
    return (a.ts ?? 0) - (b.ts ?? 0);
  });
  const result: LatestBodyMeasurements = {};
  // Iteram crescator si suprascriem — la final pastram cea mai recenta valoare
  // numerica per camp. Skip campuri non-numerice (defense in depth).
  for (const e of sorted) {
    for (const k of BODY_FIELDS) {
      const v = e[k as BodyField];
      if (Number.isFinite(v) && (v as number) > 0) {
        (result as Record<BodyField, number>)[k as BodyField] = v as number;
      }
    }
    // Pastram cea mai recenta data (cea cu cel putin un camp completat).
    if (e.date) result.date = e.date;
  }
  return result;
}

export interface ProgresActions {
  addWeightEntry: (entry: Omit<WeightEntry, 'ts'>) => void;
  addBodyDataEntry: (entry: Omit<BodyDataEntry, 'ts'>) => void;
  /** §obiectiv-tinta — partial update (either field independently). Pass
   *  null to clear. weightKg coerced to number; non-finite → null. */
  setTargetObiectiv: (patch: Partial<TargetObiectiv>) => void;
  // BUG #5 — seed weightLog din greutatea de onboarding (profile.weight) cand e
  // gol, ca timeline-ul "Greutate (7 zile)" sa porneasca de la greutatea reala a
  // user-ului (NU gol/disconnect). Idempotent: NU face nimic daca weightLog deja
  // are intrari (nu suprascriem loguri reale). Caller paseaza kg + date (I/O
  // boundary citeste onboardingStore) → store decuplat de onboardingStore.
  seedFromProfileIfEmpty: (kg: number, date: string) => void;
  reset: () => void;
}

const EMPTY_TARGET: TargetObiectiv = { weightKg: null, month: null };

export const useProgresStore = create<ProgresState & ProgresActions>()(
  persist(
    (set) => ({
      weightLog: [],
      bodyData: [],
      targetObiectiv: EMPTY_TARGET,
      // U-10 — upsert by date (aliniat cu nutritionStore.upsertEntry). Logare
      // de 2 ori in aceeasi zi suprascrie intrarea zilei in loc sa creeze un
      // rand duplicat (cantarire dimineata + seara → o singura valoare/zi).
      addWeightEntry: (entry) =>
        set((s) => {
          const next = { ...entry, ts: Date.now() };
          const idx = s.weightLog.findIndex((e) => e.date === entry.date);
          if (idx === -1) {
            return { weightLog: [...s.weightLog, next] };
          }
          const weightLog = [...s.weightLog];
          weightLog[idx] = next;
          return { weightLog };
        }),
      addBodyDataEntry: (entry) =>
        set((s) => ({
          bodyData: [...s.bodyData, { ...entry, ts: Date.now() }],
        })),
      // §obiectiv-tinta — partial patch; coerces invalid numbers to null
      // (defense in depth — UI may still pass NaN through onChange noise).
      setTargetObiectiv: (patch) =>
        set((s) => {
          const current = s.targetObiectiv;
          const next: TargetObiectiv = { ...current };
          if ('weightKg' in patch) {
            const kg = patch.weightKg;
            next.weightKg = typeof kg === 'number' && Number.isFinite(kg) && kg > 0 ? kg : null;
          }
          if ('month' in patch) {
            const m = patch.month;
            // Accept YYYY-MM (UI <input type="month">) sau YYYY-MM-DD (engine-
            // level precision pt teste / dezvoltatori). daysUntilTarget gestio-
            // neaza ambele formate. Empty string normalizat la null.
            next.month =
              typeof m === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(m) ? m : null;
          }
          return { targetObiectiv: next };
        }),
      // BUG #5 — seed o singura intrare din greutatea de onboarding cand
      // weightLog e gol. Idempotent (gol → seed; altfel no-op) ca sa NU
      // suprascriem loguri reale. Ignora kg invalid (NU fabricam o intrare gresita).
      seedFromProfileIfEmpty: (kg, date) =>
        set((s) => {
          if (s.weightLog.length > 0) return s;
          if (!Number.isFinite(kg) || kg <= 0 || !date) return s;
          return { weightLog: [{ kg, date, ts: Date.now() }] };
        }),
      reset: () => set({ weightLog: [], bodyData: [], targetObiectiv: EMPTY_TARGET }),
    }),
    {
      name: 'wv2-progres-store',
      storage: createJSONStorage(() => kv),
      // SUB-CHAT5-004 blueprint consistency — explicit partialize doar data
      // fields (NU actions). Match appStore + scheduleStore + workoutStore
      // existing pattern. weightLog + bodyData persisted; actions excluded
      // from serialization pentru defense-in-depth.
      partialize: (state) => ({
        weightLog: state.weightLog,
        bodyData: state.bodyData,
        targetObiectiv: state.targetObiectiv,
      }) as Partial<ProgresState & ProgresActions>,
    }
  )
);
