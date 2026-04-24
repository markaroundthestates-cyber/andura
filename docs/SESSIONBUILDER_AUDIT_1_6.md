# SessionBuilder Audit — FAZA 1.6

**Data:** 2026-04-24  
**Scope:** Audit-only — zero modificări cod  
**Referință:** Audit finding C9g — sessionBuilder = null stub

---

## Current State

### sessionBuilder.js (complet)

```js
// ══ SESSION BUILDER — stub Week 1 ════════════════════════════
// TODO Week 2: implementare completă cu Prediction Engine
// CoachDirector verifică sessionBuilder.build — null declanșează fallback intern

export const sessionBuilder = null;
// buildSession nu e exportat — CoachDirector folosește fallbackSessionBuilder
```

**7 linii. 1 util (export). Restul comentarii.**

### Cum e folosit în coachDirector.js:95-107

```js
let session;
try {
  const sessionBuilderModule = await import('./sessionBuilder.js');
  if (sessionBuilderModule.sessionBuilder && sessionBuilderModule.sessionBuilder.build) {
    session = sessionBuilderModule.sessionBuilder.build(sessionType, ctx);       // path A: MORT (null)
  } else if (sessionBuilderModule.buildSession) {
    session = sessionBuilderModule.buildSession(sessionType, ctx);               // path B: MORT (nu există)
  } else {
    session = this.fallbackSessionBuilder(sessionType, ctx);                     // path C: MEREU ACTIV
  }
} catch (e) {
  session = this.fallbackSessionBuilder(sessionType, ctx);                       // path D: fallback pe eroare
}
```

**Concluzie:** La runtime, path C este MEREU executat. Path A și B sunt cod mort. Dynamic import-ul este overhead async inutil pentru a ajunge la un `this.fallbackSessionBuilder()` sincron.

### Ce face fallbackSessionBuilder() (coachDirector.js:192-213)

Returnează o listă statică de exerciții per tip sesiune, filtrată după echipament disponibil:
- `PUSH` → Incline DB Press, Pec Deck, DB Shoulder Press, Lateral Raises, Overhead Triceps, Pushdown
- `PULL` → Lat Pulldown, Cable Row, Face Pulls, Bayesian Curl, Incline DB Curl
- `UMERI_BRATE`, `UPPER_PICIOARE`, `FULL_UPPER` — similar

Zero utilizare a contextului (calibration, weakGroups, stagnation, predictionToday, recompile).

### Ce se întâmplă DUPĂ fallbackSessionBuilder (în buildSession):

1. Equipment resolution → exerciții alternative dacă ceva e ocupat ✅
2. DP recommendations per exercițiu → kg/reps recomandate ✅
3. Deload logic → -30% greutate la nevoie ✅
4. AA adjustments → safety net din notes ✅
5. Reality validation → CUT/BULK limits ✅
6. Pattern application → reduce volum dacă early_end pattern ✅
7. Context attachment → calibration, weakGroups, stagnation ✅

**Deci:** selectarea exercițiilor (step 0, fallbackSessionBuilder) este singurul loc neoptimizat. Tot restul pipeline-ului funcționează corect indiferent de sessionBuilder.

---

## Analiza Valorii unui Real sessionBuilder

### Ce ar face un sessionBuilder real (vs fallback):

| Comportament | fallbackSessionBuilder | sessionBuilder real |
|---|---|---|
| Selectare exerciții | Listă statică per tip | Context-aware (weakGroups, stagnation, history) |
| Priorități | Ordine fixă | Muzchi slabi prioritizați |
| Varietate | Zero | Exerciții alternative dacă stagnare la primarul |
| Volum adaptat | Fix (3 seturi per ex) | Adaptat la calibration level + readiness |
| Plan săptămânal | Ignorat | Respectă recompileWeek |
| Testabilitate | Logica în clasă, greu de unit-testat | Funcție pură `(sessionType, ctx) => session` |

