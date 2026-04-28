# Log Schema Audit — FAZA 1.3

**Data:** 2026-04-24  
**Scope:** Audit-only — zero modificări cod sau date  
**Metodă:** Grep exhaustiv src/ + analiză manuală write sites / read sites / fallback patterns

---

## Schema actuală (DE FACTO)

Fiecare log entry = un singur set executat, stocat în `localStorage['logs']` ca array JSON descendent (cel mai recent primul), capped la 500 entries per save.

### Tabel complet fields

| Field | Tip scris | Required? | Scris în | Citit în | Consistent? |
|---|---|---|---|---|---|
| `date` | string `YYYY-MM-DD` | DA | inject, onboarding, logging, session | adherence, dashboard, weight, renderIdle, pr | ✅ DA |
| `ex` | string (exercise name) | DA | inject, onboarding, logging, session | dp, fatigue, aa, adherence, muscleMap, patternLearning, renderIdle, session, pr, weight, dashboard | ✅ DA — dar vezi fallback |
| `w` | number (kg) | DA (0 pentru earlyStop) | inject, onboarding, logging, session | dp, muscleMap, patternLearning, renderIdle, session, pr, weight, dashboard | ✅ DA — dar vezi fallback |
| `reps` | **string** (ex: `"8"`) | DA (`"0"` pentru earlyStop) | inject, onboarding, logging, session | dp, session, pr, stagnationDetector, responseProfile, weight | ⚠️ Tip string, citit cu parseInt |
| `rpe` | number (7–10) | Opțional | inject, onboarding, logging | fatigue, aa, dashboard, renderIdle | ⚠️ Nu e în toate write sites uniform |
| `ts` | number (ms epoch) | DA | inject, onboarding, logging, session | dp, fatigue, aa, muscleMap, cleanDuplicateLogs, pr, renderIdle | ✅ DA |
| `session` | number (ms epoch, session start) | DA | inject, onboarding, logging, session | fatigue, aa, session, renderIdle, weight, dashboard, logFilter, responseProfile | ✅ DA |
| `baseline` | boolean | DA | inject, onboarding | fatigue, aa, adherence, muscleMap, dashboard, renderIdle, pr | ✅ DA |
| `sets` | number (întotdeauna `1`) | DA | inject, onboarding, logging | weight (CSV export) | ⚠️ Redundant — e mereu 1, niciodată filtrat |
| `notes` | array of strings | Opțional | logging (la set save), rating (post-session) | fatigue, aa, renderIdle | ⚠️ Absent din inject/onboarding; citit cu `l.notes \|\| []` |
| `earlyStop` | object `{reason, setsCompleted, totalSets}` | Opțional | session (early stop marker) | weight, logFilter, renderIdle, pr | ⚠️ Numai pe marker-ul `__early_stop__` |
| `userOverride` | boolean | Opțional | inject.js (real sessions only) | **Niciunde** | ❌ Dead field |

### Special: `__early_stop__` marker

Un log entry cu `ex: '__early_stop__'`, `w: 0`, `reps: '0'`, `baseline: false` — creat în `session.js:229` la stop anticipat. Conține `earlyStop: {reason, setsCompleted, totalSets}`.

---

## Fallback patterns găsite (fields NESCRISE, doar citite)

Aceste fallback-uri sugerează o schemă anterioară unde field names erau diferite.

| Field fallback | Citit în | Niciodată scris? | Risc |
|---|---|---|---|
| `l.weight` | responseProfile:35, stagnationDetector:25/88, weaknessDetector:78, tierStorage:65, coachDirector:138/161, reality:65 | ✅ Niciodată scris în write sites | LOW — fallback mort pentru loguri actuale |
| `l.exercise` | dp:419, reality:64, stagnationDetector:40/88, weaknessDetector:35, tierStorage:66/101, coachDirector:245/254, weight:970 | ✅ Niciodată scris în write sites | LOW — fallback mort pentru loguri actuale |
| `l.timestamp` | calibration:126 (`l.date \|\| l.timestamp \|\| l.ts`) | ✅ Niciodată scris | LOW — fallback mort |

**Concluzie:** Aceste fallback-uri provin dintr-o schemă anterioară. Toate logurile actuale din producție folosesc `l.w`, `l.ex`, `l.ts`. Fallback-urile pot fi eliminate în siguranță dintr-o refactorizare separată.

