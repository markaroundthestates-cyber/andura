# ADR 015: getBF — Calibration-Only Formula (Option B)

**Status:** Accepted
**Date:** 2026-04-27
**See also:** [[DECISION_LOG]] | GETBF_DEAD_CODE_FINDING_2026-04-27 (closed)

---

## Context

Funcția `SYS.getBF()` în `src/engine/sys.js` conținea două abordări de calcul body fat coexistente:

- **Formula A (Deurenberg-like):** `bf = (1.20 × bmi) + (0.23 × AGE) - 16.2`, cu muscular correction `-1.5%` triggered de `avg DB Shoulder Press / kg > 0.18`
- **Formula B (Calibration from start):** `calculatedBF = (currentFatKg / kg) × 100`, derivată din `START_BF` și `kgLost` cu assumption 75% fat / 25% muscle în deficit

Variabila `bf` (Formula A) era modificată cu correction muscular dar **niciodată folosită în return** — `return Math.round(Math.max(5, Math.min(45, calculatedBF)) * 10) / 10` returna **doar Formula B**. Formula A era dead code.

---

## Decision

**Eliminate Formula A complet. Păstrează doar Formula B (calibration from start).**

Formula finală:

```js
getBF() {
  const override = DB.get('bf-override');
  if (override !== null && override !== undefined) return parseFloat(override);

  const kg = this.getCurrentKg();
  const kgLost = this.START_KG - kg;
  const fatLost = kgLost * 0.75;
  const startFatKg = this.START_KG * (this.START_BF / 100);
  const currentFatKg = Math.max(3, startFatKg - fatLost);
  const calculatedBF = (currentFatKg / kg) * 100;
  return Math.round(Math.max(5, Math.min(45, calculatedBF)) * 10) / 10;
}
```

---

## Rationale

**Behavior change zero:** Formula B era deja sursa actuală a return value. Refactor pur, validated empiric (BF=17.1 identic înainte/după pentru kg=100, START_KG=111.4, START_BF=23).

**Formula A overestima sistemic** la athletic males cu BMI mare-din-mușchi. Pentru Daniel: A = 28.76% vs B = 22.53% (diferență 6.2%, prea mare pentru fudge factor de -1.5%).

**Muscular correction (-1.5%) marginal-spre-zero:**
- Magnitude greșită vs literatură (Brzęk, Jackson-Pollock sugerează 5-8% pentru trained males)
- Trigger fragil 100% pe DB Shoulder Press (false negative pe powerlifters squat/deadlift heavy)
- Sample 5 logs noise-sensitive
- Threshold 0.18 ratio neaparat normalizat pentru bodyweight class

**Cognitive load lower:** un singur path BF, NU două competing approaches care induc confusion la audits viitoare.

---

## Anti-Recommendation (CRITICAL)

**NU implementa Option C (hybrid) cu fudge factors arbitrari.**

Hybrid implementations (weighted average Formula A + B, sau B-as-base + muscular correction) introduc behavior change fără validare empirică pe Daniel. Sample size insuficient (5 CDL entries la momentul deciziei).

**Trigger pentru reconsideration:**
- 30+ CDL entries cu lifting history diversă
- DEXA scan validation pentru calibrare empirică pe Daniel
- User segment muscular-heavy non-Daniel (powerlifter/strongman)

Până atunci: Formula B unchanged. Dacă apare nevoie reală pentru muscular correction, redesign-ul pornește dintr-o bază clară (Formula B), NU dintr-un hybrid cu dead code.

---

## Consequences

**Positive:**
- Dead code eliminated (variabile bmi, bf, logs, spLogs, avgW removed)
- Invariance test guard împotriva re-introducerii lifting-history dependency (sys.test.js Test 3 replaced)
- Audits viitoare nu mai trebuie să trieze 2 formule competing

**Negative (acceptable):**
- Pierdem optionalitatea muscular correction pentru users foarte muscular (acceptat pentru Daniel single-user; revisitable per trigger above)
- Dependență totală pe `START_BF` accuracy (Daniel = 23%, validated; future users = onboarding self-report risk)

**Neutral:**
- Cascade impact pe coachContext / kcal targets / phase decisions: **zero** (Formula B era deja sursă)

---

## Implementation

- Commit: e97e468 — refactor(sys): eliminate getBF dead code path — Option B Opus spec
- Tests: 557/557 maintained (T3 replaced 1-for-1 cu invariance test)
- Build green, push to main

---

*ADR 015 — Accepted 2026-04-27 după Opus focused audit (1m 30s). Status: closed pending reconsideration triggers above.*