### Context deja calculat ÎNAINTE de session building (deci disponibil):
- `ctx.weakGroups` — grupe musculare slabe ✅
- `ctx.stagnationWeeks` — stagnare detectată ✅
- `ctx.predictionToday` — predicție oboseală/risc ✅
- `ctx.recompile` — plan săptămânal recompilat ✅
- `ctx.calibrationLevel` — tier user ✅
- `ctx.allLogs` — full history ✅ (fixat în TASK #15)

Tot acest context este **complet ignorat** de `fallbackSessionBuilder`.

---

## Cele 3 Opțiuni

### OPT A — IMPLEMENT (real sessionBuilder)

**Ce face:**
- Extrage lista statică de exerciții din `fallbackSessionBuilder` în constante în sessionBuilder.js
- Adaugă logică context-aware: dacă `ctx.weakGroups` detectat → prioritizează exerciții pentru acele grupe; dacă `ctx.stagnationWeeks > 3` → introduce exercițiu alternativ; dacă `ctx.predictionToday.isHighRisk` → reduce volum cu 1 exercițiu
- Returnează `{ type, exercises: [...] }` — același format ca fallback
- `coachDirector` simplifică: renunță la dynamic import, importă direct

**Effort estimate:** 3-4h + teste  
**Value:** HIGH pentru useri PERSONALIZING+ — exerciții alese din context real, nu din hardcoded list  
**Risc:** MEDIUM — schimbă ce exerciții apar, poate surprinde userul cu exerciții nefamiliare  

**Când**: FAZA 2 (features) sau final FAZA 1 dacă timp

---

### OPT B — REMOVE (elimină dead code)

**Ce face:**
1. Șterge `src/engine/sessionBuilder.js`
2. În `coachDirector.js`: înlocuiește try/catch cu dynamic import cu simplu `session = this.fallbackSessionBuilder(sessionType, ctx);`
3. Redenumește `fallbackSessionBuilder` → `buildSessionFromType` (nu mai e "fallback" — e singura implementare)

**Effort estimate:** 15-20 min  
**Value:** MEDIUM — simplifică codul cu ~15 linii, elimină async overhead inutil, clarifică că lista statică e intentionată pentru acum  
**Risc:** NONE — comportament identic  
**Dezavantaj:** Nu pregătește ground-ul pentru OPT A; va trebui să re-adaugi sessionBuilder.js când implementezi

---

### OPT C — STUB PROPERLY (refactor fără implementare)

**Ce face:**
1. Înlocuiește `export const sessionBuilder = null` cu `export function buildSession(sessionType, ctx) { ... }` — mută logica din `fallbackSessionBuilder` în sessionBuilder.js
2. `coachDirector` importă static `buildSession` din sessionBuilder.js și o apelează direct (fără dynamic import, fără null check)
3. Clasa `CoachDirector` pierde `fallbackSessionBuilder` — logica e în modulul ei
4. Adaugă teste pentru `buildSession(sessionType, ctx)` — funcție pură, ușor de testat

**Effort estimate:** 45-60 min + teste  
**Value:** MEDIUM-HIGH — separare corectă de responsabilități, testabilitate imediată, ground pregătit pentru OPT A fără re-structurare  
**Risc:** LOW — comportament identic, dar structura e gata pentru OPT A  

---

## Recomandare: **OPT B → (ulterior) OPT C → (FAZA 2) OPT A**

**Acum (FAZA 1.6):** OPT B. Elimină dead code (dynamic import, null check, 3 code paths care nu se execută niciodată). Zero risc, 15 minute, comportament identic.

**Când există timp sau înainte de OPT A:** OPT C. Mută `fallbackSessionBuilder` în sessionBuilder.js ca funcție pură. Adaugă teste. Pregătește structura pentru implementarea reală.

**Justificare în 3 linii:**  
Dynamic import async + null check + 3 code paths pentru a ajunge la un `this.fallbackSessionBuilder()` sincron este overhead pur fără beneficiu. Implementarea reală (OPT A) necesită context de FAZA 2 (full features) și nu se justifică acum. OPT B reduce complexitatea fără niciun risc, iar OPT C poate fi executat ca task independent când e nevoie de testabilitate.

---

*Generat de: Claude Sonnet 4.6 | Audit-only, zero cod modificat*
