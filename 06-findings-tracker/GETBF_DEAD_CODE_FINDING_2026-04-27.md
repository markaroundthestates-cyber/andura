# GETBF DEAD CODE PATH — Discovery 2026-04-27

**Status:** 🟡 DEFERRED (flag, NU fix imediat — necesită Opus audit pentru spec fix)  
**Severity:** MEDIUM (afectează coaching accuracy pe lifting-heavy users, NU crash/data loss)  
**Discovered by:** Sonnet în cadrul TASK #6 sys.js refactor + tests (commit 207f40f)  
**Module:** `src/engine/sys.js` — funcția `getBF()`  
**Test reference:** `src/engine/__tests__/sys.test.js` Test 3 (documentat dead path)  

---

## Descriere

Funcția `getBF()` în sys.js conține un **dead code path** pentru muscular build correction:

```js
getBF() {
  // ... BMI formula calc ...
  let bf = (1.20 * bmi) + (0.23 * this.AGE) - 16.2;
  
  // Muscular build correction — lifting history
  const logs = DB.get('logs') || [];
  const spLogs = logs.filter(l => l.ex === 'DB Shoulder Press' && l.w).slice(0, 5);
  if (spLogs.length > 0) {
    const avgW = spLogs.reduce((a, b) => a + b.w, 0) / spLogs.length;
    if (avgW / kg > 0.18) bf -= 1.5;  // ← MODIFIES bf BUT bf IS NEVER RETURNED
  }
  
  // Calibrate from start
  const kgLost = this.START_KG - kg;
  const fatLost = kgLost * 0.75;
  const startFatKg = this.START_KG * (this.START_BF / 100);
  const currentFatKg = Math.max(3, startFatKg - fatLost);
  const calculatedBF = (currentFatKg / kg) * 100;
  
  return Math.round(Math.max(5, Math.min(45, calculatedBF)) * 10) / 10;
  //                                  ^^^^^^^^^^^^^
  //                                  RETURNS calculatedBF, NOT bf!
}
```

## Impact funcțional

- **Variabila `bf`** (calculată din BMI + Age formula) este modificată cu `-1.5` când avg DB Shoulder Press / kg > 0.18 (indicator muscular build), DAR `bf` NU e folosită în return.
- **Return-ul actual** folosește `calculatedBF` derivat exclusiv din `startKg`, `startBF` și `kgLost` (calibration logic).
- Rezultat: **muscular correction de -1.5% NU se aplică niciodată** la valoarea returnată.

## Implicații pentru coaching

- Users cu lifting heavy (high DB Shoulder Press / bodyweight ratio) **NU primesc** ajustarea de body fat în jos (-1.5%) așa cum era intenția codului.
- BF returnat e bazat doar pe startBF + kgLost assumptions (75% fat / 25% muscle).
- Cascade impact: coachContext folosește BF pentru phase decisions, kcal targets, weight predictions. Dacă BF actual e off cu 1.5% pe lifting users, recomandările sunt suboptimal.

## Severity rationale: MEDIUM

- ❌ NU e crash sau data loss
- ❌ NU e silent corruption (BF returnat e plauzibil, doar nu optim)
- ✅ ESTE inaccuracy în calcul body comp pentru segment definit de useri (lifters)
- ✅ ESTE intent-vs-implementation drift (codul "vrea" să aplice correction, dar nu o face)

## Decizie pendin g — opțiuni:

1. **Fix it** — adaugă `calculatedBF -= 1.5` în loc de `bf -= 1.5`, aplică correction la valoarea returnată
2. **Simplify** — elimina codul dead complet (variabila `bf`, BMI formula, muscular check) → return doar `calculatedBF`
3. **Redesign** — Opus audit decide dacă muscular correction merită păstrată; dacă da, integrare corectă în calibration logic

## Status

- 🟡 DEFERRED până la **Opus audit focused** care produce spec fix concret (memory #23 — audit = exclusiv Opus)
- NU se atinge production code până la spec aprobat
- Test 3 din sys.test.js documentează behavior actual (corect, NU presupune correction)

## Cross-references

- ADR 014 (Onboarding Profile Typing) — body comp accuracy critical pentru profile classification
- TASK #6 commit 207f40f — sys.test.js Test 3 documentation
- Memory #11 — Quality bar bulletproof: NU patch fast, fix right or not at all

---

*Generated: 2026-04-27 post TASK #6 sys.js refactor*
