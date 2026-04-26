# ADR 013: Auto-Aggression Detection (User Self-Sabotage Pattern Recognition)

**Status:** Accepted
**Date:** 2026-04-26
**See also:** [[011-coach-decision-log-architecture]] | [[012-tier-decay-on-inactivity]] | [[009-calibration-tiers]] | [[DECISION_LOG]] | [[PROJECT_VISION]]

---

## Context

SalaFull engineul de coaching observă pattern-uri de progres în date logate (CDL — Coach Decision Log, ADR 011). Pe lângă pattern-urile pozitive (adherence, deviation, recovery), există o categorie distinctă de pattern-uri auto-destructive pe care un coach uman experimentat le-ar identifica și ar interveni: **auto-aggression** — user-ul se auto-sabotează.

**Pattern tipic observat:**

```
Progres slab (real sau perceput)
    ↓
Frustrare + "trebuie să fac mai mult"
    ↓
Adaugă volum / taie kcal / ignoră recovery
    ↓
Progres mai prost (overtraining, deficit metabolic, fatigue cumulativ)
    ↓
Spirală: răspunsul greșit la semnal greșit
```

**De ce e relevant pentru SalaFull:**

1. **Diferențiator core de produs.** Un coach AI care detectează și intervine pe spirale auto-distructive face ce 95% din apps fitness nu fac. Apps tipice rewardează volum/intensitate orbește; SalaFull pretinde "reasoning contextual real" (vezi PROJECT_VISION).

2. **Risc de doom loop tăcut.** Fără detection, engine-ul învață pe date corupte de auto-aggression: tier-ul progresează pe sesiuni "performante" care sunt de fapt overreaching, response profile învață că user-ul "tolerează volum mare", patterns detectate pe semnale fake. Same problem ca AA broken (RPE=8 fix) documentat în triaj.

3. **Auto-aggression ≠ deviation legitimă.** User adult care decide conștient să push într-o săptămână nu e auto-aggression. Pattern-ul e ce diferă: spirala "mai mult e mai bine" în răspuns la frustrare/progres slab, nu push planificat.

**Problema:** fără un model formal de detection + intervention, SalaFull nu poate distinge între:
- Self-regulation sănătoasă (user adultă conștient ajustează)
- Auto-aggression (spirala distructivă)
- Noise (deviation izolată fără pattern)

---

## Decision

Implementăm un **sistem de auto-aggression detection** ca pattern recognition la nivel de coachContext + intervention layer la nivel UI, cu trei componente:

### 1. Detection signals (5 signals comportamentale + 1 amplificator)

**Signals primare (toate computate din CDL + logs existing):**

1. **Volume creep neprovocat** — `outcome.deviated == true` cu `actualVolume > proposedVolume` pentru 3+ sesiuni consecutive
2. **Calorie restriction acceleration** — `kcal_target` scade cu >300 kcal pe rolling window 7-day (starting threshold, reconsider after 50+ users)
3. **Frustration markers** — `rating <= 2` (proxy temporar până AA fix DONE) + add volume aceeași sau următoarea sesiune
4. **Ignore recovery signals** — composite fatigue score ≥ 2 markers din 3 într-o săptămână + zero early-stops + continue volume
5. **Recovery debt cronic** — `<2` rest days/săpt pentru 3+ săptămâni consecutive **combinat cu cel puțin 1 alt signal** (singular = noise pentru profile aggressive)

**Amplificator per-profil:**

- **Hyperfocus override** — user logează 8h+ în app/zi pentru 4+ zile/săpt. NU e detection signal în sine. E factor de **calibrare a thresholds**: profile cu hyperfocus pattern → thresholds mai stricte pe celelalte 5 signals.

### 2. Composite fatigue score (definiție pinned)

Fatigue marker = compozit din 3 signals, **2+ din 3 într-o săptămână** = marker activ pentru detection #4:

1. **Reps achieved <60% pe 2+ exerciții consecutive în aceeași sesiune** (single exercise = bias load greșit, nu fatigue real)
2. **Rating sesiune ≤2/5** (proxy temporar; revisit la AA fix DONE → RPE ≥9)
3. **Volume scădere voluntară >20% vs ultima sesiune similară fără reason logged în CDL** (cu reason = self-regulation sănătoasă, NU fatigue marker)

Composite în loc de single-signal evită false positives din artifacte event-level.

### 3. Profile typing (4 profiles + reconciliation hybrid)

Profile-typing psihologic ca calibrare per-user a thresholds + intervention style:

- **Sprinter** — high intensity short bursts, low consistency, frustration → push harder
- **Marathon** — steady consistency, low variance, frustration → maintain
- **Yo-yo** — alternance high commitment / total drop, frustration → drop
- **Strategic** — measured response to data, adjusts based on trends, low impulsivity

