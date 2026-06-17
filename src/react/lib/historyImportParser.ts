// ══ HISTORY IMPORT PARSER — Piesa 3 nutrition-brain fix (bootstrap) ════════
//
// Parser PUR pentru un export CSV de istoric (greutate + nutritie) in stilul
// MyFitnessPal. Scop: user cu ani de istoric (kg + kcal) importa o data → sute
// de observatii deodata → Kalman/Bayesian (Piesa 2) converge in zile, nu luni.
//
// NUME GENERIC peste tot — userul vede "Importa istoric", NU "MFP". Logica de
// FORMAT e mostenita din legacy vanilla (99-archive/.../src/pages/weight.js
// importMFPNutritionCSV + importMFPMeasurementCSV): coloana date fuzzy-match,
// MM/DD/YYYY sau YYYY-MM-DD, kcal/calori + protein coloane, weight/value coloana.
//
// Doua forme de CSV suportate (auto-detect pe header):
//   1. Nutritie: Date, Calories, Protein (+ alte coloane ignorate). Per zi →
//      dailyEntries (kcal + protein).
//   2. Masuratori/greutate: Date, Weight (sau Value [+ Units]). Per zi →
//      weightEntries (kg). Detectie kg/lb: coloana Units explicita ("lb"/"lbs"
//      /"pound") SAU heuristica de plauzibilitate (un kg uman ~30-300; un lb
//      ~66-660 — daca mediana > 300 tratam ca lb si convertim).
//
// Pure-function discipline (Bugatti + spec §41): ZERO Date.now / Math.random /
// store read / mutation / DOM. Primeste textul, returneaza entries + randuri
// sarite (cu motiv). Plumbing (FileReader + store write) sta la I/O boundary in
// UI + mergeHistoryImport (historyImportStore.ts).

const LB_TO_KG = 0.45359237;

/** O intrare de greutate parsata (kg, normalizat) — shape pre-store. */
export interface ParsedWeightEntry {
  date: string; // YYYY-MM-DD
  kg: number;
}

/** O intrare de nutritie parsata (kcal + protein optional) — shape pre-store. */
export interface ParsedDailyEntry {
  dateISO: string; // YYYY-MM-DD
  kcal: number | null;
  protein: number | null;
}

/** Un rand sarit + motiv (transparenta import — userul vede cate randuri sarite). */
export interface SkippedRow {
  line: number; // 1-based index in fisier (header = 1)
  // SEMANTIC i18n key (NU copy localizat) — parser-ul e pur si nu poate emite
  // copy localizat fara sa scurga RO in sursa. Render boundary-ul (daca
  // afiseaza motivele) rezolva cheia via t('settings.import.skip.*'). Azi UI-ul
  // arata doar `skipped.length`, deci cheia nu e inca randata.
  reason: SkipReasonKey;
}

/** Cheile motivelor de sarire — rezolvate via t('settings.import.skip.<key>'). */
export type SkipReasonKey =
  | 'missingDateColumn'
  | 'noDataColumn'
  | 'invalidDate'
  | 'noNutrition'
  | 'invalidWeight'
  | 'weightOutOfRange';

export interface ParseResult {
  weightEntries: ParsedWeightEntry[];
  dailyEntries: ParsedDailyEntry[];
  skipped: SkippedRow[];
  /** 'nutrition' | 'weight' | 'unknown' — tipul detectat din header. */
  detected: 'nutrition' | 'weight' | 'unknown';
}