---

## Schema propusă (TARGET)

```typescript
interface WorkoutLog {
  // ── REQUIRED ──────────────────────────────────
  date:     string;    // "YYYY-MM-DD" — data locală a setului
  ex:       string;    // nume exercițiu (cleanEx form, ex: "Bench Press")
  w:        number;    // greutate kg (0 pentru earlyStop marker)
  reps:     string;    // număr repetări ca string (parseInt la citire)
  ts:       number;    // timestamp ms (Date.now() la save)
  session:  number;    // timestamp sesiune start (ms)
  baseline: boolean;   // true = date injectate (nu reale)
  sets:     1;         // mereu 1 — candidat pentru eliminare

  // ── OPTIONAL ──────────────────────────────────
  rpe?:       number;                    // 1–10, perceived exertion
  notes?:     string[];                  // ['sleep','fatigue','form','strong',...]
  earlyStop?: {                          // numai pe marker __early_stop__
    reason: string;
    setsCompleted: number;
    totalSets: number;
  };
}
```

**Eliminat față de schema de facto:**
- `userOverride` — dead field, poate fi șters
- `sets` — candidat de eliminare (mereu 1, redundant)

**Clarificat față de schema de facto:**
- `rpe` — să fie prezent întotdeauna (default: 8 dacă nu altfel specificat), nu opțional
- `notes` — default `[]` la creare, nu absent

---

## Mismatches găsite

### M1 — `l.weight` / `l.exercise` fallbacks moarte
**Severitate:** LOW  
**Fișiere afectate:** 7+ fișiere (responseProfile, stagnationDetector, weaknessDetector, tierStorage, coachDirector, reality, dp, weight)  
**Descriere:** Aceste fallback-uri `l.w ?? l.weight`, `l.ex ?? l.exercise` sunt mort code pentru loguri actuale. Risc real: dacă cineva adaugă un write site care setează `l.weight` (confuzie cu `l.w`), un subset de cititori ar folosi valoarea nouă iar alții nu.  
**Fix:** Elimina fallback-urile în migrare sau într-un refactor dedicat.

### M2 — `__early_stop__` marker nefilrat în `adherence.js`
**Severitate:** MEDIUM  
**Fișier afectat:** `src/engine/adherence.js:34`  
**Descriere:** `logs.filter(l => l.date === today && !l.baseline)` — un marker `__early_stop__` are `baseline: false` și are `date`, deci TRECE filtrul și apare ca un set legitim al zilei. Rezultat: `getAdherenceScore()` numără și marker-ul ca workout set.  
**Fix simplu:** `l.ex !== '__early_stop__'` adăugat la filter.

### M3 — `l.rpe` hardcodat la 8 în `logging.js`, niciodată actualizat per-set
**Severitate:** LOW  
**Fișier afectat:** `src/pages/coach/logging.js:99`  
**Descriere:** Fiecare set este salvat cu `rpe: 8` indiferent de ce selectează userul. `rating.js` adaugă notes post-session dar nu actualizează rpe per-set. Fatigue și AA calculează averages din aceste rpe-uri — toate vor fi 8.  
**Fix:** Fie colectează rpe real per set, fie elimina rpe din setul individual și folosește doar rpe de session.

### M4 — `l.reps` tip string, comparații inconsistente
**Severitate:** LOW  
**Descriere:** Scris mereu ca `String(reps)` sau string literal. Citit cu `parseInt(l.reps)` în calcule. Dacă cineva face comparație directă `l.reps === 8` (number), va fi always false. Nu există fallback pentru tipul wrong.

### M5 — `state.sessLog` (in-memory) folosește `kg` în loc de `w`
**Severitate:** LOW (izolat)  
**Fișier:** `logging.js:101` — `sessLog.push({ ex, kg: logKg, rpe: 8, set, reps })`  
**Descriere:** `state.sessLog` este structura în-memorie din timpul sesiunii, folosită pentru display live. Ea folosește `kg` în loc de `w`. Nu se persistă direct — `logging.js:99` creează un obiect separat cu `w: logKg` pentru persistare. Risc: cod care confundă `sessLog` entries cu persisted logs.