**Onboarding hybrid:**

- **Self-report inițial:** 3-4 întrebări core în onboarding (NU 5-7) + 1 întrebare comportamentală post-prima sesiune
- **Behavioral inference:** primele 4-6 săptămâni observate, profile actualizat tăcut bazat pe pattern real
- **Reconciliation la 4-6 săpt:** dacă self-report ≠ behavioral, prompt cu **rationale + data points + 1-click accept/decline + drill-down opțional**

**Wording reconciliation prompt:**

> "Pattern-ul observat te apropie de Sprinter:
> - Volume creep după rating low în 4 din 6 săpt
> - Recovery debt 3 săpt consecutiv
> - Hyperfocus pattern detectat
>
> Update profil? [Da] [Nu] [Detalii]"

NU verdict, NU "citește și decide tu". Recommendation cu evidență + decizie rapidă.

### 4. Severity tiers (3 niveluri cu thresholds clare)

| Tier | Trigger | Action |
|------|---------|--------|
| **LOW** | 1 signal izolat | Log în CDL, NU notify user |
| **MED** | 2-3 signals în 2 săpt | Soft warning banner cu metrica observabilă, dismissible |
| **HIGH** | 3+ signals în 1 săpt + escalation pattern (consecutive MED tier 2+ săpt fără ameliorare) | Intervention C: refuză plan agresiv inițial, override flow cu friction |

**Notă pe HIGH:** până la disponibilitatea health export (FAZA 4 — bloodwork manual input, integrare Apple Health/Google Fit), HIGH tier folosește **only signals comportamentale**. Signal "RHR +15bpm" + alți markeri fizici sunt deferred până la integrare.

### 5. Intervention model (Soft B default + escalation la C, NU A passive)

**B — Soft warning (default pentru MED tier):**

Wording template: **observation → pattern → return decision to user**.

Exemplu:
> "În ultimele 2 săptămâni:
> - 3 sesiuni cu volum adăugat după rating ≤2/5
> - Recovery debt: 1 rest day/săpt (vs 2+ recomandat)
>
> Continui același plan sau ajustăm?"

**Reguli wording (ce NU facem):**
- NU "te auto-sabotezi" (judgmental)
- NU "ai grijă" (vag)
- NU "ești sigur că vrei?" (passive-aggressive)
- DA "metric X arată Y. Pattern observat: Z. Decizia ta?"

**C — Hard intervention (HIGH tier):**

Coach refuză plan agresiv inițial. User poate override **doar prin friction modal**:
- Read warning complet (no scroll-skip)
- Type "continui pe propria răspundere" (sau echivalent)
- Confirm explicit

Asta filtrează decizii impulsive de decizii informate, fără paternalism. User adult, decizia lui finală — dar cu friction proporțional cu severity.

### 6. Dismiss memory (anti alarm fatigue)

Soft warnings au memorie. Dacă user dismiss același warning 3x consecutiv:
- Sistemul **NU repetă același exact warning**
- Escalează formularea (mai concret, mai direct)
- SAU pune-l pe "silent track" cu log în profile pentru calibrare viitoare

Alarm fatigue e killer-ul real al sistemelor de tip ăsta. Dacă banner-ul devine wallpaper, intervention rate → 0.

---

## Alternatives Considered

### A. Passive observe only (log în CDL, no intervention)

Avantaj: zero risk de over-intervention. Engine învață profile fără paternalism.
Dezavantaj: produs non-diferențiat. Apps fitness existente fac deja log + zero intervention. Dacă SalaFull pretinde "coach AI cu reasoning real", absența intervention pe pattern auto-distructiv e gap de produs critic.

**Respins:** comunicare e datorată când vezi pattern.

### B. Hard intervention only (refuse aggressive plans, no soft warnings)

Avantaj: simplu, predictible, no escalation logic.
Dezavantaj: paternalism agresiv. User cu 1-2 signals izolate primește block → resentment, churn. UX hostile.

**Respins:** false positive cost prea mare la severity LOW/MED.

### C. ML-based detection (train classifier pe data agregată)

Avantaj: adaptive, se calibrează automat.
Dezavantaj: zero training data la lansare (cold start problem); requires scale (1000+ users) pentru clasificator nontrivial; black-box hard de debugat și explicat user-ului.

**Respins pentru v1.** Reconsiderare la 1000+ users + behavioral data agregată.

### D. Pure self-report profiling (chestionar 10+ întrebări, no behavioral inference)

Avantaj: simplu de implementat.
Dezavantaj: known broken — toți users zic "Strategic". Self-perception bias = false categorization → false interventions sau missed interventions.

**Respins:** hybrid e singura cale viabilă.