/** Split un rand CSV pe virgule, respectand campurile intre ghilimele. */
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      // ghilimea dublata "" = ghilimea literala in interiorul unui camp citat
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/** Normalizeaza un raw date (MM/DD/YYYY sau YYYY-MM-DD[...]) → YYYY-MM-DD sau null. */
function normalizeDate(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  let dateStr = '';
  if (v.includes('/')) {
    // MFP US format MM/DD/YYYY
    const parts = v.split('/');
    if (parts.length !== 3) return null;
    const [m, d, y] = parts;
    if (m == null || d == null || y == null) return null;
    dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else {
    // ISO YYYY-MM-DD (cu posibil timestamp dupa) → slice primii 10
    dateStr = v.slice(0, 10);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  // Valideaza si VALOAREA, nu doar forma: o data imposibila (luna 13/45,
  // 2026-99-99, Feb 30) trece de regex dar e o data inexistenta. Persistata,
  // fiind lexicografic mai mare ca orice 2026-06-xx real, ar deturna
  // getCurrentWeightKg (max pe string-ul de data) → BMR/TDEE/proteina gresite.
  // Round-trip in UTC: daca componenta normalizata nu se intoarce identic →
  // data nu exista → null → randul cade pe calea 'invalidDate' (vazut in preview).
  // Pozitii fixe garantate de regex (YYYY-MM-DD) → slice direct (number plin,
  // nu number|undefined ca la split() sub noUncheckedIndexedAccess).
  const y = Number(dateStr.slice(0, 4));
  const m = Number(dateStr.slice(5, 7));
  const d = Number(dateStr.slice(8, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return dateStr;
}

/** Parseaza un numar tolerant la spatii / ghilimele / separator mii. Returns NaN invalid. */
function parseNum(raw: string | undefined): number {
  if (raw == null) return NaN;
  const cleaned = raw.replace(/[",\s]/g, '');
  if (cleaned === '') return NaN;
  return Number(cleaned);
}

/**
 * Parser PUR — primeste continutul CSV brut, returneaza entries normalizate +
 * randuri sarite. Auto-detecteaza forma (nutritie vs greutate) din header.
 * NU citeste store, NU scrie nimic, deterministic (acelasi input → acelasi output).
 */
export function parseHistoryImportCSV(text: string): ParseResult {
  const empty: ParseResult = {
    weightEntries: [],
    dailyEntries: [],
    skipped: [],
    detected: 'unknown',
  };
  if (typeof text !== 'string') return empty;

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return empty;

  const headerLine = lines[0];
  if (headerLine == null) return empty;
  const headers = splitCSVLine(headerLine).map((h) => h.replace(/"/g, '').toLowerCase());

  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const kcalIdx = headers.findIndex((h) => h.includes('calori') || h.includes('kcal'));
  const protIdx = headers.findIndex((h) => h.includes('protein'));
  const weightIdx = headers.findIndex((h) => h.includes('weight') || h === 'value');
  const unitsIdx = headers.findIndex((h) => h.includes('unit'));

  if (dateIdx === -1) {
    return { ...empty, skipped: [{ line: 1, reason: 'missingDateColumn' }] };
  }

  // Detectie forma: nutritie daca exista coloana de calorii; altfel greutate
  // daca exista coloana weight/value. (MFP exporta cele 2 separat.)
  const detected: ParseResult['detected'] =
    kcalIdx !== -1 ? 'nutrition' : weightIdx !== -1 ? 'weight' : 'unknown';

  if (detected === 'unknown') {
    return { ...empty, skipped: [{ line: 1, reason: 'noDataColumn' }] };
  }

  const weightEntries: ParsedWeightEntry[] = [];
  const dailyEntries: ParsedDailyEntry[] = [];
  const skipped: SkippedRow[] = [];

  // C22-IMPORT-MFP — MyFitnessPal exporta UN RAND PER MASA (Breakfast/Lunch/
  // Dinner/Snacks) cu aceeasi Date. Inainte: un entry per rand → merge last-wins
  // pastra DOAR ultima masa → ~1/3 din aportul zilnic real → strica istoricul +
  // bootstrap-ul Bayesian TDEE. Acum: agregam pe data normalizata in parser,
  // SUMAND kcal + protein peste toate randurile aceleiasi zile. null → 0 doar
  // cand cel putin un rand al zilei are valoare (altfel ramane null = lipsa).
  const nutritionByDate = new Map<
    string,
    { kcal: number | null; protein: number | null }
  >();

  // Pentru detectia kg/lb pe forma weight: colectam intai valorile + units,
  // apoi decidem conversia o singura data (mediana plauzibilitate).
  interface RawWeight {
    line: number;
    date: string;
    val: number;
    unit: string;
  }
  const rawWeights: RawWeight[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const lineNo = i + 1; // 1-based, header = 1
    const raw = lines[i];
    if (raw == null) continue;
    const parts = splitCSVLine(raw).map((p) => p.replace(/"/g, ''));

    const date = normalizeDate(parts[dateIdx] ?? '');
    if (date == null) {
      skipped.push({ line: lineNo, reason: 'invalidDate' });
      continue;
    }

    if (detected === 'nutrition') {
      const kcalNum = kcalIdx !== -1 ? parseNum(parts[kcalIdx]) : NaN;
      const protNum = protIdx !== -1 ? parseNum(parts[protIdx]) : NaN;
      const kcal = Number.isFinite(kcalNum) && kcalNum > 0 ? Math.round(kcalNum) : null;
      const protein = Number.isFinite(protNum) && protNum >= 0 ? Math.round(protNum) : null;
      if (kcal == null && protein == null) {
        skipped.push({ line: lineNo, reason: 'noNutrition' });
        continue;
      }
      // C22-IMPORT-MFP — agregare per zi: SUMAM peste randurile (mese) aceleiasi
      // date. null + valoare = valoare (null tratat ca 0 DOAR cand exista macar
      // o valoare reala pentru acea zi); null + null ramane null (lipsa).
      const prev = nutritionByDate.get(date);
      nutritionByDate.set(date, {
        kcal: kcal == null ? (prev?.kcal ?? null) : (prev?.kcal ?? 0) + kcal,
        protein:
          protein == null ? (prev?.protein ?? null) : (prev?.protein ?? 0) + protein,
      });
    } else {
      // weight form
      const val = weightIdx !== -1 ? parseNum(parts[weightIdx]) : NaN;
      if (!Number.isFinite(val) || val <= 0) {
        skipped.push({ line: lineNo, reason: 'invalidWeight' });
        continue;
      }
      const unit = unitsIdx !== -1 ? (parts[unitsIdx] ?? '').toLowerCase() : '';
      rawWeights.push({ line: lineNo, date, val, unit });
    }
  }

  // C22-IMPORT-MFP — flush agregatul per zi in dailyEntries (o intrare per data,
  // kcal + protein insumate peste mesele zilei). Ordinea de insertie = ordinea
  // primei aparitii a fiecarei zile in fisier (Map pastreaza insertion order).
  for (const [dateISO, agg] of nutritionByDate) {
    dailyEntries.push({ dateISO, kcal: agg.kcal, protein: agg.protein });
  }

  if (detected === 'weight' && rawWeights.length > 0) {
    // Decizie kg vs lb (o singura data pe tot fisierul):
    //  - daca exista coloana Units explicita cu lb/lbs/pound → lb
    //  - altfel heuristica: mediana valorilor; un kg uman plauzibil ~30-300.
    //    Daca mediana > 300 e clar lb (un om de 300kg e implauzibil ca masa MFP).
    const unitSaysLb = rawWeights.some(
      (w) => w.unit.includes('lb') || w.unit.includes('pound'),
    );
    const vals = rawWeights.map((w) => w.val).sort((a, b) => a - b);
    const mid = vals[Math.floor(vals.length / 2)] ?? 0;
    const isLb = unitSaysLb || mid > 300;

    for (const w of rawWeights) {
      const kg = isLb ? w.val * LB_TO_KG : w.val;
      // Plauzibilitate post-conversie (mirror legacy v>30 && v<300).
      if (kg <= 30 || kg >= 300) {
        skipped.push({ line: w.line, reason: 'weightOutOfRange' });
        continue;
      }
      weightEntries.push({ date: w.date, kg: Math.round(kg * 10) / 10 });
    }
  }

  return { weightEntries, dailyEntries, skipped, detected };
}

/**
 * Parseaza mai multe fisiere CSV (de ex. nutritie + masuratori MFP separate) si
 * fuzioneaza rezultatele intr-un singur ParseResult. Pur (delega la parser).
 * Dedup pe date (ultima cantarire / ultima zi nutritie castiga — input mai nou).
 */
export function parseHistoryImportFiles(texts: ReadonlyArray<string>): ParseResult {
  const weightByDate = new Map<string, ParsedWeightEntry>();
  const dailyByDate = new Map<string, ParsedDailyEntry>();
  const skipped: SkippedRow[] = [];
  let detectedAny: ParseResult['detected'] = 'unknown';

  for (const text of texts) {
    const r = parseHistoryImportCSV(text);
    if (r.detected !== 'unknown') {
      detectedAny = detectedAny === 'unknown' ? r.detected : detectedAny;
    }
    for (const w of r.weightEntries) weightByDate.set(w.date, w);
    for (const d of r.dailyEntries) {
      const prev = dailyByDate.get(d.dateISO);
      // C22-IMPORT-MFP — cross-file ADITIV pe aceeasi data: MFP poate exporta
      // mesele aceleiasi zile in fisiere separate, deci insumam kcal + protein
      // intre fisiere (NU last-wins, care ar pastra doar ultimul fisier). null +
      // valoare = valoare; null + null = null (un fisier doar kcal, altul doar
      // protein se combina corect prin sumare term-cu-term).
      dailyByDate.set(d.dateISO, {
        dateISO: d.dateISO,
        kcal: d.kcal == null ? (prev?.kcal ?? null) : (prev?.kcal ?? 0) + d.kcal,
        protein:
          d.protein == null ? (prev?.protein ?? null) : (prev?.protein ?? 0) + d.protein,
      });
    }
    for (const s of r.skipped) skipped.push(s);
  }

  return {
    weightEntries: [...weightByDate.values()],
    dailyEntries: [...dailyByDate.values()],
    skipped,
    detected: detectedAny,
  };
}