### M6 — `l.userOverride` dead field
**Severitate:** LOW  
**Fișier:** `inject.js`  
**Descriere:** Field scris pe logurile reale din inject.js, niciodată citit. Nu afectează comportament.

### M7 — `l.timestamp` fallback în `calibration.js`
**Severitate:** LOW  
**Fișier:** `src/engine/calibration.js:126`  
**Descriere:** `l.date || l.timestamp || l.ts` — `l.timestamp` niciodată scris. Fallback mort, inofensiv dar confuz.

---

## Migration plan

### Câte loguri există

Verificare în consolă: `JSON.parse(localStorage.getItem('logs')||'[]').length`  
Din codul de injectare: baseline = 33 entries, real sessions = 9 seturi × 2 zile = 18 entries → **~51 loguri în storage de dev**. Producție: necunoscut, dar capped la 500.

### Ce fields trebuie adăugate la loguri vechi?

**Nimic obligatoriu** — schema de facto este deja stabilă. Toți cititorii au fallback pentru fields absente.  
Opțional (quality-of-life):
- Adaugă `notes: []` la loguri fără notes (simplifică cititorii care fac `l.notes || []`)
- Adaugă `rpe: 8` la loguri fără rpe (injectate/onboarding care nu au rpe uniform)

### Ce fields trebuie redenumite?

**Zero renaming** — `l.w`, `l.ex`, `l.ts` sunt deja canonical în write sites.  
Fallback-urile `l.weight`, `l.exercise`, `l.timestamp` se elimină din READ sites, nu din datele stocate.

### Safety: backup înainte de orice migration

```javascript
// Rulat în consolă sau în migration script, ÎNAINTE de orice modificare
const backup = localStorage.getItem('logs');
if (backup) {
  localStorage.setItem('logs-backup-pre-migration-1_3', backup);
  console.log('Backup saved:', JSON.parse(backup).length, 'logs');
}
```

### Dry-run mode (simulare migration)

```javascript
// Dry-run: raportează ce s-ar schimba, nu scrie nimic
function dryRunMigration() {
  const logs = JSON.parse(localStorage.getItem('logs') || '[]');
  let addedNotes = 0, addedRpe = 0, removedUserOverride = 0;
  logs.forEach(l => {
    if (!Array.isArray(l.notes)) addedNotes++;
    if (l.rpe == null) addedRpe++;
    if ('userOverride' in l) removedUserOverride++;
  });
  return { total: logs.length, addedNotes, addedRpe, removedUserOverride };
}
```

### Rollback plan

1. Backup în `logs-backup-pre-migration-1_3` — restore trivial:  
   `localStorage.setItem('logs', localStorage.getItem('logs-backup-pre-migration-1_3'))`
2. Toate schimbările propuse sunt additive sau eliminare dead fields — reversibile
3. NU există rename de field → zero risc de incompatibilitate cu cod nemodificat

### Pași recomandați pentru migration (FAZA 1.3 execuție)

1. **Backup automat** înainte de orice schimbare
2. **Fix M2 (adherence.js)** — 1 line change, zero migration data
3. **Fix M1 (fallback cleanup)** — elimina `?? l.weight`, `|| l.exercise` din 7 fișiere; zero data migration
4. **Opțional: normalize `notes: []` și `rpe: 8`** pe loguri vechi care le lipsesc

---

## Risk assessment

| Aspect | Nivel | Justificare |
|---|---|---|
| Loss risk | **LOW** | Schema actuală este stabilă; nu există rename; backup trivial |
| Reversibilitate | **trivial** | Backup în localStorage; rollback = 1 command |
| Bug activ (M2 adherence) | **MEDIUM** | Contorizează earlyStop ca workout set — afectează streak/adherence score |
| Bug activ (M3 rpe=8) | **LOW** | Datele există, dar sunt incorecte pentru fatigue calc |
| Dead code risk | **LOW** | Fallback-urile moarte nu cauzează bugs, doar confuzie |

### Recomandare: **PROCEED**

- Execuție separată: M2 (adherence filter) = trivial, merge independent
- Fallback cleanup (M1) = refactor, merge separat
- Data normalization (notes/rpe) = opțional, low priority
- Nicio schemă versioning necesară — schema e flat, stabil, backward compatible

---

*Generat de: Claude Sonnet 4.6 | Audit-only, zero cod modificat*