### E. Severity continuum (no discrete tiers)

Avantaj: granular, nuanced.
Dezavantaj: hard de operationalizat în UI + reguli; thresholds devin hand-wavy; debugging nightmare ("de ce a primit user X warning Y la severity 0.62?").

**Respins:** 3 tiers discrete cu thresholds explicite > spectrum continuu pentru v1.

---

## Trade-offs Accepted

### 1. False positives la profile aggressive legitime
User Sprinter cu push planificat poate trigger MED tier ocazional. Soft warning dismissible + dismiss memory limitează damage. Better than missing real auto-aggression.

### 2. Calorie threshold 300 kcal/săpt e starting guess
Fără data empirică pentru calibrare la scop SalaFull. Reconsiderare după 50+ users.

### 3. Profile reconciliation poate friction-ate users
1-click accept/decline reduce friction, dar momentul reconciliation (4-6 săpt) e UX-critical. Risc: user dismiss prompt fără să citească rationale.

### 4. Composite fatigue score depinde de definiții stable
Reps achieved, rating, volume — toate au noise în logging. Composite (2+ din 3) reduce noise dar nu elimină. Acceptable pentru v1.

### 5. HIGH tier behavioral-only inițial
Lipsește signals fizice (RHR, HRV, sleep). Detection mai puțin sensitive la auto-aggression metabolic/fiziologic pură fără pattern comportamental vizibil. Acceptable până health export disponibil.

### 6. Hyperfocus amplificator e calibration heuristic, nu invariant
Detection 8h+/zi în app NU e bad în sine. Mapare la "thresholds mai stricte" e judgment call calibrat empiric, nu rule de la principii prime. Reconsiderare după observation.

---

## Empirical Calibration Parameters

Toate parametrele numerice din ADR sunt **starting guesses** fără data empirică SalaFull-specific. Listă explicită pentru tracking + reconsideration:

| Parameter | Starting value | Source | Reconsider trigger |
|-----------|----------------|--------|---------------------|
| Volume creep streak | 3+ sesiuni consecutive | Heuristic | After 50+ users data |
| Calorie restriction acceleration | >300 kcal/săpt | Heuristic | Trigger #1 |
| Frustration rating threshold | rating ≤2/5 | Proxy until AA fix | Trigger #5 |
| Recovery debt threshold | <2 rest days/săpt for 3+ săpt | Heuristic | Trigger #3 |
| Hyperfocus pattern | 8h+/zi for 4+ zile/săpt | Heuristic | Trigger #7 |
| Reps achieved threshold | <60% pe 2+ exerciții consecutive | Heuristic | Trigger #8 |
| Volume scădere voluntară | >20% vs ultima similară | Heuristic | Trigger #8 |
| Composite fatigue threshold | 2+ markers din 3 într-o săpt | Heuristic | Trigger #8 |
| Profile reconciliation timing | 4-6 săpt fixă | v1 simplicity | Trigger after 1000+ users (adaptive considered) |
| Severity tier counts (LOW/MED/HIGH) | 1 / 2-3 / 3+ signals | Heuristic | Trigger #3 |

**Principle:** orice parameter aici NU e invariant. Toate sunt subject to empirical revision după production data.

---

## Reconsideration Triggers

1. **Calorie threshold 300 kcal/săpt** → reconsider after 50+ users with logged calorie data + behavioral pattern data
2. **Profile reconciliation friction** → if dismiss rate >30% on 4-6 week prompt, redesign UX (currently 1-click + drill-down opțional)
3. **Severity tier thresholds** (LOW/MED/HIGH triggers) → reconsider după 6 months production data; cazuri reale de false positive/negative analizate
4. **Health export integrare** → revisit HIGH tier signals; adaugă RHR/HRV/sleep markers la HIGH tier definition
5. **AA fix DONE (RPE per-set funcțional)** → revisit fatigue marker definition: rating ≤2/5 (proxy current) → RPE ≥9 (target)
6. **ML viability** → revisit alternative C la 1000+ users + 6+ months agregate behavioral data
7. **Hyperfocus calibration** → if observed pattern shows hyperfocus correlates negativ cu auto-aggression (e.g. hyperfocus users sunt actually more sustainable), inversare amplificator
8. **Composite fatigue score effectiveness** → if 2+ markers din 3 produce too many false positives sau prea multe miss-uri, raise/lower threshold sau change individual signal definitions

---

## Implementation Notes

**Scope ADR:** principle + design decisions. **NU spec implementabil.**

Implementation va fi spec-uit separat în EXEC_QUEUE după review ADR. Estimat 4-6 subtasks (Sonnet) + 1 design discussion (Opus) pentru intervention UI/UX. Likely path:

1. **Detection layer** — `src/engine/autoAggressionDetection.js` cu funcții pure pe CDL + logs (no side effects)
2. **Profile typing** — `src/engine/profileTyping.js` + onboarding chestionar UI + reconciliation prompt
3. **Severity computation** — integrare în `coachContext.js` (similar pattern cu CDL patterns)
4. **Intervention layer** — banner CDL-sourced (extension la pattern existing din TASK #30.8) + override modal cu friction
5. **Dismiss memory** — extension la dismissible patterns logic (depinde de cleanup 30.9)
6. **Tests** — coverage similar cu ADR 011/012 (unit pure functions, integration coachContext, e2e UI flows)

**Dependencies critical:**

- **ADR 011 (CDL)** — DONE 9/10 — single source of truth pentru detection signals
- **30.9 cleanup** — DEFERRED — applied-patterns trebuie decommissioned înainte ca dismiss memory să poată folosi infrastructura unified
- **AA fix (RPE per-set)** — PENDING design discussion — proxy rating ≤2/5 acceptabil temporar, dar ideal RPE ≥9 pentru detection #3 + composite fatigue #2

**Ordine recomandată implementare:**

1. AA fix design decision (RPE per-set vs sintetic vs eliminate) — blocks fatigue marker accuracy
2. 30.9 cleanup + storage decommission — blocks dismiss memory infrastructure unified
3. AA detection layer (pure functions) — independent de UI
4. Profile typing onboarding UI
5. Severity + intervention UI
6. Dismiss memory + alarm fatigue prevention

---

## Notes on Production Readiness

ADR ăsta NU e production-ready specification. Items requiring data sau decision înainte de spec EXEC_QUEUE:

- **AA fix** (proxy rating sau RPE) — design discussion separat
- **Empirical calibration** thresholds (300 kcal, 8h hyperfocus, 60% reps) — toate sunt starting guesses, reconsider după observation
- **Onboarding chestionar exact** — 3-4 întrebări core trebuie scrise + tested for discrimination power
- **UI mockups** — banner wording, override modal design, reconciliation prompt — toate require design iteration

Acestea NU intră în ADR (principle), intră în spec implementabil + UX iteration.

---

## Resolved Open Questions (decision log)

Întrebările deschise în draft inițial, rezolvate în review 2026-04-26:

### 1. Profile reconciliation timing — fixed vs adaptive?

**Decision:** Fereastra fixă 4-6 săpt pentru v1.

**Rationale:** Adaptive (trigger când behavioral confidence ≥ threshold) = scope creep pentru v1. Fereastra fixă e operationalizabilă, predictibilă, debug-friendly. Reconsiderare la 1000+ users dacă data arată că fereastra fixă produce reconciliation mismatch.

### 2. Hyperfocus thresholds tracking

**Decision:** Tracked separat în "Empirical Calibration Parameters" section. NU prerequisite ADR.

**Rationale:** Reconsideration Trigger #7 acoperă deja inversare amplificator dacă hyperfocus correlates negativ cu auto-aggression. Tabelul empirical face thresholds-urile vizibile + tracked uniform cu restul parametrelor.

### 3. Override flow wording exact

**Decision:** Wording final NU se pinneză în ADR. Spec EXEC_QUEUE va folosi wording natural, NU legal-defensiv.

**Direcție wording:** "continui în ciuda recomandării" sau "decid să push prin pattern" — variante naturale candidate. Decizie finală în spec UI după iteration design.

**Rationale:** "continui pe propria răspundere" e legal-flavored, hostile. Wording e UX-critical dar e implementation detail, NU principle.

### 4. Soft warning frequency cap

**Decision:** Max 1 warning **unic** per săptămână. Same warning repetat în aceeași săpt = blocked. Diferite warnings = OK chiar în aceeași zi.

**Rationale:** Cap pe warning unic (nu pe total) = anti alarm fatigue real. User cu 3 pattern-uri distincte simultane primește 3 warning-uri legitime, dar same warning de 5 ori/săpt = wallpaper. Compatibil cu dismiss memory (escalează formularea după dismiss repetat) + frequency cap (limit hard pe repeat).

### 5. Profile change history

**Decision:** DA păstrăm. Stocare în CDL extension sau ProfileLog separat (decizie spec, nu ADR).

**Rationale:** Util pentru debugging (de ce a fost user-ul mutat Sprinter → Strategic → Marathon?), reconciliation context (data points la moment update), audit trail. Privacy concern minimal: SalaFull e local-first storage (Firebase user-private, no cloud share), no aggregate exposure.

---

*ADR 013 — Accepted 2026-04-26 după review Daniel. Open questions rezolvate ca log decizie. Status: ready pentru spec EXEC_QUEUE.*
